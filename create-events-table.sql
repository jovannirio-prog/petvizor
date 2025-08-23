-- Создание таблицы events для системы событий питомцев
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Создаем таблицу events
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

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_events_pet_id ON events(pet_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_notification_active ON events(notification_active);

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Включаем RLS (Row Level Security)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности
-- Пользователи могут видеть только события своих питомцев
CREATE POLICY "Users can view their own pet events" ON events
  FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать события только для своих питомцев
CREATE POLICY "Users can insert their own pet events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять только события своих питомцев
CREATE POLICY "Users can update their own pet events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

-- Пользователи могут удалять только события своих питомцев
CREATE POLICY "Users can delete their own pet events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Проверяем созданную таблицу
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

