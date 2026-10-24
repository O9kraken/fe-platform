@@ 0

### На пальцах
Сервер на чистом `http` — дом, построенный голыми руками. Express — готовый каркас дома: стены, двери и проводка уже есть, тебе остаётся расставить комнаты (маршруты) и решить, кого и куда пускать. `app.listen` — открыть входную дверь и начать принимать гостей.

### Как это работает
1. `npm init -y`, в `package.json` добавить `"type": "module"`.
2. `npm install express`.
3. Создать приложение, описать маршруты, запустить.

```js
import express from "express";
const app = express();
app.get("/", (req, res) => res.send("Привет"));
app.listen(3000);
```

- `express()` создаёт приложение.
- `app.get(путь, обработчик)` — маршрут. Обработчик получает `req` (запрос) и `res` (ответ).
- `app.listen(порт, колбэк)` — начать слушать.
- `node --watch src/index.js` — перезапуск при сохранении.

Структура небольшого проекта:

```text
api/
├── package.json
├── .env
└── src/
    ├── index.js       ← запуск: listen
    ├── app.js         ← создание app, middleware, подключение роутеров
    └── routes/
        └── projects.js
```

Разделение `app.js` и `index.js` пригодится для тестов: в тестах импортируют `app`, не запуская сервер на порту.

### Пример
```js
// src/app.js
import express from "express";

export const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});
```

```js
// src/index.js
import { app } from "./app.js";

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`API: http://localhost:${port}`));
```

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch --env-file=.env src/index.js",
    "start": "node src/index.js"
  }
}
```

### Частые ошибки
- Порт жёстко вписан в код, а хостинг передаёт свой через `PORT`.
- Весь проект в одном файле на 1000 строк.
- Забыть перезапустить сервер после изменений (используй `--watch`).

### Мини-задание
Создай проект API со структурой выше, маршрутом `/api/health` и запуском через `npm run dev`. Проверь ответ в браузере и через `curl -i`. Потренируйся в задаче «Первые маршруты» в лаборатории.

@@ 1

### На пальцах
Маршрут — правило на ресепшене: «Кто пришёл с вопросом GET про /projects — к менеджеру по проектам». Параметр `:id` — графа «номер», которая может быть любой: `/projects/42`, `/projects/7`. Query-параметры `?status=open` — дополнительные пожелания: «покажите только открытые».

### Как это работает
- Метод маршрута — метод HTTP: `app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`.
- Параметры пути: `/projects/:id` → `req.params.id`. Всегда строка, для числа — `Number(...)`.
- Несколько параметров: `/projects/:projectId/tasks/:taskId`.
- Query-параметры: `/projects?status=open&page=2` → `req.query.status`, `req.query.page`. Тоже строки или массивы, если параметр повторяется.
- Маршруты проверяются по порядку сверху вниз. Конкретные (`/projects/stats`) ставь выше параметрических (`/projects/:id`), иначе `stats` попадёт в `:id`.

Один путь — несколько методов — удобно через `app.route("/projects").get(...).post(...)`.

### Пример
```js
const projects = [
  { id: 1, title: "Лендинг", status: "open", budget: 30000 },
  { id: 2, title: "Магазин", status: "done", budget: 120000 },
];

app.get("/api/projects/stats", (req, res) => {            // выше, чем /:id
  res.json({ total: projects.length });
});

app.get("/api/projects", (req, res) => {
  const { status, minBudget } = req.query;
  let list = projects;
  if (status) list = list.filter(p => p.status === status);
  if (minBudget) list = list.filter(p => p.budget >= Number(minBudget));
  res.json(list);
});

app.get("/api/projects/:id", (req, res) => {
  const project = projects.find(p => p.id === Number(req.params.id));
  if (!project) return res.status(404).json({ error: "Проект не найден" });
  res.json(project);
});

app.delete("/api/projects/:id", (req, res) => {
  const i = projects.findIndex(p => p.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Проект не найден" });
  projects.splice(i, 1);
  res.status(204).end();
});
```

### Частые ошибки
- Сравнивать `p.id === req.params.id` — число со строкой.
- Маршрут `/:id` выше `/stats` — `stats` воспринимается как id.
- Доверять `req.query` без проверки: `?page=abc` даст `NaN`.

### Мини-задание
Сделай API клиентов студии: список с фильтром по городу через query, клиент по id с 404, удаление. Проверь все маршруты через curl или Bruno.

@@ 2

### На пальцах
`req` — входящее письмо: от кого, что просят, какие вложения. `res` — бланк ответа: ставишь печать с кодом (`status`), подписываешь служебные пометки (`set`), кладёшь содержимое (`json`) и отправляешь. Один ответ на одно письмо — второй раз отправить нельзя.

### Как это работает
Что есть в `req`:

