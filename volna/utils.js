import { CONTENT, RELATIVE_TIMES, EVENT_OFFSETS } from './data';

export function relativeTimeLabel(index) {
  return RELATIVE_TIMES[index % RELATIVE_TIMES.length];
}

export function eventDateLabel(index) {
  const date = new Date();
  date.setDate(date.getDate() + EVENT_OFFSETS[index % EVENT_OFFSETS.length]);
  const label = date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildFeed(topicId, city) {
  const items = CONTENT[topicId] || [];
  return items.map((item, index) => ({
    ...item,
    id: `${topicId}-${index}`,
    image: `https://picsum.photos/seed/${topicId}-${index}-v2/900/600`,
    metaLabel: item.isEvent ? eventDateLabel(index) : relativeTimeLabel(index),
    cityTag: item.needsCity ? city.name : null,
  }));
}