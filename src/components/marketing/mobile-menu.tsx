"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Sign In" },
];

/**
 * The marketing nav at phone width.
 *
 * Below md the header used to hide its nav entirely, which left /about and
 * /contact reachable only from the footer and Sign In reachable from nowhere:
 * the marketing surface was not fully navigable at 390px. This is the
 * disclosure that fixes it: a button in the header, a panel that drops from
 * under it, closed by the button, by choosing a link, or by navigating.
 *
 * It is a panel, not an overlay: it pushes nothing, traps nothing, and the
 * page behind it stays scrollable. Start Today stays in the header itself,
 * because the primary action must never be behind a menu.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navigation closes the panel, so it can never sit open over a new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="marketing-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="pressable focusable inline-flex items-center justify-center min-h-touch min-w-touch text-slate-2 hover:text-bone transition-colors dur-fast"
      >
        {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>

      {open && (
        <nav
          id="marketing-menu"
          aria-label="Site"
          className="absolute top-full inset-x-0 bg-ink border-b-2 border-gold shadow-lg"
        >
          <ul className="px-gutter py-2">
            {LINKS.map((link) => (
              <li key={link.href} className="border-b border-ink-3 last:border-0">
                <Link
                  href={link.href}
                  className="pressable focusable flex items-center min-h-touch font-condensed text-body font-bold tracking-[0.16em] uppercase text-slate-2 hover:text-gold transition-colors dur-fast"
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
