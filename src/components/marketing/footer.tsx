import Link from "next/link";
import { LogoFull } from "@/components/ui/logo";

export function MarketingFooter() {
  return (
    <footer className="bg-ink border-t border-ink-3">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <LogoFull className="h-10 w-auto mb-3" />
            <p className="font-condensed text-[10px] font-semibold tracking-[0.2em] uppercase text-ink-4">
              Recruit &middot; Profile &middot; Match
            </p>
            <p className="text-xs text-slate mt-4 leading-relaxed">
              A product of Scanzano Baseball & All-American Baseball Talent
              Showcases.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-slate-2 mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate">
              <li>
                <Link href="/pricing" className="hover:text-gold transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-slate-2 mb-4">
              Features
            </h4>
            <ul className="space-y-2 text-sm text-slate">
              <li>College Match Engine</li>
              <li>AI Bio Generator</li>
              <li>Letter Builder</li>
              <li>Scouting Evaluations</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-slate-2 mb-4">
              Scanzano Baseball
            </h4>
            <address className="text-sm text-slate not-italic leading-relaxed">
              John Scanzano
              <br />
              5 Carnegie Way
              <br />
              Cherry Hill, NJ
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-condensed text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-4">
            Scanzano Baseball &middot; All-American Baseball Talent Showcases
          </p>
          <p className="text-xs text-ink-4">
            &copy; {new Date().getFullYear()} RPM Recruit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
