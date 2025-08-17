import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Health Check: Проверка работоспособности API')
    
    return NextResponse.json({
      success: true,
      message: 'API работает корректно',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelUrl: process.env.VERCEL_URL,
        nextPublicVercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL
      }
    })
    
  } catch (error: any) {
    console.error('❌ Health Check: Ошибка:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
