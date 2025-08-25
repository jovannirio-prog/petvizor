-- Создание таблицы users для PetVizor
-- Эта таблица используется в API для проверки существования пользователей

-- Создаем таблицу users
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности
-- Пользователи могут читать только свою запись
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять только свою запись
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Пользователи могут создавать только свою запись
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Администраторы могут читать все записи
CREATE POLICY "Admins can view all records" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
    )
  );

-- Создаем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Проверяем созданную таблицу
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
