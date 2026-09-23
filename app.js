/* ============================================================
   Cards App v6.0 — Часть 1
   Данные, навигация, тропа, языки, уроки, классика, тест, XP
   ============================================================ */

const STORE_KEY = 'cards_app_data_v6';
const OLD_KEY = 'cards_app_data_v5';

/* ---------- ДАННЫЕ ПО УМОЛЧАНИЮ ---------- */
function defaultData() {
  return {
    langs: [],
    settings: {
      sound: true, vibe: true, srs: true,
      dailyGoal: 20, dailyDate: null, dailyCount: 0,
      reverseMode: false,
      lastStudyDate: null, streak: 0,
      totalXP: 0, achievements: [], studyHistory: {}
    }
  };
}

function load() {
  try {
    let raw = localStorage.getItem(STORE_KEY) || localStorage.getItem(OLD_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      const def = defaultData();
      d.settings = Object.assign(def.settings, d.settings || {});
      if (!d.settings.studyHistory) d.settings.studyHistory = {};
      if (!Array.isArray(d.settings.achievements)) d.settings.achievements = [];
      d.langs.forEach(l => {
        if (!l.lessons) l.lessons = [];
        if (!l.folders) l.folders = l.folders || [];
        if (!l.isBuiltin) l.isBuiltin = false;
        // Убедимся, что у карточек в старых папках есть все поля
        l.folders.forEach(f => f.cards.forEach(c => normalizeCard(c)));
        l.lessons.forEach(ls => ls.cards.forEach(c => normalizeCard(c)));
      });
      return d;
    }
  } catch(e) { console.error(e); }
  return defaultData();
}
function normalizeCard(c) {
  if (c.seen === undefined) c.seen = 0;
  if (c.correct === undefined) c.correct = 0;
  if (c.wrong === undefined) c.wrong = 0;
  if (c.star === undefined) c.star = false;
  if (c.lastSeen === undefined) c.lastSeen = null;
  if (c.srsNext === undefined) c.srsNext = null;
  if (c.srsLevel === undefined) c.srsLevel = 0;
}

let data = load();
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ---------- СОСТОЯНИЕ ---------- */
let currentLangId = null;
let currentFolderId = null;    // для пользовательской папки
let currentLessonId = null;    // для урока тропы
let studyMode = 'classic';
let studyDeck = [];
let studyIndex = 0;
let studyFlipped = false;
let sessionCorrect = 0;
let sessionWrong = 0;
let sessionXP = 0;
let sessionStreakCorrect = 0;
let quizLocked = false;
let quizTimer = null;
let quizTimeLeft = 10;
let matchPairs = [];
let matchSelectedLeft = null;
let matchSelectedRight = null;
let matchBatch = 5;
let matchOffset = 0;
let audioDeck = [], audioIndex = 0, audioLocked = false, audioTimer = null;
let speedDeck = [], speedIndex = 0, speedScore = 0, speedTimer = null, speedTimeLeft = 60, speedLocked = false;
let mixDeck = [], mixIndex = 0, mixFlipped = false;
let lastLesson = null;

/* ============================================================
   XP И УРОВНИ
   ============================================================ */
const LEVELS = [
  { min: 0,     name: '🐧 Птенец',   next: 500 },
  { min: 500,   name: '📚 Ученик',   next: 2000 },
  { min: 2000,  name: '🎓 Знаток',   next: 5000 },
  { min: 5000,  name: '🏆 Мастер',   next: 10000 },
  { min: 10000, name: '👑 Гуру',     next: Infinity }
];
function getLevel(xp) {
  let cur = LEVELS[0], next = LEVELS[0];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) { cur = LEVELS[i]; next = LEVELS[i+1] || LEVELS[i]; }
  }
  const range = next.min === Infinity ? 1 : next.min - cur.min;
  const prog = next.min === Infinity ? 1 : (xp - cur.min) / range;
  return { level: cur, next, progress: prog };
}
function addXP(n) {
  data.settings.totalXP = (data.settings.totalXP || 0) + n;
  sessionXP += n;
  save();
  checkAchievements();
}

/* ============================================================
   АЧИВКИ
   ============================================================ */
const ACHIEVEMENTS = [
  { id: 'first',     icon: '🎯', name: 'Первый шаг',       desc: '1 правильный ответ' },
  { id: 'hundred',   icon: '💯', name: 'Сотка',             desc: '100 правильных' },
  { id: 'thousand',  icon: '🌟', name: 'Тысячник',          desc: '1000 правильных' },
  { id: 'week',      icon: '🔥', name: 'Неделя',            desc: '7 дней подряд' },
  { id: 'month',     icon: '🔥🔥', name: 'Месяц',           desc: '30 дней подряд' },
  { id: 'polyglot',  icon: '📚', name: 'Полиглот',          desc: '3 языка' },
  { id: 'vocab',     icon: '🧠', name: 'Словарный запас',   desc: '100 слов выучено' },
  { id: 'professor', icon: '🎓', name: 'Профессор',         desc: '500 слов выучено' },
  { id: 'collector', icon: '🎴', name: 'Коллекционер',      desc: '100 звёздочек' },
  { id: 'legend',    icon: '👑', name: 'Легенда',           desc: '10000 XP' },
  { id: 'speedster', icon: '🚀', name: 'Скорость',          desc: 'Скоростной: 20+ слов' },
  { id: 'mixer',     icon: '🌪', name: 'Миксер',            desc: 'Пройти микс-тренировку' },
  { id: 'trail1',    icon: '🌳', name: 'Первая тропа',      desc: 'Завершить урок тропы' },
  { id: 'trail10',   icon: '🌲', name: 'Лесоруб',           desc: 'Завершить 10 уроков' },
  { id: 'trail50',   icon: '🏔️', name: 'Покоритель',        desc: 'Завершить 50 уроков' },
  { id: 'penguin',   icon: '🐧', name: 'Друг пингвина',     desc: 'Пройти 3 урока за день' }
];

function countStats() {
  let correct = 0, learned = 0, starred = 0, total = 0, lessonsDone = 0;
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
  });
  return { correct, learned, starred, total, langs: data.langs.length, lessonsDone };
}

