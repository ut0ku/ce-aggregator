/**
 * OpenAPI 3.0 specification for Волна API.
 * Served at GET /api/docs
 */
export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Волна — API городского агрегатора новостей',
    version: '1.0.0',
    description: `
## Описание

**Волна** — агрегатор русскоязычных новостей и городских событий.  
Пользователь выбирает город и тему; бэкенд собирает ленту из RSS/API/HTML-источников,
дедуплицирует и кэширует результат.

## Аутентификация

Большинство эндпоинтов не требуют авторизации. Для лайков, комментариев и
административных функций нужен **JWT-токен**.

1. Зарегистрируйтесь или войдите через \`POST /api/auth/register\` / \`POST /api/auth/login\`.
2. Скопируйте поле \`token\` из ответа.
3. Нажмите кнопку **Authorize** (🔒) вверху страницы, вставьте токен.

**Тестовый аккаунт администратора:** \`admin / adminadmin\`

## Пользовательские сценарии

| № | Сценарий | Эндпоинты |
|---|----------|-----------|
| 1 | Просмотр ленты новостей | \`GET /cities\` → \`GET /topics\` → \`GET /feed\` |
| 2 | Регистрация и вход | \`POST /auth/register\` → \`POST /auth/login\` |
| 3 | Социальное взаимодействие | \`POST /social/stats\` → \`POST /social/articles/{id}/like\` → \`POST /social/articles/{id}/comments\` |
| 4 | Администрирование | \`GET /admin/stats\` → \`GET /admin/users\` → \`POST /admin/users/{id}/block\` |
    `,
    contact: {
      name: 'Волна Dev',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Локальный сервер (проксируется Vite на порт 3001)',
    },
    {
      url: 'http://localhost:3001/api',
      description: 'Прямое подключение к серверу',
    },
  ],
  tags: [
    {
      name: 'Лента',
      description: 'Получение городов, тем и новостной ленты',
    },
    {
      name: 'Авторизация',
      description: 'Регистрация, вход, профиль пользователя',
    },
    {
      name: 'Социальные функции',
      description: 'Лайки и комментарии к статьям',
    },
    {
      name: 'Администрирование',
      description: 'Управление пользователями, комментариями и статистикой (только для администратора)',
    },
    {
      name: 'Служебные',
      description: 'Проверка работоспособности сервера',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT-токен, полученный при входе или регистрации',
      },
    },
    schemas: {
      City: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'moscow', description: 'Уникальный идентификатор города' },
          name: { type: 'string', example: 'Москва' },
          region: { type: 'string', example: 'Москва' },
          timezone: { type: 'string', example: 'Europe/Moscow' },
        },
      },
      Topic: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'it', description: 'Уникальный идентификатор темы' },
          name: { type: 'string', example: 'IT / Разработка' },
          icon: { type: 'string', example: 'Cpu', description: 'Название иконки из Lucide React' },
          description: { type: 'string', example: 'Разработка, инфраструктура и IT-индустрия.' },
        },
      },
      FeedItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42, description: 'ID статьи в базе данных' },
          title: { type: 'string', example: 'Хакеры атаковали крупный банк через уязвимость в ПО' },
          description: { type: 'string', example: 'Специалисты по кибербезопасности раскрыли детали атаки...' },
          url: { type: 'string', format: 'uri', example: 'https://habr.com/ru/articles/123456/' },
          image: { type: 'string', format: 'uri', example: 'https://habr.com/img/article.jpg' },
          source: { type: 'string', example: 'Habr' },
          metaLabel: { type: 'string', example: '2 часа назад', description: 'Читаемая временная метка или дата события' },
          isEvent: { type: 'boolean', example: false, description: 'true для городских событий' },
          venue: { type: 'string', nullable: true, example: 'Стадион Лужники', description: 'Место проведения (только для событий)' },
          cityTag: { type: 'string', nullable: true, example: 'Москва', description: 'Город, если статья привязана к конкретному городу' },
        },
      },
      FeedResponse: {
        type: 'object',
        properties: {
          city: {
            type: 'object',
            properties: {
              slug: { type: 'string', example: 'moscow' },
              name: { type: 'string', example: 'Москва' },
              region: { type: 'string', example: 'Москва' },
            },
          },
          topic: {
            type: 'object',
            properties: {
              slug: { type: 'string', example: 'it' },
              name: { type: 'string', example: 'IT / Разработка' },
              description: { type: 'string' },
            },
          },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/FeedItem' },
          },
          sourcesCount: { type: 'integer', example: 8, description: 'Количество источников, из которых собрана лента' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-09-17T09:00:00.000Z' },
          cached: { type: 'boolean', example: true, description: 'true если лента взята из кэша' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          username: { type: 'string', example: 'ivan_petrov' },
          isAdmin: { type: 'boolean', example: false },
          isBlocked: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-01T12:00:00.000Z' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT-токен. Передавайте его в заголовке Authorization: Bearer <token>',
          },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 5 },
          body: { type: 'string', example: 'Интересная статья, спасибо!' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-17T10:30:00.000Z' },
          username: { type: 'string', example: 'ivan_petrov' },
          userId: { type: 'integer', example: 1 },
        },
      },
      SocialStats: {
        type: 'object',
        description: 'Объект, где ключ — ID статьи, значение — статистика',
        additionalProperties: {
          type: 'object',
          properties: {
            likesCount: { type: 'integer', example: 12 },
            commentsCount: { type: 'integer', example: 3 },
            likedByMe: { type: 'boolean', example: false, description: 'true если текущий пользователь поставил лайк' },
          },
        },
        example: {
          '42': { likesCount: 12, commentsCount: 3, likedByMe: false },
          '57': { likesCount: 1, commentsCount: 0, likedByMe: true },
        },
      },
      AdminUser: {
        allOf: [
          { $ref: '#/components/schemas/User' },
          {
            type: 'object',
            properties: {
              is_admin: { type: 'boolean', example: false },
              is_blocked: { type: 'boolean', example: false },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      AdminComment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 5 },
          body: { type: 'string', example: 'Комментарий пользователя' },
          created_at: { type: 'string', format: 'date-time' },
          article_id: { type: 'integer', example: 42 },
          username: { type: 'string', example: 'ivan_petrov' },
          user_id: { type: 'integer', example: 1 },
        },
      },
      SearchStatsResponse: {
        type: 'object',
        properties: {
          topQueries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                city_name: { type: 'string', example: 'Москва' },
                topic_name: { type: 'string', example: 'IT / Разработка' },
                count: { type: 'integer', example: 42 },
              },
            },
          },
          timeline: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                period: { type: 'string', format: 'date-time', example: '2026-09-17T00:00:00.000Z' },
                count: { type: 'integer', example: 17 },
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Описание ошибки' },
        },
      },
    },
  },
  paths: {
    // ─── Служебные ────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Служебные'],
        summary: 'Проверка работоспособности сервера',
        description: 'Возвращает `{ ok: true }` если сервер запущен. Используйте для проверки перед тестированием.',
        operationId: 'healthCheck',
        responses: {
          200: {
            description: 'Сервер работает',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { ok: { type: 'boolean', example: true } } },
              },
            },
          },
        },
      },
    },

    // ─── Лента ────────────────────────────────────────────────────────────────
    '/cities': {
      get: {
        tags: ['Лента'],
        summary: 'Список всех доступных городов',
        description: 'Возвращает все города, для которых есть источники новостей. Используйте `slug` при запросе ленты.',
        operationId: 'listCities',
        responses: {
          200: {
            description: 'Список городов',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cities: { type: 'array', items: { $ref: '#/components/schemas/City' } },
                  },
                },
                example: {
                  cities: [
                    { slug: 'moscow', name: 'Москва', region: 'Москва', timezone: 'Europe/Moscow' },
                    { slug: 'spb', name: 'Санкт-Петербург', region: 'Санкт-Петербург', timezone: 'Europe/Moscow' },
                    { slug: 'ekb', name: 'Екатеринбург', region: 'Свердловская область', timezone: 'Asia/Yekaterinburg' },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/topics': {
      get: {
        tags: ['Лента'],
        summary: 'Список всех доступных тем',
        description: 'Возвращает 18 тем: IT, Кино, Спорт, Финансы и т.д. Используйте `slug` при запросе ленты.',
        operationId: 'listTopics',
        responses: {
          200: {
            description: 'Список тем',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    topics: { type: 'array', items: { $ref: '#/components/schemas/Topic' } },
                  },
                },
                example: {
                  topics: [
                    { slug: 'it', name: 'IT / Разработка', icon: 'Cpu', description: 'Разработка, инфраструктура и IT-индустрия.' },
                    { slug: 'sport', name: 'Спорт', icon: 'Trophy', description: 'Матчи, турниры и спортивные новости.' },
                    { slug: 'cinema', name: 'Кино / Сериалы', icon: 'Film', description: 'Премьеры, показы и киноновости.' },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/feed': {
      get: {
        tags: ['Лента'],
        summary: 'Получить ленту новостей',
        description: `Возвращает список статей для выбранного города и темы.

**Алгоритм работы:**
1. Ищет статьи в кэше (Redis или in-memory).
2. Если кэш свежий — возвращает его и запускает фоновое обновление.
3. Если кэш устарел — парсит источники в реальном времени, фильтрует нерелевантные статьи из общих СМИ (Интерфакс, РБК, Lenta.ru и др.), сохраняет в БД и возвращает результат.

**Популярные комбинации для тестирования:**
- \`moscow\` + \`it\`
- \`spb\` + \`events\`
- \`ekb\` + \`sport\`
- \`moscow\` + \`finance\``,
        operationId: 'getFeed',
        parameters: [
          {
            name: 'city',
            in: 'query',
            required: true,
            description: 'Slug города (из `/api/cities`)',
            schema: {
              type: 'string',
              enum: ['moscow', 'spb', 'ekb', 'nsk', 'kazan', 'nnv', 'krd', 'samara', 'vladivostok', 'tyumen'],
              example: 'moscow',
            },
          },
          {
            name: 'topic',
            in: 'query',
            required: true,
            description: 'Slug темы (из `/api/topics`)',
            schema: {
              type: 'string',
              enum: ['it', 'electronics', 'cinema', 'games', 'sport', 'finance', 'auto', 'music', 'art', 'health', 'science', 'realty', 'travel', 'fashion', 'crypto', 'politics', 'food', 'events'],
              example: 'it',
            },
          },
        ],
        responses: {
          200: {
            description: 'Лента новостей',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FeedResponse' },
              },
            },
          },
          400: {
            description: 'Не указан город или тема',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: {
            description: 'Город или тема не найдены',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/feed/refresh': {
      post: {
        tags: ['Лента'],
        summary: 'Принудительно обновить ленту',
        description: 'Игнорирует кэш и парсит все источники заново. Может занять 5–15 секунд. Полезно для тестирования фильтрации.',
        operationId: 'refreshFeed',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['city', 'topic'],
                properties: {
                  city: { type: 'string', example: 'moscow', description: 'Slug города' },
                  topic: { type: 'string', example: 'it', description: 'Slug темы' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Обновлённая лента',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FeedResponse' } } },
          },
          400: {
            description: 'Не указан город или тема',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    // ─── Авторизация ──────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Авторизация'],
        summary: 'Регистрация нового пользователя',
        description: `Создаёт аккаунт и возвращает JWT-токен.

**Требования:**
- Email должен быть уникальным
- Пароль — минимум 6 символов
- Имя пользователя — минимум 2 символа`,
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'username', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  username: { type: 'string', minLength: 2, example: 'ivan_petrov' },
                  password: { type: 'string', minLength: 6, example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Пользователь создан',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: {
            description: 'Ошибка валидации (email занят, слишком короткий пароль и т.д.)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Пользователь с таким email уже есть' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Авторизация'],
        summary: 'Вход в систему',
        description: `Возвращает JWT-токен при успешной аутентификации.

В поле \`email\` можно передавать как email, так и имя пользователя.

**Тестовый аккаунт администратора:** логин \`admin\`, пароль \`adminadmin\``,
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin', description: 'Email или имя пользователя' },
                  password: { type: 'string', example: 'adminadmin' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Успешный вход',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          401: {
            description: 'Неверные учётные данные или аккаунт заблокирован',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Неверный email или пароль' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Авторизация'],
        summary: 'Получить профиль текущего пользователя',
        description: 'Возвращает данные авторизованного пользователя по его JWT-токену.',
        operationId: 'getMe',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Данные текущего пользователя',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          401: {
            description: 'Токен не передан или недействителен',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Авторизация'],
        summary: 'Выйти из системы',
        description: 'Серверная сторона не хранит сессии — токен становится недействительным только на клиенте. Эндпоинт для совместимости.',
        operationId: 'logout',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Выход выполнен',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { ok: { type: 'boolean', example: true } } },
              },
            },
          },
          401: {
            description: 'Не авторизован',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    // ─── Социальные функции ───────────────────────────────────────────────────
    '/social/stats': {
      post: {
        tags: ['Социальные функции'],
        summary: 'Получить социальную статистику статей',
        description: `Возвращает количество лайков, комментариев и статус лайка текущего пользователя для списка статей.

Токен не обязателен — без авторизации \`likedByMe\` всегда будет \`false\`.

**Важно:** работает только для статей с числовым ID (из реальной базы), а не для статей из демо-ленты.`,
        operationId: 'getSocialStats',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['articleIds'],
                properties: {
                  articleIds: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [42, 57, 103],
                    description: 'Массив числовых ID статей',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Статистика по запрошенным статьям',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { stats: { $ref: '#/components/schemas/SocialStats' } },
                },
              },
            },
          },
        },
      },
    },
    '/social/articles/{id}/comments': {
      get: {
        tags: ['Социальные функции'],
        summary: 'Получить комментарии к статье',
        description: 'Возвращает все комментарии к статье, отсортированные по дате создания (от старых к новым). Авторизация не требуется.',
        operationId: 'listComments',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID статьи',
            schema: { type: 'integer', example: 42 },
          },
        ],
        responses: {
          200: {
            description: 'Список комментариев',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
                  },
                },
              },
            },
          },
          400: {
            description: 'Некорректный ID',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      post: {
        tags: ['Социальные функции'],
        summary: 'Добавить комментарий к статье',
        description: `Создаёт новый комментарий. **Требует авторизации.**

**Ограничения:**
- Минимум 2 символа
- Максимум 1000 символов`,
        operationId: 'addComment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID статьи',
            schema: { type: 'integer', example: 42 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['body'],
                properties: {
                  body: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 1000,
                    example: 'Очень интересная статья, спасибо автору!',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Комментарий добавлен',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { comment: { $ref: '#/components/schemas/Comment' } },
                },
              },
            },
          },
          400: {
            description: 'Слишком короткий/длинный комментарий или статья не найдена',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: {
            description: 'Не авторизован',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/social/articles/{id}/like': {
      post: {
        tags: ['Социальные функции'],
        summary: 'Поставить / снять лайк',
        description: `Переключает лайк для статьи (toggle): если лайк уже стоит — убирает, если нет — ставит. **Требует авторизации.**

Возвращает актуальную статистику статьи после переключения.`,
        operationId: 'toggleLike',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID статьи',
            schema: { type: 'integer', example: 42 },
          },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { type: 'object', description: 'Тело запроса не требуется' },
            },
          },
        },
        responses: {
          200: {
            description: 'Статус лайка переключён',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    liked: { type: 'boolean', example: true, description: 'true — лайк поставлен, false — снят' },
                    likesCount: { type: 'integer', example: 13 },
                    commentsCount: { type: 'integer', example: 3 },
                    likedByMe: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          400: {
            description: 'Статья не найдена',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: {
            description: 'Не авторизован',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    // ─── Администрирование ────────────────────────────────────────────────────
    '/admin/stats': {
      get: {
        tags: ['Администрирование'],
        summary: 'Статистика поисковых запросов',
        description: `Возвращает топ популярных запросов (город + тема) и временной график поисковой активности.

**Только для администратора.** Логин: \`admin\`, пароль: \`adminadmin\``,
        operationId: 'getAdminStats',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            required: false,
            description: 'Период для статистики',
            schema: {
              type: 'string',
              enum: ['day', 'week', 'month'],
              default: 'week',
              example: 'week',
            },
          },
        ],
        responses: {
          200: {
            description: 'Статистика',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SearchStatsResponse' },
                example: {
                  topQueries: [
                    { city_name: 'Москва', topic_name: 'IT / Разработка', count: 42 },
                    { city_name: 'Санкт-Петербург', topic_name: 'Спорт', count: 18 },
                  ],
                  timeline: [
                    { period: '2026-09-17T00:00:00.000Z', count: 25 },
                    { period: '2026-09-16T00:00:00.000Z', count: 31 },
                  ],
                },
              },
            },
          },
          401: { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Нет прав администратора', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Администрирование'],
        summary: 'Список всех пользователей',
        description: 'Возвращает полный список пользователей системы с флагами `is_admin` и `is_blocked`. **Только для администратора.**',
        operationId: 'listUsers',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Список пользователей',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: { type: 'array', items: { $ref: '#/components/schemas/AdminUser' } },
                  },
                },
              },
            },
          },
          401: { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Нет прав администратора', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/users/{id}/block': {
      post: {
        tags: ['Администрирование'],
        summary: 'Заблокировать / разблокировать пользователя',
        description: `Устанавливает или снимает блокировку пользователя. Заблокированный пользователь не может войти в систему.

**Нельзя заблокировать администратора.** **Только для администратора.**`,
        operationId: 'blockUser',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID пользователя',
            schema: { type: 'integer', example: 2 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  blocked: {
                    type: 'boolean',
                    example: true,
                    description: 'true — заблокировать, false — разблокировать',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Статус изменён',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { ok: { type: 'boolean', example: true } } },
              },
            },
          },
          400: { description: 'Некорректный ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Нет прав администратора', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/comments': {
      get: {
        tags: ['Администрирование'],
        summary: 'Список всех комментариев',
        description: 'Возвращает последние 100 комментариев по всем статьям с именами авторов. **Только для администратора.**',
        operationId: 'listAllComments',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Список комментариев',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    comments: { type: 'array', items: { $ref: '#/components/schemas/AdminComment' } },
                  },
                },
              },
            },
          },
          401: { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Нет прав администратора', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/comments/{id}': {
      delete: {
        tags: ['Администрирование'],
        summary: 'Удалить комментарий',
        description: 'Безвозвратно удаляет комментарий по ID. **Только для администратора.**',
        operationId: 'deleteComment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID комментария',
            schema: { type: 'integer', example: 5 },
          },
        ],
        responses: {
          200: {
            description: 'Результат удаления',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    deleted: { type: 'boolean', example: true, description: 'true — удалён, false — не найден' },
                  },
                },
              },
            },
          },
          400: { description: 'Некорректный ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Нет прав администратора', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};
