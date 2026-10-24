@@ 0

### На пальцах
JavaScript — язык, а браузер и Node.js — две разные страны, где на нём говорят. В браузере есть окно, страница и кнопки (`window`, `document`), но нет доступа к диску компьютера. В Node.js нет никакой страницы, зато есть доступ к файлам, сети и операционной системе. Язык тот же, «местные обычаи» разные.

### Как это работает
| | Браузер | Node.js |
|---|---|---|
| Глобальный объект | `window` | `globalThis` (раньше `global`) |
| Страница | `document`, DOM | нет |
| Файлы | нет доступа | модуль `fs` |
| Процесс и окружение | нет | `process.env`, `process.argv` |
| Сеть | `fetch` | `fetch`, модули `http`, `net` |
| Хранилище | `localStorage` | файлы, базы данных |
| Запуск | открыть страницу | `node file.js` в терминале |

Общее у них: синтаксис языка, `console`, `setTimeout`, промисы, `fetch` (в Node.js 18+), `URL`, `JSON`.

Node.js ставится с nodejs.org (версия LTS). Проверка: `node -v`. Запустить файл: `node app.js`. Интерактивный режим — просто `node`.

### Пример
```js
// hello.js
console.log("Привет из Node.js!");
console.log("Версия:", process.version);
console.log("Платформа:", process.platform);
console.log("Папка запуска:", process.cwd());

// console.log(document);   // ReferenceError: document is not defined
// console.log(window);     // ReferenceError: window is not defined

const r = await fetch("https://jsonplaceholder.typicode.com/users/1"); // в .mjs или с "type": "module"
console.log((await r.json()).name);
```

```bash
node hello.js
```

### Частые ошибки
- Пытаться использовать `document.querySelector` в серверном коде.
- Ставить библиотеку, рассчитанную только на браузер, в серверный проект.
- Запускать JS-файл двойным кликом вместо команды `node`.

### Мини-задание
Установи Node.js LTS и напиши скрипт, который выводит версию Node.js, текущую папку, имя пользователя (`process.env.USER` или `process.env.USERNAME` в Windows) и текущее время.

@@ 1

### На пальцах
Модули — разделение большой кухни на станции: холодный цех, горячий, кондитерский. В Node.js исторически два способа «передавать блюда» между станциями: старый `require` (CommonJS) и современный `import` (ES-модули). `package.json` с полем `"type": "module"` — табличка: «на нашей кухне работаем по-новому».

### Как это работает
| | CommonJS (старый) | ES-модули (современный) |
|---|---|---|
| Импорт | `const fs = require("fs")` | `import fs from "fs"` |
| Экспорт | `module.exports = fn` | `export default fn`, `export const x` |
| Расширение файлов | `.js` по умолчанию, `.cjs` | `.mjs` или `.js` с `"type": "module"` |
| `await` на верхнем уровне | нет | да |
| `__dirname` | есть | `import.meta.dirname` (Node 20.11+) |

Сейчас используй ES-модули. Включаются строкой в `package.json`: `"type": "module"`.

Особенности ES-модулей в Node.js:

- в относительных путях обязательно расширение: `import { db } from "./db.js"`;
- встроенные модули удобно писать с префиксом: `import fs from "node:fs"` — сразу видно, что это часть Node.js, а не пакет из npm;
- CommonJS-пакеты обычно можно импортировать через `import`.

### Пример
```json
{
  "name": "studio-api",
  "type": "module",
  "scripts": { "start": "node src/index.js", "dev": "node --watch src/index.js" }
}
```

```js
// src/utils/money.js
export function rub(n) {
  return n.toLocaleString("ru-RU") + " ₽";
}
export const VAT = 0.2;
```

```js
// src/index.js
import { readFile } from "node:fs/promises";
import { rub, VAT } from "./utils/money.js";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
console.log(pkg.name, rub(30000 * (1 + VAT)));
```

### Частые ошибки
- Забыть `.js` в пути импорта — ошибка `ERR_MODULE_NOT_FOUND`.
- Смешивать `require` и `import` в одном файле.
- Нет `"type": "module"` — ошибка «Cannot use import statement outside a module».

### Мини-задание
Создай проект с `"type": "module"`, модуль `utils/date.js` с функцией форматирования даты и `index.js`, который её импортирует. Добавь скрипт `dev` с `node --watch` и проверь, что сервер перезапускается при изменении файлов.

@@ 2

### На пальцах
Модуль `fs` — руки сервера для работы с бумагами: прочитать документ из шкафа, записать новый, дописать строчку в журнал, посмотреть, что лежит в папке. `fs/promises` — те же руки, но вежливые: они не заставляют весь офис ждать, пока ищут нужную папку.

### Как это работает
Три варианта API:

