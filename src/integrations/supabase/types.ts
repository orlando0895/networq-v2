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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          added_date: string
          added_via: string | null
          company: string | null
          company_logo_url: string | null
          created_at: string
          email: string
          facebook: string | null
          id: string
          industry: string | null
          linkedin: string | null
          name: string
          notes: string | null
          phone: string | null
          profile_picture_url: string | null
          services: string[] | null
          tier: string
          updated_at: string
          user_id: string
          websites: string[] | null
          whatsapp: string | null
        }
        Insert: {
          added_date?: string
          added_via?: string | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string
          email: string
          facebook?: string | null
          id?: string
          industry?: string | null
          linkedin?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          services?: string[] | null
          tier: string
          updated_at?: string
          user_id: string
          websites?: string[] | null
          whatsapp?: string | null
        }
        Update: {
          added_date?: string
          added_via?: string | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string
          email?: string
          facebook?: string | null
          id?: string
          industry?: string | null
          linkedin?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          services?: string[] | null
          tier?: string
          updated_at?: string
          user_id?: string
          websites?: string[] | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          deleted_at: string | null
          id: string
          joined_at: string
          last_read_at: string | null
          muted_until: string | null
          notifications_enabled: boolean
          user_id: string
        }
        Insert: {
          conversation_id: string
          deleted_at?: string | null
          id?: string
          joined_at?: string
          last_read_at?: string | null
          muted_until?: string | null
          notifications_enabled?: boolean
          user_id: string
        }
        Update: {
          conversation_id?: string
          deleted_at?: string | null
          id?: string
          joined_at?: string
          last_read_at?: string | null
          muted_until?: string | null
          notifications_enabled?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      discovery_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          viewed_user_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          viewed_user_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          viewed_user_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      event_attendee_privacy: {
        Row: {
          allow_messages: boolean
          created_at: string
          event_id: string
          id: string
          show_contact_info: boolean
          show_profile: boolean
          user_id: string
        }
        Insert: {
          allow_messages?: boolean
          created_at?: string
          event_id: string
          id?: string
          show_contact_info?: boolean
          show_profile?: boolean
          user_id: string
        }
        Update: {
          allow_messages?: boolean
          created_at?: string
          event_id?: string
          id?: string
          show_contact_info?: boolean
          show_profile?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendee_privacy_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_comments: {
        Row: {
          content: string
          created_at: string
          event_id: string
          id: string
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "event_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      event_connections: {
        Row: {
          created_at: string
          event_id: string
          id: string
          message: string | null
          recipient_id: string
          requester_id: string
          status: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          message?: string | null
          recipient_id: string
          requester_id: string
          status?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          message?: string | null
          recipient_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_connections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_updates: {
        Row: {
          content: string
          created_at: string
          created_by: string
          event_id: string
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          event_id: string
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          event_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_updates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          contact_info: Json | null
          created_at: string
          created_by: string
          current_attendees: number | null
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          image_url: string | null
          is_public: boolean | null
          latitude: number
          location_name: string
          longitude: number
          max_attendees: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_info?: Json | null
          created_at?: string
          created_by: string
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          latitude: number
          location_name: string
          longitude: number
          max_attendees?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          latitude?: number
          location_name?: string
          longitude?: number
          max_attendees?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          delivered_at: string | null
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          message_type: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          discovery_radius: number | null
          discovery_settings: Json | null
          discovery_visible: boolean | null
          email: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          is_premium: boolean
          job_title: string | null
          last_active_at: string | null
          latitude: number | null
          linkedin_url: string | null
          location_name: string | null
          longitude: number | null
          subscription_expires_at: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          discovery_radius?: number | null
          discovery_settings?: Json | null
          discovery_visible?: boolean | null
          email?: string | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          is_premium?: boolean
          job_title?: string | null
          last_active_at?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          location_name?: string | null
          longitude?: number | null
          subscription_expires_at?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          discovery_radius?: number | null
          discovery_settings?: Json | null
          discovery_visible?: boolean | null
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          is_premium?: boolean
          job_title?: string | null
          last_active_at?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          location_name?: string | null
          longitude?: number | null
          subscription_expires_at?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_boosts: {
        Row: {
          boost_type: string
          created_at: string
          currency: string
          expires_at: string
          id: string
          is_active: boolean
          purchase_amount: number
          started_at: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          boost_type: string
          created_at?: string
          currency?: string
          expires_at: string
          id?: string
          is_active?: boolean
          purchase_amount: number
          started_at?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          boost_type?: string
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          purchase_amount?: number
          started_at?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_contact_cards: {
        Row: {
          avatar_url: string | null
          company: string | null
          company_logo_url: string | null
          created_at: string
          email: string
          facebook: string | null
          id: string
          industry: string | null
          is_active: boolean
          linkedin: string | null
          name: string
          notes: string | null
          phone: string | null
          public_visibility: Json | null
          services: string[] | null
          share_code: string
          updated_at: string
          user_id: string
          username: string | null
          websites: string[] | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string
          email: string
          facebook?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          linkedin?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          public_visibility?: Json | null
          services?: string[] | null
          share_code?: string
          updated_at?: string
          user_id: string
          username?: string | null
          websites?: string[] | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string
          email?: string
          facebook?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          linkedin?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          public_visibility?: Json | null
          services?: string[] | null
          share_code?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          websites?: string[] | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_location_settings: {
        Row: {
          auto_location: boolean | null
          created_at: string
          default_radius: number
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_location?: boolean | null
          created_at?: string
          default_radius?: number
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_location?: boolean | null
          created_at?: string
          default_radius?: number
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          conversation_id: string | null
          created_at: string
          description: string | null
          id: string
          message_id: string | null
          reason: string
          reported_id: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          message_id?: string | null
          reason: string
          reported_id: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          message_id?: string | null
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_user_boost: {
        Args: {
          boost_type_param: string
          stripe_payment_intent_id_param?: string
          user_uuid: string
        }
        Returns: string
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      check_subscription_expiry: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_boosts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_group_conversation: {
        Args: { participant_ids: string[] }
        Returns: string
      }
      current_user_is_premium: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      delete_mutual_contact: {
        Args: { contact_id_to_delete: string; current_user_id: string }
        Returns: boolean
      }
      generate_username_from_name: {
        Args: { _name: string }
        Returns: string
      }
      get_boost_pricing: {
        Args: Record<PropertyKey, never>
        Returns: {
          boost_type: string
          currency: string
          description: string
          display_name: string
          duration_hours: number
          price_cents: number
        }[]
      }
      get_events_within_radius: {
        Args: {
          limit_count?: number
          radius_km?: number
          user_lat: number
          user_lon: number
        }
        Returns: {
          address: string
          created_by: string
          current_attendees: number
          description: string
          distance_km: number
          end_date: string
          event_date: string
          id: string
          image_url: string
          latitude: number
          location_name: string
          longitude: number
          max_attendees: number
          tags: string[]
          title: string
        }[]
      }
      get_or_create_direct_conversation: {
        Args: { other_user_id: string }
        Returns: string
      }
      get_user_discovery_stats: {
        Args: { user_uuid: string }
        Returns: {
          active_boost_expires_at: string
          discovery_visible: boolean
          profile_likes: number
          profile_views: number
        }[]
      }
      get_user_event_rsvps: {
        Args: Record<PropertyKey, never>
        Returns: {
          event_id: string
          status: string
        }[]
      }
      get_user_location_settings: {
        Args: { user_uuid: string }
        Returns: {
          auto_location: boolean | null
          created_at: string
          default_radius: number
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          updated_at: string
          user_id: string
        }
      }
      get_user_premium_status: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["subscription_status"]
      }
      get_users_for_discovery: {
        Args: {
          current_user_lat: number
          current_user_lon: number
          exclude_viewed?: boolean
          limit_count?: number
          radius_km?: number
        }
        Returns: {
          avatar_url: string
          bio: string
          company: string
          distance_km: number
          full_name: string
          has_boost: boolean
          id: string
          interests: string[]
          is_premium: boolean
          job_title: string
          last_active_at: string
          location_name: string
        }[]
      }
      handle_event_rsvp: {
        Args: { event_uuid: string; rsvp_status: string }
        Returns: Json
      }
      is_user_premium: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      record_discovery_interaction: {
        Args: { interaction_type_param: string; viewed_user_uuid: string }
        Returns: string
      }
      regenerate_share_code: {
        Args: { card_id: string }
        Returns: string
      }
      search_messages_in_conversation: {
        Args: {
          conversation_id_param: string
          limit_param?: number
          search_query: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          message_type: string
          rank: number
          sender_id: string
          sender_name: string
        }[]
      }
      toggle_conversation_mute: {
        Args: { conversation_id_param: string; mute_duration_hours?: number }
        Returns: undefined
      }
      update_user_last_active: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_active_boost: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      user_is_in_conversation: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      subscription_status: "free" | "premium" | "enterprise"
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
      subscription_status: ["free", "premium", "enterprise"],
    },
  },
} as const
