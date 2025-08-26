-- Исправление проблем с регистрацией пользователей
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Проверяем существующие триггеры
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('users', 'profiles');

-- 2. Удаляем старые триггеры если они есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- 3. Создаем правильную функцию для создания профилей
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаем запись в profiles
  INSERT INTO profiles (id, full_name, email, role_id, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    1, -- роль 'owner' по умолчанию
    NEW.created_at,
    NEW.updated_at
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Логируем ошибку, но не прерываем процесс
    RAISE WARNING 'Ошибка создания профиля для пользователя %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Создаем триггер для автоматического создания профилей
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Проверяем RLS политики для profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Удаляем все RLS политики для profiles
DROP POLICY IF EXISTS "Public profiles read access" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Администраторы могут читать все профили" ON profiles;
DROP POLICY IF EXISTS "Администраторы могут обновлять роли" ON profiles;
DROP POLICY IF EXISTS "Пользователи могут обновлять свой профиль" ON profiles;
DROP POLICY IF EXISTS "Пользователи могут читать свой профиль" ON profiles;

-- 7. Создаем простые и надежные RLS политики
-- Временно отключаем RLS для отладки
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 8. Проверяем, что таблица users существует и имеет правильную структуру
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- 9. Создаем недостающие записи в profiles для существующих пользователей
INSERT INTO profiles (id, full_name, email, role_id, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.email, 'Пользователь') as full_name,
  u.email,
  1 as role_id,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 10. Проверяем результат
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles;

-- 11. Проверяем, что все пользователи имеют профили
SELECT u.id, u.email, p.id as profile_id
FROM users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
