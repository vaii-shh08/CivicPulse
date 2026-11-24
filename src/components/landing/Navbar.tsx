import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/civic/Logo";
import { ThemeToggle } from "@/components/civic/ThemeToggle";
import { Button } from "@/components/ui/button";

export const NAVIGATION = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Logo />
        <nav aria-label="Main navigation" className="hidden gap-8 lg:flex">
          {NAVIGATION.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="hero" className="hidden sm:inline-flex">
            <Link to="/register">
              Get Started <ArrowRight />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile navigation" className="border-t border-border bg-background px-5 py-5 lg:hidden animate-fade-up">
          <div className="mx-auto grid max-w-7xl gap-1">
            {NAVIGATION.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-accent hover:text-primary">
                {item.label}
              </a>
            ))}
            <div className="mt-3 flex gap-3">
              <Button asChild variant="glass" className="flex-1">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="hero" className="flex-1">
                <Link to="/register">
                  Get Started <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
