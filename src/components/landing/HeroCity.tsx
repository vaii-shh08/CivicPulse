import { CheckCheck, Radio, TrendingUp } from "lucide-react";
import { DemoTag } from "@/components/civic/meta";

const buildings = [
  { x: 116, y: 232, w: 42, h: 82 },
  { x: 177, y: 181, w: 48, h: 112 },
  { x: 240, y: 224, w: 38, h: 75 },
  { x: 294, y: 115, w: 54, h: 166 },
  { x: 367, y: 178, w: 43, h: 113 },
  { x: 431, y: 212, w: 47, h: 94 },
  { x: 212, y: 320, w: 46, h: 72 },
  { x: 304, y: 300, w: 52, h: 110 },
  { x: 394, y: 332, w: 42, h: 69 },
];

const stats = [
  { value: "248", label: "Issues Resolved", icon: CheckCheck, position: "left-0 top-10", delay: "0s", color: "text-success bg-success/10" },
  { value: "92%", label: "Resolution Rate", icon: TrendingUp, position: "right-0 top-36", delay: "-2s", color: "text-cyan bg-cyan/10" },
  { value: "36", label: "Active Reports", icon: Radio, position: "bottom-8 left-4", delay: "-4s", color: "text-violet bg-violet/10" },
];

export function HeroCity() {
  return (
    <div className="relative mx-auto w-full max-w-xl pb-10 pt-8 lg:py-12">
      <div className="absolute inset-8 rounded-full bg-cyan/10 blur-3xl" />
      <svg viewBox="0 0 600 480" role="img" aria-labelledby="city-title" className="relative w-full overflow-visible">
        <title id="city-title">A connected smart city with live issue markers</title>
        <defs>
          <linearGradient id="city-building" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--cyan)" stopOpacity=".3" />
            <stop offset="1" stopColor="var(--surface)" />
          </linearGradient>
          <linearGradient id="city-road">
            <stop stopColor="var(--cyan)" stopOpacity=".1" />
            <stop offset=".5" stopColor="var(--cyan)" stopOpacity=".8" />
            <stop offset="1" stopColor="var(--violet)" stopOpacity=".2" />
          </linearGradient>
        </defs>
        <ellipse cx="300" cy="333" rx="262" ry="117" fill="var(--cyan)" fillOpacity=".03" stroke="var(--cyan)" strokeOpacity=".18" />
        <ellipse cx="300" cy="333" rx="221" ry="92" fill="none" stroke="var(--cyan)" strokeOpacity=".14" strokeDasharray="3 8" className="animate-dash" />
        <path d="M45 330 300 205 560 330 302 455Z" fill="var(--surface)" fillOpacity=".7" stroke="var(--cyan)" strokeOpacity=".3" />
        <g fill="none" stroke="url(#city-road)" strokeWidth="2" strokeLinejoin="round">
          <path d="m78 345 238-116 214 104M133 376l238-116M205 409l239-116M109 298l237 116M180 264l237 116" />
          <path d="m78 345 238-116 214 104M133 376l238-116M205 409l239-116" stroke="var(--cyan)" strokeDasharray="5 18" className="animate-dash" />
          <path d="M109 298l237 116M180 264l237 116" stroke="var(--violet)" strokeDasharray="4 22" className="animate-dash" />
        </g>
        {buildings.map(({ x, y, w, h }, index) => (
          <g key={x + y}>
            <path d={`M${x} ${y}v${h}l${w} 17V${y + 17}Z`} fill="url(#city-building)" stroke="var(--cyan)" strokeOpacity=".5" />
            <path d={`m${x + w} ${y + 17} 18-10v${h}l-18 10Z`} fill="var(--surface)" stroke="var(--neon)" strokeOpacity=".5" />
            <path d={`m${x} ${y} 18-10 ${w} 17-18 10Z`} fill="var(--cyan)" fillOpacity=".18" stroke="var(--cyan)" strokeOpacity=".6" />
            {Array.from({ length: Math.floor(h / 20) }, (_, row) => (
              <path
                key={row}
                d={`m${x + 9} ${y + 19 + row * 18} 7 3m7 2 7 3`}
                stroke={index % 3 === 0 ? "var(--violet)" : "var(--cyan)"}
                strokeWidth="3"
                strokeOpacity={row % 2 ? ".35" : ".7"}
              />
            ))}
          </g>
        ))}
        <path d="M141 204 204 153 322 82 393 146 462 183" fill="none" stroke="var(--cyan)" strokeOpacity=".5" strokeDasharray="3 6" className="animate-dash" />
        {[
          { x: 141, y: 204, color: "var(--critical)" },
          { x: 322, y: 82, color: "var(--success)" },
          { x: 462, y: 183, color: "var(--warning)" },
          { x: 250, y: 300, color: "var(--cyan)" },
        ].map(({ x, y, color }) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <path d="M0 8v35" stroke={color} strokeDasharray="2 4" strokeOpacity=".6" />
            <circle r="9" fill={color} fillOpacity=".35" className="animate-pulse-ring" style={{ transformOrigin: "center", transformBox: "fill-box" }} />
            <circle r="9" fill="var(--background)" stroke={color} strokeWidth="1.5" />
            <circle r="3.5" fill={color} />
          </g>
        ))}
        <text x="300" y="475" textAnchor="middle" fill="var(--muted-foreground)" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="3">
          CONNECTED CITY · DEMO VISUALIZATION
        </text>
      </svg>

      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`glass absolute rounded-xl p-3 shadow-lg animate-float sm:p-4 ${stat.position}`}
          style={{ animationDelay: stat.delay }}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <stat.icon className={`size-7 rounded-lg p-1.5 ${stat.color}`} />
            <DemoTag>Demo stats</DemoTag>
          </div>
          <p className="font-mono text-2xl font-semibold tracking-tight">{stat.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
