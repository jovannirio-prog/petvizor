import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
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
      console.error('❌ Fix Admin Profile: Ошибка поиска пользователя в Auth:', response.status)
      return NextResponse.json({ 
        error: 'Пользователь не найден в Auth',
        details: 'Пользователь sa@petvizor.local не существует в системе'
      }, { status: 404 })
    }

    const authData = await response.json()
    const userId = authData.users?.[0]?.id

    if (!userId) {
      console.error('❌ Fix Admin Profile: Пользователь не найден в Auth')
      return NextResponse.json({ 
        error: 'Пользователь не найден',
        details: 'Пользователь sa@petvizor.local не найден в базе данных'
      }, { status: 404 })
    }

    console.log('✅ Fix Admin Profile: Пользователь найден в Auth, ID:', userId)

    // Получим ID роли admin
    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'admin')
      .single()

    if (roleError) {
      console.error('❌ Fix Admin Profile: Ошибка получения роли admin:', roleError)
      return NextResponse.json({ 
        error: 'Роль admin не найдена',
        details: 'Необходимо выполнить SQL скрипт create-user-roles-system.sql'
      }, { status: 500 })
    }

    console.log('✅ Fix Admin Profile: Роль admin найдена, ID:', adminRole.id)

    // Сначала создаем запись в таблице users
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: 'sa@petvizor.local'
      })
      .select()
      .single()

    if (userError) {
      // Если запись уже существует, это нормально
      if (userError.code === '23505') { // unique_violation
        console.log('✅ Fix Admin Profile: Запись в users уже существует')
      } else {
        console.error('❌ Fix Admin Profile: Ошибка создания записи в users:', userError)
        return NextResponse.json({ 
          error: 'Ошибка создания записи в users',
          details: userError.message
        }, { status: 500 })
      }
    } else {
      console.log('✅ Fix Admin Profile: Запись в users создана:', userRecord)
    }

    // Теперь создаем профиль для пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'sa@petvizor.local',
        full_name: 'System Administrator',
        role_id: adminRole.id
      })
      .select(`
        id,
        email,
        full_name,
        user_roles (
          id,
          name,
          display_name
        )
      `)
      .single()

    if (profileError) {
      // Если профиль уже существует, попробуем обновить его
      if (profileError.code === '23505') { // unique_violation
        console.log('✅ Fix Admin Profile: Профиль уже существует, обновляем...')
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: 'System Administrator',
            role_id: adminRole.id
          })
          .eq('id', userId)
          .select(`
            id,
            email,
            full_name,
            user_roles (
              id,
              name,
              display_name
            )
          `)
          .single()

        if (updateError) {
          console.error('❌ Fix Admin Profile: Ошибка обновления профиля:', updateError)
          return NextResponse.json({ 
            error: 'Ошибка обновления профиля',
            details: updateError.message
          }, { status: 500 })
        }

        console.log('✅ Fix Admin Profile: Профиль обновлен успешно:', updatedProfile)
        return NextResponse.json({ 
          success: true,
          message: 'Профиль администратора обновлен успешно',
          user: {
            id: updatedProfile.id,
            email: updatedProfile.email,
            full_name: updatedProfile.full_name,
            role: updatedProfile.user_roles
          }
        })
      } else {
        console.error('❌ Fix Admin Profile: Ошибка создания профиля:', profileError)
        return NextResponse.json({ 
          error: 'Ошибка создания профиля',
          details: profileError.message
        }, { status: 500 })
      }
    }

    console.log('✅ Fix Admin Profile: Профиль создан успешно:', profile)

    return NextResponse.json({ 
      success: true,
      message: 'Профиль администратора создан успешно',
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.user_roles
      }
    })

  } catch (error) {
    console.error('❌ Fix Admin Profile: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
