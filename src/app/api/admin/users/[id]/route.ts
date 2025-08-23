import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔒 API Admin User Update: Отсутствует токен авторизации')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Проверяем аутентификацию через токен
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('🔒 API Admin User Update: Пользователь не аутентифицирован')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Проверяем, что пользователь является админом
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (adminError || !adminProfile) {
      console.log('🔒 API Admin User Update: Профиль не найден')
      return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })
    }

    // Проверяем роль админа
    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('name')
      .eq('id', adminProfile.role_id)
      .single()

    if (roleError || adminRole?.name !== 'admin') {
      console.log('🔒 API Admin User Update: Недостаточно прав')
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    // Получаем данные для обновления
    const { role_id } = await request.json()

    if (!role_id) {
      console.log('🔒 API Admin User Update: Не указана роль')
      return NextResponse.json({ error: 'Не указана роль' }, { status: 400 })
    }

    console.log('🔍 API Admin User Update: Обновление роли пользователя:', params.id, 'на роль:', role_id)

    // Проверяем, что роль существует
    const { data: roleExists, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('id', role_id)
      .single()

    if (roleCheckError || !roleExists) {
      console.log('🔒 API Admin User Update: Роль не найдена')
      return NextResponse.json({ error: 'Роль не найдена' }, { status: 404 })
    }

    // Обновляем роль пользователя
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role_id })
      .eq('id', params.id)
      .select(`
        *,
        user_roles (
          id,
          name,
          display_name
        )
      `)
      .single()

    if (updateError) {
      console.error('❌ API Admin User Update: Ошибка обновления:', updateError)
      return NextResponse.json({ error: 'Ошибка обновления роли' }, { status: 500 })
    }

    console.log('✅ API Admin User Update: Роль обновлена:', updatedProfile)

    return NextResponse.json({ user: updatedProfile })
  } catch (error) {
    console.error('❌ API Admin User Update: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
