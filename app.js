/* ============================================================
   Cards App v4.0
   Режимы: classic / quiz / match
   ============================================================ */

const STORE_KEY = 'cards_app_data_v4';

function defaultData() {
  return {
    langs: [],
    settings: { sound: true, vibe: true, lastStudyDate: null, streak: 0 }
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem('cards_app_data_v3');
    if (raw) {
      const d = JSON.parse(raw);
      if (!d.settings) d.settings = defaultData().settings;
      if (!d.settings.streak) d.settings.streak = 0;
      d.langs.forEach(l => l.folders.forEach(f => {
        f.cards.forEach(c => {
          if (c.seen === undefined) c.seen = 0;
          if (c.correct === undefined) c.correct = 0;
          if (c.wrong === undefined) c.wrong = 0;
          if (c.star === undefined) c.star = false;
        });
      }));
      return d;
    }
  } catch(e) {}
  return defaultData();
}

let data = load();
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ---------- СОСТОЯНИЕ ---------- */
let currentLangId = null;
let currentFolderId = null;
let studyMode = 'classic';
let studyDeck = [];
let studyIndex = 0;
let studyFlipped = false;
let sessionCorrect = 0;
let sessionWrong = 0;
let quizOptions = [];
let quizLocked = false;
let matchPairs = [];
let matchSelectedLeft = null;
let matchSelectedRight = null;
let matchBatch = 5;
let matchOffset = 0;

/* ---------- НАВИГАЦИЯ ---------- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function goLangs() { currentLangId = null; currentFolderId = null; renderLangs(); showScreen('screen-langs'); }
function goFolders() { currentFolderId = null; renderFolders(); showScreen('screen-folders'); }
function goCards() { renderCards(); showScreen('screen-cards'); }

/* ---------- ЗВУКИ ---------- */
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

/* ---------- ЭМОДЗИ ЯЗЫКОВ ---------- */
const FLAGS = [
  [/(испан|span|españ)/i, '🇪🇸'],
  [/(англ|engl|ingl)/i, '🇬🇧'],
  [/(нем|german|deut)/i, '🇩🇪'],
  [/(рус|russ)/i, '🇷🇺'],
  [/(фран|fran)/i, '🇫🇷'],
  [/(итал|ital)/i, '🇮🇹'],
  [/(китай|chin|mand)/i, '🇨🇳'],
  [/(япон|japan)/i, '🇯🇵'],
  [/(коре|kore)/i, '🇰🇷'],
  [/(порт|port)/i, '🇵🇹'],
  [/(араб|arab)/i, '🇸🇦'],
  [/(тур|turk)/i, '🇹🇷'],
];
function langEmoji(name) {
  for (const [re, emoji] of FLAGS) if (re.test(name)) return emoji;
  return '🌍';
}

/* ---------- ЯЗЫКИ ---------- */
function renderLangs() {
  const el = document.getElementById('langs-list'); el.innerHTML = '';
  if (!data.langs.length) {
    el.innerHTML = '<div class="empty">Пока нет языков.<br>Нажмите «+ Добавить язык».</div>';
    return;
  }
  data.langs.forEach(lang => {
    const count = lang.folders.reduce((s,f) => s + f.cards.length, 0);
    const learned = lang.folders.reduce((s,f) =>
      s + f.cards.filter(c => c.correct > 0 && c.correct >= c.wrong).length, 0);
    const pct = count ? Math.round(learned / count * 100) : 0;
    const div = document.createElement('div'); div.className = 'list-item';
    div.innerHTML = `<div class="info">
        <div class="title">${langEmoji(lang.name)} ${esc(lang.name)}</div>
        <div class="sub">${lang.folders.length} папок · ${count} слов · ${pct}% выучено</div>
        <div class="stat-bar"><div style="width:${pct}%"></div></div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); confirmDeleteLang('${lang.id}')">✕</span>`;
    div.onclick = () => {
      currentLangId = lang.id;
      document.getElementById('folders-title').textContent = langEmoji(lang.name) + ' ' + lang.name;
      goFolders();
    };
    el.appendChild(div);
  });
}
function openAddLang() {
  document.getElementById('lang-input').value = '';
  openModal('modal-lang');
  setTimeout(() => document.getElementById('lang-input').focus(), 150);
}
function saveLang() {
  const name = document.getElementById('lang-input').value.trim();
  if (!name) return;
  data.langs.push({ id: uid(), name, folders: [] });
  save(); closeModal('modal-lang'); renderLangs();
}
function confirmDeleteLang(id) {
  confirmDialog('Удалить язык?', 'Все папки и слова внутри тоже удалятся.', () => {
    data.langs = data.langs.filter(l => l.id !== id);
    save(); renderLangs();
  });
}

