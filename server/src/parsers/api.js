import { config } from '../config.js';
import { parseDate, stripHtml, titleKey, truncate } from '../services/normalize.js';

const KUDAGO_BASE = 'https://kudago.com/public-api/v1.4/events/';

async function parseKudago(source, city) {
  const location = city?.kudago_slug;
  if (!location) return [];

  const params = new URLSearchParams({
    location,
    page_size: String(config.maxArticlesPerSource),
    order_by: '-publication_date',
    actual_since: String(Math.floor(Date.now() / 1000)),
    text_format: 'text',
    expand: 'place',
    fields: 'id,title,description,short_title,site_url,images,dates,place,categories',
  });

  const categories = source.parser_config?.categories;
  if (categories) params.set('categories', categories);

  const response = await fetch(`${KUDAGO_BASE}?${params}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(config.parseTimeoutMs),
  });
  if (!response.ok) {
    throw new Error(`KudaGo ${response.status}`);
  }

  const payload = await response.json();
  return (payload.results || []).map((item) => {
    const start = item.dates?.[0]?.start;
    const publishedAt = parseDate(start ? start * 1000 : null);
    return {
      source_id: source.id,
      title: stripHtml(item.title || item.short_title || ''),
      description: truncate(item.description || item.title || '', 400),
      url: item.site_url,
      image_url: item.images?.[0]?.image || null,
      published_at: publishedAt,
      topic_id: source.topic_id,
      city_id: city.id,
      is_event: true,
      venue: item.place?.title || null,
      title_key: titleKey(item.title),
    };
  }).filter((item) => item.title && item.url);
}

async function parseHackerNews(source) {
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
    signal: AbortSignal.timeout(config.parseTimeoutMs),
  });
  if (!response.ok) throw new Error(`Hacker News ${response.status}`);
  const ids = (await response.json()).slice(0, 20);
  const stories = await Promise.all(
    ids.map(async (id) => {
      const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        signal: AbortSignal.timeout(config.parseTimeoutMs),
      });
      return itemResponse.ok ? itemResponse.json() : null;
    }),
  );

  return stories
    .filter((item) => item?.title && item?.url)
    .slice(0, config.maxArticlesPerSource)
    .map((item) => ({
      source_id: source.id,
      title: stripHtml(item.title),
      description: truncate(item.title, 400),
      url: item.url,
      image_url: null,
      published_at: parseDate(item.time ? item.time * 1000 : null),
      topic_id: source.topic_id,
      city_id: source.city_id,
      is_event: false,
      venue: null,
      title_key: titleKey(item.title),
    }));
}

async function parseArxiv(source) {
  const query = source.parser_config?.query || 'cat:cs.AI+OR+cat:physics.gen-ph';
  const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=${config.maxArticlesPerSource}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/atom+xml' },
    signal: AbortSignal.timeout(config.parseTimeoutMs),
  });
  if (!response.ok) throw new Error(`arXiv ${response.status}`);
  const xml = await response.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

  return entries.map((match) => {
    const block = match[1];
    const pick = (tag) => {
      const found = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return found ? stripHtml(found[1]) : '';
    };
    const link = block.match(/<id>([^<]+)<\/id>/)?.[1] || '';
    const title = pick('title');
    return {
      source_id: source.id,
      title,
      description: truncate(pick('summary'), 400),
      url: link,
      image_url: null,
      published_at: parseDate(pick('published')),
      topic_id: source.topic_id,
      city_id: source.city_id,
      is_event: false,
      venue: null,
      title_key: titleKey(title),
    };
  }).filter((item) => item.title && item.url);
}

export async function parseApi(source, city) {
  const provider = source.parser_config?.provider || 'kudago';
  if (provider === 'kudago') return parseKudago(source, city);
  if (provider === 'hackernews') return parseHackerNews(source);
  if (provider === 'arxiv') return parseArxiv(source);
  throw new Error(`Unknown API provider: ${provider}`);
}
