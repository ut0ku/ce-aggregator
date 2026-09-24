import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { router } from './routes/api.js';
import { authRouter } from './routes/auth.js';
import { socialRouter } from './routes/social.js';
import { adminRouter } from './routes/admin.js';
import { startWorker } from './worker.js';
import { ensureAdminUser } from './services/admin.js';
import { bootstrapDatabase } from './db/bootstrap.js';
import { swaggerSpec } from './swagger.js';

const app = express();

app.use(cors());
app.use(express.json());

// ─── Swagger UI (CDN, без npm-зависимости) ───────────────────────────────────
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

app.get('/api/docs', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🌊 Волна API — Swagger</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; }
    .topbar { background: #f59e0b !important; }
    .topbar-wrapper .link img { display: none; }
    .topbar-wrapper .link::before { content: '🌊 Волна API'; color: #fff; font-size: 1.2rem; font-weight: 700; }
    .swagger-ui .info .title { color: #d97706; }
    .swagger-ui .opblock-tag { font-size: 0.95rem; font-weight: 600; }
    .swagger-ui .info .description p { font-size: 0.95rem; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => { req.credentials = 'include'; return req; },
    });
  </script>
</body>
</html>`);
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', router);
app.use('/api/auth', authRouter);
app.use('/api/social', socialRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || 'Internal error' });
});

async function start() {
  try {
    await bootstrapDatabase();
  } catch (error) {
    console.error('Database connection failed. Check DATABASE_URL in server/.env');
    console.error(error.message || error);
    process.exit(1);
  }

  app.listen(config.port, async () => {
    console.log(`Volna API listening on http://localhost:${config.port}`);
    startWorker();
    await ensureAdminUser().catch((err) => console.error('ensureAdminUser:', err));
  });
}

start();
