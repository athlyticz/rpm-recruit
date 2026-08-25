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

      document.startViewTransition(() => {
        router.push(href);
        // Resolve on the next frame so the new route has committed before the
        // snapshot is taken.
        return new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
