import * as cheerio from 'cheerio';
import { parseRss } from './rss.js';
import { config } from '../config.js';
import { normalizeUrl, parseDate, stripHtml, titleKey, truncate } from '../services/normalize.js';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(config.parseTimeoutMs),
  });
  if (!response.ok) {
    throw new Error(`HTML fetch failed ${response.status} for ${url}`);
  }
  return response.text();
}

function text($, node, selector, attr) {
  if (!selector) return '';
  const el = node.find(selector).first().length ? node.find(selector).first() : node;
  if (attr) return el.attr(attr) || '';
  return el.text() || el.attr('content') || '';
}

export async function parseHtml(source) {
  const selectors = source.parser_config?.selectors || {};
  const pageUrl = source.parser_config?.list_url || source.url;
  const html = await fetchHtml(pageUrl);
  const $ = cheerio.load(html);
  const rssHref = $('link[type="application/rss+xml"], link[type="application/atom+xml"]').attr('href');

  if (rssHref) {
    try {
      return await parseRss({
        ...source,
        parser_config: {
          ...source.parser_config,
          rss_url: normalizeUrl(rssHref, pageUrl),
        },
      });
    } catch {
      // Fall through to HTML selectors if autodiscovery fails.
    }
  }

  const itemSelector = selectors.item || 'article';
  const isEvent = Boolean(source.parser_config?.is_event);
  const items = [];

  $(itemSelector).each((_, el) => {
    if (items.length >= config.maxArticlesPerSource) return;
    const node = $(el);
    const title = stripHtml(text($, node, selectors.title));
    const link = text($, node, selectors.link, selectors.link_attr || 'href') || node.find('a').attr('href');
    const url = normalizeUrl(link, pageUrl);
    if (!title || !url) return;

    items.push({
      source_id: source.id,
      title,
      description: truncate(text($, node, selectors.description), 400),
      url,
      image_url: normalizeUrl(text($, node, selectors.image, selectors.image_attr || 'src'), pageUrl) || null,
      published_at: parseDate(text($, node, selectors.date, selectors.date_attr)),
      topic_id: source.topic_id,
      city_id: source.city_id,
      is_event: isEvent,
      venue: stripHtml(text($, node, selectors.venue)) || null,
      title_key: titleKey(title),
    });
  });

  return items;
}
