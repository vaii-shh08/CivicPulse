import { BadgeCheck, ClipboardCheck, FileSearch, Inbox, MessageSquareText, Siren, Wrench, type LucideIcon } from "lucide-react";
import type { NotificationKind } from "@/lib/civic/types";

export const NOTIFICATION_ICON: Record<NotificationKind, LucideIcon> = {
  received: Inbox,
  review: FileSearch,
  assigned: ClipboardCheck,
  progress: Wrench,
  resolved: BadgeCheck,
  note: MessageSquareText,
  new: Siren,
};
