import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/civic/DashboardShell";
import { CategoryChip, PriorityBadge, STATUS_STYLE } from "@/components/civic/meta";
import { locationById } from "@/lib/civic/data";
import { civic, useCivic } from "@/lib/civic/store";
import { openComplaint } from "@/lib/civic/ui-store";
import { STATUSES } from "@/lib/civic/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/authority/manage")({
  component: Manage,
  head: () => ({ meta: [{ title: "Manage Issues – CivicPulse Authority" }] }),
});

function Manage() {
  const all = useCivic((s) => s.complaints);
  return (
    <div>
      <PageHeader title="Manage Issues" subtitle="Move issues through the resolution workflow. Drag a card or use the arrow to advance it." />
      <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-5">
        {STATUSES.map((s, si) => {
          const col = all.filter((c) => c.status === s);
          return (
            <div key={s} className="min-w-64 rounded-2xl border border-border bg-card/30 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { const id = e.dataTransfer.getData("text/plain"); if (id) civic.setStatus(id, s); }}>
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={cn("size-2 rounded-full", STATUS_STYLE[s].dot)} />
                <p className="text-sm font-bold">{s}</p>
                <span className="ml-auto font-mono text-xs text-muted-foreground">{col.length}</span>
              </div>
              <div className="space-y-2">
                {col.slice(0, 12).map((c) => (
                  <div key={c.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                    className="panel panel-hover cursor-grab p-3 active:cursor-grabbing">
                    <button type="button" onClick={() => openComplaint(c.id)} className="w-full text-left">
                      <span className="font-mono text-[0.7rem] text-primary">{c.id}</span>
                      <p className="mt-0.5 line-clamp-2 text-sm font-semibold">{c.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{locationById(c.locationId).name}</p>
                    </button>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <CategoryChip category={c.category} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                    {si < STATUSES.length - 1 && (
                      <button type="button" onClick={() => civic.setStatus(c.id, STATUSES[si + 1]!)} className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-primary/10 py-1.5 text-xs font-bold text-primary hover:bg-primary/20">
                        Move to {STATUSES[si + 1]} <ChevronRight className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
