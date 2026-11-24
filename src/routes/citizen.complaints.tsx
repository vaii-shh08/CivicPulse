import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus2, Inbox, Search, SearchX } from "lucide-react";
import { ComplaintCard } from "@/components/civic/ComplaintCard";
import { EmptyState, PageHeader } from "@/components/civic/DashboardShell";
import { Button } from "@/components/ui/button";
import { useCivic, useSession } from "@/lib/civic/store";
import { STATUSES, type Status } from "@/lib/civic/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/complaints")({
  component: MyComplaints,
  head: () => ({ meta: [{ title: "My Complaints – CivicPulse" }] }),
});

function MyComplaints() {
  const user = useSession()!;
  const mine = useCivic((s) => s.complaints.filter((c) => c.citizenId === user.id));
  const [filter, setFilter] = useState<Status | "All">("All");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      mine.filter(
        (c) =>
          (filter === "All" || c.status === filter) &&
          (!q.trim() || c.id.toLowerCase().includes(q.toLowerCase()) || c.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [mine, filter, q],
  );

  return (
    <div>
      <PageHeader
        title="My Complaints"
        subtitle="Click any complaint to see its full progress timeline."
        actions={
          <Button asChild variant="hero">
            <Link to="/citizen/report">
              <FilePlus2 /> New report
            </Link>
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {(["All", ...STATUSES] as const).map((s) => {
            const count = s === "All" ? mine.length : mine.filter((c) => c.status === s).length;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all",
                  filter === s ? "border-primary/50 bg-primary/12 text-primary" : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
                <span className="font-mono text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative lg:ml-auto lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID or title"
            className="h-10 w-full rounded-xl border border-input bg-card/60 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      {mine.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="You haven't reported anything yet"
          text="Report a pothole, leak or broken streetlight and track it here."
          action={
            <Button asChild variant="hero">
              <Link to="/citizen/report">Report an issue</Link>
            </Button>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState icon={SearchX} title="No matching complaints" text="Try a different status filter or search term." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c, i) => (
            <ComplaintCard key={c.id} complaint={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
