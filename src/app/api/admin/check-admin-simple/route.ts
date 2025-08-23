import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Простой SQL запрос для поиска пользователя с ролью admin
    const { data, error } = await supabase
      .rpc('check_admin_user', {
        admin_email: 'sa@petvizor.local'
      })

    if (error) {
      console.error('❌ Check Admin Simple: Ошибка SQL запроса:', error)
      
      // Если функция не существует, попробуем прямой запрос
      const { data: directData, error: directError } = await supabase
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
        .eq('id', 'sa@petvizor.local') // Попробуем найти по email как ID
        .single()

      if (directError) {
        console.error('❌ Check Admin Simple: Пользователь не найден')
        return NextResponse.json({ 
          error: 'Пользователь не найден',
          details: 'Попробуйте создать администратора заново'
        }, { status: 404 })
      }

      return NextResponse.json({ 
        success: true,
        user: {
          id: directData.id,
          email: 'sa@petvizor.local',
          full_name: directData.full_name,
          role: directData.user_roles
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: data[0]?.user_id,
        email: data[0]?.user_email,
        full_name: data[0]?.user_full_name,
        role: {
          name: data[0]?.user_role_name,
          display_name: data[0]?.user_role_display_name
        }
      }
    })

  } catch (error) {
    console.error('❌ Check Admin Simple: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
