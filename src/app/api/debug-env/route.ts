import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'НЕ НАЙДЕН',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'НАЙДЕН' : 'НЕ НАЙДЕН',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'НАЙДЕН' : 'НЕ НАЙДЕН',
      GOOGLE_SHEETS_API_KEY: process.env.GOOGLE_SHEETS_API_KEY ? 'НАЙДЕН' : 'НЕ НАЙДЕН',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'НАЙДЕН' : 'НЕ НАЙДЕН',
      GOOGLE_SHEETS_API_KEY_LENGTH: process.env.GOOGLE_SHEETS_API_KEY ? process.env.GOOGLE_SHEETS_API_KEY.length : 0,
      GOOGLE_SHEETS_API_KEY_PREFIX: process.env.GOOGLE_SHEETS_API_KEY ? process.env.GOOGLE_SHEETS_API_KEY.substring(0, 10) + '...' : 'НЕТ'
    }

    return NextResponse.json({ 
      message: 'Переменные окружения (обновлено)',
      envVars,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения переменных окружения' }, { status: 500 })
  }
}
