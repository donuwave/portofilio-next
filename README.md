# 👨‍💻 Портфолио — Даниил Тареев

Личный сайт-портфолио фронтенд-разработчика с собственной админкой. Проекты, кейсы, опыт работы и профиль редактируются через панель управления без правки кода, а данные хранятся в PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat&logo=greensock&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

![Статус](https://img.shields.io/badge/статус-в_разработке-orange?style=flat)

## ✨ Сайт

- Главная с одностраничной прокруткой по секциям: обо мне, опыт, проекты
- Навигация в первом экране плавно прокручивает к нужной секции и анимированно возвращается обратно
- Блок статистики, таймлайн опыта работы с логотипами компаний
- Сетка проектов и страница проекта `/projects/[slug]` со списком кейсов
- Карусель фото и видео внутри кейса
- Анимации на **GSAP**, плавный скролл на **Lenis**, эффект печатной машинки в заголовках

## 🛠 Админка (`/admin`)

- Вход по email и паролю для одного владельца: хеш пароля через **bcrypt**, сессия — JWT (**jose**, HS256) в httpOnly-cookie на 7 дней
- Защита всех `/admin` и `/api` маршрутов в одном месте — в `proxy` (middleware Next.js)
- **Профиль:** имя, роль, о себе, текущее место работы, навыки, аватар
- **Опыт работы:** CRUD записей с сортировкой и логотипами
- **Проекты и кейсы:** CRUD, статусы черновик / опубликован, порядок, обложка, стек технологий, медиа кейсов
- **Медиабиблиотека:** загрузка фото и видео с проверкой MIME-типа, выбор файла из библиотеки в любой форме, удаление

## 🧩 Технические детали

- **Next.js 16 App Router**: публичная часть рендерится серверными компонентами с прямыми запросами в БД через Prisma, а админка работает через REST Route Handlers
- **Prisma + PostgreSQL**: модели `Profile`, `Experience`, `Project`, `Case`, `Media`, миграции в репозитории
- **Двуязычный контент в БД**: текстовые поля хранятся как `{ ru, en }` (тип `LocalizedText`), фронт выбирает язык с фолбэком
- **Валидация** входных данных API на **Zod**
- **Медиафайлы на диске** (`UPLOADS_DIR`) с раздачей через собственный Route Handler, защищённый от выхода за пределы папки (`../`)
- Архитектура по **Feature-Sliced Design**: `app` / `views` / `widgets` / `features` / `entities` / `shared`

## 🚀 Запуск

Нужны Node.js 20+ и Docker.

```bash
git clone https://github.com/donuwave/portofilio-next.git
cd portofilio-next
npm install

cp .env.example .env    # заполни AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH
docker compose up -d    # PostgreSQL
npx prisma migrate deploy
npm run dev
```

- Сайт: [localhost:3000](http://localhost:3000)
- Админка: [localhost:3000/admin](http://localhost:3000/admin)

Хеш пароля для админки:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
```

В `.env` экранируй каждый `$` в хеше как `\$`: Next.js подставляет переменные в значениях `.env` и иначе молча портит хеш.
