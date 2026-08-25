import { AlertOctagon, Inbox } from "lucide-react";

/**
 * A load that failed and a table that is empty must never look alike.
 *
 * Failure is loud, oxblood, names the reason, and says the data exists but
 * could not be reached. Empty is quiet, neutral, and says there is genuinely
 * nothing there yet. Confusing the two is the exact ambiguity this product
 * exists to eliminate, so they share no styling.
 */
export function LoadFailure({
  title,
  reason,
  what,
}: {
  title: string;
  /** The underlying error, shown verbatim. */
  reason: string;
  /** What could not be loaded, in plain words. */
  what: string;
}) {
  return (
    <div
      role="alert"
      className="border-2 border-blood bg-blood/[0.07] rounded-md p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <AlertOctagon size={20} className="text-blood-2 shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0">
          <h2 className="font-display text-title font-bold text-blood-2 text-balance">
            {title}
          </h2>
          <p className="text-body text-ink-4 mt-1 text-pretty">
            {what} could not be loaded, so nothing below is complete. This is a fault, not an
            empty result: the data exists and we failed to reach it.
          </p>
          <p className="font-mono text-meta text-ink-5 mt-2.5 bg-white/70 border border-blood/20 rounded-xs px-2.5 py-1.5 break-words">
            {reason}
          </p>
          <p className="text-caption text-ink-5 mt-2.5">
            Reload the page. If it persists, the database connection needs attention.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-bone-3 bg-white rounded-md px-5 py-6 text-center">
      <Inbox size={20} className="text-bone-3 mx-auto mb-2" aria-hidden />
      <p className="font-display text-title-sm font-bold text-ink text-balance">{title}</p>
      <p className="text-caption text-ink-5 max-w-[46ch] mx-auto mt-1 text-pretty">{body}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeletons                                                  */
/* ------------------------------------------------------------------ */

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block bg-bone-2 rounded-xs relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent motion-safe:after:animate-shimmer ${className}`}
    />
  );
}

export function GaugeSkeleton() {
  return (
    <section className="bg-ink border border-ink-2 rounded-lg px-5 py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <span
        aria-hidden
        className="size-[280px] max-w-full rounded-pill border-8 border-ink-3 shrink-0"
      />
      <span className="w-full min-w-0 space-y-2">
        <Shimmer className="h-3 w-28 bg-ink-3" />
        <Shimmer className="h-7 w-48 bg-ink-3" />
        <Shimmer className="h-3 w-full max-w-[36ch] bg-ink-3" />
      </span>
    </section>
  );
}

export function CardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="bg-white border border-black/[0.07] rounded-md shadow-sm px-4 py-3.5 flex items-start gap-3"
        >
          <Shimmer className="h-3 w-4 shrink-0 mt-1" />
          <span className="flex-1 min-w-0 space-y-2">
            <Shimmer className="h-4 w-2/3" />
            <Shimmer className="h-2.5 w-1/3" />
          </span>
          <Shimmer className="h-7 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="space-y-4">
      <p className="sr-only" role="status">
        {label}
      </p>
      <GaugeSkeleton />
      <CardSkeleton />
    </div>
  );
}
