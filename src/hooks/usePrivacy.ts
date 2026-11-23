import { useSyncExternalStore } from "react";

/** Modo privacidade: oculta valores na tela (útil no celular em público). */
const KEY = "syncbank-hide-values";
const listeners = new Set<() => void>();

const read = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export function setHidden(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function usePrivacy() {
  const hidden = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => false
  );
  return { hidden, toggle: () => setHidden(!hidden), mask: (s: string) => (hidden ? "R$ ••••" : s) };
}
