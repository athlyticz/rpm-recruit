export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "player" | "scout" | "coach" | "org_admin";
          plan: string | null;
          stripe_customer_id: string | null;
          subscription_status: string | null;
          access_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "player" | "scout" | "coach" | "org_admin";
          plan?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          access_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      players: {
        Row: {
          id: string;
          profile_id: string;
          first_name: string | null;
          last_name: string | null;
          position: string | null;
          grad_year: number | null;
          high_school: string | null;
          city_state: string | null;
          height_inches: number | null;
          weight_lbs: number | null;
          bats: "R" | "L" | "S" | null;
          throws: "R" | "L" | null;
          gpa: number | null;
          sat_score: number | null;
          act_score: number | null;
          overall_score: number | null;
          ratings: Json | null;
          majors: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          first_name?: string | null;
          last_name?: string | null;
          position?: string | null;
          grad_year?: number | null;
          high_school?: string | null;
          city_state?: string | null;
          height_inches?: number | null;
          weight_lbs?: number | null;
          bats?: "R" | "L" | "S" | null;
          throws?: "R" | "L" | null;
          gpa?: number | null;
          sat_score?: number | null;
          act_score?: number | null;
          overall_score?: number | null;
          ratings?: Json | null;
          majors?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
