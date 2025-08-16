'use client'

import { useState, useEffect } from 'react'

export function useDemoAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Сразу завершаем загрузку
    setLoading(false)
  }, [])

  const signOut = async () => {
    setUser(null)
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  }
}
