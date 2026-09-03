import { useState, useMemo, useEffect } from 'react';
import {
  MapPin, Sun, Moon, ChevronDown, Check,
  CalendarDays, Cpu, Smartphone, Music2, Film,
  Palette, Trophy, UtensilsCrossed, FlaskConical, Newspaper,
} from 'lucide-react';

const CITIES = [
  { name: 'Москва', region: 'Москва' },
  { name: 'Санкт-Петербург', region: 'Санкт-Петербург' },
  { name: 'Екатеринбург', region: 'Свердловская область' },
  { name: 'Новосибирск', region: 'Новосибирская область' },
  { name: 'Казань', region: 'Татарстан' },
  { name: 'Нижний Новгород', region: 'Нижегородская область' },
  { name: 'Краснодар', region: 'Краснодарский край' },
  { name: 'Самара', region: 'Самарская область' },
  { name: 'Владивосток', region: 'Приморский край' },
  { name: 'Тюмень', region: 'Тюменская область' },
];

const TOPICS = [
  { id: 'events', name: 'Городские события', icon: CalendarDays },
  { id: 'it', name: 'IT и технологии', icon: Cpu },
  { id: 'electronics', name: 'Электроника и гаджеты', icon: Smartphone },
  { id: 'music', name: 'Музыка', icon: Music2 },
  { id: 'cinema', name: 'Кино и сериалы', icon: Film },
  { id: 'art', name: 'Искусство и выставки', icon: Palette },
  { id: 'sport', name: 'Спорт', icon: Trophy },
  { id: 'food', name: 'Еда и фестивали', icon: UtensilsCrossed },
  { id: 'science', name: 'Наука', icon: FlaskConical },
  { id: 'news', name: 'Новости', icon: Newspaper },
];

