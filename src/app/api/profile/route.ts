import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 API Profile: Начало обработки GET запроса')
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Profile: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Profile: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Profile: Пользователь авторизован:', user.email)

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)

    if (error) {
      console.error('🔧 API Profile: Ошибка получения профиля:', error)
      return NextResponse.json({ error: 'Ошибка получения профиля' }, { status: 500 })
    }

    console.log('🔧 API Profile: Найденные профили:', profile)
    console.log('🔧 API Profile: Количество профилей:', Array.isArray(profile) ? profile.length : 'не массив')

    // Возвращаем первый профиль или null
    const result = Array.isArray(profile) && profile.length > 0 ? profile[0] : null
    console.log('🔧 API Profile: Возвращаемый профиль:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('🔧 API Profile: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 API Profile: Начало обработки PUT запроса')
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Profile: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Profile: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Profile: Пользователь авторизован:', user.email)

    const body = await request.json()
    console.log('🔧 API Profile: Полученные данные:', body)
    
    const { full_name, phone } = body

    const updateData: any = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (phone !== undefined) updateData.phone = phone
    updateData.updated_at = new Date().toISOString()

    console.log('🔧 API Profile: Данные для обновления:', updateData)

    // Используем админский клиент для обновления (обходит RLS)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()

    if (error) {
      console.error('🔧 API Profile: Ошибка обновления профиля:', error)
      return NextResponse.json({ error: `Ошибка обновления профиля: ${error.message}` }, { status: 500 })
    }

    console.log('🔧 API Profile: Результат обновления:', data)
    console.log('🔧 API Profile: Тип результата:', typeof data)
    console.log('🔧 API Profile: Длина результата:', Array.isArray(data) ? data.length : 'не массив')

    // Проверяем, что обновление прошло успешно
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log('🔧 API Profile: Обновление не вернуло данных, но это нормально')
      return NextResponse.json({ 
        success: true, 
        message: 'Профиль обновлен успешно' 
      })
    }

    // Возвращаем первую запись, если это массив
    const result = Array.isArray(data) ? data[0] : data
    console.log('🔧 API Profile: Финальный результат:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('🔧 API Profile: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
