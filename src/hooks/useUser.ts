'use client'

import { useState, useEffect } from 'react'

interface UserRole {
  id: number
  name: string
  display_name: string
  description?: string
}

interface User {
  id: string
  email: string
  full_name?: string | null
  phone?: string | null
  role?: UserRole | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 useUser: Хук инициализирован')
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      console.log('🔍 useUser: Проверяем пользователя')
      const accessToken = localStorage.getItem('supabase_access_token')
      const refreshToken = localStorage.getItem('supabase_refresh_token')
      console.log('🔍 useUser: Access token найден:', !!accessToken)
      console.log('🔍 useUser: Refresh token найден:', !!refreshToken)
      
      if (!accessToken) {
        console.log('🔍 useUser: Токен не найден, устанавливаем user = null')
        setUser(null)
        setLoading(false)
        return
      }

      // Добавляем небольшую задержку для стабильности
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('🔍 useUser: Отправляем запрос к /api/user')
      // Проверяем токен и получаем данные пользователя
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`
      }
      
      if (refreshToken) {
        headers['x-refresh-token'] = refreshToken
      }
      
      const response = await fetch('/api/user', { headers })

      console.log('🔍 useUser: Ответ от сервера, статус:', response.status)
      if (response.ok) {
        const result = await response.json()
        console.log('🔍 useUser: Получены данные пользователя:', result.user)
        
        // Если получены новые токены, обновляем их
        if (result.newTokens) {
          console.log('🔍 useUser: Обновляем токены')
          if (result.newTokens.access_token) {
            localStorage.setItem('supabase_access_token', result.newTokens.access_token)
          }
          if (result.newTokens.refresh_token) {
            localStorage.setItem('supabase_refresh_token', result.newTokens.refresh_token)
          }
        }
        
        setUser(result.user)
      } else {
        console.log('🔍 useUser: Токен недействителен, очищаем')
        // Токен недействителен, очищаем
        localStorage.removeItem('supabase_access_token')
        localStorage.removeItem('supabase_refresh_token')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ useUser: Ошибка проверки пользователя:', error)
      setUser(null)
    } finally {
      console.log('🔍 useUser: Завершаем проверку, loading = false')
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('🔍 useUser: Выход из системы')
    localStorage.removeItem('supabase_access_token')
    localStorage.removeItem('supabase_refresh_token')
    setUser(null)
    window.location.href = '/'
  }

  return {
    user,
    loading,
    logout,
    checkUser
  }
}
