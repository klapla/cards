/* ============================================================
   Cards App v8.0 — Design System
   Палитры, утилиты, константы, парсеры
   ============================================================ */

/* ---------- ПАЛИТРЫ ЯЗЫКОВ ---------- */
const LANG_PALETTES = {
  spanish: { grad1: '#ff6b35', grad2: '#f7b801', bg: '#fff7ed', accent: '#ff6b35', emoji: '🇪🇸' },
  english: { grad1: '#007aff', grad2: '#5856d6', bg: '#eff6ff', accent: '#007aff', emoji: '🇬🇧' },
  german:  { grad1: '#1c1c1e', grad2: '#ff3b30', bg: '#f5f5f7', accent: '#1c1c1e', emoji: '🇩🇪' },
  french:  { grad1: '#0055a4', grad2: '#ef4135', bg: '#f0f4ff', accent: '#0055a4', emoji: '🇫🇷' },
  italian: { grad1: '#009246', grad2: '#ce2b37', bg: '#f0fdf4', accent: '#009246', emoji: '🇮🇹' },
  default: { grad1: '#007aff', grad2: '#5856d6', bg: '#eff6ff', accent: '#007aff', emoji: '🌍' }
};

function getLangPalette(templateKey) {
  return LANG_PALETTES[templateKey] || LANG_PALETTES.default;
}

/* ---------- РЕДКОСТИ АВАТАРОК ---------- */
const RARITIES = {
  common:    { name: 'Обычная',     color: '#34c759', emoji: '🟢', price: 100 },
  uncommon:  { name: 'Необычная',   color: '#007aff', emoji: '🔵', price: 250 },
  rare:      { name: 'Редкая',      color: '#a04cff', emoji: '🟣', price: 400 },
  epic:      { name: 'Эпическая',   color: '#ff9500', emoji: '🟡', price: 600 },
  legendary: { name: 'Легендарная', color: '#ff3b30', emoji: '🔴', price: 800 }
};

const AVATARS = [
  { id: 'fox',    emoji: '🦊', name: 'Лиса',      rarity: 'common' },
  { id: 'frog',   emoji: '🐸', name: 'Лягушка',   rarity: 'common' },
  { id: 'hamster',emoji: '🐹', name: 'Хомяк',     rarity: 'common' },
  { id: 'panda',  emoji: '🐼', name: 'Панда',     rarity: 'uncommon' },
  { id: 'koala',  emoji: '🐨', name: 'Коала',     rarity: 'uncommon' },
  { id: 'cat',    emoji: '🐱', name: 'Кот',       rarity: 'uncommon' },
  { id: 'dog',    emoji: '🐶', name: 'Собака',    rarity: 'uncommon' },
  { id: 'lion',   emoji: '🦁', name: 'Лев',       rarity: 'rare' },
  { id: 'tiger',  emoji: '🐯', name: 'Тигр',      rarity: 'rare' },
  { id: 'owl',    emoji: '🦉', name: 'Сова',      rarity: 'rare' },
  { id: 'unicorn',emoji: '🦄', name: 'Единорог',  rarity: 'rare' },
  { id: 'dragon', emoji: '🐲', name: 'Дракон',    rarity: 'epic' },
  { id: 'alien',  emoji: '👽', name: 'Пришелец',  rarity: 'epic' },
  { id: 'robot',  emoji: '🤖', name: 'Робот',     rarity: 'epic' },
  { id: 'ghost',  emoji: '👻', name: 'Призрак',   rarity: 'epic' },
  { id: 'penguin',emoji: '🐧', name: 'Пингвин',   rarity: 'legendary' },
  { id: 'pumpkin',emoji: '🎃', name: 'Тыква',     rarity: 'legendary' },
  { id: 'dino',   emoji: '🦖', name: 'Дино',      rarity: 'legendary' }
];

