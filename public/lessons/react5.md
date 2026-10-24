@@ 0

### На пальцах
Бабушка хочет передать внучке пирожок, но между ними пять родственников, и каждый должен передать пирожок дальше по цепочке, хотя самим им он не нужен. Prop drilling — когда данные протаскивают через много компонентов-«посредников» только ради того, чтобы они дошли до глубоко вложенного компонента.

### Как это работает
Пример: тема сайта нужна кнопке в самом низу дерева. `App → Layout → Header → Toolbar → ThemeButton`. Каждый промежуточный компонент принимает `theme` и передаёт дальше.

Когда это проблема:

- посредников больше двух-трёх;
- одни и те же данные нужны во многих местах (текущий пользователь, тема, язык, корзина);
- переименовать проп — значит править пять файлов.

Когда это нормально:

- передача на один-два уровня — это просто явный поток данных, его легко читать;
- данные нужны только одной ветке.

Что делать:

1. Композиция: передать готовый элемент через `children`, чтобы посредник не знал о данных.
2. Context — «радиовещание» для всего поддерева.
3. Менеджер состояния (Zustand) — для сложного общего состояния.

### Пример
Проблема:

```tsx
function App() { const user = { name: "Анна" }; return <Layout user={user} />; }
function Layout({ user }) { return <Header user={user} />; }
function Header({ user }) { return <UserMenu user={user} />; }
function UserMenu({ user }) { return <span>{user.name}</span>; }
```

Решение композицией — Layout и Header больше не знают про user:

```tsx
function App() {
  const user = { name: "Анна" };
  return <Layout header={<Header menu={<UserMenu user={user} />} />} />;
}
function Layout({ header }) { return <div>{header}</div>; }
function Header({ menu }) { return <header>{menu}</header>; }
```

### Частые ошибки
- Бросаться делать Context для данных, которые проходят всего один уровень.
- Терпеть прокидывание через шесть уровней, потому что «так проще сейчас».
- Делать один огромный Context «на всё приложение».

### Мини-задание
Найди в своём проекте проп, который проходит через два и более компонента-посредника. Перепиши сначала через композицию, затем через Context (следующий пункт) и сравни, какой вариант понятнее.

@@ 1

### На пальцах
Context — громкоговоритель в здании: объявление слышат все комнаты, не нужно ходить и передавать записку по цепочке. `useReducer` — регламент: вместо того чтобы каждый менял данные как хочет, все отправляют заявки («добавить товар», «очистить корзину»), а одна функция по правилам решает, каким станет состояние.

### Как это работает
Context:

1. `const CartContext = createContext(...)` — создать «канал».
2. `<CartContext.Provider value={...}>` — вещать значение для всего, что внутри.
3. `useContext(CartContext)` — «настроиться на канал» в любом вложенном компоненте.

Когда значение провайдера меняется, перерисовываются все, кто его читает.

useReducer:

```tsx
const [state, dispatch] = useReducer(reducer, начальное);
dispatch({ type: "add", item });
```

- `reducer(state, action)` — чистая функция: по текущему состоянию и действию возвращает новое.
- Удобен, когда переходов много и они связаны: корзина, сложная форма, пошаговый мастер.

Вместе они дают простой «глобальный стор»: reducer хранит логику, Context раздаёт состояние и `dispatch`.

### Пример
```tsx
import { createContext, useContext, useReducer, type ReactNode } from "react";

type Item = { id: number; title: string; qty: number };
type Action =
  | { type: "add"; item: Omit<Item, "qty"> }
  | { type: "remove"; id: number }
  | { type: "clear" };

function cartReducer(state: Item[], action: Action): Item[] {
  switch (action.type) {
    case "add": {
      const found = state.find(i => i.id === action.item.id);
      return found
        ? state.map(i => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state, { ...action.item, qty: 1 }];
    }
    case "remove":
      return state.filter(i => i.id !== action.id);
    case "clear":
      return [];
  }
}

const CartContext = createContext<{ items: Item[]; dispatch: React.Dispatch<Action> } | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  return <CartContext.Provider value={{ items, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart нужно использовать внутри CartProvider");
  return ctx;
}

// где угодно в дереве:
function CartBadge() {
  const { items } = useCart();
  return <span>🛒 {items.reduce((n, i) => n + i.qty, 0)}</span>;
}
```

