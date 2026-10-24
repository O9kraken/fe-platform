@@ 0

### На пальцах
Состояние — память компонента. Обычная переменная в компоненте — запись мелом на доске, которую стирают при каждой перерисовке. `useState` — блокнот, который React хранит за компонента: запись не пропадает, а когда ты её меняешь через специальную функцию, React понимает, что пора перерисовать экран.

### Как это работает
```tsx
const [value, setValue] = useState(начальное);
```

- `value` — текущее значение.
- `setValue(новое)` — заменить значение и попросить React перерисовать компонент.
- Нельзя менять значение напрямую (`value = 5`) — React об этом не узнает.
- После вызова `setValue` значение меняется не сразу, а при следующей отрисовке. В той же функции `value` ещё старое.
- Если новое значение зависит от старого, передавай функцию: `setCount(c => c + 1)`. Так несколько обновлений подряд не потеряются.
- Хуки вызываются только на верхнем уровне компонента — не внутри `if`, циклов и обычных функций.

В TypeScript тип выводится из начального значения. Если начальное `null` или пустой массив — подскажи: `useState<User | null>(null)`.

### Пример
```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  function addThree() {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);     // +3, потому что функции получают свежее значение
  }

  return (
    <div>
      <p>Счёт: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={addThree}>+3</button>
      <button onClick={() => setLiked(!liked)}>{liked ? "❤️" : "🤍"}</button>
    </div>
  );
}
```

### Частые ошибки
- `let count = 0; count++` — экран не обновится.
- Ждать новое значение сразу после `setCount` в той же функции.
- Вызвать `useState` внутри `if` — React перепутает состояния между отрисовками.

### Мини-задание
Сделай компонент «Стакан воды»: кнопки «+1 стакан» и «Сбросить», счётчик, и надпись «Норма выполнена», когда стаканов 8 и больше. Добавь кнопку «+2 стакана» через функциональное обновление.

@@ 1

### На пальцах
Обработчик события — инструкция «что делать, когда нажмут». В обычном JS ты находишь кнопку и вешаешь на неё обработчик. В React ты прямо в разметке пишешь: «у этой кнопки при клике — вот эта функция». Найти и повесить React сделает сам.

### Как это работает
- События пишутся camelCase: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onMouseEnter`.
- Передаётся функция, а не её вызов: `onClick={save}`, а не `onClick={save()}`.
- Нужно передать аргумент — оборачивай в стрелочную: `onClick={() => remove(item.id)}`.
- Обработчик получает объект события: `(e) => ...`. `e.preventDefault()`, `e.target`, `e.key` работают как в обычном JS.
- Типы событий в TypeScript: `React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`. Если писать обработчик прямо в JSX, тип выводится сам.

Обработчики принято называть `handleЧто-то`, а props с обработчиками — `onЧто-то`: `<Button onClick={handleSave} />`.

### Пример
```tsx
import { useState } from "react";

type Item = { id: number; title: string };

export function Shop() {
  const [cart, setCart] = useState<Item[]>([]);
  const products: Item[] = [{ id: 1, title: "Чай" }, { id: 2, title: "Кофе" }];

  function handleAdd(item: Item) {
    setCart(prev => [...prev, item]);
  }

  function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") setCart([]);
  }

  return (
    <div onKeyDown={handleKey} tabIndex={0}>
      {products.map(p => (
        <button key={p.id} onClick={() => handleAdd(p)}>
          Добавить {p.title}
        </button>
      ))}
      <p>В корзине: {cart.length} (Esc — очистить)</p>
    </div>
  );
}
```

### Частые ошибки
- `onClick={handleAdd(p)}` — функция вызывается при каждой отрисовке, а это часто бесконечный цикл обновлений.
- `onclick` маленькими буквами — React не поймёт.
- Обработчик клика на `div` вместо кнопки — нет доступа с клавиатуры.

### Мини-задание
Сделай список из трёх тарифов. По клику на тариф он выделяется (храни `selectedId` в состоянии), а внизу появляется текст «Вы выбрали: …». Добавь сброс выбора по клавише Esc.

@@ 2

### На пальцах
Условный рендеринг — табло в аэропорту: в зависимости от ситуации оно показывает «Посадка», «Задержан» или «Отменён». Один компонент — разные картинки в зависимости от данных.

### Как это работает
Способы показать по условию:

| Способ | Когда | Пример |
|---|---|---|
| `if` с ранним `return` | весь компонент выглядит по-разному | `if (loading) return <Spinner />` |
| Тернарник `? :` | одно из двух | `{isOpen ? <Close /> : <Open />}` |
| `&&` | показать или ничего | `{error && <p>{error}</p>}` |
| Переменная | сложная логика | `let content; if (...) content = ...` |

Ловушка с `&&`: если слева число `0`, React выведет на экран «0». `{items.length && <List />}` при пустом списке покажет ноль. Пиши `{items.length > 0 && <List />}`.

`null` в JSX ничего не рисует — компонент может вернуть `null`, чтобы скрыться.

### Пример
```tsx
type Props = { user: { name: string; isAdmin: boolean } | null; unread: number };

