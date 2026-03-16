"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";

/* ── data ──────────────────────────────────────────────────────── */

interface College {
  name: string;
  division: string;
  state: string;
  satRange: string;
  acceptRate: string;
  enrollment: string;
  netCost: string;
  fitScore: number;
  description: string;
}

const COLLEGES: College[] = [
  {
    name: "UNC Chapel Hill",
    division: "D1",
    state: "NC",
    satRange: "1360–1520",
    acceptRate: "18.74%",
    enrollment: "31,000",
    netCost: "$11,000",
    fitScore: 9.4,
    description:
      "Elite D1 program with a storied baseball tradition. Strong academics and competitive conference play in the ACC.",
  },
  {
    name: "Vanderbilt",
    division: "D1",
    state: "TN",
    satRange: "1500–1570",
    acceptRate: "6.7%",
    enrollment: "13,000",
    netCost: "$22,000",
    fitScore: 9.1,
    description:
      "Top-tier private university with a nationally ranked D1 baseball program. Highly selective admissions.",
  },
  {
    name: "Rowan University",
    division: "D3",
    state: "NJ",
    satRange: "1130–1310",
    acceptRate: "79%",
    enrollment: "19,000",
    netCost: "$14,000",
    fitScore: 8.2,
    description:
      "Competitive D3 program with strong regional talent pipeline. Accessible admissions and solid academics.",
  },
  {
    name: "West Chester University",
    division: "D2",
    state: "PA",
    satRange: "1010–1190",
    acceptRate: "72%",
    enrollment: "17,000",
    netCost: "$13,000",
    fitScore: 7.8,
    description:
      "Strong D2 program in the PSAC conference. Good balance of athletics and academics at an affordable price.",
  },
  {
    name: "Stevens Institute of Technology",
    division: "D3",
    state: "NJ",
    satRange: "1380–1520",
    acceptRate: "46%",
    enrollment: "3,000",
    netCost: "$35,000",
    fitScore: 7.5,
    description:
      "Small engineering school with a competitive D3 baseball program. Excellent post-graduation career outcomes.",
  },
  {
    name: "Seton Hall University",
    division: "D1",
    state: "NJ",
    satRange: "1140–1340",
    acceptRate: "80%",
    enrollment: "10,000",
    netCost: "$29,000",
    fitScore: 7.2,
    description:
      "Big East D1 program with solid baseball tradition. Accessible admissions and strong northeast recruiting base.",
  },
];

const STATES = [
  "AL","CA","DE","FL","GA","IN","LA","MA","MD","NC","NJ","NY","PA","SC","TN","TX","VA",
];

/* ── component ─────────────────────────────────────────────────── */

export default function CollegeMatchPage() {
  const [division, setDivision] = useState("All");
  const [state, setState] = useState("All");
  const [search, setSearch] = useState("");
  const [hasRun, setHasRun] = useState(false);

  const filtered = COLLEGES.filter((c) => {
    if (division !== "All" && c.division !== division) return false;
    if (state !== "All" && c.state !== state) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const selectCls =
    "border-[1.5px] border-bone-3 px-3 py-2 text-sm text-ink bg-white outline-none focus:border-gold transition-colors cursor-pointer";
  const inputCls =
    "border-[1.5px] border-bone-3 px-3 py-2 text-sm text-ink bg-white outline-none focus:border-gold transition-colors";

  return (
    <>
      <PageHeader
        eyebrow="Match Engine"
        title="College Program Finder"
        subtitle="Programs ranked by fit score. Click any College Board link for live admissions data."
        bgText="MATCH"
      />

      <div className="px-8 py-6 pb-14 space-y-5">
        {/* ── Match Controls ──────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Match Controls
            </h2>
            <p className="text-[11px] text-slate">
              Filter by division, state, or search by name.
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-condensed text-[10px] font-bold tracking-[0.15em] uppercase text-ink-4">
                  Division
                </label>
                <select
                  className={selectCls}
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-condensed text-[10px] font-bold tracking-[0.15em] uppercase text-ink-4">
                  State
                </label>
                <select
                  className={selectCls}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="All">All</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                <label className="font-condensed text-[10px] font-bold tracking-[0.15em] uppercase text-ink-4">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by college name..."
                  className={inputCls}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => setHasRun(true)}
                className="font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-2.5 transition-colors bg-ink text-bone hover:bg-gold hover:text-ink"
              >
                Run Match Engine
              </button>
            </div>
          </div>
        </div>

        {/* ── Green notice (after run) ────────────────────────── */}
        {hasRun && (
          <div className="border-l-[3px] border-green-600 bg-green-600/[0.08] text-green-900 flex gap-2.5 px-3.5 py-3 text-xs">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-px"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>
              Match engine complete — <strong>{filtered.length}</strong> programs
              found matching your filters.
            </span>
          </div>
        )}

        {/* ── College Cards Grid ──────────────────────────────── */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-3.5">
          {filtered.map((college) => (
            <div
              key={college.name}
              className="bg-white border border-black/[0.06] shadow-sm flex flex-col"
            >
              {/* Card header */}
              <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[17px] font-semibold text-ink leading-snug">
                    {college.name}
                  </h3>
                  <span className="font-mono text-[22px] text-gold font-bold leading-none flex-shrink-0">
                    {college.fitScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="font-condensed text-[10px] font-bold tracking-[0.13em] uppercase px-2 py-0.5 bg-ink/[0.06] text-ink">
                    {college.division}
                  </span>
                  <span className="font-condensed text-[10px] font-bold tracking-[0.13em] uppercase px-2 py-0.5 bg-ink/[0.06] text-ink">
                    {college.state}
                  </span>
                  <span className="font-condensed text-[10px] font-bold tracking-[0.13em] uppercase px-2 py-0.5 bg-ink/[0.06] text-ink">
                    {college.enrollment}
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-px bg-black/[0.06] border-b border-black/[0.06]">
                {[
                  { label: "SAT Range", value: college.satRange },
                  { label: "Accept Rate", value: college.acceptRate },
                  { label: "Enrollment", value: college.enrollment },
                  { label: "Net Cost", value: college.netCost },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white px-4 py-2.5">
                    <div className="font-condensed text-[9px] font-bold tracking-[0.18em] uppercase text-ink-4">
                      {stat.label}
                    </div>
                    <div className="font-mono text-[13px] font-medium text-ink mt-0.5">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="px-5 py-3.5 flex-1">
                <p className="text-[12px] text-slate leading-relaxed">
                  {college.description}
                </p>
              </div>

              {/* Actions */}
              <div className="px-5 pb-4 flex gap-2">
                <button
                  type="button"
                  className="font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-2.5 transition-colors bg-ink text-bone hover:bg-gold hover:text-ink"
                >
                  Write Letter
                </button>
                <button
                  type="button"
                  className="font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-2.5 transition-colors bg-transparent border-[1.5px] border-bone-3 text-ink-4 hover:border-ink hover:text-ink"
                >
                  College Board
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
