"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallContext = createContext<{
  prompt: InstallEvent | null;
  installed: boolean;
  clearPrompt: () => void;
}>({ prompt: null, installed: false, clearPrompt: () => {} });

export const usePwaInstall = () => useContext(InstallContext);

export function PwaProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(display.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const complete = () => { setInstalled(true); setPrompt(null); };
    update();
    display.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", complete);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
        // The online site remains usable if the browser blocks registration.
      });
    }
    return () => {
      display.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", complete);
    };
  }, []);
  return <InstallContext.Provider value={{ prompt, installed, clearPrompt: () => setPrompt(null) }}>{children}</InstallContext.Provider>;
}