export function Header({ user, unread }: Props) {
  if (!user) {
    return <a href="/login">Войти</a>;
  }

  return (
    <header>
      <span>Привет, {user.name}</span>
      {user.isAdmin && <a href="/admin">Админка</a>}
      {unread > 0 ? <b>Новых: {unread}</b> : <span>Новых нет</span>}
    </header>
  );
}
```

### Частые ошибки
- `{count && ...}` при `count = 0` — на экране появляется «0».
- Глубокие вложенные тернарники — вынеси логику в переменную или отдельный компонент.
- Прятать через CSS то, что вообще не нужно рисовать, — лишние элементы и запросы.

### Мини-задание
Сделай компонент `OrderStatus`, который по полю `status` ("new", "paid", "shipped", "cancelled") показывает разный текст и цвет, для "cancelled" — ещё и кнопку «Повторить заказ». Используй ранний `return` для неизвестного статуса.

@@ 3

### На пальцах
Неуправляемое поле — человек, который сам что-то пишет в бланке, а ты узнаёшь об этом, только когда он отдаст бланк. Управляемое — ты диктуешь, а он записывает: в каждый момент ты точно знаешь, что написано. В React значение поля хранится в состоянии, и поле показывает ровно то, что в состоянии.

### Как это работает
1. Значение поля лежит в `useState`.
2. `value={state}` — поле показывает состояние.
3. `onChange={e => setState(e.target.value)}` — каждое нажатие клавиши обновляет состояние.

Цикл: нажал клавишу → `onChange` → `setState` → перерисовка → поле показывает новое значение.

Что это даёт:

- в любой момент значение под рукой — для проверки, счётчика символов, кнопки «Отправить» неактивной при пустом поле;
- можно преобразовывать ввод: убирать пробелы, приводить к верхнему регистру;
- можно сбросить форму, просто обнулив состояние.

Для чекбокса — `checked` и `e.target.checked`. Для формы из многих полей удобно хранить один объект и обновлять поле по `name`.

### Пример
```tsx
import { useState } from "react";

