@@ be-linux
### Самые нужные команды
```bash
ls -la                 # файлы, включая скрытые, с правами
cat .env               # показать файл
less app.log           # листать длинный файл, выход — q
tail -f app.log        # следить за логом в реальном времени
grep "ERROR" app.log   # найти строки
chmod +x deploy.sh     # разрешить запуск скрипта
```

### Процессы и порты
```bash
ps aux | grep node     # найти процесс
kill 12345             # завершить по PID
lsof -i :3000          # кто занял порт 3000
```
Ошибка `EADDRINUSE` значит, что порт уже занят другим процессом.

### Запросы через curl
```bash
curl https://api.example.com/health
curl -X POST https://api.example.com/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Новая задача"}'
curl -i https://example.com   # с заголовками ответа
```

### Запомни
- Переменные окружения задают снаружи: `PORT=3000 node server.js`. Секреты — только так.
- На сервер заходят по SSH-ключу, а не по паролю.

@@ node1
### Файлы и окружение
```js
import { readFile, writeFile } from "node:fs/promises";

const raw = await readFile("tasks.json", "utf8");
const tasks = JSON.parse(raw);
tasks.push({ id: Date.now(), title: process.argv[2] });
await writeFile("tasks.json", JSON.stringify(tasks, null, 2));

console.log("Порт из окружения:", process.env.PORT ?? 3000);
```
`process.argv[2]` — первый аргумент после имени скрипта: `node add.js "Купить хлеб"`.

### Сервер без фреймворка
```js
import http from "node:http";

http.createServer((req, res) => {
  if (req.url === "/tasks") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([{ id: 1, title: "Сверстать шапку" }]));
  } else {
    res.writeHead(404).end("Not found");
  }
}).listen(3000, () => console.log("http://localhost:3000"));
```

### Запомни
- В `package.json` поставь `"type": "module"`, чтобы писать `import`.
- Не блокируй event loop: тяжёлые вычисления выносят в фоновые задачи или worker threads.

@@ http
### Анатомия запроса
```http
POST /api/tasks HTTP/1.1
Host: api.studio.dev
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"title": "Подключить оплату"}
```
Метод — что сделать, путь — с чем, заголовки — служебная информация, тело — данные.

### REST: адреса и методы
| Действие | Метод и путь | Ответ |
|---|---|---|
| Список | `GET /api/tasks` | 200 + массив |
| Одна | `GET /api/tasks/42` | 200 или 404 |
| Создать | `POST /api/tasks` | 201 + запись |
| Изменить часть | `PATCH /api/tasks/42` | 200 + запись |
| Удалить | `DELETE /api/tasks/42` | 204 |

Фильтры и страницы — в query: `GET /api/tasks?status=done&page=2`.

### Запомни
- GET не меняет данные. PUT и DELETE можно повторять без побочных эффектов, POST — нет.
- 401 — «кто ты?», 403 — «знаю, кто ты, но нельзя».

@@ express1
### Минимальный сервер
```js
import express from "express";
const app = express();
app.use(express.json());              // разбирать JSON в req.body

app.get("/api/users/:id", (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "Не найден" });
  res.json(user);
});

app.listen(3000);
```
`req.params` — части пути, `req.query` — параметры после `?`, `req.body` — тело.

### Middleware
```js
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();                             // передать дальше
});
```
Middleware выполняются в порядке объявления. Каждый либо отвечает, либо вызывает `next()`.

### Router
```js
// routes/tasks.js
const router = express.Router();
router.get("/", listTasks);
router.post("/", createTask);
export default router;

// server.js
app.use("/api/tasks", tasksRouter);
```

### Запомни
- `return res.status(...)` — `return` не даёт коду пойти дальше и ответить второй раз.

@@ express2
### Валидация через zod
```js
import { z } from "zod";

const TaskInput = z.object({
  title: z.string().trim().min(3, "Название от 3 символов"),
  dueDate: z.string().date().optional(),
});

app.post("/api/tasks", (req, res) => {
  const parsed = TaskInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const task = { id: nextId++, ...parsed.data, done: false };
  tasks.push(task);
  res.status(201).json(task);
});
```

### Пагинация
```js
const page = Math.max(1, Number(req.query.page) || 1);
const limit = Math.min(50, Number(req.query.limit) || 20);
const items = tasks.slice((page - 1) * limit, page * limit);
res.json({ items, page, limit, total: tasks.length });
```

### Обработчик ошибок
```js
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : "Внутренняя ошибка" });
});
```
Он объявляется последним и отличается четырьмя аргументами.

### Запомни
- Один формат ошибок на всё API: `{ "error": "…" }`.

@@ sql1
### Базовый запрос
```sql
SELECT title, budget
FROM projects
WHERE status = 'done' AND budget > 40000
ORDER BY budget DESC
LIMIT 5;
```
Порядок выполнения: `FROM` → `WHERE` → `SELECT` → `ORDER BY` → `LIMIT`.

