import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-ink border-b-2 border-gold">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-14">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/pricing"
            className="font-condensed text-xs font-bold tracking-widest uppercase text-slate-2 hover:text-bone transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="font-condensed text-xs font-bold tracking-widest uppercase text-slate-2 hover:text-bone transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="font-condensed text-xs font-bold tracking-widest uppercase text-slate-2 hover:text-bone transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="font-condensed text-xs font-bold tracking-widest uppercase text-slate-2 hover:text-gold px-4 py-2 border border-ink-3 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="font-condensed text-xs font-bold tracking-widest uppercase bg-gold text-ink px-4 py-2 hover:bg-gold-2 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
