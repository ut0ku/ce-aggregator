import { Router } from 'express';
import { getFeed, listCities, listTopics, refreshFeed } from '../services/aggregator.js';
import { trackSearch } from '../services/admin.js';

export const router = Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.get('/cities', asyncHandler(async (_req, res) => {
  res.json({ cities: await listCities() });
}));

router.get('/topics', asyncHandler(async (_req, res) => {
  res.json({ topics: await listTopics() });
}));

router.get('/feed', asyncHandler(async (req, res) => {
  const city = String(req.query.city || '');
  const topic = String(req.query.topic || '');
  if (!city || !topic) {
    res.status(400).json({ error: 'city and topic are required' });
    return;
  }

  const feed = await getFeed(city, topic);
  if (!feed) {
    res.status(404).json({ error: 'Unknown city or topic' });
    return;
  }
  trackSearch(city, topic);
  res.json(feed);
}));

router.post('/feed/refresh', asyncHandler(async (req, res) => {
  const city = String(req.body?.city || req.query.city || '');
  const topic = String(req.body?.topic || req.query.topic || '');
  if (!city || !topic) {
    res.status(400).json({ error: 'city and topic are required' });
    return;
  }
  const feed = await refreshFeed(city, topic);
  res.json(feed);
}));
