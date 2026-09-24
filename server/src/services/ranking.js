import { parseDate } from './normalize.js';
import { TOPIC_PATTERNS } from './topicFilter.js';

// Re-use the comprehensive patterns from topicFilter for scoring bonus
const TOPIC_KEYWORDS = TOPIC_PATTERNS;

const CITY_ALIASES = {
  spb: ['санкт-петербург', 'петербург', 'петербурге', 'спб'],
  moscow: ['москва', 'москве', 'москвы'],
  ekb: ['екатеринбург', 'екатеринбурге'],
  nsk: ['новосибирск', 'новосибирске'],
  kazan: ['казань', 'казани'],
};

function mentionsCity(text, citySlug) {
  const lower = text.toLowerCase();
  const aliases = CITY_ALIASES[citySlug] || [];
  return aliases.some((alias) => lower.includes(alias));
}

export function articleScore(article, cityId, topicSlug, citySlug) {
  let score = 0;
  const text = `${article.title || ''} ${article.description || ''}`;

  if (article.is_event && article.city_id === cityId) score += 2000;
  else if (article.is_event) score += 900;
  else if (article.city_id === cityId) score += 400;

  if (!article.is_event && mentionsCity(text, citySlug)) score += 350;

  const pattern = TOPIC_KEYWORDS[topicSlug];
  if (pattern?.test(text)) score += 250;

  if (topicSlug === 'music' && article.is_event) score += 500;

  return score;
}

export function rankArticles(articles, { cityId, topicSlug, citySlug }) {
  const now = Date.now();

  return [...articles].sort((a, b) => {
    const scoreDiff = articleScore(b, cityId, topicSlug, citySlug) - articleScore(a, cityId, topicSlug, citySlug);
    if (scoreDiff !== 0) return scoreDiff;

    const dateA = parseDate(a.published_at)?.getTime() ?? 0;
    const dateB = parseDate(b.published_at)?.getTime() ?? 0;

    if (a.is_event && b.is_event) {
      const futureA = dateA >= now - 86_400_000 ? dateA : Number.MAX_SAFE_INTEGER;
      const futureB = dateB >= now - 86_400_000 ? dateB : Number.MAX_SAFE_INTEGER;
      if (futureA !== futureB) return futureA - futureB;
    }

    return dateB - dateA;
  });
}
