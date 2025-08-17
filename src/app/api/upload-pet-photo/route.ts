import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateFileName } from '@/lib/image-utils'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 API Upload Pet Photo: Начало обработки POST запроса')
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔧 API Upload Pet Photo: Нет токена авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('🔧 API Upload Pet Photo: Ошибка авторизации:', authError)
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔧 API Upload Pet Photo: Пользователь авторизован:', user.email)

    // Получаем файл из FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('🔧 API Upload Pet Photo: Файл не найден')
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    console.log('🔧 API Upload Pet Photo: Получен файл:', file.name, 'размер:', file.size)

    // Проверяем размер файла (3MB)
    const maxSize = 3 * 1024 * 1024 // 3MB в байтах
    if (file.size > maxSize) {
      console.log('🔧 API Upload Pet Photo: Файл слишком большой:', file.size)
      return NextResponse.json({ error: 'Файл слишком большой. Максимальный размер: 3MB' }, { status: 400 })
    }

    // Проверяем тип файла
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      console.log('🔧 API Upload Pet Photo: Неподдерживаемый тип файла:', file.type)
      return NextResponse.json({ error: 'Неподдерживаемый тип файла' }, { status: 400 })
    }

    // Генерируем уникальное имя файла
    const fileName = generateFileName(file.name, user.id)
    console.log('🔧 API Upload Pet Photo: Сгенерированное имя файла:', fileName)

    // Конвертируем файл в ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

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

    console.log('🔧 API Upload Pet Photo: Admin клиент создан')

    // Загружаем файл в Supabase Storage через admin клиент
    const { data, error } = await supabaseAdmin.storage
      .from('pet-photos')
      .upload(fileName, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true // Разрешаем перезапись файлов
      })

    if (error) {
      console.error('🔧 API Upload Pet Photo: Ошибка загрузки в Storage:', error)
      return NextResponse.json({ error: `Ошибка загрузки файла: ${error.message}` }, { status: 500 })
    }

    console.log('🔧 API Upload Pet Photo: Файл загружен в Storage:', data.path)

    // Получаем публичный URL
    const { data: urlData } = supabaseAdmin.storage
      .from('pet-photos')
      .getPublicUrl(data.path)

    const publicUrl = urlData.publicUrl
    console.log('🔧 API Upload Pet Photo: Публичный URL:', publicUrl)

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      path: data.path
    })

  } catch (error) {
    console.error('🔧 API Upload Pet Photo: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
