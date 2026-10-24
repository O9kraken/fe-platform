@@ 0

### На пальцах
В React Router ты вручную пишешь таблицу «адрес → страница». В Next.js таблица — это сама структура папок. Создал папку `app/about` с файлом `page.tsx` — появился адрес `/about`. Как в шкафу с подписанными ящиками: где лежит, там и находится.

### Как это работает
1. `npx create-next-app@latest my-site` — мастер спросит про TypeScript, ESLint, Tailwind, App Router (выбирай Yes).
2. `npm run dev` → `http://localhost:3000`.

Правила App Router:

- Папка внутри `app` — сегмент адреса.
- Страница появляется, только если в папке есть файл `page.tsx`.
- Вложенные папки — вложенные адреса.
- Папка в круглых скобках `(marketing)` группирует файлы, но не попадает в адрес.
- Папка с подчёркиванием `_components` — приватная, не становится маршрутом.

| Файл | Адрес |
|---|---|
| `app/page.tsx` | `/` |
| `app/about/page.tsx` | `/about` |
| `app/blog/page.tsx` | `/blog` |
| `app/blog/[slug]/page.tsx` | `/blog/что-угодно` |
| `app/(shop)/cart/page.tsx` | `/cart` |

Переходы — компонентом `Link` из `next/link`. Next.js заранее подгружает страницы по ссылкам, которые видны на экране, поэтому переходы мгновенные.

### Пример
```tsx
// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Студия веб-разработки</h1>
      <Link href="/services">Услуги</Link>
    </main>
  );
}
```

```tsx
// app/services/page.tsx
export default function Services() {
  return <h1>Услуги</h1>;
}
```

### Частые ошибки
- Создать `app/about/about.tsx` вместо `page.tsx` — адреса не будет.
- Использовать `<a href>` для внутренних ссылок — пропадает мгновенный переход.
- Путать App Router (`app/`) и старый Pages Router (`pages/`) из старых статей.

### Мини-задание
Создай проект Next.js и страницы `/`, `/services`, `/services/landing`, `/contacts` с меню на `Link`. Спрячь общие компоненты в папку `app/_components`.

@@ 1

### На пальцах
У каждой папки-маршрута в Next.js может быть набор служебных файлов, как у квартиры: сама комната (`page`), общая прихожая для всех комнат этажа (`layout`), табличка «идёт уборка, подождите» (`loading`), табличка «прорвало трубу» (`error`) и «такой квартиры нет» (`not-found`). Next.js сам вешает нужную табличку в нужный момент.

### Как это работает
| Файл | Назначение |
|---|---|
| `page.tsx` | содержимое страницы |
| `layout.tsx` | общая обёртка для страницы и всех вложенных; не перерисовывается при переходах |
| `loading.tsx` | показывается, пока страница загружает данные |
| `error.tsx` | показывается, если при отрисовке произошла ошибка; клиентский компонент |
| `not-found.tsx` | показывается при вызове `notFound()` или для несуществующего адреса |

- Корневой `app/layout.tsx` обязателен: в нём `<html>` и `<body>`.
- Layout'ы вкладываются: корневой → `app/blog/layout.tsx` → страница.
- `error.tsx` получает `error` и функцию `reset` для повторной попытки.

### Пример
```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header>Студия</header>
        {children}
        <footer>© 2026</footer>
      </body>
    </html>
  );
}
```

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return <p>Загружаем статьи…</p>;
}
```

```tsx
// app/blog/error.tsx
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Не удалось загрузить блог.</p>
      <button onClick={reset}>Попробовать снова</button>
    </div>
  );
}
```

```tsx
// app/not-found.tsx
import Link from "next/link";
export default function NotFound() {
  return <p>Страница не найдена. <Link href="/">На главную</Link></p>;
}
```

### Частые ошибки
- Забыть `"use client"` в `error.tsx` — Next.js выдаст ошибку.
- Дублировать шапку в каждой странице вместо layout.
- Удалить `<html>` и `<body>` из корневого layout.

### Мини-задание
Добавь в проект общий layout с шапкой и подвалом, отдельный layout для раздела `/blog` с боковой колонкой, `loading.tsx` и `error.tsx` для блога и свою страницу 404.

@@ 2

### На пальцах
Папка с названием в квадратных скобках — пустая рамка для фотографии. `app/blog/[slug]` — «здесь будет любая статья». Адрес `/blog/kak-vybrat-hosting` вставляет в рамку слово `kak-vybrat-hosting`, и страница по нему находит нужную статью.

### Как это работает
- `[slug]` — один сегмент адреса, приходит в `params.slug`.
- `[...slug]` — любое количество сегментов (`/docs/a/b/c`), приходит массивом.
- `[[...slug]]` — то же, но адрес без сегментов тоже подходит.
- Страница получает `params` в props. В свежих версиях Next.js это промис: `const { slug } = await params`.
- Не нашли данные — вызови `notFound()`, и Next.js покажет `not-found.tsx` с кодом 404.

Slug — человекочитаемый идентификатор в адресе: латиница, цифры, дефисы. Он лучше id для SEO: `/blog/kak-vybrat-hosting` понятнее, чем `/blog/42`.

### Пример
```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

const POSTS = [
  { slug: "kak-vybrat-hosting", title: "Как выбрать хостинг", body: "..." },
  { slug: "chto-takoe-seo", title: "Что такое SEO", body: "..." },
];

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

