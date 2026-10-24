@@ 0

### На пальцах
Первый серьёзный бэкенд-проект — собрать из выученных деталей настоящий механизм. Express — рама, PostgreSQL в Neon — склад, zod — контролёр на входе. По отдельности ты всё это уже трогал, теперь задача — собрать так, чтобы детали работали вместе и проект не стыдно было показать.

### Как это работает
Порядок сборки:

1. `npm init`, `"type": "module"`, зависимости: `express`, `pg`, `zod`; для разработки — `vitest`, `supertest`.
2. Структура: `src/app.js`, `src/index.js`, `src/config.js`, `src/db.js`, `src/routes/`, `src/services/`, `migrations/`, `scripts/`.
3. `config.js` с проверкой переменных окружения.
4. База в Neon, миграции для таблиц `projects` и `tasks`.
5. Маршруты по одному: сначала `GET /api/health`, потом CRUD проектов, потом задачи.
6. Валидация каждой записи через zod.
7. Единый обработчик ошибок.
8. Тесты и README.

Стек и почему:

- **Express** — минимальный, понятный, огромное количество примеров;
- **PostgreSQL** — надёжная реляционная база, стандарт индустрии;
- **Neon** — бесплатный PostgreSQL в облаке, ветки для тестов;
- **zod** — валидация и типы из одной схемы.

### Пример
```js
// src/app.js
import express from "express";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";
import { errorHandler, notFound } from "./errors.js";

export const app = express();
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/projects", projectsRouter);
app.use("/api/projects/:projectId/tasks", tasksRouter);

app.use(notFound);
app.use(errorHandler);
```

```js
// src/schemas.js
import { z } from "zod";
export const projectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().max(2000).optional(),
  status: z.enum(["active", "paused", "done"]).default("active"),
  dueDate: z.coerce.date().optional(),
});
export const taskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  done: z.boolean().default(false),
});
```

### Частые ошибки
- Пытаться сделать всё сразу: авторизацию, Docker и фронтенд в первый же день.
- Писать без миграций, правя таблицы руками в панели Neon.
- Откладывать валидацию и обработку ошибок «на потом».

### Мини-задание
Создай репозиторий проекта, настрой структуру, `config.js`, подключение к Neon и маршрут `/api/health`. Сделай первый коммит и задеплой на Render — дальше каждая новая функция сразу уходит на сервер.

@@ 1

### На пальцах
CRUD — скелет, фильтры и пагинация — мышцы. Список задач без фильтра «только мои незавершённые» и без страниц бесполезен уже на сотне записей. Хороший API позволяет фронтенду спросить именно то, что нужно показать.

### Как это работает
Маршруты проекта:

| Метод и путь | Что делает |
|---|---|
| `GET /api/projects?status=&q=&page=&limit=&sort=` | список с фильтром, поиском, пагинацией и сортировкой |
| `GET /api/projects/:id` | проект с количеством задач |
| `POST /api/projects` | создать |
| `PATCH /api/projects/:id` | изменить |
| `DELETE /api/projects/:id` | удалить (задачи — каскадом) |
| `GET /api/projects/:id/tasks?done=&priority=` | задачи проекта с фильтрами |
| `POST /api/projects/:id/tasks` | добавить задачу |
| `PATCH /api/tasks/:id` | изменить задачу (отметить выполненной) |
| `DELETE /api/tasks/:id` | удалить задачу |

Детали реализации:

- фильтры собираются в SQL динамически, но значения — только параметрами;
- поле сортировки — из белого списка;
- ответ списка: `{ items, page, limit, total }`;
- поиск по названию: `title ILIKE $n` со значением `%текст%`.

