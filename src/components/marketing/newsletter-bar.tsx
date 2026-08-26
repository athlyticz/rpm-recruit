"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, X } from "lucide-react";
import { subscribe, type SubscribeState } from "@/app/(marketing)/newsletter/actions";

const INITIAL: SubscribeState = { status: "idle" };
const DISMISSED_KEY = "rpm.newsletter.dismissed";

/**
 * Waitlist capture, as a bar rather than a modal.
 *
 * Pre-launch this is a waitlist, not a newsletter: same table, same
 * mechanics, different promise. New rows carry source waitlist:*; rows
 * written before the reframe keep their marketing:* source, which is a fact
 * about when they signed up, not an error to rewrite. The file, component,
 * and table names still say newsletter; that is cosmetic debt noted in the
 * roadmap for after the demo, not worth a rename migration now.
 *
 * Rules it holds to: never on load, never over the content, never a focus
 * trap, and never on /start, where a family is in the middle of the highest
 * stakes form on the site and does not need a second thing asking for an
 * email. It appears once the reader has gone deep enough to have seen
 * something worth signing up for, and a dismissal holds for the session.
 */
export function NewsletterBar() {
  const pathname = usePathname();
  const [state, formAction, pending] = useActionState(subscribe, INITIAL);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  // Start hidden on the server and on first paint, then decide on the client.
  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;

    let queued = false;
    let frame = 0;

    function measure() {
      queued = false;
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      // Deep enough to have read something: a viewport and a half, or a third
      // of a short page, whichever comes first.
      const deep = scrolled > window.innerHeight * 1.5 || (height > 0 && scrolled / height > 0.33);
      if (deep) setVisible(true);
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(measure);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [dismissed]);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // A browser that refuses storage still gets the dismissal, just not
      // across pages. Never let this throw into the render path.
    }
  }

  if (dismissed || !visible || pathname === "/start") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-gutter pb-3 lg:px-6 lg:pb-5 pointer-events-none">
      <div className="mx-auto max-w-3xl bg-ink border border-ink-3 rounded-lg shadow-lg px-4 py-3.5 lg:px-5 lg:py-4 pointer-events-auto motion-safe:animate-rise">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-gold">
              Join the waitlist
            </p>

            {state.status === "sent" ? (
              <p className="inline-flex items-center gap-2 text-body text-bone mt-1.5">
                <Check size={14} className="text-green-2 shrink-0" aria-hidden />
                You&apos;re on the list. You&apos;ll hear from us before
                doors open.
              </p>
            ) : (
              <>
                <p className="text-caption text-slate-2 mt-1 text-pretty">
                  Doors are not open yet. Leave an email, save your spot,
                  and you hear it first when they are. No hype and no spam.
                </p>

                <form
                  action={formAction}
                  className="flex flex-col sm:flex-row gap-2 mt-2.5"
                >
                  <input type="hidden" name="source" value={`waitlist:${pathname}`} />
                  <div aria-hidden className="hidden">
                    <input name="company" tabIndex={-1} autoComplete="off" />
                  </div>

                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    aria-invalid={state.status === "error" ? true : undefined}
                    aria-describedby={state.status === "error" ? "newsletter-error" : undefined}
                    className={`focusable flex-1 min-h-touch bg-ink-2 border rounded-sm px-3 text-body text-bone placeholder:text-ink-5 transition-colors dur-fast ${
                      state.status === "error"
                        ? "border-blood-2"
                        : "border-ink-3 hover:border-slate"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="pressable focusable press-redline inline-flex items-center justify-center min-h-touch px-5 font-condensed text-label font-bold tracking-[0.16em] uppercase bg-gold text-ink rounded-sm hover:bg-gold-2 disabled:opacity-70 transition-colors dur-fast"
                  >
                    {pending ? "Saving" : "Save my spot"}
                  </button>
                </form>

                {state.status === "error" && (
                  <p id="newsletter-error" role="alert" className="text-caption text-blood-2 mt-1.5">
                    {state.message}
                  </p>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="pressable focusable shrink-0 -mt-1 -mr-1 p-2 text-ink-5 hover:text-bone transition-colors dur-fast"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
