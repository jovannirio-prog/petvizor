'use client'

import { useState } from 'react'
import NavigationWrapper from '@/components/NavigationWrapper'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { 
  PawPrint, 
  ArrowLeft,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

export default function NewPetPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    birth_date: '',
    weight: ''
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Сначала загружаем изображение, если оно выбрано
      let photoUrl = null
      
      if (selectedImage) {
        const uploadResponse = await fetch('/api/upload-pet-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
          },
          body: (() => {
            const formData = new FormData()
            formData.append('file', selectedImage)
            return formData
          })()
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          photoUrl = uploadResult.url
        } else {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || 'Ошибка загрузки изображения')
        }
      }

      const petData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        birth_date: formData.birth_date || null,
        photo_url: photoUrl
      }
      
      console.log('🔧 New Pet: Отправляем данные питомца:', petData)

      // Создаем питомца
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
        },
        body: JSON.stringify(petData)
      })

      console.log('🔧 New Pet: Ответ сервера, статус:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('🔧 New Pet: Питомец создан успешно:', result)
        router.push('/pets')
      } else {
        const errorData = await response.json()
        console.error('🔧 New Pet: Ошибка создания питомца:', errorData)
        setError(errorData.error || 'Ошибка создания питомца')
      }
    } catch (error) {
      console.error('Ошибка создания питомца:', error)
      setError(error instanceof Error ? error.message : 'Ошибка создания питомца')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedImage(file)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationWrapper />
      
      <div className="max-w-2xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/pets" 
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад
          </Link>
          <div className="flex items-center">
            <PawPrint className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Добавить питомца</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Имя питомца *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите имя питомца"
              />
            </div>

            {/* Species */}
            <div>
              <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
                Вид животного *
              </label>
              <select
                id="species"
                name="species"
                value={formData.species}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите вид животного</option>
                <option value="dog">Собака</option>
                <option value="cat">Кошка</option>
                <option value="bird">Птица</option>
                <option value="fish">Рыба</option>
                <option value="other">Другое</option>
              </select>
            </div>

            {/* Breed */}
            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                Порода
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите породу"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                Дата рождения
              </label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Вес (кг)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите вес"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фотография питомца
              </label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Link
                href="/pets"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <X className="h-5 w-5 mr-2" />
                Отмена
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Создание...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Создать питомца
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
