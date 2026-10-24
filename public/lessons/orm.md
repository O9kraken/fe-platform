@@ 0

### На пальцах
Писать SQL руками — готовить по старинке, самому отмеряя каждый ингредиент. ORM — кухонный комбайн: нажал кнопку «найти проекты клиента» — получил результат, а комбайн сам составил правильный SQL. Быстро и удобно для типовых блюд, но для сложного соуса шеф всё равно берёт венчик в руки.

### Как это работает
| Подход | Что это | Примеры |
|---|---|---|
| Сырой SQL | пишешь запросы текстом | `pg` |
| Query builder | строишь SQL цепочкой методов, близко к SQL | Knex, Kysely, Drizzle |
| ORM | работаешь с моделями и объектами, SQL генерируется | Prisma, TypeORM, Sequelize |

Плюсы ORM и построителей:

- типизация: TypeScript знает поля таблиц, опечатка в названии колонки — ошибка ещё в редакторе;
- безопасность: значения всегда передаются параметрами;
- миграции и описание схемы в одном месте;
- меньше однотипного кода для CRUD.

Минусы:

- сложные запросы (отчёты, оконные функции) выражаются неудобно или неэффективно;
- легко не заметить, сколько запросов на самом деле уходит в базу (проблема N+1);
- ещё один инструмент со своими правилами;
- без знания SQL трудно понять, почему что-то медленно.

Вывод: SQL знать нужно в любом случае. ORM — удобный инструмент поверх этих знаний.

### Пример
Одна и та же задача тремя способами — проекты клиента с бюджетом больше 50 000:

```js
// сырой SQL
await pool.query("SELECT * FROM projects WHERE client_id = $1 AND budget > $2", [clientId, 50000]);

// Drizzle (query builder)
await db.select().from(projects).where(and(eq(projects.clientId, clientId), gt(projects.budget, 50000)));

// Prisma (ORM)
await prisma.project.findMany({ where: { clientId, budget: { gt: 50000 } } });
```

### Частые ошибки
- Учить ORM вместо SQL.
- Переписывать на ORM сложный отчёт, который отлично работал как SQL.
- Не смотреть, какие запросы генерирует ORM (у Prisma и Drizzle есть логирование запросов).

### Мини-задание
Возьми три запроса из своего проекта (простой, с JOIN и с группировкой) и запиши, как они выглядели бы в Prisma и Drizzle по документации. Отметь, какой вариант читается проще всего.

@@ 1

### На пальцах
Prisma — архитектор с чертежом. Ты описываешь в одном файле, какие есть комнаты и как они связаны (схема). Prisma по чертежу строит дом (миграции в базе) и выдаёт тебе пульт управления (клиент), на котором кнопки называются точно как твои комнаты, и TypeScript подсказывает каждую.

### Как это работает
1. `npm install prisma --save-dev` и `npm install @prisma/client`.
2. `npx prisma init` — создаст `prisma/schema.prisma` и `.env` с `DATABASE_URL`.
3. Описываешь модели в `schema.prisma`.
4. `npx prisma migrate dev --name init` — создаёт файл миграции SQL, применяет его к базе и генерирует клиент.
5. В коде: `const prisma = new PrismaClient()` и запросы вида `prisma.project.findMany(...)`.

Основные методы клиента:

| Метод | Что делает |
|---|---|
| `findMany({ where, orderBy, take, skip })` | список |
| `findUnique({ where: { id } })` | по уникальному полю |
| `create({ data })` | создать |
| `update({ where, data })` | изменить |
| `delete({ where })` | удалить |
| `count({ where })` | количество |

Prisma Studio (`npx prisma studio`) — удобная программа для просмотра и правки данных в браузере.

### Пример
```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model Client {
  id        Int       @id @default(autoincrement())
  name      String
  email     String?   @unique
  projects  Project[]
  createdAt DateTime  @default(now())
}

model Project {
  id       Int     @id @default(autoincrement())
  title    String
  budget   Int?
  status   String  @default("new")
  client   Client  @relation(fields: [clientId], references: [id])
  clientId Int

  @@index([clientId])
}
```

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const client = await prisma.client.create({ data: { name: "Кофейня «Зерно»" } });
await prisma.project.create({ data: { title: "Лендинг", budget: 45000, clientId: client.id } });

