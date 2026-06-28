import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { LogoIcon } from "@/components/logo-icon";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();

  return (
    <header className="sticky top-0 z-40 bg-gradient-hero/80 backdrop-blur-md border-b border-white/10">
      <div className="px-4 sm:px-8 py-3 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <LogoIcon className="h-9 w-9 sm:hidden shrink-0" />
          <BrandLogo size="sm" variant="onPrimary" showWordmark className="hidden sm:flex" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === l.to
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-3"
          >
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md"
          >
            <Link to="/auth">Get started</Link>
          </Button>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white transition"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-gradient-hero/95 backdrop-blur-md px-4 pb-4 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === l.to
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="mt-1 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
