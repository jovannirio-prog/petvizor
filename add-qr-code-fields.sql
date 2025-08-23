-- Добавление полей QR-кода в таблицу pets
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Добавляем колонку qr_code_url для хранения URL QR-кода
ALTER TABLE pets ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Добавляем колонку qr_code_image для хранения изображения QR-кода в base64
ALTER TABLE pets ADD COLUMN IF NOT EXISTS qr_code_image TEXT;

-- Добавляем колонку qr_code_updated_at для отслеживания обновлений QR-кода
ALTER TABLE pets ADD COLUMN IF NOT EXISTS qr_code_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Проверяем структуру таблицы pets
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pets' 
ORDER BY ordinal_position;
