import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { addComment, getSocialStats, listComments, toggleLike } from '../services/social.js';

export const socialRouter = Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

socialRouter.use(optionalAuth);

socialRouter.post('/stats', asyncHandler(async (req, res) => {
  const articleIds = (req.body?.articleIds || [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  const stats = await getSocialStats(articleIds, req.user?.id || null);
  res.json({ stats });
}));

socialRouter.get('/articles/:id/comments', asyncHandler(async (req, res) => {
  const articleId = Number(req.params.id);
  if (!Number.isInteger(articleId)) {
    res.status(400).json({ error: 'Некорректный id статьи' });
    return;
  }
  const comments = await listComments(articleId);
  res.json({ comments });
}));

socialRouter.post('/articles/:id/comments', requireAuth, asyncHandler(async (req, res) => {
  const articleId = Number(req.params.id);
  if (!Number.isInteger(articleId)) {
    res.status(400).json({ error: 'Некорректный id статьи' });
    return;
  }
  try {
    const comment = await addComment(articleId, req.user.id, req.body?.body);
    res.status(201).json({ comment });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Не удалось добавить комментарий' });
  }
}));

socialRouter.post('/articles/:id/like', requireAuth, asyncHandler(async (req, res) => {
  const articleId = Number(req.params.id);
  if (!Number.isInteger(articleId)) {
    res.status(400).json({ error: 'Некорректный id статьи' });
    return;
  }
  const result = await toggleLike(articleId, req.user.id);
  const stats = await getSocialStats([articleId], req.user.id);
  res.json({ ...result, ...stats[articleId] });
}));
