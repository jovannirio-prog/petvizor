'use client'

import { useState, useEffect } from 'react'
import NavigationWrapper from '@/components/NavigationWrapper'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { 
  User, 
  PawPrint, 
  Plus, 
  Settings, 
  Bell, 
  Calendar,
  Heart,
  Activity,
  ChevronDown,
  ChevronRight,
  Dog,
  Cat,
  MessageCircle,
  QrCode,
  FileText,
  Clock,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Pet {
  id: string
  name: string
  species: string | null
  breed: string | null
}

interface Event {
  id: string
  pet_id: string
  event_type: string
  event_name: string
  event_description: string | null
  event_date: string
  pets?: {
    id: string
    name: string
    species: string | null
  }
}

interface FAQItem {
  id: string
  question: string
  answer: string
  icon: React.ReactNode
}

export default function DashboardPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loadingPets, setLoadingPets] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Загрузка питомцев и событий пользователя
  useEffect(() => {
    if (user) {
      loadPets()
      loadEvents()
    }
  }, [user])

  const loadPets = async () => {
    try {
      setLoadingPets(true)
      const token = localStorage.getItem('supabase_access_token')
      if (!token) {
        return
      }

      const response = await fetch('/api/pets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const petsData = await response.json()
        setPets(petsData.pets || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки питомцев:', error)
    } finally {
      setLoadingPets(false)
    }
  }

  const loadEvents = async () => {
    try {
      setLoadingEvents(true)
      const token = localStorage.getItem('supabase_access_token')
      if (!token) {
        return
      }

      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const eventsData = await response.json()
        // Фильтруем только будущие события и сортируем по дате
        const futureEvents = eventsData
          .filter((event: Event) => new Date(event.event_date) > new Date())
          .sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 3) // Берем только 3 ближайших
        setEvents(futureEvents)
      }
    } catch (error) {
      console.error('Ошибка загрузки событий:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const getPetIcon = (species: string | null) => {
    if (!species) return <PawPrint className="w-5 h-5" />
    
    switch (species.toLowerCase()) {
      case 'собака':
      case 'dog':
        return <Dog className="w-5 h-5" />
      case 'кошка':
      case 'cat':
        return <Cat className="w-5 h-5" />
      default:
        return <PawPrint className="w-5 h-5" />
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'вакцинация':
        return '💉'
      case 'день рождения':
        return '🎂'
      case 'визит к ветеринару':
        return '🏥'
      case 'стрижка':
        return '✂️'
      case 'купание':
        return '🛁'
      default:
        return '📅'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const getDaysUntilEvent = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Прошло'
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Завтра'
    if (diffDays < 7) return `Через ${diffDays} дня`
    return `Через ${diffDays} дней`
  }

  const faqItems: FAQItem[] = [
    {
      id: 'pets',
      question: 'Как добавить питомца?',
      answer: 'Нажмите кнопку "Добавить питомца" в блоке "Питомцы" или перейдите в раздел "Все питомцы". Заполните форму с информацией о питомце: имя, вид, порода, дата рождения, вес. Добавьте фотографию питомца для лучшей идентификации.',
      icon: <PawPrint className="w-5 h-5" />
    },
    {
      id: 'qr',
      question: 'Как использовать QR-коды?',
      answer: 'Каждому питомцу автоматически генерируется уникальный QR-код. Распечатайте его и прикрепите к ошейнику питомца. Если питомец потеряется, нашедший сможет отсканировать код и получить ваши контакты для связи.',
      icon: <QrCode className="w-5 h-5" />
    },
    {
      id: 'ai',
      question: 'Как получить AI-консультацию?',
      answer: 'Перейдите в раздел "AI-консультации" и начните чат с искусственным интеллектом. Задавайте вопросы о здоровье, питании, уходе за питомцем. AI даст персональные рекомендации на основе информации о вашем питомце.',
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      id: 'events',
      question: 'Как настроить события и напоминания?',
      answer: 'На странице питомца найдите блок "События" и нажмите "Управление событиями". Создайте события: вакцинация, день рождения, визит к ветеринару. Укажите дату и за сколько дней напомнить. Система автоматически уведомит вас.',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'scan',
      question: 'Как найти потерявшегося питомца?',
      answer: 'Используйте сканер QR-кодов в разделе "Сканер QR". Если кто-то нашел вашего питомца и отсканировал QR-код, вы получите уведомление. Также проверьте публичную страницу питомца по QR-коду.',
      icon: <FileText className="w-5 h-5" />
    }
  ]

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
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
            <p className="text-gray-600 mb-6">Для доступа к панели управления необходимо войти в систему</p>
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
      <div className="max-w-7xl mx-auto p-4 pt-24">
        {/* Приветствие с настройками */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Добро пожаловать, {user.full_name || 'Пользователь'}!
              </h1>
              <p className="text-gray-600">
                Управляйте своими питомцами и получайте персональные рекомендации
              </p>
            </div>
            <Link
              href="/profile"
              className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
              title="Настройки профиля"
            >
              <Settings className="w-6 h-6 text-blue-600" />
            </Link>
          </div>
        </div>

        {/* Основные блоки */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Блок Питомцы */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Питомцы</h2>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            {loadingPets ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !Array.isArray(pets) || pets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-4">У вас пока нет питомцев</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {(Array.isArray(pets) ? pets : []).slice(0, 3).map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/pet/${pet.id}`}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getPetIcon(pet.species)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{pet.name}</span>
                  </Link>
                ))}
                {Array.isArray(pets) && pets.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    И еще {pets.length - 3} питомцев
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Link
                href="/pets"
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Все питомцы
              </Link>
              <Link
                href="/pet/new"
                className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить питомца
              </Link>
            </div>
          </div>

          {/* Блок AI-консультации */}
          <Link 
            href="/ai-consultation"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">AI-консультации</h2>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Получите персональные советы по уходу за питомцем от искусственного интеллекта
            </p>
            <div className="flex items-center text-green-600 text-sm font-medium">
              Начать консультацию
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Блок События */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">События</h2>
              <div className="relative">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
                {/* Здесь будет счетчик уведомлений */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">0</span>
                </div>
              </div>
            </div>
            
            {loadingEvents ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-4">Нет предстоящих событий</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-medium text-gray-700">Будущие события:</h3>
                {events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/pet/${event.pet_id}/events`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{event.event_name}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {getDaysUntilEvent(event.event_date)}
                          </div>
                        </div>
                                                 <p className="text-xs text-gray-600 mb-1">
                           {event.pets?.name || 'Не указан'} • {event.event_type}
                         </p>
                        {event.event_description && (
                          <p className="text-xs text-gray-500 truncate">{event.event_description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(event.event_date)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
                         <div className="space-y-2">
               <Link
                 href="/events"
                 className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
               >
                 Все события
               </Link>
               <Link
                 href="/events"
                 className="w-full flex items-center justify-center px-4 py-2 border border-yellow-600 text-yellow-600 rounded-md hover:bg-yellow-50 transition-colors text-sm font-medium"
               >
                 <Plus className="w-4 h-4 mr-2" />
                 Добавить событие
               </Link>
             </div>
          </div>
        </div>

        {/* Справочник по использованию */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Как использовать PetVizor</h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-medium text-gray-900">{item.question}</span>
                  </div>
                  {expandedFAQ === item.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFAQ === item.id && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </NavigationWrapper>
  )
}