const CONTENT = {
  events: [
    { title: 'Открытие уличной выставки света', description: 'Инсталляции современных художников в центре города, вход свободный.', source: 'KudaGo', isEvent: true, needsCity: true, venue: 'Центральная площадь' },
    { title: 'Джазовый вечер в парке', description: 'Открытая сцена и импровизации локальных музыкантов под открытым небом.', source: 'Afisha.ru', isEvent: true, needsCity: true, venue: 'Городской парк' },
    { title: 'Ярмарка ремесленников выходного дня', description: 'Изделия местных мастеров и мастер-классы для детей и взрослых.', source: 'Timepad', isEvent: true, needsCity: true, venue: 'Арт-квартал' },
    { title: 'Ночь музеев с расширенным режимом работы', description: 'Городские музеи откроются допоздна, часть экспозиций — бесплатно.', source: 'Культура.РФ', isEvent: true, needsCity: true, venue: 'Музейный квартал' },
    { title: 'Городской велофестиваль', description: 'Массовый заезд по центральным улицам, сбор участников утром.', source: 'KudaGo', isEvent: true, needsCity: true, venue: 'Набережная' },
    { title: 'Лекция об истории города', description: 'Краеведы расскажут о малоизвестных фактах из прошлого района.', source: 'Timepad', isEvent: true, needsCity: true, venue: 'Городская библиотека' },
  ],
  it: [
    { title: 'Обзор трендов в бэкенд-разработке', description: 'Что изменилось в подходах к масштабированию сервисов за последний год.', source: 'Habr', isEvent: false, needsCity: false },
    { title: 'Итоги конференции по облачным технологиям', description: 'Основные доклады и анонсы от ведущих провайдеров.', source: 'Cnews', isEvent: false, needsCity: false },
    { title: 'Сравнение фреймворков для мобильной разработки', description: 'Плюсы и минусы популярных кроссплатформенных решений.', source: 'VC.ru', isEvent: false, needsCity: false },
    { title: 'Как компании внедряют ИИ во внутренние процессы', description: 'Практические кейсы автоматизации рутинных задач.', source: 'IT-World', isEvent: false, needsCity: false },
    { title: 'Обновления open source инструментов для DevOps', description: 'Новые версии популярных утилит для CI/CD.', source: 'OpenNet', isEvent: false, needsCity: false },
    { title: 'Разбор уязвимостей в популярных библиотеках', description: 'Рекомендации по обновлению зависимостей для безопасности.', source: 'Xakep', isEvent: false, needsCity: false },
  ],
  electronics: [
    { title: 'Тест беспроводных наушников среднего сегмента', description: 'Сравнение автономности и качества связи в повседневных сценариях.', source: 'iXBT', isEvent: false, needsCity: false },
    { title: 'Обзор ноутбука для мобильной работы', description: 'Автономность, вес и производительность в реальных задачах.', source: '3DNews', isEvent: false, needsCity: false },
    { title: 'Что нового в линейке умных часов', description: 'Датчики здоровья и совместимость с разными платформами.', source: 'Hi-Tech Mail.ru', isEvent: false, needsCity: false },
    { title: 'Разбор бюджетных смартфонов', description: 'Камера, экран и производительность за небольшие деньги.', source: '4PDA', isEvent: false, needsCity: false },
    { title: 'Гид по выбору повербанка', description: 'На что смотреть при выборе ёмкости и мощности зарядки.', source: 'DNS Shop', isEvent: false, needsCity: false },
    { title: 'Обзор игровых мониторов', description: 'Частота обновления и задержка ввода для разных бюджетов.', source: 'Zoom Cnews', isEvent: false, needsCity: false },
  ],
  music: [
    { title: 'Концерт локальной инди-группы', description: 'Презентация нового альбома в небольшом клубе.', source: 'Afisha.ru', isEvent: true, needsCity: true, venue: 'Клуб на Речной' },
    { title: 'Гастроли известного исполнителя', description: 'Единственное выступление в городе в рамках тура.', source: 'KudaGo', isEvent: true, needsCity: true, venue: 'Дворец культуры' },
    { title: 'Джем-сейшн для музыкантов', description: 'Открытая площадка для импровизаций, вход свободный.', source: 'Timepad', isEvent: true, needsCity: true, venue: 'Лофт-пространство' },
    { title: 'Обзор новых альбомов недели', description: 'Что стоит послушать из свежих релизов.', source: 'Rolling Stone', isEvent: false, needsCity: false },
    { title: 'Фестиваль уличных музыкантов', description: 'Выступления на нескольких площадках центра города.', source: 'Afisha.ru', isEvent: true, needsCity: true, venue: 'Пешеходная улица' },
    { title: 'Итоги музыкальной премии', description: 'Кто получил награды в этом году.', source: 'Billboard', isEvent: false, needsCity: false },
  ],
  cinema: [
    { title: 'Что смотреть в кино на этой неделе', description: 'Подборка премьер проката.', source: 'Kinopoisk', isEvent: false, needsCity: false },
    { title: 'Специальный показ авторского кино', description: 'Кинопоказ с обсуждением после сеанса.', source: 'Afisha.ru', isEvent: true, needsCity: true, venue: 'Артхаус-кинотеатр' },
    { title: 'Анонсы сериалов на осень', description: 'Главные премьеры платформ в новом сезоне.', source: 'Film.ru', isEvent: false, needsCity: false },
    { title: 'Ретроспектива классики на большом экране', description: 'Показы отреставрированных фильмов прошлых лет.', source: 'KudaGo', isEvent: true, needsCity: true, venue: 'Дом кино' },
    { title: 'Обзор фестивальных фильмов года', description: 'Какие картины отметили критики на крупных фестивалях.', source: 'Kanobu', isEvent: false, needsCity: false },
    { title: 'Открытый показ под открытым небом', description: 'Кинопоказ на свежем воздухе с пледами и попкорном.', source: 'Timepad', isEvent: true, needsCity: true, venue: 'Городской парк' },
  ],
  art: [
    { title: 'Новая экспозиция современного искусства', description: 'Работы молодых художников региона.', source: 'Культура.РФ', isEvent: true, needsCity: true, venue: 'Галерея на Ленина' },
    { title: 'Ретроспектива классической живописи', description: 'Полотна из региональных и федеральных собраний.', source: 'ArtGuide', isEvent: true, needsCity: true, venue: 'Художественный музей' },
    { title: 'Открытая мастерская для всех желающих', description: 'Знакомство с техникой офорта и графики.', source: 'Timepad', isEvent: true, needsCity: true, venue: 'Творческие мастерские' },
    { title: 'Обзор главных выставок сезона', description: 'Что стоит увидеть в музеях страны в этом сезоне.', source: 'The Art Newspaper Russia', isEvent: false, needsCity: false },
    { title: 'Ночная экскурсия по галерее', description: 'Экспозиция при свечах и живая музыка.', source: 'Culture.ru', isEvent: true, needsCity: true, venue: 'Галерея современного искусства' },
    { title: 'Интервью с куратором крупной выставки', description: 'О принципах отбора работ и логике экспозиции.', source: 'Aroundart', isEvent: false, needsCity: false },
  ],
  sport: [
    { title: 'Матч домашней команды по футболу', description: 'Встреча с соперником из соседнего региона.', source: 'Championat', isEvent: true, needsCity: true, venue: 'Городской стадион' },
    { title: 'Итоги тура регионального чемпионата', description: 'Обзор результатов и таблица после игрового дня.', source: 'Sports.ru', isEvent: true, needsCity: true, venue: 'Спортивный комплекс' },
    { title: 'Открытая тренировка для болельщиков', description: 'Встреча с игроками основного состава клуба.', source: 'Sport-Express', isEvent: true, needsCity: true, venue: 'Тренировочная база' },
    { title: 'Обзор трансферного окна', description: 'Кто перешёл в клубы лиги этим летом.', source: 'Советский спорт', isEvent: false, needsCity: false },
    { title: 'Городской забег на 10 километров', description: 'Маршрут через исторический центр, старт утром.', source: 'KudaGo', isEvent: true, needsCity: true, venue: 'Центральная площадь' },
    { title: 'Итоги международного турнира', description: 'Главные результаты и герои соревнований.', source: 'Eurosport', isEvent: false, needsCity: false },
  ],
  food: [
    { title: 'Фестиваль уличной еды', description: 'Фудтраки и локальные повара на одной площадке.', source: 'Timepad', isEvent: true, needsCity: true, venue: 'Набережная' },
    { title: 'Открытие ресторана с локальной кухней', description: 'Сезонное меню от шеф-повара региона.', source: 'The Village', isEvent: true, needsCity: true, venue: 'Центр города' },
    { title: 'Гастрономический маршрут по рынкам', description: 'Где попробовать местные продукты и деликатесы.', source: 'Restoclub', isEvent: false, needsCity: true },
    { title: 'Мастер-класс по домашней выпечке', description: 'Рецепты хлеба на закваске от практикующего пекаря.', source: 'Eda.ru', isEvent: true, needsCity: true, venue: 'Кулинарная студия' },
    { title: 'Обзор новых кофеен', description: 'Где варят интересный кофе в этом сезоне.', source: 'Time Out', isEvent: false, needsCity: true },
    { title: 'Ярмарка фермерских продуктов', description: 'Овощи, сыры и мёд напрямую от производителей.', source: 'Afisha Restaurants', isEvent: true, needsCity: true, venue: 'Городской рынок' },
  ],
  science: [
    { title: 'Учёные предложили новый метод анализа данных', description: 'Подход может ускорить обработку в нескольких прикладных областях.', source: 'N+1', isEvent: false, needsCity: false },
    { title: 'Итоги экспедиции в отдалённый регион', description: 'Что удалось узнать участникам исследовательской группы.', source: 'Naked Science', isEvent: false, needsCity: false },
    { title: 'Разбор последних публикаций в области биологии', description: 'Главные выводы новых исследований этого месяца.', source: 'Индикатор', isEvent: false, needsCity: false },
    { title: 'Обзор достижений в материаловедении', description: 'Новые материалы и их потенциальное применение.', source: 'Популярная механика', isEvent: false, needsCity: false },
    { title: 'Что известно о новом астрономическом наблюдении', description: 'Данные телескопов помогли уточнить прежние модели.', source: 'N+1', isEvent: false, needsCity: false },
    { title: 'Итоги научной конференции', description: 'Основные доклады и дискуссии специалистов.', source: 'РАН.Новости', isEvent: false, needsCity: false },
  ],
  news: [
    { title: 'Главное за день: обзор ключевых событий', description: 'Коротко о том, что обсуждают в стране.', source: 'РБК', isEvent: false, needsCity: false },
    { title: 'Итоги недели в экономике', description: 'Основные решения и заявления за последние дни.', source: 'Коммерсантъ', isEvent: false, needsCity: false },
    { title: 'Что изменилось в законодательстве', description: 'Разбор нововведений, вступающих в силу.', source: 'Ведомости', isEvent: false, needsCity: false },
    { title: 'Обзор международных новостей', description: 'Главные события за пределами страны.', source: 'ТАСС', isEvent: false, needsCity: false },
    { title: 'Итоги пресс-конференции', description: 'Основные заявления и ответы на вопросы журналистов.', source: 'Интерфакс', isEvent: false, needsCity: false },
    { title: 'Коротко: события дня', description: 'Сжатая сводка ключевых новостей.', source: 'Lenta.ru', isEvent: false, needsCity: false },
  ],
};

