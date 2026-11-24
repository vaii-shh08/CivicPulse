import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  ImagePlus,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/civic/DashboardShell";
import { CityBase } from "@/components/civic/CityMap";
import { SimulatedAiTag } from "@/components/civic/AiInsights";
import { CATEGORY_ICON, PRIORITY_STYLE, PriorityBadge } from "@/components/civic/meta";
import { Button } from "@/components/ui/button";
import { classifyText, findDuplicates, suggestDepartment, suggestPriority, summarize } from "@/lib/civic/ai";
import { LOCATIONS, locationById } from "@/lib/civic/data";
import { civic, useCivic } from "@/lib/civic/store";
import { openComplaint } from "@/lib/civic/ui-store";
import { CATEGORIES, PRIORITIES, type Category, type Complaint, type Priority } from "@/lib/civic/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/report")({
  component: ReportIssue,
  head: () => ({ meta: [{ title: "Report an Issue – CivicPulse" }] }),
});

const STEPS = ["Issue details", "Photo & location", "Priority & review"];

/** Downscale photos so they fit comfortably in browser storage. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Not a valid image"));
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function ReportIssue() {
  const complaints = useCivic((s) => s.complaints);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [locationId, setLocationId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Complaint | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const text = `${title}. ${description}`;
  const ai = useMemo(() => {
    const cls = classifyText(text);
    const cat = category ?? cls.category;
    return { cls, pr: suggestPriority(text, cat), dept: suggestDepartment(cat) };
  }, [text, category]);
  const dupes = category && locationId ? findDuplicates(complaints, category, locationId) : [];

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "Please choose an image file (JPG, PNG, WEBP)." }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "Image must be smaller than 10 MB." }));
      return;
    }
    try {
      setImageUrl(await compressImage(file));
      setErrors(({ image: _omit, ...rest }) => rest);
    } catch {
      setErrors((e) => ({ ...e, image: "That image couldn't be loaded." }));
    }
  };

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (title.trim().length < 6) e["title"] = "Give the issue a short title (at least 6 characters).";
      if (!category) e["category"] = "Select a category.";
      if (description.trim().length < 15) e["description"] = "Describe the issue in a bit more detail (15+ characters).";
    }
    if (s === 1 && !locationId) e["location"] = "Pick the location of the issue on the map.";
    if (s === 2 && !priority) e["priority"] = "Choose a priority level.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step === 1 && !priority) setPriority(ai.pr.priority);
    setStep((s) => Math.min(2, s + 1));
  };

  const submit = async () => {
    if (!validate(0) || !validate(1) || !validate(2) || !category || !locationId || !priority) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    try {
      const c = civic.submitComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        imageUrl,
        locationId,
        address: address.trim() || undefined,
        priority,
        aiSummary: summarize(title, description, category, locationId),
      });
      setDone(c);
      toast.success("Complaint submitted", { description: `${c.id} is now with the municipal team.` });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(0);
    setTitle("");
    setCategory(null);
    setDescription("");
    setImageUrl(undefined);
    setLocationId(null);
    setAddress("");
    setPriority(null);
    setErrors({});
    setDone(null);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl py-6">
        <div className="panel relative overflow-hidden p-8 text-center animate-fade-up">
          <div className="absolute inset-0 bg-hero" />
          <div className="relative">
            <div className="relative mx-auto grid size-20 place-items-center">
              <span className="absolute inset-0 rounded-full bg-success/30 animate-pulse-ring" />
              <span className="relative grid size-20 place-items-center rounded-full bg-success/15 text-success ring-1 ring-success/40">
                <CheckCircle2 className="size-10" />
              </span>
            </div>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Complaint submitted!</h1>
            <p className="mt-2 text-sm text-muted-foreground">Thank you for helping your city. The municipal team has been notified.</p>
            <div className="mx-auto mt-6 flex max-w-xs items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/8 px-4 py-3">
              <div className="text-left">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Complaint ID</p>
                <p className="font-mono text-lg font-semibold text-primary">{done.id}</p>
              </div>
              <button
                type="button"
                aria-label="Copy complaint ID"
                onClick={() => {
                  void navigator.clipboard?.writeText(done.id);
                  toast.success("Complaint ID copied");
                }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Copy className="size-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-2 text-left text-sm">
              {[
                ["Category", done.category],
                ["Location", locationById(done.locationId).name],
                ["Priority", done.priority],
                ["Routed to", suggestDepartment(done.category)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-xl bg-card/50 px-3 py-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              <Button variant="hero" onClick={() => openComplaint(done.id)}>
                Track progress <ArrowRight />
              </Button>
              <Button asChild variant="glass">
                <Link to="/citizen/complaints">My complaints</Link>
              </Button>
              <Button variant="ghost" onClick={reset}>
                Report another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Report an Issue" subtitle="Three quick steps. Your report goes straight to the right department." />

      {/* stepper */}
      <ol className="mb-6 grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => (i < step ? setStep(i) : undefined)}
              className={cn("flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition-all", i === step ? "border-primary/50 bg-primary/8" : "border-border bg-card/30", i < step && "cursor-pointer hover:border-primary/30")}
            >
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold", i < step ? "bg-success text-primary-foreground" : i === step ? "bg-brand text-primary-foreground glow" : "bg-muted text-muted-foreground")}>
                {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="hidden text-sm font-bold sm:block">{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="panel p-5 sm:p-6">
          {step === 0 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <p className="mb-2 text-sm font-semibold">Category</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CATEGORIES.map((c) => {
                    const Icon = CATEGORY_ICON[c];
                    const active = category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        aria-pressed={active}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all",
                          active ? "border-primary/60 bg-primary/10 glow" : "border-border bg-card/40 hover:border-primary/30 hover:bg-accent/40",
                        )}
                      >
                        <span className={cn("grid size-10 place-items-center rounded-lg", active ? "bg-brand text-primary-foreground" : "bg-primary/10 text-primary")}>
                          <Icon className="size-5" />
                        </span>
                        <span className="text-xs font-bold leading-tight">{c}</span>
                      </button>
                    );
                  })}
                </div>
                {errors["category"] && <p className="mt-1.5 text-xs font-medium text-destructive">{errors["category"]}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-sm font-semibold">
                  Issue title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={90}
                  placeholder="e.g. Deep pothole near the bus stop"
                  className={cn("h-11 w-full rounded-xl border bg-background/50 px-3.5 text-sm outline-none focus:ring-2", errors["title"] ? "border-destructive/60 focus:ring-destructive/20" : "border-input focus:border-primary/50 focus:ring-primary/20")}
                />
                {errors["title"] && <p className="text-xs font-medium text-destructive">{errors["title"]}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="desc" className="text-sm font-semibold">
                    Description
                  </label>
                  <span className="font-mono text-xs text-muted-foreground">{description.length}/600</span>
                </div>
                <textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 600))}
                  rows={5}
                  placeholder="What's wrong, since when, and is anyone at risk?"
                  className={cn("w-full resize-none rounded-xl border bg-background/50 px-3.5 py-3 text-sm outline-none focus:ring-2", errors["description"] ? "border-destructive/60 focus:ring-destructive/20" : "border-input focus:border-primary/50 focus:ring-primary/20")}
                />
                {errors["description"] && <p className="text-xs font-medium text-destructive">{errors["description"]}</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <p className="mb-2 text-sm font-semibold">
                  Photo <span className="font-normal text-muted-foreground">(recommended)</span>
                </p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleFile(e.target.files?.[0])} />
                {imageUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-border">
                    <img src={imageUrl} alt="Preview of the reported issue" className="max-h-72 w-full object-cover" />
                    <div className="absolute right-3 top-3 flex gap-2">
                      <Button size="sm" variant="glass" onClick={() => fileRef.current?.click()}>
                        <ImagePlus /> Replace
                      </Button>
                      <Button size="sm" variant="glass" onClick={() => setImageUrl(undefined)} aria-label="Remove photo">
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      void handleFile(e.dataTransfer.files?.[0]);
                    }}
                    className={cn("flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 transition-all", dragOver ? "border-primary bg-primary/8" : "border-border bg-background/40 hover:border-primary/40")}
                  >
                    <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <ImagePlus className="size-6" />
                    </span>
                    <span className="text-sm font-bold">Click to upload or drag a photo here</span>
                    <span className="text-xs text-muted-foreground">JPG, PNG or WEBP · up to 10 MB</span>
                  </button>
                )}
                {errors["image"] && <p className="mt-1.5 text-xs font-medium text-destructive">{errors["image"]}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Location</p>
                  {locationId && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <MapPin className="size-3.5" /> {locationById(locationId).name}, {locationById(locationId).area}
                    </span>
                  )}
                </div>
                <div className={cn("relative h-72 overflow-hidden rounded-2xl border bg-grid", errors["location"] ? "border-destructive/60" : "border-border")}>
                  <CityBase />
                  {LOCATIONS.map((l) => {
                    const active = l.id === locationId;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLocationId(l.id)}
                        className="group absolute -translate-x-1/2 -translate-y-full"
                        style={{ left: `${l.x}%`, top: `${l.y}%` }}
                        aria-label={`Select ${l.name}`}
                        aria-pressed={active}
                      >
                        <span className={cn("flex flex-col items-center transition-transform", active ? "scale-110" : "group-hover:scale-110")}>
                          <span className={cn("whitespace-nowrap rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold transition-all", active ? "bg-primary text-primary-foreground" : "glass opacity-0 group-hover:opacity-100")}>{l.name}</span>
                          <MapPin className={cn("size-6 drop-shadow", active ? "fill-primary/30 text-primary" : "text-muted-foreground")} />
                        </span>
                      </button>
                    );
                  })}
                  <p className="absolute bottom-2 left-3 text-[0.65rem] text-muted-foreground">Demo city map · tap a pin to select</p>
                </div>
                {errors["location"] && <p className="mt-1.5 text-xs font-medium text-destructive">{errors["location"]}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {LOCATIONS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLocationId(l.id)}
                      className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold transition-all", l.id === locationId ? "border-primary/50 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:text-foreground")}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="address" className="text-sm font-semibold">
                  Landmark / address details <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Opposite the east gate, near the tea stall"
                  className="h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {step === 2 && category && locationId && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Priority level</p>
                  <button type="button" onClick={() => setPriority(ai.pr.priority)} className="flex items-center gap-1 text-xs font-semibold text-violet hover:underline">
                    <Wand2 className="size-3.5" /> Use suggestion ({ai.pr.priority})
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      aria-pressed={priority === p}
                      className={cn("relative rounded-xl border p-3 text-left transition-all", priority === p ? "border-primary/60 bg-primary/10 glow" : "border-border bg-card/40 hover:border-primary/30")}
                    >
                      <span className={cn("block size-2 rounded-full", PRIORITY_STYLE[p].marker)} />
                      <span className="mt-2 block text-sm font-bold">{p}</span>
                      <span className="block text-[0.7rem] text-muted-foreground">
                        {{ Low: "Minor inconvenience", Medium: "Needs attention", High: "Affects many people", Critical: "Immediate danger" }[p]}
                      </span>
                      {ai.pr.priority === p && <Sparkles className="absolute right-2 top-2 size-3.5 text-violet" />}
                    </button>
                  ))}
                </div>
                {errors["priority"] && <p className="mt-1.5 text-xs font-medium text-destructive">{errors["priority"]}</p>}
              </div>

              {dupes.length > 0 && (
                <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3.5">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                  <div className="text-sm">
                    <p className="font-bold text-warning">Possible duplicate reports nearby</p>
                    <p className="mt-0.5 text-muted-foreground">
                      {dupes.length} open {category} report{dupes.length > 1 ? "s" : ""} near {locationById(locationId).name}:{" "}
                      {dupes.slice(0, 3).map((d, i) => (
                        <span key={d.id}>
                          {i > 0 && ", "}
                          <button type="button" onClick={() => openComplaint(d.id)} className="font-mono font-semibold text-foreground underline-offset-2 hover:underline">
                            {d.id}
                          </button>
                        </span>
                      ))}
                      . You can still submit yours.
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <p className="mb-3 text-sm font-bold">Review</p>
                <div className="flex gap-4">
                  {imageUrl && <img src={imageUrl} alt="" className="size-20 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1 space-y-1 text-sm">
                    <p className="font-bold">{title}</p>
                    <p className="line-clamp-2 text-muted-foreground">{description}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">{category}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {locationById(locationId).name}
                      </span>
                      {priority && <PriorityBadge priority={priority} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
              <ArrowLeft /> Back
            </Button>
            {step < 2 ? (
              <Button variant="hero" onClick={next}>
                Continue <ArrowRight />
              </Button>
            ) : (
              <Button variant="hero" size="lg" onClick={() => void submit()} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" /> : <Send />} {submitting ? "Submitting…" : "Submit Complaint"}
              </Button>
            )}
          </div>
        </div>

        {/* AI panel */}
        <aside className="space-y-4">
          <div className="panel relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-violet/25 blur-3xl" />
            <div className="relative">
              <p className="flex items-center gap-2 text-sm font-bold">
                <Bot className="size-4 text-violet" /> CivicPulse Intelligence
              </p>
              <div className="mt-1.5">
                <SimulatedAiTag />
              </div>
              {description.trim().length < 8 && title.trim().length < 6 ? (
                <p className="mt-4 text-sm text-muted-foreground">Start typing a title and description — suggestions for category, priority and department will appear here live.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-card/60 p-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Detected category</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-bold">{ai.cls.category}</p>
                      <span className="font-mono text-xs text-muted-foreground">{Math.round(ai.cls.confidence * 100)}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-violet transition-all" style={{ width: `${ai.cls.confidence * 100}%` }} />
                    </div>
                    {category !== ai.cls.category && ai.cls.matched.length > 0 && (
                      <button type="button" onClick={() => setCategory(ai.cls.category)} className="mt-2 text-xs font-semibold text-violet hover:underline">
                        Apply “{ai.cls.category}”
                      </button>
                    )}
                  </div>
                  <div className="rounded-xl bg-card/60 p-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Suggested priority</p>
                    <div className="mt-1.5">
                      <PriorityBadge priority={ai.pr.priority} />
                    </div>
                    <ul className="mt-2 space-y-0.5">
                      {ai.pr.reasons.map((r) => (
                        <li key={r} className="text-xs text-muted-foreground">
                          • {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-card/60 p-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Routed to</p>
                    <p className="mt-1 text-sm font-bold">{ai.dept} department</p>
                  </div>
                  {locationId && (
                    <div className="rounded-xl bg-card/60 p-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Auto summary</p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/90">{summarize(title, description, category ?? ai.cls.category, locationId)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