/* ---------- ПАПКИ ---------- */
function renderFolders() {
  const lang = data.langs.find(l => l.id === currentLangId);
  if (!lang) { goLangs(); return; }
  const el = document.getElementById('folders-list'); el.innerHTML = '';
  if (!lang.folders.length) {
    el.innerHTML = '<div class="empty">Нет папок. Создайте первую!</div>';
    return;
  }
  lang.folders.forEach(folder => {
    const total = folder.cards.length;
    const learned = folder.cards.filter(c => c.correct > 0 && c.correct >= c.wrong).length;
    const pct = total ? Math.round(learned / total * 100) : 0;
    const div = document.createElement('div'); div.className = 'list-item';
    div.innerHTML = `<div class="info">
        <div class="title">${esc(folder.name)}</div>
        <div class="sub">${total} слов · ${pct}% выучено</div>
        <div class="stat-bar"><div style="width:${pct}%"></div></div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); confirmDeleteFolder('${folder.id}')">✕</span>`;
    div.onclick = () => {
      currentFolderId = folder.id;
      document.getElementById('cards-title').textContent = folder.name;
      goCards();
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
  lang.folders.push({ id: uid(), name, cards: [] });
  save(); closeModal('modal-folder'); renderFolders();
}
function confirmDeleteFolder(id) {
  confirmDialog('Удалить папку?', 'Все слова внутри тоже удалятся.', () => {
    const lang = data.langs.find(l => l.id === currentLangId);
    lang.folders = lang.folders.filter(f => f.id !== id);
    save(); renderFolders();
  });
}

/* ---------- КАРТОЧКИ ---------- */
function renderCards() {
  const lang = data.langs.find(l => l.id === currentLangId);
  const folder = lang.folders.find(f => f.id === currentFolderId);
  if (!folder) { goFolders(); return; }
  const el = document.getElementById('cards-list'); el.innerHTML = '';
  if (!folder.cards.length) {
    el.innerHTML = '<div class="empty">Пока нет слов.<br>Нажмите «Текст», чтобы добавить.</div>';
    return;
  }
  folder.cards.forEach((c, i) => {
    const learned = c.correct > 0 && c.correct >= c.wrong;
    const badge = c.seen === 0 ? '<span class="badge">новое</span>' :
                  learned ? '<span class="badge ok">выучено</span>' :
                  '<span class="badge bad">учить</span>';
    const div = document.createElement('div'); div.className = 'list-item';
    div.innerHTML = `<div class="info">
        <div class="title">${c.star ? '⭐ ' : ''}${esc(c.front)} ${badge}</div>
        <div class="sub">${esc(c.back)}</div>
      </div>
      <span class="delete-x" onclick="event.stopPropagation(); deleteCard(${i})">✕</span>`;
    el.appendChild(div);
  });
}
function deleteCard(idx) {
  const lang = data.langs.find(l => l.id === currentLangId);
  const folder = lang.folders.find(f => f.id === currentFolderId);
  folder.cards.splice(idx, 1); save(); renderCards();
}

/* ---------- МАССОВЫЙ ВВОД ---------- */
function openBulkAdd() {
  const lang = data.langs.find(l => l.id === currentLangId);
  const folder = lang.folders.find(f => f.id === currentFolderId);
  document.getElementById('bulk-input').value = folder.cards.map(c => `${c.front} | ${c.back}`).join('\n');
  openModal('modal-bulk');
}
function parseBulk(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean); const cards = [];
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
    const front = parts[0].trim(); const back = parts.slice(1).join(' ').trim();
    if (front && back) cards.push({ front, back, seen: 0, correct: 0, wrong: 0, star: false });
  }
  return cards;
}
function addBulk() {
  const text = document.getElementById('bulk-input').value;
  const newCards = parseBulk(text);
  if (!newCards.length) { toast('Не удалось распознать строки'); return; }
  const lang = data.langs.find(l => l.id === currentLangId);
  const folder = lang.folders.find(f => f.id === currentFolderId);
  const existing = new Set(folder.cards.map(c => c.front.toLowerCase()));
  let added = 0;
  for (const c of newCards) {
    if (!existing.has(c.front.toLowerCase())) { folder.cards.push(c); added++; }
  }
  save(); closeModal('modal-bulk'); renderCards(); toast(`Добавлено: ${added}`);
}
function replaceBulk() {
  confirmDialog('Заменить всё?', 'Все текущие слова будут удалены.', () => {
    const text = document.getElementById('bulk-input').value;
    const newCards = parseBulk(text);
    const lang = data.langs.find(l => l.id === currentLangId);
    const folder = lang.folders.find(f => f.id === currentFolderId);
    folder.cards = newCards;
    save(); closeModal('modal-bulk'); renderCards(); toast(`Заменено: ${newCards.length}`);
  });
}

/* ---------- ВЫБОР РЕЖИМА ---------- */
function openModePicker() {
  const lang = data.langs.find(l => l.id === currentLangId);
  const folder = lang.folders.find(f => f.id === currentFolderId);
  if (!folder.cards.length) { toast('Нет слов для изучения'); return; }
  showScreen('screen-modes');
}

/* ---------- ЗАПУСК УЧЁБЫ ---------- */
function startStudy(mode, onlyUnlearned) {
  const lang = data.langs.find(l => l.id === currentLangId);
  const folder = lang.folders.find(f => f.id === currentFolderId);
  let deck = [...folder.cards];
  if (onlyUnlearned) deck = deck.filter(c => !(c.correct > 0 && c.correct >= c.wrong));
  if (!deck.length) { toast('Нет слов для изучения'); return; }
  studyMode = mode;
  studyDeck = deck;
  studyIndex = 0;
  studyFlipped = false;
  sessionCorrect = 0;
  sessionWrong = 0;
  quizLocked = false;
  matchSelectedLeft = null;
  matchSelectedRight = null;
  matchOffset = 0;

  if (mode === 'classic') {
    document.getElementById('study-title').textContent = folder.name;
    showScreen('screen-study');
    renderStudyCard();
  } else if (mode === 'quiz') {
    if (studyDeck.length < 2) { toast('Нужно минимум 2 слова'); return; }
    document.getElementById('quiz-title').textContent = folder.name;
    showScreen('screen-quiz');
    renderQuizCard();
  } else if (mode === 'match') {
    if (studyDeck.length < 3) { toast('Нужно минимум 3 слова'); return; }
    document.getElementById('match-title').textContent = folder.name;
    showScreen('screen-match');
    renderMatchBatch();
  }
}

/* ============================================================
   РЕЖИМ 1: КЛАССИЧЕСКИЕ КАРТОЧКИ
   ============================================================ */
function renderStudyCard() {
  const card = studyDeck[studyIndex];
  if (!card) return;
  const cardEl = document.getElementById('card');
  cardEl.classList.remove('fly-left', 'fly-right', 'good-anim', 'bad-anim');
  cardEl.style.transform = '';
  cardEl.style.opacity = '1';
  cardEl.classList.toggle('flipped', studyFlipped);
  document.getElementById('card-word').textContent = studyFlipped ? card.back : card.front;
  document.getElementById('card-hint').textContent = studyFlipped ? 'Нажмите, чтобы вернуть' : 'Нажмите, чтобы перевернуть';
  document.getElementById('study-progress').textContent = `${studyIndex + 1} / ${studyDeck.length}`;
  document.getElementById('study-session').textContent = `✓ ${sessionCorrect} · ✗ ${sessionWrong}`;
  document.getElementById('progress-fill').style.width = `${(studyIndex / studyDeck.length) * 100}%`;
  const starBtn = document.getElementById('star-btn');
  starBtn.textContent = card.star ? '★' : '☆';
  starBtn.style.color = card.star ? 'var(--star)' : '';
}
function toggleStar() {
  const card = studyDeck[studyIndex]; if (!card) return;
  card.star = !card.star; save(); renderStudyCard(); soundFlip();
}
function answer(correct) {
  const card = studyDeck[studyIndex]; if (!card) return;
  card.seen++;
  if (correct) { card.correct++; sessionCorrect++; soundGood(); vibrate(20); }
  else { card.wrong++; sessionWrong++; soundBad(); vibrate([30, 40, 30]); }
  card.lastSeen = Date.now();
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
  if (studyIndex >= studyDeck.length) {
    markStudyDay();
    finishSession();
    return;
  }
  studyFlipped = false;
  renderStudyCard();
}
function shuffleDeck() {
  for (let i = studyDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [studyDeck[i], studyDeck[j]] = [studyDeck[j], studyDeck[i]];
  }
  studyIndex = 0; studyFlipped = false; renderStudyCard(); toast('Перемешано');
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
   РЕЖИМ 2: БЫСТРЫЙ ТЕСТ
   ============================================================ */
function renderQuizCard() {
  const card = studyDeck[studyIndex];
  if (!card) { markStudyDay(); finishSession(); return; }
  quizLocked = false;
  document.getElementById('quiz-question').textContent = card.front;
  const wrongPool = studyDeck.filter(c => c.front !== card.front);
  const wrongs = shuffleArr(wrongPool).slice(0, 3).map(c => c.back);
  const opts = shuffleArr([card.back, ...wrongs]);
  quizOptions = opts;
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
}
function quizAnswer(btn, chosen, card) {
  if (quizLocked) return;
  quizLocked = true;
  card.seen++;
  if (chosen === card.back) {
    card.correct++; sessionCorrect++;
    btn.classList.add('correct');
    soundGood(); vibrate(20);
  } else {
    card.wrong++; sessionWrong++;
    btn.classList.add('wrong');
    document.querySelectorAll('.quiz-option').forEach(b => {
      if (b.textContent === card.back) b.classList.add('correct');
    });
    soundBad(); vibrate([30, 40, 30]);
  }
  card.lastSeen = Date.now();
  save();
  setTimeout(() => {
    studyIndex++;
    if (studyIndex >= studyDeck.length) { markStudyDay(); finishSession(); return; }
    renderQuizCard();
  }, 900);
}

/* ============================================================
   РЕЖИМ 3: СОПОСТАВЛЕНИЕ
   ============================================================ */
function renderMatchBatch() {
  matchSelectedLeft = null;
  matchSelectedRight = null;
  const batch = studyDeck.slice(matchOffset, matchOffset + matchBatch);
  if (!batch.length) { markStudyDay(); finishSession(); return; }
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
        card.correct++; sessionCorrect++;
        soundGood(); vibrate(20);
      } else {
        card.wrong++; sessionWrong++;
        soundBad(); vibrate([30, 40, 30]);
      }
      card.lastSeen = Date.now();
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
   ЗАВЕРШЕНИЕ УРОКА
   ============================================================ */
let lastLesson = null;
function finishSession() {
  lastLesson = {
    mode: studyMode,
    langId: currentLangId,
    folderId: currentFolderId,
    onlyUnlearned: false
  };
  const total = sessionCorrect + sessionWrong;
  const pct = total ? Math.round(sessionCorrect / total * 100) : 0;
  document.getElementById('finish-correct').textContent = sessionCorrect;
  document.getElementById('finish-wrong').textContent = sessionWrong;
  document.getElementById('finish-pct').textContent = pct + '%';
  const emojiEl = document.getElementById('finish-emoji');
  if (pct >= 90) emojiEl.textContent = '🏆';
  else if (pct >= 70) emojiEl.textContent = '🎉';
  else if (pct >= 50) emojiEl.textContent = '👍';
  else emojiEl.textContent = '💪';
  showScreen('screen-finish');
  soundFinish();
  vibrate([50, 50, 100]);
  startConfetti();
}
function repeatLesson() {
  if (!lastLesson) { goCards(); return; }
  currentLangId = lastLesson.langId;
  currentFolderId = lastLesson.folderId;
  startStudy(lastLesson.mode, false);
}

/* Конфетти */
function startConfetti() {
  const colors = ['#ff3b30','#ff9500','#ffcc00','#34c759','#007aff','#5856d6','#ff2d92'];
  const count = 60;
  for (let i = 0; i < count; i++) {
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

/* ---------- STREAK ---------- */
function markStudyDay() {
  const today = new Date().toDateString();
  const last = data.settings.lastStudyDate;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === yesterday) data.settings.streak = (data.settings.streak || 0) + 1;
  else data.settings.streak = 1;
  data.settings.lastStudyDate = today;
  save();
}

/* ============================================================
   СТАТИСТИКА
   ============================================================ */
function openStats() {
  const el = document.getElementById('stats-content');
  let totalCards = 0, totalSeen = 0, totalCorrect = 0, totalWrong = 0, learned = 0, starred = 0;
  data.langs.forEach(l => l.folders.forEach(f => f.cards.forEach(c => {
    totalCards++; totalSeen += c.seen || 0;
    totalCorrect += c.correct || 0; totalWrong += c.wrong || 0;
    if (c.correct > 0 && c.correct >= c.wrong) learned++;
    if (c.star) starred++;
  })));
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
    </div>
    <div class="section-title">По языкам</div>
    ${data.langs.map(l => {
      const lTotal = l.folders.reduce((s,f) => s + f.cards.length, 0);
      const lLearned = l.folders.reduce((s,f) => s + f.cards.filter(c => c.correct > 0 && c.correct >= c.wrong).length, 0);
      const lPct = lTotal ? Math.round(lLearned / lTotal * 100) : 0;
      return `<div class="list-item"><div class="info">
        <div class="title">${langEmoji(l.name)} ${esc(l.name)}</div>
        <div class="sub">${lLearned} / ${lTotal} · ${lPct}%</div>
        <div class="stat-bar"><div style="width:${lPct}%"></div></div></div></div>`;
    }).join('') || '<div class="empty">Пока нет данных</div>'}
    ${studiedToday
      ? '<div class="empty" style="color:var(--good)">✓ Сегодня уже занимались — так держать!</div>'
      : '<div class="empty" style="color:var(--warn)">⚠ Сегодня ещё не занимались</div>'}
  `;
  showScreen('screen-stats');
}

/* ---------- НАСТРОЙКИ ---------- */
function openSettings() {
  document.getElementById('sound-toggle').checked = data.settings.sound;
  document.getElementById('vibe-toggle').checked = data.settings.vibe;
  showScreen('screen-settings');
}
function toggleSound() { data.settings.sound = document.getElementById('sound-toggle').checked; save(); }
function toggleVibe() { data.settings.vibe = document.getElementById('vibe-toggle').checked; save(); }

/* ---------- ЭКСПОРТ/ИМПОРТ ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `cards-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url); toast('Файл сохранён');
}
function importData(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!imported.langs) throw new Error('bad format');
      confirmDialog('Импортировать?', 'Текущие данные будут заменены.', () => {
        data = imported;
        if (!data.settings) data.settings = defaultData().settings;
        save(); renderLangs(); toast('Импортировано');
      });
    } catch(err) { toast('Ошибка чтения файла'); }
  };
  reader.readAsText(file); e.target.value = '';
}
function resetStats() {
  confirmDialog('Сбросить статистику?', 'Прогресс по всем словам обнулится.', () => {
    data.langs.forEach(l => l.folders.forEach(f => f.cards.forEach(c => {
      c.seen = 0; c.correct = 0; c.wrong = 0; c.lastSeen = null;
    })));
    save(); toast('Статистика сброшена');
  });
}
function resetAll() {
  confirmDialog('Удалить ВСЕ данные?', 'Языки, папки и слова будут удалены. Это необратимо.', () => {
    localStorage.removeItem(STORE_KEY);
    data = defaultData();
    save(); goLangs(); toast('Всё удалено');
  });
}

/* ---------- УТИЛИТЫ ---------- */
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
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
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

/* ---------- ИНИЦИАЛИЗАЦИЯ ---------- */
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
