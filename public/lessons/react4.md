@@ 0

### На пальцах
Одностраничное приложение — дом, в котором комнаты меняются без выхода на улицу. Роутер — указатель на стене: адрес `/catalog` — показываем каталог, `/cart` — корзину. `Link` — дверь между комнатами, которая не заставляет заново строить весь дом. `NavLink` — дверь с подсветкой «вы здесь».

### Как это работает
1. `npm install react-router-dom`
2. Описываешь маршруты: какой компонент показывать по какому адресу.
3. Оборачиваешь приложение в роутер.
4. Для переходов используешь `Link` вместо `a`.

Почему не обычная ссылка `<a href>`: она заставляет браузер заново загрузить страницу целиком, теряется состояние (корзина, введённый текст), всё мигает. `Link` меняет адрес и подменяет нужный кусок интерфейса мгновенно.

`NavLink` автоматически получает класс `active` (или функцию в `className`), когда его адрес совпадает с текущим. Удобно для меню.

Перейти из кода (например, после отправки формы): `const navigate = useNavigate(); navigate("/thanks")`.

### Пример
```tsx
// main.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Cart } from "./pages/Cart";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/catalog", element: <Catalog /> },
  { path: "/cart", element: <Cart /> },
]);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
```

```tsx
// components/Menu.tsx
import { NavLink } from "react-router-dom";

export function Menu() {
  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? "menu__link is-active" : "menu__link");
  return (
    <nav>
      <NavLink to="/" end className={cls}>Главная</NavLink>
      <NavLink to="/catalog" className={cls}>Каталог</NavLink>
      <NavLink to="/cart" className={cls}>Корзина</NavLink>
    </nav>
  );
}
```

### Частые ошибки
- `<a href="/catalog">` внутри приложения — полная перезагрузка и потеря состояния.
- `NavLink to="/"` без `end` подсвечивается на всех страницах, потому что все адреса начинаются с `/`.
- После деплоя прямой переход на `/catalog` даёт 404 — хостингу нужно сказать отдавать `index.html` на все адреса (на Netlify — файл `_redirects`, на Vercel работает само для Vite).

### Мини-задание
Сделай приложение из трёх страниц: Главная, Услуги, Контакты — с меню на `NavLink`, где активный пункт подсвечен. На странице контактов добавь форму, которая после отправки переводит на `/thanks` через `useNavigate`.

@@ 1

### На пальцах
Нельзя сделать отдельную страницу для каждого из тысячи товаров. Делают одну страницу-шаблон с «окошком» в адресе: `/product/:id`. Адрес `/product/42` — окошко заполнено числом 42. `useParams` — посмотреть, что написано в окошке, и показать нужный товар.

### Как это работает
- В маршруте параметр обозначается двоеточием: `path: "/product/:id"`.
- `useParams()` возвращает объект параметров: `{ id: "42" }`.
- Параметры всегда строки. Для поиска по числовому id преобразуй: `Number(id)`.
- Параметров может быть несколько: `/blog/:category/:slug`.
- Ссылки на такие страницы строят шаблонной строкой: `<Link to={`/product/${p.id}`}>`.

Query-параметры (после `?`) читают другим хуком: `useSearchParams()`. Их используют для фильтров и поиска: `/catalog?sort=price&page=2`. Плюс в том, что ссылкой с фильтрами можно поделиться.

Обязательно обработай случай, когда по id ничего не нашлось.

### Пример
```tsx
// router
{ path: "/product/:id", element: <ProductPage /> }
```

```tsx
// pages/ProductPage.tsx
import { useParams, Link, useSearchParams } from "react-router-dom";

const PRODUCTS = [
  { id: 1, title: "Кроссовки", price: 5990 },
  { id: 2, title: "Куртка", price: 8990 },
];

export function ProductPage() {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === Number(id));

  if (!product) return <p>Товар не найден. <Link to="/catalog">В каталог</Link></p>;

  return (
    <article>
      <h1>{product.title}</h1>
      <p>{product.price.toLocaleString("ru-RU")} ₽</p>
    </article>
  );
}

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const sort = params.get("sort") ?? "title";
  return (
    <>
      <button onClick={() => setParams({ sort: "price" })}>По цене</button>
      <p>Сортировка: {sort}</p>
      {PRODUCTS.map(p => <Link key={p.id} to={`/product/${p.id}`}>{p.title}</Link>)}
    </>
  );
}
```

### Частые ошибки
- Сравнивать `p.id === id` — число со строкой никогда не равны.
- Не обрабатывать «не найдено» — компонент падает на `product.title`.
- Хранить фильтры только в состоянии — при обновлении страницы они пропадают, а ссылкой нельзя поделиться.

### Мини-задание
Сделай каталог из 5 товаров со ссылками на страницу товара `/product/:id`. На странице товара — кнопка «Назад в каталог» и сообщение для несуществующего id. Добавь в каталог фильтр по категории через query-параметр.

@@ 2

### На пальцах
В торговом центре на каждом этаже одинаковые эскалаторы, указатели и туалеты, а меняются только магазины. Layout — общая «оболочка этажа»: шапка, меню, подвал. `<Outlet />` — место для «магазина», который меняется в зависимости от адреса.

### Как это работает
- Родительский маршрут рисует layout, дочерние — содержимое внутри него.
- В layout-компоненте ставишь `<Outlet />` — туда подставится текущая дочерняя страница.
- Пути дочерних маршрутов пишут относительно родителя: `"catalog"`, а не `"/catalog"`.
- `index: true` — страница по умолчанию для адреса родителя.
- Вложенность можно продолжать: раздел «Личный кабинет» со своим боковым меню внутри общего layout.