function unlockAchievement(id) {
  if (data.settings.achievements.includes(id)) return false;
  data.settings.achievements.push(id);
  save();
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (a) toast(`${a.icon} ${a.name}!`);
  return true;
}
function checkAchievements() {
  const s = countStats();
  const xp = data.settings.totalXP || 0;
  const streak = data.settings.streak || 0;
  if (s.correct >= 1) unlockAchievement('first');
  if (s.correct >= 100) unlockAchievement('hundred');
  if (s.correct >= 1000) unlockAchievement('thousand');
  if (streak >= 7) unlockAchievement('week');
  if (streak >= 30) unlockAchievement('month');
  if (s.langs >= 3) unlockAchievement('polyglot');
  if (s.learned >= 100) unlockAchievement('vocab');
  if (s.learned >= 500) unlockAchievement('professor');
  if (s.starred >= 100) unlockAchievement('collector');
  if (xp >= 10000) unlockAchievement('legend');
  if (s.lessonsDone >= 1) unlockAchievement('trail1');
  if (s.lessonsDone >= 10) unlockAchievement('trail10');
  if (s.lessonsDone >= 50) unlockAchievement('trail50');
}

/* ============================================================
   НАВИГАЦИЯ
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  updateNavHighlight(id);
}
function updateNavHighlight(screenId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (screenId === 'screen-langs') document.getElementById('nav-langs').classList.add('active');
  if (screenId === 'screen-profile' || screenId === 'screen-stats' ||
      screenId === 'screen-achievements' || screenId === 'screen-settings') {
    document.getElementById('nav-profile').classList.add('active');
  }
}
function navTo(where) {
  if (where === 'langs') goLangs();
  if (where === 'profile') goProfile();
}
function goLangs() {
  currentLangId = null; currentFolderId = null; currentLessonId = null;
  renderLangs(); showScreen('screen-langs');
}
function goTrail() {
  currentFolderId = null; currentLessonId = null;
  renderTrail(); showScreen('screen-trail');
}
function goCards() {
  if (currentLessonId) {
    // Назад в тропу из урока
    goTrail();
    return;
  }
  renderCards(); showScreen('screen-cards');
}
function goProfile() { renderProfile(); showScreen('screen-profile'); }

/* ============================================================
   ЗВУКИ
   ============================================================ */
let audioCtx = null;
function getAudio() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; } }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function playTone(freq, duration = 0.1, type = 'sine', volume = 0.15) {
  if (!data.settings.sound) return;
  const ctx = getAudio(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + duration);
}
function soundFlip() { playTone(600, 0.06, 'sine', 0.08); }
function soundGood() { playTone(660, 0.1, 'sine', 0.15); setTimeout(() => playTone(880, 0.12, 'sine', 0.15), 80); }
function soundBad() { playTone(220, 0.15, 'sawtooth', 0.1); setTimeout(() => playTone(160, 0.2, 'sawtooth', 0.1), 100); }
function soundFinish() {
  playTone(523, 0.12, 'sine', 0.18);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.18), 120);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.18), 240);
  setTimeout(() => playTone(1047, 0.25, 'sine', 0.2), 400);
}
function vibrate(pattern) { if (!data.settings.vibe || !navigator.vibrate) return; navigator.vibrate(pattern); }

/* ============================================================
   ОЗВУЧКА
   ============================================================ */
function speak(text) {
  if (!('speechSynthesis' in window)) { toast('Озвучка не поддерживается'); return; }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch(e) { toast('Не удалось озвучить'); }
}
function speakCurrent(e) {
  if (e) e.stopPropagation();
  const card = studyDeck[studyIndex];
  if (!card) return;
  speak(studyFlipped ? card.back : card.front);
}
function speakMix(e) {
  if (e) e.stopPropagation();
  const card = mixDeck[mixIndex];
  if (!card) return;
  speak(mixFlipped ? card.back : card.front);
}

/* ============================================================
   ЯЗЫКИ
   ============================================================ */
function renderLangs() {
  const el = document.getElementById('langs-list'); el.innerHTML = '';
  updateStreakBadge();
  if (!data.langs.length) {
    el.innerHTML = '<div class="empty">🐧 Пока нет языков.<br>Нажмите «+ Добавить язык».</div>';
    return;
  }
  data.langs.forEach(lang => {
    const stats = langStats(lang);
    const div = document.createElement('div'); div.className = 'list-item';
    div.innerHTML = `<div class="info">
        <div class="title">${lang.emoji || '🌍'} ${esc(lang.name)}${lang.isBuiltin ? ' <span class="badge ok">готовый</span>' : ''}</div>
        <div class="sub">${stats.lessonsDone} / ${stats.lessonsTotal} уроков · ${stats.total} слов · ${stats.pct}%</div>
        <div class="stat-bar"><div style="width:${stats.pct}%"></div></div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); confirmDeleteLang('${lang.id}')">✕</span>`;
    div.onclick = () => {
      currentLangId = lang.id;
      document.getElementById('trail-title').textContent = `${lang.emoji || '🌍'} ${lang.name}`;
      goTrail();
    };
    el.appendChild(div);
  });
}
function langStats(lang) {
  let total = 0, learned = 0, lessonsDone = 0, lessonsTotal = (lang.lessons || []).length;
  (lang.folders || []).forEach(f => f.cards.forEach(c => {
    total++;
    if (c.correct > 0 && c.correct >= c.wrong) learned++;
  }));
  (lang.lessons || []).forEach(ls => {
    ls.cards.forEach(c => {
      total++;
      if (c.correct > 0 && c.correct >= c.wrong) learned++;
    });
    if (ls.completed) lessonsDone++;
  });
  const pct = total ? Math.round(learned / total * 100) : 0;
  return { total, learned, pct, lessonsDone, lessonsTotal };
}
function updateStreakBadge() {
  const el = document.getElementById('header-streak');
  if (!el) return;
  const s = data.settings.streak || 0;
  el.textContent = s > 0 ? `🔥 ${s}` : '';
}

