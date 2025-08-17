-- Настройка Supabase Storage для фотографий питомцев
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- Создаем bucket для фотографий питомцев
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  true,
  3145728, -- 3MB в байтах
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Создаем политики для bucket pet-photos
-- Пользователи могут загружать файлы в свой папку
CREATE POLICY "Users can upload pet photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Пользователи могут просматривать все фотографии питомцев (публичные)
CREATE POLICY "Anyone can view pet photos" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-photos');

-- Пользователи могут обновлять свои фотографии
CREATE POLICY "Users can update own pet photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Пользователи могут удалять свои фотографии
CREATE POLICY "Users can delete own pet photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
