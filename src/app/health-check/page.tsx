'use client'

import { useState } from 'react'

export default function HealthCheckPage() {
  const [status, setStatus] = useState<string>('Проверка...')

  const checkHealth = async () => {
    try {
      setStatus('Проверяем подключение...')
      const response = await fetch('/api/debug-env')
      
      if (response.ok) {
        const data = await response.json()
        setStatus(`✅ Работает! Переменные окружения: ${data.validation?.allValid ? 'OK' : 'Проблемы'}`)
      } else {
        setStatus(`❌ Ошибка: ${response.status} ${response.statusText}`)
      }
    } catch (error: any) {
      setStatus(`❌ Ошибка сети: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Проверка работоспособности</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={checkHealth}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Проверить API
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4">Статус:</h2>
          <p className="text-gray-700">{status}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Информация о деплое:</h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>Время:</strong> {new Date().toLocaleString()}</p>
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
