"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveals its children when they scroll into view.
 *
 * The hidden start state is applied by a class rather than by inline style,
 * and only after the component has mounted and confirmed motion is allowed.
 * If the observer never fires, if the API is missing, or if the platform asks
 * for reduced motion, the content renders in its final state. Content is never
 * hidden by decoration it cannot recover from.
 */
export function Reveal({
  children,
  className = "",
  effect = "reveal",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Which choreography to use. All of them end in the same final state. */
  effect?: "reveal" | "wipe" | "stat";
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /*
   * The observed element and the animated element are deliberately different.
   *
   * An IntersectionObserver computes the target's visible area after clipping,
   * so an element that hides itself with clip-path has an empty intersection
   * rect and never reports as visible: the wipe effect held itself closed
   * forever, and the trajectory chart rendered as an empty card. The outer tag
   * is never styled by the effect, so it is always measurable.
   */
  return (
    <Tag
      // The ref type varies with the tag; the element is only read, never written.
      ref={ref as React.Ref<never>}
      className={className}
    >
      {/* h-full so a card inside a stretched grid cell still fills it: the
          effect wrapper sits between the grid item and the card. */}
      <div
        data-shown={shown ? "true" : "false"}
        style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        className={`h-full ${armed ? effect : ""}`.trim()}
      >
        {children}
      </div>
    </Tag>
  );
}
