"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";

/* ── data ──────────────────────────────────────────────────────── */

const CHECKLIST_ITEMS = [
  {
    title: "Brief Cover Letter",
    desc: "Express sincere interest in playing for the specific program",
  },
  {
    title: "Player Info Sheet",
    desc: "Personal info, height/weight, B/T, contact info",
  },
  {
    title: "Most Recent Varsity Stats",
    desc: "Current season stats \u2014 make it easy to scan",
  },
  {
    title: "Academic Transcript / GPA",
    desc: "Core GPA and SAT/ACT scores",
  },
  {
    title: "Letter of Rec \u2014 HS Coach",
    desc: "Character, coachability, work ethic",
  },
  {
    title: "Letter of Rec \u2014 Summer Coach",
    desc: "Performance under competitive conditions",
  },
  {
    title: "Showcase Evaluation (this report)",
    desc: "All-American Showcase score sheet",
  },
  {
    title: "Highlight Video Link",
    desc: "YouTube or Hudl link \u2014 3-5 min max",
  },
];

interface QA {
  question: string;
  tip: string;
}

const QA_ITEMS: QA[] = [
  {
    question: "Why are you interested in our school?",
    tip: "Research their program history and be specific. Mention conference, coaching staff, or facilities that stand out to you.",
  },
  {
    question: "Tell me about yourself as a person and as a player.",
    tip: "Be genuine. Lead with character then ability. Share what drives you beyond baseball.",
  },
  {
    question: "What are your strengths on the field?",
    tip: "Be specific and back with examples. Use stats or game situations to illustrate.",
  },
  {
    question: "What are your weaknesses?",
    tip: "Show self-awareness but pivot to what you\u2019re doing about it. Coaches respect honesty and growth mindset.",
  },
  {
    question: "What is your work ethic like?",
    tip: "Give concrete examples, not buzzwords. Describe your off-season routine, extra reps, or how you prepared for a specific challenge.",
  },
  {
    question: "Where else are you looking at schools?",
    tip: "Be honest but tactful. Show you\u2019re serious about the process. Don\u2019t name-drop to impress \u2014 coaches see through it.",
  },
  {
    question: "What do you want to study?",
    tip: "Have a real answer. Research if the school offers your intended major. Academics matter at every level.",
  },
  {
    question: "How do you handle failure or adversity?",
    tip: "Use a specific example \u2014 an 0-for-4 game, an error in a big moment \u2014 and explain how you bounced back.",
  },
  {
    question: "What role do you see yourself playing on our team?",
    tip: "Be realistic but confident. Show you\u2019ve studied their roster and understand where you fit.",
  },
  {
    question: "How do your parents feel about you playing college ball?",
    tip: "Coaches want to know your family is supportive and that there won\u2019t be issues. Be positive and unified.",
  },
  {
    question: "What does your summer schedule look like?",
    tip: "Show that you play competitive summer ball and stay active in development. List showcases and leagues.",
  },
  {
    question: "Describe a game where things didn\u2019t go your way.",
    tip: "Pick a real moment. Focus on how you responded, not the failure itself. Resilience is the message.",
  },
  {
    question: "Who has had the biggest influence on your baseball career?",
    tip: "Be genuine \u2014 a coach, parent, or teammate. Explain what you learned from them specifically.",
  },
  {
    question: "What do you know about our program?",
    tip: "Do your homework. Mention recent seasons, coaching philosophy, conference, or notable alumni.",
  },
  {
    question: "Are you willing to redshirt or develop for a year?",
    tip: "Be honest. Most coaches respect a player who is willing to earn their spot. Show long-term commitment.",
  },
  {
    question: "What are your academic goals beyond baseball?",
    tip: "Have a plan. Coaches recruit student-athletes. Show that you take the classroom seriously.",
  },
  {
    question: "How do you prepare for a game mentally?",
    tip: "Describe your routine \u2014 visualization, scouting the opponent, or how you stay focused under pressure.",
  },
  {
    question: "What kind of teammate are you?",
    tip: "Give examples of leadership, encouragement, or sacrifice. Coaches build cultures, not just rosters.",
  },
  {
    question: "What questions do you have for me?",
    tip: "Always have 2\u20133 thoughtful questions ready. Ask about player development, team culture, or academic support.",
  },
  {
    question: "Why should we recruit you over someone else?",
    tip: "Don\u2019t trash other players. Focus on what makes you unique \u2014 your combination of skills, character, and drive.",
  },
];

/* ── page ──────────────────────────────────────────────────────── */

export default function ChecklistPage() {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(CHECKLIST_ITEMS.length).fill(false)
  );
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>(
    new Array(QA_ITEMS.length).fill("")
  );

  function toggleCheck(i: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function toggleQ(i: number) {
    setOpenQ((prev) => (prev === i ? null : i));
  }

  function updateAnswer(i: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Recruiting Preparation"
        title="Checklist & Coach Q&A"
        subtitle="Package checklist and the 20 most common questions college coaches ask."
        bgText="PREP"
      />

      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14 space-y-6">
        {/* ── Package Checklist ───────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Package Checklist
            </h2>
            <p className="text-[11px] text-slate">
              What to include when contacting coaches.
            </p>
          </div>
          <div className="px-5 py-4">
            {CHECKLIST_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`flex gap-3 py-2.5 items-start ${
                  i < CHECKLIST_ITEMS.length - 1
                    ? "border-b border-bone"
                    : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleCheck(i)}
                  aria-pressed={checked[i]}
                  className="size-touch -m-3 flex-shrink-0 flex items-center justify-center cursor-pointer"
                >
                  <span
                    aria-hidden
                    className={`w-[17px] h-[17px] border-[1.5px] flex items-center justify-center transition-colors dur-fast ${
                      checked[i]
                        ? "bg-ink border-ink"
                        : "bg-white border-bone-3"
                    }`}
                  >
                    {checked[i] && (
                      <svg
                        className="w-2.5 h-2.5 text-bone"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                </button>
                <div>
                  <strong
                    className={`text-[13px] font-semibold block transition-colors ${
                      checked[i] ? "text-slate line-through" : "text-ink"
                    }`}
                  >
                    {i + 1}. {item.title}
                  </strong>
                  <span className="text-[11px] text-slate leading-relaxed">
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 20 Questions ────────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              20 Questions College Coaches Ask
            </h2>
            <p className="text-[11px] text-slate">
              Click any question to expand.
            </p>
          </div>
          <div className="divide-y divide-bone">
            {QA_ITEMS.map((qa, i) => (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => toggleQ(i)}
                  className="w-full text-left px-5 py-3 min-h-touch flex items-center gap-3 hover:bg-bone/30 transition-colors dur-fast cursor-pointer"
                >
                  <span className="font-mono text-[13px] font-medium text-gold w-6 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] text-ink font-semibold flex-1">
                    {qa.question}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate flex-shrink-0 transition-transform ${
                      openQ === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {openQ === i && (
                  <div className="px-5 pb-4 pl-14 space-y-3">
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
                      <span>{qa.tip}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-condensed text-[10px] font-bold tracking-[0.15em] uppercase text-ink-4">
                        Your Practice Answer
                      </label>
                      <textarea
                        className="w-full border-[1.5px] border-bone-3 px-3 py-2 text-sm text-ink bg-white outline-none focus:border-gold transition-colors min-h-[80px] resize-y leading-relaxed"
                        placeholder="Write your answer here..."
                        value={answers[i]}
                        onChange={(e) => updateAnswer(i, e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
