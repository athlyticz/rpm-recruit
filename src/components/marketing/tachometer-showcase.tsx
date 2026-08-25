"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Tachometer } from "@/components/ui/tachometer";

const DEMOS = [
  {
    score: 5,
    label: "Above Average HS Player",
    description:
      "Strong varsity contributor with solid fundamentals. Ready to explore D3 and competitive D2 programs.",
    delay: 0,
  },
  {
    score: 6.5,
    label: "Division II Prospect",
    description:
      "Standout player with measurable tools. College-ready with the right academic and athletic fit.",
    delay: 300,
  },
  {
    score: 8,
    label: "Division I Prospect",
    description:
      "Elite-level talent with D1 tools across the board. Pro pipeline potential with the right development.",
    delay: 600,
  },
] as const;

export function TachometerShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stagger the tachometers in sequence
  useEffect(() => {
    if (!visible) return;

    DEMOS.forEach((demo, i) => {
      const timer = setTimeout(() => setActiveIndex(i), demo.delay);
      return () => clearTimeout(timer);
    });
  }, [visible]);

  return (
    <section ref={sectionRef} className="bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-14">
          <div className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-3">
            RPM Rating
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-bone">
            See Where You Rank
          </h2>
          <p className="text-slate-2 mt-3 max-w-xl mx-auto">
            Every player gets rated on the 1&ndash;10 showcase scale. Your RPM
            score determines your division recommendation and college matches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {DEMOS.map((demo, i) => (
            <div
              key={demo.label}
              className={`flex flex-col items-center text-center transition-all duration-700 ${
                i <= activeIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="mb-4">
                {i <= activeIndex ? (
                  <Tachometer
                    score={demo.score}
                    size="card"
                    animated={true}
                    showLabel={true}
                  />
                ) : (
                  <div style={{ width: 280, height: 280 }} />
                )}
              </div>
              <h3 className="font-display text-xl font-bold text-bone mb-2">
                {demo.label}
              </h3>
              <p className="text-sm text-slate leading-relaxed mb-5 max-w-xs">
                {demo.description}
              </p>
              <Link
                href="/signup"
                className="pressable focusable min-h-touch inline-flex items-center justify-center font-condensed text-xs font-bold tracking-[0.13em] uppercase bg-gold text-ink px-5 py-2.5 hover:bg-gold-2 transition-colors dur-fast"
              >
                Get Your Score
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