### Фильтры
```sql
WHERE city IN ('Москва', 'Казань')
WHERE budget BETWEEN 30000 AND 100000
WHERE title LIKE 'Лендинг%'        -- начинается с «Лендинг»
WHERE budget IS NULL               -- не «= NULL»!
```

### Вычисления и псевдонимы
```sql
SELECT title, budget * 0.9 AS with_discount
FROM projects;

SELECT DISTINCT city FROM clients;
```

### Запомни
- Строки в SQL — в одинарных кавычках.
- NULL означает «неизвестно»: любое сравнение с ним даёт не true, а NULL.

@@ sql2
### JOIN
```sql
SELECT c.name, p.title
FROM projects p
JOIN clients c ON c.id = p.client_id;        -- только пары, которые совпали

SELECT c.name, p.title
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id;  -- все клиенты, даже без проектов
```

### Группировка
```sql
SELECT c.name, COUNT(p.id) AS projects, SUM(p.budget) AS total
FROM clients c
JOIN projects p ON p.client_id = c.id
GROUP BY c.id, c.name
HAVING SUM(p.budget) > 100000
ORDER BY total DESC;
```
`WHERE` фильтрует строки до группировки, `HAVING` — готовые группы.

### CTE
```sql
WITH paid AS (
  SELECT project_id, SUM(amount) AS paid FROM payments GROUP BY project_id
)
SELECT p.title, p.budget - paid.paid AS debt
FROM projects p JOIN paid ON paid.project_id = p.id
WHERE paid.paid < p.budget;
```

### Запомни
- Всё, что в SELECT не агрегат, должно быть в GROUP BY.

@@ sql3
### Таблица с ограничениями
```sql
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (length(title) >= 3),
  done        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Связи
- Один-ко-многим: внешний ключ в «многих» (`tasks.project_id`).
- Многие-ко-многим: связующая таблица `project_members (project_id, user_id)` с составным первичным ключом.

### Индексы и транзакции
```sql
CREATE INDEX idx_tasks_project ON tasks(project_id);

BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;      -- или ROLLBACK, если что-то пошло не так
```

### Запомни
- Индекс ставят на колонки из WHERE, JOIN и ORDER BY частых запросов. Каждый индекс замедляет запись.

@@ pg-node
### Подключение
```js
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query(
  "SELECT * FROM tasks WHERE project_id = $1 AND done = $2",
  [projectId, false]
);
```
Значения передаются отдельно от текста запроса — так SQL-инъекция невозможна.

### Транзакция из кода
```js
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("UPDATE projects SET status = 'done' WHERE id = $1", [id]);
  await client.query("INSERT INTO payments (project_id, amount) VALUES ($1, $2)", [id, sum]);
  await client.query("COMMIT");
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  client.release();
}
```

### Миграции
Каждое изменение схемы — отдельный файл с номером: `001_create_tasks.sql`, `002_add_due_date.sql`. Их хранят в Git и применяют по порядку на каждой базе.

### Запомни
- Никогда не склеивай SQL из строк с данными пользователя.
- Ошибка с кодом `23505` — нарушена уникальность: ответь 409, а не 500.

@@ orm
### Prisma за минуту
```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  tasks Task[]
}
model Task {
  id     Int     @id @default(autoincrement())
  title  String
  done   Boolean @default(false)
  user   User    @relation(fields: [userId], references: [id])
  userId Int
}
```
```bash
npx prisma migrate dev --name init   # создать миграцию и таблицы
```
```js
const tasks = await prisma.task.findMany({
  where: { userId: me.id, done: false },
  orderBy: { id: "desc" },
  include: { user: true },
});
```

### Проблема N+1
Плохо: получить 100 проектов, а потом в цикле делать запрос за клиентом каждого — 101 запрос. Хорошо: `include` или `JOIN` — 1–2 запроса.

### Запомни
- Включи логирование SQL в ORM и посмотри, какие запросы он реально отправляет.

@@ auth
### Пароли
```js
import bcrypt from "bcryptjs";
const hash = await bcrypt.hash(password, 11);        // при регистрации
const ok = await bcrypt.compare(password, user.hash); // при входе
```
Хранится только хеш. Даже администратор базы не узнает пароль.

### Сессия в cookie
```js
res.cookie("session", token, {
  httpOnly: true,     // JavaScript страницы не прочитает
  secure: true,       // только по HTTPS
  sameSite: "lax",    // защита от CSRF
  maxAge: 30 * 24 * 3600 * 1000,
});
```

### Проверка прав
```js
function requireAuth(req, res, next) {
  const user = verify(req.cookies.session);
  if (!user) return res.status(401).json({ error: "Нужно войти" });
  req.user = user;
  next();
}
// чужие данные: всегда фильтруй по владельцу
const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [id, req.user.id]);
```

### Запомни
- JWT подписан, но не зашифрован: в нём не хранят ничего секретного.

@@ security
### OWASP Top 10 на практике
- **Сломанный контроль доступа** — проверяй владельца в каждом запросе.
- **Инъекции** — только параметризованные запросы.
- **XSS** — `textContent` вместо `innerHTML`, React экранирует сам.
- **Секреты** — в переменных окружения, `.env` в `.gitignore`.
- **Устаревшие пакеты** — `npm audit` и обновления.

### Защита в Express
```js
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

