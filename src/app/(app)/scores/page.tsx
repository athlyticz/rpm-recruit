"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Tachometer } from "@/components/ui/tachometer";

/* ------------------------------------------------------------------ */
/*  Position definitions                                               */
/* ------------------------------------------------------------------ */

type Position =
  | "pitcher-rhp"
  | "pitcher-lhp"
  | "catcher"
  | "first-baseman"
  | "second-baseman"
  | "shortstop"
  | "third-baseman"
  | "outfielder";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "pitcher-rhp", label: "Pitcher (RHP)" },
  { value: "pitcher-lhp", label: "Pitcher (LHP)" },
  { value: "catcher", label: "Catcher" },
  { value: "first-baseman", label: "First Baseman" },
  { value: "second-baseman", label: "Second Baseman" },
  { value: "shortstop", label: "Shortstop" },
  { value: "third-baseman", label: "Third Baseman" },
  { value: "outfielder", label: "Outfielder" },
];

interface SkillGroup {
  heading: string;
  skills: string[];
}

interface ScaleItem {
  score: string;
  label: string;
}

interface PositionConfig {
  groups: SkillGroup[];
  scale?: { title: string; items: ScaleItem[] };
}

const PITCHER_CONFIG: PositionConfig = {
  groups: [
    {
      heading: "Velocity & Stuff",
      skills: [
        "Fastball Velocity",
        "Fastball Command",
        "Changeup Command",
        "Changeup Velocity",
        "Breaking Ball Command",
        "Breaking Ball Velocity",
      ],
    },
    {
      heading: "Command & Other",
      skills: ["Strikes/Walks", "PFP/Fielding"],
    },
  ],
  scale: {
    title: "Fastball MPH Scale",
    items: [
      { score: "1", label: "≤64" },
      { score: "2", label: "65-69" },
      { score: "3", label: "70-72" },
      { score: "4", label: "73-74" },
      { score: "5", label: "75-77" },
      { score: "6", label: "78-80" },
      { score: "7", label: "81-83" },
      { score: "8", label: "84-85" },
      { score: "9", label: "86-87" },
      { score: "10", label: "88-90+" },
    ],
  },
};

const CATCHER_CONFIG: PositionConfig = {
  groups: [
    {
      heading: "Offense",
      skills: ["Hitting", "Power", "Swing Quality/Approach", "Speed/Base Running"],
    },
    {
      heading: "Defense",
      skills: ["Blocking", "Receiving", "Pop Time", "Arm/Accuracy"],
    },
  ],
  scale: {
    title: "Pop Time Scale",
    items: [
      { score: "1", label: "2.70-2.79" },
      { score: "2", label: "2.60-2.69" },
      { score: "3", label: "2.50-2.59" },
      { score: "4", label: "2.40-2.49" },
      { score: "5", label: "2.30-2.39" },
      { score: "6", label: "2.20-2.29" },
      { score: "7", label: "2.10-2.19" },
      { score: "8", label: "2.01-2.10" },
      { score: "9", label: "1.91-2.00" },
      { score: "10", label: "≤1.90" },
    ],
  },
};

const FIRST_BASEMAN_CONFIG: PositionConfig = {
  groups: [
    {
      heading: "Offense",
      skills: ["Hitting", "Power", "Swing Quality", "Speed"],
    },
    {
      heading: "Defense",
      skills: ["Throwing", "Stretching/Footwork", "Picking/Scooping", "Fielding"],
    },
  ],
};

const INFIELDER_CONFIG: PositionConfig = {
  groups: [
    {
      heading: "Offense",
      skills: ["Hitting", "Power", "Swing Quality", "Speed"],
    },
    {
      heading: "Defense",
      skills: ["Throwing", "Arm Strength", "Charging/Fielding", "Pivot/Range"],
    },
  ],
};

const OUTFIELDER_CONFIG: PositionConfig = {
  groups: [
    {
      heading: "Offense",
      skills: ["Hitting", "Power", "Swing Quality", "Speed"],
    },
    {
      heading: "Defense",
      skills: ["Throwing", "Arm Strength", "Tracking/Routes"],
    },
  ],
};

function getConfig(pos: Position): PositionConfig {
  switch (pos) {
    case "pitcher-rhp":
    case "pitcher-lhp":
      return PITCHER_CONFIG;
    case "catcher":
      return CATCHER_CONFIG;
    case "first-baseman":
      return FIRST_BASEMAN_CONFIG;
    case "second-baseman":
    case "shortstop":
    case "third-baseman":
      return INFIELDER_CONFIG;
    case "outfielder":
      return OUTFIELDER_CONFIG;
  }
}

/* ------------------------------------------------------------------ */
/*  Rating bar helpers                                                 */
/* ------------------------------------------------------------------ */

