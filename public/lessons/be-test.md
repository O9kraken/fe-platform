@@ 0

### На пальцах
Unit-тест бэкенда — проверить на стенде одну деталь: функцию расчёта скидки, проверку прав, разбор даты. Интеграционный тест — завести машину целиком и прокатиться по двору: отправить настоящий HTTP-запрос и убедиться, что маршрут, проверка, база и ответ работают вместе.

### Как это работает
| | Unit | Интеграционный |
|---|---|---|
| Что проверяет | одну функцию без базы и сети | маршрут целиком: запрос → middleware → база → ответ |
| Скорость | миллисекунды | десятки миллисекунд |
| Зависимости | заменяются заглушками или не нужны | настоящая тестовая база |
| Пример | `calcDebt(budget, payments)` | `POST /api/projects` возвращает 201 и запись появилась в базе |

Для бэкенда интеграционные тесты особенно ценны: большинство ошибок — на стыках (не тот статус, забыли проверку прав, неправильный SQL).

Что стоит покрыть:

- unit: бизнес-правила, расчёты, валидация, преобразование данных;
- интеграционные: каждый маршрут — успешный случай и основные ошибки (400, 401, 403, 404).

Чтобы тестировать удобно, держи бизнес-логику в отдельных функциях (сервисах), а Express-приложение экспортируй отдельно от `listen`.

### Пример
```js
// src/services/debt.js — чистая функция, легко покрыть unit-тестом
export function calcDebt(budget, payments) {
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  return Math.max(0, (budget ?? 0) - paid);
}
```

```js
// src/services/debt.test.js — unit
import { it, expect } from "vitest";
import { calcDebt } from "./debt.js";

it("долг — бюджет минус оплаты", () => {
  expect(calcDebt(100000, [{ amount: 30000 }, { amount: 20000 }])).toBe(50000);
});
it("переплата не даёт отрицательный долг", () => {
  expect(calcDebt(10000, [{ amount: 15000 }])).toBe(0);
});
```

```js
// tests/projects.test.js — интеграционный (подробнее в пункте про Supertest)
it("POST /api/projects создаёт проект", async () => {
  const res = await request(app).post("/api/projects").send({ title: "Лендинг", clientId: 1 });
  expect(res.status).toBe(201);
});
```

### Частые ошибки
- Только unit-тесты с моками всего подряд — «всё зелёное», а маршрут не работает.
- Бизнес-логика прямо в обработчиках Express — её неудобно тестировать отдельно.
- Тесты, зависящие друг от друга и от порядка запуска.

### Мини-задание
Вынеси из своего API две функции с логикой в отдельные модули и покрой их unit-тестами. Составь список маршрутов и для каждого — какие интеграционные тесты нужны. Потренируйся в задаче «Тесты, которые ловят баги».

@@ 1

### На пальцах
Vitest — судья на соревнованиях: ты заранее пишешь, какой результат считается правильным, а он прогоняет все попытки и показывает, кто справился. `describe` — вид соревнований, `it` — одна попытка, `expect` — судейское решение.

### Как это работает
- `npm install -D vitest`, в `package.json`: `"test": "vitest"`.
- Тестовые файлы: `*.test.js` или в папке `tests/`.
- `npx vitest run` — один прогон (для CI), `npx vitest` — режим наблюдения.

Структура:

```js
describe("группа", () => {
  beforeAll(async () => { /* один раз перед всеми */ });
  beforeEach(async () => { /* перед каждым тестом */ });
  it("ведёт себя так-то", async () => { expect(...).toBe(...); });
  afterAll(async () => { /* закрыть соединения */ });
});
```

Полезные проверки для бэкенда:

| Проверка | Пример |
|---|---|
| `toBe` | `expect(res.status).toBe(201)` |
| `toEqual` | `expect(body).toEqual({ id: 1, title: "Лендинг" })` |
| `toMatchObject` | частичное совпадение: важные поля есть, остальные не важны |
| `toHaveLength` | `expect(list).toHaveLength(3)` |
| `rejects.toThrow` | `await expect(fn()).rejects.toThrow("не найден")` |
| `expect.any(Number)` | поле есть и это число, значение не важно |

