/* Задачи бэкенда.
   mode "api" — серверный код на симуляции Express прямо в браузере. Тесты вызывают call(метод, адрес, тело, заголовки).
   mode "sql" — запросы к SQLite в браузере. checks сравнивают результат ученика с результатом эталона. */

const STUDIO_SQL = `CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL,      -- landing, site, shop, app, seo, design
  budget INTEGER,          -- может быть NULL
  status TEXT NOT NULL     -- active, done, paused
);
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  amount INTEGER NOT NULL,
  paid_at TEXT NOT NULL
);
INSERT INTO clients VALUES
  (1, 'Кофейня «Зерно»', 'Москва', '2026-01-15'),
  (2, 'Барбершоп «Лезвие»', 'Казань', '2026-02-03'),
  (3, 'Студия йоги «Прана»', 'Москва', '2026-03-21'),
  (4, 'Пекарня «Колос»', 'Тверь', '2026-04-10'),
  (5, 'Автосервис «Гайка»', 'Казань', '2026-05-02'),
  (6, 'Цветочный «Букет»', 'Самара', '2026-06-18');
INSERT INTO projects VALUES
  (1, 1, 'Лендинг для кофейни', 'landing', 45000, 'done'),
  (2, 1, 'Интернет-магазин зерна', 'shop', 160000, 'active'),
  (3, 2, 'Сайт с онлайн-записью', 'site', 80000, 'active'),
  (4, 3, 'Лендинг йога-ретрита', 'landing', 38000, 'done'),
  (5, 3, 'Личный кабинет учеников', 'app', 210000, 'paused'),
  (6, 4, 'Каталог выпечки', 'site', 55000, 'done'),
  (7, 5, 'SEO-продвижение', 'seo', 30000, 'active'),
  (8, 2, 'Редизайн логотипа', 'design', NULL, 'done');
INSERT INTO payments VALUES
  (1, 1, 45000, '2026-02-01'), (2, 2, 80000, '2026-03-10'),
  (3, 3, 40000, '2026-03-15'), (4, 4, 38000, '2026-04-20'),
  (5, 5, 50000, '2026-05-01'), (6, 6, 55000, '2026-05-25'),
  (7, 7, 15000, '2026-06-10'), (8, 2, 40000, '2026-06-30');`;

const API_START = `const app = express();
app.use(express.json());
`;

