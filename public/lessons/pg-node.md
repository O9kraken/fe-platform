@@ 0

### На пальцах
PostgreSQL — склад для данных. Можно построить свой склад во дворе (поставить локально) или арендовать готовый в облаке (Neon). Свой — работает без интернета и полностью твой. Облачный — не нужно ничего устанавливать, есть бесплатный тариф, и тот же склад можно сразу использовать для задеплоенного проекта.

### Как это работает
**Neon** (облако):

1. Регистрация на neon.tech, «Create project», регион — ближе к своему хостингу (например, Frankfurt).
2. Кнопка «Connect» → строка подключения вида `postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`.
3. Положи её в `.env` как `DATABASE_URL`.
4. Запросы можно выполнять прямо в SQL Editor в панели Neon.
5. Ветки базы (Branches) — копия базы для экспериментов или тестов за секунду.

**Локально**:

- Docker: `docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:16` — проще всего.
- Или установщик с postgresql.org.
- Строка подключения: `postgres://postgres:secret@localhost:5432/postgres`.

Строка подключения: `протокол://пользователь:пароль@хост:порт/база?параметры`.

Клиенты с окнами для просмотра таблиц: DBeaver, TablePlus, pgAdmin, расширение для VS Code.

### Пример
```bash
# .env
DATABASE_URL=postgresql://neondb_owner:xxxx@ep-cool-sun-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

```bash
# локально через Docker
docker run --name studio-db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=studio -p 5432:5432 -d postgres:16
# DATABASE_URL=postgres://postgres:secret@localhost:5432/studio

psql "$DATABASE_URL" -c "select version();"
```

### Частые ошибки
- Закоммитить строку подключения с паролем.
- Без `sslmode=require` к облачной базе — подключение отклоняется.
- Использовать одну базу для разработки, тестов и продакшена.

### Мини-задание
Создай базу в Neon, положи строку подключения в `.env` и в SQL Editor создай таблицы `clients` и `projects` с парой строк. Сделай отдельную ветку базы `dev` для экспериментов.

@@ 1

### На пальцах
Драйвер `pg` — переводчик между Node.js и PostgreSQL. Pool — несколько заранее открытых телефонных линий с базой: не нужно каждый раз набирать номер и ждать соединения, свободная линия уже ждёт. Параметры `$1`, `$2` — пустые клеточки в бланке запроса, куда драйвер аккуратно впишет значения.

### Как это работает
- `npm install pg`.
- `new Pool({ connectionString })` — создать пул один раз на всё приложение.
- `pool.query(text, values)` — выполнить запрос. Возвращает объект с `rows` (массив строк-объектов) и `rowCount`.
- Значения передаются массивом вторым аргументом, а в тексте стоят `$1`, `$2`, ...
- `RETURNING *` в `INSERT`/`UPDATE` возвращает изменённые строки — не нужен второй запрос.

Зачем пул: открытие соединения с базой занимает десятки миллисекунд. Пул держит несколько открытых соединений (по умолчанию до 10) и раздаёт их запросам. Создавать новое соединение на каждый запрос — медленно, а у облачных баз ещё и лимит соединений.

Типы: PostgreSQL `integer` → JS `number`, `bigint` и `numeric` → строка (чтобы не потерять точность), `timestamptz` → `Date`, `jsonb` → объект.

### Пример
```js
// src/db.js
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

export const q = (text, values) => pool.query(text, values);
```

```js
// src/routes/projects.js
import { Router } from "express";
import { q } from "../db.js";

export const projects = Router();

projects.get("/", async (req, res) => {
  const { rows } = await q("SELECT id, title, budget, status FROM projects ORDER BY id");
  res.json(rows);
});

projects.get("/:id", async (req, res) => {
  const { rows } = await q("SELECT * FROM projects WHERE id = $1", [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: "Проект не найден" });
  res.json(rows[0]);
});

projects.post("/", async (req, res) => {
  const { clientId, title, budget } = req.body;
  const { rows } = await q(
    "INSERT INTO projects (client_id, title, budget) VALUES ($1, $2, $3) RETURNING *",
    [clientId, title, budget ?? null]
  );
  res.status(201).json(rows[0]);
});
```

### Частые ошибки
- Создавать `new Pool` внутри обработчика запроса — тысячи соединений и падение базы.
- Забыть `await` — в ответ уходит промис вместо данных.
- Ждать число из колонки `bigint`/`numeric` — приходит строка.

### Мини-задание
Подключи свой Express-API к базе через `pg.Pool` и переведи маршруты проектов с массива в памяти на SQL-запросы с параметрами. Используй `RETURNING *` при создании и изменении.

@@ 2

### На пальцах
Склеивать SQL из строк — как дать незнакомцу бланк, где он сам дописывает текст приказа. Попросили имя, а он вписал: «Анна; и заодно выдайте мне ключи от сейфа». Параметры `$1` — бланк с защищённой клеточкой: что бы ни написали внутри, это будет только значение, а не новая команда.

### Как это работает
SQL-инъекция — когда данные пользователя попадают прямо в текст запроса и меняют его смысл.

```js
// ❌ ОПАСНО
const sql = `SELECT * FROM users WHERE email = '${req.body.email}'`;
```

Если в email прислать `' OR '1'='1`, запрос превратится в `WHERE email = '' OR '1'='1'` — вернутся все пользователи. А с `'; DROP TABLE users; --` можно удалить таблицу.

