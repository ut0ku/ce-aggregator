# Волна

Агрегатор городских событий и новостей: пользователь выбирает город и тему, бэкенд собирает ленту из RSS/API/HTML-источников, дедуплицирует и кэширует результат.

## Стек

- Frontend: React + Vite
- Backend: Node.js + Express
- БД: PostgreSQL
- Кэш и очереди: Redis + BullMQ (если Redis недоступен, кэш живёт в памяти, парсинг идёт сразу)
- Парсеры: RSS, Cheerio (HTML), KudaGo API, Playwright по необходимости

## Быстрый старт

1. Создайте базу `volna` в PostgreSQL.
2. Скопируйте `server/.env.example` в `server/.env` и поправьте `DATABASE_URL`.
3. Установите зависимости и загрузите схему:

```bash
npm install
npm install --prefix server
npm run migrate --prefix server
npm run seed --prefix server
```

4. Запустите API и фронт одной командой:

```bash
npm run dev:all
```

Или в двух терминалах:

```bash
npm run dev --prefix server
npm run dev
```

Откройте http://localhost:5173. Vite проксирует `/api` на порт 3001.

## API

- `GET /api/cities`
- `GET /api/topics`
- `GET /api/feed?city=moscow&topic=it`
- `POST /api/feed/refresh` `{ "city": "moscow", "topic": "it" }`

Сейчас в каталоге 18 тем и ~360 источников (RSS, HTML с автопоиском ленты, KudaGo / Hacker News / arXiv API). Полный список — в `server/src/db/sources.catalog.js`. После обновления каталога:

```bash
npm run seed --prefix server
```

Playwright не обязателен для MVP. Для JS-сайтов: `npm install playwright --prefix server` и `npx playwright install chromium`, затем в `parser_config` источника укажите `"engine": "playwright"`.
