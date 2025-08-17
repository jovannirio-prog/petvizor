'use client'

import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { usePets } from '@/hooks/usePets'
import Navigation from '@/components/Navigation'
import PetList from '@/components/PetList'
import PetForm from '@/components/PetForm'
import { PawPrint, QrCode } from 'lucide-react'
import Link from 'next/link'

interface Pet {
  id: string
  name: string
  breed: string
  age: number
  description?: string
}

export default function QRPage() {
  const { user, loading: userLoading } = useUser()
  const { pets, loading: petsLoading, addPet, updatePet, deletePet } = usePets()
  const [showForm, setShowForm] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

  const handleAddPet = () => {
    setEditingPet(null)
    setShowForm(true)
  }

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet)
    setShowForm(true)
  }

  const handleSavePet = async (petData: { name: string; breed: string; age: number; description?: string }) => {
    if (editingPet) {
      return await updatePet(editingPet.id, petData)
    } else {
      return await addPet(petData)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingPet(null)
  }

  // Если пользователь не авторизован
  if (!userLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        
        <div className="max-w-4xl mx-auto p-4 pt-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-full">
                <QrCode className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              QR-паспорт питомца
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              PetVizor помогает найти питомца, если он потерялся. Создайте уникальный
              QR-код с контактами — прикрепите его к ошейнику или жетону. Тот, кто
              найдёт вашего любимца, сможет быстро связаться с вами 📲.
            </p>

            <div className="space-y-4">
              <p className="text-gray-600">
                Чтобы создать QR-код, войдите или зарегистрируйтесь:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Войти
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Зарегистрироваться
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Загрузка
  if (userLoading || petsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-4 pt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-blue-600 rounded-full">
              <PawPrint className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Управление питомцами
              </h1>
              <p className="text-gray-600">
                Добавляйте питомцев и создавайте для них QR-коды
              </p>
            </div>
          </div>

          <PetList
            pets={pets}
            onEdit={handleEditPet}
            onDelete={deletePet}
            onAdd={handleAddPet}
          />
        </div>
      </div>

      {showForm && (
        <PetForm
          pet={editingPet}
          onSave={handleSavePet}
          onCancel={handleCancelForm}
          isEditing={!!editingPet}
        />
      )}
    </div>
  )
}
