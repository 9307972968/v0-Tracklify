export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      agent_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          device_id: string
          keystroke: string
          application?: string
          window_title?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          device_id: string
          keystroke: string
          application?: string
          window_title?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          device_id?: string
          keystroke?: string
          application?: string
          window_title?: string
        }
      }
      agents: {
        Row: {
          id: string
          created_at: string
          user_id: string
          device_name: string
          platform: string
          last_active: string | null
          is_active: boolean
          is_revoked: boolean
          keylogging_enabled: boolean
          full_monitoring: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          device_name: string
          platform: string
          last_active?: string | null
          is_active?: boolean
          is_revoked?: boolean
          keylogging_enabled?: boolean
          full_monitoring?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          device_name?: string
          platform?: string
          last_active?: string | null
          is_active?: boolean
          is_revoked?: boolean
          keylogging_enabled?: boolean
          full_monitoring?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          email: string
          role: string
          risk_score: number
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email: string
          role?: string
          risk_score?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email?: string
          role?: string
          risk_score?: number
        }
      }
      // Add other tables as needed
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