function getAvatarById(id) {
  return AVATARS.find(a => a.id === id) || AVATARS.find(a => a.id === 'penguin');
}
function getAvatarPrice(avatar) {
  return RARITIES[avatar.rarity].price;
}
function getRarityInfo(rarity) {
  return RARITIES[rarity] || RARITIES.common;
}

/* ---------- УРОВНИ ---------- */
const LEVELS = [
  { min: 0,     name: '🐧 Птенец',  icon: '🐧', next: 500 },
  { min: 500,   name: '📚 Ученик',  icon: '📚', next: 2000 },
  { min: 2000,  name: '🎓 Знаток',  icon: '🎓', next: 5000 },
  { min: 5000,  name: '🏆 Мастер',  icon: '🏆', next: 10000 },
  { min: 10000, name: '👑 Гуру',    icon: '👑', next: 25000 },
  { min: 25000, name: '🌟 Легенда', icon: '🌟', next: Infinity }
];

function getLevelData(xp) {
  let cur = LEVELS[0], next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) {
      cur = LEVELS[i];
      next = LEVELS[i + 1] || LEVELS[i];
    }
  }
  const range = next.min === Infinity ? 1 : next.min - cur.min;
  const progress = next.min === Infinity ? 1 : (xp - cur.min) / range;
  return { current: cur, next, progress };
}

/* ---------- КВЕСТЫ ---------- */
const ALL_QUESTS = [
  { id: 'lessons2',    icon: '📖', name: 'Пройди 2 урока',              target: 2,  type: 'lessons' },
  { id: 'newwords5',   icon: '🆕', name: 'Выучи 5 новых слов',          target: 5,  type: 'newWords' },
  { id: 'quizzes3',    icon: '⚡', name: 'Сделай 3 быстрых теста',       target: 3,  type: 'quizzes' },
  { id: 'correct20',   icon: '✓',  name: 'Ответь правильно 20 раз',     target: 20, type: 'correct' },
  { id: 'speed1',      icon: '🚀', name: 'Пройди скоростной режим',      target: 1,  type: 'speed' },
  { id: 'mix1',        icon: '🌪', name: 'Выполни микс-тренировку',      target: 1,  type: 'mix' },
  { id: 'perfect1',    icon: '🏆', name: 'Достигни 80%+ в любом уроке', target: 1,  type: 'perfect' },
  { id: 'star3',       icon: '⭐', name: 'Помести 3 слова в избранное',  target: 3,  type: 'star' },
  { id: 'noerror1',    icon: '🎯', name: 'Пройди урок без ошибок',       target: 1,  type: 'noError' },
  { id: 'minutes15',   icon: '⏱', name: 'Занимайся 15 минут суммарно',  target: 15, type: 'minutes' },
  { id: 'dictation1',  icon: '✍️', name: 'Пройди диктант',               target: 1,  type: 'dictation' },
  { id: 'letters1',    icon: '🔤', name: 'Пройди «Пропущенные буквы»',   target: 1,  type: 'letters' },
  { id: 'sentence1',   icon: '🧩', name: 'Собери фразу',                 target: 1,  type: 'sentence' }
];

/* ---------- НАГРАДЫ ИЗ СУНДУКА ---------- */
const TREASURE_REWARDS = [
  { id: 'coins_small',  weight: 25, icon: '💰', type: 'coins',  amount: [50, 120],  title: 'Монеты!',        text: 'Немного монет в копилку' },
  { id: 'coins_big',    weight: 15, icon: '💰', type: 'coins',  amount: [150, 250], title: 'Много монет!',    text: 'Хороший улов!' },
  { id: 'doublexp',     weight: 20, icon: '⚡', type: 'doublexp', amount: 30,       title: 'Двойной XP!',    text: '30 минут двойного опыта' },
  { id: 'freeze',       weight: 15, icon: '🧊', type: 'freeze', amount: 1,          title: 'Заморозка streak!', text: 'Пропустишь день — не потеряешь серию' },
  { id: 'avatar_low',   weight: 15, icon: '🎨', type: 'avatar', rarity: ['common','uncommon'], title: 'Аватарка!',  text: 'Случайная аватарка' },
  { id: 'xp_big',       weight: 8,  icon: '💎', type: 'xp',     amount: 500,        title: '500 XP!',        text: 'Приличный опыт' },
  { id: 'avatar_high',  weight: 2,  icon: '🌟', type: 'avatar', rarity: ['rare','epic'], title: 'Редкая аватарка!', text: 'Тебе повезло!' }
];

