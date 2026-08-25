"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-ink border-b-2 border-gold">
      <div className="flex items-center justify-between h-topbar px-gutter lg:px-gutter-lg">
        <Link href="/dashboard" className="pressable focusable flex items-center min-h-touch">
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          {/* Phone: icon-only, so the header never crowds at 390px. */}
          <Link
            href="/settings"
            aria-label="Settings"
            className="pressable focusable sm:hidden flex items-center justify-center size-touch text-slate-2 active:text-gold"
          >
            <Settings size={19} aria-hidden />
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="pressable focusable sm:hidden flex items-center justify-center size-touch text-slate-2 active:text-blood-2"
          >
            <LogOut size={19} aria-hidden />
          </button>

          <Link
            href="/settings"
            className="pressable focusable hidden sm:flex items-center font-condensed text-meta font-bold tracking-[0.13em] uppercase text-slate-2 px-4 h-9 border border-ink-3 rounded-sm hover:border-gold hover:text-gold transition-colors dur-fast"
          >
            Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="pressable focusable hidden sm:flex items-center font-condensed text-meta font-bold tracking-[0.13em] uppercase text-slate-2 px-4 h-9 border border-ink-3 rounded-sm hover:border-blood-2 hover:text-blood-2 transition-colors dur-fast"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
