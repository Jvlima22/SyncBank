import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function MfaSetup() {
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactorId(data?.totp.find((f) => f.status === "verified")?.id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const start = async () => {
    setBusy(true);
    // limpa tentativas antigas não verificadas
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `SyncBank ${Date.now()}` });
    setBusy(false);
    if (error) return toast.error(error.message);
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirm = async (value: string) => {
    if (!enroll) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: value });
    setBusy(false);
    if (error) {
      setCode("");
      return toast.error("Código inválido, tente de novo");
    }
    toast.success("Verificação em 2 etapas ativada");
    setEnroll(null);
    setCode("");
    load();
  };

  const disable = async () => {
    if (!factorId) return;
    if (!window.confirm("Desativar a verificação em 2 etapas?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) return toast.error(error.message);
    toast.success("Verificação em 2 etapas desativada");
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Verificação em 2 etapas</CardTitle>
        <CardDescription>Código do app autenticador (Google Authenticator, Authy…) a cada login.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : factorId ? (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-accent p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent-foreground" />
              <p className="text-sm font-semibold text-accent-foreground">Ativada</p>
            </div>
            <Button variant="outline" size="sm" onClick={disable}>
              <ShieldOff className="mr-2 h-4 w-4" />
              Desativar
            </Button>
          </div>
        ) : enroll ? (
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <img src={enroll.qr} alt="QR code do autenticador" className="h-44 w-44 rounded-xl bg-white p-2" />
            <div className="space-y-3">
              <p className="text-sm">1. Escaneie o QR code no seu app autenticador.</p>
              <p className="break-all text-xs text-muted-foreground">
                Ou digite a chave: <code className="font-mono text-foreground">{enroll.secret}</code>
              </p>
              <p className="text-sm">2. Digite o código de 6 dígitos:</p>
              <InputOTP
                maxLength={6}
                value={code}
                disabled={busy}
                onChange={(v) => {
                  setCode(v);
                  if (v.length === 6) confirm(v);
                }}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Desativada</p>
            <Button onClick={start} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ativar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
