import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Сначала найдем пользователя в auth.users
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=sa@petvizor.local`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('❌ Check Admin Direct: Ошибка поиска пользователя в Auth:', response.status)
      return NextResponse.json({ 
        error: 'Пользователь не найден в Auth',
        details: 'Пользователь sa@petvizor.local не существует в системе'
      }, { status: 404 })
    }

    const authData = await response.json()
    const userId = authData.users?.[0]?.id

    if (!userId) {
      console.error('❌ Check Admin Direct: Пользователь не найден в Auth')
      return NextResponse.json({ 
        error: 'Пользователь не найден',
        details: 'Пользователь sa@petvizor.local не найден в базе данных'
      }, { status: 404 })
    }

    console.log('✅ Check Admin Direct: Пользователь найден в Auth, ID:', userId)

    // Теперь получим профиль с ролью
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
      console.error('❌ Check Admin Direct: Ошибка получения профиля:', profileError)
      return NextResponse.json({ 
        error: 'Профиль не найден',
        details: 'Пользователь существует в Auth, но профиль не найден'
      }, { status: 404 })
    }

    console.log('✅ Check Admin Direct: Профиль найден:', profile)

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
    console.error('❌ Check Admin Direct: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
