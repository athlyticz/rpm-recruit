"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";

/* ── constants ──────────────────────────────────────────────── */

const MAJORS = [
  "Business",
  "Engineering",
  "Computer Science",
  "Pre-Med / Biology",
  "Finance / Accounting",
  "Communications",
  "Criminal Justice",
  "Education",
  "Kinesiology / Exercise Science",
  "Psychology",
  "Architecture",
  "Nursing",
  "Liberal Arts",
  "Undecided",
] as const;

const CAMPUS_SETTINGS = [
  "No preference",
  "Suburban campus",
  "Urban campus",
  "College-town setting",
  "Rural / college-town setting",
];

const DISTANCE_OPTIONS = [
  "No preference",
  "Within 2 hours",
  "Within 4 hours",
  "Anywhere in US",
];

/* ── tiny helpers ────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-condensed text-[10px] font-bold tracking-[0.15em] uppercase text-ink-4">
      {children}
    </label>
  );
}

const inputCls =
  "w-full border-[1.5px] border-bone-3 px-3 py-2 text-sm text-ink bg-white outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,151,90,0.12)] transition-colors";

const selectCls = `${inputCls} cursor-pointer`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NumberField({ label, placeholder, step }: { label: string; placeholder?: string; step?: string }) {
  return (
    <Field label={label}>
      <input type="number" placeholder={placeholder} step={step} className={inputCls} />
    </Field>
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

/* ── page ────────────────────────────────────────────────────── */

export default function AcademicsPage() {
  const [selectedMajors, setSelectedMajors] = useState<Set<string>>(new Set());

  function toggleMajor(major: string) {
    setSelectedMajors((prev) => {
      const next = new Set(prev);
      if (next.has(major)) {
        next.delete(major);
      } else {
        next.add(major);
      }
      return next;
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Section 3"
        title="Academics & NCAA Eligibility"
        subtitle="GPA, test scores, and NCAA eligibility quick-check for Division I and II."
        bgText="ACADEMICS"
      />

      <div className="px-8 py-6 pb-14 space-y-6">
        {/* ── Academic Profile ─────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Academic Profile
            </h2>
          </div>

          <div className="px-5 py-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-3">
              <NumberField label="Overall GPA" placeholder="3.50" step="0.01" />
              <TextField label="Class Rank" placeholder="Top 15%" />
              <NumberField label="SAT CR+Math" placeholder="1200" />
              <NumberField label="ACT Sum 4 Sections" placeholder="88" />
              <TextField label="Graduation Year" placeholder="June 2026" />
            </div>
          </div>
        </div>

        {/* ── Academic Interests ───────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Academic Interests
            </h2>
            <p className="text-[11px] text-slate">
              Select intended major areas — used by college match engine.
            </p>
          </div>

          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {MAJORS.map((major) => {
                const active = selectedMajors.has(major);
                return (
                  <button
                    key={major}
                    type="button"
                    onClick={() => toggleMajor(major)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-sm transition-colors cursor-pointer ${
                      active
                        ? "bg-ink border border-ink text-gold-3"
                        : "bg-bone border-[1.5px] border-bone-3 text-ink-4 hover:border-ink hover:text-ink"
                    }`}
                  >
                    {major}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Campus Preference ────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Campus Preference
            </h2>
          </div>

          <div className="px-5 py-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-3">
              <SelectField
                label="Campus Setting"
                options={CAMPUS_SETTINGS}
                placeholder="Select setting"
              />
              <SelectField
                label="Distance from Home"
                options={DISTANCE_OPTIONS}
                placeholder="Select distance"
              />
            </div>
          </div>
        </div>

        {/* ── NCAA Core Course Reference ───────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              NCAA Core Course Reference
            </h2>
            <p className="text-[11px] text-slate">
              Quick reference — verify at ncaa.org.
            </p>
          </div>

          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Division I */}
              <div>
                <h3 className="font-display text-[14px] font-semibold text-ink mb-3">
                  Division I — 16 Core Courses
                </h3>

                <ul className="space-y-1.5 text-[12.5px] text-ink leading-relaxed">
                  <li>4 yrs English</li>
                  <li>3 yrs Math (Algebra I+)</li>
                  <li>2 yrs Natural/Physical Science (1 lab)</li>
                  <li>1 yr additional English/Math/Science</li>
                  <li>2 yrs Social Science</li>
                  <li>4 yrs additional electives</li>
                </ul>

                <div className="border-l-[3px] border-blue bg-blue/[0.07] text-[#1A4A78] text-[11.5px] px-3.5 py-3 mt-4 leading-relaxed">
                  D-I uses a sliding GPA/SAT scale. Min SAT not fixed — depends on GPA.
                  Use NCAA code 9999 when registering for SAT/ACT.
                </div>
              </div>

              {/* Division II */}
              <div>
                <h3 className="font-display text-[14px] font-semibold text-ink mb-3">
                  Division II — 14 Core Courses
                </h3>

                <ul className="space-y-1.5 text-[12.5px] text-ink leading-relaxed">
                  <li>3 yrs English</li>
                  <li>2 yrs Math</li>
                  <li>2 yrs Natural/Physical Science</li>
                  <li>2 yrs additional</li>
                  <li>2 yrs Social Science</li>
                  <li>3 yrs additional</li>
                </ul>

                <div className="border-l-[3px] border-blue bg-blue/[0.07] text-[#1A4A78] text-[11.5px] px-3.5 py-3 mt-4 leading-relaxed">
                  D-II minimum: SAT 820 (CR+Math) or ACT sum of 88. Min GPA 2.000.
                  Writing section of SAT is NOT used.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
