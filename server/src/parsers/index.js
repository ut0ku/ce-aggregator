import { parseRss } from './rss.js';
import { parseHtml } from './html.js';
import { parseApi } from './api.js';
import { parsePlaywright } from './playwright.js';
import { config } from '../config.js';

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout: ${label}`)), config.parseTimeoutMs);
    }),
  ]);
}

export async function parseSource(source, city) {
  const engine = source.parser_config?.engine || source.type;
  const label = `${source.name} (${engine})`;

  if (engine === 'playwright') return withTimeout(parsePlaywright(source), label);
  if (source.type === 'rss') return withTimeout(parseRss(source), label);
  if (source.type === 'html') return withTimeout(parseHtml(source), label);
  if (source.type === 'api') return withTimeout(parseApi(source, city), label);

  throw new Error(`Unsupported source type: ${source.type}`);
}
