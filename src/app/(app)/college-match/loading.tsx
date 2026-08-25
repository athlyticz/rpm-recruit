import { PageHeader } from "@/components/app/page-header";
import { LoadingScreen } from "@/components/ui/states";

export default function Loading() {
  return (
    <>
      <PageHeader
        eyebrow="Match Engine"
        title="College Program Finder"
        subtitle="Programs scored on your real profile against every level."
        bgText="MATCH"
      />
      <LoadingScreen label="Scoring programs against your profile" />
    </>
  );
}
