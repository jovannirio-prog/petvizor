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
        setPets(data.pets || [])
      } else {
        console.error('Ошибка загрузки питомцев')
      }
    } catch (error) {
      console.error('Ошибка загрузки питомцев:', error)
    } finally {
      setLoadingPets(false)
    }
  }

  const handleDeletePet = async (petId: string, petName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить питомца "${petName}"? Это действие нельзя отменить.`)) {
      return
    }

    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Питомец удален:', result)
        
        // Обновляем список питомцев
        setPets(prevPets => prevPets.filter(pet => pet.id !== petId))
        
        // Показываем уведомление об успехе
        alert(`Питомец "${petName}" успешно удален`)
      } else {
        const errorData = await response.json()
        console.error('Ошибка удаления питомца:', errorData)
        alert(`Ошибка удаления питомца: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Ошибка удаления питомца:', error)
      alert('Ошибка сети при удалении питомца')
    }
  }

  const filteredPets = (Array.isArray(pets) ? pets : []).filter(pet => {
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

  const getSpeciesName = (species: string | null) => {
    if (!species) return 'Не указан'
    
    switch (species.toLowerCase()) {
      case 'dog':
        return 'Собака'
      case 'cat':
        return 'Кошка'
      case 'bird':
        return 'Птица'
      case 'fish':
        return 'Рыба'
      case 'rabbit':
        return 'Кролик'
      case 'hamster':
        return 'Хомяк'
      case 'guinea_pig':
        return 'Морская свинка'
      case 'turtle':
        return 'Черепаха'
      case 'snake':
        return 'Змея'
      case 'lizard':
        return 'Ящерица'
      case 'horse':
        return 'Лошадь'
      case 'cow':
        return 'Корова'
      case 'pig':
        return 'Свинья'
      case 'goat':
        return 'Коза'
      case 'sheep':
        return 'Овца'
      case 'chicken':
        return 'Курица'
      case 'duck':
        return 'Утка'
      case 'goose':
        return 'Гусь'
      case 'turkey':
        return 'Индейка'
      case 'parrot':
        return 'Попугай'
      case 'canary':
        return 'Канарейка'
      case 'finch':
        return 'Зяблик'
      case 'budgie':
        return 'Волнистый попугай'
      case 'cockatiel':
        return 'Корелла'
      case 'macaw':
        return 'Ара'
      case 'cockatoo':
        return 'Какаду'
      case 'lovebird':
        return 'Неразлучник'
      case 'goldfish':
        return 'Золотая рыбка'
      case 'betta':
        return 'Петушок'
      case 'tetra':
        return 'Тетра'
      case 'guppy':
        return 'Гуппи'
      case 'molly':
        return 'Молли'
      case 'platy':
        return 'Пецилия'
      case 'swordtail':
        return 'Меченосец'
      case 'angelfish':
        return 'Скалярия'
      case 'discus':
        return 'Дискус'
      case 'cichlid':
        return 'Цихлида'
      case 'catfish':
        return 'Сом'
      case 'shark':
        return 'Акула'
      case 'ray':
        return 'Скат'
      case 'eel':
        return 'Угорь'
      case 'crab':
        return 'Краб'
      case 'lobster':
        return 'Омар'
      case 'shrimp':
        return 'Креветка'
      case 'snail':
        return 'Улитка'
      case 'clam':
        return 'Моллюск'
      case 'mussel':
        return 'Мидия'
      case 'oyster':
        return 'Устрица'
      case 'scallop':
        return 'Гребешок'
      case 'abalone':
        return 'Морское ушко'
      case 'conch':
        return 'Ракушка'
      case 'whelk':
        return 'Бухин'
      case 'periwinkle':
        return 'Береговик'
      case 'limpet':
        return 'Морское блюдце'
      case 'barnacle':
        return 'Морская уточка'
      case 'sea_urchin':
        return 'Морской ёж'
      case 'starfish':
        return 'Морская звезда'
      case 'sea_cucumber':
        return 'Морской огурец'
      case 'jellyfish':
        return 'Медуза'
      case 'coral':
        return 'Коралл'
      case 'anemone':
        return 'Актиния'
      case 'sponge':
        return 'Губка'
      case 'worm':
        return 'Червь'
      case 'leech':
        return 'Пиявка'
      case 'slug':
        return 'Слизень'
      case 'centipede':
        return 'Сороконожка'
      case 'millipede':
        return 'Многоножка'
      case 'spider':
        return 'Паук'
      case 'scorpion':
        return 'Скорпион'
      case 'tarantula':
        return 'Тарантул'
      case 'tick':
        return 'Клещ'
      case 'mite':
        return 'Клещ'
      case 'flea':
        return 'Блоха'
      case 'louse':
        return 'Вошь'
      case 'bedbug':
        return 'Клоп'
      case 'ant':
        return 'Муравей'
      case 'bee':
        return 'Пчела'
      case 'wasp':
        return 'Оса'
      case 'hornet':
        return 'Шершень'
      case 'yellow_jacket':
        return 'Оса'
      case 'bumblebee':
        return 'Шмель'
      case 'butterfly':
        return 'Бабочка'
      case 'moth':
        return 'Моль'
      case 'dragonfly':
        return 'Стрекоза'
      case 'damselfly':
        return 'Стрекоза'
      case 'grasshopper':
        return 'Кузнечик'
      case 'cricket':
        return 'Сверчок'
      case 'katydid':
        return 'Кузнечик'
      case 'cicada':
        return 'Цикада'
      case 'aphid':
        return 'Тля'
      case 'scale_insect':
        return 'Щитовка'
      case 'mealybug':
        return 'Мучнистый червец'
      case 'whitefly':
        return 'Белокрылка'
      case 'thrips':
        return 'Трипс'
      case 'leafhopper':
        return 'Цикадка'
      case 'planthopper':
        return 'Цикадка'
      case 'treehopper':
        return 'Цикадка'
      case 'spittlebug':
        return 'Пенница'
      case 'lanternfly':
        return 'Фонарница'
      case 'stink_bug':
        return 'Клоп'
      case 'assassin_bug':
        return 'Хищнец'
      case 'bed_bug':
        return 'Постельный клоп'
      case 'kissing_bug':
        return 'Триатомовый клоп'
      case 'water_bug':
        return 'Водяной клоп'
      case 'backswimmer':
        return 'Гладыш'
      case 'water_boatman':
        return 'Гребляк'
      case 'water_scorpion':
        return 'Водяной скорпион'
      case 'giant_water_bug':
        return 'Гигантский водяной клоп'
      case 'toe_biter':
        return 'Водяной клоп'
      case 'electric_light_bug':
        return 'Электрический клоп'
      case 'fish_killer':
        return 'Рыбный клоп'
      case 'alligator_bug':
        return 'Аллигаторовый клоп'
      case 'lethocerus':
        return 'Летоцерус'
      case 'belostoma':
        return 'Белостома'
      case 'abedus':
        return 'Абедус'
      case 'ranatra':
        return 'Ранатра'
      case 'nepa':
        return 'Непа'
      case 'corixa':
        return 'Корикса'
      case 'sigara':
        return 'Сигара'
      case 'cenocorixa':
        return 'Ценокорикса'
      case 'hesperocorixa':
        return 'Гесперокорикса'
      case 'callicorixa':
        return 'Калликорикса'
      case 'micronecta':
        return 'Микронекта'
      case 'plea':
        return 'Плея'
      case 'hebrus':
        return 'Гебрус'
      case 'velia':
        return 'Велиа'
      case 'gerris':
        return 'Геррис'
      case 'aquarius':
        return 'Аквариус'
      case 'limnoporus':
        return 'Лимнопорус'
      case 'metrobates':
        return 'Метробатес'
      case 'rheumatobates':
        return 'Ревматобатес'
      case 'tachygerris':
        return 'Тахигеррис'
      case 'eurygerris':
        return 'Эвригеррис'
      case 'trepobates':
        return 'Трепобатес'
      case 'metrobatoides':
        return 'Метробатоидес'
      case 'rheumatometroides':
        return 'Ревматометроидес'
      case 'tachygerris_adela':
        return 'Тахигеррис Адела'
      case 'eurygerris_flavolineatus':
        return 'Эвригеррис флаволинеатус'
      case 'trepobates_subnitidus':
        return 'Трепобатес субнитидус'
      case 'metrobatoides_heterocephalus':
        return 'Метробатоидес гетероцефалус'
      case 'rheumatometroides_rileyi':
        return 'Ревматометроидес рилеи'
      case 'tachygerris_adela_white':
        return 'Тахигеррис Адела Уайт'
      case 'eurygerris_flavolineatus_white':
        return 'Эвригеррис флаволинеатус Уайт'
      case 'trepobates_subnitidus_white':
        return 'Трепобатес субнитидус Уайт'
      case 'metrobatoides_heterocephalus_white':
        return 'Метробатоидес гетероцефалус Уайт'
      case 'rheumatometroides_rileyi_white':
        return 'Ревматометроидес рилеи Уайт'
      default:
        return species
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationWrapper />
        <div className="max-w-7xl mx-auto p-4 pt-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Требуется авторизация</h1>
            <p className="text-gray-600 mb-6">Для просмотра питомцев необходимо войти в систему</p>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Войти в систему
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <NavigationWrapper>
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
                <option value="rabbit">Кролики</option>
                <option value="hamster">Хомяки</option>
                <option value="guinea_pig">Морские свинки</option>
                <option value="turtle">Черепахи</option>
                <option value="snake">Змеи</option>
                <option value="lizard">Ящерицы</option>
                <option value="horse">Лошади</option>
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
                        onClick={() => handleDeletePet(pet.id, pet.name)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <PawPrint className="h-4 w-4 mr-2" />
                      <span className="capitalize">{getSpeciesName(pet.species)}</span>
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
    </NavigationWrapper>
  )
}
