import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, FilePlus2, FileText, Hourglass, Sparkles } from "lucide-react";
import { ComplaintCard } from "@/components/civic/ComplaintCard";
import { EmptyState, StatCard } from "@/components/civic/DashboardShell";
import { NOTIFICATION_ICON } from "@/components/civic/NotificationItem";
import { timeAgo } from "@/components/civic/meta";
import { Button } from "@/components/ui/button";
import { civic, useCivic, useSession } from "@/lib/civic/store";
import { openComplaint } from "@/lib/civic/ui-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/")({
  component: CitizenOverview,
  head: () => ({ meta: [{ title: "Overview – CivicPulse Citizen" }] }),
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
}

function CitizenOverview() {
  const user = useSession()!;
  const mine = useCivic((s) => s.complaints.filter((c) => c.citizenId === user.id));
  const notes = useCivic((s) => s.notifications.filter((n) => n.recipient === user.id).slice(0, 5));
  const resolved = mine.filter((c) => c.status === "Resolved").length;
  const inProgress = mine.filter((c) => c.status === "In Progress" || c.status === "Assigned").length;
  const pending = mine.filter((c) => c.status === "Submitted" || c.status === "Under Review").length;

  return (
    <div className="space-y-6">
      <section className="panel relative overflow-hidden p-6 sm:p-8 animate-fade-up">
        <div className="absolute inset-0 bg-hero" />
        <div className="mask-fade absolute inset-0 bg-grid opacity-70" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {greeting()}, {user.name.split(" ")[0]}!
            </h1>
            <p className="mt-1.5 text-muted-foreground">Together, let's make our city better.</p>
          </div>
          <div className="glass flex items-center gap-4 rounded-2xl p-4 lg:max-w-sm">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-brand text-primary-foreground glow">
              <FilePlus2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Spotted a problem?</p>
              <p className="text-xs text-muted-foreground">Report it in under a minute with photo and location.</p>
            </div>
            <Button asChild variant="hero" size="sm">
              <Link to="/citizen/report">
                Report <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reports Submitted" value={mine.length} icon={FileText} tone="cyan" hint="All time" delay={0} />
        <StatCard label="Issues Resolved" value={resolved} icon={CheckCircle2} tone="success" hint={mine.length ? `${Math.round((resolved / mine.length) * 100)}% resolution rate` : "—"} delay={60} />
        <StatCard label="In Progress" value={inProgress} icon={Clock} tone="warning" hint="Assigned or being fixed" delay={120} />
        <StatCard label="Pending" value={pending} icon={Hourglass} tone="violet" hint="Submitted or under review" delay={180} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent complaints</h2>
            <Link to="/citizen/complaints" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          {mine.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No complaints yet"
              text="When you report an issue, it'll appear here with live status updates."
              action={
                <Button asChild variant="hero">
                  <Link to="/citizen/report">Report your first issue</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {mine.slice(0, 4).map((c, i) => (
                <ComplaintCard key={c.id} complaint={c} index={i} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Latest updates</h2>
              <Link to="/citizen/notifications" className="text-xs font-semibold text-primary hover:underline">
                All
              </Link>
            </div>
            {notes.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No updates yet.</p>}
            <ul className="space-y-1">
              {notes.map((n) => {
                const Icon = NOTIFICATION_ICON[n.kind];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        civic.markRead(n.id);
                        openComplaint(n.complaintId);
                      }}
                      className="flex w-full gap-3 rounded-xl p-2 text-left transition-colors hover:bg-accent/50"
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", n.kind === "resolved" ? "bg-success/12 text-success" : "bg-primary/12 text-primary")}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                          {n.title} {!n.read && <span className="size-1.5 rounded-full bg-primary" />}
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">{n.message}</span>
                        <span className="text-[0.68rem] text-muted-foreground/80">{timeAgo(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="panel relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-violet/25 blur-3xl" />
            <p className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="size-4 text-violet" /> Civic tip
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Reports with a clear photo and exact location get verified up to 2× faster. Ask the assistant (bottom-right) if you need help.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
