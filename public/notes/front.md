@@ web
### Что происходит после Enter
1. Браузер разбирает адрес: протокол `https:`, домен `shop.example.com`, путь `/catalog`, параметры `?color=red`.
2. DNS превращает домен в IP-адрес, например `93.184.216.34`.
3. Браузер устанавливает защищённое соединение (HTTPS) и отправляет HTTP-запрос.
4. Сервер готовит ответ: HTML, JSON, картинку или ошибку.
5. Браузер строит из HTML дерево DOM, подгружает CSS и JS и рисует страницу.

### Как выглядит HTTP-запрос и ответ
Это обычный текст. Первая строка запроса — метод и путь, дальше заголовки:

```http
GET /catalog?color=red HTTP/1.1
Host: shop.example.com
Accept: text/html
```

Ответ начинается с кода статуса:

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!doctype html>...
```

### Коды ответа, которые нужно знать
- **200** — всё хорошо, **201** — создано, **204** — готово, тела нет
- **301 / 302** — ресурс переехал, браузер идёт по новому адресу
- **400** — ошибка в запросе, **401** — не вошёл, **403** — нельзя, **404** — нет такого
- **500** — сломался сервер

### Запомни
- Первая цифра кода говорит, чья проблема: 4xx — клиента, 5xx — сервера.
- Вкладка Network в DevTools показывает все запросы страницы: метод, статус, время, размер.

@@ tools
### Терминал: пять команд на каждый день
```bash
pwd              # где я нахожусь
ls               # что в папке (в Windows cmd — dir)
cd web-learning  # перейти в папку
mkdir week-02    # создать папку
cd ..            # подняться на уровень выше
```

### Git: цикл одного изменения
```bash
git init                         # один раз: превратить папку в репозиторий
git status                       # что изменилось
git add index.html               # положить изменения в «коробку»
git commit -m "Добавил шапку"    # запечатать коробку с подписью
git log --oneline                # история
```
Отправка на GitHub: `git remote add origin <адрес>` один раз, потом `git push`.

### Как писать сообщение коммита
Отвечай на вопрос «что изменится, если применить этот коммит?»: «Добавил форму заявки», «Исправил отступы в шапке». Сообщения «fix», «изменения», «asdf» через неделю ничего не расскажут.

### Запомни
- Коммить маленькими шагами после каждого работающего результата.
- `.gitignore` — список того, что в Git не попадает: `node_modules`, `.env`.

@@ html1
### Скелет любой страницы
```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Название во вкладке</title>
</head>
<body>
  <!-- всё видимое — здесь -->
</body>
</html>
```
`head` — служебная информация для браузера и поисковиков, `body` — то, что видит человек.

### Основные теги
- `h1`–`h6` — заголовки по уровням. `h1` один на странице.
- `p` — абзац, `a href="…"` — ссылка, `img src="…" alt="…"` — картинка.
- `ul` / `ol` + `li` — маркированный и нумерованный списки.
- `strong` — важное, `em` — акцент.

### Вложенность
Теги вкладываются, как матрёшки, и закрываются в обратном порядке: `<p>Текст <strong>важный</strong></p>`. Отступы в коде показывают вложенность и помогают не запутаться.

### Запомни
- У каждой картинки есть `alt`: его читает скринридер и показывает браузер, если картинка не загрузилась.
- Пустые теги вроде `img`, `br`, `meta` не закрываются.

@@ html2
### Семантическая разметка
```html
<header>
  <nav>
    <a href="/">Главная</a>
    <a href="/services">Услуги</a>
  </nav>
</header>
<main>
  <article>
    <h1>Делаем сайты</h1>
    <section>…</section>
  </article>
</main>
<footer>© 2026 Студия</footer>
```
`div` и `span` — универсальные коробки без смысла. Их берут, только когда подходящего семантического тега нет.

### Формы
```html
<form>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <label for="msg">Сообщение</label>
  <textarea id="msg" name="msg"></textarea>

  <button type="submit">Отправить</button>
</form>
```
Типы полей сами помогают пользователю: `email` проверяет @, `tel` открывает на телефоне цифровую клавиатуру, `date` — календарь.

### Запомни
- `label for` + `id` связывают подпись и поле. Клик по подписи ставит курсор в поле.
- `placeholder` — подсказка-пример, а не подпись: при вводе он исчезает.

@@ html3
### Пути к файлам
```text
site/
  index.html
  services.html
  img/logo.png
  css/style.css
