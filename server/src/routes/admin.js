import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  deleteComment,
  getSearchStats,
  listAllComments,
  listUsers,
  setUserBlocked,
} from '../services/admin.js';

export const adminRouter = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  next();
}

adminRouter.use(requireAuth, requireAdmin);

// Stats
adminRouter.get('/stats', asyncHandler(async (req, res) => {
  const period = ['day', 'week', 'month'].includes(req.query.period) ? req.query.period : 'week';
  res.json(await getSearchStats(period));
}));

// Users
adminRouter.get('/users', asyncHandler(async (_req, res) => {
  res.json({ users: await listUsers() });
}));

adminRouter.post('/users/:id/block', asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Bad id' });
  const blocked = req.body?.blocked !== false;
  await setUserBlocked(userId, blocked);
  res.json({ ok: true });
}));

// Comments
adminRouter.get('/comments', asyncHandler(async (_req, res) => {
  res.json({ comments: await listAllComments() });
}));

adminRouter.delete('/comments/:id', asyncHandler(async (req, res) => {
  const commentId = Number(req.params.id);
  if (!Number.isInteger(commentId)) return res.status(400).json({ error: 'Bad id' });
  const deleted = await deleteComment(commentId);
  res.json({ deleted });
}));
