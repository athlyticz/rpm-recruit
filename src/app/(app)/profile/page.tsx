"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";

const POSITIONS = [
  "Pitcher RHP",
  "Pitcher LHP",
  "Catcher",
  "First Baseman",
  "Second Baseman",
  "Shortstop",
  "Third Baseman",
  "Outfielder",
];

const STAT_TABS = [
  "HS Hitting",
  "HS Pitching",
  "Summer Hitting",
  "Summer Pitching",
] as const;

type StatTab = (typeof STAT_TABS)[number];

const HITTING_COLS = ["G", "AB", "H", "2B", "3B", "HR", "R", "RBI", "BB", "K", "SB", "BA"];
const PITCHING_COLS = ["W", "L", "SV", "ERA", "G", "CG", "IP", "H", "BB", "K", "SHO"];

/* ── tiny helpers ────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-condensed text-label font-bold tracking-[0.15em] uppercase text-ink-4">
      {children}
    </label>
  );
}

const inputCls =
  "min-h-touch w-full border-[1.5px] border-bone-3 px-3 py-2 text-sm text-ink bg-white outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,151,90,0.12)] transition-colors";

const selectCls = `${inputCls} cursor-pointer`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TextField({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <Field label={label}>
      <input type="text" placeholder={placeholder} className={inputCls} />
    </Field>
  );
}

function SelectField({
  label,
  options,
  placeholder,
}: {
  label: string;
  options: string[];
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <select className={selectCls} defaultValue="">
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

/* ── stat table ──────────────────────────────────────────────── */

function StatTable({ columns }: { columns: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="font-condensed text-label font-bold tracking-[0.15em] uppercase text-ink-4 text-left pb-1.5 px-1"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((col) => (
              <td key={col} className="px-0.5 py-1">
                <input
                  type="text"
                  className="pressable focusable min-h-touch font-mono text-xs font-medium text-ink bg-white border-none border-b-[1.5px] border-bone-3 px-1 py-0.5 outline-none w-14 focus:border-gold"
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────── */

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<StatTab>("HS Hitting");

  const isHitting = activeTab === "HS Hitting" || activeTab === "Summer Hitting";

  return (
    <>
      <PageHeader
        eyebrow="Section 1"
        title="Player Information"
        subtitle="Personal details, contact information, and season statistics."
        bgText="PLAYER"
      />

      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14 space-y-6">
        {/* ── Personal Details ───────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-title-sm font-semibold text-ink">
              Personal Details
            </h2>
            <p className="text-meta text-slate">
              Basic information about the player.
            </p>
          </div>

          <div className="px-5 py-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-3">
              {/* Row 1 */}
              <TextField label="First Name" />
              <TextField label="Last Name" />
              <TextField label="Graduation Year" placeholder="e.g. 2026" />
              <TextField label="Date of Birth" placeholder="MM/DD/YYYY" />

              {/* Row 2 */}
              <TextField label="Height (in)" placeholder='e.g. 72' />
              <TextField label="Weight (lbs)" placeholder="e.g. 185" />
              <SelectField label="Bats" options={["R", "L", "S"]} placeholder="Select" />
              <SelectField label="Throws" options={["R", "L"]} placeholder="Select" />

              {/* Row 3 */}
              <div className="col-span-full">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-3">
                  <SelectField
                    label="Primary Position"
                    options={POSITIONS}
                    placeholder="Select position"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <TextField label="High School" />
              <TextField label="City/State" placeholder="e.g. Austin, TX" />
              <TextField label="HS Coach" />
              <TextField label="HS Coach Phone" placeholder="(555) 555-5555" />

              {/* Row 5 */}
              <TextField label="Summer Team/League" />
              <TextField label="Summer Coach" />
              <TextField label="Email" placeholder="player@example.com" />
              <TextField label="Phone" placeholder="(555) 555-5555" />
            </div>
          </div>
        </div>

        {/* ── Season Statistics ──────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-title-sm font-semibold text-ink">
              Season Statistics
            </h2>
            <p className="text-meta text-slate">
              Hitting and pitching stats by season.
            </p>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Tabs */}
            <div className="flex gap-0 border-b border-black/[0.06]">
              {STAT_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pressable focusable min-h-touch font-condensed text-meta font-bold tracking-[0.11em] uppercase py-2 px-4 cursor-pointer border-b-2 transition-colors ${
                    activeTab === tab
                      ? "text-ink border-gold"
                      : "text-slate border-transparent hover:text-ink"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Active stat table */}
            <StatTable columns={isHitting ? HITTING_COLS : PITCHING_COLS} />

            {/* Honors */}
            <div className="flex flex-col gap-1 pt-2">
              <Label>Team Titles / Personal Honors</Label>
              <textarea
                className={`${inputCls} min-h-[84px] resize-y leading-relaxed`}
                placeholder="List notable achievements, awards, or team accomplishments..."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
