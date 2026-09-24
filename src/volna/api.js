let authTokenGetter = () => null;

export function setAuthTokenGetter(getter) {
  authTokenGetter = getter;
}

function authHeaders() {
  const token = authTokenGetter();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function apiErrorMessage(response, payload) {
  if (payload.error) return payload.error;
  if (response.status === 500 || response.status === 502 || response.status === 503) {
    return 'Сервер недоступен. Запустите backend: npm run dev:all';
  }
  return `Ошибка API (${response.status})`;
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(apiErrorMessage(response, payload));
  }
  return payload;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error('Сервер недоступен. Запустите backend: npm run dev:all');
  }
  return parseResponse(response);
}

export async function apiGet(path) {
  return request(path, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function apiPost(path, body) {
  return request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });
}

export async function apiPatch(path, body) {
  return request(path, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });
}

export function fetchCatalog() {
  return Promise.all([apiGet('/api/cities'), apiGet('/api/topics')]);
}

export function fetchFeed(citySlug, topicSlug) {
  const params = new URLSearchParams({ city: citySlug, topic: topicSlug });
  return apiGet(`/api/feed?${params}`);
}

export function fetchSocialStats(articleIds) {
  return apiPost('/api/social/stats', { articleIds }).then((payload) => payload.stats || {});
}

export function fetchComments(articleId) {
  return apiGet(`/api/social/articles/${articleId}/comments`);
}

export function postComment(articleId, body) {
  return apiPost(`/api/social/articles/${articleId}/comments`, { body });
}

export function toggleLike(articleId) {
  return apiPost(`/api/social/articles/${articleId}/like`, {});
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function apiDelete(path) {
  return request(path, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export function fetchAdminStats(period) {
  return apiGet(`/api/admin/stats?period=${period}`);
}

export function fetchAdminUsers() {
  return apiGet('/api/admin/users');
}

export function fetchAdminComments() {
  return apiGet('/api/admin/comments');
}

export function adminBlockUser(userId, blocked) {
  return apiPost(`/api/admin/users/${userId}/block`, { blocked });
}

export function adminDeleteComment(commentId) {
  return apiDelete(`/api/admin/comments/${commentId}`);
}
