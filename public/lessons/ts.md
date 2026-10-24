@@ 0

### На пальцах
JavaScript — разговор без договорённостей: тебе могут дать вместо числа строку, и ты узнаешь об этом, только когда всё сломается у пользователя. TypeScript — договор, подписанный заранее: «здесь всегда число». Редактор проверяет договор, пока ты пишешь код, и подчёркивает нарушение красным ещё до запуска.

### Как это работает
- TypeScript — это JavaScript плюс типы. Файлы `.ts` и `.tsx` перед запуском превращаются в обычный JS, типы при этом стираются.
- Ошибки типов видны в редакторе и при сборке, в браузере их уже нет.
- Базовые типы: `string`, `number`, `boolean`, `null`, `undefined`, массивы `number[]`, `string[]`.
- Тип пишется после двоеточия: `let age: number = 27`.

Вывод типов: TypeScript сам догадывается о типе по значению. `let age = 27` — уже `number`, писать тип не нужно. Явно типы указывают там, где догадаться нельзя: параметры функций, пустые массивы, данные с сервера.

`any` — «тип какой угодно», он отключает проверки. Его стараются не использовать.

### Пример
```ts
let title = "Лендинг";       // TS сам понял: string
let budget = 30000;          // number
let isPaid = false;          // boolean

budget = "много";            // ❌ Type 'string' is not assignable to type 'number'

const tags: string[] = [];   // пустой массив — тип нужно подсказать
tags.push("SEO");
tags.push(42);               // ❌ Argument of type 'number' is not assignable to parameter of type 'string'

let manager: string | null = null;  // пока не назначен
manager = "Анна";
```

Попробовать без установки — песочница на typescriptlang.org/play или режим TypeScript в «Песочнице» этого курса.

### Частые ошибки
- Писать типы везде, даже где TypeScript и так всё понял: `const name: string = "Анна"`.
- Затыкать ошибки через `any` — проверки пропадают, и в чём тогда смысл.
- Думать, что TypeScript проверяет данные в работающей программе. Он проверяет код до запуска; данные с сервера всё равно нужно валидировать.

### Мини-задание
Создай в песочнице переменные разных типов без явных аннотаций и наведи на них курсор — посмотри, что вывел TypeScript. Затем попробуй присвоить им значения другого типа и прочитай ошибки.

@@ 1

### На пальцах
`type` и `interface` — шаблон анкеты: какие поля в ней есть и что в каждое можно вписать. Описал один раз «Пользователь: имя — текст, возраст — число», и TypeScript проверит каждую анкету в программе: не забыли ли поле и не вписали ли в возраст слово.

### Как это работает
```ts
type User = { name: string; age: number };
interface User2 { name: string; age: number }
```

Для описания объектов они почти одинаковы. Разница:

- `interface` можно расширять через `extends` и «дописывать» повторным объявлением.
- `type` умеет больше: объединения (`"new" | "paid"`), псевдонимы для любых типов, комбинации через `&`.

Практичное правило: для объектов и props компонентов — что принято в проекте (часто `type`), для объединений — только `type`.

Расширение:

```ts
interface Person { name: string }
interface Employee extends Person { position: string }
```

Поле только для чтения: `readonly id: number`.

### Пример
```ts
type Status = "new" | "in_progress" | "done";

type Task = {
  readonly id: number;
  title: string;
  status: Status;
  assignee?: string;          // необязательное поле
};

interface Project {
  title: string;
  tasks: Task[];
}

const project: Project = {
  title: "Сайт кофейни",
  tasks: [
    { id: 1, title: "Макет", status: "done" },
    { id: 2, title: "Вёрстка", status: "in_progress", assignee: "Анна" },
  ],
};

project.tasks[0].status = "archived"; // ❌ "archived" нет в Status
project.tasks[0].id = 5;              // ❌ id только для чтения
```

### Частые ошибки
- Описывать один и тот же объект в нескольких местах по-разному. Опиши тип один раз и импортируй.
- Пытаться сделать объединение через `interface` — не получится.
- Делать все поля необязательными «на всякий случай» — тогда TypeScript перестаёт помогать.

### Мини-задание
Опиши тип `Product` (id, название, цена, категория из трёх вариантов, необязательная скидка) и тип `Cart` с массивом товаров. Создай корзину из двух товаров и попробуй нарушить каждое правило по разу.

