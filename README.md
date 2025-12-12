# Tic-Tac-Toe Project

## Описание проекта
tic-tac-toe — тестовый проект, состоящий из трёх компонентов:

1. **Backend (FastAPI)**
   - Минимальный сервер с POST-эндпоинтами `/win` и `/lose`.
   - Принимает `chat_id` и отправляет Telegram-сообщение через бота.
   - Генерирует промокод (8 символов A-Z0-9).

2. **Telegram Bot (aiogram)**
   - Команда `/start` отправляет приветственное сообщение.
   - Кнопка-ссылка на фронтенд.

3. **Frontend (React + TypeScript)**
   - Игра крестики-нолики с логикой на клиенте.
   - Отправка запроса в backend при победе или поражении.
   - Минималистичный UI, ориентированный на женщин 25–40 лет.

> Никаких ML, баз данных, кешей, Traefik — проект максимально простой.

## Структура проекта

tic-tac-toe/
  backend/
    app/
      __init__.py
      main.py
    Dockerfile
    requirements.txt

  bot/
    app/
      __init__.py
      main.py
    Dockerfile
    requirements.txt

  frontend/
    src/
    public/
    package.json
    Dockerfile

  infra/
    docker-compose.base.yml
    docker-compose.dev.yml
    docker-compose.prod.yml
    envs/
      backend.env
      bot.env
      frontend.env

  Makefile

## Docker и запуск

### Структура env-файлов

infra/envs/backend.env      # переменные для backend
infra/envs/bot.env          # переменные для bot
infra/envs/frontend.env     # переменные для frontend

Примеры содержимого (placeholder):

backend.env
BACKEND_PORT=8000
TELEGRAM_BOT_TOKEN=your_token_here

bot.env
BOT_POLLING=true
FRONTEND_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=your_token_here

frontend.env
FRONTEND_PORT=3000
BACKEND_URL=http://localhost:8000

### docker-compose.base.yml
- Определяет сервисы без портов и volumes
- Использует build-контекст для backend, bot, frontend
- Пример:

version: "3.9"

services:
  backend:
    build:
      context: ../backend
  bot:
    build:
      context: ../bot
  frontend:
    build:
      context: ../frontend

### docker-compose.dev.yml
- Расширяет base для локальной разработки
- Подключает env-файлы
- Монтирует код для hot-reload
- Пример:

version: "3.9"

services:
  backend:
    ports:
      - "8000:8000"
    volumes:
      - ../backend:/app
    env_file:
      - ./envs/backend.env
    restart: unless-stopped

  bot:
    volumes:
      - ../bot:/app
    env_file:
      - ./envs/bot.env
    restart: unless-stopped

  frontend:
    ports:
      - "3000:3000"
    volumes:
      - ../frontend:/app
    env_file:
      - ./envs/frontend.env
    restart: unless-stopped

### docker-compose.prod.yml
- Минимальная конфигурация для продакшн
- Не содержит volumes
- Порты и HTTPS настраиваются вручную на VPS

### Makefile

dev:
	docker compose -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml up --build

prod:
	docker compose -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml up -d --build

## Backend (FastAPI)

**Задачи:**
- POST `/win` и `/lose`
- Отправка сообщений через Telegram API
- Генерация промокода

**Что backend не делает:**
- Не хранит данные
- Не использует БД или Redis
- Нет сложной логики или асинхронных очередей

## Telegram Bot (aiogram)

**Функции:**
- `/start` — приветствие
- Кнопка-ссылка на фронтенд

Бот не содержит игру или ML — только взаимодействие с пользователем и backend.

## Frontend (React)

**Функции:**
- Локальная игра крестики-нолики 3×3
- Определение победы/поражения
- POST в backend `/win` или `/lose`
- UI минималистичный, приятный для женской аудитории

## Разработка (dev-mode)
- Backend: `localhost:8000`
- Frontend: `localhost:3000`
- Bot: работает локально, без портов
- Горячая перезагрузка через volumes

## Продакшн (prod-mode)
- Контейнеры работают в одной сети Docker
- Порты открываются только при необходимости
- HTTPS и firewall настраиваются на VPS вручную

## Будущие шаги
1. Создать скелет проекта
2. Реализовать backend
3. Реализовать bot
4. Реализовать frontend
5. Интеграция и тестирование
6. Деплой на VPS
