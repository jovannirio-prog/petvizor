-- Исправление базы данных PetVizor
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Добавляем колонку phone в таблицу profiles (если её нет)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Добавляем колонки в таблицу pets (если их нет)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS lost_comment TEXT;

-- Проверяем структуру таблиц
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pets' 
ORDER BY ordinal_position;
