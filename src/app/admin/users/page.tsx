'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavigationWrapper from '@/components/NavigationWrapper'
import { Search, Users, Shield, Mail, Calendar, Edit, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserRole {
  id: number
  name: string
  display_name: string
  description?: string
}

interface User {
  id: string
  full_name: string | null
  email: string
  role_name: string
  role_display_name: string
  created_at: string
  last_sign_in_at: string | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  useEffect(() => {
    if (searchTerm !== '') {
      loadUsers()
    }
  }, [searchTerm])

  const checkAuthAndLoad = async () => {
    try {
      console.log('🔍 Admin Users: Начинаем проверку аутентификации...')
      
      // Проверяем аутентификацию
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔍 Admin Users: Сессия найдена:', !!session)
      
      if (!session?.access_token) {
        console.log('🔍 Admin Users: Пользователь не аутентифицирован, перенаправляем на вход')
        router.push('/login')
        return
      }

      console.log('🔍 Admin Users: Пользователь аутентифицирован:', session.user.email)

      // Проверяем роль пользователя через API
      console.log('🔍 Admin Users: Проверяем роль через API...')
      const roleResponse = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!roleResponse.ok) {
        console.log('🔍 Admin Users: Ошибка получения профиля через API:', roleResponse.status)
        setError('Ошибка проверки прав доступа')
        setLoading(false)
        return
      }

      const userData = await roleResponse.json()
      console.log('🔍 Admin Users: Данные пользователя:', userData)

      if (!userData.user?.role || userData.user.role.name !== 'admin') {
        console.log('🔍 Admin Users: Пользователь не является администратором')
        setError('Недостаточно прав для доступа к админ-панели')
        setLoading(false)
        return
      }

      console.log('🔍 Admin Users: Администратор подтвержден:', userData.user.role.display_name)

      // Загружаем данные
      await loadUsers()
      await loadRoles()
    } catch (error) {
      console.error('❌ Admin Users: Ошибка проверки аутентификации:', error)
      setError('Ошибка проверки аутентификации')
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      console.log('🔍 Admin Users: Начинаем загрузку пользователей...')
      setLoading(true)
      
      // Получаем токен из сессии Supabase
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔍 Admin Users: Сессия для загрузки:', session ? 'найдена' : 'не найдена')
      
      if (!session?.access_token) {
        console.log('🔍 Admin Users: Токен не найден')
        setError('Не авторизован')
        setLoading(false)
        return
      }

      console.log('🔍 Admin Users: Отправляем запрос с токеном')
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      console.log('🔍 Admin Users: Ответ сервера:', response.status, response.statusText)
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Недостаточно прав для доступа к админ-панели')
          setLoading(false)
          return
        }
        throw new Error('Ошибка загрузки пользователей')
      }

      const data = await response.json()
      console.log('🔍 Admin Users: Получены пользователи:', data.users?.length || 0)
      setUsers(data.users || [])
    } catch (error) {
      console.error('❌ Admin Users: Ошибка загрузки пользователей:', error)
      setError('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      // Получаем токен из сессии Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        return
      }

      const response = await fetch('/api/user/roles', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки ролей:', error)
    }
  }

  const handleEditRole = (userId: string, currentRoleId: number) => {
    setEditingUser(userId)
    setEditingRole(currentRoleId)
  }

  const handleSaveRole = async (userId: string) => {
    if (!editingRole) return

    try {
      setSaving(true)
      
      // Получаем токен из сессии Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Не авторизован')
        return
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ role_id: editingRole }),
      })

      if (!response.ok) {
        throw new Error('Ошибка обновления роли')
      }

      // Обновляем список пользователей
      await loadUsers()
      setEditingUser(null)
      setEditingRole(null)
    } catch (error) {
      console.error('Ошибка сохранения роли:', error)
      setError('Ошибка сохранения роли')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditingRole(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'clinic_admin':
        return 'bg-blue-100 text-blue-800'
      case 'clinic_vet':
        return 'bg-green-100 text-green-800'
      case 'knowledge':
        return 'bg-purple-100 text-purple-800'
      case 'breeder':
        return 'bg-yellow-100 text-yellow-800'
      case 'shelter':
        return 'bg-orange-100 text-orange-800'
      case 'partner':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }



  if (error) {
    return (
      <NavigationWrapper>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-lg font-medium text-gray-900">Доступ запрещен</h2>
                <p className="mt-2 text-sm text-gray-600">{error}</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Вернуться на дашборд
                </button>
              </div>
            </div>
          </div>
        </div>
      </NavigationWrapper>
    )
  }

  return (
    <NavigationWrapper>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Просмотр и управление ролями пользователей системы
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Назад на дашборд
              </button>
            </div>
          </div>

          {/* Поиск */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Список пользователей */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Загрузка пользователей...</p>
                
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Пользователи не найдены</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'В системе пока нет пользователей'}
                </p>
                
              </div>
            ) : (
                             <div>
                <ul className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li key={user.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {user.full_name || 'Без имени'}
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role_name)}`}>
                                {user.role_display_name}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              Регистрация: {formatDate(user.created_at)}
                              {user.last_sign_in_at && (
                                <span className="ml-4">
                                  Последний вход: {formatDate(user.last_sign_in_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {editingUser === user.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={editingRole || ''}
                                onChange={(e) => setEditingRole(Number(e.target.value))}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                disabled={saving}
                              >
                                {roles.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.display_name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleSaveRole(user.id)}
                                disabled={saving}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditRole(user.id, roles.find(r => r.name === user.role_name)?.id || 1)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Изменить роль
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Статистика */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Всего пользователей</dt>
                      <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Администраторы</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.filter(u => u.role_name === 'admin').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Зарегистрировано сегодня</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.filter(u => {
                          const today = new Date()
                          const userDate = new Date(u.created_at)
                          return userDate.toDateString() === today.toDateString()
                        }).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  )
}
