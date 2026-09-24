/* ============================================================
   Built-in Themes v8.0 — 5 языков
   Каждая тема: 15 слов + 10 фраз
   ============================================================ */

const BUILTIN_THEMES = {
  spanish: {
    name: 'Испанский',
    emoji: '🇪🇸',
    locale: 'es-ES',
    themes: [
      { name: 'Приветствия', emoji: '👋', cards: [
        ['hola', 'привет'], ['adiós', 'пока'], ['buenos días', 'доброе утро'],
        ['buenas tardes', 'добрый день'], ['buenas noches', 'доброй ночи'],
        ['gracias', 'спасибо'], ['por favor', 'пожалуйста'], ['perdón', 'извините'],
        ['¿cómo estás?', 'как дела?'], ['muy bien', 'очень хорошо'],
        ['¿qué tal?', 'как оно?'], ['hasta luego', 'до встречи'],
        ['bienvenido', 'добро пожаловать'], ['salud', 'здоровье / будь здоров'],
        ['nos vemos', 'увидимся']
      ], phrases: [
        ['¿Cómo te llamas?', 'Как тебя зовут?'],
        ['Me llamo Pedro', 'Меня зовут Педро'],
        ['Mucho gusto', 'Приятно познакомиться'],
        ['¿De dónde eres?', 'Откуда ты?'],
        ['Soy de Rusia', 'Я из России'],
        ['¿Hablas español?', 'Ты говоришь по-испански?'],
        ['Un poco', 'Немного'],
        ['No entiendo', 'Я не понимаю'],
        ['¿Puedes repetir?', 'Можешь повторить?'],
        ['Hasta mañana', 'До завтра']
      ]},
      { name: 'Числа', emoji: '🔢', cards: [
        ['uno', 'один'], ['dos', 'два'], ['tres', 'три'], ['cuatro', 'четыре'],
        ['cinco', 'пять'], ['seis', 'шесть'], ['siete', 'семь'], ['ocho', 'восемь'],
        ['nueve', 'девять'], ['diez', 'десять'], ['once', 'одиннадцать'],
        ['doce', 'двенадцать'], ['veinte', 'двадцать'], ['cien', 'сто'],
        ['mil', 'тысяча']
      ], phrases: [
        ['Tengo veinte años', 'Мне двадцать лет'],
        ['Cuesta diez euros', 'Стоит десять евро'],
        ['Son las tres', 'Три часа'],
        ['Uno más', 'Ещё один'],
        ['Dame dos, por favor', 'Дай два, пожалуйста'],
        ['Hay cinco personas', 'Есть пять человек'],
        ['Vivo en el piso siete', 'Живу на седьмом этаже'],
        ['Cien por ciento', 'Сто процентов'],
        ['Mil gracias', 'Тысяча благодарностей'],
        ['El primero de mayo', 'Первое мая']
      ]},
      { name: 'Цвета', emoji: '🎨', cards: [
        ['rojo', 'красный'], ['azul', 'синий'], ['verde', 'зелёный'],
        ['amarillo', 'жёлтый'], ['negro', 'чёрный'], ['blanco', 'белый'],
        ['gris', 'серый'], ['naranja', 'оранжевый'], ['rosa', 'розовый'],
        ['morado', 'фиолетовый'], ['marrón', 'коричневый'], ['dorado', 'золотой'],
        ['plateado', 'серебряный'], ['claro', 'светлый'], ['oscuro', 'тёмный']
      ], phrases: [
        ['Me gusta el azul', 'Мне нравится синий'],
        ['El cielo es azul', 'Небо синее'],
        ['Tengo un coche rojo', 'У меня красная машина'],
        ['La hierba es verde', 'Трава зелёная'],
        ['Un vestido blanco', 'Белое платье'],
        ['Color favorito', 'Любимый цвет'],
        ['Es de color negro', 'Он чёрного цвета'],
        ['¿De qué color es?', 'Какого он цвета?'],
        ['Un gato gris', 'Серый кот'],
        ['Amarillo como el sol', 'Жёлтый как солнце']
      ]},
      { name: 'Еда', emoji: '🍕', cards: [
        ['pan', 'хлеб'], ['agua', 'вода'], ['leche', 'молоко'], ['café', 'кофе'],
        ['té', 'чай'], ['manzana', 'яблоко'], ['naranja', 'апельсин'],
        ['plátano', 'банан'], ['carne', 'мясо'], ['pescado', 'рыба'],
        ['arroz', 'рис'], ['huevo', 'яйцо'], ['queso', 'сыр'],
        ['fruta', 'фрукт'], ['verdura', 'овощ']
      ], phrases: [
        ['Tengo hambre', 'Я голоден'],
        ['Tengo sed', 'Я хочу пить'],
        ['¿Qué quieres comer?', 'Что ты хочешь есть?'],
        ['Un café, por favor', 'Один кофе, пожалуйста'],
        ['La cuenta, por favor', 'Счёт, пожалуйста'],
        ['Está delicioso', 'Это вкусно'],
        ['No como carne', 'Я не ем мясо'],
        ['Me gusta el pescado', 'Мне нравится рыба'],
        ['Una mesa para dos', 'Столик на двоих'],
        ['Buen provecho', 'Приятного аппетита']
      ]},
      { name: 'Животные', emoji: '🐶', cards: [
        ['perro', 'собака'], ['gato', 'кошка'], ['pájaro', 'птица'],
        ['caballo', 'лошадь'], ['vaca', 'корова'], ['cerdo', 'свинья'],
        ['oveja', 'овца'], ['pez', 'рыба'], ['ratón', 'мышь'],
        ['oso', 'медведь'], ['lobo', 'волк'], ['zorro', 'лиса'],
        ['conejo', 'кролик'], ['león', 'лев'], ['tigre', 'тигр']
      ], phrases: [
        ['Tengo un perro', 'У меня есть собака'],
        ['El gato duerme', 'Кошка спит'],
        ['Los pájaros cantan', 'Птицы поют'],
        ['Me gustan los animales', 'Мне нравятся животные'],
        ['Un perro pequeño', 'Маленькая собака'],
        ['El león es el rey', 'Лев — король'],
        ['Mi animal favorito', 'Моё любимое животное'],
        ['El pez nada', 'Рыба плавает'],
        ['¿Tienes mascota?', 'У тебя есть питомец?'],
        ['Un gato negro', 'Чёрный кот']
      ]},
      { name: 'Семья', emoji: '👨‍👩‍👧', cards: [
        ['madre', 'мать'], ['padre', 'отец'], ['hijo', 'сын'], ['hija', 'дочь'],
        ['hermano', 'брат'], ['hermana', 'сестра'], ['abuelo', 'дедушка'],
        ['abuela', 'бабушка'], ['tío', 'дядя'], ['tía', 'тётя'],
        ['primo', 'двоюродный брат'], ['esposo', 'муж'], ['esposa', 'жена'],
        ['familia', 'семья'], ['bebé', 'малыш']
      ], phrases: [
        ['Mi familia es grande', 'Моя семья большая'],
        ['Tengo dos hermanos', 'У меня два брата'],
        ['Mi madre cocina bien', 'Моя мама хорошо готовит'],
        ['Mi padre trabaja', 'Мой отец работает'],
        ['Mi abuela es simpática', 'Моя бабушка милая'],
        ['¿Tienes hermanos?', 'У тебя есть братья или сёстры?'],
        ['Somos cinco en la familia', 'Нас пятеро в семье'],
        ['Mi hijo va a la escuela', 'Мой сын ходит в школу'],
        ['Te quiero, mamá', 'Я люблю тебя, мама'],
        ['Mi familia es todo', 'Моя семья — это всё']
      ]},
      { name: 'Дом', emoji: '🏠', cards: [
        ['casa', 'дом'], ['puerta', 'дверь'], ['ventana', 'окно'],
        ['mesa', 'стол'], ['silla', 'стул'], ['cama', 'кровать'],
        ['cocina', 'кухня'], ['baño', 'ванная'], ['habitación', 'комната'],
        ['sala', 'гостиная'], ['pared', 'стена'], ['suelo', 'пол'],
        ['techo', 'потолок'], ['lámpara', 'лампа'], ['espejo', 'зеркало']
      ], phrases: [
        ['Mi casa es tu casa', 'Мой дом — твой дом'],
        ['Vivo en un piso', 'Я живу в квартире'],
        ['La puerta está abierta', 'Дверь открыта'],
        ['Cierra la ventana', 'Закрой окно'],
        ['En la cocina', 'На кухне'],
        ['El baño está allí', 'Ванная там'],
        ['Mi habitación es pequeña', 'Моя комната маленькая'],
        ['La cama es cómoda', 'Кровать удобная'],
        ['Enciende la lámpara', 'Включи лампу'],
        ['Estoy en casa', 'Я дома']
      ]},
      { name: 'Глаголы', emoji: '⚡', cards: [
        ['ser', 'быть'], ['estar', 'находиться'], ['tener', 'иметь'],
        ['hacer', 'делать'], ['ir', 'идти'], ['venir', 'приходить'],
        ['ver', 'видеть'], ['comer', 'есть'], ['beber', 'пить'],
        ['hablar', 'говорить'], ['leer', 'читать'], ['escribir', 'писать'],
        ['dormir', 'спать'], ['querer', 'хотеть'], ['poder', 'мочь']
      ], phrases: [
        ['Quiero aprender español', 'Хочу учить испанский'],
        ['¿Puedes ayudarme?', 'Можешь мне помочь?'],
        ['Voy al trabajo', 'Иду на работу'],
        ['Estoy leyendo un libro', 'Я читаю книгу'],
        ['Vamos a la playa', 'Идём на пляж'],
        ['Me gusta hablar contigo', 'Мне нравится с тобой говорить'],
        ['Quiero dormir', 'Хочу спать'],
        ['No puedo ir', 'Я не могу пойти'],
        ['¿Qué haces?', 'Что делаешь?'],
        ['Voy a hacerlo', 'Я собираюсь это сделать']
      ]}
    ]
  },

  english: {
    name: 'Английский',
    emoji: '🇬🇧',
    locale: 'en-US',
    themes: [
      { name: 'Greetings / Приветствия', emoji: '👋', cards: [
        ['hello', 'привет'], ['goodbye', 'пока'], ['good morning', 'доброе утро'],
        ['good afternoon', 'добрый день'], ['good night', 'доброй ночи'],
        ['thank you', 'спасибо'], ['please', 'пожалуйста'], ['sorry', 'извините'],
        ['how are you?', 'как дела?'], ['very well', 'очень хорошо'],
        ["what's up?", 'как оно?'], ['see you later', 'до встречи'],
        ['welcome', 'добро пожаловать'], ['cheers', 'за здоровье'],
        ['see you', 'увидимся']
      ], phrases: [
        ['What is your name?', 'Как тебя зовут?'],
        ['My name is Peter', 'Меня зовут Питер'],
        ['Nice to meet you', 'Приятно познакомиться'],
        ['Where are you from?', 'Откуда ты?'],
        ['I am from Russia', 'Я из России'],
        ['Do you speak English?', 'Ты говоришь по-английски?'],
        ['A little bit', 'Немного'],
        ['I do not understand', 'Я не понимаю'],
        ['Can you repeat that?', 'Можешь повторить?'],
        ['See you tomorrow', 'До завтра']
      ]},
      { name: 'Numbers / Числа', emoji: '🔢', cards: [
        ['one', 'один'], ['two', 'два'], ['three', 'три'], ['four', 'четыре'],
        ['five', 'пять'], ['six', 'шесть'], ['seven', 'семь'], ['eight', 'восемь'],
        ['nine', 'девять'], ['ten', 'десять'], ['eleven', 'одиннадцать'],
        ['twelve', 'двенадцать'], ['twenty', 'двадцать'], ['hundred', 'сто'],
        ['thousand', 'тысяча']
      ], phrases: [
        ['I am twenty years old', 'Мне двадцать лет'],
        ['It costs ten dollars', 'Это стоит десять долларов'],
        ["It's three o'clock", 'Три часа'],
        ['One more', 'Ещё один'],
        ['Give me two, please', 'Дай два, пожалуйста'],
        ['There are five people', 'Есть пять человек'],
        ['I live on the seventh floor', 'Я живу на седьмом этаже'],
        ['One hundred percent', 'Сто процентов'],
        ['Thanks a million', 'Миллион благодарностей'],
        ['The first of May', 'Первое мая']
      ]},
      { name: 'Colors / Цвета', emoji: '🎨', cards: [
        ['red', 'красный'], ['blue', 'синий'], ['green', 'зелёный'],
        ['yellow', 'жёлтый'], ['black', 'чёрный'], ['white', 'белый'],
        ['grey', 'серый'], ['orange', 'оранжевый'], ['pink', 'розовый'],
        ['purple', 'фиолетовый'], ['brown', 'коричневый'], ['gold', 'золотой'],
        ['silver', 'серебряный'], ['light', 'светлый'], ['dark', 'тёмный']
      ], phrases: [
        ['I like blue', 'Мне нравится синий'],
        ['The sky is blue', 'Небо синее'],
        ['I have a red car', 'У меня красная машина'],
        ['The grass is green', 'Трава зелёная'],
        ['A white dress', 'Белое платье'],
        ['Favorite color', 'Любимый цвет'],
        ['It is black', 'Он чёрный'],
        ['What color is it?', 'Какого он цвета?'],
        ['A grey cat', 'Серый кот'],
        ['Yellow like the sun', 'Жёлтый как солнце']
      ]},
      { name: 'Food / Еда', emoji: '🍕', cards: [
        ['bread', 'хлеб'], ['water', 'вода'], ['milk', 'молоко'], ['coffee', 'кофе'],
        ['tea', 'чай'], ['apple', 'яблоко'], ['orange', 'апельсин'],
        ['banana', 'банан'], ['meat', 'мясо'], ['fish', 'рыба'],
        ['rice', 'рис'], ['egg', 'яйцо'], ['cheese', 'сыр'],
        ['fruit', 'фрукт'], ['vegetable', 'овощ']
      ], phrases: [
        ['I am hungry', 'Я голоден'],
        ['I am thirsty', 'Я хочу пить'],
        ['What do you want to eat?', 'Что ты хочешь есть?'],
        ['One coffee, please', 'Один кофе, пожалуйста'],
        ['The bill, please', 'Счёт, пожалуйста'],
        ['It is delicious', 'Это вкусно'],
        ['I do not eat meat', 'Я не ем мясо'],
        ['I like fish', 'Мне нравится рыба'],
        ['A table for two', 'Столик на двоих'],
        ['Enjoy your meal', 'Приятного аппетита']
      ]},
      { name: 'Animals / Животные', emoji: '🐶', cards: [
        ['dog', 'собака'], ['cat', 'кошка'], ['bird', 'птица'],
        ['horse', 'лошадь'], ['cow', 'корова'], ['pig', 'свинья'],
        ['sheep', 'овца'], ['fish', 'рыба'], ['mouse', 'мышь'],
        ['bear', 'медведь'], ['wolf', 'волк'], ['fox', 'лиса'],
        ['rabbit', 'кролик'], ['lion', 'лев'], ['tiger', 'тигр']
      ], phrases: [
        ['I have a dog', 'У меня есть собака'],
        ['The cat is sleeping', 'Кошка спит'],
        ['Birds are singing', 'Птицы поют'],
        ['I like animals', 'Мне нравятся животные'],
        ['A small dog', 'Маленькая собака'],
        ['The lion is the king', 'Лев — король'],
        ['My favorite animal', 'Моё любимое животное'],
        ['The fish is swimming', 'Рыба плавает'],
        ['Do you have a pet?', 'У тебя есть питомец?'],
        ['A black cat', 'Чёрный кот']
      ]},
      { name: 'Family / Семья', emoji: '👨‍👩‍👧', cards: [
        ['mother', 'мать'], ['father', 'отец'], ['son', 'сын'], ['daughter', 'дочь'],
        ['brother', 'брат'], ['sister', 'сестра'], ['grandfather', 'дедушка'],
        ['grandmother', 'бабушка'], ['uncle', 'дядя'], ['aunt', 'тётя'],
        ['cousin', 'двоюродный'], ['husband', 'муж'], ['wife', 'жена'],
        ['family', 'семья'], ['baby', 'малыш']
      ], phrases: [
        ['My family is big', 'Моя семья большая'],
        ['I have two brothers', 'У меня два брата'],
        ['My mother cooks well', 'Моя мама хорошо готовит'],
        ['My father works', 'Мой отец работает'],
        ['My grandmother is nice', 'Моя бабушка милая'],
        ['Do you have siblings?', 'У тебя есть братья или сёстры?'],
        ['We are five in the family', 'Нас пятеро в семье'],
        ['My son goes to school', 'Мой сын ходит в школу'],
        ['I love you, mom', 'Я люблю тебя, мама'],
        ['My family is everything', 'Моя семья — это всё']
      ]},
      { name: 'Home / Дом', emoji: '🏠', cards: [
        ['house', 'дом'], ['door', 'дверь'], ['window', 'окно'],
        ['table', 'стол'], ['chair', 'стул'], ['bed', 'кровать'],
        ['kitchen', 'кухня'], ['bathroom', 'ванная'], ['room', 'комната'],
        ['living room', 'гостиная'], ['wall', 'стена'], ['floor', 'пол'],
        ['ceiling', 'потолок'], ['lamp', 'лампа'], ['mirror', 'зеркало']
      ], phrases: [
        ['My house is your house', 'Мой дом — твой дом'],
        ['I live in a flat', 'Я живу в квартире'],
        ['The door is open', 'Дверь открыта'],
        ['Close the window', 'Закрой окно'],
        ['In the kitchen', 'На кухне'],
        ['The bathroom is there', 'Ванная там'],
        ['My room is small', 'Моя комната маленькая'],
        ['The bed is comfortable', 'Кровать удобная'],
        ['Turn on the lamp', 'Включи лампу'],
        ['I am at home', 'Я дома']
      ]},
      { name: 'Verbs / Глаголы', emoji: '⚡', cards: [
        ['to be', 'быть'], ['to have', 'иметь'], ['to do', 'делать'],
        ['to go', 'идти'], ['to come', 'приходить'], ['to see', 'видеть'],
        ['to eat', 'есть'], ['to drink', 'пить'], ['to speak', 'говорить'],
        ['to read', 'читать'], ['to write', 'писать'], ['to sleep', 'спать'],
        ['to want', 'хотеть'], ['to can', 'мочь'], ['to love', 'любить']
      ], phrases: [
        ['I want to learn English', 'Хочу учить английский'],
        ['Can you help me?', 'Можешь мне помочь?'],
        ['I am going to work', 'Иду на работу'],
        ['I am reading a book', 'Я читаю книгу'],
        ['Let us go to the beach', 'Идём на пляж'],
        ['I like talking to you', 'Мне нравится с тобой говорить'],
        ['I want to sleep', 'Хочу спать'],
        ['I cannot go', 'Я не могу пойти'],
        ['What are you doing?', 'Что делаешь?'],
        ['I am going to do it', 'Я собираюсь это сделать']
      ]}
    ]
  },

  german: {
    name: 'Немецкий',
    emoji: '🇩🇪',
    locale: 'de-DE',
    themes: [
      { name: 'Begrüßungen / Приветствия', emoji: '👋', cards: [
        ['hallo', 'привет'], ['tschüss', 'пока'], ['guten Morgen', 'доброе утро'],
        ['guten Tag', 'добрый день'], ['gute Nacht', 'доброй ночи'],
        ['danke', 'спасибо'], ['bitte', 'пожалуйста'], ['entschuldigung', 'извините'],
        ["wie geht's?", 'как дела?'], ['sehr gut', 'очень хорошо'],
        ["was gibt's?", 'как оно?'], ['bis später', 'до встречи'],
        ['willkommen', 'добро пожаловать'], ['prost', 'за здоровье'],
        ['bis bald', 'до скорого']
      ], phrases: [
        ['Wie heißt du?', 'Как тебя зовут?'],
        ['Ich heiße Peter', 'Меня зовут Питер'],
        ['Freut mich', 'Приятно познакомиться'],
        ['Woher kommst du?', 'Откуда ты?'],
        ['Ich komme aus Russland', 'Я из России'],
        ['Sprichst du Deutsch?', 'Ты говоришь по-немецки?'],
        ['Ein bisschen', 'Немного'],
        ['Ich verstehe nicht', 'Я не понимаю'],
        ['Kannst du wiederholen?', 'Можешь повторить?'],
        ['Bis morgen', 'До завтра']
      ]},
      { name: 'Zahlen / Числа', emoji: '🔢', cards: [
        ['eins', 'один'], ['zwei', 'два'], ['drei', 'три'], ['vier', 'четыре'],
        ['fünf', 'пять'], ['sechs', 'шесть'], ['sieben', 'семь'], ['acht', 'восемь'],
        ['neun', 'девять'], ['zehn', 'десять'], ['elf', 'одиннадцать'],
        ['zwölf', 'двенадцать'], ['zwanzig', 'двадцать'], ['hundert', 'сто'],
        ['tausend', 'тысяча']
      ], phrases: [
        ['Ich bin zwanzig Jahre alt', 'Мне двадцать лет'],
        ['Es kostet zehn Euro', 'Это стоит десять евро'],
        ['Es ist drei Uhr', 'Три часа'],
        ['Noch eins', 'Ещё один'],
        ['Gib mir zwei, bitte', 'Дай два, пожалуйста'],
        ['Es gibt fünf Personen', 'Есть пять человек'],
        ['Ich wohne im siebten Stock', 'Живу на седьмом этаже'],
        ['Hundert Prozent', 'Сто процентов'],
        ['Tausend Dank', 'Тысяча благодарностей'],
        ['Der erste Mai', 'Первое мая']
      ]},
      { name: 'Farben / Цвета', emoji: '🎨', cards: [
        ['rot', 'красный'], ['blau', 'синий'], ['grün', 'зелёный'],
        ['gelb', 'жёлтый'], ['schwarz', 'чёрный'], ['weiß', 'белый'],
        ['grau', 'серый'], ['orange', 'оранжевый'], ['rosa', 'розовый'],
        ['lila', 'фиолетовый'], ['braun', 'коричневый'], ['golden', 'золотой'],
        ['silbern', 'серебряный'], ['hell', 'светлый'], ['dunkel', 'тёмный']
      ], phrases: [
        ['Ich mag Blau', 'Мне нравится синий'],
        ['Der Himmel ist blau', 'Небо синее'],
        ['Ich habe ein rotes Auto', 'У меня красная машина'],
        ['Das Gras ist grün', 'Трава зелёная'],
        ['Ein weißes Kleid', 'Белое платье'],
        ['Lieblingsfarbe', 'Любимый цвет'],
        ['Es ist schwarz', 'Он чёрный'],
        ['Welche Farbe ist es?', 'Какого он цвета?'],
        ['Eine graue Katze', 'Серая кошка'],
        ['Gelb wie die Sonne', 'Жёлтый как солнце']
      ]},
      { name: 'Essen / Еда', emoji: '🍕', cards: [
        ['Brot', 'хлеб'], ['Wasser', 'вода'], ['Milch', 'молоко'], ['Kaffee', 'кофе'],
        ['Tee', 'чай'], ['Apfel', 'яблоко'], ['Orange', 'апельсин'],
        ['Banane', 'банан'], ['Fleisch', 'мясо'], ['Fisch', 'рыба'],
        ['Reis', 'рис'], ['Ei', 'яйцо'], ['Käse', 'сыр'],
        ['Obst', 'фрукт'], ['Gemüse', 'овощ']
      ], phrases: [
        ['Ich habe Hunger', 'Я голоден'],
        ['Ich habe Durst', 'Я хочу пить'],
        ['Was willst du essen?', 'Что ты хочешь есть?'],
        ['Einen Kaffee, bitte', 'Один кофе, пожалуйста'],
        ['Die Rechnung, bitte', 'Счёт, пожалуйста'],
        ['Es ist lecker', 'Это вкусно'],
        ['Ich esse kein Fleisch', 'Я не ем мясо'],
        ['Ich mag Fisch', 'Мне нравится рыба'],
        ['Ein Tisch für zwei', 'Столик на двоих'],
        ['Guten Appetit', 'Приятного аппетита']
      ]},
      { name: 'Tiere / Животные', emoji: '🐶', cards: [
        ['Hund', 'собака'], ['Katze', 'кошка'], ['Vogel', 'птица'],
        ['Pferd', 'лошадь'], ['Kuh', 'корова'], ['Schwein', 'свинья'],
        ['Schaf', 'овца'], ['Fisch', 'рыба'], ['Maus', 'мышь'],
        ['Bär', 'медведь'], ['Wolf', 'волк'], ['Fuchs', 'лиса'],
        ['Kaninchen', 'кролик'], ['Löwe', 'лев'], ['Tiger', 'тигр']
      ], phrases: [
        ['Ich habe einen Hund', 'У меня есть собака'],
        ['Die Katze schläft', 'Кошка спит'],
        ['Die Vögel singen', 'Птицы поют'],
        ['Ich mag Tiere', 'Мне нравятся животные'],
        ['Ein kleiner Hund', 'Маленькая собака'],
        ['Der Löwe ist der König', 'Лев — король'],
        ['Mein Lieblingstier', 'Моё любимое животное'],
        ['Der Fisch schwimmt', 'Рыба плавает'],
        ['Hast du ein Haustier?', 'У тебя есть питомец?'],
        ['Eine schwarze Katze', 'Чёрная кошка']
      ]},
      { name: 'Familie / Семья', emoji: '👨‍👩‍👧', cards: [
        ['Mutter', 'мать'], ['Vater', 'отец'], ['Sohn', 'сын'], ['Tochter', 'дочь'],
        ['Bruder', 'брат'], ['Schwester', 'сестра'], ['Großvater', 'дедушка'],
        ['Großmutter', 'бабушка'], ['Onkel', 'дядя'], ['Tante', 'тётя'],
        ['Cousin', 'двоюродный'], ['Ehemann', 'муж'], ['Ehefrau', 'жена'],
        ['Familie', 'семья'], ['Baby', 'малыш']
      ], phrases: [
        ['Meine Familie ist groß', 'Моя семья большая'],
        ['Ich habe zwei Brüder', 'У меня два брата'],
        ['Meine Mutter kocht gut', 'Моя мама хорошо готовит'],
        ['Mein Vater arbeitet', 'Мой отец работает'],
        ['Meine Oma ist nett', 'Моя бабушка милая'],
        ['Hast du Geschwister?', 'У тебя есть братья или сёстры?'],
        ['Wir sind fünf in der Familie', 'Нас пятеро в семье'],
        ['Mein Sohn geht zur Schule', 'Мой сын ходит в школу'],
        ['Ich liebe dich, Mama', 'Я люблю тебя, мама'],
        ['Meine Familie ist alles', 'Моя семья — это всё']
      ]},
      { name: 'Haus / Дом', emoji: '🏠', cards: [
        ['Haus', 'дом'], ['Tür', 'дверь'], ['Fenster', 'окно'],
        ['Tisch', 'стол'], ['Stuhl', 'стул'], ['Bett', 'кровать'],
        ['Küche', 'кухня'], ['Badezimmer', 'ванная'], ['Zimmer', 'комната'],
        ['Wohnzimmer', 'гостиная'], ['Wand', 'стена'], ['Boden', 'пол'],
        ['Decke', 'потолок'], ['Lampe', 'лампа'], ['Spiegel', 'зеркало']
      ], phrases: [
        ['Mein Haus ist dein Haus', 'Мой дом — твой дом'],
        ['Ich wohne in einer Wohnung', 'Я живу в квартире'],
        ['Die Tür ist offen', 'Дверь открыта'],
        ['Schließe das Fenster', 'Закрой окно'],
        ['In der Küche', 'На кухне'],
        ['Das Badezimmer ist dort', 'Ванная там'],
        ['Mein Zimmer ist klein', 'Моя комната маленькая'],
        ['Das Bett ist bequem', 'Кровать удобная'],
        ['Mach die Lampe an', 'Включи лампу'],
        ['Ich bin zu Hause', 'Я дома']
      ]},
      { name: 'Verben / Глаголы', emoji: '⚡', cards: [
        ['sein', 'быть'], ['haben', 'иметь'], ['machen', 'делать'],
        ['gehen', 'идти'], ['kommen', 'приходить'], ['sehen', 'видеть'],
        ['essen', 'есть'], ['trinken', 'пить'], ['sprechen', 'говорить'],
        ['lesen', 'читать'], ['schreiben', 'писать'], ['schlafen', 'спать'],
        ['wollen', 'хотеть'], ['können', 'мочь'], ['lieben', 'любить']
      ], phrases: [
        ['Ich will Deutsch lernen', 'Хочу учить немецкий'],
        ['Kannst du mir helfen?', 'Можешь мне помочь?'],
        ['Ich gehe zur Arbeit', 'Иду на работу'],
        ['Ich lese ein Buch', 'Я читаю книгу'],
        ['Lass uns zum Strand gehen', 'Идём на пляж'],
        ['Ich mag es, mit dir zu sprechen', 'Мне нравится с тобой говорить'],
        ['Ich will schlafen', 'Хочу спать'],
        ['Ich kann nicht gehen', 'Я не могу пойти'],
        ['Was machst du?', 'Что делаешь?'],
        ['Ich werde es tun', 'Я собираюсь это сделать']
      ]}
    ]
  },

  french: {
    name: 'Французский',
    emoji: '🇫🇷',
    locale: 'fr-FR',
    themes: [
      { name: 'Salutations / Приветствия', emoji: '👋', cards: [
        ['bonjour', 'привет / добрый день'], ['au revoir', 'до свидания'],
        ['bonsoir', 'добрый вечер'], ['bonne nuit', 'доброй ночи'],
        ['merci', 'спасибо'], ["s'il vous plaît", 'пожалуйста'],
        ['pardon', 'извините'], ['comment ça va?', 'как дела?'],
        ['très bien', 'очень хорошо'], ['ça va?', 'как оно?'],
        ['à bientôt', 'до скорого'], ['bienvenue', 'добро пожаловать'],
        ['santé', 'за здоровье'], ['à plus tard', 'до встречи'],
        ['salut', 'привет / пока']
      ], phrases: [
        ['Comment tu t\'appelles?', 'Как тебя зовут?'],
        ['Je m\'appelle Pierre', 'Меня зовут Пьер'],
        ['Enchanté', 'Приятно познакомиться'],
        ['D\'où viens-tu?', 'Откуда ты?'],
        ['Je viens de Russie', 'Я из России'],
        ['Parles-tu français?', 'Ты говоришь по-французски?'],
        ['Un peu', 'Немного'],
        ['Je ne comprends pas', 'Я не понимаю'],
        ['Peux-tu répéter?', 'Можешь повторить?'],
        ['À demain', 'До завтра']
      ]},
      { name: 'Nombres / Числа', emoji: '🔢', cards: [
        ['un', 'один'], ['deux', 'два'], ['trois', 'три'], ['quatre', 'четыре'],
        ['cinq', 'пять'], ['six', 'шесть'], ['sept', 'семь'], ['huit', 'восемь'],
        ['neuf', 'девять'], ['dix', 'десять'], ['onze', 'одиннадцать'],
        ['douze', 'двенадцать'], ['vingt', 'двадцать'], ['cent', 'сто'],
        ['mille', 'тысяча']
      ], phrases: [
        ['J\'ai vingt ans', 'Мне двадцать лет'],
        ['Ça coûte dix euros', 'Стоит десять евро'],
        ['Il est trois heures', 'Три часа'],
        ['Encore un', 'Ещё один'],
        ['Donne-moi deux, s\'il te plaît', 'Дай два, пожалуйста'],
        ['Il y a cinq personnes', 'Есть пять человек'],
        ['J\'habite au septième étage', 'Живу на седьмом этаже'],
        ['Cent pour cent', 'Сто процентов'],
        ['Mille mercis', 'Тысяча благодарностей'],
        ['Le premier mai', 'Первое мая']
      ]},
      { name: 'Couleurs / Цвета', emoji: '🎨', cards: [
        ['rouge', 'красный'], ['bleu', 'синий'], ['vert', 'зелёный'],
        ['jaune', 'жёлтый'], ['noir', 'чёрный'], ['blanc', 'белый'],
        ['gris', 'серый'], ['orange', 'оранжевый'], ['rose', 'розовый'],
        ['violet', 'фиолетовый'], ['marron', 'коричневый'], ['doré', 'золотой'],
        ['argenté', 'серебряный'], ['clair', 'светлый'], ['foncé', 'тёмный']
      ], phrases: [
        ['J\'aime le bleu', 'Мне нравится синий'],
        ['Le ciel est bleu', 'Небо синее'],
        ['J\'ai une voiture rouge', 'У меня красная машина'],
        ['L\'herbe est verte', 'Трава зелёная'],
        ['Une robe blanche', 'Белое платье'],
        ['Couleur préférée', 'Любимый цвет'],
        ['Il est noir', 'Он чёрный'],
        ['De quelle couleur est-il?', 'Какого он цвета?'],
        ['Un chat gris', 'Серый кот'],
        ['Jaune comme le soleil', 'Жёлтый как солнце']
      ]},
      { name: 'Nourriture / Еда', emoji: '🍕', cards: [
        ['pain', 'хлеб'], ['eau', 'вода'], ['lait', 'молоко'], ['café', 'кофе'],
        ['thé', 'чай'], ['pomme', 'яблоко'], ['orange', 'апельсин'],
        ['banane', 'банан'], ['viande', 'мясо'], ['poisson', 'рыба'],
        ['riz', 'рис'], ['œuf', 'яйцо'], ['fromage', 'сыр'],
        ['fruit', 'фрукт'], ['légume', 'овощ']
      ], phrases: [
        ['J\'ai faim', 'Я голоден'],
        ['J\'ai soif', 'Я хочу пить'],
        ['Que veux-tu manger?', 'Что ты хочешь есть?'],
        ['Un café, s\'il vous plaît', 'Один кофе, пожалуйста'],
        ['L\'addition, s\'il vous plaît', 'Счёт, пожалуйста'],
        ['C\'est délicieux', 'Это вкусно'],
        ['Je ne mange pas de viande', 'Я не ем мясо'],
        ['J\'aime le poisson', 'Мне нравится рыба'],
        ['Une table pour deux', 'Столик на двоих'],
        ['Bon appétit', 'Приятного аппетита']
      ]},
      { name: 'Animaux / Животные', emoji: '🐶', cards: [
        ['chien', 'собака'], ['chat', 'кошка'], ['oiseau', 'птица'],
        ['cheval', 'лошадь'], ['vache', 'корова'], ['cochon', 'свинья'],
        ['mouton', 'овца'], ['poisson', 'рыба'], ['souris', 'мышь'],
        ['ours', 'медведь'], ['loup', 'волк'], ['renard', 'лиса'],
        ['lapin', 'кролик'], ['lion', 'лев'], ['tigre', 'тигр']
      ], phrases: [
        ['J\'ai un chien', 'У меня есть собака'],
        ['Le chat dort', 'Кошка спит'],
        ['Les oiseaux chantent', 'Птицы поют'],
        ['J\'aime les animaux', 'Мне нравятся животные'],
        ['Un petit chien', 'Маленькая собака'],
        ['Le lion est le roi', 'Лев — король'],
        ['Mon animal préféré', 'Моё любимое животное'],
        ['Le poisson nage', 'Рыба плавает'],
        ['Tu as un animal?', 'У тебя есть питомец?'],
        ['Un chat noir', 'Чёрный кот']
      ]},
      { name: 'Famille / Семья', emoji: '👨‍👩‍👧', cards: [
        ['mère', 'мать'], ['père', 'отец'], ['fils', 'сын'], ['fille', 'дочь'],
        ['frère', 'брат'], ['sœur', 'сестра'], ['grand-père', 'дедушка'],
        ['grand-mère', 'бабушка'], ['oncle', 'дядя'], ['tante', 'тётя'],
        ['cousin', 'двоюродный'], ['mari', 'муж'], ['femme', 'жена'],
        ['famille', 'семья'], ['bébé', 'малыш']
      ], phrases: [
        ['Ma famille est grande', 'Моя семья большая'],
        ['J\'ai deux frères', 'У меня два брата'],
        ['Ma mère cuisine bien', 'Моя мама хорошо готовит'],
        ['Mon père travaille', 'Мой отец работает'],
        ['Ma grand-mère est gentille', 'Моя бабушка милая'],
        ['Tu as des frères?', 'У тебя есть братья?'],
        ['Nous sommes cinq', 'Нас пятеро'],
        ['Mon fils va à l\'école', 'Мой сын ходит в школу'],
        ['Je t\'aime, maman', 'Я люблю тебя, мама'],
        ['Ma famille est tout', 'Моя семья — это всё']
      ]},
      { name: 'Maison / Дом', emoji: '🏠', cards: [
        ['maison', 'дом'], ['porte', 'дверь'], ['fenêtre', 'окно'],
        ['table', 'стол'], ['chaise', 'стул'], ['lit', 'кровать'],
        ['cuisine', 'кухня'], ['salle de bain', 'ванная'], ['chambre', 'комната'],
        ['salon', 'гостиная'], ['mur', 'стена'], ['sol', 'пол'],
        ['plafond', 'потолок'], ['lampe', 'лампа'], ['miroir', 'зеркало']
      ], phrases: [
        ['Ma maison est ta maison', 'Мой дом — твой дом'],
        ['J\'habite dans un appartement', 'Я живу в квартире'],
        ['La porte est ouverte', 'Дверь открыта'],
        ['Ferme la fenêtre', 'Закрой окно'],
        ['Dans la cuisine', 'На кухне'],
        ['La salle de bain est là', 'Ванная там'],
        ['Ma chambre est petite', 'Моя комната маленькая'],
        ['Le lit est confortable', 'Кровать удобная'],
        ['Allume la lampe', 'Включи лампу'],
        ['Je suis à la maison', 'Я дома']
      ]},
      { name: 'Verbes / Глаголы', emoji: '⚡', cards: [
        ['être', 'быть'], ['avoir', 'иметь'], ['faire', 'делать'],
        ['aller', 'идти'], ['venir', 'приходить'], ['voir', 'видеть'],
        ['manger', 'есть'], ['boire', 'пить'], ['parler', 'говорить'],
        ['lire', 'читать'], ['écrire', 'писать'], ['dormir', 'спать'],
        ['vouloir', 'хотеть'], ['pouvoir', 'мочь'], ['aimer', 'любить']
      ], phrases: [
        ['Je veux apprendre le français', 'Хочу учить французский'],
        ['Peux-tu m\'aider?', 'Можешь мне помочь?'],
        ['Je vais au travail', 'Иду на работу'],
        ['Je lis un livre', 'Я читаю книгу'],
        ['Allons à la plage', 'Идём на пляж'],
        ['J\'aime parler avec toi', 'Мне нравится с тобой говорить'],
        ['Je veux dormir', 'Хочу спать'],
        ['Je ne peux pas aller', 'Я не могу пойти'],
        ['Que fais-tu?', 'Что делаешь?'],
        ['Je vais le faire', 'Я собираюсь это сделать']
      ]}
    ]
  },

  italian: {
    name: 'Итальянский',
    emoji: '🇮🇹',
    locale: 'it-IT',
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
      ], phrases: [
        ['Come ti chiami?', 'Как тебя зовут?'],
        ['Mi chiamo Pietro', 'Меня зовут Пьетро'],
        ['Piacere', 'Приятно познакомиться'],
        ['Di dove sei?', 'Откуда ты?'],
        ['Sono di Russia', 'Я из России'],
        ['Parli italiano?', 'Ты говоришь по-итальянски?'],
        ['Un po\'', 'Немного'],
        ['Non capisco', 'Я не понимаю'],
        ['Puoi ripetere?', 'Можешь повторить?'],
        ['A domani', 'До завтра']
      ]},
      { name: 'Numeri / Числа', emoji: '🔢', cards: [
        ['uno', 'один'], ['due', 'два'], ['tre', 'три'], ['quattro', 'четыре'],
        ['cinque', 'пять'], ['sei', 'шесть'], ['sette', 'семь'], ['otto', 'восемь'],
        ['nove', 'девять'], ['dieci', 'десять'], ['undici', 'одиннадцать'],
        ['dodici', 'двенадцать'], ['venti', 'двадцать'], ['cento', 'сто'],
        ['mille', 'тысяча']
      ], phrases: [
        ['Ho venti anni', 'Мне двадцать лет'],
        ['Costa dieci euro', 'Стоит десять евро'],
        ['Sono le tre', 'Три часа'],
        ['Uno in più', 'Ещё один'],
        ['Dammi due, per favore', 'Дай два, пожалуйста'],
        ['Ci sono cinque persone', 'Есть пять человек'],
        ['Vivo al settimo piano', 'Живу на седьмом этаже'],
        ['Cento per cento', 'Сто процентов'],
        ['Mille grazie', 'Тысяча благодарностей'],
        ['Il primo maggio', 'Первое мая']
      ]},
      { name: 'Colori / Цвета', emoji: '🎨', cards: [
        ['rosso', 'красный'], ['blu', 'синий'], ['verde', 'зелёный'],
        ['giallo', 'жёлтый'], ['nero', 'чёрный'], ['bianco', 'белый'],
        ['grigio', 'серый'], ['arancione', 'оранжевый'], ['rosa', 'розовый'],
        ['viola', 'фиолетовый'], ['marrone', 'коричневый'], ['dorato', 'золотой'],
        ['argentato', 'серебряный'], ['chiaro', 'светлый'], ['scuro', 'тёмный']
      ], phrases: [
        ['Mi piace il blu', 'Мне нравится синий'],
        ['Il cielo è blu', 'Небо синее'],
        ['Ho una macchina rossa', 'У меня красная машина'],
        ['L\'erba è verde', 'Трава зелёная'],
        ['Un vestito bianco', 'Белое платье'],
        ['Colore preferito', 'Любимый цвет'],
        ['È nero', 'Он чёрный'],
        ['Di che colore è?', 'Какого он цвета?'],
        ['Un gatto grigio', 'Серый кот'],
        ['Giallo come il sole', 'Жёлтый как солнце']
      ]},
      { name: 'Cibo / Еда', emoji: '🍕', cards: [
        ['pane', 'хлеб'], ['acqua', 'вода'], ['latte', 'молоко'], ['caffè', 'кофе'],
        ['tè', 'чай'], ['mela', 'яблоко'], ['arancia', 'апельсин'],
        ['banana', 'банан'], ['carne', 'мясо'], ['pesce', 'рыба'],
        ['riso', 'рис'], ['uovo', 'яйцо'], ['formaggio', 'сыр'],
        ['frutta', 'фрукт'], ['verdura', 'овощ']
      ], phrases: [
        ['Ho fame', 'Я голоден'],
        ['Ho sete', 'Я хочу пить'],
        ['Cosa vuoi mangiare?', 'Что ты хочешь есть?'],
        ['Un caffè, per favore', 'Один кофе, пожалуйста'],
        ['Il conto, per favore', 'Счёт, пожалуйста'],
        ['È delizioso', 'Это вкусно'],
        ['Non mangio carne', 'Я не ем мясо'],
        ['Mi piace il pesce', 'Мне нравится рыба'],
        ['Un tavolo per due', 'Столик на двоих'],
        ['Buon appetito', 'Приятного аппетита']
      ]},
      { name: 'Animali / Животные', emoji: '🐶', cards: [
        ['cane', 'собака'], ['gatto', 'кошка'], ['uccello', 'птица'],
        ['cavallo', 'лошадь'], ['mucca', 'корова'], ['maiale', 'свинья'],
        ['pecora', 'овца'], ['pesce', 'рыба'], ['topo', 'мышь'],
        ['orso', 'медведь'], ['lupo', 'волк'], ['volpe', 'лиса'],
        ['coniglio', 'кролик'], ['leone', 'лев'], ['tigre', 'тигр']
      ], phrases: [
        ['Ho un cane', 'У меня есть собака'],
        ['Il gatto dorme', 'Кошка спит'],
        ['Gli uccelli cantano', 'Птицы поют'],
        ['Mi piacciono gli animali', 'Мне нравятся животные'],
        ['Un cane piccolo', 'Маленькая собака'],
        ['Il leone è il re', 'Лев — король'],
        ['Il mio animale preferito', 'Моё любимое животное'],
        ['Il pesce nuota', 'Рыба плавает'],
        ['Hai un animale?', 'У тебя есть питомец?'],
        ['Un gatto nero', 'Чёрный кот']
      ]},
      { name: 'Famiglia / Семья', emoji: '👨‍👩‍👧', cards: [
        ['madre', 'мать'], ['padre', 'отец'], ['figlio', 'сын'], ['figlia', 'дочь'],
        ['fratello', 'брат'], ['sorella', 'сестра'], ['nonno', 'дедушка'],
        ['nonna', 'бабушка'], ['zio', 'дядя'], ['zia', 'тётя'],
        ['cugino', 'двоюродный'], ['marito', 'муж'], ['moglie', 'жена'],
        ['famiglia', 'семья'], ['bambino', 'малыш']
      ], phrases: [
        ['La mia famiglia è grande', 'Моя семья большая'],
        ['Ho due fratelli', 'У меня два брата'],
        ['Mia madre cucina bene', 'Моя мама хорошо готовит'],
        ['Mio padre lavora', 'Мой отец работает'],
        ['Mia nonna è simpatica', 'Моя бабушка милая'],
        ['Hai fratelli?', 'У тебя есть братья?'],
        ['Siamo cinque in famiglia', 'Нас пятеро в семье'],
        ['Mio figlio va a scuola', 'Мой сын ходит в школу'],
        ['Ti voglio bene, mamma', 'Я люблю тебя, мама'],
        ['La mia famiglia è tutto', 'Моя семья — это всё']
      ]},
      { name: 'Casa / Дом', emoji: '🏠', cards: [
        ['casa', 'дом'], ['porta', 'дверь'], ['finestra', 'окно'],
        ['tavolo', 'стол'], ['sedia', 'стул'], ['letto', 'кровать'],
        ['cucina', 'кухня'], ['bagno', 'ванная'], ['stanza', 'комната'],
        ['soggiorno', 'гостиная'], ['muro', 'стена'], ['pavimento', 'пол'],
        ['soffitto', 'потолок'], ['lampada', 'лампа'], ['specchio', 'зеркало']
      ], phrases: [
        ['Casa mia è casa tua', 'Мой дом — твой дом'],
        ['Vivo in un appartamento', 'Я живу в квартире'],
        ['La porta è aperta', 'Дверь открыта'],
        ['Chiudi la finestra', 'Закрой окно'],
        ['In cucina', 'На кухне'],
        ['Il bagno è là', 'Ванная там'],
        ['La mia stanza è piccola', 'Моя комната маленькая'],
        ['Il letto è comodo', 'Кровать удобная'],
        ['Accendi la lampada', 'Включи лампу'],
        ['Sono a casa', 'Я дома']
      ]},
      { name: 'Verbi / Глаголы', emoji: '⚡', cards: [
        ['essere', 'быть'], ['avere', 'иметь'], ['fare', 'делать'],
        ['andare', 'идти'], ['venire', 'приходить'], ['vedere', 'видеть'],
        ['mangiare', 'есть'], ['bere', 'пить'], ['parlare', 'говорить'],
        ['leggere', 'читать'], ['scrivere', 'писать'], ['dormire', 'спать'],
        ['volere', 'хотеть'], ['potere', 'мочь'], ['amare', 'любить']
      ], phrases: [
        ['Voglio imparare l\'italiano', 'Хочу учить итальянский'],
        ['Puoi aiutarmi?', 'Можешь мне помочь?'],
        ['Vado al lavoro', 'Иду на работу'],
        ['Sto leggendo un libro', 'Я читаю книгу'],
        ['Andiamo al mare', 'Идём на море'],
        ['Mi piace parlare con te', 'Мне нравится с тобой говорить'],
        ['Voglio dormire', 'Хочу спать'],
        ['Non posso andare', 'Я не могу пойти'],
        ['Cosa fai?', 'Что делаешь?'],
        ['Lo farò', 'Я это сделаю']
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
    locale: tpl.locale || 'en-US',
    isBuiltin: true,
    templateKey: templateKey,
    lessons: [],
    folders: [],
    phraseFolders: []
  };
  // Разбиваем каждую тему на уроки по 5 слов
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
    // Фразы — отдельной папкой
    if (theme.phrases && theme.phrases.length) {
      lang.phraseFolders.push({
        id: 'phrases_' + lang.id + '_' + lang.phraseFolders.length,
        name: theme.name,
        emoji: theme.emoji,
        isBuiltin: true,
        cards: theme.phrases.map(p => makePhraseCard(p[0], p[1]))
      });
    }
  });
  return lang;
}

