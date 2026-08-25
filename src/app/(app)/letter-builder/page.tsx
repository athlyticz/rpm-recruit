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
const selectCls = `${inputCls} cursor-pointer`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* ── page ──────────────────────────────────────────────────────── */

export default function LetterBuilderPage() {
  const [coachName, setCoachName] = useState("");
  const [college, setCollege] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [cityStateZip, setCityStateZip] = useState("");
  const [letterType, setLetterType] = useState("Initial Contact");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Standard (3-4 paragraphs)");
  const [letterBody, setLetterBody] = useState("");
  const [generated, setGenerated] = useState(false);

  function handleGenerate() {
    setGenerated(true);
    setLetterBody(
      `Dear Coach ${coachName || "[Name]"},\n\nI am writing to express my sincere interest in the ${college || "[University]"} baseball program. As a student-athlete committed to competing at the collegiate level, I believe your program aligns with both my academic and athletic goals.\n\nMy name is [Player Name], and I am a [Position] at [High School] in [City, State], graduating in the class of [Year]. This past season, I was evaluated at the All-American Baseball Talent Showcases, where I received a comprehensive skills assessment from professional scouts and experienced coaches.\n\nI would welcome the opportunity to visit campus, attend a prospect camp, or speak with you about how I might contribute to your program. I have attached my player profile, transcript, and highlight video for your review.\n\nThank you for your time and consideration. I look forward to hearing from you.\n\nSincerely,\n[Player Name]\nScanzano Baseball — All-American Talent Showcases`
    );
  }

  function handleCopy() {
    if (letterBody) {
      navigator.clipboard.writeText(letterBody);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Recruiting"
        title="Letter Builder"
        subtitle="Recruiting letter drafts from templates. Scanzano Baseball references pre-filled."
        bgText="LETTER"
      />

      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14 space-y-5">
        {/* ── Top row: Coach Details + Controls ───────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Coach Details */}
          <div className="bg-white border border-black/[0.06] shadow-sm">
            <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
              <h2 className="font-display text-[17px] font-semibold text-ink">
                Coach Details
              </h2>
              <p className="text-[11px] text-slate">
                Recipient information for the letter.
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <Field label="Coach Name">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. Coach Mike Smith"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                />
              </Field>
              <Field label="College / University">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. UNC Chapel Hill"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </Field>
              <Field label="Street Address">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. 123 Stadium Dr"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </Field>
              <Field label="City, State, Zip">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. Chapel Hill, NC 27514"
                  value={cityStateZip}
                  onChange={(e) => setCityStateZip(e.target.value)}
                />
              </Field>
              <Field label="Letter Type">
                <select
                  className={selectCls}
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                >
                  <option>Initial Contact</option>
                  <option>Follow-Up</option>
                  <option>Strong Interest</option>
                  <option>Thank You</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Letter Controls */}
          <div className="bg-white border border-black/[0.06] shadow-sm">
            <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
              <h2 className="font-display text-[17px] font-semibold text-ink">
                Letter Controls
              </h2>
              <p className="text-[11px] text-slate">
                Adjust tone, length, and generate.
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <Field label="Tone">
                <select
                  className={selectCls}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Professional</option>
                  <option>Confident</option>
                  <option>Humble</option>
                  <option>Direct</option>
                </select>
              </Field>
              <Field label="Length">
                <select
                  className={selectCls}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option>Standard (3-4 paragraphs)</option>
                  <option>Brief (2 paragraphs)</option>
                  <option>Detailed (5+ paragraphs)</option>
                </select>
              </Field>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-3.5 transition-colors bg-ink text-bone hover:bg-gold hover:text-ink"
                >
                  Generate Letter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Letter Preview ──────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm overflow-hidden">
          {/* Dark header bar */}
          <div className="bg-ink px-5 py-2.5 flex items-center justify-between">
            <span className="font-condensed text-[11px] font-bold tracking-[0.15em] uppercase text-bone/70">
              RPM Recruit &middot; Letter
            </span>
            <span className="font-condensed text-[11px] font-bold tracking-[0.15em] uppercase text-bone/70">
              All-American Baseball Talent Showcases
            </span>
          </div>

          {/* Meta bar */}
          {generated && (
            <div className="px-5 py-2.5 border-b border-black/[0.06] flex gap-6 text-[11px] text-slate">
              <span>
                <strong className="text-ink font-medium">To:</strong>{" "}
                {coachName || "—"}, {college || "—"}
              </span>
              <span>
                <strong className="text-ink font-medium">From:</strong> [Player
                Name]
              </span>
              <span>
                <strong className="text-ink font-medium">Type:</strong>{" "}
                {letterType}
              </span>
            </div>
          )}

          {/* Letter body */}
          <div className="px-5 py-5 min-h-[460px]">
            {letterBody ? (
              <p className="text-[13.5px] text-ink leading-relaxed whitespace-pre-wrap">
                {letterBody}
              </p>
            ) : (
              <p className="text-sm text-slate italic">
                Your generated letter will appear here.
              </p>
            )}
          </div>
        </div>

        {/* ── Action buttons ──────────────────────────────────── */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-2.5 min-h-touch inline-flex items-center justify-center transition-colors bg-transparent border-[1.5px] border-bone-3 text-ink-4 hover:border-ink hover:text-ink"
          >
            Copy Letter
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-2.5 min-h-touch inline-flex items-center justify-center transition-colors bg-transparent border-[1.5px] border-bone-3 text-ink-4 hover:border-ink hover:text-ink"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </>
  );
}
