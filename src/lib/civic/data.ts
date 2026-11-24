import type {
  Category,
  CityLocation,
  CivicNotification,
  CivicState,
  Complaint,
  DemoUser,
  Department,
  Priority,
  Status,
  TimelineEntry,
} from "./types";
import { STATUSES } from "./types";

export const LOCATIONS: CityLocation[] = [
  { id: "central-market", name: "Central Market", area: "Ward 4", x: 48, y: 46 },
  { id: "riverside", name: "Riverside Promenade", area: "Ward 2", x: 22, y: 62 },
  { id: "tech-park", name: "Tech Park Avenue", area: "Ward 9", x: 78, y: 24 },
  { id: "old-town", name: "Old Town Square", area: "Ward 1", x: 34, y: 30 },
  { id: "harbor-front", name: "Harbor Front", area: "Ward 3", x: 14, y: 84 },
  { id: "green-valley", name: "Green Valley", area: "Ward 7", x: 70, y: 72 },
  { id: "station-road", name: "Station Road", area: "Ward 5", x: 58, y: 60 },
  { id: "university", name: "University Circle", area: "Ward 8", x: 86, y: 52 },
  { id: "lakeview", name: "Lakeview Colony", area: "Ward 6", x: 30, y: 12 },
  { id: "industrial", name: "Industrial Zone", area: "Ward 10", x: 88, y: 86 },
  { id: "sunrise", name: "Sunrise Layout", area: "Ward 11", x: 54, y: 86 },
  { id: "civic-center", name: "Civic Center", area: "Ward 4", x: 62, y: 38 },
];

export const locationById = (id: string) => LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0]!;

export const CATEGORY_DEPARTMENT: Record<Category, Department> = {
  Garbage: "Sanitation",
  Potholes: "Roads & Infrastructure",
  "Water Leakage": "Water Supply",
  "Streetlight Failure": "Electrical",
  Drainage: "Drainage & Sewerage",
  "Public Safety": "Public Safety",
  Other: "General Administration",
};

export const DEMO_CITIZEN_ID = "u-citizen-demo";
export const DEMO_AUTHORITY_ID = "u-authority-demo";

export const DEMO_ACCOUNTS = {
  citizen: { email: "citizen@civicpulse.demo", password: "citizen123" },
  authority: { email: "authority@civicpulse.demo", password: "authority123" },
} as const;

const users: DemoUser[] = [
  {
    id: DEMO_CITIZEN_ID,
    name: "Aarav Sharma",
    email: DEMO_ACCOUNTS.citizen.email,
    password: DEMO_ACCOUNTS.citizen.password,
    role: "citizen",
    phone: "+91 98765 43210",
    ward: "Ward 4",
    createdAt: "2026-05-02T09:00:00.000Z",
  },
  {
    id: DEMO_AUTHORITY_ID,
    name: "Meera Iyer",
    email: DEMO_ACCOUNTS.authority.email,
    password: DEMO_ACCOUNTS.authority.password,
    role: "authority",
    department: "Municipal Command Center",
    createdAt: "2026-01-10T09:00:00.000Z",
  },
];

const others = ["Priya Nair", "Rohan Gupta", "Fatima Khan", "Daniel Joseph", "Sneha Patil", "Vikram Rao"];

type Seed = [
  title: string,
  category: Category,
  description: string,
  locationId: string,
  priority: Priority,
  status: Status,
  createdAt: string,
  mine: boolean,
];

