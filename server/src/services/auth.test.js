import test from 'node:test';
import assert from 'node:assert/strict';
import { updateUserProfile } from './auth.js';
import { pool } from '../db/pool.js';

test('updateUserProfile changes username and email for the same user', async () => {
  const originalQuery = pool.query;
  const userId = 42;
  const updatedEmail = `profile_${Date.now()}@example.com`;
  const updatedUsername = `user_${Date.now()}`;

  pool.query = async (sql, params = []) => {
    if (sql.includes('SELECT id FROM users WHERE email = $1 AND id <> $2')) {
      assert.equal(params[0], updatedEmail);
      assert.equal(params[1], userId);
      return { rows: [] };
    }

    if (sql.includes('SELECT id FROM users WHERE username = $1 AND id <> $2')) {
      assert.equal(params[0], updatedUsername);
      assert.equal(params[1], userId);
      return { rows: [] };
    }

    if (sql.includes('UPDATE users')) {
      return {
        rows: [{
          id: userId,
          email: updatedEmail,
          username: updatedUsername,
          is_admin: false,
          is_blocked: false,
          created_at: new Date('2024-01-01T00:00:00Z'),
        }],
      };
    }

    return { rows: [] };
  };

  try {
    const updated = await updateUserProfile(userId, {
      email: updatedEmail,
      username: updatedUsername,
    });

    assert.equal(updated.id, userId);
    assert.equal(updated.email, updatedEmail);
    assert.equal(updated.username, updatedUsername);
    assert.equal(updated.isAdmin, false);
  } finally {
    pool.query = originalQuery;
  }
});
