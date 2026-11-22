import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Landmark, Loader2, Plus, RefreshCw, ShieldCheck, Unplug, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PluggyConnect = lazy(() => import("react-pluggy-connect").then((m) => ({ default: m.PluggyConnect })));

interface Connection {
  id: string;
  pluggy_item_id: string;
  connector_name: string | null;
  connector_logo: string | null;
  status: string;
  status_detail: string | null;
  consent_expires_at: string | null;
  last_sync_at: string | null;
}

async function call<T = any>(route: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(`pluggy/${route}`, { body });
  if (error) {
    let msg = error.message;
    try {
      msg = (await (error as any).context?.json())?.error ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return data as T;
}

const statusInfo = (s: string) =>
  s === "UPDATED"
    ? { label: "Sincronizado", cls: "bg-income/10 text-income" }
    : s === "UPDATING"
      ? { label: "Atualizando…", cls: "bg-accent text-accent-foreground" }
      : s === "LOGIN_ERROR" || s === "WAITING_USER_INPUT" || s === "OUTDATED"
        ? { label: "Reautorizar", cls: "bg-warning/10 text-warning" }
        : s === "DELETED"
          ? { label: "Desconectado", cls: "bg-secondary text-muted-foreground" }
          : { label: "Erro", cls: "bg-expense/10 text-expense" };

export function BankConnections({ onSynced }: { onSynced?: () => void }) {
  const [items, setItems] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [widget, setWidget] = useState<{ token: string; itemId?: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("bank_connections" as any)
      .select("*")
      .neq("status", "DELETED")
      .order("created_at");
    setItems((data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (itemId?: string) => {
    setBusy(itemId ?? "new");
    try {
      const { accessToken } = await call<{ accessToken: string }>("connect-token", itemId ? { itemId } : {});
      setWidget({ token: accessToken, itemId });
    } catch (e: any) {
      toast.error(e.message.includes("não configurados") ? "Credenciais do Pluggy ainda não configuradas no servidor" : e.message);
    } finally {
      setBusy(null);
    }
  };

  const sync = async (itemId: string) => {
    setBusy(itemId);
    try {
      const r = await call<{ accounts: number; transactions: number }>("sync", { itemId });
      toast.success(`${r.accounts} conta(s) e ${r.transactions} transação(ões) sincronizadas`);
      await load();
      onSynced?.();
    } catch (e: any) {
      toast.error(`Falha ao sincronizar: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (c: Connection) => {
    if (!window.confirm(`Desconectar ${c.connector_name}? O acesso será revogado no Pluggy. O histórico já importado continua salvo.`)) return;
    setBusy(c.pluggy_item_id);
    try {
      await call("disconnect", { itemId: c.pluggy_item_id });
      toast.success("Banco desconectado e acesso revogado");
      await load();
      onSynced?.();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">Bancos conectados</h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Open Finance via Pluggy · somente leitura · revogável a qualquer momento
          </p>
        </div>
        <Button variant="glow" className="rounded-full" onClick={() => open()} disabled={busy === "new"}>
          {busy === "new" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Conectar banco
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
            <Landmark className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">Nenhum banco conectado</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Clique em “Conectar banco”, escolha sua instituição e autorize no app do banco. Seus saldos, cartões e transações chegam sozinhos.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((c) => {
              const st = statusInfo(c.status);
              const expires = c.consent_expires_at ? new Date(c.consent_expires_at) : null;
              const expSoon = expires && expires.getTime() - Date.now() < 15 * 864e5;
              const b = busy === c.pluggy_item_id;
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                  {c.connector_logo ? (
                    <img src={c.connector_logo} alt="" className="h-10 w-10 rounded-full bg-white object-contain p-1" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <Landmark className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{c.connector_name ?? "Banco"}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", st.cls)}>{st.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.last_sync_at ? `Última sync ${new Date(c.last_sync_at).toLocaleString("pt-BR")}` : "Aguardando primeira sync"}
                      {expires && (
                        <span className={cn(expSoon && "font-semibold text-warning")}>
                          {" "}
                          · acesso até {expires.toLocaleDateString("pt-BR")}
                          {expSoon && <AlertTriangle className="ml-1 inline h-3 w-3" />}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {st.label === "Reautorizar" || expSoon ? (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => open(c.pluggy_item_id)} disabled={b}>
                        Reautorizar
                      </Button>
                    ) : null}
                    <Button size="icon" variant="ghost" onClick={() => sync(c.pluggy_item_id)} disabled={b} aria-label="Sincronizar">
                      <RefreshCw className={cn("h-4 w-4", b && "animate-spin")} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => disconnect(c)} disabled={b} aria-label="Desconectar">
                      <Unplug className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {widget && (
        <Suspense fallback={null}>
          <PluggyConnect
            connectToken={widget.token}
            updateItem={widget.itemId}
            includeSandbox={import.meta.env.DEV}
            onSuccess={({ item }: any) => {
              setWidget(null);
              toast.success("Banco autorizado! Importando dados…");
              sync(item.id);
            }}
            onError={({ message }: any) => { toast.error(message || "Erro na conexão"); }}
            onClose={() => setWidget(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
