import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zuuupcwjynjeqtjzdimt.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dXVwY3dqeW5qZXF0anpkaW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjk3NDcsImV4cCI6MjA3MDkwNTc0N30.fUKZnqs_xlsAUlle2UmAaalupJ0rMIyoKlIhNpdTFao'
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    },
    db: {
      schema: 'public'
    }
  })
}