export function LeadForm() {
  const [form, setForm] = useState({ name: "", phone: "", agree: false });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Отправляем", form);
    setForm({ name: "", phone: "", agree: false });
  }

  const canSend = form.name.trim().length >= 2 && form.agree;

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Имя" />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Телефон" />
      <label>
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} /> Согласен
      </label>
      <button disabled={!canSend}>Отправить</button>
    </form>
  );
}
```

### Частые ошибки
- `value` без `onChange` — поле «замерзает», в него нельзя печатать.
- Начальное значение `undefined`, а потом строка — предупреждение о переходе от неуправляемого поля к управляемому. Начинай с `""`.
- Для чекбокса использовать `value` вместо `checked`.

### Мини-задание
Сделай форму отзыва: имя, текст (с лимитом 200 символов и счётчиком «осталось N»), оценка через `select`. Кнопка отправки активна, только если имя и текст заполнены. После отправки форма очищается.

@@ 4

### На пальцах
Двое детей хотят играть одной машинкой. Если у каждого своя копия — они не узнают, что сделал другой. Решение: машинку держит мама (общий родитель) и передаёт тому, кто играет. Подъём состояния — то же самое: если двум компонентам нужны одни данные, данные переезжают к их общему родителю.

### Как это работает
1. Найди ближайшего общего родителя компонентов, которым нужны данные.
2. Перенеси `useState` в него.
3. Передай вниз значение через props.
4. Передай вниз функцию изменения (`onChange`, `onSelect`), чтобы дети могли попросить родителя обновить данные.

Данные текут вниз, события — вверх. Это главный поток данных в React.

Не поднимай выше, чем нужно: если состояние нужно одному компоненту, пусть оно живёт в нём. Чем выше состояние, тем больше компонентов перерисовывается при его изменении.

### Пример
```tsx
import { useState } from "react";

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder="Поиск" />;
}

function ProductList({ query }: { query: string }) {
  const products = ["Кроссовки", "Куртка", "Кепка", "Рюкзак"];
  const shown = products.filter(p => p.toLowerCase().includes(query.toLowerCase()));
  return <ul>{shown.map(p => <li key={p}>{p}</li>)}</ul>;
}

export default function Catalog() {
  const [query, setQuery] = useState("");       // состояние у общего родителя
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <p>Ищем: «{query}»</p>
      <ProductList query={query} />
    </>
  );
}
```

### Частые ошибки
- Дублировать одно и то же состояние в двух компонентах и пытаться их синхронизировать.
- Поднять всё состояние приложения в `App` «на всякий случай».
- Передавать вниз `setQuery` под именем `setQuery` — лучше называть по смыслу: `onChange`, `onSearch`.

### Мини-задание
Сделай компонент с двумя полями — рубли и доллары. Ввод в любое поле пересчитывает другое (курс — константа). Подсказка: храни одно значение в рублях у родителя, а доллары вычисляй.

@@ 5

### На пальцах
React замечает изменения по «конверту», а не по содержимому. Если ты достал из конверта письмо, дописал строчку и положил обратно — для React это тот же конверт, он ничего не заметит. Нужно положить письмо в новый конверт. Неизменяемое обновление — всегда новый массив или объект вместо правки старого.

### Как это работает
React сравнивает старое и новое состояние через `===`. Изменённый на месте массив — тот же самый объект, поэтому React может решить, что ничего не поменялось, и не перерисовать.

Шпаргалка для массивов:

| Действие | Неправильно (меняет) | Правильно (новый массив) |
|---|---|---|
| добавить | `arr.push(x)` | `[...arr, x]` |
| удалить | `arr.splice(i, 1)` | `arr.filter(x => x.id !== id)` |
| изменить | `arr[i].done = true` | `arr.map(x => x.id === id ? { ...x, done: true } : x)` |
| отсортировать | `arr.sort()` | `[...arr].sort()` или `arr.toSorted()` |

Для объектов: `{ ...obj, field: newValue }`. Для вложенных — копировать каждый уровень: `{ ...user, address: { ...user.address, city: "Казань" } }`.

### Пример
```tsx
import { useState } from "react";

type Todo = { id: number; text: string; done: boolean };

export function Todos() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Выучить useState", done: false },
  ]);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
    setText("");
  };
  const toggle = (id: number) =>
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: number) =>
    setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={add}>Добавить</button>
      <ul>
        {todos.map(t => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              {t.text}
            </label>
            <button onClick={() => remove(t.id)}>✕</button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

### Частые ошибки
- `todos.push(x); setTodos(todos)` — экран может не обновиться.
- Копировать только верхний уровень объекта и менять вложенный — изменения «протекают» в старое состояние.
- Сортировать состояние на месте прямо в JSX: `todos.sort(...)` меняет состояние при каждой отрисовке.

### Мини-задание
Доработай список задач: кнопка «Отметить все», кнопка «Удалить выполненные» и переименование задачи по двойному клику. Каждое действие — через новый массив.
