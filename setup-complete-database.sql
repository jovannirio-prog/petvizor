-- Полная настройка базы данных для PetVizor
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- ========================================
-- 1. Создание таблицы ролей пользователей
-- ========================================
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Вставка ролей
INSERT INTO user_roles (name, display_name, description) VALUES
    ('owner', 'Владелец питомца', 'Типовой пользователь по умолчанию, владелец домашнего животного'),
    ('clinic_admin', 'Администратор ветклиники', 'Администратор ветклиники'),
    ('clinic_vet', 'Ветеринарный врач', 'Ветеринарный врач ветклиники'),
    ('knowledge', 'Редактор базы знаний', 'Редактор базы знаний'),
    ('breeder', 'Заводчик', 'Заводчик'),
    ('shelter', 'Приют/Волонтер', 'Приюты, волонтеры'),
    ('partner', 'Коммерческий партнер', 'Коммерческие партнеры проекта'),
    ('admin', 'Администратор системы', 'Администратор системы, которому доступны все возможности')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 2. Создание таблицы users (для API)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. Создание таблицы профилей пользователей
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role_id INTEGER REFERENCES user_roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Установка роли owner по умолчанию для всех существующих пользователей
UPDATE profiles SET role_id = (SELECT id FROM user_roles WHERE name = 'owner') WHERE role_id IS NULL;

-- ========================================
-- 4. Создание таблицы питомцев
-- ========================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  photo_url TEXT,
  lost_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. Создание таблицы событий питомцев
-- ========================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('вакцинация', 'день рождения', 'визит к ветеринару', 'стрижка', 'купание', 'другое')),
  event_name VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_date DATE NOT NULL,
  notification_days_before INTEGER NOT NULL DEFAULT 7 CHECK (notification_days_before >= 0),
  event_status BOOLEAN NOT NULL DEFAULT false,
  notification_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. Создание таблицы сообщений чата
-- ========================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. Включение Row Level Security (RLS)
-- ========================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 8. Создание политик безопасности
-- ========================================

-- Политики для user_roles (только для чтения)
CREATE POLICY "Роли доступны для чтения всем аутентифицированным пользователям" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Политики для users
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all records" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
    )
  );

-- Политики для profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Администраторы могут читать все профили" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
        )
    );
CREATE POLICY "Администраторы могут обновлять роли пользователей" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
        )
    );

-- Политики для pets
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = user_id);

-- Политики для events
CREATE POLICY "Users can view their own pet events" ON events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pet events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pet events" ON events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pet events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для chat_messages
CREATE POLICY "Users can view own messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 9. Создание функций и триггеров
-- ========================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Функция для создания записи в users
CREATE OR REPLACE FUNCTION public.handle_new_user_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role_id)
  VALUES (NEW.id, NEW.email, (SELECT id FROM user_roles WHERE name = 'owner'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. Создание триггеров
-- ========================================

-- Удаляем существующие триггеры
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_users ON auth.users;

-- Создаем триггеры
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_users
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_users();

-- Триггеры для обновления updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 11. Создание индексов
-- ========================================
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_events_pet_id ON events(pet_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_notification_active ON events(notification_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ========================================
-- 12. Создание представления для пользователей с ролями
-- ========================================
CREATE OR REPLACE VIEW users_with_roles AS
SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    u.email,
    u.email_confirmed_at,
    u.last_sign_in_at,
    ur.name as role_name,
    ur.display_name as role_display_name,
    ur.description as role_description
FROM profiles p
JOIN auth.users u ON p.id = u.id
LEFT JOIN user_roles ur ON p.role_id = ur.id;

-- ========================================
-- 13. Проверка созданных таблиц
-- ========================================
SELECT 'user_roles' as table_name, COUNT(*) as record_count FROM user_roles
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'pets' as table_name, COUNT(*) as record_count FROM pets
UNION ALL
SELECT 'events' as table_name, COUNT(*) as record_count FROM events
UNION ALL
SELECT 'chat_messages' as table_name, COUNT(*) as record_count FROM chat_messages;
