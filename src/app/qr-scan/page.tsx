'use client'

import { useState, useRef } from 'react'
import NavigationWrapper from '@/components/NavigationWrapper'
import { QrCode, Camera, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function QRScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startScanning = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (err) {
      setError('Не удалось получить доступ к камере. Убедитесь, что вы разрешили доступ к камере.')
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const handleScan = (data: string) => {
    setScannedData(data)
    stopScanning()
  }

  return (
    <NavigationWrapper>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Link>
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Сканер QR-кода</h1>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-lg text-gray-600">
              Отсканируйте QR-код питомца, чтобы получить информацию о владельце и связаться с ним.
            </p>
          </div>

          {/* Scanner Section */}
          <div className="mb-8">
            {!isScanning && !scannedData && (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Нажмите кнопку ниже, чтобы начать сканирование QR-кода
                  </p>
                  <button
                    onClick={startScanning}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Начать сканирование
                  </button>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                </div>
                <button
                  onClick={stopScanning}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Остановить сканирование
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {scannedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  QR-код успешно отсканирован!
                </h3>
                <p className="text-green-700 mb-4">
                  Данные: {scannedData}
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setScannedData(null)
                      startScanning()
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Сканировать еще
                  </button>
                  <button
                    onClick={() => setScannedData(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Как использовать сканер:
            </h3>
            <ul className="text-blue-700 space-y-2">
              <li>• Разрешите доступ к камере вашего устройства</li>
              <li>• Наведите камеру на QR-код питомца</li>
              <li>• QR-код должен быть хорошо освещен и находиться в фокусе</li>
              <li>• После сканирования вы получите контактную информацию владельца</li>
            </ul>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  )
}
