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
      console.log('🔒 API Admin Users: Отсутствует токен авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Проверяем аутентификацию через токен
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    console.log('🔍 API Admin Users: Проверка токена:', authError ? 'ошибка' : 'успех')
    console.log('🔍 API Admin Users: Пользователь:', user?.email)
    
    if (authError || !user) {
      console.log('🔒 API Admin Users: Пользователь не аутентифицирован')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Проверяем, что пользователь является админом
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (adminError || !adminProfile) {
      console.log('🔒 API Admin Users: Профиль не найден')
      return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })
    }

    // Проверяем роль админа
    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('name')
      .eq('id', adminProfile.role_id)
      .single()

    if (roleError || adminRole?.name !== 'admin') {
      console.log('🔒 API Admin Users: Недостаточно прав')
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    console.log('🔍 API Admin Users: Получение пользователей админом:', user.email)

    // Получаем параметры поиска
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Получаем пользователей с ролями
    let query = supabase
      .from('users_with_roles')
      .select('*')
      .order('created_at', { ascending: false })

    // Применяем фильтр поиска
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      console.error('❌ API Admin Users: Ошибка получения пользователей:', usersError)
      return NextResponse.json({ error: 'Ошибка получения пользователей' }, { status: 500 })
    }

    console.log('✅ API Admin Users: Пользователи получены:', users.length)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('❌ API Admin Users: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
