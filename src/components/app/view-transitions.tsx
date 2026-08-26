"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Route transitions, behind a single kill switch.
 *
 * ── If a link in the authenticated app misbehaves, look here first. ──
 *
 * This intercepts same-origin anchor clicks in the CAPTURE phase, because
 * Next's Link calls preventDefault on the anchor itself and a bubble-phase
 * listener always arrives after the navigation has been claimed. Capture is
 * the only place this can win the click, and that is also what makes it
 * risky: it sees every internal link click in the app shell before the
 * framework does.
 *
 * That risk is the reason for the flag below. Setting it to false disables
 * every interception in one line, with no call sites to touch; navigation
 * falls back to Next's own handling and the only thing lost is the cross-fade
 * and the gauge morph. Prefer flipping this over debugging a link in place.
 */
export const ROUTE_TRANSITIONS_ENABLED =
  process.env.NEXT_PUBLIC_ROUTE_TRANSITIONS !== "off";

export function ViewTransitions() {
  const router = useRouter();

  useEffect(() => {
    if (!ROUTE_TRANSITIONS_ENABLED) return;
    if (typeof document === "undefined") return;
    if (!("startViewTransition" in document)) return;

    function onClick(event: MouseEvent) {
      // Leave modified clicks to the browser.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (href === window.location.pathname) return;

      // Reduced motion takes the plain navigation, with no transition at all.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Claim the navigation before Link does.
      event.preventDefault();
      event.stopPropagation();

      /*
       * Navigation must happen whether or not the transition does.
       *
       * startViewTransition aborts in several states the browser does not warn
       * about in advance, and when it aborts before running its callback the
       * router.push inside it never executes. That swallowed a real click on
       * the dashboard's primary call to action on production: the synthetic
       * .click() used in earlier checks happened to succeed, a real one did
       * not. A decorative cross-fade must never be able to eat a navigation.
       *
       * navigate() is idempotent and is called from every exit: the transition
       * callback, both rejection paths, a synchronous throw, and a short
       * fallback timer for the case where none of those fire.
       */
      let navigated = false;
      const navigate = () => {
        if (navigated) return;
        navigated = true;
        router.push(href);
      };

      try {
        const transition = document.startViewTransition(() => {
          navigate();
          // Resolve on the next frame so the new route has committed before
          // the snapshot is taken.
          return new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          );
        });

        transition.ready.catch(navigate);
        transition.finished.catch(navigate);
      } catch {
        navigate();
      }

      window.setTimeout(navigate, 250);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
