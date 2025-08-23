import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Ищем пользователя по email через Supabase Auth API
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=sa@petvizor.local`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('❌ Check Admin: Ошибка поиска пользователя в Auth:', response.status)
      return NextResponse.json({ error: 'Пользователь не найден в Auth' }, { status: 404 })
    }

    const authData = await response.json()
    const userId = authData.users?.[0]?.id

    if (!userId) {
      console.error('❌ Check Admin: Пользователь не найден')
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Теперь получаем профиль с ролью
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        user_roles (
          id,
          name,
          display_name
        )
      `)
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('❌ Check Admin: Ошибка получения профиля:', profileError)
      return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: profile.id,
        email: 'sa@petvizor.local',
        full_name: profile.full_name,
        role: profile.user_roles
      }
    })

  } catch (error) {
    console.error('❌ Check Admin: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
