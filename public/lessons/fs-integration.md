@@ 0

### На пальцах
Фронтенд и бэкенд — два офиса одной компании в разных зданиях. Чтобы они работали вместе, фронтенду нужен точный адрес второго офиса. Адрес в разных городах разный: на твоём компьютере бэкенд «в соседней комнате» (localhost), на продакшене — в другом здании (api.studio.ru). Поэтому адрес не пишут в каждом письме, а держат в одной записной книжке — переменной окружения.

### Как это работает
- Базовый адрес API — в переменной: `VITE_API_URL` (Vite) или `NEXT_PUBLIC_API_URL` (Next.js).
- Все запросы идут через один модуль-клиент: он подставляет адрес, заголовки, `credentials`, разбирает ошибки.
- Компоненты не вызывают `fetch` напрямую — они вызывают функции API: `getProjects()`, `createTask()`.

Альтернатива для разработки — прокси в Vite: запросы на `/api` с адреса фронтенда перенаправляются на бэкенд. Тогда фронтенд и API выглядят для браузера как один источник, и CORS не нужен.

Клиент API делает три вещи:

1. собирает адрес и заголовки;
2. проверяет `response.ok` и превращает ответ с ошибкой в понятное исключение (используя единый формат ошибок бэкенда);
3. отдаёт уже разобранный JSON.

### Пример
```ts
// src/api/client.ts
const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public fields?: Record<string, string[]>) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    ...rest,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Ошибка ${res.status}`, data?.code, data?.fields);
  return data as T;
}
```

```ts
// src/api/projects.ts
export type Project = { id: number; title: string; status: "active" | "paused" | "done" };
export const getProjects = () => api<{ items: Project[]; total: number }>("/api/projects");
export const createProject = (title: string) => api<Project>("/api/projects", { method: "POST", json: { title } });
```

```ts
// vite.config.ts — прокси для разработки
export default { server: { proxy: { "/api": "http://localhost:3000" } } };
```

### Частые ошибки
- `fetch("http://localhost:3000/...")` в двадцати компонентах — на продакшене всё сломается.
- Не проверять `res.ok` — ошибки сервера выглядят как «пустые данные».
- Разбирать JSON у ответа 204 — ошибка разбора.

### Мини-задание
Сделай в своём фронтенде модуль `api/client.ts` и функции для всех маршрутов бэкенда. Настрой прокси Vite для разработки и `VITE_API_URL` для продакшена. Убедись, что ни один компонент не вызывает `fetch` напрямую.

@@ 1

### На пальцах
Браузер — строгий охранник: скрипт с сайта `localhost:5173` хочет прочитать ответ от `localhost:3000`. Для браузера это разные «дома», и он спрашивает у сервера: «Ты разрешаешь этому дому читать твои ответы?» CORS — ответ сервера: «Да, вот этим адресам можно, и с cookie тоже».

### Как это работает
- Разный порт, домен или протокол = разный origin. `localhost:5173` и `localhost:3000` — разные.
- Сервер разрешает конкретные адреса фронтенда заголовком `Access-Control-Allow-Origin`.
- Если нужны cookie — ещё `Access-Control-Allow-Credentials: true`, а в `Allow-Origin` — конкретный адрес, не `*`.
- Запросы с JSON, методами PUT/PATCH/DELETE и своими заголовками браузер предваряет запросом `OPTIONS` (preflight). Сервер должен ответить на него разрешёнными методами и заголовками.

Список разрешённых адресов — в переменной окружения: локально `http://localhost:5173`, на продакшене `https://studio.ru,https://www.studio.ru`.

Ошибку CORS чинят только на сервере (или прокси). Расширения браузера «отключить CORS» и `mode: "no-cors"` — не решение: с `no-cors` ответ вообще нельзя прочитать.

### Пример
```js
// бэкенд
import cors from "cors";

const allowed = (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",");

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowed.includes(origin)),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
```

