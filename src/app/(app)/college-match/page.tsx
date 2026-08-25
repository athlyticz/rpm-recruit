import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { MatchResults } from "@/components/match/match-results";
import { LoadFailure, EmptyState } from "@/components/ui/states";
import {
  getCurrentPlayer,
  getColleges,
  getMetricLevers,
  getCurrentRatings,
} from "@/lib/data/player";
import { scoreAll, type MatchResult } from "@/lib/match/interim-scorer";
import type { Database } from "@/types/database";

export const metadata: Metadata = { title: "College Match" };

type Player = Database["public"]["Tables"]["players"]["Row"];

/**
 * A stand-in player used only when the visitor has no player row yet, so the
 * screen can still demonstrate real scoring against real programs. Every value
 * is null, which means every component reports itself as unavailable rather
 * than inventing a profile.
 */
const EMPTY_PLAYER: Player = {
  id: "",
  profile_id: "",
  first_name: null,
  last_name: null,
  position: null,
  grad_year: null,
  high_school: null,
  city_state: null,
  height_inches: null,
  weight_lbs: null,
  bats: null,
  throws: null,
  gpa: null,
  sat_score: null,
  act_score: null,
  overall_score: null,
  majors: null,
  created_at: "",
  updated_at: "",
};

/** Components that no school could compute, so the disclosure is accurate. */
function componentsMissingEverywhere(results: MatchResult[]): string[] {
  if (results.length === 0) return [];
  const labels = results[0].components.map((c) => c.label);
  return labels.filter((label) =>
    results.every((r) => r.components.find((c) => c.label === label)?.score === null)
  );
}

const SHELL = "px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14 max-w-[1100px]";

function Header() {
  return (
    <PageHeader
      eyebrow="Match Engine"
      title="College Program Finder"
      subtitle="Programs scored on your real profile against every level. Open any result to see exactly how the number was reached."
      bgText="MATCH"
    />
  );
}

/**
 * There is deliberately no Suspense boundary or loading.tsx on this route.
 *
 * Both were tried and both silently broke hydration on a hard load: the server
 * HTML rendered correctly, no error surfaced in the console or the server log,
 * and the entire results subtree never became interactive. Tabs and
 * disclosures did nothing until the user navigated client-side. Verified three
 * ways: with route-level loading.tsx (dead), with an in-page Suspense boundary
 * (dead), and with neither (alive), against a clean production build. Dev mode
 * hydrates fine in all three, which is why this survived a previous review.
 *
 * A skeleton is worth having and this one is written and ready in
 * components/ui/states.tsx, but it is not worth a flagship screen that cannot
 * be clicked. Restore it once the boundary can be added without killing
 * hydration on this Next version.
 */
async function MatchResultsSection() {
  const [player, collegesResult] = await Promise.all([getCurrentPlayer(), getColleges()]);
  const [metricLevers, currentRatings] = await Promise.all([
    getMetricLevers(player),
    getCurrentRatings(player),
  ]);

  // A failed load and an empty table are different facts and get different
  // screens. Never let one read as the other.
  if (collegesResult.error !== null) {
    return (
      <LoadFailure
        title="Could not load the program database"
        what="The college programs"
        reason={collegesResult.error}
      />
    );
  }

  const colleges = collegesResult.data;

  if (colleges.length === 0) {
    return (
      <EmptyState
        title="No programs in the database yet"
        body="The program database loaded correctly and is empty. Once programs are seeded they will be scored against your profile here."
      />
    );
  }

  const results = scoreAll(player ?? EMPTY_PLAYER, colleges);

  return (
    <MatchResults
      results={results}
      missingComponents={componentsMissingEverywhere(results)}
      hasPlayer={player !== null}
      player={player ?? EMPTY_PLAYER}
      colleges={colleges}
      metricLevers={metricLevers}
      currentRatings={currentRatings}
    />
  );
}

export default function CollegeMatchPage() {
  return (
    <>
      <Header />
      <div className={SHELL}>
        <MatchResultsSection />
      </div>
    </>
  );
}
