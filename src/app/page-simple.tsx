'use client'

import { PawPrint } from 'lucide-react'

export default function SimpleHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500 rounded-full">
              <PawPrint className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            PetVizor
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Умный AI-помощник для заботы о ваших домашних животных
          </p>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Приложение работает! 🎉
            </h2>
            <p className="text-gray-600">
              Это простая версия для тестирования. Основная функциональность будет добавлена позже.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
