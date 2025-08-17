import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Test Register Simple: Начало тестирования')
    
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email и пароль обязательны'
      }, { status: 400 })
    }
    
    // Создаем клиент
    const supabase = createClient()
    
    console.log('🔧 Test Register Simple: Пытаемся зарегистрировать пользователя')
    console.log('🔧 Test Register Simple: Email:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0]
        }
      }
    })
    
    if (error) {
      console.error('❌ Test Register Simple: Ошибка регистрации:', error)
      console.error('❌ Test Register Simple: Код ошибки:', error.status)
      console.error('❌ Test Register Simple: Сообщение ошибки:', error.message)
      console.error('❌ Test Register Simple: Имя ошибки:', error.name)
      
      return NextResponse.json({
        success: false,
        error: error.message,
        details: {
          status: error.status,
          name: error.name,
          fullError: error
        }
      }, { status: 400 })
    }
    
    console.log('✅ Test Register Simple: Регистрация успешна')
    console.log('✅ Test Register Simple: Пользователь создан:', data.user?.email)
    console.log('✅ Test Register Simple: Сессия создана:', !!data.session)
    
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
    console.error('❌ Test Register Simple: Неожиданная ошибка:', error)
    return NextResponse.json({
      success: false,
      error: 'Неожиданная ошибка',
      details: error.message
    }, { status: 500 })
  }
}