```text
Ошибка в консоли браузера и что она значит:

Access to fetch at 'http://localhost:3000/api/projects' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
→ сервер не разрешил этот адрес

... The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*'
when the request's credentials mode is 'include'.
→ с cookie нужен конкретный адрес вместо *
```

### Частые ошибки
- `origin: "*"` вместе с cookie.
- Забыть адрес продакшен-фронтенда в списке — локально работает, на сервере нет.
- Подключить `cors()` после маршрутов.

### Мини-задание
Запусти фронтенд и бэкенд на разных портах без прокси и получи ошибку CORS. Настрой `cors` с белым списком из переменной окружения и `credentials`. Проверь preflight-запрос во вкладке Network (метод OPTIONS). Потренируйся в задаче «CORS для своего фронтенда».

@@ 2

### На пальцах
Cookie — браслет на руке посетителя аквапарка. Внутри одного аквапарка его показывают на каждом входе автоматически. Но если фронтенд и API — два разных аквапарка, браслет первого во втором по умолчанию не принимают. Нужно, чтобы и посетитель согласился его показывать (`credentials: "include"`), и второй аквапарк согласился его принимать (CORS с credentials, правильный SameSite).

### Как это работает
Три условия, чтобы cookie сессии работала между фронтендом и API:

1. **Фронтенд**: `fetch(url, { credentials: "include" })` — иначе браузер не отправит cookie и не сохранит новую.
2. **CORS на сервере**: `Access-Control-Allow-Credentials: true` и конкретный origin.
3. **Атрибуты cookie**:
   - если фронтенд и API на **одном сайте** (`studio.ru` и `api.studio.ru`) — хватит `SameSite=Lax`, это лучший вариант;
   - если на **разных сайтах** (`app.vercel.app` и `api.onrender.com`) — нужен `SameSite=None; Secure`, а браузеры всё сильнее ограничивают такие сторонние cookie.

Поэтому лучшая схема — один домен: фронтенд на `studio.ru`, API на `api.studio.ru`, или API под тем же доменом через прокси (`studio.ru/api` → бэкенд). Тогда cookie «свои», `SameSite=Lax`, и меньше проблем.

Локально — прокси Vite: фронтенд и API для браузера на одном адресе.

### Пример
```js
// бэкенд: cookie для схемы studio.ru + api.studio.ru
res.cookie("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  domain: ".studio.ru",        // видна и на studio.ru, и на api.studio.ru
  maxAge: 30 * 24 * 3600 * 1000,
});
```

```ts
// фронтенд
await fetch(`${API}/api/auth/login`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

```text
Чек-лист «cookie не уходит»:
1. credentials: "include" в fetch?
2. Access-Control-Allow-Credentials: true и конкретный origin?
3. DevTools → Application → Cookies: cookie сохранилась? Если нет — смотри предупреждение
   во вкладке Network у ответа (жёлтый треугольник в колонке Set-Cookie).
4. Разные сайты? Нужен SameSite=None; Secure — или переезд на общий домен.
5. Локально по http — Secure-cookie не сохранится.
```

### Частые ошибки
- Забыть `credentials: "include"` в одном из запросов.
- `SameSite=None` без `Secure`.
- Фронтенд на `*.vercel.app`, API на `*.onrender.com` и удивление, что в Safari не работает вход.

### Мини-задание
Настрой вход с cookie между своим фронтендом и бэкендом сначала через прокси Vite, потом напрямую на разных портах. Пройди по чек-листу и запиши, какие пункты понадобились.

@@ 3

### На пальцах
Интерфейс, работающий с сервером, — официант в ресторане. Хороший официант говорит: «Заказ принят, готовится» (загрузка), «К сожалению, закончилась рыба, могу предложить…» (понятная ошибка). А очень хороший сразу ставит на стол хлеб и воду, не дожидаясь кухни (оптимистичное обновление), — если что-то пойдёт не так, извинится и уберёт.

### Как это работает
**Загрузка**: скелетоны для списков, блокировка кнопки отправки, индикатор на кнопке («Сохраняю…»).

**Ошибки**:

- ошибки полей (400 с `fields`) — показывать у соответствующих полей формы;
- 401 — отправить на вход;
- 403/404 — понятное сообщение;
- 409 — объяснить конфликт («Email уже занят»);
- 5xx и сеть — общее сообщение и кнопка «Повторить», введённые данные не терять.

**Оптимистичные обновления** — интерфейс меняется сразу, не дожидаясь ответа сервера:

1. запомнить текущее состояние;
2. сразу обновить интерфейс;
3. отправить запрос;
4. ошибка — откатить к запомненному и показать сообщение;
5. успех — при необходимости синхронизировать с ответом сервера.

Подходит для частых простых действий с высоким шансом успеха: галочка «выполнено», лайк, переименование. Не подходит для оплаты и необратимых действий.

TanStack Query умеет это из коробки: `onMutate` (обновить кеш и запомнить старое), `onError` (откатить), `onSettled` (перезагрузить данные).

### Пример
```tsx
const qc = useQueryClient();

