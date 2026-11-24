import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full glass p-1 transition-colors hover:border-primary/40",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-7 rounded-full bg-brand shadow-[var(--shadow-glow)] transition-transform duration-300",
          dark ? "translate-x-0" : "translate-x-8",
        )}
      />
      <Moon className={cn("relative z-10 ml-1.5 size-4 transition-colors", dark ? "text-primary-foreground" : "text-muted-foreground")} />
      <Sun className={cn("relative z-10 ml-auto mr-1.5 size-4 transition-colors", dark ? "text-muted-foreground" : "text-primary-foreground")} />
    </button>
  );
}
