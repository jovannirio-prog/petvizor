# Настройка PetVizor

## Быстрая настройка

### 1. Переменные окружения
Создайте файл `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. База данных
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Создайте новый проект
3. Перейдите в **SQL Editor**
4. Выполните содержимое файла `supabase-setup.sql`

### 3. Хранилище
1. В Supabase Dashboard → **Storage**
2. Создайте bucket `pet-images`
3. Настройте публичный доступ

### 4. Запуск
```bash
npm install
npm run dev
```

Приложение будет доступно на `http://localhost:3000`
