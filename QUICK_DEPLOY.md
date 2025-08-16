# ⚡ Быстрый деплой на Vercel

## 🚀 5 минут до продакшена

### 1. Подготовка (1 минута)
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Создание проекта Vercel (2 минуты)
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите ваш репозиторий `petvizor`
5. Нажмите "Deploy"

### 3. Настройка переменных (2 минуты)
В Vercel Dashboard → Settings → Environment Variables добавьте:

```env
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_APP_NAME=Petvizor Pro 2
```

### 4. Готово! 🎉
Ваше приложение доступно по ссылке: `https://your-app.vercel.app`

---

**Подробная инструкция**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