```
- Из `index.html`: `img/logo.png`, `services.html`
- Из `css/style.css` к логотипу: `../img/logo.png` — `..` поднимает на папку выше
- Абсолютный путь: `https://example.com/img/logo.png`

### Мета-теги для поиска и соцсетей
```html
<title>Студия веб-дизайна — сайты для бизнеса</title>
<meta name="description" content="Лендинги и магазины за 3 недели">
<meta property="og:title" content="Студия веб-дизайна">
<meta property="og:image" content="https://example.com/preview.png">
```
`title` и `description` попадают в поисковую выдачу, `og:*` — в превью ссылки в мессенджерах.

### Запомни
- Проверяй каждую страницу валидатором W3C: он находит незакрытые теги и опечатки.
- Текущий пункт меню отмечают `aria-current="page"`.

@@ css1
### Подключение и синтаксис
```html
<link rel="stylesheet" href="css/style.css">
```
```css
/* селектор { свойство: значение; } */
h1 { color: #1f4fd8; font-size: 2rem; }
.card { padding: 16px; }
#promo { background: #fff3bf; }
nav a:hover { text-decoration: underline; }
```

### Каскад и специфичность
Когда на элемент претендуют несколько правил, побеждает:
1. Правило с `!important` (избегай его).
2. Более специфичный селектор: id (100) > класс, атрибут, псевдокласс (10) > тег (1).
3. При равенстве — правило, которое ниже в файле.

### Единицы
- `px` — точные пиксели, для рамок и мелочей.
- `rem` — от размера шрифта `html` (обычно 16px). Для шрифтов и отступов.
- `%` — от родителя, `vw`/`vh` — от окна.

### Запомни
- Стили пишут на классы, а не на id: так их проще переиспользовать и перебивать.
- В DevTools во вкладке Styles зачёркнутое правило — то, что кто-то перебил.

@@ css2
### Блочная модель
Ширина элемента на странице = `width` + `padding` × 2 + `border` × 2, если `box-sizing: content-box` (по умолчанию). С `border-box` `width` — это уже вся коробка. Поэтому почти все проекты начинают с:
```css
*, *::before, *::after { box-sizing: border-box; }
```

### Flexbox за 5 свойств
```css
.row {
  display: flex;
  justify-content: space-between; /* по главной оси */
  align-items: center;            /* по поперечной */
  gap: 16px;                      /* промежуток между детьми */
  flex-wrap: wrap;                /* переносить, если не влезает */
}
.row > .item { flex: 1; }         /* делить место поровну */
```
Главная ось по умолчанию горизонтальная. `flex-direction: column` поворачивает её вертикально.

### position
- `relative` — сдвиг относительно своего места и точка отсчёта для детей.
- `absolute` — вынут из потока, позиционируется от ближайшего предка с `position`.
- `sticky` — прилипает при прокрутке, например шапка таблицы.

### Запомни
- Расстояние между соседями задавай через `gap`, а не через margin у каждого элемента.

@@ css3
### Grid
```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```
Это адаптивная сетка без медиазапросов: колонок столько, сколько помещается шириной от 200px.

### Mobile-first
Сначала пишешь стили для телефона, потом добавляешь для больших экранов:
```css
.menu { display: flex; flex-direction: column; }

@media (min-width: 768px) {
  .menu { flex-direction: row; }
}
```

### Картинки и доступность
```css
img { max-width: 100%; height: auto; }
a:focus-visible { outline: 3px solid #1f4fd8; }
```

### Запомни
- Flex — для ряда или колонки, Grid — для двумерной сетки.
- Проверяй вёрстку в режиме устройства DevTools на ширине 360px.

@@ css4
### CSS-переменные
```css
:root {
  --accent: #1f4fd8;
  --radius: 12px;
}
.btn { background: var(--accent); border-radius: var(--radius); }

@media (prefers-color-scheme: dark) {
  :root { --accent: #86a6ff; }
}
```
Поменял значение в одном месте — перекрасился весь сайт. Так делают тёмную тему.