/* ---------- МОДАЛКА ДОБАВЛЕНИЯ ЯЗЫКА ---------- */
function openAddLang() {
  // Показываем список шаблонов + поле для своего
  const el = document.getElementById('lang-input');
  el.value = '';
  // Собираем модалку с шаблонами
  const existingTpl = new Set(data.langs.filter(l => l.templateKey).map(l => l.templateKey));
  const tplHtml = AVAILABLE_TEMPLATES.map(t => {
    const used = existingTpl.has(t.key);
    return `<button class="mode-btn" ${used ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''} onclick="addLangFromTemplate('${t.key}')">
      <div class="mode-icon">${t.emoji}</div>
      <div class="mode-name">${t.name}</div>
      <div class="mode-desc">${used ? 'Уже добавлен' : '8 тем · 120 слов'}</div>
    </button>`;
  }).join('');
  // Вставляем временный блок шаблонов в модалку
  const modal = document.querySelector('#modal-lang .modal');
  let tplBlock = document.getElementById('tpl-block');
  if (!tplBlock) {
    tplBlock = document.createElement('div');
    tplBlock.id = 'tpl-block';
    tplBlock.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:14px;';
    const actions = modal.querySelector('.modal-actions');
    modal.insertBefore(tplBlock, actions);
  }
  tplBlock.innerHTML = `<div class="help-text" style="margin-bottom:4px;">Готовые языки с темами:</div>${tplHtml}
    <div class="help-text" style="margin-top:10px;margin-bottom:4px;">Или создай свой (пустой):</div>`;
  openModal('modal-lang');
  setTimeout(() => el.focus(), 150);
}
function addLangFromTemplate(key) {
  const lang = createLangFromTemplate(key);
  if (!lang) { toast('Не удалось создать язык'); return; }
  data.langs.push(lang);
  save(); closeModal('modal-lang');
  renderLangs();
  toast(`${lang.emoji} ${lang.name} добавлен!`);
  checkAchievements();
}
function saveLang() {
  const name = document.getElementById('lang-input').value.trim();
  if (!name) return;
  data.langs.push({
    id: uid(), name, emoji: '🌍', isBuiltin: false,
    lessons: [], folders: []
  });
  save(); closeModal('modal-lang'); renderLangs();
  checkAchievements();
}
function confirmDeleteLang(id) {
  confirmDialog('Удалить язык?', 'Все уроки, папки и прогресс удалятся.', () => {
    data.langs = data.langs.filter(l => l.id !== id);
    save(); renderLangs();
  });
}

/* ============================================================
   ТРОПА
   ============================================================ */
function switchTab(tab) {
  document.getElementById('tab-trail').classList.toggle('active', tab === 'trail');
  document.getElementById('tab-mine').classList.toggle('active', tab === 'mine');
  document.getElementById('tab-content-trail').style.display = tab === 'trail' ? 'block' : 'none';
  document.getElementById('tab-content-mine').style.display = tab === 'mine' ? 'block' : 'none';
  if (tab === 'mine') renderMineList();
}
function renderTrail() {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) { goLangs(); return; }

  // Фраза пингвина
  const penguinEl = document.getElementById('trail-penguin');
  const phraseEl = document.getElementById('trail-phrase');
  if (penguinEl) penguinEl.textContent = '🐧';
  if (phraseEl) phraseEl.textContent = penguinForTrail();

  // Тропа
  const pathEl = document.getElementById('trail-path');
  pathEl.innerHTML = '';
  if (!lang.lessons || !lang.lessons.length) {
    pathEl.innerHTML = '<div class="empty">🐧 Тут пока пусто.<br>Перейди на вкладку «Мои папки», чтобы добавить свои слова.</div>';
    return;
  }

  // Определяем текущий урок — первый незавершённый
  const currentIdx = lang.lessons.findIndex(l => !l.completed);
  lang.lessons.forEach((lesson, idx) => {
    const isDone = lesson.completed;
    const isCurrent = idx === currentIdx;
    const isLocked = !isDone && !isCurrent && idx > currentIdx;

    const node = document.createElement('div');
    node.className = 'trail-node' + (isDone ? ' done' : '');

    // Текст-лейбл с темой (справа от кружка)
    let labelHtml = '';
    if (isCurrent || isDone) {
      labelHtml = `<div class="lesson-label">
        <div class="title">${lesson.themeEmoji || '📘'} ${esc(lesson.themeName)}</div>
        <div class="sub">Урок ${lesson.lessonNum} из ${lesson.totalInTheme} · ${lesson.cards.length} слов</div>
      </div>`;
    }

    node.innerHTML = `
      <div class="line"></div>
      <div class="lesson-circle ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}"
           onclick="${isLocked ? `toast('🔒 Сначала пройди предыдущие уроки')` : `openLesson('${lesson.id}')`}">
        <div class="lesson-icon">${isDone ? '⭐' : isLocked ? '🔒' : lesson.themeEmoji || '📘'}</div>
        <div class="lesson-num">${lesson.themeName.substring(0, 3)} ${lesson.lessonNum}</div>
      </div>
      ${labelHtml}
    `;
    pathEl.appendChild(node);
  });
}

function openLesson(lessonId) {
  const lang = data.langs.find(l => l.id === currentLangId);
  const lesson = lang.lessons.find(l => l.id === lessonId);
  if (!lesson) return;
  currentLessonId = lessonId;
  currentFolderId = null;
  document.getElementById('cards-title').textContent = `${lesson.themeEmoji || '📘'} ${lesson.themeName} · Урок ${lesson.lessonNum}`;
  renderCards();
  showScreen('screen-cards');
}

/* ============================================================
   МОИ ПАПКИ
   ============================================================ */
function renderMineList() {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) return;
  const el = document.getElementById('mine-list');
  el.innerHTML = '';
  if (!lang.folders || !lang.folders.length) {
    el.innerHTML = '<div class="empty">🐧 Пока нет своих папок.<br>Добавь слова вручную или импортируй CSV.</div>';
    return;
  }
  lang.folders.forEach(folder => {
    const total = folder.cards.length;
    const learned = folder.cards.filter(c => c.correct > 0 && c.correct >= c.wrong).length;
    const pct = total ? Math.round(learned / total * 100) : 0;
    const div = document.createElement('div'); div.className = 'list-item';
    div.innerHTML = `<div class="info">
        <div class="title">${esc(folder.name)}</div>
        <div class="sub">${total} слов · ${pct}%</div>
        <div class="stat-bar"><div style="width:${pct}%"></div></div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); confirmDeleteFolder('${folder.id}')">✕</span>`;
    div.onclick = () => {
      currentFolderId = folder.id;
      currentLessonId = null;
      document.getElementById('cards-title').textContent = folder.name;
      renderCards();
      showScreen('screen-cards');
    };
    el.appendChild(div);
  });
}
function openAddFolder() {
  document.getElementById('folder-input').value = '';
  openModal('modal-folder');
  setTimeout(() => document.getElementById('folder-input').focus(), 150);
}
function saveFolder() {
  const name = document.getElementById('folder-input').value.trim();
  if (!name) return;
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang.folders) lang.folders = [];
  lang.folders.push({ id: uid(), name, cards: [] });
  save(); closeModal('modal-folder'); renderMineList();
  // Автоматически открываем для редактирования
  const newFolder = lang.folders[lang.folders.length - 1];
  currentFolderId = newFolder.id;
  currentLessonId = null;
  document.getElementById('cards-title').textContent = newFolder.name;
  renderCards();
  showScreen('screen-cards');
}
function confirmDeleteFolder(id) {
  confirmDialog('Удалить папку?', 'Все слова внутри удалятся.', () => {
    const lang = data.langs.find(l => l.id === currentLangId);
    lang.folders = lang.folders.filter(f => f.id !== id);
    save(); renderMineList();
  });
}