Layout рисуется один раз и не перемонтируется при переходах внутри него. Значит, состояние в шапке (например, открытое меню или поиск) сохраняется.

### Пример
```tsx
import { createBrowserRouter, Outlet, NavLink } from "react-router-dom";

function RootLayout() {
  return (
    <>
      <header>
        <NavLink to="/">Главная</NavLink>
        <NavLink to="/catalog">Каталог</NavLink>
        <NavLink to="/account">Кабинет</NavLink>
      </header>
      <main><Outlet /></main>
      <footer>© 2026 Магазин</footer>
    </>
  );
}

function AccountLayout() {
  return (
    <div className="account">
      <aside>
        <NavLink to="/account" end>Профиль</NavLink>
        <NavLink to="/account/orders">Заказы</NavLink>
      </aside>
      <section><Outlet /></section>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "catalog", element: <Catalog /> },
      {
        path: "account",
        element: <AccountLayout />,
        children: [
          { index: true, element: <Profile /> },
          { path: "orders", element: <Orders /> },
        ],
      },
    ],
  },
]);
```

### Частые ошибки
- Забыть `<Outlet />` в layout — дочерние страницы не появятся.
- Дочерние пути с ведущей косой чертой — они станут абсолютными.
- Копировать шапку и подвал в каждую страницу вместо общего layout.

### Мини-задание
Сделай приложение с общим layout (шапка, подвал) и разделом «Кабинет» со своим боковым меню и двумя вложенными страницами. Убедись, что шапка не перерисовывается при переходах.

@@ 3

### На пальцах
Страница 404 — вежливый администратор у двери, за которой ничего нет: «Такой комнаты у нас нет, но вот карта здания и выход на главную». Без него посетитель видит пустую белую стену и уходит.

### Как это работает
- Маршрут `path: "*"` ловит любой адрес, который не совпал с другими. Его ставят последним среди дочерних маршрутов, чтобы он показывался внутри общего layout.
- В `createBrowserRouter` есть ещё `errorElement` — его показывают, когда при загрузке страницы произошла ошибка или маршрут не найден.
- Для «не найден» на уровне данных (товар с несуществующим id) показывай такое же дружелюбное сообщение внутри страницы.

Что должно быть на хорошей странице 404:

- понятный заголовок «Страница не найдена»;
- короткое объяснение: возможно, ссылка устарела или в адресе опечатка;
- ссылка на главную и, если есть, поиск или популярные разделы;
- общий дизайн сайта — шапка и подвал на месте.

### Пример
```tsx
import { Link, useLocation } from "react-router-dom";

export function NotFound() {
  const { pathname } = useLocation();
  return (
    <section className="not-found">
      <h1>Страница не найдена</h1>
      <p>По адресу <code>{pathname}</code> ничего нет. Возможно, ссылка устарела.</p>
      <Link to="/">На главную</Link> · <Link to="/catalog">В каталог</Link>
    </section>
  );
}

// в маршрутах, последним среди children:
// { path: "*", element: <NotFound /> }
```

### Частые ошибки
- Нет маршрута `*` — пользователь видит пустой экран.
- 404-страница без шапки и ссылок — тупик.
- Маршрут `*` поставлен выше других — он перехватывает всё.

### Мини-задание
Добавь в своё приложение страницу 404 с адресом, который не нашёлся, и ссылками на главную и каталог. Проверь, открыв `/abracadabra`.

@@ 4

### На пальцах
Пока в проекте пять файлов, их можно держать в одной папке, как пять тарелок на одной полке. Когда файлов сто — нужен кухонный гарнитур: здесь посуда, здесь продукты, здесь приборы. Структура папок — договорённость, где что лежит, чтобы любой (и ты через месяц) нашёл нужное за секунду.

### Как это работает
Две популярные схемы.

По типу файлов — просто и подходит небольшим проектам:

```text
src/
├── components/   ← переиспользуемые детали: Button, Card, Modal
├── pages/        ← страницы для роутера: Home, Catalog, Product
├── hooks/        ← свои хуки: useFetch, useLocalStorage
├── api/          ← функции запросов к серверу
├── utils/        ← чистые функции: formatPrice, pluralize
├── types/        ← общие типы
└── App.tsx
```

По фичам — всё про одну функцию приложения рядом, лучше масштабируется:

```text
src/
├── features/
│   ├── cart/        ← CartPage, CartItem, useCart, cartApi
│   ├── catalog/
│   └── auth/
├── shared/          ← общее: ui/Button, lib/formatPrice
└── app/             ← роутер, layout, провайдеры
```

Правила, которые работают в любой схеме:

- один компонент — один файл, имя файла совпадает с именем компонента;
- общие детали интерфейса — в `components` или `shared/ui`, а не в папке конкретной страницы;
- импорты из `pages` в `components` не делают: детали не должны зависеть от страниц.

### Пример
```tsx
// src/utils/formatPrice.ts
export const formatPrice = (n: number) => n.toLocaleString("ru-RU") + " ₽";

// src/components/ProductCard.tsx
import { formatPrice } from "../utils/formatPrice";
export function ProductCard({ title, price }: { title: string; price: number }) {
  return <article><h3>{title}</h3><p>{formatPrice(price)}</p></article>;
}

// src/pages/Catalog.tsx
import { ProductCard } from "../components/ProductCard";
```

### Частые ошибки
- Всё в одной папке `src` или в одном файле `App.tsx` на 800 строк.
- Глубокая вложенность в 6 уровней ради «порядка».
- Разная схема в разных частях одного проекта.

### Мини-задание
Разложи свой проект на React по папкам `components`, `pages`, `hooks`, `utils`. Вынеси форматирование цены и даты в `utils`, а загрузку данных — в `hooks`. Проверь, что всё собирается через `npm run build`.
