# 🐾 PetVizor

Умный AI-помощник для владельцев домашних животных. Получите персональные советы по уходу, здоровью и питанию ваших питомцев.

## ✨ Возможности

- 🤖 **AI-консультации** - Персональные советы от искусственного интеллекта
- 🔐 **Безопасная аутентификация** - Регистрация и вход через Supabase
- 💾 **Сохранение истории** - Все ваши чаты сохраняются в базе данных
- 📱 **Адаптивный дизайн** - Работает на всех устройствах
- 🎨 **Современный UI** - Красивый интерфейс с Tailwind CSS

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/your-username/petvizor.git
   cd petvizor
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cp .env.example .env.local
   # Отредактируйте .env.local с вашими ключами API
   ```

4. **Запустите сервер разработки**
   ```bash
   npm run dev
   ```

5. **Откройте [http://localhost:3000](http://localhost:3000)**

### Деплой на Vercel

Подробные инструкции по деплою смотрите в [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🛠️ Технологии

- **Frontend**: Next.js 14, React 18, TypeScript
- **Стили**: Tailwind CSS
- **База данных**: Supabase (PostgreSQL)
- **Аутентификация**: Supabase Auth
- **AI**: OpenAI GPT-3.5-turbo
- **Деплой**: Vercel

## 📁 Структура проекта

```
petvizor/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── login/          # Страница входа
│   │   ├── register/       # Страница регистрации
│   │   └── about/          # О проекте
│   ├── components/         # React компоненты
│   ├── hooks/             # Кастомные хуки
│   └── lib/               # Утилиты и конфигурация
├── public/                # Статические файлы
└── docs/                  # Документация
```

## 🔧 Настройка

### Переменные окружения

Создайте файл `.env.local`:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_NAME=PetVizor
```

### Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL-скрипт из `supabase-setup.sql`
3. Настройте аутентификацию в Supabase Dashboard

## 📚 Документация

- [Руководство по деплою](./DEPLOYMENT_GUIDE.md)
- [Настройка переменных окружения](./ENV_SETUP_FINAL.md)
- [Настройка Supabase](./SUPABASE_SETUP_GUIDE.md)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [документацию](./docs/)
2. Создайте [issue](https://github.com/your-username/petvizor/issues)
3. Обратитесь к [руководству по деплою](./DEPLOYMENT_GUIDE.md)

---

**Сделано с ❤️ для владельцев домашних животных**
