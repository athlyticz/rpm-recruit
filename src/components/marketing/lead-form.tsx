"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Check, Phone } from "lucide-react";
import { submitLead } from "@/app/(marketing)/start/actions";
import {
  GRAD_YEARS,
  INITIAL_LEAD_STATE,
  LEVELS,
  POSITIONS,
  type LeadErrors,
  type LeadState,
  type LeadValues,
} from "@/lib/leads/schema";

/* ------------------------------------------------------------------ */
/*  Fields                                                             */
/* ------------------------------------------------------------------ */

const FIELD =
  "w-full min-h-touch bg-white border rounded-sm px-3 text-body text-ink placeholder:text-slate focusable transition-colors dur-fast";

function fieldClass(invalid: boolean) {
  return `${FIELD} ${invalid ? "border-blood-2" : "border-bone-3 hover:border-sand"}`;
}

function Label({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-condensed text-micro font-bold tracking-[0.2em] uppercase text-ink-4 mb-1.5"
    >
      {children}
      {optional && <span className="text-slate font-normal ml-2">optional</span>}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-caption text-blood-2 mt-1.5">
      {message}
    </p>
  );
}

function Text({
  name,
  label,
  values,
  errors,
  onFix,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
}: {
  name: keyof LeadValues;
  label: string;
  values: LeadValues;
  errors: LeadErrors;
  onFix: (name: keyof LeadValues) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "tel";
}) {
  const id = `lead-${name}`;
  const error = errors[name];
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={values[name]}
        onInput={() => onFix(name)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={fieldClass(Boolean(error))}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function Select({
  name,
  label,
  options,
  placeholder,
  values,
  errors,
  onFix,
}: {
  name: keyof LeadValues;
  label: string;
  options: readonly (string | number)[];
  placeholder: string;
  values: LeadValues;
  errors: LeadErrors;
  onFix: (name: keyof LeadValues) => void;
}) {
  const id = `lead-${name}`;
  const error = errors[name];
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {/*
        Keyed on the echoed value so a rejected submit restores the picks.
        Text inputs keep what the family typed because the DOM holds it; an
        uncontrolled select does not survive the re-render the same way, and
        losing three dropdowns is the last thing anyone needs at the moment
        the form has just told them something is wrong.
      */}
      <select
        key={`${name}-${values[name]}`}
        id={id}
        name={name}
        defaultValue={values[name]}
        onChange={() => onFix(name)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${fieldClass(Boolean(error))} appearance-none bg-[length:auto] pr-8`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={String(option)}>
            {option}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Confirmation                                                       */
/* ------------------------------------------------------------------ */

const NEXT_STEPS = [
  {
    title: "A call within 48 hours",
    body: "Someone from Coach Scanzano's team calls the number you gave us. If we miss you, we leave a message and try again.",
  },
  {
    title: "An honest read on where he stands",
    body: "What the level looks like today, what the realistic list is, and what would have to change to move it.",
  },
  {
    title: "The plan, then the paperwork",
    body: "If it is a fit on both sides, we walk through the package and the timeline. Nothing is charged from this form.",
  },
];

function Confirmation({ sent }: { sent: NonNullable<LeadState["sent"]> }) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // Send focus to the confirmation, so a screen reader and a keyboard land
  // where the answer is rather than back at the top of the page.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="bg-white border border-black/[0.07] rounded-md shadow-sm p-5 lg:p-7">
      <p className="inline-flex items-center gap-2 font-condensed text-micro font-bold tracking-[0.24em] uppercase text-green mb-3">
        <Check size={13} aria-hidden />
        Received
      </p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-display-lg lg:text-numeral font-bold text-ink leading-none text-balance focusable"
      >
        We have it. Expect a call within 48 hours.
      </h2>
      <p className="text-body-lg text-ink-5 leading-relaxed mt-3 text-pretty">
        {sent.parentName}, we have {sent.playerName}&apos;s information in front
        of the team. Nothing was charged and no account was created. The next
        move is ours.
      </p>

      <ol className="mt-6 flex flex-col gap-4">
        {NEXT_STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3.5">
            <span className="font-mono num text-meta text-slate pt-0.5 w-4 shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="font-display text-title-sm font-bold text-ink">
                {step.title}
              </p>
              <p className="text-body text-ink-5 leading-relaxed mt-0.5 text-pretty">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-caption text-slate mt-6 pt-4 border-t border-black/[0.06] text-pretty">
        Watch for a South Jersey number. If you need us first, the office line
        is on the contact page.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The form                                                           */
/* ------------------------------------------------------------------ */

export function LeadForm({
  planInterest,
  source,
}: {
  planInterest?: string;
  source: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitLead,
    INITIAL_LEAD_STATE
  );
  const summaryId = useId();
  const summaryRef = useRef<HTMLParagraphElement | null>(null);

  /*
   * A message under a field the family has already corrected reads as a form
   * that is not listening. Errors come from the server, so they cannot know a
   * field was fixed; this drops the message the moment the field is touched,
   * and the server has the last word again on the next submit.
   */
  const [fixed, setFixed] = useState<ReadonlySet<string>>(new Set());
  const clearError = (name: keyof LeadValues) =>
    setFixed((current) => {
      if (current.has(name)) return current;
      const next = new Set(current);
      next.add(name);
      return next;
    });

  useEffect(() => {
    if (state.status === "error") {
      setFixed(new Set());
      summaryRef.current?.focus();
    }
  }, [state]);

  if (state.status === "sent" && state.sent) {
    return <Confirmation sent={state.sent} />;
  }

  const { values } = state;
  const errors: LeadErrors = Object.fromEntries(
    Object.entries(state.errors).filter(([key]) => !fixed.has(key))
  );
  const count = Object.keys(errors).filter((k) => k !== "form").length;

  return (
    <form
      action={formAction}
      noValidate
      className="bg-white border border-black/[0.07] rounded-md shadow-sm p-5 lg:p-7"
    >
      <input type="hidden" name="planInterest" value={planInterest ?? ""} />
      <input type="hidden" name="source" value={source} />

      {/* Not shown, not announced, not autofilled. Only a bot fills this. */}
      <div aria-hidden className="hidden">
        <label htmlFor="lead-company">Company</label>
        <input id="lead-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {(count > 0 || errors.form) && (
        <p
          ref={summaryRef}
          tabIndex={-1}
          id={summaryId}
          role="alert"
          className="text-body text-blood-2 bg-blood/[0.06] border border-blood-2/30 rounded-sm px-3 py-2.5 mb-5 focusable"
        >
          {errors.form
            ? errors.form
            : count === 1
              ? "One field needs a look before this can send."
              : `${count} fields need a look before this can send.`}
        </p>
      )}

      <fieldset className="border-0 p-0 m-0">
        <legend className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-3">
          The player
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Text
            name="playerFirstName"
            label="First name"
            autoComplete="off"
            values={values}
            errors={errors}
            onFix={clearError}
          />
          <Text
            name="playerLastName"
            label="Last name"
            autoComplete="off"
            values={values}
            errors={errors}
            onFix={clearError}
          />
          <Select
            name="gradYear"
            label="Graduation year"
            placeholder="Select a year"
            options={GRAD_YEARS}
            values={values}
            errors={errors}
            onFix={clearError}
          />
          <Select
            name="position"
            label="Primary position"
            placeholder="Select a position"
            options={POSITIONS}
            values={values}
            errors={errors}
            onFix={clearError}
          />
          <div className="sm:col-span-2">
            <Select
              name="currentLevel"
              label="Playing now at"
              placeholder="Select a level"
              options={LEVELS}
              values={values}
              errors={errors}
              onFix={clearError}
            />
          </div>
        </div>
      </fieldset>

      <div className="mt-7 pt-6 border-t border-black/[0.06]" />

      <fieldset className="border-0 p-0 m-0">
        <legend className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-3">
          The parent or guardian
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Text
              name="parentName"
              label="Your name"
              autoComplete="name"
              values={values}
              errors={errors}
              onFix={clearError}
            />
          </div>
          <Text
            name="parentEmail"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            values={values}
            errors={errors}
            onFix={clearError}
          />
          <Text
            name="parentPhone"
            label="Phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(609) 555-0134"
            values={values}
            errors={errors}
            onFix={clearError}
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="lead-notes" optional>
            Anything we should know
          </Label>
          <textarea
            id="lead-notes"
            name="notes"
            rows={3}
            defaultValue={values.notes}
            onInput={() => clearError("notes")}
            aria-invalid={errors.notes ? true : undefined}
            aria-describedby={errors.notes ? "lead-notes-error" : undefined}
            className={`${fieldClass(Boolean(errors.notes))} py-2.5 resize-y`}
          />
          <FieldError id="lead-notes-error" message={errors.notes} />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="pressable focusable press-redline mt-7 w-full inline-flex items-center justify-center gap-2 min-h-touch font-condensed text-body font-bold tracking-[0.14em] uppercase bg-ink text-bone rounded-sm hover:bg-gold hover:text-ink disabled:opacity-70 disabled:hover:bg-ink disabled:hover:text-bone transition-colors dur-fast"
      >
        <Phone size={14} aria-hidden />
        {pending ? "Sending" : "Send it to the team"}
      </button>

      <p className="text-caption text-slate mt-3 text-center text-pretty">
        No payment today and no card. This form starts a phone call, nothing
        else.
      </p>
    </form>
  );
}
