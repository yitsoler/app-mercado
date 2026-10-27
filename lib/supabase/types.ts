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
      allowed_emails: {
        Row: {
          created_at: string;
          email: string;
          household_id: string;
          id: string;
        };
        Insert: {
          email: string;
          household_id: string;
        };
        Update: {
          email?: string;
        };
        Relationships: [];
      };
      household_members: {
        Row: {
          created_at: string;
          household_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          household_id: string;
          role?: string;
          user_id: string;
        };
        Update: {
          role?: string;
        };
        Relationships: [];
      };
      households: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          monthly_budget: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string;
          id?: string;
          monthly_budget?: number;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          monthly_budget?: number;
        };
        Relationships: [];
      };
      market_items: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          market_id: string;
          product_id: string | null;
          product_name: string;
          purchased: boolean;
          quantity: number;
          unit: string;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          household_id: string;
          market_id: string;
          product_id?: string | null;
          product_name: string;
          purchased?: boolean;
          quantity: number;
          unit: string;
          unit_price?: number;
        };
        Update: {
          market_id?: string;
          purchased?: boolean;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [];
      };
      markets: {
        Row: {
          created_at: string;
          extra_items_count: number;
          extra_items_total: number;
          household_id: string;
          id: string;
          market_date: string;
          payment: string;
          status: string;
          store_id: string | null;
          store_name: string;
          ticket: string | null;
          trip_id: string | null;
          updated_at: string;
        };
        Insert: {
          household_id: string;
          store_id?: string | null;
          store_name: string;
          market_date: string;
          status: string;
          payment?: string;
          ticket?: string | null;
          trip_id?: string | null;
          extra_items_count?: number;
          extra_items_total?: number;
        };
        Update: {
          store_id?: string | null;
          store_name?: string;
          status?: string;
          payment?: string;
          trip_id?: string | null;
        };
        Relationships: [];
      };
      price_history: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          product_id: string;
          purchased_on: string;
          quantity: number;
          store_name: string;
          total: number;
          unit_price: number;
        };
        Insert: {
          household_id: string;
          product_id: string;
          purchased_on: string;
          quantity: number;
          store_name: string;
          total: number;
          unit_price: number;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      products: {
        Row: {
          category_id: string;
          created_at: string;
          frequency_days: number;
          habitual_quantity: number;
          household_id: string;
          id: string;
          last_price: number;
          last_purchased_at: string | null;
          last_store: string;
          name: string;
          next_purchase_date: string | null;
          note: string;
          selected: boolean;
          unit: string;
          updated_at: string;
        };
        Insert: {
          household_id: string;
          name: string;
          category_id: string;
          note?: string;
          habitual_quantity?: number;
          unit: string;
          selected?: boolean;
        };
        Update: {
          name?: string;
          category_id?: string;
          note?: string;
          habitual_quantity?: number;
          unit?: string;
          last_price?: number;
          last_purchased_at?: string | null;
          last_store?: string;
          frequency_days?: number;
          next_purchase_date?: string | null;
          selected?: boolean;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          household_id: string;
          id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          household_id: string;
          display_name?: string;
          user_id?: string | null;
        };
        Update: {
          display_name?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          name: string;
        };
        Insert: {
          household_id: string;
          name: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_request_login: {
        Args: { p_email: string };
        Returns: boolean;
      };
      join_household: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
