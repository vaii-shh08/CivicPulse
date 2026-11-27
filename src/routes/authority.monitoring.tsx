import { createFileRoute } from "@tanstack/react-router";
import { CityMap } from "@/components/civic/CityMap";
import { PageHeader } from "@/components/civic/DashboardShell";
import { DemoTag } from "@/components/civic/meta";
import { useCivic } from "@/lib/civic/store";

export const Route = createFileRoute("/authority/monitoring")({
  component: () => <Monitoring />,
  head: () => ({ meta: [{ title: "City Monitoring – CivicPulse Authority" }] }),
});

function Monitoring() {
  const all = useCivic((s) => s.complaints);
  return (
    <div>
      <PageHeader title="City Monitoring" subtitle="Color-coded issue markers across every ward. Click a marker for details." eyebrow={<DemoTag>Demo city map</DemoTag>} />
      <CityMap complaints={all} height="h-[640px]" />
    </div>
  );
}
