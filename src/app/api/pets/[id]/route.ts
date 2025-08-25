import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const supabase = createClient()
    
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
    const supabase = createClient()
    
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
    const supabaseAdmin = createClient()
    
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
    console.log('🗑️ API Delete Pet: Начало удаления питомца:', params.id)
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🗑️ API Delete Pet: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    // Получаем пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🗑️ API Delete Pet: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🗑️ API Delete Pet: Пользователь авторизован:', user.email)

    // Проверяем, что питомец существует и принадлежит пользователю
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (petError || !pet) {
      console.log('🗑️ API Delete Pet: Питомец не найден или не принадлежит пользователю')
      return NextResponse.json({ error: 'Питомец не найден' }, { status: 404 })
    }

    console.log('🗑️ API Delete Pet: Питомец найден:', pet.name)

    // Удаляем QR-код из Storage (если есть)
    if (pet.qr_code_url) {
      try {
        const qrCodePath = pet.qr_code_url.split('/').pop() // Получаем имя файла
        if (qrCodePath) {
          const { error: storageError } = await supabase.storage
            .from('pet-photos')
            .remove([`qr-codes/${qrCodePath}`])
          
          if (storageError) {
            console.warn('🗑️ API Delete Pet: Ошибка удаления QR-кода из Storage:', storageError)
          } else {
            console.log('🗑️ API Delete Pet: QR-код удален из Storage')
          }
        }
      } catch (error) {
        console.warn('🗑️ API Delete Pet: Ошибка при удалении QR-кода:', error)
      }
    }

    // Удаляем фото питомца из Storage (если есть)
    if (pet.photo_url) {
      try {
        const photoPath = pet.photo_url.split('/').pop() // Получаем имя файла
        if (photoPath) {
          const { error: storageError } = await supabase.storage
            .from('pet-photos')
            .remove([`photos/${photoPath}`])
          
          if (storageError) {
            console.warn('🗑️ API Delete Pet: Ошибка удаления фото из Storage:', storageError)
          } else {
            console.log('🗑️ API Delete Pet: Фото удалено из Storage')
          }
        }
      } catch (error) {
        console.warn('🗑️ API Delete Pet: Ошибка при удалении фото:', error)
      }
    }

    // Удаляем сообщения чата, связанные с питомцем
    try {
      const { error: chatError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('pet_id', params.id)
        .eq('user_id', user.id)

      if (chatError) {
        console.warn('🗑️ API Delete Pet: Ошибка удаления сообщений чата:', chatError)
      } else {
        console.log('🗑️ API Delete Pet: Сообщения чата удалены')
      }
    } catch (error) {
      console.warn('🗑️ API Delete Pet: Ошибка при удалении сообщений чата:', error)
    }

    // Удаляем события питомца (должны удалиться автоматически из-за CASCADE)
    // Но на всякий случай удаляем вручную
    try {
      const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('pet_id', params.id)
        .eq('user_id', user.id)

      if (eventsError) {
        console.warn('🗑️ API Delete Pet: Ошибка удаления событий:', eventsError)
      } else {
        console.log('🗑️ API Delete Pet: События удалены')
      }
    } catch (error) {
      console.warn('🗑️ API Delete Pet: Ошибка при удалении событий:', error)
    }

    // Удаляем самого питомца
    const { error: deleteError } = await supabase
      .from('pets')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('🗑️ API Delete Pet: Ошибка удаления питомца:', deleteError)
      return NextResponse.json({ error: `Ошибка удаления питомца: ${deleteError.message}` }, { status: 500 })
    }

    console.log('✅ API Delete Pet: Питомец успешно удален')

    return NextResponse.json({ 
      success: true, 
      message: 'Питомец успешно удален',
      deletedPet: {
        id: pet.id,
        name: pet.name
      }
    })

  } catch (error: any) {
    console.error('❌ API Delete Pet: Неожиданная ошибка:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: {
        type: error.name,
        message: error.message
      }
    }, { status: 500 })
  }
}
