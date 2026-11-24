import { useState } from "react";
import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { civic, useCivic } from "@/lib/civic/store";
import { openComplaint } from "@/lib/civic/ui-store";
import { EmptyState, PageHeader } from "./DashboardShell";
import { NOTIFICATION_ICON } from "./NotificationItem";
import { formatDateTime, timeAgo } from "./meta";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  resolved: "bg-success/12 text-success",
  assigned: "bg-neon/12 text-neon",
  review: "bg-violet/12 text-violet",
  progress: "bg-warning/12 text-warning",
  new: "bg-critical/12 text-critical",
};

export function NotificationCenter({ recipient }: { recipient: string }) {
  const all = useCivic((s) => s.notifications.filter((n) => n.recipient === recipient));
  const [tab, setTab] = useState<"all" | "unread">("all");
  const list = tab === "unread" ? all.filter((n) => !n.read) : all;
  const unread = all.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Every status change on your complaints shows up here."
        actions={
          <>
            <Button variant="glass" onClick={() => civic.markAllRead(recipient)} disabled={!unread}>
              <CheckCheck /> Mark all read
            </Button>
            <Button variant="ghost" onClick={() => civic.clearNotifications(recipient)} disabled={!all.length}>
              <Trash2 /> Clear
            </Button>
          </>
        }
      />
      <div className="mb-4 flex gap-1.5">
        {(["all", "unread"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-semibold capitalize transition-all", tab === t ? "border-primary/50 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
            {t} <span className="font-mono text-xs opacity-70">{t === "all" ? all.length : unread}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={BellOff} title={tab === "unread" ? "No unread notifications" : "No notifications"} text="You'll be notified when a complaint is received, reviewed, assigned or resolved." />
      ) : (
        <div className="panel divide-y divide-border overflow-hidden">
          {list.map((n, i) => {
            const Icon = NOTIFICATION_ICON[n.kind];
            return (
              <div key={n.id} className={cn("flex items-start gap-4 p-4 transition-colors hover:bg-accent/30 animate-fade-up", !n.read && "bg-primary/5")} style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", TONE[n.kind] ?? "bg-primary/12 text-primary")}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{n.title}</p>
                    {!n.read && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-primary-foreground">New</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80" title={formatDateTime(n.createdAt)}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                  <Button
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      civic.markRead(n.id);
                      openComplaint(n.complaintId);
                    }}
                  >
                    View
                  </Button>
                  {!n.read && (
                    <Button size="sm" variant="ghost" onClick={() => civic.markRead(n.id)}>
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