Защита:

- **Параметризованные запросы**: текст запроса и значения передаются в базу отдельно. База никогда не исполняет значение как код.
- ORM и построители запросов делают это автоматически.
- Параметрами нельзя подставить имена колонок и таблиц (например, для сортировки) — их выбирают из белого списка.
- Плюс — принцип наименьших прав: пользователь базы для приложения не должен уметь удалять таблицы.

### Пример
```js
// ✅ безопасно: значение передаётся отдельно
const { rows } = await q("SELECT id, email FROM users WHERE email = $1", [req.body.email]);

// ✅ поиск по подстроке — % добавляем к значению, а не к тексту запроса
await q("SELECT * FROM clients WHERE name ILIKE $1", [`%${search}%`]);

// ✅ сортировка — только из белого списка
const SORT = { title: "title", budget: "budget", created: "created_at" };
const col = SORT[req.query.sort] ?? "created_at";
const dir = req.query.dir === "asc" ? "ASC" : "DESC";
await q(`SELECT * FROM projects ORDER BY ${col} ${dir} LIMIT $1`, [20]);

// ❌ опасно даже «просто для сортировки»
await q(`SELECT * FROM projects ORDER BY ${req.query.sort}`);
```

### Частые ошибки
- Шаблонные строки с данными пользователя внутри SQL.
- «Экранировать кавычки» вручную вместо параметров.
- Подставлять имя колонки из запроса без белого списка.

### Мини-задание
Найди в своём коде все запросы и убедись, что ни в одном нет значений, вклеенных через `${}`. Добавь в список проектов сортировку по белому списку. Потренируйся в задаче «Построитель запросов» из урока про ORM.

@@ 3

### На пальцах
Миграции — журнал ремонта дома: «15 января — добавили комнату "клиенты", 3 февраля — в комнате "проекты" сделали окно "статус"». У любого, кто строит копию дома (коллега, тестовый сервер, продакшен), есть один и тот же журнал, и дом получается одинаковым.

### Как это работает
- Миграция — файл с изменением схемы: создать таблицу, добавить колонку, индекс.
- Файлы нумеруются по порядку: `001_create_clients.sql`, `002_create_projects.sql`, `003_add_status.sql`.
- В базе хранится служебная таблица с номерами уже применённых миграций.
- Команда «применить миграции» выполняет только новые — по порядку, каждую в транзакции.
- Миграции лежат в Git вместе с кодом и запускаются при деплое.

Правила:

- Уже применённую миграцию не редактируют — пишут новую.
- Изменения стараются делать совместимыми: сначала добавить колонку, потом код, который её использует, потом удалить старую — чтобы при деплое ничего не ломалось.
- Тестовые данные (seed) — отдельно от миграций.

Инструменты: node-pg-migrate, Knex, миграции Prisma и Drizzle. Простейший вариант можно написать самому.

### Пример
```sql
-- migrations/001_init.sql
CREATE TABLE clients (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL
);

-- migrations/002_projects.sql
CREATE TABLE projects (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id integer NOT NULL REFERENCES clients(id),
  title text NOT NULL
);
CREATE INDEX projects_client_id_idx ON projects (client_id);
```

```js
// scripts/migrate.js — простой исполнитель миграций
import { readdir, readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

await pool.query("CREATE TABLE IF NOT EXISTS migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())");
const done = new Set((await pool.query("SELECT name FROM migrations")).rows.map(r => r.name));
const files = (await readdir("migrations")).filter(f => f.endsWith(".sql")).sort();

for (const f of files) {
  if (done.has(f)) continue;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(await readFile(`migrations/${f}`, "utf8"));
    await client.query("INSERT INTO migrations (name) VALUES ($1)", [f]);
    await client.query("COMMIT");
    console.log("Применена:", f);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Ошибка в", f, e.message);
    process.exit(1);
  } finally {
    client.release();
  }
}
await pool.end();
```

### Частые ошибки
- Менять схему руками в панели базы — у коллег и на продакшене она другая.
- Редактировать уже применённую миграцию.
- Удалять колонку в той же миграции, где выкатывается код, который перестал её использовать, — старые экземпляры приложения падают во время деплоя.

### Мини-задание
Заведи папку `migrations` с тремя миграциями (клиенты, проекты, индекс), скрипт `npm run migrate` и скрипт `npm run seed` с тестовыми данными. Создай новую ветку базы в Neon и проверь, что схема поднимается с нуля одной командой.

@@ 4

