import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { WifiOff } from "lucide-react";

/** Registra o service worker, sincroniza a cor da barra de status com o tema e avisa quando estiver offline. */
export function PwaManager() {
  const { resolvedTheme } = useTheme();
  const [offline, setOffline] = useState(typeof navigator !== "undefined" && !navigator.onLine);

  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sem SW o app continua funcionando normalmente */
      });
    }
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Barra de status do celular acompanha o tema escolhido no app
  useEffect(() => {
    const color = resolvedTheme === "dark" ? "#090b0a" : "#f2f3f8";
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", color));
    document
      .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      ?.setAttribute("content", resolvedTheme === "dark" ? "black-translucent" : "default");
  }, [resolvedTheme]);

  if (!offline) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-warning px-4 pb-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] text-xs font-semibold text-warning-foreground">
      <WifiOff className="h-3.5 w-3.5" />
      Sem conexão — os dados serão atualizados quando a internet voltar
    </div>
  );
}