/* ============================================================
   КАРТОЧКИ (список внутри урока/папки)
   ============================================================ */
function getCurrentContainer() {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) return null;
  if (currentLessonId) return lang.lessons.find(l => l.id === currentLessonId);
  if (currentFolderId) return lang.folders.find(f => f.id === currentFolderId);
  return null;
}
function renderCards() {
  const c = getCurrentContainer();
  if (!c) { goTrail(); return; }
  const el = document.getElementById('cards-list'); el.innerHTML = '';
  if (!c.cards.length) {
    el.innerHTML = '<div class="empty">🐧 Пока нет слов.<br>Нажми «Текст» или «Импорт CSV».</div>';
    return;
  }
  c.cards.forEach((card, i) => {
    const learned = card.correct > 0 && card.correct >= card.wrong;
    const badge = card.seen === 0 ? '<span class="badge">новое</span>' :
                  learned ? '<span class="badge ok">выучено</span>' :
                  '<span class="badge bad">учить</span>';
    const div = document.createElement('div'); div.className = 'list-item';
    div.innerHTML = `<div class="info">
        <div class="title">${card.star ? '⭐ ' : ''}${esc(card.front)} ${badge}</div>
        <div class="sub">${esc(card.back)}</div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); deleteCard(${i})">✕</span>`;
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
   МАССОВЫЙ ВВОД (только для пользовательских папок/уроков)
   ============================================================ */
function openBulkAdd() {
  const c = getCurrentContainer();
  if (!c) return;
  document.getElementById('bulk-input').value = c.cards.map(x => `${x.front} | ${x.back}`).join('\n');
  openModal('modal-bulk');
}
function parseBulk(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const cards = [];
  for (const line of lines) {
    let parts = null;
    if (line.includes('\t')) parts = line.split('\t');
    else if (line.includes(' | ')) parts = line.split(' | ');
    else if (line.includes('|')) parts = line.split('|');
    else if (line.includes(' — ')) parts = line.split(' — ');
    else if (line.includes(' - ')) parts = line.split(' - ');
    else if (line.includes(';')) parts = line.split(';');
    else if (line.includes(',')) parts = line.split(',');
    if (!parts || parts.length < 2) continue;
    const front = parts[0].trim();
    const back = parts.slice(1).join(' ').trim();
    if (front && back) cards.push(makeCard(front, back));
  }
  return cards;
}
function addBulk() {
  const text = document.getElementById('bulk-input').value;
  const newCards = parseBulk(text);
  if (!newCards.length) { toast('Не удалось распознать строки'); return; }
  const c = getCurrentContainer();
  const existing = new Set(c.cards.map(x => x.front.toLowerCase()));
  let added = 0;
  for (const card of newCards) {
    if (!existing.has(card.front.toLowerCase())) { c.cards.push(card); added++; }
  }
  save(); closeModal('modal-bulk'); renderCards();
  toast(`Добавлено: ${added}`);
}
function replaceBulk() {
  confirmDialog('Заменить всё?', 'Все текущие слова удалятся.', () => {
    const c = getCurrentContainer();
    c.cards = parseBulk(document.getElementById('bulk-input').value);
    save(); closeModal('modal-bulk'); renderCards();
    toast(`Заменено: ${c.cards.length}`);
  });
}

/* ============================================================
   ВЫБОР РЕЖИМА
   ============================================================ */
function renderModePicker() {
  const xp = data.settings.totalXP || 0;
  const el = document.getElementById('mode-picker');
  const c = getCurrentContainer();
  const wordsCount = c ? c.cards.length : 0;
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
    <button class="mode-btn" onclick="startStudy('quiz', false)">
      <div class="mode-icon">⚡</div>
      <div class="mode-name">Быстрый урок</div>
      <div class="mode-desc">Выбери перевод из 4 вариантов</div>
    </button>
    <button class="mode-btn" onclick="startStudy('match', false)">
      <div class="mode-icon">🔗</div>
      <div class="mode-name">Сопоставление</div>
      <div class="mode-desc">Соедини пары (нужно 3+ слова)</div>
    </button>
    <button class="mode-btn" onclick="startStudy('audio', false)">
      <div class="mode-icon">🔊</div>
      <div class="mode-name">Аудио-режим</div>
      <div class="mode-desc">Слушай и выбирай перевод</div>
    </button>
    <button class="mode-btn ${xp < 500 ? 'locked' : ''}"
      onclick="${xp < 500 ? `toast('🔒 Нужно 500 XP (у тебя ${xp})')` : `startStudy('speed', false)`}">
      ${xp < 500 ? '<span class="mode-lock">🔒 500 XP</span>' : ''}
      <div class="mode-icon">🚀</div>
      <div class="mode-name">Скоростной режим</div>
      <div class="mode-desc">60 секунд — максимум ответов</div>
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
  sessionCorrect = 0; sessionWrong = 0; sessionXP = 0; sessionStreakCorrect = 0;
  quizLocked = false; audioLocked = false; speedLocked = false;
  matchSelectedLeft = null; matchSelectedRight = null; matchOffset = 0;
}
function startStudy(mode, onlyUnlearned) {
  const c = getCurrentContainer();
  if (!c) return;
  let deck = [...c.cards];
  if (onlyUnlearned) deck = deck.filter(x => !(x.correct > 0 && x.correct >= x.wrong));
  if (!deck.length) { toast('🐧 Нет слов для изучения'); return; }
  studyMode = mode;
  resetSession();
  studyDeck = deck;
  studyIndex = 0;
  studyFlipped = false;

  if (mode === 'classic') {
    document.getElementById('study-title').textContent = c.name || c.themeName || 'Урок';
    showScreen('screen-study');
    renderStudyCard();
  } else if (mode === 'quiz') {
    if (studyDeck.length < 2) { toast('Нужно минимум 2 слова'); return; }
    document.getElementById('quiz-title').textContent = c.name || c.themeName || 'Тест';
    showScreen('screen-quiz');
    renderQuizCard();
  } else if (mode === 'match') {
    if (studyDeck.length < 3) { toast('Нужно минимум 3 слова'); return; }
    document.getElementById('match-title').textContent = c.name || c.themeName || 'Пары';
    showScreen('screen-match');
    renderMatchBatch();
  } else if (mode === 'audio') {
    if (studyDeck.length < 2) { toast('Нужно минимум 2 слова'); return; }
    document.getElementById('audio-title').textContent = c.name || c.themeName || 'Аудио';
    audioDeck = deck; audioIndex = 0;
    showScreen('screen-audio');
    renderAudioCard();
  } else if (mode === 'speed') {
    if (studyDeck.length < 4) { toast('Нужно минимум 4 слова'); return; }
    document.getElementById('speed-title').textContent = '🚀 ' + (c.name || c.themeName || '');
    speedDeck = shuffleArr(deck);
    speedIndex = 0; speedScore = 0; speedTimeLeft = 60; speedLocked = false;
    showScreen('screen-speed');
    renderSpeedCard();
    startSpeedTimer();
  }
}

/* ============================================================
   КЛАССИКА
   ============================================================ */
function renderStudyCard() {
  const card = studyDeck[studyIndex];
  if (!card) { finishSession(); return; }
  const cardEl = document.getElementById('card');
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
  starBtn.textContent = card.star ? '★' : '☆';
  starBtn.style.color = card.star ? 'var(--star)' : '';
  document.getElementById('reverse-btn').style.opacity = data.settings.reverseMode ? '1' : '0.5';
}
function toggleReverse() {
  data.settings.reverseMode = !data.settings.reverseMode;
  save(); renderStudyCard();
  toast(data.settings.reverseMode ? '🔄 Обратный режим ВКЛ' : '🔄 Обратный режим ВЫКЛ');
}
function toggleStar() {
  const card = studyDeck[studyIndex]; if (!card) return;
  card.star = !card.star; save(); renderStudyCard(); soundFlip();
  checkAchievements();
}
function answer(correct) {
  const card = studyDeck[studyIndex]; if (!card) return;
  card.seen++;
  if (correct) {
    card.correct++; sessionCorrect++; sessionStreakCorrect++;
    let gain = 10;
    if (sessionStreakCorrect >= 5) gain += 15;
    addXP(gain);
    soundGood(); vibrate(20);
  } else {
    card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
    soundBad(); vibrate([30, 40, 30]);
  }
  card.lastSeen = Date.now();
  updateSRS(card, correct);
  save();
  const cardEl = document.getElementById('card');
  if (correct) {
    cardEl.classList.add('good-anim');
    setTimeout(() => { cardEl.classList.add('fly-right'); }, 200);
  } else {
    cardEl.classList.add('bad-anim');
    setTimeout(() => { cardEl.classList.add('fly-left'); }, 300);
  }
  setTimeout(nextCard, 700);
}
function nextCard() {
  studyIndex++;
  if (studyIndex >= studyDeck.length) { finishSession(); return; }
  studyFlipped = false;
  renderStudyCard();
}
function shuffleDeck() {
  for (let i = studyDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [studyDeck[i], studyDeck[j]] = [studyDeck[j], studyDeck[i]];
  }
  studyIndex = 0; studyFlipped = false; renderStudyCard(); toast('🔀 Перемешано');
}

/* Свайпы */
let startX = 0, startY = 0, currentX = 0, currentY = 0, swipeActive = false, isDragging = false;
const cardEl = document.getElementById('card');
cardEl.addEventListener('click', () => {
  if (swipeActive) return;
  studyFlipped = !studyFlipped; soundFlip(); renderStudyCard();
});
cardEl.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  currentX = 0; currentY = 0; isDragging = true; swipeActive = false;
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

/* ============================================================
   БЫСТРЫЙ ТЕСТ
   ============================================================ */
function renderQuizCard() {
  const card = studyDeck[studyIndex];
  if (!card) { finishSession(); return; }
  quizLocked = false;
  document.getElementById('quiz-question').textContent = card.front;
  const wrongPool = studyDeck.filter(x => x.front !== card.front);
  const wrongs = shuffleArr(wrongPool).slice(0, 3).map(x => x.back);
  const opts = shuffleArr([card.back, ...wrongs]);
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
  quizLocked = true;
  card.seen++; card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
  updateSRS(card, false); save();
  document.querySelectorAll('#quiz-options .quiz-option').forEach(b => {
    if (b.textContent === card.back) b.classList.add('correct');
  });
  soundBad(); vibrate([30, 40, 30]);
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
  card.seen++;
  const isCorrect = chosen === card.back;
  const fast = quizTimeLeft >= 7;
  if (isCorrect) {
    card.correct++; sessionCorrect++; sessionStreakCorrect++;
    let gain = 10;
    if (fast) gain += 5;
    if (sessionStreakCorrect >= 5) gain += 15;
    addXP(gain);
    btn.classList.add('correct');
    soundGood(); vibrate(20);
  } else {
    card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
    btn.classList.add('wrong');
    document.querySelectorAll('#quiz-options .quiz-option').forEach(b => {
      if (b.textContent === card.back) b.classList.add('correct');
    });
    soundBad(); vibrate([30, 40, 30]);
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

/* ============================================================
   SRS
   ============================================================ */
function updateSRS(card, correct) {
  if (!data.settings.srs) return;
  if (correct) card.srsLevel = Math.min((card.srsLevel || 0) + 1, 5);
  else card.srsLevel = 0;
  const intervals = [0, 1, 2, 4, 7, 14];
  const days = intervals[card.srsLevel] || 14;
  card.srsNext = Date.now() + days * 86400000;
}

/* ============================================================
   УТИЛИТЫ
   ============================================================ */
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal-bg').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
});
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function confirmDialog(title, text, onOk) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-text').textContent = text;
  const ok = document.getElementById('confirm-ok');
  const newOk = ok.cloneNode(true);
  ok.parentNode.replaceChild(newOk, ok);
  newOk.onclick = () => { closeModal('modal-confirm'); onOk(); };
  openModal('modal-confirm');
}

/* ---------- СТРИК И ЕЖЕДНЕВКА ---------- */
function markStudyDay() {
  const today = new Date().toDateString();
  const last = data.settings.lastStudyDate;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === yesterday) data.settings.streak = (data.settings.streak || 0) + 1;
  else data.settings.streak = 1;
  data.settings.lastStudyDate = today;
  save();
  addXP(25 * data.settings.streak);
  checkAchievements();
}
function incrementDailyCount(n) {
  const today = new Date().toDateString();
  if (data.settings.dailyDate !== today) {
    data.settings.dailyDate = today;
    data.settings.dailyCount = 0;
  }
  data.settings.dailyCount = (data.settings.dailyCount || 0) + n;
  const d = new Date().toISOString().slice(0,10);
  data.settings.studyHistory[d] = (data.settings.studyHistory[d] || 0) + n;
  save();
  if (data.settings.dailyCount >= data.settings.dailyGoal) {
    if (data.settings.dailyBonusDate !== today) {
      data.settings.dailyBonusDate = today;
      addXP(50);
      toast('🎯 Ежедневная цель! +50 XP');
    }
  }
}

/* ============================================================
   ФИНАЛ + КОНФЕТТИ
   ============================================================ */
function finishSession() {
  clearInterval(quizTimer);
  clearInterval(speedTimer);
  clearInterval(audioTimer);
  lastLesson = {
    mode: studyMode,
    langId: currentLangId,
    folderId: currentFolderId,
    lessonId: currentLessonId
  };
  const total = sessionCorrect + sessionWrong;
  const pct = total ? Math.round(sessionCorrect / total * 100) : 0;

  // Обновляем прогресс урока
  if (currentLessonId) {
    const lang = data.langs.find(l => l.id === currentLangId);
    const lesson = lang && lang.lessons.find(l => l.id === currentLessonId);
    if (lesson) {
      // Считаем, все ли слова урока выучены
      const allLearned = lesson.cards.every(c => c.correct > 0 && c.correct >= c.wrong);
      if (allLearned || pct >= 70) {
        if (!lesson.completed) {
          lesson.completed = true;
          toast('🌟 Урок пройден!');
        }
      }
    }
  }

  document.getElementById('finish-correct').textContent = sessionCorrect;
  document.getElementById('finish-wrong').textContent = sessionWrong;
  document.getElementById('finish-pct').textContent = pct + '%';
  document.getElementById('finish-xp').textContent = `+${sessionXP} XP`;
  document.getElementById('finish-emoji').textContent = finishEmoji(pct);
  document.getElementById('finish-title').textContent = penguinForFinish(pct);
  document.getElementById('finish-title').style.fontSize = '18px';
  document.getElementById('finish-title').style.maxWidth = '320px';
  document.getElementById('finish-title').style.margin = '0 auto 16px';
  showScreen('screen-finish');
  soundFinish();
  vibrate([50, 50, 100]);
  startConfetti();
  markStudyDay();
  incrementDailyCount(sessionCorrect);
  if (studyMode === 'speed' && speedScore >= 20) unlockAchievement('speedster');
  if (studyMode === 'mix') unlockAchievement('mixer');
  checkAchievements();
}
function repeatLesson() {
  if (!lastLesson) { goTrail(); return; }
  currentLangId = lastLesson.langId;
  currentFolderId = lastLesson.folderId;
  currentLessonId = lastLesson.lessonId;
  startStudy(lastLesson.mode, false);
}
function exitStudy() {
  if (currentLessonId || currentFolderId) goCards();
  else goTrail();
}
function startConfetti() {
  const colors = ['#ff3b30','#ff9500','#ffcc00','#34c759','#007aff','#5856d6','#ff2d92','#4fc3f7'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width = (6 + Math.random() * 8) + 'px';
    c.style.height = c.style.width;
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
    c.style.animationDelay = (Math.random() * 0.4) + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3500);
  }
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */
renderLangs();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre) { pre.classList.add('hide'); setTimeout(() => pre.remove(), 600); }
  }, 1200);
});
/* ============================================================
   Cards App v6.0 — Часть 2
   Сопоставление, аудио, скоростной, микс, профиль, достижения,
   статистика, календарь, настройки, CSV-импорт
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
  const leftItems = shuffleArr([...batch]);
  const rightItems = shuffleArr([...batch]);
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
    matchSelectedLeft = null; matchSelectedRight = null;
    const correct = left.dataset.key === right.dataset.key;
    const card = matchPairs.find(c => c.front === left.dataset.key);
    if (card) {
      card.seen++;
      if (correct) {
        card.correct++; sessionCorrect++; sessionStreakCorrect++;
        let gain = 10;
        if (sessionStreakCorrect >= 5) gain += 15;
        addXP(gain);
        soundGood(); vibrate(20);
      } else {
        card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
        soundBad(); vibrate([30, 40, 30]);
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
      left.classList.add('wrong'); right.classList.add('wrong');
      setTimeout(() => {
        left.classList.remove('wrong', 'selected');
        right.classList.remove('wrong', 'selected');
      }, 500);
    }
  }
}

/* ============================================================
   АУДИО-РЕЖИМ
   ============================================================ */
