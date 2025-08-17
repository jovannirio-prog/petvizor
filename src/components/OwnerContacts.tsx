'use client'

import { useState, useEffect } from 'react'
import { Phone, User, AlertTriangle, Save } from 'lucide-react'

interface OwnerContactsProps {
  currentPhone?: string
  currentLostComment?: string
  onSave: (phone: string, lostComment: string) => void
  loading?: boolean
}

export default function OwnerContacts({ 
  currentPhone = '', 
  currentLostComment = '', 
  onSave,
  loading = false 
}: OwnerContactsProps) {
  const [phone, setPhone] = useState(currentPhone)
  const [lostComment, setLostComment] = useState(currentLostComment)
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<{ phone?: string; lostComment?: string }>({})

  useEffect(() => {
    setPhone(currentPhone)
    setLostComment(currentLostComment)
  }, [currentPhone, currentLostComment])

  const validatePhone = (phoneNumber: string): boolean => {
    // Простая валидация российского номера телефона
    const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''))
  }

  const formatPhone = (phoneNumber: string): string => {
    // Убираем все кроме цифр
    const digits = phoneNumber.replace(/\D/g, '')
    
    // Если номер начинается с 8, заменяем на +7
    if (digits.startsWith('8') && digits.length === 11) {
      return '+7' + digits.slice(1)
    }
    
    // Если номер начинается с 7, добавляем +
    if (digits.startsWith('7') && digits.length === 11) {
      return '+' + digits
    }
    
    return phoneNumber
  }

  const handleSave = () => {
    const newErrors: { phone?: string; lostComment?: string } = {}

    // Валидация телефона
    if (phone && !validatePhone(phone)) {
      newErrors.phone = 'Введите корректный номер телефона'
    }

    // Валидация комментария
    if (lostComment && lostComment.length > 500) {
      newErrors.lostComment = 'Комментарий не должен превышать 500 символов'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formattedPhone = formatPhone(phone)
    onSave(formattedPhone, lostComment)
    setIsEditing(false)
    setErrors({})
  }

  const handleCancel = () => {
    setPhone(currentPhone)
    setLostComment(currentLostComment)
    setIsEditing(false)
    setErrors({})
  }

  if (!isEditing) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-yellow-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Если потерялся</span>
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            Редактировать
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-yellow-800 mb-1">
              Номер телефона для связи:
            </label>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-900">
                {phone || 'Не указан'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-800 mb-1">
              Комментарий для нашедшего:
            </label>
            <div className="bg-white bg-opacity-50 rounded p-3">
              <p className="text-yellow-900 text-sm">
                {lostComment || 'Комментарий не добавлен'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-100 rounded text-sm text-yellow-800">
          <p className="font-medium mb-1">💡 Совет:</p>
          <p>Укажите номер телефона и добавьте комментарий с важной информацией о питомце. Это поможет нашедшему быстро связаться с вами.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-yellow-900 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Если потерялся</span>
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-yellow-800 mb-2">
            Номер телефона для связи:
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Укажите номер, по которому с вами можно связаться в случае находки питомца
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-800 mb-2">
            Комментарий для нашедшего:
          </label>
          <textarea
            value={lostComment}
            onChange={(e) => setLostComment(e.target.value)}
            placeholder="Например: Кот очень пугливый, не подходит к незнакомцам. Любит лакомства. Если найдете, пожалуйста, позвоните сразу."
            rows={4}
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none ${
              errors.lostComment ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.lostComment && (
            <p className="text-red-600 text-sm mt-1">{errors.lostComment}</p>
          )}
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Добавьте важную информацию о питомце для нашедшего
            </p>
            <p className="text-xs text-gray-400">
              {lostComment.length}/500
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}
