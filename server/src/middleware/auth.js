import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { findUserById } from '../services/auth.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '30d' });
}

async function userFromToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return await findUserById(payload.sub);
  } catch {
    return null;
  }
}

export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = await userFromToken(token);
  next();
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = await userFromToken(token);
  if (!req.user) {
    res.status(401).json({ error: 'Нужна регистрация или вход' });
    return;
  }
  next();
}
