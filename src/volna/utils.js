import { CONTENT, RELATIVE_TIMES, EVENT_OFFSETS } from './data.js';

export function relativeTimeLabel(index) {
  return RELATIVE_TIMES[index % RELATIVE_TIMES.length];
}

export function eventDateLabel(index) {
  const date = new Date();
  date.setDate(date.getDate() + EVENT_OFFSETS[index % EVENT_OFFSETS.length]);
  const label = date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function expandDescription(item, city) {
  const locationPart = item.needsCity ? ` Для ${city.name} это особенно актуально.` : '';
  const eventPart = item.isEvent
    ? ' Организаторы обещают подробности по времени, формату и участникам в ближайшие дни. Отдельно уточняют логистику, состав гостей и сценарий для посетителей.'
    : ' В материале есть дополнительный контекст, чтобы быстрее понять суть и важность темы. Поясняются причины, возможные последствия и то, как это может сказаться на повседневной жизни.';

  const detailPart = item.isEvent
    ? ' Дополнительно приводятся советы по тому, когда лучше приходить и на что обратить внимание на площадке.'
    : ' Также даётся короткий разбор ключевых деталей, чтобы новость можно было прочитать без лишних переходов.';

  return `${item.description}${locationPart}${eventPart}${detailPart}`;
}

function fallbackArticleUrl(item, topicId, index) {
  const query = encodeURIComponent(`${item.title} ${item.source}`);
  return `https://www.google.com/search?q=${query}`;
}

export function buildFeed(topicId, city) {
  const items = CONTENT[topicId] || CONTENT.it || [];
  return items.map((item, index) => ({
    ...item,
    id: `${topicId}-${index}`,
    url: item.url || fallbackArticleUrl(item, topicId, index),
    image: `https://picsum.photos/seed/${topicId}-${index}-v2/${index === 0 ? '420/280' : '900/600'}`,
    metaLabel: item.isEvent ? eventDateLabel(index) : relativeTimeLabel(index),
    cityTag: item.needsCity ? city.name : null,
    description: expandDescription(item, city),
  }));
}