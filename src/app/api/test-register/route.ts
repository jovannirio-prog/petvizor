import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Test Register: Начало тестирования регистрации')
    
    // Проверяем переменные окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔧 Test Register: SUPABASE_URL:', supabaseUrl)
    console.log('🔧 Test Register: SUPABASE_ANON_KEY существует:', !!supabaseAnonKey)
    
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
    
    // Пробуем простой запрос к аутентификации (без создания пользователя)
    console.log('🔧 Test Register: Тестируем подключение к аутентификации')
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Test Register: Ошибка подключения к аутентификации:', error)
      return NextResponse.json({
        success: false,
        error: 'Ошибка подключения к аутентификации',
        details: error.message
      }, { status: 500 })
    }
    
    console.log('✅ Test Register: Подключение к аутентификации успешно')
    
    // Проверяем, что можем создать клиент без ошибок
    console.log('✅ Test Register: Supabase клиент создан успешно')
    
    return NextResponse.json({
      success: true,
      message: 'Подключение к Supabase для регистрации работает корректно',
      env: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        url: supabaseUrl
      },
      auth: {
        configured: true,
        canConnect: true
      }
    })
    
  } catch (error: any) {
    console.error('❌ Test Register: Неожиданная ошибка:', error)
    return NextResponse.json({
      success: false,
      error: 'Неожиданная ошибка',
      details: error.message
    }, { status: 500 })
  }
}
