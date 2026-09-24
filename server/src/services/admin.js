import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';

// ─── Admin user bootstrap ────────────────────────────────────────────────────

export async function ensureAdminUser() {
  const { rows } = await pool.query("SELECT id, is_admin FROM users WHERE email = 'admin@volna.local'");

  if (rows[0]) {
    // Ensure the admin flag is set (in case the column was added after the user was created)
    if (!rows[0].is_admin) {
      await pool.query("UPDATE users SET is_admin = true WHERE email = 'admin@volna.local'");
      console.log('Admin user updated: is_admin = true');
    }
    return;
  }

  const hash = await bcrypt.hash('adminadmin', 10);
  await pool.query(
    `INSERT INTO users (email, username, password_hash, is_admin)
     VALUES ('admin@volna.local', 'admin', $1, true)`,
    [hash],
  );
  console.log('Admin user created: login=admin  password=adminadmin');
}

// ─── Search tracking ─────────────────────────────────────────────────────────

export function trackSearch(citySlug, topicSlug) {
  pool
    .query('INSERT INTO search_events (city_slug, topic_slug) VALUES ($1, $2)', [citySlug, topicSlug])
    .catch(() => {});
}

// ─── Stats ───────────────────────────────────────────────────────────────────

const INTERVALS = { day: '1 day', week: '7 days', month: '30 days' };
const TRUNCS = { day: 'hour', week: 'day', month: 'day' };

export async function getSearchStats(period = 'week') {
  const interval = INTERVALS[period] || INTERVALS.week;
  const trunc = TRUNCS[period] || TRUNCS.week;

  const [topQ, timelineQ] = await Promise.all([
    pool.query(
      `SELECT
          COALESCE(c.name, se.city_slug) AS city_name,
          COALESCE(t.name, se.topic_slug) AS topic_name,
          COUNT(*)::int AS count
       FROM search_events se
       LEFT JOIN cities c ON c.slug = se.city_slug
       LEFT JOIN topics t ON t.slug = se.topic_slug
       WHERE se.searched_at >= NOW() - INTERVAL '${interval}'
       GROUP BY se.city_slug, se.topic_slug, c.name, t.name
       ORDER BY count DESC LIMIT 20`,
    ),
    pool.query(
      `SELECT DATE_TRUNC($1, searched_at) AS period, COUNT(*)::int AS count
       FROM search_events
       WHERE searched_at >= NOW() - INTERVAL '${interval}'
       GROUP BY period ORDER BY period`,
      [trunc],
    ),
  ]);

  return {
    topQueries: topQ.rows,
    timeline: timelineQ.rows,
  };
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function listAllComments() {
  const { rows } = await pool.query(
    `SELECT c.id, c.body, c.created_at, c.article_id, u.username, u.id AS user_id
     FROM article_comments c
     JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC LIMIT 100`,
  );
  return rows;
}

export async function deleteComment(commentId) {
  const { rowCount } = await pool.query('DELETE FROM article_comments WHERE id = $1', [commentId]);
  return rowCount > 0;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function listUsers() {
  const { rows } = await pool.query(
    `SELECT id, email, username, is_admin, is_blocked, created_at
     FROM users ORDER BY created_at DESC`,
  );
  return rows;
}

export async function setUserBlocked(userId, blocked) {
  await pool.query('UPDATE users SET is_blocked = $1 WHERE id = $2 AND is_admin = false', [blocked, userId]);
}
