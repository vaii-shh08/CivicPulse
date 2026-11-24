import { CATEGORY_DEPARTMENT } from "./data";
import type {
  CivicNotification,
  CivicState,
  Complaint,
  DemoUser,
  Department,
  NewComplaintInput,
  NotificationKind,
  Role,
  Status,
} from "./types";

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Complaint IDs look like CP-YYMM-1234 and keep counting up from the highest existing number. */
export function nextComplaintId(complaints: Complaint[], now: Date = new Date()): string {
  const max = complaints.reduce((m, c) => {
    const n = Number(c.id.split("-")[2]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `CP-${yy}${mm}-${max + 1}`;
}

function notify(
  state: CivicState,
  recipient: string,
  kind: NotificationKind,
  title: string,
  message: string,
  complaintId: string,
  at: string,
): CivicNotification[] {
  return [
    { id: uid("nt"), recipient, kind, title, message, complaintId, read: false, createdAt: at },
    ...state.notifications,
  ];
}

export function registerUser(
  state: CivicState,
  input: { name: string; email: string; password: string; role: Role; ward?: string; department?: string },
): { state: CivicState; user?: DemoUser; error?: string } {
  const email = input.email.trim().toLowerCase();
  if (state.users.some((u) => u.email.toLowerCase() === email)) {
    return { state, error: "An account with this email already exists." };
  }
  const user: DemoUser = {
    id: uid("u"),
    name: input.name.trim(),
    email,
    password: input.password,
    role: input.role,
    ward: input.ward,
    department: input.department,
    createdAt: new Date().toISOString(),
  };
  return { state: { ...state, users: [...state.users, user], sessionUserId: user.id }, user };
}

export function loginUser(
  state: CivicState,
  email: string,
  password: string,
  role: Role,
): { state: CivicState; user?: DemoUser; error?: string } {
  const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) return { state, error: "Incorrect email or password." };
  if (user.role !== role) {
    return {
      state,
      error: `This account is registered as a ${user.role === "citizen" ? "Citizen" : "Municipal Authority"}. Switch the role above.`,
    };
  }
  return { state: { ...state, sessionUserId: user.id }, user };
}

export function createComplaint(
  state: CivicState,
  input: NewComplaintInput,
  user: DemoUser,
  now: Date = new Date(),
): { state: CivicState; complaint: Complaint } {
  const at = now.toISOString();
  const complaint: Complaint = {
    ...input,
    id: nextComplaintId(state.complaints, now),
    status: "Submitted",
    createdAt: at,
    updatedAt: at,
    citizenId: user.id,
    citizenName: user.name,
    notes: [],
    timeline: [{ status: "Submitted", at, note: "Complaint received by CivicPulse.", by: user.name }],
  };
  let notifications = notify(state, user.id, "received", "Complaint received", `Your complaint ${complaint.id} has been received.`, complaint.id, at);
  notifications = notify(
    { ...state, notifications },
    "authority",
    "new",
    complaint.priority === "Critical" ? "Critical report" : "New complaint",
    `New ${complaint.category} report: “${complaint.title}” (${complaint.id}).`,
    complaint.id,
    at,
  );
  return { state: { ...state, complaints: [complaint, ...state.complaints], notifications }, complaint };
}

const statusMessages: Record<Status, { kind: NotificationKind; title: string; msg: (c: Complaint) => string }> = {
  Submitted: { kind: "received", title: "Complaint reopened", msg: (c) => `Your complaint ${c.id} was moved back to Submitted.` },
  "Under Review": { kind: "review", title: "Under review", msg: (c) => `Your complaint ${c.id} is now under review.` },
  Assigned: { kind: "assigned", title: "Complaint assigned", msg: (c) => `Your issue ${c.id} has been assigned to the ${c.department ?? CATEGORY_DEPARTMENT[c.category]} department.` },
  "In Progress": { kind: "progress", title: "Work in progress", msg: (c) => `A field team is working on ${c.id}.` },
  Resolved: { kind: "resolved", title: "Complaint resolved", msg: (c) => `Your complaint ${c.id} has been resolved.` },
};

export function updateComplaintStatus(
  state: CivicState,
  id: string,
  status: Status,
  actor: string,
  note?: string,
  now: Date = new Date(),
): CivicState {
  const current = state.complaints.find((c) => c.id === id);
  if (!current || current.status === status) return state;
  const at = now.toISOString();
  const department =
    status === "Assigned" || status === "In Progress" || status === "Resolved"
      ? (current.department ?? CATEGORY_DEPARTMENT[current.category])
      : current.department;
  const updated: Complaint = {
    ...current,
    status,
    department,
    updatedAt: at,
    timeline: [...current.timeline, { status, at, note: note || undefined, by: actor }],
    notes: note ? [...current.notes, { id: uid("n"), text: note, at, by: actor }] : current.notes,
  };
  const m = statusMessages[status];
  return {
    ...state,
    complaints: state.complaints.map((c) => (c.id === id ? updated : c)),
    notifications: notify(state, current.citizenId, m.kind, m.title, m.msg(updated), id, at),
  };
}

export function assignDepartment(
  state: CivicState,
  id: string,
  department: Department,
  actor: string,
  now: Date = new Date(),
): CivicState {
  const current = state.complaints.find((c) => c.id === id);
  if (!current) return state;
  const at = now.toISOString();
  const moveToAssigned = current.status === "Submitted" || current.status === "Under Review";
  const updated: Complaint = {
    ...current,
    department,
    status: moveToAssigned ? "Assigned" : current.status,
    updatedAt: at,
    timeline: moveToAssigned
      ? [...current.timeline, { status: "Assigned", at, note: `Assigned to ${department} department.`, by: actor }]
      : current.timeline,
  };
  return {
    ...state,
    complaints: state.complaints.map((c) => (c.id === id ? updated : c)),
    notifications: notify(
      state,
      current.citizenId,
      "assigned",
      "Complaint assigned",
      `Your issue ${id} has been assigned to the ${department} department.`,
      id,
      at,
    ),
  };
}

export function addResolutionNote(state: CivicState, id: string, text: string, actor: string, now: Date = new Date()): CivicState {
  const current = state.complaints.find((c) => c.id === id);
  if (!current || !text.trim()) return state;
  const at = now.toISOString();
  return {
    ...state,
    complaints: state.complaints.map((c) =>
      c.id === id ? { ...c, updatedAt: at, notes: [...c.notes, { id: uid("n"), text: text.trim(), at, by: actor }] } : c,
    ),
    notifications: notify(state, current.citizenId, "note", "New update from the city", `${actor} added a note to ${id}: “${text.trim()}”`, id, at),
  };
}
