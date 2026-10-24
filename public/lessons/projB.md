@@ 0

### На пальцах
Supabase — готовая кухня для твоего ресторана: база данных, вход для пользователей, хранилище файлов — всё уже подключено. Тебе не нужно строить свой сервер, чтобы у приложения появились аккаунты и сохранённые данные. Ты просто подключаешь фронтенд к этой кухне.

### Как это работает
1. Зарегистрируйся на supabase.com, создай проект.
2. В разделе Table Editor создай таблицу, например `notes` с колонками `id`, `user_id`, `title`, `done`, `created_at`.
3. В Settings → API возьми `Project URL` и `anon public key`. Этот ключ можно использовать во фронтенде: доступ к данным ограничивают правила RLS (следующий пункт).
4. `npm install @supabase/supabase-js`.
5. Создай клиент и работай с данными через методы вроде `from("notes").select()`.

Вход:

- `supabase.auth.signUp({ email, password })` — регистрация;
- `supabase.auth.signInWithPassword({ email, password })` — вход;
- `supabase.auth.getUser()` — кто сейчас вошёл;
- `supabase.auth.signOut()` — выход;
- `onAuthStateChange` — подписка на вход и выход.

Каждый запрос возвращает `{ data, error }` — всегда проверяй `error`.

### Пример
```ts
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

```ts
// вход и запрос
import { supabase } from "./lib/supabase";

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Неверный email или пароль");
}

export async function getMyNotes() {
  const { data, error } = await supabase
    .from("notes")
    .select("id, title, done, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
```

### Частые ошибки
- Положить во фронтенд `service_role` ключ — он обходит все правила и даёт полный доступ к базе.
- Не проверять `error` и получать `data = null`.
- Создать таблицы и забыть включить RLS — данные всех пользователей открыты всем.

### Мини-задание
Создай проект в Supabase с таблицей `notes`, подключи клиент к своему React-приложению и сделай регистрацию, вход и выход. Выводи email вошедшего пользователя в шапке.

@@ 1

### На пальцах
Row Level Security — консьерж в многоквартирном доме, который пускает каждого жильца только в его собственную квартиру. Даже если кто-то знает номер чужой квартиры и очень вежливо просит, консьерж проверяет паспорт и не пускает. Правило живёт в самой базе, поэтому обойти его из браузера нельзя.

### Как это работает
- RLS — правила доступа на уровне строк таблицы в PostgreSQL.
- Включается для каждой таблицы отдельно. После включения без правил никто ничего не видит.
- Политика (policy) описывает: для какой операции (SELECT, INSERT, UPDATE, DELETE) и при каком условии строка доступна.
- В Supabase функция `auth.uid()` возвращает id текущего пользователя из его сессии.

Типичная политика: «пользователь видит и меняет только строки, где `user_id = auth.uid()`».

Почему это важно: фронтенд работает с базой напрямую, а значит любой может открыть DevTools и отправить свой запрос — например, «дай все заметки». Без RLS база отдаст всё.

Настраивается в Supabase: Authentication → Policies, или SQL-редактором.

### Пример
```sql
-- включить защиту строк
alter table notes enable row level security;

-- читать только свои заметки
create policy "читать свои" on notes
  for select using (user_id = auth.uid());

-- создавать заметки только от своего имени
create policy "создавать свои" on notes
  for insert with check (user_id = auth.uid());

-- менять и удалять только свои
create policy "менять свои" on notes
  for update using (user_id = auth.uid());
create policy "удалять свои" on notes
  for delete using (user_id = auth.uid());

-- user_id заполняется автоматически текущим пользователем
alter table notes alter column user_id set default auth.uid();
```

### Частые ошибки
- Таблица без RLS — Supabase помечает её предупреждением «unrestricted».
- Политика `using (true)` «чтобы заработало» — открывает всё всем.
- Проверка прав только во фронтенде (`if (note.user_id === me.id)`) — это не защита, а интерфейс.

### Мини-задание
Включи RLS для таблицы `notes` и добавь четыре политики. Зарегистрируй два аккаунта, создай по заметке и убедись, что каждый видит только свою. Попробуй из консоли браузера запросить заметки без фильтра.

@@ 2

### На пальцах
Большая форма на чистом `useState` — бухгалтерия на счётах: работает, но каждое поле, ошибку и проверку приходится вести вручную. react-hook-form — бухгалтерская программа для формы: сама следит за полями, ошибками и отправкой. zod — свод правил: «имя от 2 символов, email похож на email, сумма больше нуля». Программа сверяет форму со сводом.

### Как это работает
- `npm install react-hook-form zod @hookform/resolvers`
- Описываешь схему zod — правила и тексты ошибок.
- Тип данных формы выводится из схемы: `z.infer<typeof schema>`, отдельно описывать не нужно.
- `useForm({ resolver: zodResolver(schema) })` связывает форму со схемой.
- `register("name")` подключает поле. Возвращает `name`, `onChange`, `onBlur`, `ref`.
- `handleSubmit(onValid)` — вызовет функцию, только если данные прошли проверку.
- `formState.errors` — ошибки по полям, `formState.isSubmitting` — идёт ли отправка.

react-hook-form не перерисовывает всю форму на каждый символ — большие формы работают быстро.

Та же схема zod потом пригодится на сервере для проверки данных.

### Пример
```tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа"),
  email: z.string().email("Проверьте email"),
  budget: z.coerce.number().min(10000, "Бюджет от 10 000 ₽"),
});
type FormData = z.infer<typeof schema>;

