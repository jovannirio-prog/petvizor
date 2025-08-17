-- Простое исправление политик Supabase Storage
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

-- Удаляем существующие политики для pet-photos (если они есть)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;

-- Создаем простые политики - разрешаем все операции для авторизованных пользователей
CREATE POLICY "Allow all operations for authenticated users" ON storage.objects
FOR ALL USING (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

-- Проверяем результат
SELECT * FROM storage.buckets WHERE id = 'pet-photos';