@@ 2

### На пальцах
Объединение `string | number` — графа анкеты, куда можно вписать и текст, и число, например номер квартиры «12» или «12А». Необязательное поле — графа «Отчество (если есть)». TypeScript следит, чтобы ты не забыл про оба варианта, прежде чем работать со значением.

### Как это работает
- Объединение (union): `let id: string | number`. Значение может быть одного из типов.
- Пока тип не уточнён, разрешены только операции, общие для всех вариантов.
- **Сужение типа**: после проверки TypeScript понимает, какой вариант перед ним. Проверки: `typeof x === "string"`, `x === null`, `"field" in obj`, `Array.isArray(x)`.
- Объединение строковых литералов — самый частый случай: `type Size = "s" | "m" | "l"`.
- Необязательное поле `phone?: string` имеет тип `string | undefined`. Перед использованием проверь или используй `?.` и `??`.

Отдельный мощный приём — размеченное объединение: у всех вариантов есть общее поле-«метка», по которому TypeScript точно определяет вариант.

### Пример
```ts
function formatId(id: string | number) {
  if (typeof id === "number") {
    return id.toString().padStart(6, "0");   // здесь id — number
  }
  return id.toUpperCase();                    // здесь id — string
}

type User = { name: string; phone?: string };
function contact(u: User) {
  return u.phone ?? "Телефон не указан";
}

type Result =
  | { status: "ok"; data: string[] }
  | { status: "error"; message: string };

function show(r: Result) {
  if (r.status === "ok") console.log(r.data.length);   // TS знает: есть data
  else console.log(r.message);                         // TS знает: есть message
}
```

### Частые ошибки
- Вызывать метод строки у `string | number` без проверки — ошибка компиляции.
- Использовать необязательное поле как обязательное: `u.phone.length`.
- Ставить `!` (`u.phone!.length`), чтобы «заглушить» TypeScript. Это обещание «здесь точно есть значение», и если оно ложное — получишь ошибку в работе.

### Мини-задание
Опиши тип ответа загрузки: `{ state: "loading" }`, `{ state: "error"; message: string }`, `{ state: "success"; items: string[] }`. Напиши функцию, которая для каждого состояния возвращает текст для пользователя. Убедись, что TypeScript подсказывает поля в каждой ветке.

@@ 3

### На пальцах
Тип функции — инструкция на упаковке прибора: «на вход — 220 вольт, на выходе — горячая вода». Если подключить его к 380 или ждать от него лёд, TypeScript предупредит заранее. Тип массива — подпись на коробке: «здесь только яблоки».

### Как это работает
Функции:

```ts
function sum(a: number, b: number): number { return a + b; }
const greet = (name: string, title = "гость"): string => `Привет, ${title} ${name}`;
```

- Параметрам типы указывают всегда — TypeScript не может их угадать.
- Тип результата после скобок можно не писать — его выведут. Явно пишут для публичных функций, чтобы случайно не вернуть не то.
- Необязательный параметр: `(name?: string)`. Значение по умолчанию тоже делает его необязательным.
- Функция, которая ничего не возвращает, — тип `void`.
- Тип самой функции (например, для колбэка): `(item: Task) => void`.

Массивы: `number[]` или `Array<number>`. Массив объектов: `Task[]`. Кортеж — массив фиксированной длины с разными типами: `[string, number]`.

Методы массивов наследуют типы: если `tasks: Task[]`, то `tasks.map(t => t.title)` — это `string[]`, и тип писать не нужно.

### Пример
```ts
type Task = { id: number; title: string; done: boolean };

function toggle(tasks: Task[], id: number): Task[] {
  return tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
}

function forEachDone(tasks: Task[], cb: (t: Task) => void): void {
  tasks.filter(t => t.done).forEach(cb);
}

const tasks: Task[] = [
  { id: 1, title: "Макет", done: true },
  { id: 2, title: "Вёрстка", done: false },
];

const titles = tasks.map(t => t.title);       // string[] — выведено само
forEachDone(tasks, t => console.log(t.title));
toggle(tasks, "2");                           // ❌ string вместо number

const point: [number, number] = [55.75, 37.62];
```

### Частые ошибки
- Не типизировать параметры — они молча становятся `any` (или ошибка при `strict`).
- Писать `Array` без указания, чего массив: `const list: Array = []`.
- Путать `void` и `undefined` в колбэках — для «ничего не возвращает» используй `void`.

