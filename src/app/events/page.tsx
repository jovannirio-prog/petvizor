'use client'

import { useState, useEffect } from 'react'
import NavigationWrapper from '@/components/NavigationWrapper'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  X,
  Save,
  Bell,
  PawPrint
} from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  pet_id: string
  user_id: string
  event_type: string
  event_name: string
  event_description: string | null
  event_date: string
  notification_days_before: number
  event_status: boolean
  notification_active: boolean
  created_at: string
  updated_at: string
  pets: {
    id: string
    name: string
    species: string | null
  }
}

interface Pet {
  id: string
  name: string
  species: string | null
  breed: string | null
}

type TabType = 'future' | 'past'

export default function EventsPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingPets, setLoadingPets] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('future')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    pet_id: '',
    event_type: 'вакцинация',
    event_name: '',
    event_description: '',
    event_date: '',
    notification_days_before: 7,
    notification_active: true
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadEvents()
      loadPets()
    }
  }, [user])

  const loadEvents = async () => {
    try {
      setLoadingEvents(true)
      setError('')

      const token = localStorage.getItem('supabase_access_token')
      if (!token) {
        setError('Токен не найден')
        return
      }

      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.sort((a: Event, b: Event) => 
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        ))
      } else {
        const errorData = await response.json()
        setError(`Ошибка загрузки событий: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Ошибка загрузки событий:', error)
      setError('Ошибка сети')
    } finally {
      setLoadingEvents(false)
    }
  }

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
        setPets(petsData)
        // Устанавливаем первого питомца по умолчанию
        if (petsData.length > 0 && !formData.pet_id) {
          setFormData(prev => ({ ...prev, pet_id: petsData[0].id }))
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки питомцев:', error)
    } finally {
      setLoadingPets(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError('')

      const token = localStorage.getItem('supabase_access_token')
      if (!token) {
        setError('Токен не найден')
        return
      }

      const url = editingEvent
        ? `/api/events/${editingEvent.id}`
        : '/api/events'

      const method = editingEvent ? 'PUT' : 'POST'
      const body = editingEvent
        ? { ...formData }
        : { ...formData }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const newEvent = await response.json()

        if (editingEvent) {
          setEvents(prev => prev.map(event =>
            event.id === editingEvent.id ? newEvent : event
          ))
        } else {
          setEvents(prev => [...prev, newEvent])
        }

        resetForm()
        setShowCreateForm(false)
        setEditingEvent(null)
      } else {
        const errorData = await response.json()
        setError(`Ошибка ${editingEvent ? 'обновления' : 'создания'} события: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Ошибка сохранения события:', error)
      setError('Ошибка сети')
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это событие?')) {
      return
    }

    try {
      setError('')

      const token = localStorage.getItem('supabase_access_token')
      if (!token) {
        setError('Токен не найден')
        return
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== eventId))
      } else {
        const errorData = await response.json()
        setError(`Ошибка удаления события: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Ошибка удаления события:', error)
      setError('Ошибка сети')
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      pet_id: event.pet_id,
      event_type: event.event_type,
      event_name: event.event_name,
      event_description: event.event_description || '',
      event_date: event.event_date,
      notification_days_before: event.notification_days_before,
      notification_active: event.notification_active
    })
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setFormData({
      pet_id: pets.length > 0 ? pets[0].id : '',
      event_type: 'вакцинация',
      event_name: '',
      event_description: '',
      event_date: '',
      notification_days_before: 7,
      notification_active: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU')
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

  const getFilteredEvents = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (activeTab === 'future') {
      return events.filter(event => new Date(event.event_date) >= today)
    } else {
      return events.filter(event => new Date(event.event_date) < today)
    }
  }

  if (loading || loadingPets) {
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
        <div className="max-w-6xl mx-auto p-4 pt-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Требуется авторизация</h1>
            <p className="text-gray-600 mb-6">Для просмотра событий необходимо войти в систему</p>
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

  const filteredEvents = getFilteredEvents()

  return (
    <NavigationWrapper>
      <div className="max-w-6xl mx-auto p-4 pt-24">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад к дашборду
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Все события
              </h1>
              <p className="text-gray-600">Управление событиями и напоминаниями</p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm()
              setEditingEvent(null)
              setShowCreateForm(true)
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить событие
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Форма создания/редактирования */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingEvent ? 'Редактировать событие' : 'Новое событие'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingEvent(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Питомец
                  </label>
                  <select
                    value={formData.pet_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, pet_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите питомца</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species || 'Не указан'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип события
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="вакцинация">Вакцинация</option>
                    <option value="день рождения">День рождения</option>
                    <option value="визит к ветеринару">Визит к ветеринару</option>
                    <option value="стрижка">Стрижка</option>
                    <option value="купание">Купание</option>
                    <option value="другое">Другое</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата события
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Напомнить за (дней)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.notification_days_before}
                    onChange={(e) => setFormData(prev => ({ ...prev, notification_days_before: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название события
                </label>
                <input
                  type="text"
                  value={formData.event_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Ежегодная вакцинация"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание (необязательно)
                </label>
                <textarea
                  value={formData.event_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Дополнительная информация о событии"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notification_active"
                  checked={formData.notification_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, notification_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="notification_active" className="ml-2 text-sm text-gray-700">
                  Включить уведомления
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingEvent(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingEvent ? 'Обновить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Вкладки */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('future')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'future'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Будущие события
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Прошедшие события
            </button>
          </div>

          {loadingEvents ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка событий...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {activeTab === 'future' ? 'Нет будущих событий' : 'Нет прошедших событий'}
              </p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'future' 
                  ? 'Создайте новое событие, чтобы начать отслеживать важные даты'
                  : 'Прошедшие события появятся здесь автоматически'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <span className="text-3xl mr-4">{getEventTypeIcon(event.event_type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold mr-3">{event.event_name}</h3>
                          <span className={`px-2 py-1 rounded text-sm ${
                            event.event_status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.event_status ? 'Завершено' : 'Активно'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{getDaysUntilEvent(event.event_date)}</span>
                          </div>
                        </div>

                                                 <div className="text-sm text-gray-600 mb-2">
                           <strong>Питомец:</strong> {event.pets?.name || 'Не указан'} • <strong>Тип:</strong> {event.event_type}
                         </div>

                        {event.event_description && (
                          <p className="text-sm text-gray-600 mb-2">{event.event_description}</p>
                        )}

                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Уведомление за {event.notification_days_before} дней
                            {!event.notification_active && ' (отключено)'}
                          </div>
                          <div>Создано: {formatDateTime(event.created_at)}</div>
                          {event.updated_at !== event.created_at && (
                            <div>Обновлено: {formatDateTime(event.updated_at)}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NavigationWrapper>
  )
}
