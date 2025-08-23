import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 API Events: Начало обработки GET запроса')
    
    const supabase = createClient()
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Events: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Events: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Events: Пользователь авторизован:', user.email)

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('pet_id')

    // Формируем запрос к базе данных
    let query = supabase
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
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })

    // Если указан pet_id, фильтруем по питомцу
    if (petId) {
      query = query.eq('pet_id', petId)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('🔧 API Events: Ошибка получения событий:', error)
      return NextResponse.json({ error: 'Ошибка получения событий' }, { status: 500 })
    }

    console.log('🔧 API Events: Найдено событий:', events?.length || 0)

    return NextResponse.json(events || [])
  } catch (error) {
    console.error('🔧 API Events: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 API Events: Начало обработки POST запроса')
    
    const supabase = createClient()
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Events: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Events: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Events: Пользователь авторизован:', user.email)

    const body = await request.json()
    console.log('🔧 API Events: Полученные данные:', body)
    
    const { 
      pet_id, 
      event_type, 
      event_name, 
      event_description, 
      event_date, 
      notification_days_before = 7,
      notification_active = true 
    } = body

    // Проверяем обязательные поля
    if (!pet_id || !event_type || !event_name || !event_date) {
      console.log('🔧 API Events: Отсутствуют обязательные поля')
      return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 })
    }

    // Проверяем, что питомец принадлежит пользователю
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id, name')
      .eq('id', pet_id)
      .eq('user_id', user.id)
      .single()

    if (petError || !pet) {
      console.log('🔧 API Events: Питомец не найден или не принадлежит пользователю')
      return NextResponse.json({ error: 'Питомец не найден' }, { status: 404 })
    }

    console.log('🔧 API Events: Питомец найден:', pet.name)

    // Создаем новое событие
    const { data: events, error } = await supabase
      .from('events')
      .insert([{
        pet_id,
        user_id: user.id,
        event_type,
        event_name,
        event_description,
        event_date,
        notification_days_before,
        notification_active
      }])
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
      console.error('🔧 API Events: Ошибка создания события:', error)
      return NextResponse.json({ error: `Ошибка создания события: ${error.message}` }, { status: 500 })
    }

    if (!events || events.length === 0) {
      console.error('🔧 API Events: Событие не было создано')
      return NextResponse.json({ error: 'Событие не было создано' }, { status: 500 })
    }

    const event = events[0]
    console.log('🔧 API Events: Событие создано:', event)

    return NextResponse.json(event)
  } catch (error) {
    console.error('🔧 API Events: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

