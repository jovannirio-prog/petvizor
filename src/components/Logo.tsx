'use client'

import Image from 'next/image'

interface LogoProps {
  className?: string
}

export default function Logo({ className = "h-12" }: LogoProps) {
  return (
    <Image 
      src="/images/logo.png"
      alt="PetVizor Logo"
      width={200}
      height={50}
      className={`${className} w-auto`}
      priority
    />
  )
}
