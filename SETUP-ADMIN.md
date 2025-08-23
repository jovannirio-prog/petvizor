# Настройка администратора Petvizor

## Проблема
При попытке создать администратора возникает ошибка "Ошибка создания пользователя" из-за отсутствия переменных окружения.

## Решение

### 1. Создать файл .env.local
В корневой папке проекта создайте файл `.env.local` со следующим содержимым:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zuuupcwjynjeqtjzdimt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dXVwY3dqeW5qZXF0anpkaW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjk3NDcsImV4cCI6MjA3MDkwNTc0N30.fUKZnqs_xlsAUlle2UmAaalupJ0rMIyoKlIhNpdTFao
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Sheets API (опционально, для AI консультанта)
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key

# OpenAI API (опционально, для AI консультанта)
OPENAI_API_KEY=your_openai_api_key
```

### 2. Получить Service Role Key
1. Войдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в Settings → API
4. Скопируйте "service_role" key (НЕ anon key!)
5. Вставьте его в `.env.local` вместо `your_service_role_key_here`

### 3. Выполнить SQL скрипт ролей
В Supabase SQL Editor выполните содержимое файла `create-user-roles-system.sql`

### 4. Перезапустить сервер
```bash
npm run dev
```

### 5. Создать администратора
1. Перейдите на страницу: `http://localhost:3001/setup-admin`
2. Нажмите кнопку "Создать администратора"
3. Дождитесь подтверждения создания

### 6. Войти как администратор
- **Email:** `sa@petvizor.local`
- **Пароль:** `yyy789465`

## Проверка настройки

После создания администратора вы сможете:
- Войти в систему с правами администратора
- Увидеть ссылку "Управление пользователями" в навигации
- Управлять ролями других пользователей
- Использовать все функции системы

## Безопасность

После успешного создания администратора рекомендуется:
1. Удалить или защитить endpoint `/api/admin/create-admin`
2. Удалить страницу `/setup-admin`
3. Изменить пароль администратора
4. Настроить дополнительные меры безопасности
