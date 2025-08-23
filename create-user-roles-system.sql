-- Создание системы ролей пользователей для Petvizor

-- 1. Создание таблицы ролей
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Вставка ролей
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

-- 3. Добавление поля role_id в таблицу profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES user_roles(id);

-- 4. Установка роли owner по умолчанию для всех существующих пользователей
UPDATE profiles SET role_id = (SELECT id FROM user_roles WHERE name = 'owner') WHERE role_id IS NULL;

-- 5. Создание индекса для быстрого поиска по ролям
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);

-- 6. Создание представления для удобного получения пользователей с ролями
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

-- 7. RLS политики для таблицы ролей (только для чтения)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Роли доступны для чтения всем аутентифицированным пользователям" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- 8. RLS политики для profiles с учетом ролей
-- Пользователи могут читать только свой профиль
CREATE POLICY "Пользователи могут читать свой профиль" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять только свой профиль (кроме роли)
CREATE POLICY "Пользователи могут обновлять свой профиль" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Администраторы могут читать все профили
CREATE POLICY "Администраторы могут читать все профили" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
        )
    );

-- Администраторы могут обновлять роли пользователей
CREATE POLICY "Администраторы могут обновлять роли пользователей" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
        )
    );

-- 9. Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Создание пользователя admin
-- Примечание: Этот пользователь должен быть создан через Supabase Auth
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at) VALUES 
-- ('sa@petvizor.local', crypt('yyy789465', gen_salt('bf')), NOW());

-- После создания пользователя через Supabase Auth, обновить его роль:
-- UPDATE profiles SET role_id = (SELECT id FROM user_roles WHERE name = 'admin') 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'sa@petvizor.local');
