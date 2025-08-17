-- Исправление дублирующихся профилей
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Проверяем дублирующиеся профили
SELECT id, email, COUNT(*) as count
FROM profiles 
GROUP BY id, email 
HAVING COUNT(*) > 1;

-- Удаляем дублирующиеся записи, оставляя только первую
DELETE FROM profiles 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at) as rn
    FROM profiles
  ) t 
  WHERE t.rn > 1
);

-- Проверяем результат
SELECT id, email, full_name, phone, created_at
FROM profiles 
ORDER BY created_at;
