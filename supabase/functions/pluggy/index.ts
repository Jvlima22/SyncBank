// SyncBank × Pluggy (Open Finance)
// Rotas:  POST /pluggy/connect-token  (usuário logado)  -> { accessToken }
//         POST /pluggy/sync           (usuário logado)  { itemId } -> resumo
//         POST /pluggy/disconnect     (usuário logado)  { itemId }
//         POST /pluggy/webhook        (Pluggy)          eventos de item/transações
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const PLUGGY = "https://api.pluggy.ai";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CLIENT_ID = Deno.env.get("PLUGGY_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("PLUGGY_CLIENT_SECRET");
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ??
  "https://syncbank.vercel.app,http://localhost:8080").split(",");

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

// ---------- Pluggy API ----------
let cachedKey: { key: string; exp: number } | null = null;
async function apiKey() {
  if (!CLIENT_ID || !CLIENT_SECRET) throw new Error("PLUGGY_CLIENT_ID/SECRET não configurados");
  if (cachedKey && cachedKey.exp > Date.now()) return cachedKey.key;
  const r = await fetch(`${PLUGGY}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
  });
  if (!r.ok) throw new Error(`Pluggy auth falhou (${r.status})`);
  const { apiKey } = await r.json();
  cachedKey = { key: apiKey, exp: Date.now() + 90 * 60 * 1000 }; // chave vale 2h
  return apiKey as string;
}
async function pluggy(path: string, init: RequestInit = {}) {
  const r = await fetch(`${PLUGGY}${path}`, {
    ...init,
    headers: { "X-API-KEY": await apiKey(), "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`Pluggy ${path} → ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : r.json();
}

// ---------- Mapeamentos ----------
const CATEGORY_PT: Record<string, string> = {
  Groceries: "Alimentação", "Eating out": "Alimentação", "Food and drinks": "Alimentação", Restaurants: "Alimentação",
  "Food delivery": "Alimentação", Transportation: "Transporte", "Taxi and ride-hailing": "Transporte",
  "Gas stations": "Transporte", Housing: "Moradia", Rent: "Moradia", Utilities: "Moradia", Health: "Saúde",
  Pharmacy: "Saúde", Leisure: "Lazer", Entertainment: "Lazer", "Digital services": "Assinaturas",
  Shopping: "Compras", "Online shopping": "Compras", Clothing: "Compras", Salary: "Salário",
  "Transfer - PIX": "Transferência", "Same person transfer": "Transferência", Transfers: "Transferência",
  Education: "Educação", Travel: "Viagem", Taxes: "Impostos", "Bank fees": "Tarifas", Investments: "Investimentos",
};
const BRANDS = ["visa", "mastercard", "elo", "amex", "hipercard"];
const dayOf = (d?: string | null) => (d ? new Date(d).getUTCDate() : null);
const iso = (d: Date) => d.toISOString().slice(0, 10);

// ---------- Sincronização ----------
async function syncItem(db: SupabaseClient, userId: string, itemId: string) {
  const item = await pluggy(`/items/${itemId}`);

  const { data: conn, error: ce } = await db
    .from("bank_connections")
    .upsert(
      {
        user_id: userId,
        pluggy_item_id: itemId,
        connector_name: item.connector?.name ?? null,
        connector_logo: item.connector?.imageUrl ?? null,
        status: item.status,
        status_detail: item.executionStatus ?? item.error?.message ?? null,
        consent_expires_at: item.consentExpiresAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "pluggy_item_id" },
    )
    .select()
    .single();
  if (ce) throw ce;
  if (conn.user_id !== userId) throw new Error("Conexão pertence a outro usuário");

  const { count: existingTx } = await db
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("connection_id", conn.id);
  const since = conn.last_sync_at && (existingTx ?? 0) > 0
    ? new Date(new Date(conn.last_sync_at).getTime() - 7 * 864e5)
    : new Date(Date.now() - 365 * 864e5);

  const { results: accounts } = await pluggy(`/accounts?itemId=${itemId}`);
  let txCount = 0;

  for (const a of accounts) {
    let localAccountId: string | null = null;
    let label = a.marketingName || a.name;

    if (a.type === "CREDIT") {
      const cd = a.creditData ?? {};
      const brand = String(cd.brand ?? "").toLowerCase();
      const limit = cd.creditLimit ?? 0;
      const used = cd.availableCreditLimit != null ? Math.max(0, limit - cd.availableCreditLimit) : Math.abs(a.balance ?? 0);
      const { error } = await db.from("cards").upsert(
        {
          user_id: userId,
          external_id: a.id,
          connection_id: conn.id,
          source: "pluggy",
          name: `${item.connector?.name ?? ""} ${label}`.trim(),
          brand: BRANDS.includes(brand) ? brand : "other",
          last_four_digits: String(a.number ?? "").replace(/\D/g, "").slice(-4) || null,
          credit_limit: limit,
          current_balance: used,
          due_day: dayOf(cd.balanceDueDate),
          closing_day: dayOf(cd.balanceCloseDate),
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "external_id" },
      );
      if (error) throw error;
    } else {
      const { data: acc, error } = await db
        .from("accounts")
        .upsert(
          {
            user_id: userId,
            external_id: a.id,
            connection_id: conn.id,
            source: "pluggy",
            name: label,
            bank_name: item.connector?.name ?? "Banco",
            account_type: a.subtype === "SAVINGS_ACCOUNT" ? "savings" : "checking",
            balance: a.balance ?? 0,
            currency: a.currencyCode ?? "BRL",
            is_active: true,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "external_id" },
        )
        .select("id")
        .single();
      if (error) throw error;
      localAccountId = acc.id;
      label = item.connector?.name ?? label;
    }

    // Transações (v2, paginação por cursor: `next` já vem como query string pronta)
    let next: string | null = `?accountId=${a.id}&dateFrom=${iso(since)}`;
    let guard = 0;
    while (next && guard++ < 200) {
      const res = await pluggy(`/v2/transactions${next}`);
      next = res.next ?? null;
      const rows = (res.results ?? []).map((t: any) => {
        const isIncome = t.type === "CREDIT";
        const amt = Math.abs(t.amount ?? 0);
        return {
          user_id: userId,
          external_id: t.id,
          connection_id: conn.id,
          source: "pluggy",
          account_id: localAccountId,
          type: isIncome ? "income" : "expense",
          amount: isIncome ? amt : -amt,
          description: t.description ?? t.descriptionRaw ?? null,
          category: (t.category && (CATEGORY_PT[t.category] ?? t.category)) || null,
          date: String(t.date).slice(0, 10),
          account: label,
          method: a.type === "CREDIT" ? "Cartão" : t.paymentData?.paymentMethod ?? "Conta",
          status: t.status === "PENDING" ? "pending" : "completed",
          updated_at: new Date().toISOString(),
        };
      });
      if (rows.length) {
        const { error } = await db.from("transactions").upsert(rows, { onConflict: "external_id" });
        if (error) throw error;
        txCount += rows.length;
      }
    }
  }

  await db.from("bank_connections").update({ last_sync_at: new Date().toISOString() }).eq("id", conn.id);
  await db.from("audit_log").insert({ user_id: userId, action: "sync", detail: { itemId, accounts: accounts.length, transactions: txCount } });
  return { accounts: accounts.length, transactions: txCount, status: item.status };
}

// ---------- Handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  const route = new URL(req.url).pathname.split("/").pop();

  try {
    // Webhook do Pluggy: sem JWT. Só age sobre itens que já existem no nosso banco.
    if (route === "webhook") {
      const ev = await req.json().catch(() => ({}));
      const itemId: string | undefined = ev.itemId ?? ev.item?.id;
      if (!itemId) return json(req, { ok: true });
      const { data: conn } = await admin.from("bank_connections").select("user_id").eq("pluggy_item_id", itemId).maybeSingle();
      if (String(ev.event ?? "").startsWith("item/deleted")) {
        if (conn) await admin.from("bank_connections").update({ status: "DELETED" }).eq("pluggy_item_id", itemId);
        return json(req, { ok: true });
      }
      let userId = conn?.user_id as string | undefined;
      if (!userId) {
        // Conexão nova: confirma direto no Pluggy (não confia no corpo do webhook)
        // que o item foi criado por um usuário real deste SyncBank.
        const item = await pluggy(`/items/${itemId}`).catch(() => null);
        const cu = item?.clientUserId;
        if (!cu) return json(req, { ok: true, ignored: true });
        const { data: u } = await admin.auth.admin.getUserById(cu);
        if (!u?.user) return json(req, { ok: true, ignored: true });
        userId = cu;
      }
      // Itens ainda conectando: registra e espera o próximo evento
      await syncItem(admin, userId!, itemId).catch(async (e) => {
        console.error("sync via webhook falhou", e);
      });
      return json(req, { ok: true });
    }

    // Demais rotas: exige usuário logado
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json(req, { error: "Não autenticado" }, 401);
    const body = await req.json().catch(() => ({}));

    if (route === "connect-token") {
      const options: Record<string, unknown> = {
        clientUserId: user.id,
        webhookUrl: `${SUPABASE_URL}/functions/v1/pluggy/webhook`,
        avoidDuplicates: true,
      };
      const res = await pluggy("/connect_token", {
        method: "POST",
        body: JSON.stringify({ ...(body.itemId ? { itemId: body.itemId } : {}), options }),
      });
      await admin.from("audit_log").insert({ user_id: user.id, action: "connect_token", detail: { update: !!body.itemId } });
      return json(req, { accessToken: res.accessToken });
    }

    if (route === "sync") {
      if (!body.itemId) return json(req, { error: "itemId obrigatório" }, 400);
      const { data: existing } = await admin.from("bank_connections").select("user_id").eq("pluggy_item_id", body.itemId).maybeSingle();
      if (existing && existing.user_id !== user.id) return json(req, { error: "Proibido" }, 403);
      // confere que o item foi criado por este usuário
      const item = await pluggy(`/items/${body.itemId}`);
      if (item.clientUserId && item.clientUserId !== user.id) return json(req, { error: "Proibido" }, 403);
      return json(req, await syncItem(admin, user.id, body.itemId));
    }

    if (route === "disconnect") {
      const { data: conn } = await admin.from("bank_connections").select("id,user_id").eq("pluggy_item_id", body.itemId).maybeSingle();
      if (!conn || conn.user_id !== user.id) return json(req, { error: "Não encontrado" }, 404);
      await pluggy(`/items/${body.itemId}`, { method: "DELETE" }).catch(() => null); // revoga no Pluggy
      await admin.from("bank_connections").update({ status: "DELETED" }).eq("id", conn.id);
      await admin.from("accounts").update({ is_active: false }).eq("connection_id", conn.id);
      await admin.from("cards").update({ is_active: false }).eq("connection_id", conn.id);
      await admin.from("audit_log").insert({ user_id: user.id, action: "disconnect", detail: { itemId: body.itemId } });
      return json(req, { ok: true });
    }

    return json(req, { error: "Rota inválida" }, 404);
  } catch (e) {
    console.error(e);
    return json(req, { error: e instanceof Error ? e.message : "Erro" }, 500);
  }
});
