import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { locationById } from "@/lib/civic/data";
import { STATUSES, type Complaint } from "@/lib/civic/types";
import { openComplaint } from "@/lib/civic/ui-store";
import { CATEGORY_ICON, PriorityBadge, StatusBadge, formatDate } from "./meta";
import { cn } from "@/lib/utils";

export function ComplaintCard({ complaint, index = 0 }: { complaint: Complaint; index?: number }) {
  const Icon = CATEGORY_ICON[complaint.category];
  const progress = ((STATUSES.indexOf(complaint.status) + 1) / STATUSES.length) * 100;
  const loc = locationById(complaint.locationId);
  return (
    <button
      type="button"
      onClick={() => openComplaint(complaint.id)}
      className="panel panel-hover group flex w-full flex-col p-4 text-left animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        {complaint.imageUrl ? (
          <img src={complaint.imageUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-border" />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Icon className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-primary">{complaint.id}</span>
            <span className="text-xs text-muted-foreground">· {complaint.category}</span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm font-bold">{complaint.title}</p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" /> {loc.name}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="size-3.5" /> {formatDate(complaint.createdAt)}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-700", complaint.status === "Resolved" ? "bg-success" : "bg-brand")} style={{ width: `${progress}%` }} />
      </div>
    </button>
  );
}
