import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Petvizor - AI Помощник для Владельцев Домашних Животных',
  description: 'Умный помощник для владельцев домашних животных. Получите советы по уходу, здоровью и питанию ваших питомцев.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
