import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Dashboard" };

function KpiCard({
  label,
  value,
  sub,
  gold,
}: {
  label: string;
  value: string;
  sub: string;
  gold?: boolean;
}) {
  return (
    <div className="bg-white border border-black/[0.06] px-4 py-3.5">
      <div className="font-condensed text-[9px] font-bold tracking-[0.2em] uppercase text-slate mb-1">
        {label}
      </div>
      <div
        className={`font-display text-[34px] font-bold leading-none tracking-tight ${
          gold ? "text-gold" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] text-slate mt-1">{sub}</div>
    </div>
  );
}

const LADDER = [
  { n: 10, label: "Professional Prospect" },
  { n: 9, label: "High Level Div I Player" },
  { n: 8, label: "Mid Level Div I Player" },
  { n: 7, label: "Lower Level Div I Player" },
  { n: 6, label: "Div 2 / Div 3 College Player" },
  { n: 5, label: "Above Average HS Player" },
  { n: 4, label: "Average Varsity HS Player" },
  { n: 3, label: "Average JV HS Player" },
  { n: 2, label: "Below Avg JV HS Player" },
  { n: 1, label: "Below Avg JV HS Player" },
];

const CHECKLIST = [
  { title: "Complete Player Info", sub: "Name, position, height, weight, B/T" },
  { title: "Enter HS & Summer Stats", sub: "Batting or pitching from most recent season" },
  { title: "Complete Athletic Profile", sub: "60-yard dash, bat speed, vertical leap" },
  { title: "Enter Position Scores", sub: "Rate your skills 1-10 to generate overall score" },
  { title: "Set Academic Info", sub: "GPA, SAT/ACT, intended majors" },
  { title: "Run College Match Engine", sub: "Find programs aligned to your profile" },
  { title: "Generate AI Bio", sub: "Create your player narrative for coaches" },
  { title: "Send 5 Letters", sub: "Use the letter builder to contact programs" },
];

async function getUserName(): Promise<string> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return "Player";
  }
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.user_metadata?.full_name || "Player";
}

export default async function DashboardPage() {
  const name = await getUserName();

  return (
    <>
      <PageHeader
        eyebrow="RPM Recruit — Recruit · Profile · Match"
        title={`${name}'s Dashboard`}
        subtitle="Complete your profile below to generate your showcase evaluation and college match report."
        bgText="DASHBOARD"
      />
      <div className="px-8 py-6 pb-14">
        {/* Player Banner */}
        <div className="bg-ink border border-ink-2 grid grid-cols-[72px_1fr_auto] items-center gap-5 p-5 mb-5">
          <div className="w-[72px] h-[72px] bg-ink-2 border-[1.5px] border-gold flex items-center justify-center font-display text-[32px] font-bold text-gold">
            {name.charAt(0)}
          </div>
          <div>
            <div className="font-display text-[25px] font-bold text-bone leading-tight mb-1">
              {name}
            </div>
            <div className="flex gap-4 flex-wrap">
              <span className="text-[11px] text-slate">
                <strong className="text-slate-2 font-medium">Position</strong>
              </span>
              <span className="text-[11px] text-slate">
                HS: <strong className="text-slate-2 font-medium">--</strong>
              </span>
              <span className="text-[11px] text-slate">
                Grad: <strong className="text-slate-2 font-medium">--</strong>
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-[56px] font-bold text-gold leading-none tracking-tight">
              --
            </div>
            <div className="font-condensed text-[9px] font-bold tracking-[0.2em] uppercase text-slate">
              Overall Rating
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <KpiCard label="Showcase Rating" value="--" sub="Out of 10.0" gold />
          <KpiCard label="College Matches" value="32" sub="Run engine to filter" />
          <KpiCard label="Profile Complete" value="0%" sub="" />
          <KpiCard label="Letters Drafted" value="0" sub="Via letter builder" />
        </div>

        {/* Two-column: Ladder + Checklist */}
        <div className="grid grid-cols-2 gap-4">
          {/* Evaluation Ladder */}
          <div className="bg-white border border-black/[0.06] shadow-sm">
            <div className="flex items-start justify-between px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
              <div>
                <div className="font-display text-[17px] font-semibold text-ink">
                  Player Evaluation Ladder
                </div>
                <div className="text-[11px] text-slate mt-0.5">
                  All-American Showcase Rating Scale
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-col gap-px">
                {LADDER.map((level) => (
                  <div
                    key={level.n}
                    className="grid grid-cols-[28px_1fr] items-center gap-3 px-3 py-[7px] border-l-[3px] border-transparent"
                  >
                    <span className="font-display text-[21px] font-bold text-bone-3 text-center leading-none">
                      {level.n}
                    </span>
                    <span className="text-xs text-slate leading-snug">
                      {level.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Actions */}
          <div className="bg-white border border-black/[0.06] shadow-sm">
            <div className="flex items-start justify-between px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
              <div>
                <div className="font-display text-[17px] font-semibold text-ink">
                  Priority Actions
                </div>
                <div className="text-[11px] text-slate mt-0.5">
                  Steps to complete your recruiting profile
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              {CHECKLIST.map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-3 py-2.5 items-start ${
                    i < CHECKLIST.length - 1 ? "border-b border-bone" : ""
                  }`}
                >
                  <div className="w-[17px] h-[17px] flex-shrink-0 border-[1.5px] border-bone-3 mt-0.5 cursor-pointer" />
                  <div>
                    <strong className="text-[13px] text-ink font-semibold block">
                      {item.title}
                    </strong>
                    <span className="text-[11px] text-slate leading-relaxed">
                      {item.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
