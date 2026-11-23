import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Logo } from "@/components/layout/Sidebar";

/** Logout automático após inatividade */
const IDLE_MS = 15 * 60 * 1000;

function useIdleLogout(enabled: boolean, onIdle: () => void) {
  const timer = useRef<number>();
  useEffect(() => {
    if (!enabled) return;
    const reset = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(onIdle, IDLE_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [enabled, onIdle]);
}

function MfaChallenge({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async (value: string) => {
    setBusy(true);
    try {
      const { data: factors, error: fe } = await supabase.auth.mfa.listFactors();
      if (fe) throw fe;
      const factor = factors.totp.find((f) => f.status === "verified");
      if (!factor) throw new Error("Nenhum autenticador encontrado");
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: value });
      if (error) throw error;
      onDone();
    } catch (e: any) {
      toast.error(e.message?.includes("Invalid") ? "Código inválido" : e.message || "Erro ao verificar");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="panel w-full max-w-sm space-y-6 p-8 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Verificação em 2 etapas</h1>
          <p className="text-sm text-muted-foreground">Digite o código de 6 dígitos do seu app autenticador.</p>
        </div>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) verify(v);
            }}
            disabled={busy}
            autoFocus
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Sair
        </Button>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [aal, setAal] = useState<"checking" | "ok" | "needs-mfa">("checking");

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      setAal(data && data.nextLevel === "aal2" && data.currentLevel !== "aal2" ? "needs-mfa" : "ok");
    });
  }, [user]);

  const logout = useCallback(async () => {
    await signOut();
    navigate("/auth", { replace: true });
  }, [signOut, navigate]);

  const onIdle = useCallback(async () => {
    await logout();
    toast.info("Sessão encerrada por inatividade");
  }, [logout]);

  useIdleLogout(!!user && aal === "ok", onIdle);

  if (loading || (user && aal === "checking")) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;
  if (aal === "needs-mfa") return <MfaChallenge onDone={() => setAal("ok")} onCancel={logout} />;
  return <>{children}</>;
}
