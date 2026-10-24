@@ 0

### На пальцах
Компонент рисует интерфейс, но иногда нужно сделать что-то «снаружи»: сходить на сервер, запустить таймер, поменять заголовок вкладки. `useEffect` — записка «после того как нарисуешь, сделай ещё вот это». Массив зависимостей — условие: «и повторяй, только когда изменится вот это».

### Как это работает
```tsx
useEffect(() => {
  // побочный эффект
  return () => { /* очистка, необязательно */ };
}, [зависимости]);
```

| Зависимости | Когда запускается |
|---|---|
| нет массива | после каждой отрисовки |
| `[]` | один раз после первой отрисовки |
| `[id]` | после первой и каждый раз, когда изменился `id` |

- В зависимости перечисляют все значения из компонента, которые используются внутри эффекта: props, состояние, функции. ESLint-правило `react-hooks/exhaustive-deps` подскажет, если что-то забыл.
- Эффект запускается после отрисовки, а не во время — экран не блокируется.
- В режиме разработки со `StrictMode` эффект запускается дважды: так React проверяет, что очистка написана правильно.

Сама функция эффекта не может быть `async`. Создай внутри async-функцию и вызови её.

### Пример
```tsx
import { useEffect, useState } from "react";

export function UserCard({ id }: { id: number }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    document.title = `Пользователь №${id}`;
  }, [id]);

  useEffect(() => {
    async function load() {
      const r = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      setUser(await r.json());
    }
    load();
  }, [id]);                       // перезагрузить при смене id

  return <p>{user ? user.name : "Загрузка…"}</p>;
}
```

### Частые ошибки
- Нет массива зависимостей и `setState` внутри эффекта — бесконечный цикл: отрисовка → эффект → обновление → отрисовка.
- Забыть зависимость: эффект использует `id`, а в массиве его нет — при смене `id` данные не обновятся.
- `useEffect(async () => ...)` — так нельзя.

### Мини-задание
Сделай компонент с кнопками «Пользователь 1, 2, 3». При выборе эффект загружает пользователя по id и меняет заголовок вкладки на его имя. Проверь, что при повторном клике на того же пользователя запроса нет.

@@ 1

### На пальцах
Ты запустил таймер на плите и ушёл из кухни насовсем — таймер будет пищать в пустой комнате. Функция очистки — «уходя, выключи за собой»: останови таймер, отпишись от событий, отмени запрос, который уже не нужен. `AbortController` — кнопка «отмена» для запроса `fetch`.

### Как это работает
- Если эффект возвращает функцию, React вызовет её перед следующим запуском эффекта и когда компонент исчезнет с экрана.
- Что обязательно чистить: `setInterval`/`setTimeout`, `addEventListener` на `window`/`document`, подписки (WebSocket), незавершённые запросы.

Зачем отменять запросы: пользователь быстро переключил вкладку «Пользователь 1» → «Пользователь 2». Если первый ответ пришёл позже второго, на экране окажется не тот пользователь. Это «гонка запросов».

`AbortController`:

1. `const controller = new AbortController()`
2. `fetch(url, { signal: controller.signal })`
3. В очистке: `controller.abort()` — запрос прерывается, `fetch` бросает ошибку `AbortError`, её нужно игнорировать.

### Пример
```tsx
import { useEffect, useState } from "react";

export function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);                 // остановить таймер
  }, []);
  return <p>{now.toLocaleTimeString("ru-RU")}</p>;
}

export function Post({ id }: { id: number }) {
  const [title, setTitle] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, { signal: controller.signal })
      .then(r => r.json())
      .then(p => setTitle(p.title))
      .catch(e => { if (e.name !== "AbortError") console.error(e); });
    return () => controller.abort();               // отменить устаревший запрос
  }, [id]);
  return <h2>{title}</h2>;
}
```

### Частые ошибки
- `setInterval` без очистки — после каждого открытия компонента таймеров становится больше.
- Слушатель `window.addEventListener("resize", ...)` без `removeEventListener` в очистке.
- Показывать пользователю ошибку `AbortError` — это нормальная отмена, а не сбой.

### Мини-задание
Сделай компонент «Ширина окна», который показывает `window.innerWidth` и обновляется при изменении размера. Добавь кнопку, скрывающую компонент, и проверь через `console.log` в очистке, что слушатель снимается.

@@ 2

### На пальцах
Ты заказал пиццу. Есть три вопроса, которые важны всегда: «уже везут?», «что-то пошло не так?» и «вот она!». Хороший компонент с загрузкой данных отвечает на все три, а не просто показывает пустоту, пока ждёт.

### Как это работает
Для запроса держат три части состояния: данные, загружается ли и ошибку. Или одну переменную со статусом.

Порядок в эффекте:

1. Перед запросом: `loading = true`, ошибку сбросить.
2. `fetch` в `try`, проверить `response.ok`.
3. Успех — положить данные.
4. Ошибка — положить понятное сообщение.
5. В `finally` — `loading = false`.

В отрисовке сначала обрабатывают особые случаи ранним `return`: загрузка, ошибка, пустой список — и в конце основной вид.

Кнопка «Повторить» при ошибке — простой способ: хранить счётчик попыток в состоянии и добавить его в зависимости эффекта.

