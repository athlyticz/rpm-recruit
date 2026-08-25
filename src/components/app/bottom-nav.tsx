"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { PRIMARY_TABS, SECONDARY_ITEMS } from "./nav-config";

/**
 * Phone navigation. Four primary destinations plus a More sheet holding the
 * rest, so every screen stays one tap away without a hamburger.
 *
 * The active tab lights the tachometer redline, so navigation reads as part
 * of the same instrument as the gauge.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the sheet on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const secondaryActive = SECONDARY_ITEMS.some((item) => item.href === pathname);

  return (
    <>
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/70 animate-fade cursor-default"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="More destinations"
            className="relative bg-ink border-t-2 border-gold rounded-t-xl px-4 pt-4 pb-safe animate-rise"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold">
                All Sections
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="pressable focusable flex items-center justify-center size-touch -mr-2 text-slate-2 hover:text-bone"
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pb-4">
              {SECONDARY_ITEMS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`pressable focusable flex items-center gap-2.5 px-3 min-h-touch rounded-sm border transition-colors dur-fast ${
                      active
                        ? "border-redline bg-redline/10 text-gold-3"
                        : "border-ink-3 text-slate-2 active:bg-white/5"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.75} aria-hidden />
                    <span className="text-body leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink border-t border-ink-3 shadow-tabbar pb-safe"
      >
        <div className="grid grid-cols-5 h-tabbar">
          {PRIMARY_TABS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="pressable focusable relative flex flex-col items-center justify-center gap-1 min-h-touch"
              >
                <span
                  aria-hidden
                  className={`absolute top-0 h-[2px] w-8 rounded-pill transition-all dur-base ease-needle ${
                    active ? "bg-redline shadow-redline opacity-100" : "opacity-0"
                  }`}
                />
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={`transition-colors dur-fast ${
                    active ? "text-redline-2" : "text-slate"
                  }`}
                  aria-hidden
                />
                <span
                  className={`font-condensed text-micro font-bold tracking-[0.12em] uppercase leading-none transition-colors dur-fast ${
                    active ? "text-bone" : "text-slate"
                  }`}
                >
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="More destinations"
            className="pressable focusable relative flex flex-col items-center justify-center gap-1 min-h-touch"
          >
            <span
              aria-hidden
              className={`absolute top-0 h-[2px] w-8 rounded-pill transition-all dur-base ease-needle ${
                secondaryActive || menuOpen
                  ? "bg-redline shadow-redline opacity-100"
                  : "opacity-0"
              }`}
            />
            <MoreHorizontal
              size={20}
              strokeWidth={secondaryActive || menuOpen ? 2.25 : 1.75}
              className={`transition-colors dur-fast ${
                secondaryActive || menuOpen ? "text-redline-2" : "text-slate"
              }`}
              aria-hidden
            />
            <span
              className={`font-condensed text-micro font-bold tracking-[0.12em] uppercase leading-none transition-colors dur-fast ${
                secondaryActive || menuOpen ? "text-bone" : "text-slate"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