| Поле | Что внутри |
|---|---|
| `req.method`, `req.path` | метод и путь |
| `req.params` | параметры пути |
| `req.query` | query-параметры |
| `req.body` | тело (после `express.json()`) |
| `req.headers` / `req.get("Имя")` | заголовки |
| `req.ip` | адрес клиента |

Методы `res`:

| Метод | Что делает |
|---|---|
| `res.status(201)` | поставить код, возвращает `res` для цепочки |
| `res.json(obj)` | отправить JSON с правильным `Content-Type` |
| `res.send(text)` | отправить текст или HTML |
| `res.set("X-Total-Count", "42")` | заголовок |
| `res.cookie(name, value, options)` | установить cookie |
| `res.redirect(302, "/login")` | редирект |
| `res.status(204).end()` | ответ без тела |

Правило: ответ отправляется ровно один раз. После `res.json(...)` используй `return`, чтобы код ниже не попытался ответить ещё раз — иначе ошибка «Cannot set headers after they are sent».

### Пример
```js
app.get("/api/projects", (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const items = projects.slice((page - 1) * limit, page * limit);

  res.set("X-Total-Count", String(projects.length));
  res.json({ items, page, limit, total: projects.length });
});

app.post("/api/projects", (req, res) => {
  const { title } = req.body ?? {};
  if (!title) {
    return res.status(400).json({ error: "Укажите название" });   // return!
  }
  const project = { id: Date.now(), title };
  projects.push(project);
  res.status(201).set("Location", `/api/projects/${project.id}`).json(project);
});

app.get("/api/whoami", (req, res) => {
  res.json({ ip: req.ip, agent: req.get("User-Agent") });
});
```

### Частые ошибки
- Нет `return` после ответа с ошибкой — дальше выполняется код и пытается ответить второй раз.
- Отправлять числа через `res.send(42)` — Express воспримет число как код статуса.
- Читать `req.body`, не подключив `express.json()`.

### Мини-задание
Добавь к списку проектов пагинацию с заголовком `X-Total-Count`, а к созданию — ответ 201 с заголовком `Location`. Нарочно убери один `return` и посмотри, какая ошибка появится в консоли.

@@ 3

### На пальцах
Middleware — посты контроля на конвейере. Запрос едет по ленте: сначала пост «записать в журнал», потом «проверить пропуск», потом «распаковать посылку», и только в конце — нужный отдел. Каждый пост либо пропускает дальше (`next()`), либо сам отвечает и останавливает ленту. Порядок постов важен: проверять пропуск после того, как уже выдал товар, бессмысленно.

### Как это работает
Middleware — функция `(req, res, next) => { ... }`. Варианты действий:

- сделать что-то и вызвать `next()` — передать дальше;
- ответить (`res.status(401).json(...)`) и не вызывать `next()` — остановить цепочку;
- вызвать `next(error)` — перейти сразу к обработчику ошибок.

Подключение:

- `app.use(mw)` — для всех запросов;
- `app.use("/api", mw)` — для путей, начинающихся с `/api`;
- `app.get("/admin", requireAuth, requireAdmin, handler)` — для одного маршрута, по цепочке.

Выполняются в том порядке, в котором подключены. Типичный порядок: логирование → безопасность и CORS → разбор тела → авторизация → маршруты → 404 → обработчик ошибок.

Middleware может добавлять данные в `req`, чтобы ими пользовались следующие: `req.user = user`.

### Пример
```js
// журнал запросов
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => console.log(`${req.method} ${req.path} → ${res.statusCode} (${Date.now() - start} мс)`));
  next();
});

app.use(express.json());

// проверка ключа доступа
function requireApiKey(req, res, next) {
  if (req.get("X-Api-Key") !== process.env.API_KEY) {
    return res.status(401).json({ error: "Нужен ключ доступа" });
  }
  next();
}

app.get("/api/public", (req, res) => res.json({ ok: true }));
app.get("/api/private", requireApiKey, (req, res) => res.json({ secret: 42 }));

// 404 — после всех маршрутов
app.use((req, res) => res.status(404).json({ error: "Нет такого адреса" }));
```

### Частые ошибки
- Забыть вызвать `next()` — запрос «зависает».
- Вызвать `next()` после отправки ответа — следующие обработчики пытаются ответить ещё раз.
- Подключить проверку авторизации после маршрутов, которые она должна защищать.

### Мини-задание
Напиши middleware, которое считает количество запросов к каждому пути и отдаёт статистику на `/api/stats`, и middleware, которое добавляет заголовок `X-Response-Time`. Подключи их в правильном порядке. Посмотри схему «Запрос идёт через middleware» в уроке.

@@ 4

### На пальцах
Тело запроса приходит как запечатанная посылка — поток байтов. `express.json()` — работник на входе, который вскрывает посылку с пометкой «JSON», разбирает содержимое и кладёт аккуратно на стол: `req.body`. Без него посылка так и лежит запечатанной, и `req.body` пустой.

