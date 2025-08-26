-- Упрощенное исправление таблицы chat_messages
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем старую таблицу если она существует (ВНИМАНИЕ: это удалит все данные!)
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Создаем новую таблицу с правильной структурой
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Создаем функцию для триггера updated_at
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
CREATE TRIGGER trigger_update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_messages_updated_at();

-- Включаем RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Создаем RLS политики
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
SELECT 'Table created successfully!' as status;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;
