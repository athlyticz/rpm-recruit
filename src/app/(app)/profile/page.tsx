import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { SkillRadar } from "@/components/charts/skill-radar";
import { getCurrentPlayer, getSkillShape } from "@/lib/data/player";

export const metadata: Metadata = { title: "Player Info" };

const POSITION_LABELS: Record<string, string> = {
  "pitcher-rhp": "Pitcher (RHP)",
  "pitcher-lhp": "Pitcher (LHP)",
  catcher: "Catcher",
  "first-baseman": "First Baseman",
  "second-baseman": "Second Baseman",
  shortstop: "Shortstop",
  "third-baseman": "Third Baseman",
  outfielder: "Outfielder",
};

export default async function ProfilePage() {
  const player = await getCurrentPlayer();
  const { position, axes } = await getSkillShape(player);

  return (
    <>
      <PageHeader
        eyebrow="Section 1"
        title="Player Info"
        subtitle="Identity, contact and the skill shape coaches read first."
        bgText="PLAYER"
      />

      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[340px_1fr] lg:gap-6 lg:items-start">
        <SkillRadar
          axes={axes}
          position={
            position
              ? (POSITION_LABELS[position] ?? position)
              : (player?.position ?? "position")
          }
        />
        <ProfileForm />
      </div>
    </>
  );
}
