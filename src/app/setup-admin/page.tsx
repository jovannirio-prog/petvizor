'use client'

import { useState } from 'react'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    user?: any
    details?: any
  } | null>(null)

  const createAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          user: data.user
        })
             } else if (data.error && data.error.includes('already been registered')) {
         // Пользователь уже существует, проверим его роль
         const checkResponse = await fetch('/api/admin/check-admin-direct')
         const checkData = await checkResponse.json()
         
         if (checkResponse.ok && checkData.user?.role?.name === 'admin') {
           setResult({
             success: true,
             message: 'Администратор уже существует и имеет правильную роль!',
             user: checkData.user
           })
         } else {
           setResult({
             success: false,
             message: 'Пользователь существует, но не имеет роль администратора. Обратитесь к разработчику.',
             details: checkData
           })
         }
      } else {
        setResult({
          success: false,
          message: data.error || 'Ошибка создания администратора',
          details: data.details
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Ошибка сети при создании администратора'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Настройка администратора
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Создание пользователя с правами администратора системы
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!result ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Данные администратора:
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> sa@petvizor.local
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Пароль:</strong> yyy789465
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Роль:</strong> Администратор системы
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Внимание!
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Этот пользователь будет иметь полные права администратора системы. 
                          Используйте только для первоначальной настройки.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                             <div className="space-y-3">
                 <button
                   onClick={createAdmin}
                   disabled={loading}
                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {loading ? (
                     <div className="flex items-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Проверка...
                     </div>
                   ) : (
                     'Создать/Проверить администратора'
                   )}
                 </button>
                 
                                   <button
                    onClick={async () => {
                      setLoading(true)
                      setResult(null)
                      try {
                        const response = await fetch('/api/admin/check-admin-direct')
                        const data = await response.json()
                        if (response.ok) {
                          setResult({
                            success: true,
                            message: 'Администратор найден!',
                            user: data.user
                          })
                        } else {
                          setResult({
                            success: false,
                            message: data.error || 'Администратор не найден',
                            details: data
                          })
                        }
                      } catch (error) {
                        setResult({
                          success: false,
                          message: 'Ошибка проверки администратора'
                        })
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Только проверить существующего
                  </button>
                  
                  <button
                    onClick={async () => {
                      setLoading(true)
                      setResult(null)
                      try {
                        const response = await fetch('/api/admin/fix-admin-profile', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        })
                        const data = await response.json()
                        if (response.ok) {
                          setResult({
                            success: true,
                            message: data.message,
                            user: data.user
                          })
                        } else {
                          setResult({
                            success: false,
                            message: data.error || 'Ошибка исправления профиля',
                            details: data
                          })
                        }
                      } catch (error) {
                        setResult({
                          success: false,
                          message: 'Ошибка исправления профиля'
                        })
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Исправить профиль администратора
                  </button>
               </div>
            </div>
          ) : (
            <div className="text-center">
              {result.success ? (
                <div>
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Администратор создан успешно!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {result.message}
                  </p>
                  {result.user && (
                    <div className="bg-green-50 p-4 rounded-md mb-4">
                      <p className="text-sm text-green-800">
                        <strong>ID:</strong> {result.user.id}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Email:</strong> {result.user.email}
                      </p>
                                             <p className="text-sm text-green-800">
                         <strong>Роль:</strong> {result.user.role?.display_name || result.user.role?.name || 'Не указана'}
                       </p>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      Теперь вы можете войти в систему используя:
                    </p>
                    <p className="text-sm font-medium text-blue-900 mt-1">
                      Email: sa@petvizor.local
                    </p>
                    <p className="text-sm font-medium text-blue-900">
                      Пароль: yyy789465
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ошибка создания
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {result.message}
                  </p>
                  {result.details && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Детали ошибки:</h4>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  <button
                    onClick={() => setResult(null)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Эта страница предназначена только для первоначальной настройки системы.
            После создания администратора рекомендуется удалить или защитить этот endpoint.
          </p>
        </div>
      </div>
    </div>
  )
}
