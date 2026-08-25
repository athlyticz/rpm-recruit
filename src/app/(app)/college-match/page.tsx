import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { MatchResults } from "@/components/match/match-results";
import { LoadFailure, EmptyState } from "@/components/ui/states";
import { getCurrentPlayer, getColleges } from "@/lib/data/player";
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

export default async function CollegeMatchPage() {
  const [player, collegesResult] = await Promise.all([getCurrentPlayer(), getColleges()]);

  const header = (
    <PageHeader
      eyebrow="Match Engine"
      title="College Program Finder"
      subtitle="Programs scored on your real profile against every level. Open any result to see exactly how the number was reached."
      bgText="MATCH"
    />
  );
  const shell = "px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14";

  // A failed load and an empty table are different facts and get different
  // screens. Never let one read as the other.
  if (collegesResult.error !== null) {
    return (
      <>
        {header}
        <div className={shell}>
          <LoadFailure
            title="Could not load the program database"
            what="The college programs"
            reason={collegesResult.error}
          />
        </div>
      </>
    );
  }

  const colleges = collegesResult.data;

  if (colleges.length === 0) {
    return (
      <>
        {header}
        <div className={shell}>
          <EmptyState
            title="No programs in the database yet"
            body="The program database loaded correctly and is empty. Once programs are seeded they will be scored against your profile here."
          />
        </div>
      </>
    );
  }

  const results = scoreAll(player ?? EMPTY_PLAYER, colleges);
  const missing = componentsMissingEverywhere(results);

  return (
    <>
      {header}
      <div className={shell}>
        <MatchResults
          results={results}
          missingComponents={missing}
          hasPlayer={player !== null}
        />
      </div>
    </>
  );
}
