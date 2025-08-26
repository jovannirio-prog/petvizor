import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Google Sheets API конфигурация
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SPREADSHEET_ID = '1ejjF77KXW5KEbGOrYrwxOKUfNhJWqdgeNbD8MgG6XqQ'

// Конфигурация таблиц базы знаний
const KNOWLEDGE_TABLES = {
  general_info: {
    name: 'Общая информация о клинике',
    priority: 1,
    description: 'Имя, контакты, стиль общения ИИ'
  },
  situations: {
    name: 'База симптомов и рекомендаций',
    priority: 2,
    description: 'Ядро системы - основная база знаний'
  },
  animals_breeds: {
    name: 'Виды и породы животных',
    priority: 3,
    description: 'Описания ключевых особенностей'
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
  preventive_care: {
    name: 'Профилактический уход',
    priority: 6,
    description: 'Типовые регулярные процедуры'
  },
  faq: {
    name: 'Часто задаваемые вопросы',
    priority: 7,
    description: 'FAQ для быстрых ответов'
  },
  response_template: {
    name: 'Шаблоны ответов',
    priority: 8,
    description: 'Шаблоны для владельцев и администраторов'
  },
  intents: {
    name: 'База намерений пользователей',
    priority: 9,
    description: 'Для улучшения точности ИИ'
  }
}

// Кэш для базы знаний (обновляется каждые 5 минут)
let knowledgeBaseCache: any[] = []
let lastCacheUpdate = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут в миллисекундах

export async function POST(request: Request) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization')
    let supabase
    let user
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Используем Bearer токен
      const token = authHeader.replace('Bearer ', '')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      supabase = createClient(supabaseUrl, serviceRoleKey)
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
      if (authError || !authUser) {
        console.log('🔒 AI Consultation: Пользователь не аутентифицирован (Bearer)')
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
      }
      user = authUser
    } else {
      // Используем cookies (для обратной совместимости)
      supabase = createRouteHandlerClient({ cookies })
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        console.log('🔒 AI Consultation: Пользователь не аутентифицирован (cookies)')
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
      }
      user = authUser
    }
    
    // Проверяем, что пользователь получен
    if (!user) {
      console.log('🔒 AI Consultation: Пользователь не аутентифицирован')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Получаем данные запроса
    const { message, petInfo, sessionId, conversationHistory: clientHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Сообщение обязательно' }, { status: 400 })
    }

    console.log('🔍 AI Consultation: Информация о питомце:', petInfo ? 'Выбран питомец' : 'Питомец не выбран')

    console.log('🔍 AI Consultation: Запрос от пользователя:', user.email, 'Сообщение:', message)

    // Получаем профиль пользователя для определения роли
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        role_id,
        user_roles (
          name,
          display_name
        )
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log('⚠️ AI Consultation: Профиль не найден, используем роль по умолчанию')
    }

    const userRole = (profile?.user_roles as any)?.name || 'owner'
    console.log('🔍 AI Consultation: Роль пользователя:', userRole)

    // Используем историю диалога с клиента, если она есть, иначе пытаемся загрузить из БД
    let conversationHistory: Array<{role: string, content: string}> = []
    
    if (clientHistory && Array.isArray(clientHistory) && clientHistory.length > 0) {
      // Используем историю с клиента
      conversationHistory = clientHistory
      console.log('🔍 AI Consultation: Используем историю с клиента, сообщений:', clientHistory.length)
    } else {
      // Пытаемся загрузить из БД (временно упрощено из-за проблем с БД)
      try {
        const { data: history } = await supabase
          .from('chat_messages')
          .select('message, response, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(10) // Последние 10 сообщений для контекста

        if (history && history.length > 0) {
          conversationHistory = history.map(msg => ({
            role: 'user',
            content: msg.message
          })).concat(history.map(msg => ({
            role: 'assistant',
            content: msg.response
          })))
          console.log('🔍 AI Consultation: Загружено сообщений из БД:', history.length)
        } else {
          console.log('🔍 AI Consultation: История сообщений пуста')
        }
      } catch (error) {
        console.log('⚠️ AI Consultation: Ошибка загрузки истории, продолжаем без контекста:', error)
      }
    }

    // Получаем базу знаний (с кэшированием)
    let knowledgeBase = []
    const now = Date.now()
    
    // Проверяем кэш
    if (knowledgeBaseCache.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION) {
      knowledgeBase = knowledgeBaseCache
      console.log('🔍 AI Consultation: Используем кэшированную базу знаний, записей:', knowledgeBase.length)
    } else {
      console.log('🔍 AI Consultation: Начинаем загрузку базы знаний...')
      console.log('🔍 AI Consultation: GOOGLE_SHEETS_API_KEY:', GOOGLE_SHEETS_API_KEY ? 'Настроен' : 'НЕ НАСТРОЕН')
      console.log('🔍 AI Consultation: SPREADSHEET_ID:', SPREADSHEET_ID)
      console.log('🔍 AI Consultation: Таблицы:', Object.keys(KNOWLEDGE_TABLES))
    
    // Временная база знаний (если Google Sheets недоступен)
    if (!GOOGLE_SHEETS_API_KEY) {
      console.log('🔍 AI Consultation: Используем временную базу знаний')
      knowledgeBase = [
        {
          'Тема': 'Вакцинация',
          'Описание': 'Вакцинация - это профилактическая мера для защиты животных от инфекционных заболеваний. Включает введение ослабленных или убитых возбудителей болезней для выработки иммунитета.',
          'Рекомендации': 'Проводить вакцинацию по графику, рекомендованному ветеринаром. Основные вакцины: от бешенства, чумы, парвовируса.'
        },
        {
          'Тема': 'Отравление у кошек',
          'Описание': 'Отравление - это состояние, вызванное попаданием в организм токсичных веществ. Может быть острым или хроническим.',
          'Рекомендации': 'При подозрении на отравление немедленно обратиться к ветеринару. Не вызывать рвоту самостоятельно. Сохранить образец токсина.'
        },
        {
          'Тема': 'Протокол приема экстренных пациентов',
          'Описание': 'Стандартная процедура приема животных в критическом состоянии.',
          'Рекомендации': '1. Немедленная оценка состояния 2. Стабилизация жизненных функций 3. Диагностика 4. Лечение 5. Мониторинг'
        }
      ]
    } else if (GOOGLE_SHEETS_API_KEY) {
      // Загружаем данные из всех таблиц параллельно
      console.log('🔍 AI Consultation: Загружаем данные из 9 таблиц Google Sheets...')
      
      const tablePromises = Object.keys(KNOWLEDGE_TABLES).map(async (tableName) => {
        try {
          const range = `${tableName}!A:Z`
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`
          
          console.log(`🔍 AI Consultation: Загружаем таблицу ${tableName}...`)
          
          const response = await fetch(url)
          
          if (!response.ok) {
            console.warn(`⚠️ AI Consultation: Не удалось загрузить таблицу ${tableName}:`, response.status)
            return null
          }

          const data = await response.json()
          
          if (!data.values || data.values.length === 0) {
            console.warn(`⚠️ AI Consultation: Таблица ${tableName} пуста`)
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
        } catch (error) {
          console.warn(`⚠️ AI Consultation: Ошибка загрузки таблицы ${tableName}:`, error)
          return null
        }
      })
      
      const tableResults = await Promise.allSettled(tablePromises)
      
      // Объединяем результаты
      const allData: any[] = []
      const tableStats: any = {}
      
      tableResults.forEach((result, index) => {
        const tableName = Object.keys(KNOWLEDGE_TABLES)[index]
        
        if (result.status === 'fulfilled' && result.value) {
          allData.push(...result.value)
          tableStats[tableName] = result.value.length
          console.log(`✅ AI Consultation: Таблица ${tableName} - ${result.value.length} записей`)
        } else {
          tableStats[tableName] = 0
          console.warn(`⚠️ AI Consultation: Таблица ${tableName} - ошибка загрузки`)
        }
      })

      // Сортируем по приоритету таблиц
      allData.sort((a, b) => {
        const priorityA = KNOWLEDGE_TABLES[a.table as keyof typeof KNOWLEDGE_TABLES]?.priority || 999
        const priorityB = KNOWLEDGE_TABLES[b.table as keyof typeof KNOWLEDGE_TABLES]?.priority || 999
        return priorityA - priorityB
      })

      knowledgeBase = allData
      console.log(`✅ AI Consultation: Загружено ${allData.length} записей из ${Object.keys(tableStats).length} таблиц`)
      console.log('📊 AI Consultation: Статистика по таблицам:', tableStats)
      
      // Обновляем кэш
      knowledgeBaseCache = knowledgeBase
      lastCacheUpdate = now
      console.log('🔍 AI Consultation: Кэш базы знаний обновлен, записей:', knowledgeBase.length)
    } else {
      console.log('⚠️ AI Consultation: GOOGLE_SHEETS_API_KEY не настроен, база знаний недоступна')
    }
    }

    // Ищем релевантную информацию в базе знаний
    console.log('🔍 AI Consultation: Ищем релевантную информацию для запроса:', message)
    const relevantKnowledge = searchKnowledgeBase(message, knowledgeBase)
    console.log('🔍 AI Consultation: Найдено релевантных записей:', relevantKnowledge.length)
    if (relevantKnowledge.length > 0) {
      console.log('🔍 AI Consultation: Релевантные записи:', JSON.stringify(relevantKnowledge, null, 2))
    }

    // Формируем системный промпт в зависимости от роли
    const systemPrompt = generateSystemPrompt(userRole, relevantKnowledge, petInfo, conversationHistory)

    // Генерируем ответ через OpenAI API
    const aiResponse = await generateAIResponse(systemPrompt, message, conversationHistory)

         // Сохраняем сообщение в базу данных для истории
         try {
           const { error: saveError } = await supabase
             .from('chat_messages')
             .insert({
               user_id: user.id,
               message: message,
               response: aiResponse,
               session_id: sessionId || `session_${Date.now()}`,
               created_at: new Date().toISOString()
             })
           
           if (saveError) {
             console.error('⚠️ AI Consultation: Ошибка сохранения в БД:', saveError)
             // Не прерываем выполнение, если сохранение не удалось
           } else {
             console.log('✅ AI Consultation: Сообщение сохранено в БД')
           }
         } catch (saveError) {
           console.error('⚠️ AI Consultation: Ошибка сохранения в БД:', saveError)
           // Не прерываем выполнение, если сохранение не удалось
         }

    console.log('✅ AI Consultation: Ответ сгенерирован')
    console.log('🔍 AI Consultation: Проверяем relevantKnowledge:', relevantKnowledge)
    console.log('🔍 AI Consultation: Начинаем формирование источников, relevantKnowledge.length:', relevantKnowledge.length)

    // Формируем список кодов использованных записей с заголовками
    const usedRecordCodes = relevantKnowledge.map(record => {
      const code = record.code || 'Unknown'
      const tableName = record.table_name || record.table || 'Unknown'
      
      // Определяем заголовок в зависимости от таблицы
      let title = 'Без названия'
      
      switch (record.table) {
        case 'pricelist':
          title = record.service_name || record.услуга || record.name || record.название || 'Услуга'
          break
        case 'situations':
          title = record.user_query || record.symptom || record.симптом || record.question || record.вопрос || 'Ситуация'
          break
        case 'faq':
          title = record.question || record.вопрос || record.name || record.название || 'Вопрос'
          break
        case 'medications':
          title = record.name || record.название || record.medication_name || record.препарат || 'Препарат'
          break
        case 'animals_breeds':
          title = record.breed || record.порода || record.species || record.вид || 'Порода'
          break
        case 'preventive_care':
          title = record.procedure_name || record.процедура || record.name || record.название || 'Процедура'
          break
        case 'intents':
          title = record.intent || record.намерение || record.name || record.название || 'Намерение'
          break
        case 'response_template':
          title = record.template_name || record.шаблон || record.name || record.название || 'Шаблон'
          break
        case 'general_info':
          title = record.clinic_name || record.клиника || record.name || record.название || 'Информация'
          break
        default:
          // Ищем заголовок в различных полях
          title = record.title || record.заголовок || record.name || record.название || 
                 record.symptom || record.симптом || record.question || record.вопрос || 
                 record.service || record.услуга || 'Без названия'
      }
      
      // Если заголовок пустой или содержит только пробелы, используем код
      if (!title || title.trim() === '' || title === 'Без названия') {
        title = `${record.table || 'Unknown'} запись ${record.id || 'Unknown'}`
      }
      
      console.log('🔍 AI Consultation: Формируем источник:', { 
        code, 
        tableName,
        title, 
        table: record.table,
        availableFields: Object.keys(record)
      })
      return `${code} (${tableName}): ${title}`
    }).join('\n')
    
    console.log('🔍 AI Consultation: Сформированные источники:', usedRecordCodes)
    console.log('🔍 AI Consultation: Отправляем ответ с sources:', relevantKnowledge.length > 0 ? usedRecordCodes : null)
    
    return NextResponse.json({ 
      response: aiResponse,
      sessionId: sessionId || `session_${Date.now()}`,
      sources: relevantKnowledge.length > 0 ? usedRecordCodes : null,
      context: {
        userRole: userRole,
        knowledgeBaseSize: knowledgeBase.length,
        relevantKnowledgeFound: relevantKnowledge.length,
        usedRecordCodes: usedRecordCodes
      }
    })

  } catch (error) {
    console.error('❌ AI Consultation: Неожиданная ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// Функция поиска в базе знаний
function searchKnowledgeBase(query: string, knowledgeBase: any[]): any[] {
  console.log('🔍 AI Consultation: Поиск в базе знаний для запроса:', query)
  console.log('🔍 AI Consultation: Размер базы знаний:', knowledgeBase.length)
  
  if (knowledgeBase.length === 0) {
    console.log('⚠️ AI Consultation: База знаний пуста')
    return []
  }
  
  const queryLower = query.toLowerCase()
  const keywords = queryLower.split(' ').filter(word => word.length > 2)
  console.log('🔍 AI Consultation: Ключевые слова для поиска:', keywords)
  
  // Создаем массив с оценкой релевантности для каждой записи
  const scoredResults = knowledgeBase.map(item => {
    let score = 0
    const itemText = Object.values(item).join(' ').toLowerCase()
    
    // Определяем приоритетные поля для поиска в зависимости от таблицы
    const priorityFields = getPriorityFields(item.table)
    
    // Подсчитываем количество совпадений ключевых слов
    keywords.forEach(keyword => {
      // Базовые очки за любое совпадение
      if (itemText.includes(keyword)) {
        score += 1
      }
      
      // Дополнительные очки за совпадения в приоритетных полях
      priorityFields.forEach(field => {
        if (item[field] && item[field].toString().toLowerCase().includes(keyword)) {
          score += 5 // Высокий приоритет для точных совпадений
        }
      })
      
      // Специальные очки за совпадения в ключевых словах
      if (item.keywords && item.keywords.toLowerCase().includes(keyword)) {
        score += 3
      }
      if (item.intent_keywords && item.intent_keywords.toLowerCase().includes(keyword)) {
        score += 3
      }
      if (item.faq_keywords && item.faq_keywords.toLowerCase().includes(keyword)) {
        score += 3
      }
    })
    
    // Бонусные очки за точные совпадения названий услуг
    if (item.table === 'pricelist' && item.service_name) {
      const serviceName = item.service_name.toLowerCase()
      if (queryLower.includes(serviceName) || serviceName.includes(queryLower)) {
        score += 10 // Максимальный приоритет для точных совпадений услуг
      }
    }
    
    // Бонусные очки за совпадения в вопросах FAQ
    if (item.table === 'faq' && item.question_text) {
      const questionText = item.question_text.toLowerCase()
      if (queryLower.includes(questionText) || questionText.includes(queryLower)) {
        score += 8
      }
    }
    
    // Бонусные очки за совпадения в симптомах
    if (item.table === 'situations' && item.user_query) {
      const userQuery = item.user_query.toLowerCase()
      if (queryLower.includes(userQuery) || userQuery.includes(queryLower)) {
        score += 8
      }
    }
    
    return { item, score }
  })
  
  // Фильтруем записи с совпадениями и сортируем по релевантности
  const results = scoredResults
    .filter(result => result.score > 0)
    .sort((a, b) => {
      // Сначала по релевантности
      if (b.score !== a.score) {
        return b.score - a.score
      }
      // При равной релевантности приоритет по таблицам
      const priorityA = getTablePriority(a.item.table)
      const priorityB = getTablePriority(b.item.table)
      return priorityA - priorityB
    })
    .slice(0, 8) // Увеличиваем количество результатов для лучшего выбора
    .map(result => result.item)
  
  // Логируем найденные совпадения
  if (results.length > 0) {
    console.log('🔍 AI Consultation: Найдено совпадений:', results.length)
    results.forEach((item, index) => {
      const title = getItemTitle(item)
      console.log(`🔍 AI Consultation: Совпадение ${index + 1} (${item.table}): ${title}`)
    })
  }
  
  console.log('🔍 AI Consultation: Итоговое количество найденных записей:', results.length)
  return results
}

// Функция для определения приоритетных полей поиска
function getPriorityFields(table: string): string[] {
  switch (table) {
    case 'pricelist':
      return ['service_name', 'service_category', 'service_description']
    case 'situations':
      return ['user_query', 'symptom', 'keywords']
    case 'faq':
      return ['question_text', 'answer_text', 'faq_category']
    case 'medications':
      return ['medication_name', 'active_ingredient', 'indications']
    case 'animals_breeds':
      return ['breed', 'species', 'characteristics']
    case 'preventive_care':
      return ['procedure_name', 'procedure_description']
    case 'intents':
      return ['intent_name', 'intent_keywords']
    case 'response_template':
      return ['template_name', 'situation_type']
    case 'general_info':
      return ['clinic_name', 'ai_style']
    default:
      return ['name', 'title', 'description']
  }
}

// Функция для определения приоритета таблиц
function getTablePriority(table: string): number {
  const priorities = {
    'pricelist': 1,      // Высший приоритет для цен
    'situations': 2,     // Высокий приоритет для симптомов
    'faq': 3,           // Средний приоритет для FAQ
    'medications': 4,    // Средний приоритет для препаратов
    'preventive_care': 5, // Низкий приоритет для профилактики
    'animals_breeds': 6,  // Низкий приоритет для пород
    'intents': 7,        // Очень низкий приоритет для намерений
    'response_template': 8, // Очень низкий приоритет для шаблонов
    'general_info': 9    // Самый низкий приоритет для общей информации
  }
  return priorities[table as keyof typeof priorities] || 10
}

// Функция для получения заголовка записи
function getItemTitle(item: any): string {
  switch (item.table) {
    case 'pricelist':
      return item.service_name || 'Услуга'
    case 'situations':
      return item.user_query || item.symptom || 'Ситуация'
    case 'faq':
      return item.question_text || 'Вопрос'
    case 'medications':
      return item.medication_name || 'Препарат'
    case 'animals_breeds':
      return item.breed || 'Порода'
    case 'preventive_care':
      return item.procedure_name || 'Процедура'
    case 'intents':
      return item.intent_name || 'Намерение'
    case 'response_template':
      return item.template_name || 'Шаблон'
    case 'general_info':
      return item.clinic_name || 'Информация'
    default:
      return item.name || item.title || 'Запись'
  }
}

// Генерация системного промпта в зависимости от роли
function generateSystemPrompt(userRole: string, relevantKnowledge: any[], petInfo: any, conversationHistory: Array<{role: string, content: string}>): string {
  const roleDescriptions = {
    owner: 'Владелец питомца - отвечай простым языком, без медицинского жаргона, с эмпатией',
    admin: 'Администратор системы - профессионально, с полным доступом ко всем данным',
    clinic_admin: 'Администратор ветклиники - ты работаешь в ветклинике и помогаешь администраторам с вопросами по работе клиники, приему клиентов, записи на приемы, протоколам работы, управлению персоналом и другими административными задачами. Отвечай профессионально, с пониманием специфики работы ветклиники.',
    clinic_vet: 'Ветеринарный врач - профессионально, с медицинской терминологией',
    knowledge: 'Редактор базы знаний - с акцентом на точность и источники информации',
    breeder: 'Заводчик - с учетом специфики разведения и генетики',
    shelter: 'Приют/Волонтер - с акцентом на доступность и практичность',
    partner: 'Коммерческий партнер - профессионально, с учетом бизнес-аспектов'
  }

  const roleDesc = roleDescriptions[userRole as keyof typeof roleDescriptions] || roleDescriptions.owner

  let prompt = `Ты — ИИ-консультант ветклиники LeoVet. ${roleDesc}.

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
1. ПРИОРИТЕТ БАЗЫ ЗНАНИЙ LEOVET - используй ТОЛЬКО информацию из предоставленной базы знаний
2. НЕ ИЗОБРЕТАЙ информацию - если чего-то нет в базе, честно скажи "Информации об этом нет в базе знаний"
3. ПРИ ВОПРОСАХ О ЦЕНАХ - используй ТОЛЬКО данные из таблицы pricelist
4. ПРИ ВОПРОСАХ О СИМПТОМАХ - используй ТОЛЬКО данные из таблицы situations
5. ПРИ ВОПРОСАХ О ПРЕПАРАТАХ - используй ТОЛЬКО данные из таблицы medications
6. ВСЕГДА ПРОВЕРЯЙ актуальность информации перед ответом
7. ЕСЛИ пользователь поправляет тебя - ЗАПОМНИ это исправление и используй в будущем
8. КОНТЕКСТ РАЗГОВОРА - анализируй всю историю диалога для понимания контекста

ОБЩИЕ ПРАВИЛА:
- Отвечай кратко и по делу
- Учитывай роль пользователя при ответе
- Если вопрос не связан с ветеринарией, вежливо перенаправь к специалисту
- При экстренных случаях давай четкие инструкции и рекомендуй срочное обращение к врачу
- ВАЖНО: Помни весь контекст разговора и ссылайся на предыдущие сообщения
- Если пользователь спрашивает "помнишь ли ты...", отвечай на основе истории диалога

${userRole === 'clinic_admin' ? `
СПЕЦИАЛЬНЫЕ ПРАВИЛА ДЛЯ АДМИНИСТРАТОРА ВЕТКЛИНИКИ:
- Ты работаешь в ветклинике LeoVet и помогаешь администраторам
- Ты знаешь протоколы работы клиники, процедуры приема клиентов
- Ты можешь давать советы по управлению персоналом, записи на приемы
- Ты понимаешь специфику работы ветеринарной клиники
- Отвечай как коллега-администратор, который знает все тонкости работы
` : ''}

РЕЛЕВАНТНАЯ ИНФОРМАЦИЯ ИЗ БАЗЫ ЗНАНИЙ LEOVET:
${relevantKnowledge.length > 0 
  ? relevantKnowledge.map((item, index) => 
      `${index + 1}. ${Object.entries(item)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')}`
    ).join('\n')
  : 'Релевантной информации в базе знаний не найдено'
}

ВАЖНО: НЕ упоминай в ответе количество источников или коды записей - это будет добавлено автоматически.

${petInfo ? `ИНФОРМАЦИЯ О ПИТОМЦЕ: ${JSON.stringify(petInfo)}` : 'ИНФОРМАЦИЯ О ПИТОМЦЕ: Питомец не выбран. Отвечай в общем, но можешь попросить уточнить информацию о питомце для более точного ответа.'}

${conversationHistory.length > 0 ? `
ИСТОРИЯ ДИАЛОГА (для контекста):
${conversationHistory.map((msg, index) => `${index + 1}. ${msg.role}: ${msg.content}`).join('\n')}
` : 'ИСТОРИЯ ДИАЛОГА: Это начало разговора'}

РОЛЬ ПОЛЬЗОВАТЕЛЯ: ${userRole === 'clinic_admin' ? 'Администратор ветклиники LeoVet' : userRole}

Вопрос пользователя: `

  return prompt
}

// Функция генерации ответа через OpenAI API
async function generateAIResponse(systemPrompt: string, userMessage: string, conversationHistory: any[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.log('⚠️ AI Consultation: OPENAI_API_KEY не настроен, используем заглушку')
    return generateFallbackResponse(userMessage)
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error('❌ AI Consultation: Ошибка OpenAI API:', response.status)
      return generateFallbackResponse(userMessage)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || generateFallbackResponse(userMessage)

  } catch (error) {
    console.error('❌ AI Consultation: Ошибка запроса к OpenAI:', error)
    return generateFallbackResponse(userMessage)
  }
}

// Заглушка для случаев когда OpenAI недоступен
function generateFallbackResponse(userMessage: string): string {
  const responses = [
    "Спасибо за ваш вопрос! Основываясь на базе знаний LeoVet, могу сказать, что это важная тема для обсуждения с ветеринарным врачом.",
    "Согласно регламентам LeoVet, рекомендую обратиться к специалисту для получения точной консультации по данному вопросу.",
    "В базе знаний LeoVet есть информация по подобным случаям. Рекомендую записаться на прием к ветеринарному врачу для детального обследования.",
    "Этот вопрос требует индивидуального подхода. Пожалуйста, обратитесь в ветклинику LeoVet для получения профессиональной консультации.",
    "Спасибо за обращение! Для получения точной информации по вашему вопросу, пожалуйста, свяжитесь с администратором ветклиники LeoVet."
  ]

  const responseIndex = userMessage.length % responses.length
  return responses[responseIndex]
}
