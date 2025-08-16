'use client'

import { useState } from 'react'
import { PawPrint, Menu, X } from 'lucide-react'
import Link from 'next/link'

interface NavigationProps {
  isAuthenticated?: boolean
  onSignOut?: () => void
}

export default function Navigation({ isAuthenticated = false, onSignOut }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { name: 'QR-код', href: '/qr-code', active: true },
    { name: 'ИИ-консультация', href: '/ai-consultation', active: true },
    { name: 'О проекте', href: '/about', active: true },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              {/* Замените на ваш логотип */}
              <img 
                src="/images/logo.png" 
                alt="PetVizor Logo" 
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  // Fallback на иконку, если изображение не загрузилось
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <PawPrint className="h-6 w-6 text-white hidden" />
            </div>
            <Link href="/" className="text-xl font-bold text-gray-900">
              Ваше Название
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.active
                    ? 'text-gray-900 hover:text-primary-600'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                               >
                 {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={onSignOut}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Выйти
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                                   >
                   <span>{item.name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={onSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Выйти
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
