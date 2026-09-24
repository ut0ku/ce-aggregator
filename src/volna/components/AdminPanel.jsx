import { useEffect, useState } from 'react';
import { X, Shield, Trash2, Ban, CheckCircle2 } from 'lucide-react';
import {
  adminBlockUser,
  adminDeleteComment,
  fetchAdminComments,
  fetchAdminStats,
  fetchAdminUsers,
} from '../api.js';

const PERIODS = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
];

const TABS = [
  { id: 'stats', label: 'Статистика' },
  { id: 'users', label: 'Пользователи' },
  { id: 'comments', label: 'Комментарии' },
];

function formatDate(str) {
  return new Date(str).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' });
}

function TimelineChart({ data, period }) {
  if (!data?.length) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-gray-400">
        Нет данных за период
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  const W = 500;
  const H = 90;
  const pL = 28;
  const pR = 8;
  const pT = 8;
  const pB = 18;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const n = data.length;
  const barW = Math.max(2, cW / n - 1.5);
  const labelStep = Math.max(1, Math.floor(n / 8));

  const fmtLabel = (i) => {
    const d = new Date(data[i].period);
    if (period === 'day') return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">
        Всего запросов: <span className="font-semibold text-amber-500">{total}</span>
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pL}
            y1={pT + cH * (1 - f)}
            x2={W - pR}
            y2={pT + cH * (1 - f)}
            stroke="#888"
            strokeWidth="0.5"
            strokeDasharray="3,3"
            opacity="0.35"
          />
        ))}
        {data.map((d, i) => {
          const bH = (d.count / max) * cH;
          return (
            <rect
              key={i}
              x={pL + (i / n) * cW}
              y={pT + cH - bH}
              width={barW}
              height={bH}
              fill="#f59e0b"
              rx="1.5"
              opacity="0.85"
            />
          );
        })}
        <line x1={pL} y1={pT} x2={pL} y2={pT + cH} stroke="#888" strokeWidth="0.5" />
        <line x1={pL} y1={pT + cH} x2={W - pR} y2={pT + cH} stroke="#888" strokeWidth="0.5" />
        <text x={pL - 3} y={pT + 4} fontSize="8" fill="#888" textAnchor="end">
          {max}
        </text>
        <text x={pL - 3} y={pT + cH} fontSize="8" fill="#888" textAnchor="end">
          0
        </text>
        {data.map((_, i) =>
          i % labelStep === 0 ? (
            <text
              key={i}
              x={pL + (i / n) * cW + barW / 2}
              y={H - 3}
              fontSize="7"
              fill="#888"
              textAnchor="middle"
            >
              {fmtLabel(i)}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

export default function AdminPanel({ open, onClose, tk }) {
  const [tab, setTab] = useState('stats');
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || tab !== 'stats') return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchAdminStats(period)
      .then((d) => { if (!cancelled) setStats(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, tab, period]);

  useEffect(() => {
    if (!open || tab !== 'users') return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchAdminUsers()
      .then((d) => { if (!cancelled) setUsers(d.users || []); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, tab]);

  useEffect(() => {
    if (!open || tab !== 'comments') return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchAdminComments()
      .then((d) => { if (!cancelled) setComments(d.comments || []); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, tab]);

  async function handleBlock(userId, blocked) {
    try {
      await adminBlockUser(userId, blocked);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_blocked: blocked } : u)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await adminDeleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      setError(e.message);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

        <div className={`relative mt-8 mb-8 w-full max-w-4xl rounded-3xl border ${tk.border} ${tk.bg} ${tk.shadow}`}>
          {/* Header */}
          <div className={`sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b px-6 py-4 ${tk.border} ${tk.bg}`}>
            <div className="flex items-center gap-2">
              <Shield size={18} className={tk.accent} />
              <h2 className="font-serif text-xl font-semibold">Панель администратора</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className={`rounded-full p-1.5 ${tk.hover}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className={`flex border-b px-6 ${tk.border}`}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTab(t.id); setError(''); }}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? `border-amber-500 ${tk.accent}`
                    : `border-transparent ${tk.sub} ${tk.hover}`
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[400px] p-6">
            {error && (
              <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            )}

            {/* ── Stats ── */}
            {tab === 'stats' && (
              <div>
                <div className="mb-6 flex gap-2">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPeriod(p.value)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium ${tk.border} ${
                        period === p.value ? `${tk.accentSoft} ${tk.accent}` : `${tk.card} ${tk.hover}`
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className={`flex h-24 items-center justify-center text-sm ${tk.sub}`}>Загрузка…</div>
                ) : (
                  <>
                    <TimelineChart data={stats?.timeline} period={period} />

                    <h3 className="mb-3 mt-6 font-semibold">Топ запросов</h3>
                    {!stats?.topQueries?.length ? (
                      <p className={`text-sm ${tk.sub}`}>Нет данных</p>
                    ) : (
                      <div className={`overflow-hidden rounded-2xl border ${tk.border}`}>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={`text-left ${tk.card}`}>
                              <th className={`px-4 py-3 font-medium ${tk.sub}`}>Город</th>
                              <th className={`px-4 py-3 font-medium ${tk.sub}`}>Тема</th>
                              <th className={`px-4 py-3 text-right font-medium ${tk.sub}`}>Запросов</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${tk.divide}`}>
                            {stats.topQueries.map((q, i) => (
                              <tr key={i} className={tk.hover}>
                                <td className="px-4 py-3">{q.city_name}</td>
                                <td className="px-4 py-3">{q.topic_name}</td>
                                <td className={`px-4 py-3 text-right font-semibold ${tk.accent}`}>
                                  {q.count}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Users ── */}
            {tab === 'users' && (
              <div>
                {loading ? (
                  <div className={`text-sm ${tk.sub}`}>Загрузка…</div>
                ) : !users.length ? (
                  <p className={`text-sm ${tk.sub}`}>Нет пользователей</p>
                ) : (
                  <div className={`overflow-hidden rounded-2xl border ${tk.border}`}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`text-left ${tk.card}`}>
                          <th className={`px-4 py-3 font-medium ${tk.sub}`}>Имя</th>
                          <th className={`px-4 py-3 font-medium ${tk.sub}`}>Email</th>
                          <th className={`px-4 py-3 font-medium ${tk.sub}`}>Рег.</th>
                          <th className={`px-4 py-3 font-medium ${tk.sub}`}>Действие</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${tk.divide}`}>
                        {users.map((u) => (
                          <tr key={u.id} className={tk.hover}>
                            <td className="px-4 py-3 font-medium">
                              {u.username}
                              {u.is_admin && (
                                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${tk.accentSoft} ${tk.accent}`}>
                                  Адм
                                </span>
                              )}
                            </td>
                            <td className={`px-4 py-3 ${tk.sub}`}>{u.email}</td>
                            <td className={`px-4 py-3 ${tk.sub}`}>{formatDate(u.created_at)}</td>
                            <td className="px-4 py-3">
                              {!u.is_admin && (
                                <button
                                  type="button"
                                  onClick={() => handleBlock(u.id, !u.is_blocked)}
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
                                    u.is_blocked
                                      ? `${tk.border} ${tk.card} ${tk.hover}`
                                      : 'border-red-400/40 text-red-500 hover:bg-red-500/10'
                                  }`}
                                >
                                  {u.is_blocked ? (
                                    <><CheckCircle2 size={12} /> Разблокировать</>
                                  ) : (
                                    <><Ban size={12} /> Заблокировать</>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Comments ── */}
            {tab === 'comments' && (
              <div>
                {loading ? (
                  <div className={`text-sm ${tk.sub}`}>Загрузка…</div>
                ) : !comments.length ? (
                  <p className={`text-sm ${tk.sub}`}>Нет комментариев</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className={`flex items-start gap-3 rounded-2xl border p-4 ${tk.border} ${tk.card}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">{c.username}</span>
                            <span className={`text-xs ${tk.sub}`}>→ статья #{c.article_id}</span>
                            <span className={`text-xs ${tk.sub}`}>{formatDate(c.created_at)}</span>
                          </div>
                          <p className={`text-sm leading-relaxed ${tk.sub}`}>{c.body}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          aria-label="Удалить комментарий"
                          className="shrink-0 rounded-full p-1.5 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