Заглушки: `vi.fn()` — функция-шпион (была ли вызвана и с чем), `vi.mock("модуль")` — подменить модуль, например отправку писем.

### Пример
```js
import { describe, it, expect, vi } from "vitest";
import { createProject } from "../src/services/projects.js";

describe("createProject", () => {
  it("создаёт проект и уведомляет менеджера", async () => {
    const repo = { insert: vi.fn().mockResolvedValue({ id: 7, title: "Лендинг" }) };
    const notify = vi.fn();

    const p = await createProject({ title: " Лендинг ", clientId: 1 }, { repo, notify });

    expect(p).toMatchObject({ id: expect.any(Number), title: "Лендинг" });
    expect(repo.insert).toHaveBeenCalledWith({ title: "Лендинг", clientId: 1 });
    expect(notify).toHaveBeenCalledOnce();
  });

  it("не принимает пустое название", async () => {
    await expect(createProject({ title: "  " }, {})).rejects.toThrow("Укажите название");
  });
});
```

### Частые ошибки
- Забыть `await` в асинхронном тесте — он «проходит», даже если проверка упала позже.
- `toEqual` на объекте с датой создания или случайным id — используй `toMatchObject` и `expect.any`.
- Мокать то, что проще проверить по-настоящему (например, базу в интеграционных тестах).

### Мини-задание
Напиши тесты для сервиса создания пользователя: успешное создание (хеш пароля не равен паролю), короткий пароль (ошибка), занятый email (ошибка от репозитория). Используй `vi.fn()` для репозитория.

@@ 2

### На пальцах
Supertest — тестовый курьер, который отправляет запросы прямо внутрь твоего приложения, минуя сеть и порт. Не нужно запускать сервер и ждать, пока он поднимется: приложение «отвечает в руки» за миллисекунды, но проходит через все настоящие маршруты и middleware.

### Как это работает
- `npm install -D supertest`.
- Импортируешь `app` (без `listen`) и пишешь `request(app).get("/api/...")`.
- Цепочка: `.post(url)`, `.send(тело)`, `.set("Authorization", ...)`, `.set("Cookie", ...)`.
- Результат: `res.status`, `res.body`, `res.headers`.
- Можно проверять прямо в цепочке: `.expect(200).expect("Content-Type", /json/)`.
- Для cookie-сессий удобен `request.agent(app)` — агент запоминает cookie между запросами, как браузер.

Отсюда понятно, зачем разделять `app.js` (создание приложения) и `index.js` (запуск на порту).

### Пример
```js
// tests/projects.test.js
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { resetDb } from "./helpers.js";

describe("API проектов", () => {
  beforeEach(resetDb);

  it("создаёт и возвращает проект", async () => {
    const created = await request(app)
      .post("/api/projects")
      .send({ title: "Лендинг", clientId: 1 })
      .expect(201);

    expect(created.body).toMatchObject({ id: expect.any(Number), title: "Лендинг" });

    const fetched = await request(app).get(`/api/projects/${created.body.id}`).expect(200);
    expect(fetched.body.title).toBe("Лендинг");
  });

  it("вход и доступ к своему профилю", async () => {
    const agent = request.agent(app);               // хранит cookie
    await agent.post("/api/auth/login").send({ email: "anna@test.ru", password: "password123" }).expect(200);
    const me = await agent.get("/api/me").expect(200);
    expect(me.body.email).toBe("anna@test.ru");
  });
});
```

### Частые ошибки
- Импортировать файл, который сам вызывает `app.listen` — тесты пытаются занять порт.
- Не закрывать пул соединений с базой после тестов — процесс тестов не завершается.
- Проверять только статус, а не тело ответа.

