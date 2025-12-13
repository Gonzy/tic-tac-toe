# Развертывание на продакшен

## Обзор

Новая архитектура продакшена использует отдельный nginx на VPS для раздачи статики, а бэкенд и бот работают в Docker-контейнерах.

## Архитектура

1. **Frontend**: Собирается в Docker-контейнере и копируется в volume на хост
2. **Backend**: Работает в Docker-контейнере на порту 8000
3. **Bot**: Работает в Docker-контейнере
4. **Nginx**: Устанавливается напрямую на VPS и раздает статику + проксирует API

## Развертывание

### 1. Сборка фронтенда

```bash
make prod-build-frontend
```

Эта команда соберет React-приложение и поместит его в `./infra/frontend-build`

### 2. Запуск бэкенда и бота

```bash
make prod-up
```

Эта команда запустит бэкенд и бот в продакшн-режиме

### 3. Настройка nginx на VPS

Скопируйте файл `infra/nginx.prod.conf` в `/etc/nginx/sites-enabled/tic-tac-toe`:

```bash
sudo cp infra/nginx.prod.conf /etc/nginx/sites-enabled/tic-tac-toe
```

Измените настройки в файле:
- Замените `your-domain.com` на ваш домен
- При необходимости измените пути к SSL-сертификатам

### 4. Копирование статики фронтенда

Создайте директорию для статики:

```bash
sudo mkdir -p /var/www/tic-tac-toe
```

Скопируйте собранный фронтенд:

```bash
sudo cp -r ./infra/frontend-build/* /var/www/tic-tac-toe/
```

### 5. Перезапуск nginx

```bash
sudo systemctl restart nginx
```

## Проверка развертывания

1. Проверьте работу бэкенда: `http://your-server:8000`
2. Проверьте работу фронтенда через nginx: `http://your-domain.com`

## Обновление

### Обновление фронтенда

1. Снова соберите фронтенд: `make prod-build-frontend`
2. Скопируйте новые файлы: `sudo cp -r ./infra/frontend-build/* /var/www/tic-tac-toe/`

### Обновление бэкенда/бота

```bash
make prod-restart-backend
make prod-restart-bot
```

## Полное обновление

```bash
# Остановка сервисов
make prod-down

# Сборка и запуск
make prod-build-frontend
make prod-up

# Копирование статики
sudo cp -r ./infra/frontend-build/* /var/www/tic-tac-toe/

# Перезапуск nginx
sudo systemctl restart nginx
```

## Полезные команды

- Просмотр логов: `make logs-prod`
- Остановка всех сервисов: `make prod-down`
- Очистка системы: `make clean`

## Замечания

- Убедитесь, что порт 8000 доступен для nginx
- Для HTTPS настройте SSL-сертификаты и раскомментируйте соответствующие секции в nginx.prod.conf
- Регулярно делайте бэкапы базы данных и конфигурационных файлов