/* ============================================================
   Cards App v8.0 — Часть 1
   Данные, фиксы багов, ввод слов, фразы, тропа, классика, тест
   ============================================================ */

const STORE_KEY = 'cards_app_data_v8';
const OLD_KEYS = ['cards_app_data_v7', 'cards_app_data_v6', 'cards_app_data_v5'];
const BACKUP_KEY_PREFIX = 'cards_backup_';
const MAX_BACKUPS = 7;

function defaultData() {
  return {
    langs: [],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  };
}

function load() {
  try {
    let raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      for (const k of OLD_KEYS) {
        raw = localStorage.getItem(k);
        if (raw) break;
      }
    }
    if (raw) {
      const d = JSON.parse(raw);
      const def = defaultData();
      d.settings = Object.assign({}, def.settings, d.settings || {});
      d.langs = d.langs || [];
      d.langs.forEach(l => {
        if (!l.lessons) l.lessons = [];
        if (!l.folders) l.folders = [];
        if (!l.phraseFolders) l.phraseFolders = [];
        if (!l.isBuiltin) l.isBuiltin = false;
        if (!l.locale) {
          const n = (l.name || '').toLowerCase();
          if (n.includes('испан') || n.includes('span')) l.locale = 'es-ES';
          else if (n.includes('англ') || n.includes('engl')) l.locale = 'en-US';
          else if (n.includes('нем') || n.includes('german') || n.includes('deut')) l.locale = 'de-DE';
          else if (n.includes('фран') || n.includes('fran')) l.locale = 'fr-FR';
          else if (n.includes('итал') || n.includes('ital')) l.locale = 'it-IT';
          else l.locale = 'en-US';
        }
        l.lessons.forEach(ls => {
          ls.cards.forEach(normalizeCard);
          if (ls.completed === undefined) ls.completed = false;
        });
        l.folders.forEach(f => f.cards.forEach(normalizeCard));
        l.phraseFolders.forEach(pf => pf.cards.forEach(normalizeCard));
      });
      if (!d.settings.manualExports) d.settings.manualExports = [];
      return d;
    }
  } catch (e) { console.error('Load error:', e); }
  return defaultData();
}

function normalizeCard(c) {
  if (c.seen === undefined) c.seen = 0;
  if (c.correct === undefined) c.correct = 0;
  if (c.wrong === undefined) c.wrong = 0;
  if (c.star === undefined) c.star = false;
  if (c.hard === undefined) c.hard = false;
  if (c.isPhrase === undefined) c.isPhrase = false;
  if (c.lastSeen === undefined) c.lastSeen = null;
  if (c.srsNext === undefined) c.srsNext = null;
  if (c.srsLevel === undefined) c.srsLevel = 0;
}

let data = load();
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    updateHeaderStats();
  } catch (e) { console.error('Save error:', e); }
}

/* ---------- СОСТОЯНИЕ ---------- */
let currentLangId = null;
let currentFolderId = null;
let currentPhraseFolderId = null;
let currentLessonId = null;
let studyMode = 'classic';
let studyDeck = [];
let studyIndex = 0;
let studyFlipped = false;
let sessionCorrect = 0;
let sessionWrong = 0;
let sessionXP = 0;
let sessionCoins = 0;
let sessionStreakCorrect = 0;
let sessionNewWords = 0;
let sessionStartTime = 0;
let sessionHadError = false;
let actionLock = false;
let quizLocked = false;
let quizTimer = null;
let quizTimeLeft = 10;
let matchPairs = [];
let matchSelectedLeft = null;
let matchSelectedRight = null;
let matchBatch = 5;
let matchOffset = 0;
let audioDeck = [], audioIndex = 0, audioLocked = false;
let speedDeck = [], speedIndex = 0, speedScore = 0, speedTimer = null, speedTimeLeft = 30, speedLocked = false, speedTarget = 10, speedTotal = 0, speedType = 'fast';
let mixDeck = [], mixIndex = 0, mixFlipped = false, mixLocked = false;
let lastLesson = null;
let currentQuests = [];

/* ---------- ОБУЧЕНИЕ ---------- */
let dictationDeck = [], dictationIndex = 0, dictationLocked = false;
let lettersDeck = [], lettersIndex = 0, lettersLocked = false, lettersCurrentWord = '', lettersInput = '', lettersPosition = 0;
let unscrambleDeck = [], unscrambleIndex = 0, unscrambleLocked = false, unscrambleCurrentWords = [], unscramblePool = [], unscrambleAnswer = [];
let sentenceDeck = [], sentenceIndex = 0, sentenceLocked = false, sentencePool = [], sentenceAnswer = [];
let learningMode = 'dictation';

/* ============================================================
   ЗВУК — РАЗБУДКА iOS
   ============================================================ */
function wakeAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.01);
      } catch (e) {}
    });
  }
}
document.addEventListener('touchstart', wakeAudio);
document.addEventListener('click', wakeAudio);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') wakeAudio();
});

/* ============================================================
   ОНБОРДИНГ
   ============================================================ */
function nextOnboarding() {
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.onboarding-dots .dot');
  let idx = 0;
  slides.forEach((s, i) => { if (s.classList.contains('active')) idx = i; });
  if (idx < slides.length - 1) {
    slides[idx].classList.remove('active');
    slides[idx + 1].classList.add('active');
    dots.forEach(d => d.classList.remove('active'));
    dots[idx + 1].classList.add('active');
  }
}
function finishOnboarding() {
  data.settings.onboardingDone = true;
  save();
  const ob = document.getElementById('onboarding');
  if (ob) ob.classList.remove('active');
}
function showOnboardingIfNeeded() {
  if (!data.settings.onboardingDone) {
    const ob = document.getElementById('onboarding');
    if (ob) setTimeout(() => ob.classList.add('active'), 400);
  }
}

/* ============================================================
   НАВИГАЦИЯ
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  updateNavHighlight(id);
}
function updateNavHighlight(screenId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const map = {
    'screen-langs': 'nav-langs',
    'screen-trail': 'nav-langs',
    'screen-cards': 'nav-langs',
    'screen-modes': 'nav-langs',
    'screen-study': 'nav-langs',
    'screen-quiz': 'nav-langs',
    'screen-match': 'nav-langs',
    'screen-audio': 'nav-langs',
    'screen-speed': 'nav-langs',
    'screen-mix': 'nav-langs',
    'screen-finish': 'nav-langs',
    'screen-learning': 'nav-learning',
    'screen-dictation': 'nav-learning',
    'screen-letters': 'nav-learning',
    'screen-unscramble': 'nav-learning',
    'screen-sentence': 'nav-learning',
    'screen-profile': 'nav-profile',
    'screen-settings': 'nav-profile',
    'screen-stats': 'nav-profile',
    'screen-analytics': 'nav-profile',
    'screen-achievements': 'nav-profile',
    'screen-backups': 'nav-profile',
    'screen-shop': 'nav-shop',
    'screen-avatars': 'nav-shop',
    'screen-quests': 'nav-quests'
  };
  const navId = map[screenId];
  if (navId) {
    const btn = document.getElementById(navId);
    if (btn) btn.classList.add('active');
  }
}
function navTo(where) {
  if (where === 'langs') goLangs();
  if (where === 'profile') goProfile();
  if (where === 'shop') openShop();
  if (where === 'quests') openQuests();
  if (where === 'learning') openLearning();
}
function goLangs() {
  currentLangId = null; currentFolderId = null;
  currentPhraseFolderId = null; currentLessonId = null;
  renderLangs(); showScreen('screen-langs'); updateQuestBadge();
}
function goTrail() {
  currentFolderId = null; currentPhraseFolderId = null; currentLessonId = null;
  renderTrail(); showScreen('screen-trail');
}
function goCards() {
  if (currentLessonId) { goTrail(); return; }
  renderCards(); showScreen('screen-cards');
}
function goProfile() { renderProfile(); showScreen('screen-profile'); }

/* ---------- ШАПКА ---------- */
function updateHeaderStats() {
  const coins = document.getElementById('header-coins');
  const xp = document.getElementById('header-xp');
  const streak = document.getElementById('header-streak');
  if (coins) coins.textContent = '💰 ' + formatNumber(data.settings.totalCoins || 0);
  if (streak) streak.textContent = '🔥 ' + (data.settings.streak || 0);
  const doubleActive = data.settings.doubleXpActive &&
                       data.settings.doubleXpUntil &&
                       Date.now() < data.settings.doubleXpUntil;
  if (xp) {
    if (doubleActive) {
      xp.style.background = 'linear-gradient(135deg, #ffd60a, #ff9500)';
      xp.style.color = '#fff';
      const mins = Math.ceil((data.settings.doubleXpUntil - Date.now()) / 60000);
      xp.textContent = `💎 ${formatNumber(data.settings.totalXP || 0)} ×2 (${mins}м)`;
    } else {
      xp.style.background = '';
      xp.style.color = '';
      xp.textContent = '💎 ' + formatNumber(data.settings.totalXP || 0);
    }
  }
  const shopCoins = document.getElementById('shop-coins');
  if (shopCoins) shopCoins.textContent = formatNumber(data.settings.totalCoins || 0);
  const avatarsCoins = document.getElementById('avatars-coins');
  if (avatarsCoins) avatarsCoins.textContent = formatNumber(data.settings.totalCoins || 0);
}