### Плавность и движение
```css
.btn { transition: transform .2s, box-shadow .2s; }
.btn:hover { transform: translateY(-2px); }

@media (prefers-reduced-motion: reduce) {
  * { transition: none; animation: none; }
}
```

### Резиновый текст и БЭМ
```css
h1 { font-size: clamp(28px, 5vw, 56px); }
.card__title--big { font-size: 24px; } /* блок__элемент--модификатор */
```

### Запомни
- Анимируй `transform` и `opacity`: они дешёвые для браузера, в отличие от `width` и `top`.

@@ js1
### Переменные и типы
```js
const price = 1500;        // number
let qty = 3;               // можно переприсвоить
const name = "Лендинг";    // string
const isPaid = false;      // boolean
let note = null;           // «пусто» осознанно
let x;                     // undefined — ещё не задано

console.log(typeof price); // "number"
```
`const` по умолчанию, `let` — когда значение меняется, `var` не используем.

### Операторы и строки
```js
const total = price * qty * (1 - 0.1);
const text = `Итого: ${total} ₽`;  // шаблонная строка

console.log("5" + 3);   // "53" — склейка строк
console.log("5" * 3);   // 15 — строка превратилась в число
console.log(0.1 + 0.2); // 0.30000000000000004
```

### Запомни
- `+` со строкой склеивает, остальные арифметические операторы приводят к числу.
- Деньги считай в копейках целыми числами: дроби в JavaScript неточные.

@@ js2
### Условия
```js
function deliveryPrice(sum, city) {
  if (sum >= 5000) return 0;
  else if (city === "Москва") return 300;
  else return 500;
}

const label = qty > 0 ? "В наличии" : "Нет в наличии"; // тернарный оператор
```

### Сравнения и логика
- Всегда `===` и `!==`: они не приводят типы. `0 == ""` → `true`, `0 === ""` → `false`.
- `&&` — «и», `||` — «или», `!` — «не».
- Falsy-значения: `false`, `0`, `""`, `null`, `undefined`, `NaN`. Всё остальное truthy, даже `"0"` и `[]`.

### Значения по умолчанию
```js
const city = user.city || "Не указан";  // подставит и вместо ""
const count = input ?? 10;              // только вместо null и undefined
```

### Запомни
- Точка остановки в DevTools (Sources → клик по номеру строки) показывает значения всех переменных в этот момент.

@@ js3
### Функции
```js
function formatPrice(n) {
  return n.toLocaleString("ru-RU") + " ₽";
}

const double = x => x * 2;              // стрелочная
const greet = (name = "гость") => `Привет, ${name}!`;
```
Функция без `return` возвращает `undefined`.

### Циклы
```js
for (let i = 1; i <= 3; i++) console.log(i);

for (const item of ["HTML", "CSS", "JS"]) console.log(item);

let n = 10;
while (n > 0) n -= 3;
```

### Область видимости
`let` и `const` живут внутри фигурных скобок, где объявлены. Функция видит переменные снаружи, но не наоборот.

### Запомни
- Хорошая функция делает одно дело и не меняет ничего снаружи — это «чистая» функция, её легко тестировать.

@@ js4
### Массивы
```js
const tags = ["html", "css"];
tags.push("js");            // добавить в конец
tags.length;                // 3
tags[0];                    // "html"
tags.includes("css");       // true
```

### Объекты и деструктуризация
```js
const service = { name: "Лендинг", price: 35000 };
service.price;              // 35000
service["name"];            // "Лендинг"

const { name, price } = service;
const copy = { ...service, price: 30000 };  // новая копия с изменением
```

### Главные методы массивов
```js
const services = [
  { name: "Лендинг", price: 35000 },
  { name: "SEO", price: 15000 },
];
services.map(s => s.name);                    // ["Лендинг", "SEO"]
services.filter(s => s.price > 20000);        // только дорогие
services.find(s => s.name === "SEO");         // первый подходящий
services.reduce((sum, s) => sum + s.price, 0); // 50000
```

### Запомни
- `map`, `filter`, `reduce` возвращают новый массив или значение и не меняют исходный. `push`, `sort`, `splice` меняют исходный.

