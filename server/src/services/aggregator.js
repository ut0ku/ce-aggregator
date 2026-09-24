import { pool } from '../db/pool.js';
import { cacheGet, cacheSet } from '../cache.js';
import { config } from '../config.js';
import { parseSource } from '../parsers/index.js';
import { enqueueParse } from '../queue.js';
import { dedupeArticles, toFeedItem } from './normalize.js';
import { isRussianArticle } from './language.js';
import { rankArticles } from './ranking.js';
import { filterByTopic, isTopicRelevant } from './topicFilter.js';

const FEED_CACHE_VERSION = 'v5';

function feedCacheKey(citySlug, topicSlug) {
  return `feed:${FEED_CACHE_VERSION}:${citySlug}:${topicSlug}`;
}

async function getCity(slugOrName) {
  const { rows } = await pool.query(
    'SELECT * FROM cities WHERE slug = $1 OR name = $1 LIMIT 1',
    [slugOrName],
  );
  return rows[0] || null;
}

async function getTopic(slug) {
  const { rows } = await pool.query('SELECT * FROM topics WHERE slug = $1 LIMIT 1', [slug]);
  return rows[0] || null;
}

async function getSources(topicId, cityId) {
  const { rows } = await pool.query(
    `SELECT *
     FROM sources
     WHERE is_active = TRUE
       AND topic_id = $1
       AND (city_id IS NULL OR city_id = $2)
     ORDER BY city_id NULLS FIRST, id`,
    [topicId, cityId],
  );
  return rows;
}

async function loadFreshArticles(topicId, cityId) {
  const { rows } = await pool.query(
    `SELECT a.*, s.name AS source_name, s.url AS source_url
     FROM articles a
     JOIN sources s ON s.id = a.source_id
     WHERE a.topic_id = $1
       AND (a.city_id IS NULL OR a.city_id = $2)
       AND a.cached_at > NOW() - ($3 || ' seconds')::interval
     ORDER BY a.published_at DESC NULLS LAST, a.cached_at DESC
     LIMIT 80`,
    [topicId, cityId, String(config.cacheTtlSeconds)],
  );
  return rows;
}

async function saveArticles(items) {
  if (!items.length) return;
  const values = [];
  const params = [];

  items.forEach((item, index) => {
    const offset = index * 11;
    values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, NOW())`);
    params.push(
      item.source_id,
      item.title,
      item.description,
      item.url,
      item.image_url,
      item.published_at,
      item.topic_id,
      item.city_id,
      item.is_event,
      item.venue,
      item.title_key,
    );
  });

  await pool.query(
    `INSERT INTO articles
      (source_id, title, description, url, image_url, published_at, topic_id, city_id, is_event, venue, title_key, cached_at)
     VALUES ${values.join(', ')}
     ON CONFLICT (url) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       image_url = COALESCE(EXCLUDED.image_url, articles.image_url),
       published_at = COALESCE(EXCLUDED.published_at, articles.published_at),
       is_event = EXCLUDED.is_event,
       venue = COALESCE(EXCLUDED.venue, articles.venue),
       cached_at = NOW()`,
    params,
  );
}

async function mapSettled(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = { status: 'fulfilled', value: await mapper(items[index]) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function parseAllSources(sources, city, topicSlug) {
  const results = await mapSettled(sources, 5, (source) => parseSource(source, city));
  const items = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      // Filter out off-topic articles from general news sources
      const filtered = filterByTopic(result.value, topicSlug, sources[index].url);
      items.push(...filtered);
      return;
    }
    console.warn(`Source failed: ${sources[index].name}`, result.reason?.message || result.reason);
  });

  return dedupeArticles(
    items.filter((item) => item.title && item.url && isRussianArticle(item)),
  );
}

function buildFeedPayload(city, topic, articles) {
  // Second-pass relevance filter for articles already in DB from general sources
  const relevant = articles.filter((article) =>
    isTopicRelevant(article, topic.slug, article.source_url || ''),
  );
  const ranked = rankArticles(relevant, { cityId: city.id, topicSlug: topic.slug, citySlug: city.slug });
  return {
    city: { slug: city.slug, name: city.name, region: city.region },
    topic: { slug: topic.slug, name: topic.name, description: topic.description },
    sourcesCount: new Set(ranked.map((item) => item.source_id)).size,
    items: ranked.map((item) => toFeedItem(item, city.name, topic.slug)),
    updatedAt: new Date().toISOString(),
  };
}

export async function refreshFeed(citySlug, topicSlug) {
  const city = await getCity(citySlug);
  const topic = await getTopic(topicSlug);
  if (!city || !topic) {
    throw new Error('Unknown city or topic');
  }

  const sources = await getSources(topic.id, city.id);
  const parsed = await parseAllSources(sources, city, topic.slug);
  await saveArticles(parsed);

  const articles = await loadFreshArticles(topic.id, city.id);
  const feed = buildFeedPayload(city, topic, articles);

  await cacheSet(feedCacheKey(city.slug, topic.slug), feed);
  return feed;
}

export async function getFeed(citySlug, topicSlug) {
  const cacheKey = feedCacheKey(citySlug, topicSlug);
  const cached = await cacheGet(cacheKey);
  if (cached?.items?.length) {
    const cleanedItems = cached.items.filter((item) =>
      isTopicRelevant(item, topicSlug, item.source_url || item.url || ''),
    );
    if (cleanedItems.length) {
      return { ...cached, items: cleanedItems, cached: true };
    }
  }

  const city = await getCity(citySlug);
  const topic = await getTopic(topicSlug);
  if (!city || !topic) return null;

  const fresh = await loadFreshArticles(topic.id, city.id);
  if (fresh.length >= config.minFreshArticles) {
    const feed = buildFeedPayload(city, topic, fresh);
    await cacheSet(cacheKey, feed);
    enqueueParse({ citySlug: city.slug, topicSlug: topic.slug }).catch(() => {});
    return { ...feed, cached: true };
  }

  try {
    return await refreshFeed(city.slug, topic.slug);
  } catch (error) {
    console.warn(`Feed refresh failed for ${city.slug}/${topic.slug}:`, error.message || error);
    const feed = buildFeedPayload(city, topic, fresh);
    return { ...feed, cached: false, partial: true };
  }
}

export async function listCities() {
  const { rows } = await pool.query('SELECT slug, name, region, timezone FROM cities ORDER BY id');
  return rows;
}

export async function listTopics() {
  const { rows } = await pool.query('SELECT slug, name, icon, description FROM topics ORDER BY id');
  return rows;
}
