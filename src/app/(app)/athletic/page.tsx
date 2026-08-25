import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { AthleticForm } from "@/components/athletic/athletic-form";
import { Trajectory, type TrajectorySeries } from "@/components/charts/trajectory";
import { getCurrentPlayer, getTrajectory } from "@/lib/data/player";

export const metadata: Metadata = { title: "Athletic Profile" };

export default async function AthleticPage() {
  const player = await getCurrentPlayer();
  const { types, metrics, bands } = await getTrajectory(player?.id ?? null);

  // One series per metric type. Types with no measurements are kept out of the
  // chart entirely rather than drawn as an empty line, and the component's
  // dormant state covers the case where none of them have any.
  const series: TrajectorySeries[] = types.map((type) => ({
    type,
    points: metrics.filter((m) => m.metric_type === type.key),
    bands: bands.get(type.key) ?? [],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Section 2"
        title="Athletic Profile"
        subtitle="Physical measurements compared against professional and high school benchmarks."
        bgText="ATHLETIC"
      />

      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14 space-y-6 max-w-[1100px]">
        <Trajectory series={series} />
        <AthleticForm />
      </div>
    </>
  );
}