const active = await prisma.project.findMany({
  where: { status: "active", budget: { gte: 50000 } },
  orderBy: { budget: "desc" },
  take: 10,
});
```

### Частые ошибки
- Создавать `new PrismaClient()` в каждом модуле или запросе — лишние соединения. Один экземпляр на приложение.
- Менять базу руками в обход миграций — схема и база расходятся.
- Забыть `npx prisma generate` после изменения схемы — клиент не знает о новых полях.

### Мини-задание
Подключи Prisma к своему проекту, опиши модели клиентов и проектов, выполни миграцию и перепиши два маршрута API на клиент Prisma. Открой Prisma Studio и посмотри данные.

@@ 2

### На пальцах
`include` — «принеси клиента и заодно все его проекты». `select` — «принеси только имя клиента и названия проектов, остальное не нужно». Первое удобно, второе экономно: меньше данных идёт из базы и в ответе API.

### Как это работает
- **include** — подгрузить связанные модели целиком: `include: { projects: true }`.
- **select** — выбрать конкретные поля, в том числе у связанных моделей. `select` и `include` на одном уровне вместе не используют.
- Внутри связи тоже можно фильтровать, сортировать и ограничивать: `include: { projects: { where: { status: "active" }, take: 5 } }`.
- `_count` — посчитать связанные записи без их загрузки.
- Создание вместе со связанными записями — вложенный `create`.
- Фильтр по связям: `where: { projects: { some: { status: "active" } } }` — клиенты, у которых есть хоть один активный проект.

Prisma сама соединяет таблицы, но выбирать поля — твоя задача. Не отдавай клиенту API лишнего (например, хеши паролей у пользователей) — используй `select`.

### Пример
```ts
// клиент со всеми проектами
const withProjects = await prisma.client.findUnique({
  where: { id: 1 },
  include: { projects: { orderBy: { budget: "desc" } } },
});

// только нужные поля + количество проектов
const list = await prisma.client.findMany({
  select: {
    id: true,
    name: true,
    _count: { select: { projects: true } },
    projects: { where: { status: "active" }, select: { title: true } },
  },
});
// [{ id: 1, name: "Кофейня «Зерно»", _count: { projects: 2 }, projects: [{ title: "Магазин" }] }]

// клиенты, у которых есть активные проекты
const busy = await prisma.client.findMany({
  where: { projects: { some: { status: "active" } } },
});

// создать клиента вместе с проектами
await prisma.client.create({
  data: {
    name: "Пекарня «Колос»",
    projects: { create: [{ title: "Лендинг", budget: 40000 }, { title: "SEO" }] },
  },
});
```

### Частые ошибки
- `include` всего подряд — огромные ответы и медленные запросы.
- Отдавать пользователя с `passwordHash` в API, потому что не указали `select`.
- Подгружать связанные данные в цикле вместо `include` (проблема N+1 — следующий пункт).

### Мини-задание
Сделай маршрут списка клиентов, который возвращает id, имя, количество проектов и сумму бюджетов только активных проектов. Сравни объём ответа с вариантом через `include: { projects: true }`.

@@ 3

### На пальцах
Prisma — полноценный архитектурный пакет со своим чертёжным языком и генерацией. Drizzle — лёгкий набор инструментов: схема пишется обычным TypeScript, запросы очень похожи на сам SQL, а сам пакет маленький и быстро работает даже в serverless и edge-окружениях.

### Как это работает
- `npm install drizzle-orm pg` и `npm install -D drizzle-kit`.
- Схема таблиц — обычный TypeScript-файл с функциями `pgTable`, `serial`, `text`, `integer`.
- Запросы — цепочкой, повторяющей SQL: `db.select().from(projects).where(eq(projects.status, "active"))`.
- Есть и «реляционный» API, похожий на Prisma: `db.query.clients.findMany({ with: { projects: true } })`.
- Миграции: `npx drizzle-kit generate` создаёт SQL-файлы из изменений схемы, `npx drizzle-kit migrate` — применяет.
- Типы выводятся прямо из схемы, генерация клиента не нужна.

Когда что выбирать:

- **Prisma** — большой удобный «всё в одном», отличная документация, Studio, много примеров.
- **Drizzle** — ближе к SQL, легче, без отдельного шага генерации, хорошо подходит тем, кто знает SQL и хочет типизацию.

### Пример
```ts
// src/schema.ts
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  title: text("title").notNull(),
  budget: integer("budget"),
  status: text("status").notNull().default("new"),
});
```

```ts
// src/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, gt, and, desc, sql } from "drizzle-orm";
import { clients, projects } from "./schema";

export const db = drizzle(process.env.DATABASE_URL!);

const rich = await db
  .select({ title: projects.title, client: clients.name, budget: projects.budget })
  .from(projects)
  .innerJoin(clients, eq(clients.id, projects.clientId))
  .where(and(eq(projects.status, "active"), gt(projects.budget, 50000)))
  .orderBy(desc(projects.budget));

const [created] = await db.insert(projects).values({ clientId: 1, title: "Лендинг" }).returning();

const byStatus = await db
  .select({ status: projects.status, count: sql<number>`count(*)` })
  .from(projects)
  .groupBy(projects.status);
