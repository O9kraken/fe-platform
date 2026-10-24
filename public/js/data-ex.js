/* Практические задачи. mode: web (html/css/js), js, ts, react (jsx/css).
   tests: [название, тело async-функции]. Внутри доступны $, $$, css, ok, sleep, typeInto, src. */
const EX = [
/* ---------- Неделя 1 ---------- */
{id:"w1e1",l:"web",t:"Разбери адрес по частям",mode:"js",
 task:"У тебя есть адрес страницы. Браузер видит в нём протокол, домен, путь, параметры и якорь. Объект <code>URL</code> умеет разбирать адрес так же, как браузер.\n\nОбъяви переменные:\n- <code>protocol</code> — протокол (вместе с двоеточием)\n- <code>host</code> — домен без порта\n- <code>path</code> — путь\n- <code>color</code> — значение параметра color\n\nИспользуй свойства объекта <code>url</code>, а не готовые строки.",
 files:{js:`const url = new URL("https://shop.example.com:8080/catalog/shoes?color=red&size=42#reviews");

// Посмотри, что внутри:
console.log(url);

// Объяви переменные protocol, host, path, color
`},
 hints:["Свойства объекта URL: protocol, hostname, port, pathname, search, hash.","host включает порт, а hostname — нет. Нам нужен домен без порта.","Параметры читаются так: url.searchParams.get(\"имя\")."],
 tests:[["protocol = \"https:\"","return protocol === 'https:'"],
        ["host — домен без порта","return host === 'shop.example.com'"],
        ["path = \"/catalog/shoes\"","return path === '/catalog/shoes'"],
        ["color = \"red\"","return color === 'red'"],
        ["Значения взяты из url, а не вписаны руками","ok(/url\\.\\w+/.test(src.js),'Используй свойства url'); ok(/searchParams\\.get/.test(src.js),'Для color используй url.searchParams.get'); return true"]],
 sol:{js:`const url = new URL("https://shop.example.com:8080/catalog/shoes?color=red&size=42#reviews");

const protocol = url.protocol;
const host = url.hostname;
const path = url.pathname;
const color = url.searchParams.get("color");

console.log(protocol, host, path, color);`}},

/* ---------- Неделя 3 ---------- */
{id:"w3e1",l:"html1",t:"Страница «Обо мне»",mode:"web",
 task:"Собери страницу о себе:\n- заголовок <code>h1</code> с именем\n- пару абзацев о себе\n- маркированный список минимум из трёх навыков\n- картинку с описанием в <code>alt</code>\n- ссылку на внешний сайт (адрес начинается с https://)",
 files:{html:`<!-- Собери страницу «Обо мне» -->
<h1></h1>
`,css:"",js:""},
 hints:["Маркированный список — это ul, каждый пункт — li.","Картинка: <img src=\"photo.jpg\" alt=\"Что изображено\">. Файла нет — это нормально, проверяем разметку.","Ссылка: <a href=\"https://github.com\">GitHub</a>."],
 tests:[["Заголовок h1 с текстом","return ($('h1')?.textContent || '').trim().length > 0"],
        ["Минимум два абзаца","return $$('p').length >= 2"],
        ["Список из трёх и более пунктов","return $$('ul > li').length >= 3"],
        ["У картинки есть alt","const i = $('img'); ok(i, 'Нет тега img'); return (i.getAttribute('alt') || '').trim().length > 0"],
        ["Есть внешняя ссылка","return $$('a[href]').some(a => /^https?:\\/\\//.test(a.getAttribute('href')))"]],
 sol:{html:`<h1>Алексей Смирнов</h1>
<p>Учусь на frontend-разработчика. Люблю делать сайты с нуля.</p>
<p>Сейчас прохожу курс и собираю портфолио.</p>
<h2>Навыки</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>Основы JavaScript</li>
</ul>
<img src="photo.jpg" alt="Алексей за ноутбуком">
<p><a href="https://github.com">Мой GitHub</a></p>`,css:"",js:""}},

{id:"w3e2",l:"html1",t:"Страница рецепта",mode:"web",
 task:"Свёрстай рецепт любимого блюда:\n- <code>h1</code> — название блюда\n- <code>h2</code> «Ингредиенты» и маркированный список (минимум 2 пункта)\n- <code>h2</code> «Шаги» и <b>нумерованный</b> список (минимум 3 шага)\n- выдели важное слово тегом <code>strong</code>",
 files:{html:`<h1>Сырники</h1>
`,css:"",js:""},
 hints:["Нумерованный список — ol, маркированный — ul.","Заголовки идут по порядку: сначала h1, потом h2."],
 tests:[["Два заголовка h2","return $$('h2').length >= 2"],
        ["Ингредиенты списком ul","return $$('ul > li').length >= 2"],
        ["Шаги нумерованным списком ol","return $$('ol > li').length >= 3"],
        ["h1 стоит перед h2","const a = $('h1'), b = $('h2'); ok(a && b, 'Нужны h1 и h2'); return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)"],
        ["Есть strong","return !!$('strong')"]],
 sol:{html:`<h1>Сырники</h1>
<h2>Ингредиенты</h2>
<ul>
  <li>Творог — 400 г</li>
  <li>Яйцо — 1 шт.</li>
  <li>Мука — 3 ст. л.</li>
</ul>
<h2>Шаги</h2>
<ol>
  <li>Смешай творог с яйцом.</li>
  <li>Добавь муку и вымеси тесто.</li>
  <li>Обжарь на <strong>среднем</strong> огне по 3 минуты с каждой стороны.</li>
</ol>`,css:"",js:""}},

/* ---------- Неделя 4 ---------- */
{id:"w4e1",l:"html2",t:"Семантический каркас",mode:"web",
 task:"Перестрой страницу из безликих <code>div</code> на семантические теги: <code>header</code>, <code>nav</code>, <code>main</code>, <code>footer</code>. В меню должно быть минимум 3 ссылки.",
 files:{html:`<div class="top">
  <div class="logo">Студия</div>
  <div class="menu">
    <a href="#services">Услуги</a>
    <a href="#works">Работы</a>
    <a href="#contacts">Контакты</a>
  </div>
</div>
<div class="content">
  <h1>Делаем сайты, которые продают</h1>
  <p>Лендинги, интернет-магазины и корпоративные сайты.</p>
</div>
<div class="bottom">© 2026 Студия</div>
`,css:"",js:""},
 hints:["Шапка — header, меню внутри неё — nav.","Главное содержимое — main. Он на странице ровно один."],
 tests:[["Есть header","return !!$('header')"],
        ["Меню в nav, минимум 3 ссылки","return $$('nav a').length >= 3"],
        ["Ровно один main","return $$('main').length === 1"],
        ["h1 внутри main","return !!$('main h1')"],
        ["Есть footer","return !!$('footer')"]],
 sol:{html:`<header>
  <div class="logo">Студия</div>
  <nav>
    <a href="#services">Услуги</a>
    <a href="#works">Работы</a>
    <a href="#contacts">Контакты</a>
  </nav>
</header>
<main>
  <h1>Делаем сайты, которые продают</h1>
  <p>Лендинги, интернет-магазины и корпоративные сайты.</p>
</main>
<footer>© 2026 Студия</footer>`,css:"",js:""}},

{id:"w4e2",l:"html2",t:"Форма заявки",mode:"web",
 task:"Сделай форму заявки:\n- имя (обязательное поле)\n- email с типом <code>email</code>\n- телефон с типом <code>tel</code>\n- выбор услуги через <code>select</code> минимум из 2 вариантов\n- кнопка отправки\n\nУ каждого поля должна быть подпись <code>label</code>, связанная с полем.",
 files:{html:`<form>
  <!-- поля формы -->
</form>
`,css:"",js:""},
 hints:["Связь подписи и поля: <label for=\"email\">Email</label> <input id=\"email\" type=\"email\">.","Обязательное поле — атрибут required.","Кнопка внутри формы по умолчанию отправляет её: <button type=\"submit\">."],
 tests:[["Есть форма","return !!$('form')"],
        ["Поле email","return !!$('form input[type=email]')"],
        ["Поле телефона","return !!$('form input[type=tel]')"],
        ["Select минимум с 2 вариантами","const s = $('form select'); ok(s, 'Нет select'); return s.options.length >= 2"],
        ["Есть обязательное поле","return !!$('form [required]')"],
        ["У каждого поля есть label","const c = $$('form input, form select, form textarea').filter(e => !['submit','hidden','button'].includes(e.type)); ok(c.length >= 4, 'Полей меньше четырёх'); const bad = c.filter(e => !e.labels || !e.labels.length); ok(!bad.length, 'Без подписи: ' + bad.map(e => e.type || e.tagName.toLowerCase()).join(', ')); return true"],
        ["Кнопка отправки","const b = $('form button, form input[type=submit]'); return !!b && b.type === 'submit'"]],
 sol:{html:`<form>
  <label for="name">Имя</label>
  <input id="name" name="name" required>

  <label for="email">Email</label>
  <input id="email" name="email" type="email">

  <label for="phone">Телефон</label>
  <input id="phone" name="phone" type="tel">

  <label for="service">Услуга</label>
  <select id="service" name="service">
    <option>Лендинг</option>
    <option>Интернет-магазин</option>
  </select>

  <button type="submit">Отправить заявку</button>
</form>`,css:"form{display:grid;gap:6px;max-width:320px}",js:""}},

/* ---------- Неделя 5 ---------- */
{id:"w5e1",l:"html3",t:"Мета-теги для поиска и соцсетей",mode:"web",
 task:"Это полный HTML-документ. Добавь в него:\n- язык страницы <code>lang=\"ru\"</code>\n- <code>title</code> длиной 10–70 символов\n- <code>meta name=\"description\"</code> длиной 50–160 символов\n- <code>meta name=\"viewport\"</code> для мобильных\n- Open Graph: <code>meta property=\"og:title\"</code>",
 files:{html:`<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>Студия веб-дизайна</h1>
  <p>Сайты для малого бизнеса.</p>
</body>
</html>
`,css:"",js:""},
 hints:["lang ставится на тег html.","viewport: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.","Посчитай длину описания: в консоли document.querySelector('meta[name=description]').content.length."],
 tests:[["lang=\"ru\"","return document.documentElement.lang === 'ru'"],
        ["title 10–70 символов","const t = document.title.trim(); ok(t.length >= 10 && t.length <= 70, 'Сейчас ' + t.length + ' символов'); return true"],
        ["description 50–160 символов","const m = $('meta[name=description]'); ok(m, 'Нет meta description'); const l = (m.content || '').trim().length; ok(l >= 50 && l <= 160, 'Сейчас ' + l + ' символов'); return true"],
        ["viewport для мобильных","const m = $('meta[name=viewport]'); return !!m && /width=device-width/.test(m.content)"],
        ["og:title","return !!$('meta[property=\"og:title\"]')"]],
 sol:{html:`<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Студия веб-дизайна — сайты для бизнеса</title>
  <meta name="description" content="Делаем лендинги и интернет-магазины для малого бизнеса: дизайн, вёрстка, SEO и запуск за 3 недели.">
  <meta property="og:title" content="Студия веб-дизайна">
</head>
<body>
  <h1>Студия веб-дизайна</h1>
  <p>Сайты для малого бизнеса.</p>
</body>
</html>`,css:"",js:""}},

{id:"w5e2",l:"html3",t:"Навигация с текущей страницей",mode:"web",
 task:"Сделай меню сайта из трёх страниц: главная, услуги, контакты.\n- ссылки относительные (index.html, services.html, contacts.html)\n- текущая страница отмечена атрибутом <code>aria-current=\"page\"</code> (ровно одна ссылка)\n- выдели текущую ссылку стилем через селектор <code>[aria-current=\"page\"]</code>",
 files:{html:`<nav>
  <!-- ссылки -->
</nav>
`,css:"",js:""},
 hints:["Относительная ссылка не начинается с https://.","Селектор по атрибуту: a[aria-current=\"page\"] { font-weight: 700; }"],
 tests:[["Три ссылки в nav","return $$('nav a').length >= 3"],
        ["Ссылки относительные","return $$('nav a').every(a => { const h = a.getAttribute('href') || ''; return h && !/^https?:/.test(h); })"],
        ["Ровно одна текущая","return $$('nav a[aria-current=\"page\"]').length === 1"],
        ["Текущая выделена стилем","const cur = $('nav a[aria-current=\"page\"]'), other = $$('nav a').find(a => a !== cur); ok(cur && other, 'Нужны ссылки'); const a = getComputedStyle(cur), b = getComputedStyle(other); return a.color !== b.color || a.fontWeight !== b.fontWeight || a.backgroundColor !== b.backgroundColor || a.textDecorationLine !== b.textDecorationLine"]],
 sol:{html:`<nav>
  <a href="index.html">Главная</a>
  <a href="services.html" aria-current="page">Услуги</a>
  <a href="contacts.html">Контакты</a>
</nav>`,css:`nav { display: flex; gap: 16px; }
a[aria-current="page"] { font-weight: 700; color: #111; }`,js:""}},

/* ---------- Неделя 6 ---------- */
{id:"w6e1",l:"css1",t:"Кнопка из ссылки",mode:"web",
 task:"Преврати ссылку в кнопку:\n- внутренние отступы слева и справа не меньше 12px\n- цвет фона\n- скругление углов от 4px\n- без подчёркивания\n- <code>display: inline-block</code>, чтобы работали вертикальные отступы",
 files:{html:`<a class="btn" href="#">Заказать сайт</a>
`,css:`.btn {

}
`,js:""},
 hints:["padding: 12px 20px; — сверху-снизу 12, слева-справа 20.","Подчёркивание убирает text-decoration: none;"],
 tests:[["padding по бокам ≥ 12px","return parseFloat(css($('.btn'), 'paddingLeft')) >= 12 && parseFloat(css($('.btn'), 'paddingRight')) >= 12"],
        ["Есть фон","const c = css($('.btn'), 'backgroundColor'); return c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent'"],
        ["Скругление ≥ 4px","return parseFloat(css($('.btn'), 'borderTopLeftRadius')) >= 4"],
        ["Без подчёркивания","return css($('.btn'), 'textDecorationLine') === 'none'"],
        ["Блочно-строчный элемент","return ['inline-block','block','inline-flex','flex'].includes(css($('.btn'), 'display'))"]],
 sol:{html:`<a class="btn" href="#">Заказать сайт</a>`,css:`.btn {
  display: inline-block;
  padding: 12px 20px;
  background: #1f4fd8;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
}`,js:""}},

{id:"w6e2",l:"css1",t:"Битва специфичности",mode:"web",
 task:"Правило <code>#promo p</code> красит все абзацы в красный. Сделай абзац <code>.note</code> синим <code>#2563eb</code>.\n\nУсловия: не удаляй и не меняй исходное правило, не используй <code>!important</code>. Обычный абзац должен остаться красным.",
 files:{html:`<div id="promo">
  <p class="note">Скидка 20% до пятницы</p>
  <p>Обычный текст акции</p>
</div>
`,css:`#promo p { color: red; }

`,js:""},
 hints:["Селектор .note слабее, чем #promo p. Посчитай веса: id = 100, класс = 10, тег = 1.","Нужен селектор с id и классом: он весит 110, а #promo p — 101."],
 tests:[[".note синий","return css($('.note'), 'color') === 'rgb(37, 99, 235)'"],
        ["Обычный абзац остался красным","return css($('#promo p:not(.note)'), 'color') === 'rgb(255, 0, 0)'"],
        ["Без !important","return !/!\\s*important/i.test(src.css)"],
        ["Исходное правило на месте","return /#promo\\s+p\\s*\\{[^}]*color\\s*:\\s*red/.test(src.css)"]],
 sol:{html:`<div id="promo">
  <p class="note">Скидка 20% до пятницы</p>
  <p>Обычный текст акции</p>
</div>`,css:`#promo p { color: red; }

#promo .note { color: #2563eb; }`,js:""}},

/* ---------- Неделя 7 ---------- */
{id:"w7e1",l:"css2",t:"Шапка на Flexbox",mode:"web",
 task:"Свёрстай шапку: логотип слева, меню справа, всё выровнено по центру по вертикали. Пункты меню в ряд с промежутком от 8px.",
 files:{html:`<header class="header">
  <div class="logo">Студия</div>
  <nav class="menu">
    <a href="#">Услуги</a>
    <a href="#">Работы</a>
    <a href="#">Контакты</a>
  </nav>
</header>
`,css:`.header {

}

.menu {

}
`,js:""},
 hints:["display: flex на .header делает логотип и меню соседями в ряд.","Разнести по краям: justify-content: space-between.","Промежуток между пунктами меню — gap."],
 tests:[[".header — flex","return css($('.header'), 'display') === 'flex'"],
        ["Логотип и меню по краям","return css($('.header'), 'justifyContent') === 'space-between'"],
        ["Выравнивание по центру","return css($('.header'), 'alignItems') === 'center'"],
        [".menu — flex","return css($('.menu'), 'display') === 'flex'"],
        ["gap в меню ≥ 8px","return parseFloat(css($('.menu'), 'columnGap')) >= 8"]],
 sol:{html:`<header class="header">
  <div class="logo">Студия</div>
  <nav class="menu">
    <a href="#">Услуги</a>
    <a href="#">Работы</a>
    <a href="#">Контакты</a>
  </nav>
</header>`,css:`.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.menu {
  display: flex;
  gap: 16px;
}`,js:""}},

{id:"w7e2",l:"css2",t:"Три равные карточки",mode:"web",
 task:"Поставь карточки в ряд с промежутком от 16px. Карточки должны быть одинаковой ширины и высоты, хотя текст в них разной длины. Добавь им <code>box-sizing: border-box</code>.",
 files:{html:`<div class="cards">
  <article class="card"><h3>Лендинг</h3><p>Одна страница под рекламу.</p></article>
  <article class="card"><h3>Магазин</h3><p>Каталог, корзина, оплата, личный кабинет и интеграция с доставкой.</p></article>
  <article class="card"><h3>SEO</h3><p>Аудит и рост трафика.</p></article>
</div>
`,css:`.cards {

}

.card {
  border: 1px solid #ddd;
  padding: 12px;
}
`,js:""},
 hints:["Одинаковая ширина: flex: 1 у каждой карточки.","Одинаковая высота во flex-ряду получается сама: align-items по умолчанию stretch."],
 tests:[[".cards — flex","return css($('.cards'), 'display') === 'flex'"],
        ["gap ≥ 16px","return parseFloat(css($('.cards'), 'columnGap')) >= 16"],
        ["Одинаковая ширина","document.body.style.minWidth = '760px'; await sleep(30); const w = $$('.card').map(c => c.getBoundingClientRect().width); return Math.max(...w) - Math.min(...w) < 2"],
        ["Одинаковая высота","const h = $$('.card').map(c => c.getBoundingClientRect().height); return Math.max(...h) - Math.min(...h) < 2"],
        ["box-sizing: border-box","return css($('.card'), 'boxSizing') === 'border-box'"]],
 sol:{html:`<div class="cards">
  <article class="card"><h3>Лендинг</h3><p>Одна страница под рекламу.</p></article>
  <article class="card"><h3>Магазин</h3><p>Каталог, корзина, оплата, личный кабинет и интеграция с доставкой.</p></article>
  <article class="card"><h3>SEO</h3><p>Аудит и рост трафика.</p></article>
</div>`,css:`.cards {
  display: flex;
  gap: 16px;
}

.card {
  flex: 1;
  box-sizing: border-box;
  border: 1px solid #ddd;
  padding: 12px;
}`,js:""}},

/* ---------- Неделя 8 ---------- */
{id:"w8e1",l:"css3",t:"Резиновая галерея на Grid",mode:"web",
 task:"Сделай галерею, которая сама решает, сколько колонок поместится: каждая не уже 120px. Используй <code>repeat(auto-fit, minmax(...))</code> и промежуток от 8px. Поменяй ширину окна результата и посмотри, как перестраиваются колонки.",
 files:{html:`<div class="gallery">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  <div class="item">4</div><div class="item">5</div><div class="item">6</div>
</div>
`,css:`.item {
  background: #e7ecf3;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  font: 700 24px system-ui;
}

.gallery {

}
`,js:""},
 hints:["grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));","Не забудь display: grid."],
 tests:[[".gallery — grid","return css($('.gallery'), 'display') === 'grid'"],
        ["repeat(auto-fit | auto-fill, minmax())","return /repeat\\(\\s*auto-(fit|fill)\\s*,\\s*minmax\\(/.test(src.css)"],
        ["Промежуток ≥ 8px","return parseFloat(css($('.gallery'), 'rowGap')) >= 8 && parseFloat(css($('.gallery'), 'columnGap')) >= 8"],
        ["Колонки не уже 120px","return $$('.item').every(i => i.getBoundingClientRect().width >= 119)"]],
 sol:{html:`<div class="gallery">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  <div class="item">4</div><div class="item">5</div><div class="item">6</div>
</div>`,css:`.item {
  background: #e7ecf3;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  font: 700 24px system-ui;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}`,js:""}},

{id:"w8e2",l:"css3",t:"Меню по принципу mobile-first",mode:"web",
 task:"Сделай меню mobile-first:\n- по умолчанию <code>.menu</code> — flex-колонка (телефон)\n- в <code>@media (min-width: 600px)</code> — ряд\n- не используй <code>max-width</code> в медиазапросах",
 files:{html:`<nav class="menu">
  <a href="#">Главная</a>
  <a href="#">Услуги</a>
  <a href="#">Цены</a>
  <a href="#">Контакты</a>
</nav>
`,css:``,js:""},
 hints:["Сначала пиши правило для узкого экрана вне медиазапроса.","@media (min-width: 600px) { .menu { flex-direction: row; } }"],
 tests:[["Базовое .menu: flex и column","const r = [...$('#user-css').sheet.cssRules].find(r => r.selectorText === '.menu'); ok(r, 'Нет правила .menu вне медиазапроса'); ok(r.style.display === 'flex', '.menu должен быть flex'); return r.style.flexDirection === 'column'"],
        ["В @media (min-width) — row","const m = [...$('#user-css').sheet.cssRules].find(r => r.media && /min-width/.test(r.media.mediaText)); ok(m, 'Нет @media (min-width: …)'); return [...m.cssRules].some(r => r.selectorText === '.menu' && r.style.flexDirection === 'row')"],
        ["Без max-width","return ![...$('#user-css').sheet.cssRules].some(r => r.media && /max-width/.test(r.media.mediaText))"]],
 sol:{html:`<nav class="menu">
  <a href="#">Главная</a>
  <a href="#">Услуги</a>
  <a href="#">Цены</a>
  <a href="#">Контакты</a>
</nav>`,css:`.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 600px) {
  .menu {
    flex-direction: row;
    gap: 24px;
  }
}`,js:""}},

/* ---------- Неделя 9 ---------- */
{id:"w9e1",l:"css4",t:"Тема на CSS-переменных",mode:"web",
 task:"Объяви в <code>:root</code> переменную <code>--accent</code> и используй её для фона кнопки <code>.btn</code> и цвета ссылки <code>.link</code>. Тест поменяет переменную и проверит, что перекрасилось и то, и другое.",
 files:{html:`<button class="btn">Записаться</button>
<a class="link" href="#">Подробнее</a>
`,css:`:root {

}

.btn {
  color: #fff;
  border: 0;
  padding: 10px 16px;
  border-radius: 8px;
}
`,js:""},
 hints:["Объявление: --accent: #1f4fd8;","Использование: background: var(--accent);"],
 tests:[["--accent объявлена","return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() !== ''"],
        ["Фон .btn из --accent","document.documentElement.style.setProperty('--accent', 'rgb(1, 2, 3)'); const c = css($('.btn'), 'backgroundColor'); document.documentElement.style.removeProperty('--accent'); return c === 'rgb(1, 2, 3)'"],
        ["Цвет .link из --accent","document.documentElement.style.setProperty('--accent', 'rgb(1, 2, 3)'); const c = css($('.link'), 'color'); document.documentElement.style.removeProperty('--accent'); return c === 'rgb(1, 2, 3)'"]],
 sol:{html:`<button class="btn">Записаться</button>
<a class="link" href="#">Подробнее</a>`,css:`:root {
  --accent: #1f4fd8;
}

.btn {
  background: var(--accent);
  color: #fff;
  border: 0;
  padding: 10px 16px;
  border-radius: 8px;
}

.link { color: var(--accent); }`,js:""}},

{id:"w9e2",l:"css4",t:"Плавный hover с уважением к настройкам",mode:"web",
 task:"Сделай кнопке плавный hover:\n- <code>transition</code> длительностью больше нуля\n- в <code>.btn:hover</code> — сдвиг через <code>transform</code>\n- в <code>@media (prefers-reduced-motion: reduce)</code> отключи переход",
 files:{html:`<button class="btn">Наведи на меня</button>
`,css:`.btn {
  background: #1f4fd8;
  color: #fff;
  border: 0;
  padding: 12px 20px;
  border-radius: 8px;
}
`,js:""},
 hints:["transition: transform .2s ease;","translateY(-2px) поднимет кнопку на 2px."],
 tests:[["transition > 0","return parseFloat(css($('.btn'), 'transitionDuration')) > 0"],
        [".btn:hover с transform","return [...$('#user-css').sheet.cssRules].some(r => r.selectorText && r.selectorText.includes('.btn:hover') && r.style.transform)"],
        ["Есть prefers-reduced-motion","return [...$('#user-css').sheet.cssRules].some(r => r.media && /prefers-reduced-motion/.test(r.media.mediaText))"]],
 sol:{html:`<button class="btn">Наведи на меня</button>`,css:`.btn {
  background: #1f4fd8;
  color: #fff;
  border: 0;
  padding: 12px 20px;
  border-radius: 8px;
  transition: transform .2s ease, box-shadow .2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 79, 216, .35);
}

@media (prefers-reduced-motion: reduce) {
  .btn { transition: none; }
}`,js:""}},

/* ---------- Неделя 10 ---------- */
{id:"w10e1",l:"js1",t:"Калькулятор заказа",mode:"js",
 task:"Объяви переменные:\n- <code>price</code> — 1500, не меняется\n- <code>qty</code> — 3, может меняться (поэтому <code>let</code>)\n- <code>discount</code> — 0.1\n- <code>total</code> — итог: цена × количество со скидкой\n\nВыведи <code>total</code> в консоль.",
 files:{js:`// Калькулятор заказа

`},
 hints:["Со скидкой 10% платим 90%: умножь на (1 - discount).","Вывод в консоль: console.log(total);"],
 tests:[["price = 1500","return price === 1500"],
        ["qty = 3, объявлена через let","ok(qty === 3, 'qty должна быть 3'); return /\\blet\\s+qty\\b/.test(src.js)"],
        ["discount = 0.1","return discount === 0.1"],
        ["total = 4050","return Math.abs(total - 4050) < 1e-9"],
        ["Вывод в консоль","return /console\\.log\\s*\\(/.test(src.js)"]],
 sol:{js:`const price = 1500;
let qty = 3;
const discount = 0.1;

const total = price * qty * (1 - discount);
console.log(total);`}},

{id:"w10e2",l:"js1",t:"Шаблонная строка",mode:"js",
 task:"Собери строку <code>greeting</code> вида <code>Привет, Аня! Город: Казань.</code> из переменных <code>firstName</code> и <code>city</code> с помощью шаблонной строки (обратные кавычки и <code>${}</code>).",
 files:{js:`const firstName = "Аня";
const city = "Казань";

// const greeting = ...
`},
 hints:["Шаблонная строка пишется в обратных кавычках: \`Привет, ${имя}\`.","Обратная кавычка — клавиша Ё в английской раскладке."],
 tests:[["Строка совпадает","return greeting === 'Привет, ' + firstName + '! Город: ' + city + '.'"],
        ["Через шаблонную строку","return /\\x60[^\\x60]*\\$\\{\\s*firstName\\s*\\}/.test(src.js)"]],
 sol:{js:"const firstName = \"Аня\";\nconst city = \"Казань\";\n\nconst greeting = `Привет, ${firstName}! Город: ${city}.`;\nconsole.log(greeting);"}},

/* ---------- Неделя 11 ---------- */
{id:"w11e1",l:"js2",t:"Цена сайта по тарифу",mode:"js",
 task:"Допиши функцию <code>getPrice(type, urgent)</code>:\n- визитка — 20 000, лендинг — 35 000, магазин — 90 000\n- если <code>urgent</code> равно true — цена ×1.5\n- неизвестный тип — вернуть <code>null</code>",
 files:{js:`function getPrice(type, urgent) {
  // твой код
}

console.log(getPrice("лендинг", false)); // 35000
console.log(getPrice("лендинг", true));  // 52500
console.log(getPrice("блог", false));    // null
`},
 hints:["Сначала найди базовую цену через if / else if, потом примени срочность.","Для неизвестного типа сразу return null."],
 tests:[["визитка → 20000","return getPrice('визитка', false) === 20000"],
        ["лендинг → 35000","return getPrice('лендинг', false) === 35000"],
        ["магазин → 90000","return getPrice('магазин', false) === 90000"],
        ["срочный лендинг → 52500","return getPrice('лендинг', true) === 52500"],
        ["неизвестный тип → null","return getPrice('блог', true) === null"]],
 sol:{js:`function getPrice(type, urgent) {
  let price;
  if (type === "визитка") price = 20000;
  else if (type === "лендинг") price = 35000;
  else if (type === "магазин") price = 90000;
  else return null;

  return urgent ? price * 1.5 : price;
}`}},

{id:"w11e2",l:"js2",t:"Вход по билету",mode:"js",
 task:"Функция <code>canEnter(age, hasTicket)</code> возвращает <code>true</code>, только если возраст от 18 лет <b>и</b> есть билет. Во всех остальных случаях — <code>false</code>. Возвращай именно логическое значение.",
 files:{js:`function canEnter(age, hasTicket) {

}
`},
 hints:["Оператор «и» — &&.","Выражение age >= 18 && hasTicket === true уже логическое, его можно сразу вернуть."],
 tests:[["18 и билет → true","return canEnter(18, true) === true"],
        ["17 и билет → false","return canEnter(17, true) === false"],
        ["30 без билета → false","return canEnter(30, false) === false"],
        ["Возвращает boolean","return typeof canEnter(40, true) === 'boolean' && typeof canEnter(10, false) === 'boolean'"]],
 sol:{js:`function canEnter(age, hasTicket) {
  return age >= 18 && hasTicket === true;
}`}},

/* ---------- Неделя 12 ---------- */
{id:"w12e1",l:"js3",t:"Красивая цена",mode:"js",
 task:"Напиши <code>formatPrice(n)</code>: делит число на разряды обычным пробелом и добавляет знак рубля.\n- 1500 → <code>\"1 500 ₽\"</code>\n- 999 → <code>\"999 ₽\"</code>\n- 1234567 → <code>\"1 234 567 ₽\"</code>",
 files:{js:`function formatPrice(n) {

}

console.log(formatPrice(1234567));
`},
 hints:["Один из способов: превратить число в строку и идти с конца, вставляя пробел каждые 3 символа.","Короткий способ — регулярное выражение /\\B(?=(\\d{3})+(?!\\d))/g.","toLocaleString ставит неразрывный пробел, а тест ждёт обычный."],
 tests:[["1500 → \"1 500 ₽\"","return formatPrice(1500) === '1 500 ₽'"],
        ["999 → \"999 ₽\"","return formatPrice(999) === '999 ₽'"],
        ["1234567 → \"1 234 567 ₽\"","return formatPrice(1234567) === '1 234 567 ₽'"],
        ["0 → \"0 ₽\"","return formatPrice(0) === '0 ₽'"]],
 sol:{js:`function formatPrice(n) {
  const digits = String(n);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    const fromEnd = digits.length - i;
    out += digits[i];
    if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) out += " ";
  }
  return out + " ₽";
}`}},

{id:"w12e2",l:"js3",t:"Считаем гласные",mode:"js",
 task:"Напиши <code>countVowels(str)</code> — сколько русских гласных в строке (а е ё и о у ы э ю я), без учёта регистра. Используй цикл.",
 files:{js:`function countVowels(str) {

}
`},
 hints:["Приведи строку к нижнему регистру: str.toLowerCase().","Строка гласных \"аеёиоуыэюя\" и метод includes помогут проверить букву."],
 tests:[["«Привет» → 2","return countVowels('Привет') === 2"],
        ["«АЭРОПОРТ» → 4","return countVowels('АЭРОПОРТ') === 4"],
        ["«ёжик» → 2","return countVowels('ёжик') === 2"],
        ["пустая строка → 0","return countVowels('') === 0"],
        ["Есть цикл","return /\\bfor\\b|\\bwhile\\b/.test(src.js)"]],
 sol:{js:`function countVowels(str) {
  const vowels = "аеёиоуыэюя";
  let count = 0;
  for (const ch of str.toLowerCase()) {
    if (vowels.includes(ch)) count++;
  }
  return count;
}`}},

/* ---------- Неделя 13 ---------- */
{id:"w13e1",l:"js4",t:"Фильтр, поиск и сумма",mode:"js",
 task:"Напиши три функции для массива услуг:\n- <code>byCategory(list, cat)</code> — услуги нужной категории (через <code>filter</code>)\n- <code>search(list, q)</code> — услуги, в названии которых есть строка q, без учёта регистра\n- <code>total(list)</code> — сумма цен (через <code>reduce</code>)\n\nИсходный массив менять нельзя.",
 files:{js:`const services = [
  { name: "Лендинг", price: 35000, category: "сайты" },
  { name: "Магазин", price: 90000, category: "сайты" },
  { name: "SEO-аудит", price: 15000, category: "seo" },
  { name: "Контекстная реклама", price: 25000, category: "реклама" },
  { name: "Семантическое ядро", price: 12000, category: "seo" },
];

function byCategory(list, cat) {}
function search(list, q) {}
function total(list) {}

console.log(byCategory(services, "seo"));
`},
 hints:["filter возвращает новый массив тех элементов, для которых функция вернула true.","Поиск без регистра: s.name.toLowerCase().includes(q.toLowerCase()).","reduce: list.reduce((sum, s) => sum + s.price, 0)."],
 tests:[["byCategory(seo) → 2 услуги","const r = byCategory(services, 'seo'); return r.length === 2 && r.every(s => s.category === 'seo')"],
        ["search(\"ЛЕН\") → Лендинг","return JSON.stringify(search(services, 'ЛЕН').map(s => s.name)) === '[\"Лендинг\"]'"],
        ["total → 177000","return total(services) === 177000"],
        ["Исходный массив не изменён","byCategory(services, 'seo'); search(services, 'а'); return services.length === 5"],
        ["Есть filter и reduce","return /\\.filter\\(/.test(src.js) && /\\.reduce\\(/.test(src.js)"]],
 sol:{js:`const services = [
  { name: "Лендинг", price: 35000, category: "сайты" },
  { name: "Магазин", price: 90000, category: "сайты" },
  { name: "SEO-аудит", price: 15000, category: "seo" },
  { name: "Контекстная реклама", price: 25000, category: "реклама" },
  { name: "Семантическое ядро", price: 12000, category: "seo" },
];

function byCategory(list, cat) {
  return list.filter(s => s.category === cat);
}
function search(list, q) {
  const needle = q.toLowerCase();
  return list.filter(s => s.name.toLowerCase().includes(needle));
}
function total(list) {
  return list.reduce((sum, s) => sum + s.price, 0);
}`}},

{id:"w13e2",l:"js4",t:"Группировка по категориям",mode:"js",
 task:"Напиши:\n- <code>groupNames(list)</code> → объект вида <code>{ \"сайты\": [\"Лендинг\", \"Магазин\"], ... }</code>\n- <code>mostExpensive(list)</code> → объект самой дорогой услуги",
 files:{js:`const services = [
  { name: "Лендинг", price: 35000, category: "сайты" },
  { name: "Магазин", price: 90000, category: "сайты" },
  { name: "SEO-аудит", price: 15000, category: "seo" },
  { name: "Контекстная реклама", price: 25000, category: "реклама" },
  { name: "Семантическое ядро", price: 12000, category: "seo" },
];

function groupNames(list) {}
function mostExpensive(list) {}

console.log(groupNames(services));
`},
 hints:["Начни с пустого объекта: const out = {}. Для каждой услуги: если out[s.category] нет — создай пустой массив, затем push.","Самую дорогую удобно найти через reduce: (max, s) => s.price > max.price ? s : max."],
 tests:[["Группировка верная","return JSON.stringify(groupNames(services)) === JSON.stringify({'сайты':['Лендинг','Магазин'],'seo':['SEO-аудит','Семантическое ядро'],'реклама':['Контекстная реклама']})"],
        ["Самая дорогая — Магазин","return mostExpensive(services).name === 'Магазин'"],
        ["mostExpensive возвращает объект услуги","return mostExpensive(services) === services[1]"]],
 sol:{js:`const services = [
  { name: "Лендинг", price: 35000, category: "сайты" },
  { name: "Магазин", price: 90000, category: "сайты" },
  { name: "SEO-аудит", price: 15000, category: "seo" },
  { name: "Контекстная реклама", price: 25000, category: "реклама" },
  { name: "Семантическое ядро", price: 12000, category: "seo" },
];

function groupNames(list) {
  const out = {};
  for (const s of list) {
    if (!out[s.category]) out[s.category] = [];
    out[s.category].push(s.name);
  }
  return out;
}

function mostExpensive(list) {
  return list.reduce((max, s) => (s.price > max.price ? s : max));
}`}},

/* ---------- Неделя 14 ---------- */
{id:"w14e1",l:"js5",t:"Счётчик кликов",mode:"web",
 task:"Оживи счётчик:\n- «+» увеличивает число на 1\n- «−» уменьшает, но не ниже нуля\n- «Сброс» возвращает 0",
 files:{html:`<p>Счёт: <span id="count">0</span></p>
<button id="minus">−</button>
<button id="plus">+</button>
<button id="reset">Сброс</button>
`,css:`button { font-size: 18px; min-width: 44px; padding: 6px 12px; }`,js:`const countEl = document.querySelector("#count");
let count = 0;

// повесь обработчики на кнопки
`},
 hints:["document.querySelector(\"#plus\").addEventListener(\"click\", () => { ... });","После изменения count обнови countEl.textContent = count.","Не ниже нуля: if (count > 0) count--;"],
 tests:[["+ дважды → 2","$('#plus').click(); $('#plus').click(); return $('#count').textContent.trim() === '2'"],
        ["− → 1","$('#minus').click(); return $('#count').textContent.trim() === '1'"],
        ["Сброс → 0","$('#reset').click(); return $('#count').textContent.trim() === '0'"],
        ["Не уходит в минус","$('#minus').click(); $('#minus').click(); return $('#count').textContent.trim() === '0'"]],
 sol:{html:`<p>Счёт: <span id="count">0</span></p>
<button id="minus">−</button>
<button id="plus">+</button>
<button id="reset">Сброс</button>`,css:`button { font-size: 18px; min-width: 44px; padding: 6px 12px; }`,js:`const countEl = document.querySelector("#count");
let count = 0;

function render() {
  countEl.textContent = count;
}

document.querySelector("#plus").addEventListener("click", () => {
  count++;
  render();
});
document.querySelector("#minus").addEventListener("click", () => {
  if (count > 0) count--;
  render();
});
document.querySelector("#reset").addEventListener("click", () => {
  count = 0;
  render();
});`}},

{id:"w14e2",l:"js5",t:"Список задач",mode:"web",
 task:"Сделай список задач:\n- отправка формы добавляет <code>li</code> с текстом в <code>#list</code>\n- пустой текст (или пробелы) не добавляется\n- после добавления поле очищается\n- в каждом пункте есть кнопка удаления\n- страница не перезагружается при отправке",
 files:{html:`<form id="todo-form">
  <label for="todo-input">Задача</label>
  <input id="todo-input" autocomplete="off">
  <button>Добавить</button>
</form>
<ul id="list"></ul>
`,css:`li { display: flex; gap: 8px; align-items: center; margin: 4px 0; }`,js:`const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#list");

`},
 hints:["Слушай событие submit у формы и первым делом вызови event.preventDefault().","Обрезать пробелы: input.value.trim().","Создать элемент: document.createElement(\"li\"); текст — через textContent, не innerHTML.","Удаление: внутри обработчика кнопки вызови li.remove()."],
 tests:[["Задача добавляется","const i = $('#todo-input'); i.value = 'Купить хлеб'; $('#todo-form').requestSubmit(); await sleep(50); return $$('#list li').length === 1 && $('#list li').textContent.includes('Купить хлеб')"],
        ["Пустая не добавляется","$('#todo-input').value = '   '; $('#todo-form').requestSubmit(); await sleep(50); return $$('#list li').length === 1"],
        ["Поле очищается","$('#todo-input').value = 'Позвонить'; $('#todo-form').requestSubmit(); await sleep(50); ok($$('#list li').length === 2, 'Вторая задача не добавилась'); return $('#todo-input').value === ''"],
        ["Удаление работает","const b = $('#list li button'); ok(b, 'В пункте нет кнопки удаления'); b.click(); await sleep(30); return $$('#list li').length === 1"]],
 sol:{html:`<form id="todo-form">
  <label for="todo-input">Задача</label>
  <input id="todo-input" autocomplete="off">
  <button>Добавить</button>
</form>
<ul id="list"></ul>`,css:`li { display: flex; gap: 8px; align-items: center; margin: 4px 0; }`,js:`const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#list");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = text;

  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "Удалить";
  del.addEventListener("click", () => li.remove());

  li.append(span, del);
  list.append(li);
  input.value = "";
});`}},

/* ---------- Неделя 15 ---------- */
{id:"w15e1",l:"js6",t:"Загрузка пользователя",mode:"js",
 prelude:`const USERS = { 1: "Анна", 2: "Борис", 3: "Вика" };
window.__calls = 0;
function fakeApi(id) {
  window.__calls++;
  return new Promise((resolve, reject) => setTimeout(() => {
    if (USERS[id]) resolve({ id, name: USERS[id] });
    else reject(new Error("Пользователь не найден"));
  }, 100));
}`,
 task:"Функция <code>fakeApi(id)</code> уже есть: через 100 мс она возвращает <code>{ id, name }</code> или ошибку «Пользователь не найден».\n\nНапиши <code>async function loadUserName(id)</code>:\n- при успехе возвращает имя\n- при ошибке возвращает строку <code>\"Ошибка: \" + текст ошибки</code>\n\nИспользуй <code>await</code> и <code>try/catch</code>.",
 files:{js:`// fakeApi(id) уже объявлена. Попробуй:
fakeApi(1).then(user => console.log(user));

async function loadUserName(id) {

}
`},
 hints:["Внутри try: const user = await fakeApi(id); return user.name;","В catch (error) доступен error.message."],
 tests:[["Успех → имя","return (await loadUserName(1)) === 'Анна'"],
        ["Ошибка → «Ошибка: …»","return (await loadUserName(9)) === 'Ошибка: Пользователь не найден'"],
        ["Функция асинхронная","return loadUserName(2) instanceof Promise"],
        ["Есть try и await","return /\\btry\\b/.test(src.js) && /\\bawait\\b/.test(src.js)"]],
 sol:{js:`async function loadUserName(id) {
  try {
    const user = await fakeApi(id);
    return user.name;
  } catch (error) {
    return "Ошибка: " + error.message;
  }
}

loadUserName(1).then(console.log);`}},

{id:"w15e2",l:"js6",t:"Параллельные запросы",mode:"js",
 prelude:`const USERS = { 1: "Анна", 2: "Борис", 3: "Вика" };
function fakeApi(id) {
  return new Promise((resolve, reject) => setTimeout(() => {
    if (USERS[id]) resolve({ id, name: USERS[id] });
    else reject(new Error("Пользователь не найден"));
  }, 100));
}`,
 task:"Напиши <code>async function loadAll(ids)</code>, которая возвращает массив имён. Запросы должны идти <b>параллельно</b>: три запроса по 100 мс должны занять примерно 100 мс, а не 300.",
 files:{js:`async function loadAll(ids) {

}

loadAll([1, 2, 3]).then(console.log);
`},
 hints:["Запросы по очереди в цикле с await — это последовательно.","Создай все промисы сразу: ids.map(id => fakeApi(id)), затем await Promise.all(...)."],
 tests:[["Возвращает имена по порядку","return JSON.stringify(await loadAll([1, 2, 3])) === '[\"Анна\",\"Борис\",\"Вика\"]'"],
        ["Запросы параллельные","const t = performance.now(); await loadAll([1, 2, 3]); const dt = performance.now() - t; ok(dt < 250, 'Заняло ' + Math.round(dt) + ' мс — похоже, запросы идут по очереди'); return true"]],
 sol:{js:`async function loadAll(ids) {
  const users = await Promise.all(ids.map(id => fakeApi(id)));
  return users.map(u => u.name);
}

loadAll([1, 2, 3]).then(console.log);`}},

/* ---------- Неделя 16 ---------- */
{id:"w16e1",l:"js7",t:"Debounce для поиска",mode:"js",
 task:"В поиске нельзя отправлять запрос на каждую букву. Напиши <code>debounce(fn, ms)</code>: возвращает новую функцию, которая вызывает <code>fn</code> только когда после последнего вызова прошло <code>ms</code> миллисекунд. Аргументы последнего вызова передаются в <code>fn</code>.",
 files:{js:`function debounce(fn, ms) {

}

const log = debounce((text) => console.log("Ищу:", text), 300);
log("к");
log("ко");
log("кот"); // через 300 мс выведется только «Ищу: кот»
`},
 hints:["Храни id таймера в переменной снаружи возвращаемой функции (замыкание).","При каждом вызове: clearTimeout(timer); timer = setTimeout(() => fn(...args), ms);"],
 tests:[["Вызывается один раз после паузы","let n = 0; const d = debounce(() => n++, 50); d(); d(); d(); await sleep(20); ok(n === 0, 'Функция вызвалась раньше времени'); await sleep(90); return n === 1"],
        ["Передаёт аргументы последнего вызова","let got; const d = debounce(x => { got = x; }, 30); d(1); d(2); await sleep(70); return got === 2"],
        ["Независимые экземпляры","let a = 0, b = 0; const da = debounce(() => a++, 30), db = debounce(() => b++, 30); da(); db(); await sleep(70); return a === 1 && b === 1"]],
 sol:{js:`function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`}},

/* ---------- Неделя 17 ---------- */
{id:"w17e1",l:"ts",t:"Типизированные задачи",mode:"ts",
 task:"Опиши тип <code>Task</code>: <code>id</code> — число, <code>title</code> — строка, <code>done</code> — логическое.\n\nНапиши <code>toggle(tasks: Task[], id: number): Task[]</code> — возвращает <b>новый</b> массив, где у задачи с этим id перевёрнут <code>done</code>. Исходный массив и объекты не меняются.\n\nВ песочнице типы не проверяются, а только удаляются. Пиши их так, будто проверяются.",
 files:{ts:`// type Task = ...

function toggle(tasks, id) {

}
`},
 hints:["type Task = { id: number; title: string; done: boolean };","Новый массив через map, новый объект через спред: { ...t, done: !t.done }."],
 tests:[["Тип Task описан","return /(type|interface)\\s+Task\\b/.test(src.ts)"],
        ["Параметры и результат типизированы","return /toggle\\s*\\([^)]*:\\s*Task\\[\\][^)]*:\\s*number[^)]*\\)\\s*:\\s*Task\\[\\]/.test(src.ts)"],
        ["Переключает нужную задачу","const r = toggle([{id:1,title:'A',done:false},{id:2,title:'B',done:true}], 1); return r[0].done === true && r[1].done === true"],
        ["Не меняет исходные данные","const a = [{id:1,title:'A',done:false}]; const r = toggle(a, 1); ok(r !== a, 'Нужно вернуть новый массив'); ok(r[0] !== a[0], 'Нужно вернуть новый объект задачи'); return a[0].done === false"]],
 sol:{ts:`type Task = {
  id: number;
  title: string;
  done: boolean;
};

function toggle(tasks: Task[], id: number): Task[] {
  return tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
}

console.log(toggle([{ id: 1, title: "Сверстать шапку", done: false }], 1));`}},

{id:"w17e2",l:"ts",t:"Union-тип",mode:"ts",
 task:"Напиши <code>formatId(id: string | number): string</code>:\n- число → <code>#</code> и 4 цифры с ведущими нулями: 7 → <code>\"#0007\"</code>\n- строка → без пробелов по краям и в верхнем регистре: <code>\" ab-12 \"</code> → <code>\"AB-12\"</code>",
 files:{ts:`function formatId(id) {

}
`},
 hints:["Различай варианты через typeof id === \"number\".","String(id).padStart(4, \"0\") добавит ведущие нули."],
 tests:[["Union в сигнатуре","return /id\\s*:\\s*(string\\s*\\|\\s*number|number\\s*\\|\\s*string)/.test(src.ts)"],
        ["7 → \"#0007\"","return formatId(7) === '#0007'"],
        ["12345 → \"#12345\"","return formatId(12345) === '#12345'"],
        ["\" ab-12 \" → \"AB-12\"","return formatId(' ab-12 ') === 'AB-12'"]],
 sol:{ts:`function formatId(id: string | number): string {
  if (typeof id === "number") {
    return "#" + String(id).padStart(4, "0");
  }
  return id.trim().toUpperCase();
}`}},

/* ---------- Неделя 18 ---------- */
{id:"w18e1",l:"react1",t:"Карточки из массива",mode:"react",
 task:"Допиши компонент <code>Card</code>: он возвращает <code>&lt;article className=\"card\"&gt;</code> с названием и ценой из props. В <code>App</code> выведи карточки через <code>services.map</code> с атрибутом <code>key</code>.",
 files:{jsx:`const services = [
  { id: 1, title: "Лендинг", price: 35000 },
  { id: 2, title: "Магазин", price: 90000 },
  { id: 3, title: "SEO-аудит", price: 15000 },
];

function Card(props) {
  // верни <article className="card"> с названием и ценой
  return null;
}

function App() {
  return (
    <main>
      <h1>Услуги</h1>
      {/* выведи карточки через services.map */}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,css:`.card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 8px 0; }`},
 hints:["Внутри Card: return <article className=\"card\"><h2>{props.title}</h2><p>{props.price} ₽</p></article>;","В App: {services.map(s => <Card key={s.id} title={s.title} price={s.price} />)}"],
 tests:[["Три карточки","return $$('.card').length === 3"],
        ["Названия по порядку","const t = $$('.card').map(c => c.textContent); return t[0].includes('Лендинг') && t[1].includes('Магазин') && t[2].includes('SEO-аудит')"],
        ["Цены выведены","return $$('.card')[1].textContent.replace(/\\D/g, '').includes('90000')"],
        ["Есть key","return /key=\\{/.test(src.jsx)"]],
 sol:{jsx:`const services = [
  { id: 1, title: "Лендинг", price: 35000 },
  { id: 2, title: "Магазин", price: 90000 },
  { id: 3, title: "SEO-аудит", price: 15000 },
];

function Card({ title, price }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <p>{price.toLocaleString("ru-RU")} ₽</p>
    </article>
  );
}

function App() {
  return (
    <main>
      <h1>Услуги</h1>
      {services.map(s => (
        <Card key={s.id} title={s.title} price={s.price} />
      ))}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,css:`.card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 8px 0; }`}},

{id:"w18e2",l:"react1",t:"Обёртка через children",mode:"react",
 task:"Сделай компонент <code>Panel</code> с пропсами <code>title</code> и <code>children</code>. Он рисует <code>&lt;section className=\"panel\"&gt;</code> с заголовком <code>h2</code> и вложенным содержимым. В <code>App</code> используй две панели с абзацами внутри.",
 files:{jsx:`function Panel({ title, children }) {
  return null;
}

function App() {
  return (
    <div>
      {/* <Panel title="...">...</Panel> */}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,css:`.panel { border: 1px solid #ccc; border-radius: 8px; padding: 12px; margin-bottom: 12px; }`},
 hints:["children — всё, что написано между открывающим и закрывающим тегом компонента.","return <section className=\"panel\"><h2>{title}</h2>{children}</section>;"],
 tests:[["Минимум две панели","return $$('.panel').length >= 2"],
        ["В каждой есть h2","return $$('.panel').every(p => p.querySelector('h2') && p.querySelector('h2').textContent.trim())"],
        ["Содержимое передано через children","return $$('.panel').every(p => p.querySelector('p'))"]],
 sol:{jsx:`function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function App() {
  return (
    <div>
      <Panel title="О студии">
        <p>Делаем сайты с 2020 года.</p>
      </Panel>
      <Panel title="Контакты">
        <p>hello@studio.dev</p>
      </Panel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,css:`.panel { border: 1px solid #ccc; border-radius: 8px; padding: 12px; margin-bottom: 12px; }`}},

/* ---------- Неделя 19 ---------- */
{id:"w19e1",l:"react2",t:"Счётчик на useState",mode:"react",
 task:"Сделай счётчик: <code>&lt;span id=\"count\"&gt;</code> с числом, кнопки <code>#minus</code> и <code>#plus</code>. Минус не опускает число ниже нуля.",
 files:{jsx:`function Counter() {
  // const [count, setCount] = useState(0);
  return (
    <div>
      <span id="count">0</span>
      <button id="minus">−</button>
      <button id="plus">+</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
`,css:`button { font-size: 18px; min-width: 44px; margin-left: 8px; }`},
 hints:["useState уже доступен без импорта.","onClick={() => setCount(c => c + 1)}","Для минуса: setCount(c => Math.max(0, c - 1))."],
 tests:[["Начинается с 0","return $('#count').textContent.trim() === '0'"],
        ["+ дважды → 2","$('#plus').click(); await sleep(10); $('#plus').click(); await sleep(30); return $('#count').textContent.trim() === '2'"],
        ["Не ниже нуля","for (let i = 0; i < 3; i++) { $('#minus').click(); await sleep(10); } await sleep(20); return $('#count').textContent.trim() === '0'"],
        ["Используется useState","return /useState\\s*\\(/.test(src.jsx)"]],
 sol:{jsx:`function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span id="count">{count}</span>
      <button id="minus" onClick={() => setCount(c => Math.max(0, c - 1))}>−</button>
      <button id="plus" onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);`,css:`button { font-size: 18px; min-width: 44px; margin-left: 8px; }`}},

{id:"w19e2",l:"react2",t:"Живой поиск",mode:"react",
 task:"Сделай поле <code>#search</code> и список фруктов. При вводе список фильтруется без учёта регистра. Поле управляемое: <code>value</code> из state.",
 files:{jsx:`const fruits = ["Яблоко", "Груша", "Банан", "Ананас", "Абрикос"];

function App() {
  return (
    <div>
      <label htmlFor="search">Поиск</label>
      <input id="search" />
      <ul>
        {fruits.map(f => <li key={f}>{f}</li>)}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,css:``},
 hints:["const [query, setQuery] = useState(\"\");","<input value={query} onChange={e => setQuery(e.target.value)} />","Отфильтруй перед map: fruits.filter(f => f.toLowerCase().includes(query.toLowerCase()))."],
 tests:[["Сначала 5 пунктов","return $$('li').length === 5"],
        ["«ан» → Банан и Ананас","typeInto('#search', 'ан'); await sleep(40); const t = $$('li').map(l => l.textContent); return t.length === 2 && t.includes('Банан') && t.includes('Ананас')"],
        ["Очистка возвращает всё","typeInto('#search', ''); await sleep(40); return $$('li').length === 5"],
        ["Управляемое поле","return /value=\\{/.test(src.jsx)"]],
 sol:{jsx:`const fruits = ["Яблоко", "Груша", "Банан", "Ананас", "Абрикос"];

function App() {
  const [query, setQuery] = useState("");
  const visible = fruits.filter(f => f.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <label htmlFor="search">Поиск</label>
      <input id="search" value={query} onChange={e => setQuery(e.target.value)} />
      <ul>
        {visible.map(f => <li key={f}>{f}</li>)}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,css:``}},

/* ---------- Неделя 20 ---------- */
{id:"w20e1",l:"react3",t:"Загрузка в useEffect",mode:"react",delay:30,
 prelude:`window.__calls = 0;
function fetchServices() {
  window.__calls++;
  return new Promise(r => setTimeout(() => r(["Лендинг", "Магазин", "SEO-аудит"]), 150));
}`,
 task:"Функция <code>fetchServices()</code> уже есть и через 150 мс возвращает массив названий. Загрузи их в <code>useEffect</code> при первом рендере. Пока данных нет — покажи текст «Загрузка…», потом список <code>li</code>. Запрос должен уйти ровно один раз.",
 files:{jsx:`function App() {
  return <p>Загрузка…</p>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,css:``},
 hints:["Два состояния: const [items, setItems] = useState(null);","useEffect(() => { fetchServices().then(setItems); }, []); — пустой массив, чтобы запрос был один.","if (!items) return <p>Загрузка…</p>;"],
 tests:[["Сначала «Загрузка…»","return document.body.textContent.includes('Загрузка')"],
        ["Потом список","await sleep(300); return $$('li').length === 3"],
        ["Ровно один запрос","await sleep(100); ok(window.__calls === 1, 'Запросов: ' + window.__calls + '. Проверь массив зависимостей'); return true"]],
 sol:{jsx:`function App() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    fetchServices().then(setItems);
  }, []);

  if (!items) return <p>Загрузка…</p>;

  return (
    <ul>
      {items.map(name => <li key={name}>{name}</li>)}
    </ul>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,css:``}},

{id:"w20e2",l:"react3",t:"Заголовок вкладки",mode:"react",
 task:"Сделай счётчик с кнопкой <code>#plus</code>. Через <code>useEffect</code> синхронизируй заголовок вкладки: <code>document.title</code> = <code>\"Счёт: N\"</code>.",
 files:{jsx:`function App() {
  const [count, setCount] = useState(0);

  return <button id="plus" onClick={() => setCount(c => c + 1)}>Нажато: {count}</button>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,css:``},
 hints:["useEffect(() => { document.title = ... }, [count]);"],
 tests:[["После рендера «Счёт: 0»","return document.title === 'Счёт: 0'"],
        ["После клика «Счёт: 1»","$('#plus').click(); await sleep(40); return document.title === 'Счёт: 1'"],
        ["Зависимость count","return /useEffect[\\s\\S]*\\[\\s*count\\s*\\]/.test(src.jsx)"]],
 sol:{jsx:"function App() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `Счёт: ${count}`;\n  }, [count]);\n\n  return <button id=\"plus\" onClick={() => setCount(c => c + 1)}>Нажато: {count}</button>;\n}\n\nReactDOM.createRoot(document.getElementById(\"root\")).render(<App />);",css:``}},

/* ---------- Неделя 21 ---------- */
{id:"w21e1",l:"react4",t:"Вкладки",mode:"react",
 task:"Сделай вкладки: три кнопки <code>.tab</code> и блок <code>.panel</code> с текстом активной вкладки. У активной кнопки <code>aria-selected=\"true\"</code>, у остальных <code>\"false\"</code>. По умолчанию открыта первая. Это тот же принцип, что у роутера: что показывать, решает одно значение состояния.",
 files:{jsx:`const tabs = [
  { id: "about", label: "О нас", text: "Мы делаем сайты" },
  { id: "price", label: "Цены", text: "От 20 000 ₽" },
  { id: "contacts", label: "Контакты", text: "hello@studio.dev" },
];

function App() {
  return (
    <div>
      {/* кнопки .tab и блок .panel */}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,css:`.tab { margin-right: 6px; padding: 6px 12px; }
.tab[aria-selected="true"] { background: #1f4fd8; color: #fff; }
.panel { margin-top: 12px; }`},
 hints:["const [active, setActive] = useState(tabs[0].id);","aria-selected={t.id === active} — React сам превратит boolean в строку.","Текст панели: tabs.find(t => t.id === active).text"],
 tests:[["Три вкладки","return $$('.tab').length === 3"],
        ["Первая открыта по умолчанию","return $('.panel').textContent.includes('Мы делаем сайты') && $$('.tab')[0].getAttribute('aria-selected') === 'true'"],
        ["Клик переключает","$$('.tab')[1].click(); await sleep(30); return $('.panel').textContent.includes('От 20 000')"],
        ["aria-selected обновляется","return $$('.tab').map(t => t.getAttribute('aria-selected')).join() === 'false,true,false'"]],
 sol:{jsx:`const tabs = [
  { id: "about", label: "О нас", text: "Мы делаем сайты" },
  { id: "price", label: "Цены", text: "От 20 000 ₽" },
  { id: "contacts", label: "Контакты", text: "hello@studio.dev" },
];

function App() {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find(t => t.id === active);

  return (
    <div>
      <div role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            className="tab"
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="panel" role="tabpanel">{current.text}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,css:`.tab { margin-right: 6px; padding: 6px 12px; }
.tab[aria-selected="true"] { background: #1f4fd8; color: #fff; }
.panel { margin-top: 12px; }`}},

/* ---------- Неделя 22 ---------- */
{id:"w22e1",l:"react5",t:"Тема через Context",mode:"react",
 task:"Кнопка <code>#theme-toggle</code> спрятана глубоко: App → Header → Toolbar → ThemeButton. Передай тему и функцию переключения через Context, а не через props. У <code>.app</code> атрибут <code>data-theme</code> — <code>\"light\"</code> или <code>\"dark\"</code>. Компоненты Header и Toolbar не принимают props.",
 files:{jsx:`// const ThemeContext = createContext(null);

function ThemeButton() {
  return <button id="theme-toggle">Сменить тему</button>;
}

function Toolbar() {
  return <div className="toolbar"><ThemeButton /></div>;
}

function Header() {
  return <header><Toolbar /></header>;
}

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <div className="app" data-theme={theme}>
      <Header />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,css:`.app { padding: 16px; }
.app[data-theme="dark"] { background: #111; color: #eee; }`},
 hints:["Создай контекст: const ThemeContext = createContext(null);","В App оберни Header: <ThemeContext.Provider value={{ theme, toggle }}>…</ThemeContext.Provider>","В ThemeButton: const { toggle } = useContext(ThemeContext);"],
 tests:[["Сначала light","return $('.app').dataset.theme === 'light'"],
        ["Клик → dark","$('#theme-toggle').click(); await sleep(30); return $('.app').dataset.theme === 'dark'"],
        ["Ещё клик → light","$('#theme-toggle').click(); await sleep(30); return $('.app').dataset.theme === 'light'"],
        ["Есть createContext и useContext","return /createContext\\s*\\(/.test(src.jsx) && /useContext\\s*\\(/.test(src.jsx)"],
        ["Header и Toolbar без props","return /function\\s+Toolbar\\s*\\(\\s*\\)/.test(src.jsx) && /function\\s+Header\\s*\\(\\s*\\)/.test(src.jsx)"]],
 sol:{jsx:`const ThemeContext = createContext(null);

function ThemeButton() {
  const { theme, toggle } = useContext(ThemeContext);
  return <button id="theme-toggle" onClick={toggle}>Тема: {theme}</button>;
}

function Toolbar() {
  return <div className="toolbar"><ThemeButton /></div>;
}

function Header() {
  return <header><Toolbar /></header>;
}

function App() {
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className="app" data-theme={theme}>
        <Header />
      </div>
    </ThemeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,css:`.app { padding: 16px; }
.app[data-theme="dark"] { background: #111; color: #eee; }`}},

/* ---------- Неделя 27 ---------- */
{id:"w27e1",l:"perf",t:"Почини доступность",mode:"web",
 task:"На странице четыре проблемы доступности. Исправь их:\n- «кнопка» сделана из <code>div</code> — замени на настоящую <code>button</code>\n- у картинки нет <code>alt</code>\n- у поля email нет подписи <code>label</code>\n- серый текст плохо читается: контраст должен быть не ниже 4.5:1",
 files:{html:`<div class="btn" onclick="send()">Отправить</div>

<img src="team.jpg">

<input type="email" placeholder="Email">

<p class="muted">Текст с низким контрастом, который трудно прочитать.</p>
`,css:`.btn { display: inline-block; background: #1f4fd8; color: #fff; padding: 8px 14px; border-radius: 6px; cursor: pointer; }
.muted { color: #bbbbbb; }`,js:`function send() {
  console.log("Отправлено");
}`},
 hints:["div не получает фокус с клавиатуры и не нажимается Enter. button умеет это из коробки.","Подпись: <label for=\"email\">Email</label> и id=\"email\" у поля.","Цвет #595959 на белом даёт контраст около 7:1."],
 tests:[["«Отправить» — это button","return $$('button').some(b => b.textContent.includes('Отправить'))"],
        ["У картинок есть alt","return $$('img').every(i => i.hasAttribute('alt'))"],
        ["У полей есть label","return $$('input').every(i => i.labels && i.labels.length)"],
        ["Контраст ≥ 4.5:1","const lum = c => { const m = c.match(/[\\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; }; const p = $$('p').find(p => p.textContent.includes('контраст')); ok(p, 'Абзац с текстом пропал'); const l = lum(css(p, 'color')); const r = (1 + 0.05) / (l + 0.05); ok(r >= 4.5, 'Контраст ' + r.toFixed(2) + ':1, нужно не меньше 4.5:1'); return true"]],
 sol:{html:`<button class="btn" type="button" onclick="send()">Отправить</button>

<img src="team.jpg" alt="Команда студии в офисе">

<label for="email">Email</label>
<input id="email" type="email" placeholder="you@example.com">

<p class="muted">Текст с низким контрастом, который трудно прочитать.</p>`,css:`.btn { display: inline-block; background: #1f4fd8; color: #fff; padding: 8px 14px; border: 0; border-radius: 6px; cursor: pointer; font: inherit; }
.muted { color: #595959; }`,js:`function send() {
  console.log("Отправлено");
}`}},

/* ---------- Неделя 30 ---------- */
{id:"w30e1",l:"career",also:["be-career","fs-career"],t:"Замыкание: счётчик",mode:"js",
 task:"Классика собеседований. Напиши <code>makeCounter()</code>: возвращает объект с методами <code>inc()</code> (увеличивает и возвращает новое значение) и <code>get()</code>. У каждого счётчика своё значение, и никакой глобальной переменной.",
 files:{js:`function makeCounter() {

}

const a = makeCounter();
a.inc(); a.inc();
console.log(a.get()); // 2
`},
 hints:["Объяви let count = 0 внутри makeCounter.","Методы объекта «помнят» count, даже когда makeCounter уже завершилась. Это и есть замыкание."],
 tests:[["inc и get работают","const c = makeCounter(); c.inc(); return c.inc() === 2 && c.get() === 2"],
        ["Счётчики независимы","const a = makeCounter(), b = makeCounter(); a.inc(); a.inc(); b.inc(); return a.get() === 2 && b.get() === 1"],
        ["Нет глобальной count","return typeof window.count === 'undefined' && !/^(let|var|const)\\s+count\\b/m.test(src.js)"]],
 sol:{js:`function makeCounter() {
  let count = 0;
  return {
    inc() {
      count++;
      return count;
    },
    get() {
      return count;
    },
  };
}`}},

{id:"w30e2",l:"career",also:["be-career","fs-career"],t:"Предскажи порядок вывода",mode:"js",
 task:"Не запуская код в голове наугад, разберись с event loop. В каком порядке выведутся буквы?\n\n<pre><code>console.log(\"A\");\nsetTimeout(() =&gt; console.log(\"B\"), 0);\nPromise.resolve().then(() =&gt; console.log(\"C\"));\nconsole.log(\"D\");</code></pre>\n\nЗапиши ответ массивом в <code>answer</code>. Потом можешь запустить этот код и проверить себя.",
 files:{js:`const answer = [];
`},
 hints:["Сначала выполняется весь синхронный код.","Потом микрозадачи (промисы), и только затем макрозадачи (таймеры)."],
 tests:[["Порядок верный","return JSON.stringify(answer) === '[\"A\",\"D\",\"C\",\"B\"]'"]],
 sol:{js:`const answer = ["A", "D", "C", "B"];

// Синхронно: A, D. Потом микрозадача промиса: C. Потом таймер: B.`}},

{id:"w30e3",l:"career",also:["be-career","fs-career"],t:"once",mode:"js",
 task:"Напиши <code>once(fn)</code>: возвращает функцию, которая вызывает <code>fn</code> только в первый раз, а при следующих вызовах возвращает тот же результат, что и в первый.",
 files:{js:`function once(fn) {

}

const init = once(() => { console.log("Инициализация"); return 42; });
console.log(init(), init()); // «Инициализация» один раз, потом 42 42
`},
 hints:["Храни флаг called и результат result в замыкании."],
 tests:[["fn вызывается один раз","let n = 0; const f = once(() => ++n); f(); f(); f(); return n === 1"],
        ["Возвращает первый результат","const f = once(x => x * 2); return f(5) === 10 && f(100) === 10"]],
 sol:{js:`function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}`}},
];
