import { redirect } from "next/navigation";
import { Topbar } from "@/components/app/topbar";
import { Sidebar } from "@/components/app/sidebar";
import { BottomNav } from "@/components/app/bottom-nav";
import { ViewTransitions } from "@/components/app/view-transitions";

// The authenticated shell is always rendered per request, never prerendered,
// so the auth guard below runs on every visit.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseConfigured) {
    // Fail closed in production. A missing or misnamed env var must never
    // open the app; it has to be a hard error instead.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Supabase is not configured. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to serve authenticated routes."
      );
    }
    // Local development only: allow access without auth.
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }

  return (
    <div className="min-h-dvh bg-bone">
      <Topbar />

      <div className="flex">
        <Sidebar />

        {/* min-w-0 stops long content from forcing the flex row wider than the
            viewport, which is what produces horizontal scroll on phones. */}
        <main className="flex-1 min-w-0 pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>
      </div>

      <BottomNav />
      <ViewTransitions />
    </div>
  );
}
