export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      farmer_adoptions: {
        Row: {
          adopter_id: string
          adoption_date: string
          created_at: string
          farmer_id: number
          id: string
          monthly_contribution: number
          status: string
          total_contributed: number
          updated_at: string
        }
        Insert: {
          adopter_id: string
          adoption_date?: string
          created_at?: string
          farmer_id: number
          id?: string
          monthly_contribution?: number
          status?: string
          total_contributed?: number
          updated_at?: string
        }
        Update: {
          adopter_id?: string
          adoption_date?: string
          created_at?: string
          farmer_id?: number
          id?: string
          monthly_contribution?: number
          status?: string
          total_contributed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farmer_adoptions_adopter_id_fkey"
            columns: ["adopter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmer_adoptions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      farmer_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          farmer_id: number | null
          id: string
          invite_token: string
          invited_at: string
          invited_by: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          farmer_id?: number | null
          id?: string
          invite_token?: string
          invited_at?: string
          invited_by?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          farmer_id?: number | null
          id?: string
          invite_token?: string
          invited_at?: string
          invited_by?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_invitations_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          account_created_at: string | null
          category_id: string | null
          created_at: string
          crops: string[]
          description: string | null
          farming_experience_years: number | null
          featured: boolean | null
          fundinggoal: number
          fundingraised: number
          id: number
          image_url: string | null
          invite_sent_at: string | null
          invite_token: string | null
          location: string
          name: string
          supporters: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_created_at?: string | null
          category_id?: string | null
          created_at?: string
          crops: string[]
          description?: string | null
          farming_experience_years?: number | null
          featured?: boolean | null
          fundinggoal?: number
          fundingraised?: number
          id?: number
          image_url?: string | null
          invite_sent_at?: string | null
          invite_token?: string | null
          location: string
          name: string
          supporters?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_created_at?: string | null
          category_id?: string | null
          created_at?: string
          crops?: string[]
          description?: string | null
          farming_experience_years?: number | null
          featured?: boolean | null
          fundinggoal?: number
          fundingraised?: number
          id?: number
          image_url?: string | null
          invite_sent_at?: string | null
          invite_token?: string | null
          location?: string
          name?: string
          supporters?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "farmer_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          farmer_id: number | null
          id: string
          message_type: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          farmer_id?: number | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          farmer_id?: number | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          commission_amount: number | null
          created_at: string
          currency: string
          farmer_id: number | null
          id: string
          payment_date: string
          payment_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          commission_amount?: number | null
          created_at?: string
          currency?: string
          farmer_id?: number | null
          id?: string
          payment_date?: string
          payment_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          commission_amount?: number | null
          created_at?: string
          currency?: string
          farmer_id?: number | null
          id?: string
          payment_date?: string
          payment_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      status_updates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          farmer_id: number
          id: string
          image_url: string | null
          update_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          farmer_id: number
          id?: string
          image_url?: string | null
          update_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          farmer_id?: number
          id?: string
          image_url?: string | null
          update_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_updates_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          product_categories: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          product_categories?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          product_categories?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_farmer_invitation: {
        Args: {
          invitation_token: string
          user_password: string
          user_email?: string
        }
        Returns: Json
      }
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_farmers_with_adoption_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          name: string
          location: string
          description: string
          crops: string[]
          farming_experience_years: number
          fundinggoal: number
          fundingraised: number
          supporters: number
          featured: boolean
          image_url: string
          category_name: string
          category_color: string
          category_icon: string
          total_adopters: number
          avg_monthly_contribution: number
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      link_farmer_to_user: {
        Args: { invitation_token: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "farmer" | "adopter" | "supplier" | "investor"
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
      user_role: ["admin", "farmer", "adopter", "supplier", "investor"],
    },
  },
} as const
