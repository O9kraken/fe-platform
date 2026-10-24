@@ 0

### На пальцах
DOM — это живой макет страницы, который браузер собрал из HTML. JavaScript может взять в руки любую деталь макета. `querySelector` — найти деталь по описанию («кнопка с классом buy»). `textContent` — заменить надпись на детали. `classList` — повесить или снять с неё ярлык, от которого зависит внешний вид.

### Как это работает
Поиск:

- `document.querySelector("css-селектор")` — первый подходящий элемент или `null`.
- `document.querySelectorAll("селектор")` — все подходящие (список, по нему можно идти `for...of` или `forEach`).
- Искать можно и внутри элемента: `card.querySelector(".price")`.

Текст и атрибуты:

- `el.textContent = "текст"` — безопасно заменить текст.
- `el.value` — значение поля ввода.
- `el.getAttribute("href")`, `el.setAttribute("href", "...")`, `el.dataset.id` — данные из `data-id="..."`.

Классы — главный способ менять внешний вид из JS, а сами стили держать в CSS:

- `el.classList.add("open")`, `remove("open")`, `toggle("open")`, `contains("open")`.

### Пример
```html
<h1 class="title">Корзина</h1>
<p class="count">Товаров: 0</p>
<div class="modal">Окно</div>
```

```js
const title = document.querySelector(".title");
const count = document.querySelector(".count");
const modal = document.querySelector(".modal");

title.textContent = "Ваша корзина";
count.textContent = `Товаров: ${3}`;
modal.classList.add("is-open");

for (const p of document.querySelectorAll("p")) {
  p.classList.toggle("highlight");
}
```

```css
.modal { display: none; }
.modal.is-open { display: block; }
```

### Частые ошибки
- Забыть точку в селекторе класса: `querySelector("title")` ищет тег `<title>`.
- Работать с результатом `querySelector`, не проверив, что он не `null`.
- Менять стили через `el.style.color = ...` повсюду вместо переключения классов.

### Мини-задание
Сделай страницу с заголовком, абзацем и кнопкой. Из консоли (или из `app.js`) поменяй текст заголовка, добавь абзацу класс `highlight` со жёлтым фоном и прочитай атрибут `data-price` у кнопки.

@@ 1

### На пальцах
`createElement` — сделать новую деталь для макета: пока она лежит у тебя в руках и на странице её нет. `append` — прикрутить деталь в нужное место. `remove` — открутить и выбросить.

### Как это работает
1. `document.createElement("li")` — создать элемент. Он существует, но не на странице.
2. Настроить: `textContent`, `className`, атрибуты, вложенные элементы.
3. Вставить: `parent.append(el)` — в конец родителя, `parent.prepend(el)` — в начало, `el.before(other)` / `el.after(other)` — рядом.
4. Удалить: `el.remove()`.

Очистить контейнер: `list.replaceChildren()` или `list.textContent = ""`.

Есть и быстрый путь — `innerHTML` с готовой HTML-строкой. Но он опасен с пользовательскими данными: если в тексте окажется `<img src=x onerror="...">`, этот код выполнится. Для пользовательского текста всегда используй `textContent`.

Если элементов много, их можно собрать в `DocumentFragment` и вставить разом — браузер перерисует страницу один раз.

### Пример
```html
<input id="taskInput" placeholder="Новая задача">
<button id="addBtn">Добавить</button>
<ul id="list"></ul>
```

```js
const input = document.querySelector("#taskInput");
const list = document.querySelector("#list");

document.querySelector("#addBtn").addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement("li");
  li.textContent = text;                      // безопасно для любого текста

  const del = document.createElement("button");
  del.textContent = "✕";
  del.addEventListener("click", () => li.remove());

  li.append(" ", del);
  list.append(li);
  input.value = "";
});
```

### Частые ошибки
- Создать элемент и забыть вставить на страницу.
- `innerHTML += "<li>" + userText + "</li>"` — дыра для XSS и пересоздание всех элементов списка.
- Вставлять элементы по одному в цикле на тысячу штук — медленно, используй фрагмент или собери разом.

### Мини-задание
Сделай список покупок: поле, кнопка «Добавить» и список. У каждой покупки — кнопка удаления. Проверь, что ввод `<b>жирный</b>` отображается как текст, а не как жирный шрифт.

@@ 2

### На пальцах
Событие — звонок в дверь. `addEventListener` — договориться: «когда позвонят, я открою». `event.target` — увидеть в глазок, кто именно позвонил. `preventDefault` — «не делай того, что обычно делаешь»: например, не перезагружай страницу при отправке формы, я сам разберусь.

### Как это работает
```js
element.addEventListener("тип", (event) => { ... });
```

Частые типы событий:

| Событие | Когда |
|---|---|
| `click` | клик или Enter на кнопке |
| `input` | каждое изменение текста в поле |
| `change` | значение изменили и ушли с поля (select, checkbox) |
| `submit` | отправка формы (кнопкой или Enter) |
| `keydown` | нажатие клавиши |
| `DOMContentLoaded` | HTML загружен |

Объект `event`:

- `event.target` — элемент, на котором произошло событие.
- `event.currentTarget` — элемент, на котором висит обработчик.
- `event.preventDefault()` — отменить действие браузера: отправку формы, переход по ссылке.
- `event.key` — какая клавиша нажата.

Для форм слушай `submit` на самой форме, а не `click` на кнопке: так сработает и Enter в поле.

