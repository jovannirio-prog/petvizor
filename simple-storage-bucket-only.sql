-- Простое создание bucket для фотографий питомцев
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Создаем bucket для фотографий питомцев (если не существует)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  true,
  3145728, -- 3MB в байтах
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Проверяем результат
SELECT * FROM storage.buckets WHERE id = 'pet-photos';
