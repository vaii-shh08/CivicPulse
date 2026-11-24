import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, FilePlus2, LayoutDashboard, ListChecks, Map, UserRound } from "lucide-react";
import { AssistantWidget } from "@/components/civic/AssistantWidget";
import { DashboardShell, type NavItem } from "@/components/civic/DashboardShell";
import { RoleGuard } from "@/components/civic/RoleGuard";
import { useCivic } from "@/lib/civic/store";

export const Route = createFileRoute("/citizen")({
  component: CitizenLayout,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
});

function CitizenLayout() {
  return <RoleGuard role="citizen">{(user) => <CitizenShell userId={user.id} />}</RoleGuard>;
}

function CitizenShell({ userId }: { userId: string }) {
  const user = useCivic((s) => s.users.find((u) => u.id === userId)!);
  const unread = useCivic((s) => s.notifications.filter((n) => n.recipient === userId && !n.read).length);
  const items: NavItem[] = [
    { to: "/citizen", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/citizen/report", label: "Report an Issue", icon: FilePlus2 },
    { to: "/citizen/complaints", label: "My Complaints", icon: ListChecks },
    { to: "/citizen/map", label: "City Map", icon: Map },
    { to: "/citizen/notifications", label: "Notifications", icon: Bell, badge: unread },
    { to: "/citizen/profile", label: "Profile", icon: UserRound },
  ];
  return (
    <DashboardShell user={user} items={items} recipient={userId} notificationsHref="/citizen/notifications" roleLabel="Citizen" extra={<AssistantWidget />}>
      <Outlet />
    </DashboardShell>
  );
}
