'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { User, LogOut, Settings, ChevronDown, Calendar, Shield } from 'lucide-react'
import Logo from './Logo'

export default function Navigation() {
  const { user, loading, logout } = useUser()
  const [showMenu, setShowMenu] = useState(false)

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log('🧭 Navigation: Состояние изменилось', { user, loading })
  }, [user, loading])

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
          </div>

          {/* Навигационные ссылки */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Главная
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                О нас
              </Link>
              <Link href="/ai-consultation" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                AI Консультация
              </Link>
              <Link href="/qr-scan" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Сканер QR
              </Link>
            </div>
          </div>

          {/* Правая часть - пользователь или кнопки входа */}
          <div className="flex items-center">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            ) : user ? (
              /* Пользователь авторизован */
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>{user.full_name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Выпадающее меню */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Личный кабинет
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Профиль
                    </Link>
                    <Link
                      href="/events"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      События
                    </Link>
                    {user?.role?.name === 'admin' && (
                      <Link
                        href="/admin/users"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowMenu(false)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Управление пользователями
                      </Link>
                    )}
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Настройки
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        logout()
                        setShowMenu(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Пользователь не авторизован */
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Главная
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            О нас
          </Link>
          <Link href="/ai-consultation" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            AI Консультация
          </Link>
          <Link href="/qr-scan" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Сканер QR
          </Link>
        </div>
      </div>
    </nav>
  )
}
