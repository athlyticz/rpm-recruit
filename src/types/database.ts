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
      checklist_items: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          grad_year: number | null
          id: string
          is_complete: boolean
          player_id: string
          sort_order: number
          template_key: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          grad_year?: number | null
          id?: string
          is_complete?: boolean
          player_id: string
          sort_order?: number
          template_key?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          grad_year?: number | null
          id?: string
          is_complete?: boolean
          player_id?: string
          sort_order?: number
          template_key?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
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
      evaluations: {
        Row: {
          created_at: string
          derived_from_metric_id: string | null
          evaluated_at: string
          evaluator_id: string | null
          evaluator_role: Database["public"]["Enums"]["evaluator_role"]
          id: string
          notes: string | null
          player_id: string
          score: number
          session_id: string | null
          skill_definition_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          derived_from_metric_id?: string | null
          evaluated_at: string
          evaluator_id?: string | null
          evaluator_role: Database["public"]["Enums"]["evaluator_role"]
          id?: string
          notes?: string | null
          player_id: string
          score: number
          session_id?: string | null
          skill_definition_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          derived_from_metric_id?: string | null
          evaluated_at?: string
          evaluator_id?: string | null
          evaluator_role?: Database["public"]["Enums"]["evaluator_role"]
          id?: string
          notes?: string | null
          player_id?: string
          score?: number
          session_id?: string | null
          skill_definition_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_derived_from_metric_id_fkey"
            columns: ["derived_from_metric_id"]
            isOneToOne: false
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_skill_definition_id_fkey"
            columns: ["skill_definition_id"]
            isOneToOne: false
            referencedRelation: "skill_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          contacted_at: string | null
          contacted_by: string | null
          created_at: string
          current_level: string
          grad_year: number
          id: string
          notes: string | null
          parent_email: string
          parent_name: string
          parent_phone: string
          plan_interest: string | null
          player_first_name: string
          player_last_name: string
          position: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          current_level: string
          grad_year: number
          id?: string
          notes?: string | null
          parent_email: string
          parent_name: string
          parent_phone: string
          plan_interest?: string | null
          player_first_name: string
          player_last_name: string
          position: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          current_level?: string
          grad_year?: number
          id?: string
          notes?: string | null
          parent_email?: string
          parent_name?: string
          parent_phone?: string
          plan_interest?: string | null
          player_first_name?: string
          player_last_name?: string
          position?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          college_id: string
          components: Json
          computed_at: string
          engine_version: string
          id: string
          inputs: Json
          player_id: string
          score: number
        }
        Insert: {
          college_id: string
          components?: Json
          computed_at?: string
          engine_version: string
          id?: string
          inputs?: Json
          player_id: string
          score: number
        }
        Update: {
          college_id?: string
          components?: Json
          computed_at?: string
          engine_version?: string
          id?: string
          inputs?: Json
          player_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_types: {
        Row: {
          category: string | null
          created_at: string
          is_active: boolean
          key: string
          label: string
          lower_is_better: boolean
          sort_order: number
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          is_active?: boolean
          key: string
          label: string
          lower_is_better: boolean
          sort_order?: number
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          is_active?: boolean
          key?: string
          label?: string
          lower_is_better?: boolean
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          created_at: string
          id: string
          measured_at: string
          metric_type: string
          notes: string | null
          player_id: string
          source: string | null
          updated_at: string
          value: number
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          measured_at: string
          metric_type: string
          notes?: string | null
          player_id: string
          source?: string | null
          updated_at?: string
          value: number
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          measured_at?: string
          metric_type?: string
          notes?: string | null
          player_id?: string
          source?: string | null
          updated_at?: string
          value?: number
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_metric_type_fkey"
            columns: ["metric_type"]
            isOneToOne: false
            referencedRelation: "metric_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "metrics_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_log: {
        Row: {
          channel: string
          coach_email: string | null
          coach_name: string | null
          college_id: string | null
          created_at: string
          id: string
          notes: string | null
          player_id: string
          responded_at: string | null
          response_status: string
          school_name: string | null
          sent_at: string
          updated_at: string
        }
        Insert: {
          channel: string
          coach_email?: string | null
          coach_name?: string | null
          college_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          player_id: string
          responded_at?: string | null
          response_status?: string
          school_name?: string | null
          sent_at: string
          updated_at?: string
        }
        Update: {
          channel?: string
          coach_email?: string | null
          coach_name?: string | null
          college_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          player_id?: string
          responded_at?: string | null
          response_status?: string
          school_name?: string | null
          sent_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_log_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_log_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_sessions: {
        Row: {
          avg_velocity: number | null
          balls: number | null
          created_at: string
          earned_runs: number | null
          hits: number | null
          id: string
          innings_pitched: number | null
          max_velocity: number | null
          notes: string | null
          opponent: string | null
          pitches_thrown: number | null
          player_id: string
          runs: number | null
          session_date: string
          strikeouts: number | null
          strikes: number | null
          updated_at: string
          walks: number | null
        }
        Insert: {
          avg_velocity?: number | null
          balls?: number | null
          created_at?: string
          earned_runs?: number | null
          hits?: number | null
          id?: string
          innings_pitched?: number | null
          max_velocity?: number | null
          notes?: string | null
          opponent?: string | null
          pitches_thrown?: number | null
          player_id: string
          runs?: number | null
          session_date: string
          strikeouts?: number | null
          strikes?: number | null
          updated_at?: string
          walks?: number | null
        }
        Update: {
          avg_velocity?: number | null
          balls?: number | null
          created_at?: string
          earned_runs?: number | null
          hits?: number | null
          id?: string
          innings_pitched?: number | null
          max_velocity?: number | null
          notes?: string | null
          opponent?: string | null
          pitches_thrown?: number | null
          player_id?: string
          runs?: number | null
          session_date?: string
          strikeouts?: number | null
          strikes?: number | null
          updated_at?: string
          walks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pitch_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
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
      skill_definitions: {
        Row: {
          created_at: string
          group_heading: string
          id: string
          is_active: boolean
          label: string
          position: string
          scale_metric_type: string | null
          skill_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_heading: string
          id?: string
          is_active?: boolean
          label: string
          position: string
          scale_metric_type?: string | null
          skill_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_heading?: string
          id?: string
          is_active?: boolean
          label?: string
          position?: string
          scale_metric_type?: string | null
          skill_key?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_definitions_scale_metric_type_fkey"
            columns: ["scale_metric_type"]
            isOneToOne: false
            referencedRelation: "metric_types"
            referencedColumns: ["key"]
          },
        ]
      }
      skill_scale_bands: {
        Row: {
          created_at: string
          id: string
          max_value: number | null
          min_value: number | null
          score: number
          skill_definition_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          score: number
          skill_definition_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          score?: number
          skill_definition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_scale_bands_skill_definition_id_fkey"
            columns: ["skill_definition_id"]
            isOneToOne: false
            referencedRelation: "skill_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      owns_player: { Args: { target_player_id: string }; Returns: boolean }
      recompute_overall_score: {
        Args: { target_player_id: string }
        Returns: undefined
      }
    }
    Enums: {
      college_division: "d1" | "d2" | "d3" | "naia" | "njcaa"
      evaluator_role: "self" | "coach" | "scout" | "event"
      verification_status: "self_reported" | "coach_verified" | "event_verified"
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
      evaluator_role: ["self", "coach", "scout", "event"],
      verification_status: [
        "self_reported",
        "coach_verified",
        "event_verified",
      ],
    },
  },
} as const

