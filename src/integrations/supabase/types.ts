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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      trade_entries: {
        Row: {
          brokerage: number | null
          created_at: string | null
          entry_price: number | null
          executed_quantity: number | null
          exit_price: number | null
          gross_pnl: number | null
          id: string
          instrument: string
          is_draft: boolean | null
          mood: string | null
          net_pnl: number | null
          notes: string | null
          sentiment: string | null
          session: string | null
          stop_loss: number | null
          target_price: number | null
          target_quantity: number | null
          trade_date: string
          trade_day: string | null
          trade_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brokerage?: number | null
          created_at?: string | null
          entry_price?: number | null
          executed_quantity?: number | null
          exit_price?: number | null
          gross_pnl?: number | null
          id?: string
          instrument: string
          is_draft?: boolean | null
          mood?: string | null
          net_pnl?: number | null
          notes?: string | null
          sentiment?: string | null
          session?: string | null
          stop_loss?: number | null
          target_price?: number | null
          target_quantity?: number | null
          trade_date: string
          trade_day?: string | null
          trade_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brokerage?: number | null
          created_at?: string | null
          entry_price?: number | null
          executed_quantity?: number | null
          exit_price?: number | null
          gross_pnl?: number | null
          id?: string
          instrument?: string
          is_draft?: boolean | null
          mood?: string | null
          net_pnl?: number | null
          notes?: string | null
          sentiment?: string | null
          session?: string | null
          stop_loss?: number | null
          target_price?: number | null
          target_quantity?: number | null
          trade_date?: string
          trade_day?: string | null
          trade_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          currency: string | null
          default_brokerage: number | null
          id: string
          timezone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          default_brokerage?: number | null
          id?: string
          timezone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          default_brokerage?: number | null
          id?: string
          timezone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      violations: {
        Row: {
          created_at: string | null
          id: string
          severity: string | null
          trade_entry_id: string | null
          user_id: string
          violation_date: string | null
          violation_notes: string | null
          violation_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          severity?: string | null
          trade_entry_id?: string | null
          user_id: string
          violation_date?: string | null
          violation_notes?: string | null
          violation_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          severity?: string | null
          trade_entry_id?: string | null
          user_id?: string
          violation_date?: string | null
          violation_notes?: string | null
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "violations_trade_entry_id_fkey"
            columns: ["trade_entry_id"]
            isOneToOne: false
            referencedRelation: "trade_entries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
