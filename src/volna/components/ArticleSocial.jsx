import { useEffect, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { fetchComments, fetchSocialStats, postComment, toggleLike } from '../api.js';
import { useAuth } from '../authContext.jsx';

function isDbArticleId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function formatCommentDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ArticleSocial({ articleId, tk, onAuthRequired }) {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ likesCount: 0, commentsCount: 0, likedByMe: false });
  const [comments, setComments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const socialEnabled = isDbArticleId(articleId);

  useEffect(() => {
    if (!socialEnabled) return;

    let cancelled = false;
    fetchSocialStats([articleId])
      .then((nextStats) => {
        if (!cancelled) {
          setStats(nextStats[articleId] || { likesCount: 0, commentsCount: 0, likedByMe: false });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [articleId, socialEnabled]);

  useEffect(() => {
    if (!expanded || !socialEnabled) return;

    let cancelled = false;
    setLoadingComments(true);
    fetchComments(articleId)
      .then((payload) => {
        if (!cancelled) setComments(payload.comments || []);
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить комментарии');
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false);
      });

    return () => {
      cancelled = true;
    };
  }, [expanded, articleId, socialEnabled]);

  function requireAuth(action) {
    if (isAuthenticated) {
      action();
      return;
    }
    onAuthRequired?.();
  }

  async function handleLike(event) {
    event.preventDefault();
    event.stopPropagation();
    requireAuth(async () => {
      try {
        const result = await toggleLike(articleId);
        setStats({
          likesCount: result.likesCount,
          commentsCount: result.commentsCount,
          likedByMe: result.liked,
        });
      } catch (err) {
        setError(err.message || 'Не удалось поставить лайк');
      }
    });
  }

  async function handleSubmitComment(event) {
    event.preventDefault();
    const text = draft.trim();
    if (text.length < 2) return;

    requireAuth(async () => {
      setSubmitting(true);
      setError('');
      try {
        const result = await postComment(articleId, text);
        setComments((current) => [...current, result.comment]);
        setStats((current) => ({
          ...current,
          commentsCount: current.commentsCount + 1,
        }));
        setDraft('');
      } catch (err) {
        setError(err.message || 'Не удалось отправить комментарий');
      } finally {
        setSubmitting(false);
      }
    });
  }

  if (!socialEnabled) {
    return (
      <p className={`mt-3 text-xs ${tk.sub}`}>
        Лайки и комментарии доступны для материалов из базы после синхронизации ленты.
      </p>
    );
  }

  return (
    <div
      className="mt-4"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleLike}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${tk.border} ${stats.likedByMe ? `${tk.accentSoft} ${tk.accent}` : `${tk.card} ${tk.hover}`}`}
        >
          <Heart size={14} fill={stats.likedByMe ? 'currentColor' : 'none'} />
          {stats.likesCount}
        </button>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${tk.border} ${tk.card} ${tk.hover}`}
        >
          <MessageCircle size={14} />
          {stats.commentsCount}
        </button>

        {!isAuthenticated && (
          <span className={`text-xs ${tk.sub}`}>Войдите, чтобы лайкать и комментировать</span>
        )}
      </div>

      {expanded && (
        <div className={`mt-4 rounded-2xl border p-4 ${tk.border} ${tk.panel}`}>
          {loadingComments ? (
            <p className={`text-sm ${tk.sub}`}>Загрузка комментарие…</p>
          ) : comments.length === 0 ? (
            <p className={`text-sm ${tk.sub}`}>Пока нет комментариев. Будьте первым.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li key={comment.id} className={`rounded-xl border px-3 py-2 ${tk.border} ${tk.card}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{comment.username}</span>
                    <span className={`text-xs ${tk.sub}`}>{formatCommentDate(comment.createdAt)}</span>
                  </div>
                  <p className={`mt-1 text-sm leading-relaxed ${tk.sub}`}>{comment.body}</p>
                </li>
              ))}
            </ul>
          )}

          <form className="mt-4 space-y-2" onSubmit={handleSubmitComment}>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder={isAuthenticated ? 'Напишите комментарий…' : 'Войдите, чтобы оставить комментарий'}
              disabled={!isAuthenticated || submitting}
              className={`w-full resize-none rounded-2xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60 ${tk.border} ${tk.bg}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={!isAuthenticated || submitting || draft.trim().length < 2}
              className={`rounded-2xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${tk.accentBg}`}
            >
              {submitting ? 'Отправка…' : 'Отправить'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
