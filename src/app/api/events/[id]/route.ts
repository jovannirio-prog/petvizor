import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API Event Detail: Начало обработки GET запроса для события:', params.id)
    
    const supabase = createClient()
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Event Detail: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Event Detail: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Event Detail: Пользователь авторизован:', user.email)

    // Получаем событие с информацией о питомце
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        pets (
          id,
          name,
          species,
          breed
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !event) {
      console.error('🔧 API Event Detail: Событие не найдено:', error)
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 })
    }

    console.log('🔧 API Event Detail: Событие найдено:', event.event_name)

    return NextResponse.json(event)
  } catch (error) {
    console.error('🔧 API Event Detail: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API Event Detail: Начало обработки PUT запроса для события:', params.id)
    
    const supabase = createClient()
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Event Detail: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Event Detail: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Event Detail: Пользователь авторизован:', user.email)

    const body = await request.json()
    console.log('🔧 API Event Detail: Полученные данные для обновления:', body)
    
    const { 
      event_type, 
      event_name, 
      event_description, 
      event_date, 
      notification_days_before,
      event_status,
      notification_active 
    } = body

    // Проверяем обязательные поля
    if (!event_type || !event_name || !event_date) {
      console.log('🔧 API Event Detail: Отсутствуют обязательные поля')
      return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 })
    }

    // Проверяем, что событие принадлежит пользователю
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('id, event_name')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingEvent) {
      console.log('🔧 API Event Detail: Событие не найдено или не принадлежит пользователю')
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 })
    }

    console.log('🔧 API Event Detail: Событие найдено:', existingEvent.event_name)

    // Обновляем событие
    const { data: events, error } = await supabase
      .from('events')
      .update({
        event_type,
        event_name,
        event_description,
        event_date,
        notification_days_before,
        event_status,
        notification_active
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select(`
        *,
        pets (
          id,
          name,
          species,
          breed
        )
      `)

    if (error) {
      console.error('🔧 API Event Detail: Ошибка обновления события:', error)
      return NextResponse.json({ error: `Ошибка обновления события: ${error.message}` }, { status: 500 })
    }

    if (!events || events.length === 0) {
      console.error('🔧 API Event Detail: Событие не было обновлено')
      return NextResponse.json({ error: 'Событие не было обновлено' }, { status: 500 })
    }

    const event = events[0]
    console.log('🔧 API Event Detail: Событие обновлено:', event.event_name)

    return NextResponse.json(event)
  } catch (error) {
    console.error('🔧 API Event Detail: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API Event Detail: Начало обработки DELETE запроса для события:', params.id)
    
    const supabase = createClient()
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Event Detail: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Event Detail: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Event Detail: Пользователь авторизован:', user.email)

    // Проверяем, что событие принадлежит пользователю
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('id, event_name')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingEvent) {
      console.log('🔧 API Event Detail: Событие не найдено или не принадлежит пользователю')
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 })
    }

    console.log('🔧 API Event Detail: Событие найдено:', existingEvent.event_name)

    // Удаляем событие
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('🔧 API Event Detail: Ошибка удаления события:', error)
      return NextResponse.json({ error: `Ошибка удаления события: ${error.message}` }, { status: 500 })
    }

    console.log('🔧 API Event Detail: Событие удалено:', existingEvent.event_name)

    return NextResponse.json({ success: true, message: 'Событие успешно удалено' })
  } catch (error) {
    console.error('🔧 API Event Detail: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

