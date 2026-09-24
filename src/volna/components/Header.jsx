import { Sun, Moon, LogIn, LogOut, Shield, UserRound } from 'lucide-react';
import DropdownSelect from './DropdownSelect.jsx';

export default function Header({
  dark,
  toggleTheme,
  tk,
  scrolled,
  city,
  setCity,
  cityOpen,
  setCityOpen,
  topicId,
  setTopicId,
  topicOpen,
  setTopicOpen,
  cities,
  topics,
  user,
  onAuthClick,
  onLogout,
  onProfileClick,
  onAdminClick,
}) {
  const activeTopic = topics.find((topic) => topic.id === topicId) || topics[0];

  const authButton = user ? (
    <div className="flex items-center gap-2">
      <span className={`hidden max-w-[8rem] truncate text-xs sm:inline ${tk.sub}`}>{user.username}</span>
      {user.isAdmin && (
        <button
          type="button"
          onClick={onAdminClick}
          aria-label="Панель администратора"
          className={`inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border ${tk.border} ${tk.card} ${tk.hover}`}
        >
          <Shield size={15} className={tk.accent} />
        </button>
      )}
      <button
        type="button"
        onClick={onProfileClick}
        aria-label="Профиль"
        title="Профиль"
        className={`inline-flex h-[42px] items-center gap-1.5 rounded-full border px-3 text-xs font-medium ${tk.border} ${tk.card} ${tk.hover}`}
      >
        <UserRound size={15} />
        <span className="hidden sm:inline">Профиль</span>
      </button>
      <button
        type="button"
        onClick={onLogout}
        aria-label="Выйти"
        className={`inline-flex h-[42px] items-center gap-1.5 rounded-full border px-3 text-xs font-medium ${tk.border} ${tk.card} ${tk.hover}`}
      >
        <LogOut size={15} />
        <span className="hidden sm:inline">Выйти</span>
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={onAuthClick}
      className={`inline-flex h-[42px] items-center gap-1.5 rounded-full border px-3 text-xs font-medium ${tk.border} ${tk.card} ${tk.hover}`}
    >
      <LogIn size={15} />
      <span>Войти</span>
    </button>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b ${tk.border} ${tk.bg} transition-[box-shadow] duration-300 ease-out ${scrolled ? 'shadow-[0_10px_30px_rgba(0,0,0,0.06)]' : ''}`}
    >
      <div className={`relative mx-auto max-w-3xl overflow-visible px-4 sm:px-6 transition-[height,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'h-[3.5rem] py-2' : 'h-[10.5rem] sm:h-[8.5rem] py-2'}`}>
        <div
          className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${tk.accentBg} animate-pulse`} aria-hidden="true" />
            <span className="font-serif text-xl font-semibold tracking-tight">Волна</span>
          </div>
        </div>

        <div
          className={`absolute inset-x-4 sm:inset-x-6 inset-y-2 flex items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex w-full flex-col justify-center gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${tk.accentBg} animate-pulse`} aria-hidden="true" />
                <span className="font-serif text-xl font-semibold tracking-tight">Волна</span>
              </div>
              <p className={`max-w-md font-[family-name:Georgia] text-[11px] sm:text-xs leading-relaxed ${tk.sub}`}>
                Единая лента городских событий и новостей по выбранной теме и городу.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] items-end gap-2.5 sm:gap-3 lg:min-w-[36rem]">
              <div className="min-w-0">
                <DropdownSelect
                  label="Темы"
                  icon={activeTopic.icon}
                  value={activeTopic.name}
                  open={topicOpen}
                  setOpen={(next) => {
                    setTopicOpen(next);
                    if (next) setCityOpen(false);
                  }}
                  options={topics.map((topic) => ({ value: topic.id, label: topic.name, hint: 'Поток контента' }))}
                  onSelect={(option) => {
                    setTopicId(option.value);
                    setTopicOpen(false);
                  }}
                  renderOption={(option) => topics.find((topic) => topic.id === option.value)?.name || option.label}
                  tk={tk}
                  align="left"
                />
              </div>

              <div className="min-w-0">
                <DropdownSelect
                  label="Город"
                  value={city.name}
                  open={cityOpen}
                  setOpen={(next) => {
                    setCityOpen(next);
                    if (next) setTopicOpen(false);
                  }}
                  options={cities.map((item) => ({ value: item.name, label: item.name, hint: item.region }))}
                  onSelect={(option) => {
                    const nextCity = cities.find((item) => item.name === option.value);
                    if (nextCity) setCity(nextCity);
                    setCityOpen(false);
                  }}
                  renderOption={(option) => option.label}
                  tk={tk}
                  align="right"
                />
              </div>

              <div className="flex min-w-[3rem] flex-col items-start">
                <p className={`mb-1 text-[11px] uppercase tracking-[0.24em] ${tk.sub}`}>Тема</p>
                <button
                  onClick={toggleTheme}
                  aria-label="Переключить тему"
                  className={`h-[42px] w-[42px] rounded-full border ${tk.border} ${tk.card} ${tk.hover} ${tk.shadow} flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
                >
                  {dark ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              </div>

              <div className="flex min-w-[5rem] flex-col items-start">
                <p className={`mb-1 text-[11px] uppercase tracking-[0.24em] ${tk.sub}`}>Аккаунт</p>
                {authButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
