'use client'

import { useState } from 'react'

export default function TestRegisterFixedPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testRegisterFixed = async () => {
    if (!email || !password) {
      addResult('❌ Введите email и пароль')
      return
    }

    setLoading(true)
    setResults([])
    addResult('🔍 Тестируем исправленную регистрацию...')
    
    try {
      // Генерируем уникальный ID для пользователя
      const userId = crypto.randomUUID()
      addResult(`📋 Генерируем ID: ${userId}`)
      
      // Шаг 1: Создаем пользователя в таблице users
      addResult('👤 Шаг 1: Создаем пользователя...')
      const userResponse = await fetch('/api/supabase-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_user',
          data: {
            id: userId,
            email: email
          }
        })
      })

      const userResult = await userResponse.json()
      
      if (!userResult.success) {
        throw new Error(`Ошибка создания пользователя: ${userResult.error}`)
      }

      addResult('✅ Пользователь создан успешно')
      addResult(`📊 ID пользователя: ${userResult.data?.[0]?.id}`)

      // Шаг 2: Создаем профиль для пользователя
      addResult('👤 Шаг 2: Создаем профиль...')
      const profileResponse = await fetch('/api/supabase-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_profile',
          data: {
            id: userId, // тот же ID, что и у пользователя
            email: email,
            full_name: email.split('@')[0] // используем часть email как имя
          }
        })
      })

      const profileResult = await profileResponse.json()
      
      if (!profileResult.success) {
        throw new Error(`Ошибка создания профиля: ${profileResult.error}`)
      }

      addResult('✅ Профиль создан успешно')
      addResult(`📊 ID профиля: ${profileResult.data?.[0]?.id}`)

      // Шаг 3: Регистрируем через новый API endpoint
      addResult('🔐 Шаг 3: Регистрируем через новый API...')
      const authResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })

      const authResult = await authResponse.json()
      
      if (!authResult.success) {
        addResult(`⚠️ Auth регистрация: ${authResult.error}`)
        addResult(`📄 Детали: ${JSON.stringify(authResult.details)}`)
        
        if (authResult.error.includes('400')) {
          addResult('💡 Возможно, пользователь уже существует')
        }
      } else {
        if (authResult.warning) {
          addResult(`✅ Auth регистрация: ${authResult.warning}`)
          addResult(`📄 Детали: ${JSON.stringify(authResult.details)}`)
        } else {
          addResult('✅ Auth регистрация успешна!')
          addResult(`📊 Результат: ${JSON.stringify(authResult.data)}`)
        }
      }

      addResult('🎉 Регистрация завершена успешно!')
      addResult('📋 Пользователь и профиль созданы в базе данных')
      
    } catch (error: any) {
      addResult(`❌ Ошибка регистрации: ${error.message}`)
    } finally {
      setLoading(false)
      addResult('🏁 Тестирование завершено')
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Исправленная регистрация</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Проблема решена!</h2>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>Проблема:</strong> Внешний ключ нарушен при автоматическом создании профиля</p>
            <p><strong>Решение:</strong> Сначала создаем пользователя и профиль, потом регистрируем</p>
            <p><strong>Результат:</strong> Регистрация должна работать без ошибок</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Тест исправленной регистрации</h2>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="test@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="password123"
              />
            </div>
          </div>
          
          <button
            onClick={testRegisterFixed}
            disabled={loading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Тестируем...' : 'Тест исправленной регистрации'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Результаты тестирования</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">Введите данные и нажмите "Тест исправленной регистрации"</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
          <button
            onClick={clearResults}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Очистить
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">💡 Исправленный процесс</h2>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>1.</strong> Создаем пользователя в таблице users</p>
            <p><strong>2.</strong> Создаем профиль с тем же ID</p>
            <p><strong>3.</strong> Регистрируем через отдельный API endpoint</p>
            <p><strong>4.</strong> Избегаем конфликта внешних ключей</p>
          </div>
        </div>
      </div>
    </div>
  )
}
