'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestConnectionPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔧 Test: Отправляем запрос на /api/test-connection')
      const response = await fetch('/api/test-connection')
      
      console.log('🔧 Test: Статус ответа:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Test: HTTP ошибка:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('🔧 Test: Результат:', data)
      setResult(data)
      
    } catch (err: any) {
      console.error('❌ Test: Ошибка:', err)
      setError(err.message || 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Тестирование подключения к Supabase</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Тестирование...
              </>
            ) : (
              'Тестировать подключение'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-red-800 font-medium">Ошибка</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              {result.success ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
              )}
              <h3 className="text-lg font-medium">
                {result.success ? 'Подключение успешно' : 'Ошибка подключения'}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Переменные окружения:</h4>
                <div className="bg-gray-50 rounded p-3">
                  <p><strong>SUPABASE_URL:</strong> {result.env?.hasUrl ? '✅ Настроен' : '❌ Отсутствует'}</p>
                  <p><strong>SUPABASE_ANON_KEY:</strong> {result.env?.hasKey ? '✅ Настроен' : '❌ Отсутствует'}</p>
                  {result.env?.url && (
                    <p><strong>URL:</strong> {result.env.url}</p>
                  )}
                </div>
              </div>

              {result.database && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">База данных:</h4>
                  <div className="bg-gray-50 rounded p-3">
                    <p><strong>Подключение:</strong> {result.database.connected ? '✅ Работает' : '❌ Ошибка'}</p>
                    {result.database.profilesCount !== undefined && (
                      <p><strong>Профилей в базе:</strong> {result.database.profilesCount}</p>
                    )}
                  </div>
                </div>
              )}

              {result.auth && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Аутентификация:</h4>
                  <div className="bg-gray-50 rounded p-3">
                    <p><strong>Настройка:</strong> {result.auth.configured ? '✅ Настроена' : '❌ Ошибка'}</p>
                  </div>
                </div>
              )}

              {result.message && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-green-800">{result.message}</p>
                </div>
              )}

              {result.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800"><strong>Ошибка:</strong> {result.error}</p>
                  {result.details && (
                    <p className="text-red-700 mt-1"><strong>Детали:</strong> {result.details}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
