import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';

const SALT_ROUNDS = 10;

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    isAdmin: Boolean(row.is_admin),
    isBlocked: Boolean(row.is_blocked),
    createdAt: row.created_at,
  };
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, username, is_admin, is_blocked, created_at FROM users WHERE id = $1',
    [id],
  );
  if (!rows[0]) return null;
  if (rows[0].is_blocked) return null; // blocked = can't authenticate
  return publicUser(rows[0]);
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] || null;
}

export async function registerUser({ email, username, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  if (!normalizedEmail || !normalizedUsername || !password) {
    throw new Error('Заполните email, имя и пароль');
  }
  if (password.length < 6) {
    throw new Error('Пароль должен быть не короче 6 символов');
  }
  if (normalizedUsername.length < 2) {
    throw new Error('Имя слишком короткое');
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('Пользователь с таким email уже есть');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (email, username, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, username, created_at`,
    [normalizedEmail, normalizedUsername, passwordHash],
  );
  return publicUser(rows[0]);
}

export async function loginUser({ email, password }) {
  const input = (email || '').trim().toLowerCase();
  if (!input || !password) throw new Error('Заполните поля');

  // Accept both email and username (e.g. login "admin")
  // ORDER BY is_admin DESC so the admin user is preferred if usernames collide
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1 OR username = $1 ORDER BY is_admin DESC LIMIT 1',
    [input],
  );
  const row = rows[0];
  if (!row) throw new Error('Неверный email или пароль');
  if (row.is_blocked) throw new Error('Аккаунт заблокирован');

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) throw new Error('Неверный email или пароль');

  return publicUser(row);
}

export async function updateUserProfile(userId, { email, username }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedUsername = (username || '').trim();

  if (!normalizedEmail || !normalizedUsername) {
    throw new Error('Заполните email и имя');
  }
  if (normalizedUsername.length < 2) {
    throw new Error('Имя слишком короткое');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Некорректный email');
  }

  const emailConflict = await pool.query(
    'SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1',
    [normalizedEmail, userId],
  );
  if (emailConflict.rows[0]) {
    throw new Error('Пользователь с таким email уже есть');
  }

  const usernameConflict = await pool.query(
    'SELECT id FROM users WHERE username = $1 AND id <> $2 LIMIT 1',
    [normalizedUsername, userId],
  );
  if (usernameConflict.rows[0]) {
    throw new Error('Пользователь с таким логином уже есть');
  }

  const { rows } = await pool.query(
    `UPDATE users
     SET email = $1, username = $2
     WHERE id = $3
     RETURNING id, email, username, is_admin, is_blocked, created_at`,
    [normalizedEmail, normalizedUsername, userId],
  );

  if (!rows[0]) {
    throw new Error('Профиль не найден');
  }

  return publicUser(rows[0]);
}