export function BriefForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await fetch("/api/brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="name">Имя</label>
      <input id="name" {...register("name")} aria-invalid={!!errors.name} />
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" type="email" {...register("email")} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <label htmlFor="budget">Бюджет</label>
      <input id="budget" inputMode="numeric" {...register("budget")} />
      {errors.budget && <p role="alert">{errors.budget.message}</p>}

      <button disabled={isSubmitting}>{isSubmitting ? "Отправляем…" : "Отправить"}</button>
    </form>
  );
}
```

### Частые ошибки
- Забыть `resolver` — схема не применяется.
- Числовые поля без `z.coerce.number()` — из input приходит строка, и проверка «число» падает.
- Описывать тип формы вручную и схему отдельно — они расходятся. Выводи тип из схемы.

### Мини-задание
Перепиши форму создания заметки на react-hook-form + zod: заголовок от 3 до 100 символов, необязательное описание до 500, дата не в прошлом. Покажи ошибки под полями и заблокируй кнопку на время отправки.

@@ 3

### На пальцах
Защищённая страница — комната с охранником на двери. Без пропуска охранник вежливо отправляет на ресепшен (страницу входа) и запоминает, куда ты шёл, чтобы после оформления пропуска сразу проводить туда. Но помни: охранник у двери — для удобства. Настоящие сейфы (данные) защищает сервер или RLS.

### Как это работает
1. Храни текущего пользователя в Context или сторе. Пока не выяснили, вошёл ли он, — состояние «проверяю» (`undefined`), иначе пользователь или `null`.
2. Компонент-обёртка `RequireAuth`:
   - пока проверяем — показать загрузку (иначе вошедший на секунду увидит страницу входа);
   - не вошёл — `<Navigate to="/login" state={{ from: location }} replace />`;
   - вошёл — показать содержимое.
3. После входа отправляй туда, откуда пришли: `navigate(location.state?.from?.pathname ?? "/account")`.
4. Можно сделать проверку роли: `RequireRole role="admin"`.

Почему это не защита данных: код фронтенда может изменить кто угодно. Защищённая страница прячет интерфейс, а данные защищает сервер, отвечая 401/403, или RLS.

### Пример
```tsx
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "./auth";

export function RequireAuth() {
  const { user } = useAuth();          // undefined — проверяем, null — гость
  const location = useLocation();

  if (user === undefined) return <p>Проверяем вход…</p>;
  if (user === null) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// маршруты
const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      { path: "/account", element: <Account /> },
      { path: "/notes", element: <Notes /> },
    ],
  },
]);
```

```tsx
// после успешного входа
const from = (location.state as { from?: Location })?.from?.pathname ?? "/account";
navigate(from, { replace: true });
```

### Частые ошибки
- Нет состояния «проверяю» — при обновлении страницы вошедшего пользователя на мгновение выкидывает на вход.
- Без `replace` — кнопка «Назад» возвращает на защищённую страницу и снова перекидывает на вход.
- Считать, что спрятанная страница защищает данные.

### Мини-задание
Сделай `RequireAuth` для разделов `/account` и `/notes`. Проверь три сценария: гость открывает `/notes` → вход → возвращается на `/notes`; вошедший обновляет страницу — не видит экрана входа; после выхода — снова перенаправление.

@@ 4

### На пальцах
CRUD — четыре действия, из которых состоит почти любое приложение: создать (Create), прочитать (Read), изменить (Update), удалить (Delete). Заметки, задачи, заказы, посты — везде одно и то же. Научился делать CRUD аккуратно — можешь сделать 80% бизнес-приложений.

### Как это работает
| Действие | Supabase | REST API | В интерфейсе |
|---|---|---|---|
| Create | `insert({...})` | `POST /notes` | форма создания |
| Read | `select()` | `GET /notes`, `GET /notes/:id` | список и страница |
| Update | `update({...}).eq("id", id)` | `PATCH /notes/:id` | редактирование, галочка |
| Delete | `delete().eq("id", id)` | `DELETE /notes/:id` | кнопка с подтверждением |

Что сделать хорошо, а не «просто работает»:

- после создания и изменения — обновить список (через `invalidateQueries` или локально);
- блокировать кнопки на время запроса;
- подтверждение перед удалением или кнопка «Отменить» в уведомлении;
- понятные ошибки и пустые состояния;
- оптимистичное обновление для быстрых действий (галочка «выполнено» меняется сразу, а при ошибке откатывается).

### Пример
```ts
// src/api/notes.ts — CRUD на Supabase
import { supabase } from "../lib/supabase";

export type Note = { id: number; title: string; done: boolean };

export async function listNotes(): Promise<Note[]> {
  const { data, error } = await supabase.from("notes").select("id, title, done").order("id");
  if (error) throw error;
  return data;
}

export async function createNote(title: string) {
  const { data, error } = await supabase.from("notes").insert({ title }).select().single();
  if (error) throw error;
  return data as Note;
}

export async function toggleNote(id: number, done: boolean) {
  const { error } = await supabase.from("notes").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: number) {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}
```

```tsx
// использование с TanStack Query
const qc = useQueryClient();
const create = useMutation({
  mutationFn: createNote,
  onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
});
```

### Частые ошибки
- `update` или `delete` без `.eq("id", id)` — изменятся или удалятся все строки, к которым есть доступ.
- Не обновлять список после создания — пользователь думает, что ничего не сохранилось.
- Удаление в один клик без подтверждения и возможности отменить.

### Мини-задание
Сделай полный CRUD заметок в своём личном кабинете: создание через форму, список, отметка «выполнено», редактирование заголовка и удаление с подтверждением. Проверь каждое действие при выключенном интернете.
