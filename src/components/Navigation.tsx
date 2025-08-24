'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { User, LogOut, Settings, ChevronDown, Calendar, Shield, Menu, X } from 'lucide-react'
import Logo from './Logo'

export default function Navigation() {
  const { user, loading, logout } = useUser()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log('🧭 Navigation: Состояние изменилось', { user, loading })
  }, [user, loading])

  // Закрываем мобильное меню при изменении размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
          </div>

          {/* Навигационные ссылки - только для десктопа */}
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
                {/* Десктопное меню пользователя */}
                <div className="hidden md:block">
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

                {/* Мобильная иконка пользователя */}
                <div className="md:hidden">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            ) : (
              /* Пользователь не авторизован */
              <div className="hidden md:flex items-center space-x-4">
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

            {/* Гамбургер меню - только для мобильных */}
            <div className="md:hidden ml-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Навигационные ссылки */}
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Главная
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              О нас
            </Link>
            <Link 
              href="/ai-consultation" 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              AI Консультация
            </Link>
            <Link 
              href="/qr-scan" 
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Сканер QR
            </Link>

            {/* Пользовательские ссылки для мобильных */}
            {user ? (
              <>
                <hr className="my-2" />
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Личный кабинет
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Профиль
                </Link>
                <Link 
                  href="/events" 
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  События
                </Link>
                {user?.role?.name === 'admin' && (
                  <Link 
                    href="/admin/users" 
                    className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Управление пользователями
                  </Link>
                )}
                <Link 
                  href="/settings" 
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Настройки
                </Link>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    logout()
                    setShowMobileMenu(false)
                  }}
                  className="text-red-600 hover:text-red-800 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <hr className="my-2" />
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Войти
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
