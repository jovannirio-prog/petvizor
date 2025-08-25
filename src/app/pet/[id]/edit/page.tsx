'use client'

import { useState, useEffect } from 'react'
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

interface Pet {
  id: string
  name: string
  species: string | null
  breed: string | null
  birth_date: string | null
  weight: number | null
  photo_url: string | null
  lost_comment: string | null
  created_at: string
  updated_at: string
}

export default function EditPetPage({ params }: { params: { id: string } }) {
  const { user, loading } = useUser()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    birth_date: '',
    weight: '',
    lost_comment: ''
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loadingPet, setLoadingPet] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && params.id) {
      loadPet()
    }
  }, [user, params.id])

  const loadPet = async () => {
    try {
      const response = await fetch(`/api/pets/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPet(data)
        setFormData({
          name: data.name || '',
          species: data.species || '',
          breed: data.breed || '',
          birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
          weight: data.weight ? data.weight.toString() : '',
          lost_comment: data.lost_comment || ''
        })
      } else if (response.status === 404) {
        setError('Питомец не найден')
      } else {
        setError('Ошибка загрузки питомца')
      }
    } catch (error) {
      console.error('Ошибка загрузки питомца:', error)
      setError('Ошибка загрузки питомца')
    } finally {
      setLoadingPet(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Сначала загружаем изображение, если оно выбрано
      let photoUrl = pet?.photo_url || null
      
      console.log('🔧 Edit Pet: Проверяем выбранное изображение:', selectedImage ? selectedImage.name : 'нет')
      console.log('🔧 Edit Pet: selectedImage объект:', selectedImage)
      console.log('🔧 Edit Pet: selectedImage тип:', typeof selectedImage)
      
      if (selectedImage) {
        console.log('🔧 Edit Pet: Начинаем загрузку фотографии в Storage')
        
        const uploadResponse = await fetch('/api/upload-pet-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
          },
          body: (() => {
            const formData = new FormData()
            formData.append('file', selectedImage)
            console.log('🔧 Edit Pet: FormData создан с файлом:', selectedImage.name)
            return formData
          })()
        })

        console.log('🔧 Edit Pet: Ответ загрузки фотографии, статус:', uploadResponse.status)

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          console.log('🔧 Edit Pet: Фотография загружена успешно:', uploadResult)
          photoUrl = uploadResult.url
        } else {
          const uploadError = await uploadResponse.json()
          console.error('🔧 Edit Pet: Ошибка загрузки фотографии:', uploadError)
          throw new Error(uploadError.error || 'Ошибка загрузки изображения')
        }
      } else {
        console.log('🔧 Edit Pet: Фотография не выбрана, используем существующую:', photoUrl)
      }

      const updateData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        birth_date: formData.birth_date || null,
        photo_url: photoUrl
      }
      
      console.log('🔧 Edit Pet: photoUrl значение:', photoUrl)
      console.log('🔧 Edit Pet: Отправляем данные для обновления:', updateData)
      console.log('🔧 Edit Pet: photo_url в updateData:', updateData.photo_url)

      // Обновляем питомца
      const response = await fetch(`/api/pets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
        },
        body: JSON.stringify(updateData)
      })

      console.log('🔧 Edit Pet: Ответ сервера, статус:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('🔧 Edit Pet: Питомец обновлен успешно:', result)
        // Принудительно обновляем страницу питомца
        router.push(`/pet/${params.id}?refresh=${Date.now()}`)
      } else {
        const errorData = await response.json()
        console.error('🔧 Edit Pet: Ошибка обновления питомца:', errorData)
        setError(errorData.error || 'Ошибка обновления питомца')
      }
    } catch (error) {
      console.error('Ошибка обновления питомца:', error)
      setError(error instanceof Error ? error.message : 'Ошибка обновления питомца')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (file: File, previewUrl: string) => {
    console.log('🔧 Edit Pet: Получен файл от ImageUpload:', file.name, 'размер:', file.size)
    setSelectedImage(file)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
  }

  if (loading || loadingPet) {
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
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationWrapper />
        <div className="max-w-2xl mx-auto p-4 pt-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/pets"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Вернуться к списку питомцев
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationWrapper />
        <div className="max-w-2xl mx-auto p-4 pt-24">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Питомец не найден</h1>
            <p className="text-gray-600 mb-6">Не удалось загрузить данные питомца</p>
            <Link
              href="/pets"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Вернуться к списку питомцев
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationWrapper />
      
      <div className="max-w-2xl mx-auto p-4 pt-24">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href={`/pet/${params.id}`} 
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад
          </Link>
          <div className="flex items-center">
            <PawPrint className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Редактировать {pet.name}</h1>
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

            {/* Lost Comment */}
            <div>
              <label htmlFor="lost_comment" className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий для случая потери
              </label>
              <textarea
                id="lost_comment"
                name="lost_comment"
                value={formData.lost_comment}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Напишите информацию, которая поможет найти питомца, если он потеряется..."
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
                currentImageUrl={pet.photo_url}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Link
                href={`/pet/${params.id}`}
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
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Сохранить изменения
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