### Мини-задание
Подключи Supertest и напиши интеграционные тесты для CRUD проектов: создание, получение, изменение, удаление и повторное получение (404). Отдельный тест — вход через `agent` и доступ к защищённому маршруту.

@@ 3

### На пальцах
Тестировать на боевой базе — репетировать пожарную тревогу настоящим огнём в работающем офисе. Тестовая база — отдельный макет здания: можно поджигать, ломать и восстанавливать сколько угодно. Ветка базы в Neon — копия макета, которую делают за секунду.

### Как это работает
Варианты:

- **Отдельная база в Docker** — `docker run postgres` перед тестами. Быстро, полностью изолировано, работает без интернета.
- **Ветка Neon** — копия схемы (и при желании данных) основной базы за секунды. Удобно в CI.
- **Testcontainers** — библиотека, которая сама поднимает контейнер с PostgreSQL для тестов и удаляет после.

Подготовка:

1. Отдельная переменная `DATABASE_URL` для тестов (`.env.test`).
2. Перед всеми тестами — применить миграции.
3. Перед каждым тестом — очистить таблицы и создать минимальные данные. Быстрее всего — `TRUNCATE ... RESTART IDENTITY CASCADE`.
4. После всех — закрыть пул.

Тесты, которые меняют данные, лучше запускать последовательно (`--no-file-parallelism` или отдельная база на каждый поток), чтобы они не мешали друг другу.

### Пример
```bash
# .env.test
DATABASE_URL=postgres://postgres:test@localhost:5433/studio_test
```

```js
// tests/helpers.js
import { pool } from "../src/db.js";
import bcrypt from "bcryptjs";

export async function resetDb() {
  await pool.query("TRUNCATE payments, projects, clients, users RESTART IDENTITY CASCADE");
  await pool.query("INSERT INTO clients (name) VALUES ('Кофейня «Зерно»'), ('Пекарня «Колос»')");
  const hash = await bcrypt.hash("password123", 4);   // низкая стоимость — тесты быстрее
  await pool.query("INSERT INTO users (email, password_hash, role) VALUES ('anna@test.ru', $1, 'user')", [hash]);
}
```

```json
{
  "scripts": {
    "test": "node --env-file=.env.test ./node_modules/vitest/vitest.mjs run --no-file-parallelism",
    "pretest": "node --env-file=.env.test scripts/migrate.js"
  }
}
```

### Частые ошибки
- Перепутать `.env` и `.env.test` и очистить рабочую базу. Добавь проверку: если в адресе базы нет `test` — тесты не запускаются.
- Тесты полагаются на данные, оставленные предыдущим тестом.
- Не применять миграции к тестовой базе — схема отличается от настоящей.

### Мини-задание
Подними тестовую базу в Docker на отдельном порту, настрой `.env.test`, скрипты `pretest` и `test` и функцию `resetDb`. Добавь в `resetDb` защиту от запуска на базе без слова `test` в адресе.

@@ 4

### На пальцах
Хороший охранник проверяется не тем, что пропускает сотрудников, а тем, что не пропускает чужих. Негативные тесты API — попытки пройти без пропуска, с поддельным пропуском, на чужой этаж и в несуществующую комнату. Каждая должна заканчиваться правильным отказом.

### Как это работает
Минимальный набор для защищённого маршрута:

| Ситуация | Ожидаемый ответ |
|---|---|
| Неверные данные в теле | 400 и ошибки по полям |
| Нет сессии или токена | 401 |
| Токен испорчен или просрочен | 401 |
| Вошёл, но объект чужой | 404 (или 403) |
| Вошёл, но нет нужной роли | 403 |
| Несуществующий id | 404 |
| Некорректный id (`abc`) | 400 или 404, но не 500 |
| Повторное создание уникального | 409 |

Особенно важны проверки «чужого объекта» — именно там чаще всего дыры. Тест: создать двух пользователей, первым создать проект, вторым попытаться его прочитать, изменить и удалить.

