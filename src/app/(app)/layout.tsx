import { redirect } from "next/navigation";
import { Topbar } from "@/components/app/topbar";
import { Sidebar } from "@/components/app/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseConfigured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }
  // When Supabase is not configured, allow access for local development

  return (
    <div className="grid grid-cols-[236px_1fr] grid-rows-[56px_1fr] min-h-screen">
      <Topbar />
      <Sidebar />
      <main className="bg-bone h-[calc(100vh-56px)] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
