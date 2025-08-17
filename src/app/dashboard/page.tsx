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
  Activity
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [stats, setStats] = useState({
    pets: 0,
    consultations: 0,
    reminders: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Загрузка статистики пользователя
  useEffect(() => {
    if (user) {
      const loadStats = async () => {
        try {
          // Загружаем количество питомцев
          const petsResponse = await fetch('/api/pets', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
            }
          })
          
          let petsCount = 0
          if (petsResponse.ok) {
            const pets = await petsResponse.json()
            petsCount = pets.length
          }

          setStats({
            pets: petsCount,
            consultations: 5, // Пример данных
            reminders: 3
          })
        } catch (error) {
          console.error('Ошибка загрузки статистики:', error)
        }
      }
      
      loadStats()
    }
  }, [user])

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
    return null // Перенаправление обрабатывается в useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationWrapper />
      
      <div className="max-w-7xl mx-auto p-4 pt-8">
        {/* Приветствие */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Добро пожаловать, {user.full_name || user.email}!
              </h1>
              <p className="text-gray-600">
                Управляйте своими питомцами и получайте персональные рекомендации
              </p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link 
            href="/pets" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Питомцы</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pets}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Консультации</p>
                <p className="text-2xl font-bold text-gray-900">{stats.consultations}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Напоминания</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reminders}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link 
            href="/pet/new" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Добавить питомца</h3>
            <p className="text-gray-600 text-sm">Создайте профиль нового питомца</p>
          </Link>

          <Link 
            href="/ai-consultation" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Консультация</h3>
            <p className="text-gray-600 text-sm">Получите совет от искусственного интеллекта</p>
          </Link>

          <Link 
            href="/qr-scan" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <PawPrint className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Сканер QR</h3>
            <p className="text-gray-600 text-sm">Отсканируйте QR-код питомца</p>
          </Link>

          <Link 
            href="/profile" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Настройки</h3>
            <p className="text-gray-600 text-sm">Управляйте своим профилем</p>
          </Link>
        </div>

        {/* Последние активности */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Последние активности</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Добавлен новый питомец</p>
                <p className="text-xs text-gray-500">2 часа назад</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Получена AI консультация</p>
                <p className="text-xs text-gray-500">Вчера</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Напоминание о вакцинации</p>
                <p className="text-xs text-gray-500">3 дня назад</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
