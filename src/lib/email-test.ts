interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmailTest({ to, subject, html }: EmailData) {
  try {
    console.log('📧 Test Email: Начало отправки email')
    console.log('📧 Test Email: Получатель:', to)
    console.log('📧 Test Email: Тема:', subject)
    console.log('📧 Test Email: SMTP настройки:')
    console.log('  - SMTP_HOST:', process.env.SMTP_HOST)
    console.log('  - SMTP_PORT:', process.env.SMTP_PORT)
    console.log('  - SMTP_USER:', process.env.SMTP_USER ? 'Настроен' : 'Не настроен')
    console.log('  - SMTP_PASS:', process.env.SMTP_PASS ? 'Настроен' : 'Не настроен')

    // Проверяем наличие обязательных переменных
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP_USER или SMTP_PASS не настроены')
    }

    // Имитируем отправку email (для тестирования)
    console.log('📧 Test Email: Имитация отправки email...')
    console.log('📧 Test Email: Email должен быть отправлен на:', to)
    console.log('📧 Test Email: Тема:', subject)
    console.log('📧 Test Email: HTML содержимое:', html.substring(0, 200) + '...')
    
    // Имитируем задержку
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('📧 Test Email: Email "отправлен" успешно (тестовая имитация)')
    console.log('📧 Test Email: В реальной системе email был бы отправлен на ivan@leovet24.ru')
    
    return { 
      success: true, 
      messageId: `test-${Date.now()}`,
      note: 'Это тестовая имитация отправки email. В реальной системе email был бы отправлен.'
    }
  } catch (error: any) {
    console.error('❌ Test Email: Ошибка отправки email:', error)
    
    return { 
      success: false, 
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
        fullError: error.toString()
      }
    }
  }
}

export function createRegistrationNotificationEmail(userData: {
  email: string
  full_name: string
  created_at: string
}) {
  const subject = 'Новая регистрация в PetVizor'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Новая регистрация в PetVizor</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .user-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .label {
          font-weight: bold;
          color: #667eea;
        }
        .value {
          margin-left: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .timestamp {
          background: #e9ecef;
          padding: 10px;
          border-radius: 5px;
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🐾 PetVizor</h1>
        <p>Новая регистрация пользователя</p>
      </div>
      
      <div class="content">
        <h2>Новый пользователь зарегистрировался в системе</h2>
        
        <div class="user-info">
          <div><span class="label">Email:</span><span class="value">${userData.email}</span></div>
          <div><span class="label">Имя:</span><span class="value">${userData.full_name}</span></div>
          <div><span class="label">Дата регистрации:</span><span class="value">${new Date(userData.created_at).toLocaleString('ru-RU')}</span></div>
        </div>
        
        <p>Пользователь успешно создал аккаунт в системе PetVizor и может начать использовать AI-консультанта и другие сервисы.</p>
        
        <div class="timestamp">
          Уведомление отправлено: ${new Date().toLocaleString('ru-RU')}
        </div>
      </div>
      
      <div class="footer">
        <p>Это автоматическое уведомление от системы PetVizor</p>
        <p>© 2024 PetVizor. Все права защищены.</p>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}
