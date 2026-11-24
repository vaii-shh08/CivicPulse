import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, LogIn, Wand2 } from "lucide-react";
import { AuthLayout, Field, RolePicker, inputCls } from "@/components/civic/AuthLayout";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNTS } from "@/lib/civic/data";
import { civic, useSession } from "@/lib/civic/store";
import type { Role } from "@/lib/civic/types";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in – CivicPulse" },
      { name: "description", content: "Sign in to CivicPulse as a citizen or municipal authority to report and manage civic issues." },
      { property: "og:title", content: "Sign in – CivicPulse" },
      { property: "og:description", content: "Access your CivicPulse citizen or authority dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [role, setRole] = useState<Role>("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session && !loading) navigate({ to: session.role === "citizen" ? "/citizen" : "/authority" });
  }, [session, loading, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const r = civic.login(email, password, role);
    if (r.error) {
      setErrors({ form: r.error });
      setLoading(false);
      return;
    }
    navigate({ to: role === "citizen" ? "/citizen" : "/authority" });
  };

  const fillDemo = () => {
    const acc = DEMO_ACCOUNTS[role];
    setEmail(acc.email);
    setPassword(acc.password);
    setErrors({});
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your CivicPulse dashboard.">
      <form onSubmit={submit} noValidate className="space-y-5">
        <RolePicker role={role} onChange={(r) => { setRole(r); setErrors({}); }} />
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls(errors.email)} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls(errors.password) + " pr-11"}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        {errors.form && (
          <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
            {errors.form}
          </div>
        )}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <LogIn />} {loading ? "Signing in…" : `Sign in as ${role === "citizen" ? "Citizen" : "Authority"}`}
        </Button>
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-xs">
              <p className="font-bold text-foreground">Demo {role === "citizen" ? "citizen" : "authority"} account</p>
              <p className="truncate font-mono text-muted-foreground">{DEMO_ACCOUNTS[role].email} · {DEMO_ACCOUNTS[role].password}</p>
            </div>
            <Button type="button" variant="soft" size="sm" onClick={fillDemo}>
              <Wand2 /> Fill
            </Button>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          New to CivicPulse?{" "}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