function updateQuestBadge() {
  const badge = document.getElementById('quests-badge');
  if (!badge) return;
  ensureQuestsForToday();
  const completed = (data.settings.questsCompleted || []).length;
  const total = currentQuests.length;
  const remaining = total - completed;
  if (remaining > 0) {
    badge.textContent = remaining;
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
}

/* ============================================================
   XP / МОНЕТЫ
   ============================================================ */
function addXP(amount) {
  let final = amount;
  if (data.settings.doubleXpActive && data.settings.doubleXpUntil && Date.now() < data.settings.doubleXpUntil) {
    final *= 2;
  }
  data.settings.totalXP = (data.settings.totalXP || 0) + final;
  sessionXP += final;
  save();
  checkAchievements();
  return final;
}
function addCoins(amount) {
  data.settings.totalCoins = (data.settings.totalCoins || 0) + amount;
  sessionCoins += amount;
  save();
  checkAchievements();
  spawnCoinFly(amount);
}
function spendCoins(amount) {
  if ((data.settings.totalCoins || 0) < amount) {
    toast(pickPenguin('noCoins'));
    return false;
  }
  data.settings.totalCoins -= amount;
  save();
  return true;
}
function spawnCoinFly(amount) {
  const el = document.getElementById('coin-fly');
  if (!el || amount <= 0) return;
  el.textContent = amount > 50 ? '💰💰' : '💰';
  el.style.display = 'block';
  el.style.left = (window.innerWidth / 2 - 16) + 'px';
  el.style.top = (window.innerHeight / 2) + 'px';
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'coinFly 1s ease-out forwards';
  setTimeout(() => { el.style.display = 'none'; }, 1100);
}

/* ============================================================
   АЧИВКИ
   ============================================================ */
function countStats() {
  let correct = 0, learned = 0, starred = 0, total = 0, lessonsDone = 0, phrasesCount = 0, phrasesLearned = 0;
  data.langs.forEach(l => {
    (l.folders || []).forEach(f => f.cards.forEach(c => {
      total++; correct += c.correct || 0;
      if (c.correct > 0 && c.correct >= c.wrong) learned++;
      if (c.star) starred++;
    }));
    (l.lessons || []).forEach(ls => {
      ls.cards.forEach(c => {
        total++; correct += c.correct || 0;
        if (c.correct > 0 && c.correct >= c.wrong) learned++;
        if (c.star) starred++;
      });
      if (ls.completed) lessonsDone++;
    });
    (l.phraseFolders || []).forEach(pf => pf.cards.forEach(c => {
      phrasesCount++;
      if (c.correct > 0 && c.correct >= c.wrong) phrasesLearned++;
    }));
  });
  return { correct, learned, starred, total, langs: data.langs.length, lessonsDone, phrasesCount, phrasesLearned };
}
function unlockAchievement(id) {
  if (data.settings.achievements.includes(id)) return false;
  data.settings.achievements.push(id);
  save();
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (a) {
    toast(`🏆 ${a.name}!`, 2500);
    playSound('achievement');
    addCoins(COIN_REWARDS.achievementUnlock);
  }
  return true;
}
function checkAchievements() {
  const s = countStats();
  const xp = data.settings.totalXP || 0;
  const streak = data.settings.streak || 0;
  const coins = data.settings.totalCoins || 0;
  const avatarsOwned = (data.settings.ownedAvatars || []).length;
  if (s.correct >= 1) unlockAchievement('first');
  if (s.correct >= 100) unlockAchievement('hundred');
  if (s.correct >= 1000) unlockAchievement('thousand');
  if (s.correct >= 10000) unlockAchievement('tenthousand');
  if (streak >= 7) unlockAchievement('week');
  if (streak >= 30) unlockAchievement('month');
  if (streak >= 365) unlockAchievement('year');
  if (s.langs >= 3) unlockAchievement('polyglot');
  if (s.langs >= 5) unlockAchievement('polyglot5');
  if (s.learned >= 100) unlockAchievement('vocab');
  if (s.learned >= 500) unlockAchievement('professor');
  if (s.learned >= 1000) unlockAchievement('master');
  if (s.starred >= 100) unlockAchievement('collector');
  if (xp >= 10000) unlockAchievement('legend');
  if (xp >= 50000) unlockAchievement('god');
  if (s.lessonsDone >= 1) unlockAchievement('trail1');
  if (s.lessonsDone >= 10) unlockAchievement('trail10');
  if (s.lessonsDone >= 50) unlockAchievement('trail50');
  if (s.lessonsDone >= 100) unlockAchievement('trail100');
  if (coins >= 1000) unlockAchievement('coin100');
  if (avatarsOwned >= 3) unlockAchievement('avatar');
  if (avatarsOwned >= 10) unlockAchievement('collector2');
  if (s.phrasesLearned >= 10) unlockAchievement('phrase10');
}

/* ============================================================
   ЯЗЫКИ
   ============================================================ */
function renderLangs() {
  const el = document.getElementById('langs-list');
  if (!el) return;
  el.innerHTML = '';
  updateHeaderStats();
  if (!data.langs.length) {
    el.innerHTML = `<div class="empty">${pickPenguin('empty')}</div>`;
    return;
  }
  data.langs.forEach(lang => {
    const stats = langStats(lang);
    const pal = getLangPalette(lang.templateKey);
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <div class="info">
        <div class="title">${lang.emoji || pal.emoji} ${esc(lang.name)}${lang.isBuiltin ? ' <span class="badge ok">готовый</span>' : ''}</div>
        <div class="sub">${stats.lessonsDone} / ${stats.lessonsTotal} уроков · ${stats.total} слов · ${stats.pct}%</div>
        <div class="stat-bar"><div style="width:${stats.pct}%;background:linear-gradient(90deg,${pal.grad1},${pal.grad2})"></div></div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); confirmDeleteLang('${lang.id}')">✕</span>
    `;
    div.onclick = () => {
      currentLangId = lang.id;
      const title = document.getElementById('trail-title');
      if (title) title.textContent = `${lang.emoji || pal.emoji} ${lang.name}`;
      goTrail();
    };
    el.appendChild(div);
  });
}
function langStats(lang) {
  let total = 0, learned = 0, lessonsDone = 0, lessonsTotal = (lang.lessons || []).length;
  (lang.folders || []).forEach(f => f.cards.forEach(c => {
    total++; if (c.correct > 0 && c.correct >= c.wrong) learned++;
  }));
  (lang.lessons || []).forEach(ls => {
    ls.cards.forEach(c => {
      total++; if (c.correct > 0 && c.correct >= c.wrong) learned++;
    });
    if (ls.completed) lessonsDone++;
  });
  const pct = total ? Math.round(learned / total * 100) : 0;
  return { total, learned, pct, lessonsDone, lessonsTotal };
}

function openAddLang() {
  const tplEl = document.getElementById('templates-list');
  if (tplEl) {
    const existingKeys = new Set(data.langs.filter(l => l.templateKey).map(l => l.templateKey));
    tplEl.innerHTML = AVAILABLE_TEMPLATES.map(t => {
      const used = existingKeys.has(t.key);
      return `<button class="template-btn" ${used ? 'disabled' : ''} onclick="addLangFromTemplate('${t.key}')">
        <span class="tpl-emoji">${t.emoji}</span>
        <span class="tpl-info">
          <div class="tpl-name">${t.name}</div>
          <div class="tpl-sub">${used ? 'Уже добавлен' : t.desc}</div>
        </span>
      </button>`;
    }).join('');
  }
  const inp = document.getElementById('lang-input');
  if (inp) inp.value = '';
  openModal('modal-lang');
  setTimeout(() => inp && inp.focus(), 150);
}
function addLangFromTemplate(key) {
  const lang = createLangFromTemplate(key);
  if (!lang) { toast('Не удалось создать язык'); return; }
  data.langs.push(lang);
  save(); closeModal('modal-lang'); renderLangs();
  toast(`${lang.emoji} ${lang.name} добавлен! 🐧`);
  checkAchievements();
}
function saveLang() {
  const name = document.getElementById('lang-input').value.trim();
  if (!name) return;
  data.langs.push({
    id: uid(), name, emoji: '🌍', locale: 'en-US',
    isBuiltin: false, lessons: [], folders: [], phraseFolders: []
  });
  save(); closeModal('modal-lang'); renderLangs();
  checkAchievements();
}
function confirmDeleteLang(id) {
  confirmDialog('Удалить язык?', 'Все уроки, папки, фразы и прогресс удалятся.', () => {
    data.langs = data.langs.filter(l => l.id !== id);
    save(); renderLangs();
  });
}

/* ============================================================
   ТРОПА
   ============================================================ */
function switchTab(tab) {
  const t1 = document.getElementById('tab-trail');
  const t2 = document.getElementById('tab-mine');
  const t3 = document.getElementById('tab-phrases');
  const c1 = document.getElementById('tab-content-trail');
  const c2 = document.getElementById('tab-content-mine');
  const c3 = document.getElementById('tab-content-phrases');
  if (t1) t1.classList.toggle('active', tab === 'trail');
  if (t2) t2.classList.toggle('active', tab === 'mine');
  if (t3) t3.classList.toggle('active', tab === 'phrases');
  if (c1) c1.style.display = tab === 'trail' ? 'block' : 'none';
  if (c2) c2.style.display = tab === 'mine' ? 'block' : 'none';
  if (c3) c3.style.display = tab === 'phrases' ? 'block' : 'none';
  if (tab === 'mine') renderMineList();
  if (tab === 'phrases') renderPhrasesList();
}

function renderTrail() {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) { goLangs(); return; }
  const phraseEl = document.getElementById('trail-phrase');
  if (phraseEl) phraseEl.textContent = penguinForTrail();
  updateTreasureButton();
  const pathEl = document.getElementById('trail-path');
  if (!pathEl) return;
  pathEl.innerHTML = '';

  // Снежинки
  const snow = document.createElement('div');
  snow.className = 'trail-snow';
  for (let i = 0; i < 20; i++) {
    const flake = document.createElement('div');
    flake.className = 'trail-snowflake';
    flake.textContent = ['❅', '❆', '❄', '❅'][i % 4];
    flake.style.left = Math.random() * 100 + '%';
    flake.style.fontSize = (10 + Math.random() * 14) + 'px';
    flake.style.animationDuration = (6 + Math.random() * 8) + 's';
    flake.style.animationDelay = (Math.random() * 8) + 's';
    snow.appendChild(flake);
  }
  pathEl.appendChild(snow);

  // Ёлочки
  ['t1', 't2', 't3'].forEach((t, i) => {
    const treeL = document.createElement('div');
    treeL.className = 'trail-tree left ' + t;
    treeL.textContent = '🎄';
    treeL.style.animationDelay = (i * 0.5) + 's';
    pathEl.appendChild(treeL);
    const treeR = document.createElement('div');
    treeR.className = 'trail-tree right ' + t;
    treeR.textContent = '🎄';
    treeR.style.animationDelay = (i * 0.5 + 0.3) + 's';
    pathEl.appendChild(treeR);
  });

  if (!lang.lessons || !lang.lessons.length) {
    pathEl.innerHTML += `<div class="empty">${pickPenguin('empty')}</div>`;
    return;
  }

  const currentIdx = lang.lessons.findIndex(l => !l.completed);
  lang.lessons.forEach((lesson, idx) => {
    const isDone = lesson.completed;
    const isCurrent = idx === currentIdx;
    const isLocked = !isDone && !isCurrent && idx > currentIdx;

    const node = document.createElement('div');
    node.className = 'trail-node' + (isDone ? ' done' : '');

    node.innerHTML = `
      <div class="lesson-circle ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}"
           onclick="${isLocked ? `trySkipLesson('${lesson.id}')` : `openLesson('${lesson.id}')`}">
        <div class="lesson-icon">${isDone ? '⭐' : isLocked ? '🔒' : lesson.themeEmoji || '📘'}</div>
        <div class="lesson-num">${lesson.lessonNum}/${lesson.totalInTheme}</div>
      </div>
      <div class="lesson-label">
        <div class="title">${esc(lesson.themeName)}</div>
        <div class="sub">Урок ${lesson.lessonNum} · ${lesson.cards.length} слов</div>
      </div>
    `;
    pathEl.appendChild(node);
  });
}
function trySkipLesson(lessonId) {
  const coins = data.settings.totalCoins || 0;
  const price = SHOP_PRICES.skipLesson;
  if (coins < price) {
    toast(`🔒 Нужно ${price} монет (у тебя ${coins})`);
    return;
  }
  confirmDialog(
    'Пропустить урок?',
    `Потратить ${price} монет и засчитать урок как пройденный?`,
    () => {
      if (!spendCoins(price)) return;
      const lang = data.langs.find(l => l.id === currentLangId);
      const lesson = lang.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.completed = true;
        save();
        playSound('purchase');
        toast('⏭ Урок пропущен!');
        renderTrail();
      }
    }
  );
}
function openLesson(lessonId) {
  const lang = data.langs.find(l => l.id === currentLangId);
  const lesson = lang.lessons.find(l => l.id === lessonId);
  if (!lesson) return;
  currentLessonId = lessonId;
  currentFolderId = null;
  currentPhraseFolderId = null;
  const title = document.getElementById('cards-title');
  if (title) title.textContent = `${lesson.themeEmoji || '📘'} ${lesson.themeName} · Урок ${lesson.lessonNum}`;
  renderCards(); showScreen('screen-cards');
}
function updateTreasureButton() {
  const btn = document.getElementById('treasure-btn');
  if (!btn) return;
  const ready = isTreasureReady();
  btn.style.opacity = ready ? '1' : '0.4';
  btn.style.animation = ready ? 'currentPulse 1.5s infinite' : 'none';
}
function isTreasureReady() {
  ensureQuestsForToday();
  const completed = (data.settings.questsCompleted || []).length;
  const total = currentQuests.length;
  if (completed < total || total === 0) return false;
  if (data.settings.treasureDate === todayLocalStr()) return false;
  return true;
}
function openTreasureIfReady() {
  if (!isTreasureReady()) {
    const completed = (data.settings.questsCompleted || []).length;
    const total = currentQuests.length;
    toast(`Сундук: ${completed} / ${total} квестов`, 2000);
    return;
  }
  openModal('modal-treasure');
}

/* ============================================================
   МОИ ПАПКИ (ФИКС: только текущий язык)
   ============================================================ */
function renderMineList() {
  const el = document.getElementById('mine-list');
  if (!el) return;
  el.innerHTML = '';
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) {
    el.innerHTML = `<div class="empty">Сначала выбери язык</div>`;
    return;
  }
  if (!lang.folders || !lang.folders.length) {
    el.innerHTML = `<div class="empty">🐧 Пока нет своих папок.<br>Добавь слова вручную или импортируй CSV.</div>`;
    return;
  }
  lang.folders.forEach(folder => {
    const total = folder.cards.length;
    const learned = folder.cards.filter(c => c.correct > 0 && c.correct >= c.wrong).length;
    const pct = total ? Math.round(learned / total * 100) : 0;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <div class="info">
        <div class="title">${esc(folder.name)}</div>
        <div class="sub">${total} слов · ${pct}%</div>
        <div class="stat-bar"><div style="width:${pct}%"></div></div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); confirmDeleteFolder('${folder.id}')">✕</span>
    `;
    div.onclick = () => {
      currentFolderId = folder.id;
      currentLessonId = null;
      currentPhraseFolderId = null;
      const title = document.getElementById('cards-title');
      if (title) title.textContent = folder.name;
      renderCards(); showScreen('screen-cards');
    };
    el.appendChild(div);
  });
}

/* ============================================================
   ПАПКИ С ФРАЗАМИ
   ============================================================ */
function renderPhrasesList() {
  const el = document.getElementById('phrases-list');
  if (!el) return;
  el.innerHTML = '';
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) {
    el.innerHTML = `<div class="empty">Сначала выбери язык</div>`;
    return;
  }
  if (!lang.phraseFolders || !lang.phraseFolders.length) {
    el.innerHTML = `<div class="empty">💬 Пока нет фраз.<br>Добавь свои через «+ Фразы» или выбери готовый язык.</div>`;
    return;
  }
  lang.phraseFolders.forEach(folder => {
    const total = folder.cards.length;
    const learned = folder.cards.filter(c => c.correct > 0 && c.correct >= c.wrong).length;
    const pct = total ? Math.round(learned / total * 100) : 0;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <div class="info">
        <div class="title">${folder.emoji || '💬'} ${esc(folder.name)}${folder.isBuiltin ? ' <span class="badge phrase">готовая</span>' : ''}</div>
        <div class="sub">${total} фраз · ${pct}%</div>
        <div class="stat-bar"><div style="width:${pct}%"></div></div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); confirmDeletePhraseFolder('${folder.id}')">✕</span>
    `;
    div.onclick = () => {
      currentPhraseFolderId = folder.id;
      currentFolderId = null;
      currentLessonId = null;
      const title = document.getElementById('cards-title');
      if (title) title.textContent = '💬 ' + folder.name;
      renderCards(); showScreen('screen-cards');
    };
    el.appendChild(div);
  });
}

function openAddFolder() {
  const inp = document.getElementById('folder-input');
  if (inp) inp.value = '';
  openModal('modal-folder');
  setTimeout(() => inp && inp.focus(), 150);
}
function saveFolder() {
  const name = document.getElementById('folder-input').value.trim();
  if (!name) return;
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang.folders) lang.folders = [];
  lang.folders.push({ id: uid(), name, cards: [] });
  save(); closeModal('modal-folder');
  const newFolder = lang.folders[lang.folders.length - 1];
  currentFolderId = newFolder.id;
  currentLessonId = null;
  currentPhraseFolderId = null;
  const title = document.getElementById('cards-title');
  if (title) title.textContent = newFolder.name;
  renderCards(); showScreen('screen-cards');
}
function confirmDeleteFolder(id) {
  confirmDialog('Удалить папку?', 'Все слова внутри удалятся.', () => {
    const lang = data.langs.find(l => l.id === currentLangId);
    lang.folders = lang.folders.filter(f => f.id !== id);
    save(); renderMineList();
  });
}

function openAddPhrasesFolder() {
  const inp = document.getElementById('phrases-folder-input');
  if (inp) inp.value = '';
  openModal('modal-phrases-folder');
  setTimeout(() => inp && inp.focus(), 150);
}
function savePhrasesFolder() {
  const name = document.getElementById('phrases-folder-input').value.trim();
  if (!name) return;
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang.phraseFolders) lang.phraseFolders = [];
  lang.phraseFolders.push({ id: uid(), name, emoji: '💬', cards: [] });
  save(); closeModal('modal-phrases-folder');
  const newFolder = lang.phraseFolders[lang.phraseFolders.length - 1];
  currentPhraseFolderId = newFolder.id;
  currentFolderId = null;
  currentLessonId = null;
  const title = document.getElementById('cards-title');
  if (title) title.textContent = '💬 ' + newFolder.name;
  renderCards(); showScreen('screen-cards');
}
function confirmDeletePhraseFolder(id) {
  confirmDialog('Удалить папку с фразами?', 'Все фразы внутри удалятся.', () => {
    const lang = data.langs.find(l => l.id === currentLangId);
    lang.phraseFolders = lang.phraseFolders.filter(f => f.id !== id);
    save(); renderPhrasesList();
  });
}

/* ============================================================
   КАРТОЧКИ
   ============================================================ */
function getCurrentContainer() {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) return null;
  if (currentLessonId) return lang.lessons.find(l => l.id === currentLessonId);
  if (currentFolderId) return lang.folders.find(f => f.id === currentFolderId);
  if (currentPhraseFolderId) return lang.phraseFolders.find(f => f.id === currentPhraseFolderId);
  return null;
}
function renderCards() {
  const c = getCurrentContainer();
  if (!c) { goTrail(); return; }
  const el = document.getElementById('cards-list');
  if (!el) return;
  el.innerHTML = '';
  if (!c.cards.length) {
    el.innerHTML = `<div class="empty">🐧 Пока нет слов.<br>Нажми «Текст» или «CSV».</div>`;
    return;
  }
  c.cards.forEach((card, i) => {
    const learned = card.correct > 0 && card.correct >= card.wrong;
    const badges = [];
    if (card.isPhrase) badges.push('<span class="badge phrase">💬 фраза</span>');
    if (card.hard) badges.push('<span class="badge hard">⚡ сложное</span>');
    if (card.seen === 0 && !card.isPhrase) badges.push('<span class="badge">новое</span>');
    else if (learned) badges.push('<span class="badge ok">выучено</span>');
    else if (!card.isPhrase) badges.push('<span class="badge bad">учить</span>');
    const badgeHtml = badges.join(' ');
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <div class="info">
        <div class="title">${card.star ? '⭐ ' : ''}${esc(card.front)} ${badgeHtml}</div>
        <div class="sub">${esc(card.back)}</div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); deleteCard(${i})">✕</span>
    `;
    el.appendChild(div);
  });
}
function deleteCard(idx) {
  const c = getCurrentContainer();
  if (!c) return;
  c.cards.splice(idx, 1);
  save(); renderCards();
}

/* ============================================================
   МАССОВЫЙ ВВОД (новый парсер)
   ============================================================ */
function openBulkAdd() {
  const c = getCurrentContainer();
  if (!c) return;
  const isPhraseFolder = currentPhraseFolderId !== null;
  if (isPhraseFolder) {
    const inp = document.getElementById('bulk-phrases-input');
    if (inp) inp.value = c.cards.map(x => `${x.front}\n${x.back}`).join('\n\n');
    openModal('modal-bulk-phrases');
  } else {
    const inp = document.getElementById('bulk-input');
    if (inp) inp.value = c.cards.map(x => `${x.front}\n${x.back}`).join('\n\n');
    openModal('modal-bulk');
  }
}
function addBulk() {
  const text = document.getElementById('bulk-input').value;
  const newCards = parseBulkText(text);
  if (!newCards.length) { toast('Не удалось распознать строки'); return; }
  const c = getCurrentContainer();
  if (!c) return;
  const existing = new Set(c.cards.map(x => x.front.toLowerCase()));
  let added = 0;
  for (const card of newCards) {
    if (!existing.has(card.front.toLowerCase())) { c.cards.push(card); added++; }
  }
  save(); closeModal('modal-bulk'); renderCards();
  toast(`✅ Добавлено: ${added}`, 2000);
  addXP(2 * added);
}
function replaceBulk() {
  confirmDialog('Заменить всё?', 'Все текущие слова удалятся.', () => {
    const c = getCurrentContainer();
    if (!c) return;
    c.cards = parseBulkText(document.getElementById('bulk-input').value);
    save(); closeModal('modal-bulk'); renderCards();
    toast(`Заменено: ${c.cards.length}`);
  });
}
function addBulkPhrases() {
  const text = document.getElementById('bulk-phrases-input').value;
  const newCards = parseBulkPhrases(text);
  if (!newCards.length) { toast('Не удалось распознать фразы'); return; }
  const c = getCurrentContainer();
  if (!c) return;
  const existing = new Set(c.cards.map(x => x.front.toLowerCase()));
  let added = 0;
  for (const card of newCards) {
    if (!existing.has(card.front.toLowerCase())) { c.cards.push(card); added++; }
  }
  save(); closeModal('modal-bulk-phrases'); renderCards();
  toast(`✅ Добавлено фраз: ${added}`, 2000);
  addXP(3 * added);
}
function replaceBulkPhrases() {
  confirmDialog('Заменить всё?', 'Все текущие фразы удалятся.', () => {
    const c = getCurrentContainer();
    if (!c) return;
    c.cards = parseBulkPhrases(document.getElementById('bulk-phrases-input').value);
    save(); closeModal('modal-bulk-phrases'); renderCards();
    toast(`Заменено: ${c.cards.length}`);
  });
}

