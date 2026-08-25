import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-ink border-b-2 border-gold">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 px-gutter lg:px-6 h-topbar">
        <Link href="/" className="pressable focusable flex items-center gap-3 min-h-touch min-w-0 shrink">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/pricing"
            className="pressable focusable min-h-touch inline-flex items-center font-condensed text-xs font-bold tracking-widest uppercase text-slate-2 hover:text-bone transition-colors dur-fast"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="pressable focusable min-h-touch inline-flex items-center font-condensed text-xs font-bold tracking-widest uppercase text-slate-2 hover:text-bone transition-colors dur-fast"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="pressable focusable min-h-touch inline-flex items-center font-condensed text-xs font-bold tracking-widest uppercase text-slate-2 hover:text-bone transition-colors dur-fast"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="pressable focusable hidden sm:inline-flex items-center min-h-touch whitespace-nowrap font-condensed text-xs font-bold tracking-widest uppercase text-slate-2 hover:text-gold px-4 border border-ink-3 rounded-sm transition-colors dur-fast"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="pressable focusable inline-flex items-center min-h-touch whitespace-nowrap font-condensed text-xs font-bold tracking-widest uppercase bg-gold text-ink px-4 rounded-sm hover:bg-gold-2 transition-colors dur-fast"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
