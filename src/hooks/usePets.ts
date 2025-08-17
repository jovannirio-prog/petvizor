'use client'

import { useState, useEffect } from 'react'

interface Pet {
  id: string
  user_id: string
  name: string
  breed: string
  age: number
  description?: string
  created_at: string
}

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const accessToken = localStorage.getItem('supabase_access_token')
      if (!accessToken) {
        setError('Не авторизован')
        setLoading(false)
        return
      }

      const response = await fetch('/api/pets', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setPets(result.pets || [])
      } else {
        const errorResult = await response.json()
        setError(errorResult.error || 'Ошибка загрузки питомцев')
      }
    } catch (error: any) {
      console.error('Ошибка загрузки питомцев:', error)
      setError('Ошибка загрузки питомцев')
    } finally {
      setLoading(false)
    }
  }

  const addPet = async (petData: { name: string; breed: string; age: number; description?: string }) => {
    try {
      setError(null)
      
      const accessToken = localStorage.getItem('supabase_access_token')
      if (!accessToken) {
        throw new Error('Не авторизован')
      }

      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(petData)
      })

      if (response.ok) {
        const result = await response.json()
        setPets(prev => [...prev, result.pet])
        return { success: true, pet: result.pet }
      } else {
        const errorResult = await response.json()
        throw new Error(errorResult.error || 'Ошибка создания питомца')
      }
    } catch (error: any) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const updatePet = async (petId: string, petData: { name: string; breed: string; age: number; description?: string }) => {
    try {
      setError(null)
      
      const accessToken = localStorage.getItem('supabase_access_token')
      if (!accessToken) {
        throw new Error('Не авторизован')
      }

      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(petData)
      })

      if (response.ok) {
        const result = await response.json()
        setPets(prev => prev.map(pet => pet.id === petId ? result.pet : pet))
        return { success: true, pet: result.pet }
      } else {
        const errorResult = await response.json()
        throw new Error(errorResult.error || 'Ошибка обновления питомца')
      }
    } catch (error: any) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const deletePet = async (petId: string) => {
    try {
      setError(null)
      
      const accessToken = localStorage.getItem('supabase_access_token')
      if (!accessToken) {
        throw new Error('Не авторизован')
      }

      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        setPets(prev => prev.filter(pet => pet.id !== petId))
        return { success: true }
      } else {
        const errorResult = await response.json()
        throw new Error(errorResult.error || 'Ошибка удаления питомца')
      }
    } catch (error: any) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchPets()
  }, [])

  return {
    pets,
    loading,
    error,
    fetchPets,
    addPet,
    updatePet,
    deletePet
  }
}
