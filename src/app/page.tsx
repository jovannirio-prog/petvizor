'use client'

import NavigationWrapper from '@/components/NavigationWrapper'
import { Brain, Shield, Heart, Zap, MessageCircle, QrCode } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <NavigationWrapper>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-left space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 leading-tight">
                  PetVizor
                </h1>
                <p className="text-2xl sm:text-3xl font-semibold text-blue-600">
                  AI помощник для владельцев домашних животных
                </p>
              </div>
              
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Интеллектуальная система с встроенными сервисами для безопасности, здоровья и содержания питомцев. 
                Получайте персональные рекомендации от AI-консультанта на основе базы знаний ветеринарных специалистов.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/register"
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Начать бесплатно
                </a>
                <a
                  href="/ai-consultation"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Попробовать AI
                </a>
              </div>
            </div>
            
            {/* Screenshot/Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">AI Консультант</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Задайте вопрос о здоровье питомца и получите профессиональный совет
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Встроенные сервисы для ваших питомцев
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Все необходимое для заботы о здоровье и безопасности ваших любимцев в одном месте
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Консультант</h3>
              <p className="text-gray-600 leading-relaxed">
                Получайте персональные рекомендации по уходу, питанию и лечению от интеллектуального помощника
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Безопасность</h3>
              <p className="text-gray-600 leading-relaxed">
                QR-коды для быстрой идентификации питомцев и экстренной связи с владельцами
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Здоровье</h3>
              <p className="text-gray-600 leading-relaxed">
                Отслеживание вакцинаций, прививок и медицинских процедур с напоминаниями
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Рекомендации</h3>
              <p className="text-gray-600 leading-relaxed">
                Персональные советы по содержанию, питанию и активности на основе породы и возраста
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Экстренная помощь</h3>
              <p className="text-gray-600 leading-relaxed">
                Быстрая связь с ветеринарами и инструкции по первой помощи в критических ситуациях
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Управление профилями</h3>
              <p className="text-gray-600 leading-relaxed">
                Создавайте и управляйте профилями всех ваших питомцев с полной историей
              </p>
            </div>
          </div>
        </div>
      </section>
    </NavigationWrapper>
  )
}
