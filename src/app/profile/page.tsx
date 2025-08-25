'use client'

import { useState, useEffect } from 'react'
import NavigationWrapper from '@/components/NavigationWrapper'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Save, ArrowLeft, PawPrint } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      
      // Загружаем существующий профиль
      const loadProfile = async () => {
        try {
          const response = await fetch('/api/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
            }
          })
          
          if (response.ok) {
            const profile = await response.json()
            console.log('🔧 Profile: Загружен профиль:', profile)
            if (profile) {
              setFullName(profile.full_name || '')
              setPhone(profile.phone || '')
            }
          }
        } catch (error) {
          console.error('🔧 Profile: Ошибка загрузки профиля:', error)
        }
      }
      
      loadProfile()
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      const requestBody = {
        full_name: fullName,
        phone: phone
      }
      
      console.log('🔧 Profile: Отправляем данные:', requestBody)
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🔧 Profile: Статус ответа:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('🔧 Profile: Успешный ответ:', result)
        
        // Проверяем новый формат ответа
        if (result.success) {
          setMessage('Профиль успешно обновлен!')
          // Перезагружаем профиль, чтобы показать обновленные данные
          const reloadResponse = await fetch('/api/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
            }
          })
          if (reloadResponse.ok) {
            const updatedProfile = await reloadResponse.json()
            if (updatedProfile) {
              setFullName(updatedProfile.full_name || '')
              setPhone(updatedProfile.phone || '')
            }
          }
        } else {
          setMessage('Профиль успешно обновлен!')
        }
      } else {
        const errorData = await response.json()
        console.error('🔧 Profile: Ошибка ответа:', errorData)
        setMessage(`Ошибка при обновлении профиля: ${errorData.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('🔧 Profile: Ошибка запроса:', error)
      setMessage('Ошибка при обновлении профиля')
    } finally {
      setSaving(false)
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
        <div className="max-w-2xl mx-auto p-4 pt-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Требуется авторизация</h1>
            <p className="text-gray-600 mb-6">Для просмотра профиля необходимо войти в систему</p>
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
      <div className="max-w-4xl mx-auto p-4 pt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link 
              href="/dashboard" 
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Link>
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Профиль</h1>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{user.email}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Email нельзя изменить</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Полное имя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ваше полное имя"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Номер телефона
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('успешно') 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Сохранить изменения</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  )
}
