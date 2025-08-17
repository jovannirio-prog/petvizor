'use client'

import { useState } from 'react'
import { Edit, Trash2, Plus, PawPrint } from 'lucide-react'

interface Pet {
  id: string
  name: string
  breed: string
  age: number
  description?: string
}

interface PetListProps {
  pets: Pet[]
  onEdit: (pet: Pet) => void
  onDelete: (petId: string) => void
  onAdd: () => void
}

export default function PetList({ pets, onEdit, onDelete, onAdd }: PetListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (petId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого питомца?')) {
      setDeletingId(petId)
      await onDelete(petId)
      setDeletingId(null)
    }
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PawPrint className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          У вас пока нет питомцев
        </h3>
        <p className="text-gray-600 mb-6">
          Добавьте своего первого питомца, чтобы создать для него QR-код
        </p>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить питомца</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Мои питомцы ({pets.length})
        </h2>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить питомца</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(pet)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pet.id)}
                  disabled={deletingId === pet.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {pet.name}
            </h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">Порода:</span>
                <span>{pet.breed}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Возраст:</span>
                <span>{pet.age} {getAgeText(pet.age)}</span>
              </div>
              {pet.description && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="font-medium">Описание:</span>
                  <p className="mt-1 text-gray-500">{pet.description}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                onClick={() => window.open(`/qr/${pet.id}`, '_blank')}
              >
                Создать QR-код
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getAgeText(age: number): string {
  if (age === 1) return 'год'
  if (age >= 2 && age <= 4) return 'года'
  return 'лет'
}
