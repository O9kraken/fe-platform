@@ 0

### На пальцах
В обычном React браузер сначала получает пустую страницу, потом идёт за данными, и только потом показывает товары. В Next.js сервер сам сходит за данными и пришлёт уже заполненную страницу. Как ресторан, где официант приносит готовое блюдо, а не набор продуктов и рецепт.

### Как это работает
- Серверный компонент может быть `async` и прямо в теле дождаться данных через `await`.
- Источник данных — что угодно: `fetch` к API, запрос к базе через ORM, чтение файла.
- Секретные ключи и строки подключения безопасно использовать здесь — код не попадает в браузер.
- Пока данные грузятся, Next.js показывает `loading.tsx`.
- Несколько независимых запросов запускай параллельно через `Promise.all`, иначе они пойдут цепочкой и страница будет медленнее.
- Ошибка внутри — сработает `error.tsx`.

`useEffect` и `useState` для загрузки здесь не нужны.

### Пример
```tsx
// app/dashboard/page.tsx
type Order = { id: number; total: number };
type Stats = { visitors: number };

async function getOrders(): Promise<Order[]> {
  const r = await fetch(`${process.env.API_URL}/orders`, {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },  // секрет остаётся на сервере
  });
  if (!r.ok) throw new Error("Не удалось загрузить заказы");
  return r.json();
}

async function getStats(): Promise<Stats> {
  const r = await fetch(`${process.env.API_URL}/stats`);
  return r.json();
}

export default async function Dashboard() {
  const [orders, stats] = await Promise.all([getOrders(), getStats()]);  // параллельно

  return (
    <main>
      <h1>Заказы: {orders.length}</h1>
      <p>Посетителей: {stats.visitors}</p>
    </main>
  );
}
```

### Частые ошибки
- Загружать данные через `useEffect` в клиентском компоненте по привычке — теряются скорость и SEO.
- Последовательные `await` для независимых запросов.
- Пытаться сделать запрос к собственному Route Handler из серверного компонента — проще сразу вызвать функцию, которая ходит в базу.

### Мини-задание
Сделай страницу `/users`, которая на сервере загружает пользователей и посты с `jsonplaceholder.typicode.com` параллельно и показывает у каждого пользователя количество его постов. Добавь `loading.tsx`.

@@ 1

### На пальцах
Кеш — заготовки на кухне. Не нужно резать салат заново для каждого гостя, если его нарезали пять минут назад. `revalidate` — правило «нарезанное хранится 60 секунд, потом режем свежее». Гостю быстро, а данные не протухают надолго.

### Как это работает
Next.js умеет хранить результат запроса и готовую страницу, чтобы не делать работу заново. Управляют этим так:

| Настройка | Что значит |
|---|---|
| `fetch(url, { next: { revalidate: 60 } })` | хранить ответ до 60 секунд |
| `fetch(url, { cache: "no-store" })` | не кешировать, свежие данные при каждом запросе |
| `export const revalidate = 3600` в файле страницы | вся страница обновляется раз в час |
| `export const dynamic = "force-dynamic"` | страница всегда рисуется заново |
| `revalidatePath("/blog")` | сбросить кеш страницы прямо сейчас (после изменений) |
| `revalidateTag("posts")` | сбросить все запросы с тегом `posts` |

Как выбрать:

- Статьи, каталог, лендинг — кеш на минуты или часы.
- Личный кабинет, корзина, остатки на складе — без кеша или сброс после изменений.
- После того как пользователь что-то создал или изменил — `revalidatePath` в Server Action или Route Handler.

Поведение кеша в разных версиях Next.js менялось, поэтому для важных страниц задавай его явно. Проверяй на собранной версии (`npm run build && npm start`): в режиме разработки кеш работает иначе.

### Пример
```tsx
// app/blog/page.tsx
export const revalidate = 300;   // страница обновляется раз в 5 минут

export default async function Blog() {
  const posts = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5", {
    next: { tags: ["posts"] },
  }).then(r => r.json());
  return <ul>{posts.map((p: { id: number; title: string }) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

```ts
// app/admin/actions.ts
"use server";
import { revalidateTag } from "next/cache";

export async function publishPost(formData: FormData) {
  // ... сохранить пост в базу
  revalidateTag("posts");   // блог обновится сразу, не дожидаясь 5 минут
}
```

### Частые ошибки
- Кешировать персональные данные — один пользователь видит данные другого.
- Удивляться «старым данным» и не знать, что страница закеширована.
- Проверять кеш только в `npm run dev`.

### Мини-задание
Сделай страницу, которая показывает текущее время сервера, с `revalidate = 10`. Собери проект, запусти `npm start` и понаблюдай: сколько секунд время не меняется при обновлении. Затем поставь `force-dynamic` и сравни.

@@ 2

### На пальцах
`generateMetadata` — табличка на двери каждого кабинета: у каждой статьи свой заголовок и описание для поисковика и мессенджеров. `generateStaticParams` — заранее напечатать все страницы-брошюры на складе, чтобы выдавать их мгновенно, а не печатать по запросу.

### Как это работает
Метаданные:

- Для страницы с постоянным текстом — экспорт объекта `export const metadata = { title, description }`.
- Для динамической страницы — функция `generateMetadata({ params })`, которая загружает данные и возвращает метаданные.
- В корневом layout удобно задать шаблон: `title: { template: "%s — Студия", default: "Студия" }`.
- Next.js сам вставит `<title>`, `<meta name="description">`, Open Graph и другие теги.

Статическая генерация:

- `generateStaticParams()` возвращает список параметров, для которых страницы надо собрать заранее при `npm run build`.
- Такие страницы отдаются как готовые HTML-файлы — максимально быстро.
- Новые slug, которых не было при сборке, тоже работают: страница соберётся при первом запросе.

### Пример
```tsx
// app/layout.tsx
export const metadata = {
  title: { template: "%s — Студия GeoBit", default: "Студия GeoBit" },
  description: "Сайты и SEO под ключ",
};
```

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getAllPosts } from "@/lib/posts";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Статья не найдена" };
  return {
    title: post.title,                       // → «Как выбрать хостинг — Студия GeoBit»
    description: post.excerpt,
    openGraph: { title: post.title, images: [post.cover] },
  };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <article><h1>{post.title}</h1></article>;
}
```

