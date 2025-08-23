'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  event_type: string
  event_name: string
  event_date: string
  event_status: boolean
  notification_active: boolean
}

interface PetEventsProps {
  petId: string
  petName: string
}

export default function PetEvents({ petId, petName }: PetEventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEvents()
  }, [petId])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('supabase_access_token')
      if (!token) {
        setError('Токен не найден')
        return
      }

      const response = await fetch(`/api/events?pet_id=${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Показываем только активные события (не завершенные) и сортируем по дате
        const activeEvents = data
          .filter((event: Event) => !event.event_status)
          .sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 3) // Показываем только 3 ближайших события
        setEvents(activeEvents)
      } else {
        const errorData = await response.json()
        setError(`Ошибка загрузки событий: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Ошибка загрузки событий:', error)
      setError('Ошибка сети')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">События</h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600">Загрузка событий...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">События</h2>
        <Link
          href={`/pet/${petId}/events`}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          Управление событиями
        </Link>
      </div>

      {error ? (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">У {petName} пока нет запланированных событий</p>
          <Link
            href={`/pet/${petId}/events`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить событие
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getEventTypeIcon(event.event_type)}</span>
                <div>
                  <p className="font-medium text-gray-900">{event.event_name}</p>
                  <p className="text-sm text-gray-600">{formatDate(event.event_date)}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {getDaysUntilEvent(event.event_date)}
              </div>
            </div>
          ))}
          
          <div className="text-center pt-2">
            <Link
              href={`/pet/${petId}/events`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Посмотреть все события →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