const toggle = useMutation({
  mutationFn: (t: Task) => api<Task>(`/api/tasks/${t.id}`, { method: "PATCH", json: { done: !t.done } }),

  onMutate: async (t) => {
    await qc.cancelQueries({ queryKey: ["tasks", t.projectId] });
    const prev = qc.getQueryData<Task[]>(["tasks", t.projectId]);
    qc.setQueryData<Task[]>(["tasks", t.projectId], old =>
      old?.map(x => (x.id === t.id ? { ...x, done: !x.done } : x)));
    return { prev };
  },

  onError: (err, t, ctx) => {
    qc.setQueryData(["tasks", t.projectId], ctx?.prev);     // откат
    toast("Не удалось сохранить, попробуйте ещё раз");
  },

  onSettled: (data, err, t) => qc.invalidateQueries({ queryKey: ["tasks", t.projectId] }),
});
```

```tsx
// ошибки полей от сервера — в форму
try {
  await createProject(values);
} catch (e) {
  if (e instanceof ApiError && e.fields) {
    for (const [field, msgs] of Object.entries(e.fields)) setError(field as any, { message: msgs[0] });
  } else {
    setFormError("Не удалось сохранить. Проверьте соединение и попробуйте ещё раз.");
  }
}
```

### Частые ошибки
- Оптимистичное обновление без отката — интерфейс показывает то, чего нет на сервере.
- Одна надпись «Ошибка» на все случаи.
- Очистка формы при ошибке отправки.

### Мини-задание
Сделай оптимистичную отметку задач «выполнено» с откатом при ошибке. Проверь, выключив бэкенд: галочка должна вернуться обратно и появиться сообщение. Подключи ошибки полей от сервера к форме создания проекта.

@@ 4

### На пальцах
Фронтенд и бэкенд договариваются о формате данных, как два бухгалтера о форме отчёта. Если форма описана в двух местах по-разному, рано или поздно отчёт придёт «не туда». Общие типы и схемы — одна форма на двоих: поменял поле — обе стороны узнают сразу, и TypeScript подсветит все места, которые нужно поправить.

### Как это работает
Идея: zod-схема описывает данные один раз, из неё:

- на бэкенде — проверка тела запроса;
- на фронтенде — проверка формы (react-hook-form + zodResolver);
- TypeScript-типы для обеих сторон через `z.infer`.

Где хранить общий код:

- в монорепозитории — отдельный пакет `shared` (`packages/shared`), который импортируют и `client`, и `server`;
- в Next.js, где фронт и бэк в одном проекте, — просто общая папка `lib/schemas`.

Что класть в общее: схемы входных данных (создание и изменение), типы ответов API, перечисления статусов, константы (лимиты длины).

Что не класть: серверный код (доступ к базе, секреты) — он не должен попасть в браузерный бандл.

Альтернативы: генерация типов из OpenAPI-описания, tRPC (типобезопасные вызовы сервера без описания REST).

### Пример
```ts
// packages/shared/src/project.ts
import { z } from "zod";

