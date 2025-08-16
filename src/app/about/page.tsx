'use client'

import { PawPrint, Heart, Shield, MessageSquare, Users, Award, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться на главную
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">О проекте</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            PetVizor - это платформа для заботы о домашних животных, 
            использующая искусственный интеллект для предоставления персональных рекомендаций.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-100 rounded-lg mr-4">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Наша миссия</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Мы стремимся сделать заботу о домашних животных более простой, эффективной и научно обоснованной. 
              Наша платформа объединяет передовые технологии искусственного интеллекта с глубокими знаниями 
              в области ветеринарии, чтобы предоставить владельцам питомцев персонализированные рекомендации 
              по уходу, питанию и здоровью.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Ключевые возможности</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ИИ-консультации</h3>
              <p className="text-gray-600">
                Получайте персональные советы от искусственного интеллекта по уходу за питомцем
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <PawPrint className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">QR-коды для питомцев</h3>
              <p className="text-gray-600">
                Создавайте уникальные QR-коды с полной информацией о вашем питомце
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Безопасность данных</h3>
              <p className="text-gray-600">
                Ваша информация защищена современными методами шифрования
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Сообщество</h3>
              <p className="text-gray-600">
                Присоединяйтесь к сообществу заботливых владельцев домашних животных
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Экспертность</h3>
              <p className="text-gray-600">
                Рекомендации основаны на научных исследованиях и опыте ветеринаров
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Забота о здоровье</h3>
              <p className="text-gray-600">
                Проактивный подход к здоровью и профилактике заболеваний
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Технологии</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Искусственный интеллект</h3>
                <p className="text-gray-600 mb-4">
                  Мы используем передовые модели машинного обучения для анализа данных о питомцах 
                  и предоставления персонализированных рекомендаций.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Анализ поведения и здоровья</li>
                  <li>• Персонализированные рекомендации</li>
                  <li>• Прогнозирование потенциальных проблем</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Безопасность</h3>
                <p className="text-gray-600 mb-4">
                  Ваши данные защищены современными методами шифрования и соответствуют 
                  международным стандартам безопасности.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Шифрование данных в покое и при передаче</li>
                  <li>• Соответствие GDPR</li>
                  <li>• Регулярные аудиты безопасности</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Наша команда</h2>
            <p className="text-gray-600 mb-6">
              PetVizor создается командой профессионалов, включающей ветеринаров, 
              специалистов по машинному обучению и разработчиков программного обеспечения.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ветеринары</h3>
                <p className="text-sm text-gray-600">
                  Эксперты с многолетним опытом работы с домашними животными
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-специалисты</h3>
                <p className="text-sm text-gray-600">
                  Разработчики алгоритмов машинного обучения
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Разработчики</h3>
                <p className="text-sm text-gray-600">
                  Создатели удобного и безопасного интерфейса
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Свяжитесь с нами</h2>
            <p className="text-gray-600 mb-6">
              У вас есть вопросы или предложения? Мы будем рады услышать от вас!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@petvizor.com"
                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Написать нам
              </a>
              <Link
                href="/"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Вернуться на главную
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
