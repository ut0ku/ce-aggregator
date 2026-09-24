import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sql = await readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database schema is ready.');
  await pool.end();
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