```

### Частые ошибки
- Забыть сгенерировать и применить миграции после изменения схемы.
- Путать имя поля в TypeScript (`clientId`) и имя колонки в базе (`client_id`).
- Смешивать в проекте Prisma и Drizzle.

### Мини-задание
Опиши в Drizzle схему клиентов и проектов, сгенерируй миграцию и напиши запрос «проекты с именем клиента, отсортированные по бюджету». Сравни код с тем же запросом в Prisma.

@@ 4

### На пальцах
Ты пришёл в магазин за продуктами по списку из 50 пунктов. Можно 50 раз сходить в магазин за одним продуктом (N+1), а можно один раз взять корзину и купить всё сразу. Проблема N+1 — когда программа незаметно для тебя ходит в базу «за каждым продуктом отдельно».

### Как это работает
Классический пример:

1. Один запрос: получить 50 проектов.
2. Потом в цикле для каждого проекта запрос: получить его клиента.

Итого 1 + 50 = 51 запрос вместо одного-двух. На маленьких данных незаметно, на реальных — страница грузится секунды, а база перегружена.

Почему возникает: ORM делает доступ к связанным данным очень простым, и цикл с запросом внутри выглядит безобидно. Также бывает в GraphQL и при «ленивой загрузке» связей.

Как найти: включить логирование запросов (`log: ["query"]` в Prisma) и посмотреть, сколько запросов уходит на одну страницу.

Как исправить:

- `JOIN` в SQL или `include` / `with` в ORM — один запрос;
- собрать все id и сделать один запрос `WHERE id IN (...)` / `id = ANY($1)`, потом сопоставить в коде;
- для GraphQL — DataLoader, который собирает запросы в пачку.

### Пример
```ts
// ❌ N+1: 1 запрос за проектами + по запросу на каждого клиента
const list = await prisma.project.findMany();
for (const p of list) {
  const client = await prisma.client.findUnique({ where: { id: p.clientId } });
  console.log(p.title, client?.name);
}

// ✅ один запрос с JOIN
const list2 = await prisma.project.findMany({ include: { client: { select: { name: true } } } });
list2.forEach(p => console.log(p.title, p.client.name));
```

```js
// ✅ с сырым SQL: два запроса вместо N+1
const { rows: projects } = await q("SELECT * FROM projects LIMIT 50");
const ids = [...new Set(projects.map(p => p.client_id))];
const { rows: clients } = await q("SELECT id, name FROM clients WHERE id = ANY($1)", [ids]);
const byId = new Map(clients.map(c => [c.id, c]));
const result = projects.map(p => ({ ...p, client: byId.get(p.client_id) }));
```

### Частые ошибки
- `await` запроса к базе внутри `for` или `map`.
- Не смотреть логи запросов при разработке.
- Исправлять N+1 кешем вместо правильного запроса.

### Мини-задание
Включи логирование запросов в своём ORM или добавь `console.log` в функцию `q`. Найди место, где выполняется больше одного запроса на элемент списка, и перепиши на `include` или `ANY($1)`. Посчитай запросы до и после.

@@ 5

### На пальцах
ORM — удобный автомобиль с автоматической коробкой для ежедневных поездок. Но если нужно проехать по сложной горной дороге (хитрый отчёт), иногда проще пересесть на «механику» — написать SQL руками. Хорошие ORM не запрещают это, а дают удобный люк для ручного управления.

### Как это работает
Когда стоит писать SQL самому:

- отчёты и аналитика: группировки, оконные функции (`ROW_NUMBER`, `SUM() OVER`), сложные CTE;
- массовые обновления: «поднять цены всех товаров категории на 10%» — один `UPDATE` вместо загрузки тысяч объектов;
- возможности конкретной базы: полнотекстовый поиск PostgreSQL, `jsonb`-операторы, `ON CONFLICT DO UPDATE` (upsert), рекурсивные запросы;
- когда запрос ORM получается медленным, и `EXPLAIN` показывает, что SQL можно написать лучше.

Как делать это безопасно:

- Prisma: `prisma.$queryRaw` с шаблонной строкой — значения в `${}` автоматически становятся параметрами. `$queryRawUnsafe` — без защиты, избегай.
- Drizzle: тег `sql` с теми же правилами.
- pg: обычные параметры `$1`.

Типы результата сырого запроса нужно указать самому.

### Пример
```ts
// Prisma: отчёт по месяцам — проще и быстрее на SQL
type Row = { month: Date; total: bigint };
const report = await prisma.$queryRaw<Row[]>`
  SELECT date_trunc('month', paid_at) AS month, SUM(amount) AS total
  FROM payments
  WHERE paid_at >= ${new Date("2026-01-01")}
  GROUP BY 1
  ORDER BY 1
`;   // значение в ${} передаётся параметром — инъекции нет

// массовое обновление одним запросом
await prisma.$executeRaw`UPDATE products SET price = price * 1.1 WHERE category_id = ${categoryId}`;

// upsert средствами PostgreSQL
await pool.query(
  `INSERT INTO daily_stats (day, visits) VALUES ($1, 1)
   ON CONFLICT (day) DO UPDATE SET visits = daily_stats.visits + 1`,
  [new Date().toISOString().slice(0, 10)]
);
```

### Частые ошибки
- `$queryRawUnsafe` со строкой, склеенной из пользовательского ввода.
- Загружать 10 000 объектов, менять в цикле и сохранять по одному вместо одного `UPDATE`.
- Тащить в ORM то, что он делает плохо, только ради «единообразия».

### Мини-задание
Напиши через сырой SQL (в своём ORM или через `pg`) отчёт: выручка по месяцам и по типам проектов за год. Убедись, что все значения передаются параметрами.