function pickTreasureReward() {
  const totalWeight = TREASURE_REWARDS.reduce((s, r) => s + r.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const reward of TREASURE_REWARDS) {
    rand -= reward.weight;
    if (rand <= 0) return reward;
  }
  return TREASURE_REWARDS[0];
}

/* ---------- ЦЕНЫ ---------- */
const SHOP_PRICES = {
  freeze: 50,
  doublexp: 30,
  mixday: 20,
  skipLesson: 30,
  tournament: 50,
  customPhoto: 100
};

const XP_REWARDS = {
  correct: 10,
  fastBonus: 5,
  streak5Bonus: 15,
  lessonFinish: 20,
  dailyGoal: 50,
  streakDay: 25
};

const COIN_REWARDS = {
  correct: 1,
  perfectLesson: 15,
  lessonFinish: 5,
  questComplete: 25,
  achievementUnlock: 10,
  streakDay: 5
};

const DAILY_REWARDS = [5, 10, 15, 20, 30, 40, 50];

/* ---------- АЧИВКИ ---------- */
const ACHIEVEMENTS = [
  { id: 'first',      icon: '🎯', name: 'Первый шаг',         desc: '1 правильный ответ' },
  { id: 'hundred',    icon: '💯', name: 'Сотка',              desc: '100 правильных' },
  { id: 'thousand',   icon: '🌟', name: 'Тысячник',           desc: '1000 правильных' },
  { id: 'tenthousand',icon: '💎', name: 'Десять тысяч',       desc: '10000 правильных' },
  { id: 'week',       icon: '🔥', name: 'Неделя',             desc: '7 дней подряд' },
  { id: 'month',      icon: '🔥🔥', name: 'Месяц',            desc: '30 дней подряд' },
  { id: 'year',       icon: '🔥🔥🔥', name: 'Год',            desc: '365 дней подряд' },
  { id: 'polyglot',   icon: '📚', name: 'Полиглот',           desc: '3 языка' },
  { id: 'polyglot5',  icon: '🌍', name: 'Мегаполиглот',       desc: '5 языков' },
  { id: 'vocab',      icon: '🧠', name: 'Словарный запас',    desc: '100 слов выучено' },
  { id: 'professor',  icon: '🎓', name: 'Профессор',          desc: '500 слов выучено' },
  { id: 'master',     icon: '📖', name: 'Мастер слов',        desc: '1000 слов выучено' },
  { id: 'collector',  icon: '🎴', name: 'Коллекционер',       desc: '100 звёздочек' },
  { id: 'legend',     icon: '👑', name: 'Легенда',            desc: '10000 XP' },
  { id: 'god',        icon: '⚡', name: 'Божество',           desc: '50000 XP' },
  { id: 'speedster',  icon: '🚀', name: 'Скорость',           desc: 'Скоростной: 20+ слов' },
  { id: 'lightning',  icon: '⚡', name: 'Молния',             desc: 'Хардкор: 15+ слов' },
  { id: 'mixer',      icon: '🌪', name: 'Миксер',             desc: 'Пройти микс-тренировку' },
  { id: 'trail1',     icon: '🌳', name: 'Первая тропа',       desc: '1 урок тропы' },
  { id: 'trail10',    icon: '🌲', name: 'Лесоруб',            desc: '10 уроков' },
  { id: 'trail50',    icon: '🏔️', name: 'Покоритель',         desc: '50 уроков' },
  { id: 'trail100',   icon: '🗻', name: 'Эверест',            desc: '100 уроков' },
  { id: 'penguin',    icon: '🐧', name: 'Друг пингвина',      desc: '3 урока за день' },
  { id: 'coin100',    icon: '💰', name: 'Богач',              desc: '1000 монет' },
  { id: 'avatar',     icon: '🎨', name: 'Модник',             desc: '3 аватарки' },
  { id: 'collector2', icon: '🏪', name: 'Шопоголик',          desc: '10 аватарок' },
  { id: 'dictation',  icon: '✍️', name: 'Грамотей',           desc: 'Диктант без ошибок' },
  { id: 'letters',    icon: '🔤', name: 'Буквоед',            desc: 'Пропущенные буквы без ошибок' },
  { id: 'sentence',   icon: '🧩', name: 'Красноречие',        desc: 'Собери 5 фраз' },
  { id: 'phrase10',   icon: '💬', name: 'Фразеолог',          desc: 'Выучить 10 фраз' }
];

