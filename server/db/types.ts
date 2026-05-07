export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          industry: string;
          phone: string;
          whatsapp: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry: string;
          phone: string;
          whatsapp: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["businesses"]["Insert"]>;
        Relationships: [];
      };
      business_settings: {
        Row: {
          business_id: string;
          automation_items: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          business_id: string;
          automation_items?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_settings"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string;
          source: string;
          status: string;
          estimated_value_agorot: number;
          interest_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone: string;
          source: string;
          status: string;
          estimated_value_agorot?: number;
          interest_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          price_agorot: number;
          stock: number;
          tag: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          price_agorot?: number;
          stock?: number;
          tag: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      calendar_slots: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          window_label: string;
          starts_at: string | null;
          ends_at: string | null;
          status: string;
          owner: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          window_label: string;
          starts_at?: string | null;
          ends_at?: string | null;
          status: string;
          owner: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_slots"]["Insert"]>;
        Relationships: [];
      };
      sales_calls: {
        Row: {
          id: string;
          business_id: string;
          agent_id: string | null;
          provider_call_id: string | null;
          lead_id: string | null;
          lead_name: string;
          phone: string;
          interest: string;
          status: string;
          summary: string | null;
          transcript: string | null;
          recording_url: string | null;
          ended_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          agent_id?: string | null;
          provider_call_id?: string | null;
          lead_id?: string | null;
          lead_name: string;
          phone: string;
          interest: string;
          status: string;
          summary?: string | null;
          transcript?: string | null;
          recording_url?: string | null;
          ended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sales_calls"]["Insert"]>;
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          persona: string;
          services_text: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          persona?: string;
          services_text?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
        Relationships: [];
      };
      business_users: {
        Row: {
          user_id: string;
          business_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          business_id: string;
          role?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_users"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
