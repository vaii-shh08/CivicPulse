import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogoMark } from "./Logo";
import { useSession } from "@/lib/civic/store";
import { useHydrated } from "@/lib/civic/ui-store";
import type { DemoUser, Role } from "@/lib/civic/types";

/** Demo auth gate: waits for browser storage, then redirects visitors without the right role. */
export function RoleGuard({ role, children }: { role: Role; children: (user: DemoUser) => ReactNode }) {
  const hydrated = useHydrated();
  const user = useSession();
  const navigate = useNavigate();
  const ok = hydrated && user?.role === role;

  useEffect(() => {
    if (!hydrated) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (user.role !== role) navigate({ to: user.role === "citizen" ? "/citizen" : "/authority", replace: true });
  }, [hydrated, user, role, navigate]);

  if (!ok || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <span className="absolute inset-0 rounded-xl bg-primary/30 animate-pulse-ring" />
            <LogoMark className="relative size-12" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }
  return <>{children(user)}</>;
}
