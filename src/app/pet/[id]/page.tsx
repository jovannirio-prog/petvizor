'use client'

import { useState, useEffect } from 'react'
import NavigationWrapper from '@/components/NavigationWrapper'
import { useUser } from '@/hooks/useUser'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  PawPrint, 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Weight,
  Heart,
  MapPin,
  Phone,
  MessageCircle,
  User,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import PetQRCode from '@/components/PetQRCode'
import PetEvents from '@/components/PetEvents'

interface Pet {
  id: string
  user_id: string
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

export default function PetPage({ params }: { params: { id: string } }) {
  const { user, loading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loadingPet, setLoadingPet] = useState(true)
  const [error, setError] = useState('')
  const [ownerProfile, setOwnerProfile] = useState<any>(null)
  const [loadingOwner, setLoadingOwner] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

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

  // Отслеживаем изменения searchParams
  useEffect(() => {
    const previewMode = searchParams.get('preview') === 'true'
    console.log('🔧 Pet Page: searchParams изменились, preview mode:', previewMode)
    setIsPreviewMode(previewMode)
  }, [searchParams])

  // Дополнительная проверка при загрузке страницы
  useEffect(() => {
    const previewMode = searchParams.get('preview') === 'true'
    console.log('🔧 Pet Page: Начальная загрузка, preview mode:', previewMode)
    setIsPreviewMode(previewMode)
  }, [])

  // Обновляем данные при изменении URL (например, при добавлении параметра refresh)
  useEffect(() => {
    if (user && params.id) {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('refresh')) {
        console.log('🔧 Pet Page: Обнаружен параметр refresh, обновляем данные')
        loadPet()
        // Убираем параметр refresh из URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [user, params.id])

  // Обновляем данные при фокусе на странице (после возврата с редактирования)
  useEffect(() => {
    const handleFocus = () => {
      if (user && params.id) {
        console.log('🔧 Pet Page: Обновляем данные при фокусе')
        loadPet()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, params.id])

  const loadPet = async () => {
    try {
      console.log('🔧 Pet Page: Загружаем данные питомца:', params.id)
      
      const response = await fetch(`/api/pets/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔧 Pet Page: Получены данные питомца:', data)
        setPet(data)
        
        // Загружаем профиль владельца (если пользователь не владелец)
        if (user && data.user_id !== user.id) {
          loadOwnerProfile(data.user_id)
        }
      } else if (response.status === 404) {
        console.error('🔧 Pet Page: Питомец не найден')
        setError('Питомец не найден')
      } else {
        console.error('🔧 Pet Page: Ошибка загрузки питомца, статус:', response.status)
        setError('Ошибка загрузки питомца')
      }
    } catch (error) {
      console.error('🔧 Pet Page: Ошибка загрузки питомца:', error)
      setError('Ошибка загрузки питомца')
    } finally {
      setLoadingPet(false)
    }
  }

  const loadOwnerProfile = async (ownerId: string) => {
    try {
      console.log('🔧 Pet Page: Загружаем профиль владельца:', ownerId)
      setLoadingOwner(true)
      
      const response = await fetch(`/api/profile/${ownerId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔧 Pet Page: Получен профиль владельца:', data)
        setOwnerProfile(data)
      } else {
        console.error('🔧 Pet Page: Ошибка загрузки профиля владельца, статус:', response.status)
      }
    } catch (error) {
      console.error('🔧 Pet Page: Ошибка загрузки профиля владельца:', error)
    } finally {
      setLoadingOwner(false)
    }
  }

  // Загружаем профиль владельца в режиме предварительного просмотра
  useEffect(() => {
    if (user && pet && pet.user_id === user.id && isPreviewMode && !ownerProfile) {
      loadOwnerProfile(pet.user_id)
    }
  }, [user, pet, isPreviewMode, ownerProfile])

  const getSpeciesIcon = (species: string | null) => {
    if (!species) return '🐾'
    
    switch (species.toLowerCase()) {
      case 'dog':
      case 'собака':
        return '🐕'
      case 'cat':
      case 'кошка':
        return '🐱'
      case 'bird':
      case 'птица':
        return '🐦'
      case 'fish':
      case 'рыба':
        return '🐠'
      default:
        return '🐾'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указана'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInYears = today.getFullYear() - birth.getFullYear()
    const ageInMonths = today.getMonth() - birth.getMonth()
    
    if (ageInYears > 0) {
      return `${ageInYears} ${ageInYears === 1 ? 'год' : ageInYears < 5 ? 'года' : 'лет'}`
    } else if (ageInMonths > 0) {
      return `${ageInMonths} ${ageInMonths === 1 ? 'месяц' : ageInMonths < 5 ? 'месяца' : 'месяцев'}`
    } else {
      return 'Менее месяца'
    }
  }

  if (loading || loadingPet || (user && pet && pet.user_id !== user.id && loadingOwner)) {
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
        <div className="max-w-4xl mx-auto p-4 pt-8">
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
        <div className="max-w-4xl mx-auto p-4 pt-8">
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
      
      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href={user && pet && pet.user_id === user.id ? "/pets" : "/"} 
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {user && pet && pet.user_id === user.id ? "Назад" : "На главную"}
            </Link>
            <div className="flex items-center">
              <PawPrint className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                {isPreviewMode && (
                  <p className="text-sm text-blue-600 font-medium">Режим предварительного просмотра</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Показываем кнопки редактирования только владельцу питомца */}
          {user && pet.user_id === user.id && !isPreviewMode && (
            <div className="flex items-center space-x-2">
              <Link
                href={`/pet/${pet.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Link>
              <button
                onClick={() => {
                  console.log('🔧 Pet Page: Переход в режим предварительного просмотра')
                  // Используем window.location для принудительного обновления
                  window.location.href = `/pet/${pet.id}?preview=true`
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Публичный QR-профиль
              </button>
              <button
                onClick={() => {/* TODO: Delete pet */}}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </button>
            </div>
          )}
          
          {/* Кнопка выхода из предварительного просмотра */}
          {user && pet.user_id === user.id && isPreviewMode && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  console.log('🔧 Pet Page: Выход из режима предварительного просмотра')
                  // Используем window.location для принудительного обновления
                  window.location.href = `/pet/${pet.id}`
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Выйти из предварительного просмотра
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pet Photo */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                {pet.photo_url ? (
                  <img 
                    src={pet.photo_url} 
                    alt={pet.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`text-8xl ${pet.photo_url ? 'hidden' : ''}`}>
                  {getSpeciesIcon(pet.species)}
                </div>
              </div>
            </div>

            {/* QR Code - показываем только владельцу питомца, но не в режиме предварительного просмотра */}
            {user && pet.user_id === user.id && !isPreviewMode && (
              <PetQRCode petId={pet.id} petName={pet.name} />
            )}
          </div>

          {/* Pet Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Основная информация</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <PawPrint className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Вид</p>
                    <p className="font-medium">{pet.species || 'Не указан'}</p>
                  </div>
                </div>
                
                {pet.breed && (
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Порода</p>
                      <p className="font-medium">{pet.breed}</p>
                    </div>
                  </div>
                )}
                
                {pet.birth_date && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Дата рождения</p>
                      <p className="font-medium">{formatDate(pet.birth_date)}</p>
                      <p className="text-xs text-blue-600">{calculateAge(pet.birth_date)}</p>
                    </div>
                  </div>
                )}
                
                {pet.weight && (
                  <div className="flex items-center">
                    <Weight className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Вес</p>
                      <p className="font-medium">{pet.weight} кг</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Events - показываем только владельцу питомца */}
            {user && pet.user_id === user.id && (
              <PetEvents petId={pet.id} petName={pet.name} />
            )}

            {/* Lost Info */}
            {pet.lost_comment && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Если потерялся</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MessageCircle className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Комментарий</p>
                      <p className="font-medium">{pet.lost_comment}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Owner Contact Info - показываем если пользователь не владелец или в режиме предварительного просмотра */}
            {((user && pet.user_id !== user.id) || (user && pet.user_id === user.id && isPreviewMode)) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Контактная информация владельца</h2>
                <div className="space-y-4">
                  {loadingOwner ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-gray-600">Загрузка контактов...</span>
                    </div>
                  ) : ownerProfile ? (
                    <>
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Имя владельца</p>
                          <p className="font-medium">{ownerProfile.full_name || 'Не указано'}</p>
                        </div>
                      </div>
                      {ownerProfile.phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Телефон</p>
                            <a 
                              href={`tel:${ownerProfile.phone}`}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              {ownerProfile.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Контактная информация недоступна</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
