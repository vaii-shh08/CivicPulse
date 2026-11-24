import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, CheckCheck, LogOut, Menu, Search, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { ComplaintDetailSheet } from "./ComplaintDetailSheet";
import { NOTIFICATION_ICON } from "./NotificationItem";
import { timeAgo } from "./meta";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { civic, useCivic } from "@/lib/civic/store";
import { openComplaint } from "@/lib/civic/ui-store";
import type { DemoUser } from "@/lib/civic/types";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
}

function SidebarNav({ items, onNavigate, footer }: { items: NavItem[]; onNavigate?: () => void; footer: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = item.exact ? pathname === item.to || pathname === `${item.to}/` : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand glow" />}
              <Icon className={cn("size-[1.1rem] transition-colors", active ? "text-primary" : "group-hover:text-primary")} />
              <span className="flex-1">{item.label}</span>
              {!!item.badge && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">{footer}</div>
    </div>
  );
}

function NotificationBell({ recipient, allHref }: { recipient: string; allHref?: string }) {
  const notifications = useCivic((s) => s.notifications.filter((n) => n.recipient === recipient));
  const unread = notifications.filter((n) => !n.read).length;
  const navigate = useNavigate();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications (${unread} unread)`}
          className="relative grid size-9 place-items-center rounded-full glass transition-colors hover:border-primary/40"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-critical px-1 text-[0.6rem] font-bold leading-4 text-destructive-foreground">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0 glass border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-bold">Notifications</p>
          <button
            type="button"
            onClick={() => civic.markAllRead(recipient)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {notifications.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>}
          {notifications.slice(0, 8).map((n) => {
            const Icon = NOTIFICATION_ICON[n.kind];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  civic.markRead(n.id);
                  openComplaint(n.complaintId);
                }}
                className={cn(
                  "flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                  !n.read && "bg-primary/5",
                )}
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {n.title}
                    {!n.read && <span className="size-1.5 rounded-full bg-primary" />}
                  </span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                  <span className="mt-1 block text-[0.68rem] text-muted-foreground/80">{timeAgo(n.createdAt)}</span>
                </span>
              </button>
            );
          })}
        </div>
        {allHref && (
          <button
            type="button"
            onClick={() => navigate({ to: allHref })}
            className="w-full px-4 py-2.5 text-center text-xs font-semibold text-primary hover:bg-accent/50"
          >
            View all notifications
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function DashboardShell({
  user,
  items,
  recipient,
  notificationsHref,
  roleLabel,
  children,
  extra,
}: {
  user: DemoUser;
  items: NavItem[];
  recipient: string;
  notificationsHref?: string;
  roleLabel: string;
  children: ReactNode;
  extra?: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const complaints = useCivic((s) => s.complaints);

  const logout = () => {
    civic.logout();
    navigate({ to: "/login" });
  };

  const footer = (
    <div className="space-y-2">
      <div className="panel flex items-center gap-3 p-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-extrabold text-primary-foreground">
          {user.name.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-[1.1rem]" /> Logout
      </button>
    </div>
  );

  const hour = new Date().getHours();
  const searchHits = q.trim()
    ? complaints
        .filter(
          (c) =>
            (recipient === "authority" || c.citizenId === user.id) &&
            (c.id.toLowerCase().includes(q.toLowerCase()) || c.title.toLowerCase().includes(q.toLowerCase())),
        )
        .slice(0, 6)
    : [];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-hero opacity-70" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:block">
        <SidebarNav items={items} footer={footer} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav items={items} footer={footer} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="grid size-9 place-items-center rounded-lg glass lg:hidden"
          >
            <Menu className="size-4" />
          </button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search complaints by ID or title…"
              className="h-10 w-full rounded-xl border border-input bg-card/60 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            {searchHits.length > 0 && (
              <div className="absolute inset-x-0 top-12 overflow-hidden rounded-xl glass shadow-[var(--shadow-card)]">
                {searchHits.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      openComplaint(c.id);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent/60"
                  >
                    <span className="font-mono text-xs text-primary">{c.id}</span>
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success sm:flex">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-70" />
                <span className="relative size-2 rounded-full bg-success" />
              </span>
              {hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"} shift · Live
            </span>
            <ThemeToggle />
            <NotificationBell recipient={recipient} {...(notificationsHref ? { allHref: notificationsHref } : {})} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <ComplaintDetailSheet mode={recipient === "authority" ? "authority" : "citizen"} />
      {extra}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: string; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
      <div>
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.7rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "cyan",
  hint,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "cyan" | "neon" | "violet" | "success" | "warning" | "critical";
  hint?: ReactNode;
  delay?: number;
}) {
  const toneCls = {
    cyan: "bg-cyan/12 text-cyan ring-cyan/25",
    neon: "bg-neon/12 text-neon ring-neon/25",
    violet: "bg-violet/12 text-violet ring-violet/25",
    success: "bg-success/12 text-success ring-success/25",
    warning: "bg-warning/12 text-warning ring-warning/25",
    critical: "bg-critical/12 text-critical ring-critical/25",
  }[tone];
  const barCls = {
    cyan: "bg-cyan",
    neon: "bg-neon",
    violet: "bg-violet",
    success: "bg-success",
    warning: "bg-warning",
    critical: "bg-critical",
  }[tone];
  return (
    <div className="panel panel-hover relative overflow-hidden p-5 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className={cn("pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-20 blur-2xl", barCls)} />
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <span className={cn("grid size-10 place-items-center rounded-xl ring-1", toneCls)}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 text-base font-bold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
