-- Проверка структуры таблицы chat_messages
-- Выполните этот скрипт в Supabase SQL Editor

-- Проверяем, существует ли таблица
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'chat_messages'
) as table_exists;

-- Если таблица существует, показываем её структуру
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- Проверяем индексы
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'chat_messages';

-- Проверяем RLS политики
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY policyname;