### Как это работает
- `app.use(express.json())` — подключить один раз, до маршрутов.
- Работает только для запросов с заголовком `Content-Type: application/json`. Без заголовка `req.body` будет пустым (или `undefined`).
- Если JSON кривой — Express вернёт 400 через обработчик ошибок.
- Лимит размера по умолчанию 100 КБ, меняется: `express.json({ limit: "1mb" })`. Большой лимит без нужды — риск, что сервер завалят огромными запросами.
- Для обычных HTML-форм — `express.urlencoded({ extended: true })`.
- Для файлов — отдельные библиотеки (`multer`).

Тело — это данные от клиента, а значит, им нельзя доверять: проверяй наличие полей, типы и длину (следующий урок — валидация).

### Пример
```js
import express from "express";
const app = express();

app.use(express.json({ limit: "100kb" }));

app.post("/api/leads", (req, res) => {
  const { name, phone } = req.body ?? {};
  if (typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Укажите имя" });
  }
  res.status(201).json({ ok: true, name: name.trim(), phone });
});

// кривой JSON → понятный ответ вместо стандартной HTML-страницы ошибки
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Некорректный JSON" });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Слишком большой запрос" });
  next(err);
});
```

```bash
curl -X POST localhost:3000/api/leads -H "Content-Type: application/json" -d '{"name":"Анна"}'
curl -X POST localhost:3000/api/leads -d '{"name":"Анна"}'     # без заголовка → body пустой
curl -X POST localhost:3000/api/leads -H "Content-Type: application/json" -d '{"name":'  # кривой JSON
```

### Частые ошибки
- Подключить `express.json()` после маршрутов.
- Деструктурировать `req.body`, когда он `undefined`: используй `req.body ?? {}`.
- Отдавать клиенту стандартную HTML-ошибку на кривой JSON вместо JSON-ответа.

### Мини-задание
Сделай маршрут создания заявки и проверь его тремя запросами: правильным, без заголовка `Content-Type` и с кривым JSON. Добейся, чтобы на все ошибки сервер отвечал понятным JSON.

@@ 5

### На пальцах
Когда отделов становится много, ресепшен одного офиса не справляется. Router — отдельный ресепшен на каждом этаже: этаж «проекты», этаж «клиенты», этаж «авторизация». Главный вход только говорит: «по проектам — на третий этаж», а там уже разбираются сами.

### Как это работает
- `express.Router()` создаёт мини-приложение со своими маршрутами и middleware.
- Маршруты внутри роутера пишутся относительно точки подключения.
- `app.use("/api/projects", projectsRouter)` — подключить: все пути роутера получат префикс.
- У роутера могут быть свои middleware: `router.use(requireAuth)` защитит только его маршруты.
- Параметры из префикса доступны во вложенном роутере с опцией `Router({ mergeParams: true })`.

Так проект делится на файлы по сущностям: `routes/projects.js`, `routes/clients.js`, `routes/auth.js`.

### Пример
```js
// src/routes/projects.js
import { Router } from "express";

export const projectsRouter = Router();
const projects = [];

projectsRouter.get("/", (req, res) => res.json(projects));             // GET /api/projects
projectsRouter.get("/:id", (req, res) => {                              // GET /api/projects/42
  const p = projects.find(x => x.id === Number(req.params.id));
  p ? res.json(p) : res.status(404).json({ error: "Проект не найден" });
});
projectsRouter.post("/", (req, res) => {                                // POST /api/projects
  const p = { id: projects.length + 1, title: req.body.title };
  projects.push(p);
  res.status(201).json(p);
});
```

```js
// src/routes/tasks.js — вложенный ресурс
import { Router } from "express";
export const tasksRouter = Router({ mergeParams: true });
tasksRouter.get("/", (req, res) => {
  res.json({ projectId: req.params.projectId, tasks: [] });            // GET /api/projects/42/tasks
});
```

```js
// src/app.js
import express from "express";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";

export const app = express();
app.use(express.json());
app.use("/api/projects", projectsRouter);
app.use("/api/projects/:projectId/tasks", tasksRouter);
```

### Частые ошибки
- Повторять префикс внутри роутера: `router.get("/api/projects/:id")` → получится `/api/projects/api/projects/:id`.
- Забыть `mergeParams` — во вложенном роутере нет `req.params.projectId`.
- Подключать роутер до `express.json()`.

### Мини-задание
Разнеси свой API на роутеры `projects`, `clients` и вложенный `tasks`. Добавь в роутер клиентов middleware, которое логирует только его запросы. Проверь, что все адреса работают как раньше. Потренируйся в задаче «Express: маршруты и middleware» в лаборатории.