app.use(helmet());                                   // заголовки безопасности
app.use(cors({ origin: "https://app.studio.dev", credentials: true }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }));
```

### Запомни
- CORS защищает пользователей в браузере, а не твой сервер. Права проверяет сам API.
- Ошибки клиенту — общими словами, подробности — в лог.

@@ be-test
### Тест API с Supertest
```js
import request from "supertest";
import { app } from "../src/app.js";

describe("POST /api/tasks", () => {
  it("создаёт задачу", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "Тест" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Тест");
  });
  it("отклоняет пустое название", async () => {
    const res = await request(app).post("/api/tasks").send({});
    expect(res.status).toBe(400);
  });
});
```
Для этого `app` экспортируют отдельно от `app.listen()`.

### GitHub Actions
```yaml
name: tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm test
```

### Запомни
- На каждый маршрут — хотя бы один успешный и один ошибочный сценарий, включая чужие данные.

@@ arch
### Слои
```text
routes/     принимают запрос, валидируют, отвечают
services/   бизнес-правила: «нельзя закрыть проект без оплаты»
repos/      SQL и доступ к данным
lib/        ошибки, логгер, конфиг
```
```js
// routes/projects.js
router.post("/:id/close", async (req, res) => {
  const project = await projectService.close(Number(req.params.id), req.user);
  res.json(project);
});
// services/projects.js
export async function close(id, user) {
  const p = await repo.findById(id);
  if (!p) throw new HttpError(404, "Проект не найден");
  if (p.paid < p.budget) throw new HttpError(409, "Проект не оплачен");
  return repo.update(id, { status: "done" });
}
```

### Своя ошибка
```js
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
```

### Запомни
- Начинай с монолита. Микросервисы решают проблемы больших команд, а не учебных проектов.

@@ cache
### Cache-aside
```js
async function getStats() {
  const cached = await redis.get("stats");
  if (cached) return JSON.parse(cached);           // попадание
  const stats = await db.computeStats();           // промах: идём в базу
  await redis.set("stats", JSON.stringify(stats), { EX: 60 }); // TTL 60 с
  return stats;
}
// при изменении данных — сбросить
await redis.del("stats");
```

### Что ещё кладут в Redis
- Сессии пользователей.
- Счётчики для rate limit.
- Очереди фоновых задач.

### Запомни
- Кешируй то, что читают часто, а меняют редко.
- Всегда задавай TTL: даже если забудешь сбросить кеш, он устареет сам.

@@ realtime
### WebSocket-сервер
```js
import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  socket.on("message", (msg) => {
    for (const client of wss.clients) client.send(msg.toString()); // всем
  });
});
```
```js
// в браузере
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (e) => console.log("Новое:", e.data);
ws.send("Привет!");
```

### Фоновые задачи
```js
// не заставляем пользователя ждать
await queue.add("send-welcome-email", { userId: user.id });
res.status(201).json(user);
```

### Запомни
- Для простых уведомлений от сервера часто хватает Server-Sent Events: проще WebSocket и работает поверх HTTP.

@@ docker
### Dockerfile для Node.js
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/index.js"]
```
Сначала копируют `package.json` и ставят зависимости, потом остальной код: тогда кеш слоёв не сбрасывается при каждой правке.

### Compose: приложение + база
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes:
  pgdata:
```
```bash
docker compose up --build
```

### Запомни
- Внутри Compose сервисы видят друг друга по имени: база — это хост `db`.

@@ deploy
### Путь кода в продакшен
1. Push в ветку → GitHub Actions гоняет тесты.
2. Pull request → ревью → слияние в `main`.
3. Хостинг (Render) видит новый коммит, собирает и выкатывает.
4. Health-check `/healthz` подтверждает, что новая версия жива.

### Переменные окружения
`DATABASE_URL`, `JWT_SECRET`, ключи API задаются в настройках хостинга. В репозитории — только `.env.example` без значений.

### Наблюдаемость
```js
app.get("/healthz", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
});
```
Логи хостинга, Sentry для ошибок, уведомления о падениях.

### Запомни
- Перед миграцией базы в продакшене — резервная копия. В Neon для этого есть ветки базы.

@@ be-proj1
### Минимальная структура
```text
src/
  app.js          express, middleware, маршруты
  server.js       app.listen
  routes/         tasks.js, projects.js
  db/             pool.js, migrations/
