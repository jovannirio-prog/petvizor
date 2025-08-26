-- Исправление таблицы chat_messages
-- Выполните этот скрипт в Supabase SQL Editor

-- Вариант 1: Если таблица не существует, создаем её
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Вариант 2: Если таблица существует, добавляем недостающие колонки
-- Добавляем session_id если его нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' 
    AND column_name = 'session_id'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- Заполняем существующие записи значением по умолчанию для session_id
UPDATE chat_messages SET session_id = 'legacy-session-' || id::text WHERE session_id IS NULL;

-- Делаем колонку session_id NOT NULL
ALTER TABLE chat_messages ALTER COLUMN session_id SET NOT NULL;

-- Добавляем updated_at если его нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Создаем функцию для триггера updated_at
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Добавляем триггер для updated_at если его нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_update_chat_messages_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_chat_messages_updated_at
      BEFORE UPDATE ON chat_messages
      FOR EACH ROW
      EXECUTE FUNCTION update_chat_messages_updated_at();
  END IF;
END $$;

-- Создаем индексы (если их нет)
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Включаем RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики (если есть)
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can view all chat messages" ON chat_messages;

-- Создаем новые RLS политики
-- Пользователи могут читать только свои сообщения
CREATE POLICY "Users can view own chat messages" ON chat_messages
FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои сообщения
CREATE POLICY "Users can insert own chat messages" ON chat_messages
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои сообщения
CREATE POLICY "Users can update own chat messages" ON chat_messages
FOR UPDATE USING (auth.uid() = user_id);

-- Администраторы могут читать все сообщения
CREATE POLICY "Admins can view all chat messages" ON chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role_id = (SELECT id FROM user_roles WHERE name = 'admin')
  )
);

-- Проверяем результат
SELECT 
  'Table structure' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;

SELECT 
  'Indexes' as check_type,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'chat_messages';

SELECT 
  'Policies' as check_type,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY policyname;
