import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email и пароль обязательны' 
      }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || email.split('@')[0]
        }
      }
    })

    if (error) {
      console.error('Ошибка регистрации:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Ошибка регистрации' 
      }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Не удалось создать пользователя' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      },
      message: 'Регистрация успешна! Проверьте email для подтверждения.'
    })

  } catch (error) {
    console.error('Ошибка API регистрации:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 })
  }
}
