// Утилиты для работы с изображениями

export interface CompressedImage {
  file: File
  dataUrl: string
  size: number
}

// Сжатие изображения до указанного размера
export async function compressImage(
  file: File, 
  maxSizeMB: number = 3,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Вычисляем новые размеры, сохраняя пропорции
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Устанавливаем размеры canvas
      canvas.width = width
      canvas.height = height

      // Рисуем изображение на canvas
      ctx?.drawImage(img, 0, 0, width, height)

      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Не удалось сжать изображение'))
            return
          }

          // Проверяем размер
          const sizeMB = blob.size / (1024 * 1024)
          
          if (sizeMB > maxSizeMB) {
            // Если размер все еще больше максимального, уменьшаем качество
            const newQuality = quality * (maxSizeMB / sizeMB)
            canvas.toBlob(
              (newBlob) => {
                if (!newBlob) {
                  reject(new Error('Не удалось сжать изображение'))
                  return
                }
                
                const newFile = new File([newBlob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
                
                const reader = new FileReader()
                reader.onload = () => {
                  resolve({
                    file: newFile,
                    dataUrl: reader.result as string,
                    size: newFile.size
                  })
                }
                reader.readAsDataURL(newFile)
              },
              file.type,
              Math.min(newQuality, 0.9)
            )
          } else {
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                file: newFile,
                dataUrl: reader.result as string,
                size: newFile.size
              })
            }
            reader.readAsDataURL(newFile)
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Не удалось загрузить изображение'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Проверка типа файла
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

// Форматирование размера файла
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Генерация уникального имени файла
export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${userId}/${timestamp}-${random}.${extension}`
}