@@ js5
### Найти и изменить элемент
```js
const title = document.querySelector("h1");
title.textContent = "Новый заголовок";
title.classList.add("active");

const items = document.querySelectorAll(".card"); // все карточки
```

### Создать элемент
```js
const li = document.createElement("li");
li.textContent = "Купить хлеб";       // безопасно: это просто текст
document.querySelector("#list").append(li);
li.remove();
```
`innerHTML` с данными пользователя опасен: так можно внедрить чужой скрипт (XSS).

### События и форма
```js
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();             // не перезагружать страницу
  const data = new FormData(form);
  console.log(data.get("email"));
});
```
Делегирование: один обработчик на родителе ловит клики по всем детям через `event.target.closest(".btn")`.

### Запомни
- `localStorage` хранит только строки: `JSON.stringify` при записи, `JSON.parse` при чтении.

@@ js6
### Промисы и async/await
```js
async function loadUsers() {
  try {
    const res = await fetch("https://api.example.com/users");
    if (!res.ok) throw new Error("Статус " + res.status);
    const users = await res.json();
    return users;
  } catch (err) {
    console.error("Не загрузилось:", err.message);
    return [];
  }
}
```
`fetch` не бросает ошибку на 404 и 500 — проверяй `res.ok` сам.

### Четыре состояния интерфейса
Загрузка → данные, пусто или ошибка. Пользователь должен видеть каждое из них, а не пустой экран.

### Параллельно, а не по очереди
```js
const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);
```

### Запомни
- Синхронный код всегда выполняется до конца раньше любых колбэков.
- Сначала микрозадачи (промисы), потом макрозадачи (таймеры).

@@ js7
### Модули
```js
// utils.js
export function formatPrice(n) { return n + " ₽"; }
export default function slugify(s) { return s.toLowerCase(); }

// main.js
import slugify, { formatPrice } from "./utils.js";
```

### npm и package.json
```bash
npm init -y                 # создать package.json
npm install dayjs           # библиотека для приложения
npm install -D eslint       # инструмент только для разработки
npm run dev                 # запустить скрипт из package.json
```
`node_modules` в Git не кладут: его восстанавливает `npm install`.

### Vite
```bash
npm create vite@latest my-app
cd my-app && npm install && npm run dev
```
`npm run build` собирает оптимизированную версию в папку `dist` для публикации.

### Запомни
- `package-lock.json` фиксирует точные версии — его коммитят.

@@ ts
### Типы
```ts
let price: number = 1500;
const tags: string[] = ["html", "css"];

type Task = {
  id: number;
  title: string;
  done: boolean;
  dueDate?: string;          // необязательное поле
};

function toggle(tasks: Task[], id: number): Task[] {
  return tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
}
```

### Union и сужение типа
```ts
function formatId(id: string | number): string {
  if (typeof id === "number") return "#" + id; // здесь id — число
  return id.toUpperCase();                      // здесь — строка
}
type Status = "active" | "done" | "paused";
```

