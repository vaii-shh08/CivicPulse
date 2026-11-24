import { createFileRoute } from "@tanstack/react-router";
import { NotificationCenter } from "@/components/civic/NotificationCenter";
import { useSession } from "@/lib/civic/store";

export const Route = createFileRoute("/citizen/notifications")({
  component: () => <CitizenNotifications />,
  head: () => ({ meta: [{ title: "Notifications – CivicPulse" }] }),
});

function CitizenNotifications() {
  const user = useSession()!;
  return <NotificationCenter recipient={user.id} />;
}
