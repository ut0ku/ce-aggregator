import { Sun, Moon } from 'lucide-react';
import DropdownSelect from './DropdownSelect';

export default function Header({
  dark,
  setDark,
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
}) {
  const activeTopic = topics.find((topic) => topic.id === topicId) || topics[0];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b ${tk.border} ${tk.bg} transition-[box-shadow] duration-300 ease-out ${scrolled ? 'shadow-[0_10px_30px_rgba(0,0,0,0.06)]' : ''}`}
    >
      <div className={`relative mx-auto max-w-3xl overflow-hidden px-4 sm:px-6 transition-[height,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'h-[3.5rem] py-2' : 'h-[8.75rem] sm:h-[9rem] py-2'}`}>
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
          className={`absolute inset-x-4 sm:inset-x-6 top-1.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${tk.accentBg} animate-pulse`} aria-hidden="true" />
                <span className="font-serif text-xl font-semibold tracking-tight">Волна</span>
              </div>
              <p className={`max-w-md font-[family-name:Georgia] text-[11px] sm:text-xs leading-relaxed ${tk.sub}`}>
                Единая лента городских событий и новостей по выбранной теме и городу.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end lg:min-w-[31rem] lg:items-end">
              <div className="min-w-0 flex-1">
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

              <div className="min-w-0 flex-1">
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

              <div className="flex flex-col min-w-[3rem] sm:items-start">
                <p className={`mb-1 text-[11px] uppercase tracking-[0.24em] ${tk.sub}`}>Тема</p>
                <button
                  onClick={() => setDark((value) => !value)}
                  aria-label="Переключить тему"
                  className={`h-[42px] w-[42px] rounded-full border ${tk.border} ${tk.card} ${tk.hover} ${tk.shadow} flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