Ещё стоит проверить, что в ответах с ошибкой нет лишнего: стека, SQL, хешей паролей.

### Пример
```js
describe("права на проекты", () => {
  let anna, boris, projectId;

  beforeEach(async () => {
    await resetDb();
    anna = request.agent(app);
    boris = request.agent(app);
    await anna.post("/api/auth/login").send({ email: "anna@test.ru", password: "password123" });
    await boris.post("/api/auth/login").send({ email: "boris@test.ru", password: "password123" });
    const { body } = await anna.post("/api/projects").send({ title: "Лендинг", clientId: 1 });
    projectId = body.id;
  });

  it("гость получает 401", async () => {
    await request(app).get("/api/projects").expect(401);
  });

  it("чужой проект не виден и не меняется", async () => {
    await boris.get(`/api/projects/${projectId}`).expect(404);
    await boris.patch(`/api/projects/${projectId}`).send({ title: "Взлом" }).expect(404);
    await boris.delete(`/api/projects/${projectId}`).expect(404);
    const { body } = await anna.get(`/api/projects/${projectId}`).expect(200);
    expect(body.title).toBe("Лендинг");
  });

  it("неверные данные — 400 с полями", async () => {
    const res = await anna.post("/api/projects").send({ title: "" }).expect(400);
    expect(res.body.fields).toHaveProperty("title");
  });

  it("кривой id не роняет сервер", async () => {
    const res = await anna.get("/api/projects/abc");
    expect([400, 404]).toContain(res.status);
  });

  it("обычный пользователь не попадает в админку", async () => {
    await anna.get("/api/admin/users").expect(403);
  });
});
```

### Частые ошибки
- Тестировать только успешные ответы.
- Проверять «чужой объект» одним пользователем.
- Получать 500 на кривой id и не замечать этого, потому что такого теста нет.

### Мини-задание
Напиши для своего API набор негативных тестов по таблице выше. Добейся, чтобы ни один из них не возвращал 500.

@@ 5

### На пальцах
GitHub Actions — дежурный робот на складе. Каждый раз, когда кто-то привозит новую партию (push или pull request), робот сам распаковывает её, проверяет каждую коробку (запускает тесты) и вешает на партию зелёную или красную метку. Ломаный код не проскочит незамеченным, даже если кто-то забыл проверить у себя.

### Как это работает
- Сценарии лежат в репозитории: `.github/workflows/*.yml`.
- `on:` — когда запускать: на push в `main`, на каждый pull request.
- `jobs:` — задачи; `runs-on: ubuntu-latest` — на какой машине.
- `services:` — дополнительные контейнеры, например PostgreSQL для тестов.
- `steps:` — шаги: скачать код, поставить Node.js, установить зависимости, запустить линтер и тесты.
- Секреты (ключи) — в Settings → Secrets and variables → Actions, в сценарии — `${{ secrets.ИМЯ }}`.

Результат виден во вкладке Actions и прямо в pull request. В настройках ветки можно запретить слияние, пока проверки красные.

### Пример
```yaml
# .github/workflows/test.yml
name: Тесты

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: studio_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-timeout 5s --health-retries 10
    env:
      DATABASE_URL: postgres://postgres:test@localhost:5432/studio_test
      JWT_SECRET: test-secret-for-ci-only-0123456789abcdef
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: node scripts/migrate.js
      - run: npx vitest run
```

### Частые ошибки
- Тесты в CI ходят в настоящую базу или настоящие внешние сервисы.
- Боевые секреты в файле сценария открытым текстом.
- `npm install` вместо `npm ci` — версии зависимостей могут отличаться от `package-lock.json`.

### Мини-задание
Добавь в свой репозиторий сценарий GitHub Actions по примеру, открой pull request и посмотри результат. Нарочно сломай один тест, убедись, что проверка покраснела, и включи в настройках ветки запрет слияния при красных проверках.
