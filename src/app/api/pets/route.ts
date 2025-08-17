import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 API Pets: Начало обработки GET запроса')
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Pets: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Pets: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Pets: Пользователь авторизован:', user.email)

    // Получаем питомцев пользователя
    const { data: pets, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('🔧 API Pets: Ошибка получения питомцев:', error)
      return NextResponse.json({ error: 'Ошибка получения питомцев' }, { status: 500 })
    }

    console.log('🔧 API Pets: Найдено питомцев:', pets?.length || 0)

    return NextResponse.json(pets || [])
  } catch (error) {
    console.error('🔧 API Pets: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 API Pets: Начало обработки POST запроса')
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Pets: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Pets: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Pets: Пользователь авторизован:', user.email)

    const body = await request.json()
    console.log('🔧 API Pets: Полученные данные:', body)
    
    const { name, species, breed, birth_date, weight, photo_url } = body

    // Создаем нового питомца
    const { data: pets, error } = await supabase
      .from('pets')
      .insert([{
        user_id: user.id,
        name,
        species,
        breed,
        birth_date,
        weight,
        photo_url
      }])
      .select()

    if (error) {
      console.error('🔧 API Pets: Ошибка создания питомца:', error)
      return NextResponse.json({ error: `Ошибка создания питомца: ${error.message}` }, { status: 500 })
    }

    if (!pets || pets.length === 0) {
      console.error('🔧 API Pets: Питомец не был создан')
      return NextResponse.json({ error: 'Питомец не был создан' }, { status: 500 })
    }

    const pet = pets[0]
    console.log('🔧 API Pets: Питомец создан:', pet)

    return NextResponse.json(pet)
  } catch (error) {
    console.error('🔧 API Pets: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