### Мини-задание
Типизируй функции корзины: `addItem(cart, item)`, `removeItem(cart, id)`, `total(cart)` и `onChange(cb)` с колбэком. Нарочно передай неправильные аргументы и посмотри ошибки.

@@ 4

### На пальцах
Generic — коробка с окошком для этикетки. Сама коробка одна и та же, но на этикетке пишешь, что внутри: «коробка яблок», «коробка книг». И дальше TypeScript помнит: из коробки яблок достаются именно яблоки, а не «что-то».

### Как это работает
Иногда функция работает с любым типом, но связь между входом и выходом важна. Например, `first(arr)` должна вернуть элемент того же типа, что лежит в массиве. С `any` эта связь теряется.

Generic — параметр-тип, обычно его называют `T`:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

- `first([1, 2, 3])` — TypeScript сам понял, что `T = number`, результат — `number | undefined`.
- `first(["a"])` — `T = string`.

Ты уже пользуешься generics, даже не замечая: `Array<string>`, `Promise<User>`, `useState<string>()`, `Map<string, number>`.

Ограничение generic: `<T extends { id: number }>` — «любой тип, но у него должно быть поле id».

### Пример
```ts
function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

function byId<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find(i => i.id === id);
}

type ApiResponse<T> = { data: T; error: string | null };

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  return r.json() as Promise<T>;
}

type User = { id: number; name: string };
const users = await getJson<User[]>("https://jsonplaceholder.typicode.com/users");
const anna = byId(users, 1);    // тип User | undefined
console.log(anna?.name);
```

### Частые ошибки
- Пытаться написать generic там, где хватит обычного типа. Generic нужен, когда тип выхода зависит от типа входа.
- Использовать `any` вместо generic и терять подсказки.
- Думать, что `getJson<User[]>` проверяет данные. Это только обещание для компилятора, сервер может прислать что угодно.

### Мини-задание
Напиши generic-функцию `groupBy<T>(items: T[], key: (item: T) => string)`, которая возвращает объект «ключ → массив элементов». Сгруппируй задачи по статусу и убедись, что TypeScript знает тип элементов в группах.

@@ 5

### На пальцах
`any` — пропуск «всё можно» на любой этаж: удобно, но охрана больше ничего не проверяет. `unknown` — посылка без подписи: принять можно, но открывать и пользоваться — только после проверки, что внутри. `strict` в настройках — включить охрану на полную.

### Как это работает
- `any` отключает проверки для значения и всего, что из него получено. Ошибки снова появляются только в работе.
- `unknown` — безопасная альтернатива для «неизвестно что». С ним ничего нельзя делать, пока не сузишь тип проверкой: `typeof`, `Array.isArray`, `instanceof`, проверка полей.
- Где встречается неизвестное: `JSON.parse`, ответ сервера, `catch (error)`, данные из `localStorage`.

`tsconfig.json` — настройки компилятора. Главная — `"strict": true`. Она включает набор проверок:

- `strictNullChecks` — `null` и `undefined` нельзя использовать там, где ждут значение. Ловит огромную долю реальных ошибок.
- `noImplicitAny` — запрещает молчаливые `any`, например у параметров без типа.

В новых проектах (Vite, Next.js) `strict` включён по умолчанию — не выключай его.

### Пример
```ts
function parseSettings(raw: string) {
  const data: unknown = JSON.parse(raw);

  // data.theme;                 // ❌ нельзя: тип unknown
  if (typeof data === "object" && data !== null && "theme" in data) {
    const theme = (data as { theme: unknown }).theme;
    if (theme === "dark" || theme === "light") return theme;
  }
  return "light";
}

try {
  JSON.parse("{сломано");
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.log(message);
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Частые ошибки
- Выключать `strict`, потому что «слишком много ошибок». Эти ошибки — настоящие баги.
- Писать `as any`, чтобы закрыть ошибку.
- Типизировать ответ сервера как точный тип без проверки. Для внешних данных удобна валидация через zod — к ней вернёмся позже.

### Мини-задание
Напиши функцию `readCart()`, которая читает корзину из `localStorage` как `unknown`, проверяет, что это массив объектов с `id` и `qty`, и иначе возвращает пустой массив. Включи `strict` и убедись, что нет ни одного `any`.