tests/
.env.example
README.md
```

### Чек-лист готовности
- CRUD проектов и задач, фильтр и пагинация.
- Валидация zod, единый формат ошибок.
- Данные в PostgreSQL, миграции в репозитории.
- 10+ тестов, CI зелёный.
- Деплой на Render + Neon, ссылка в README.
- Коллекция запросов Bruno или Postman.

### Запомни
- README отвечает на три вопроса: что это, как запустить, какие есть маршруты.

@@ be-proj2
### Что показывает этот проект
- Регистрация, вход, роли (user, admin).
- Права на уровне записей: пользователь видит только своё.
- Docker Compose: одна команда — и всё работает локально.
- CI с тестами, деплой, мониторинг ошибок.

### Схема в README
```text
Браузер → Express API → PostgreSQL
              ↓
            Redis (кеш, rate limit)
```
Одна картинка архитектуры экономит работодателю пять минут чтения кода.

### Запомни
- Добавь тестовый аккаунт для проверяющего: логин и пароль в README.

@@ be-career
### Вопросы на собеседовании Backend
- Как работает event loop в Node.js?
- Чем отличаются 401 и 403, PUT и PATCH?
- Зачем индексы и когда они вредят? Что такое транзакция?
- Сессии или JWT: плюсы и минусы.
- Как защититься от SQL-инъекции и XSS?
- Что будет, если два запроса одновременно изменят одну строку?

### Задача на проектирование
«Спроектируй сокращатель ссылок»: таблица `links (code, url, created_at, clicks)`, индекс по `code`, генерация короткого кода, редирект 301 или 302, кеш популярных ссылок, rate limit на создание.

### Запомни
- Рассказывай о своём проекте: что выбрал, почему и что сделал бы иначе.

@@ fs-integration
### Клиент к своему API
```js
const API = import.meta.env.VITE_API_URL;   // адрес из окружения

export async function api(path, options = {}) {
  const res = await fetch(API + path, {
    credentials: "include",                  // отправлять cookie
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Ошибка " + res.status);
  return data;
}
```

### CORS на сервере
```js
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
```
Если фронт и API на разных доменах, cookie нужен `sameSite: "none"` и `secure: true`.

### Общие схемы
Одна zod-схема в общей папке проверяет форму на фронте и тело запроса на бэке — правила не разъедутся.

### Запомни
- Проще всего жить на одном домене: API отдаёт и фронтенд, тогда CORS не нужен.

@@ fs-next-api
### Route Handler
```ts
// app/api/tasks/route.ts
export async function GET() {
  const tasks = await db.task.findMany();
  return Response.json(tasks);
}
export async function POST(req: Request) {
  const body = await req.json();
  const task = await db.task.create({ data: { title: body.title } });
  return Response.json(task, { status: 201 });
}
```

### Server Action
```tsx
async function createTask(formData: FormData) {
  "use server";
  const user = await requireUser();           // проверка прав обязательна
  await db.task.create({ data: { title: String(formData.get("title")), userId: user.id } });
  revalidatePath("/tasks");
}

export default function Page() {
  return <form action={createTask}><input name="title" /><button>Добавить</button></form>;
}
```

### Запомни
- `NEXT_PUBLIC_` попадает в браузер. Секреты — без этого префикса.

@@ fs-proj
### План финального проекта
1. Схема базы и миграции.
2. Вход и роли.
3. Один сквозной сценарий: форма → API → база → список.
4. Остальные CRUD-экраны.
5. Тесты API и один e2e.
6. Docker Compose, деплой, README со схемой.

### Что оценивает работодатель
- Работает ли демо прямо сейчас.
- Понятен ли код и структура папок.
- Есть ли тесты и обработка ошибок.
- Можешь ли ты объяснить каждое решение.

### Запомни
- Пять доведённых функций лучше пятидесяти начатых.

@@ fs-career
### Путь данных от клика до базы
1. Пользователь жмёт «Сохранить», React вызывает `fetch`.
2. Запрос уходит по HTTPS с cookie сессии.
3. Express: middleware проверяет сессию, zod — тело.
4. Сервис применяет бизнес-правила, репозиторий выполняет SQL.
5. PostgreSQL сохраняет строку в транзакции.
6. Ответ 201 с JSON, React обновляет состояние и интерфейс.

Расскажи этот путь на своём проекте — это лучший ответ на половину вопросов собеседования.

### Резюме Junior Fullstack
Стек одной строкой (React, TypeScript, Node.js, PostgreSQL), два проекта с демо и кодом, что сделал сам, коммерческий опыт с цифрами.

### Запомни
- Fullstack-джуниора берут за умение довести фичу до продакшена, а не за знание всех технологий сразу.
