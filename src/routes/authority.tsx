import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BarChart3, ClipboardList, Cpu, KanbanSquare, LayoutDashboard, Radar, Settings } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/civic/DashboardShell";
import { RoleGuard } from "@/components/civic/RoleGuard";
import { useCivic } from "@/lib/civic/store";

export const Route = createFileRoute("/authority")({
  component: AuthorityLayout,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
});

function AuthorityLayout() {
  return <RoleGuard role="authority">{(user) => <AuthorityShell userId={user.id} />}</RoleGuard>;
}

function AuthorityShell({ userId }: { userId: string }) {
  const user = useCivic((s) => s.users.find((u) => u.id === userId)!);
  const openCount = useCivic((s) => s.complaints.filter((c) => c.status === "Submitted").length);
  const items: NavItem[] = [
    { to: "/authority", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/authority/complaints", label: "All Complaints", icon: ClipboardList, badge: openCount },
    { to: "/authority/manage", label: "Manage Issues", icon: KanbanSquare },
    { to: "/authority/monitoring", label: "City Monitoring", icon: Radar },
    { to: "/authority/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/authority/iot", label: "IoT Monitoring", icon: Cpu },
    { to: "/authority/settings", label: "Settings", icon: Settings },
  ];
  return (
    <DashboardShell user={user} items={items} recipient="authority" roleLabel={user.department ?? "Municipal Authority"}>
      <Outlet />
    </DashboardShell>
  );
}
