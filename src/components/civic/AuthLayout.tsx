import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, MapPin, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import type { Role } from "@/lib/civic/types";
import { cn } from "@/lib/utils";

export function RolePicker({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const opts: { value: Role; label: string; hint: string; icon: typeof UserRound }[] = [
    { value: "citizen", label: "Citizen", hint: "Report & track issues", icon: UserRound },
    { value: "authority", label: "Municipal Authority", hint: "Manage & resolve", icon: Building2 },
  ];
  return (
    <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-2">
      {opts.map((o) => {
        const active = role === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
              active ? "border-primary/60 bg-primary/10 glow" : "border-border bg-card/40 hover:border-primary/30",
            )}
          >
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", active ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground")}>
              <o.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{o.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{o.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-border bg-surface lg:block">
        <div className="absolute inset-0 bg-hero" />
        <div className="mask-fade absolute inset-0 bg-grid" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo />
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-bold tracking-widest text-primary">
              <Sparkles className="size-3.5" /> CITY COMMAND CENTER
            </p>
            <h2 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight">
              One platform for citizens and the <span className="text-gradient">people who fix the city.</span>
            </h2>
            <div className="mt-8 grid max-w-md gap-3">
              {[
                { icon: MapPin, t: "Report with photo & location", d: "Pin issues on the live city map." },
                { icon: Sparkles, t: "Smart triage", d: "Category, priority and department suggested instantly." },
                { icon: ShieldCheck, t: "Transparent resolution", d: "Every status change notifies the citizen." },
              ].map((f, i) => (
                <div key={f.t} className="glass flex items-center gap-3 rounded-xl p-3 animate-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/12 text-primary">
                    <f.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{f.t}</p>
                    <p className="text-xs text-muted-foreground">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Prototype · demo sign-in stored only in this browser</p>
        </div>
      </aside>
      <main className="relative flex flex-col">
        <div className="pointer-events-none absolute inset-0 bg-hero opacity-50 lg:hidden" />
        <div className="relative flex items-center justify-between p-5 sm:p-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <ThemeToggle />
        </div>
        <div className="relative flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function Field({ label, error, children, htmlFor }: { label: string; error?: string | undefined; children: ReactNode; htmlFor: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls = (error?: string) =>
  cn(
    "h-11 w-full rounded-xl border bg-card/60 px-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2",
    error ? "border-destructive/60 focus:ring-destructive/20" : "border-input focus:border-primary/50 focus:ring-primary/20",
  );
