/* ============================================================
   Built-in Themes — 5 языков × 8 тем × 15 слов = ~600 карточек
   Формат карточки: [слово, перевод]
   ============================================================ */

const BUILTIN_THEMES = {
  spanish: {
    name: 'Испанский',
    emoji: '🇪🇸',
    themes: [
      { name: 'Приветствия', emoji: '👋', cards: [
        ['hola', 'привет'], ['adiós', 'пока'], ['buenos días', 'доброе утро'],
        ['buenas tardes', 'добрый день'], ['buenas noches', 'доброй ночи'],
        ['gracias', 'спасибо'], ['por favor', 'пожалуйста'], ['perdón', 'извините'],
        ['¿cómo estás?', 'как дела?'], ['muy bien', 'очень хорошо'],
        ['¿qué tal?', 'как оно?'], ['hasta luego', 'до встречи'],
        ['bienvenido', 'добро пожаловать'], ['salud', 'здоровье / будь здоров'],
        ['nos vemos', 'увидимся']
      ]},
      { name: 'Числа', emoji: '🔢', cards: [
        ['uno', 'один'], ['dos', 'два'], ['tres', 'три'], ['cuatro', 'четыре'],
        ['cinco', 'пять'], ['seis', 'шесть'], ['siete', 'семь'], ['ocho', 'восемь'],
        ['nueve', 'девять'], ['diez', 'десять'], ['once', 'одиннадцать'],
        ['doce', 'двенадцать'], ['veinte', 'двадцать'], ['cien', 'сто'],
        ['mil', 'тысяча']
      ]},
      { name: 'Цвета', emoji: '🎨', cards: [
        ['rojo', 'красный'], ['azul', 'синий'], ['verde', 'зелёный'],
        ['amarillo', 'жёлтый'], ['negro', 'чёрный'], ['blanco', 'белый'],
        ['gris', 'серый'], ['naranja', 'оранжевый'], ['rosa', 'розовый'],
        ['morado', 'фиолетовый'], ['marrón', 'коричневый'], ['dorado', 'золотой'],
        ['plateado', 'серебряный'], ['claro', 'светлый'], ['oscuro', 'тёмный']
      ]},
      { name: 'Еда', emoji: '🍕', cards: [
        ['pan', 'хлеб'], ['agua', 'вода'], ['leche', 'молоко'], ['café', 'кофе'],
        ['té', 'чай'], ['manzana', 'яблоко'], ['naranja', 'апельсин'],
        ['plátano', 'банан'], ['carne', 'мясо'], ['pescado', 'рыба'],
        ['arroz', 'рис'], ['huevo', 'яйцо'], ['queso', 'сыр'],
        ['fruta', 'фрукт'], ['verdura', 'овощ']
      ]},
      { name: 'Животные', emoji: '🐶', cards: [
        ['perro', 'собака'], ['gato', 'кошка'], ['pájaro', 'птица'],
        ['caballo', 'лошадь'], ['vaca', 'корова'], ['cerdo', 'свинья'],
        ['oveja', 'овца'], ['pez', 'рыба'], ['ratón', 'мышь'],
        ['oso', 'медведь'], ['lobo', 'волк'], ['zorro', 'лиса'],
        ['conejo', 'кролик'], ['león', 'лев'], ['tigre', 'тигр']
      ]},
      { name: 'Семья', emoji: '👨‍👩‍👧', cards: [
        ['madre', 'мать'], ['padre', 'отец'], ['hijo', 'сын'], ['hija', 'дочь'],
        ['hermano', 'брат'], ['hermana', 'сестра'], ['abuelo', 'дедушка'],
        ['abuela', 'бабушка'], ['tío', 'дядя'], ['tía', 'тётя'],
        ['primo', 'двоюродный брат'], ['esposo', 'муж'], ['esposa', 'жена'],
        ['familia', 'семья'], ['bebé', 'малыш']
      ]},
      { name: 'Дом', emoji: '🏠', cards: [
        ['casa', 'дом'], ['puerta', 'дверь'], ['ventana', 'окно'],
        ['mesa', 'стол'], ['silla', 'стул'], ['cama', 'кровать'],
        ['cocina', 'кухня'], ['baño', 'ванная'], ['habitación', 'комната'],
        ['sala', 'гостиная'], ['pared', 'стена'], ['suelo', 'пол'],
        ['techo', 'потолок'], ['lámpara', 'лампа'], ['espejo', 'зеркало']
      ]},
      { name: 'Глаголы', emoji: '⚡', cards: [
        ['ser', 'быть'], ['estar', 'находиться'], ['tener', 'иметь'],
        ['hacer', 'делать'], ['ir', 'идти'], ['venir', 'приходить'],
        ['ver', 'видеть'], ['comer', 'есть'], ['beber', 'пить'],
        ['hablar', 'говорить'], ['leer', 'читать'], ['escribir', 'писать'],
        ['dormir', 'спать'], ['querer', 'хотеть'], ['poder', 'мочь']
      ]}
    ]
  },

  english: {
    name: 'Английский',
    emoji: '🇬🇧',
    themes: [
      { name: 'Greetings / Приветствия', emoji: '👋', cards: [
        ['hello', 'привет'], ['goodbye', 'пока'], ['good morning', 'доброе утро'],
        ['good afternoon', 'добрый день'], ['good night', 'доброй ночи'],
        ['thank you', 'спасибо'], ['please', 'пожалуйста'], ['sorry', 'извините'],
        ['how are you?', 'как дела?'], ['very well', 'очень хорошо'],
        ['what\'s up?', 'как оно?'], ['see you later', 'до встречи'],
        ['welcome', 'добро пожаловать'], ['cheers', 'за здоровье / салют'],
        ['see you', 'увидимся']
      ]},
      { name: 'Numbers / Числа', emoji: '🔢', cards: [
        ['one', 'один'], ['two', 'два'], ['three', 'три'], ['four', 'четыре'],
        ['five', 'пять'], ['six', 'шесть'], ['seven', 'семь'], ['eight', 'восемь'],
        ['nine', 'девять'], ['ten', 'десять'], ['eleven', 'одиннадцать'],
        ['twelve', 'двенадцать'], ['twenty', 'двадцать'], ['hundred', 'сто'],
        ['thousand', 'тысяча']
      ]},
      { name: 'Colors / Цвета', emoji: '🎨', cards: [
        ['red', 'красный'], ['blue', 'синий'], ['green', 'зелёный'],
        ['yellow', 'жёлтый'], ['black', 'чёрный'], ['white', 'белый'],
        ['grey', 'серый'], ['orange', 'оранжевый'], ['pink', 'розовый'],
        ['purple', 'фиолетовый'], ['brown', 'коричневый'], ['gold', 'золотой'],
        ['silver', 'серебряный'], ['light', 'светлый'], ['dark', 'тёмный']
      ]},
      { name: 'Food / Еда', emoji: '🍕', cards: [
        ['bread', 'хлеб'], ['water', 'вода'], ['milk', 'молоко'], ['coffee', 'кофе'],
        ['tea', 'чай'], ['apple', 'яблоко'], ['orange', 'апельсин'],
        ['banana', 'банан'], ['meat', 'мясо'], ['fish', 'рыба'],
        ['rice', 'рис'], ['egg', 'яйцо'], ['cheese', 'сыр'],
        ['fruit', 'фрукт'], ['vegetable', 'овощ']
      ]},
      { name: 'Animals / Животные', emoji: '🐶', cards: [
        ['dog', 'собака'], ['cat', 'кошка'], ['bird', 'птица'],
        ['horse', 'лошадь'], ['cow', 'корова'], ['pig', 'свинья'],
        ['sheep', 'овца'], ['fish', 'рыба'], ['mouse', 'мышь'],
        ['bear', 'медведь'], ['wolf', 'волк'], ['fox', 'лиса'],
        ['rabbit', 'кролик'], ['lion', 'лев'], ['tiger', 'тигр']
      ]},
      { name: 'Family / Семья', emoji: '👨‍👩‍👧', cards: [
        ['mother', 'мать'], ['father', 'отец'], ['son', 'сын'], ['daughter', 'дочь'],
        ['brother', 'брат'], ['sister', 'сестра'], ['grandfather', 'дедушка'],
        ['grandmother', 'бабушка'], ['uncle', 'дядя'], ['aunt', 'тётя'],
        ['cousin', 'двоюродный'], ['husband', 'муж'], ['wife', 'жена'],
        ['family', 'семья'], ['baby', 'малыш']
      ]},
      { name: 'Home / Дом', emoji: '🏠', cards: [
        ['house', 'дом'], ['door', 'дверь'], ['window', 'окно'],
        ['table', 'стол'], ['chair', 'стул'], ['bed', 'кровать'],
        ['kitchen', 'кухня'], ['bathroom', 'ванная'], ['room', 'комната'],
        ['living room', 'гостиная'], ['wall', 'стена'], ['floor', 'пол'],
        ['ceiling', 'потолок'], ['lamp', 'лампа'], ['mirror', 'зеркало']
      ]},
      { name: 'Verbs / Глаголы', emoji: '⚡', cards: [
        ['to be', 'быть'], ['to have', 'иметь'], ['to do', 'делать'],
        ['to go', 'идти'], ['to come', 'приходить'], ['to see', 'видеть'],
        ['to eat', 'есть'], ['to drink', 'пить'], ['to speak', 'говорить'],
        ['to read', 'читать'], ['to write', 'писать'], ['to sleep', 'спать'],
        ['to want', 'хотеть'], ['to can', 'мочь'], ['to love', 'любить']
      ]}
    ]
  },

  german: {
    name: 'Немецкий',
    emoji: '🇩🇪',
    themes: [
      { name: 'Begrüßungen / Приветствия', emoji: '👋', cards: [
        ['hallo', 'привет'], ['tschüss', 'пока'], ['guten Morgen', 'доброе утро'],
        ['guten Tag', 'добрый день'], ['gute Nacht', 'доброй ночи'],
        ['danke', 'спасибо'], ['bitte', 'пожалуйста'], ['entschuldigung', 'извините'],
        ['wie geht\'s?', 'как дела?'], ['sehr gut', 'очень хорошо'],
        ['was gibt\'s?', 'как оно?'], ['bis später', 'до встречи'],
        ['willkommen', 'добро пожаловать'], ['prost', 'за здоровье'],
        ['bis bald', 'до скорого']
      ]},
      { name: 'Zahlen / Числа', emoji: '🔢', cards: [
        ['eins', 'один'], ['zwei', 'два'], ['drei', 'три'], ['vier', 'четыре'],
        ['fünf', 'пять'], ['sechs', 'шесть'], ['sieben', 'семь'], ['acht', 'восемь'],
        ['neun', 'девять'], ['zehn', 'десять'], ['elf', 'одиннадцать'],
        ['zwölf', 'двенадцать'], ['zwanzig', 'двадцать'], ['hundert', 'сто'],
        ['tausend', 'тысяча']
      ]},
      { name: 'Farben / Цвета', emoji: '🎨', cards: [
        ['rot', 'красный'], ['blau', 'синий'], ['grün', 'зелёный'],
        ['gelb', 'жёлтый'], ['schwarz', 'чёрный'], ['weiß', 'белый'],
        ['grau', 'серый'], ['orange', 'оранжевый'], ['rosa', 'розовый'],
        ['lila', 'фиолетовый'], ['braun', 'коричневый'], ['golden', 'золотой'],
        ['silbern', 'серебряный'], ['hell', 'светлый'], ['dunkel', 'тёмный']
      ]},
      { name: 'Essen / Еда', emoji: '🍕', cards: [
        ['Brot', 'хлеб'], ['Wasser', 'вода'], ['Milch', 'молоко'], ['Kaffee', 'кофе'],
        ['Tee', 'чай'], ['Apfel', 'яблоко'], ['Orange', 'апельсин'],
        ['Banane', 'банан'], ['Fleisch', 'мясо'], ['Fisch', 'рыба'],
        ['Reis', 'рис'], ['Ei', 'яйцо'], ['Käse', 'сыр'],
        ['Obst', 'фрукт'], ['Gemüse', 'овощ']
      ]},
      { name: 'Tiere / Животные', emoji: '🐶', cards: [
        ['Hund', 'собака'], ['Katze', 'кошка'], ['Vogel', 'птица'],
        ['Pferd', 'лошадь'], ['Kuh', 'корова'], ['Schwein', 'свинья'],
        ['Schaf', 'овца'], ['Fisch', 'рыба'], ['Maus', 'мышь'],
        ['Bär', 'медведь'], ['Wolf', 'волк'], ['Fuchs', 'лиса'],
        ['Kaninchen', 'кролик'], ['Löwe', 'лев'], ['Tiger', 'тигр']
      ]},
      { name: 'Familie / Семья', emoji: '👨‍👩‍👧', cards: [
        ['Mutter', 'мать'], ['Vater', 'отец'], ['Sohn', 'сын'], ['Tochter', 'дочь'],
        ['Bruder', 'брат'], ['Schwester', 'сестра'], ['Großvater', 'дедушка'],
        ['Großmutter', 'бабушка'], ['Onkel', 'дядя'], ['Tante', 'тётя'],
        ['Cousin', 'двоюродный'], ['Ehemann', 'муж'], ['Ehefrau', 'жена'],
        ['Familie', 'семья'], ['Baby', 'малыш']
      ]},
      { name: 'Haus / Дом', emoji: '🏠', cards: [
        ['Haus', 'дом'], ['Tür', 'дверь'], ['Fenster', 'окно'],
        ['Tisch', 'стол'], ['Stuhl', 'стул'], ['Bett', 'кровать'],
        ['Küche', 'кухня'], ['Badezimmer', 'ванная'], ['Zimmer', 'комната'],
        ['Wohnzimmer', 'гостиная'], ['Wand', 'стена'], ['Boden', 'пол'],
        ['Decke', 'потолок'], ['Lampe', 'лампа'], ['Spiegel', 'зеркало']
      ]},
      { name: 'Verben / Глаголы', emoji: '⚡', cards: [
        ['sein', 'быть'], ['haben', 'иметь'], ['machen', 'делать'],
        ['gehen', 'идти'], ['kommen', 'приходить'], ['sehen', 'видеть'],
        ['essen', 'есть'], ['trinken', 'пить'], ['sprechen', 'говорить'],
        ['lesen', 'читать'], ['schreiben', 'писать'], ['schlafen', 'спать'],
        ['wollen', 'хотеть'], ['können', 'мочь'], ['lieben', 'любить']
      ]}
    ]
  },

  french: {
    name: 'Французский',
    emoji: '🇫🇷',
    themes: [
      { name: 'Salutations / Приветствия', emoji: '👋', cards: [
        ['bonjour', 'привет / добрый день'], ['au revoir', 'до свидания'],
        ['bonsoir', 'добрый вечер'], ['bonne nuit', 'доброй ночи'],
        ['merci', 'спасибо'], ['s\'il vous plaît', 'пожалуйста'],
        ['pardon', 'извините'], ['comment ça va?', 'как дела?'],
        ['très bien', 'очень хорошо'], ['ça va?', 'как оно?'],
        ['à bientôt', 'до скорого'], ['bienvenue', 'добро пожаловать'],
        ['santé', 'за здоровье'], ['à plus tard', 'до встречи'],
        ['salut', 'привет / пока']
      ]},
      { name: 'Nombres / Числа', emoji: '🔢', cards: [
        ['un', 'один'], ['deux', 'два'], ['trois', 'три'], ['quatre', 'четыре'],
        ['cinq', 'пять'], ['six', 'шесть'], ['sept', 'семь'], ['huit', 'восемь'],
        ['neuf', 'девять'], ['dix', 'десять'], ['onze', 'одиннадцать'],
        ['douze', 'двенадцать'], ['vingt', 'двадцать'], ['cent', 'сто'],
        ['mille', 'тысяча']
      ]},
      { name: 'Couleurs / Цвета', emoji: '🎨', cards: [
        ['rouge', 'красный'], ['bleu', 'синий'], ['vert', 'зелёный'],
        ['jaune', 'жёлтый'], ['noir', 'чёрный'], ['blanc', 'белый'],
        ['gris', 'серый'], ['orange', 'оранжевый'], ['rose', 'розовый'],
        ['violet', 'фиолетовый'], ['marron', 'коричневый'], ['doré', 'золотой'],
        ['argenté', 'серебряный'], ['clair', 'светлый'], ['foncé', 'тёмный']
      ]},
      { name: 'Nourriture / Еда', emoji: '🍕', cards: [
        ['pain', 'хлеб'], ['eau', 'вода'], ['lait', 'молоко'], ['café', 'кофе'],
        ['thé', 'чай'], ['pomme', 'яблоко'], ['orange', 'апельсин'],
        ['banane', 'банан'], ['viande', 'мясо'], ['poisson', 'рыба'],
        ['riz', 'рис'], ['œuf', 'яйцо'], ['fromage', 'сыр'],
        ['fruit', 'фрукт'], ['légume', 'овощ']
      ]},
      { name: 'Animaux / Животные', emoji: '🐶', cards: [
        ['chien', 'собака'], ['chat', 'кошка'], ['oiseau', 'птица'],
        ['cheval', 'лошадь'], ['vache', 'корова'], ['cochon', 'свинья'],
        ['mouton', 'овца'], ['poisson', 'рыба'], ['souris', 'мышь'],
        ['ours', 'медведь'], ['loup', 'волк'], ['renard', 'лиса'],
        ['lapin', 'кролик'], ['lion', 'лев'], ['tigre', 'тигр']
      ]},
      { name: 'Famille / Семья', emoji: '👨‍👩‍👧', cards: [
        ['mère', 'мать'], ['père', 'отец'], ['fils', 'сын'], ['fille', 'дочь'],
        ['frère', 'брат'], ['sœur', 'сестра'], ['grand-père', 'дедушка'],
        ['grand-mère', 'бабушка'], ['oncle', 'дядя'], ['tante', 'тётя'],
        ['cousin', 'двоюродный'], ['mari', 'муж'], ['femme', 'жена'],
        ['famille', 'семья'], ['bébé', 'малыш']
      ]},
      { name: 'Maison / Дом', emoji: '🏠', cards: [
        ['maison', 'дом'], ['porte', 'дверь'], ['fenêtre', 'окно'],
        ['table', 'стол'], ['chaise', 'стул'], ['lit', 'кровать'],
        ['cuisine', 'кухня'], ['salle de bain', 'ванная'], ['chambre', 'комната'],
        ['salon', 'гостиная'], ['mur', 'стена'], ['sol', 'пол'],
        ['plafond', 'потолок'], ['lampe', 'лампа'], ['miroir', 'зеркало']
      ]},
      { name: 'Verbes / Глаголы', emoji: '⚡', cards: [
        ['être', 'быть'], ['avoir', 'иметь'], ['faire', 'делать'],
        ['aller', 'идти'], ['venir', 'приходить'], ['voir', 'видеть'],
        ['manger', 'есть'], ['boire', 'пить'], ['parler', 'говорить'],
        ['lire', 'читать'], ['écrire', 'писать'], ['dormir', 'спать'],
        ['vouloir', 'хотеть'], ['pouvoir', 'мочь'], ['aimer', 'любить']
      ]}
    ]
  },

  italian: {
    name: 'Итальянский',
    emoji: '🇮🇹',
    themes: [
      { name: 'Saluti / Приветствия', emoji: '👋', cards: [
        ['ciao', 'привет / пока'], ['arrivederci', 'до свидания'],
        ['buongiorno', 'доброе утро'], ['buonasera', 'добрый вечер'],
        ['buonanotte', 'доброй ночи'], ['grazie', 'спасибо'],
        ['per favore', 'пожалуйста'], ['scusa', 'извини'],
        ['come stai?', 'как дела?'], ['molto bene', 'очень хорошо'],
        ['come va?', 'как оно?'], ['a presto', 'до скорого'],
        ['benvenuto', 'добро пожаловать'], ['salute', 'за здоровье'],
        ['a dopo', 'до встречи']
      ]},
      { name: 'Numeri / Числа', emoji: '🔢', cards: [
        ['uno', 'один'], ['due', 'два'], ['tre', 'три'], ['quattro', 'четыре'],
        ['cinque', 'пять'], ['sei', 'шесть'], ['sette', 'семь'], ['otto', 'восемь'],
        ['nove', 'девять'], ['dieci', 'десять'], ['undici', 'одиннадцать'],
        ['dodici', 'двенадцать'], ['venti', 'двадцать'], ['cento', 'сто'],
        ['mille', 'тысяча']
      ]},
      { name: 'Colori / Цвета', emoji: '🎨', cards: [
        ['rosso', 'красный'], ['blu', 'синий'], ['verde', 'зелёный'],
        ['giallo', 'жёлтый'], ['nero', 'чёрный'], ['bianco', 'белый'],
        ['grigio', 'серый'], ['arancione', 'оранжевый'], ['rosa', 'розовый'],
        ['viola', 'фиолетовый'], ['marrone', 'коричневый'], ['dorato', 'золотой'],
        ['argentato', 'серебряный'], ['chiaro', 'светлый'], ['scuro', 'тёмный']
      ]},
      { name: 'Cibo / Еда', emoji: '🍕', cards: [
        ['pane', 'хлеб'], ['acqua', 'вода'], ['latte', 'молоко'], ['caffè', 'кофе'],
        ['tè', 'чай'], ['mela', 'яблоко'], ['arancia', 'апельсин'],
        ['banana', 'банан'], ['carne', 'мясо'], ['pesce', 'рыба'],
        ['riso', 'рис'], ['uovo', 'яйцо'], ['formaggio', 'сыр'],
        ['frutta', 'фрукт'], ['verdura', 'овощ']
      ]},
      { name: 'Animali / Животные', emoji: '🐶', cards: [
        ['cane', 'собака'], ['gatto', 'кошка'], ['uccello', 'птица'],
        ['cavallo', 'лошадь'], ['mucca', 'корова'], ['maiale', 'свинья'],
        ['pecora', 'овца'], ['pesce', 'рыба'], ['topo', 'мышь'],
        ['orso', 'медведь'], ['lupo', 'волк'], ['volpe', 'лиса'],
        ['coniglio', 'кролик'], ['leone', 'лев'], ['tigre', 'тигр']
      ]},
      { name: 'Famiglia / Семья', emoji: '👨‍👩‍👧', cards: [
        ['madre', 'мать'], ['padre', 'отец'], ['figlio', 'сын'], ['figlia', 'дочь'],
        ['fratello', 'брат'], ['sorella', 'сестра'], ['nonno', 'дедушка'],
        ['nonna', 'бабушка'], ['zio', 'дядя'], ['zia', 'тётя'],
        ['cugino', 'двоюродный'], ['marito', 'муж'], ['moglie', 'жена'],
        ['famiglia', 'семья'], ['bambino', 'малыш']
      ]},
      { name: 'Casa / Дом', emoji: '🏠', cards: [
        ['casa', 'дом'], ['porta', 'дверь'], ['finestra', 'окно'],
        ['tavolo', 'стол'], ['sedia', 'стул'], ['letto', 'кровать'],
        ['cucina', 'кухня'], ['bagno', 'ванная'], ['stanza', 'комната'],
        ['soggiorno', 'гостиная'], ['muro', 'стена'], ['pavimento', 'пол'],
        ['soffitto', 'потолок'], ['lampada', 'лампа'], ['specchio', 'зеркало']
      ]},
      { name: 'Verbi / Глаголы', emoji: '⚡', cards: [
        ['essere', 'быть'], ['avere', 'иметь'], ['fare', 'делать'],
        ['andare', 'идти'], ['venire', 'приходить'], ['vedere', 'видеть'],
        ['mangiare', 'есть'], ['bere', 'пить'], ['parlare', 'говорить'],
        ['leggere', 'читать'], ['scrivere', 'писать'], ['dormire', 'спать'],
        ['volere', 'хотеть'], ['potere', 'мочь'], ['amare', 'любить']
      ]}
    ]
  }
};

