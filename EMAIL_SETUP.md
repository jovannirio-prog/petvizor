# Настройка Email Уведомлений

## Переменные окружения

Добавьте следующие переменные в файл `.env.local`:

```bash
# SMTP Configuration for Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=PetVizor <noreply@petvizor.com>

# Notification Email
NOTIFICATION_EMAIL=ivan@leovet24.ru
```

## Настройка Gmail SMTP

### 1. Включите двухфакторную аутентификацию
- Перейдите в настройки Google аккаунта
- Включите двухфакторную аутентификацию

### 2. Создайте пароль приложения
- Перейдите в "Безопасность" → "Пароли приложений"
- Выберите "Почта" и "Другое (пользовательское имя)"
- Введите название: "PetVizor"
- Скопируйте сгенерированный пароль (16 символов)

### 3. Настройте переменные окружения
```bash
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_character_app_password
```

## Альтернативные SMTP провайдеры

### Yandex
```bash
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=your_email@yandex.ru
SMTP_PASS=your_app_password
```

### Mail.ru
```bash
SMTP_HOST=smtp.mail.ru
SMTP_PORT=587
SMTP_USER=your_email@mail.ru
SMTP_PASS=your_app_password
```

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

## Тестирование

После настройки SMTP, при каждой регистрации нового пользователя будет отправляться уведомление на email `ivan@leovet24.ru`.

Уведомление содержит:
- Email нового пользователя
- Имя пользователя
- Дату и время регистрации
- Красивый HTML шаблон с логотипом PetVizor

## Безопасность

- Никогда не коммитьте `.env.local` в Git
- Используйте пароли приложений вместо обычных паролей
- Регулярно обновляйте пароли приложений
