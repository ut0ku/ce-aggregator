import { config } from '../config.js';
import { normalizeUrl, parseDate, stripHtml, titleKey, truncate } from '../services/normalize.js';

export async function parsePlaywright(source) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error('Playwright is not installed. Run: npm install playwright --prefix server && npx playwright install chromium');
  }

  const selectors = source.parser_config?.selectors || {};
  const pageUrl = source.parser_config?.list_url || source.url;
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(config.parseTimeoutMs);
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    const itemSelector = selectors.item || 'article';
    await page.waitForSelector(itemSelector, { timeout: config.parseTimeoutMs }).catch(() => {});

    const rawItems = await page.$$eval(itemSelector, (nodes, sel) => (
      nodes.slice(0, 12).map((node) => {
        const pick = (selector, attr) => {
          if (!selector) return '';
          const el = node.querySelector(selector);
          if (!el) return '';
          return attr ? el.getAttribute(attr) || '' : el.textContent || '';
        };
        return {
          title: pick(sel.title),
          description: pick(sel.description),
          link: pick(sel.link, sel.link_attr || 'href') || node.querySelector('a')?.getAttribute('href') || '',
          image: pick(sel.image, sel.image_attr || 'src'),
          date: pick(sel.date, sel.date_attr),
          venue: pick(sel.venue),
        };
      })
    ), selectors);

    return rawItems.map((item) => {
      const title = stripHtml(item.title);
      const url = normalizeUrl(item.link, pageUrl);
      if (!title || !url) return null;
      return {
        source_id: source.id,
        title,
        description: truncate(item.description, 400),
        url,
        image_url: normalizeUrl(item.image, pageUrl) || null,
        published_at: parseDate(item.date),
        topic_id: source.topic_id,
        city_id: source.city_id,
        is_event: Boolean(source.parser_config?.is_event),
        venue: stripHtml(item.venue) || null,
        title_key: titleKey(title),
      };
    }).filter(Boolean);
  } finally {
    await browser.close();
  }
}
