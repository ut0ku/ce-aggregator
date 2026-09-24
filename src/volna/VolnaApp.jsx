import { useEffect, useMemo, useState } from 'react';
import { CITIES, TOPICS } from './data.js';
import { buildFeed } from './utils.js';
import { fetchCatalog, fetchFeed } from './api.js';
import { getThemeTokens } from './theme.js';
import { useThemeTransition } from './useThemeTransition.js';
import { useAuth } from './authContext.jsx';
import Header from './components/Header.jsx';
import FeedList from './components/FeedList.jsx';
import SkeletonBlock from './components/SkeletonBlock.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import AdminPanel from './components/AdminPanel.jsx';

const TOPIC_ICONS = Object.fromEntries(TOPICS.map((topic) => [topic.id, topic.icon]));
const TOPIC_ICONS_BY_NAME = Object.fromEntries(TOPICS.map((topic) => [topic.icon.displayName || topic.icon.name, topic.icon]));

function mergeTopics(apiTopics) {
  if (!apiTopics?.length) return TOPICS;
  return apiTopics.map((topic) => ({
    id: topic.slug,
    name: topic.name,
    icon: TOPIC_ICONS[topic.slug] || TOPIC_ICONS_BY_NAME[topic.icon] || TOPICS[0].icon,
    description: topic.description,
  }));
}

function mergeCities(apiCities) {
  if (!apiCities?.length) return CITIES;
  return apiCities.map((city) => ({
    slug: city.slug,
    name: city.name,
    region: city.region,
  }));
}

export default function VolnaApp() {
  const { dark, toggleTheme } = useThemeTransition(false);
  const { user, login, register, logout, isAdmin, updateProfile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [cities, setCities] = useState(CITIES);
  const [topics, setTopics] = useState(TOPICS);
  const [city, setCity] = useState(CITIES[0]);
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const [cityOpen, setCityOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [feed, setFeed] = useState([]);
  const [sourcesCount, setSourcesCount] = useState(0);
  const [apiError, setApiError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  const tk = getThemeTokens(dark);
  const activeTopic = topics.find((topic) => topic.id === topicId);

  useEffect(() => {
    let cancelled = false;
    fetchCatalog()
      .then(([cityPayload, topicPayload]) => {
        if (cancelled) return;
        setApiError('');
        const nextCities = mergeCities(cityPayload.cities);
        const nextTopics = mergeTopics(topicPayload.topics);
        setCities(nextCities);
        setTopics(nextTopics);
        setCity((current) => nextCities.find((item) => item.slug === current.slug || item.name === current.name) || nextCities[0]);
        setTopicId((current) => nextTopics.some((topic) => topic.id === current) ? current : nextTopics[0].id);
      })
      .catch((error) => {
        if (!cancelled) setApiError(error.message || 'Сервер недоступен');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const citySlug = city.slug || CITIES.find((item) => item.name === city.name)?.slug || 'moscow';
    fetchFeed(citySlug, topicId)
      .then((payload) => {
        if (cancelled) return;
        setApiError('');
        setUsingFallback(false);
        setFeed(payload.items || []);
        setSourcesCount(payload.sourcesCount || new Set((payload.items || []).map((item) => item.source)).size);
      })
      .catch((error) => {
        if (cancelled) return;
        const fallback = buildFeed(topicId, city);
        setFeed(fallback);
        setUsingFallback(true);
        setSourcesCount(new Set(fallback.map((item) => item.source)).size);
        setApiError(error.message || 'Сервер недоступен');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

  const [featured, ...rest] = feed;
  const liveSourcesCount = useMemo(
    () => sourcesCount || new Set(feed.map((item) => item.source)).size,
    [feed, sourcesCount],
  );

  return (
    <div className={`min-h-screen ${tk.bg} ${tk.text} font-sans`}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pulse-dot { animation: none; }
        }
      `}</style>

      <Header
        dark={dark}
        toggleTheme={toggleTheme}
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
        cities={cities}
        topics={topics}
        user={user}
        onAuthClick={() => setAuthOpen(true)}
        onLogout={logout}
        onProfileClick={() => setProfileOpen(true)}
        onAdminClick={() => setAdminOpen(true)}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={login}
        onRegister={register}
        tk={tk}
      />

      {user && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
          onSubmit={updateProfile}
          tk={tk}
        />
      )}

      {isAdmin && (
        <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} tk={tk} />
      )}

        <main className={`mx-auto max-w-4xl overflow-hidden px-4 sm:px-6 transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'pt-20 sm:pt-20' : 'pt-[12rem] sm:pt-[11.5rem]'} pb-8`}>
          {apiError && (
            <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${tk.border} border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300`}>
              {apiError}
              {usingFallback && ' Показана демо-лента без лайков и комментариев.'}
            </div>
          )}

          <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-2">
            {activeTopic && <activeTopic.icon size={20} className={tk.accent} />}
            <h1 className="text-xl font-semibold">{activeTopic?.name}</h1>
          </div>
          <p className={`mt-1.5 text-sm ${tk.sub}`}>
            Город: {city.name} · Источников: {liveSourcesCount}
          </p>
        </div>

        {loading ? (
          <SkeletonBlock tk={tk} />
        ) : (
          <FeedList featured={featured} rest={rest} tk={tk} onAuthRequired={() => setAuthOpen(true)} />
        )}
      </main>

      <Footer tk={tk} />
    </div>
  );
}
