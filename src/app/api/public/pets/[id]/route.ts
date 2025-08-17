import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Получаем питомца с информацией о владельце
    const { data: pet, error } = await supabase
      .from('pets')
      .select(`
        *,
        profiles!pets_user_id_fkey (
          full_name,
          phone
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Ошибка получения питомца:', error)
      return NextResponse.json({ error: 'Питомец не найден' }, { status: 404 })
    }

    // Формируем ответ с информацией для нашедшего
    const response = {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birth_date: pet.birth_date,
      weight: pet.weight,
      photo_url: pet.photo_url,
      lost_comment: pet.lost_comment,
      created_at: pet.created_at,
      owner: {
        name: pet.profiles?.full_name || 'Не указано',
        phone: pet.profiles?.phone || null
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Ошибка публичного API питомца:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
