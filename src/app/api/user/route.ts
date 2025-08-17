import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API User: Получен запрос')
    const authHeader = request.headers.get('authorization')
    console.log('🔍 API User: Authorization header:', authHeader ? 'present' : 'missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 API User: Нет токена, возвращаем null')
      return NextResponse.json({ user: null })
    }
    
    const token = authHeader.replace('Bearer ', '')
    console.log('🔍 API User: Токен получен, длина:', token.length)
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    console.log('🔍 API User: Результат getUser:', { user: !!user, error: !!error })
    
    if (error) {
      console.log('🔍 API User: Ошибка getUser:', error.message)
      
      // Если токен истек, попробуем обновить его
      if (error.message.includes('expired')) {
        console.log('🔍 API User: Токен истек, пытаемся обновить')
        
        // Получаем refresh token из заголовка или cookies
        const refreshToken = request.headers.get('x-refresh-token')
        if (refreshToken) {
          console.log('🔍 API User: Обновляем токен')
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
          })
          
          if (refreshError) {
            console.log('🔍 API User: Ошибка обновления токена:', refreshError.message)
            return NextResponse.json({ user: null })
          }
          
          if (refreshData.user) {
            console.log('🔍 API User: Токен обновлен, пользователь найден:', refreshData.user.email)
            return NextResponse.json({ 
              user: refreshData.user,
              newTokens: {
                access_token: refreshData.session?.access_token,
                refresh_token: refreshData.session?.refresh_token
              }
            })
          }
        }
      }
      
      return NextResponse.json({ user: null })
    }

    if (!user) {
      console.log('🔍 API User: Пользователь не найден')
      return NextResponse.json({ user: null })
    }

    console.log('🔍 API User: Пользователь найден:', user.email)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('❌ API User: Ошибка получения пользователя:', error)
    return NextResponse.json({ user: null })
  }
}
