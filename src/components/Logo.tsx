'use client'

interface LogoProps {
  className?: string
}

export default function Logo({ className = "h-6 w-6" }: LogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      {/* Замените на ваш SVG логотип */}
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
    </svg>
  )
}
