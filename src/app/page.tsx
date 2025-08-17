'use client'

import NavigationWrapper from '@/components/NavigationWrapper'
import ClearAuthButton from '@/components/ClearAuthButton'
import { QrCode, Brain, Search, BookOpen, Package, Heart } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationWrapper />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            PetVizor
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Умный помощник для владельцев домашних животных. Отслеживайте здоровье, 
            получайте персональные рекомендации и находите потерянных питомцев с помощью QR-кодов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Начать бесплатно
            </Link>
            <Link 
              href="/about" 
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Узнать больше
            </Link>
          </div>
          
          {/* Временная кнопка для тестирования - удалить позже */}
          <ClearAuthButton />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Возможности PetVizor
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* QR-коды для питомцев */}
            <Link 
              href="/qr-scan" 
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                QR-коды для питомцев
              </h3>
              <p className="text-gray-600">
                Создавайте уникальные QR-коды для ваших питомцев. Если питомец потеряется, 
                нашедший сможет быстро связаться с вами.
              </p>
            </Link>

            {/* AI-ассистент */}
            <Link 
              href="/ai-consultation" 
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-ассистент
              </h3>
              <p className="text-gray-600">
                Получайте персональные советы по уходу, питанию и здоровью ваших питомцев 
                от нашего искусственного интеллекта.
              </p>
            </Link>

            {/* Подбор корма - неактивный */}
            <div className="group bg-gray-100 rounded-xl p-6 shadow-lg cursor-not-allowed opacity-60">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                Подбор корма
              </h3>
              <p className="text-gray-500">
                Персональные рекомендации по выбору корма для вашего питомца 
                на основе возраста, породы и состояния здоровья.
              </p>
              <div className="mt-4">
                <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                  Скоро
                </span>
              </div>
            </div>

            {/* ИИ-энциклопедия питомцев - неактивный */}
            <div className="group bg-gray-100 rounded-xl p-6 shadow-lg cursor-not-allowed opacity-60">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                ИИ-энциклопедия питомцев
              </h3>
              <p className="text-gray-500">
                Подробная база знаний о различных породах, заболеваниях и методах лечения 
                с использованием искусственного интеллекта.
              </p>
              <div className="mt-4">
                <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                  Скоро
                </span>
              </div>
            </div>

            {/* Поиск ветеринаров - неактивный */}
            <div className="group bg-gray-100 rounded-xl p-6 shadow-lg cursor-not-allowed opacity-60">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                Поиск ветеринаров
              </h3>
              <p className="text-gray-500">
                Найдите ближайших ветеринаров, запишитесь на прием и получите 
                отзывы от других владельцев питомцев.
              </p>
              <div className="mt-4">
                <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                  Скоро
                </span>
              </div>
            </div>

            {/* Сообщество - неактивный */}
            <div className="group bg-gray-100 rounded-xl p-6 shadow-lg cursor-not-allowed opacity-60">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                Сообщество
              </h3>
              <p className="text-gray-500">
                Присоединяйтесь к сообществу владельцев питомцев, делитесь опытом 
                и получайте поддержку от единомышленников.
              </p>
              <div className="mt-4">
                <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                  Скоро
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Готовы начать?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Присоединяйтесь к тысячам владельцев питомцев, которые уже используют PetVizor
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Создать аккаунт
            </Link>
            <Link 
              href="/login" 
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Войти в систему
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