### Пример
```js
// src/repositories/projects.js
const SORT = { created: "created_at", title: "title", due: "due_date" };

export async function listProjects({ status, q: search, page = 1, limit = 20, sort = "-created" }) {
  const where = [];
  const values = [];
  if (status) { values.push(status); where.push(`status = $${values.length}`); }
  if (search) { values.push(`%${search}%`); where.push(`title ILIKE $${values.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const desc = sort.startsWith("-");
  const col = SORT[sort.replace(/^-/, "")] ?? "created_at";

  const total = (await q(`SELECT COUNT(*)::int AS n FROM projects ${whereSql}`, values)).rows[0].n;
  values.push(limit, (page - 1) * limit);
  const { rows } = await q(
    `SELECT p.*, (SELECT COUNT(*)::int FROM tasks t WHERE t.project_id = p.id) AS tasks_count
     FROM projects p ${whereSql}
     ORDER BY ${col} ${desc ? "DESC" : "ASC"}, id
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );
  return { items: rows, page, limit, total };
}
```

```js
// src/routes/projects.js
const listQuery = z.object({
  status: z.enum(["active", "paused", "done"]).optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
});
projectsRouter.get("/", wrap(async (req, res) => {
  res.json(await listProjects(listQuery.parse(req.query)));
}));
```

### Частые ошибки
- Склеивать фильтры в SQL вместе со значениями.
- Нет `ORDER BY` — записи «перескакивают» между страницами.
- Отдельный запрос количества задач для каждого проекта в цикле (N+1).

### Мини-задание
Реализуй все маршруты из таблицы. Проверь фильтры и пагинацию на 50 тестовых проектах (их создаст seed из следующих пунктов). Потренируйся в задачах «CRUD» и «Пагинация» в лаборатории.

@@ 2

### На пальцах
Единый формат ошибок — общий язык между твоим API и любым фронтендом. Фронтенд-разработчик один раз пишет функцию «показать ошибку», и она работает для всех маршрутов: не найдено, неверные поля, конфликт, сбой сервера.

### Как это работает
Договорённость для проекта:

```json
{ "error": "Текст для человека", "code": "МАШИННЫЙ_КОД", "fields": { "поле": ["ошибка"] } }
```

| Ситуация | Статус | code |
|---|---|---|
| zod не пропустил данные | 400 | `VALIDATION` + `fields` |
| кривой JSON | 400 | `BAD_JSON` |
| нет записи | 404 | `NOT_FOUND` |
| неизвестный адрес | 404 | `ROUTE_NOT_FOUND` |
| нарушение уникальности | 409 | `CONFLICT` |
| неожиданная ошибка | 500 | `INTERNAL` |

Реализация из трёх частей:

1. Класс `AppError` и помощники (`notFound()`, `validation(fields)`).
2. Перевод ошибок zod и PostgreSQL в `AppError`.
3. Обработчик в конце `app.js`.

### Пример
```js
// src/errors.js
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(status, message, code, fields) { super(message); Object.assign(this, { status, code, fields }); }
}

export const notFound = (req, res) => res.status(404).json({ error: "Нет такого адреса", code: "ROUTE_NOT_FOUND" });

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Проверьте данные", code: "VALIDATION", fields: err.flatten().fieldErrors });
  }
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Некорректный JSON", code: "BAD_JSON" });
  if (err.code === "23505") return res.status(409).json({ error: "Такая запись уже есть", code: "CONFLICT" });
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message, code: err.code, fields: err.fields });
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера", code: "INTERNAL" });
}
```

```js
// в маршруте достаточно бросить ошибку
const project = await getProject(id);
if (!project) throw new AppError(404, "Проект не найден", "NOT_FOUND");
const data = projectSchema.parse(req.body);   // ZodError уйдёт в обработчик сам
```

### Частые ошибки
- Где-то `{ message }`, где-то `{ error }`.
- Текст ошибки PostgreSQL в ответе клиенту.
- 500 на ошибку валидации из-за необработанного `ZodError`.

### Мини-задание
Сделай единый обработчик для проекта и пройди все маршруты, вызывая каждую ошибку из таблицы. Опиши формат ошибок в README.

@@ 3

### На пальцах
Миграции — инструкция по сборке склада с нуля, seed — набор демонстрационных товаров на полках. Любой, кто склонирует твой проект, двумя командами получает готовую базу с примерами данных и может сразу пощупать API, не заполняя ничего руками.

### Как это работает
- **Миграции** — схема: таблицы, ключи, индексы, ограничения. Применяются по порядку на всех окружениях, включая продакшен.
- **Seed** — тестовые данные: несколько проектов с задачами, пара пользователей. Только для разработки и демо, **никогда** не запускается на продакшене с реальными пользователями.

Хороший seed:

- идемпотентный: можно запустить повторно (сначала очищает таблицы);
- реалистичный: правдоподобные названия, разные статусы, даты в прошлом и будущем;
- достаточный для проверки пагинации и фильтров (50+ записей);
- защищён от запуска на продакшене.

Скрипты в `package.json`: `migrate`, `seed`, `db:reset` (миграции + seed).

### Пример
```sql
-- migrations/001_projects_tasks.sql
CREATE TABLE projects (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       text NOT NULL CHECK (length(title) BETWEEN 2 AND 120),
  description text,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'done')),
  due_date    date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title      text NOT NULL,
  priority   text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  done       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_project_id_idx ON tasks (project_id);
```

```js
// scripts/seed.js
import { pool } from "../src/db.js";

if (process.env.NODE_ENV === "production") {
  console.error("Seed нельзя запускать на продакшене");
  process.exit(1);
}

const kinds = ["Лендинг", "Интернет-магазин", "Корпоративный сайт", "SEO-аудит", "Редизайн"];
const clients = ["кофейни", "барбершопа", "пекарни", "автосервиса", "студии йоги"];
const statuses = ["active", "paused", "done"];

await pool.query("TRUNCATE tasks, projects RESTART IDENTITY CASCADE");
for (let i = 0; i < 50; i++) {
  const title = `${kinds[i % kinds.length]} для ${clients[i % clients.length]} №${i + 1}`;
  const { rows: [p] } = await pool.query(
    "INSERT INTO projects (title, status, due_date) VALUES ($1, $2, now() + ($3 || ' days')::interval) RETURNING id",
    [title, statuses[i % 3], String((i % 30) - 10)]
  );
  for (const [t, pr] of [["Макет", "high"], ["Вёрстка", "normal"], ["Тестирование", "low"]]) {
    await pool.query("INSERT INTO tasks (project_id, title, priority, done) VALUES ($1, $2, $3, $4)", [p.id, t, pr, i % 2 === 0]);
  }
}
console.log("Тестовые данные созданы");
await pool.end();
```

### Частые ошибки
- Seed без защиты — однажды его запускают на боевой базе.
- Тестовые данные внутри миграций.
- Seed, который падает при повторном запуске из-за уникальных ограничений.

### Мини-задание
Сделай миграции и seed для своего проекта, скрипт `db:reset`. Создай чистую ветку базы в Neon и проверь, что `npm run db:reset` поднимает всё с нуля.

@@ 4

### На пальцах
README бэкенд-проекта — инструкция к прибору и рекламный проспект одновременно. Проверяющий должен за пять минут понять, что умеет API, запустить его у себя и отправить первый запрос. Если для этого нужно читать код — README не справился.

### Как это работает
Разделы:

1. **Название и одна фраза** — что это.
2. **Демо** — адрес задеплоенного API и, если есть, страница документации.
3. **Стек** — с короткими пояснениями выбора.
4. **Возможности** — 4–6 пунктов.
5. **Быстрый старт** — команды от `git clone` до первого запроса.
6. **Переменные окружения** — таблица.
7. **Маршруты** — таблица: метод, путь, описание. Подробные примеры — для ключевых.
8. **Формат ошибок**.
9. **Тесты** — как запустить, что покрыто.
10. **Структура проекта** и **что можно улучшить**.

Пример запроса с ответом стоит тысячи слов: покажи curl-команду и JSON, который придёт.

### Пример
```markdown
# Tasks API

REST API для управления проектами и задачами. Express + PostgreSQL (Neon) + zod.

**Демо:** https://tasks-api-anna.onrender.com/api/health

## Возможности
- CRUD проектов и задач, каскадное удаление
- Фильтры, поиск, сортировка и пагинация
- Валидация всех входных данных, единый формат ошибок
- Миграции, тестовые данные, интеграционные тесты в CI

## Быстрый старт
    git clone https://github.com/anna/tasks-api && cd tasks-api
    npm ci
    cp .env.example .env        # впиши DATABASE_URL
    npm run db:reset            # миграции + тестовые данные
    npm run dev                 # http://localhost:3000

## Маршруты
| Метод | Путь | Описание |
|---|---|---|
| GET | /api/projects | список: ?status, ?q, ?page, ?limit, ?sort |
| POST | /api/projects | создать проект |
| GET | /api/projects/:id/tasks | задачи проекта: ?done, ?priority |

## Пример
    curl -X POST https://tasks-api-anna.onrender.com/api/projects \
      -H "Content-Type: application/json" -d '{"title":"Лендинг для кофейни"}'
    → 201 {"id":51,"title":"Лендинг для кофейни","status":"active",...}
```

### Частые ошибки
- Инструкция запуска, которая не работает с чистого клона.
- Нет примеров запросов и ответов.
- Список маршрутов устарел после последних изменений.

### Мини-задание
Напиши README для своего API по структуре выше. Проверь быстрый старт в новой папке, склонировав репозиторий заново.

@@ 5

### На пальцах
Коллекция запросов в репозитории — готовый пульт управления для твоего API. Проверяющий открывает её в Bruno или Postman и одним кликом отправляет любой запрос, не перепечатывая адреса и тела из README. Это мелочь, которая выделяет проект среди десятков похожих.

### Как это работает
**Bruno** хранит каждый запрос в текстовом файле `.bru` — их коммитят прямо в репозиторий:

```text
api-collection/
├── bruno.json
├── environments/
│   ├── local.bru         ← baseUrl = http://localhost:3000
│   └── production.bru    ← baseUrl = https://tasks-api-anna.onrender.com
├── health.bru
├── projects/
│   ├── list.bru
│   ├── create.bru
│   ├── update.bru
│   └── delete.bru
└── tasks/
    └── create.bru
```

**Postman**: коллекцию экспортируют в JSON (`Export → Collection v2.1`) и кладут в репозиторий, окружения — отдельным файлом без секретов.

Что включить:

- запросы на все маршруты, включая примеры ошибок (неверные данные, несуществующий id);
- переменную `baseUrl` и окружения local и production;
- сохранение id созданного проекта в переменную, чтобы следующие запросы работали с ним;
- простые тесты ответов (статус, наличие полей) — коллекцию можно прогнать целиком.

Секреты (токены, пароли) в коллекцию не попадают — только в локальные файлы окружения, которые в `.gitignore`.

### Пример
```text
# api-collection/projects/create.bru
meta {
  name: Создать проект
  type: http
  seq: 2
}

post {
  url: {{baseUrl}}/api/projects
  body: json
}

body:json {
  { "title": "Лендинг для кофейни", "status": "active" }
}

script:post-response {
  bru.setVar("projectId", res.body.id);
}

tests {
  test("статус 201", () => expect(res.status).to.equal(201));
  test("вернулся id", () => expect(res.body.id).to.be.a("number"));
}
```

### Частые ошибки
- Коллекция с боевыми токенами в открытом репозитории.
- Только успешные запросы, без примеров ошибок.
- Захардкоженный адрес вместо переменной `baseUrl`.

### Мини-задание
Создай коллекцию Bruno в папке `api-collection` своего проекта с окружениями local и production, запросами на все маршруты и тестами статусов. Прогони коллекцию целиком (Run Collection) и упомяни её в README.