### Generics
```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

### Запомни
- TypeScript проверяет код до запуска. Данные с сервера во время работы он не проверяет — для этого zod.
- `any` выключает проверку, `unknown` заставляет проверить тип перед использованием.

@@ react1
### Компонент и JSX
```jsx
function Card({ title, price }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <p>{price.toLocaleString("ru-RU")} ₽</p>
    </article>
  );
}
```
Компонент — функция, которая возвращает разметку. Имя с большой буквы, `class` пишется как `className`, выражения — в `{}`.

### Списки и key
```jsx
function CardList({ items }) {
  return items.map(item => <Card key={item.id} title={item.title} price={item.price} />);
}
```
`key` — стабильный id элемента. Индекс массива как key ломает список, когда элементы меняются местами.

### children
```jsx
function Panel({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>;
}
<Panel title="Контакты"><p>hello@studio.dev</p></Panel>
```

### Запомни
- Данные текут сверху вниз через props. Props только читают.

@@ react2
### useState
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Нажато {count}</button>;
}
```
Новое состояние — новый рендер. Если следующее значение зависит от предыдущего, передавай функцию: `setCount(c => c + 1)`.

### Управляемое поле
```jsx
const [query, setQuery] = useState("");
<input value={query} onChange={e => setQuery(e.target.value)} />
```

### Неизменяемые обновления
```jsx
setItems([...items, newItem]);                        // добавить
setItems(items.filter(i => i.id !== id));             // удалить
setItems(items.map(i => i.id === id ? { ...i, done: true } : i)); // изменить
```
`items.push()` меняет старый массив, и React не заметит изменения.

### Запомни
- Если состояние нужно двум соседям — подними его в общего родителя и передай вниз через props.

@@ react3
### useEffect
```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch("/api/services", { signal: controller.signal })
    .then(r => r.json())
    .then(setItems)
    .catch(() => {});
  return () => controller.abort();   // уборка при уходе со страницы
}, []);                               // [] — только после первого рендера
```
- Без массива зависимостей — после каждого рендера.
- `[id]` — после первого рендера и каждый раз, когда изменился `id`.

### Свой хук
```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData).catch(setError);
  }, [url]);
  return { data, error, loading: !data && !error };
}
```

### Запомни
- Эффект — для синхронизации с внешним миром: сеть, таймеры, document.title. Вычисления из props и state делай прямо в рендере.

@@ react4
### React Router
```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/item/:id" element={<Item />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

function Item() {
  const { id } = useParams();
  return <h1>Товар {id}</h1>;
}
```
`<Link to="/item/1">` меняет страницу без перезагрузки.

### Структура проекта
```text
src/
  components/   общие кнопки, карточки
  features/     каталог, корзина — всё по фиче вместе
  pages/        страницы-маршруты
  lib/          утилиты и запросы к API
```

### Запомни
- На хостинге настрой отдачу `index.html` на любой путь, иначе прямая ссылка `/item/1` даст 404.

@@ react5
### Context
```jsx
const ThemeContext = createContext(null);

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}
function ThemeButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme}</button>;
}
```

### Данные с сервера — отдельная история
```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ["services"],
  queryFn: () => fetch("/api/services").then(r => r.json()),
});
```
TanStack Query сам кеширует, повторяет запросы и обновляет устаревшее.

### Запомни
- Состояние интерфейса (открыто меню, тема) — в state или Context. Данные с сервера — в TanStack Query.

@@ projA
### План проекта
1. Данные: массив товаров или открытое API.
2. Список карточек → поиск → фильтры → сортировка.
3. Страница товара по маршруту `/item/:id`.
4. Избранное с сохранением в localStorage.
5. Состояния: загрузка, ошибка, пусто.
6. Адаптив, доступность, Lighthouse.
7. Деплой и README.

### README, который читают
```md
# Каталог услуг студии
Демо: https://catalog.example.com

## Что умеет
- поиск и фильтры по категории
- избранное, которое сохраняется

## Стек
React, TypeScript, React Router, Vite

## Запуск
npm install
npm run dev
```

### Запомни
- Сначала тонкий рабочий срез через весь проект, потом наращивай функции.
- Секретные ключи во фронтенд не кладут: их видит любой посетитель.

@@ next1
### Маршруты — это папки
```text
app/
  layout.tsx            общая обёртка всех страниц
  page.tsx              /
  catalog/page.tsx      /catalog
  catalog/[slug]/page.tsx  /catalog/что-угодно
  not-found.tsx         страница 404
```

### Серверные и клиентские компоненты
```tsx
// app/catalog/page.tsx — серверный по умолчанию
export default async function Catalog() {
  const items = await getItems();      // запрос прямо здесь, на сервере
  return <List items={items} />;
}
```
```tsx
"use client";   // нужен, если есть useState, useEffect, onClick
export function LikeButton() { /* … */ }
```

### Запомни
- Серверный компонент не попадает в браузер целиком, поэтому страница легче.
- `"use client"` ставят на маленькие интерактивные листья, а не на всю страницу.

@@ next2
### Данные и кеш
```tsx
export default async function Page({ params }: { params: { slug: string } }) {
  const res = await fetch(`https://api.example.com/items/${params.slug}`, {
    next: { revalidate: 60 },   // обновлять раз в минуту
  });
  if (!res.ok) notFound();
  const item = await res.json();
  return <h1>{item.title}</h1>;
}
```

### SEO
```tsx
export async function generateMetadata({ params }) {
  const item = await getItem(params.slug);
  return { title: item.title, description: item.summary };
}
```
Файлы `app/sitemap.ts` и `app/robots.ts` генерируют карту сайта и правила для роботов.

### Картинки
```tsx
import Image from "next/image";
<Image src="/hero.jpg" alt="Команда студии" width={1200} height={600} priority />
```

### Запомни
- «Просмотр кода страницы» должен показывать текст: значит, поисковик видит контент сразу.

@@ testing
### Unit-тест
```js
import { describe, it, expect } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("делит на разряды", () => {
    expect(formatPrice(1500)).toBe("1 500 ₽");
  });
});
```

### Тест компонента
```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("увеличивает счётчик", async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole("button", { name: /нажато/i }));
  expect(screen.getByText("Нажато 1")).toBeInTheDocument();
});
```
`getByRole` ищет элемент так, как его видит пользователь и скринридер.

### E2E
```js
test("поиск товара", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Поиск").fill("лендинг");
  await expect(page.getByRole("article")).toHaveCount(1);
});
```

### Запомни
- Много быстрых unit-тестов, меньше тестов компонентов, несколько e2e на главные сценарии.

@@ perf
### Core Web Vitals
- **LCP** — когда показался главный контент. Цель — до 2,5 с.
- **INP** — как быстро страница отвечает на клик. Цель — до 200 мс.
- **CLS** — насколько прыгает макет. Цель — до 0,1.

### Быстрые победы
```html
<img src="hero.webp" width="1200" height="600" alt="…" fetchpriority="high">
<img src="card.webp" width="400" height="300" alt="…" loading="lazy">
<link rel="preload" href="/fonts/golos.woff2" as="font" crossorigin>
```
Размеры у картинок убирают прыжки макета, `loading="lazy"` откладывает то, что ниже экрана.

### Доступность
- Контраст текста — не меньше 4,5:1.
- Всё делается с клавиатуры, фокус видно.
- Кнопка — `button`, ссылка — `a`, у полей — `label`.
- ARIA только там, где нет подходящего HTML-элемента.

### Запомни
- Меряй до и после: Lighthouse в DevTools и вкладка Performance.

@@ projB
### Что внутри проекта
- Вход и регистрация через Supabase Auth.
- Таблица с колонкой `user_id` и правилами Row Level Security.
- Формы на react-hook-form + zod.
- Страницы «Мои записи», создание, редактирование, удаление.

### Правило доступа на уровне базы
```sql
alter table tasks enable row level security;