/* ============================================================
   ВЫБОР РЕЖИМА
   ============================================================ */
function renderModePicker() {
  const xp = data.settings.totalXP || 0;
  const el = document.getElementById('mode-picker');
  if (!el) return;
  const c = getCurrentContainer();
  const hardCount = c ? c.cards.filter(x => x.hard).length : 0;
  const isPhrases = currentPhraseFolderId !== null;
  el.innerHTML = `
    <button class="mode-btn" onclick="startStudy('classic', false)">
      <div class="mode-icon">🎴</div>
      <div class="mode-name">Классические карточки</div>
      <div class="mode-desc">Тап — переворот, свайп — следующая</div>
    </button>
    <button class="mode-btn" onclick="startStudy('classic', true)">
      <div class="mode-icon">🎯</div>
      <div class="mode-name">Только не выученные</div>
      <div class="mode-desc">Слова, которые ты ещё плохо знаешь</div>
    </button>
    ${hardCount > 0 ? `
      <button class="mode-btn" onclick="startStudy('hard', false)">
        <div class="mode-icon">⚡</div>
        <div class="mode-name">Только сложные</div>
        <div class="mode-desc">${hardCount} помеченных</div>
      </button>
    ` : ''}
    <button class="mode-btn" onclick="startStudy('quiz', false)">
      <div class="mode-icon">⚡</div>
      <div class="mode-name">Быстрый тест</div>
      <div class="mode-desc">Выбери перевод из 4 вариантов</div>
    </button>
    <button class="mode-btn" onclick="startStudy('match', false)">
      <div class="mode-icon">🔗</div>
      <div class="mode-name">Сопоставление</div>
      <div class="mode-desc">Соедини пары (3+ элемента)</div>
    </button>
    <button class="mode-btn" onclick="startStudy('audio', false)">
      <div class="mode-icon">🔊</div>
      <div class="mode-name">Аудио-режим</div>
      <div class="mode-desc">Слушай и выбирай перевод</div>
    </button>
    ${isPhrases ? `
      <div class="section-title">Для фраз</div>
      <button class="mode-btn" onclick="startSentenceGame('phrases')">
        <div class="mode-icon">🧩</div>
        <div class="mode-name">Собери фразу</div>
        <div class="mode-desc">Слова перемешаны — собери в правильном порядке</div>
      </button>
    ` : ''}
    <div class="section-title">Скоростные режимы</div>
    <button class="mode-btn" onclick="startSpeed('fast')">
      <div class="mode-icon">⚡</div>
      <div class="mode-name">Быстрый · 10 слов</div>
      <div class="mode-desc">30 секунд — успей ответить</div>
    </button>
    <button class="mode-btn ${xp < 500 ? 'locked' : ''}"
      onclick="${xp < 500 ? `toast('🔒 Нужно 500 XP (у тебя ${xp})')` : `startSpeed('normal')`}">
      ${xp < 500 ? '<span class="mode-lock">🔒 500 XP</span>' : ''}
      <div class="mode-icon">🚀</div>
      <div class="mode-name">Скоростной · 15 слов</div>
      <div class="mode-desc">30 секунд — проверь себя</div>
    </button>
    <button class="mode-btn ${xp < 1500 ? 'locked' : ''}"
      onclick="${xp < 1500 ? `toast('🔒 Нужно 1500 XP (у тебя ${xp})')` : `startSpeed('hard')`}">
      ${xp < 1500 ? '<span class="mode-lock">🔒 1500 XP</span>' : ''}
      <div class="mode-icon">🔥</div>
      <div class="mode-name">Хардкор · 15 слов</div>
      <div class="mode-desc">20 секунд — только для мастеров</div>
    </button>
    <button class="mode-btn ${xp < 1000 ? 'locked' : ''}"
      onclick="${xp < 1000 ? `toast('🔒 Нужно 1000 XP (у тебя ${xp})')` : `startMix()`}">
      ${xp < 1000 ? '<span class="mode-lock">🔒 1000 XP</span>' : ''}
      <div class="mode-icon">🌪</div>
      <div class="mode-name">Микс-тренировка</div>
      <div class="mode-desc">Случайные слова со всего языка</div>
    </button>
  `;
}
function openModePicker() {
  const c = getCurrentContainer();
  if (!c || !c.cards.length) { toast('🐧 Нет слов для изучения'); return; }
  renderModePicker();
  showScreen('screen-modes');
}

/* ============================================================
   СТАРТ УЧЁБЫ
   ============================================================ */
function resetSession() {
  sessionCorrect = 0; sessionWrong = 0; sessionXP = 0; sessionCoins = 0;
  sessionStreakCorrect = 0; sessionNewWords = 0; sessionHadError = false;
  sessionStartTime = Date.now();
  quizLocked = false; audioLocked = false; speedLocked = false;
  mixLocked = false; actionLock = false;
  matchSelectedLeft = null; matchSelectedRight = null; matchOffset = 0;
}
function startStudy(mode, onlyUnlearned) {
  const c = getCurrentContainer();
  if (!c) return;
  let deck = [...c.cards];
  if (mode === 'hard') deck = deck.filter(x => x.hard);
  else if (onlyUnlearned) deck = deck.filter(x => !(x.correct > 0 && x.correct >= x.wrong));
  if (!deck.length) { toast('🐧 Нет слов для изучения'); return; }
  studyMode = mode;
  resetSession();
  studyDeck = deck;
  studyIndex = 0;
  studyFlipped = false;
  const title = c.name || c.themeName || 'Урок';
  if (mode === 'classic' || mode === 'hard') {
    document.getElementById('study-title').textContent = title;
    showScreen('screen-study');
    renderStudyCard();
  } else if (mode === 'quiz') {
    if (studyDeck.length < 2) { toast('Нужно минимум 2 слова'); return; }
    document.getElementById('quiz-title').textContent = title;
    showScreen('screen-quiz');
    renderQuizCard();
  } else if (mode === 'match') {
    if (studyDeck.length < 3) { toast('Нужно минимум 3 элемента'); return; }
    document.getElementById('match-title').textContent = title;
    showScreen('screen-match');
    renderMatchBatch();
  } else if (mode === 'audio') {
    if (studyDeck.length < 2) { toast('Нужно минимум 2 слова'); return; }
    document.getElementById('audio-title').textContent = title;
    audioDeck = deck; audioIndex = 0;
    showScreen('screen-audio');
    renderAudioCard();
  }
}

/* ============================================================
   КЛАССИКА
   ============================================================ */
function renderStudyCard() {
  const card = studyDeck[studyIndex];
  if (!card) { finishSession(); return; }
  const cardEl = document.getElementById('card');
  if (!cardEl) return;
  cardEl.classList.remove('fly-left', 'fly-right', 'good-anim', 'bad-anim');
  cardEl.style.transform = '';
  cardEl.style.opacity = '1';
  cardEl.classList.toggle('flipped', studyFlipped);
  const showBack = data.settings.reverseMode ? !studyFlipped : studyFlipped;
  document.getElementById('card-word').textContent = showBack ? card.back : card.front;
  document.getElementById('card-hint').textContent = studyFlipped ? 'Нажмите, чтобы вернуть' : 'Нажмите, чтобы перевернуть';
  document.getElementById('study-progress').textContent = `${studyIndex + 1} / ${studyDeck.length}`;
  document.getElementById('study-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('progress-fill').style.width = `${(studyIndex / studyDeck.length) * 100}%`;
  const starBtn = document.getElementById('star-btn');
  if (starBtn) {
    starBtn.textContent = card.star ? '★' : '☆';
    starBtn.style.color = card.star ? 'var(--star)' : '';
  }
  const hardBtn = document.getElementById('hard-btn');
  if (hardBtn) hardBtn.style.color = card.hard ? 'var(--warn)' : '';
  const revBtn = document.getElementById('reverse-btn');
  if (revBtn) revBtn.style.opacity = data.settings.reverseMode ? '1' : '0.5';
}
function toggleReverse() {
  data.settings.reverseMode = !data.settings.reverseMode;
  save(); renderStudyCard();
  toast(data.settings.reverseMode ? '🔄 Обратный режим ВКЛ' : '🔄 Обратный режим ВЫКЛ');
}
function toggleStar() {
  const card = studyDeck[studyIndex];
  if (!card) return;
  card.star = !card.star;
  save(); renderStudyCard(); playSound('flip');
  checkAchievements();
  if (card.star) trackQuestProgress('star', 1);
}
function toggleHard() {
  const card = studyDeck[studyIndex];
  if (!card) return;
  card.hard = !card.hard;
  save(); renderStudyCard(); playSound('flip');
  if (card.hard) toast(pickPenguin('hard'));
}
function speakCurrent(e) {
  if (e) e.stopPropagation();
  const card = studyDeck[studyIndex];
  if (!card) return;
  const lang = data.langs.find(l => l.id === currentLangId);
  speak(card.front, lang ? lang.locale : 'en-US');
}

function answer(correct) {
  if (actionLock) return;
  actionLock = true;
  const card = studyDeck[studyIndex];
  if (!card) { actionLock = false; return; }
  const wasNew = card.seen === 0;
  card.seen++;
  if (correct) {
    card.correct++; sessionCorrect++; sessionStreakCorrect++;
    if (wasNew) sessionNewWords++;
    let gain = XP_REWARDS.correct;
    if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
    addXP(gain);
    addCoins(COIN_REWARDS.correct);
    playSound('good');
    trackQuestProgress('correct', 1);
  } else {
    card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
    sessionHadError = true;
    playSound('bad');
  }
  card.lastSeen = Date.now();
  updateSRS(card, correct);
  save();
  const cardEl = document.getElementById('card');
  if (correct) {
    cardEl.classList.add('good-anim');
    setTimeout(() => cardEl.classList.add('fly-right'), 200);
  } else {
    cardEl.classList.add('bad-anim');
    setTimeout(() => cardEl.classList.add('fly-left'), 300);
  }
  setTimeout(() => {
    actionLock = false;
    nextCard();
  }, 700);
}
function nextCard() {
  studyIndex++;
  if (studyIndex >= studyDeck.length) { finishSession(); return; }
  studyFlipped = false;
  renderStudyCard();
}
function shuffleDeck() {
  studyDeck = shuffle(studyDeck);
  studyIndex = 0; studyFlipped = false;
  renderStudyCard();
  toast('🔀 Перемешано');
}

/* ---------- СВАЙПЫ ---------- */
let startX = 0, startY = 0, currentX = 0, currentY = 0, swipeActive = false, isDragging = false;
function initCardSwipe() {
  const cardEl = document.getElementById('card');
  if (!cardEl) return;
  cardEl.addEventListener('click', () => {
    if (swipeActive) return;
    studyFlipped = !studyFlipped;
    playSound('flip');
    renderStudyCard();
  });
  cardEl.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = 0; currentY = 0;
    isDragging = true; swipeActive = false;
    cardEl.style.transition = 'none';
  }, { passive: true });
  cardEl.addEventListener('touchmove', e => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX - startX;
    currentY = e.touches[0].clientY - startY;
    if (Math.abs(currentX) > 8 || Math.abs(currentY) > 8) swipeActive = true;
    if (Math.abs(currentX) > Math.abs(currentY)) {
      cardEl.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;
      cardEl.style.opacity = Math.max(0.3, 1 - Math.abs(currentX) / 400);
    }
  }, { passive: true });
  cardEl.addEventListener('touchend', () => {
    isDragging = false;
    cardEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    if (Math.abs(currentX) > 80) {
      const dir = currentX > 0 ? 1 : -1;
      cardEl.style.transform = `translateX(${dir * 500}px) rotate(${dir * 20}deg)`;
      cardEl.style.opacity = '0';
      setTimeout(() => answer(dir > 0), 250);
    } else {
      cardEl.style.transform = '';
      cardEl.style.opacity = '1';
    }
    setTimeout(() => { swipeActive = false; }, 100);
  }, { passive: true });
}

/* ============================================================
   БЫСТРЫЙ ТЕСТ
   ============================================================ */
function renderQuizCard() {
  const card = studyDeck[studyIndex];
  if (!card) { finishSession(); return; }
  quizLocked = false;
  document.getElementById('quiz-question').textContent = card.front;
  const wrongPool = studyDeck.filter(x => x.front !== card.front);
  const wrongs = shuffle(wrongPool).slice(0, 3).map(x => x.back);
  const opts = shuffle([card.back, ...wrongs]);
  const optsEl = document.getElementById('quiz-options');
  optsEl.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.onclick = () => quizAnswer(btn, opt, card);
    optsEl.appendChild(btn);
  });
  document.getElementById('quiz-progress').textContent = `${studyIndex + 1} / ${studyDeck.length}`;
  document.getElementById('quiz-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('quiz-progress-fill').style.width = `${(studyIndex / studyDeck.length) * 100}%`;
  startQuizTimer(card);
}
function startQuizTimer(card) {
  clearInterval(quizTimer);
  quizTimeLeft = 10;
  const el = document.getElementById('quiz-timer');
  el.textContent = `⏱ ${quizTimeLeft}с`;
  el.classList.remove('urgent');
  quizTimer = setInterval(() => {
    quizTimeLeft--;
    el.textContent = `⏱ ${quizTimeLeft}с`;
    if (quizTimeLeft <= 3) el.classList.add('urgent');
    if (quizTimeLeft <= 0) {
      clearInterval(quizTimer);
      if (!quizLocked) quizTimeout(card);
    }
  }, 1000);
}
function quizTimeout(card) {
  if (quizLocked) return;
  quizLocked = true;
  card.seen++; card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
  sessionHadError = true;
  updateSRS(card, false); save();
  document.querySelectorAll('#quiz-options .quiz-option').forEach(b => {
    if (b.textContent === card.back) b.classList.add('correct');
  });
  playSound('bad');
  setTimeout(() => {
    studyIndex++;
    if (studyIndex >= studyDeck.length) { finishSession(); return; }
    renderQuizCard();
  }, 900);
}
function quizAnswer(btn, chosen, card) {
  if (quizLocked) return;
  quizLocked = true;
  clearInterval(quizTimer);
  const wasNew = card.seen === 0;
  card.seen++;
  const isCorrect = chosen === card.back;
  const fast = quizTimeLeft >= 7;
  if (isCorrect) {
    card.correct++; sessionCorrect++; sessionStreakCorrect++;
    if (wasNew) sessionNewWords++;
    let gain = XP_REWARDS.correct;
    if (fast) gain += XP_REWARDS.fastBonus;
    if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
    addXP(gain);
    addCoins(COIN_REWARDS.correct);
    btn.classList.add('correct');
    playSound('good');
    trackQuestProgress('correct', 1);
  } else {
    card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
    sessionHadError = true;
    btn.classList.add('wrong');
    document.querySelectorAll('#quiz-options .quiz-option').forEach(b => {
      if (b.textContent === card.back) b.classList.add('correct');
    });
    playSound('bad');
  }
  card.lastSeen = Date.now();
  updateSRS(card, isCorrect);
  save();
  setTimeout(() => {
    studyIndex++;
    if (studyIndex >= studyDeck.length) { finishSession(); return; }
    renderQuizCard();
  }, 900);
}

/* ---------- SRS ---------- */
function updateSRS(card, correct) {
  if (!data.settings.srs) return;
  if (correct) card.srsLevel = Math.min((card.srsLevel || 0) + 1, 5);
  else card.srsLevel = 0;
  const intervals = [0, 1, 2, 4, 7, 14];
  const days = intervals[card.srsLevel] || 14;
  card.srsNext = Date.now() + days * 86400000;
}

/* ---------- СТРИК ---------- */
function markStudyDay() {
  const today = new Date().toDateString();
  const last = data.settings.lastStudyDate;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === yesterday) {
    data.settings.streak = (data.settings.streak || 0) + 1;
  } else if (last && last !== yesterday && last !== today) {
    if (data.settings.streakFreezes > 0) {
      data.settings.streakFreezes--;
      toast(pickPenguin('freezeUsed'), 2500);
    } else {
      data.settings.streak = 1;
    }
  } else {
    data.settings.streak = 1;
  }
  data.settings.lastStudyDate = today;
  save();
  addXP(XP_REWARDS.streakDay * Math.min(data.settings.streak, 10));
  addCoins(COIN_REWARDS.streakDay);
  checkAchievements();
}
function incrementDailyCount(n) {
  const today = new Date().toDateString();
  if (data.settings.dailyDate !== today) {
    data.settings.dailyDate = today;
    data.settings.dailyCount = 0;
  }
  data.settings.dailyCount = (data.settings.dailyCount || 0) + n;
  const d = todayLocalStr();
  data.settings.studyHistory[d] = (data.settings.studyHistory[d] || 0) + n;
  save();
  if (data.settings.dailyCount >= data.settings.dailyGoal) {
    if (data.settings.dailyBonusDate !== today) {
      data.settings.dailyBonusDate = today;
      addXP(XP_REWARDS.dailyGoal);
      toast(pickPenguin('dailyGoal'), 2500);
    }
  }
}

