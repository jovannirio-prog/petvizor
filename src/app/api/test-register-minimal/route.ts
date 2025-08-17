import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Test Register Minimal: Начало тестирования')
    
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email и пароль обязательны'
      }, { status: 400 })
    }
    
    // Создаем клиент
    const supabase = createClient()
    
    console.log('🔧 Test Register Minimal: Пытаемся зарегистрировать пользователя')
    console.log('🔧 Test Register Minimal: Email:', email)
    
    // Минимальная регистрация без метаданных
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Test Register Minimal: Ошибка регистрации:', error)
      console.error('❌ Test Register Minimal: Код ошибки:', error.status)
      console.error('❌ Test Register Minimal: Сообщение ошибки:', error.message)
      console.error('❌ Test Register Minimal: Имя ошибки:', error.name)
      console.error('❌ Test Register Minimal: Код ошибки:', error.code)
      
      return NextResponse.json({
        success: false,
        error: error.message,
        details: {
          status: error.status,
          name: error.name,
          code: error.code,
          fullError: error
        }
      }, { status: 400 })
    }
    
    console.log('✅ Test Register Minimal: Регистрация успешна')
    console.log('✅ Test Register Minimal: Пользователь создан:', data.user?.email)
    console.log('✅ Test Register Minimal: Сессия создана:', !!data.session)
    
    return NextResponse.json({
      success: true,
      message: 'Регистрация успешна',
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          email_confirmed_at: data.user?.email_confirmed_at
        },
        session: {
          access_token: data.session?.access_token ? '***HIDDEN***' : null,
          refresh_token: data.session?.refresh_token ? '***HIDDEN***' : null
        }
      }
    })
    
  } catch (error: any) {
    console.error('❌ Test Register Minimal: Неожиданная ошибка:', error)
    return NextResponse.json({
      success: false,
      error: 'Неожиданная ошибка',
      details: error.message
    }, { status: 500 })
  }
}
