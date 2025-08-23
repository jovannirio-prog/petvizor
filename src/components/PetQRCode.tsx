'use client'

import { useState, useEffect } from 'react'
import { Download, QrCode, Loader2, RefreshCw } from 'lucide-react'

interface PetQRCodeProps {
  petId: string
  petName: string
  size?: number
}

interface QRCodeData {
  qr_code_url: string
  qr_code_image: string
  public_url: string
  qr_code_updated_at: string
  has_qr_code: boolean
}

export default function PetQRCode({ petId, petName, size = 120 }: PetQRCodeProps) {
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Загружаем данные QR-кода при монтировании компонента
  useEffect(() => {
    loadQRCodeData()
  }, [petId])

  const loadQRCodeData = async () => {
    try {
      console.log('🔧 PetQRCode: Загружаем данные QR-кода для питомца:', petId)
      setLoading(true)
      setError('')

      const response = await fetch(`/api/pets/${petId}/qr-code`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки QR-кода')
      }

      // Обновляем данные с правильной структурой
      const updatedData = {
        ...data,
        has_qr_code: !!data.qr_code_image // Проверяем наличие изображения
      }
      
      setQrCodeData(updatedData)
      console.log('🔧 PetQRCode: Данные QR-кода загружены:', updatedData)
    } catch (err: any) {
      console.error('🔧 PetQRCode: Ошибка загрузки QR-кода:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    try {
      console.log('🔧 PetQRCode: Генерируем QR-код для питомца:', petId)
      setLoading(true)
      setError('')

      const response = await fetch(`/api/pets/${petId}/qr-code`, {
        method: 'POST'
      })
      const data = await response.json()

      console.log('🔧 PetQRCode: Ответ от API генерации:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации QR-кода')
      }

      // Обновляем данные с правильной структурой
      const updatedData = {
        ...data,
        has_qr_code: !!data.qr_code_image // Проверяем наличие изображения
      }
      
      console.log('🔧 PetQRCode: Обновленные данные после генерации:', updatedData)
      setQrCodeData(updatedData)
      console.log('🔧 PetQRCode: QR-код сгенерирован:', updatedData)
    } catch (err: any) {
      console.error('🔧 PetQRCode: Ошибка генерации QR-кода:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeData?.qr_code_image) {
      console.error('QR-код еще не сгенерирован')
      return
    }

    try {
      const link = document.createElement('a')
      link.download = `qr-${petName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = qrCodeData.qr_code_image
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('🔧 PetQRCode: QR-код скачан')
    } catch (err) {
      console.error('Ошибка скачивания:', err)
      alert('Ошибка при скачивании QR-кода')
    }
  }

  const copyPublicUrl = async () => {
    if (!qrCodeData?.public_url) return

    try {
      await navigator.clipboard.writeText(qrCodeData.public_url)
      alert('Ссылка скопирована в буфер обмена!')
    } catch (err) {
      console.error('Ошибка копирования:', err)
      alert('Ошибка при копировании ссылки')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <QrCode className="h-5 w-5 mr-2 text-blue-600" />
        QR-код питомца
      </h3>
      
      {/* Временная отладочная информация */}
      <div className="text-xs text-gray-500 mb-2">
        Debug: loading={loading.toString()}, qrCodeImage={qrCodeData?.qr_code_image ? 'exists' : 'null'}, error={error || 'none'}
      </div>
      
      <div className="text-center">
        {loading ? (
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : !qrCodeData?.qr_code_image ? (
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
              <QrCode className="h-8 w-8 text-gray-400" />
            </div>
            <button
              onClick={generateQRCode}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              <QrCode className="h-4 w-4" />
              <span>Сгенерировать QR-код</span>
            </button>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* QR-код */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
              <img
                src={qrCodeData.qr_code_image}
                alt={`QR-код для ${petName}`}
                className="mx-auto block"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {/* Публичный URL */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">Публичная ссылка:</p>
              <div className="flex items-center justify-between bg-white rounded border p-2">
                <code className="text-xs text-blue-600 truncate flex-1">
                  {qrCodeData.public_url}
                </code>
                <button
                  onClick={copyPublicUrl}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                  title="Копировать ссылку"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-2">
              <button
                onClick={downloadQRCode}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Скачать QR-код</span>
              </button>
              <button
                onClick={generateQRCode}
                disabled={loading}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Пересоздать</span>
              </button>
            </div>

            {/* Информация */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>QR-код содержит ссылку на публичную страницу питомца</p>
              {qrCodeData.qr_code_updated_at && (
                <p>Обновлен: {new Date(qrCodeData.qr_code_updated_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

