# Инструкции по объединению с GitHub

## Текущее состояние
✅ Создан Next.js проект Petvizor
✅ Настроены все конфигурационные файлы
✅ Создан первый коммит
✅ Настроен удаленный репозиторий

## Следующие шаги (выполните вручную)

### 1. Переименуйте ветку в main
```bash
git branch -M main
```

### 2. Отправьте код в GitHub
```bash
git push origin main --force
```

### 3. Проверьте результат
Перейдите на https://github.com/jovannirio-prog/petvizor

## Что произойдет
- Старые файлы (README.md и index.html) будут заменены на новый Next.js проект
- В репозитории появится современное веб-приложение с AI чатом
- Проект будет готов к развертыванию на Vercel

## После успешной отправки

### Установка зависимостей
```bash
npm install
```

### Создание .env.local
Создайте файл `.env.local` с вашим OpenAI API ключом:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Развертывание на Vercel
1. Подключите репозиторий к Vercel
2. Добавьте переменную окружения `OPENAI_API_KEY`
3. Vercel автоматически развернет приложение

## Структура проекта
```
petvizor/
├── src/
│   └── app/
│       ├── api/chat/route.ts  # API для AI чата
│       ├── globals.css        # Глобальные стили
│       ├── layout.tsx         # Корневой layout
│       └── page.tsx           # Главная страница
├── package.json               # Зависимости
├── next.config.js            # Конфигурация Next.js
├── tailwind.config.ts        # Конфигурация Tailwind
├── tsconfig.json             # Конфигурация TypeScript
└── README.md                 # Документация
```
