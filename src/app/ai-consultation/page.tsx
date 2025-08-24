'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, PawPrint, Settings, MessageCircle, Clock, AlertCircle } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { usePets } from '@/hooks/usePets'
import NavigationWrapper from '@/components/NavigationWrapper'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
  context?: any
  sources?: {
    count: number
    codes: string
  }
}

// Используем тип Pet из хука usePets

export default function AIConsultationPage() {
  const { user, loading } = useUser()
  const { pets, loading: petsLoading } = usePets()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPet, setSelectedPet] = useState<any>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showPetSelector, setShowPetSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Добавляем отладку для проверки загрузки питомцев
  useEffect(() => {
    console.log('🔍 AI Consultation: Питомцы загружены:', pets?.length || 0, pets)
    console.log('🔍 AI Consultation: Загрузка питомцев:', petsLoading)
  }, [pets, petsLoading])

  const handleAIResponse = (data: any) => {
    // Сохраняем sessionId для продолжения диалога
    if (data.sessionId && !sessionId) {
      setSessionId(data.sessionId)
    }
    
    // Очищаем ответ от дублированной информации об источниках
    let responseText = data.response
    
    // Удаляем строки с информацией об источниках, которые OpenAI мог добавить
    responseText = responseText.replace(/📚\s*\*\*Источник.*?LeoVet.*?\*\*.*?(\n|$)/gi, '')
    responseText = responseText.replace(/Найдено \d+ источник.*?(\n|$)/gi, '')
    
    // Подготавливаем информацию об источниках отдельно
    let sources = undefined
    if (data.sources) {
      // Используем новое поле sources из API
      const sourceLines = data.sources.split('\n').filter((line: string) => line.trim())
      sources = {
        count: sourceLines.length,
        codes: data.sources
      }
    } else if (data.context && data.context.relevantKnowledgeFound > 0) {
      // Fallback на старый формат
      sources = {
        count: data.context.relevantKnowledgeFound,
        codes: data.context.usedRecordCodes || 'Коды не найдены'
      }
    }
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      isUser: false,
      timestamp: data.timestamp || new Date().toISOString(),
      context: data.context,
      sources: sources
    }

    setMessages(prev => [...prev, aiMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Получаем актуальный токен и обновляем его при необходимости
      let accessToken = localStorage.getItem('supabase_access_token')
      const refreshToken = localStorage.getItem('supabase_refresh_token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
      
      if (refreshToken) {
        headers['x-refresh-token'] = refreshToken
      }

      // Подготавливаем историю диалога для передачи на сервер
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }))

      const response = await fetch('/api/ai/consultation', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: inputMessage,
          petInfo: selectedPet,
          sessionId: sessionId,
          conversationHistory: conversationHistory
        }),
      })

      if (response.status === 401) {
        // Токен истек, пытаемся обновить
        console.log('🔍 AI Consultation: Токен истек, пытаемся обновить')
        const refreshResponse = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-refresh-token': refreshToken || ''
          }
        })
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          if (refreshData.newTokens) {
            localStorage.setItem('supabase_access_token', refreshData.newTokens.access_token)
            if (refreshData.newTokens.refresh_token) {
              localStorage.setItem('supabase_refresh_token', refreshData.newTokens.refresh_token)
            }
            accessToken = refreshData.newTokens.access_token
            
            // Повторяем запрос с новым токеном
            headers['Authorization'] = `Bearer ${accessToken}`
            const retryResponse = await fetch('/api/ai/consultation', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                message: inputMessage,
                petInfo: selectedPet,
                sessionId: sessionId,
                conversationHistory: conversationHistory
              }),
            })
            
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}))
              throw new Error(errorData.error || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`)
            }
            
            const data = await retryResponse.json()
            handleAIResponse(data)
            return
          }
        }
        
        // Если не удалось обновить токен, перенаправляем на логин
        throw new Error('Сессия истекла. Пожалуйста, войдите заново.')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      handleAIResponse(data)
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error)
      
      // Если сессия истекла, перенаправляем на логин
      if (error instanceof Error && error.message.includes('Сессия истекла')) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Сессия истекла. Перенаправляем на страницу входа...',
          isUser: false,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
        
        // Очищаем токены и перенаправляем
        setTimeout(() => {
          localStorage.removeItem('supabase_access_token')
          localStorage.removeItem('supabase_refresh_token')
          window.location.href = '/login'
        }, 2000)
        return
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Извините, произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}. Попробуйте еще раз или обновите страницу.`,
        isUser: false,
        timestamp: new Date().toISOString()
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

  const startNewSession = () => {
    setMessages([])
    setSessionId(null)
  }

  const getRoleDisplayName = () => {
    if (!user?.role) return 'Пользователь'
    return user.role.display_name || user.role.name || 'Пользователь'
  }

  const getRoleDescription = () => {
    if (!user?.role) return 'Задайте мне любой вопрос о вашем питомце!'
    
    const role = user.role.name
    switch (role) {
      case 'admin':
        return 'Администратор системы - полный доступ ко всем данным и функциям'
      case 'clinic_admin':
        return 'Администратор ветклиники - профессиональные протоколы и процедуры'
      case 'clinic_vet':
        return 'Ветеринарный врач - медицинская терминология и диагностика'
      case 'knowledge':
        return 'Редактор базы знаний - точность и источники информации'
      case 'breeder':
        return 'Заводчик - специфика разведения и генетики'
      case 'shelter':
        return 'Приют/Волонтер - доступность и практичность'
      case 'partner':
        return 'Коммерческий партнер - бизнес-аспекты и сотрудничество'
      default:
        return 'Задайте мне любой вопрос о вашем питомце!'
    }
  }

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

  if (!user) {
    return (
      <NavigationWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ИИ-консультация</h1>
            <p className="text-gray-600 mb-6">Для доступа к ИИ-консультации необходимо войти в систему</p>
            <div className="space-x-4">
              <a href="/login" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Войти
              </a>
              <a href="/register" className="inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                Регистрация
              </a>
            </div>
          </div>
        </div>
      </NavigationWrapper>
    )
  }

  return (
    <NavigationWrapper>
      <div className="flex flex-col h-screen">
        {/* Header - синий на всю ширину */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-4 sm:py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="h-6 w-6 sm:h-8 sm:w-8" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">ИИ-консультация</h1>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Привет, {user?.full_name || user?.email}! Я Petvizor AI - ваш умный помощник.
                  </p>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">
                    Роль: {getRoleDisplayName()} • {getRoleDescription()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Session Button - под шапкой */}
        <div className="bg-white border-b px-4 py-2">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={startNewSession}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Новый диалог
            </button>
          </div>
        </div>

        {/* Pet Selector */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Питомец (опционально):</span>
                {selectedPet ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-900">
                      {selectedPet.name}
                      {selectedPet.breed && ` • ${selectedPet.breed}`}
                    </span>
                    <button
                      onClick={() => setShowPetSelector(!showPetSelector)}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                    >
                      Изменить
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPetSelector(!showPetSelector)}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                  >
                    Выбрать питомца (необязательно)
                  </button>
                )}
              </div>
              {sessionId && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span className="hidden sm:inline">Сессия активна</span>
                </div>
              )}
            </div>

            {/* Pet Selector Dropdown */}
            {showPetSelector && (
              <div className="mt-3 p-3 bg-white rounded-lg border shadow-sm">
                {petsLoading ? (
                  <div className="text-center py-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : pets && pets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pets.map((pet) => (
                      <button
                        key={pet.id}
                        onClick={() => {
                          setSelectedPet(pet)
                          setShowPetSelector(false)
                        }}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          selectedPet?.id === pet.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{pet.name}</div>
                        <div className="text-xs text-gray-600">
                          {pet.breed && `${pet.breed}`}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-500">
                    <PawPrint className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Нет питомцев</p>
                    <a href="/pet/new" className="text-blue-600 hover:text-blue-800 text-sm">
                      Добавить питомца
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages - занимает оставшееся пространство */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          <div className="max-w-6xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-2 text-sm sm:text-base">Начните разговор, задав вопрос о вашем питомце</p>
                {selectedPet && (
                  <p className="text-xs sm:text-sm text-gray-400">
                    Консультация для: {selectedPet.name}
                  </p>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[85%] sm:max-w-xs lg:max-w-md ${
                    message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    message.isUser 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {message.isUser ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </div>
                  <div
                    className={`px-3 py-2 sm:px-4 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.text}</p>
                    <div className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                      {message.sources && !message.isUser && (
                        <div className="mt-2">
                          <div className="flex items-center mb-1">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span>Найдено {message.sources.count} источников из базы знаний LeoVet:</span>
                          </div>
                          <div className="text-xs text-gray-400 whitespace-pre-line">
                            {message.sources.codes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="px-3 py-2 sm:px-4 rounded-lg bg-gray-100">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input - на всю ширину экрана */}
        <div className="border-t bg-white p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col space-y-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedPet 
                  ? `Задайте вопрос о ${selectedPet.name}...`
                  : "Задайте вопрос о ваших питомцах..."
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Отправить</span>
              </button>
            </div>
            
            {!selectedPet && pets && pets.length > 0 && (
              <div className="mt-2 flex items-center text-xs sm:text-sm text-blue-600">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Для более точной консультации выберите питомца (опционально)
              </div>
            )}
          </div>
        </div>
      </div>
    </NavigationWrapper>
  )
}


