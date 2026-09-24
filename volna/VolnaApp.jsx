import { useEffect, useMemo, useState } from 'react';
import { CITIES, TOPICS } from './data';
import { buildFeed } from './utils';
import { getThemeTokens } from './theme';
import Header from './components/Header';
import FeedList from './components/FeedList';
import SkeletonBlock from './components/SkeletonBlock';
import Footer from './components/Footer';

export default function VolnaApp() {
  const [dark, setDark] = useState(false);
  const [city, setCity] = useState(CITIES[0]);
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const [cityOpen, setCityOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const tk = getThemeTokens(dark);
  const activeTopic = TOPICS.find((topic) => topic.id === topicId);
  const feed = useMemo(() => buildFeed(topicId, city), [topicId, city]);
  const sourcesCount = useMemo(() => new Set(feed.map((item) => item.source)).size, [feed]);
  const [featured, ...rest] = feed;

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [topicId, city]);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  return (
    <div className={`min-h-screen ${tk.bg} ${tk.text} font-sans`}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pulse-dot { animation: none; }
        }
      `}</style>

      <Header
        dark={dark}
        setDark={setDark}
        tk={tk}
        scrolled={scrolled}
        city={city}
        setCity={setCity}
        cityOpen={cityOpen}
        setCityOpen={setCityOpen}
        topicId={topicId}
        setTopicId={setTopicId}
        topicOpen={topicOpen}
        setTopicOpen={setTopicOpen}
        cities={CITIES}
        topics={TOPICS}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-[11rem] sm:pt-[12rem] pb-8">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            {activeTopic && <activeTopic.icon size={20} className={tk.accent} />}
            <h1 className="text-xl font-semibold">{activeTopic?.name}</h1>
          </div>
          <p className={`mt-1.5 text-sm ${tk.sub}`}>
            Город: {city.name} · Источников: {sourcesCount}
          </p>
        </div>

        {loading ? <SkeletonBlock tk={tk} /> : <FeedList featured={featured} rest={rest} tk={tk} />}
      </main>

      <Footer tk={tk} />
    </div>
  );
}