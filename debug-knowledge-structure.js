// Скрипт для отладки структуры базы знаний
// Выполните в браузере на странице AI консультанта

// Функция для получения структуры базы знаний
async function debugKnowledgeStructure() {
  try {
    console.log('🔍 Debug: Загружаем структуру базы знаний...')
    
    const response = await fetch('/api/ai/knowledge')
    const data = await response.json()
    
    if (data.success && data.knowledge) {
      console.log('📊 Debug: Общая статистика:', {
        totalRecords: data.knowledge.length,
        tableStats: data.table_stats,
        tablesConfig: data.tables_config
      })
      
      // Группируем записи по таблицам
      const tableGroups = {}
      data.knowledge.forEach(record => {
        const table = record.table
        if (!tableGroups[table]) {
          tableGroups[table] = []
        }
        tableGroups[table].push(record)
      })
      
      // Анализируем каждую таблицу
      Object.keys(tableGroups).forEach(tableName => {
        const records = tableGroups[tableName]
        console.log(`\n📋 Debug: Таблица "${tableName}" (${records.length} записей):`)
        
        if (records.length > 0) {
          const firstRecord = records[0]
          console.log('🔍 Debug: Поля первой записи:', Object.keys(firstRecord))
          console.log('🔍 Debug: Пример записи:', firstRecord)
          
          // Ищем поля, которые могут быть заголовками
          const possibleTitleFields = Object.keys(firstRecord).filter(field => 
            field.toLowerCase().includes('name') || 
            field.toLowerCase().includes('title') || 
            field.toLowerCase().includes('заголовок') || 
            field.toLowerCase().includes('название') ||
            field.toLowerCase().includes('вопрос') ||
            field.toLowerCase().includes('симптом') ||
            field.toLowerCase().includes('услуга') ||
            field.toLowerCase().includes('процедура')
          )
          
          console.log('🎯 Debug: Возможные поля заголовков:', possibleTitleFields)
          
          // Проверяем, какие поля заполнены
          const filledFields = Object.keys(firstRecord).filter(field => 
            firstRecord[field] && firstRecord[field].toString().trim() !== ''
          )
          console.log('✅ Debug: Заполненные поля:', filledFields)
        }
      })
      
      return data
    } else {
      console.error('❌ Debug: Ошибка загрузки базы знаний:', data.error)
    }
  } catch (error) {
    console.error('❌ Debug: Ошибка:', error)
  }
}

// Функция для тестирования поиска
async function testSearch(query) {
  try {
    console.log(`🔍 Debug: Тестируем поиск для запроса: "${query}"`)
    
    const response = await fetch('/api/ai/consultation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`
      },
      body: JSON.stringify({
        message: query,
        sessionId: 'debug-session'
      })
    })
    
    const data = await response.json()
    
    if (data.sources) {
      console.log('📋 Debug: Найденные источники:', data.sources)
    }
    
    if (data.context) {
      console.log('🔍 Debug: Контекст ответа:', data.context)
    }
    
    return data
  } catch (error) {
    console.error('❌ Debug: Ошибка тестирования поиска:', error)
  }
}

// Запускаем отладку
console.log('🚀 Debug: Запускаем отладку базы знаний...')
debugKnowledgeStructure().then(() => {
  console.log('✅ Debug: Отладка завершена. Теперь можете вызвать testSearch("ваш запрос") для тестирования поиска.')
})
