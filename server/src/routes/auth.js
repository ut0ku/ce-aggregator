import { Router } from 'express';
import { loginUser, registerUser, updateUserProfile } from '../services/auth.js';
import { optionalAuth, requireAuth, signToken } from '../middleware/auth.js';

export const authRouter = Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

authRouter.post('/register', asyncHandler(async (req, res) => {
  try {
    const user = await registerUser(req.body || {});
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Не удалось зарегистрироваться' });
  }
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  try {
    const user = await loginUser(req.body || {});
    const token = signToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message || 'Неверный email или пароль' });
  }
}));

authRouter.get('/me', optionalAuth, asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Не авторизован' });
    return;
  }
  res.json({ user: req.user });
}));

authRouter.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user.id, req.body || {});
  res.json({ user });
}));

authRouter.post('/logout', requireAuth, asyncHandler(async (_req, res) => {
  res.json({ ok: true });
}));