/* ---------- СОЗДАНИЕ ЯЗЫКА ИЗ ШАБЛОНА ---------- */
function createLangFromTemplate(templateKey, customName) {
  const tpl = BUILTIN_THEMES[templateKey];
  if (!tpl) return null;
  const lang = {
    id: 'lang_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: customName || tpl.name,
    emoji: tpl.emoji,
    isBuiltin: true,
    templateKey: templateKey,
    lessons: [], // плоский список уроков тропы
    folders: []  // пользовательские папки
  };
  // Разбиваем каждую тему на уроки по 4-5 слов
  tpl.themes.forEach(theme => {
    const chunks = chunkArray(theme.cards, 5);
    chunks.forEach((chunk, idx) => {
      lang.lessons.push({
        id: 'lesson_' + lang.id + '_' + lang.lessons.length,
        themeName: theme.name,
        themeEmoji: theme.emoji,
        lessonNum: idx + 1,
        totalInTheme: chunks.length,
        cards: chunk.map(c => makeCard(c[0], c[1])),
        completed: false,
        stars: 0
      });
    });
  });
  return lang;
}

/* ---------- ВСПОМОГАТЕЛЬНЫЕ ---------- */
function makeCard(front, back) {
  return {
    front, back,
    seen: 0, correct: 0, wrong: 0, star: false,
    lastSeen: null, srsNext: null, srsLevel: 0
  };
}
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ---------- СПИСОК ДОСТУПНЫХ ШАБЛОНОВ (для меню) ---------- */
const AVAILABLE_TEMPLATES = [
  { key: 'spanish', name: 'Испанский', emoji: '🇪🇸' },
  { key: 'english', name: 'Английский', emoji: '🇬🇧' },
  { key: 'german',  name: 'Немецкий',   emoji: '🇩🇪' },
  { key: 'french',  name: 'Французский', emoji: '🇫🇷' },
  { key: 'italian', name: 'Итальянский', emoji: '🇮🇹' }
];