/* ============================================================
   ФИНАЛ
   ============================================================ */
function finishSession() {
  clearInterval(quizTimer);
  clearInterval(speedTimer);
  lastLesson = {
    mode: studyMode, langId: currentLangId,
    folderId: currentFolderId, lessonId: currentLessonId,
    phraseFolderId: currentPhraseFolderId
  };
  if (currentLessonId) {
    const lang = data.langs.find(l => l.id === currentLangId);
    const lesson = lang && lang.lessons.find(l => l.id === currentLessonId);
    if (lesson) {
      const allLearned = lesson.cards.every(c => c.correct > 0 && c.correct >= c.wrong);
      const totalAns = sessionCorrect + sessionWrong;
      if (allLearned || (totalAns > 0 && sessionCorrect / totalAns >= 0.7)) {
        if (!lesson.completed) {
          lesson.completed = true;
          toast('🌟 Урок пройден!', 2000);
        }
      }
    }
  }
  const total = sessionCorrect + sessionWrong;
  const pct = total ? Math.round(sessionCorrect / total * 100) : 0;
  addXP(XP_REWARDS.lessonFinish);
  addCoins(COIN_REWARDS.lessonFinish);
  if (pct === 100 && !sessionHadError) {
    addCoins(COIN_REWARDS.perfectLesson);
    data.settings.perfectLessons = (data.settings.perfectLessons || 0) + 1;
  }
  document.getElementById('finish-correct').textContent = sessionCorrect;
  document.getElementById('finish-wrong').textContent = sessionWrong;
  document.getElementById('finish-pct').textContent = pct + '%';
  const wasDouble = data.settings.doubleXpActive &&
                    data.settings.doubleXpUntil &&
                    Date.now() < data.settings.doubleXpUntil;
  document.getElementById('finish-xp').textContent = wasDouble ? `+${sessionXP} (×2)` : `+${sessionXP}`;
  document.getElementById('finish-coins').textContent = '+' + sessionCoins;
  document.getElementById('finish-emoji').textContent = finishEmoji(pct, !sessionHadError);
  document.getElementById('finish-title').textContent = 'Урок завершён!';
  document.getElementById('finish-phrase').textContent = penguinForFinish(pct, !sessionHadError);
  showScreen('screen-finish');
  playSound('finish');
  const container = document.getElementById('confetti-container');
  if (container) {
    container.innerHTML = '';
    launchConfetti(container, 60);
  }
  markStudyDay();
  incrementDailyCount(sessionCorrect);
  trackQuestProgress('lessons', 1);
  trackQuestProgress('newWords', sessionNewWords);
  trackQuestProgress('minutes', Math.round((Date.now() - sessionStartTime) / 60000));
  if (studyMode === 'quiz') trackQuestProgress('quizzes', 1);
  if (pct >= 80) trackQuestProgress('perfect', 1);
  if (!sessionHadError && sessionCorrect > 0) trackQuestProgress('noError', 1);
  if (studyMode === 'speed' && speedScore >= 20) unlockAchievement('speedster');
  if (studyMode === 'speed' && speedType === 'hard' && speedScore >= 15) unlockAchievement('lightning');
  if (studyMode === 'mix') unlockAchievement('mixer');
  checkAchievements();
  save();
}
function repeatLesson() {
  if (!lastLesson) { goTrail(); return; }
  currentLangId = lastLesson.langId;
  currentFolderId = lastLesson.folderId;
  currentLessonId = lastLesson.lessonId;
  currentPhraseFolderId = lastLesson.phraseFolderId;
  if (lastLesson.mode === 'speed') startSpeed(speedType);
  else startStudy(lastLesson.mode, false);
}
function exitStudy() {
  if (currentLessonId || currentFolderId || currentPhraseFolderId) goCards();
  else goTrail();
}

/* ---------- ПОДЕЛИТЬСЯ ---------- */
async function shareResult() {
  const total = sessionCorrect + sessionWrong;
  const pct = total ? Math.round(sessionCorrect / total * 100) : 0;
  const text = `🐧 Только что прошёл урок в Cards!\n` +
    `✓ ${sessionCorrect} правильных · ✗ ${sessionWrong} ошибок · ${pct}%\n` +
    `💎 +${sessionXP} XP · 💰 +${sessionCoins} монет\n` +
    `🔥 Streak: ${data.settings.streak} дней\n\n` +
    `Учу языки с пингвином! Попробуй и ты:\n` +
    `https://cards-tau-plum.vercel.app/`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Cards', text }); } catch (e) {}
  } else {
    try {
      await navigator.clipboard.writeText(text);
      toast('📋 Скопировано в буфер');
    } catch (e) { toast('Поделиться не получилось'); }
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ============================================================
   КВЕСТЫ (логика трекинга)
   ============================================================ */
function ensureQuestsForToday() {
  const today = todayLocalStr();
  if (data.settings.questsDate !== today || !data.settings.questsToday || !data.settings.questsToday.length) {
    const shuffled = shuffle(ALL_QUESTS);
    data.settings.questsToday = shuffled.slice(0, 3).map(q => q.id);
    data.settings.questsDate = today;
    data.settings.questsProgress = {};
    data.settings.questsCompleted = [];
    data.settings.treasureOpened = false;
    save();
  }
  currentQuests = data.settings.questsToday.map(id => ALL_QUESTS.find(q => q.id === id)).filter(Boolean);
}
function trackQuestProgress(type, amount) {
  if (!amount || amount <= 0) return;
  ensureQuestsForToday();
  let changed = false;
  currentQuests.forEach(q => {
    if (q.type !== type) return;
    if (data.settings.questsCompleted.includes(q.id)) return;
    const cur = data.settings.questsProgress[q.id] || 0;
    const newVal = Math.min(cur + amount, q.target);
    data.settings.questsProgress[q.id] = newVal;
    changed = true;
    if (newVal >= q.target && !data.settings.questsCompleted.includes(q.id)) {
      data.settings.questsCompleted.push(q.id);
      addCoins(COIN_REWARDS.questComplete);
      addXP(15);
      playSound('achievement');
      toast(pickPenguin('questDone'), 2500);
      if (data.settings.questsCompleted.length >= currentQuests.length) {
        setTimeout(() => toast(pickPenguin('allQuestsDone'), 3000), 1200);
      }
    }
  });
  if (changed) { save(); updateQuestBadge(); }
}

/* ============================================================
   СУНДУК
   ============================================================ */
function openTreasure() {
  const chest = document.getElementById('treasure-chest');
  if (chest) chest.classList.add('opened');
  playSound('treasure');
  setTimeout(() => {
    const reward = pickTreasureReward();
    applyReward(reward);
    closeModal('modal-treasure');
    showRewardModal(reward);
    if (chest) chest.classList.remove('opened');
  }, 900);
}
function applyReward(reward) {
  data.settings.treasureDate = todayLocalStr();
  data.settings.treasureOpened = true;
  if (reward.type === 'coins') {
    const amount = reward.amount[0] + Math.floor(Math.random() * (reward.amount[1] - reward.amount[0] + 1));
    addCoins(amount);
    reward._amount = amount;
  } else if (reward.type === 'xp') {
    addXP(reward.amount);
  } else if (reward.type === 'doublexp') {
    data.settings.doubleXpActive = true;
    data.settings.doubleXpUntil = Date.now() + (reward.amount * 60 * 1000);
  } else if (reward.type === 'freeze') {
    data.settings.streakFreezes = (data.settings.streakFreezes || 0) + reward.amount;
  } else if (reward.type === 'avatar') {
    const pool = AVATARS.filter(a => reward.rarity.includes(a.rarity) && !data.settings.ownedAvatars.includes(a.id));
    if (pool.length) {
      const av = pool[Math.floor(Math.random() * pool.length)];
      data.settings.ownedAvatars.push(av.id);
      reward._avatar = av;
    } else {
      addCoins(100);
      reward.text = 'Все аватарки есть! +100 монет';
    }
  }
  save();
  updateHeaderStats();
}
function showRewardModal(reward) {
  const big = document.getElementById('reward-big');
  const title = document.getElementById('reward-title');
  const text = document.getElementById('reward-text');
  if (big) big.textContent = reward.icon;
  if (title) title.textContent = reward.title;
  let msg = reward.text;
  if (reward.type === 'coins' && reward._amount) msg += ` (+${reward._amount})`;
  if (reward._avatar) msg += ` (${reward._avatar.emoji} ${reward._avatar.name})`;
  if (text) text.textContent = msg;
  openModal('modal-reward');
}
function closeRewardModal() {
  closeModal('modal-reward');
  updateTreasureButton();
}

/* ============================================================
   НАСТРОЙКИ
   ============================================================ */
function openSettings() {
  document.getElementById('sound-toggle').checked = data.settings.sound;
  document.getElementById('vibe-toggle').checked = data.settings.vibe;
  document.getElementById('srs-toggle').checked = data.settings.srs;
  document.getElementById('daily-goal-val').textContent = (data.settings.dailyGoal || 20) + ' слов';
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) themeSelect.value = data.settings.theme || 'system';
  showScreen('screen-settings');
}
function toggleSound() { data.settings.sound = document.getElementById('sound-toggle').checked; save(); }
function toggleVibe() { data.settings.vibe = document.getElementById('vibe-toggle').checked; save(); }
function toggleSRS() {
  data.settings.srs = document.getElementById('srs-toggle').checked;
  save();
  toast(data.settings.srs ? '🧠 SRS включён' : '🧠 SRS выключен');
}
function changeTheme() {
  const theme = document.getElementById('theme-select').value;
  data.settings.theme = theme;
  save();
  applyTheme(theme);
  toast('🎨 Тема изменена');
}
function changeDailyGoal() {
  document.getElementById('goal-input').value = data.settings.dailyGoal || 20;
  openModal('modal-goal');
}
function saveDailyGoal() {
  const v = parseInt(document.getElementById('goal-input').value);
  if (!v || v < 5 || v > 200) { toast('Введи 5–200'); return; }
  data.settings.dailyGoal = v;
  save(); closeModal('modal-goal');
  document.getElementById('daily-goal-val').textContent = v + ' слов';
  toast(`🎯 Цель: ${v} слов в день`);
}
function resetTrailProgress() {
  confirmDialog('Сбросить прогресс тропы?',
    'Все уроки тропы станут снова не пройденными. Слова и папки останутся.',
    () => {
      data.langs.forEach(l => (l.lessons || []).forEach(ls => {
        ls.completed = false;
        ls.cards.forEach(c => {
          c.seen = 0; c.correct = 0; c.wrong = 0;
          c.srsNext = null; c.srsLevel = 0;
        });
      }));
      save();
      toast('🌳 Прогресс тропы сброшен');
    });
}

/* ---------- ЭКСПОРТ / ИМПОРТ ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cards-manual-${todayLocalStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (!data.settings.manualExports) data.settings.manualExports = [];
  data.settings.manualExports.push({
    date: todayLocalStr(),
    time: Date.now(),
    size: new Blob([JSON.stringify(data)]).size
  });
  if (data.settings.manualExports.length > 10) data.settings.manualExports.shift();
  save();
  toast('💾 Файл сохранён');
}
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!imported.langs) throw new Error('bad format');
      confirmDialog('Импортировать?', 'Текущие данные будут заменены.', () => {
        data = imported;
        const def = defaultData();
        data.settings = Object.assign({}, def.settings, data.settings || {});
        data.langs.forEach(l => {
          if (!l.lessons) l.lessons = [];
          if (!l.folders) l.folders = [];
          if (!l.phraseFolders) l.phraseFolders = [];
          l.lessons.forEach(ls => ls.cards.forEach(normalizeCard));
          l.folders.forEach(f => f.cards.forEach(normalizeCard));
          l.phraseFolders.forEach(pf => pf.cards.forEach(normalizeCard));
        });
        save();
        renderLangs();
        applyTheme(data.settings.theme);
        toast('📥 Импортировано');
      });
    } catch (err) { toast('Ошибка чтения файла'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}
function resetStats() {
  confirmDialog('Сбросить статистику?',
    'Прогресс по всем словам, XP, монеты, достижения и streak обнулятся.',
    () => {
      data.langs.forEach(l => {
        (l.folders || []).forEach(f => f.cards.forEach(c => {
          c.seen = 0; c.correct = 0; c.wrong = 0; c.lastSeen = null;
          c.srsNext = null; c.srsLevel = 0;
        }));
        (l.lessons || []).forEach(ls => {
          ls.completed = false;
          ls.cards.forEach(c => {
            c.seen = 0; c.correct = 0; c.wrong = 0; c.lastSeen = null;
            c.srsNext = null; c.srsLevel = 0;
          });
        });
        (l.phraseFolders || []).forEach(pf => pf.cards.forEach(c => {
          c.seen = 0; c.correct = 0; c.wrong = 0; c.lastSeen = null;
          c.srsNext = null; c.srsLevel = 0;
        }));
      });
      data.settings.totalXP = 0;
      data.settings.totalCoins = 0;
      data.settings.achievements = [];
      data.settings.streak = 0;
      data.settings.dailyCount = 0;
      data.settings.studyHistory = {};
      data.settings.questsCompleted = [];
      data.settings.questsProgress = {};
      save();
      toast('📊 Статистика сброшена');
    });
}
function resetAll() {
  confirmDialog('Удалить ВСЕ данные?',
    'Языки, слова, XP, монеты, достижения — всё удалится. Это необратимо.',
    () => {
      localStorage.removeItem(STORE_KEY);
      OLD_KEYS.forEach(k => localStorage.removeItem(k));
      data = defaultData();
      save();
      goLangs();
      toast('⚠️ Всё удалено');
    });
}

/* ---------- БЭКАПЫ ---------- */
function makeBackup() {
  try {
    const today = todayLocalStr();
    if (data.settings.lastBackupDate === today) return;
    const json = JSON.stringify(data);
    const size = new Blob([json]).size;
    if (size < 100) return;
    const key = BACKUP_KEY_PREFIX + today;
    localStorage.setItem(key, json);
    data.settings.lastBackupDate = today;
    if (!data.settings.backups) data.settings.backups = {};
    data.settings.backups[today] = { size, time: Date.now() };
    const dates = Object.keys(data.settings.backups).sort();
    while (dates.length > MAX_BACKUPS) {
      const old = dates.shift();
      localStorage.removeItem(BACKUP_KEY_PREFIX + old);
      delete data.settings.backups[old];
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) { console.error('Backup error:', e); }
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */
function init() {
  applyTheme(data.settings.theme);
  renderLangs();
  updateHeaderStats();
  updateQuestBadge();
  initCardSwipe();
  ensureQuestsForToday();
  makeBackup();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  const hidePreloader = () => {
    const pre = document.getElementById('preloader');
    if (pre) {
      pre.classList.add('hide');
      setTimeout(() => pre.remove(), 600);
    }
    showOnboardingIfNeeded();
  };
  if (document.readyState === 'complete') setTimeout(hidePreloader, 1200);
  else window.addEventListener('load', () => setTimeout(hidePreloader, 1200));
}
init();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { save(); makeBackup(); }
});
window.addEventListener('beforeunload', () => { save(); makeBackup(); });

/* ============================================================
   ЗАГЛУШКИ (переопределяются в Части 2 и 3)
   ============================================================ */
function renderMatchBatch() {}
function renderAudioCard() {}
function playAudioWord() {}
function startSpeed(type) {}
function renderSpeedCard() {}
function startMix() {}
function renderMixCard() {}
function renderProfile() {}
function openShop() {}
function openQuests() {}
function openLearning() {}
function openAvatars() {}
function openAnalytics() {}
function openBackups() {}
function openStats() {}
function openAchievements() {}
function openCalendar() {}
function startDictation() {}
function exitDictation() {}
function dictationSpeak() {}
function dictationCheck() {}
function startLetters() {}
function exitLetters() {}
function startUnscramble() {}
function exitUnscramble() {}
function startSentenceGame() {}
function exitSentence() {}
/* ============================================================
   Cards App v8.0 — Часть 2
   Сопоставление, аудио, скоростной, микс, обучение
   ============================================================ */

