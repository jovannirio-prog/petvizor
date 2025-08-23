'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import NavigationWrapper from '@/components/NavigationWrapper'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { ArrowLeft, QrCode, PawPrint, User, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Pet {
  id: string
  name: string
  breed: string
  age: number
  description?: string
  user_id: string
}

export default function PetQRPage({ params }: { params: { id: string } }) {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrData, setQrData] = useState('')

  useEffect(() => {
    console.log('🔍 PetQRPage: params.id =', params.id)
    console.log('🔍 PetQRPage: user =', user)
    console.log('🔍 PetQRPage: userLoading =', userLoading)

    if (!userLoading && !user) {
      console.log('❌ PetQRPage: пользователь не авторизован, перенаправляем на логин')
      router.push('/login')
      return
    }

    if (user) {
      console.log('✅ PetQRPage: пользователь авторизован, загружаем питомца')
      fetchPet()
    }
  }, [user, userLoading, params.id])

  const fetchPet = async () => {
    try {
      console.log('🚀 Загружаем питомца с ID:', params.id)
      setLoading(true)
      setError('')
      
      const accessToken = localStorage.getItem('supabase_access_token')
      if (!accessToken) {
        throw new Error('Не авторизован')
      }

      console.log('✅ Токен найден, делаем запрос к API')

      const response = await fetch(`/api/pets/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      console.log('📊 Статус ответа:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Питомец загружен:', result.pet)
        setPet(result.pet)
        generateQRData(result.pet, user)
      } else {
        const errorResult = await response.json()
        console.log('❌ Ошибка загрузки питомца:', errorResult)
        setError(errorResult.error || 'Питомец не найден')
      }
    } catch (error: any) {
      console.error('💥 Ошибка загрузки питомца:', error)
      setError('Ошибка загрузки питомца')
    } finally {
      setLoading(false)
    }
  }

  const generateQRData = (petData: Pet, userData: any) => {
    console.log('🔍 generateQRData: petData =', petData)
    console.log('🔍 generateQRData: userData =', userData)
    
    // Создаем URL для публичной страницы питомца
    // Используем переменную окружения для продакшн URL или текущий origin
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : window.location.origin
    const publicUrl = `${baseUrl}/pet/${petData.id}`
    console.log('🔗 Создан публичный URL:', publicUrl)
    
    // QR-код содержит только URL - при сканировании сразу откроется страница
    setQrData(publicUrl)
    console.log('✅ QR данные установлены:', publicUrl)
  }

  if (userLoading || loading) {
    return (
      <NavigationWrapper>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </NavigationWrapper>
    )
  }

  if (error) {
    return (
      <NavigationWrapper>
        <div className="max-w-4xl mx-auto p-4 pt-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <QrCode className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ошибка
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="text-xs text-gray-500 mb-4">
              <p>ID питомца: {params.id}</p>
              <p>QR данные: {qrData || 'не установлены'}</p>
            </div>
            <Link href="/qr">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Вернуться к списку питомцев
              </button>
            </Link>
          </div>
        </div>
      </NavigationWrapper>
    )
  }

  if (!pet) {
    return (
      <NavigationWrapper>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Питомец не найден</p>
            <p className="text-xs text-gray-500 mt-2">ID: {params.id}</p>
          </div>
        </div>
      </NavigationWrapper>
    )
  }

  console.log('🎨 Рендерим страницу QR-кода для питомца:', pet.name)
  console.log('🔗 QR данные:', qrData)

  return (
    <NavigationWrapper>
      <div className="max-w-6xl mx-auto p-4 pt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Заголовок */}
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/qr" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-3 bg-blue-600 rounded-full">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                QR-код питомца
              </h1>
              <p className="text-gray-600">
                Создайте QR-код для {pet.name}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Информация о питомце */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <PawPrint className="w-5 h-5 text-blue-600" />
                  <span>Информация о питомце</span>
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Кличка:</span>
                    <span className="text-gray-900">{pet.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Порода:</span>
                    <span className="text-gray-900">{pet.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Возраст:</span>
                    <span className="text-gray-900">{pet.age} {getAgeText(pet.age)}</span>
                  </div>
                  {pet.description && (
                    <div className="pt-3 border-t border-gray-200">
                      <span className="font-medium text-gray-700">Описание:</span>
                      <p className="mt-1 text-gray-900">{pet.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span>Контакты владельца</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                  {user?.full_name && (
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{user.full_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Инструкции */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  Как использовать QR-код:
                </h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>• Распечатайте QR-код и прикрепите к ошейнику питомца</li>
                  <li>• Или прикрепите к жетону или бирке</li>
                  <li>• При потере питомца любой человек сможет отсканировать код камерой телефона</li>
                  <li>• QR-код сразу откроет публичную страницу с контактами владельца</li>
                </ul>
              </div>

              {/* Публичная ссылка */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3">
                  Публичная страница:
                </h3>
                <p className="text-green-800 text-sm mb-3">
                  При сканировании QR-кода откроется эта страница:
                </p>
                <Link 
                  href={`/pet/${pet.id}`}
                  target="_blank"
                  className="text-green-600 hover:text-green-800 font-medium text-sm break-all"
                >
                  {`${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : window.location.origin}/pet/${pet.id}`}
                </Link>
              </div>
            </div>

            {/* QR-код */}
            <div className="text-center">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  QR-код для {pet.name}
                </h3>
                
                {qrData ? (
                  <QRCodeGenerator 
                    data={qrData} 
                    petName={pet.name} 
                    size={240}
                  />
                ) : (
                  <div className="animate-pulse">
                    <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-4">Ожидание данных для QR-кода...</p>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 text-center mt-4">
                <p>QR-код содержит ссылку на публичную страницу питомца</p>
                {qrData && (
                  <p className="mt-1 break-all text-xs">{qrData}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  )
}

function getAgeText(age: number): string {
  if (age === 1) return 'год'
  if (age >= 2 && age <= 4) return 'года'
  return 'лет'
}
