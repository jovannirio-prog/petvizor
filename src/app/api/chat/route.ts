import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Создаем клиент Supabase с сервисным ключом для серверных операций
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Сообщение не предоставлено' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API ключ не настроен' },
        { status: 500 }
      )
    }

    const systemPrompt = `Ты - Petvizor AI, умный помощник для владельцев домашних животных. 
    Ты помогаешь с вопросами о здоровье, уходе, питании и поведении питомцев.
    Отвечай дружелюбно и профессионально, давай практичные советы.
    Если вопрос не связан с домашними животными, вежливо напомни, что ты специализируешься на помощи с питомцами.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'Не удалось получить ответ от AI' },
        { status: 500 }
      )
    }

    // Сохраняем сообщение в базу данных, если Supabase настроен
    if (supabase && userId) {
      try {
        const { error: dbError } = await supabase
          .from('chat_messages')
          .insert({
            user_id: userId,
            message: message,
            response: response,
            created_at: new Date().toISOString()
          })

        if (dbError) {
          console.warn('Failed to save message to database:', dbError)
        }
      } catch (dbError) {
        console.warn('Database save error:', dbError)
      }
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      model: 'gpt-3.5-turbo'
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
