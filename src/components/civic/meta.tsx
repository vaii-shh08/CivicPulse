import {
  AlertTriangle,
  Droplets,
  Lightbulb,
  Construction,
  ShieldAlert,
  Trash2,
  Waves,
  CircleEllipsis,
  type LucideIcon,
} from "lucide-react";
import type { Category, Priority, Status } from "@/lib/civic/types";
import { cn } from "@/lib/utils";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  Garbage: Trash2,
  Potholes: Construction,
  "Water Leakage": Droplets,
  "Streetlight Failure": Lightbulb,
  Drainage: Waves,
  "Public Safety": ShieldAlert,
  Other: CircleEllipsis,
};

/** Token classes per status — semantic colors only. */
export const STATUS_STYLE: Record<Status, { dot: string; chip: string }> = {
  Submitted: { dot: "bg-muted-foreground", chip: "bg-muted text-muted-foreground border-border" },
  "Under Review": { dot: "bg-violet", chip: "bg-violet/12 text-violet border-violet/30" },
  Assigned: { dot: "bg-neon", chip: "bg-neon/12 text-neon border-neon/30" },
  "In Progress": { dot: "bg-warning", chip: "bg-warning/12 text-warning border-warning/30" },
  Resolved: { dot: "bg-success", chip: "bg-success/12 text-success border-success/30" },
};

export const PRIORITY_STYLE: Record<Priority, { chip: string; marker: string; text: string }> = {
  Low: { chip: "bg-cyan/10 text-cyan border-cyan/25", marker: "bg-neon", text: "text-cyan" },
  Medium: { chip: "bg-neon/12 text-neon border-neon/30", marker: "bg-neon", text: "text-neon" },
  High: { chip: "bg-high/12 text-high border-high/30", marker: "bg-high", text: "text-high" },
  Critical: { chip: "bg-critical/12 text-critical border-critical/30", marker: "bg-critical", text: "text-critical" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", s.chip, className)}>
      <span className={cn("size-1.5 rounded-full", s.dot, status === "In Progress" && "animate-pulse")} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap", PRIORITY_STYLE[priority].chip, className)}>
      {priority === "Critical" && <AlertTriangle className="size-3" />}
      {priority}
    </span>
  );
}

export function CategoryChip({ category, className }: { category: Category; className?: string }) {
  const Icon = CATEGORY_ICON[category];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap", className)}>
      <Icon className="size-3.5 text-primary" />
      {category}
    </span>
  );
}

export function DemoTag({ children = "Demo data", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-warning", className)}>
      {children}
    </span>
  );
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(iso);
}
