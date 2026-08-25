"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Route transitions driven directly by the native View Transitions API.
 *
 * Next's experimental.viewTransition flag only works on the experimental React
 * channel: this project runs React 19.2.4 stable, which exports no
 * ViewTransition component, so that flag is a no-op here. Rather than move a
 * demo-critical app onto an experimental React build, this intercepts
 * same-origin link clicks and runs router.push inside
 * document.startViewTransition. Link keeps its own prefetching; only the click
 * handling changes.
 *
 * Reduced motion takes the plain navigation with no transition at all.
 */
export function ViewTransitions() {
  const router = useRouter();

  useEffect(() => {
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

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      /*
       * Direction is a property of where the tap came from, not of the route.
       * A bottom-tab switch is a sideways move between peers, so it slides
       * laterally. Sidebar and in-content links are a move inward, so they
       * drift forward. The CSS reads this off the root element.
       */
      const fromTabBar = Boolean(anchor.closest('nav[aria-label="Primary"]'));
      document.documentElement.dataset.vt = fromTabBar ? "lateral" : "forward";

      // Claim the navigation before Link does.
      event.preventDefault();
      event.stopPropagation();
      const transition = document.startViewTransition(() => {
        router.push(href);
        // Resolve on the next frame so the new route has committed before the
        // snapshot is taken.
        return new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
      });

      transition.finished
        .catch(() => {})
        .finally(() => {
          delete document.documentElement.dataset.vt;
        });
    }

    // Capture phase on purpose. Next's Link calls preventDefault on the anchor
    // itself, so a bubble-phase listener here always arrives after the
    // navigation has already been claimed and defaultPrevented is set.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
