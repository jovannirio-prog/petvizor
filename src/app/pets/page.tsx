'use client'

import { useState, useEffect } from 'react'
import NavigationWrapper from '@/components/NavigationWrapper'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { 
  PawPrint, 
  Plus, 
  Search, 
  Filter,
  Heart,
  Calendar,
  Weight,
  MapPin,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

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

export default function PetsPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [loadingPets, setLoadingPets] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecies, setFilterSpecies] = useState('all')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadPets()
    }
  }, [user])

  const loadPets = async () => {
    try {
      const response = await fetch('/api/pets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPets(data)
      } else {
        console.error('Ошибка загрузки питомцев')
      }
    } catch (error) {
      console.error('Ошибка загрузки питомцев:', error)
    } finally {
      setLoadingPets(false)
    }
  }

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSpecies = filterSpecies === 'all' || (pet.species && pet.species === filterSpecies)
    return matchesSearch && matchesSpecies
  })

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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationWrapper />
      
      <div className="max-w-7xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Link>
            <div className="flex items-center">
              <PawPrint className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Мои питомцы</h1>
            </div>
          </div>
          
          <Link
            href="/pet/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Добавить питомца
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по имени или породе..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все виды</option>
                <option value="dog">Собаки</option>
                <option value="cat">Кошки</option>
                <option value="bird">Птицы</option>
                <option value="fish">Рыбы</option>
                <option value="other">Другие</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pets Grid */}
        {loadingPets ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка питомцев...</p>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-12">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {pets.length === 0 ? 'У вас пока нет питомцев' : 'Питомцы не найдены'}
            </h3>
            <p className="text-gray-600 mb-6">
              {pets.length === 0 
                ? 'Добавьте своего первого питомца, чтобы начать отслеживать его здоровье и активность'
                : 'Попробуйте изменить параметры поиска'
              }
            </p>
            {pets.length === 0 && (
              <Link
                href="/pet/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Добавить первого питомца
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Pet Photo */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  {pet.photo_url ? (
                    <img 
                      src={pet.photo_url} 
                      alt={pet.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Если изображение не загружается, показываем иконку
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div className={`text-6xl ${pet.photo_url ? 'hidden' : ''}`}>
                    {getSpeciesIcon(pet.species)}
                  </div>
                </div>
                
                {/* Pet Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/pet/${pet.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {/* TODO: Delete pet */}}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <PawPrint className="h-4 w-4 mr-2" />
                      <span className="capitalize">{pet.species || 'Не указан'}</span>
                      {pet.breed && <span className="ml-1">• {pet.breed}</span>}
                    </div>
                    
                    {pet.birth_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(pet.birth_date)}</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {calculateAge(pet.birth_date)}
                        </span>
                      </div>
                    )}
                    
                    {pet.weight && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Weight className="h-4 w-4 mr-2" />
                        <span>{pet.weight} кг</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href={`/pet/${pet.id}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
