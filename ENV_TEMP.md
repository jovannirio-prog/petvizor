# ВАЖНО: Создайте файл .env.local

Для работы приложения необходимо создать файл `.env.local` в корневой папке проекта со следующим содержимым:

```env
# OpenAI API Configuration
# Получите ключ на https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
# Получите URL и ключи на https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Другие переменные окружения (опционально)
NEXT_PUBLIC_APP_NAME=PetVizor
```

## Для быстрого тестирования (без Supabase):

Если вы хотите просто посмотреть на интерфейс без настройки Supabase, используйте:

```env
# Временные значения для тестирования
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example
OPENAI_API_KEY=sk-example
NEXT_PUBLIC_APP_NAME=PetVizor
```

После создания файла перезапустите сервер: `npm run dev`
