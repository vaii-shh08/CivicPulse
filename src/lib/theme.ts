import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
const KEY = "civicpulse:theme";
const listeners = new Set<() => void>();

/** Inline script run before paint so the saved theme applies without a flash. Dark is the default. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');var d=document.documentElement;if(t==='light'){d.classList.remove('dark')}else{d.classList.add('dark')}}catch(e){}})();`;

function current(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark");
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    current,
    () => "dark" as Theme,
  );
  return { theme, toggle: () => setTheme(theme === "dark" ? "light" : "dark"), setTheme };
}
