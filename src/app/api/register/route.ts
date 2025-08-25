import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmailResend, createRegistrationNotificationEmail } from '@/lib/email-resend'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 API Register: Начало обработки запроса')
    console.log('🔐 API Register: URL запроса:', request.url)
    console.log('🔐 API Register: Метод запроса:', request.method)
    
    const { email, password, full_name } = await request.json()
    console.log('📧 Email для регистрации:', email)

    if (!email || !password) {
      console.log('❌ API Register: Отсутствуют email или пароль')
      return NextResponse.json({ 
        success: false, 
        error: 'Email и пароль обязательны' 
      }, { status: 400 })
    }

    console.log('🔧 API Register: Создаем Supabase клиент')
    console.log('🔧 API Register: SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔧 API Register: SUPABASE_ANON_KEY существует:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('🔧 API Register: SUPABASE_ANON_KEY длина:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0)
    
    // Проверяем переменные окружения
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ API Register: Отсутствуют переменные окружения Supabase')
      return NextResponse.json({ 
        success: false, 
        error: 'Ошибка конфигурации сервера: отсутствуют переменные окружения Supabase',
        details: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 500 })
    }

    const supabase = createClient()

    console.log('🔑 API Register: Пытаемся зарегистрировать пользователя')
    console.log('🔑 API Register: Email:', email)
    console.log('🔑 API Register: Full name:', full_name)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || email.split('@')[0]
        }
      }
    })
    
    console.log('🔑 API Register: Результат signUp - data:', !!data)
    console.log('🔑 API Register: Результат signUp - error:', !!error)
    if (error) {
      console.log('🔑 API Register: Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      })
    }

    if (error) {
      console.error('❌ API Register: Ошибка регистрации:', error)
      console.error('❌ API Register: Код ошибки:', error.status)
      console.error('❌ API Register: Сообщение ошибки:', error.message)
      console.error('❌ API Register: Детали ошибки:', error)
      console.error('❌ API Register: Имя ошибки:', error.name)
      
      // Более детальная обработка ошибок
      let errorMessage = error.message || 'Ошибка регистрации'
      let statusCode = 400
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Пользователь с таким email уже зарегистрирован'
        statusCode = 409
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Пароль должен содержать минимум 6 символов'
        statusCode = 400
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Неверный формат email'
        statusCode = 400
      } else if (error.message.includes('fetch') || error.message.includes('fetch failed') || error.name === 'AuthRetryableFetchError') {
        errorMessage = 'Ошибка подключения к серверу аутентификации. Проверьте настройки Supabase.'
        statusCode = 500
      } else if (error.message.includes('Database error saving new user')) {
        errorMessage = 'Ошибка базы данных при создании пользователя. Проверьте настройки Supabase и RLS политики.'
        statusCode = 500
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage,
        details: {
          originalError: error.message,
          status: error.status,
          name: error.name,
          fullError: error
        }
      }, { status: statusCode })
    }

    if (!data.user) {
      console.log('❌ API Register: Пользователь не создан')
      return NextResponse.json({ 
        success: false, 
        error: 'Не удалось создать пользователя' 
      }, { status: 400 })
    }

    console.log('✅ API Register: Успешная регистрация для пользователя:', data.user.email)
    console.log('🔍 API Register: data.session:', data.session)
    console.log('🔍 API Register: access_token length:', data.session?.access_token?.length)
    console.log('🔍 API Register: refresh_token length:', data.session?.refresh_token?.length)
    
    // Создаем профиль пользователя в таблице profiles
    try {
      console.log('🔧 API Register: Создаем профиль пользователя')
      console.log('🔧 API Register: User ID:', data.user.id)
      console.log('🔧 API Register: User email:', data.user.email)
      
      // Сначала проверяем, существует ли уже профиль
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ API Register: Ошибка проверки существующего профиля:', checkError)
      }
      
      if (existingProfile) {
        console.log('⚠️ API Register: Профиль уже существует, обновляем')
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: data.user.email,
            full_name: full_name || data.user.user_metadata?.full_name || email.split('@')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)
        
        if (updateError) {
          console.error('❌ API Register: Ошибка обновления профиля:', updateError)
        } else {
          console.log('✅ API Register: Профиль пользователя обновлен успешно')
        }
               } else {
           console.log('🔧 API Register: Создаем новый профиль')
           const { error: profileError } = await supabase
             .from('profiles')
             .insert({
               id: data.user.id,
               email: data.user.email,
               full_name: full_name || data.user.user_metadata?.full_name || email.split('@')[0],
               created_at: new Date().toISOString(),
               updated_at: new Date().toISOString()
             })

           if (profileError) {
             console.error('❌ API Register: Ошибка создания профиля:', profileError)
             console.error('❌ API Register: Код ошибки профиля:', profileError.code)
             console.error('❌ API Register: Детали ошибки профиля:', profileError.details)
             // Не возвращаем ошибку, так как пользователь уже создан в Auth
             console.log('⚠️ API Register: Профиль не создан, но пользователь зарегистрирован')
                       } else {
              console.log('✅ API Register: Профиль пользователя создан успешно')
            }
          }
        } catch (profileError) {
          console.error('❌ API Register: Ошибка при создании профиля:', profileError)
          // Не возвращаем ошибку, так как пользователь уже создан в Auth
          console.log('⚠️ API Register: Профиль не создан, но пользователь зарегистрирован')
        }

    // Отправляем уведомление о новой регистрации
    try {
      console.log('📧 API Register: Отправляем уведомление о новой регистрации')
      const notificationEmail = createRegistrationNotificationEmail({
        email: data.user.email || email,
        full_name: full_name || data.user.user_metadata?.full_name || email.split('@')[0],
        created_at: new Date().toISOString()
      })

              const emailResult = await sendEmailResend({
        to: 'ivan@leovet24.ru',
        subject: notificationEmail.subject,
        html: notificationEmail.html
      })

      if (emailResult.success) {
        console.log('✅ API Register: Уведомление о регистрации отправлено успешно')
      } else {
        console.error('❌ API Register: Ошибка отправки уведомления:', emailResult.error)
        // Не возвращаем ошибку, так как регистрация прошла успешно
        console.log('⚠️ API Register: Уведомление не отправлено, но регистрация успешна')
      }
    } catch (emailError) {
      console.error('❌ API Register: Ошибка при отправке уведомления:', emailError)
      // Не возвращаем ошибку, так как регистрация прошла успешно
      console.log('⚠️ API Register: Уведомление не отправлено, но регистрация успешна')
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      },
      message: 'Регистрация успешна! Проверьте email для подтверждения.'
    })

  } catch (error: any) {
    console.error('❌ API Register: Неожиданная ошибка:', error)
    console.error('❌ API Register: Тип ошибки:', error.name)
    console.error('❌ API Register: Сообщение ошибки:', error.message)
    console.error('❌ API Register: Стек ошибки:', error.stack)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера',
      details: {
        type: error.name,
        message: error.message
      }
    }, { status: 500 })
  }
}
