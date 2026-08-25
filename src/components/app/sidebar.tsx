"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./nav-config";

/**
 * Desktop and tablet navigation.
 *
 * Hidden entirely below md, where BottomNav takes over. Between md and xl it
 * collapses to an icon rail; at xl it opens to the full labelled rail.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="hidden md:flex bg-ink border-r border-ink-2 flex-col sticky top-topbar h-[calc(100dvh-var(--spacing-topbar))] overflow-y-auto overflow-x-hidden py-4 shrink-0 w-sidebar-rail xl:w-sidebar transition-[width] dur-base ease-settle"
    >
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-5">
          <div className="font-condensed text-[9px] font-bold tracking-[0.24em] uppercase text-ink-4 mb-1.5 px-0 xl:px-5 text-center xl:text-left">
            <span className="hidden xl:inline">{section.label}</span>
            <span
              aria-hidden
              className="inline-block xl:hidden h-px w-6 bg-ink-3 align-middle"
            />
          </div>

          {section.items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={`group relative flex items-center gap-3 border-l-2 min-h-touch transition-colors dur-fast ease-settle justify-center xl:justify-start px-0 xl:px-5 ${
                  active
                    ? "text-gold-3 border-redline bg-gold/[0.07] font-medium"
                    : "text-slate border-transparent hover:text-bone-2 hover:bg-white/[0.03]"
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={active ? "text-gold" : ""}
                  aria-hidden
                />
                <span className="hidden xl:inline text-[13px] leading-none">
                  {item.label}
                </span>

                {/* Collapsed-rail tooltip. */}
                <span className="xl:hidden pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-sm bg-ink-2 border border-ink-3 px-2 py-1 text-[11px] text-bone-2 opacity-0 shadow-md transition-opacity dur-fast group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      ))}

      <div className="mt-auto px-3.5 hidden xl:block">
        <div className="p-4 bg-ink-2 border border-ink-3 rounded-sm">
          <div className="font-condensed text-[9px] font-bold tracking-[0.2em] uppercase text-slate mb-2">
            Overall Rating
          </div>
          <div className="font-display text-[50px] font-bold text-gold leading-none tracking-tight">
            --
          </div>
          <p className="text-[11px] text-slate mt-1.5 leading-snug">
            Enter scores to generate rating
          </p>
          <div className="h-[3px] bg-ink-3 mt-2.5 rounded-pill overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blood to-gold w-0 transition-[width] dur-slow ease-needle" />
          </div>
        </div>
      </div>
    </nav>
  );
}
