/* ============================================================
   Penguin — фразы маскота
   Контексты:
   - morning: утро, начало дня
   - day: днём
   - evening: вечер
   - trail: общие мотивационные для тропы
   - streak: когда есть streak
   - noStreak: streak потерян
   - win: победа (90%+)
   - good: хорошо (70-89%)
   - ok: средне (50-69%)
   - fail: плохо (<50%) — подколка, но добрая
   - empty: нет языков / пусто
   - comeback: возвращение после пропуска
   ============================================================ */

const PENGUIN_PHRASES = {
  morning: [
    "Доброе утро! 🐧 Пока все спят — мы учимся.",
    "Утро в Антарктиде — лучшее время для карточек!",
    "Холодно? Зато слова согревают! 🧊",
    "Пингвины встают рано. И ты молодец!",
    "Чашка чая + 5 минут учёбы = идеальное утро ☕"
  ],
  day: [
    "5 минут в день — и ты полиглот! 🐧",
    "Пингвины не сдаются. И ты не сдавайся!",
    "Сделай один урок прямо сейчас. Потом спасибо скажешь.",
    "Слова сами не запомнятся 😉",
    "Лёд тронулся? Тогда за карточки!",
    "Ты сегодня уже занимался? Я подожду..."
  ],
  evening: [
    "Вечер — время повторить слова 🐧",
    "Перед сном мозг запоминает лучше!",
    "Пара карточек перед сном — и спи спокойно 🌙",
    "Пингвины засыпают сытыми. А ты — умными словами."
  ],
  trail: [
    "Готов к новому дню? 🐧",
    "Твоя тропа ждёт!",
    "Вперёд, к новым словам!",
    "Пингвин верит в тебя!",
    "Каждый урок — шаг к цели.",
    "Ты сильнее, чем думаешь 🧊",
    "Не спеши. Главное — не останавливаться."
  ],
  streak: [
    "🔥 Streak горит! Не дай ему погаснуть!",
    "Ты в ударе! Так держать!",
    "Пингвин гордится тобой 🐧❤️",
    "Серия растёт! Продолжай!"
  ],
  noStreak: [
    "Ничего страшного. Начнём заново! 🐧",
    "Даже пингвины иногда падают на лёд. Вставай!",
    "Streak потерян — но не мотивация.",
    "С сегодняшнего дня — новая серия!"
  ],
  win: [
    "🏆 Идеально! Ты космос!",
    "🐧 Пингвин аплодирует!",
    "Вау! Так держать!",
    "Идеальный результат! 🎉",
    "Ты просто ледяной! 🧊"
  ],
  good: [
    "🎉 Отличный результат!",
    "Пингвин доволен! 🐧",
    "Хорошо идёшь! Продолжай!",
    "Ещё немного — и будет идеально!"
  ],
  ok: [
    "👍 Неплохо! Но пингвин знает, ты можешь лучше.",
    "Средний результат. Повторим?",
    "🐧 Кивок одобрения. Но давай ещё разок.",
    "Половина пути — уже хорошо!"
  ],
  fail: [
    "🧊 Пингвин поскользнулся. Бывает! Попробуй ещё.",
    "Не расстраивайся. Сложные слова — самые ценные!",
    "🐧 Пингвин хихикает, но не злится. Давай ещё раз!",
    "Ошибки — это нормально. Главное — не сдаваться.",
    "Лёд иногда трещит. Но пингвин идёт дальше!",
    "Может, отдохнём и повторим? 🐧"
  ],
  empty: [
    "🐧 Тут пока пусто. Добавь первый язык!",
    "Пингвин ждёт слова! Начнём?",
    "Пустая тропа... Добавим первый урок?",
    "Начни с малого — добавь один язык 🐧"
  ],
  comeback: [
    "🐧 Ты вернулся! Пингвин скучал!",
    "Давно не виделись! Начнём заново?",
    "Пингвин всё простил. Погнали!",
    "Возвращение — уже победа! 🏆"
  ]
};

/* ---------- ВЫБОР ФРАЗЫ ---------- */
function pickPenguin(context, noRepeat = true) {
  const pool = PENGUIN_PHRASES[context] || PENGUIN_PHRASES.trail;
  if (!pool || !pool.length) return '🐧';
  const last = localStorage.getItem('penguin_last_' + context);
  let idx = Math.floor(Math.random() * pool.length);
  if (noRepeat && pool.length > 1) {
    let tries = 0;
    while (pool[idx] === last && tries < 10) {
      idx = Math.floor(Math.random() * pool.length);
      tries++;
    }
  }
  const phrase = pool[idx];
  localStorage.setItem('penguin_last_' + context, phrase);
  return phrase;
}

/* ---------- КОНТЕКСТ ПО ВРЕМЕНИ ---------- */
function timeContext() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'day';
  return 'evening';
}

/* ---------- УМНЫЙ ВЫБОР ДЛЯ ТРОПЫ ---------- */
function penguinForTrail() {
  const streak = (typeof data !== 'undefined' && data.settings?.streak) || 0;
  const lastStudy = (typeof data !== 'undefined' && data.settings?.lastStudyDate) || null;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Возвращение после пропуска
  if (lastStudy && lastStudy !== today && lastStudy !== yesterday) {
    return pickPenguin('comeback');
  }
  // Streak есть и активен
  if (streak > 0 && lastStudy === today) {
    return pickPenguin('streak');
  }
  // Streak был, но потерян
  if (streak === 0 && lastStudy && lastStudy !== today) {
    return pickPenguin('noStreak');
  }
  // Иначе по времени дня
  return pickPenguin(timeContext());
}

/* ---------- ВЫБОР ДЛЯ ФИНАЛА ---------- */
function penguinForFinish(pct) {
  if (pct >= 90) return pickPenguin('win');
  if (pct >= 70) return pickPenguin('good');
  if (pct >= 50) return pickPenguin('ok');
  return pickPenguin('fail');
}

/* ---------- ЭМОДЗИ ДЛЯ ФИНАЛА ---------- */
function finishEmoji(pct) {
  if (pct >= 90) return '🏆';
  if (pct >= 70) return '🐧';
  if (pct >= 50) return '👍';
  return '🧊';
}