const RELATIVE_TIMES = ['1 час назад', '3 часа назад', 'сегодня утром', 'вчера', '2 дня назад', '3 дня назад'];
const EVENT_OFFSETS = [2, 3, 5, 7, 9, 12];

function relativeTimeLabel(i) {
  return RELATIVE_TIMES[i % RELATIVE_TIMES.length];
}

function eventDateLabel(i) {
  const d = new Date();
  d.setDate(d.getDate() + EVENT_OFFSETS[i % EVENT_OFFSETS.length]);
  const s = d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildFeed(topicId, city) {
  const items = CONTENT[topicId] || [];
  return items.map((item, i) => ({
    ...item,
    id: `${topicId}-${i}`,
    image: `https://picsum.photos/seed/${topicId}-${i}-v2/900/600`,
    metaLabel: item.isEvent ? eventDateLabel(i) : relativeTimeLabel(i),
    cityTag: item.needsCity ? city.name : null,
  }));
}

function MetaRow({ item, tk, compact }) {
  return (
    <div className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 ${compact ? 'text-xs' : 'text-sm'} ${tk.sub}`}>
      <span className={`font-medium ${tk.sourceText}`}>{item.source}</span>
      <span>·</span>
      <span className={item.isEvent ? `font-medium ${tk.amber}` : ''}>{item.metaLabel}</span>
      {item.cityTag && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${tk.border}`}>
          <MapPin size={10} />
          {item.venue ? `${item.venue}, ${item.cityTag}` : item.cityTag}
        </span>
      )}
    </div>
  );
}

function SkeletonBlock({ tk }) {
  return (
    <div className="animate-pulse">
      <div className={`aspect-video w-full rounded-sm ${tk.skeleton}`} />
      <div className={`h-7 w-2/3 rounded mt-4 ${tk.skeleton}`} />
      <div className={`h-4 w-full rounded mt-3 ${tk.skeleton}`} />
      <div className={`h-4 w-5/6 rounded mt-2 ${tk.skeleton}`} />
      <div className="mt-8 space-y-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className={`w-28 h-20 sm:w-32 sm:h-24 rounded-sm flex-shrink-0 ${tk.skeleton}`} />
            <div className="flex-1 space-y-2 py-1">
              <div className={`h-4 w-4/5 rounded ${tk.skeleton}`} />
              <div className={`h-3 w-3/5 rounded ${tk.skeleton}`} />
              <div className={`h-3 w-2/5 rounded ${tk.skeleton}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import VolnaApp from './volna/VolnaApp';

export default function Volna() {
  return <VolnaApp />;
}
  const [cityOpen, setCityOpen] = useState(false);
