@@ 0

### На пальцах
React — конструктор LEGO для интерфейсов. Вместо одной огромной страницы ты собираешь её из деталей: кнопка, карточка, шапка. Vite — коробка с инструкцией и пластиной, на которой удобно собирать. TypeScript — наклейки на деталях, которые не дают вставить деталь не туда.

### Как это работает
1. `npm create vite@latest my-shop -- --template react-ts`
2. `cd my-shop`, `npm install`, `npm run dev` → `http://localhost:5173`.

Что внутри:

```text
my-shop/
├── index.html            ← один div#root
├── src/
│   ├── main.tsx          ← «монтирует» App в div#root
│   ├── App.tsx           ← главный компонент
│   ├── App.css
│   └── assets/
├── tsconfig.json
└── vite.config.ts
```

- `main.tsx` находит `<div id="root">` и говорит React: «рисуй здесь компонент App».
- Весь интерфейс дальше — дерево компонентов, растущее из `App`.
- `.tsx` — TypeScript с JSX (HTML-подобной разметкой внутри кода).
- `<StrictMode>` в разработке специально вызывает некоторые функции дважды, чтобы находить ошибки. Это нормально.

### Пример
```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

```tsx
// src/App.tsx
export default function App() {
  return (
    <main>
      <h1>Мой магазин</h1>
      <p>Скоро здесь будет каталог.</p>
    </main>
  );
}
```

### Частые ошибки
- Удалить `<div id="root">` из `index.html` — приложению некуда рисоваться.
- Удивляться двойным `console.log` в разработке — это `StrictMode`.
- Создавать проект без TypeScript, а потом мучительно переводить. Сразу выбирай `react-ts`.

### Мини-задание
Создай проект `react-ts`, очисти `App.tsx` от шаблона и выведи заголовок, абзац и список из трёх пунктов. Поменяй текст и посмотри, как страница обновляется без перезагрузки.

@@ 1

### На пальцах
JSX — HTML, который живёт внутри JavaScript. Выглядит почти как HTML, но это переодетый JS, поэтому у него свои правила: вместо `class` — `className`, всё нужно класть в одну коробку, а фигурные скобки — окошко, через которое внутрь разметки можно подставить любое выражение.

### Как это работает
Главные правила:

1. **Один корневой элемент.** Компонент возвращает одно дерево. Если обёртка не нужна — пустые угловые скобки `<>...</>` (фрагмент).
2. **`className` вместо `class`**, `htmlFor` вместо `for` у `label`.
3. **Все теги закрыты**: `<img />`, `<br />`, `<input />`.
4. **camelCase для атрибутов**: `onClick`, `tabIndex`, `strokeWidth`.
5. **`{выражение}`** — подставить значение: переменную, вычисление, вызов функции, тернарник. Нельзя вставить `if` или `for` — только выражения.
6. **`style`** принимает объект: `style={{ color: "red", fontSize: 18 }}`.
7. Комментарий: `{/* текст */}`.

JSX безопасен по умолчанию: строки в `{}` выводятся как текст, HTML-теги внутри них не выполняются.

### Пример
```tsx
export default function Profile() {
  const name = "Анна";
  const skills = 3;
  const avatar = "https://i.pravatar.cc/80";

  return (
    <>
      <img src={avatar} alt={`Фото: ${name}`} className="avatar" />
      <h2 className="title">{name.toUpperCase()}</h2>
      <p style={{ color: skills > 2 ? "green" : "gray" }}>
        Навыков: {skills} {skills > 2 ? "— отлично" : ""}
      </p>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      {/* комментарий в JSX */}
    </>
  );
}
```

### Частые ошибки
- Два соседних корневых элемента без обёртки — ошибка «Adjacent JSX elements must be wrapped».
- `class` вместо `className` — React предупредит в консоли.
- Писать `if` внутри `{}`. Используй тернарник или вычисли значение выше.

### Мини-задание
Свёрстай в JSX карточку пользователя: аватар, имя, город, статус «в сети» зелёным или «не в сети» серым (через тернарник и `className`). Значения храни в переменных над `return`.

@@ 2

### На пальцах
Компонент — штамп: один раз вырезал форму «карточка товара», потом штампуешь сколько угодно. Props — краска, которой мажешь штамп перед каждым оттиском: название, цена, картинка. Форма одна, оттиски разные.

### Как это работает
- Компонент — функция, которая возвращает JSX. Имя всегда с большой буквы: `ProductCard`, иначе React примет его за HTML-тег.
- Используется как тег: `<ProductCard title="Кроссовки" price={5990} />`.
- Props приходят первым аргументом — объектом. Их удобно сразу деструктурировать.
- Строки передают в кавычках, всё остальное — в фигурных скобках: числа, массивы, функции.
- В TypeScript props описывают типом.
- Props только для чтения: компонент не меняет то, что ему передали.
- Обычно компонент живёт в своём файле: `components/ProductCard.tsx`.

### Пример
```tsx
// components/ProductCard.tsx
type Props = {
  title: string;
  price: number;
  image: string;
  isNew?: boolean;
};