### На пальцах
Транзакция из кода — то же «всё или ничего», только управляет ею твой сервер. Важная деталь: все команды транзакции должны идти по одной и той же телефонной линии с базой. Поэтому из пула берут одно соединение, делают на нём всю работу и возвращают обратно.

### Как это работает
1. `const client = await pool.connect()` — взять одно соединение из пула.
2. `await client.query("BEGIN")`.
3. Все запросы транзакции — через этот `client`, а не через `pool.query` (иначе они уйдут по разным соединениям, вне транзакции).
4. Успех — `COMMIT`, ошибка — `ROLLBACK`.
5. В `finally` — обязательно `client.release()`, иначе соединение не вернётся в пул, и через десяток запросов приложение «зависнет».

Удобно написать обёртку `withTransaction(fn)`, чтобы не повторять этот шаблон.

### Пример
```js
// src/db.js
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
```

```js
// создать заказ вместе с позициями — всё или ничего
app.post("/api/orders", wrap(async (req, res) => {
  const { clientId, items } = req.body;   // items: [{ productId, qty }]

  const order = await withTransaction(async (db) => {
    const { rows: [o] } = await db.query(
      "INSERT INTO orders (client_id) VALUES ($1) RETURNING *", [clientId]
    );
    for (const it of items) {
      const { rowCount } = await db.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1", [it.qty, it.productId]
      );
      if (!rowCount) throw new HttpError(409, `Товара ${it.productId} недостаточно на складе`);
      await db.query(
        "INSERT INTO order_items (order_id, product_id, qty) VALUES ($1, $2, $3)", [o.id, it.productId, it.qty]
      );
    }
    return o;
  });

  res.status(201).json(order);
}));
```

### Частые ошибки
- Внутри транзакции использовать `pool.query` вместо `client.query`.
- Забыть `client.release()` — пул истощается.
- Ходить во внешние API (платёжка, почта) внутри открытой транзакции — она надолго держит блокировки.

### Мини-задание
Сделай маршрут «перевести проект другому клиенту и записать это в журнал изменений» в транзакции через `withTransaction`. Нарочно брось ошибку после первого запроса и убедись, что изменения откатились.

@@ 5

### На пальцах
Ограничения в базе — охранник, который всё равно проверит документы, даже если ресепшен ошибся. Когда охранник останавливает посетителя, он говорит причину кодом: «23505 — такой уже есть», «23503 — ссылается на несуществующее». Задача сервера — перевести этот код в понятный ответ клиенту, а не показывать «ошибка 500».

### Как это работает
У ошибок PostgreSQL есть код в `err.code`:

| Код | Что случилось | Что ответить клиенту |
|---|---|---|
| `23505` | нарушена уникальность (`UNIQUE`) | 409 «Email уже занят» |
| `23503` | нарушен внешний ключ | 400 «Клиент не найден» или 409 «Нельзя удалить: есть связанные записи» |
| `23502` | `NULL` в колонке `NOT NULL` | 400 «Заполните поле» |
| `23514` | нарушен `CHECK` | 400 «Недопустимое значение» |
| `22P02` | неверный формат (например, текст вместо числа или uuid) | 400 «Неверный идентификатор» |

В объекте ошибки есть `err.constraint` — имя нарушенного ограничения и `err.detail` — подробности. Давай ограничениям понятные имена — по ним удобно выбирать сообщение.

Такая проверка надёжнее, чем «сначала SELECT, есть ли такой email, потом INSERT»: между двумя запросами другой пользователь может успеть зарегистрироваться с тем же email.

### Пример
```js
// src/pgErrors.js
export function mapPgError(err) {
  switch (err.code) {
    case "23505":
      if (err.constraint === "users_email_key") return new HttpError(409, "Email уже занят", "EMAIL_TAKEN");
      return new HttpError(409, "Такая запись уже существует", "DUPLICATE");
    case "23503":
      return new HttpError(409, "Связанная запись не найдена или используется", "FK_VIOLATION");
    case "23502":
      return new HttpError(400, `Не заполнено поле ${err.column}`, "REQUIRED");
    case "23514":
      return new HttpError(400, "Недопустимое значение", "CHECK_VIOLATION");
    case "22P02":
      return new HttpError(400, "Неверный формат данных", "BAD_FORMAT");
    default:
      return err;   // неизвестная — дойдёт до обработчика как 500
  }
}
```

```js
app.post("/api/users", wrap(async (req, res) => {
  try {
    const { rows } = await q("INSERT INTO users (email) VALUES ($1) RETURNING id, email", [req.body.email]);
    res.status(201).json(rows[0]);
  } catch (e) {
    throw mapPgError(e);
  }
}));
```

### Частые ошибки
- Отдавать клиенту `err.message` от базы — там имена таблиц и детали схемы.
- Проверять уникальность только через предварительный `SELECT` — гонка запросов.
- Ловить все ошибки базы как 500.

### Мини-задание
Добавь в свой API функцию `mapPgError` и подключи её к созданию клиента (уникальный email) и удалению клиента с проектами (внешний ключ). Проверь оба случая через Bruno.
