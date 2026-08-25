import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Player = Database["public"]["Tables"]["players"]["Row"];
export type College = Database["public"]["Tables"]["colleges"]["Row"];

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** The signed-in user's player row, or null when there is not one yet. */
export async function getCurrentPlayer(): Promise<Player | null> {
  if (!supabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getCurrentPlayer:", error.message);
    return null;
  }
  return data;
}

export async function getProfileName(): Promise<string> {
  if (!supabaseConfigured()) return "Player";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (user?.user_metadata?.full_name as string | undefined) || "Player";
}

/** Every active program, ordered so the list is stable between renders. */
export async function getColleges(): Promise<College[]> {
  if (!supabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("getColleges:", error.message);
    return [];
  }
  return data ?? [];
}
