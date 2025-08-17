-- Исправление политик Supabase Storage для фотографий питомцев
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Сначала удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Users can upload pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own pet photos" ON storage.objects;

-- Создаем bucket для фотографий питомцев (если не существует)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  true,
  3145728, -- 3MB в байтах
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Создаем новые политики для bucket pet-photos
-- Пользователи могут загружать файлы в любую папку (упрощенная политика)
CREATE POLICY "Users can upload pet photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pet-photos');

-- Пользователи могут просматривать все фотографии питомцев (публичные)
CREATE POLICY "Anyone can view pet photos" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-photos');

-- Пользователи могут обновлять любые фотографии (упрощенная политика)
CREATE POLICY "Users can update pet photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'pet-photos');

-- Пользователи могут удалять любые фотографии (упрощенная политика)
CREATE POLICY "Users can delete pet photos" ON storage.objects
FOR DELETE USING (bucket_id = 'pet-photos');

-- Проверяем, что bucket создан
SELECT * FROM storage.buckets WHERE id = 'pet-photos';

-- Проверяем политики
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
