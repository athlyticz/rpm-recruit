"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";

/* ── helpers ───────────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-condensed text-[10px] font-bold tracking-[0.15em] uppercase text-ink-4">
      {children}
    </label>
  );
}

const inputCls =
  "w-full border-[1.5px] border-bone-3 px-3 py-2 text-sm text-ink bg-white outline-none focus:border-gold transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* ── types ─────────────────────────────────────────────────────── */

interface PitchTotals {
  totalPitches: string;
  totalStrikes: string;
  totalFastballs: string;
  fastballStrikes: string;
  totalChangeups: string;
  changeupStrikes: string;
  totalBreaking: string;
  breakingStrikes: string;
  firstPitchStrikes: string;
  firstPitchHits: string;
  hits02: string;
  hits12: string;
}

interface InningRow {
  inning: string;
  hits: string;
  pitchLocation: string;
  whereHit: string;
  count: string;
  velocity: string;
}

function emptyTotals(): PitchTotals {
  return {
    totalPitches: "",
    totalStrikes: "",
    totalFastballs: "",
    fastballStrikes: "",
    totalChangeups: "",
    changeupStrikes: "",
    totalBreaking: "",
    breakingStrikes: "",
    firstPitchStrikes: "",
    firstPitchHits: "",
    hits02: "",
    hits12: "",
  };
}

const INNING_LABELS = ["1", "2", "3", "4", "5", "6", "7", "Extra"];

function defaultInnings(): InningRow[] {
  return INNING_LABELS.map((inning) => ({
    inning,
    hits: "",
    pitchLocation: "",
    whereHit: "",
    count: "",
    velocity: "",
  }));
}

/* ── page ──────────────────────────────────────────────────────── */

export default function PitchLogPage() {
  const [pitcherName, setPitcherName] = useState("");
  const [gameOpponent, setGameOpponent] = useState("");
  const [date, setDate] = useState("");
  const [totals, setTotals] = useState<PitchTotals>(emptyTotals());
  const [innings, setInnings] = useState<InningRow[]>(defaultInnings());

  function updateTotal(field: keyof PitchTotals, value: string) {
    setTotals((prev) => ({ ...prev, [field]: value }));
  }

  function updateInning(idx: number, field: keyof InningRow, value: string) {
    setInnings((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  }

  const numCls =
    "font-mono text-xs font-medium text-ink bg-white border-none border-b-[1.5px] border-bone-3 px-1 py-0.5 outline-none w-full focus:border-gold";
  const cellCls =
    "font-mono text-xs font-medium text-ink bg-white border-none border-b-[1.5px] border-bone-3 px-1 py-0.5 outline-none w-full focus:border-gold";

  const TOTAL_FIELDS: { label: string; key: keyof PitchTotals }[] = [
    { label: "Total Pitches", key: "totalPitches" },
    { label: "Total Pitches for Strikes", key: "totalStrikes" },
    { label: "Total Fastballs", key: "totalFastballs" },
    { label: "Total Fastballs for Strikes", key: "fastballStrikes" },
    { label: "Total Changeups", key: "totalChangeups" },
    { label: "Total CHG for Strikes", key: "changeupStrikes" },
    { label: "Total Breaking Balls", key: "totalBreaking" },
    { label: "Total BB for Strikes", key: "breakingStrikes" },
    { label: "1st Pitch Strikes", key: "firstPitchStrikes" },
    { label: "1st Pitch Hits", key: "firstPitchHits" },
    { label: "Hits 0-2 Count", key: "hits02" },
    { label: "Hits 1-2 Count", key: "hits12" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Game Tools"
        title="Pitching Log"
        subtitle="Summary data taken from full pitching chart. One entry per game."
        bgText="PITCHING"
      />

      <div className="px-8 py-6 pb-14 space-y-5">
        {/* ── Game Info ───────────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Game Info
            </h2>
            <p className="text-[11px] text-slate">
              Identify the pitcher and opponent.
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pitcher Name">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. John Smith"
                  value={pitcherName}
                  onChange={(e) => setPitcherName(e.target.value)}
                />
              </Field>
              <Field label="Game / Opponent">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. vs. Central HS"
                  value={gameOpponent}
                  onChange={(e) => setGameOpponent(e.target.value)}
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  className={`${inputCls} cursor-pointer`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Pitch Totals ────────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Pitch Totals
            </h2>
            <p className="text-[11px] text-slate">
              Aggregate pitch counts by type and result.
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
              {TOTAL_FIELDS.map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1">
                  <Label>{label}</Label>
                  <input
                    type="number"
                    className={numCls}
                    placeholder="0"
                    value={totals[key]}
                    onChange={(e) => updateTotal(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Inning-by-Inning ────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Inning-by-Inning
            </h2>
            <p className="text-[11px] text-slate">
              Detail each inning pitched.
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {/* Gold notice */}
            <div className="border-l-[3px] border-gold bg-gold/[0.08] text-[#5C4010] flex gap-2.5 px-3.5 py-3 text-xs">
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
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
              <span>
                When documenting hit count, add a special note if the count
                started 0-2.
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {[
                      "Inning",
                      "Hits",
                      "Pitch Location",
                      "Where Hit",
                      "Count",
                      "Velocity",
                    ].map((col) => (
                      <th
                        key={col}
                        className="font-condensed text-[10px] font-bold tracking-[0.15em] uppercase text-ink-4 text-left pb-2 px-1"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {innings.map((row, idx) => (
                    <tr key={row.inning} className="border-b border-bone">
                      <td className="px-1 py-1.5">
                        <span className="font-mono text-xs font-medium text-ink px-1">
                          {row.inning}
                        </span>
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          className={cellCls}
                          value={row.hits}
                          onChange={(e) =>
                            updateInning(idx, "hits", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          className={cellCls}
                          value={row.pitchLocation}
                          onChange={(e) =>
                            updateInning(idx, "pitchLocation", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          className={cellCls}
                          value={row.whereHit}
                          onChange={(e) =>
                            updateInning(idx, "whereHit", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          className={cellCls}
                          value={row.count}
                          onChange={(e) =>
                            updateInning(idx, "count", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          className={cellCls}
                          value={row.velocity}
                          onChange={(e) =>
                            updateInning(idx, "velocity", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
