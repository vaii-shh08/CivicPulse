import { useSyncExternalStore } from "react";

/** Which complaint is open in the shared detail panel. */
let openId: string | null = null;
const listeners = new Set<() => void>();

export function openComplaint(id: string | null) {
  openId = id;
  listeners.forEach((l) => l());
}

export function useOpenComplaint() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => openId,
    () => null,
  );
}

let hydrated = false;
const hydListeners = new Set<() => void>();
/** True after the first client render — gate anything that reads browser storage. */
export function useHydrated() {
  return useSyncExternalStore(
    (l) => {
      hydListeners.add(l);
      if (!hydrated) {
        queueMicrotask(() => {
          hydrated = true;
          hydListeners.forEach((x) => x());
        });
      }
      return () => hydListeners.delete(l);
    },
    () => hydrated,
    () => false,
  );
}
