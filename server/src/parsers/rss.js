import Parser from 'rss-parser';
import { config } from '../config.js';
import { normalizeUrl, parseDate, pickImage, stripHtml, titleKey, truncate } from '../services/normalize.js';

const parser = new Parser({
  timeout: config.parseTimeoutMs,
  headers: {
    'User-Agent': 'VolnaAggregator/0.1 (+https://localhost)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
});

function imageFromHtml(html) {
  const match = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
}

export async function parseRss(source) {
  const rssUrl = source.parser_config?.rss_url || source.url;
  const feed = await parser.parseURL(rssUrl);
  const isEvent = Boolean(source.parser_config?.is_event);

  return (feed.items || []).slice(0, config.maxArticlesPerSource).map((item) => {
    const html = item['content:encoded'] || item.content || item.contentSnippet || item.summary || '';
    return {
      source_id: source.id,
      title: stripHtml(item.title || ''),
      description: truncate(item.contentSnippet || item.summary || html, 400),
      url: normalizeUrl(item.link, rssUrl),
      image_url: pickImage(item) || imageFromHtml(html),
      published_at: parseDate(item.isoDate || item.pubDate),
      topic_id: source.topic_id,
      city_id: source.city_id,
      is_event: isEvent,
      venue: null,
      title_key: titleKey(item.title),
    };
  }).filter((item) => item.title && item.url);
}
