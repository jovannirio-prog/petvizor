import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 API Login: Начало обработки запроса')
    console.log('🔐 API Login: URL запроса:', request.url)
    console.log('🔐 API Login: Метод запроса:', request.method)
    console.log('🔐 API Login: Заголовки запроса:', Object.fromEntries(request.headers.entries()))
    
    const { email, password } = await request.json()
    console.log('📧 Email:', email)

    if (!email || !password) {
      console.log('❌ API Login: Отсутствуют email или пароль')
      return NextResponse.json({ 
        success: false, 
        error: 'Email и пароль обязательны' 
      }, { status: 400 })
    }

    console.log('🔧 API Login: Создаем Supabase клиент')
    console.log('🔧 API Login: SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔧 API Login: SUPABASE_ANON_KEY существует:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('🔧 API Login: SUPABASE_ANON_KEY длина:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0)
    
    // Проверяем переменные окружения
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ API Login: Отсутствуют переменные окружения Supabase')
      return NextResponse.json({ 
        success: false, 
        error: 'Ошибка конфигурации сервера: отсутствуют переменные окружения Supabase',
        details: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 500 })
    }
    
    const supabase = createClient()

    console.log('🔑 API Login: Пытаемся войти в систему')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ API Login: Ошибка входа:', error)
      console.error('❌ API Login: Код ошибки:', error.status)
      console.error('❌ API Login: Сообщение ошибки:', error.message)
      console.error('❌ API Login: Детали ошибки:', error)
      
      // Более детальная обработка ошибок
      let errorMessage = error.message || 'Ошибка входа в систему'
      let statusCode = 401
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Неверный email или пароль'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email не подтвержден. Проверьте почту и подтвердите регистрацию.'
        statusCode = 403
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Слишком много попыток входа. Попробуйте позже.'
        statusCode = 429
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.'
        statusCode = 500
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage,
        details: {
          originalError: error.message,
          status: error.status,
          name: error.name
        }
      }, { status: statusCode })
    }

    if (!data.user) {
      console.log('❌ API Login: Пользователь не найден')
      return NextResponse.json({ 
        success: false, 
        error: 'Пользователь не найден' 
      }, { status: 401 })
    }

    console.log('✅ API Login: Успешный вход для пользователя:', data.user.email)
    console.log('🔍 API Login: data.session:', data.session)
    console.log('🔍 API Login: access_token length:', data.session?.access_token?.length)
    console.log('🔍 API Login: refresh_token length:', data.session?.refresh_token?.length)
    
    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    })

  } catch (error: any) {
    console.error('❌ API Login: Неожиданная ошибка:', error)
    console.error('❌ API Login: Тип ошибки:', error.name)
    console.error('❌ API Login: Сообщение ошибки:', error.message)
    console.error('❌ API Login: Стек ошибки:', error.stack)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера',
      details: {
        type: error.name,
        message: error.message
      }
    }, { status: 500 })
  }
}