create policy "свои задачи"
on tasks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```
Даже если кто-то отправит запрос в обход интерфейса, база отдаст только его строки.

### Запомни
- Проверка на фронте — для удобства, защита — на сервере или в базе.

@@ polish
### Работа через ветки
```bash
git switch -c feature/search      # новая ветка
git add . && git commit -m "feat: поиск по каталогу"
git push -u origin feature/search  # затем pull request на GitHub
```
После ревью ветку сливают в `main`, и деплой запускается сам.

### Conventional commits
`feat:` — новая функция, `fix:` — исправление, `docs:` — документация, `refactor:` — переделка без изменения поведения.

### Чек-лист перед показом
- Нет ошибок в консоли и предупреждений сборки.
- Есть страницы 404 и ошибки.
- Все переменные окружения описаны в README.
- Проект поднимается по README за 10 минут.

@@ career
### Резюме Junior на одну страницу
1. Кто ты и что ищешь — одна строка.
2. Проекты: ссылка на демо, ссылка на код, что сделал сам, какой стек.
3. Навыки — только те, о которых сможешь поговорить.
4. Опыт: коммерческие сайты на WordPress тоже опыт — с цифрами результата.

### Частые вопросы
- Что происходит, когда вводишь адрес в браузере?
- Разница между `let`, `const` и `var`; что такое замыкание.
- Порядок вывода с `setTimeout` и `Promise`.
- Специфичность CSS и блочная модель.
- Когда React перерисовывает компонент; зачем `key`.

### Замыкание за 10 секунд
```js
function makeCounter() {
  let count = 0;                  // живёт, пока жива функция-счётчик
  return () => ++count;
}
const next = makeCounter();
next(); next();                   // 2
```

### Запомни
- Откликайся, не дожидаясь идеала. Вопросы с собеседований — лучший список тем для повторения.
