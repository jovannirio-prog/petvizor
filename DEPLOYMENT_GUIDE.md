# 🚀 Руководство по деплою Petvizor на Vercel

## 📋 Предварительные требования

1. **GitHub аккаунт** - для хранения кода
2. **Vercel аккаунт** - для деплоя (можно войти через GitHub)
3. **Supabase проект** - для базы данных
4. **OpenAI API ключ** - для AI-функциональности

## 🔧 Шаг 1: Подготовка кода

### 1.1 Убедитесь, что все файлы добавлены в Git

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Проверьте, что проект собирается локально

```bash
npm run build
```

## 🌐 Шаг 2: Настройка Vercel

### 2.1 Создайте аккаунт на Vercel

1. Зайдите на https://vercel.com
2. Войдите через GitHub
3. Нажмите "New Project"

### 2.2 Импортируйте проект

1. Выберите ваш GitHub репозиторий
2. Vercel автоматически определит, что это Next.js проект
3. Нажмите "Deploy"

## 🔑 Шаг 3: Настройка переменных окружения

### 3.1 В Vercel Dashboard

1. Перейдите в ваш проект
2. Откройте вкладку "Settings"
3. Выберите "Environment Variables"
4. Добавьте следующие переменные:

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

### 3.2 Важные моменты:

- **NEXT_PUBLIC_** переменные доступны в браузере
- **SUPABASE_SERVICE_ROLE_KEY** должен быть скрыт (без NEXT_PUBLIC_)
- Установите переменные для всех окружений (Production, Preview, Development)

## 🗄️ Шаг 4: Настройка Supabase

### 4.1 Создайте проект Supabase

1. Зайдите на https://supabase.com/dashboard
2. Создайте новый проект
3. Дождитесь завершения инициализации

### 4.2 Получите ключи API

1. Перейдите в Settings → API
2. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 Настройте базу данных

1. Перейдите в SQL Editor
2. Выполните SQL-скрипт из файла `supabase-setup.sql`

### 4.4 Настройте аутентификацию

1. Перейдите в Authentication → Settings
2. Добавьте ваш домен Vercel в "Site URL"
3. Добавьте домен в "Redirect URLs": `https://your-app.vercel.app/auth/callback`

## 🔄 Шаг 5: Деплой

### 5.1 Автоматический деплой

После настройки переменных окружения:
1. Vercel автоматически пересоберет проект
2. Новый деплой будет доступен по ссылке

### 5.2 Ручной деплой

Если нужно запустить деплой вручную:
1. Перейдите в "Deployments"
2. Нажмите "Redeploy" на последнем деплое

## ✅ Шаг 6: Проверка работы

### 6.1 Проверьте основные функции:

- ✅ Главная страница загружается
- ✅ Регистрация/вход работает
- ✅ AI-чат функционирует
- ✅ Сообщения сохраняются в базе данных

### 6.2 Проверьте логи:

1. В Vercel Dashboard → Deployments
2. Выберите последний деплой
3. Проверьте "Functions" логи для API ошибок

## 🛠️ Шаг 7: Дополнительные настройки

### 7.1 Настройка домена (опционально)

1. В Vercel Dashboard → Settings → Domains
2. Добавьте ваш кастомный домен
3. Настройте DNS записи

### 7.2 Настройка мониторинга

1. Подключите Sentry для отслеживания ошибок
2. Настройте Uptime Robot для мониторинга доступности

## 🚨 Решение проблем

### Проблема: "Build failed"

**Решение:**
1. Проверьте логи сборки в Vercel
2. Убедитесь, что все зависимости установлены
3. Проверьте синтаксис TypeScript

### Проблема: "API routes not working"

**Решение:**
1. Проверьте переменные окружения
2. Убедитесь, что API ключи корректны
3. Проверьте логи функций в Vercel

### Проблема: "Database connection failed"

**Решение:**
1. Проверьте Supabase ключи
2. Убедитесь, что база данных настроена
3. Проверьте RLS политики

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Vercel Dashboard
2. Проверьте логи в Supabase Dashboard
3. Создайте issue в GitHub репозитории

---

**Успешного деплоя! 🎉**
