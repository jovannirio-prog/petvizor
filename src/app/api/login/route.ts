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
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Ошибка входа в систему' 
      }, { status: 401 })
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
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 })
  }
}
