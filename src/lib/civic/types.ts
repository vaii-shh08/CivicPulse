export type Role = "citizen" | "authority";

export const CATEGORIES = [
  "Garbage",
  "Potholes",
  "Water Leakage",
  "Streetlight Failure",
  "Drainage",
  "Public Safety",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"] as const;
export type Status = (typeof STATUSES)[number];

export const DEPARTMENTS = [
  "Sanitation",
  "Roads & Infrastructure",
  "Water Supply",
  "Electrical",
  "Drainage & Sewerage",
  "Public Safety",
  "General Administration",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface CityLocation {
  id: string;
  name: string;
  area: string;
  /** Position on the demo city map, 0–100 */
  x: number;
  y: number;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  /** Demo-only: stored locally in the browser, never sent anywhere. */
  password: string;
  role: Role;
  phone?: string | undefined;
  ward?: string | undefined;
  department?: string | undefined;
  createdAt: string;
}

export interface TimelineEntry {
  status: Status;
  at: string;
  note?: string | undefined;
  by?: string | undefined;
}

export interface ResolutionNote {
  id: string;
  text: string;
  at: string;
  by: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: Category;
  description: string;
  imageUrl?: string | undefined;
  locationId: string;
  address?: string | undefined;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  citizenId: string;
  citizenName: string;
  department?: Department | undefined;
  notes: ResolutionNote[];
  timeline: TimelineEntry[];
  aiSummary?: string | undefined;
}

export type NotificationKind = "received" | "review" | "assigned" | "progress" | "resolved" | "note" | "new";

export interface CivicNotification {
  id: string;
  /** Citizen user id, or "authority" for the municipal inbox */
  recipient: string;
  kind: NotificationKind;
  title: string;
  message: string;
  complaintId: string;
  read: boolean;
  createdAt: string;
}

export interface CivicState {
  version: number;
  users: DemoUser[];
  sessionUserId: string | null;
  complaints: Complaint[];
  notifications: CivicNotification[];
}

export interface NewComplaintInput {
  title: string;
  category: Category;
  description: string;
  imageUrl?: string | undefined;
  locationId: string;
  address?: string | undefined;
  priority: Priority;
  aiSummary?: string | undefined;
}
