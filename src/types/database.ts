export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      colleges: {
        Row: {
          acceptance_rate: number | null
          act_25: number | null
          act_75: number | null
          athletics_url: string | null
          campus_setting: string | null
          city: string | null
          college_board_slug: string | null
          conference: string | null
          cost_of_attendance: number | null
          created_at: string
          data_source: string
          division: Database["public"]["Enums"]["college_division"]
          division_detail: string | null
          enrollment: number | null
          gpa_avg: number | null
          id: string
          ipeds_unitid: number | null
          is_active: boolean
          is_public: boolean | null
          latitude: number | null
          longitude: number | null
          majors: string[]
          name: string
          net_price_avg: number | null
          program_notes: string | null
          region: string | null
          roster_cap: number | null
          roster_cap_optin: boolean | null
          sat_25: number | null
          sat_75: number | null
          short_name: string | null
          slug: string
          source_updated_at: string | null
          state: string
          tuition_in_state: number | null
          tuition_out_of_state: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          act_25?: number | null
          act_75?: number | null
          athletics_url?: string | null
          campus_setting?: string | null
          city?: string | null
          college_board_slug?: string | null
          conference?: string | null
          cost_of_attendance?: number | null
          created_at?: string
          data_source?: string
          division: Database["public"]["Enums"]["college_division"]
          division_detail?: string | null
          enrollment?: number | null
          gpa_avg?: number | null
          id?: string
          ipeds_unitid?: number | null
          is_active?: boolean
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          majors?: string[]
          name: string
          net_price_avg?: number | null
          program_notes?: string | null
          region?: string | null
          roster_cap?: number | null
          roster_cap_optin?: boolean | null
          sat_25?: number | null
          sat_75?: number | null
          short_name?: string | null
          slug: string
          source_updated_at?: string | null
          state: string
          tuition_in_state?: number | null
          tuition_out_of_state?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          act_25?: number | null
          act_75?: number | null
          athletics_url?: string | null
          campus_setting?: string | null
          city?: string | null
          college_board_slug?: string | null
          conference?: string | null
          cost_of_attendance?: number | null
          created_at?: string
          data_source?: string
          division?: Database["public"]["Enums"]["college_division"]
          division_detail?: string | null
          enrollment?: number | null
          gpa_avg?: number | null
          id?: string
          ipeds_unitid?: number | null
          is_active?: boolean
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          majors?: string[]
          name?: string
          net_price_avg?: number | null
          program_notes?: string | null
          region?: string | null
          roster_cap?: number | null
          roster_cap_optin?: boolean | null
          sat_25?: number | null
          sat_75?: number | null
          short_name?: string | null
          slug?: string
          source_updated_at?: string | null
          state?: string
          tuition_in_state?: number | null
          tuition_out_of_state?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          act_score: number | null
          bats: string | null
          city_state: string | null
          created_at: string
          first_name: string | null
          gpa: number | null
          grad_year: number | null
          height_inches: number | null
          high_school: string | null
          id: string
          last_name: string | null
          majors: string[] | null
          overall_score: number | null
          position: string | null
          profile_id: string
          ratings: Json | null
          sat_score: number | null
          throws: string | null
          updated_at: string
          weight_lbs: number | null
        }
        Insert: {
          act_score?: number | null
          bats?: string | null
          city_state?: string | null
          created_at?: string
          first_name?: string | null
          gpa?: number | null
          grad_year?: number | null
          height_inches?: number | null
          high_school?: string | null
          id?: string
          last_name?: string | null
          majors?: string[] | null
          overall_score?: number | null
          position?: string | null
          profile_id: string
          ratings?: Json | null
          sat_score?: number | null
          throws?: string | null
          updated_at?: string
          weight_lbs?: number | null
        }
        Update: {
          act_score?: number | null
          bats?: string | null
          city_state?: string | null
          created_at?: string
          first_name?: string | null
          gpa?: number | null
          grad_year?: number | null
          height_inches?: number | null
          high_school?: string | null
          id?: string
          last_name?: string | null
          majors?: string[] | null
          overall_score?: number | null
          position?: string | null
          profile_id?: string
          ratings?: Json | null
          sat_score?: number | null
          throws?: string | null
          updated_at?: string
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_expires_at: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          plan: string | null
          role: string
          stripe_customer_id: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          access_expires_at?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          plan?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          access_expires_at?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          plan?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      college_division: "d1" | "d2" | "d3" | "naia" | "njcaa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      college_division: ["d1", "d2", "d3", "naia", "njcaa"],
    },
  },
} as const