### Пример
```tsx
import { useEffect, useState } from "react";

type Post = { id: number; title: string };

export function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
        if (!r.ok) throw new Error(`Ошибка ${r.status}`);
        const data = await r.json();
        if (!ignore) setPosts(data);
      } catch {
        if (!ignore) setError("Не удалось загрузить посты");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [attempt]);

  if (loading) return <p>Загрузка…</p>;
  if (error) return <p>{error} <button onClick={() => setAttempt(a => a + 1)}>Повторить</button></p>;
  if (posts.length === 0) return <p>Постов пока нет</p>;

  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

### Частые ошибки
- Забыть сбросить ошибку перед повторной попыткой — сообщение «висит» поверх новых данных.
- Начальное `loading = false` — на долю секунды мелькает «Постов пока нет».
- Не проверять `response.ok`.

### Мини-задание
Добавь в пример выбор количества постов (5, 10, 20) и замедли сеть в DevTools, чтобы увидеть загрузку. Включи Offline и проверь сообщение об ошибке и кнопку «Повторить».

@@ 3

### На пальцах
Ты в каждом компоненте пишешь одни и те же 20 строк: состояние, загрузка, ошибка, fetch, отмена. Кастомный хук — вынести этот ритуал в свою «кнопку»: `useFetch(url)`. Нажал — получил данные, загрузку и ошибку. Как готовая смесь для блинов вместо отмеривания муки каждый раз.

### Как это работает
- Кастомный хук — обычная функция, имя которой начинается с `use`, и внутри которой вызываются другие хуки.
- Он не рисует ничего, а возвращает данные и функции.
- Каждый компонент, вызвавший хук, получает своё собственное независимое состояние.
- Правила хуков действуют и для кастомных: вызывать на верхнем уровне компонента или другого хука.

Хорошие кандидаты на хуки: загрузка данных, работа с `localStorage`, размер окна, таймер, дебаунс ввода.

С generic в TypeScript хук знает тип данных: `useFetch<Post[]>(url)`.

### Пример
```tsx
// hooks/useFetch.ts
import { useEffect, useState } from "react";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(url, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`Ошибка ${r.status}`); return r.json(); })
      .then(setData)
      .catch(e => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}
```

```tsx
// Users.tsx
import { useFetch } from "./hooks/useFetch";

type User = { id: number; name: string };

export function Users() {
  const { data, error, loading } = useFetch<User[]>("https://jsonplaceholder.typicode.com/users");
  if (loading) return <p>Загрузка…</p>;
  if (error) return <p>{error}</p>;
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Частые ошибки
- Назвать функцию без `use` — ESLint не проверит правила хуков, и ошибки будет трудно найти.
- Думать, что два компонента с `useFetch` делят одни данные. Нет, у каждого свои — для общего кеша есть TanStack Query.
- Передавать в хук объект, создаваемый заново при каждой отрисовке, в качестве зависимости — эффект будет срабатывать постоянно.

### Мини-задание
Напиши хук `useLocalStorage<T>(key, initial)`, который работает как `useState`, но сохраняет значение в `localStorage`. Используй его для темы сайта «светлая/тёмная».

@@ 4

### На пальцах
`useEffect` — запасной выход, а не главная дверь. Новички прогоняют через него всё подряд: «изменилось имя — в эффекте посчитаю полное имя». Это как звонить себе на телефон, чтобы напомнить о том, что ты прямо сейчас держишь в руке.

### Как это работает
Эффект нужен для синхронизации с внешним миром: сервер, таймеры, браузерные API, сторонние библиотеки. Если внешнего мира нет — скорее всего, эффект не нужен.

| Задача | Вместо эффекта |
|---|---|
| Значение, вычисляемое из props и состояния | посчитать прямо в теле компонента |
| Тяжёлое вычисление | `useMemo` |
| Реакция на действие пользователя | код в обработчике события |
| Сбросить состояние при смене пропа | `key` у компонента |
| Отправить аналитику при клике | в обработчике клика, а не в эффекте на изменение состояния |

Признак лишнего эффекта: внутри только `setState` на основе других состояний или props.

### Пример
Плохо — лишнее состояние и лишняя отрисовка:

```tsx
const [first, setFirst] = useState("Анна");
const [last, setLast] = useState("Смирнова");
const [full, setFull] = useState("");
useEffect(() => { setFull(`${first} ${last}`); }, [first, last]);
```

Хорошо — просто вычисление:

```tsx
const [first, setFirst] = useState("Анна");
const [last, setLast] = useState("Смирнова");
const full = `${first} ${last}`;
```

Плохо — реакция на клик через эффект:

```tsx
const [submitted, setSubmitted] = useState(false);
useEffect(() => { if (submitted) sendForm(form); }, [submitted]);
```

Хорошо — в обработчике:

```tsx
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  sendForm(form);
}
```

### Частые ошибки
- Хранить в состоянии отфильтрованный список и обновлять его эффектом. Фильтруй прямо при отрисовке.
- Цепочки эффектов: один меняет состояние, другой на него реагирует, третий — на второй.
- Сбрасывать форму эффектом при смене `userId` вместо `<Form key={userId} />`.

### Мини-задание
Найди в своём коде (или в примерах выше) эффекты, которые только вычисляют значение или реагируют на клик, и перепиши без них. Сравни количество отрисовок с помощью `console.log` в теле компонента.
