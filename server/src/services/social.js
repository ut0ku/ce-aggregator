import { pool } from '../db/pool.js';

async function ensureArticle(articleId) {
  const { rows } = await pool.query('SELECT id FROM articles WHERE id = $1', [articleId]);
  if (!rows[0]) {
    throw new Error('Статья не найдена');
  }
}

export async function getSocialStats(articleIds, userId = null) {
  if (!articleIds.length) return {};

  const likes = await pool.query(
    `SELECT article_id, COUNT(*)::int AS count
     FROM article_likes
     WHERE article_id = ANY($1::int[])
     GROUP BY article_id`,
    [articleIds],
  );

  const comments = await pool.query(
    `SELECT article_id, COUNT(*)::int AS count
     FROM article_comments
     WHERE article_id = ANY($1::int[])
     GROUP BY article_id`,
    [articleIds],
  );

  let liked = new Set();
  if (userId) {
    const mine = await pool.query(
      'SELECT article_id FROM article_likes WHERE user_id = $1 AND article_id = ANY($2::int[])',
      [userId, articleIds],
    );
    liked = new Set(mine.rows.map((row) => row.article_id));
  }

  const likesMap = Object.fromEntries(likes.rows.map((row) => [row.article_id, row.count]));
  const commentsMap = Object.fromEntries(comments.rows.map((row) => [row.article_id, row.count]));

  return Object.fromEntries(
    articleIds.map((id) => [
      id,
      {
        likesCount: likesMap[id] || 0,
        commentsCount: commentsMap[id] || 0,
        likedByMe: liked.has(id),
      },
    ]),
  );
}

export async function toggleLike(articleId, userId) {
  await ensureArticle(articleId);

  const existing = await pool.query(
    'SELECT id FROM article_likes WHERE article_id = $1 AND user_id = $2',
    [articleId, userId],
  );

  if (existing.rows[0]) {
    await pool.query('DELETE FROM article_likes WHERE article_id = $1 AND user_id = $2', [articleId, userId]);
    return { liked: false };
  }

  await pool.query(
    'INSERT INTO article_likes (article_id, user_id) VALUES ($1, $2)',
    [articleId, userId],
  );
  return { liked: true };
}

export async function listComments(articleId) {
  await ensureArticle(articleId);
  const { rows } = await pool.query(
    `SELECT c.id, c.body, c.created_at, u.username, u.id AS user_id
     FROM article_comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.article_id = $1
     ORDER BY c.created_at ASC`,
    [articleId],
  );

  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    username: row.username,
    userId: row.user_id,
  }));
}

export async function addComment(articleId, userId, body) {
  const text = String(body || '').trim();
  if (text.length < 2) {
    throw new Error('Комментарий слишком короткий');
  }
  if (text.length > 1000) {
    throw new Error('Комментарий слишком длинный');
  }

  await ensureArticle(articleId);
  const { rows } = await pool.query(
    `INSERT INTO article_comments (article_id, user_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, body, created_at`,
    [articleId, userId, text],
  );

  const user = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
  return {
    id: rows[0].id,
    body: rows[0].body,
    createdAt: rows[0].created_at,
    username: user.rows[0].username,
    userId,
  };
}