/* ---------- НАСТРОЙКИ ПО УМОЛЧАНИЮ ---------- */
const DEFAULT_SETTINGS = {
  sound: true,
  vibe: true,
  srs: true,
  hardFilter: false,
  theme: 'system',
  dailyGoal: 20,
  dailyDate: null,
  dailyCount: 0,
  lastStudyDate: null,
  streak: 0,
  streakFreezes: 0,
  totalXP: 0,
  totalCoins: 50,
  achievements: [],
  studyHistory: {},
  ownedAvatars: ['penguin'],
  currentAvatar: 'penguin',
  customPhoto: null,
  customPhotoPaid: false,
  nickname: 'Пользователь',
  doubleXpUntil: null,
  doubleXpActive: false,
  mixDayBoughtDate: null,
  dailyRewardDay: 0,
  dailyRewardDate: null,
  questsToday: [],
  questsDate: null,
  questsProgress: {},
  questsCompleted: [],
  treasureOpened: false,
  treasureDate: null,
  perfectLessons: 0,
  lastBackupDate: null,
  backups: {},
  manualExports: [],
  onboardingDone: false,
  reverseMode: false,
  phrasesBuilt: 0,
  dictationPerfect: false,
  lettersPerfect: false
};

/* ---------- УТИЛИТЫ ---------- */
function todayStr() { return new Date().toISOString().slice(0, 10); }
function todayLocalStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}
function formatDate(iso) {
  const d = new Date(iso);
  const months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/* ============================================================
   ПАРСЕР СЛОВ (автоопределение)
   ============================================================
   Поддерживает:
   1) Автоопределение: 1 строка = слово, 2 строка = перевод
   2) Через | — слово | перевод
   3) Через —, ;, Tab
   4) Через , — если в одной строке два токена и нет парсинга в столбик
   5) Фразы с запятыми: "apple\nяблоко, плод яблони" → одна карточка
   ============================================================ */
function parseBulkText(text) {
  const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (!rawLines.length) return [];

  const cards = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];

    // 1) Если в строке есть разделитель — режем сразу
    if (line.includes(' | ')) {
      const parts = line.split(' | ');
      if (parts.length >= 2) {
        cards.push(makeCard(parts[0].trim(), parts.slice(1).join(' | ').trim()));
        i++;
        continue;
      }
    }
    if (line.includes('|')) {
      const parts = line.split('|');
      if (parts.length >= 2) {
        cards.push(makeCard(parts[0].trim(), parts.slice(1).join('|').trim()));
        i++;
        continue;
      }
    }
    if (line.includes('\t')) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        cards.push(makeCard(parts[0].trim(), parts.slice(1).join(' ').trim()));
        i++;
        continue;
      }
    }
    if (line.includes(' — ')) {
      const parts = line.split(' — ');
      if (parts.length >= 2) {
        cards.push(makeCard(parts[0].trim(), parts.slice(1).join(' — ').trim()));
        i++;
        continue;
      }
    }
    if (line.includes(';')) {
      const parts = line.split(';');
      if (parts.length >= 2) {
        cards.push(makeCard(parts[0].trim(), parts.slice(1).join(';').trim()));
        i++;
        continue;
      }
    }

    // 2) Автоопределение по строкам (главный режим)
    // Если следующая строка существует — считаем текущую "оригиналом", следующую "переводом"
    if (i + 1 < rawLines.length) {
      const nextLine = rawLines[i + 1];
      // Проверяем, что следующая строка — не разделитель с |
      // и что в текущей строке нет запятой как маркера "перевод"
      
      const curHasComma = line.includes(',');
      const nextHasComma = nextLine.includes(',');

      // Если текущая строка без запятой — почти наверняка это оригинал
      if (!curHasComma || (!nextHasComma && curHasComma)) {
        // Текущая = оригинал, следующая = перевод (может содержать запятые)
        cards.push(makeCard(line, nextLine));
        i += 2;
        continue;
      }
    }

    // 3) Одиночная строка с запятой — делим на две части (старый формат)
    if (line.includes(',')) {
      const idx = line.indexOf(',');
      const front = line.slice(0, idx).trim();
      const back = line.slice(idx + 1).trim();
      if (front && back) {
        cards.push(makeCard(front, back));
        i++;
        continue;
      }
    }

    // Иначе — пропускаем строку
    i++;
  }

  return cards;
}

