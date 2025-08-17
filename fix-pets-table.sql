-- Исправление таблицы pets - добавление недостающих колонок
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Добавляем колонку birth_date, если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'birth_date') THEN
        ALTER TABLE pets ADD COLUMN birth_date DATE;
    END IF;
END $$;

-- Добавляем колонку weight, если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'weight') THEN
        ALTER TABLE pets ADD COLUMN weight DECIMAL(5,2);
    END IF;
END $$;

-- Добавляем колонку photo_url, если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'photo_url') THEN
        ALTER TABLE pets ADD COLUMN photo_url TEXT;
    END IF;
END $$;

-- Добавляем колонку lost_comment, если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'lost_comment') THEN
        ALTER TABLE pets ADD COLUMN lost_comment TEXT;
    END IF;
END $$;

-- Проверяем, что все колонки существуют
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pets' 
ORDER BY ordinal_position;
