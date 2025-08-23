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

    return NextResponse.json({ pets: pets || [] })
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

    // Автоматически генерируем QR-код для нового питомца
    try {
      console.log('🔧 API Pets: Генерируем QR-код для нового питомца')
      const qrResponse = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'}/api/pets/${pet.id}/qr-code`, {
        method: 'POST'
      })
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json()
        console.log('🔧 API Pets: QR-код сгенерирован:', qrData.qr_code_url)
      } else {
        console.warn('🔧 API Pets: Не удалось сгенерировать QR-код, но питомец создан')
      }
    } catch (qrError) {
      console.warn('🔧 API Pets: Ошибка генерации QR-кода:', qrError)
      // Не прерываем создание питомца из-за ошибки QR-кода
    }

    return NextResponse.json(pet)
  } catch (error) {
    console.error('🔧 API Pets: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
