'use client'

import { useState } from 'react'
import NavigationWrapper from '@/components/NavigationWrapper'

export default function TestRegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTestRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName
        })
      })

      const data = await response.json()
      setResult({
        status: response.status,
        success: response.ok,
        data
      })

      if (response.ok) {
        // Очищаем форму при успехе
        setEmail('')
        setPassword('')
        setFullName('')
      }
    } catch (error) {
      setResult({
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST'
      })
      const data = await response.json()
      setResult({
        status: response.status,
        success: response.ok,
        data
      })
    } catch (error) {
      setResult({
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDebugSMTP = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug-smtp')
      const data = await response.json()
      setResult({
        status: response.status,
        success: response.ok,
        data
      })
    } catch (error) {
      setResult({
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <NavigationWrapper>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Тестирование Email Уведомлений</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Диагностика SMTP */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Диагностика SMTP</h2>
            <p className="text-gray-600 mb-4">
              Проверить настройки SMTP
            </p>
            <button
              onClick={handleDebugSMTP}
              disabled={loading}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-300"
            >
              {loading ? 'Проверка...' : 'Проверить SMTP'}
            </button>
          </div>

          {/* Тест Email */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Тест Email</h2>
            <p className="text-gray-600 mb-4">
              Отправить тестовое уведомление на ivan@leovet24.ru
            </p>
            <button
              onClick={handleTestEmail}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {loading ? 'Отправка...' : 'Отправить тестовый email'}
            </button>
          </div>

          {/* Тест Регистрации */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Тест Регистрации</h2>
            <p className="text-gray-600 mb-4">
              Зарегистрировать тестового пользователя
            </p>
            <form onSubmit={handleTestRegister} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
              >
                {loading ? 'Регистрация...' : 'Зарегистрировать'}
              </button>
            </form>
          </div>
        </div>

        {/* Результат */}
        {result && (
          <div className="mt-8 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Результат:</h3>
            <div className={`p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Инструкции */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Инструкции:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Сначала протестируйте отправку email кнопкой "Отправить тестовый email"</li>
            <li>Если email отправляется успешно, протестируйте регистрацию</li>
            <li>При регистрации автоматически отправится уведомление на ivan@leovet24.ru</li>
            <li>Проверьте почту ivan@leovet24.ru на наличие уведомлений</li>
          </ol>
        </div>
      </div>
    </NavigationWrapper>
  )
}
