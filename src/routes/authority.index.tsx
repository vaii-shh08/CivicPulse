import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertOctagon, ArrowRight, CheckCircle2, ClipboardList, Hourglass } from "lucide-react";
import { PageHeader, StatCard } from "@/components/civic/DashboardShell";
import { CityMap } from "@/components/civic/CityMap";
import { CategoryChip, PriorityBadge, StatusBadge, timeAgo } from "@/components/civic/meta";
import { useCivic } from "@/lib/civic/store";
import { openComplaint } from "@/lib/civic/ui-store";

export const Route = createFileRoute("/authority/")({
  component: AuthorityOverview,
  head: () => ({ meta: [{ title: "Command Center – CivicPulse Authority" }] }),
});

function AuthorityOverview() {
  const all = useCivic((s) => s.complaints);
  const open = all.filter((c) => c.status !== "Resolved");
  const critical = open.filter((c) => c.priority === "Critical");
  return (
    <div className="space-y-6">
      <PageHeader title="Municipal Command Center" subtitle="Live overview of civic issues across all wards." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Complaints" value={all.length} icon={ClipboardList} tone="cyan" />
        <StatCard label="Unresolved Issues" value={open.length} icon={Hourglass} tone="warning" delay={60} />
        <StatCard label="Resolved Complaints" value={all.length - open.length} icon={CheckCircle2} tone="success" delay={120} />
        <StatCard label="Critical Priority" value={critical.length} icon={AlertOctagon} tone="critical" hint="Open critical issues" delay={180} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <CityMap complaints={open} height="h-[440px]" showFilters={false} />
        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Needs attention</h2>
            <Link to="/authority/complaints" className="flex items-center gap-1 text-xs font-semibold text-primary">All <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="space-y-2">
            {open.filter((c) => c.priority === "Critical" || c.status === "Submitted").slice(0, 6).map((c) => (
              <button key={c.id} type="button" onClick={() => openComplaint(c.id)} className="w-full rounded-xl border border-border bg-card/40 p-3 text-left transition-colors hover:border-primary/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-primary">{c.id}</span>
                  <span className="text-[0.68rem] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm font-semibold">{c.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2"><CategoryChip category={c.category} /><PriorityBadge priority={c.priority} /><StatusBadge status={c.status} /></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