export function ProductCard({ title, price, image, isNew = false }: Props) {
  return (
    <article className="card">
      <img src={image} alt={title} />
      {isNew && <span className="badge">Новинка</span>}
      <h3>{title}</h3>
      <p>{price.toLocaleString("ru-RU")} ₽</p>
    </article>
  );
}
```

```tsx
// App.tsx
import { ProductCard } from "./components/ProductCard";

export default function App() {
  return (
    <div className="grid">
      <ProductCard title="Кроссовки" price={5990} image="/shoes.jpg" isNew />
      <ProductCard title="Куртка" price={8990} image="/jacket.jpg" />
    </div>
  );
}
```

### Частые ошибки
- Имя компонента с маленькой буквы — React ничего не нарисует.
- Число в кавычках: `price="5990"` — придёт строка.
- Менять props внутри: `props.price = 0` — нельзя. Для изменяемых данных есть состояние.

### Мини-задание
Сделай компонент `ServiceCard` (название, цена, срок, необязательный флаг «хит») и выведи три разные услуги. Опиши props типом и проверь, что TypeScript ругается на пропущенное обязательное поле.

@@ 3

### На пальцах
Список в React — фабрика штампов: берёшь массив данных и для каждого элемента делаешь оттиск компонента. `key` — номер на каждом оттиске. Когда что-то в списке меняется, React по номерам понимает, какая карточка новая, какую удалили, а какие просто переехали.

### Как это работает
- Списки рисуют через `map`: `{items.map(item => <Card key={item.id} {...item} />)}`.
- У каждого элемента списка должен быть проп `key` — уникальный и постоянный среди соседей.
- Лучший ключ — `id` из данных. Индекс массива подходит, только если список никогда не сортируется, не фильтруется и не меняется.
- `key` не передаётся внутрь компонента как prop — он только для React.

Почему индекс плох: удалили первый элемент — у всех остальных сдвинулись индексы. React решит, что изменились все карточки, а состояние внутри (например, введённый текст в поле) перепутается между карточками.

Фильтрация и сортировка — до `map`: `items.filter(...).map(...)`.

### Пример
```tsx
type Task = { id: number; title: string; done: boolean };

const tasks: Task[] = [
  { id: 101, title: "Сверстать шапку", done: true },
  { id: 102, title: "Подключить API", done: false },
  { id: 103, title: "Задеплоить", done: false },
];

export function TaskList() {
  const active = tasks.filter(t => !t.done);

  return (
    <section>
      <h2>Осталось: {active.length}</h2>
      <ul>
        {active.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
      {active.length === 0 && <p>Все задачи выполнены 🎉</p>}
    </section>
  );
}
```

### Частые ошибки
- Нет `key` — предупреждение «Each child in a list should have a unique key prop».
- `key={Math.random()}` — ключ меняется при каждой отрисовке, React пересоздаёт все элементы.
- Забыть `return` в `map` с фигурными скобками: `map(t => { <li>...</li> })`.

### Мини-задание
Выведи список из 6 товаров через `map` с ключом по `id`. Добавь отдельный блок «Только в наличии», который фильтрует тот же массив. Попробуй убрать `key` и посмотри предупреждение в консоли.

@@ 4

### На пальцах
Композиция — матрёшка с окошком: внешняя «рамка» (карточка, модальное окно, раздел) не знает, что в неё положат, — она просто красиво обрамляет. `children` — то, что ты вложил внутрь тега компонента. Одна рамка — бесконечно разное содержимое.

### Как это работает
- Всё, что написано между открывающим и закрывающим тегом компонента, приходит в проп `children`.
- Тип в TypeScript: `children: React.ReactNode` — любой JSX, текст, число, массив элементов.
- Так делают обёртки: `Card`, `Modal`, `Section`, `Layout`.
- Можно передавать несколько «слотов» через обычные props: `<Section title={<h2>…</h2>} actions={<button>…</button>}>`.

Композиция лучше, чем один компонент с десятком флагов вроде `hasIcon`, `isBig`, `showFooter`. Собирай из маленьких частей.

### Пример
```tsx
import type { ReactNode } from "react";

type CardProps = { title: string; footer?: ReactNode; children: ReactNode };

function Card({ title, footer, children }: CardProps) {
  return (
    <article className="card">
      <h3 className="card__title">{title}</h3>
      <div className="card__body">{children}</div>
      {footer && <footer className="card__footer">{footer}</footer>}
    </article>
  );
}

export default function App() {
  return (
    <>
      <Card title="Лендинг" footer={<button>Заказать</button>}>
        <p>Одностраничный сайт под рекламу.</p>
        <p><b>от 30 000 ₽</b></p>
      </Card>

      <Card title="Отзыв">
        <blockquote>«Сделали за неделю, заявки пошли сразу»</blockquote>
      </Card>
    </>
  );
}
```

### Частые ошибки
- Компонент-монстр с двадцатью флагами вместо нескольких маленьких.
- Забыть вывести `{children}` внутри обёртки — содержимое исчезнет.
- Тип `children: JSX.Element` вместо `ReactNode` — тогда нельзя передать текст или несколько элементов.

### Мини-задание
Сделай компонент `Section` с заголовком и `children` и компонент `Modal` с заголовком, `children` и кнопкой закрытия. Собери из них страницу с двумя разделами и одним модальным окном.