```tsx
// ссылки на статьи
<Link href={`/blog/${post.slug}`}>{post.title}</Link>
```

### Частые ошибки
- Папка `blog/slug` без скобок — получится буквальный адрес `/blog/slug`.
- Не обработать несуществующий slug — страница падает с ошибкой вместо 404.
- Русские буквы и пробелы в slug — адрес превращается в `%D0%BA%D0%B0...`.

### Мини-задание
Сделай блог из трёх статей: список на `/blog` и страницу статьи на `/blog/[slug]` с вызовом `notFound()` для неизвестного адреса. Добавь страницу документации на `[...slug]`, которая выводит все сегменты адреса.

@@ 3

### На пальцах
Ресторан с открытой кухней. Серверные компоненты — повара на кухне: готовят блюдо (HTML) заранее, у них есть доступ к холодильнику (базе данных) и секретным рецептам (ключам API). Клиентские компоненты — официант у столика: реагирует на просьбы гостя прямо сейчас — нажатия, ввод, анимации.

### Как это работает
В App Router все компоненты по умолчанию **серверные**:

- выполняются на сервере, в браузер приходит готовый HTML;
- их код не попадает в JS-бандл браузера — страница легче;
- могут быть `async` и прямо внутри загружать данные, обращаться к базе, читать секретные переменные окружения;
- **не могут** использовать `useState`, `useEffect`, обработчики событий и браузерные API (`window`, `localStorage`).

**Клиентские** компоненты помечаются строкой `"use client"` в начале файла:

- работают как обычный React: состояние, эффекты, события;
- сначала рисуются на сервере (для быстрого первого показа), потом «оживают» в браузере.

Правило: держи как можно больше на сервере, а клиентскими делай только интерактивные «островки» — кнопку, форму, слайдер. Серверный компонент может импортировать клиентский и передавать ему данные через props.

### Пример
```tsx
// app/products/page.tsx — серверный
import { AddToCart } from "./AddToCart";

export default async function ProductsPage() {
  const r = await fetch("https://dummyjson.com/products?limit=5");
  const { products } = await r.json();

  return (
    <ul>
      {products.map((p: { id: number; title: string; price: number }) => (
        <li key={p.id}>
          {p.title} — ${p.price} <AddToCart id={p.id} />
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// app/products/AddToCart.tsx — клиентский островок
"use client";
import { useState } from "react";

export function AddToCart({ id }: { id: number }) {
  const [added, setAdded] = useState(false);
  return <button onClick={() => setAdded(true)}>{added ? "В корзине" : "Купить"}</button>;
}
```

### Частые ошибки
- `useState` в серверном компоненте — ошибка «useState only works in Client Components».
- Пометить `"use client"` весь layout — вся страница уходит в браузерный бандл.
- Передать из серверного компонента в клиентский функцию или объект с методами — props должны быть сериализуемыми (числа, строки, обычные объекты).

### Мини-задание
Сделай серверную страницу со списком товаров, загруженных через `fetch`, и клиентский компонент «В избранное» на каждой карточке. Посмотри в DevTools → Network, что в браузер приходит уже готовый HTML со списком.

@@ 4

### На пальцах
`"use client"` — табличка на двери: «отсюда начинается зал, где работают с гостями». Всё, что за этой дверью, должно уметь общаться с посетителем в браузере. Вешай табличку только там, где реально нужен разговор с гостем, а не на входе во весь ресторан.

### Как это работает
`"use client"` нужна, если компонент использует хоть что-то из списка:

- состояние и эффекты: `useState`, `useReducer`, `useEffect`, `useRef`;
- обработчики событий: `onClick`, `onChange`, `onSubmit`;
- браузерные API: `window`, `document`, `localStorage`, геолокация;
- контексты и хуки сторонних библиотек, работающих в браузере (TanStack Query, Zustand, слайдеры, карты).

Не нужна, если компонент просто показывает данные, даже очень сложную разметку.

Как работает граница:

- Директива пишется в первой строке файла.
- Всё, что этот файл импортирует, тоже становится клиентским.
- Поэтому директиву ставят как можно ниже по дереву — на маленьком интерактивном компоненте.
- Серверный компонент можно передать в клиентский через `children` — тогда он останется серверным.

### Пример
```tsx
// Плохо: из-за одной кнопки весь header стал клиентским
"use client";
export function Header() { /* логотип, меню, поиск, кнопка темы */ }
```

```tsx
// Хорошо: header серверный, клиентская только кнопка
// app/_components/Header.tsx
import { ThemeToggle } from "./ThemeToggle";
export function Header() {
  return (
    <header>
      <a href="/">Студия</a>
      <nav>...</nav>
      <ThemeToggle />
    </header>
  );
}
```

```tsx
// app/_components/ThemeToggle.tsx
"use client";
import { useState } from "react";
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  return (
    <button onClick={() => { setDark(!dark); document.documentElement.classList.toggle("dark"); }}>
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
```

### Частые ошибки
- Ставить `"use client"` во все файлы «чтобы работало».
- Ставить директиву не в первой строке (после импортов) — она не сработает.
- Пытаться прочитать секретную переменную окружения в клиентском компоненте — её там нет.

### Мини-задание
Пройди по компонентам своего Next.js-проекта и для каждого реши: нужен ли ему `"use client"`. Перенеси директиву как можно ниже — в маленькие интерактивные компоненты.
