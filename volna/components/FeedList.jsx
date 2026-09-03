import MetaRow from './MetaRow';

export function FeaturedStory({ item, tk }) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-video w-full overflow-hidden rounded-3xl border border-transparent">
        <img src={item.image} alt="" className="w-full h-full object-cover" />
      </div>
      <h2 className="font-serif mt-4 text-2xl sm:text-3xl font-semibold leading-tight">
        <span className="group-hover:underline">{item.title}</span>
      </h2>
      <p className={`mt-2 text-sm sm:text-base ${tk.sub}`}>{item.description}</p>
      <MetaRow item={item} tk={tk} />
    </div>
  );
}

export function FeedItem({ item, tk }) {
  return (
    <div className="py-5 flex gap-4 group cursor-pointer">
      <img src={item.image} alt="" className="w-28 h-20 sm:w-32 sm:h-24 object-cover rounded-2xl flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="font-medium leading-snug">
          <span className="group-hover:underline">{item.title}</span>
        </h3>
        <p className={`mt-1 text-sm ${tk.sub}`}>{item.description}</p>
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