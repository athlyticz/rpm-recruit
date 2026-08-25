"use client";


/* ── helpers ──────────────────────────────────────────────────── */

function CardHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="px-5 pt-3.5 pb-3 border-b border-black/[0.06]">
      <h2 className="font-display text-title-sm font-semibold text-ink">
        {title}
      </h2>
      <p className="text-meta text-slate">{desc}</p>
    </div>
  );
}

function GoldNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 px-3.5 py-3 mb-3.5 border-l-[3px] border-gold bg-gold/[0.08] text-gold-ink text-xs leading-relaxed">
      {children}
    </div>
  );
}

function MeasurementField({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-condensed text-label font-bold tracking-[0.15em] uppercase text-ink-4">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="pressable-sink focusable min-h-touch w-full border-[1.5px] border-bone-3 px-3 py-2 text-sm text-ink bg-white outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,151,90,0.12)] transition-colors"
      />
    </div>
  );
}

function MetricBox({
  label,
  placeholder,
  benchmark,
  progressPercent,
}: {
  label: string;
  placeholder: string;
  benchmark: string;
  progressPercent?: number;
}) {
  return (
    <div>
      <div className="font-condensed text-micro font-bold tracking-[0.18em] uppercase text-slate">
        {label}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="pressable-sink focusable min-h-touch font-mono text-title-lg font-medium text-ink bg-transparent border-none border-b-2 border-bone-3 outline-none w-full py-1 focus:border-gold"
      />
      <p className="text-label text-slate mt-1.5 leading-relaxed">
        {benchmark}
      </p>
      {progressPercent !== undefined && (
        <div className="h-1 bg-bone-3 rounded-sm mt-2">
          <div
            className="h-full bg-gold rounded-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────── */

export function AthleticForm() {
  return (
    <div className="space-y-6">
        {/* ── Physical Measurements ──────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <CardHeader
            title="Physical Measurements"
            desc="Body composition and grip strength data."
          />

          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-3">
              <MeasurementField label="Height (inches)" placeholder="e.g. 72" />
              <MeasurementField label="Weight (lbs)" placeholder="e.g. 185" />
              <MeasurementField label="Body Fat %" placeholder="e.g. 9.5" />
              <MeasurementField label="Hand Strength R (lbs)" placeholder="e.g. 110" />
              <MeasurementField label="Hand Strength L (lbs)" placeholder="e.g. 105" />
            </div>

            <GoldNotice>
              <span>
                Pro average body fat: C 9.71% · IF 9.37% · OF 8.36% · P 10.40%.
                Hand strength superior: R120/L118, good: R104/L103, poor: R90/L88.
              </span>
            </GoldNotice>
          </div>
        </div>

        {/* ── Speed & Agility ────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <CardHeader
            title="Speed & Agility"
            desc="Timed sprint and lateral movement testing."
          />

          <div className="px-5 py-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(185px,1fr))] gap-3">
              <MetricBox
                label="60-Yard Dash"
                placeholder="7.10"
                benchmark="Pro avg: C 7.35s · IF 6.97s · OF 6.89s"
                progressPercent={68}
              />
              <MetricBox
                label="Pro Agility (seconds)"
                placeholder="4.75"
                benchmark="HS avg: C 4.79 · CIF 4.78 · MIF 4.76 · OF 4.74 · P 4.94"
              />
              <MetricBox
                label="30-Yard Dash"
                placeholder="3.80"
                benchmark="Pro avg: C 3.93 · IF 3.73 · OF 3.69"
              />
            </div>
          </div>
        </div>

        {/* ── Power & Explosiveness ──────────────────────────── */}
        <div className="bg-white border border-black/[0.06] shadow-sm">
          <CardHeader
            title="Power & Explosiveness"
            desc="Bat speed, jumping, and rotational power metrics."
          />

          <div className="px-5 py-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(185px,1fr))] gap-3">
              <MetricBox
                label="Bat Speed (MPH)"
                placeholder="74"
                benchmark="HS superior: 80+ · average: 74 MPH"
                progressPercent={62}
              />
              <MetricBox
                label="Vertical Leap (in)"
                placeholder="28"
                benchmark="Pro: superior 32-35 · outstanding 29-32 · avg 26.2 · HS avg 24.5"
                progressPercent={72}
              />
              <MetricBox
                label="Standing Long Jump (in)"
                placeholder="106"
                benchmark="Pro: superior 129 · avg 106 · HS avg 92 · poor 88"
              />
              <MetricBox
                label="Medicine Ball Throw (ft)"
                placeholder="13.5"
                benchmark={'Pro: superior 15\'2" · average 13\'6" · poor 12\'4"'}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
