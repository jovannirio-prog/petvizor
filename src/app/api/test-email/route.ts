import { NextRequest, NextResponse } from 'next/server'
import { sendEmailResend, createRegistrationNotificationEmail } from '@/lib/email-resend'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Test Email: Начало тестирования отправки email')
    
    // Проверяем наличие SMTP настроек
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ Test Email: Отсутствуют SMTP настройки')
      return NextResponse.json({ 
        success: false, 
        error: 'SMTP настройки не настроены. Проверьте переменные окружения SMTP_USER и SMTP_PASS.' 
      }, { status: 500 })
    }

    // Создаем тестовое уведомление
    const testUserData = {
      email: 'test@example.com',
      full_name: 'Тестовый Пользователь',
      created_at: new Date().toISOString()
    }

    const notificationEmail = createRegistrationNotificationEmail(testUserData)

    // Отправляем тестовый email
    const emailResult = await sendEmailResend({
      to: 'ivan@leovet24.ru',
      subject: `[ТЕСТ] ${notificationEmail.subject}`,
      html: notificationEmail.html
    })

    if (emailResult.success) {
      console.log('✅ Test Email: Тестовый email отправлен успешно')
      return NextResponse.json({
        success: true,
        message: 'Тестовый email отправлен успешно',
        messageId: emailResult.messageId
      })
    } else {
      console.error('❌ Test Email: Ошибка отправки тестового email:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: 'Ошибка отправки email',
        details: emailResult.error,
        smtpConfig: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER ? 'Настроен' : 'Не настроен',
          pass: process.env.SMTP_PASS ? 'Настроен' : 'Не настроен',
          from: process.env.SMTP_FROM
        }
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Test Email: Неожиданная ошибка:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Используйте POST запрос для тестирования отправки email',
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER ? 'Настроен' : 'Не настроен',
    notificationEmail: process.env.NOTIFICATION_EMAIL || 'ivan@leovet24.ru'
  })
}
