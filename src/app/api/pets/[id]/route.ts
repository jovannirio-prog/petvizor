import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API Pet Detail: Начало обработки GET запроса для питомца:', params.id)
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Pet Detail: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Pet Detail: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Pet Detail: Пользователь авторизован:', user.email)

    // Получаем питомца по ID
    const { data: pets, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('🔧 API Pet Detail: Ошибка получения питомца:', error)
      return NextResponse.json({ error: 'Ошибка получения питомца' }, { status: 500 })
    }

    if (!pets || pets.length === 0) {
      console.log('🔧 API Pet Detail: Питомец не найден')
      return NextResponse.json({ error: 'Питомец не найден' }, { status: 404 })
    }

    const pet = pets[0]
    console.log('🔧 API Pet Detail: Питомец найден:', pet.name)

    return NextResponse.json(pet)
  } catch (error) {
    console.error('🔧 API Pet Detail: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API Pet Detail: Начало обработки PUT запроса для питомца:', params.id)
    console.log('🔧 API Pet Detail: URL запроса:', request.url)
    console.log('🔧 API Pet Detail: Метод запроса:', request.method)
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Pet Detail: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Pet Detail: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Pet Detail: Пользователь авторизован:', user.email)

    const body = await request.json()
    console.log('🔧 API Pet Detail: Полученные данные для обновления:', body)
    console.log('🔧 API Pet Detail: photo_url в body:', body.photo_url)
    console.log('🔧 API Pet Detail: Тип photo_url:', typeof body.photo_url)

    // Сначала проверяем, существует ли питомец
    const { data: existingPet, error: checkError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingPet) {
      console.error('🔧 API Pet Detail: Питомец не найден для обновления:', checkError)
      return NextResponse.json({ error: 'Питомец не найден' }, { status: 404 })
    }

    console.log('🔧 API Pet Detail: Найден питомец для обновления:', existingPet.name)

    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }
    
    console.log('🔧 API Pet Detail: Данные для обновления в базе:', updateData)
    console.log('🔧 API Pet Detail: photo_url в updateData:', updateData.photo_url)
    
    // Создаем admin клиент для обхода RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('🔧 API Pet Detail: Admin клиент создан')
    
    // Обновляем питомца через admin клиент
    const { data: pets, error } = await supabaseAdmin
      .from('pets')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('🔧 API Pet Detail: Ошибка обновления питомца:', error)
      return NextResponse.json({ error: `Ошибка обновления питомца: ${error.message}` }, { status: 500 })
    }

    if (!pets || pets.length === 0) {
      console.error('🔧 API Pet Detail: Питомец не был обновлен')
      return NextResponse.json({ error: 'Питомец не был обновлен' }, { status: 500 })
    }

    const pet = pets[0]
    console.log('🔧 API Pet Detail: Питомец успешно обновлен:', pet)

    return NextResponse.json(pet)
  } catch (error) {
    console.error('🔧 API Pet Detail: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API Pet Detail: Начало обработки DELETE запроса для питомца:', params.id)
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Pet Detail: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Pet Detail: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Pet Detail: Пользователь авторизован:', user.email)

    // Удаляем питомца
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('🔧 API Pet Detail: Ошибка удаления питомца:', error)
      return NextResponse.json({ error: `Ошибка удаления питомца: ${error.message}` }, { status: 500 })
    }

    console.log('🔧 API Pet Detail: Питомец удален')

    return NextResponse.json({ success: true, message: 'Питомец удален' })
  } catch (error) {
    console.error('🔧 API Pet Detail: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
