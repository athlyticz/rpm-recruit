"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";

export function Topbar() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-ink border-b-2 border-gold col-span-full">
      <div className="flex items-center justify-between px-6 h-14">
        <Link href="/dashboard">
          <Logo />
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href="/settings"
            className="font-condensed text-[11px] font-bold tracking-[0.13em] uppercase text-slate-2 px-4 py-1.5 border border-ink-3 hover:border-gold hover:text-gold transition-colors"
          >
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="font-condensed text-[11px] font-bold tracking-[0.13em] uppercase text-slate-2 px-4 py-1.5 border border-ink-3 hover:border-blood-2 hover:text-blood-2 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
