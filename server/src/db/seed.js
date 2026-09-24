import { pool } from './pool.js';
import { SOURCES, TOPICS } from './sources.catalog.js';

const CITIES = [
  { slug: 'moscow', name: 'Москва', region: 'Москва', timezone: 'Europe/Moscow', kudago_slug: 'msk' },
  { slug: 'spb', name: 'Санкт-Петербург', region: 'Санкт-Петербург', timezone: 'Europe/Moscow', kudago_slug: 'spb' },
  { slug: 'ekb', name: 'Екатеринбург', region: 'Свердловская область', timezone: 'Asia/Yekaterinburg', kudago_slug: 'ekb' },
  { slug: 'nsk', name: 'Новосибирск', region: 'Новосибирская область', timezone: 'Asia/Novosibirsk', kudago_slug: 'nsk' },
  { slug: 'kazan', name: 'Казань', region: 'Татарстан', timezone: 'Europe/Moscow', kudago_slug: 'kazan' },
  { slug: 'nnv', name: 'Нижний Новгород', region: 'Нижегородская область', timezone: 'Europe/Moscow', kudago_slug: 'nnv' },
  { slug: 'krd', name: 'Краснодар', region: 'Краснодарский край', timezone: 'Europe/Moscow', kudago_slug: 'krd' },
  { slug: 'samara', name: 'Самара', region: 'Самарская область', timezone: 'Europe/Samara', kudago_slug: 'smr' },
  { slug: 'vladivostok', name: 'Владивосток', region: 'Приморский край', timezone: 'Asia/Vladivostok', kudago_slug: 'vladivostok' },
  { slug: 'tyumen', name: 'Тюмень', region: 'Тюменская область', timezone: 'Asia/Yekaterinburg', kudago_slug: 'tyumen' },
];

async function upsertCities() {
  for (const city of CITIES) {
    await pool.query(
      `INSERT INTO cities (slug, name, region, timezone, kudago_slug)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         region = EXCLUDED.region,
         timezone = EXCLUDED.timezone,
         kudago_slug = EXCLUDED.kudago_slug`,
      [city.slug, city.name, city.region, city.timezone, city.kudago_slug],
    );
  }
}

async function upsertTopics() {
  for (const topic of TOPICS) {
    await pool.query(
      `INSERT INTO topics (slug, name, icon, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         icon = EXCLUDED.icon,
         description = EXCLUDED.description`,
      [topic.slug, topic.name, topic.icon, topic.description],
    );
  }
}

async function upsertSources() {
  const topics = await pool.query('SELECT id, slug FROM topics');
  const cities = await pool.query('SELECT id, slug FROM cities');
  const topicIds = Object.fromEntries(topics.rows.map((row) => [row.slug, row.id]));
  const cityIds = Object.fromEntries(cities.rows.map((row) => [row.slug, row.id]));

  await pool.query('DELETE FROM articles');
  await pool.query('DELETE FROM sources');

  for (const source of SOURCES) {
    const topicId = topicIds[source.topic];
    if (!topicId) continue;
    const cityId = source.city ? cityIds[source.city] || null : null;
    await pool.query(
      `INSERT INTO sources (name, url, type, topic_id, city_id, parser_config, is_active)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, TRUE)`,
      [source.name, source.url, source.type, topicId, cityId, JSON.stringify(source.parser_config)],
    );
  }
}

async function seed() {
  await upsertCities();
  await upsertTopics();
  await upsertSources();
  console.log(`Seeded ${CITIES.length} cities, ${TOPICS.length} topics, ${SOURCES.length} sources.`);
  await pool.end();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