### Частые ошибки
- Один и тот же `title` для всех статей.
- Экспортировать `metadata` из клиентского компонента — не сработает, метаданные только в серверных файлах.
- Забыть, что `generateStaticParams` выполняется при сборке — данные должны быть доступны в этот момент.

### Мини-задание
Добавь в свой блог шаблон заголовка в корневом layout, `generateMetadata` для статей и `generateStaticParams`. Выполни `npm run build` и найди в выводе, какие страницы собраны статически (значок ●).

@@ 3

### На пальцах
`next/image` — умный фотограф-ретушёр. Ты даёшь ему огромную фотографию, а он сам подготовит нужные размеры для телефона и компьютера, переведёт в лёгкий формат, загрузит только когда до неё долистают и заранее займёт место на странице, чтобы ничего не прыгало.

### Как это работает
Что делает компонент `Image` из `next/image`:

- создаёт несколько размеров картинки и отдаёт подходящий экрану (`srcset`);
- конвертирует в WebP или AVIF;
- включает ленивую загрузку по умолчанию;
- требует размеры (или `fill`), чтобы не было сдвига вёрстки;
- для главной картинки первого экрана — `priority`, чтобы она грузилась сразу.

Обязательные props: `src`, `alt`, и либо `width` + `height`, либо `fill` (тогда родитель должен быть `position: relative` с размерами).

`sizes` подсказывает, какую ширину картинка займёт на экране: `"(max-width: 768px) 100vw, 33vw"`. Без него браузер может скачать слишком большой вариант.

Картинки с чужих доменов нужно разрешить в `next.config` через `images.remotePatterns`.

### Пример
```tsx
import Image from "next/image";
import hero from "@/public/hero.jpg";   // локальная — размеры известны автоматически

export default function Page() {
  return (
    <>
      <Image src={hero} alt="Команда студии в офисе" priority placeholder="blur" />

      <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
        <Image
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
          alt="Ноутбук с кодом на столе"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
    </>
  );
}
```

```ts
// next.config.ts
export default {
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
};
```

### Частые ошибки
- Чужой домен не добавлен в `remotePatterns` — ошибка «hostname is not configured».
- `fill` без `position: relative` у родителя — картинка растягивается на весь экран.
- `priority` у всех картинок — пропадает смысл ленивой загрузки.

### Мини-задание
Замени обычные `img` в своём Next.js-проекте на `Image`. Для главной картинки поставь `priority`, для карточек — `sizes`. Сравни размер загруженных картинок в Network до и после.

@@ 4

### На пальцах
Поисковый робот — гость, который впервые пришёл в большой дом. `sitemap.xml` — карта всех комнат: «вот список страниц, обойди их». `robots.txt` — таблички «сюда не заходить» у служебных помещений. Open Graph — визитка, которую дом показывает, когда о нём рассказывают в мессенджерах.

### Как это работает
В App Router эти файлы генерируются кодом прямо из папки `app`:

| Файл | Адрес | Что делает |
|---|---|---|
| `app/sitemap.ts` | `/sitemap.xml` | список адресов для поисковиков с датами изменений |
| `app/robots.ts` | `/robots.txt` | что можно и нельзя индексировать, где карта сайта |
| `app/opengraph-image.tsx` или `.png` | картинка превью | автоматически подставляется в `og:image` |
| `app/icon.png` | фавикон | подключается сам |

Sitemap может быть динамическим: загрузить все статьи из базы и добавить их адреса.

После публикации добавь сайт в Яндекс Вебмастер и Google Search Console и укажи адрес sitemap — так страницы попадут в поиск быстрее.

### Пример
```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const BASE = "https://geobit.ru";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    { url: BASE, lastModified: new Date() },
    { url: `${BASE}/services`, lastModified: new Date() },
    ...posts.map(p => ({ url: `${BASE}/blog/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: "https://geobit.ru/sitemap.xml",
  };
}
```

### Частые ошибки
- `disallow: "/"` оставили с этапа разработки — сайт не попадает в поиск.
- Относительные адреса в sitemap — нужны полные, с доменом.
- Закрыть от индексации в robots.txt страницы, но оставить их в sitemap — противоречивые сигналы.

### Мини-задание
Добавь в Next.js-проект `sitemap.ts` с главной, услугами и всеми статьями блога и `robots.ts`, закрывающий `/admin`. Открой `/sitemap.xml` и `/robots.txt` и проверь содержимое.