function renderAudioCard() {
  const card = audioDeck[audioIndex];
  if (!card) { finishSession(); return; }
  audioLocked = false;
  const wrongPool = audioDeck.filter(c => c.front !== card.front);
  const wrongs = shuffleArr(wrongPool).slice(0, 3).map(c => c.back);
  const opts = shuffleArr([card.back, ...wrongs]);
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
  const btn = document.getElementById('audio-play');
  if (btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 1500); }
  speak(card.front);
}
function audioAnswer(btn, chosen, card) {
  if (audioLocked) return;
  audioLocked = true;
  card.seen++;
  const isCorrect = chosen === card.back;
  if (isCorrect) {
    card.correct++; sessionCorrect++; sessionStreakCorrect++;
    let gain = 10;
    if (sessionStreakCorrect >= 5) gain += 15;
    addXP(gain);
    btn.classList.add('correct');
    soundGood(); vibrate(20);
  } else {
    card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
    btn.classList.add('wrong');
    document.querySelectorAll('#audio-options .quiz-option').forEach(b => {
      if (b.textContent === card.back) b.classList.add('correct');
    });
    soundBad(); vibrate([30, 40, 30]);
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
   СКОРОСТНОЙ РЕЖИМ
   ============================================================ */
function startSpeedTimer() {
  clearInterval(speedTimer);
  speedTimeLeft = 60;
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
    speedDeck = shuffleArr(speedDeck);
    speedIndex = 0;
  }
  const card = speedDeck[speedIndex];
  if (!card) { finishSession(); return; }
  speedLocked = false;
  document.getElementById('speed-question').textContent = card.front;
  const wrongPool = speedDeck.filter(c => c.front !== card.front);
  const wrongs = shuffleArr(wrongPool).slice(0, 3).map(c => c.back);
  const opts = shuffleArr([card.back, ...wrongs]);
  const optsEl = document.getElementById('speed-options');
  optsEl.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.onclick = () => speedAnswer(btn, opt, card);
    optsEl.appendChild(btn);
  });
  document.getElementById('speed-score').textContent = `Счёт: ${speedScore}`;
}
function speedAnswer(btn, chosen, card) {
  if (speedLocked) return;
  speedLocked = true;
  card.seen++;
  const isCorrect = chosen === card.back;
  if (isCorrect) {
    card.correct++; sessionCorrect++; speedScore++; sessionStreakCorrect++;
    addXP(15);
    btn.classList.add('correct');
    soundGood(); vibrate(15);
  } else {
    card.wrong++; sessionWrong++; sessionStreakCorrect = 0;
    btn.classList.add('wrong');
    document.querySelectorAll('#speed-options .quiz-option').forEach(b => {
      if (b.textContent === card.back) b.classList.add('correct');
    });
    soundBad(); vibrate([30, 40, 30]);
  }
  card.lastSeen = Date.now();
  updateSRS(card, isCorrect);
  save();
  setTimeout(() => {
    speedIndex++;
    renderSpeedCard();
  }, 400);
}

