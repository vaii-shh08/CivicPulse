import { useMemo, useRef, useState } from "react";
import { Layers, Minus, Plus, RotateCcw, X } from "lucide-react";
import { LOCATIONS, locationById } from "@/lib/civic/data";
import { CATEGORIES, STATUSES, type Category, type Complaint, type Status } from "@/lib/civic/types";
import { openComplaint } from "@/lib/civic/ui-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_ICON, PriorityBadge, StatusBadge, formatDate } from "./meta";
import { cn } from "@/lib/utils";

type MarkerTone = "critical" | "high" | "medium" | "resolved";
const toneOf = (c: Complaint): MarkerTone =>
  c.status === "Resolved" ? "resolved" : c.priority === "Critical" ? "critical" : c.priority === "High" ? "high" : "medium";

const TONE: Record<MarkerTone, { bg: string; ring: string; label: string }> = {
  critical: { bg: "bg-critical", ring: "bg-critical/40", label: "Critical" },
  high: { bg: "bg-high", ring: "bg-high/40", label: "High priority" },
  medium: { bg: "bg-neon", ring: "bg-neon/40", label: "Medium / Low" },
  resolved: { bg: "bg-success", ring: "bg-success/40", label: "Resolved" },
};

/** Stylised demo city drawn in SVG — swap for a real map provider later. */
export function CityBase() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
      {/* river */}
      <path d="M-5 70 C 15 66, 20 50, 35 52 S 60 70, 75 62 S 95 40, 110 44" fill="none" stroke="var(--cyan)" strokeOpacity="0.22" strokeWidth="5" />
      <path d="M-5 70 C 15 66, 20 50, 35 52 S 60 70, 75 62 S 95 40, 110 44" fill="none" stroke="var(--cyan)" strokeOpacity="0.35" strokeWidth="0.4" strokeDasharray="1.5 1.5" className="animate-dash" />
      {/* parks */}
      <ellipse cx="66" cy="78" rx="9" ry="6" fill="var(--success)" fillOpacity="0.12" />
      <ellipse cx="26" cy="20" rx="8" ry="5" fill="var(--success)" fillOpacity="0.12" />
      <ellipse cx="90" cy="64" rx="6" ry="8" fill="var(--success)" fillOpacity="0.1" />
      {/* blocks */}
      {Array.from({ length: 9 }).flatMap((_, r) =>
        Array.from({ length: 9 }).map((__, c) => {
          const x = 3 + c * 11 + ((r * 7 + c * 3) % 3);
          const y = 3 + r * 11 + ((c * 5 + r) % 3);
          const w = 6 + ((r + c) % 3);
          const h = 5 + ((r * c) % 3);
          return (
            <rect key={`${r}-${c}`} x={x} y={y} width={w} height={h} rx="0.8" fill="var(--foreground)" fillOpacity={0.04 + ((r + c) % 4) * 0.012} />
          );
        }),
      )}
      {/* roads */}
      <g stroke="var(--foreground)" strokeOpacity="0.12" fill="none">
        <path d="M0 40 H100" strokeWidth="1.4" />
        <path d="M0 74 H100" strokeWidth="1" />
        <path d="M45 0 V100" strokeWidth="1.4" />
        <path d="M80 0 V100" strokeWidth="1" />
        <path d="M18 0 V100" strokeWidth="0.8" />
        <path d="M0 15 L100 95" strokeWidth="0.8" />
        <circle cx="50" cy="48" r="22" strokeWidth="0.9" />
      </g>
      {/* data flow along main roads */}
      <g stroke="var(--cyan)" strokeOpacity="0.5" fill="none" strokeWidth="0.35" strokeDasharray="2 6">
        <path d="M0 40 H100" className="animate-dash" />
        <path d="M45 0 V100" className="animate-dash" />
        <circle cx="50" cy="48" r="22" className="animate-dash" />
      </g>
    </svg>
  );
}