const seeds: Seed[] = [
  ["Overflowing garbage bins near market gate", "Garbage", "Bins at the east gate of Central Market have been overflowing for three days. Strong smell and stray animals around the area.", "central-market", "High", "In Progress", "2026-11-20T08:30:00.000Z", true],
  ["Deep pothole on Station Road junction", "Potholes", "A large pothole has formed right at the signal junction. Two-wheelers are swerving dangerously, especially at night.", "station-road", "Critical", "Assigned", "2026-11-18T17:10:00.000Z", true],
  ["Streetlights not working on Riverside walk", "Streetlight Failure", "About six streetlights along the riverside walking path are off. The stretch is completely dark after 7 PM.", "riverside", "Medium", "Resolved", "2026-11-02T19:45:00.000Z", true],
  ["Water pipeline leaking for two days", "Water Leakage", "Clean water is gushing from a broken pipeline near the Civic Center bus stop and flooding the footpath.", "civic-center", "High", "Under Review", "2026-11-22T06:20:00.000Z", true],
  ["Blocked storm drain causing waterlogging", "Drainage", "The storm drain outside Old Town Square is clogged with plastic waste. Rain water collects knee-deep.", "old-town", "High", "Submitted", "2026-11-23T11:05:00.000Z", true],
  ["Broken footpath tiles near school", "Other", "Several footpath tiles are loose and broken outside the primary school; children trip often.", "lakeview", "Low", "Resolved", "2026-10-14T10:00:00.000Z", true],
  ["Illegal dumping at Harbor Front", "Garbage", "Construction debris and household waste dumped along the harbor walkway overnight.", "harbor-front", "Medium", "In Progress", "2026-11-15T07:40:00.000Z", false],
  ["Exposed electrical wires on pole", "Public Safety", "Live wires are hanging low from a streetlight pole near the bus shelter. Very dangerous for pedestrians.", "tech-park", "Critical", "In Progress", "2026-11-21T13:15:00.000Z", false],
  ["Sewage overflow on main lane", "Drainage", "Sewage is overflowing from a manhole into the main lane of Green Valley; foul smell across the block.", "green-valley", "Critical", "Under Review", "2026-11-23T09:00:00.000Z", false],
  ["Multiple potholes on University Circle", "Potholes", "Stretch near the university gate has a series of potholes after last week's rain.", "university", "High", "Submitted", "2026-11-24T05:30:00.000Z", false],
  ["Streetlight flickering at Sunrise Layout", "Streetlight Failure", "Light pole #SL-118 keeps flickering all night.", "sunrise", "Low", "Assigned", "2026-11-12T20:10:00.000Z", false],
  ["Low water pressure in Lakeview", "Water Leakage", "Hidden leakage suspected; whole colony getting very low pressure in the mornings.", "lakeview", "Medium", "Resolved", "2026-09-28T06:00:00.000Z", false],
  ["Garbage not collected for a week", "Garbage", "Door-to-door collection has not happened in Sunrise Layout lane 3 for a week.", "sunrise", "High", "Resolved", "2026-10-05T08:00:00.000Z", false],
  ["Chemical smell near Industrial Zone drain", "Public Safety", "Strong chemical odour from the open drain behind the factories.", "industrial", "High", "Assigned", "2026-11-10T15:00:00.000Z", false],
  ["Road cave-in near Tech Park", "Potholes", "A section of the service road has sunk about a foot.", "tech-park", "Critical", "Resolved", "2026-08-19T12:00:00.000Z", false],
  ["Clogged drain after rain", "Drainage", "Drains in Riverside overflow after even light rain.", "riverside", "Medium", "Resolved", "2026-07-22T09:30:00.000Z", false],
  ["Broken bench in Civic Center park", "Other", "Bench near the fountain is broken with nails sticking out.", "civic-center", "Low", "Resolved", "2026-06-30T16:00:00.000Z", false],
  ["Streetlights off on Harbor Road", "Streetlight Failure", "Entire Harbor Road stretch dark for two nights.", "harbor-front", "High", "Resolved", "2026-09-09T19:00:00.000Z", false],
  ["Water main burst at Station Road", "Water Leakage", "Major burst flooding the underpass.", "station-road", "Critical", "Resolved", "2026-08-03T05:00:00.000Z", false],
  ["Stray cattle blocking traffic", "Public Safety", "Herd of cattle sitting in the middle of the market road during peak hours.", "central-market", "Medium", "Resolved", "2026-10-21T18:00:00.000Z", false],
  ["Overflowing community bin", "Garbage", "Community bin at University Circle overflowing every weekend.", "university", "Medium", "Resolved", "2026-07-11T10:00:00.000Z", false],
  ["Open manhole on Old Town lane", "Drainage", "Manhole cover missing near the temple lane.", "old-town", "Critical", "Resolved", "2026-06-14T08:00:00.000Z", false],
];

