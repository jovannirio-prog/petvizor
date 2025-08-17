-- Проверка и исправление политик для таблицы pets
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Проверяем существующие политики
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pets';

-- Удаляем существующие политики для pets (если они есть)
DROP POLICY IF EXISTS "Users can view own pets" ON pets;
DROP POLICY IF EXISTS "Users can insert own pets" ON pets;
DROP POLICY IF EXISTS "Users can update own pets" ON pets;
DROP POLICY IF EXISTS "Users can delete own pets" ON pets;

-- Создаем простые политики для всех операций
CREATE POLICY "Users can view own pets" ON pets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON pets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON pets
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON pets
FOR DELETE USING (auth.uid() = user_id);

-- Проверяем результат
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pets';