### Пример
```html
<form id="subscribe">
  <input name="email" type="email" required>
  <button>Подписаться</button>
</form>
<p id="result"></p>
```

```js
const form = document.querySelector("#subscribe");
const result = document.querySelector("#result");

form.addEventListener("submit", (event) => {
  event.preventDefault();                       // не перезагружаем страницу
  const email = new FormData(form).get("email");
  result.textContent = `Спасибо! Письмо придёт на ${email}`;
  form.reset();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") result.textContent = "";
});
```

### Частые ошибки
- Передать результат вызова: `addEventListener("click", handle())`.
- Слушать `click` на кнопке отправки и забыть про Enter.
- Без `preventDefault` форма перезагружает страницу, и все изменения исчезают за долю секунды.

### Мини-задание
Сделай форму с полем имени. По отправке без перезагрузки выводи под формой «Привет, Имя!». Добавь счётчик символов под полем, который обновляется при каждом вводе (событие `input`).

@@ 3

### На пальцах
Вместо того чтобы ставить охранника у каждой двери в офисе, ставят одного на входе в этаж. Он видит, к какой двери пошёл посетитель, и решает, что делать. Это делегирование: один обработчик на родителе вместо сотни на детях.

### Как это работает
События «всплывают»: клик по кнопке внутри карточки внутри списка сначала срабатывает на кнопке, потом на карточке, потом на списке, потом на `document`. Поэтому обработчик на родителе узнаёт о кликах по всем детям.

Как делегировать:

1. Вешаешь один обработчик на общий контейнер.
2. Внутри находишь нужный элемент: `event.target.closest(".delete")` — ближайший предок (или сам элемент) с этим селектором.
3. Если нашёлся — действуешь. Нужные данные удобно хранить в `data-` атрибутах.

Плюсы:

- Один обработчик вместо сотни — меньше памяти.
- Работает для элементов, добавленных позже. Не нужно навешивать обработчики на каждую новую карточку.

`closest` важен потому, что `event.target` может оказаться иконкой или `span` внутри кнопки, а не самой кнопкой.

### Пример
```html
<ul id="todos">
  <li data-id="1">Сверстать шапку <button class="delete">✕</button></li>
  <li data-id="2">Подключить форму <button class="delete">✕</button></li>
</ul>
```

```js
const list = document.querySelector("#todos");

list.addEventListener("click", (event) => {
  const btn = event.target.closest(".delete");
  if (!btn) return;                          // кликнули не по кнопке удаления

  const li = btn.closest("li");
  console.log("Удаляю задачу", li.dataset.id);
  li.remove();
});

// Новый элемент тоже будет удаляться — без нового обработчика
list.insertAdjacentHTML("beforeend",
  '<li data-id="3">Задеплоить <button class="delete">✕</button></li>');
```

### Частые ошибки
- Проверять `event.target.classList.contains("delete")` — не сработает, если клик пришёлся на иконку внутри кнопки.
- Навешивать обработчик каждой карточке внутри цикла отрисовки, а потом удивляться, что после перерисовки клики срабатывают по два раза.
- Забыть `return`, когда клик был не по нужному элементу.

### Мини-задание
Сделай галерею из 6 карточек с кнопками «В избранное». Одним обработчиком на контейнере переключай у карточки класс `is-fav`. Добавь кнопку, которая создаёт новую карточку, и убедись, что избранное работает и для неё.

@@ 4

### На пальцах
`localStorage` — ящик стола в браузере: туда можно положить записку, закрыть вкладку, выключить компьютер — и завтра записка будет на месте. Но в ящик кладут только листы бумаги (строки). Объект сначала нужно «записать на бумагу» — `JSON.stringify`, а достав, «прочитать обратно» — `JSON.parse`.

### Как это работает
- `localStorage.setItem("ключ", "строка")` — сохранить.
- `localStorage.getItem("ключ")` — прочитать. Если ничего нет — `null`.
- `localStorage.removeItem("ключ")`, `localStorage.clear()` — удалить.
- Хранит только строки, примерно 5 МБ на сайт, только в этом браузере на этом устройстве.

JSON — текстовый формат записи данных:

- `JSON.stringify(obj)` → строка `'{"name":"Анна"}'`.
- `JSON.parse(str)` → обратно объект.

Безопасное чтение: если данных нет или они испорчены, `JSON.parse` упадёт — оборачивай в `try/catch` и давай значение по умолчанию.

Что не хранить: пароли, токены и любые секреты — любой скрипт на странице может их прочитать. В приватном режиме хранилище может не работать или очищаться.

### Пример
```js
const KEY = "todos";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

let todos = loadTodos();
todos.push({ id: Date.now(), text: "Выучить JSON", done: false });
saveTodos(todos);

console.log(localStorage.getItem(KEY));  // строка: [{"id":...,"text":"Выучить JSON","done":false}]
```

Посмотреть содержимое: DevTools → Application → Local Storage.

### Частые ошибки
- `localStorage.setItem("user", user)` без `stringify` — сохранится строка `"[object Object]"`.
- Читать без `parse` и работать со строкой как с массивом.
- Хранить там пароль или токен доступа.

### Мини-задание
Доработай список задач из прошлых пунктов: сохраняй его в `localStorage` при каждом изменении и загружай при открытии страницы. Обнови страницу — задачи должны остаться. Найди их во вкладке Application.
