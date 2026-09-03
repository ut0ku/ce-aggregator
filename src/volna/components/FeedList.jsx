import MetaRow from './MetaRow.jsx';

export function FeaturedStory({ item, tk }) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl border border-transparent">
        <img src={item.image} alt="" className="w-full h-full object-cover" />
      </div>
      <h2 className="font-serif mt-5 text-2xl sm:text-3xl font-semibold leading-tight">
        <span className="group-hover:underline">{item.title}</span>
      </h2>
      <p className={`mt-3 text-sm sm:text-base leading-relaxed ${tk.sub}`}>{item.description}</p>
      <MetaRow item={item} tk={tk} />
    </div>
  );
}

export function FeedItem({ item, tk }) {
  return (
    <div className="group flex cursor-pointer flex-col gap-4 py-6 sm:flex-row sm:gap-5">
      <img src={item.image} alt="" className="aspect-[16/10] w-full rounded-3xl object-cover sm:h-56 sm:w-80 sm:flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-semibold leading-snug">
          <span className="group-hover:underline">{item.title}</span>
        </h3>
        <p className={`mt-2 text-sm sm:text-base leading-relaxed ${tk.sub}`}>{item.description}</p>
        <MetaRow item={item} tk={tk} compact />
      </div>
    </div>
  );
}

export default function FeedList({ featured, rest, tk }) {
  return (
    <div>
      {featured && <FeaturedStory item={featured} tk={tk} />}
      <div className={`mt-8 divide-y ${tk.divide}`}>
        {rest.map((item) => (
          <FeedItem key={item.id} item={item} tk={tk} />
        ))}
      </div>
    </div>
  );
}