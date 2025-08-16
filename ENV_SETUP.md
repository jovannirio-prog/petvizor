# Настройка переменных окружения

## Шаг 1: Создание файла .env.local

Создайте файл `.env.local` в корневой папке проекта со следующим содержимым:

```env
# OpenAI API Configuration
# Получите ключ на https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
# Получите URL и ключи на https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Другие переменные окружения (опционально)
NEXT_PUBLIC_APP_NAME=PetVizor
```

## Шаг 2: Получение OpenAI API ключа

1. Перейдите на https://platform.openai.com/
2. Войдите в свой аккаунт или создайте новый
3. Перейдите в раздел "API Keys" (https://platform.openai.com/api-keys)
4. Нажмите "Create new secret key"
5. Скопируйте созданный ключ
6. Вставьте его в файл `.env.local` вместо `your_openai_api_key_here`

## Шаг 3: Настройка Supabase

1. Перейдите на https://supabase.com/
2. Создайте новый проект или войдите в существующий
3. В настройках проекта перейдите в раздел "API"
4. Скопируйте "Project URL" и вставьте в `NEXT_PUBLIC_SUPABASE_URL`
5. Скопируйте "anon public" ключ и вставьте в `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Настройка базы данных Supabase

После создания проекта выполните следующие SQL команды в SQL Editor:

```sql
-- Создание таблицы профилей пользователей
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы питомцев
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы сообщений чата
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание RLS (Row Level Security) политик
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Политики для профилей
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для питомцев
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = user_id);

-- Политики для сообщений чата
CREATE POLICY "Users can view own messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Шаг 4: Перезапуск сервера

После создания файла `.env.local` перезапустите сервер разработки:

```bash
npm run dev
```

## Важные замечания

- Файл `.env.local` уже добавлен в `.gitignore` и не будет загружен в репозиторий
- Никогда не делитесь своим API ключом публично
- Для продакшена используйте переменные окружения вашего хостинга (Vercel, Netlify и т.д.)

## Проверка настройки

После настройки вы можете проверить, что переменная окружения работает, отправив сообщение в чат. Если все настроено правильно, AI должен ответить на ваш вопрос.
