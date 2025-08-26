import { NextResponse } from 'next/server'

// Google Sheets API конфигурация
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY
const SPREADSHEET_ID = '1ejjF77KXW5KEbGOrYrwxOKUfNhJWqdgeNbD8MgG6XqQ'

// Конфигурация таблиц базы знаний
const KNOWLEDGE_TABLES = {
  general_info: {
    name: 'Общая информация о клинике',
    priority: 1,
    description: 'Имя, контакты, стиль общения ИИ'
  },
  animals_breeds: {
    name: 'Виды и породы животных',
    priority: 2,
    description: 'Описания ключевых особенностей'
  },
  situations: {
    name: 'База симптомов и рекомендаций',
    priority: 3,
    description: 'Ядро системы - основная база знаний'
  },
  pricelist: {
    name: 'Прайс-лист услуг',
    priority: 4,
    description: 'Структурированный прайс-лист'
  },
  medications: {
    name: 'Справочник препаратов',
    priority: 5,
    description: 'Препараты и схемы применения'
  },
  intents: {
    name: 'База намерений пользователей',
    priority: 6,
    description: 'Для улучшения точности ИИ'
  },
  preventive_care: {
    name: 'Профилактический уход',
    priority: 7,
    description: 'Типовые регулярные процедуры'
  },
  faq: {
    name: 'Часто задаваемые вопросы',
    priority: 8,
    description: 'FAQ для быстрых ответов'
  },
  response_template: {
    name: 'Шаблоны ответов',
    priority: 9,
    description: 'Шаблоны для владельцев и администраторов'
  }
}

// Кэш для базы знаний
let knowledgeCache: any = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

async function loadTableData(tableName: string, apiKey: string, spreadsheetId: string) {
  const range = `${tableName}!A:Z`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
  
  console.log(`🔍 AI Knowledge: Загружаем таблицу ${tableName}...`)
  
  const response = await fetch(url)
  
  if (!response.ok) {
    console.warn(`⚠️ AI Knowledge: Не удалось загрузить таблицу ${tableName}:`, response.status)
    return null
  }

  const data = await response.json()
  
  if (!data.values || data.values.length === 0) {
    console.warn(`⚠️ AI Knowledge: Таблица ${tableName} пуста`)
    return null
  }

  // Преобразуем данные в нужный формат
  const headers = data.values[0]
  const rows = data.values.slice(1)
  
  return rows.map((row: any[], index: number) => {
    const record: any = {
      id: index + 1,
      code: `${tableName.toUpperCase()}_${index + 1}`,
      table: tableName,
      table_name: KNOWLEDGE_TABLES[tableName as keyof typeof KNOWLEDGE_TABLES]?.name || tableName
    }
    
    headers.forEach((header: string, colIndex: number) => {
      if (row[colIndex]) {
        const key = header.toLowerCase().replace(/\s+/g, '_')
        record[key] = row[colIndex]
      }
    })
    
    return record
  })
}

export async function GET() {
  try {
    if (!GOOGLE_SHEETS_API_KEY) {
      console.error('❌ AI Knowledge: GOOGLE_SHEETS_API_KEY не настроен')
      return NextResponse.json({ error: 'API ключ не настроен' }, { status: 500 })
    }

    console.log('🔍 AI Knowledge: Начало загрузки базы знаний из 9 таблиц')

    // Проверяем кэш
    const now = Date.now()
    if (knowledgeCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('🔍 AI Knowledge: Используем кэшированные данные')
      return NextResponse.json({
        success: true,
        knowledge: knowledgeCache,
        count: knowledgeCache.length,
        timestamp: new Date(cacheTimestamp).toISOString(),
        cached: true
      })
    }

    console.log('🔍 AI Knowledge: Загружаем данные из 9 таблиц Google Sheets...')
    console.log('🔍 AI Knowledge: Spreadsheet ID:', SPREADSHEET_ID)

    // Загружаем данные из всех таблиц параллельно
    const tablePromises = Object.keys(KNOWLEDGE_TABLES).map(tableName => 
      loadTableData(tableName, GOOGLE_SHEETS_API_KEY!, SPREADSHEET_ID)
    )
    
    const tableResults = await Promise.allSettled(tablePromises)
    
    // Объединяем результаты
    const allData: any[] = []
    const tableStats: any = {}
    
    tableResults.forEach((result, index) => {
      const tableName = Object.keys(KNOWLEDGE_TABLES)[index]
      
      if (result.status === 'fulfilled' && result.value) {
        allData.push(...result.value)
        tableStats[tableName] = result.value.length
        console.log(`✅ AI Knowledge: Таблица ${tableName} - ${result.value.length} записей`)
      } else {
        tableStats[tableName] = 0
        console.warn(`⚠️ AI Knowledge: Таблица ${tableName} - ошибка загрузки`)
      }
    })

    // Сортируем по приоритету таблиц
    allData.sort((a, b) => {
      const priorityA = KNOWLEDGE_TABLES[a.table as keyof typeof KNOWLEDGE_TABLES]?.priority || 999
      const priorityB = KNOWLEDGE_TABLES[b.table as keyof typeof KNOWLEDGE_TABLES]?.priority || 999
      return priorityA - priorityB
    })

    // Обновляем кэш
    knowledgeCache = allData
    cacheTimestamp = now

    console.log(`✅ AI Knowledge: Загружено ${allData.length} записей из ${Object.keys(tableStats).length} таблиц`)
    console.log('📊 AI Knowledge: Статистика по таблицам:', tableStats)
    
    return NextResponse.json({
      success: true,
      knowledge: allData,
      count: allData.length,
      table_stats: tableStats,
      tables_config: KNOWLEDGE_TABLES,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ AI Knowledge: Ошибка загрузки базы знаний:', error)
    return NextResponse.json({ 
      error: 'Ошибка загрузки базы знаний',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  }
}
