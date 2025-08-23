import { NextResponse } from 'next/server'

// Этот endpoint создает пользователя admin
// Используется только для первоначальной настройки системы
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zuuupcwjynjeqtjzdimt.supabase.co'
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      console.error('❌ Create Admin: Отсутствует SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({ 
        error: 'Отсутствует SUPABASE_SERVICE_ROLE_KEY в переменных окружения. Для создания администратора необходимо добавить в .env.local: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key',
        details: {
          supabaseUrl: supabaseUrl,
          serviceRoleKey: false
        }
      }, { status: 500 })
    }

    console.log('🔍 Create Admin: Создание пользователя admin')

    // Создаем пользователя через Supabase Auth API
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sa@petvizor.local',
        password: 'yyy789465',
        email_confirm: true,
        user_metadata: {
          full_name: 'System Administrator'
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Create Admin: Ошибка создания пользователя:', errorData)
      return NextResponse.json({ error: 'Ошибка создания пользователя' }, { status: 500 })
    }

    const userData = await response.json()
    console.log('✅ Create Admin: Пользователь создан:', userData.user.id)

    // Теперь назначаем роль admin
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { error: roleError } = await supabase
      .from('profiles')
      .update({ 
        role_id: (await supabase.from('user_roles').select('id').eq('name', 'admin').single()).data?.id,
        full_name: 'System Administrator'
      })
      .eq('id', userData.user.id)

    if (roleError) {
      console.error('❌ Create Admin: Ошибка назначения роли:', roleError)
      return NextResponse.json({ error: 'Ошибка назначения роли' }, { status: 500 })
    }

    console.log('✅ Create Admin: Роль admin назначена')

    return NextResponse.json({ 
      success: true, 
      message: 'Пользователь admin создан успешно',
      user: {
        id: userData.user.id,
        email: userData.user.email,
        role: 'admin'
      }
    })

  } catch (error) {
    console.error('❌ Create Admin: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
