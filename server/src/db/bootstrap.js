import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function bootstrapDatabase() {
  await pool.query('SELECT 1');

  const sql = await readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);

  const [{ rows: topicRows }, { rows: sourceRows }] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM topics'),
    pool.query('SELECT COUNT(*)::int AS count FROM sources'),
  ]);

  if (topicRows[0].count === 0 || sourceRows[0].count === 0) {
    console.warn('Database is empty. Run: npm run seed --prefix server');
  }
}