function makeCard(front, back) {
  return {
    front, back,
    seen: 0, correct: 0, wrong: 0,
    star: false, hard: false,
    lastSeen: null, srsNext: null, srsLevel: 0
  };
}

/* ---------- ПАРСЕР ФРАЗ ---------- */
function parseBulkPhrases(text) {
  const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (!rawLines.length) return [];

  const cards = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    // Если есть разделитель | — режем сразу
    if (line.includes(' | ')) {
      const parts = line.split(' | ');
      if (parts.length >= 2) {
        cards.push(makePhraseCard(parts[0].trim(), parts.slice(1).join(' | ').trim()));
        i++;
        continue;
      }
    }
    if (line.includes('|')) {
      const parts = line.split('|');
      if (parts.length >= 2) {
        cards.push(makePhraseCard(parts[0].trim(), parts.slice(1).join('|').trim()));
        i++;
        continue;
      }
    }
    // Иначе — пара строк
    if (i + 1 < rawLines.length) {
      cards.push(makePhraseCard(line, rawLines[i + 1]));
      i += 2;
      continue;
    }
    i++;
  }

  return cards;
}

function makePhraseCard(front, back) {
  return {
    front, back,
    isPhrase: true,
    seen: 0, correct: 0, wrong: 0,
    star: false, hard: false,
    lastSeen: null, srsNext: null, srsLevel: 0
  };
}

/* ---------- РАЗБИЕНИЕ ФРАЗЫ НА СЛОВА ---------- */
function splitPhraseWords(phrase) {
  // Разбиваем фразу на слова, сохраняя знаки препинания отдельно
  return phrase
    .replace(/([¿¡?!.,;:])/g, ' $1 ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0);
}

/* ---------- АНИМАЦИЯ КОНФЕТТИ ---------- */
function launchConfetti(container, count = 60) {
  if (!container) return;
  const colors = ['#ff3b30','#ff9500','#ffcc00','#34c759','#007aff','#5856d6','#ff2d92','#4fc3f7'];
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;
    c.style.width = size + 'px';
    c.style.height = size + 'px';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
    c.style.animationDelay = (Math.random() * 0.4) + 's';
    container.appendChild(c);
    setTimeout(() => c.remove(), 3800);
  }
}

