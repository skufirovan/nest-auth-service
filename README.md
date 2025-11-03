# NestJS Auth Service
Сервис аутентификации и авторизации на NestJS, использующий серверные сессии, хранящиеся в Redis

## Стек
- Bun
- NestJS (v11) 
- TypeScript 
- Prisma ORM 
- PostgreSQL 
- Redis
- Docker - контейнеризация Redis и PostgreSQL
- @nestjs-modules/mailer - отправка писем
- @react-email/components - шаблоны писем
- class-transformer, class-validator - валидация и сериализация DTO

## Реализованный функционал
- Регистрация пользователя<br>После регистрации пользователю автоматически отправляется письмо со ссылкой на подтверждение почты
Без подтверждения email авторизация невозможна
- Аутентификация через сессии (Redis)<br>Логин и логаут реализованы через серверные сессии
- Восстановление пароля<br>Отправляется письмо с уникальной ссылкой для сброса
- Двухфакторная аутентификация (2FA)<br>Дополнительный уровень защиты с проверкой кода
- OAuth2 (Google, Yandex)
- Система ролей и защищённые роуты<br>Настроены Guards и Role-based access, включая приватные эндпоинты для админки
- reCAPTCHA для критичных действий<br>Используется при регистрации и логине для защиты от ботов

## Структура проекта
- `prisma/schema.prisma` - модели таблиц
- `src/auth` - модули аутентификации, контроллеры, сервисы
- `src/libs/email` - модуль отправки писем и шаблоны писем
- `src/user` - модуль для работы с пользователями
- `src/config` - конфигурации модулей (mailer, providers, recaptcha)

## Установка и локальный запуск
Требуется Node.js (v18+) или Bun.
Проект разрабатывался с использованием Bun, но может быть запущен и с Node.js - достаточно заменить команды bun на npm run или npx

```bash
# Клонировать репозиторий
git clone https://github.com/skufirovan/nest-auth-service.git
cd nest-auth-service

# Установить зависимости
bun install

# Настроить .env
cp .env.example .env

# Поднять инфраструктуру
docker compose up -d

# Сгенерировать Prisma Client
bunx prisma generate

# Применить миграции
bunx prisma migrate dev --name init

# Запустить в dev-режиме
bun run start:dev
```
