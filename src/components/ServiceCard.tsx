'use client'

import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  active: boolean
  comingSoon?: boolean
}

export default function ServiceCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  active, 
  comingSoon = false 
}: ServiceCardProps) {
  const CardContent = () => (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${
      active 
        ? 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-lg cursor-pointer' 
        : 'bg-gray-50 border-gray-200 cursor-not-allowed'
    }`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-lg ${
          active ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            active ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {title}
          </h3>
          {comingSoon && (
            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
              Скоро
            </span>
          )}
        </div>
      </div>
      <p className={`text-sm leading-relaxed ${
        active ? 'text-gray-600' : 'text-gray-400'
      }`}>
        {description}
      </p>
      {active && (
        <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
          <span>Подробнее</span>
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  )

  if (active) {
    return (
      <Link href={href} className="block">
        <CardContent />
      </Link>
    )
  }

  return <CardContent />
}
