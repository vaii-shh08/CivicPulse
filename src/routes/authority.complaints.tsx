import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Search, SearchX } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/civic/DashboardShell";
import { CategoryChip, PriorityBadge, StatusBadge, formatDate } from "@/components/civic/meta";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { locationById } from "@/lib/civic/data";
import { civic, useCivic } from "@/lib/civic/store";
import { openComplaint } from "@/lib/civic/ui-store";
import { CATEGORIES, PRIORITIES, STATUSES, type Status } from "@/lib/civic/types";
import { toast } from "sonner";

export const Route = createFileRoute("/authority/complaints")({
  component: AllComplaints,
  head: () => ({ meta: [{ title: "All Complaints – CivicPulse Authority" }] }),
});

function Filter({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: readonly string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full rounded-xl bg-card/60 sm:w-44"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function AllComplaints() {
  const all = useCivic((s) => s.complaints);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [pri, setPri] = useState("all");
  const [st, setSt] = useState("all");
  const list = useMemo(() => all.filter((c) =>
    (cat === "all" || c.category === cat) && (pri === "all" || c.priority === pri) && (st === "all" || c.status === st) &&
    (!q.trim() || c.id.toLowerCase().includes(q.toLowerCase()) || c.title.toLowerCase().includes(q.toLowerCase()))), [all, q, cat, pri, st]);

  return (
    <div>
      <PageHeader title="All Complaints" subtitle={`${list.length} of ${all.length} complaints`} />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by complaint ID or title" className="h-10 w-full rounded-xl border border-input bg-card/60 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        </div>
        <Filter value={cat} onChange={setCat} label="categories" options={CATEGORIES} />
        <Filter value={pri} onChange={setPri} label="priorities" options={PRIORITIES} />
        <Filter value={st} onChange={setSt} label="statuses" options={STATUSES} />
      </div>
      {list.length === 0 ? <EmptyState icon={SearchX} title="No complaints match" text="Adjust the filters or search term." /> : (
        <div className="panel overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                {["Complaint ID", "Issue", "Category", "Location", "Priority", "Reported", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-border/60 transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{c.id}</td>
                  <td className="max-w-64 px-4 py-3"><p className="truncate font-semibold">{c.title}</p><p className="text-xs text-muted-foreground">{c.citizenName}</p></td>
                  <td className="px-4 py-3"><CategoryChip category={c.category} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{locationById(c.locationId).name}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Select value={c.status} onValueChange={(v) => { civic.setStatus(c.id, v as Status); toast.success(`${c.id} → ${v}`, { description: "Citizen notified" }); }}>
                      <SelectTrigger className="h-8 w-36 border-none bg-transparent p-0 shadow-none"><StatusBadge status={c.status} /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3"><Button size="sm" variant="soft" onClick={() => openComplaint(c.id)}><Eye /> View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
