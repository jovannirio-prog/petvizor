import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug ENV: Проверяем переменные окружения')
    
    // Проверяем все переменные окружения
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***HIDDEN***' : null,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '***HIDDEN***' : null,
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV,
    }
    
    console.log('🔍 Debug ENV: Переменные окружения:', {
      ...envVars,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'EXISTS' : 'MISSING'
    })
    
    // Проверяем, что ключи не пустые
    const hasValidUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
                       process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://example.supabase.co'
    const hasValidAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 100
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    return NextResponse.json({
      success: true,
      environment: envVars,
      validation: {
        hasValidUrl,
        hasValidAnonKey,
        hasServiceKey,
        allValid: hasValidUrl && hasValidAnonKey
      },
      recommendations: {
        missingUrl: !hasValidUrl ? 'NEXT_PUBLIC_SUPABASE_URL не настроен или имеет дефолтное значение' : null,
        missingAnonKey: !hasValidAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY не настроен или слишком короткий' : null,
        missingServiceKey: !hasServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY не настроен (может потребоваться для некоторых операций)' : null
      }
    })
    
  } catch (error: any) {
    console.error('❌ Debug ENV: Ошибка:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
