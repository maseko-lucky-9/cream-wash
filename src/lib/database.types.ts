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
      employees: {
        Row: {
          id: string;
          name: string;
          pin: string;
          role: "staff" | "owner";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          pin: string;
          role?: "staff" | "owner";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          pin?: string;
          role?: "staff" | "owner";
          created_at?: string;
        };
      };
      bays: {
        Row: {
          id: string;
          name: string;
          status: "idle" | "in_progress";
          current_job_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: "idle" | "in_progress";
          current_job_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: "idle" | "in_progress";
          current_job_id?: string | null;
          created_at?: string;
        };
      };
      wash_tiers: {
        Row: {
          id: string;
          name: string;
          price_zar: number;
          duration_minutes: number;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price_zar: number;
          duration_minutes: number;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_zar?: number;
          duration_minutes?: number;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          bay_id: string | null;
          employee_id: string | null;
          wash_tier_id: string;
          customer_name: string;
          customer_phone: string;
          plate_number: string | null;
          source: "walk_in" | "booking";
          status: "queued" | "in_progress" | "completed";
          queued_at: string;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bay_id?: string | null;
          employee_id?: string | null;
          wash_tier_id: string;
          customer_name: string;
          customer_phone: string;
          plate_number?: string | null;
          source: "walk_in" | "booking";
          status?: "queued" | "in_progress" | "completed";
          queued_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bay_id?: string | null;
          employee_id?: string | null;
          wash_tier_id?: string;
          customer_name?: string;
          customer_phone?: string;
          plate_number?: string | null;
          source?: "walk_in" | "booking";
          status?: "queued" | "in_progress" | "completed";
          queued_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          wash_tier_id: string;
          date: string;
          time_slot: string;
          status: "confirmed" | "checked_in" | "cancelled";
          job_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          wash_tier_id: string;
          date: string;
          time_slot: string;
          status?: "confirmed" | "checked_in" | "cancelled";
          job_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          wash_tier_id?: string;
          date?: string;
          time_slot?: string;
          status?: "confirmed" | "checked_in" | "cancelled";
          job_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      daily_stats: {
        Row: {
          date: string;
          cars_washed: number;
          total_revenue_cents: number;
          avg_wait_minutes: number;
          bays_used: number;
        };
      };
    };
  };
}

// Convenience type aliases
export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type Bay = Database["public"]["Tables"]["bays"]["Row"];
export type WashTier = Database["public"]["Tables"]["wash_tiers"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
