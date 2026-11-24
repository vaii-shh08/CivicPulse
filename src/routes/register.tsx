import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout, Field, RolePicker, inputCls } from "@/components/civic/AuthLayout";
import { Button } from "@/components/ui/button";
import { LOCATIONS } from "@/lib/civic/data";
import { civic, useSession } from "@/lib/civic/store";
import { DEPARTMENTS, type Role } from "@/lib/civic/types";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create your account – CivicPulse" },
      { name: "description", content: "Join CivicPulse as a citizen to report civic issues, or as a municipal authority to manage them." },
      { property: "og:title", content: "Create your account – CivicPulse" },
      { property: "og:description", content: "Join CivicPulse and help build cleaner, safer, smarter cities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const wards = Array.from(new Set(LOCATIONS.map((l) => l.area))).sort((a, b) => Number(a.split(" ")[1]) - Number(b.split(" ")[1]));

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function RegisterPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [role, setRole] = useState<Role>("citizen");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", ward: "Ward 4", department: "Sanitation" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session && !loading) navigate({ to: session.role === "citizen" ? "/citizen" : "/authority" });
  }, [session, loading, navigate]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const st = strength(form.password);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next["name"] = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next["email"] = "Enter a valid email address.";
    if (form.password.length < 6) next["password"] = "Use at least 6 characters.";
    if (form.confirm !== form.password) next["confirm"] = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const r = civic.register({
      name: form.name,
      email: form.email,
      password: form.password,
      role,
      ...(role === "citizen" ? { ward: form.ward } : { department: form.department }),
    });
    if (r.error) {
      setErrors({ email: r.error });
      setLoading(false);
      return;
    }
    toast.success(`Welcome to CivicPulse, ${form.name.split(" ")[0]}!`);
    navigate({ to: role === "citizen" ? "/citizen" : "/authority" });
  };

  return (
    <AuthLayout title="Create your account" subtitle="Choose how you'll use CivicPulse. It takes less than a minute.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <RolePicker role={role} onChange={setRole} />
        <Field label="Full name" htmlFor="name" error={errors["name"]}>
          <input id="name" autoComplete="name" value={form.name} onChange={set("name")} placeholder="Ananya Verma" className={inputCls(errors["name"])} />
        </Field>
        <Field label={role === "citizen" ? "Email" : "Official email"} htmlFor="email" error={errors["email"]}>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} placeholder={role === "citizen" ? "you@example.com" : "name@city.gov"} className={inputCls(errors["email"])} />
        </Field>
        {role === "citizen" ? (
          <Field label="Your ward" htmlFor="ward">
            <select id="ward" value={form.ward} onChange={set("ward")} className={inputCls()}>
              {wards.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Department" htmlFor="department">
            <select id="department" value={form.department} onChange={set("department")} className={inputCls()}>
              <option>Municipal Command Center</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" error={errors["password"]}>
            <div className="relative">
              <input id="password" type={show ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="••••••••" className={inputCls(errors["password"]) + " pr-11"} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm password" htmlFor="confirm" error={errors["confirm"]}>
            <input id="confirm" type={show ? "text" : "password"} autoComplete="new-password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" className={inputCls(errors["confirm"])} />
          </Field>
        </div>
        {form.password && (
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={"h-1 flex-1 rounded-full transition-colors " + (i < st ? (st <= 1 ? "bg-critical" : st === 2 ? "bg-warning" : "bg-success") : "bg-muted")} />
            ))}
            <span className="w-14 text-right text-xs text-muted-foreground">{["Weak", "Weak", "Fair", "Good", "Strong"][st]}</span>
          </div>
        )}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <UserPlus />} {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Demo prototype: your account is saved only in this browser.</p>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
