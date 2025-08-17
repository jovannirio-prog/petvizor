import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Test Supabase: Начало тестирования')
    
    // Проверяем переменные окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔧 Test Supabase: SUPABASE_URL:', supabaseUrl)
    console.log('🔧 Test Supabase: SUPABASE_ANON_KEY существует:', !!supabaseAnonKey)
    
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
    
    // Тест 1: Подключение к Auth
    console.log('🔧 Test Supabase: Тест 1 - Подключение к Auth')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Test Supabase: Ошибка Auth:', authError)
      return NextResponse.json({
        success: false,
        error: 'Ошибка подключения к Auth',
        details: authError.message
      }, { status: 500 })
    }
    
    console.log('✅ Test Supabase: Auth работает')
    
    // Тест 2: Подключение к базе данных
    console.log('🔧 Test Supabase: Тест 2 - Подключение к базе данных')
    const { data: dbData, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (dbError) {
      console.error('❌ Test Supabase: Ошибка базы данных:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Ошибка подключения к базе данных',
        details: dbError.message
      }, { status: 500 })
    }
    
    console.log('✅ Test Supabase: База данных работает')
    
    // Тест 3: Проверка таблицы profiles
    console.log('🔧 Test Supabase: Тест 3 - Проверка таблицы profiles')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Test Supabase: Ошибка таблицы profiles:', profilesError)
      return NextResponse.json({
        success: false,
        error: 'Ошибка таблицы profiles',
        details: profilesError.message
      }, { status: 500 })
    }
    
    console.log('✅ Test Supabase: Таблица profiles работает')
    
    return NextResponse.json({
      success: true,
      message: 'Все тесты Supabase пройдены успешно',
      env: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        url: supabaseUrl
      },
      tests: {
        auth: '✅ Работает',
        database: '✅ Работает',
        profiles: '✅ Работает'
      },
      profilesCount: profilesData?.length || 0
    })
    
  } catch (error: any) {
    console.error('❌ Test Supabase: Неожиданная ошибка:', error)
    return NextResponse.json({
      success: false,
      error: 'Неожиданная ошибка',
      details: error.message
    }, { status: 500 })
  }
}