/* ============================================================
   СОПОСТАВЛЕНИЕ
   ============================================================ */
function renderMatchBatch() {
  matchSelectedLeft = null;
  matchSelectedRight = null;
  const batch = studyDeck.slice(matchOffset, matchOffset + matchBatch);
  if (!batch.length) { finishSession(); return; }
  matchPairs = batch;
  const leftItems = shuffle([...batch]);
  const rightItems = shuffle([...batch]);
  const leftEl = document.getElementById('match-left');
  const rightEl = document.getElementById('match-right');
  leftEl.innerHTML = '';
  rightEl.innerHTML = '';
  leftItems.forEach(c => {
    const tile = document.createElement('div');
    tile.className = 'match-tile';
    tile.textContent = c.front;
    tile.dataset.key = c.front;
    tile.onclick = () => selectMatch('left', tile);
    leftEl.appendChild(tile);
  });
  rightItems.forEach(c => {
    const tile = document.createElement('div');
    tile.className = 'match-tile';
    tile.textContent = c.back;
    tile.dataset.key = c.front;
    tile.onclick = () => selectMatch('right', tile);
    rightEl.appendChild(tile);
  });
  const total = studyDeck.length;
  const done = matchOffset;
  document.getElementById('match-progress').textContent = `${Math.min(done + batch.length, total)} / ${total}`;
  document.getElementById('match-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('match-progress-fill').style.width = `${(done / total) * 100}%`;
}
function selectMatch(side, tile) {
  if (tile.classList.contains('correct')) return;
  if (side === 'left') {
    if (matchSelectedLeft) matchSelectedLeft.classList.remove('selected');
    matchSelectedLeft = tile;
    tile.classList.add('selected');
  } else {
    if (matchSelectedRight) matchSelectedRight.classList.remove('selected');
    matchSelectedRight = tile;
    tile.classList.add('selected');
  }
  if (matchSelectedLeft && matchSelectedRight) {
    const left = matchSelectedLeft, right = matchSelectedRight;
    matchSelectedLeft = null;
    matchSelectedRight = null;
    const correct = left.dataset.key === right.dataset.key;
    const card = matchPairs.find(c => c.front === left.dataset.key);
    if (card) {
      const wasNew = card.seen === 0;
      card.seen++;
      if (correct) {
        card.correct++; sessionCorrect++; sessionStreakCorrect++;
        if (wasNew) sessionNewWords++;
        let gain = XP_REWARDS.correct;
        if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
        addXP(gain);
        addCoins(COIN_REWARDS.correct);
        playSound('good');
        trackQuestProgress('correct', 1);
      } else {
        card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
        sessionHadError = true;
        playSound('bad');
      }
      card.lastSeen = Date.now();
      updateSRS(card, correct);
      save();
    }
    if (correct) {
      left.classList.remove('selected');
      right.classList.remove('selected');
      left.classList.add('correct');
      right.classList.add('correct');
      document.getElementById('match-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
      const allDone = [...document.querySelectorAll('.match-tile')].every(t => t.classList.contains('correct'));
      if (allDone) {
        matchOffset += matchBatch;
        setTimeout(() => renderMatchBatch(), 500);
      }
    } else {
      left.classList.add('wrong');
      right.classList.add('wrong');
      setTimeout(() => {
        left.classList.remove('wrong', 'selected');
        right.classList.remove('wrong', 'selected');
      }, 500);
    }
  }
}

/* ============================================================
   АУДИО
   ============================================================ */
function renderAudioCard() {
  const card = audioDeck[audioIndex];
  if (!card) { finishSession(); return; }
  audioLocked = false;
  const wrongPool = audioDeck.filter(c => c.front !== card.front);
  const wrongs = shuffle(wrongPool).slice(0, 3).map(c => c.back);
  const opts = shuffle([card.back, ...wrongs]);
  const optsEl = document.getElementById('audio-options');
  optsEl.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.onclick = () => audioAnswer(btn, opt, card);
    optsEl.appendChild(btn);
  });
  document.getElementById('audio-progress').textContent = `${audioIndex + 1} / ${audioDeck.length}`;
  document.getElementById('audio-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('audio-progress-fill').style.width = `${(audioIndex / audioDeck.length) * 100}%`;
  setTimeout(() => playAudioWord(), 400);
}
function playAudioWord() {
  const card = audioDeck[audioIndex];
  if (!card) return;
  const lang = data.langs.find(l => l.id === currentLangId);
  const locale = lang ? lang.locale : 'en-US';
  const btn = document.getElementById('audio-play');
  if (btn) {
    btn.classList.add('playing');
    setTimeout(() => btn.classList.remove('playing'), 1500);
  }
  speak(card.front, locale);
}
function audioAnswer(btn, chosen, card) {
  if (audioLocked) return;
  audioLocked = true;
  const wasNew = card.seen === 0;
  card.seen++;
  const isCorrect = chosen === card.back;
  if (isCorrect) {
    card.correct++; sessionCorrect++; sessionStreakCorrect++;
    if (wasNew) sessionNewWords++;
    let gain = XP_REWARDS.correct;
    if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
    addXP(gain);
    addCoins(COIN_REWARDS.correct);
    btn.classList.add('correct');
    playSound('good');
    trackQuestProgress('correct', 1);
  } else {
    card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
    sessionHadError = true;
    btn.classList.add('wrong');
    document.querySelectorAll('#audio-options .quiz-option').forEach(b => {
      if (b.textContent === card.back) b.classList.add('correct');
    });
    playSound('bad');
  }
  card.lastSeen = Date.now();
  updateSRS(card, isCorrect);
  save();
  setTimeout(() => {
    audioIndex++;
    if (audioIndex >= audioDeck.length) { finishSession(); return; }
    renderAudioCard();
  }, 900);
}

/* ============================================================
   СКОРОСТНОЙ ×3
   ============================================================ */
const SPEED_CONFIG = {
  fast:   { words: 10, time: 30, title: '⚡ Быстрый' },
  normal: { words: 15, time: 30, title: '🚀 Скоростной' },
  hard:   { words: 15, time: 20, title: '🔥 Хардкор' }
};
function startSpeed(type) {
  const cfg = SPEED_CONFIG[type] || SPEED_CONFIG.fast;
  const c = getCurrentContainer();
  if (!c) return;
  const pool = c.cards;
  if (pool.length < 4) { toast('Нужно минимум 4 слова'); return; }
  resetSession();
  studyMode = 'speed';
  speedType = type;
  speedTarget = cfg.words;
  speedTimeLeft = cfg.time;
  speedScore = 0;
  speedLocked = false;
  const picked = shuffle([...pool]).slice(0, Math.min(cfg.words, pool.length));
  speedDeck = picked;
  speedTotal = picked.length;
  speedIndex = 0;
  document.getElementById('speed-title').textContent = cfg.title;
  document.getElementById('speed-score').textContent = `Счёт: 0 / ${speedTotal}`;
  showScreen('screen-speed');
  renderSpeedCard();
  playSound('flip');
  startSpeedTimer();
  trackQuestProgress('speed', 1);
}
function startSpeedTimer() {
  clearInterval(speedTimer);
  updateSpeedTimerDisplay();
  speedTimer = setInterval(() => {
    speedTimeLeft--;
    updateSpeedTimerDisplay();
    if (speedTimeLeft <= 0) {
      clearInterval(speedTimer);
      finishSession();
    }
  }, 1000);
}
function updateSpeedTimerDisplay() {
  const el = document.getElementById('speed-timer');
  if (!el) return;
  el.textContent = speedTimeLeft;
  if (speedTimeLeft <= 10) el.classList.add('urgent');
  else el.classList.remove('urgent');
}
function renderSpeedCard() {
  if (speedIndex >= speedDeck.length) {
    speedDeck = shuffle(speedDeck);
    speedIndex = 0;
  }
  const card = speedDeck[speedIndex];
  if (!card) { finishSession(); return; }
  speedLocked = false;
  document.getElementById('speed-question').textContent = card.front;
  const wrongPool = speedDeck.filter(c => c.front !== card.front);
  const wrongs = shuffle(wrongPool).slice(0, 3).map(c => c.back);
  const opts = shuffle([card.back, ...wrongs]);
  const optsEl = document.getElementById('speed-options');
  optsEl.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.onclick = () => speedAnswer(btn, opt, card);
    optsEl.appendChild(btn);
  });
  document.getElementById('speed-score').textContent = `Счёт: ${speedScore} / ${speedTotal}`;
}
function speedAnswer(btn, chosen, card) {
  if (speedLocked) return;
  speedLocked = true;
  const wasNew = card.seen === 0;
  card.seen++;
  const isCorrect = chosen === card.back;
  if (isCorrect) {
    card.correct++;
    sessionCorrect++;
    speedScore++;
    sessionStreakCorrect++;
    if (wasNew) sessionNewWords++;
    addXP(XP_REWARDS.correct + XP_REWARDS.fastBonus);
    addCoins(COIN_REWARDS.correct);
    btn.classList.add('correct');
    playSound('good');
    trackQuestProgress('correct', 1);
  } else {
    card.wrong++;
    sessionWrong++;
    sessionStreakCorrect = 0;
    sessionHadError = true;
    btn.classList.add('wrong');
    document.querySelectorAll('#speed-options .quiz-option').forEach(b => {
      if (b.textContent === card.back) b.classList.add('correct');
    });
    playSound('bad');
  }
  card.lastSeen = Date.now();
  updateSRS(card, isCorrect);
  save();
  setTimeout(() => {
    speedIndex++;
    renderSpeedCard();
  }, 350);
}

/* ============================================================
   МИКС
   ============================================================ */
function startMix() {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) return;
  const all = [];
  (lang.folders || []).forEach(f => f.cards.forEach(c => {
    all.push({ ...c, _folder: f.name, _folderId: f.id, _lessonId: null, _phraseFolderId: null });
  }));
  (lang.lessons || []).forEach(ls => ls.cards.forEach(c => {
    all.push({ ...c, _folder: ls.themeName, _folderId: null, _lessonId: ls.id, _phraseFolderId: null });
  }));
  if (all.length < 3) { toast('Нужно минимум 3 слова во всём языке'); return; }
  resetSession();
  studyMode = 'mix';
  mixLocked = false;
  mixDeck = shuffle(all).slice(0, 20);
  mixIndex = 0;
  mixFlipped = false;
  document.getElementById('mix-title').textContent = `🌪 ${lang.emoji || ''} ${lang.name}`;
  showScreen('screen-mix');
  playSound('flip');
  renderMixCard();
  trackQuestProgress('mix', 1);
}
function renderMixCard() {
  const card = mixDeck[mixIndex];
  if (!card) { finishSession(); return; }
  const cardEl = document.getElementById('mix-card');
  cardEl.style.transform = '';
  cardEl.style.opacity = '1';
  cardEl.classList.toggle('flipped', mixFlipped);
  document.getElementById('mix-word').textContent = mixFlipped ? card.back : card.front;
  document.getElementById('mix-hint').textContent = mixFlipped ? 'Нажмите, чтобы вернуть' : 'Нажмите, чтобы перевернуть';
  document.getElementById('mix-count').textContent = `${mixIndex + 1} / ${mixDeck.length}`;
  document.getElementById('mix-source').textContent = card._folder;
}
let mixCardBound = false;
function bindMixCard() {
  if (mixCardBound) return;
  const mc = document.getElementById('mix-card');
  if (!mc) return;
  mixCardBound = true;
  mc.addEventListener('click', () => {
    mixFlipped = !mixFlipped;
    playSound('flip');
    renderMixCard();
  });
}
setTimeout(bindMixCard, 500);
document.addEventListener('DOMContentLoaded', bindMixCard);

function speakMix(e) {
  if (e) e.stopPropagation();
  const card = mixDeck[mixIndex];
  if (!card) return;
  const lang = data.langs.find(l => l.id === currentLangId);
  speak(card.front, lang ? lang.locale : 'en-US');
}
function mixAnswer(correct) {
  if (mixLocked) return;
  mixLocked = true;
  const card = mixDeck[mixIndex];
  if (!card) { mixLocked = false; return; }
  const realCard = findCardInLang(card.front, card._folderId, card._lessonId);
  if (realCard) {
    const wasNew = realCard.seen === 0;
    realCard.seen++;
    if (correct) {
      realCard.correct++; sessionCorrect++; sessionStreakCorrect++;
      if (wasNew) sessionNewWords++;
      let gain = XP_REWARDS.correct;
      if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
      addXP(gain);
      addCoins(COIN_REWARDS.correct);
      playSound('good');
      trackQuestProgress('correct', 1);
    } else {
      realCard.wrong++; sessionWrong++; sessionStreakCorrect = 0;
      sessionHadError = true;
      playSound('bad');
    }
    realCard.lastSeen = Date.now();
    updateSRS(realCard, correct);
  }
  save();
  const cardEl = document.getElementById('mix-card');
  if (correct) cardEl.classList.add('good-anim');
  else cardEl.classList.add('bad-anim');
  setTimeout(() => {
    mixLocked = false;
    cardEl.classList.remove('good-anim', 'bad-anim');
    mixIndex++;
    mixFlipped = false;
    if (mixIndex >= mixDeck.length) { finishSession(); return; }
    renderMixCard();
  }, 500);
}
function findCardInLang(front, folderId, lessonId) {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) return null;
  if (folderId) {
    const f = (lang.folders || []).find(x => x.id === folderId);
    if (f) return f.cards.find(c => c.front === front);
  }
  if (lessonId) {
    const ls = (lang.lessons || []).find(x => x.id === lessonId);
    if (ls) return ls.cards.find(c => c.front === front);
  }
  return null;
}

/* ============================================================
   РАЗДЕЛ ОБУЧЕНИЕ
   ============================================================ */
function openLearning() {
  const el = document.getElementById('learning-content');
  if (!el) return;
  // Считаем общее количество слов/фраз во всех языках для отображения
  let totalCards = 0;
  data.langs.forEach(l => {
    (l.lessons || []).forEach(ls => totalCards += ls.cards.length);
    (l.folders || []).forEach(f => totalCards += f.cards.length);
    (l.phraseFolders || []).forEach(pf => totalCards += pf.cards.length);
  });

  if (!data.langs.length || totalCards < 3) {
    el.innerHTML = `<div class="empty">🐧 Сначала добавь язык или свои слова.<br>В «Обучении» нужны минимум 3 слова.</div>`;
  } else {
    el.innerHTML = `
      <div class="section-title">Режимы обучения</div>
      <div class="learning-grid">
        <div class="learning-item" onclick="startDictation()">
          <div class="li-icon">✍️</div>
          <div class="li-name">Диктант</div>
          <div class="li-desc">Пиши слово по переводу и подсказке</div>
        </div>
        <div class="learning-item" onclick="startLetters()">
          <div class="li-icon">🔤</div>
          <div class="li-name">Пропущенные буквы</div>
          <div class="li-desc">Угадай, каких букв не хватает</div>
        </div>
        <div class="learning-item" onclick="startUnscramble()">
          <div class="li-icon">🎯</div>
          <div class="li-name">Собери слово</div>
          <div class="li-desc">Буквы перемешаны — собери в порядке</div>
        </div>
        <div class="learning-item" onclick="startSentenceGame('phrases')">
          <div class="li-icon">🧩</div>
          <div class="li-name">Собери фразу</div>
          <div class="li-desc">Слова фразы перемешаны</div>
        </div>
      </div>
      <div class="help-text" style="padding:16px;text-align:center;">
        🐧 Пингвин тренирует и письмо, и память!<br>
        Каждый режим даёт XP и монеты.
      </div>
    `;
  }
  showScreen('screen-learning');
}

/* ============================================================
   ДИКТАНТ
   ============================================================ */