function cellClasses(value: number, selected: boolean, isHighest: boolean): string {
  const base =
    "flex-1 min-w-0 sm:flex-none sm:w-7 h-11 sm:h-7 flex items-center justify-center cursor-pointer text-[10px] font-mono transition-all duration-100 select-none rounded-xs";

  if (!selected) {
    return `${base} bg-bone-2 border border-[#C4B89A] text-[10px]`;
  }

  let color: string;
  if (value <= 3) {
    color = "bg-blood-2 border-blood text-white/85";
  } else if (value <= 6) {
    color = "bg-gold border-[#9A7B42] text-ink";
  } else {
    color = "bg-green border-[#1E5C38] text-white";
  }

  const lift = isHighest ? "scale-y-[1.15] shadow-md z-10 relative" : "";

  return `${base} border ${color} ${lift}`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function RatingRow({
  skill,
  value,
  onChange,
}: {
  skill: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-1.5">
      <span className="sm:w-[116px] sm:shrink-0 flex items-baseline justify-between gap-2 text-[12px] font-medium text-ink-4 leading-tight">
        {skill}
        <span className="sm:hidden font-mono font-bold text-[12px]">
          {value > 0 ? value : "\u2014"}
        </span>
      </span>
      {/* Phone: the ten cells share the row width instead of overflowing it. */}
      <div className="flex gap-[2px] flex-1 min-w-0">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={cellClasses(n, n <= value, n === value)}
            onClick={() => onChange(n === value ? 0 : n)}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="hidden sm:block w-6 text-right text-[12px] font-mono font-bold text-ink-4">
        {value > 0 ? value : "\u2014"}
      </span>
    </div>
  );
}

function ScaleBox({ title, items }: { title: string; items: ScaleItem[] }) {
  return (
    <div className="bg-bone border border-black/[0.06] px-3.5 py-3">
      <div className="font-condensed text-[9px] font-bold tracking-[0.17em] uppercase text-ink-4 mb-2">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5 text-[11px] text-slate">
        {items.map((item, i) => (
          <span key={item.score}>
            <span className={i === items.length - 1 ? "font-bold" : ""}>
              {item.score}: {item.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ScoresPage() {
  const [position, setPosition] = useState<Position>("pitcher-rhp");
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({});

  const config = getConfig(position);

  // Build a unique key for the current position so ratings stay per-position
  const posKey = position;

  const posRatings = useMemo(() => ratings[posKey] ?? {}, [ratings, posKey]);

  const setSkillRating = (skill: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [posKey]: {
        ...(prev[posKey] ?? {}),
        [skill]: value,
      },
    }));
  };

  // Collect all skills for current position
  const allSkills = useMemo(
    () => config.groups.flatMap((g) => g.skills),
    [config]
  );

  // Calculate overall score
  const overallScore = useMemo(() => {
    const entered = allSkills
      .map((s) => posRatings[s] ?? 0)
      .filter((v) => v > 0);
    if (entered.length === 0) return 0;
    return Math.round((entered.reduce((a, b) => a + b, 0) / entered.length) * 10) / 10;
  }, [allSkills, posRatings]);

  return (
    <>
      <PageHeader
        eyebrow="Section 4"
        title="Position Scores"
        subtitle="Rate each skill 1-10. Overall score auto-calculates and updates your dashboard."
        bgText="SCORES"
      />

      {/* Position selector bar */}
      <div className="px-gutter lg:px-gutter-lg py-4 border-b border-black/[0.06] bg-white flex items-center gap-3">
        <label className="text-[12px] font-semibold text-ink-4 whitespace-nowrap">
          Evaluating Position
        </label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value as Position)}
          className="text-[13px] font-medium text-ink bg-bone border border-black/[0.08] rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold"
        >
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Evaluation form */}
      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14">
        {/* Skill group columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.groups.map((group) => (
            <div
              key={group.heading}
              className="bg-white border border-black/[0.06] shadow-sm p-5"
            >
              <h3 className="font-condensed text-[11px] font-bold tracking-[0.15em] uppercase text-ink-4 mb-3">
                {group.heading}
              </h3>
              <div className="space-y-0.5">
                {group.skills.map((skill) => (
                  <RatingRow
                    key={skill}
                    skill={skill}
                    value={posRatings[skill] ?? 0}
                    onChange={(v) => setSkillRating(skill, v)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Scale reference box */}
        {config.scale && (
          <div className="mt-6">
            <ScaleBox title={config.scale.title} items={config.scale.items} />
          </div>
        )}

        {/* Overall Showcase Score */}
        <div className="mt-6 bg-ink rounded p-5 flex items-center justify-between">
          <div>
            <div className="font-condensed text-[10px] font-bold tracking-[0.18em] uppercase text-gold mb-1">
              Overall Showcase Score
            </div>
            <div className="font-display text-[40px] font-bold text-bone leading-none">
              {overallScore > 0 ? overallScore.toFixed(1) : "—"}
            </div>
          </div>
          <Tachometer
            score={overallScore > 0 ? Math.round(overallScore) : 1}
            size="lg"
            animated
          />
        </div>
      </div>
    </>
  );
}
