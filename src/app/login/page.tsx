'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Login: Начало процесса входа')
    setLoading(true)
    setError(null)

    try {
      console.log('📧 Login: Отправляем запрос на /api/login')
      console.log('🌐 Login: Текущий URL:', window.location.origin)
      
      // Используем новый API endpoint для входа
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      }).catch((fetchError) => {
        console.error('❌ Login: Ошибка fetch:', fetchError)
        console.error('❌ Login: Тип ошибки:', fetchError.name)
        console.error('❌ Login: Сообщение ошибки:', fetchError.message)
        
        // Проверяем тип ошибки
        if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
          throw new Error('Ошибка сети. Проверьте подключение к интернету и настройки Supabase.')
        } else if (fetchError.name === 'AbortError') {
          throw new Error('Запрос был прерван. Попробуйте еще раз.')
        } else {
          throw new Error(`Ошибка сети: ${fetchError.message}`)
        }
      })

      console.log('📡 Login: Получен ответ от сервера, статус:', response.status)
      console.log('📡 Login: Заголовки ответа:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        console.error('❌ Login: HTTP ошибка:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Login: Текст ошибки:', errorText)
        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('📄 Login: Результат:', result)
      console.log('📄 Login: result.data:', result.data)
      console.log('📄 Login: result.data.session:', result.data?.session)
      console.log('📄 Login: result.data.session.access_token:', result.data?.session?.access_token)

      if (!result.success) {
        throw new Error(result.error || 'Ошибка входа в систему')
      }

      console.log('✅ Login: Вход успешен, сохраняем токены')
      // Сохраняем токен в localStorage для последующего использования
      let tokensSaved = false
      
      if (result.data?.session?.access_token) {
        localStorage.setItem('supabase_access_token', result.data.session.access_token)
        console.log('💾 Login: Access token сохранен, длина:', result.data.session.access_token.length)
        tokensSaved = true
      } else {
        console.log('❌ Login: Access token не найден в ответе')
      }
      
      if (result.data?.session?.refresh_token) {
        localStorage.setItem('supabase_refresh_token', result.data.session.refresh_token)
        console.log('💾 Login: Refresh token сохранен, длина:', result.data.session.refresh_token.length)
        tokensSaved = true
      } else {
        console.log('❌ Login: Refresh token не найден в ответе')
      }

      // Проверяем, что токены действительно сохранились
      const savedAccessToken = localStorage.getItem('supabase_access_token')
      const savedRefreshToken = localStorage.getItem('supabase_refresh_token')
      console.log('🔍 Login: Проверка сохранения - Access token:', !!savedAccessToken, 'Refresh token:', !!savedRefreshToken)

      if (tokensSaved) {
        console.log('🔄 Login: Токены сохранены, перенаправляем в личный кабинет')
        // Принудительно обновляем состояние пользователя
        window.location.href = '/dashboard'
      } else {
        console.log('❌ Login: Токены не найдены в ответе')
        setError('Ошибка: токены не получены от сервера')
      }
      
    } catch (error: any) {
      console.error('❌ Login: Ошибка входа:', error)
      console.error('❌ Login: Стек ошибки:', error.stack)
      
      // Более детальная обработка ошибок
      if (error.message.includes('fetch')) {
        setError('Ошибка сети. Проверьте подключение к интернету и настройки Supabase.')
      } else if (error.message.includes('CORS')) {
        setError('Ошибка CORS. Проблема с настройками сервера.')
      } else if (error.message.includes('timeout')) {
        setError('Превышено время ожидания ответа от сервера.')
      } else {
        setError(error.message || 'Произошла неизвестная ошибка при входе')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться на главную
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">Вход в систему</h2>
            <p className="mt-2 text-gray-600">
              Войдите в свой аккаунт PetVizor
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Войти</span>
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Нет аккаунта?{' '}
                <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
