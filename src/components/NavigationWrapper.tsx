'use client'

import Navigation from './Navigation'
import React from 'react'
import { usePathname } from 'next/navigation'

interface NavigationWrapperProps {
  children?: React.ReactNode
}

function NavigationWrapper({ children }: NavigationWrapperProps) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  
  return (
    <div className={`${isHomePage ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : ''}`}>
      <Navigation />
      {children && (
        <main className={`${isHomePage ? '' : 'pb-8 px-4 sm:px-6 lg:px-8'}`}>
          {children}
        </main>
      )}
    </div>
  )
}

export default NavigationWrapper
