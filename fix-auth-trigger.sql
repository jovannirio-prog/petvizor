-- Исправление проблемы с триггером и RLS политиками

-- 1. Удаляем старый триггер, если он существует
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Удаляем старую функцию, если она существует
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Проверяем и создаем таблицу profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Включаем RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Удаляем старые политики
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 6. Создаем новые политики
-- Политика для просмотра профиля (пользователь может видеть свой профиль)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Политика для обновления профиля (пользователь может обновлять свой профиль)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политика для создания профиля (пользователь может создавать свой профиль)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Создаем новую функцию для создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем, что пользователь действительно существует
  IF NEW.id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING; -- Игнорируем конфликты
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Создаем новый триггер с правильным порядком
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Проверяем существующие профили
SELECT COUNT(*) as profiles_count FROM public.profiles;

-- 10. Проверяем существующих пользователей
SELECT COUNT(*) as users_count FROM auth.users;
