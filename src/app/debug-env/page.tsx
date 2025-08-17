'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'

export default function DebugEnvPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkEnvironment = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔍 Debug ENV: Отправляем запрос на /api/debug-env')
      const response = await fetch('/api/debug-env')
      
      console.log('🔍 Debug ENV: Статус ответа:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Debug ENV: HTTP ошибка:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('🔍 Debug ENV: Результат:', data)
      setResult(data)
      
    } catch (err: any) {
      console.error('❌ Debug ENV: Ошибка:', err)
      setError(err.message || 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Диагностика переменных окружения</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={checkEnvironment}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Проверка...
              </>
            ) : (
              'Проверить переменные окружения'
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
          <div className="space-y-6">
            {/* Статус валидации */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                {result.validation?.allValid ? (
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                )}
                <h3 className="text-lg font-medium">
                  {result.validation?.allValid ? 'Все переменные настроены корректно' : 'Обнаружены проблемы с настройкой'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-3 rounded ${result.validation?.hasValidUrl ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center">
                    {result.validation?.hasValidUrl ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">SUPABASE_URL</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded ${result.validation?.hasValidAnonKey ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center">
                    {result.validation?.hasValidAnonKey ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">SUPABASE_ANON_KEY</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded ${result.validation?.hasServiceKey ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center">
                    {result.validation?.hasServiceKey ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    <span className="font-medium">SERVICE_ROLE_KEY</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Переменные окружения */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Переменные окружения</h3>
              <div className="bg-gray-50 rounded p-4 space-y-2">
                {Object.entries(result.environment).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="font-mono text-sm font-medium">{key}:</span>
                    <span className="font-mono text-sm text-gray-600">
                      {value === null ? '❌ Отсутствует' : value === '***HIDDEN***' ? '✅ Настроен' : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Рекомендации */}
            {Object.values(result.recommendations).some((rec: any) => rec !== null) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Рекомендации</h3>
                <div className="space-y-3">
                  {Object.entries(result.recommendations).map(([key, recommendation]: [string, any]) => (
                    recommendation && (
                      <div key={key} className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-yellow-800">{recommendation}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Инструкции по настройке */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Как настроить переменные окружения на Vercel</h3>
              <div className="space-y-3 text-blue-800">
                <p>1. Перейдите в панель управления Vercel</p>
                <p>2. Выберите ваш проект</p>
                <p>3. Перейдите в раздел "Settings" → "Environment Variables"</p>
                <p>4. Добавьте следующие переменные:</p>
                <div className="bg-white rounded p-3 font-mono text-sm">
                  <p>NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co</p>
                  <p>NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key</p>
                  <p>SUPABASE_SERVICE_ROLE_KEY = your-service-role-key</p>
                </div>
                <p>5. Перезапустите деплой</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
