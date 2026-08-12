export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      announcement_reads: {
        Row: {
          announcement_id: string
          created_at: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          audience: Database["public"]["Enums"]["app_role"] | null
          author_id: string | null
          body: string
          category: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_pinned: boolean
          is_published: boolean
          priority: Database["public"]["Enums"]["announcement_priority"]
          published_at: string | null
          status: Database["public"]["Enums"]["announcement_status"]
          target_departments: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["app_role"] | null
          author_id?: string | null
          body: string
          category?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          priority?: Database["public"]["Enums"]["announcement_priority"]
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          target_departments?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["app_role"] | null
          author_id?: string | null
          body?: string
          category?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          priority?: Database["public"]["Enums"]["announcement_priority"]
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          target_departments?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          ai: Json
          appearance: Json
          created_at: string
          id: string
          notifications: Json
          practice: Json
          school: Json
          security: Json
          updated_at: string
          updated_by: string | null
          users: Json
        }
        Insert: {
          ai?: Json
          appearance?: Json
          created_at?: string
          id?: string
          notifications?: Json
          practice?: Json
          school?: Json
          security?: Json
          updated_at?: string
          updated_by?: string | null
          users?: Json
        }
        Update: {
          ai?: Json
          appearance?: Json
          created_at?: string
          id?: string
          notifications?: Json
          practice?: Json
          school?: Json
          security?: Json
          updated_at?: string
          updated_by?: string | null
          users?: Json
        }
        Relationships: []
      }
      challenge_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          category_id: string
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["challenge_difficulty"]
          display_order: number
          estimated_duration_minutes: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          difficulty?: Database["public"]["Enums"]["challenge_difficulty"]
          display_order?: number
          estimated_duration_minutes?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["challenge_difficulty"]
          display_order?: number
          estimated_duration_minutes?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "challenge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          confidence: number
          created_at: string
          duration_minutes: number
          fluency: number
          grammar: number
          id: string
          message_count: number
          mode_title: string
          notes: string | null
          overall: number
          updated_at: string
          user_id: string
          vocabulary: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          duration_minutes?: number
          fluency?: number
          grammar?: number
          id?: string
          message_count?: number
          mode_title: string
          notes?: string | null
          overall?: number
          updated_at?: string
          user_id: string
          vocabulary?: number
        }
        Update: {
          confidence?: number
          created_at?: string
          duration_minutes?: number
          fluency?: number
          grammar?: number
          id?: string
          message_count?: number
          mode_title?: string
          notes?: string | null
          overall?: number
          updated_at?: string
          user_id?: string
          vocabulary?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          login_id: string
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          login_id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          login_id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_progress: {
        Row: {
          challenge_date: string
          challenge_id: string
          completed: boolean
          completed_at: string | null
          completion_time_seconds: number | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_date?: string
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_date?: string
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_items: {
        Row: {
          bucket: string
          created_at: string
          id: string
          item_id: string
          namespace: string
          user_id: string
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: string
          item_id: string
          namespace: string
          user_id: string
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: string
          item_id?: string
          namespace?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          conversation_count: number
          created_at: string
          daily_streak: number
          growth_score: number
          last_session_date: string | null
          longest_streak: number
          monthly_goal_minutes: number
          practice_minutes: number
          updated_at: string
          user_id: string
          weekly_goal_minutes: number
          xp: number
        }
        Insert: {
          conversation_count?: number
          created_at?: string
          daily_streak?: number
          growth_score?: number
          last_session_date?: string | null
          longest_streak?: number
          monthly_goal_minutes?: number
          practice_minutes?: number
          updated_at?: string
          user_id: string
          weekly_goal_minutes?: number
          xp?: number
        }
        Update: {
          conversation_count?: number
          created_at?: string
          daily_streak?: number
          growth_score?: number
          last_session_date?: string | null
          longest_streak?: number
          monthly_goal_minutes?: number
          practice_minutes?: number
          updated_at?: string
          user_id?: string
          weekly_goal_minutes?: number
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      announcement_priority: "low" | "normal" | "high" | "urgent"
      announcement_status: "draft" | "published" | "scheduled"
      app_role:
        | "admin"
        | "teacher"
        | "receptionist"
        | "office_staff"
        | "support_staff"
      challenge_difficulty: "beginner" | "intermediate" | "advanced"
      user_status: "active" | "inactive" | "suspended"
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
  public: {
    Enums: {
      announcement_priority: ["low", "normal", "high", "urgent"],
      announcement_status: ["draft", "published", "scheduled"],
      app_role: [
        "admin",
        "teacher",
        "receptionist",
        "office_staff",
        "support_staff",
      ],
      challenge_difficulty: ["beginner", "intermediate", "advanced"],
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const
