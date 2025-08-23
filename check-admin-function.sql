-- Функция для проверки существования администратора
CREATE OR REPLACE FUNCTION check_admin_user(admin_email TEXT)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  user_role_name TEXT,
  user_role_display_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    admin_email as user_email,
    p.full_name as user_full_name,
    ur.name as user_role_name,
    ur.display_name as user_role_display_name
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = (
    SELECT au.id FROM auth.users au WHERE au.email = admin_email LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION check_admin_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_user(TEXT) TO anon;