/* ============================================================
   МИКС-ТРЕНИРОВКА
   ============================================================ */
function startMix() {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) return;
  const all = [];
  (lang.folders || []).forEach(f => f.cards.forEach(c => all.push({ ...c, _folder: f.name, _folderId: f.id })));
  (lang.lessons || []).forEach(ls => ls.cards.forEach(c => all.push({ ...c, _folder: ls.themeName, _lessonId: ls.id })));
  if (all.length < 3) { toast('Нужно минимум 3 слова во всём языке'); return; }
  resetSession();
  studyMode = 'mix';
  mixDeck = shuffleArr(all).slice(0, 20);
  mixIndex = 0;
  mixFlipped = false;
  document.getElementById('mix-title').textContent = `🌪 ${lang.emoji || ''} ${lang.name}`;
  showScreen('screen-mix');
  renderMixCard();
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
document.getElementById('mix-card').addEventListener('click', () => {
  mixFlipped = !mixFlipped; soundFlip(); renderMixCard();
});
function mixAnswer(correct) {
  const card = mixDeck[mixIndex];
  if (!card) return;
  const realCard = findCardInLang(card.front, card._folderId, card._lessonId);
  if (realCard) {
    realCard.seen++;
    if (correct) {
      realCard.correct++; sessionCorrect++; sessionStreakCorrect++;
      let gain = 10;
      if (sessionStreakCorrect >= 5) gain += 15;
      addXP(gain);
      soundGood(); vibrate(20);
    } else {
      realCard.wrong++; sessionWrong++; sessionStreakCorrect = 0;
      soundBad(); vibrate([30, 40, 30]);
    }
    realCard.lastSeen = Date.now();
    updateSRS(realCard, correct);
  }
  save();
  const cardEl = document.getElementById('mix-card');
  if (correct) cardEl.classList.add('good-anim');
  else cardEl.classList.add('bad-anim');
  setTimeout(() => {
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
   ПРОФИЛЬ
   ============================================================ */
function renderProfile() {
  const xp = data.settings.totalXP || 0;
  const lvl = getLevel(xp);
  const s = countStats();
  const unlocked = data.settings.achievements.length;
  const totalAch = ACHIEVEMENTS.length;
  const today = new Date().toDateString();
  const dailyCount = data.settings.dailyDate === today ? (data.settings.dailyCount || 0) : 0;
  const dailyGoal = data.settings.dailyGoal || 20;
  const dailyPct = Math.min(dailyCount / dailyGoal, 1);
  const circumference = 2 * Math.PI * 38;
  const offset = circumference * (1 - dailyPct);

  const el = document.getElementById('profile-content');
  el.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">🐧</div>
      <div class="profile-level">${lvl.level.name}</div>
      <div class="profile-title">${xp} XP всего</div>
      <div class="xp-bar"><div style="width:${Math.round(lvl.progress * 100)}%"></div></div>
      <div class="xp-text">${lvl.next.min === Infinity ? '🏆 Максимум!' : `${xp} / ${lvl.next.min} XP до след. уровня`}</div>
    </div>

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
        <div class="small">🔥 Streak: ${data.settings.streak || 0} дн.</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="num">${s.total}</div><div class="lbl">Всего слов</div></div>
      <div class="stat-card"><div class="num">${s.learned}</div><div class="lbl">Выучено</div></div>
      <div class="stat-card"><div class="num">${s.lessonsDone}</div><div class="lbl">Уроков тропы</div></div>
      <div class="stat-card"><div class="num">${unlocked}/${totalAch}</div><div class="lbl">Достижений</div></div>
    </div>

    <div class="section-title">Разделы</div>
    <div class="list-item" onclick="openAchievements()">
      <div class="info"><div class="title">🏆 Достижения</div>
      <div class="sub">${unlocked} из ${totalAch} разблокировано</div></div><div class="val">›</div>
    </div>
    <div class="list-item" onclick="openStats()">
      <div class="info"><div class="title">📊 Статистика</div>
      <div class="sub">Подробные цифры</div></div><div class="val">›</div>
    </div>
    <div class="list-item" onclick="openCalendar()">
      <div class="info"><div class="title">📅 Календарь занятий</div>
      <div class="sub">История за 90 дней</div></div><div class="val">›</div>
    </div>
    <div class="list-item" onclick="openSettings()">
      <div class="info"><div class="title">⚙️ Настройки</div>
      <div class="sub">SRS, цель, звук, данные</div></div><div class="val">›</div>
    </div>
  `;
}

/* ============================================================
   ДОСТИЖЕНИЯ
   ============================================================ */
function openAchievements() {
  const el = document.getElementById('achievements-content');
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
   СТАТИСТИКА
   ============================================================ */
function openStats() {
  const el = document.getElementById('stats-content');
  let totalCards = 0, totalSeen = 0, totalCorrect = 0, totalWrong = 0, learned = 0, starred = 0;
  data.langs.forEach(l => {
    (l.folders || []).forEach(f => f.cards.forEach(c => {
      totalCards++; totalSeen += c.seen || 0;
      totalCorrect += c.correct || 0; totalWrong += c.wrong || 0;
      if (c.correct > 0 && c.correct >= c.wrong) learned++;
      if (c.star) starred++;
    }));
    (l.lessons || []).forEach(ls => ls.cards.forEach(c => {
      totalCards++; totalSeen += c.seen || 0;
      totalCorrect += c.correct || 0; totalWrong += c.wrong || 0;
      if (c.correct > 0 && c.correct >= c.wrong) learned++;
      if (c.star) starred++;
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
      <div class="stat-card"><div class="num">${totalCards}</div><div class="lbl">Всего слов</div></div>
      <div class="stat-card"><div class="num">${learned}</div><div class="lbl">Знаю хорошо</div></div>
      <div class="stat-card"><div class="num">${totalSeen}</div><div class="lbl">Показов</div></div>
      <div class="stat-card"><div class="num">${accuracy}%</div><div class="lbl">Точность</div></div>
      <div class="stat-card"><div class="num">${starred}</div><div class="lbl">⭐ Избранных</div></div>
      <div class="stat-card"><div class="num">${data.settings.totalXP || 0}</div><div class="lbl">Всего XP</div></div>
    </div>
    <div class="section-title">По языкам</div>
    ${data.langs.map(l => {
      const st = langStats(l);
      return `<div class="list-item"><div class="info">
        <div class="title">${l.emoji || '🌍'} ${esc(l.name)}</div>
        <div class="sub">${st.lessonsDone} / ${st.lessonsTotal} уроков · ${st.total} слов · ${st.pct}%</div>
        <div class="stat-bar"><div style="width:${st.pct}%"></div></div></div></div>`;
    }).join('') || '<div class="empty">Пока нет данных</div>'}
    ${studiedToday
      ? '<div class="empty" style="color:var(--good)">✓ Сегодня уже занимались — так держать!</div>'
      : '<div class="empty" style="color:var(--warn)">⚠ Сегодня ещё не занимались</div>'}
  `;
  showScreen('screen-stats');
}

/* ============================================================
   КАЛЕНДАРЬ
   ============================================================ */
function openCalendar() {
  const el = document.getElementById('stats-content');
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
    const key = d.toISOString().slice(0,10);
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
   НАСТРОЙКИ
   ============================================================ */
function openSettings() {
  document.getElementById('sound-toggle').checked = data.settings.sound;
  document.getElementById('vibe-toggle').checked = data.settings.vibe;
  document.getElementById('srs-toggle').checked = data.settings.srs;
  document.getElementById('daily-goal-val').textContent = (data.settings.dailyGoal || 20) + ' слов';
  showScreen('screen-settings');
}
function toggleSound() { data.settings.sound = document.getElementById('sound-toggle').checked; save(); }
function toggleVibe() { data.settings.vibe = document.getElementById('vibe-toggle').checked; save(); }
function toggleSRS() {
  data.settings.srs = document.getElementById('srs-toggle').checked;
  save();
  toast(data.settings.srs ? '🧠 SRS включён' : '🧠 SRS выключен');
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
        ls.cards.forEach(c => { c.seen = 0; c.correct = 0; c.wrong = 0; c.srsNext = null; c.srsLevel = 0; });
      }));
      save(); toast('🌳 Прогресс тропы сброшен');
    });
}

