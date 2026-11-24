import { Bot, Building2, Copy, Gauge, ScanSearch, Sparkles } from "lucide-react";
import { classifyText, findDuplicates, suggestDepartment, suggestPriority, summarize } from "@/lib/civic/ai";
import { locationById } from "@/lib/civic/data";
import { useCivic } from "@/lib/civic/store";
import type { Complaint } from "@/lib/civic/types";
import { openComplaint } from "@/lib/civic/ui-store";
import { PriorityBadge } from "./meta";

export function SimulatedAiTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet/30 bg-violet/10 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-violet">
      <Sparkles className="size-3" /> Rule-based demo · not live AI
    </span>
  );
}

export function AiInsights({ complaint }: { complaint: Complaint }) {
  const all = useCivic((s) => s.complaints);
  const text = `${complaint.title}. ${complaint.description}`;
  const cls = classifyText(text);
  const pr = suggestPriority(text, complaint.category);
  const dept = suggestDepartment(complaint.category);
  const dupes = findDuplicates(all, complaint.category, complaint.locationId, complaint.id);
  const summary = complaint.aiSummary ?? summarize(complaint.title, complaint.description, complaint.category, complaint.locationId);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet/25 bg-violet/5 p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-violet/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Bot className="size-4 text-violet" /> CivicPulse Intelligence
        </p>
        <SimulatedAiTag />
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-foreground/90">{summary}</p>
      <div className="relative mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-card/60 p-3">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">
            <ScanSearch className="size-3.5" /> Classification
          </p>
          <p className="mt-1 text-sm font-semibold">
            {cls.category} <span className="font-mono text-xs text-muted-foreground">{Math.round(cls.confidence * 100)}%</span>
          </p>
          {cls.matched.length > 0 && <p className="mt-0.5 truncate text-xs text-muted-foreground">Keywords: {cls.matched.slice(0, 4).join(", ")}</p>}
        </div>
        <div className="rounded-xl bg-card/60 p-3">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">
            <Gauge className="size-3.5" /> Suggested priority
          </p>
          <div className="mt-1">
            <PriorityBadge priority={pr.priority} />
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{pr.reasons[0]}</p>
        </div>
        <div className="rounded-xl bg-card/60 p-3">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">
            <Building2 className="size-3.5" /> Responsible department
          </p>
          <p className="mt-1 text-sm font-semibold">{dept}</p>
        </div>
        <div className="rounded-xl bg-card/60 p-3">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">
            <Copy className="size-3.5" /> Possible duplicates
          </p>
          {dupes.length === 0 ? (
            <p className="mt-1 text-sm font-semibold text-success">None found</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-1">
              {dupes.slice(0, 3).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => openComplaint(d.id)}
                  title={`${d.title} · ${locationById(d.locationId).name}`}
                  className="rounded-md bg-warning/12 px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold text-warning hover:bg-warning/20"
                >
                  {d.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
