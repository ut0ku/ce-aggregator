const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(value, max = 280) {
  const text = stripHtml(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function titleKey(title = '') {
  return stripHtml(title)
    .toLowerCase()
    .replace(/[«»"'“”.,:;!?()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeUrl(url, baseUrl) {
  if (!url) return '';
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return String(url).trim();
  }
}

export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number') {
    const fromUnix = value < 10_000_000_000 ? value * 1000 : value;
    const date = new Date(fromUnix);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function relativeTimeLabel(date) {
  if (!date) return 'недавно';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return '1 час назад';
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export function eventDateLabel(date) {
  if (!date) return 'скоро';
  const weekday = WEEKDAYS[date.getDay()];
  const label = `${weekday}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function pickImage(item = {}) {
  return (
    item.image ||
    item.image_url ||
    item.enclosure?.url ||
    item['media:content']?.$.url ||
    item['media:thumbnail']?.$.url ||
    null
  );
}

export function topicPlaceholderImage(topicSlug, articleId = 1) {
  const seed = `volna-${topicSlug || 'news'}-${articleId}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/600`;
}

export function toFeedItem(article, cityName, topicSlug) {
  const publishedAt = parseDate(article.published_at);
  return {
    id: article.id,
    title: article.title,
    description: truncate(article.description || '', 320),
    source: article.source_name,
    url: article.url,
    image: article.image_url || topicPlaceholderImage(topicSlug, article.id),
    isEvent: Boolean(article.is_event),
    metaLabel: article.is_event ? eventDateLabel(publishedAt) : relativeTimeLabel(publishedAt),
    cityTag: article.city_id ? cityName : null,
    venue: article.venue || null,
  };
}

export function dedupeArticles(items) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  const unique = [];

  for (const item of items) {
    const url = (item.url || '').split('?')[0].replace(/\/$/, '').toLowerCase();
    const key = item.title_key || titleKey(item.title);
    if (!url || seenUrls.has(url) || (key && seenTitles.has(key))) continue;
    seenUrls.add(url);
    if (key) seenTitles.add(key);
    unique.push(item);
  }

  return unique;
}
