import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = 'https://zuuupcwjynjeqtjzdimt.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dXVwY3dqeW5qZXF0anpkaW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjk3NDcsImV4cCI6MjA3MDkwNTc0N30.fUKZnqs_xlsAUlle2UmAaalupJ0rMIyoKlIhNpdTFao'

    console.log('🔍 Начинаем создание тестового питомца...')

    // Сначала найдем первого пользователя в системе
    const usersResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    console.log('📊 Статус поиска пользователей:', usersResponse.status)
    const usersResult = await usersResponse.json()
    console.log('👥 Найденные пользователи:', usersResult)
    
    if (!usersResponse.ok || usersResult.length === 0) {
      console.log('❌ Нет пользователей в системе')
      return NextResponse.json({ 
        error: 'Нет пользователей в системе для создания тестового питомца'
      }, { status: 404 })
    }

    const userId = usersResult[0].id
    console.log('✅ Найден пользователь с ID:', userId)

    // Создаем тестового питомца с правильной структурой данных
    const testPetData = {
      user_id: userId,
      name: 'Барсик',
      breed: 'Сиамская кошка',
      age: 3, // Возраст в годах
      weight: 4.5, // Вес в кг
      description: 'Ласковый и игривый кот. Любит играть с мячиком и спать на солнышке.',
      image_url: null // URL изображения (пока null)
    }

    console.log('🐾 Данные тестового питомца:', testPetData)

    const petResponse = await fetch(`${supabaseUrl}/rest/v1/pets`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testPetData)
    })

    console.log('📊 Статус создания питомца:', petResponse.status)

    if (petResponse.ok) {
      const petResult = await petResponse.json()
      console.log('✅ Тестовый питомец создан успешно:', petResult[0])
      return NextResponse.json({ 
        success: true,
        message: 'Тестовый питомец создан успешно',
        pet: petResult[0]
      })
    } else {
      const errorResult = await petResponse.json()
      console.log('❌ Ошибка создания питомца:', errorResult)
      return NextResponse.json({ 
        error: 'Ошибка создания тестового питомца',
        details: errorResult
      }, { status: petResponse.status })
    }

  } catch (error: any) {
    console.error('💥 Ошибка создания тестового питомца:', error)
    return NextResponse.json({ 
      error: error.message,
      details: 'Ошибка при создании тестового питомца'
    }, { status: 500 })
  }
}
