'use client'

import { useState, useEffect } from 'react'
import { Send, PawPrint, Heart, Shield, Utensils, LogOut, User, QrCode, MessageSquare, BookOpen, Stethoscope } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Auth from '@/components/Auth'
import Navigation from '@/components/Navigation'
import ServiceCard from '@/components/ServiceCard'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function Home() {
  const { user, loading, signOut, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated) {
      // Добавляем первое сообщение только после монтирования и аутентификации
      setMessages([
        {
          id: '1',
          text: `Привет, ${user?.email}! Я Petvizor AI - ваш умный помощник для ухода за домашними животными. Задайте мне любой вопрос о вашем питомце!`,
          isUser: false,
          timestamp: new Date()
        }
      ])
    }
  }, [isAuthenticated, user?.email])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          userId: user?.id 
        }),
      })

      const data = await response.json()

      if (data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, произошла ошибка. Попробуйте еще раз.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Показываем загрузку пока проверяем аутентификацию
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Показываем лендинг если пользователь не авторизован
  if (!isAuthenticated) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation isAuthenticated={isAuthenticated} onSignOut={signOut} />
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <Heart className="h-6 w-6 text-red-500" />
              <h3 className="font-semibold text-gray-900">Здоровье</h3>
            </div>
            <p className="text-gray-600">Получите советы по здоровью и профилактике заболеваний вашего питомца</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <Utensils className="h-6 w-6 text-green-500" />
              <h3 className="font-semibold text-gray-900">Питание</h3>
            </div>
            <p className="text-gray-600">Рекомендации по правильному питанию и диете для вашего животного</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Уход</h3>
            </div>
            <p className="text-gray-600">Советы по уходу, гигиене и содержанию вашего питомца</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {mounted ? message.timestamp.toLocaleTimeString() : ''}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте вопрос о вашем питомце..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Компонент лендинга
function LandingPage() {
  const services = [
    {
      title: 'QR-код',
      description: 'Создайте уникальный QR-код для вашего питомца с полной информацией о нем',
      icon: QrCode,
      href: '/qr-code',
      active: true
    },
    {
      title: 'ИИ-консультация',
      description: 'Получите персональные советы от искусственного интеллекта по уходу за питомцем',
      icon: MessageSquare,
      href: '/ai-consultation',
      active: true
    },
    {
      title: 'Подбор корма',
      description: 'Найдите идеальный корм для вашего питомца на основе его породы, возраста и здоровья',
      icon: Utensils,
      href: '/food-selection',
      active: false,
      comingSoon: true
    },
    {
      title: 'ИИ-энциклопедия пород',
      description: 'Узнайте все о различных породах собак и кошек с помощью ИИ',
      icon: BookOpen,
      href: '/breed-encyclopedia',
      active: false,
      comingSoon: true
    },
    {
      title: 'Здоровье питомца',
      description: 'Отслеживайте здоровье вашего питомца и получайте рекомендации по профилактике',
      icon: Stethoscope,
      href: '/pet-health',
      active: false,
      comingSoon: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-500 rounded-full">
              <PawPrint className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            PetVizor
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Умный AI-помощник для заботы о ваших домашних животных. Получите персональные советы, 
            создайте QR-код для питомца и многое другое.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Начать бесплатно
            </a>
            <a
              href="/about"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Узнать больше
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Наши сервисы
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Выберите нужный вам сервис и получите профессиональную помощь в уходе за питомцем
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                description={service.description}
                icon={service.icon}
                href={service.href}
                active={service.active}
                comingSoon={service.comingSoon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Почему выбирают нас
            </h2>
            <p className="text-gray-600">
              Мы используем передовые технологии для помощи владельцам домашних животных
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Забота о здоровье</h3>
              <p className="text-gray-600">Получите профессиональные советы по здоровью вашего питомца</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Безопасность</h3>
              <p className="text-gray-600">Ваши данные защищены и хранятся в безопасности</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ИИ-помощник</h3>
              <p className="text-gray-600">Персональные рекомендации от искусственного интеллекта</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-2 bg-primary-500 rounded-lg">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-4">PetVizor</h3>
          <p className="text-gray-400 mb-6">
            Умный помощник для заботы о домашних животных
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="/about" className="hover:text-white transition-colors">О проекте</a>
            <a href="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="/terms" className="hover:text-white transition-colors">Условия использования</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
