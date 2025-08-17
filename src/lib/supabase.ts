import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zuuupcwjynjeqtjzdimt.supabase.com'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dXVwY3dqeW5qZXF0anpkaW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjk3NDcsImV4cCI6MjA3MDkwNTc0N30.fUKZnqs_xlsAUlle2UmAaalupJ0rMIyoKlIhNpdTFao'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          user_id: string
          name: string
          species: string
          breed: string | null
          birth_date: string | null
          weight: number | null
          photo_url: string | null
          lost_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          species: string
          breed?: string | null
          birth_date?: string | null
          weight?: number | null
          photo_url?: string | null
          lost_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          species?: string
          breed?: string | null
          birth_date?: string | null
          weight?: number | null
          photo_url?: string | null
          lost_comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          pet_id: string | null
          message: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pet_id?: string | null
          message: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pet_id?: string | null
          message?: string
          response?: string
          created_at?: string
        }
      }
    }
  }
}