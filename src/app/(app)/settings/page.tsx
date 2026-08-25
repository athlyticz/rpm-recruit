import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Manage your account, subscription, and preferences."
        bgText="SETTINGS"
      />
      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14">
        <div className="bg-white border border-black/[0.06] shadow-sm p-5">
          <p className="text-sm text-slate">Account settings & billing — to be implemented.</p>
        </div>
      </div>
    </>
  );
}
