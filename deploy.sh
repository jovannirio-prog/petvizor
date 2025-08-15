#!/bin/bash

# Отключаем pager для Git
export GIT_PAGER=cat

echo "Переименовываем ветку в main..."
git branch -M main

echo "Отправляем код в GitHub..."
git push origin main --force

echo "Готово! Проект успешно отправлен в GitHub."
