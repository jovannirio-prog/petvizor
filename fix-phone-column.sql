-- Добавляем колонку phone в таблицу profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Проверяем структуру таблицы
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
