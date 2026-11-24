import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Award, CheckCircle2, FileText, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/civic/DashboardShell";
import { formatDate } from "@/components/civic/meta";
import { inputCls } from "@/components/civic/AuthLayout";
import { Button } from "@/components/ui/button";
import { LOCATIONS } from "@/lib/civic/data";
import { civic, useCivic, useSession } from "@/lib/civic/store";

export const Route = createFileRoute("/citizen/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Profile – CivicPulse" }] }),
});

const wards = Array.from(new Set(LOCATIONS.map((l) => l.area))).sort((a, b) => Number(a.split(" ")[1]) - Number(b.split(" ")[1]));

function Profile() {
  const user = useSession()!;
  const mine = useCivic((s) => s.complaints.filter((c) => c.citizenId === user.id));
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [ward, setWard] = useState(user.ward ?? "Ward 4");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const resolved = mine.filter((c) => c.status === "Resolved").length;
  const points = mine.length * 10 + resolved * 15;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Name must be at least 2 characters.");
    if (phone && !/^[+\d\s-]{7,16}$/.test(phone)) return setError("Enter a valid phone number.");
    setError("");
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    civic.updateProfile({ name: name.trim(), phone: phone.trim(), ward });
    setSaving(false);
    toast.success("Profile updated");
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your personal details and see your civic impact." />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="panel relative overflow-hidden p-6 text-center">
          <div className="absolute inset-x-0 top-0 h-24 bg-brand opacity-25" />
          <div className="relative mx-auto mt-6 grid size-20 place-items-center rounded-full bg-brand text-3xl font-extrabold text-primary-foreground glow">{user.name.slice(0, 1)}</div>
          <p className="relative mt-4 text-lg font-bold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { icon: FileText, v: mine.length, l: "Reports" },
              { icon: CheckCircle2, v: resolved, l: "Resolved" },
              { icon: Award, v: points, l: "Civic pts" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-card/60 p-2.5">
                <s.icon className="mx-auto size-4 text-primary" />
                <p className="mt-1 font-mono text-lg font-semibold">{s.v}</p>
                <p className="text-[0.65rem] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-violet/30 bg-violet/10 p-3 text-left">
            <p className="text-xs font-bold text-violet">{points >= 100 ? "City Champion" : points >= 40 ? "Active Citizen" : "New Reporter"}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-violet" style={{ width: `${Math.min(100, (points / 150) * 100)}%` }} />
            </div>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">Demo gamification</p>
          </div>
        </div>
        <form onSubmit={save} className="panel space-y-4 p-6" noValidate>
          <h2 className="font-bold">Personal details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls()} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Email</span>
              <input value={user.email} disabled className={inputCls() + " opacity-60"} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 90000 00000" className={inputCls()} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Ward</span>
              <select value={ward} onChange={(e) => setWard(e.target.value)} className={inputCls()}>
                {wards.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" variant="hero" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />} Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
