@echo off
echo Переименовываем ветку в main...
git branch -M main

echo Отправляем код в GitHub...
git push origin main --force

echo Готово! Проект успешно отправлен в GitHub.
pause