function gatherAllCards() {
  const all = [];
  data.langs.forEach(l => {
    (l.lessons || []).forEach(ls => ls.cards.forEach(c => all.push({ ...c, _langId: l.id, _locale: l.locale })));
    (l.folders || []).forEach(f => f.cards.forEach(c => all.push({ ...c, _langId: l.id, _locale: l.locale })));
  });
  return all;
}
function startDictation() {
  const c = getCurrentContainer();
  let deck;
  if (c && c.cards.length >= 3) {
    const lang = data.langs.find(l => l.id === currentLangId);
    deck = c.cards.map(x => ({ ...x, _langId: currentLangId, _locale: lang ? lang.locale : 'en-US' }));
  } else {
    deck = gatherAllCards();
  }
  if (deck.length < 3) { toast('Нужно минимум 3 слова'); return; }
  resetSession();
  learningMode = 'dictation';
  dictationDeck = shuffle(deck).slice(0, 15);
  dictationIndex = 0;
  dictationLocked = false;
  showScreen('screen-dictation');
  renderDictation();
  trackQuestProgress('dictation', 1);
}
function renderDictation() {
  const card = dictationDeck[dictationIndex];
  if (!card) { finishLearningSession('dictation'); return; }
  dictationLocked = false;
  document.getElementById('dictation-translation').textContent = card.back;
  const inp = document.getElementById('dictation-input');
  inp.value = '';
  inp.className = 'dictation-input';
  inp.disabled = false;
  inp.focus();
  // Подсказка: первая буква + ____
  const hint = card.front.charAt(0) + ' _'.repeat(Math.max(0, card.front.length - 1));
  document.getElementById('dictation-hint').textContent = hint;
  document.getElementById('dictation-progress').textContent = `${dictationIndex + 1} / ${dictationDeck.length}`;
  document.getElementById('dictation-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('dictation-progress-fill').style.width = `${(dictationIndex / dictationDeck.length) * 100}%`;
  document.querySelector('.btn-check').disabled = false;
}
function dictationSpeak() {
  const card = dictationDeck[dictationIndex];
  if (!card) return;
  speak(card.front, card._locale || 'en-US');
}
function dictationCheck() {
  if (dictationLocked) return;
  const card = dictationDeck[dictationIndex];
  if (!card) return;
  const inp = document.getElementById('dictation-input');
  const userAns = inp.value.trim().toLowerCase();
  if (!userAns) return;
  dictationLocked = true;
  const realCard = findCardInLang(card.front, null, null) ||
                   findCardInLang(card.front, null, null) || card;
  const target = card.front.trim().toLowerCase();
  const isCorrect = userAns === target;
  // Найдём настоящую карточку в языке по front
  const found = findRealCard(card.front);
  if (found) {
    const wasNew = found.seen === 0;
    found.seen++;
    if (isCorrect) {
      found.correct++; sessionCorrect++; sessionStreakCorrect++;
      if (wasNew) sessionNewWords++;
      let gain = XP_REWARDS.correct + 5;
      if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
      addXP(gain);
      addCoins(COIN_REWARDS.correct);
      playSound('good');
      inp.classList.add('correct');
      trackQuestProgress('correct', 1);
    } else {
      found.wrong++; sessionWrong++; sessionStreakCorrect = 0;
      sessionHadError = true;
      playSound('bad');
      inp.classList.add('wrong');
    }
    found.lastSeen = Date.now();
    updateSRS(found, isCorrect);
  } else {
    // Фолбэк — карточка только в памяти
    if (isCorrect) {
      sessionCorrect++; sessionStreakCorrect++;
      addXP(XP_REWARDS.correct + 5);
      addCoins(COIN_REWARDS.correct);
      playSound('good');
      inp.classList.add('correct');
    } else {
      sessionWrong++; sessionHadError = true;
      playSound('bad');
      inp.classList.add('wrong');
    }
  }
  document.getElementById('dictation-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.querySelector('.btn-check').disabled = true;
  inp.disabled = true;
  if (!isCorrect) {
    document.getElementById('dictation-hint').textContent = card.front;
  }
  save();
  setTimeout(() => {
    dictationIndex++;
    if (dictationIndex >= dictationDeck.length) { finishLearningSession('dictation'); return; }
    renderDictation();
  }, 1500);
}
function findRealCard(front) {
  const lang = data.langs.find(l => l.id === currentLangId) || data.langs[0];
  if (!lang) return null;
  for (const ls of (lang.lessons || [])) {
    const found = ls.cards.find(c => c.front === front);
    if (found) return found;
  }
  for (const f of (lang.folders || [])) {
    const found = f.cards.find(c => c.front === front);
    if (found) return found;
  }
  for (const pf of (lang.phraseFolders || [])) {
    const found = pf.cards.find(c => c.front === front);
    if (found) return found;
  }
  return null;
}
function exitDictation() { goTrail(); }

/* ============================================================
   ПРОПУЩЕННЫЕ БУКВЫ
   ============================================================ */
function startLetters() {
  const c = getCurrentContainer();
  let deck;
  if (c && c.cards.length >= 3) {
    const lang = data.langs.find(l => l.id === currentLangId);
    deck = c.cards.map(x => ({ ...x, _langId: currentLangId, _locale: lang ? lang.locale : 'en-US' }));
  } else {
    deck = gatherAllCards();
  }
  if (deck.length < 3) { toast('Нужно минимум 3 слова'); return; }
  resetSession();
  learningMode = 'letters';
  lettersDeck = shuffle(deck).slice(0, 15);
  lettersIndex = 0;
  lettersLocked = false;
  showScreen('screen-letters');
  renderLetters();
  trackQuestProgress('letters', 1);
}
function renderLetters() {
  const card = lettersDeck[lettersIndex];
  if (!card) { finishLearningSession('letters'); return; }
  lettersLocked = false;
  document.getElementById('letters-translation').textContent = card.back;
  const word = card.front.toLowerCase().replace(/[^a-zа-яёäöüßàâçéèêëîïôûùñ]/gi, '');
  // Выбираем 1-2 буквы для пропуска
  if (word.length < 2) { lettersIndex++; renderLetters(); return; }
  const missingCount = Math.min(2, Math.max(1, Math.floor(word.length / 4)));
  const positions = [];
  while (positions.length < missingCount) {
    const p = Math.floor(Math.random() * word.length);
    if (!positions.includes(p)) positions.push(p);
  }
  lettersCurrentWord = card.front;
  lettersInput = '';
  lettersPosition = 0;
  // Отображаем слово с пропусками
  const display = card.front.split('').map((ch, i) => {
    const clean = ch.toLowerCase().replace(/[^a-zа-яёäöüßàâçéèêëîïôûùñ]/gi, '');
    if (clean && positions.includes(card.front.toLowerCase().indexOf(clean))) {
      // упрощённая логика — просто помечаем
    }
    return ch;
  });
  // Проще: строим с пропусками по буквам без знаков препинания
  const letters = card.front.split('');
  const cleanIndices = [];
  letters.forEach((ch, i) => {
    if (/[a-zа-яёäöüßàâçéèêëîïôûùñ]/i.test(ch)) cleanIndices.push(i);
  });
  const missingIndices = [];
  while (missingIndices.length < missingCount && missingIndices.length < cleanIndices.length) {
    const idx = cleanIndices[Math.floor(Math.random() * cleanIndices.length)];
    if (!missingIndices.includes(idx)) missingIndices.push(idx);
  }
  lettersCurrentWord = card.front;
  lettersMissing = missingIndices;
  lettersInput = [];
  renderLettersWord(letters, missingIndices);
  renderLettersKeyboard();
  document.getElementById('letters-progress').textContent = `${lettersIndex + 1} / ${lettersDeck.length}`;
  document.getElementById('letters-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('letters-progress-fill').style.width = `${(lettersIndex / lettersDeck.length) * 100}%`;
}
let lettersMissing = [];
function renderLettersWord(letters, missing) {
  const el = document.getElementById('letters-word');
  el.innerHTML = '';
  letters.forEach((ch, i) => {
    if (missing.includes(i)) {
      const span = document.createElement('span');
      span.className = 'missing';
      span.textContent = lettersInput[missing.indexOf(i)] || '_';
      el.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.textContent = ch;
      el.appendChild(span);
    }
  });
}
function renderLettersKeyboard() {
  const el = document.getElementById('letters-keyboard');
  el.innerHTML = '';
  const card = lettersDeck[lettersIndex];
  if (!card) return;
  // Собираем буквы из слова + случайные
  const word = card.front.toLowerCase();
  const letterSet = new Set(word.replace(/[^a-zа-яёäöüßàâçéèêëîïôûùñ]/gi, '').split(''));
  // Добавим пару случайных букв
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const extra = [];
  while (extra.length < 3) {
    const l = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!letterSet.has(l)) { letterSet.add(l); extra.push(l); }
  }
  const letters = [...letterSet];
  letters.forEach(l => {
    const btn = document.createElement('button');
    btn.className = 'letter-btn';
    btn.textContent = l;
    btn.onclick = () => lettersClick(btn, l);
    el.appendChild(btn);
  });
}
function lettersClick(btn, letter) {
  if (lettersLocked) return;
  const card = lettersDeck[lettersIndex];
  if (!card) return;
  const letters = card.front.split('');
  const correctLetter = letters[lettersMissing[lettersInput.length]];
  if (!correctLetter) return;
  if (letter.toLowerCase() === correctLetter.toLowerCase()) {
    btn.classList.add('used');
    lettersInput.push(correctLetter);
    renderLettersWord(letters, lettersMissing);
    playSound('flip');
    if (lettersInput.length === lettersMissing.length) {
      // Всё собрано!
      lettersLocked = true;
      const found = findRealCard(card.front);
      if (found) {
        const wasNew = found.seen === 0;
        found.seen++;
        found.correct++; sessionCorrect++; sessionStreakCorrect++;
        if (wasNew) sessionNewWords++;
        let gain = XP_REWARDS.correct + 5;
        if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
        addXP(gain);
        addCoins(COIN_REWARDS.correct);
        found.lastSeen = Date.now();
        updateSRS(found, true);
      } else {
        sessionCorrect++; sessionStreakCorrect++;
        addXP(XP_REWARDS.correct + 5);
        addCoins(COIN_REWARDS.correct);
      }
      playSound('good');
      trackQuestProgress('correct', 1);
      document.getElementById('letters-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
      save();
      setTimeout(() => {
        lettersIndex++;
        if (lettersIndex >= lettersDeck.length) { finishLearningSession('letters'); return; }
        renderLetters();
      }, 900);
    }
  } else {
    btn.classList.add('wrong');
    playSound('bad');
    sessionWrong++;
    sessionHadError = true;
    document.getElementById('letters-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
    setTimeout(() => btn.classList.remove('wrong'), 500);
  }
}
function exitLetters() { goTrail(); }

/* ============================================================
   СОБЕРИ СЛОВО (unscramble)
   ============================================================ */
function startUnscramble() {
  const c = getCurrentContainer();
  let deck;
  if (c && c.cards.length >= 3) {
    const lang = data.langs.find(l => l.id === currentLangId);
    deck = c.cards.map(x => ({ ...x, _langId: currentLangId, _locale: lang ? lang.locale : 'en-US' }));
  } else {
    deck = gatherAllCards();
  }
  if (deck.length < 3) { toast('Нужно минимум 3 слова'); return; }
  resetSession();
  learningMode = 'unscramble';
  unscrambleDeck = shuffle(deck).slice(0, 12);
  unscrambleIndex = 0;
  unscrambleLocked = false;
  showScreen('screen-unscramble');
  renderUnscramble();
}
function renderUnscramble() {
  const card = unscrambleDeck[unscrambleIndex];
  if (!card) { finishLearningSession('unscramble'); return; }
  unscrambleLocked = false;
  document.getElementById('unscramble-translation').textContent = card.back;
  unscrambleAnswer = [];
  const letters = card.front.split('');
  unscramblePool = letters.map((ch, i) => ({ ch, id: i })).sort(() => Math.random() - 0.5);
  renderUnscrambleAnswer();
  renderUnscramblePool();
  document.getElementById('unscramble-progress').textContent = `${unscrambleIndex + 1} / ${unscrambleDeck.length}`;
  document.getElementById('unscramble-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('unscramble-progress-fill').style.width = `${(unscrambleIndex / unscrambleDeck.length) * 100}%`;
}
function renderUnscrambleAnswer() {
  const el = document.getElementById('unscramble-answer');
  el.innerHTML = '';
  unscrambleAnswer.forEach((item, i) => {
    const tile = document.createElement('button');
    tile.className = 'word-tile placed';
    tile.textContent = item.ch;
    tile.onclick = () => {
      if (unscrambleLocked) return;
      unscramblePool.push(unscrambleAnswer.splice(i, 1)[0]);
      renderUnscrambleAnswer();
      renderUnscramblePool();
    };
    el.appendChild(tile);
  });
}
function renderUnscramblePool() {
  const el = document.getElementById('unscramble-pool');
  el.innerHTML = '';
  unscramblePool.forEach((item, i) => {
    const tile = document.createElement('button');
    tile.className = 'word-tile';
    tile.textContent = item.ch;
    tile.onclick = () => {
      if (unscrambleLocked) return;
      unscrambleAnswer.push(unscramblePool.splice(i, 1)[0]);
      renderUnscrambleAnswer();
      renderUnscramblePool();
      if (unscramblePool.length === 0) checkUnscramble();
    };
    el.appendChild(tile);
  });
}
function checkUnscramble() {
  const card = unscrambleDeck[unscrambleIndex];
  if (!card) return;
  unscrambleLocked = true;
  const userWord = unscrambleAnswer.map(x => x.ch).join('');
  const isCorrect = userWord.toLowerCase() === card.front.toLowerCase();
  const ansEl = document.getElementById('unscramble-answer');
  const found = findRealCard(card.front);
  if (found) {
    const wasNew = found.seen === 0;
    found.seen++;
    if (isCorrect) {
      found.correct++; sessionCorrect++; sessionStreakCorrect++;
      if (wasNew) sessionNewWords++;
      let gain = XP_REWARDS.correct + 5;
      if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
      addXP(gain);
      addCoins(COIN_REWARDS.correct);
      playSound('good');
      ansEl.classList.add('correct');
      trackQuestProgress('correct', 1);
    } else {
      found.wrong++; sessionWrong++; sessionStreakCorrect = 0;
      sessionHadError = true;
      playSound('bad');
      ansEl.classList.add('wrong');
    }
    found.lastSeen = Date.now();
    updateSRS(found, isCorrect);
  } else {
    if (isCorrect) {
      sessionCorrect++; sessionStreakCorrect++;
      addXP(XP_REWARDS.correct + 5);
      addCoins(COIN_REWARDS.correct);
      playSound('good');
      ansEl.classList.add('correct');
    } else {
      sessionWrong++; sessionHadError = true;
      playSound('bad');
      ansEl.classList.add('wrong');
    }
  }
  document.getElementById('unscramble-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  save();
  setTimeout(() => {
    ansEl.classList.remove('correct', 'wrong');
    unscrambleIndex++;
    if (unscrambleIndex >= unscrambleDeck.length) { finishLearningSession('unscramble'); return; }
    renderUnscramble();
  }, 1300);
}
function exitUnscramble() { goTrail(); }

/* ============================================================
   СОБЕРИ ФРАЗУ (sentence)
   ============================================================ */
function startSentenceGame(source) {
  const lang = data.langs.find(l => l.id === currentLangId);
  let deck = [];
  if (lang) {
    // Собираем только фразы
    (lang.phraseFolders || []).forEach(pf => pf.cards.forEach(c => {
      if (c.isPhrase) deck.push({ ...c, _langId: lang.id, _locale: lang.locale });
    }));
  }
  if (deck.length < 3) {
    toast('Нужно минимум 3 фразы. Добавь их в разделе «Фразы».');
    return;
  }
  resetSession();
  learningMode = 'sentence';
  sentenceDeck = shuffle(deck).slice(0, 12);
  sentenceIndex = 0;
  sentenceLocked = false;
  showScreen('screen-sentence');
  renderSentence();
  trackQuestProgress('sentence', 1);
}
function renderSentence() {
  const card = sentenceDeck[sentenceIndex];
  if (!card) { finishLearningSession('sentence'); return; }
  sentenceLocked = false;
  document.getElementById('sentence-translation').textContent = card.back;
  sentenceAnswer = [];
  const words = splitPhraseWords(card.front);
  sentencePool = words.map((w, i) => ({ word: w, id: i })).sort(() => Math.random() - 0.5);
  renderSentenceAnswer();
  renderSentencePool();
  document.getElementById('sentence-progress').textContent = `${sentenceIndex + 1} / ${sentenceDeck.length}`;
  document.getElementById('sentence-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('sentence-progress-fill').style.width = `${(sentenceIndex / sentenceDeck.length) * 100}%`;
}
function renderSentenceAnswer() {
  const el = document.getElementById('sentence-answer');
  el.innerHTML = '';
  sentenceAnswer.forEach((item, i) => {
    const tile = document.createElement('button');
    tile.className = 'word-tile placed';
    tile.textContent = item.word;
    tile.onclick = () => {
      if (sentenceLocked) return;
      sentencePool.push(sentenceAnswer.splice(i, 1)[0]);
      renderSentenceAnswer();
      renderSentencePool();
    };
    el.appendChild(tile);
  });
}
function renderSentencePool() {
  const el = document.getElementById('sentence-pool');
  el.innerHTML = '';
  sentencePool.forEach((item, i) => {
    const tile = document.createElement('button');
    tile.className = 'word-tile';
    tile.textContent = item.word;
    tile.onclick = () => {
      if (sentenceLocked) return;
      sentenceAnswer.push(sentencePool.splice(i, 1)[0]);
      renderSentenceAnswer();
      renderSentencePool();
      if (sentencePool.length === 0) checkSentence();
    };
    el.appendChild(tile);
  });
}
function checkSentence() {
  const card = sentenceDeck[sentenceIndex];
  if (!card) return;
  sentenceLocked = true;
  const userPhrase = sentenceAnswer.map(x => x.word).join(' ').trim();
  // Сравниваем, нормализуя пунктуацию
  const normalize = s => s.replace(/\s+/g, ' ').replace(/[¿?¡!.,;:]/g, '').trim().toLowerCase();
  const isCorrect = normalize(userPhrase) === normalize(card.front);
  const ansEl = document.getElementById('sentence-answer');
  const found = findRealCard(card.front);
  if (found) {
    const wasNew = found.seen === 0;
    found.seen++;
    if (isCorrect) {
      found.correct++; sessionCorrect++; sessionStreakCorrect++;
      if (wasNew) sessionNewWords++;
      let gain = XP_REWARDS.correct + 10;
      if (sessionStreakCorrect >= 5) gain += XP_REWARDS.streak5Bonus;
      addXP(gain);
      addCoins(COIN_REWARDS.correct + 1);
      playSound('good');
      ansEl.classList.add('correct');
      data.settings.phrasesBuilt = (data.settings.phrasesBuilt || 0) + 1;
      if (data.settings.phrasesBuilt >= 5) unlockAchievement('sentence');
      trackQuestProgress('correct', 1);
    } else {
      found.wrong++; sessionWrong++; sessionStreakCorrect = 0;
      sessionHadError = true;
      playSound('bad');
      ansEl.classList.add('wrong');
    }
    found.lastSeen = Date.now();
    updateSRS(found, isCorrect);
  } else {
    if (isCorrect) {
      sessionCorrect++; sessionStreakCorrect++;
      addXP(XP_REWARDS.correct + 10);
      addCoins(COIN_REWARDS.correct + 1);
      playSound('good');
      ansEl.classList.add('correct');
    } else {
      sessionWrong++; sessionHadError = true;
      playSound('bad');
      ansEl.classList.add('wrong');
    }
  }
  document.getElementById('sentence-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  save();
  setTimeout(() => {
    ansEl.classList.remove('correct', 'wrong');
    sentenceIndex++;
    if (sentenceIndex >= sentenceDeck.length) { finishLearningSession('sentence'); return; }
    renderSentence();
  }, 1500);
}
function exitSentence() { goTrail(); }

/* ============================================================
   ФИНАЛ ОБУЧЕНИЯ
   ============================================================ */
function finishLearningSession(mode) {
  lastLesson = {
    mode: mode,
    langId: currentLangId,
    folderId: currentFolderId,
    lessonId: currentLessonId,
    phraseFolderId: currentPhraseFolderId
  };
  const total = sessionCorrect + sessionWrong;
  const pct = total ? Math.round(sessionCorrect / total * 100) : 0;
  addXP(XP_REWARDS.lessonFinish);
  addCoins(COIN_REWARDS.lessonFinish);
  if (pct === 100 && !sessionHadError) {
    addCoins(COIN_REWARDS.perfectLesson);
    if (mode === 'dictation') unlockAchievement('dictation');
    if (mode === 'letters') unlockAchievement('letters');
  }
  document.getElementById('finish-correct').textContent = sessionCorrect;
  document.getElementById('finish-wrong').textContent = sessionWrong;
  document.getElementById('finish-pct').textContent = pct + '%';
  const wasDouble = data.settings.doubleXpActive && data.settings.doubleXpUntil && Date.now() < data.settings.doubleXpUntil;
  document.getElementById('finish-xp').textContent = wasDouble ? `+${sessionXP} (×2)` : `+${sessionXP}`;
  document.getElementById('finish-coins').textContent = '+' + sessionCoins;
  document.getElementById('finish-emoji').textContent = finishEmoji(pct, !sessionHadError);
  document.getElementById('finish-title').textContent = 'Обучение завершено!';
  document.getElementById('finish-phrase').textContent = penguinForLearningFinish(mode, pct, !sessionHadError);
  showScreen('screen-finish');
  playSound('finish');
  const container = document.getElementById('confetti-container');
  if (container) {
    container.innerHTML = '';
    launchConfetti(container, 60);
  }
  markStudyDay();
  incrementDailyCount(sessionCorrect);
  trackQuestProgress('minutes', Math.round((Date.now() - sessionStartTime) / 60000));
  checkAchievements();
  save();
}
/* ============================================================
   Cards App v8.0 — Часть 3 (финальная)
   Профиль, магазин, аватарки, квесты, статистика, аналитика,
   календарь, достижения, бэкапы
   ============================================================ */

/* ============================================================
   ПРОФИЛЬ
   ============================================================ */
function renderProfile() {
  const xp = data.settings.totalXP || 0;
  const lvl = getLevelData(xp);
  const s = countStats();
  const unlocked = (data.settings.achievements || []).length;
  const totalAch = ACHIEVEMENTS.length;
  const today = new Date().toDateString();
  const dailyCount = data.settings.dailyDate === today ? (data.settings.dailyCount || 0) : 0;
  const dailyGoal = data.settings.dailyGoal || 20;
  const dailyPct = Math.min(dailyCount / dailyGoal, 1);
  const circumference = 2 * Math.PI * 38;
  const offset = circumference * (1 - dailyPct);
  const nickname = data.settings.nickname || 'Пользователь';

  let avatarHtml = '🐧';
  if (data.settings.currentAvatar === 'custom' && data.settings.customPhoto) {
    avatarHtml = `<img src="${data.settings.customPhoto}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.2);">`;
  } else {
    const av = getAvatarById(data.settings.currentAvatar);
    avatarHtml = av.emoji;
  }

  const doubleXpActive = data.settings.doubleXpActive &&
                         data.settings.doubleXpUntil &&
                         Date.now() < data.settings.doubleXpUntil;
  let doubleXpHtml = '';
  if (doubleXpActive) {
    const mins = Math.ceil((data.settings.doubleXpUntil - Date.now()) / 60000);
    doubleXpHtml = `<div class="list-item" style="background:linear-gradient(135deg,var(--gold),var(--warn));color:#fff;">
      <div class="info">
        <div class="title" style="color:#fff;">⚡ Двойной XP активен</div>
        <div class="sub" style="color:rgba(255,255,255,0.9)">Осталось ${mins} минут · все очки ×2</div>
      </div>
    </div>`;
  }

  const el = document.getElementById('profile-content');
  el.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar" onclick="openAvatars()" title="Сменить аватарку">${avatarHtml}</div>
      <div class="profile-nickname" onclick="changeNickname()">${esc(nickname)} ✏️</div>
      <div class="profile-level">${lvl.current.name}</div>
      <div class="xp-bar"><div style="width:${Math.round(lvl.progress * 100)}%"></div></div>
      <div class="xp-text">${lvl.next.min === Infinity ? '🏆 Максимум!' : `${formatNumber(xp)} / ${formatNumber(lvl.next.min)} XP до след. уровня`}</div>
    </div>
    ${doubleXpHtml}
    <div class="daily-ring">
      <svg viewBox="0 0 90 90">
        <circle class="ring-bg" cx="45" cy="45" r="38"></circle>
        <circle class="ring-fill" cx="45" cy="45" r="38"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"></circle>
      </svg>
      <div class="daily-info">
        <div class="big">${dailyCount} / ${dailyGoal}</div>
        <div class="small">🎯 Ежедневная цель</div>
        <div class="small">🔥 Streak: ${data.settings.streak || 0} дн.${data.settings.streakFreezes > 0 ? ` · 🧊 ${data.settings.streakFreezes}` : ''}</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="num">${formatNumber(s.total)}</div><div class="lbl">Всего слов</div></div>
      <div class="stat-card"><div class="num">${formatNumber(s.learned)}</div><div class="lbl">Выучено</div></div>
      <div class="stat-card"><div class="num">${s.lessonsDone}</div><div class="lbl">Уроков тропы</div></div>
      <div class="stat-card"><div class="num">${unlocked}/${totalAch}</div><div class="lbl">Достижений</div></div>
    </div>
    <div class="section-title">Разделы</div>
    <div class="list-item" onclick="openQuests()">
      <div class="info"><div class="title">🎯 Ежедневные квесты</div>
      <div class="sub">${(data.settings.questsCompleted || []).length} из ${currentQuests.length} выполнено</div></div>
      <div class="val">›</div>
    </div>
    <div class="list-item" onclick="openAchievements()">
      <div class="info"><div class="title">🏆 Достижения</div>
      <div class="sub">${unlocked} из ${totalAch} разблокировано</div></div>
      <div class="val">›</div>
    </div>
    <div class="list-item" onclick="openStats()">
      <div class="info"><div class="title">📊 Статистика</div>
      <div class="sub">Подробные цифры</div></div>
      <div class="val">›</div>
    </div>
    <div class="list-item" onclick="openAnalytics()">
      <div class="info"><div class="title">📈 Аналитика</div>
      <div class="sub">Графики прогресса и сложные слова</div></div>
      <div class="val">›</div>
    </div>
    <div class="list-item" onclick="openCalendar()">
      <div class="info"><div class="title">📅 Календарь занятий</div>
      <div class="sub">История за 90 дней</div></div>
      <div class="val">›</div>
    </div>
    <div class="list-item" onclick="openShop()">
      <div class="info"><div class="title">🏪 Магазин</div>
      <div class="sub">Заморозки, бусты, микс дня</div></div>
      <div class="val">›</div>
    </div>
    <div class="list-item" onclick="openAvatars()">
      <div class="info"><div class="title">🎨 Аватарки</div>
      <div class="sub">${(data.settings.ownedAvatars || []).length} из ${AVATARS.length} открыто</div></div>
      <div class="val">›</div>
    </div>
    <div class="list-item" onclick="openSettings()">
      <div class="info"><div class="title">⚙️ Настройки</div>
      <div class="sub">Звук, SRS, тема, бэкапы</div></div>
      <div class="val">›</div>
    </div>
  `;
  updateHeaderStats();
}

function changeNickname() {
  const cur = data.settings.nickname || 'Пользователь';
  const name = prompt('Твоё имя:', cur);
  if (name && name.trim()) {
    data.settings.nickname = name.trim().slice(0, 20);
    save();
    renderProfile();
    toast('👤 Имя изменено');
  }
}

/* ============================================================
   МАГАЗИН
   ============================================================ */
function openShop() {
  const el = document.getElementById('shop-content');
  if (!el) return;
  const coins = data.settings.totalCoins || 0;
  const doubleActive = data.settings.doubleXpActive &&
                       data.settings.doubleXpUntil &&
                       Date.now() < data.settings.doubleXpUntil;
  const mixBought = data.settings.mixDayBoughtDate === todayLocalStr();
  el.innerHTML = `
    <div class="section-title">Бусты и бонусы</div>
    <div class="shop-grid">
      <div class="shop-item ${coins < SHOP_PRICES.freeze ? 'bought' : ''}" onclick="buyItem('freeze')">
        <div class="shop-icon">🧊</div>
        <div class="shop-name">Заморозка streak</div>
        <div class="shop-desc">Пропустишь день — серия не сгорит</div>
        <div class="shop-price">💰 ${SHOP_PRICES.freeze}</div>
      </div>
      <div class="shop-item ${doubleActive ? 'bought' : ''}" onclick="buyItem('doublexp')">
        <div class="shop-icon">⚡</div>
        <div class="shop-name">Двойной XP</div>
        <div class="shop-desc">15 минут удвоенного опыта</div>
        <div class="shop-price">💰 ${SHOP_PRICES.doublexp}</div>
      </div>
      <div class="shop-item ${mixBought ? 'bought' : ''}" onclick="buyItem('mixday')">
        <div class="shop-icon">🌪</div>
        <div class="shop-name">Микс дня</div>
        <div class="shop-desc">10 случайных слов из всех языков</div>
        <div class="shop-price">💰 ${SHOP_PRICES.mixday}</div>
      </div>
      <div class="shop-item" onclick="buyItem('customPhoto')">
        <div class="shop-icon">📷</div>
        <div class="shop-name">Своё фото</div>
        <div class="shop-desc">Загрузи своё фото как аватарку</div>
        <div class="shop-price">💰 ${SHOP_PRICES.customPhoto}</div>
      </div>
    </div>
    <div class="section-title">Другое</div>
    <div class="shop-grid">
      <div class="shop-item" onclick="openAvatars()">
        <div class="shop-icon">🎨</div>
        <div class="shop-name">Аватарки</div>
        <div class="shop-desc">Открывай редкие аватарки</div>
        <div class="shop-price">Смотреть ›</div>
      </div>
      <div class="shop-item" onclick="goLangs()">
        <div class="shop-icon">🎯</div>
        <div class="shop-name">Пропуск урока</div>
        <div class="shop-desc">Купить в тропе — тыкни по 🔒 уроку</div>
        <div class="shop-price">💰 ${SHOP_PRICES.skipLesson}</div>
      </div>
    </div>
    <div class="help-text" style="text-align:center;padding:20px;">
      💰 У тебя: <b>${coins}</b> монет<br>
      Зарабатывай за уроки, квесты и достижения!
    </div>
  `;
  updateHeaderStats();
  showScreen('screen-shop');
}
function buyItem(type) {
  if (type === 'freeze') {
    if (!spendCoins(SHOP_PRICES.freeze)) return;
    data.settings.streakFreezes = (data.settings.streakFreezes || 0) + 1;
    save();
    playSound('purchase');
    toast('🧊 Заморозка куплена!');
  } else if (type === 'doublexp') {
    const active = data.settings.doubleXpActive &&
                   data.settings.doubleXpUntil &&
                   Date.now() < data.settings.doubleXpUntil;
    if (active) { toast('⚡ Уже активен'); return; }
    if (!spendCoins(SHOP_PRICES.doublexp)) return;
    data.settings.doubleXpActive = true;
    data.settings.doubleXpUntil = Date.now() + 15 * 60 * 1000;
    save();
    playSound('purchase');
    toast('⚡ Двойной XP на 15 минут!');
  } else if (type === 'mixday') {
    if (data.settings.mixDayBoughtDate === todayLocalStr()) { toast('Уже куплено сегодня'); return; }
    if (!spendCoins(SHOP_PRICES.mixday)) return;
    data.settings.mixDayBoughtDate = todayLocalStr();
    save();
    playSound('purchase');
    setTimeout(() => openMixDay(), 300);
    return;
  } else if (type === 'customPhoto') {
    if (data.settings.customPhotoPaid) { openCustomPhoto(); return; }
    if (!spendCoins(SHOP_PRICES.customPhoto)) return;
    data.settings.customPhotoPaid = true;
    save();
    playSound('purchase');
    setTimeout(() => openCustomPhoto(), 300);
    return;
  }
  openShop();
}
function openMixDay() {
  const all = [];
  data.langs.forEach(l => {
    (l.folders || []).forEach(f => f.cards.forEach(c => all.push({
      ...c, _folder: f.name, _folderId: f.id, _langId: l.id, _lessonId: null
    })));
    (l.lessons || []).forEach(ls => ls.cards.forEach(c => all.push({
      ...c, _folder: ls.themeName, _folderId: null, _langId: l.id, _lessonId: ls.id
    })));
  });
  if (all.length < 3) { toast('Нужно минимум 3 слова'); return; }
  resetSession();
  studyMode = 'mix';
  mixLocked = false;
  if (!currentLangId && data.langs.length) currentLangId = data.langs[0].id;
  mixDeck = shuffle(all).slice(0, 10);
  mixIndex = 0;
  mixFlipped = false;
  document.getElementById('mix-title').textContent = '🌪 Микс дня';
  showScreen('screen-mix');
  playSound('flip');
  renderMixCard();
}
function openCustomPhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        data.settings.customPhoto = dataUrl;
        data.settings.currentAvatar = 'custom';
        save();
        toast('📷 Фото установлено!');
        if (document.getElementById('screen-profile').classList.contains('active')) {
          renderProfile();
        } else if (document.getElementById('screen-avatars').classList.contains('active')) {
          openAvatars();
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

/* ============================================================
   АВАТАРКИ
   ============================================================ */
function openAvatars() {
  const el = document.getElementById('avatars-content');
  if (!el) return;
  const owned = data.settings.ownedAvatars || ['penguin'];
  const current = data.settings.currentAvatar || 'penguin';
  let html = '';
  const hasCustom = !!data.settings.customPhoto;
  html += `<div class="photo-upload-item" onclick="${hasCustom ? `setCustomAvatar()` : `buyItem('customPhoto')`}">
    <div class="pu-icon">${hasCustom ? '✅' : '📷'}</div>
    <div class="pu-name">${hasCustom ? 'Своё фото' : 'Загрузить своё фото'}</div>
    <div class="pu-desc">${hasCustom ? (current === 'custom' ? '✓ Установлено' : 'Нажми чтобы использовать') : `Купить за ${SHOP_PRICES.customPhoto} монет`}</div>
  </div>`;
  const byRarity = { common: [], uncommon: [], rare: [], epic: [], legendary: [] };
  AVATARS.forEach(a => byRarity[a.rarity].push(a));
  const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  rarityOrder.forEach(rarity => {
    const list = byRarity[rarity];
    if (!list.length) return;
    const rinfo = getRarityInfo(rarity);
    html += `<div class="section-title" style="color:${rinfo.color}">${rinfo.emoji} ${rinfo.name} · ${rinfo.price} монет</div>`;
    html += '<div class="avatar-grid">';
    list.forEach(a => {
      const isOwned = owned.includes(a.id);
      const isCurrent = current === a.id;
      html += `<div class="avatar-item ${isOwned ? 'owned' : 'locked'} ${isCurrent ? 'current' : ''}"
        onclick="${isOwned ? `setAvatar('${a.id}')` : `tryBuyAvatar('${a.id}')`}">
        <div class="av-rarity">${rinfo.emoji}</div>
        <div class="av-emoji">${a.emoji}</div>
        <div class="av-name">${a.name}</div>
        <div class="av-price">${isCurrent ? '✓ Выбрано' : isOwned ? 'Открыто' : '💰 ' + rinfo.price}</div>
      </div>`;
    });
    html += '</div>';
  });
  el.innerHTML = html;
  updateHeaderStats();
  showScreen('screen-avatars');
}
function setAvatar(id) {
  data.settings.currentAvatar = id;
  save();
  playSound('flip');
  openAvatars();
  toast('🎨 Аватарка изменена');
}
function setCustomAvatar() {
  data.settings.currentAvatar = 'custom';
  save();
  playSound('flip');
  toast('📷 Своё фото установлено');
  openAvatars();
}
function tryBuyAvatar(id) {
  const avatar = getAvatarById(id);
  if (!avatar) return;
  const price = getAvatarPrice(avatar);
  if (!spendCoins(price)) return;
  data.settings.ownedAvatars = data.settings.ownedAvatars || [];
  data.settings.ownedAvatars.push(id);
  data.settings.currentAvatar = id;
  save();
  playSound('purchase');
  playSound('achievement');
  toast(`🎉 ${avatar.emoji} ${avatar.name} открыт!`, 2500);
  checkAchievements();
  openAvatars();
}

/* ============================================================
   КВЕСТЫ (экран)
   ============================================================ */
function openQuests() {
  ensureQuestsForToday();
  const el = document.getElementById('quests-content');
  if (!el) return;
  const completed = data.settings.questsCompleted || [];
  const progress = data.settings.questsProgress || {};
  let html = '';
  const treasureReady = isTreasureReady();
  const treasureOpenedToday = data.settings.treasureDate === todayLocalStr();
  html += `<div class="list-item" style="background:linear-gradient(135deg,${treasureOpenedToday ? 'var(--good),#2fb350' : treasureReady ? 'var(--gold),var(--warn)' : 'var(--line),var(--line)'});color:${treasureReady || treasureOpenedToday ? '#fff' : 'var(--text)'};" onclick="${treasureReady ? `openModal('modal-treasure')` : treasureOpenedToday ? `toast('Сундук уже открыт сегодня. Возвращайся завтра!')` : `toast('Выполни все квесты, чтобы открыть сундук!')`}">
    <div class="info">
      <div class="title" style="font-size:18px;color:${treasureReady || treasureOpenedToday ? '#fff' : 'var(--text)'};">${treasureOpenedToday ? '✅ Сундук открыт!' : treasureReady ? '🎁 Сундук готов!' : '🎁 Сундук дня'}</div>
      <div class="sub" style="color:${treasureReady || treasureOpenedToday ? 'rgba(255,255,255,0.9)' : 'var(--sub)'}">
        ${treasureOpenedToday ? 'Заходи завтра за новым' : treasureReady ? 'Нажми, чтобы открыть!' : `Выполнено ${completed.length} / ${currentQuests.length} квестов`}
      </div>
    </div>
  </div>`;
  html += '<div class="section-title">Ежедневные квесты</div>';
  currentQuests.forEach(q => {
    const cur = progress[q.id] || 0;
    const isDone = completed.includes(q.id);
    const pct = Math.min(cur / q.target * 100, 100);
    html += `<div class="quest-item ${isDone ? 'done' : ''}">
      <div class="q-icon">${isDone ? '✅' : q.icon}</div>
      <div class="q-info">
        <div class="q-name">${q.name}</div>
        <div class="q-progress-bar"><div style="width:${pct}%"></div></div>
      </div>
      <div class="q-count">${cur} / ${q.target}</div>
    </div>`;
  });
  el.innerHTML = html;
  showScreen('screen-quests');
}

/* ============================================================
   СТАТИСТИКА
   ============================================================ */
function openStats() {
  const el = document.getElementById('stats-content');
  if (!el) return;
  let totalCards = 0, totalSeen = 0, totalCorrect = 0, totalWrong = 0, learned = 0, starred = 0, hardCount = 0;
  data.langs.forEach(l => {
    (l.folders || []).forEach(f => f.cards.forEach(c => {
      totalCards++; totalSeen += c.seen || 0;
      totalCorrect += c.correct || 0; totalWrong += c.wrong || 0;
      if (c.correct > 0 && c.correct >= c.wrong) learned++;
      if (c.star) starred++;
      if (c.hard) hardCount++;
    }));
    (l.lessons || []).forEach(ls => ls.cards.forEach(c => {
      totalCards++; totalSeen += c.seen || 0;
      totalCorrect += c.correct || 0; totalWrong += c.wrong || 0;
      if (c.correct > 0 && c.correct >= c.wrong) learned++;
      if (c.star) starred++;
      if (c.hard) hardCount++;
    }));
  });
  const pct = totalCards ? Math.round(learned / totalCards * 100) : 0;
  const accuracy = (totalCorrect + totalWrong) ? Math.round(totalCorrect / (totalCorrect + totalWrong) * 100) : 0;
  const today = new Date().toDateString();
  const studiedToday = data.settings.lastStudyDate === today;
  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="num">${data.settings.streak || 0}</div><div class="lbl">🔥 Дней подряд</div></div>
      <div class="stat-card"><div class="num">${pct}%</div><div class="lbl">Выучено</div></div>
      <div class="stat-card"><div class="num">${formatNumber(totalCards)}</div><div class="lbl">Всего слов</div></div>
      <div class="stat-card"><div class="num">${formatNumber(learned)}</div><div class="lbl">Знаю хорошо</div></div>
      <div class="stat-card"><div class="num">${formatNumber(totalSeen)}</div><div class="lbl">Показов</div></div>
      <div class="stat-card"><div class="num">${accuracy}%</div><div class="lbl">Точность</div></div>
      <div class="stat-card"><div class="num">${starred}</div><div class="lbl">⭐ Избранных</div></div>
      <div class="stat-card"><div class="num">${hardCount}</div><div class="lbl">⚡ Сложных</div></div>
      <div class="stat-card"><div class="num">${formatNumber(data.settings.totalXP || 0)}</div><div class="lbl">💎 XP</div></div>
      <div class="stat-card"><div class="num">${formatNumber(data.settings.totalCoins || 0)}</div><div class="lbl">💰 Монет</div></div>
    </div>
    <div class="section-title">По языкам</div>
    ${data.langs.map(l => {
      const st = langStats(l);
      const pal = getLangPalette(l.templateKey);
      return `<div class="list-item"><div class="info">
        <div class="title">${l.emoji || pal.emoji} ${esc(l.name)}</div>
        <div class="sub">${st.lessonsDone} / ${st.lessonsTotal} уроков · ${st.total} слов · ${st.pct}%</div>
        <div class="stat-bar"><div style="width:${st.pct}%;background:linear-gradient(90deg,${pal.grad1},${pal.grad2})"></div></div></div></div>`;
    }).join('') || '<div class="empty">Пока нет данных</div>'}
    ${studiedToday
      ? '<div class="empty" style="color:var(--good)">✓ Сегодня уже занимались — так держать!</div>'
      : '<div class="empty" style="color:var(--warn)">⚠ Сегодня ещё не занимались</div>'}
  `;
  showScreen('screen-stats');
}

/* ============================================================
   АНАЛИТИКА
   ============================================================ */
function openAnalytics() {
  const el = document.getElementById('analytics-content');
  if (!el) return;
  // Собираем статистику по дням за последние 14 дней
  const history = data.settings.studyHistory || {};
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    days.push({ key, count: history[key] || 0, label: ['вс','пн','вт','ср','чт','пт','сб'][d.getDay()] });
  }
  const maxCount = Math.max(1, ...days.map(d => d.count));

  // Топ-10 сложных слов
  const allCards = [];
  data.langs.forEach(l => {
    (l.lessons || []).forEach(ls => ls.cards.forEach(c => allCards.push({ ...c, _lang: l.name })));
    (l.folders || []).forEach(f => f.cards.forEach(c => allCards.push({ ...c, _lang: l.name })));
  });
  const hardWords = allCards
    .filter(c => c.wrong > 0)
    .sort((a, b) => (b.wrong - b.correct) - (a.wrong - a.correct))
    .slice(0, 10);

  // Общие цифры
  const totalSeen = allCards.reduce((s, c) => s + (c.seen || 0), 0);
  const totalCorrect = allCards.reduce((s, c) => s + (c.correct || 0), 0);
  const totalWrong = allCards.reduce((s, c) => s + (c.wrong || 0), 0);
  const accuracy = (totalCorrect + totalWrong) ? Math.round(totalCorrect / (totalCorrect + totalWrong) * 100) : 0;

  el.innerHTML = `
    <div class="section-title">📊 Активность за 14 дней</div>
    <div class="chart-container">
      <div class="chart-bars">
        ${days.map(d => `<div class="chart-bar" style="height:${Math.max(4, d.count / maxCount * 100)}%;" data-value="${d.count}"></div>`).join('')}
      </div>
      <div class="chart-labels">
        ${days.map(d => `<span>${d.label}</span>`).join('')}
      </div>
    </div>

    <div class="section-title">🎯 Общая точность</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="num">${accuracy}%</div><div class="lbl">Точность</div></div>
      <div class="stat-card"><div class="num">${formatNumber(totalSeen)}</div><div class="lbl">Всего показов</div></div>
      <div class="stat-card"><div class="num">${formatNumber(totalCorrect)}</div><div class="lbl">Правильных</div></div>
      <div class="stat-card"><div class="num">${formatNumber(totalWrong)}</div><div class="lbl">Ошибок</div></div>
    </div>

    <div class="section-title">🔥 Топ-10 сложных слов</div>
    ${hardWords.length ? hardWords.map((c, i) => `
      <div class="top-word-item">
        <span class="tw-num">${i + 1}</span>
        <div style="flex:1;min-width:0;">
          <div class="tw-word">${esc(c.front)}</div>
          <div class="tw-stat">${esc(c.back)} · ${c._lang}</div>
        </div>
        <div class="tw-stat" style="color:var(--bad);font-weight:700;">✗ ${c.wrong}</div>
      </div>
    `).join('') : '<div class="empty">Пока нет ошибок — отличная работа! 🐧</div>'}
  `;
  showScreen('screen-analytics');
}

/* ============================================================
   КАЛЕНДАРЬ
   ============================================================ */
function openCalendar() {
  const el = document.getElementById('stats-content');
  if (!el) return;
  const history = data.settings.studyHistory || {};
  const days = [];
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  const firstDay = days[0].getDay();
  const offset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  days.forEach(d => {
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const count = history[key] || 0;
    let lvl = '';
    if (count >= 50) lvl = 'l4';
    else if (count >= 30) lvl = 'l3';
    else if (count >= 15) lvl = 'l2';
    else if (count > 0) lvl = 'l1';
    cells.push({ key, count, lvl });
  });
  el.innerHTML = `
    <div class="section-title">Последние 90 дней</div>
    <div class="heatmap">
      ${cells.map(c => c ? `<div class="heat-cell ${c.lvl}" title="${c.key}: ${c.count} слов"></div>` : '<div></div>').join('')}
    </div>
    <div class="heat-legend">
      Меньше
      <div class="heat-cell"></div>
      <div class="heat-cell l1"></div>
      <div class="heat-cell l2"></div>
      <div class="heat-cell l3"></div>
      <div class="heat-cell l4"></div>
      Больше
    </div>
    <div class="section-title">Итоги</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="num">${Object.keys(history).length}</div><div class="lbl">Дней занятий</div></div>
      <div class="stat-card"><div class="num">${Object.values(history).reduce((a,b) => a+b, 0)}</div><div class="lbl">Слов пройдено</div></div>
    </div>
  `;
  showScreen('screen-stats');
}

/* ============================================================
   ДОСТИЖЕНИЯ
   ============================================================ */
function openAchievements() {
  const el = document.getElementById('achievements-content');
  if (!el) return;
  const unlocked = data.settings.achievements || [];
  el.innerHTML = `
    <div class="section-title">Разблокировано: ${unlocked.length} / ${ACHIEVEMENTS.length}</div>
    <div class="achievements-grid">
      ${ACHIEVEMENTS.map(a => `
        <div class="ach-card ${unlocked.includes(a.id) ? 'unlocked' : ''}">
          <div class="ach-icon">${a.icon}</div>
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
  showScreen('screen-achievements');
}

/* ============================================================
   БЭКАПЫ (экран)
   ============================================================ */
function openBackups() {
  const el = document.getElementById('backups-content');
  if (!el) return;
  const backups = data.settings.backups || {};
  const dates = Object.keys(backups).sort().reverse();
  let html = '';
  if (dates.length) {
    html += '<div class="section-title">📦 Автоматические (7 дней)</div>';
    html += dates.map(date => {
      const b = backups[date];
      const size = b.size ? (b.size / 1024).toFixed(1) + ' КБ' : '';
      return `<div class="backup-item" onclick="restoreBackup('${date}')">
        <div class="bi-icon">📦</div>
        <div class="bi-info">
          <div class="bi-date">${formatDate(date)}</div>
          <div class="bi-size">${size} · ${new Date(b.time).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}</div>
        </div>
        <div class="val">›</div>
      </div>`;
    }).join('');
  }
  const manual = (data.settings.manualExports || []).slice().reverse();
  if (manual.length) {
    html += '<div class="section-title">💾 Ручные экспорты</div>';
    html += manual.map(m => {
      const size = m.size ? (m.size / 1024).toFixed(1) + ' КБ' : '';
      return `<div class="backup-item">
        <div class="bi-icon">💾</div>
        <div class="bi-info">
          <div class="bi-date">${formatDate(m.date)}</div>
          <div class="bi-size">${size} · ${new Date(m.time).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}</div>
        </div>
        <div class="val" style="color:var(--sub);font-size:12px;">файл на устройстве</div>
      </div>`;
    }).join('');
  }
  if (!html) html = '<div class="empty">📦 Пока нет бэкапов.<br>Первый создастся автоматически.</div>';
  el.innerHTML = html;
  showScreen('screen-backups');
}
function restoreBackup(date) {
  confirmDialog('Восстановить бэкап?', `Все текущие данные заменятся версией от ${formatDate(date)}.`, () => {
    try {
      const raw = localStorage.getItem(BACKUP_KEY_PREFIX + date);
      if (!raw) { toast('Бэкап не найден'); return; }
      data = JSON.parse(raw);
      const def = defaultData();
      data.settings = Object.assign({}, def.settings, data.settings || {});
      save();
      applyTheme(data.settings.theme);
      renderLangs();
      toast('📦 Восстановлено!');
      goProfile();
    } catch (e) { toast('Ошибка восстановления'); }
  });
}