const addHours = (iso: string, h: number) => new Date(new Date(iso).getTime() + h * 3600_000).toISOString();

function buildTimeline(createdAt: string, status: Status, dept: Department): TimelineEntry[] {
  const reached = STATUSES.indexOf(status);
  const notes: Record<Status, string> = {
    Submitted: "Complaint received by CivicPulse.",
    "Under Review": "Verified by the municipal command center.",
    Assigned: `Assigned to ${dept} department.`,
    "In Progress": "Field team dispatched to the location.",
    Resolved: "Issue resolved and verified on site.",
  };
  return STATUSES.slice(0, reached + 1).map((s, i) => ({
    status: s,
    at: addHours(createdAt, [0, 5, 14, 30, 62][i]!),
    note: notes[s],
    by: i === 0 ? "Citizen" : "Municipal Authority",
  }));
}

export function buildSeedState(): CivicState {
  const complaints: Complaint[] = seeds.map((s, i) => {
    const [title, category, description, locationId, priority, status, createdAt, mine] = s;
    const dept = CATEGORY_DEPARTMENT[category];
    const timeline = buildTimeline(createdAt, status, dept);
    const reachedAssigned = STATUSES.indexOf(status) >= 2;
    return {
      id: `CP-${createdAt.slice(2, 4)}${createdAt.slice(5, 7)}-${String(1001 + i)}`,
      title,
      category,
      description,
      locationId,
      priority,
      status,
      createdAt,
      updatedAt: timeline[timeline.length - 1]!.at,
      citizenId: mine ? DEMO_CITIZEN_ID : `u-other-${i % others.length}`,
      citizenName: mine ? "Aarav Sharma" : others[i % others.length]!,
      department: reachedAssigned ? dept : undefined,
      notes:
        status === "Resolved"
          ? [{ id: `n-${i}`, text: "Work completed and site inspected by ward engineer.", at: timeline[timeline.length - 1]!.at, by: "Meera Iyer" }]
          : [],
      timeline,
    };
  });

  const mineSorted = complaints.filter((c) => c.citizenId === DEMO_CITIZEN_ID);
  const notifications: CivicNotification[] = [
    { id: "nt-1", recipient: DEMO_CITIZEN_ID, kind: "progress", title: "Work in progress", message: `Field team dispatched for ${mineSorted[0]!.id}.`, complaintId: mineSorted[0]!.id, read: false, createdAt: mineSorted[0]!.updatedAt },
    { id: "nt-2", recipient: DEMO_CITIZEN_ID, kind: "assigned", title: "Complaint assigned", message: `${mineSorted[1]!.id} has been assigned to the Roads & Infrastructure department.`, complaintId: mineSorted[1]!.id, read: false, createdAt: mineSorted[1]!.updatedAt },
    { id: "nt-3", recipient: DEMO_CITIZEN_ID, kind: "review", title: "Under review", message: `Your complaint ${mineSorted[3]!.id} is now under review.`, complaintId: mineSorted[3]!.id, read: true, createdAt: mineSorted[3]!.updatedAt },
    { id: "nt-4", recipient: DEMO_CITIZEN_ID, kind: "resolved", title: "Complaint resolved", message: `Your complaint ${mineSorted[2]!.id} has been resolved.`, complaintId: mineSorted[2]!.id, read: true, createdAt: mineSorted[2]!.updatedAt },
    { id: "nt-5", recipient: "authority", kind: "new", title: "New complaint", message: `New Potholes report at University Circle (${complaints[9]!.id}).`, complaintId: complaints[9]!.id, read: false, createdAt: complaints[9]!.createdAt },
    { id: "nt-6", recipient: "authority", kind: "new", title: "Critical report", message: `Sewage overflow reported at Green Valley (${complaints[8]!.id}).`, complaintId: complaints[8]!.id, read: false, createdAt: complaints[8]!.createdAt },
  ];

  return {
    version: 1,
    users,
    sessionUserId: null,
    complaints: complaints.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    notifications,
  };
}
