"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";

const NAV_SECTIONS = [
  {
    label: "Profile",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/profile", label: "Player Info" },
      { href: "/athletic", label: "Athletic Profile" },
      { href: "/academics", label: "Academics & NCAA" },
      { href: "/scores", label: "Position Scores" },
    ],
  },
  {
    label: "Recruiting",
    items: [
      { href: "/college-match", label: "College Match", dot: true },
      { href: "/letter-builder", label: "Letter Builder" },
      { href: "/cost-tracker", label: "Cost Tracker" },
      { href: "/checklist", label: "Checklist & Q&A" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/bio-generator", label: "Bio Draft Builder" },
      { href: "/pitch-log", label: "Pitching Log" },
    ],
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="bg-ink border-r border-ink-2 flex flex-col w-[236px] sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-5 shrink-0">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-6">
          <div className="font-condensed text-[9px] font-bold tracking-[0.24em] uppercase text-ink-3 px-5 mb-1.5">
            {section.label}
          </div>
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-5 py-2 text-[13px] border-l-2 transition-all relative select-none ${
                  active
                    ? "text-gold-3 border-gold bg-gold/[0.07] font-medium"
                    : "text-slate border-transparent hover:text-bone-2 hover:bg-white/[0.025]"
                }`}
              >
                {item.label}
                {"dot" in item && item.dot && (
                  <span className="absolute right-4 w-[5px] h-[5px] bg-gold rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Sidebar score card */}
      <div className="mt-auto mx-3.5 p-4 bg-ink-2 border border-ink-3">
        <div className="font-condensed text-[9px] font-bold tracking-[0.2em] uppercase text-slate mb-2">
          Overall Rating
        </div>
        <div className="font-display text-[50px] font-bold text-gold leading-none tracking-tight">
          --
        </div>
        <p className="text-[11px] text-slate mt-1.5 leading-snug">
          Enter scores to generate rating
        </p>
        <div className="h-[3px] bg-ink-3 mt-2.5">
          <div className="h-full bg-gradient-to-r from-blood to-gold w-0 transition-all duration-500" />
        </div>
      </div>
    </nav>
  );
}
