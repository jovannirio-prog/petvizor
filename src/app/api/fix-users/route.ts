import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 API Fix Users: Начало обработки запроса')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Fix Users: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Fix Users: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Fix Users: Пользователь авторизован:', user.email)
    console.log('🔧 API Fix Users: User ID:', user.id)

    // Проверяем, существует ли пользователь в таблице users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('🔧 API Fix Users: Ошибка проверки пользователя:', checkError)
      return NextResponse.json({ error: 'Ошибка проверки пользователя' }, { status: 500 })
    }

    if (existingUser) {
      console.log('🔧 API Fix Users: Пользователь уже существует в таблице users')
      return NextResponse.json({ 
        success: true, 
        message: 'Пользователь уже существует в таблице users',
        user: existingUser
      })
    }

    // Создаем запись пользователя в таблице users
    console.log('🔧 API Fix Users: Создаем запись пользователя в таблице users')
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      console.error('🔧 API Fix Users: Ошибка создания пользователя:', insertError)
      return NextResponse.json({ 
        error: 'Ошибка создания пользователя',
        details: insertError
      }, { status: 500 })
    }

    console.log('✅ API Fix Users: Пользователь создан успешно:', newUser)

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно создан в таблице users',
      user: newUser[0]
    })

  } catch (error: any) {
    console.error('❌ API Fix Users: Неожиданная ошибка:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: {
        type: error.name,
        message: error.message
      }
    }, { status: 500 })
  }
}
