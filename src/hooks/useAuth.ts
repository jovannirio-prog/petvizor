'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Получаем текущую сессию
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Supabase session error:', error.message)
          if (mounted) {
            setUser(null)
            setError('Ошибка подключения к базе данных')
          }
        } else if (mounted) {
          setUser(session?.user ?? null)
          setError(null)
        }
      } catch (error) {
        console.warn('Supabase not configured, using demo mode')
        if (mounted) {
          setUser(null)
          setError('База данных не настроена')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    // Слушаем изменения аутентификации
    let subscription: any = null
    
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (mounted) {
            setUser(session?.user ?? null)
            setLoading(false)
            setError(null)
          }
        }
      )
      subscription = authSubscription
    } catch (error) {
      console.warn('Supabase auth listener error:', error)
      if (mounted) {
        setLoading(false)
        setError('Ошибка подключения к аутентификации')
      }
    }

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('Sign out error:', error.message)
        setError('Ошибка при выходе')
      } else {
        setUser(null)
        setError(null)
      }
    } catch (error) {
      console.warn('Supabase sign out error:', error)
      setUser(null)
      setError('Ошибка при выходе')
    }
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    error
  }
}
