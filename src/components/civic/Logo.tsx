import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="cp-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="0.6" stopColor="var(--neon)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#cp-logo)" opacity="0.14" />
      <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="url(#cp-logo)" strokeOpacity="0.6" />
      {/* skyline */}
      <path d="M9 29V19h4v10M15 29V13h5v16M22 29V17h4v12M28 29V21h4v8" fill="none" stroke="url(#cp-logo)" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
      {/* pulse */}
      <path d="M5 24h7l2.5-6 4 11 3.5-14 3 9h10" fill="none" stroke="url(#cp-logo)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, to = "/" }: { className?: string; to?: "/" | "/citizen" | "/authority" }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2.5 group", className)}>
      <LogoMark className="transition-transform duration-300 group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className="text-[1.05rem] font-extrabold tracking-tight">
          Civic<span className="text-gradient">Pulse</span>
        </span>
        <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Smarter Cities
        </span>
      </span>
    </Link>
  );
}