export const PROJECT_STATUSES = ["active", "paused", "done"] as const;

export const createProjectSchema = z.object({
  title: z.string().trim().min(2, "Минимум 2 символа").max(120),
  description: z.string().max(2000).optional(),
  status: z.enum(PROJECT_STATUSES).default("active"),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export type Project = CreateProjectInput & { id: number; createdAt: string };
```

```ts
// server: проверка
import { createProjectSchema } from "@studio/shared";
router.post("/", wrap(async (req, res) => {
  const data = createProjectSchema.parse(req.body);
  res.status(201).json(await projects.create(data, req.user));
}));
```

```tsx
// client: та же схема в форме
import { createProjectSchema, type CreateProjectInput } from "@studio/shared";
const form = useForm<CreateProjectInput>({ resolver: zodResolver(createProjectSchema) });
```

### Частые ошибки
- Описать тип `Project` вручную на фронте и на бэке — они расходятся после первой правки.
- Импортировать во фронтенд модуль, который тянет за собой `pg` или секреты.
- Сообщения об ошибках в схеме на разных языках на фронте и бэке.

### Мини-задание
Вынеси схемы создания проекта и задачи в общий модуль и используй их и на сервере, и в формах фронтенда. Добавь новое обязательное поле в схему и посмотри, сколько мест TypeScript подсветил сам.

@@ 5

### На пальцах
Монорепозиторий — один шкаф с двумя отделениями: «фронтенд» и «бэкенд», плюс общая полка с тем, что нужно обоим. Не нужно бегать между двумя шкафами, когда меняешь API и интерфейс одновременно: одно изменение — один коммит — один pull request.

### Как это работает
Структура:

```text
studio/
├── package.json            ← "workspaces": ["client", "server", "packages/*"]
├── client/                 ← React или Next.js
│   └── package.json
├── server/                 ← Express API
│   └── package.json
├── packages/
│   └── shared/             ← общие схемы и типы
│       └── package.json    ← "name": "@studio/shared"
├── compose.yaml
└── .github/workflows/ci.yml
```

- **npm workspaces** — один `npm install` в корне ставит зависимости всех частей, а пакет `@studio/shared` подключается к `client` и `server` как обычная зависимость.
- Команды для части: `npm run dev -w server`, `npm run build -w client`.
- Запустить всё сразу — `concurrently` или Docker Compose.
- Деплой: каждая часть деплоится отдельно на свою платформу (client — Vercel, server — Render), в настройках указывается подпапка (Root Directory).
- Для больших проектов есть Turborepo и Nx — кешируют сборки и запускают только то, что изменилось.

Плюсы: атомарные изменения API и интерфейса, общие типы, одна история. Минусы: чуть сложнее настройка деплоя и CI.

### Пример
```json
// package.json в корне
{
  "name": "studio",
  "private": true,
  "workspaces": ["client", "server", "packages/*"],
  "scripts": {
    "dev": "concurrently -n api,web \"npm run dev -w server\" \"npm run dev -w client\"",
    "test": "npm test -w server",
    "build": "npm run build -w client"
  },
  "devDependencies": { "concurrently": "^9.0.0" }
}
```

```json
// server/package.json
{
  "name": "server",
  "type": "module",
  "dependencies": { "@studio/shared": "*", "express": "^4.21.0" }
}
```

```bash
npm install            # в корне — для всех частей
npm run dev            # API и фронтенд одновременно
```

### Частые ошибки
- Отдельные `node_modules` и `package-lock.json` в каждой папке вместо workspaces.
- Забыть указать Root Directory при деплое — платформа ищет `package.json` в корне.
- Импортировать файлы соседнего приложения относительными путями (`../../server/src/...`) вместо общего пакета.

### Мини-задание
Объедини свои фронтенд и бэкенд в монорепозиторий с npm workspaces и пакетом `shared`. Настрой команду `npm run dev`, которая запускает обе части, и деплой каждой части из своей подпапки.