/* ---------- ЗВУКИ ---------- */
let _audioCtx = null;
function getAudioContext() {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}
function playTone(freq, duration = 0.1, type = 'sine', volume = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

const SOUNDS = {
  flip: () => playTone(600, 0.06, 'sine', 0.08),
  good: () => {
    playTone(660, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(880, 0.12, 'sine', 0.15), 80);
  },
  bad: () => {
    playTone(220, 0.15, 'sawtooth', 0.1);
    setTimeout(() => playTone(160, 0.2, 'sawtooth', 0.1), 100);
  },
  finish: () => {
    playTone(523, 0.12, 'sine', 0.18);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.18), 120);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.18), 240);
    setTimeout(() => playTone(1047, 0.25, 'sine', 0.2), 400);
  },
  achievement: () => {
    playTone(880, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.15), 80);
    setTimeout(() => playTone(1320, 0.2, 'sine', 0.15), 160);
  },
  purchase: () => {
    playTone(600, 0.08, 'sine', 0.12);
    setTimeout(() => playTone(900, 0.12, 'sine', 0.12), 70);
  },
  treasure: () => {
    playTone(523, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.15), 100);
    setTimeout(() => playTone(784, 0.1, 'sine', 0.15), 200);
    setTimeout(() => playTone(1047, 0.3, 'sine', 0.2), 300);
  },
  coin: () => playTone(1200, 0.08, 'sine', 0.1)
};

function playSound(name) {
  if (typeof data !== 'undefined' && data.settings && !data.settings.sound) return;
  const fn = SOUNDS[name];
  if (fn) fn();
}

function vibrate(pattern) {
  if (typeof data !== 'undefined' && data.settings && !data.settings.vibe) return;
  if (!navigator.vibrate) return;
  navigator.vibrate(pattern);
}

/* ---------- МОДАЛКИ / ТОСТ / ДИАЛОГ ---------- */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}
document.addEventListener('click', e => {
  if (e.target.classList && e.target.classList.contains('modal-bg')) {
    e.target.classList.remove('active');
  }
});

let _toastTimer;
function toast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

function confirmDialog(title, text, onOk) {
  const titleEl = document.getElementById('confirm-title');
  const textEl = document.getElementById('confirm-text');
  const okEl = document.getElementById('confirm-ok');
  if (!titleEl) return;
  titleEl.textContent = title;
  textEl.textContent = text;
  const newOk = okEl.cloneNode(true);
  okEl.parentNode.replaceChild(newOk, okEl);
  newOk.onclick = () => { closeModal('modal-confirm'); onOk(); };
  openModal('modal-confirm');
}

/* ---------- ОЗВУЧКА ---------- */
const LANG_LOCALES = {
  spanish: 'es-ES',
  english: 'en-US',
  german: 'de-DE',
  french: 'fr-FR',
  italian: 'it-IT'
};

function speak(text, locale) {
  if (!('speechSynthesis' in window)) {
    toast('Озвучка не поддерживается');
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (locale) u.lang = locale;
    u.rate = 0.9;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length && locale) {
      const prefix = locale.split('-')[0].toLowerCase();
      const voice = voices.find(v => v.lang === locale) ||
                    voices.find(v => v.lang.toLowerCase().startsWith(prefix));
      if (voice) u.voice = voice;
    }
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------- ТЕМА ---------- */
function applyTheme(theme) {
  if (!theme || theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

/* ---------- ПИНГВИН-ВЫРАЖЕНИЯ ---------- */
const PENGUIN_EXPRESSIONS = {
  happy: '🐧',
  excited: '🐧✨',
  sleepy: '🐧💤',
  sad: '🐧😢',
  think: '🐧🤔',
  cool: '🐧😎',
  love: '🐧❤️',
  celebrate: '🐧🎉',
  winter: '🐧❄️',
  scarf: '🐧🧣',
  hat: '🐧🎩'
};
