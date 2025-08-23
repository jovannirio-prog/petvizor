import { NextResponse } from 'next/server'

// Google Sheets API конфигурация
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY
const SPREADSHEET_ID = '1ejjF77KXW5KEbGOrYrwxOKUfNhJWqdgeNbD8MgG6XqQ'
const SHEET_NAME = 'KB LeoVet'

export async function GET() {
  try {
    if (!GOOGLE_SHEETS_API_KEY) {
      console.error('❌ AI Knowledge: GOOGLE_SHEETS_API_KEY не настроен')
      return NextResponse.json({ error: 'API ключ не настроен' }, { status: 500 })
    }

    console.log('🔍 AI Knowledge: Получение базы знаний из Google Sheets')

    // Получаем данные из Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${GOOGLE_SHEETS_API_KEY}`
    )

    if (!response.ok) {
      console.error('❌ AI Knowledge: Ошибка получения данных из Google Sheets:', response.status)
      return NextResponse.json({ error: 'Ошибка получения базы знаний' }, { status: 500 })
    }

    const data = await response.json()
    
    if (!data.values || data.values.length === 0) {
      console.log('⚠️ AI Knowledge: База знаний пуста')
      return NextResponse.json({ knowledge: [] })
    }

    // Преобразуем данные в структурированный формат
    const headers = data.values[0]
    const rows = data.values.slice(1)
    
    const knowledge = rows.map((row: any[]) => {
      const item: any = {}
      headers.forEach((header: string, index: number) => {
        item[header] = row[index] || ''
      })
      return item
    })

    console.log('✅ AI Knowledge: База знаний получена:', knowledge.length, 'записей')

    return NextResponse.json({ knowledge })
  } catch (error) {
    console.error('❌ AI Knowledge: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
