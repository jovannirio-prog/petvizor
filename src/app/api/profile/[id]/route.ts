import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API Profile Public: Начало обработки GET запроса для пользователя:', params.id)
    
    // Получаем только публичную информацию о профиле
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('🔧 API Profile Public: Ошибка получения профиля:', error)
      return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })
    }

    console.log('🔧 API Profile Public: Найден профиль:', profile)

    // Возвращаем только публичную информацию
    return NextResponse.json({
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone,
      created_at: profile.created_at
    })
  } catch (error) {
    console.error('🔧 API Profile Public: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
