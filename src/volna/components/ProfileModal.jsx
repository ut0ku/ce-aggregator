import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function ProfileModal({ open, onClose, user, onSubmit, tk }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail(user?.email || '');
    setUsername(user?.username || '');
    setError('');
    setSubmitting(false);
  }, [open, user]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({ email, username });
      onClose();
    } catch (err) {
      setError(err.message || 'Не удалось обновить профиль');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full max-w-md rounded-3xl border p-6 ${tk.border} ${tk.card} ${tk.shadow}`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className={`absolute right-4 top-4 rounded-full p-1.5 ${tk.hover}`}
        >
          <X size={18} />
        </button>

        <h2 className="font-serif text-2xl font-semibold">Профиль</h2>
        <p className={`mt-2 text-sm ${tk.sub}`}>Измените имя и логин своего аккаунта.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className={`mb-1 block text-xs uppercase tracking-[0.2em] ${tk.sub}`}>Логин</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              minLength={2}
              className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${tk.border} ${tk.bg}`}
            />
          </label>

          <label className="block">
            <span className={`mb-1 block text-xs uppercase tracking-[0.2em] ${tk.sub}`}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${tk.border} ${tk.bg}`}
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white ${tk.accentBg} disabled:opacity-60`}
          >
            {submitting ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}
