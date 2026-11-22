import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Logo } from "@/components/layout/Sidebar";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (user && !authLoading) navigate("/");
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const er = emailSchema.safeParse(email);
    if (!er.success) next.email = er.error.errors[0].message;
    const pr = passwordSchema.safeParse(password);
    if (!pr.success) next.password = pr.error.errors[0].message;
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message.includes("Invalid login credentials") ? "Email ou senha incorretos" : error.message);
    } else {
      navigate("/");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-[hsl(150_12%_4%)] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_20%_20%,hsl(140_80%_30%/0.45),transparent_60%),radial-gradient(35rem_30rem_at_90%_90%,hsl(210_90%_45%/0.4),transparent_60%),radial-gradient(25rem_20rem_at_70%_30%,hsl(82_85%_50%/0.25),transparent_60%)]" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-[conic-gradient(from_120deg,hsl(82_85%_60%),hsl(160_70%_40%),hsl(210_90%_55%),hsl(270_60%_55%),hsl(82_85%_60%))] opacity-80 blur-[2px] [animation:spin_18s_linear_infinite]" />
        <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-[42%] bg-[hsl(150_12%_4%/0.55)] backdrop-blur-2xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="[&_span]:text-white">
            <Logo />
          </div>
          <div className="max-w-md space-y-3">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Suas finanças, num só lugar.</h2>
            <p className="text-white/60">Contas, cartões, metas e relatórios sincronizados — com acesso só seu.</p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Entrar</h1>
            <p className="text-sm text-muted-foreground">Acesso restrito ao titular da conta.</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-11 rounded-xl ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-11 rounded-xl ${errors.password ? "border-destructive" : ""}`}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" variant="glow" className="h-11 w-full rounded-xl" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Protegido com verificação em 2 etapas e logout automático.
          </p>
        </div>
      </div>
    </div>
  );
}
