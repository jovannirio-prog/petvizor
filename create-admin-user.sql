-- Создание пользователя admin для Petvizor
-- ВАЖНО: Этот скрипт нужно выполнить ПОСЛЕ выполнения create-user-roles-system.sql

-- 1. Создание пользователя в auth.users
-- Примечание: В Supabase нельзя напрямую вставлять в auth.users через SQL
-- Пользователь должен быть создан через Supabase Auth UI или API

-- 2. После создания пользователя через Supabase Auth, выполнить:
-- Email: sa@petvizor.local
-- Пароль: yyy789465

-- 3. Назначение роли admin (выполнить после создания пользователя)
UPDATE profiles 
SET role_id = (SELECT id FROM user_roles WHERE name = 'admin') 
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'sa@petvizor.local'
);

-- 4. Проверка, что роль назначена
SELECT 
    u.email,
    p.full_name,
    ur.name as role_name,
    ur.display_name as role_display_name
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON p.role_id = ur.id
WHERE u.email = 'sa@petvizor.local';

-- 5. Альтернативный способ - создание через Supabase Auth API
-- curl -X POST 'https://your-project.supabase.co/auth/v1/admin/users' \
--   -H "apikey: YOUR_SERVICE_ROLE_KEY" \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{
--     "email": "sa@petvizor.local",
--     "password": "yyy789465",
--     "email_confirm": true,
--     "user_metadata": {
--       "full_name": "System Administrator"
--     }
--   }'
