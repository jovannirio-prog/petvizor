-- Восстановление RLS политик для profiles
-- Выполните этот скрипт в Supabase SQL Editor после успешной регистрации

-- 1. Включаем RLS обратно
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Создаем правильные RLS политики
-- Политика для чтения профилей (публичный доступ для контактной информации)
CREATE POLICY "Public profiles read access" ON profiles
FOR SELECT USING (true);

-- Политика для обновления собственного профиля
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Политика для создания собственного профиля (через триггер)
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Политика для администраторов (могут читать все профили)
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role_id = (SELECT id FROM user_roles WHERE name = 'admin')
  )
);

-- Политика для администраторов (могут обновлять все профили)
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role_id = (SELECT id FROM user_roles WHERE name = 'admin')
  )
);

-- 3. Проверяем созданные политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Проверяем, что RLS включен
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. Тестируем доступ (должно работать)
SELECT COUNT(*) as profiles_count FROM profiles;
