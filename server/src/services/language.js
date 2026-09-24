import { stripHtml } from './normalize.js';

const RU_TLD = ['.ru', '.by', '.su', '.рф', '.ua'];

const RU_DOMAINS = new Set([
  '4pda.to',
  'dev.by',
  'forklog.com',
  'bitnovosti.com',
  'crypto.ru',
  'coinspot.io',
  'gagadget.com',
  'kudago.com',
  'ticketscloud.com',
  'meduza.io',
  'moex.com',
  'eventbrite.ru',
  'settings.fm',
  'kot.sh',
  'all-events.ru',
]);

export function isRussianSource(url = '') {
  const normalized = String(url).toLowerCase();
  const host = normalized.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  if (RU_DOMAINS.has(host)) return true;
  if (RU_TLD.some((tld) => host.endsWith(tld))) return true;
  if (host === 'bbc.com' && normalized.includes('/russian')) return true;
  return false;
}

export function isRussianText(text = '') {
  const clean = stripHtml(text);
  if (!clean) return false;

  const cyrillic = (clean.match(/[а-яёА-ЯЁ]/g) || []).length;
  const latin = (clean.match(/[a-zA-Z]/g) || []).length;

  if (cyrillic === 0) return false;
  if (latin === 0) return true;
  return cyrillic >= latin * 0.6 && cyrillic >= 8;
}

export function isRussianArticle(item = {}) {
  const text = `${item.title || ''} ${item.description || ''}`;
  return isRussianText(text);
}
