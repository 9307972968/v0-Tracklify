export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      agent_logs: {
        Row: {
          id: string
          created_at: string
          keystroke: string
          device_id: string
          window_title?: string | null
          application?: string | null
          user_id?: string | null
          ip_address?: string | null
          metadata?: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          keystroke: string
          device_id: string
          window_title?: string | null
          application?: string | null
          user_id?: string | null
          ip_address?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          keystroke?: string
          device_id?: string
          window_title?: string | null
          application?: string | null
          user_id?: string | null
          ip_address?: string | null
          metadata?: Json | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
