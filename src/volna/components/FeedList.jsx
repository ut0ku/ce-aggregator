import MetaRow from './MetaRow.jsx';
import ArticleSocial from './ArticleSocial.jsx';

function CardLink({ item, className, children }) {
  if (!item.url) {
    return <div className={className}>{children}</div>;
  }

  return (
    <a href={item.url} target="_blank" rel="noreferrer" className={`${className} block`}>
      {children}
    </a>
  );
}

export function FeaturedStory({ item, tk, onAuthRequired }) {
  return (
    <article>
      <CardLink item={item} className="group cursor-pointer">
        <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl border border-transparent">
          <img src={item.image} alt="" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-serif mt-5 text-2xl sm:text-3xl font-semibold leading-tight">
          <span className="group-hover:underline">{item.title}</span>
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${tk.sub}`}>{item.description}</p>
        <MetaRow item={item} tk={tk} />
      </CardLink>
      <ArticleSocial articleId={item.id} tk={tk} onAuthRequired={onAuthRequired} />
    </article>
  );
}

export function FeedItem({ item, tk, onAuthRequired }) {
  return (
    <article>
      <CardLink item={item} className="group flex cursor-pointer flex-col gap-4 py-6 sm:flex-row sm:gap-5">
        <img src={item.image} alt="" className="aspect-[16/10] w-full rounded-3xl object-cover sm:h-56 sm:w-80 sm:flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold leading-snug">
            <span className="group-hover:underline">{item.title}</span>
          </h3>
          <p className={`mt-2 text-sm sm:text-base leading-relaxed ${tk.sub}`}>{item.description}</p>
          <MetaRow item={item} tk={tk} compact />
        </div>
      </CardLink>
      <ArticleSocial articleId={item.id} tk={tk} onAuthRequired={onAuthRequired} />
    </article>
  );
}

export default function FeedList({ featured, rest, tk, onAuthRequired }) {
  if (!featured && rest.length === 0) {
    return (
      <div className={`rounded-3xl border px-5 py-10 text-center text-sm ${tk.border} ${tk.card} ${tk.sub}`}>
        Пока нет материалов по этой теме. Попробуйте другую тему или город.
      </div>
    );
  }

  return (
    <div>
      {featured && <FeaturedStory item={featured} tk={tk} onAuthRequired={onAuthRequired} />}
      <div className={`mt-8 divide-y ${tk.divide}`}>
        {rest.map((item) => (
          <FeedItem key={item.id} item={item} tk={tk} onAuthRequired={onAuthRequired} />
        ))}
      </div>
    </div>
  );
}
