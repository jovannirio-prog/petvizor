-- Проверка и исправление RLS политик для таблицы pets
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Включаем RLS для таблицы pets
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики (если есть)
DROP POLICY IF EXISTS "Users can view their own pets" ON pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON pets;
DROP POLICY IF EXISTS "Public can view pets" ON pets;

-- Создаем политики для владельцев питомцев
CREATE POLICY "Users can view their own pets" ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

-- Создаем политику для публичного просмотра питомцев (для QR-кодов)
CREATE POLICY "Public can view pets" ON pets
  FOR SELECT USING (true);

-- Проверяем политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'pets';

