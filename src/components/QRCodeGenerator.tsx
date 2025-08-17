'use client'

import { useState, useEffect } from 'react'
import { Download, Copy, Check } from 'lucide-react'

interface QRCodeGeneratorProps {
  data: string
  petName: string
  size?: number
}

export default function QRCodeGenerator({ data, petName, size = 200 }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.log('🔍 QRCodeGenerator: data =', data)
    console.log('🔍 QRCodeGenerator: petName =', petName)
    console.log('🔍 QRCodeGenerator: size =', size)
    
    if (data) {
      generateQRCode()
    } else {
      console.log('❌ QRCodeGenerator: нет данных для генерации QR-кода')
      setError('Нет данных для генерации QR-кода')
      setLoading(false)
    }
  }, [data, size])

  const generateQRCode = async () => {
    try {
      console.log('🚀 Начинаем генерацию QR-кода...')
      setLoading(true)
      setError('')

      // Динамически импортируем QRCode для избежания проблем с SSR
      const QRCode = (await import('qrcode')).default
      console.log('✅ QRCode импортирован успешно')

      // Создаем временный canvas
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      console.log('✅ Временный canvas создан, размеры:', canvas.width, 'x', canvas.height)

      // Генерируем QR-код
      console.log('🎨 Генерируем QR-код с данными:', data)
      await QRCode.toCanvas(canvas, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      console.log('✅ QR-код сгенерирован успешно')

      // Получаем URL изображения
      const url = canvas.toDataURL('image/png')
      setQrCodeUrl(url)
      console.log('✅ URL изображения получен:', url.substring(0, 50) + '...')
    } catch (err: any) {
      console.error('💥 Ошибка генерации QR-кода:', err)
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
      console.log('✅ QR-код скачан')
    } catch (err) {
      console.error('Ошибка скачивания:', err)
      alert('Ошибка при скачивании QR-кода')
    }
  }

  const copyQRCodeData = async () => {
    try {
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      console.log('✅ Данные скопированы в буфер обмена')
    } catch (err) {
      console.error('Ошибка копирования:', err)
      alert('Ошибка при копировании данных')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">Генерируем QR-код...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p className="mb-2">{error}</p>
        <div className="text-xs text-gray-500 mb-4">
          <p>Данные: {data || 'не указаны'}</p>
          <p>Питомец: {petName}</p>
        </div>
        <button 
          onClick={generateQRCode}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt={`QR-код для ${petName}`}
            className="mx-auto block"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">QR-код не сгенерирован</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={downloadQRCode}
          disabled={!qrCodeUrl}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Скачать PNG</span>
        </button>

        <button
          onClick={copyQRCodeData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Скопировано!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Копировать данные</span>
            </>
          )}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>QR-код содержит ссылку на публичную страницу питомца</p>
        <p className="mt-1 break-all">{data}</p>
      </div>
    </div>
  )
}