- синхронный: `fs.readFileSync` — блокирует программу до завершения. Допустим только при старте скрипта;
- колбэки: `fs.readFile(path, cb)` — старый стиль;
- промисы: `import { readFile } from "node:fs/promises"` — современный, с `await`.

Основные функции `fs/promises`:

| Функция | Что делает |
|---|---|
| `readFile(path, "utf8")` | прочитать текстовый файл |
| `writeFile(path, data)` | записать (перезаписать) файл |
| `appendFile(path, data)` | дописать в конец |
| `mkdir(path, { recursive: true })` | создать папку со всеми промежуточными |
| `readdir(path)` | список файлов в папке |
| `rm(path, { recursive: true, force: true })` | удалить |
| `stat(path)` | размер, дата изменения, папка или файл |

Пути строят через модуль `path`, а не склейкой строк: `path.join(dir, "data", "users.json")` — правильные разделители на любой ОС.

Если файла нет — ошибка с кодом `ENOENT`. Её обрабатывают в `try/catch`.

### Пример
```js
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(import.meta.dirname, "data", "notes.json");

async function loadNotes() {
  try {
    return JSON.parse(await readFile(DATA, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return [];     // файла ещё нет — пустой список
    throw e;
  }
}

async function saveNotes(notes) {
  await mkdir(path.dirname(DATA), { recursive: true });
  await writeFile(DATA, JSON.stringify(notes, null, 2));
}

const notes = await loadNotes();
notes.push({ id: Date.now(), text: "Выучить fs/promises" });
await saveNotes(notes);
console.log(`Заметок: ${notes.length}`);
```

### Частые ошибки
- `readFileSync` внутри обработчика запроса — сервер замирает для всех пользователей.
- Забыть кодировку `"utf8"` — вместо текста придёт Buffer с байтами.
- Строить путь от текущей папки терминала: `readFile("data.json")` работает только если запустить из нужной папки. Используй `import.meta.dirname`.

### Мини-задание
Напиши консольную «записную книжку»: `node notes.js add "Купить хлеб"` добавляет запись в `notes.json`, `node notes.js list` выводит все записи с номерами. Обработай случай, когда файла ещё нет.

@@ 3

### На пальцах
`process` — пульт управления запущенной программой. `process.env` — записка с настройками от того, кто запустил. `process.argv` — то, что написали после имени программы в командной строке. Код выхода — табличка, которую программа вешает на дверь, уходя: «0 — всё прошло хорошо», «1 — что-то сломалось».

### Как это работает
- `process.env.ИМЯ` — переменные окружения. Всегда строки или `undefined`.
- `process.argv` — массив: `[путь к node, путь к скрипту, ...аргументы]`. Аргументы — с индекса 2: `process.argv.slice(2)`.
- `process.exit(код)` — завершить программу с кодом. `0` — успех, любое другое число — ошибка.
- `process.exitCode = 1` — установить код, но дать программе закончиться естественно (корректнее, чем `exit`).
- `process.cwd()` — папка, из которой запустили.
- `process.on("SIGTERM", ...)` — реакция на сигнал завершения.
- `process.on("unhandledRejection", ...)` — последний рубеж для необработанных ошибок промисов.

Зачем коды выхода: скрипты, CI и Docker смотрят на них. Тесты упали — код 1 — сборка в GitHub Actions станет красной. Миграция базы не прошла — код 1 — деплой остановится.

Для разбора аргументов вроде `--port 3000` есть встроенный `util.parseArgs`.

### Пример
```js
// greet.js
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  options: { loud: { type: "boolean", short: "l" }, times: { type: "string", default: "1" } },
  allowPositionals: true,
});

const name = positionals[0];
if (!name) {
  console.error("Использование: node greet.js <имя> [--loud] [--times 3]");
  process.exit(1);                     // ошибка — код 1
}

const env = process.env.NODE_ENV ?? "development";
for (let i = 0; i < Number(values.times); i++) {
  const text = `Привет, ${name}! (режим: ${env})`;
  console.log(values.loud ? text.toUpperCase() : text);
}
```

```bash
node greet.js Анна --times 2 -l
node greet.js; echo "код выхода: $?"     # код выхода: 1
```

### Частые ошибки
- Читать аргументы с `process.argv[0]` — там путь к Node.js.
- Вызывать `process.exit()` в середине работы сервера — обрываются запросы и запись в базу.
- Выводить ошибки через `console.log` — для ошибок есть `console.error`, он идёт в отдельный поток.

### Мини-задание
Напиши скрипт `convert.js`, который принимает сумму и валюту (`node convert.js 100 usd`) и выводит сумму в рублях по курсу из переменной окружения `USD_RATE`. Без аргументов или без переменной — сообщение об ошибке и код выхода 1. Потренируйся в задаче «Аргументы командной строки».

@@ 4

