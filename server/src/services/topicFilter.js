/**
 * Topic relevance filter.
 *
 * Some news sources (Interfax, RBC, Lenta, etc.) cover ALL topics – fires,
 * politics, accidents – but are registered in the catalog under specific
 * topics like "it" or "finance".  Articles from those sources must pass a
 * keyword check before being saved or shown.
 *
 * Specialised sources (Habr → IT, iXBT → electronics, …) are trusted and
 * all their articles pass through unchanged.
 *
 * NOTE: JavaScript \b does not work with Cyrillic characters.
 * All patterns use plain substring matching (no outer \b).
 */

// ─── General-purpose news domains ───────────────────────────────────────────
// Articles from these domains require a topic match in the title or description.

const GENERAL_DOMAINS = new Set([
  'interfax.ru',
  'rbc.ru',
  'rssexport.rbc.ru',
  'lenta.ru',
  'ria.ru',
  'tass.ru',
  'gazeta.ru',
  'reuters.com',
  'vedomosti.ru',
  'kommersant.ru',
  'newsru.com',
  'itar-tass.com',
  'vesti.ru',
  'rg.ru',
  'mk.ru',
  'izvestia.ru',
  'aif.ru',
  'kp.ru',
  // Broad technology/news feeds need the same article-level filtering.
  '3dnews.ru',
  'cnews.ru',
  'vc.ru',
  'computerra.ru',
  'hi-news.ru',
  'xakep.ru',
  'opennet.ru',
  'nixp.ru',
  'it-world.ru',
  'itweek.ru',
  'pcmag.ru',
  'tadviser.ru',
  'devby.io',
]);

const TOPIC_EXCLUSIONS = {
  it: /\bSteam\b|PlayStation|Xbox|Nintendo|Minecraft|Fortnite|видеоигр|геймплей|консол|крякер|DRM|взлом.*игр|смартфон|планшет|беззеркальн|фотоаппарат|наушник|телевизор|монитор|магнитофон|проигрывател[ьи]|выбор[а-яё]*|Госдум|правительств|премьер-министр|отставк|оппозиц|налог|анимацион|мультфильм|киноиндустр|конгрессмен|законопроект|тюрьм|суд[а-яё]*|штраф|выручк|доход.*сократ|на.*зарабатыва|финансов.*показател/i,
};

const IT_TITLE_SIGNAL = /\bAI\b|\bAPI\b|\bSaaS\b|\bDevOps\b|\bGitHub\b|(?:^|[^а-яё])ИИ(?:$|[^а-яё])|(?:^|[^а-яё])ИТ(?:$|[^а-яё])|искусственн.*интеллект|нейросет|машинн.*обучен|разработ|программ|уязвим|взлом|хакер|кибер|облачн|дата-центр|цифров|шифрован|телеком|токен|модел[ьи]|файлообмен|сервер|баз[а-яё]*\s+данн|инфраструктур|автоматизац|технологическ|приложен|операционн|браузер|полупроводник|стартап/i;

// ─── Per-topic keyword patterns ──────────────────────────────────────────────
// At least one alternative must match in the combined title + description text.

