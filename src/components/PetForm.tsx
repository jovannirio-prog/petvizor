'use client'

import { useState, useEffect } from 'react'
import { X, Save, PawPrint } from 'lucide-react'

interface Pet {
  id: string
  name: string
  breed: string
  age: number
  description?: string
}

interface PetFormProps {
  pet?: Pet | null
  onSave: (petData: { name: string; breed: string; age: number; description?: string }) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  isEditing?: boolean
}

export default function PetForm({ pet, onSave, onCancel, isEditing = false }: PetFormProps) {
  const [name, setName] = useState('')
  const [breed, setBreed] = useState('')
  const [age, setAge] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (pet) {
      setName(pet.name)
      setBreed(pet.breed)
      setAge(pet.age.toString())
      setDescription(pet.description || '')
    }
  }, [pet])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !breed.trim() || !age.trim()) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 30) {
      setError('Возраст должен быть числом от 1 до 30')
      return
    }

    setSaving(true)
    setError('')

    try {
      const result = await onSave({
        name: name.trim(),
        breed: breed.trim(),
        age: ageNum,
        description: description.trim() || undefined
      })

      if (result.success) {
        onCancel()
      } else {
        setError(result.error || 'Ошибка сохранения')
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Редактировать питомца' : 'Добавить питомца'}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Кличка питомца *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например, Барсик"
                required
              />
            </div>

            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                Порода *
              </label>
              <input
                id="breed"
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например, Сиамская кошка"
                required
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Возраст (лет) *
              </label>
              <input
                id="age"
                type="number"
                min="1"
                max="30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например, 3"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание (необязательно)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Особенности питомца, цвет, характер..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
