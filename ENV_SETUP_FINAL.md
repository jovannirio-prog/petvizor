# 🚀 Настройка переменных окружения для Petvizor

## 1. Создайте файл .env.local

Создайте файл `.env.local` в корневой папке проекта (там же, где `package.json`):

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_NAME=PetVizor
```

## 2. Получите ключи API

### OpenAI API Key:
1. Зайдите на https://platform.openai.com/api-keys
2. Создайте новый API ключ
3. Скопируйте его в `OPENAI_API_KEY`

### Supabase Keys:
1. Зайдите на https://supabase.com/dashboard
2. Создайте новый проект или выберите существующий
3. Перейдите в Settings → API
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (для сохранения сообщений)

## 3. Настройте базу данных Supabase

После создания проекта Supabase:

1. Перейдите в **SQL Editor**
2. Выполните SQL-скрипт из файла `supabase-setup.sql`
3. Или скопируйте содержимое этого файла в редактор

## 4. Перезапустите сервер

```bash
npm run dev
```

## 5. Проверьте работу

Откройте http://localhost:3003 и проверьте:
- Регистрацию/вход пользователей
- Сохранение сообщений в базе данных
- Работу AI-чата

---

**Примечание:** Если у вас нет ключей API, приложение будет работать в демо-режиме без сохранения данных.
