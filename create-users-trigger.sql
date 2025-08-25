-- Создание триггера для автоматического создания записи в таблице users
-- при регистрации нового пользователя

-- Удаляем существующий триггер (если есть)
DROP TRIGGER IF EXISTS on_auth_user_created_users ON auth.users;

-- Создаем функцию для автоматического создания записи в users
CREATE OR REPLACE FUNCTION public.handle_new_user_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаем запись в таблице users
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического создания записи в users
CREATE TRIGGER on_auth_user_created_users
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_users();

-- Проверяем, что триггер создан
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_users';