export const TOPIC_PATTERNS = {
  it: /IT\b|(?:^|[^а-яё])ИТ(?:$|[^а-яё])|программирован|разработч|разработк\s|алгоритм|искусственный\s+интеллект|нейросет|нейронн.*сет|машинн.*обучен|(?:^|[^а-яё])ИИ(?:$|[^а-яё])|\bAI\b|стартап|кибербезопасн|хакер|уязвимост|облачн|дата-центр|цифровизац|программное\s+обеспечени|операционн.*систем|браузер|полупроводник|интернет-компани|e-commerce|маркетплейс|технологическ.*компани|(?:^|[^а-яё])ПО(?:$|[^а-яё])|open.?source|\bSaaS\b|\bDevOps\b|\bGitHub\b|микросервис|бэкенд|фронтенд|язык\s+программирован|Python\b|JavaScript\b|\bJava\b|Golang\b|\bRust\b|\bAPI\b/i,

  finance: /акци[ия]|облигаци|инвестиц|курс\s+(?:рубл|доллар|евро)|Мосбирж|кредитн.*ставк|Центробанк|инфляц|дефляц|\bВВП\b|бюджетн.*политик|налогообложен|паевой\s+фонд|\bIPO\b|\bИПО\b|финансов.*рынок|рынок.*капитал|капитализац|дивиденд|торги\s+на\s+бирж|форекс|деривати|хедж-фонд|фондов.*рынок/i,

  electronics: /смартфон|гаджет|ноутбук|планшет|процессор|чипсет|\bSSD\b|\bRAM\b|\bОЗУ\b|видеокарт|электроник.*обзор|обзор.*электроник|гарнитур|наушник|умные\s+часы|смарт-часы|фитнес-браслет|телевизор|роутер|зарядное\s+устройств|аккумулятор\s+(?:смартфон|ноутбук)|\beSIM\b|\b5G\b|новый\s+(?:iPhone|Samsung|Xiaomi|Pixel)|обзор\s+(?:iPhone|Samsung|Pixel|Honor|Huawei|OnePlus)/i,

  cinema: /фильм|сериал|режиссёр|режиссер|актёр|актер|премьера\s+(?:фильм|кино|сериал)|кинотеатр|Оскар|Каннск.*кинофест|Берлинал|Венецианск.*кинофест|трейлер|Netflix|Кинопоиск|мультфильм|аниме|кинофестиваль|продюсер.*фильм|сценарист|стриминг.*(?:сервис|платформ)|Marvel\s+Studios|Disney\+/i,

  games: /видеоигр|игровая\s+(?:индустри|студи|приставк|консол)|геймер|геймплей|киберспорт|\besports\b|PlayStation|Xbox|Nintendo\b|\bSteam\b|игровой\s+(?:движок|ПК|контроллер)|разработчик\s+игр|\bDLC\b|\bMMO\b|\bRPG\b|Minecraft|GTA\s|Fortnite|релиз\s+игр|обновление\s+игр|патч\s+(?:для|к)\s+игр/i,

  sport: /матч|турнир\s|чемпионат|спортсмен|атлет|соревновани|Олимпийск|первенств|кубок\s+(?:России|мира|UEFA|Stanley)|дерби|плей-офф|\bplayoff\b|трансфер\s+(?:футболист|игрок|хоккеист)|баскетбол|футбол|хоккей|теннисист|волейбол|боксёр|боксер|лёгкая\s+атлетик|Формула\s+1|велоспорт|лыжн.*гонк/i,

  auto: /автомобил|тест-драйв|электромобил|гибридн.*(?:автомобил|авто)|АКПП|МКПП|кроссовер|внедорожник|пикап|каршеринг|автосалон|автопром|авторынок|\bОСАГО\b|автошкол|двигател.*(?:мощност|объём)|расход\s+топлив|автоновост|новый\s+(?:кроссовер|седан|внедорожник)|дилерск.*центр|марка\s+(?:авто|машин)/i,

  music: /концерт\s|музыкальный\s+(?:альбом|фестиваль|тур|коллектив)|альбом\s+(?:вышел|выпущен|релиз|выпустил)|новый\s+альбом|сингл\s+(?:вышел|выпущен|релиз)|музыкант|гастрол|лейбл|Billboard|Spotify|Grammy|поп-исполнитель|рок-группа|рэп-альбом|джазовый\s+(?:концерт|фестиваль)|электронная\s+музык/i,

  art: /выставк|галере|художественный\s+(?:музей|проект)|скульптор|куратор\s+(?:выставк|проект)|экспозиц|инсталляц|арт-(?:объект|пространств|рынок|резиденц)|перформанс|театральн.*постановк|спектакл|балет|опера\s+(?:театра|будет|состоится|прем)|вернисаж|произведени.*искусств|арт-фестиваль|книжная\s+ярмарк|литературн.*прем|поэтическ.*вечер/i,

  health: /здоровь|медицин(?:ский|ская|ское|а)|лекарств|препарат|болезн|лечени|диагноз|вакцин|эпидеми|пандеми|больниц|хирургическ|онколог|кардиолог|психолог|психиатр|ментальн.*здоровь|\bЗОЖ\b|диетолог|рацион\s+питания|медицинск.*исследовани|клиническ.*испытани|фармацевт|иммунитет|симптом/i,

  science: /учёные\s+(?:обнаружили|выяснили|разработали|создали|доказали)|ученые\s+(?:обнаружили|выяснили|разработали|создали)|научн.*исследовани|научн.*открыти|астрономи|астрофизик|физики\s+(?:обнаружили|измерили)|химики\s|биологи\s|палеонтологи|генетик|квантов.*(?:компьютер|вычислен|технологи)|молекулярн|телескоп|экзопланет|нейробиологи|теорема\s|научная\s+статья/i,

  realty: /недвижимост|квартир|застройщик|ипотечн|новостройк|вторичн.*рынок\s+(?:жилья|недвижимост)|аренда\s+(?:квартир|жилья|офис)|риелтор|жилой\s+комплекс|стоимость\s+(?:жилья|квартир|недвижимост)|рынок\s+(?:жилья|недвижимост)|покупка\s+(?:квартир|жилья)|загородн.*(?:дом|участок)|кадастрова.*стоимост|Росреестр|эскроу-счёт/i,

  travel: /туризм|путешестви[ея]|курорт(?:ный|ная\s+зона)|виза\s+(?:для|в|на|открыт)|авиарейс|авиакомпани|авиабилет|отель|гостиниц|туроператор|путёвка|путевка|туристическ|морской\s+круиз|горнолыжн.*курорт|пляжн.*отдых|загранпаспорт|перелёт|перелет|чартерный\s+рейс/i,

  fashion: /модный\s+показ|коллекция\s+(?:осень|весна|лето|зима|сезон)|бренд.*одежд|показ\s+мод|дизайнер\s+(?:одежд|обув)|Fashion\s+Week|подиум|тренды\s+(?:сезона|моды)|beauty-(?:бренд|индустри)|косметическ.*бренд|макияж|парфюм|маникюр|прическ|ювелирн.*украшени|стилист|street\s+style/i,

  crypto: /криптовалют|биткоин|Bitcoin|Ethereum|блокчейн|\bNFT\b|\bWeb3\b|децентрализован|крипто-|альткоин|\bDeFi\b|майнинг\s+(?:криптовалют|биткоин)|курс\s+(?:биткоин|Ethereum|крипт)|криптобирж|смарт-контракт|\bDAO\b|Solana|Ripple|Cardano|стейблкоин/i,

  politics: /президент.*(?:заявил|подписал|встретился|провёл|поручил)|правительств.*(?:решени|постановлени|закон)|Государственная\s+Дума|Госдума.*принял|выборы\s+(?:президент|в\s+думу|губернатор)|санкции.*(?:против|введены|сняты)|дипломатическ.*(?:перегов|отношени)|законопроект.*принят|Кремл|\bООН\b.*(?:призвал|принял|потребовал)|\bНАТО\b|геополитик/i,

  food: /ресторан|кафе\s+(?:открыл|закрыл|получил)|гастроном.*(?:фестиваль|событи)|шеф-повар|рецепт\s+приготовлени|кулинарн|ресторанн.*бизнес|фуд-корт|доставка\s+еды|фудтрак|дегустационное\s+меню|гастрофестиваль|вино.*(?:ресторан|сомелье)|веганск.*ресторан|открытие\s+ресторан/i,

  events: /концерт\s+(?:состоится|пройдёт|пройдет|в\s+|\d)|выставк.*(?:откроется|открыта|работает|пройдёт)|фестиваль\s+(?:пройдёт|состоится|в\s+городе)|спектакл|лекция\s+(?:пройдёт|состоится)|воркшоп|мастер-класс|афиша\s+(?:города|недели|выходных)|кинопоказ|городской\s+(?:праздник|фестиваль|ярмарк)|открытие\s+(?:парк|площадк|центр|сезон)/i,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getSourceDomain(url = '') {
  return String(url)
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();
}

export function isGeneralSource(sourceUrl = '') {
  return GENERAL_DOMAINS.has(getSourceDomain(sourceUrl));
}

/**
 * Returns true if the article text is relevant to the given topic.
 * Specialised sources always return true.
 */
export function isTopicRelevant(article, topicSlug, sourceUrl = '') {
  const pattern = TOPIC_PATTERNS[topicSlug];
  if (!pattern) return true;

  const title = String(article.title || '');
  const description = String(article.description || '');
  const exclusion = TOPIC_EXCLUSIONS[topicSlug];

  if (exclusion?.test(title)) return false;

  if (topicSlug === 'it' && isGeneralSource(sourceUrl)) {
    return IT_TITLE_SIGNAL.test(title);
  }

  // A title match is the strongest signal. Description-only matches are
  // accepted for specialised sources, but never enough for broad news feeds.
  if (pattern.test(title)) return true;
  if (isGeneralSource(sourceUrl)) return pattern.test(description);
  return pattern.test(description);
}

/**
 * Filter an array of articles from a single source by topic relevance.
 */
export function filterByTopic(articles, topicSlug, sourceUrl) {
  const pattern = TOPIC_PATTERNS[topicSlug];
  if (!pattern) return articles;

  const before = articles.length;
  const filtered = articles.filter((article) => {
    return isTopicRelevant(article, topicSlug, sourceUrl);
  });

  if (before !== filtered.length) {
    console.debug(
      `[topicFilter] ${getSourceDomain(sourceUrl)} topic=${topicSlug}: ` +
      `${before - filtered.length} irrelevant dropped, ${filtered.length} kept`,
    );
  }

  return filtered;
}
