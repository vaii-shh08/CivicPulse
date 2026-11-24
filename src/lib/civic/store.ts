import { useSyncExternalStore } from "react";
import { buildSeedState } from "./data";
import * as logic from "./logic";
import type { CivicState, Department, NewComplaintInput, Role, Status } from "./types";

/**
 * Shared demo app state, persisted in localStorage so citizen and authority views
 * stay in sync across refreshes and tabs. Swap these actions for API calls later.
 */
const KEY = "civicpulse:state:v1";
const SERVER_STATE = buildSeedState();

let state: CivicState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CivicState;
      if (parsed?.version === 1 && Array.isArray(parsed.complaints)) state = parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        state = JSON.parse(e.newValue) as CivicState;
        listeners.forEach((l) => l());
      } catch {
        /* ignore */
      }
    }
  });
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full (large photos): drop stored images from the oldest complaints and retry.
    try {
      const slim = { ...state, complaints: state.complaints.map((c, i) => (i > 5 ? { ...c, imageUrl: undefined } : c)) };
      window.localStorage.setItem(KEY, JSON.stringify(slim));
    } catch {
      /* give up silently: state stays in memory */
    }
  }
}

function set(next: CivicState) {
  if (next === state) return;
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getState() {
  load();
  return state;
}

export function useCivic<T = CivicState>(selector?: (s: CivicState) => T): T {
  const s = useSyncExternalStore(subscribe, getState, () => SERVER_STATE);
  return selector ? selector(s) : (s as unknown as T);
}

export function useSession() {
  return useCivic((s) => s.users.find((u) => u.id === s.sessionUserId) ?? null);
}

function actorName() {
  const s = getState();
  return s.users.find((u) => u.id === s.sessionUserId)?.name ?? "Municipal Authority";
}

export const civic = {
  login(email: string, password: string, role: Role) {
    const r = logic.loginUser(getState(), email, password, role);
    set(r.state);
    return r;
  },
  register(input: Parameters<typeof logic.registerUser>[1]) {
    const r = logic.registerUser(getState(), input);
    set(r.state);
    return r;
  },
  logout() {
    set({ ...getState(), sessionUserId: null });
  },
  updateProfile(patch: { name?: string; phone?: string; ward?: string; department?: string }) {
    const s = getState();
    set({ ...s, users: s.users.map((u) => (u.id === s.sessionUserId ? { ...u, ...patch } : u)) });
  },
  submitComplaint(input: NewComplaintInput) {
    const s = getState();
    const user = s.users.find((u) => u.id === s.sessionUserId);
    if (!user) throw new Error("Not signed in");
    const r = logic.createComplaint(s, input, user);
    set(r.state);
    return r.complaint;
  },
  setStatus(id: string, status: Status, note?: string) {
    set(logic.updateComplaintStatus(getState(), id, status, actorName(), note));
  },
  assign(id: string, department: Department) {
    set(logic.assignDepartment(getState(), id, department, actorName()));
  },
  addNote(id: string, text: string) {
    set(logic.addResolutionNote(getState(), id, text, actorName()));
  },
  markRead(id: string) {
    const s = getState();
    set({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  },
  markAllRead(recipient: string) {
    const s = getState();
    set({ ...s, notifications: s.notifications.map((n) => (n.recipient === recipient ? { ...n, read: true } : n)) });
  },
  clearNotifications(recipient: string) {
    const s = getState();
    set({ ...s, notifications: s.notifications.filter((n) => n.recipient !== recipient) });
  },
  resetDemo() {
    const s = getState();
    set({ ...buildSeedState(), sessionUserId: s.sessionUserId, users: s.users });
  },
};
