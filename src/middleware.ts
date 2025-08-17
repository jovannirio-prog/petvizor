import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Получаем origin из заголовка или используем дефолтный
  const origin = request.headers.get('origin') || '*'
  
  // Создаем response
  const response = NextResponse.next()
  
  // Добавляем CORS заголовки
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-refresh-token')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // Обрабатываем preflight запросы
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }
  
  // Добавляем дополнительные заголовки безопасности
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Логируем запросы для диагностики
  console.log(`🌐 Middleware: ${request.method} ${request.url}`)
  console.log(`🌐 Middleware: Origin: ${origin}`)
  console.log(`🌐 Middleware: User-Agent: ${request.headers.get('user-agent')}`)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
