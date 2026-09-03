import { MapPin } from 'lucide-react';

export default function MetaRow({ item, tk, compact }) {
  return (
    <div className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 ${compact ? 'text-xs' : 'text-sm'} ${tk.sub}`}>
      <span className={`font-medium ${tk.sourceText}`}>{item.source}</span>
      <span>·</span>
      <span className={item.isEvent ? `font-medium ${tk.amber}` : ''}>{item.metaLabel}</span>
      {item.cityTag && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${tk.border} ${tk.card}`}>
          <MapPin size={10} />
          {item.venue ? `${item.venue}, ${item.cityTag}` : item.cityTag}
        </span>
      )}
    </div>
  );
}