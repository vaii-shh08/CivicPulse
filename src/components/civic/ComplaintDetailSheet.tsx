import { useEffect, useState } from "react";
import { Building2, CalendarDays, Check, CheckCircle2, Circle, ImageOff, Loader2, MapPin, MessageSquarePlus, User } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { civic, useCivic } from "@/lib/civic/store";
import { openComplaint, useOpenComplaint } from "@/lib/civic/ui-store";
import { locationById } from "@/lib/civic/data";
import { DEPARTMENTS, STATUSES, type Complaint, type Department, type Status } from "@/lib/civic/types";
import { AiInsights } from "./AiInsights";
import { CATEGORY_ICON, PriorityBadge, StatusBadge, formatDate, formatDateTime } from "./meta";
import { cn } from "@/lib/utils";

export function ProgressTimeline({ complaint }: { complaint: Complaint }) {
  const reached = STATUSES.indexOf(complaint.status);
  return (
    <ol className="relative space-y-0">
      {STATUSES.map((s, i) => {
        const entry = [...complaint.timeline].reverse().find((t) => t.status === s);
        const done = i <= reached;
        const current = i === reached;
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
            {i < STATUSES.length - 1 && (
              <span className={cn("absolute left-[0.9rem] top-8 bottom-0 w-0.5 rounded-full", i < reached ? "bg-brand" : "bg-border")} />
            )}
            <span
              className={cn(
                "relative z-10 grid size-[1.85rem] shrink-0 place-items-center rounded-full border-2 transition-all",
                done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
                current && complaint.status !== "Resolved" && "glow",
                current && complaint.status === "Resolved" && "border-success bg-success",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : <Circle className="size-2.5" />}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3">
                <p className={cn("text-sm font-bold", !done && "text-muted-foreground")}>{s}</p>
                {entry && <p className="font-mono text-[0.7rem] text-muted-foreground">{formatDateTime(entry.at)}</p>}
              </div>
              {entry?.note && <p className="mt-0.5 text-xs text-muted-foreground">{entry.note}</p>}
              {current && complaint.status !== "Resolved" && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Loader2 className="size-3 animate-spin" /> Current stage
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function AuthorityActions({ complaint }: { complaint: Complaint }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setNote(""), [complaint.id]);

  const run = async (fn: () => void, msg: string) => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    fn();
    setBusy(false);
    toast.success(msg, { description: `${complaint.id} · citizen notified` });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-4">
      <p className="text-sm font-bold">Authority actions</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Assign department</span>
          <Select
            value={complaint.department ?? ""}
            onValueChange={(v) => run(() => civic.assign(complaint.id, v as Department), `Assigned to ${v}`)}
          >
            <SelectTrigger className="h-10 rounded-xl bg-background/50">
              <SelectValue placeholder="Choose department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Change status</span>
          <Select value={complaint.status} onValueChange={(v) => run(() => civic.setStatus(complaint.id, v as Status), `Status changed to ${v}`)}>
            <SelectTrigger className="h-10 rounded-xl bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">Resolution note</span>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Crew replaced the damaged pipeline section and cleared the footpath."
          className="min-h-20 rounded-xl bg-background/50"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={busy || !note.trim()}
          onClick={() =>
            run(() => {
              civic.addNote(complaint.id, note);
              setNote("");
            }, "Note added")
          }
        >
          <MessageSquarePlus /> Add note
        </Button>
        <Button
          variant="hero"
          disabled={busy || complaint.status === "Resolved"}
          onClick={() =>
            run(() => {
              civic.setStatus(complaint.id, "Resolved", note.trim() || "Issue resolved and verified on site.");
              setNote("");
            }, "Marked as resolved")
          }
        >
          {busy ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Mark resolved
        </Button>
      </div>
    </div>
  );
}

export function ComplaintDetailSheet({ mode }: { mode: "citizen" | "authority" }) {
  const id = useOpenComplaint();
  const complaint = useCivic((s) => s.complaints.find((c) => c.id === id));
  const open = !!id && !!complaint;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && openComplaint(null)}>
      <SheetContent side="right" className="w-full overflow-y-auto border-border bg-background p-0 scrollbar-thin sm:max-w-xl">
        {complaint && (
          <div className="pb-8">
            <div className="relative h-48 overflow-hidden bg-surface">
              {complaint.imageUrl ? (
                <img src={complaint.imageUrl} alt={complaint.title} className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center bg-grid">
                  {(() => {
                    const Icon = CATEGORY_ICON[complaint.category];
                    return (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <span className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/25">
                          <Icon className="size-7" />
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <ImageOff className="size-3.5" /> No photo attached
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
            </div>
            <div className="-mt-6 space-y-6 px-5 sm:px-6">
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-primary/12 px-2 py-0.5 font-mono text-xs font-semibold text-primary">{complaint.id}</span>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
                <SheetTitle className="mt-3 text-xl font-extrabold leading-snug">{complaint.title}</SheetTitle>
                <SheetDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">{complaint.description}</SheetDescription>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: CATEGORY_ICON[complaint.category], label: "Category", value: complaint.category },
                  { icon: MapPin, label: "Location", value: `${locationById(complaint.locationId).name}, ${locationById(complaint.locationId).area}` },
                  { icon: CalendarDays, label: "Submitted", value: formatDate(complaint.createdAt) },
                  { icon: Building2, label: "Department", value: complaint.department ?? "Not assigned yet" },
                  ...(mode === "authority" ? [{ icon: User, label: "Reported by", value: complaint.citizenName }] : []),
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-border bg-card/50 p-3">
                    <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">
                      <m.icon className="size-3.5 text-primary" /> {m.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{m.value}</p>
                  </div>
                ))}
              </div>
              {complaint.address && <p className="-mt-3 text-xs text-muted-foreground">Address note: {complaint.address}</p>}

              <div>
                <p className="mb-4 text-sm font-bold">Resolution progress</p>
                <ProgressTimeline complaint={complaint} />
              </div>

              {complaint.notes.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-bold">Updates from the city</p>
                  <div className="space-y-2">
                    {complaint.notes.map((n) => (
                      <div key={n.id} className="rounded-xl border border-border bg-card/50 p-3">
                        <p className="text-sm">{n.text}</p>
                        <p className="mt-1 text-[0.7rem] text-muted-foreground">
                          {n.by} · {formatDateTime(n.at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mode === "authority" && <AuthorityActions complaint={complaint} />}
              <AiInsights complaint={complaint} />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
