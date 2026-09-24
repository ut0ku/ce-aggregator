import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function AuthModal({ open, onClose, onLogin, onRegister, tk }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode('login');
    setEmail('');
    setUsername('');
    setPassword('');
    setError('');
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const formData = new FormData(event.currentTarget);
    const nextEmail = String(formData.get('email') || '').trim();
    const nextPassword = String(formData.get('password') || '').trim();
    const nextUsername = String(formData.get('username') || '').trim();

    if (!nextEmail || !nextPassword || (mode === 'register' && !nextUsername)) {
      setError('Заполните все поля');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'register') {
        await onRegister({ email: nextEmail, username: nextUsername, password: nextPassword });
      } else {
        await onLogin({ email: nextEmail, password: nextPassword });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Не удалось выполнить вход');
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

        <h2 className="font-serif text-2xl font-semibold">
          {mode === 'register' ? 'Регистрация' : 'Вход'}
        </h2>
        <p className={`mt-2 text-sm ${tk.sub}`}>
          {mode === 'register'
            ? 'Создайте аккаунт, чтобы ставить лайки и оставлять комментарии.'
            : 'Войдите, чтобы ставить лайки и оставлять комментарии.'}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="block">
              <span className={`mb-1 block text-xs uppercase tracking-[0.2em] ${tk.sub}`}>Имя</span>
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
          )}

          <label className="block">
            <span className={`mb-1 block text-xs uppercase tracking-[0.2em] ${tk.sub}`}>
              {mode === 'register' ? 'Email' : 'Email или имя пользователя'}
            </span>
            <input
              type={mode === 'register' ? 'email' : 'text'}
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${tk.border} ${tk.bg}`}
            />
          </label>

          <label className="block">
            <span className={`mb-1 block text-xs uppercase tracking-[0.2em] ${tk.sub}`}>Пароль</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              minLength={6}
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
            {submitting ? 'Подождите…' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <p className={`mt-4 text-center text-sm ${tk.sub}`}>
          {mode === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setError('');
            }}
            className={`font-medium underline-offset-2 hover:underline ${tk.accent}`}
          >
            {mode === 'register' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </div>
    </div>
  );
}