/* ---------- ВСПОМОГАТЕЛЬНЫЕ ---------- */
function makeCard(front, back) {
  return {
    front, back, isPhrase: false,
    seen: 0, correct: 0, wrong: 0,
    star: false, hard: false,
    lastSeen: null, srsNext: null, srsLevel: 0
  };
}
function makePhraseCard(front, back) {
  return {
    front, back, isPhrase: true,
    seen: 0, correct: 0, wrong: 0,
    star: false, hard: false,
    lastSeen: null, srsNext: null, srsLevel: 0
  };
}
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ---------- СПИСОК ШАБЛОНОВ ---------- */
const AVAILABLE_TEMPLATES = [
  { key: 'spanish', name: 'Испанский',   emoji: '🇪🇸', desc: '8 тем · 120 слов · 80 фраз' },
  { key: 'english', name: 'Английский',  emoji: '🇬🇧', desc: '8 тем · 120 слов · 80 фраз' },
  { key: 'german',  name: 'Немецкий',    emoji: '🇩🇪', desc: '8 тем · 120 слов · 80 фраз' },
  { key: 'french',  name: 'Французский', emoji: '🇫🇷', desc: '8 тем · 120 слов · 80 фраз' },
  { key: 'italian', name: 'Итальянский', emoji: '🇮🇹', desc: '8 тем · 120 слов · 80 фраз' }
];
