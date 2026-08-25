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

const selectCls =
  "w-full border-[1.5px] border-bone-3 px-3 py-2 text-sm text-ink bg-white outline-none focus:border-gold transition-colors cursor-pointer";
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

/* ── page ──────────────────────────────────────────────────────── */

export default function BioGeneratorPage() {
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("College Coaching Staff");
  const [length, setLength] = useState("Standard (3 paragraphs)");
  const [emphasis, setEmphasis] = useState("Balanced");
  const [notes, setNotes] = useState("");
  const [bio, setBio] = useState("");

  function handleGenerate() {
    setBio(
      `[Player Name] is a versatile right-handed hitting infielder out of [High School] in [City, State], graduating in the class of [Year]. Standing [Height] and weighing [Weight] lbs, he combines a compact, line-drive swing with above-average bat speed and consistent hard contact to all fields. His batting average of [BA] this past season, coupled with [HR] home runs and [RBI] RBIs, reflects a disciplined approach at the plate and the ability to produce in high-leverage situations.\n\nDefensively, [Player Name] demonstrates soft hands, quick lateral movement, and a strong, accurate arm that plays well at the collegiate level. His 60-yard dash time of [60yd] and vertical leap of [Vert] indicate the raw athleticism coaches look for in middle-infield prospects. He has been evaluated at the All-American Baseball Talent Showcases, where professional scouts noted his advanced feel for the game and instinctive baserunning.\n\nIn the classroom, [Player Name] carries a [GPA] GPA with a focus on [Major/Interest]. He is a high-character student-athlete who has been praised by coaches for his work ethic, coachability, and leadership in the dugout and on the field. He is actively seeking a program where he can compete immediately and contribute to a winning culture.`
    );
  }

  function handleCopy() {
    if (bio) {
      navigator.clipboard.writeText(bio);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Bio Draft Builder"
        subtitle="Builds a third-person player narrative draft for coaches from your profile data."
        bgText="BIO"
      />

      <div className="px-8 py-6 pb-14 space-y-5">
        {/* ── Top row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Generation Settings */}
          <div className="bg-white border border-black/[0.06] shadow-sm">
            <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
              <h2 className="font-display text-[17px] font-semibold text-ink">
                Generation Settings
              </h2>
              <p className="text-[11px] text-slate">
                Control tone, audience, and output format.
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
                  <option>Direct / Analytical</option>
                  <option>Narrative</option>
                </select>
              </Field>
              <Field label="Audience">
                <select
                  className={selectCls}
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <option>College Coaching Staff</option>
                  <option>Scout / Evaluator</option>
                  <option>General</option>
                </select>
              </Field>
              <Field label="Length">
                <select
                  className={selectCls}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option>Standard (3 paragraphs)</option>
                  <option>Brief (1 paragraph)</option>
                  <option>Extended (5 paragraphs)</option>
                </select>
              </Field>
              <Field label="Emphasis">
                <select
                  className={selectCls}
                  value={emphasis}
                  onChange={(e) => setEmphasis(e.target.value)}
                >
                  <option>Balanced</option>
                  <option>Offense-focused</option>
                  <option>Defense-focused</option>
                  <option>Academics first</option>
                </select>
              </Field>
              <Field label="Additional Scout Notes">
                <textarea
                  className={`${inputCls} min-h-[80px] resize-y leading-relaxed`}
                  placeholder="Any extra context to include..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-3 transition-colors bg-ink text-bone hover:bg-gold hover:text-ink"
                >
                  Generate Bio
                </button>
              </div>
            </div>
          </div>

          {/* Profile Data Preview */}
          <div className="bg-white border border-black/[0.06] shadow-sm">
            <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
              <h2 className="font-display text-[17px] font-semibold text-ink">
                Profile Data Preview
              </h2>
              <p className="text-[11px] text-slate">
                What the draft will use
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-slate italic">
                Fill out Player Info, Athletic Profile, and Position Scores for
                best results.
              </p>
            </div>
          </div>
        </div>

        {/* ── Output ──────────────────────────────────────────── */}
        <div className="bg-[#1E1E1E] border border-[#2E2E2E] p-5 min-h-[180px]">
          {bio ? (
            <p className="font-body text-[13.5px] leading-relaxed text-[#E8E0D0] whitespace-pre-wrap">
              {bio}
            </p>
          ) : (
            <p className="font-body text-[13.5px] leading-relaxed text-slate italic">
              Your generated bio will appear here.
            </p>
          )}
        </div>

        {/* ── Copy button ─────────────────────────────────────── */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="font-condensed text-xs font-bold tracking-[0.13em] uppercase px-5 py-2.5 transition-colors bg-transparent border-[1.5px] border-bone-3 text-ink-4 hover:border-ink hover:text-ink"
          >
            Copy Bio
          </button>
        </div>
      </div>
    </>
  );
}
