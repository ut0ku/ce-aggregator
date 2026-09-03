import { ChevronDown, Check } from 'lucide-react';

export default function DropdownSelect({
  label,
  icon: Icon,
  value,
  open,
  setOpen,
  options,
  onSelect,
  renderOption,
  tk,
  align = 'left',
}) {
  return (
    <div className="relative min-w-0">
      <p className={`mb-1 text-[11px] uppercase tracking-[0.24em] ${tk.sub}`}>{label}</p>
      <button
        onClick={() => setOpen((state) => !state)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl border text-sm font-medium ${tk.border} ${tk.card} ${tk.hover} ${tk.shadow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon size={15} className={tk.accent} />}
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown size={15} className={`${tk.sub} shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-[min(18rem,calc(100vw-2rem))] max-h-[min(20rem,calc(100vh-6rem))] overflow-y-auto rounded-2xl border ${tk.border} ${tk.card} ${tk.shadow} z-20 p-1`}
          >
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  role="option"
                  aria-selected={selected}
                  onClick={() => onSelect(option)}
                  className={`w-full flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-sm ${tk.hover}`}
                >
                  <span className="min-w-0">
                    <span className={selected ? 'font-semibold' : ''}>{renderOption ? renderOption(option) : option.value}</span>
                    {option.hint && <span className={`block text-xs mt-0.5 ${tk.sub}`}>{option.hint}</span>}
                  </span>
                  {selected && <Check size={15} className={tk.accent} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}