import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CityMap } from "@/components/civic/CityMap";
import { PageHeader } from "@/components/civic/DashboardShell";
import { DemoTag } from "@/components/civic/meta";
import { useCivic, useSession } from "@/lib/civic/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/map")({
  component: CitizenMap,
  head: () => ({ meta: [{ title: "City Map – CivicPulse" }] }),
});

function CitizenMap() {
  const user = useSession()!;
  const all = useCivic((s) => s.complaints);
  const [scope, setScope] = useState<"city" | "mine">("city");
  const list = scope === "mine" ? all.filter((c) => c.citizenId === user.id) : all;
  return (
    <div>
      <PageHeader
        title="City Map"
        subtitle="See what's being reported around the city and how it's progressing."
        eyebrow={<DemoTag>Demo city</DemoTag>}
        actions={
          <div className="flex rounded-xl border border-border bg-card/50 p-1">
            {(["city", "mine"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setScope(s)} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold transition-all", scope === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {s === "city" ? "All city reports" : "My reports"}
              </button>
            ))}
          </div>
        }
      />
      <CityMap complaints={list} height="h-[600px]" />
    </div>
  );
}
