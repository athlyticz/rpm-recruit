import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(184,151,90,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(184,151,90,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Diamond pulse */}
      <div className="absolute w-[420px] h-[420px] border border-gold/[0.07] rotate-45 animate-pulse" />

      <div className="relative z-10 w-full max-w-[420px] px-7">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-6">
            <Image
              src="/full.png"
              alt="RPM Recruit"
              width={320}
              height={64}
              className="h-auto w-full max-w-[300px]"
              style={{
                filter: "drop-shadow(0 0 10px rgba(184,151,90,0.35))",
              }}
              priority
            />
          </Link>
          <span className="font-condensed text-xs font-semibold tracking-[0.2em] uppercase text-[#9A8E7A] mt-1.5">
            Recruit &middot; Profile &middot; Match
          </span>
        </div>

        {children}

        <div className="w-12 h-px bg-white/[0.08] mx-auto mt-8 mb-6" />
        <p className="font-condensed text-label font-semibold tracking-[0.18em] uppercase text-[#6A6054] text-center">
          Scanzano Baseball &middot; All-American Baseball Talent Showcases
        </p>
      </div>
    </div>
  );
}
