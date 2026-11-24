/**
 * CivicPulse Intelligence — rule-based demonstration engine.
 * This is NOT real AI inference: it uses keyword scoring and simple heuristics so the
 * prototype works offline. Swap these functions for a model call (e.g. via a server function) later.
 */
import { CATEGORY_DEPARTMENT, locationById } from "./data";
import type { Category, Complaint, Department, Priority } from "./types";

const KEYWORDS: Record<Exclude<Category, "Other">, string[]> = {
  Garbage: ["garbage", "trash", "waste", "dump", "dumping", "bin", "litter", "rubbish", "debris", "smell", "stink", "plastic", "collection"],
  Potholes: ["pothole", "potholes", "road", "crater", "cave", "sunk", "asphalt", "tar", "bump", "crack", "uneven"],
  "Water Leakage": ["water", "leak", "leakage", "pipe", "pipeline", "burst", "tap", "pressure", "supply", "gushing"],
  "Streetlight Failure": ["streetlight", "street light", "light", "lamp", "dark", "bulb", "flicker", "flickering", "pole"],
  Drainage: ["drain", "drainage", "sewage", "sewer", "manhole", "clog", "clogged", "waterlogging", "overflow", "flood", "gutter"],
  "Public Safety": ["danger", "dangerous", "wire", "wires", "electric", "fire", "unsafe", "accident", "crime", "theft", "cattle", "harass", "chemical", "attack"],
};

export interface Classification {
  category: Category;
  confidence: number;
  matched: string[];
}

export function classifyText(text: string): Classification {
  const t = ` ${text.toLowerCase()} `;
  let best: Classification = { category: "Other", confidence: 0.35, matched: [] };
  let bestScore = 0;
  for (const [cat, words] of Object.entries(KEYWORDS) as [Category, string[]][]) {
    const matched = words.filter((w) => t.includes(w));
    const score = matched.reduce((s, w) => s + (w.length > 6 ? 1.5 : 1), 0);
    if (score > bestScore) {
      bestScore = score;
      best = { category: cat, confidence: Math.min(0.97, 0.55 + score * 0.12), matched };
    }
  }
  return best;
}

const URGENT = ["danger", "dangerous", "live wire", "accident", "injur", "fire", "burst", "collapse", "cave", "open manhole", "school", "children", "hospital", "night", "flood", "sewage"];
const SEVERE = ["days", "week", "overflow", "large", "deep", "major", "blocked", "entire", "multiple", "smell", "traffic"];

export interface PrioritySuggestion {
  priority: Priority;
  reasons: string[];
}

export function suggestPriority(text: string, category: Category): PrioritySuggestion {
  const t = text.toLowerCase();
  const reasons: string[] = [];
  let score = category === "Public Safety" ? 2 : category === "Drainage" || category === "Water Leakage" ? 1 : 0;
  if (category === "Public Safety") reasons.push("Public safety category");
  const urgent = URGENT.filter((w) => t.includes(w));
  const severe = SEVERE.filter((w) => t.includes(w));
  score += urgent.length * 1.5 + severe.length * 0.7;
  if (urgent.length) reasons.push(`Risk signals: ${urgent.slice(0, 3).join(", ")}`);
  if (severe.length) reasons.push(`Severity cues: ${severe.slice(0, 3).join(", ")}`);
  const priority: Priority = score >= 4 ? "Critical" : score >= 2.2 ? "High" : score >= 0.8 ? "Medium" : "Low";
  if (!reasons.length) reasons.push("No urgency signals detected");
  return { priority, reasons };
}

export function suggestDepartment(category: Category): Department {
  return CATEGORY_DEPARTMENT[category];
}

export function summarize(title: string, description: string, category: Category, locationId: string): string {
  const loc = locationById(locationId);
  const firstSentence = description.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
  const core = firstSentence.length > 110 ? `${firstSentence.slice(0, 107)}…` : firstSentence;
  return `${category} issue at ${loc.name} (${loc.area}): ${core || title}`;
}

/** Possible duplicates: open reports with the same category at the same or a nearby location. */
export function findDuplicates(all: Complaint[], category: Category, locationId: string, excludeId?: string): Complaint[] {
  const here = locationById(locationId);
  return all.filter((c) => {
    if (c.id === excludeId || c.status === "Resolved" || c.category !== category) return false;
    const there = locationById(c.locationId);
    const dist = Math.hypot(here.x - there.x, here.y - there.y);
    return c.locationId === locationId || dist < 14;
  });
}

const INTENTS: { match: RegExp; answer: string }[] = [
  {
    match: /pothole|report.*(issue|problem)|how.*report|submit/i,
    answer:
      "To report an issue (like a pothole):\n1. Open **Report an Issue** in the sidebar.\n2. Pick the category, add a title and short description.\n3. Upload a photo and choose the location on the map.\n4. Review the AI suggestions for priority, then press **Submit Complaint**.\nYou'll get a complaint ID like CP-2611-1024 right away.",
  },
  {
    match: /track|status of|where.*complaint|my complaint|progress/i,
    answer:
      "Open **My Complaints** to see every report you've filed. Click any card to open its detailed view with a live progress timeline — Submitted → Under Review → Assigned → In Progress → Resolved. You'll also get a notification each time the status changes.",
  },
  {
    match: /under review/i,
    answer:
      "**Under Review** means the municipal command center has received your report and is verifying the details (photo, location, duplicates) before assigning it to a department.",
  },
  {
    match: /assigned|department/i,
    answer:
      "**Assigned** means your complaint has been routed to the responsible department — for example Sanitation for garbage, Roads & Infrastructure for potholes, or Electrical for streetlights.",
  },
  {
    match: /in progress/i,
    answer: "**In Progress** means a field team is actively working on the issue at the location.",
  },
  {
    match: /resolv|how long|time/i,
    answer:
      "Most issues are resolved within 2–4 days in this demo city. Critical safety issues are prioritized first. Once resolved you'll see the authority's resolution notes in the complaint timeline.",
  },
  {
    match: /priority|urgent|critical/i,
    answer:
      "Priority is suggested by CivicPulse Intelligence based on risk words in your description (e.g. 'live wire', 'children', 'flooding'). You can always change it before submitting.",
  },
  {
    match: /photo|image|picture/i,
    answer: "Photos help authorities verify faster. On the report form, click the upload area or drag an image in — you'll see a preview before submitting.",
  },
  {
    match: /\b(hi|hello|hey|namaste)\b/i,
    answer: "Hi! I'm the CivicPulse Assistant. Ask me how to report an issue, track a complaint, or what a status means.",
  },
];

export function assistantReply(message: string): string {
  const hit = INTENTS.find((i) => i.match.test(message));
  if (hit) return hit.answer;
  const cls = classifyText(message);
  if (cls.matched.length) {
    return `That sounds like a **${cls.category}** issue, handled by the ${suggestDepartment(cls.category)} department. You can report it from **Report an Issue** — I'll pre-check the category and priority for you.`;
  }
  return "I can help with reporting issues, tracking complaints and explaining statuses. Try: “How do I report a pothole?” or “What does Under Review mean?”";
}
