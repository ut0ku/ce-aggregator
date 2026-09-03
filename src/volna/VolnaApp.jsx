import { useEffect, useMemo, useState } from 'react';
import { CITIES, TOPICS } from './data.js';
import { buildFeed } from './utils.js';
import { getThemeTokens } from './theme.js';
import Header from './components/Header.jsx';
import FeedList from './components/FeedList.jsx';
import SkeletonBlock from './components/SkeletonBlock.jsx';
import Footer from './components/Footer.jsx';

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
    let lastScrollY = window.scrollY;
    let frameId = 0;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      const isNearTop = currentScrollY < 8;
      const isScrollingDown = delta > 2;
      const isScrollingUp = delta < -10;

      if (isNearTop) {
        setScrolled(false);
      } else if (isScrollingDown) {
        setScrolled(currentScrollY > 8);
      } else if (isScrollingUp) {
        setScrolled(currentScrollY > 56);
      }

      lastScrollY = currentScrollY;
      frameId = 0;
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
    };
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

        <main className={`mx-auto max-w-4xl overflow-hidden px-4 sm:px-6 transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'pt-20 sm:pt-20' : 'pt-[12rem] sm:pt-[11.5rem]'} pb-8`}>
          <div className="mb-5 sm:mb-6">
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