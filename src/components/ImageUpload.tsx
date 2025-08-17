'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { compressImage, isValidImageFile, formatFileSize } from '@/lib/image-utils'

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void
  onImageRemove: () => void
  currentImageUrl?: string | null
  className?: string
}

export default function ImageUpload({ 
  onImageSelect, 
  onImageRemove, 
  currentImageUrl,
  className = '' 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    console.log('🔧 ImageUpload: Файл выбран:', file.name, 'размер:', file.size)
    setError(null)
    
    if (!isValidImageFile(file)) {
      console.error('🔧 ImageUpload: Неподдерживаемый тип файла:', file.type)
      setError('Пожалуйста, выберите изображение в формате JPEG, PNG, WebP или GIF')
      return
    }

    const maxSizeMB = 3
    const fileSizeMB = file.size / (1024 * 1024)
    console.log('🔧 ImageUpload: Размер файла:', fileSizeMB.toFixed(2), 'MB')
    
    if (fileSizeMB > maxSizeMB) {
      console.log('🔧 ImageUpload: Сжимаем файл...')
      setIsCompressing(true)
      try {
        const compressed = await compressImage(file, maxSizeMB)
        console.log('🔧 ImageUpload: Файл сжат, размер после сжатия:', (compressed.file.size / (1024 * 1024)).toFixed(2), 'MB')
        setPreviewUrl(compressed.dataUrl)
        console.log('🔧 ImageUpload: Вызываем onImageSelect с сжатым файлом')
        onImageSelect(compressed.file, compressed.dataUrl)
      } catch (err) {
        console.error('🔧 ImageUpload: Ошибка сжатия:', err)
        setError('Не удалось обработать изображение')
      } finally {
        setIsCompressing(false)
      }
    } else {
      console.log('🔧 ImageUpload: Файл не требует сжатия')
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setPreviewUrl(dataUrl)
        console.log('🔧 ImageUpload: Вызываем onImageSelect с оригинальным файлом')
        onImageSelect(file, dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setError(null)
    onImageRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="relative group">
          <div className="aspect-square w-full max-w-xs mx-auto bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Предварительный просмотр"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Overlay с кнопкой удаления */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`
            aspect-square w-full max-w-xs mx-auto border-2 border-dashed rounded-lg 
            flex flex-col items-center justify-center cursor-pointer transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {isCompressing ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Сжатие изображения...</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Нажмите или перетащите изображение
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP, GIF • Максимум 3MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {previewUrl && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={handleClick}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Заменить изображение
          </button>
        </div>
      )}
    </div>
  )
}