### На пальцах
Node.js — официант-одиночка в большом ресторане. Он очень быстрый, потому что никогда не ждёт у плиты: принял заказ, передал на кухню, пошёл к следующему столику. Но если его попросить лично почистить мешок картошки (долгое вычисление), то все остальные столики останутся без внимания, пока он не закончит.

### Как это работает
- JavaScript в Node.js выполняется в одном потоке.
- Медленные операции ввода-вывода (запрос к базе, чтение файла, сетевой запрос) Node.js отдаёт системе и не ждёт: пока база думает, поток обслуживает другие запросы. Когда результат готов, колбэк или промис ставится в очередь.
- Event loop — цикл, который берёт задачи из очередей и выполняет по одной.
- Поэтому один процесс Node.js выдерживает тысячи одновременных подключений, если они в основном ждут.

Но долгое **синхронное** вычисление (тяжёлый цикл, обработка большого файла целиком, `readFileSync`, сложное регулярное выражение, `bcrypt.hashSync`) занимает поток полностью. Все остальные пользователи ждут.

Что делать с тяжёлым:

- использовать асинхронные версии функций;
- разбивать работу на части;
- выносить в `worker_threads` или отдельный фоновый процесс (очередь задач);
- для стандартных задач (хеширование паролей) брать асинхронные функции библиотек.

### Пример
```js
import http from "node:http";

function slowSum() {               // 10 секунд чистого вычисления
  const end = Date.now() + 10_000;
  let n = 0;
  while (Date.now() < end) n++;
  return n;
}

http.createServer((req, res) => {
  if (req.url === "/slow") {
    res.end(`Готово: ${slowSum()}`);   // блокирует весь сервер на 10 секунд!
    return;
  }
  res.end("Быстрый ответ");
}).listen(3000);

// Открой в браузере /slow, а в соседней вкладке — /
// Быстрая страница будет «висеть», пока не закончится slowSum
```

### Частые ошибки
- `fs.readFileSync`, `bcrypt.hashSync` и другие синхронные функции в обработчиках запросов.
- Обрабатывать огромный массив в одном запросе вместо пагинации.
- Думать, что `async` у функции делает тяжёлое вычисление неблокирующим. Не делает: асинхронным становится только ожидание.

### Мини-задание
Запусти пример выше и убедись, что `/slow` блокирует остальные запросы. Затем замени `slowSum` на `await new Promise(r => setTimeout(r, 10000))` — ожидание вместо вычисления — и проверь, что быстрые запросы больше не ждут.

@@ 5

### На пальцах
Express — удобный конструктор сервера. Модуль `http` — тот же сервер, собранный голыми руками из досок и гвоздей. Один раз собрать руками полезно: сразу понятно, что под капотом у любого фреймворка — запрос пришёл, мы посмотрели на метод и адрес, отправили ответ с кодом и заголовками.

### Как это работает
- `http.createServer((req, res) => { ... })` — функция вызывается на каждый запрос.
- `req.method` — метод, `req.url` — путь с параметрами, `req.headers` — заголовки.
- Тело запроса приходит потоком по кусочкам — его нужно собрать вручную.
- `res.statusCode = 404` — код, `res.setHeader("Content-Type", "application/json")` — заголовок.
- `res.end(текст)` — отправить ответ и закрыть. Без `end` клиент будет ждать вечно.
- `server.listen(3000)` — начать принимать запросы на порту.

Чего здесь нет и что даёт Express: разбор параметров маршрута (`/users/:id`), удобный `res.json()`, разбор JSON-тела, middleware, обработка ошибок.

### Пример
```js
import http from "node:http";

const projects = [{ id: 1, title: "Лендинг" }];

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/api/projects") {
    return send(res, 200, projects);
  }

  if (req.method === "POST" && url.pathname === "/api/projects") {
    let body = "";
    for await (const chunk of req) body += chunk;      // собираем тело по кусочкам
    const data = JSON.parse(body || "{}");
    const project = { id: Date.now(), title: data.title };
    projects.push(project);
    return send(res, 201, project);
  }

  send(res, 404, { error: "Не найдено" });
});

server.listen(3000, () => console.log("http://localhost:3000"));
```

```bash
curl http://localhost:3000/api/projects
curl -X POST http://localhost:3000/api/projects -d '{"title":"Магазин"}'
```

### Частые ошибки
- Забыть `res.end()` — запрос висит до таймаута.
- `JSON.parse` без `try/catch` — кривое тело роняет весь сервер.
- Не указать `Content-Type` — клиент не знает, что пришёл JSON.

### Мини-задание
Добавь в сервер на `http` маршрут `GET /api/projects/:id` (разбери id из пути вручную) с ответом 404 для несуществующего проекта и обработку некорректного JSON с ответом 400. Оцени, сколько кода ушло, — в следующем уроке то же самое сделаешь на Express.
