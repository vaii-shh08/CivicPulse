import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Cpu,
  FileText,
  LocateFixed,
  MapPin,
  Network,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Logo } from "@/components/civic/Logo";
import { DemoTag } from "@/components/civic/meta";
import { HeroCity } from "@/components/landing/HeroCity";
import { NAVIGATION, Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { useCivic } from "@/lib/civic/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "CivicPulse – Report civic issues & track city fixes" },
      {
        name: "description",
        content: "CivicPulse connects citizens and municipal authorities: report civic issues, track real-time progress and build smarter cities.",
      },
      { property: "og:title", content: "CivicPulse – Report civic issues & track city fixes" },
      { property: "og:description", content: "Connect citizens and municipal authorities to build cleaner, safer, smarter cities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const features = [
  {
    icon: Sparkles,
    title: "AI-powered Issue Classification",
    description: "Describe it once — get category, priority and department suggestions.",
    detail: "CivicPulse Intelligence reads the description, suggests a category and priority, writes a short summary and flags possible duplicate reports nearby. Citizens stay in control before submitting.",
    label: "ASSISTED TRIAGE",
    preview: "“Live wires hanging near bus stop”",
    rows: [["Category", "Public Safety"], ["Priority", "Critical"], ["Department", "Public Safety"]],
  },
  {
    icon: Activity,
    title: "Smart Complaint Tracking",
    description: "Every report has a clear, visible next step.",
    detail: "Follow a transparent timeline from Submitted to Under Review, Assigned, In Progress and Resolved — with a notification at every change.",
    label: "REPORT TIMELINE",
    preview: "CP-2611-1024 · In Progress",
    rows: [["Submitted", "20 Nov, 08:30"], ["Assigned", "Sanitation"], ["In Progress", "Crew on site"]],
  },
  {
    icon: LocateFixed,
    title: "Location-based Reporting",
    description: "The right place, the right response team.",
    detail: "Drop a pin on the city map or pick a ward location so field teams know exactly where to go — and nearby duplicates are caught early.",
    label: "GEO-TAGGED",
    preview: "Central Market · Ward 4",
    rows: [["Ward", "4"], ["Nearby reports", "2 open"], ["Map layer", "Priority"]],
  },
  {
    icon: Building2,
    title: "Authority Dashboard",
    description: "One command center for city-wide action.",
    detail: "Municipal teams filter, prioritise, assign and resolve complaints from a single workspace, with resolution notes sent straight back to citizens.",
    label: "MUNICIPAL WORKSPACE",
    preview: "Review · Prioritise · Assign · Resolve",
    rows: [["Unresolved", "14"], ["Critical", "4"], ["Avg. response", "5h"]],
  },
  {
    icon: TrendingUp,
    title: "Civic Analytics",
    description: "Turn everyday reports into city insight.",
    detail: "Category distribution, monthly trends, priority mix and department performance — interactive charts that guide budget and staffing decisions.",
    label: "DATA-DRIVEN",
    preview: "Monthly complaint trends",
    rows: [["Top category", "Garbage"], ["Resolution rate", "64%"], ["Best dept.", "Electrical"]],
  },
  {
    icon: Radio,
    title: "IoT-enabled Monitoring",
    description: "Smart bins, leak sensors, air quality and streetlights.",
    detail: "A simulated sensor network shows how connected infrastructure could surface problems before anyone reports them. No physical devices are connected in this prototype.",
    label: "SIMULATED DEMO",
    preview: "Bin BIN-204 · 87% full",
    rows: [["Waste bins", "24 online"], ["Leak sensors", "1 alert"], ["AQI", "Moderate"]],
  },
];

const steps = [
  { icon: MapPin, title: "Identify a civic issue", description: "Spot a pothole, leak, dark street or overflowing bin." },
  { icon: FileText, title: "Submit with photo & location", description: "Add a photo and pin the place in under a minute." },
  { icon: Building2, title: "Authorities receive it", description: "Routed to the right department, prioritised by risk." },
  { icon: CircleCheck, title: "Track the resolution", description: "Get notified at every step until it's fixed." },
];

function LiveInsights() {
  const complaints = useCivic((s) => s.complaints);
  const resolved = complaints.filter((c) => c.status === "Resolved");
  const durations = resolved.flatMap((c) => {
    const last = c.timeline.at(-1);
    if (!last) return [];
    const h = (Date.parse(last.at) - Date.parse(c.createdAt)) / 3_600_000;
    return Number.isFinite(h) && h >= 0 ? [h] : [];
  });
  const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
  const total = complaints.length;
  const rate = total ? (resolved.length / total) * 100 : 0;

  const stats = [
    { label: "Total Reports", value: total.toLocaleString(), icon: FileText, color: "text-cyan bg-cyan/10", progress: 100, caption: "Community reports received" },
    { label: "Resolved Issues", value: resolved.length.toLocaleString(), icon: CircleCheck, color: "text-success bg-success/10", progress: rate, caption: `${Math.round(rate)}% of all reports` },
    { label: "Pending Complaints", value: (total - resolved.length).toLocaleString(), icon: Clock3, color: "text-warning bg-warning/10", progress: 100 - rate, caption: "Awaiting or under resolution" },
    { label: "Avg. Resolution Time", value: avg === null ? "—" : `${(avg / 24).toFixed(1)} days`, icon: TrendingUp, color: "text-violet bg-violet/10", progress: 72, caption: `Across ${durations.length} resolved issues` },
  ];

  return (
    <section aria-labelledby="insights-title" className="relative py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-70" />
            <span className="relative size-2.5 rounded-full bg-success" />
          </span>
          <h2 id="insights-title" className="text-xl font-bold tracking-tight">
            Live City Insights
          </h2>
        </div>
        <DemoTag>Live demo data</DemoTag>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <article key={s.label} className="panel panel-hover p-5 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between gap-3">
              <s.icon className={cn("size-10 rounded-xl p-2.5", s.color)} />
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground">CITY / LIVE</span>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-mono text-3xl font-semibold tracking-tight">{s.value}</p>
            <div aria-hidden="true" className="mb-3 mt-5 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${s.progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{s.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const [selected, setSelected] = useState(0);
  const active = features[selected] ?? features[0]!;
  return (
    <section id="features" className="scroll-mt-24 py-16">
      <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">Platform features</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything a smart city
            <br />
            needs to listen and act.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
          From the first report to the final fix, every module is connected. Select a feature to preview it.
        </p>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <button
              type="button"
              key={f.title}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              onMouseEnter={() => setSelected(i)}
              className={cn(
                "panel panel-hover group p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected === i && "ring-1 ring-primary/60",
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-xl bg-brand p-px">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-card">
                    <f.icon className="size-5 text-primary" />
                  </span>
                </span>
                <ChevronRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="text-sm font-bold">{f.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{f.description}</p>
              {i === 5 ? (
                <DemoTag className="mt-3">Simulated demo</DemoTag>
              ) : (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Preview <ArrowRight className="size-3" />
                </span>
              )}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="panel relative flex min-h-96 flex-col overflow-hidden p-6 sm:p-8">
          <div aria-hidden="true" className="mask-fade absolute inset-0 bg-grid opacity-60" />
          <div className="relative flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[0.18em] text-primary">PLATFORM PREVIEW</span>
            <DemoTag>Interactive demo</DemoTag>
          </div>
          <div key={active.title} className="relative my-8 flex flex-1 flex-col justify-center animate-fade-up">
            <div className="glass rounded-2xl p-5">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                  <active.icon className="size-5 text-primary" />
                </span>
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-muted-foreground">{active.label}</p>
                  <p className="mt-1 text-sm font-bold">{active.preview}</p>
                </div>
              </div>
              <div className="space-y-3">
                {active.rows.map(([k, v], idx) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground">0{idx + 1}</span>
                    <span className="flex-1 text-xs text-muted-foreground">{k}</span>
                    <span className="text-xs font-bold">{v}</span>
                    <Check className="size-3 text-success" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <h3 className="text-xl font-bold">{active.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{active.detail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-border bg-hero">
          <div aria-hidden="true" className="mask-fade pointer-events-none absolute inset-0 bg-grid" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-5 px-5 pb-8 pt-12 md:pt-16 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-12">
            <div className="animate-fade-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-[10px] font-bold tracking-widest text-primary sm:text-xs">
                <span className="size-1.5 rounded-full bg-success" />
                SMARTER CITIES, BETTER LIVING
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight md:text-5xl lg:text-[3.6rem]">
                Your City.
                <br />
                Your Voice.
                <br />
                <span className="text-gradient">Your Impact.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">
                Report civic issues, track real-time progress, and help build cleaner, safer and smarter communities.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/login">
                    Report an Issue <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <a href="#features">
                    Explore CivicPulse <ArrowDown />
                  </a>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                AI-assisted triage · Real-time tracking · 12 wards connected
                <DemoTag>Demo</DemoTag>
              </div>
            </div>
            <HeroCity />
          </div>
          <div className="relative border-t border-border bg-surface/40">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:justify-between">
              <span className="flex items-center gap-2"><Users className="size-4 text-primary" /> Citizen-first by design</span>
              <span className="flex items-center gap-2"><Network className="size-4 text-primary" /> Connected departments</span>
              <span className="flex items-center gap-2"><ScanLine className="size-4 text-primary" /> Transparent progress</span>
              <span className="flex items-center gap-2"><Cpu className="size-4 text-primary" /> Smart city ready</span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <LiveInsights />

          <section id="how-it-works" className="scroll-mt-24 border-b border-border py-16">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">How it works</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">From report to resolved in four steps.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">See it. Report it. Follow it. Be part of the fix.</p>
            </div>
            <ol className="relative grid gap-7 md:grid-cols-4 md:gap-6">
              <div aria-hidden="true" className="absolute bottom-8 left-6 top-5 w-px bg-brand opacity-50 md:bottom-auto md:left-[12%] md:right-[12%] md:top-6 md:h-px md:w-auto" />
              {steps.map((step, i) => (
                <li key={step.title} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
                  <div className="glow relative flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-background">
                    <step.icon className="size-5 text-primary" />
                    <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-brand font-mono text-[10px] font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="mt-1 text-sm font-bold">{step.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Features />

          <section id="about" className="scroll-mt-24 border-t border-border py-16">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.5fr]">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">About CivicPulse</p>
                <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                  Better living starts with better connections.
                </h2>
                <p className="mt-5 text-sm leading-7 text-muted-foreground">
                  CivicPulse bridges the gap between citizens and municipal authorities. We make everyday issues visible, progress transparent and participation
                  simple — so communities can build cleaner, safer, smarter cities together.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Users, title: "For Citizens", subtitle: "Your neighbourhood. Your say.", bullets: ["Report issues with photos and locations", "Follow every complaint on a live timeline", "Get notified the moment things change"] },
                  { icon: Building2, title: "For Municipal Authorities", subtitle: "A clearer path from report to fix.", bullets: ["Triage with AI-assisted priority and routing", "Assign departments and add resolution notes", "Monitor trends, sensors and performance"] },
                ].map((a) => (
                  <article key={a.title} className="panel panel-hover p-6">
                    <a.icon className="mb-5 size-10 rounded-xl bg-primary/10 p-2.5 text-primary" />
                    <h3 className="text-base font-bold">{a.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground">{a.subtitle}</p>
                    <ul className="mt-6 space-y-4">
                      {a.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs leading-6 text-muted-foreground">
                          <Check className="mt-1 size-4 shrink-0 text-success" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel glow relative mt-14 flex flex-col items-start justify-between gap-7 overflow-hidden bg-hero p-7 sm:p-10 md:flex-row md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary">
                  <Sparkles className="size-4" /> Your next small action matters
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to make your city better?</h2>
                <p className="mt-3 text-sm text-muted-foreground">Join as a citizen or sign in to the municipal command center.</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/register">
                    Get Started <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
            <div>
              <Logo />
              <p className="mt-3 text-xs text-muted-foreground">Smarter Cities, Better Living.</p>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-6 text-xs text-muted-foreground">
              {NAVIGATION.map((item) => (
                <a key={item.href} href={item.href} className="transition-colors hover:text-primary">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted-foreground">
            <p>© 2026 CivicPulse · Hackathon prototype · All figures are demo data</p>
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" /> All systems operational (simulated)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
