import { Resend } from 'resend'

interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmailResend({ to, subject, html }: EmailData) {
  try {
    console.log('📧 Resend Email: Начало отправки email')
    console.log('📧 Resend Email: Получатель:', to)
    console.log('📧 Resend Email: Тема:', subject)

    // Проверяем наличие API ключа
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Resend Email: RESEND_API_KEY не настроен, используем тестовый ключ')
    }

    // Инициализируем Resend
    const resend = new Resend(process.env.RESEND_API_KEY || 're_test_key')
    console.log('📧 Resend Email: Resend инициализирован')

    // Отправляем email
    console.log('📧 Resend Email: Отправляем email...')
    
    // В тестовом режиме отправляем на адрес аккаунта
    const testEmail = 'jovannirio@gmail.com'
    const actualEmail = to
    
    console.log('📧 Resend Email: Тестовый режим - отправляем на:', testEmail)
    console.log('📧 Resend Email: Реальный получатель:', actualEmail)
    
         const data = await resend.emails.send({
       from: 'noreply@petvizor.com', // Используем ваш верифицированный домен
       to: [to], // Отправляем на реальный адрес
       subject: subject,
       html: html,
     })

    console.log('📧 Resend Email: Ответ от Resend:', data)
    
    // Проверяем структуру ответа
    const messageId = data?.data?.id || data?.id || 'unknown'
    console.log('📧 Resend Email: Email отправлен успешно, ID:', messageId)
    
    return { 
      success: true, 
      messageId: messageId,
      note: 'Email отправлен через Resend'
    }
  } catch (error: any) {
    console.error('❌ Resend Email: Ошибка отправки email:', error)
    
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