export function CityMap({
  complaints,
  height = "h-[560px]",
  showFilters = true,
}: {
  complaints: Complaint[];
  height?: string;
  showFilters?: boolean;
}) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);

  const visible = useMemo(
    () => complaints.filter((c) => (category === "all" || c.category === category) && (status === "all" || c.status === status)),
    [complaints, category, status],
  );

  // Spread multiple complaints at the same location in a small circle
  const placed = useMemo(() => {
    const byLoc = new Map<string, Complaint[]>();
    visible.forEach((c) => byLoc.set(c.locationId, [...(byLoc.get(c.locationId) ?? []), c]));
    return visible.map((c) => {
      const group = byLoc.get(c.locationId) ?? [c];
      const idx = group.indexOf(c);
      const loc = locationById(c.locationId);
      const angle = (idx / group.length) * Math.PI * 2;
      const r = group.length > 1 ? 2.6 : 0;
      return { c, x: loc.x + Math.cos(angle) * r, y: loc.y + Math.sin(angle) * r };
    });
  }, [visible]);

  const sel = placed.find((p) => p.c.id === selected);
  const counts = useMemo(() => {
    const m: Record<MarkerTone, number> = { critical: 0, high: 0, medium: 0, resolved: 0 };
    visible.forEach((c) => (m[toneOf(c)] += 1));
    return m;
  }, [visible]);

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <Select value={category} onValueChange={(v) => setCategory(v as Category | "all")}>
            <SelectTrigger className="h-10 w-48 rounded-xl bg-card/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as Status | "all")}>
            <SelectTrigger className="h-10 w-44 rounded-xl bg-card/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{visible.length}</span> issues on map
          </span>
        </div>
      )}

      <div className={cn("panel relative overflow-hidden", height)}>
        <div
          className="absolute inset-0 cursor-grab touch-none bg-grid active:cursor-grabbing"
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            const dy = e.clientY - d.y;
            if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
            if (zoom > 1) setPan({ x: d.px + dx, y: d.py + dy });
          }}
          onPointerUp={() => {
            if (drag.current && !drag.current.moved) setSelected(null);
            drag.current = null;
          }}
          onPointerLeave={() => (drag.current = null)}
        >
          <div
            className="absolute inset-0 origin-center transition-transform duration-300 ease-out"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            <CityBase />
            {LOCATIONS.map((l) => (
              <span
                key={l.id}
                className="pointer-events-none absolute -translate-x-1/2 translate-y-3 whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground/70"
                style={{ left: `${l.x}%`, top: `${l.y}%`, fontSize: `${0.62 / Math.sqrt(zoom)}rem` }}
              >
                {l.name}
              </span>
            ))}
            {placed.map(({ c, x, y }) => {
              const t = TONE[toneOf(c)];
              const isSel = c.id === selected;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`${c.id}: ${c.title}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(c.id);
                  }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${1 / zoom})` }}
                >
                  {toneOf(c) === "critical" && <span className={cn("absolute inset-0 rounded-full animate-pulse-ring", t.ring)} />}
                  <span
                    className={cn(
                      "relative grid size-6 place-items-center rounded-full border-2 border-background shadow-lg transition-transform hover:scale-125",
                      t.bg,
                      isSel && "scale-125 ring-4 ring-primary/40",
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-background" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* scan line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan" />

        {/* popup */}
        {sel && (
          <div className="absolute bottom-4 left-4 right-4 z-20 sm:left-auto sm:w-80 animate-fade-up">
            <div className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = CATEGORY_ICON[sel.c.category];
                    return (
                      <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-primary">
                        <Icon className="size-4" />
                      </span>
                    );
                  })()}
                  <div>
                    <p className="font-mono text-xs font-semibold text-primary">{sel.c.id}</p>
                    <p className="text-xs text-muted-foreground">{sel.c.category}</p>
                  </div>
                </div>
                <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="rounded-md p-1 text-muted-foreground hover:bg-accent">
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-3 text-sm font-bold leading-snug">{sel.c.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {locationById(sel.c.locationId).name} · {formatDate(sel.c.createdAt)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusBadge status={sel.c.status} />
                <PriorityBadge priority={sel.c.priority} />
              </div>
              <button
                type="button"
                onClick={() => openComplaint(sel.c.id)}
                className="mt-3 w-full rounded-xl bg-primary/12 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
              >
                View full details
              </button>
            </div>
          </div>
        )}

        {/* controls */}
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5">
          {[
            { icon: Plus, label: "Zoom in", fn: () => setZoom((z) => Math.min(2.5, z + 0.5)) },
            { icon: Minus, label: "Zoom out", fn: () => { setZoom((z) => Math.max(1, z - 0.5)); if (zoom <= 1.5) setPan({ x: 0, y: 0 }); } },
            { icon: RotateCcw, label: "Reset view", fn: () => { setZoom(1); setPan({ x: 0, y: 0 }); } },
          ].map((b) => (
            <button key={b.label} type="button" aria-label={b.label} onClick={b.fn} className="grid size-9 place-items-center rounded-xl glass hover:border-primary/40">
              <b.icon className="size-4" />
            </button>
          ))}
        </div>

        {/* legend */}
        <div className="absolute left-4 top-4 z-20 rounded-2xl glass p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
            <Layers className="size-3.5" /> Legend
          </p>
          <div className="space-y-1.5">
            {(Object.keys(TONE) as MarkerTone[]).map((k) => (
              <div key={k} className="flex items-center gap-2 text-xs">
                <span className={cn("size-2.5 rounded-full", TONE[k].bg)} />
                <span className="flex-1">{TONE[k].label}</span>
                <span className="font-mono text-muted-foreground">{counts[k]}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[0.6rem] text-muted-foreground">Demo city map</p>
        </div>
      </div>
    </div>
  );
}