EX.push(
/* ================= API ================= */
{id:"api-http1",l:"http",t:"Первые маршруты",mode:"api",
 task:"Это сервер на Express. Он работает прямо в браузере, а запросы к нему можно отправлять из панели «Запрос» справа.\n\nСделай два маршрута:\n- <code>GET /api/health</code> → статус 200 и <code>{ \"status\": \"ok\" }</code>\n- <code>GET /api/time</code> → <code>{ \"now\": … }</code>, где now — текущее время в миллисекундах (<code>Date.now()</code>)",
 files:{js:API_START + `
// app.get("/адрес", (req, res) => { ... });

app.listen(3000);
`},
 hints:["Маршрут: app.get(\"/api/health\", (req, res) => { ... });","Ответ в JSON: res.json({ status: \"ok\" }). Статус 200 ставится по умолчанию."],
 tests:[["GET /api/health → { status: \"ok\" }","const r = await call('GET', '/api/health'); ok(r.status === 200, 'Статус ' + r.status + ', ожидался 200'); return r.body && r.body.status === 'ok'"],
        ["GET /api/time → число now","const r = await call('GET', '/api/time'); ok(r.status === 200, 'Статус ' + r.status); ok(r.body && typeof r.body.now === 'number', 'now должно быть числом'); return Math.abs(r.body.now - Date.now()) < 5000"]],
 sol:{js:API_START + `
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/time", (req, res) => {
  res.json({ now: Date.now() });
});

app.listen(3000);`}},

{id:"api-http2",l:"http",t:"Правильные коды ответа",mode:"api",
 task:"Сделай приём отзывов:\n- <code>POST /api/feedback</code> с телом <code>{ \"text\": \"…\" }</code>. Если text нет или он короче 5 символов — статус <b>400</b> и <code>{ \"error\": \"…\" }</code>. Иначе — статус <b>201</b> и созданный отзыв <code>{ id, text }</code>\n- <code>GET /api/feedback</code> → массив всех отзывов",
 files:{js:API_START + `
const feedback = [];
let nextId = 1;

// GET /api/feedback
// POST /api/feedback

app.listen(3000);
`},
 hints:["Тело запроса лежит в req.body.","Статус ставится до json: res.status(400).json({ error: \"…\" }).","Проверка: typeof text !== \"string\" || text.trim().length < 5."],
 tests:[["Корректный отзыв → 201","const r = await call('POST', '/api/feedback', { text: 'Отличная работа!' }); ok(r.status === 201, 'Статус ' + r.status + ', ожидался 201'); return r.body && r.body.id != null && r.body.text === 'Отличная работа!'"],
        ["Без текста → 400 и error","const r = await call('POST', '/api/feedback', {}); ok(r.status === 400, 'Статус ' + r.status + ', ожидался 400'); return r.body && typeof r.body.error === 'string'"],
        ["Короткий текст → 400","const r = await call('POST', '/api/feedback', { text: 'ок' }); return r.status === 400"],
        ["GET возвращает сохранённые","const r = await call('GET', '/api/feedback'); ok(r.status === 200, 'Статус ' + r.status); return Array.isArray(r.body) && r.body.length === 1"]],
 sol:{js:API_START + `
const feedback = [];
let nextId = 1;

app.get("/api/feedback", (req, res) => {
  res.json(feedback);
});

app.post("/api/feedback", (req, res) => {
  const text = req.body && req.body.text;
  if (typeof text !== "string" || text.trim().length < 5) {
    return res.status(400).json({ error: "Текст отзыва должен быть не короче 5 символов" });
  }
  const item = { id: nextId++, text: text.trim() };
  feedback.push(item);
  res.status(201).json(item);
});

app.listen(3000);`}},

{id:"api-ex1",l:"express1",t:"Параметры пути и фильтры",mode:"api",
 task:"Сделай API пользователей:\n- <code>GET /api/users</code> → все пользователи; с <code>?role=student</code> — только с этой ролью\n- <code>GET /api/users/:id</code> → один пользователь или <b>404</b> с <code>{ \"error\": \"Пользователь не найден\" }</code>",
 files:{js:API_START + `
const users = [
  { id: 1, name: "Аня", role: "admin" },
  { id: 2, name: "Борис", role: "student" },
  { id: 3, name: "Вика", role: "student" },
];

app.listen(3000);
`},
 hints:["Фильтр из адреса: req.query.role.","Параметр пути — строка: Number(req.params.id).","Не найден — return res.status(404).json({ error: \"Пользователь не найден\" });"],
 tests:[["Все пользователи","const r = await call('GET', '/api/users'); ok(r.status === 200, 'Статус ' + r.status); return Array.isArray(r.body) && r.body.length === 3"],
        ["Фильтр ?role=student","const r = await call('GET', '/api/users?role=student'); ok(Array.isArray(r.body), 'Ожидался массив'); return r.body.length === 2 && r.body.every(u => u.role === 'student')"],
        ["GET /api/users/2 → Борис","const r = await call('GET', '/api/users/2'); ok(r.status === 200, 'Статус ' + r.status); return r.body && r.body.name === 'Борис'"],
        ["Нет такого → 404","const r = await call('GET', '/api/users/99'); ok(r.status === 404, 'Статус ' + r.status + ', ожидался 404'); return r.body && r.body.error === 'Пользователь не найден'"]],
 sol:{js:API_START + `
const users = [
  { id: 1, name: "Аня", role: "admin" },
  { id: 2, name: "Борис", role: "student" },
  { id: 3, name: "Вика", role: "student" },
];

app.get("/api/users", (req, res) => {
  const { role } = req.query;
  res.json(role ? users.filter(u => u.role === role) : users);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  res.json(user);
});

app.listen(3000);`}},

{id:"api-ex2",l:"express1",t:"Свой middleware",mode:"api",
 task:"Напиши middleware, который для <b>каждого</b> запроса:\n- присваивает номер по порядку (1, 2, 3…) и кладёт его в <code>req.requestId</code>\n- ставит заголовок ответа <code>X-Request-Id</code> с этим номером\n- пишет в консоль метод и путь: <code>GET /api/ping</code>\n\nИ маршрут <code>GET /api/ping</code> → <code>{ \"pong\": true, \"requestId\": … }</code>.",
 files:{js:API_START + `
let counter = 0;

// app.use((req, res, next) => { ... });

app.listen(3000);
`},
 hints:["Middleware — функция (req, res, next). В конце обязательно next().","Заголовок: res.set(\"X-Request-Id\", String(id)).","Middleware объявляется до маршрутов: порядок важен."],
 tests:[["Есть заголовок X-Request-Id","const r = await call('GET', '/api/ping'); ok(r.status === 200, 'Статус ' + r.status); return !!r.headers['x-request-id']"],
        ["Номер растёт с каждым запросом","const a = await call('GET', '/api/ping'), b = await call('GET', '/api/ping'); return Number(b.headers['x-request-id']) === Number(a.headers['x-request-id']) + 1"],
        ["В ответе тот же requestId","const r = await call('GET', '/api/ping'); return r.body && r.body.pong === true && String(r.body.requestId) === r.headers['x-request-id']"],
        ["Работает и для других адресов","const r = await call('GET', '/api/unknown'); return !!r.headers['x-request-id']"]],
 sol:{js:API_START + `
let counter = 0;

app.use((req, res, next) => {
  counter++;
  req.requestId = counter;
  res.set("X-Request-Id", String(counter));
  console.log(req.method, req.path);
  next();
});

app.get("/api/ping", (req, res) => {
  res.json({ pong: true, requestId: req.requestId });
});

app.listen(3000);`}},

{id:"api-crud",l:"express2",t:"CRUD задач",mode:"api",
 task:"Сделай полный CRUD задач в памяти:\n- <code>GET /api/tasks</code> → массив\n- <code>POST /api/tasks</code> <code>{ title }</code> → <b>201</b> и <code>{ id, title, done: false }</code>. title — строка от 3 символов, иначе <b>400</b>\n- <code>PATCH /api/tasks/:id</code> <code>{ done }</code> → обновлённая задача. done не boolean — <b>400</b>, нет задачи — <b>404</b>\n- <code>DELETE /api/tasks/:id</code> → <b>204</b> без тела, нет задачи — <b>404</b>\n\nОшибки — в формате <code>{ \"error\": \"…\" }</code>.",
 files:{js:API_START + `
let tasks = [];
let nextId = 1;

app.listen(3000);
`},
 hints:["Удобно вынести поиск: const task = tasks.find(t => t.id === Number(req.params.id));","Проверка boolean: typeof req.body.done !== \"boolean\".","Ответ без тела: res.status(204).end()."],
 tests:[["Создание → 201","const r = await call('POST', '/api/tasks', { title: 'Сверстать шапку' }); ok(r.status === 201, 'Статус ' + r.status + ', ожидался 201'); return r.body && r.body.id != null && r.body.title === 'Сверстать шапку' && r.body.done === false"],
        ["Короткий title → 400","const r = await call('POST', '/api/tasks', { title: 'ab' }); ok(r.status === 400, 'Статус ' + r.status); return typeof r.body.error === 'string'"],
        ["Список","const r = await call('GET', '/api/tasks'); return r.status === 200 && Array.isArray(r.body) && r.body.length === 1"],
        ["PATCH меняет done","const id = (await call('GET', '/api/tasks')).body[0].id; const r = await call('PATCH', '/api/tasks/' + id, { done: true }); ok(r.status === 200, 'Статус ' + r.status); return r.body.done === true"],
        ["PATCH с неверным done → 400","const id = (await call('GET', '/api/tasks')).body[0].id; const r = await call('PATCH', '/api/tasks/' + id, { done: 'да' }); return r.status === 400"],
        ["PATCH несуществующей → 404","const r = await call('PATCH', '/api/tasks/999', { done: true }); return r.status === 404"],
        ["DELETE → 204, потом 404","const id = (await call('GET', '/api/tasks')).body[0].id; const a = await call('DELETE', '/api/tasks/' + id); ok(a.status === 204, 'Удаление вернуло ' + a.status + ', ожидался 204'); const b = await call('DELETE', '/api/tasks/' + id); ok(b.status === 404, 'Повторное удаление вернуло ' + b.status); return (await call('GET', '/api/tasks')).body.length === 0"]],
 sol:{js:API_START + `
let tasks = [];
let nextId = 1;

const findTask = id => tasks.find(t => t.id === Number(id));

app.get("/api/tasks", (req, res) => res.json(tasks));

app.post("/api/tasks", (req, res) => {
  const title = req.body && req.body.title;
  if (typeof title !== "string" || title.trim().length < 3) {
    return res.status(400).json({ error: "title — строка от 3 символов" });
  }
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Задача не найдена" });
  if (typeof req.body.done !== "boolean") return res.status(400).json({ error: "done должен быть true или false" });
  task.done = req.body.done;
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Задача не найдена" });
  tasks = tasks.filter(t => t !== task);
  res.status(204).end();
});

app.listen(3000);`}},

{id:"api-page",l:"express2",t:"Пагинация",mode:"api",
 task:"<code>GET /api/products</code> отдаёт товары постранично: <code>?page=2&amp;limit=3</code>. Ответ:\n<pre><code>{ \"items\": [...], \"page\": 2, \"limit\": 3, \"total\": 10, \"pages\": 4 }</code></pre>\n- по умолчанию page = 1, limit = 5\n- limit больше 50 превращается в 50\n- page или limit не целое число ≥ 1 — <b>400</b>",
 files:{js:API_START + `
const products = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: "Товар " + (i + 1) }));

app.listen(3000);
`},
 hints:["Числа из query — строки: Number(req.query.page ?? 1).","Проверка: Number.isInteger(page) && page >= 1.","Нужный кусок: products.slice((page - 1) * limit, page * limit). Страниц: Math.ceil(total / limit)."],
 tests:[["Значения по умолчанию","const r = await call('GET', '/api/products'); ok(r.status === 200, 'Статус ' + r.status); return r.body.page === 1 && r.body.limit === 5 && r.body.items.length === 5 && r.body.total === 10 && r.body.pages === 2"],
        ["page=2, limit=3","const r = await call('GET', '/api/products?page=2&limit=3'); return r.body.items.map(p => p.id).join() === '4,5,6' && r.body.pages === 4"],
        ["Последняя неполная страница","const r = await call('GET', '/api/products?page=4&limit=3'); return r.body.items.length === 1 && r.body.items[0].id === 10"],
        ["limit больше 50 → 50","const r = await call('GET', '/api/products?limit=500'); return r.body.limit === 50 && r.body.items.length === 10"],
        ["Неверный page → 400","const a = await call('GET', '/api/products?page=0'), b = await call('GET', '/api/products?page=abc'); return a.status === 400 && b.status === 400"]],
 sol:{js:API_START + `
const products = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: "Товар " + (i + 1) }));

app.get("/api/products", (req, res) => {
  const page = Number(req.query.page ?? 1);
  let limit = Number(req.query.limit ?? 5);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return res.status(400).json({ error: "page и limit — целые числа от 1" });
  }
  limit = Math.min(limit, 50);
  const total = products.length;
  res.json({
    items: products.slice((page - 1) * limit, page * limit),
    page, limit, total,
    pages: Math.ceil(total / limit),
  });
});

app.listen(3000);`}},

{id:"api-auth",l:"auth",t:"Защищённые маршруты и роли",mode:"api",
 task:"Токены уже выданы (в настоящем проекте их выдаёт /login). Напиши два middleware:\n- <code>requireAuth</code>: читает заголовок <code>Authorization: Bearer &lt;токен&gt;</code>, кладёт пользователя в <code>req.user</code>. Нет или неверный токен — <b>401</b>\n- <code>requireAdmin</code>: если роль не admin — <b>403</b>\n\nМаршруты: <code>GET /api/me</code> (нужен вход) → пользователь; <code>GET /api/admin/stats</code> (только админ) → <code>{ \"users\": 2 }</code>.",
 files:{js:API_START + `
const TOKENS = {
  "token-anya": { id: 1, name: "Аня", role: "admin" },
  "token-boris": { id: 2, name: "Борис", role: "student" },
};

function requireAuth(req, res, next) {

}

function requireAdmin(req, res, next) {

}

app.listen(3000);
`},
 hints:["Заголовок: const header = req.get(\"Authorization\") || \"\";","Токен: header.startsWith(\"Bearer \") ? header.slice(7) : null.","Несколько middleware в маршруте: app.get(\"/api/admin/stats\", requireAuth, requireAdmin, (req, res) => { ... })."],
 tests:[["Без заголовка → 401","const r = await call('GET', '/api/me'); return r.status === 401"],
        ["Неверный токен → 401","const r = await call('GET', '/api/me', null, { Authorization: 'Bearer nope' }); return r.status === 401"],
        ["/api/me для Бориса","const r = await call('GET', '/api/me', null, { Authorization: 'Bearer token-boris' }); ok(r.status === 200, 'Статус ' + r.status); return r.body.name === 'Борис'"],
        ["Студент в админке → 403","const r = await call('GET', '/api/admin/stats', null, { Authorization: 'Bearer token-boris' }); return r.status === 403"],
        ["Админ → 200","const r = await call('GET', '/api/admin/stats', null, { Authorization: 'Bearer token-anya' }); ok(r.status === 200, 'Статус ' + r.status); return r.body.users === 2"],
        ["Админка без входа → 401, а не 403","const r = await call('GET', '/api/admin/stats'); return r.status === 401"]],
 sol:{js:API_START + `
const TOKENS = {
  "token-anya": { id: 1, name: "Аня", role: "admin" },
  "token-boris": { id: 2, name: "Борис", role: "student" },
};

function requireAuth(req, res, next) {
  const header = req.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const user = token && TOKENS[token];
  if (!user) return res.status(401).json({ error: "Нужно войти" });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Только для администратора" });
  next();
}

app.get("/api/me", requireAuth, (req, res) => res.json(req.user));

app.get("/api/admin/stats", requireAuth, requireAdmin, (req, res) => {
  res.json({ users: Object.keys(TOKENS).length });
});

app.listen(3000);`}},

{id:"api-rate",l:"security",t:"Ограничение частоты запросов",mode:"api",
 task:"Защити поиск от перебора. Middleware <code>rateLimit</code> пропускает не больше <b>3</b> запросов за 60 секунд от одного клиента. Клиента определяй по заголовку <code>X-Client-Id</code>. Четвёртый запрос — статус <b>429</b>, <code>{ \"error\": \"…\" }</code> и заголовок <code>Retry-After</code> (секунды до сброса).\n\nМаршрут: <code>GET /api/search?q=…</code> → <code>{ \"q\": … }</code>.",
 files:{js:API_START + `
const WINDOW_MS = 60_000;
const LIMIT = 3;
const hits = new Map(); // clientId → { count, start }

function rateLimit(req, res, next) {

}

app.listen(3000);
`},
 hints:["const id = req.get(\"X-Client-Id\") || \"anon\";","Если окно истекло (Date.now() - start > WINDOW_MS) — начни новое окно с count = 0.","Retry-After: Math.ceil((start + WINDOW_MS - Date.now()) / 1000)."],
 tests:[["Первые 3 запроса проходят","let okAll = true; for (let i = 0; i < 3; i++) { const r = await call('GET', '/api/search?q=кот', null, { 'X-Client-Id': 'A' }); okAll = okAll && r.status === 200; } return okAll"],
        ["Четвёртый → 429","const r = await call('GET', '/api/search?q=кот', null, { 'X-Client-Id': 'A' }); ok(r.status === 429, 'Статус ' + r.status + ', ожидался 429'); return typeof r.body.error === 'string'"],
        ["Есть Retry-After","const r = await call('GET', '/api/search?q=кот', null, { 'X-Client-Id': 'A' }); const s = Number(r.headers['retry-after']); return s > 0 && s <= 60"],
        ["Другой клиент не пострадал","const r = await call('GET', '/api/search?q=пёс', null, { 'X-Client-Id': 'B' }); return r.status === 200 && r.body.q === 'пёс'"]],
 sol:{js:API_START + `
const WINDOW_MS = 60_000;
const LIMIT = 3;
const hits = new Map();

function rateLimit(req, res, next) {
  const id = req.get("X-Client-Id") || "anon";
  const now = Date.now();
  let entry = hits.get(id);
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { count: 0, start: now };
    hits.set(id, entry);
  }
  entry.count++;
  if (entry.count > LIMIT) {
    res.set("Retry-After", String(Math.ceil((entry.start + WINDOW_MS - now) / 1000)));
    return res.status(429).json({ error: "Слишком много запросов, подожди минуту" });
  }
  next();
}

app.get("/api/search", rateLimit, (req, res) => {
  res.json({ q: req.query.q });
});

app.listen(3000);`}},

{id:"api-errors",l:"arch",t:"Единая обработка ошибок",mode:"api",
 task:"Сделай класс <code>HttpError</code> со статусом и обработчик ошибок в конце приложения:\n- ошибка HttpError → её статус и <code>{ \"error\": сообщение }</code>\n- любая другая ошибка → <b>500</b> и общий текст <code>{ \"error\": \"Внутренняя ошибка сервера\" }</code>. Подробности — только в <code>console.error</code>, клиенту их не показываем\n\nМаршруты уже написаны и бросают ошибки — в том числе из async-функции.",
 files:{js:API_START + `
// class HttpError extends Error { ... }

const projects = [{ id: 1, title: "Лендинг" }];

app.get("/api/projects/:id", async (req, res) => {
  const p = projects.find(x => x.id === Number(req.params.id));
  if (!p) throw new HttpError(404, "Проект не найден");
  res.json(p);
});

app.get("/api/boom", () => {
  throw new Error("Пароль от базы: qwerty123");
});

// app.use((err, req, res, next) => { ... });

app.listen(3000);
`},
 hints:["class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }","Обработчик ошибок отличается от обычного middleware четырьмя аргументами: (err, req, res, next).","Отличить свою ошибку: err instanceof HttpError."],
 tests:[["Найденный проект","const r = await call('GET', '/api/projects/1'); ok(r.status === 200, 'Статус ' + r.status); return r.body.title === 'Лендинг'"],
        ["HttpError → 404 и сообщение","const r = await call('GET', '/api/projects/7'); ok(r.status === 404, 'Статус ' + r.status + ', ожидался 404'); return r.body && r.body.error === 'Проект не найден'"],
        ["Неожиданная ошибка → 500","const r = await call('GET', '/api/boom'); return r.status === 500"],
        ["Секреты не утекают клиенту","const r = await call('GET', '/api/boom'); const text = JSON.stringify(r.body || ''); ok(!/qwerty|Пароль/.test(text), 'В ответе видны детали ошибки'); return r.body && r.body.error === 'Внутренняя ошибка сервера'"]],
 sol:{js:API_START + `
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const projects = [{ id: 1, title: "Лендинг" }];

app.get("/api/projects/:id", async (req, res) => {
  const p = projects.find(x => x.id === Number(req.params.id));
  if (!p) throw new HttpError(404, "Проект не найден");
  res.json(p);
});

app.get("/api/boom", () => {
  throw new Error("Пароль от базы: qwerty123");
});

app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(3000);`}},

{id:"node-env",l:"node1",t:"Свой парсер .env",mode:"js",
 task:"Библиотека dotenv читает файл .env в объект. Напиши свою упрощённую версию <code>parseEnv(text)</code>:\n- каждая строка <code>КЛЮЧ=значение</code>\n- пустые строки и строки с <code>#</code> в начале пропускаются\n- пробелы вокруг ключа и значения убираются\n- значение в кавычках <code>\"…\"</code> или <code>'…'</code> — без кавычек\n- знак <code>=</code> внутри значения сохраняется: <code>URL=a=b</code> → <code>\"a=b\"</code>",
 files:{js:`function parseEnv(text) {

}

console.log(parseEnv(\`
# база
DATABASE_URL = "postgres://user:pass@host/db?sslmode=require"
PORT=3000
\`));
`},
 hints:["Разбей текст на строки: text.split(\"\\n\").","Делить строку нужно по первому «=»: const i = line.indexOf(\"=\").","Кавычки: если значение начинается и заканчивается одной и той же кавычкой — value.slice(1, -1)."],
 tests:[["Простые пары","const r = parseEnv('A=1\\nB=hello'); return r.A === '1' && r.B === 'hello'"],
        ["Комментарии и пустые строки","const r = parseEnv('# x\\n\\nA=1\\n   \\n#B=2'); return JSON.stringify(r) === '{\"A\":\"1\"}'"],
        ["Пробелы и кавычки","const r = parseEnv(' PORT = 3000 \\nNAME=\"Моя студия\"\\nX=\\'y\\''); return r.PORT === '3000' && r.NAME === 'Моя студия' && r.X === 'y'"],
        ["= внутри значения","const r = parseEnv('URL=postgres://u:p@h/db?sslmode=require&a=b'); return r.URL === 'postgres://u:p@h/db?sslmode=require&a=b'"]],
 sol:{js:`function parseEnv(text) {
  const out = {};
  for (const raw of text.split("\\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    const q = value[0];
    if ((q === '"' || q === "'") && value.endsWith(q) && value.length >= 2) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}`}},

/* ================= SQL ================= */
{id:"sql-done",l:"sql1",t:"Завершённые проекты",mode:"sql",schema:STUDIO_SQL,
 task:"Выведи <b>название</b> и <b>бюджет</b> всех завершённых проектов (status = 'done'), от самого дорогого к дешёвому.\n\nКолонки результата: <code>title</code>, <code>budget</code>.",
 files:{sql:`-- Схема базы — в блоке «Схема» ниже задания.
SELECT * FROM projects;
`},
 hints:["Фильтр: WHERE status = 'done'.","Сортировка по убыванию: ORDER BY budget DESC."],
 checks:[{n:"Результат совпадает (с порядком строк)", last:true, ordered:true}],
 sol:{sql:`SELECT title, budget
FROM projects
WHERE status = 'done'
ORDER BY budget DESC;`}},

{id:"sql-cities",l:"sql1",t:"Клиенты из двух городов",mode:"sql",schema:STUDIO_SQL,
 task:"Найди клиентов из Москвы и Казани. Отсортируй по городу, а внутри города — по названию.\n\nКолонки: <code>name</code>, <code>city</code>.",
 files:{sql:`SELECT name, city FROM clients;
`},
 hints:["Несколько значений: WHERE city IN ('Москва', 'Казань').","Сортировка по двум колонкам: ORDER BY city, name."],
 checks:[{n:"Результат совпадает (с порядком строк)", last:true, ordered:true}],
 sol:{sql:`SELECT name, city
FROM clients
WHERE city IN ('Москва', 'Казань')
ORDER BY city, name;`}},

{id:"sql-top",l:"sql1",t:"Три самых дорогих",mode:"sql",schema:STUDIO_SQL,
 task:"Выведи три самых дорогих проекта типа landing или site.\n\nКолонки: <code>title</code>, <code>type</code>, <code>budget</code>.",
 files:{sql:`
`},
 hints:["Тип — колонка type.","LIMIT 3 после ORDER BY."],
 checks:[{n:"Результат совпадает (с порядком строк)", last:true, ordered:true}],
 sol:{sql:`SELECT title, type, budget
FROM projects
WHERE type IN ('landing', 'site')
ORDER BY budget DESC
LIMIT 3;`}},

{id:"sql-join",l:"sql2",t:"Проекты с клиентами",mode:"sql",schema:STUDIO_SQL,
 task:"Покажи активные проекты (status = 'active') вместе с названием клиента. Сортировка: по клиенту, затем по названию проекта.\n\nКолонки: <code>client</code> (название клиента) и <code>title</code>.",
 files:{sql:`SELECT * FROM projects WHERE status = 'active';
`},
 hints:["JOIN clients ON clients.id = projects.client_id","Псевдонимы: SELECT c.name AS client, p.title FROM projects p JOIN clients c ON …"],
 checks:[{n:"Результат совпадает (с порядком строк)", last:true, ordered:true}],
 sol:{sql:`SELECT c.name AS client, p.title
FROM projects p
JOIN clients c ON c.id = p.client_id
WHERE p.status = 'active'
ORDER BY client, p.title;`}},

{id:"sql-group",l:"sql2",t:"Крупные клиенты",mode:"sql",schema:STUDIO_SQL,
 task:"Для каждого клиента посчитай количество проектов и сумму бюджетов. Оставь только тех, у кого сумма больше 100 000. Сортировка — по сумме, по убыванию.\n\nКолонки: <code>name</code>, <code>projects</code>, <code>total</code>.",
 files:{sql:`
`},
 hints:["Группировка: GROUP BY c.id, c.name.","COUNT(p.id) AS projects, SUM(p.budget) AS total.","Фильтр по сумме — HAVING, а не WHERE."],
 checks:[{n:"Результат совпадает (с порядком строк)", last:true, ordered:true}],
 sol:{sql:`SELECT c.name, COUNT(p.id) AS projects, SUM(p.budget) AS total
FROM clients c
JOIN projects p ON p.client_id = c.id
GROUP BY c.id, c.name
HAVING SUM(p.budget) > 100000
ORDER BY total DESC;`}},

{id:"sql-left",l:"sql2",t:"Клиенты без проектов",mode:"sql",schema:STUDIO_SQL,
 task:"Найди клиентов, у которых нет ни одного проекта. Это кандидаты на письмо «Чем помочь?».\n\nКолонка: <code>name</code>.",
 files:{sql:`
`},
 hints:["LEFT JOIN projects p ON p.client_id = c.id","У клиентов без проектов p.id будет NULL: WHERE p.id IS NULL."],
 checks:[{n:"Результат совпадает", last:true, ordered:false}],
 sol:{sql:`SELECT c.name
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id
WHERE p.id IS NULL;`}},

{id:"sql-debt",l:"sql2",t:"Кто нам должен",mode:"sql",schema:STUDIO_SQL,
 task:"Посчитай для каждого проекта, сколько по нему оплачено, и покажи только те, где оплачено меньше бюджета. Сортировка по названию.\n\nКолонки: <code>title</code>, <code>budget</code>, <code>paid</code>.",
 files:{sql:`
`},
 hints:["Соедини projects и payments по project_id.","SUM(pay.amount) AS paid и GROUP BY p.id.","HAVING paid < p.budget"],
 checks:[{n:"Результат совпадает (с порядком строк)", last:true, ordered:true}],
 sol:{sql:`SELECT p.title, p.budget, SUM(pay.amount) AS paid
FROM projects p
JOIN payments pay ON pay.project_id = p.id
GROUP BY p.id, p.title, p.budget
HAVING SUM(pay.amount) < p.budget
ORDER BY p.title;`}},

{id:"sql-create",l:"sql3",t:"Таблица задач",mode:"sql",schema:STUDIO_SQL,
 task:"Создай таблицу <code>tasks</code>:\n- <code>id INTEGER PRIMARY KEY</code>\n- <code>project_id INTEGER NOT NULL</code>, ссылка на <code>projects(id)</code>\n- <code>title TEXT NOT NULL</code>\n- <code>done INTEGER NOT NULL DEFAULT 0</code>\n\nЗатем добавь две задачи проекту 2: «Собрать каталог» и «Подключить оплату» (done не указывай — сработает значение по умолчанию).",
 files:{sql:`CREATE TABLE tasks (

);
`},
 hints:["Внешний ключ прямо в колонке: project_id INTEGER NOT NULL REFERENCES projects(id).","INSERT INTO tasks (project_id, title) VALUES (2, 'Собрать каталог'), (2, 'Подключить оплату');"],
 checks:[{n:"Колонки, типы и NOT NULL", q:"SELECT name, upper(type) AS type, \"notnull\", pk FROM pragma_table_info('tasks') ORDER BY cid", ordered:true},
         {n:"done по умолчанию 0", q:"SELECT dflt_value FROM pragma_table_info('tasks') WHERE name = 'done'", ordered:true},
         {n:"Внешний ключ на projects(id)", q:"SELECT \"table\", \"from\", \"to\" FROM pragma_foreign_key_list('tasks')", ordered:false},
         {n:"Две задачи проекта 2", q:"SELECT project_id, title, done FROM tasks ORDER BY title", ordered:true}],
 sol:{sql:`CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0
);

INSERT INTO tasks (project_id, title) VALUES
  (2, 'Собрать каталог'),
  (2, 'Подключить оплату');

SELECT * FROM tasks;`}},

{id:"sql-index",l:"sql3",t:"Индекс для частого поиска",mode:"sql",schema:STUDIO_SQL,
 task:"В приложении постоянно ищут проекты конкретного клиента: <code>WHERE client_id = ?</code>. Создай индекс по колонке <code>client_id</code> таблицы projects. Потом выполни <code>EXPLAIN QUERY PLAN</code> для такого запроса и посмотри, что база теперь использует индекс.",
 files:{sql:`EXPLAIN QUERY PLAN
SELECT * FROM projects WHERE client_id = 3;
`},
 hints:["CREATE INDEX idx_projects_client ON projects(client_id);","Индекс создают до запроса EXPLAIN."],
 checks:[{n:"Создан индекс по client_id", q:"SELECT ii.name AS col FROM pragma_index_list('projects') il JOIN pragma_index_info(il.name) ii WHERE il.origin = 'c'", ordered:false}],
 sol:{sql:`CREATE INDEX idx_projects_client ON projects(client_id);

EXPLAIN QUERY PLAN
SELECT * FROM projects WHERE client_id = 3;`}},

{id:"sql-tx",l:"pg-node",t:"Закрыть проект в транзакции",mode:"sql",schema:STUDIO_SQL,
 task:"Клиент доплатил 40 000 за проект 3. Одной транзакцией:\n- поставь проекту 3 статус <code>'done'</code>\n- добавь платёж 40 000 по проекту 3 с датой <code>'2026-10-24'</code>\n\nИспользуй <code>BEGIN</code> и <code>COMMIT</code>. Другие проекты не трогай.",
 files:{sql:`-- BEGIN;
-- ...
-- COMMIT;
`},
 hints:["UPDATE projects SET status = 'done' WHERE id = 3;","INSERT INTO payments (project_id, amount, paid_at) VALUES (3, 40000, '2026-10-24');","Без WHERE UPDATE изменит все строки таблицы."],
 checks:[{n:"Есть BEGIN и COMMIT", re:"\\bBEGIN\\b[\\s\\S]*\\bCOMMIT\\b", flags:"i"},
         {n:"Проект 3 завершён", q:"SELECT status FROM projects WHERE id = 3", ordered:true},
         {n:"Платёж добавлен", q:"SELECT count(*) AS n, sum(amount) AS total FROM payments WHERE project_id = 3", ordered:true},
         {n:"Остальные проекты не тронуты", q:"SELECT id, status FROM projects ORDER BY id", ordered:true}],
 sol:{sql:`BEGIN;

UPDATE projects SET status = 'done' WHERE id = 3;

INSERT INTO payments (project_id, amount, paid_at)
VALUES (3, 40000, '2026-10-24');

COMMIT;

SELECT * FROM payments WHERE project_id = 3;`}}
);
EX.forEach(e => { if(e.mode === "sql" && !e.tests) e.tests = e.checks.map(c => [c.n, ""]); });
