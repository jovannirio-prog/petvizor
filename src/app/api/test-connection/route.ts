import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Test Connection: Начало тестирования подключения')
    
    // Проверяем переменные окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔧 Test Connection: SUPABASE_URL:', supabaseUrl)
    console.log('🔧 Test Connection: SUPABASE_ANON_KEY существует:', !!supabaseAnonKey)
    
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
    
    // Пробуем простой запрос к базе данных
    console.log('🔧 Test Connection: Тестируем подключение к базе данных')
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Test Connection: Ошибка подключения к базе данных:', error)
      return NextResponse.json({
        success: false,
        error: 'Ошибка подключения к базе данных',
        details: error.message
      }, { status: 500 })
    }
    
    console.log('✅ Test Connection: Подключение к базе данных успешно')
    
    // Пробуем получить информацию о проекте
    const { data: projectInfo, error: projectError } = await supabase.auth.getSession()
    
    if (projectError) {
      console.error('❌ Test Connection: Ошибка получения информации о проекте:', projectError)
      return NextResponse.json({
        success: false,
        error: 'Ошибка получения информации о проекте',
        details: projectError.message
      }, { status: 500 })
    }
    
    console.log('✅ Test Connection: Информация о проекте получена')
    
    return NextResponse.json({
      success: true,
      message: 'Подключение к Supabase работает корректно',
      env: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        url: supabaseUrl
      },
      database: {
        connected: true,
        profilesCount: data?.length || 0
      },
      auth: {
        configured: true
      }
    })
    
  } catch (error: any) {
    console.error('❌ Test Connection: Неожиданная ошибка:', error)
    return NextResponse.json({
      success: false,
      error: 'Неожиданная ошибка',
      details: error.message
    }, { status: 500 })
  }
}
