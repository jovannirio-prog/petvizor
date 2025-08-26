import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Настроен' : 'НЕ НАСТРОЕН',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Настроен' : 'НЕ НАСТРОЕН',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Настроен' : 'НЕ НАСТРОЕН',
        urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      resend: {
        apiKey: process.env.RESEND_API_KEY ? 'Настроен' : 'НЕ НАСТРОЕН',
        apiKeyLength: process.env.RESEND_API_KEY?.length || 0
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY ? 'Настроен' : 'НЕ НАСТРОЕН',
        apiKeyLength: process.env.OPENAI_API_KEY?.length || 0
      },
      google: {
        sheetsApiKey: process.env.GOOGLE_SHEETS_API_KEY ? 'Настроен' : 'НЕ НАСТРОЕН',
        sheetsApiKeyLength: process.env.GOOGLE_SHEETS_API_KEY?.length || 0
      }
    }

    return NextResponse.json(envCheck)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Ошибка проверки переменных окружения',
      details: error
    }, { status: 500 })
  }
}
