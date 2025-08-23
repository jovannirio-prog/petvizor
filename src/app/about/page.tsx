'use client'

import { PawPrint, Heart, Shield, MessageSquare, QrCode } from 'lucide-react'
import NavigationWrapper from '@/components/NavigationWrapper'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <NavigationWrapper>
      <div className="max-w-6xl mx-auto p-4 pt-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-500 rounded-full">
              <PawPrint className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            О проекте PetVizor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Умный AI-помощник для заботы о ваших домашних животных. Мы используем передовые технологии, 
            чтобы помочь владельцам питомцев обеспечить лучший уход и безопасность.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Наша миссия</h2>
          <p className="text-lg text-gray-600 mb-6">
            Мы верим, что каждый питомец заслуживает самого лучшего ухода. PetVizor объединяет 
            искусственный интеллект и современные технологии, чтобы помочь владельцам домашних животных 
            принимать обоснованные решения о здоровье, питании и безопасности их любимцев.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Забота о здоровье</h3>
              <p className="text-gray-600">Персональные рекомендации по уходу и профилактике заболеваний</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Безопасность питомца</h3>
              <p className="text-gray-600">QR-коды для быстрого поиска потерявшихся животных</p>
            </div>
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">24/7 поддержка</h3>
              <p className="text-gray-600">ИИ-консультант готов ответить на ваши вопросы в любое время</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Наши возможности</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">QR-паспорт питомца</h3>
                <p className="text-gray-600">
                  Создайте уникальный QR-код с контактами владельца. Прикрепите к ошейнику или жетону 
                  для быстрого поиска питомца в случае потери.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">ИИ-консультация</h3>
                <p className="text-gray-600">
                  Получите персональные советы от искусственного интеллекта по уходу, питанию 
                  и здоровью вашего питомца.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Технологии</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Искусственный интеллект</h3>
              <p className="text-gray-600 mb-4">
                Мы используем передовые модели машинного обучения для анализа данных о питомцах 
                и предоставления персонализированных рекомендаций.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Анализ поведения и здоровья</li>
                <li>• Персональные рекомендации по питанию</li>
                <li>• Предупреждение о потенциальных проблемах</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Безопасность данных</h3>
              <p className="text-gray-600 mb-4">
                Ваши данные защищены современными стандартами безопасности и шифрования.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Шифрование данных в покое и при передаче</li>
                <li>• Соответствие GDPR и другим стандартам</li>
                <li>• Регулярные аудиты безопасности</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-blue-100 mb-6">
            Присоединяйтесь к тысячам владельцев домашних животных, которые уже используют PetVizor
          </p>
          <div className="space-x-4">
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Создать аккаунт
            </Link>
            <Link
              href="/"
              className="inline-block border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              Узнать больше
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-600">
          <p>&copy; 2024 PetVizor. Все права защищены.</p>
          <p className="mt-2">
            Создано с ❤️ для владельцев домашних животных
          </p>
        </div>
      </div>
    </NavigationWrapper>
  )
}
