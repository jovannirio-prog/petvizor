import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Только изображения разрешены' }, { status: 400 })
    }

    // Проверяем размер файла (3MB)
    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: 'Файл слишком большой. Максимум 3MB' }, { status: 400 })
    }

    const supabase = createClient()
    
    // Получаем пользователя по токену
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Загружаем файл в Supabase Storage
    const { data, error } = await supabase.storage
      .from('pet-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Ошибка загрузки файла:', error)
      return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 })
    }

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from('pet-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName 
    })

  } catch (error) {
    console.error('Ошибка API загрузки изображения:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