/* ============================================================
   ИМПОРТ CSV
   ============================================================ */
function openImportCSV() {
  document.getElementById('csv-name').value = '';
  openModal('modal-csv');
}
function handleCSV(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const text = ev.target.result;
      const cards = parseCSV(text);
      if (!cards.length) { toast('Не удалось распознать строки'); e.target.value = ''; return; }
      const lang = data.langs.find(l => l.id === currentLangId);
      if (!lang) { toast('Сначала выбери язык'); e.target.value = ''; return; }
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const customName = document.getElementById('csv-name').value.trim();
      const folderName = customName || `📥 ${baseName} (${cards.length})`;
      if (!lang.folders) lang.folders = [];
      lang.folders.push({ id: uid(), name: folderName, cards });
      save();
      closeModal('modal-csv');
      toast(`📥 Загружено: ${cards.length} слов`);
      switchTab('mine');
      renderMineList();
      checkAchievements();
    } catch(err) {
      console.error(err);
      toast('Ошибка чтения файла');
    }
    e.target.value = '';
  };
  reader.readAsText(file, 'UTF-8');
}
function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const cards = [];
  for (const line of lines) {
    // пропускаем заголовки
    if (/^(word|слово|front|оригинал)[,;\t]/i.test(line)) continue;
    let parts = null;
    if (line.includes('\t')) parts = line.split('\t');
    else if (line.includes(' | ')) parts = line.split(' | ');
    else if (line.includes(';')) parts = line.split(';');
    else if (line.includes(',')) parts = parseCSVLine(line, ',');
    else if (line.includes('|')) parts = line.split('|');
    else if (line.includes(' — ')) parts = line.split(' — ');
    if (!parts || parts.length < 2) continue;
    const front = stripQuotes(parts[0].trim());
    const back = stripQuotes(parts.slice(1).join(' ').trim());
    if (front && back) cards.push(makeCard(front, back));
  }
  return cards;
}
function parseCSVLine(line, sep) {
  // Простой парсер с учётом кавычек
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === sep && !inQ) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}
function stripQuotes(s) { return s.replace(/^["']|["']$/g, ''); }

/* ============================================================
   ЭКСПОРТ / ИМПОРТ БЭКАПА
   ============================================================ */
function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cards-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('💾 Файл сохранён');
}
function importData(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!imported.langs) throw new Error('bad format');
      confirmDialog('Импортировать?', 'Текущие данные будут заменены.', () => {
        data = imported;
        const def = defaultData();
        data.settings = Object.assign(def.settings, data.settings || {});
        data.langs.forEach(l => {
          if (!l.lessons) l.lessons = [];
          if (!l.folders) l.folders = [];
          l.lessons.forEach(ls => ls.cards.forEach(c => normalizeCard(c)));
          l.folders.forEach(f => f.cards.forEach(c => normalizeCard(c)));
        });
        save(); renderLangs(); toast('📥 Импортировано');
      });
    } catch(err) { toast('Ошибка чтения файла'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}
function resetStats() {
  confirmDialog('Сбросить статистику?',
    'Прогресс по всем словам, XP, достижения и streak обнулятся.',
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
      });
      data.settings.totalXP = 0;
      data.settings.achievements = [];
      data.settings.streak = 0;
      data.settings.dailyCount = 0;
      data.settings.studyHistory = {};
      save(); toast('📊 Статистика сброшена');
    });
}
function resetAll() {
  confirmDialog('Удалить ВСЕ данные?',
    'Языки, слова, XP, достижения — всё удалится. Это необратимо.',
    () => {
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(OLD_KEY);
      data = defaultData();
      save(); goLangs(); toast('⚠️ Всё удалено');
    });
}
