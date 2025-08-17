import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Test Login: Начало тестирования логина')
    
    const { email, password } = await request.json()
    console.log('📧 Test Login: Email:', email)
    
    // Проверяем переменные окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔧 Test Login: SUPABASE_URL:', supabaseUrl)
    console.log('🔧 Test Login: SUPABASE_ANON_KEY существует:', !!supabaseAnonKey)
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Отсутствуют переменные окружения Supabase',
        env: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey
        }
      }, { status: 500 })
    }
    
    // Создаем клиент
    const supabase = createClient()
    
    // Пробуем подключиться к Supabase
    console.log('🔧 Test Login: Тестируем подключение к Supabase')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Test Login: Ошибка подключения к Supabase:', sessionError)
      return NextResponse.json({
        success: false,
        error: 'Ошибка подключения к Supabase',
        details: sessionError.message
      }, { status: 500 })
    }
    
    console.log('✅ Test Login: Подключение к Supabase успешно')
    
    // Пробуем простой запрос к базе данных
    console.log('🔧 Test Login: Тестируем подключение к базе данных')
    const { data: dbData, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (dbError) {
      console.error('❌ Test Login: Ошибка подключения к базе данных:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Ошибка подключения к базе данных',
        details: dbError.message
      }, { status: 500 })
    }
    
    console.log('✅ Test Login: Подключение к базе данных успешно')
    
    return NextResponse.json({
      success: true,
      message: 'Подключение к Supabase для логина работает корректно',
      env: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        url: supabaseUrl
      },
      auth: {
        configured: true,
        canConnect: true
      },
      database: {
        connected: true
      }
    })
    
  } catch (error: any) {
    console.error('❌ Test Login: Неожиданная ошибка:', error)
    return NextResponse.json({
      success: false,
      error: 'Неожиданная ошибка',
      details: error.message
    }, { status: 500 })
  }
}
