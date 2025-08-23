import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔒 API User Roles: Отсутствует токен авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Проверяем аутентификацию через токен
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('🔒 API User Roles: Пользователь не аутентифицирован')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    console.log('🔍 API User Roles: Получение ролей для пользователя:', user.email)

    // Получаем роли пользователей
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .order('id')

    if (rolesError) {
      console.error('❌ API User Roles: Ошибка получения ролей:', rolesError)
      return NextResponse.json({ error: 'Ошибка получения ролей' }, { status: 500 })
    }

    console.log('✅ API User Roles: Роли получены:', roles.length)

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('❌ API User Roles: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
