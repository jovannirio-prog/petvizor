'use client'

import { useState, useEffect } from 'react'
import { Download, QrCode, Loader2 } from 'lucide-react'

interface PetQRCodeProps {
  petId: string
  petName: string
  size?: number
}

export default function PetQRCode({ petId, petName, size = 120 }: PetQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)

  // Проверяем, есть ли уже сохраненный QR-код для этого питомца
  useEffect(() => {
    const savedQRCode = localStorage.getItem(`qr-code-${petId}`)
    if (savedQRCode) {
      setQrCodeUrl(savedQRCode)
      setIsGenerated(true)
      console.log('🔧 PetQRCode: Загружен сохраненный QR-код для питомца:', petId)
    }
  }, [petId])

  const generateQRCode = async () => {
    try {
      console.log('🔧 PetQRCode: Генерируем QR-код для питомца:', petId)
      setLoading(true)
      setError('')
      setIsGenerated(false) // Сбрасываем состояние, чтобы показать загрузку

      // Создаем URL для публичной страницы питомца
      const publicUrl = `${window.location.origin}/pet/${petId}`
      console.log('🔧 PetQRCode: Публичный URL:', publicUrl)

      // Динамически импортируем QRCode
      const QRCode = (await import('qrcode')).default

      // Создаем временный canvas
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size

      // Генерируем QR-код
      await QRCode.toCanvas(canvas, publicUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      // Получаем URL изображения
      const url = canvas.toDataURL('image/png')
      setQrCodeUrl(url)
      setIsGenerated(true)
      
      // Сохраняем QR-код в localStorage
      localStorage.setItem(`qr-code-${petId}`, url)
      console.log('🔧 PetQRCode: QR-код сгенерирован и сохранен для питомца:', petId)
    } catch (err: any) {
      console.error('🔧 PetQRCode: Ошибка генерации QR-кода:', err)
      setError(`Ошибка генерации QR-кода: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) {
      console.error('QR-код еще не сгенерирован')
      return
    }

    try {
      const link = document.createElement('a')
      link.download = `qr-${petName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = qrCodeUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('🔧 PetQRCode: QR-код скачан')
    } catch (err) {
      console.error('Ошибка скачивания:', err)
      alert('Ошибка при скачивании QR-кода')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <QrCode className="h-5 w-5 mr-2 text-blue-600" />
        QR-код питомца
      </h3>
      
      <div className="text-center">
        {!isGenerated ? (
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
              <QrCode className="h-8 w-8 text-gray-400" />
            </div>
            <button
              onClick={generateQRCode}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Генерируем...</span>
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  <span>Сгенерировать QR-код</span>
                </>
              )}
            </button>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
              <img
                src={qrCodeUrl}
                alt={`QR-код для ${petName}`}
                className="mx-auto block"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <div className="space-y-2">
              <button
                onClick={downloadQRCode}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Скачать</span>
              </button>
              <button
                onClick={generateQRCode}
                disabled={loading}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Обновляем...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    <span>Пересоздать</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              QR-код содержит ссылку на публичную страницу питомца
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
