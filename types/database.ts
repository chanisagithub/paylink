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
      profiles: {
        Row: {
          id: string;
          business_name: string;
          logo_url: string | null;
          brand_color: string;
          created_at: string;
        };
        Insert: {
          id: string;
          business_name?: string;
          logo_url?: string | null;
          brand_color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          brand_color?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_links: {
        Row: {
          id: string;
          merchant_id: string;
          slug: string;
          title: string;
          description: string | null;
          amount: number;
          currency: string;
          is_active: boolean;
          stripe_price_id: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          slug: string;
          title: string;
          description?: string | null;
          amount: number;
          currency?: string;
          is_active?: boolean;
          stripe_price_id?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          amount?: number;
          currency?: string;
          is_active?: boolean;
          stripe_price_id?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_links_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      link_views: {
        Row: {
          id: string;
          link_id: string;
          viewed_at: string;
          ip_hash: string;
          user_agent: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          link_id: string;
          viewed_at?: string;
          ip_hash: string;
          user_agent?: string | null;
          referrer?: string | null;
        };
        Update: {
          id?: string;
          link_id?: string;
          viewed_at?: string;
          ip_hash?: string;
          user_agent?: string | null;
          referrer?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "link_views_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "payment_links";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          link_id: string;
          stripe_session_id: string;
          amount_paid: number;
          currency: string;
          payer_email: string | null;
          status: "pending" | "completed" | "failed" | "refunded";
          paid_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          link_id: string;
          stripe_session_id: string;
          amount_paid: number;
          currency: string;
          payer_email?: string | null;
          status: "pending" | "completed" | "failed" | "refunded";
          paid_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          link_id?: string;
          stripe_session_id?: string;
          amount_paid?: number;
          currency?: string;
          payer_email?: string | null;
          status?: "pending" | "completed" | "failed" | "refunded";
          paid_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "payment_links";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];
