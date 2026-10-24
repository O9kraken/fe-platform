/* Задачи к урокам, где раньше не было практики: Git, терминал, Next.js, тесты, ORM, кеш, realtime, Docker, деплой, связка фронта и бэка */
EX.push(
/* ---------- Git ---------- */
{id:"git-status",l:"tools",t:"Прочитай git status",mode:"js",
 task:"Команда <code>git status --short</code> печатает по строке на файл. Первые два символа — код состояния, потом пробел и путь:\n- <code>??</code> — новый файл, Git за ним ещё не следит\n- <code>A</code> — файл добавлен в коммит\n- <code>M</code> — файл изменён\n- <code>D</code> — файл удалён\n\nБуква может стоять в первой колонке (изменение уже добавлено через <code>git add</code>) или во второй (ещё нет). Для нас колонка не важна.\n\nНапиши функцию <code>parseStatus(text)</code>. Она возвращает объект с четырьмя массивами путей: <code>untracked</code>, <code>added</code>, <code>modified</code>, <code>deleted</code>. Пустые строки пропускай.",
 files:{js:`const output = \` M src/app.js
M  index.html
A  src/utils.js
 D old.css
?? notes.txt
?? draft/plan.md\`;

function parseStatus(text) {
  const result = { untracked: [], added: [], modified: [], deleted: [] };
  // разбери каждую строку
  return result;
}

console.log(parseStatus(output));
`},
 hints:["Разбей текст на строки: text.split(\"\\n\"). Пустые строки отбрось.","Код — первые два символа: line.slice(0, 2). Путь — всё после третьего символа: line.slice(3).","Сначала проверь «??», потом ищи буквы A, D, M в коде: code.includes(\"A\")."],
 tests:[["Неотслеживаемые файлы","const r = parseStatus(output); return JSON.stringify(r.untracked) === JSON.stringify(['notes.txt', 'draft/plan.md'])"],
        ["Изменённые — из обеих колонок","const r = parseStatus(output); return JSON.stringify(r.modified) === JSON.stringify(['src/app.js', 'index.html'])"],
        ["Добавленные и удалённые","const r = parseStatus(output); return JSON.stringify(r.added) === JSON.stringify(['src/utils.js']) && JSON.stringify(r.deleted) === JSON.stringify(['old.css'])"],
        ["Пустой вывод и лишние переносы","const r = parseStatus('\\n?? a.txt\\n\\n'); return r.untracked.length === 1 && r.untracked[0] === 'a.txt' && r.modified.length === 0"]],
 sol:{js:`const output = \` M src/app.js
M  index.html
A  src/utils.js
 D old.css
?? notes.txt
?? draft/plan.md\`;

function parseStatus(text) {
  const result = { untracked: [], added: [], modified: [], deleted: [] };
  for (const line of text.split("\\n")) {
    if (!line.trim()) continue;
    const code = line.slice(0, 2);
    const path = line.slice(3);
    if (code === "??") result.untracked.push(path);
    else if (code.includes("A")) result.added.push(path);
    else if (code.includes("D")) result.deleted.push(path);
    else if (code.includes("M")) result.modified.push(path);
  }
  return result;
}

console.log(parseStatus(output));`}},

/* ---------- терминал ---------- */
{id:"cli-args",l:"be-linux",t:"Аргументы командной строки",mode:"js",
 task:"Когда запускаешь <code>node server.js --port 3000 -v data.csv</code>, программа получает массив слов после имени файла: <code>[\"--port\", \"3000\", \"-v\", \"data.csv\"]</code>. Разбирать его — обычная задача для консольных утилит.\n\nНапиши <code>parseArgs(argv)</code>, которая возвращает <code>{ flags, files }</code>:\n- <code>--name=value</code> → <code>flags.name = \"value\"</code>\n- <code>--name value</code> → то же самое, если следующее слово не начинается с <code>-</code>\n- <code>--name</code> без значения → <code>flags.name = true</code>\n- <code>-v</code> → <code>flags.v = true</code>, а <code>-abc</code> → три флага <code>a</code>, <code>b</code>, <code>c</code>\n- всё остальное — в массив <code>files</code>",
 files:{js:`function parseArgs(argv) {
  const flags = {};
  const files = [];
  // пройди по словам по очереди
  return { flags, files };
}

console.log(parseArgs(["--port", "3000", "-v", "data.csv"]));
`},
 hints:["Иди циклом for с индексом i: иногда нужно заглянуть в следующее слово argv[i + 1] и пропустить его (i++).","Для --name=value подойдёт arg.slice(2).split(\"=\"). Осторожно: в значении тоже может быть знак «=», поэтому возьми первый кусок как имя, а остальные склей обратно.","Короткие флаги: arg.slice(1).split(\"\") даёт массив букв."],
 tests:[["Флаг со значением через пробел","const r = parseArgs(['--port', '3000']); return r.flags.port === '3000' && r.files.length === 0"],
        ["Флаг через знак равенства","const r = parseArgs(['--db=postgres://u:p@host/db?ssl=true']); return r.flags.db === 'postgres://u:p@host/db?ssl=true'"],
        ["Флаг без значения","const r = parseArgs(['--watch', '--port', '80']); return r.flags.watch === true && r.flags.port === '80'"],
        ["Короткие флаги","const r = parseArgs(['-v', '-xz']); return r.flags.v === true && r.flags.x === true && r.flags.z === true"],
        ["Файлы","const r = parseArgs(['a.csv', '--out', 'res.json', 'b.csv', '--dry']); return JSON.stringify(r.files) === JSON.stringify(['a.csv', 'b.csv']) && r.flags.out === 'res.json' && r.flags.dry === true"]],
 sol:{js:`function parseArgs(argv) {
  const flags = {};
  const files = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const [name, ...rest] = arg.slice(2).split("=");
      if (rest.length) {
        flags[name] = rest.join("=");
      } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("-")) {
        flags[name] = argv[i + 1];
        i++;
      } else {
        flags[name] = true;
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      for (const ch of arg.slice(1)) flags[ch] = true;
    } else {
      files.push(arg);
    }
  }
  return { flags, files };
}

console.log(parseArgs(["--port", "3000", "-v", "data.csv"]));`}},

/* ---------- Next.js: маршруты из файлов ---------- */
{id:"next-routes",l:"next1",t:"Маршрутизатор как в Next.js",mode:"js",
 task:"В Next.js адреса страниц берутся из папок: файл <code>app/blog/[slug]/page.js</code> открывается по адресу <code>/blog/что-угодно</code>. Напишем такой маршрутизатор сами — так станет понятно, как он работает.\n\n<code>matchRoute(files, url)</code> возвращает <code>{ file, params }</code> или <code>null</code>:\n- <code>app/page.js</code> — главная <code>/</code>\n- обычная папка совпадает только со своим именем\n- <code>[slug]</code> — один любой кусок адреса, попадает в <code>params.slug</code>\n- <code>[...parts]</code> — один или больше кусков, попадает в <code>params.parts</code> массивом\n- если подходят несколько файлов, побеждает более точный: обычная папка важнее <code>[slug]</code>, а <code>[slug]</code> важнее <code>[...parts]</code>",
 files:{js:`const files = [
  "app/page.js",
  "app/blog/page.js",
  "app/blog/[slug]/page.js",
  "app/blog/new/page.js",
  "app/docs/[...parts]/page.js",
];

function matchRoute(files, url) {
  // 1. Разбей адрес на куски: "/blog/hello" → ["blog", "hello"]
  // 2. Для каждого файла получи куски шаблона: "app/blog/[slug]/page.js" → ["blog", "[slug]"]
  // 3. Сравни куски, собери params
  // 4. Из подходящих выбери самый точный
  return null;
}

console.log(matchRoute(files, "/blog/hello"));
`},
 hints:["Куски адреса: url.split(\"/\").filter(Boolean). Для главной получится пустой массив.","Шаблон: убери «app/» в начале и «page.js» в конце, потом тоже split(\"/\").filter(Boolean).","Для выбора точного варианта посчитай очки: обычная папка — 3, [slug] — 2, [...parts] — 1. Сравнивай кусок за куском и бери вариант с большими очками на первом же различии."],
 tests:[["Главная страница","const r = matchRoute(files, '/'); return r && r.file === 'app/page.js'"],
        ["Обычная страница","const r = matchRoute(files, '/blog'); return r && r.file === 'app/blog/page.js'"],
        ["Параметр [slug]","const r = matchRoute(files, '/blog/hello'); return r && r.file === 'app/blog/[slug]/page.js' && r.params.slug === 'hello'"],
        ["Обычная папка важнее [slug]","const r = matchRoute(files, '/blog/new'); return r && r.file === 'app/blog/new/page.js'"],
        ["[...parts] собирает несколько кусков","const r = matchRoute(files, '/docs/react/hooks/state'); return r && r.file === 'app/docs/[...parts]/page.js' && JSON.stringify(r.params.parts) === JSON.stringify(['react', 'hooks', 'state'])"],
        ["Нет страницы — null","return matchRoute(files, '/about') === null && matchRoute(files, '/docs') === null && matchRoute(files, '/blog/a/b') === null"]],
 sol:{js:`const files = [
  "app/page.js",
  "app/blog/page.js",
  "app/blog/[slug]/page.js",
  "app/blog/new/page.js",
  "app/docs/[...parts]/page.js",
];

function matchRoute(files, url) {
  const parts = url.split("/").filter(Boolean);
  const found = [];

  for (const file of files) {
    const pattern = file.replace(/^app\\//, "").replace(/page\\.js$/, "").split("/").filter(Boolean);
    const params = {};
    const score = [];
    let ok = true;

    for (let i = 0; i < pattern.length; i++) {
      const seg = pattern[i];
      if (seg.startsWith("[...")) {
        const rest = parts.slice(i);
        if (!rest.length) { ok = false; break; }
        params[seg.slice(4, -1)] = rest;
        score.push(1);
        break;
      }
      if (i >= parts.length) { ok = false; break; }
      if (seg.startsWith("[")) { params[seg.slice(1, -1)] = parts[i]; score.push(2); }
      else if (seg === parts[i]) score.push(3);
      else { ok = false; break; }
      if (i === pattern.length - 1 && parts.length !== pattern.length) ok = false;
    }
    if (!pattern.length && parts.length) ok = false;
    if (ok) found.push({ file, params, score });
  }

  found.sort((a, b) => {
    for (let i = 0; i < Math.max(a.score.length, b.score.length); i++) {
      const d = (b.score[i] || 0) - (a.score[i] || 0);
      if (d) return d;
    }
    return 0;
  });
  return found.length ? { file: found[0].file, params: found[0].params } : null;
}

console.log(matchRoute(files, "/blog/hello"));`}},

/* ---------- Next.js: кеш и revalidate ---------- */
{id:"next-revalidate",l:"next2",t:"Кеш запросов и revalidate",mode:"js",
 task:"Next.js кеширует запросы к данным: <code>fetch(url, { next: { revalidate: 60 } })</code> берёт ответ из кеша, пока ему меньше 60 секунд, а потом идёт за свежими данными. А если два компонента одновременно просят одно и то же, запрос уходит один.\n\nНапиши <code>createFetcher(load, revalidate, now)</code>. Она возвращает асинхронную функцию <code>get(key)</code>:\n- если в кеше есть ответ моложе <code>revalidate</code> секунд — вернуть его, не вызывая <code>load</code>\n- иначе вызвать <code>load(key)</code>, сохранить ответ и время\n- если <code>load</code> для этого ключа уже выполняется, не вызывать его второй раз, а дождаться того же промиса\n- если <code>load</code> упал, ошибку пробросить, а в кеш ничего не класть\n\n<code>now()</code> возвращает текущее время в миллисекундах — в тестах часы будут ненастоящими.",
 files:{js:`function createFetcher(load, revalidate, now = Date.now) {
  const cache = new Map();    // key → { value, time }
  const pending = new Map();  // key → промис, который ещё выполняется

  return async function get(key) {
    // твой код
  };
}

// Проверим вручную
let calls = 0;
const get = createFetcher(async id => { calls++; return { id, title: "Проект " + id }; }, 60);
get(1).then(() => get(1)).then(p => console.log(p, "вызовов load:", calls));
`},
 hints:["Возраст записи в секундах: (now() - entry.time) / 1000.","Для одновременных запросов сохрани сам промис: const p = load(key); pending.set(key, p). Второй вызов просто вернёт pending.get(key).","Удали ключ из pending и при успехе, и при ошибке — для этого подходит try/finally."],
 tests:[["Повторный запрос берётся из кеша","let n = 0, t = 0; const get = createFetcher(async k => { n++; return k + '!'; }, 60, () => t); ok(await get('a') === 'a!'); t = 30000; ok(await get('a') === 'a!'); ok(n === 1, 'load вызван ' + n + ' раза, ожидался 1'); return true"],
        ["Через revalidate секунд — свежие данные","let n = 0, t = 0; const get = createFetcher(async k => ++n, 60, () => t); await get('a'); t = 61000; const v = await get('a'); ok(n === 2, 'load вызван ' + n + ' раз'); return v === 2"],
        ["Разные ключи кешируются отдельно","let n = 0; const get = createFetcher(async k => { n++; return k; }, 60, () => 0); await get('a'); await get('b'); await get('a'); return n === 2"],
        ["Одновременные запросы — один вызов load","let n = 0; const get = createFetcher(k => { n++; return new Promise(r => setTimeout(() => r('ok'), 20)); }, 60, () => 0); const [a, b] = await Promise.all([get('x'), get('x')]); ok(n === 1, 'load вызван ' + n + ' раза'); return a === 'ok' && b === 'ok'"],
        ["Ошибка не попадает в кеш","let n = 0; const get = createFetcher(async k => { n++; if (n === 1) throw new Error('сеть'); return 'ок'; }, 60, () => 0); let failed = false; try { await get('a'); } catch (e) { failed = e.message === 'сеть'; } ok(failed, 'Ошибка должна пробрасываться'); return await get('a') === 'ок'"]],
 sol:{js:`function createFetcher(load, revalidate, now = Date.now) {
  const cache = new Map();
  const pending = new Map();

  return async function get(key) {
    const entry = cache.get(key);
    if (entry && (now() - entry.time) / 1000 < revalidate) return entry.value;
    if (pending.has(key)) return pending.get(key);

    const p = (async () => {
      try {
        const value = await load(key);
        cache.set(key, { value, time: now() });
        return value;
      } finally {
        pending.delete(key);
      }
    })();
    pending.set(key, p);
    return p;
  };
}

let calls = 0;
const get = createFetcher(async id => { calls++; return { id, title: "Проект " + id }; }, 60);
get(1).then(() => get(1)).then(p => console.log(p, "вызовов load:", calls));`}},

/* ---------- тестирование ---------- */
{id:"mini-expect",l:"testing",t:"Свой expect, как в Jest",mode:"js",
 task:"В Jest и Vitest проверки пишут так: <code>expect(sum(2, 2)).toBe(4)</code>. Внутри нет никакой магии — это обычная функция, которая бросает ошибку, если значение не то. Напиши свою.\n\n<code>expect(actual)</code> возвращает объект с методами:\n- <code>toBe(expected)</code> — строгое сравнение <code>===</code>\n- <code>toEqual(expected)</code> — глубокое сравнение массивов и объектов: <code>[1, {a: 2}]</code> равно <code>[1, {a: 2}]</code>\n- <code>toThrow()</code> — <code>actual</code> — функция, и при вызове она бросает ошибку\n- <code>not</code> — тот же набор проверок наоборот: <code>expect(1).not.toBe(2)</code>\n\nЕсли проверка не прошла — брось <code>Error</code>, в тексте которого есть слово «Ожидалось».",
 files:{js:`function expect(actual) {
  // верни объект с toBe, toEqual, toThrow и not
}

// Попробуй:
expect(2 + 2).toBe(4);
expect([1, 2]).toEqual([1, 2]);
console.log("Всё прошло");
`},
 hints:["Удобно сделать одну функцию проверки check(pass, message), которая бросает ошибку, если pass не равен ожидаемому. Для not ожидание переворачивается.","Глубокое сравнение — рекурсия: если оба значения объекты, сравни количество ключей и каждый ключ через ту же функцию.","Для toThrow вызови actual() внутри try/catch и запомни, была ли ошибка."],
 tests:[["toBe проходит и падает","expect(5).toBe(5); let e; try { expect(5).toBe(6); } catch (x) { e = x; } ok(e, 'toBe(6) для 5 должен бросить ошибку'); return /Ожидалось/.test(e.message)"],
        ["toBe сравнивает строго","let e; try { expect('5').toBe(5); } catch (x) { e = x; } return !!e"],
        ["toEqual сравнивает вглубь","expect({ a: [1, { b: 2 }] }).toEqual({ a: [1, { b: 2 }] }); let e; try { expect({ a: [1, { b: 2 }] }).toEqual({ a: [1, { b: 3 }] }); } catch (x) { e = x; } ok(e, 'Разные вложенные значения должны давать ошибку'); let e2; try { expect({ a: 1 }).toEqual({ a: 1, b: 2 }); } catch (x) { e2 = x; } return !!e2"],
        ["toThrow","expect(() => { throw new Error('x'); }).toThrow(); let e; try { expect(() => 1).toThrow(); } catch (x) { e = x; } return !!e"],
        ["not переворачивает проверку","expect(1).not.toBe(2); expect([1]).not.toEqual([2]); expect(() => 1).not.toThrow(); let e; try { expect(1).not.toBe(1); } catch (x) { e = x; } return !!e && /Ожидалось/.test(e.message)"]],
 sol:{js:`function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(k => deepEqual(a[k], b[k]));
}

function expect(actual) {
  const make = negate => {
    const check = (pass, message) => {
      if (pass === negate) throw new Error((negate ? "Ожидалось НЕ " : "Ожидалось ") + message);
    };
    return {
      toBe: expected => check(actual === expected, JSON.stringify(expected) + ", получено " + JSON.stringify(actual)),
      toEqual: expected => check(deepEqual(actual, expected), JSON.stringify(expected) + ", получено " + JSON.stringify(actual)),
      toThrow: () => {
        let threw = false;
        try { actual(); } catch (e) { threw = true; }
        check(threw, "что функция бросит ошибку");
      },
    };
  };
  return { ...make(false), not: make(true) };
}

expect(2 + 2).toBe(4);
expect([1, 2]).toEqual([1, 2]);
console.log("Всё прошло");`}},

/* ---------- тесты API: тесты, которые ловят ошибки ---------- */
{id:"catch-bugs",l:"be-test",t:"Тесты, которые ловят баги",mode:"js",
 task:"Хороший тест — тот, который падает, когда в коде ошибка. Проверим твои тесты на прочность: мы подсунем им несколько реализаций функции <code>clamp</code>, и почти все из них с багом.\n\n<code>clamp(value, min, max)</code> должна вернуть <code>value</code>, но не меньше <code>min</code> и не больше <code>max</code>. Работает и с дробными числами: <code>clamp(2.5, 0, 10)</code> — это <code>2.5</code>.\n\nНапиши функцию <code>check(clamp)</code>: она вызывает переданную реализацию на разных значениях и возвращает <code>true</code>, если всё верно, и <code>false</code>, если нашла ошибку. Подумай о границах: значение внутри, ниже, выше, ровно на границе, дробное.",
 files:{js:`function check(clamp) {
  // проверь clamp на разных случаях
  return clamp(5, 0, 10) === 5;
}

// Правильная реализация — твой check должен вернуть true
const good = (v, min, max) => Math.min(Math.max(v, min), max);
console.log("Правильная:", check(good));
`},
 hints:["Составь таблицу случаев: [значение, min, max, ожидаемый ответ]. Например, [5, 0, 10, 5], [-3, 0, 10, 0], [15, 0, 10, 10].","Ошибки часто живут на границах: что будет при value, равном min или max?","Одна из реализаций с багом округляет числа. Добавь дробный случай."],
 tests:[["Правильная реализация проходит","return check((v, min, max) => Math.min(Math.max(v, min), max)) === true"],
        ["Ловит: забыли про верхнюю границу","return check((v, min, max) => Math.max(v, min)) === false"],
        ["Ловит: забыли про нижнюю границу","return check((v, min, max) => Math.min(v, max)) === false"],
        ["Ловит: перепутаны min и max","return check((v, min, max) => v < min ? max : v > max ? min : v) === false"],
        ["Ловит: ошибка на границе","return check((v, min, max) => v >= max ? max - 1 : Math.max(v, min)) === false"],
        ["Ловит: округление","return check((v, min, max) => Math.round(Math.min(Math.max(v, min), max))) === false"]],
 sol:{js:`function check(clamp) {
  const cases = [
    [5, 0, 10, 5],      // внутри
    [-3, 0, 10, 0],     // ниже
    [15, 0, 10, 10],    // выше
    [0, 0, 10, 0],      // ровно на нижней границе
    [10, 0, 10, 10],    // ровно на верхней границе
    [2.5, 0, 10, 2.5],  // дробное
    [-5, -10, -1, -5],  // отрицательный диапазон
  ];
  return cases.every(([v, min, max, expected]) => clamp(v, min, max) === expected);
}

const good = (v, min, max) => Math.min(Math.max(v, min), max);
console.log("Правильная:", check(good));`}},

/* ---------- ORM ---------- */
{id:"query-builder",l:"orm",t:"Построитель запросов",mode:"js",
 task:"ORM и построители запросов (Prisma, Drizzle, Knex) собирают SQL за тебя. Главное, что они делают, — не вклеивают значения в текст запроса, а передают их отдельно. Так SQL-инъекция становится невозможной.\n\nНапиши <code>qb(table)</code> с цепочкой методов:\n- <code>.select(\"id\", \"name\")</code> — какие колонки взять (по умолчанию <code>*</code>)\n- <code>.where({ city: \"Москва\", active: true })</code> — условия через <code>AND</code>\n- <code>.orderBy(\"name\", \"desc\")</code> — сортировка, по умолчанию <code>ASC</code>\n- <code>.limit(5)</code>\n- <code>.toSQL()</code> → <code>{ text, values }</code>\n\nЗначения в тексте заменяются на <code>$1</code>, <code>$2</code>… как в PostgreSQL. Имена таблиц и колонок должны состоять только из латинских букв, цифр и подчёркивания, иначе — <code>throw new Error(...)</code>.",
 files:{js:`function qb(table) {
  // верни объект с методами select, where, orderBy, limit, toSQL
  // каждый метод (кроме toSQL) возвращает этот же объект, чтобы работала цепочка
}

const q = qb("clients").select("id", "name").where({ city: "Москва" }).orderBy("name").limit(10).toSQL();
console.log(q.text);
console.log(q.values);
`},
 hints:["Храни части запроса в переменных внутри qb: columns, conditions, order, max. Методы меняют их и делают return builder.","Условия: Object.entries(obj).map(([col, val], i) => col + \" = $\" + (i + 1)), а val клади в массив values.","Проверка имени: /^[A-Za-z_][A-Za-z0-9_]*$/.test(name). Проверяй и таблицу, и колонки в select, where и orderBy."],
 tests:[["Простой запрос","return qb('users').toSQL().text === 'SELECT * FROM users'"],
        ["Колонки и условия с параметрами","const q = qb('clients').select('id', 'name').where({ city: 'Москва', active: true }).toSQL(); ok(q.text === 'SELECT id, name FROM clients WHERE city = $1 AND active = $2', 'Получено: ' + q.text); return JSON.stringify(q.values) === JSON.stringify(['Москва', true])"],
        ["Сортировка и лимит","const q = qb('projects').orderBy('budget', 'desc').limit(5).toSQL(); ok(q.text === 'SELECT * FROM projects ORDER BY budget DESC LIMIT 5', 'Получено: ' + q.text); return q.values.length === 0"],
        ["Сортировка по умолчанию — ASC","return qb('t').orderBy('name').toSQL().text === 'SELECT * FROM t ORDER BY name ASC'"],
        ["Значение не попадает в текст запроса","const evil = \"x'; DROP TABLE users; --\"; const q = qb('users').where({ name: evil }).toSQL(); ok(!q.text.includes('DROP'), 'Значение вклеено в SQL'); return q.values[0] === evil"],
        ["Опасные имена колонок запрещены","let e1, e2; try { qb('users').where({ 'name; DROP TABLE users': 1 }).toSQL(); } catch (x) { e1 = x; } try { qb('users').orderBy('id; DELETE FROM users').toSQL(); } catch (x) { e2 = x; } return !!e1 && !!e2"]],
 sol:{js:`function qb(table) {
  const safe = name => {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error("Недопустимое имя: " + name);
    return name;
  };
  safe(table);
  let columns = ["*"];
  let conditions = [];
  let order = null;
  let max = null;

  const builder = {
    select(...cols) { columns = cols.map(safe); return builder; },
    where(obj) { conditions = conditions.concat(Object.entries(obj).map(([c, v]) => [safe(c), v])); return builder; },
    orderBy(col, dir = "asc") { order = safe(col) + " " + (String(dir).toLowerCase() === "desc" ? "DESC" : "ASC"); return builder; },
    limit(n) { max = Math.max(0, Math.floor(Number(n))); return builder; },
    toSQL() {
      const values = [];
      let text = "SELECT " + columns.join(", ") + " FROM " + table;
      if (conditions.length) {
        text += " WHERE " + conditions.map(([c, v]) => { values.push(v); return c + " = $" + values.length; }).join(" AND ");
      }
      if (order) text += " ORDER BY " + order;
      if (max !== null) text += " LIMIT " + max;
      return { text, values };
    },
  };
  return builder;
}

const q = qb("clients").select("id", "name").where({ city: "Москва" }).orderBy("name").limit(10).toSQL();
console.log(q.text);
console.log(q.values);`}},

/* ---------- кеш ---------- */
{id:"lru-cache",l:"cache",t:"LRU-кеш со сроком жизни",mode:"js",
 task:"Redis и кеши в памяти работают по двум правилам: у записи есть срок жизни (TTL), а когда место кончается, выкидывается та запись, которую дольше всех не трогали (LRU — least recently used).\n\nНапиши класс <code>LRUCache</code>:\n- <code>new LRUCache(limit, ttlMs, now)</code> — сколько записей хранить, срок жизни в миллисекундах и функция текущего времени (по умолчанию <code>Date.now</code>)\n- <code>set(key, value)</code> — сохранить; если записей больше <code>limit</code>, удалить самую давно использованную\n- <code>get(key)</code> — значение или <code>undefined</code>; запись с истёкшим сроком удаляется; чтение делает запись «свежей»\n- <code>size</code> — сколько живых записей сейчас (геттер)",
 files:{js:`class LRUCache {
  constructor(limit, ttlMs, now = Date.now) {
    // Map помнит порядок добавления — это пригодится
  }

  get(key) {}

  set(key, value) {}

  get size() { return 0; }
}

const c = new LRUCache(2, 60000);
c.set("a", 1); c.set("b", 2); c.get("a"); c.set("c", 3);
console.log(c.get("a"), c.get("b"), c.get("c")); // 1 undefined 3
`},
 hints:["Map перебирает ключи в порядке добавления. Чтобы сделать запись свежей, удали её и добавь заново — она переедет в конец.","Самая давно использованная запись — первая: this.map.keys().next().value.","Храни вместе со значением время истечения: { value, expires: now() + ttl }."],
 tests:[["Сохраняет и читает","const c = new LRUCache(3, 1000, () => 0); c.set('a', 1); return c.get('a') === 1 && c.get('нет') === undefined"],
        ["Выкидывает самую старую запись","const c = new LRUCache(2, 1000, () => 0); c.set('a', 1); c.set('b', 2); c.set('c', 3); return c.get('a') === undefined && c.get('b') === 2 && c.get('c') === 3 && c.size === 2"],
        ["Чтение делает запись свежей","const c = new LRUCache(2, 1000, () => 0); c.set('a', 1); c.set('b', 2); c.get('a'); c.set('c', 3); return c.get('a') === 1 && c.get('b') === undefined"],
        ["Повторный set обновляет значение без удаления соседей","const c = new LRUCache(2, 1000, () => 0); c.set('a', 1); c.set('b', 2); c.set('a', 10); return c.get('a') === 10 && c.get('b') === 2 && c.size === 2"],
        ["Срок жизни","let t = 0; const c = new LRUCache(5, 1000, () => t); c.set('a', 1); t = 999; ok(c.get('a') === 1, 'Запись пропала раньше срока'); t = 2000; ok(c.get('a') === undefined, 'Запись живёт дольше срока'); return c.size === 0"]],
 sol:{js:`class LRUCache {
  constructor(limit, ttlMs, now = Date.now) {
    this.limit = limit;
    this.ttl = ttlMs;
    this.now = now;
    this.map = new Map();
  }

  get(key) {
    const e = this.map.get(key);
    if (!e) return undefined;
    this.map.delete(key);
    if (e.expires <= this.now()) return undefined;
    this.map.set(key, e);
    return e.value;
  }

  set(key, value) {
    this.map.delete(key);
    this.map.set(key, { value, expires: this.now() + this.ttl });
    while (this.map.size > this.limit) this.map.delete(this.map.keys().next().value);
  }

  get size() {
    const t = this.now();
    for (const [k, e] of this.map) if (e.expires <= t) this.map.delete(k);
    return this.map.size;
  }
}

const c = new LRUCache(2, 60000);
c.set("a", 1); c.set("b", 2); c.get("a"); c.set("c", 3);
console.log(c.get("a"), c.get("b"), c.get("c"));`}},

/* ---------- realtime ---------- */
{id:"chat-hub",l:"realtime",t:"Комнаты чата на WebSocket",mode:"js",
 task:"В чатах на WebSocket и Socket.IO сервер держит список подключений и раскладывает их по комнатам. Сообщение из комнаты получают все её участники, кроме автора.\n\nНапиши <code>createHub()</code>, которая возвращает объект:\n- <code>join(room, client)</code> — добавить клиента в комнату (повторный вход ничего не меняет)\n- <code>leave(room, client)</code> — убрать; пустую комнату удалить\n- <code>broadcast(room, message, from)</code> — вызвать <code>client.send(message)</code> у всех в комнате, кроме <code>from</code>; вернуть, скольким отправлено\n- <code>disconnect(client)</code> — клиент закрыл вкладку: убрать его из всех комнат\n- <code>online(room)</code> — сколько человек в комнате\n\nКлиент — любой объект с методом <code>send</code>.",
 files:{js:`function createHub() {
  const rooms = new Map(); // room → Set клиентов

  return {
    join(room, client) {},
    leave(room, client) {},
    broadcast(room, message, from) { return 0; },
    disconnect(client) {},
    online(room) { return 0; },
  };
}

const hub = createHub();
const anya = { name: "Аня", send: m => console.log("Аня получила:", m) };
const boris = { name: "Борис", send: m => console.log("Борис получил:", m) };
hub.join("general", anya);
hub.join("general", boris);
hub.broadcast("general", "Привет!", anya);
`},
 hints:["Set не даёт добавить одного клиента дважды — повторный join решится сам.","rooms.get(room) может быть undefined, если комнаты ещё нет: создай её через rooms.set(room, new Set()).","В disconnect пройди по всем комнатам: for (const [room, set] of rooms)."],
 tests:[["Сообщение получают все, кроме автора","const hub = createHub(); const got = []; const a = { send: m => got.push('a:' + m) }, b = { send: m => got.push('b:' + m) }, c = { send: m => got.push('c:' + m) }; hub.join('r', a); hub.join('r', b); hub.join('r', c); const n = hub.broadcast('r', 'hi', a); ok(n === 2, 'Отправлено ' + n + ', ожидалось 2'); return got.join() === 'b:hi,c:hi'"],
        ["Комнаты не смешиваются","const hub = createHub(); let got = 0; const a = { send: () => got++ }, b = { send: () => got++ }; hub.join('x', a); hub.join('y', b); hub.broadcast('x', 'm'); return got === 1"],
        ["Повторный вход не дублирует","const hub = createHub(); const a = { send() {} }; hub.join('r', a); hub.join('r', a); return hub.online('r') === 1"],
        ["Выход из комнаты","const hub = createHub(); const a = { send() {} }, b = { send() {} }; hub.join('r', a); hub.join('r', b); hub.leave('r', a); ok(hub.online('r') === 1); hub.leave('r', b); return hub.online('r') === 0 && hub.broadcast('r', 'x') === 0"],
        ["Отключение убирает из всех комнат","const hub = createHub(); const a = { send() {} }, b = { send() {} }; hub.join('r1', a); hub.join('r2', a); hub.join('r2', b); hub.disconnect(a); return hub.online('r1') === 0 && hub.online('r2') === 1"]],
 sol:{js:`function createHub() {
  const rooms = new Map();

  return {
    join(room, client) {
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room).add(client);
    },
    leave(room, client) {
      const set = rooms.get(room);
      if (!set) return;
      set.delete(client);
      if (!set.size) rooms.delete(room);
    },
    broadcast(room, message, from) {
      const set = rooms.get(room);
      if (!set) return 0;
      let sent = 0;
      for (const client of set) {
        if (client === from) continue;
        client.send(message);
        sent++;
      }
      return sent;
    },
    disconnect(client) {
      for (const room of [...rooms.keys()]) this.leave(room, client);
    },
    online(room) {
      return rooms.get(room)?.size || 0;
    },
  };
}

const hub = createHub();
const anya = { name: "Аня", send: m => console.log("Аня получила:", m) };
const boris = { name: "Борис", send: m => console.log("Борис получил:", m) };
hub.join("general", anya);
hub.join("general", boris);
hub.broadcast("general", "Привет!", anya);`}},

/* ---------- Docker ---------- */
{id:"docker-lint",l:"docker",t:"Ревизор Dockerfile",mode:"js",
 task:"Напиши проверку Dockerfile на четыре частые ошибки. <code>lintDockerfile(text)</code> возвращает массив кодов найденных проблем (порядок не важен):\n- <code>\"latest\"</code> — в <code>FROM</code> образ без версии или с <code>:latest</code>. Сборка сегодня и через месяц даст разный результат\n- <code>\"cache\"</code> — <code>COPY . .</code> стоит раньше <code>RUN npm ci</code> или <code>RUN npm install</code>. Любая правка кода заново скачивает все зависимости\n- <code>\"root\"</code> — нет инструкции <code>USER</code>: приложение работает от администратора контейнера\n- <code>\"secret\"</code> — в <code>ENV</code> есть переменная, в имени которой встречается PASSWORD, SECRET, TOKEN или KEY. Секреты нельзя зашивать в образ\n\nИнструкции могут быть написаны и большими, и маленькими буквами. Строки-комментарии начинаются с <code>#</code>.",
 files:{js:`const bad = \`FROM node
WORKDIR /app
COPY . .
RUN npm install
ENV DB_PASSWORD=qwerty
CMD ["node", "server.js"]\`;

const good = \`# сборка API студии
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
ENV NODE_ENV=production
CMD ["node", "server.js"]\`;

function lintDockerfile(text) {
  const problems = [];
  // разбери строки и найди проблемы
  return problems;
}

console.log("bad:", lintDockerfile(bad));
console.log("good:", lintDockerfile(good));
`},
 hints:["Подготовь строки: text.split(\"\\n\").map(s => s.trim()).filter(s => s && !s.startsWith(\"#\")). Инструкция — первое слово: line.split(/\\s+/)[0].toUpperCase().","Версия образа: после FROM возьми имя образа (второе слово). Если в нём нет «:» или оно заканчивается на «:latest» — проблема.","Для «cache» запомни номер строки COPY . . и номер строки RUN npm ci/install и сравни их."],
 tests:[["Хороший Dockerfile — без замечаний","return lintDockerfile(good).length === 0"],
        ["Находит все четыре проблемы","const r = lintDockerfile(bad); return ['latest', 'cache', 'root', 'secret'].every(c => r.includes(c)) && r.length === 4"],
        ["latest: явный тег :latest","return lintDockerfile('FROM node:latest\\nUSER node').join() === 'latest'"],
        ["Маленькие буквы и комментарии","const r = lintDockerfile('# ENV API_TOKEN=x\\nfrom node:22\\ncopy . .\\nrun npm ci\\nuser node'); return r.join() === 'cache'"],
        ["Секрет в ENV в любом месте имени","return lintDockerfile('FROM node:22\\nUSER node\\nENV STRIPE_KEY=sk_123').join() === 'secret'"]],
 sol:{js:`const bad = \`FROM node
WORKDIR /app
COPY . .
RUN npm install
ENV DB_PASSWORD=qwerty
CMD ["node", "server.js"]\`;

const good = \`# сборка API студии
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
ENV NODE_ENV=production
CMD ["node", "server.js"]\`;

function lintDockerfile(text) {
  const problems = [];
  const lines = text.split("\\n").map(s => s.trim()).filter(s => s && !s.startsWith("#"));
  let copyAll = -1, install = -1, hasUser = false;

  lines.forEach((line, i) => {
    const [cmd, ...rest] = line.split(/\\s+/);
    const op = cmd.toUpperCase();
    const args = rest.join(" ");
    if (op === "FROM") {
      const image = rest[0] || "";
      if (!image.includes(":") || image.endsWith(":latest")) problems.push("latest");
    }
    if (op === "COPY" && args === ". ." && copyAll < 0) copyAll = i;
    if (op === "RUN" && /npm (ci|install)/.test(args) && install < 0) install = i;
    if (op === "USER") hasUser = true;
    if (op === "ENV" && /(PASSWORD|SECRET|TOKEN|KEY)/i.test(args.split("=")[0])) problems.push("secret");
  });

  if (copyAll >= 0 && install >= 0 && copyAll < install) problems.push("cache");
  if (!hasUser) problems.push("root");
  return [...new Set(problems)];
}

console.log("bad:", lintDockerfile(bad));
console.log("good:", lintDockerfile(good));`}},

/* ---------- деплой ---------- */
{id:"env-config",l:"deploy",t:"Проверка окружения при запуске",mode:"js",
 task:"Самая обидная ошибка деплоя — сервер запустился, а через час упал, потому что забыли переменную окружения. Правильно — проверить всё при старте и сразу сказать, чего не хватает.\n\nНапиши <code>loadConfig(env)</code>, где <code>env</code> — объект как <code>process.env</code>. Верни <code>{ port, databaseUrl, nodeEnv, isProd }</code>:\n- <code>DATABASE_URL</code> — обязательна и начинается с <code>postgres://</code> или <code>postgresql://</code>\n- <code>PORT</code> — по умолчанию <code>3000</code>; целое число от 1 до 65535, вернуть числом\n- <code>NODE_ENV</code> — <code>development</code>, <code>production</code> или <code>test</code>; по умолчанию <code>development</code>\n- <code>isProd</code> — <code>true</code>, если <code>NODE_ENV</code> — production\n\nЕсли проблем несколько — брось одну ошибку, в тексте которой перечислены <b>все</b> плохие переменные, чтобы не чинить их по одной.",
 files:{js:`function loadConfig(env) {
  const errors = [];
  // проверь переменные и собери ошибки
  return {};
}

console.log(loadConfig({ DATABASE_URL: "postgres://user:pass@db.neon.tech/app", PORT: "8080" }));
`},
 hints:["Собирай все проблемы в массив errors, а в конце: if (errors.length) throw new Error(errors.join(\"; \")).","Число из строки: Number(env.PORT). Целое — Number.isInteger(n).","Пустая строка — это тоже «не задано»: проверяй через if (!env.DATABASE_URL)."],
 tests:[["Правильные значения","const c = loadConfig({ DATABASE_URL: 'postgresql://u:p@h/db', PORT: '8080', NODE_ENV: 'production' }); return c.port === 8080 && c.databaseUrl === 'postgresql://u:p@h/db' && c.nodeEnv === 'production' && c.isProd === true"],
        ["Значения по умолчанию","const c = loadConfig({ DATABASE_URL: 'postgres://h/db' }); return c.port === 3000 && c.nodeEnv === 'development' && c.isProd === false"],
        ["Нет DATABASE_URL — ошибка","let e; try { loadConfig({}); } catch (x) { e = x; } return !!e && e.message.includes('DATABASE_URL')"],
        ["Неправильный адрес базы","let e; try { loadConfig({ DATABASE_URL: 'mysql://h/db' }); } catch (x) { e = x; } return !!e && e.message.includes('DATABASE_URL')"],
        ["Неправильный порт","for (const p of ['abc', '0', '70000', '80.5']) { let e; try { loadConfig({ DATABASE_URL: 'postgres://h/db', PORT: p }); } catch (x) { e = x; } ok(e && e.message.includes('PORT'), 'PORT=' + p + ' должен давать ошибку'); } return true"],
        ["Все проблемы в одной ошибке","let e; try { loadConfig({ PORT: 'abc', NODE_ENV: 'prod' }); } catch (x) { e = x; } ok(e, 'Ожидалась ошибка'); return ['DATABASE_URL', 'PORT', 'NODE_ENV'].every(n => e.message.includes(n))"]],
 sol:{js:`function loadConfig(env) {
  const errors = [];

  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) errors.push("DATABASE_URL не задана");
  else if (!/^postgres(ql)?:\\/\\//.test(databaseUrl)) errors.push("DATABASE_URL должна начинаться с postgres://");

  const port = env.PORT ? Number(env.PORT) : 3000;
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push("PORT должен быть целым числом от 1 до 65535");

  const nodeEnv = env.NODE_ENV || "development";
  if (!["development", "production", "test"].includes(nodeEnv)) errors.push("NODE_ENV: development, production или test");

  if (errors.length) throw new Error("Неверная конфигурация: " + errors.join("; "));
  return { port, databaseUrl, nodeEnv, isProd: nodeEnv === "production" };
}

console.log(loadConfig({ DATABASE_URL: "postgres://user:pass@db.neon.tech/app", PORT: "8080" }));`}},

/* ---------- связка фронта и бэка: CORS ---------- */
{id:"api-cors",l:"fs-integration",t:"CORS для своего фронтенда",mode:"api",
 task:"Фронтенд на <code>localhost:5173</code> обращается к API на другом адресе — браузер такие запросы блокирует, пока сервер явно не разрешит. Это и есть CORS. Напиши middleware без готовых библиотек.\n\nРазрешённые адреса уже в массиве <code>ALLOWED</code>. Если заголовок <code>Origin</code> запроса есть в списке:\n- <code>Access-Control-Allow-Origin</code> — этот самый origin (не звёздочка: с cookie звёздочка не работает)\n- <code>Access-Control-Allow-Credentials: true</code>\n- <code>Vary: Origin</code> — чтобы кеш не отдал чужой ответ\n\nЗапрос <code>OPTIONS</code> (браузер спрашивает разрешения заранее) от разрешённого адреса — сразу ответ <b>204</b> с заголовками <code>Access-Control-Allow-Methods: GET,POST,PUT,DELETE</code> и <code>Access-Control-Allow-Headers: Content-Type</code>.\n\nДля чужих адресов CORS-заголовков быть не должно.",
 files:{js:API_START + `
const ALLOWED = ["http://localhost:5173", "https://studio.example.com"];

// app.use((req, res, next) => { ... });

app.get("/api/projects", (req, res) => {
  res.json([{ id: 1, title: "Лендинг" }]);
});

app.listen(3000);
`},
 hints:["Origin читается так: req.headers.origin. Проверка: ALLOWED.includes(origin).","Заголовки ставятся через res.set(\"Имя\", \"значение\"). Не забудь вызвать next() для обычных запросов.","Для preflight: if (req.method === \"OPTIONS\") return res.status(204).end();"],
 tests:[["Разрешённый origin получает заголовки","const r = await call('GET', '/api/projects', null, { Origin: 'http://localhost:5173' }); ok(r.status === 200, 'Статус ' + r.status); ok(r.headers['access-control-allow-origin'] === 'http://localhost:5173', 'Allow-Origin: ' + r.headers['access-control-allow-origin']); return r.headers['access-control-allow-credentials'] === 'true'"],
        ["Vary: Origin","const r = await call('GET', '/api/projects', null, { Origin: 'https://studio.example.com' }); return /origin/i.test(r.headers['vary'] || '')"],
        ["Чужой origin — без CORS-заголовков","const r = await call('GET', '/api/projects', null, { Origin: 'https://evil.example' }); ok(!r.headers['access-control-allow-origin'], 'Чужому сайту выдано разрешение'); return r.status === 200"],
        ["Preflight → 204 с методами и заголовками","const r = await call('OPTIONS', '/api/projects', null, { Origin: 'http://localhost:5173' }); ok(r.status === 204, 'Статус ' + r.status + ', ожидался 204'); ok(/POST/.test(r.headers['access-control-allow-methods'] || ''), 'Нет Allow-Methods'); return /content-type/i.test(r.headers['access-control-allow-headers'] || '')"],
        ["Обычный запрос без Origin работает","const r = await call('GET', '/api/projects'); return r.status === 200 && Array.isArray(r.body)"]],
 sol:{js:API_START + `
const ALLOWED = ["http://localhost:5173", "https://studio.example.com"];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).end();
    }
  }
  next();
});

app.get("/api/projects", (req, res) => {
  res.json([{ id: 1, title: "Лендинг" }]);
});

app.listen(3000);
`}},

/* ---------- связка фронта и бэка: валидация формы ---------- */
{id:"form-validate",l:"fs-next-api",t:"Проверка данных формы",mode:"js",
 task:"Одни и те же правила проверки формы нужны дважды: в браузере — чтобы сразу подсветить ошибку, и на сервере — потому что браузеру верить нельзя. Поэтому правила описывают один раз схемой, как в библиотеке Zod.\n\nНапиши <code>validate(schema, data)</code>. Схема — объект: поле → правила:\n- <code>type</code>: <code>\"string\"</code>, <code>\"number\"</code> или <code>\"email\"</code>\n- <code>required</code>: <code>true</code>, если поле обязательное\n- <code>min</code>, <code>max</code>: для строк — длина, для чисел — значение\n\nВерни <code>{ ok: true, data }</code> или <code>{ ok: false, errors }</code>, где <code>errors</code> — объект «поле → текст ошибки» для всех плохих полей сразу. В <code>data</code> строки обрезаны от пробелов по краям, а числа из строки <code>\"15000\"</code> превращены в <code>15000</code>. Поля не из схемы в <code>data</code> не попадают. Необязательное пустое поле просто пропускается.",
 files:{js:`const schema = {
  name:   { type: "string", required: true, min: 2, max: 60 },
  email:  { type: "email", required: true },
  budget: { type: "number", min: 0 },
};

function validate(schema, data) {
  const errors = {};
  const clean = {};
  // проверь каждое поле схемы
  return { ok: true, data: clean };
}

console.log(validate(schema, { name: "  Анна ", email: "anna@mail.ru", budget: "15000", isAdmin: true }));
console.log(validate(schema, { name: "А", email: "не почта" }));
`},
 hints:["Перебери поля схемы: for (const [field, rule] of Object.entries(schema)). Значение — data[field]; строки сразу обрежь через trim().","Пустое значение — undefined, null или пустая строка. Если поле обязательное — ошибка, если нет — continue.","Для email хватит простой проверки: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value). Для числа: Number(value), а потом Number.isNaN."],
 tests:[["Хорошие данные очищаются","const r = validate(schema, { name: '  Анна ', email: ' anna@mail.ru ', budget: '15000' }); ok(r.ok === true, 'ok должен быть true: ' + JSON.stringify(r.errors)); return r.data.name === 'Анна' && r.data.email === 'anna@mail.ru' && r.data.budget === 15000"],
        ["Лишние поля отбрасываются","const r = validate(schema, { name: 'Анна', email: 'a@b.ru', isAdmin: true }); return r.ok && !('isAdmin' in r.data)"],
        ["Все ошибки сразу","const r = validate(schema, { name: 'А', email: 'не почта', budget: '-5' }); ok(r.ok === false, 'ok должен быть false'); return ['name', 'email', 'budget'].every(f => typeof r.errors[f] === 'string' && r.errors[f].length > 0)"],
        ["Обязательные поля","const r = validate(schema, { name: '   ' }); return !r.ok && !!r.errors.name && !!r.errors.email && !r.errors.budget"],
        ["Необязательное пустое поле пропускается","const r = validate(schema, { name: 'Анна', email: 'a@b.ru', budget: '' }); return r.ok && !('budget' in r.data)"],
        ["Не число и слишком длинная строка","const r = validate(schema, { name: 'А'.repeat(61), email: 'a@b.ru', budget: 'много' }); return !r.ok && !!r.errors.name && !!r.errors.budget"]],
 sol:{js:`const schema = {
  name:   { type: "string", required: true, min: 2, max: 60 },
  email:  { type: "email", required: true },
  budget: { type: "number", min: 0 },
};

function validate(schema, data) {
  const errors = {};
  const clean = {};

  for (const [field, rule] of Object.entries(schema)) {
    let value = data[field];
    if (typeof value === "string") value = value.trim();

    if (value === undefined || value === null || value === "") {
      if (rule.required) errors[field] = "Обязательное поле";
      continue;
    }

    if (rule.type === "number") {
      const n = Number(value);
      if (Number.isNaN(n)) { errors[field] = "Должно быть числом"; continue; }
      if (rule.min !== undefined && n < rule.min) { errors[field] = "Не меньше " + rule.min; continue; }
      if (rule.max !== undefined && n > rule.max) { errors[field] = "Не больше " + rule.max; continue; }
      clean[field] = n;
    } else {
      const s = String(value);
      if (rule.type === "email" && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(s)) { errors[field] = "Неверный email"; continue; }
      if (rule.min !== undefined && s.length < rule.min) { errors[field] = "Минимум " + rule.min + " символа"; continue; }
      if (rule.max !== undefined && s.length > rule.max) { errors[field] = "Максимум " + rule.max + " символов"; continue; }
      clean[field] = s;
    }
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: clean };
}

console.log(validate(schema, { name: "  Анна ", email: "anna@mail.ru", budget: "15000", isAdmin: true }));
console.log(validate(schema, { name: "А", email: "не почта" }));`}}
);