### Частые ошибки
- Вызвать `useContext` вне провайдера — получишь значение по умолчанию (`null`) и ошибку.
- Класть в один Context всё подряд — любое изменение перерисует всё приложение.
- Мутировать состояние в reducer (`state.push`) — reducer должен возвращать новое значение.

### Мини-задание
Сделай `ThemeContext` со значением «светлая/тёмная» и функцией переключения. Кнопка переключения — глубоко внутри дерева, а класс темы — на корневом элементе. Затем добавь корзину на `useReducer` с действиями add, remove, clear.

@@ 2

### На пальцах
Состояние клиента — то, что принадлежит только этой вкладке браузера: открыто ли меню, что набрано в поле, какая вкладка выбрана. Состояние сервера — копия чужих данных: товары, заказы, профиль. Оно может устареть в любую секунду, потому что настоящие данные живут на сервере, и их меняют другие люди.

### Как это работает
| | Клиентское | Серверное |
|---|---|---|
| Где живёт оригинал | в браузере | в базе на сервере |
| Примеры | открыт ли модал, тема, ввод в форме | список товаров, профиль, заказы |
| Может устареть | нет | да, в любой момент |
| Нужно | `useState`, `useReducer`, Context | загрузка, кеш, повторные запросы, обновление |

Серверные данные требуют решения множества задач:

- показать загрузку и ошибку;
- не запрашивать одно и то же из пяти компонентов;
- кешировать: вернулся на страницу — показать сразу, а в фоне обновить;
- обновлять после изменений (создал заказ — список заказов должен обновиться);
- повторять запрос при сбое сети.

Писать это руками через `useEffect` в каждом компоненте долго и с ошибками. Поэтому для серверного состояния используют специальные библиотеки: TanStack Query, SWR, RTK Query. А для клиентского хватает встроенных средств React.

### Пример
```tsx
// клиентское состояние — useState
const [isMenuOpen, setMenuOpen] = useState(false);
const [query, setQuery] = useState("");

// серверное состояние — библиотека (подробнее в следующем пункте)
const { data: products, isPending } = useQuery({
  queryKey: ["products", query],
  queryFn: () => fetch(`/api/products?q=${query}`).then(r => r.json()),
});
```

### Частые ошибки
- Загружать данные в `useEffect` и хранить в глобальном сторе «навсегда» — они устаревают, а ты не узнаешь.
- Копировать серверные данные в локальное состояние «для редактирования» и забывать синхронизировать.
- Тянуть менеджер состояния ради открытого меню.

### Мини-задание
Выпиши все данные своего учебного проекта и раздели на два столбца: клиентские и серверные. Для серверных отметь, где сейчас дублируются запросы или может показываться устаревшая информация.

@@ 3

### На пальцах
TanStack Query — личный курьер для серверных данных. Ты говоришь: «мне нужны товары». Курьер смотрит в кладовку (кеш): если там свежие — отдаёт сразу, если устарели — отдаёт что есть и тут же едет за новыми. Сам повторяет поездку, если не получилось, и следит, чтобы за одним и тем же не ездили два курьера сразу.

### Как это работает
1. `npm install @tanstack/react-query`
2. Создать `QueryClient` и обернуть приложение в `QueryClientProvider`.
3. В компоненте: `useQuery({ queryKey, queryFn })`.

- `queryKey` — уникальный ключ данных в кеше: `["products"]`, `["product", id]`. Изменился ключ — новый запрос.
- `queryFn` — функция, которая возвращает промис с данными.
- Результат: `data`, `isPending` (первая загрузка), `isError`, `error`, `isFetching` (идёт обновление в фоне), `refetch`.
- `staleTime` — сколько данные считаются свежими. По умолчанию 0: при каждом возвращении на страницу данные обновятся в фоне.

