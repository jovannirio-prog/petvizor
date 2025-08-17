import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Test Storage: Проверяем настройки')
    
    // Проверяем переменные окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔧 Test Storage: Supabase URL:', supabaseUrl ? 'Настроен' : 'НЕ НАСТРОЕН')
    console.log('🔧 Test Storage: Service Role Key:', serviceRoleKey ? 'Настроен' : 'НЕ НАСТРОЕН')
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Не настроены переменные окружения',
        supabaseUrl: !!supabaseUrl,
        serviceRoleKey: !!serviceRoleKey
      }, { status: 500 })
    }

    // Создаем admin клиент
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Проверяем bucket
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketError) {
      console.error('🔧 Test Storage: Ошибка получения buckets:', bucketError)
      return NextResponse.json({ error: `Ошибка получения buckets: ${bucketError.message}` }, { status: 500 })
    }

    const petPhotosBucket = buckets.find(bucket => bucket.name === 'pet-photos')
    
    console.log('🔧 Test Storage: Найден bucket pet-photos:', !!petPhotosBucket)
    console.log('🔧 Test Storage: Все buckets:', buckets.map(b => b.name))

    return NextResponse.json({ 
      success: true,
      supabaseUrl: !!supabaseUrl,
      serviceRoleKey: !!serviceRoleKey,
      petPhotosBucketExists: !!petPhotosBucket,
      allBuckets: buckets.map(b => b.name)
    })

  } catch (error) {
    console.error('🔧 Test Storage: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
