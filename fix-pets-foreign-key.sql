-- Исправление внешнего ключа в таблице pets
-- Проверяем текущую структуру таблицы pets

-- 1. Проверяем существующие внешние ключи
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='pets';

-- 2. Удаляем существующий внешний ключ (если есть)
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_user_id_fkey;

-- 3. Создаем правильный внешний ключ
ALTER TABLE pets 
ADD CONSTRAINT pets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 4. Проверяем, что все user_id в pets существуют в auth.users
SELECT p.user_id, p.name 
FROM pets p 
LEFT JOIN auth.users u ON p.user_id = u.id 
WHERE u.id IS NULL;

-- 5. Если есть записи с несуществующими user_id, удаляем их
DELETE FROM pets 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 6. Проверяем результат
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='pets';