Изменения на сервере делают через `useMutation`, а после успеха помечают кеш устаревшим: `queryClient.invalidateQueries({ queryKey: ["todos"] })` — и списки обновятся сами.

### Пример
```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
createRoot(root).render(
  <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
);
```

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Todo = { id: number; title: string; completed: boolean };
const API = "https://jsonplaceholder.typicode.com/todos";

export function Todos() {
  const qc = useQueryClient();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["todos"],
    queryFn: async (): Promise<Todo[]> => {
      const r = await fetch(`${API}?_limit=5`);
      if (!r.ok) throw new Error(`Ошибка ${r.status}`);
      return r.json();
    },
    staleTime: 60_000,
  });

  const add = useMutation({
    mutationFn: (title: string) =>
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  if (isPending) return <p>Загрузка…</p>;
  if (isError) return <p>{error.message}</p>;
  return (
    <>
      <button onClick={() => add.mutate("Новая задача")} disabled={add.isPending}>Добавить</button>
      <ul>{data.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </>
  );
}
```

### Частые ошибки
- `queryFn` не бросает ошибку при `!response.ok` — библиотека считает 404 успехом.
- Ключ не содержит параметров: `queryKey: ["product"]` для разных id — все товары перепутаются в кеше.
- Хранить результат `useQuery` в `useState` — данные перестают обновляться.

### Мини-задание
Перепиши загрузку постов из прошлых уроков на `useQuery`. Открой страницу, уйди на другую вкладку браузера и вернись — посмотри в Network, как данные обновляются в фоне. Поставь `staleTime: 30000` и сравни.

@@ 4

### На пальцах
Zustand — общий блокнот на холодильнике для всей семьи. Любой может подойти, прочитать и дописать, не передавая записки через других. По сравнению с Context он проще в использовании и аккуратнее: человек, которого интересует только список покупок, не отвлекается, когда кто-то правит расписание.

### Как это работает
- `npm install zustand`
- `create(...)` создаёт хук-стор: внутри состояние и функции, которые его меняют.
- В компоненте вызываешь хук с функцией-селектором: `useCart(s => s.items)`. Компонент перерисуется, только когда изменится выбранная часть.
- Провайдер не нужен — стор можно использовать где угодно, даже вне React.
- Есть готовое сохранение в `localStorage` — middleware `persist`.

Когда Zustand оправдан:

- клиентское состояние нужно во многих несвязанных местах: корзина, избранное, настройки интерфейса;
- Context начинает тормозить из-за лишних перерисовок;
- логика изменений разрослась.

Когда не нужен:

- серверные данные — для них TanStack Query;
- состояние одного компонента или одной ветки — `useState`;
- одна-две глобальные настройки — хватит Context.

### Пример
```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Item = { id: number; title: string; qty: number };
type CartState = {
  items: Item[];
  add: (item: Omit<Item, "qty">) => void;
  remove: (id: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    set => ({
      items: [],
      add: item => set(s => {
        const found = s.items.find(i => i.id === item.id);
        return {
          items: found
            ? s.items.map(i => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
            : [...s.items, { ...item, qty: 1 }],
        };
      }),
      remove: id => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "cart" }   // ключ в localStorage
  )
);

function CartBadge() {
  const count = useCart(s => s.items.reduce((n, i) => n + i.qty, 0));
  return <span>🛒 {count}</span>;
}

function AddButton({ id, title }: { id: number; title: string }) {
  const add = useCart(s => s.add);
  return <button onClick={() => add({ id, title })}>В корзину</button>;
}
```

### Частые ошибки
- `const store = useCart()` без селектора — компонент перерисовывается при любом изменении стора.
- Класть в Zustand ответы сервера и вручную их обновлять.
- Мутировать состояние внутри `set` вместо возврата новых объектов.

### Мини-задание
Сделай стор «Избранное» на Zustand с `persist`: добавить, убрать, проверить, есть ли товар. Покажи счётчик в шапке и кнопку-сердечко на карточках. Обнови страницу — избранное должно сохраниться.
