/* Интерактивные схемы к темам курса. Каждая схема — {title, lead, render(el)}.
   Все цвета берутся из CSS-переменных темы, поэтому схемы работают в светлой и тёмной теме. */

const vEsc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
let vzSeq = 0;
const vid = p => p + "-" + (++vzSeq);

const VIZ = {};

/* ---------- 1. Путь запроса ---------- */
VIZ.url = {
  title:"Путь запроса: от адреса до страницы",
  lead:"Нажимай «Дальше» и смотри, кто с кем разговаривает, пока ты ждёшь страницу.",
  render(el){
    const nodes = [["Браузер",70],["DNS",255],["Сервер",440],["База",625]];
    const steps = [
      {at:0, t:"Ты вводишь адрес. Браузер разбирает его на части: протокол, домен, путь, параметры."},
      {from:0, to:1, t:"Браузер спрашивает у DNS: «Какой IP у shop.example.com?» Это как найти номер в телефонной книге."},
      {from:1, to:0, t:"DNS отвечает: 93.184.216.34. Теперь браузер знает, куда стучаться."},
      {from:0, to:2, t:"Браузер отправляет запрос GET /catalog?color=red через HTTPS: соединение зашифровано."},
      {from:2, to:3, t:"Сервер просит у базы данных товары: SELECT * FROM products WHERE color = 'red'."},
      {from:3, to:2, t:"База возвращает строки с товарами."},
      {from:2, to:0, t:"Сервер собирает HTML или JSON и отвечает: 200 OK."},
      {at:0, t:"Браузер строит DOM, загружает CSS и JS и рисует страницу. Вся дорога заняла доли секунды."}
    ];
    el.innerHTML = `
      <label class="vz-field">Адрес<input type="text" class="vz-url" value="https://shop.example.com/catalog?color=red#reviews" spellcheck="false"></label>
      <div class="vz-urlparts" aria-live="polite"></div>
      <div class="vz-scroll"><svg viewBox="0 0 700 150" class="vz-svg" role="img" aria-label="Схема пути запроса">
        <line x1="70" y1="75" x2="625" y2="75" class="vz-wire"/>
        ${nodes.map(([n, x]) => `<g class="vz-node" data-x="${x}"><rect x="${x - 62}" y="45" width="124" height="60" rx="12"/><text x="${x}" y="80">${n}</text></g>`).join("")}
        <circle class="vz-packet" r="11" cx="70" cy="75"/>
      </svg></div>
      <p class="vz-say" aria-live="polite"></p>
      <div class="row"><button class="btn ghost sm vz-prev">← Назад</button><button class="btn sm vz-next">Дальше →</button><span class="hint vz-count"></span></div>`;
    let i = 0;
    const pk = el.querySelector(".vz-packet");
    const draw = () => {
      const s = steps[i];
      const x = s.at != null ? nodes[s.at][1] : nodes[s.to][1];
      pk.setAttribute("cx", x);
      el.querySelectorAll(".vz-node").forEach((g, k) => g.classList.toggle("on", k === (s.at != null ? s.at : s.to) || k === s.from));
      el.querySelector(".vz-say").textContent = s.t;
      el.querySelector(".vz-count").textContent = `Шаг ${i + 1} из ${steps.length}`;
      el.querySelector(".vz-prev").disabled = i === 0;
      el.querySelector(".vz-next").textContent = i === steps.length - 1 ? "Сначала ↺" : "Дальше →";
    };
    const parts = () => {
      const box = el.querySelector(".vz-urlparts");
      try{
        const u = new URL(el.querySelector(".vz-url").value);
        box.innerHTML = [["протокол", u.protocol], ["домен", u.hostname], ["порт", u.port || (u.protocol === "https:" ? "443 по умолчанию" : "80 по умолчанию")], ["путь", u.pathname], ["параметры", u.search || "—"], ["якорь", u.hash || "—"]]
          .map(([k, v], n) => `<span class="vz-part p${n}"><small>${k}</small>${vEsc(v)}</span>`).join("");
      }catch(e){ box.innerHTML = '<span class="hint">Это не похоже на адрес. Начни с https://</span>'; }
    };
    el.querySelector(".vz-next").onclick = () => { i = i === steps.length - 1 ? 0 : i + 1; draw(); };
    el.querySelector(".vz-prev").onclick = () => { if(i > 0){ i--; draw(); } };
    el.querySelector(".vz-url").oninput = parts;
    parts(); draw();
  }
};

/* ---------- 2. Git ---------- */
VIZ.git = {
  title:"Git: коммиты, ветки и слияние",
  lead:"Делай коммиты, создай ветку, переключайся и сливай. Справа появляются команды, которые ты бы набрал в терминале.",
  render(el){
    let commits, branches, head, log, n;
    const reset = () => { commits = [{id:"c1", br:"main", parents:[], x:0}]; branches = {main:"c1"}; head = "main"; log = ["git init", 'git commit -m "Первый коммит"']; n = 1; };
    reset();
    el.innerHTML = `<div class="vz-split"><div class="vz-scroll"><svg viewBox="0 0 640 170" class="vz-svg vz-git" role="img" aria-label="Граф коммитов"></svg></div>
      <pre class="vz-term" aria-live="polite"></pre></div>
      <div class="row vz-wrap">
        <button class="btn sm" data-g="commit">Коммит</button>
        <button class="btn ghost sm" data-g="branch">Ветка feature</button>
        <button class="btn ghost sm" data-g="switch">Переключиться</button>
        <button class="btn ghost sm" data-g="merge">Слить feature в main</button>
        <button class="btn ghost sm" data-g="reset">Сначала</button>
      </div><p class="vz-say" aria-live="polite"></p>`;
    const say = t => el.querySelector(".vz-say").textContent = t;
    const draw = () => {
      const y = {main:55, feature:125};
      const pos = c => [40 + c.x * 70, y[c.br]];
      let svg = "";
      commits.forEach(c => c.parents.forEach(p => { const pc = commits.find(q => q.id === p); const [x1, y1] = pos(pc), [x2, y2] = pos(c);
        svg += `<path d="M${x1} ${y1} C ${x1 + 35} ${y1}, ${x2 - 35} ${y2}, ${x2} ${y2}" class="vz-edge ${c.br}"/>`; }));
      commits.forEach(c => { const [x, yy] = pos(c); svg += `<circle cx="${x}" cy="${yy}" r="13" class="vz-commit ${c.br}"/><text x="${x}" y="${yy + 4}" class="vz-ctext">${c.id}</text>`; });
      Object.entries(branches).forEach(([b, id]) => { const c = commits.find(q => q.id === id); const [x, yy] = pos(c);
        svg += `<text x="${x}" y="${yy - 22}" class="vz-blabel ${b}">${b}${head === b ? " ← HEAD" : ""}</text>`; });
      svg += `<text x="6" y="59" class="vz-lane">main</text>` + (branches.feature ? `<text x="6" y="129" class="vz-lane">feature</text>` : "");
      el.querySelector(".vz-git").innerHTML = svg;
      el.querySelector(".vz-term").textContent = log.map(l => "$ " + l).join("\n");
      el.querySelector('[data-g="switch"]').textContent = branches.feature ? `Переключиться на ${head === "main" ? "feature" : "main"}` : "Переключиться";
      el.querySelector('[data-g="switch"]').disabled = !branches.feature;
      el.querySelector('[data-g="merge"]').disabled = !branches.feature || head !== "main";
      el.querySelector('[data-g="branch"]').disabled = !!branches.feature;
      el.querySelector('[data-g="commit"]').disabled = commits.length > 8;
    };
    el.querySelectorAll("[data-g]").forEach(b => b.onclick = () => {
      const a = b.dataset.g;
      const maxX = () => Math.max(...commits.map(c => c.x));
      if(a === "commit"){ n++; const id = "c" + n; commits.push({id, br:head, parents:[branches[head]], x:maxX() + 1}); branches[head] = id; log.push(`git commit -m "Изменение ${n}"`); say(`Новый коммит ${id} в ветке ${head}. Он помнит своего родителя — так строится история.`); }
      if(a === "branch"){ branches.feature = branches[head]; head = "feature"; log.push("git switch -c feature"); say("Ветка — это просто подвижный указатель на коммит. Новые коммиты пойдут в feature, а main останется нетронутой."); }
      if(a === "switch"){ head = head === "main" ? "feature" : "main"; log.push("git switch " + head); say(`Теперь HEAD смотрит на ${head}. Файлы в папке стали такими, как в последнем коммите этой ветки.`); }
      if(a === "merge"){ n++; const id = "c" + n; commits.push({id, br:"main", parents:[branches.main, branches.feature], x:maxX() + 1}); branches.main = id; log.push("git merge feature"); say(`Коммит слияния ${id} соединил две истории: у него два родителя.`); }
      if(a === "reset"){ reset(); say(""); }
      draw();
    });
    draw(); say("Начни с пары коммитов, потом создай ветку.");
  }
};

/* ---------- 3. Специфичность ---------- */
function specOf(sel){
  let a = 0, b = 0, c = 0;
  String(sel).replace(/"[^"]*"|'[^']*'/g, "").split(",")[0].split(/\s*[>+~]\s*|\s+/).filter(Boolean).forEach(part => {
    let p = part.replace(/:(where)\([^)]*\)/g, "");
    p = p.replace(/:(not|is|has)\(([^)]*)\)/g, (_, f, inner) => { const s = specOf(inner); a += s[0]; b += s[1]; c += s[2]; return ""; });
    a += (p.match(/#[\w-]+/g) || []).length;
    b += (p.match(/\.[\w-]+/g) || []).length + (p.match(/\[[^\]]*\]/g) || []).length + (p.match(/(^|[^:]):(?!:)[\w-]+/g) || []).length;
    c += (p.match(/::[\w-]+/g) || []).length + (/^[a-zA-Z][\w-]*/.test(p) ? 1 : 0);
  });
  return [a, b, c];
}
VIZ.spec = {
  title:"Специфичность: кто победит",
  lead:"Впиши два селектора для одного элемента. Сравнение идёт слева направо: сначала id, потом классы, потом теги.",
  render(el){
    el.innerHTML = `<div class="vz-two">
      <label class="vz-field">Селектор А<input type="text" class="vz-a" value="#promo p" spellcheck="false"></label>
      <label class="vz-field">Селектор Б<input type="text" class="vz-b" value=".card .note.big" spellcheck="false"></label></div>
      <div class="vz-specs" aria-live="polite"></div>
      <div class="row vz-wrap"><span class="hint">Примеры:</span>${["nav a:hover","ul li a","#main .btn","a[href^=https]","p::first-line","body .page .card .title"].map(x => `<button class="chip" data-ex="${vEsc(x)}">${vEsc(x)}</button>`).join("")}</div>`;
    let last = "b";
    const draw = () => {
      const A = el.querySelector(".vz-a").value, B = el.querySelector(".vz-b").value;
      const sa = specOf(A), sb = specOf(B);
      const cmp = sa[0] - sb[0] || sa[1] - sb[1] || sa[2] - sb[2];
      const card = (name, s, sel, win) => `<div class="vz-spec ${win ? "win" : ""}"><b>${name}</b><code>${vEsc(sel) || "—"}</code>
        <div class="vz-digits"><span><i>${s[0]}</i>id</span><span><i>${s[1]}</i>классы, атрибуты, :псевдоклассы</span><span><i>${s[2]}</i>теги, ::псевдоэлементы</span></div></div>`;
      el.querySelector(".vz-specs").innerHTML = card("А", sa, A, cmp > 0) + card("Б", sb, B, cmp < 0) +
        `<p class="vz-say">${cmp === 0 ? "Ничья по весу — победит правило, которое стоит ниже в CSS-файле." : `Побеждает ${cmp > 0 ? "А" : "Б"}: ${sa[0] !== sb[0] ? "у него больше id" : sa[1] !== sb[1] ? "id поровну, но больше классов" : "id и классов поровну, но больше тегов"}.`} <code>!important</code> перебивает всё это, поэтому его избегают.</p>`;
    };
    el.querySelectorAll("input").forEach(i => { i.oninput = draw; i.onfocus = () => last = i.classList.contains("vz-a") ? "a" : "b"; });
    el.querySelectorAll("[data-ex]").forEach(b => b.onclick = () => { el.querySelector(".vz-" + last).value = b.dataset.ex; draw(); });
    draw();
  }
};

/* ---------- 4. Блочная модель ---------- */
VIZ.box = {
  title:"Блочная модель: из чего складывается ширина",
  lead:"Двигай ползунки и смотри, как меняется реальная ширина элемента. Потом переключи box-sizing.",
  render(el){
    const ctl = [["width","Ширина",60,260,180],["padding","padding",0,40,16],["border","border",0,20,4],["margin","margin",0,40,16]];
    el.innerHTML = `<div class="vz-split">
      <div class="vz-controls">${ctl.map(([k, l, a, b, v]) => `<label class="vz-range">${l} <output>${v}px</output><input type="range" min="${a}" max="${b}" value="${v}" data-k="${k}"></label>`).join("")}
        <label class="vz-check"><input type="checkbox" class="vz-bs"> box-sizing: border-box</label></div>
      <div class="vz-stage vz-boxstage"><div class="bm-margin"><div class="bm-el"><div class="bm-content">контент</div></div></div></div></div>
      <pre class="vz-code"></pre><p class="vz-say" aria-live="polite"></p>`;
    const v = {};
    const draw = () => {
      el.querySelectorAll("[data-k]").forEach(r => { v[r.dataset.k] = +r.value; r.previousElementSibling.textContent = r.value + "px"; });
      const bb = el.querySelector(".vz-bs").checked;
      const m = el.querySelector(".bm-margin"), e = el.querySelector(".bm-el");
      m.style.padding = v.margin + "px";
      Object.assign(e.style, {width:v.width + "px", padding:v.padding + "px", borderWidth:v.border + "px", boxSizing:bb ? "border-box" : "content-box"});
      const total = bb ? v.width : v.width + 2 * v.padding + 2 * v.border;
      const content = bb ? Math.max(0, v.width - 2 * v.padding - 2 * v.border) : v.width;
      el.querySelector(".vz-code").textContent = `.box {\n  box-sizing: ${bb ? "border-box" : "content-box"};\n  width: ${v.width}px;\n  padding: ${v.padding}px;\n  border: ${v.border}px solid;\n  margin: ${v.margin}px;\n}`;
      el.querySelector(".vz-say").innerHTML = bb
        ? `С <b>border-box</b> width — это вся коробка: ${v.width}px. Под контент остаётся ${content}px. Так считать проще, поэтому border-box ставят всем элементам.`
        : `С <b>content-box</b> width — только контент. Видимая ширина: ${v.width} + 2×${v.padding} + 2×${v.border} = <b>${total}px</b>. Плюс margin снаружи: ${total + 2 * v.margin}px места на странице.`;
    };
    el.querySelectorAll("input").forEach(i => i.oninput = draw);
    draw();
  }
};

/* ---------- 5. Flexbox ---------- */
VIZ.flex = {
  title:"Flexbox-тренажёр",
  lead:"Меняй свойства контейнера и выполни три мини-задания справа.",
  render(el){
    const opts = {
      "flex-direction":["row","column","row-reverse"],
      "justify-content":["flex-start","center","flex-end","space-between","space-around","space-evenly"],
      "align-items":["stretch","flex-start","center","flex-end"],
      "flex-wrap":["nowrap","wrap"]
    };
    const goals = [
      {t:"Раздвинь элементы по краям", ok:s => s["flex-direction"] === "row" && s["justify-content"] === "space-between"},
      {t:"Поставь всё ровно по центру", ok:s => s["justify-content"] === "center" && s["align-items"] === "center"},
      {t:"Колонка, прижатая к правому краю", ok:s => s["flex-direction"] === "column" && s["align-items"] === "flex-end"}
    ];
    el.innerHTML = `<div class="vz-split">
      <div class="vz-controls">${Object.entries(opts).map(([k, list]) => `<label class="vz-sel">${k}<select data-p="${k}">${list.map(o => `<option>${o}</option>`).join("")}</select></label>`).join("")}
        <label class="vz-range">gap <output>8px</output><input type="range" min="0" max="32" value="8" data-gap></label>
        <label class="vz-range">элементов <output>4</output><input type="range" min="2" max="8" value="4" data-cnt></label></div>
      <div><ul class="vz-goals">${goals.map((g, i) => `<li data-goal="${i}">${g.t}</li>`).join("")}</ul></div></div>
      <div class="vz-flexbox"></div><pre class="vz-code"></pre>`;
    const draw = () => {
      const st = {}; el.querySelectorAll("[data-p]").forEach(s => st[s.dataset.p] = s.value);
      const gap = +el.querySelector("[data-gap]").value, cnt = +el.querySelector("[data-cnt]").value;
      el.querySelector("[data-gap]").previousElementSibling.textContent = gap + "px";
      el.querySelector("[data-cnt]").previousElementSibling.textContent = cnt;
      const box = el.querySelector(".vz-flexbox");
      Object.assign(box.style, {flexDirection:st["flex-direction"], justifyContent:st["justify-content"], alignItems:st["align-items"], flexWrap:st["flex-wrap"], gap:gap + "px"});
      box.innerHTML = Array.from({length:cnt}, (_, i) => `<span style="--h:${[34, 52, 40, 64, 30, 46, 58, 38][i]}px">${i + 1}</span>`).join("");
      el.querySelector(".vz-code").textContent = `.container {\n  display: flex;\n${Object.entries(st).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n  gap: ${gap}px;\n}`;
      goals.forEach((g, i) => el.querySelector(`[data-goal="${i}"]`).classList.toggle("done", g.ok(st)));
    };
    el.querySelectorAll("select,input").forEach(i => i.oninput = draw);
    draw();
  }
};

/* ---------- 6. Grid ---------- */
VIZ.grid = {
  title:"Резиновая сетка: auto-fit и minmax",
  lead:"Сужай контейнер и смотри, как колонки сами перестраиваются без единого медиазапроса.",
  render(el){
    el.innerHTML = `<div class="vz-controls vz-row">
      <label class="vz-range">ширина контейнера <output></output><input type="range" min="180" max="720" value="560" data-w></label>
      <label class="vz-range">мин. ширина колонки <output></output><input type="range" min="60" max="220" value="140" data-m></label>
      <label class="vz-range">gap <output></output><input type="range" min="0" max="24" value="10" data-g></label>
      <label class="vz-sel">режим<select data-f><option>auto-fit</option><option>auto-fill</option></select></label></div>
      <div class="vz-scroll"><div class="vz-grid"></div></div><pre class="vz-code"></pre><p class="vz-say" aria-live="polite"></p>`;
    const draw = () => {
      const w = +el.querySelector("[data-w]").value, m = +el.querySelector("[data-m]").value, g = +el.querySelector("[data-g]").value, f = el.querySelector("[data-f]").value;
      el.querySelector("[data-w]").previousElementSibling.textContent = w + "px";
      el.querySelector("[data-m]").previousElementSibling.textContent = m + "px";
      el.querySelector("[data-g]").previousElementSibling.textContent = g + "px";
      const box = el.querySelector(".vz-grid");
      Object.assign(box.style, {width:w + "px", gridTemplateColumns:`repeat(${f}, minmax(${m}px, 1fr))`, gap:g + "px"});
      box.innerHTML = Array.from({length:5}, (_, i) => `<span>${i + 1}</span>`).join("");
      const cols = Math.max(1, Math.floor((w + g) / (m + g)));
      el.querySelector(".vz-code").textContent = `.gallery {\n  display: grid;\n  grid-template-columns: repeat(${f}, minmax(${m}px, 1fr));\n  gap: ${g}px;\n}`;
      el.querySelector(".vz-say").textContent = `Помещается ${cols} колон${cols === 1 ? "ка" : cols < 5 ? "ки" : "ок"} по ${m}px и больше. ` + (f === "auto-fit" && cols > 5 ? "Элементов всего 5, и auto-fit растягивает их на всю ширину." : f === "auto-fill" && cols > 5 ? "auto-fill оставляет пустые колонки под будущие элементы — видно по ширине карточек." : "Лишнее переносится на следующую строку.");
    };
    el.querySelectorAll("select,input").forEach(i => i.oninput = draw);
    draw();
  }
};

/* ---------- 7. Методы массивов ---------- */
VIZ.arr = {
  title:"map, filter, reduce — конвейер",
  lead:"Выбери метод и проходи по элементам по одному. Так массив и обрабатывается внутри.",
  render(el){
    const items = [{n:"Лендинг", p:35000}, {n:"Логотип", p:8000}, {n:"Магазин", p:90000}, {n:"SEO", p:15000}, {n:"Баннер", p:3000}];
    const M = {
      map:{code:"items.map(s => s.price * 0.9)", txt:"map превращает каждый элемент. Длина результата всегда та же.", step:(s, acc) => ({out:[...acc.out, Math.round(s.p * 0.9)], mark:"→ " + Math.round(s.p * 0.9)})},
      filter:{code:"items.filter(s => s.price > 10000)", txt:"filter пропускает дальше только то, где функция вернула true.", step:(s, acc) => s.p > 10000 ? {out:[...acc.out, s.n], mark:"✓ проходит"} : {out:acc.out, mark:"✕ отсеян"}},
      find:{code:"items.find(s => s.price > 50000)", txt:"find останавливается на первом подходящем элементе.", step:(s, acc) => acc.done ? null : s.p > 50000 ? {out:s.n, mark:"✓ нашёл — стоп", done:true} : {out:acc.out, mark:"✕ дальше"}},
      reduce:{code:"items.reduce((sum, s) => sum + s.price, 0)", txt:"reduce складывает всё в одно значение. sum — копилка, которую передают от шага к шагу.", step:(s, acc) => ({out:(acc.out || 0) + s.p, mark:`${acc.out || 0} + ${s.p} = ${(acc.out || 0) + s.p}`})}
    };
    el.innerHTML = `<div class="chips vz-wrap" role="group" aria-label="Метод">${Object.keys(M).map(k => `<button class="chip" data-m="${k}">${k}</button>`).join("")}</div>
      <pre class="vz-code vz-mcode"></pre>
      <div class="vz-belt">${items.map((s, i) => `<div class="vz-item" data-i="${i}"><b>${s.n}</b><span>${s.p.toLocaleString("ru-RU")} ₽</span><em></em></div>`).join("")}</div>
      <div class="vz-result" aria-live="polite"></div>
      <div class="row"><button class="btn sm vz-step">Следующий элемент →</button><button class="btn ghost sm vz-reset">Сначала</button></div><p class="vz-say"></p>`;
    let m = "map", i = 0, acc = {out:[]};
    const reset = () => { i = 0; acc = {out: m === "reduce" ? 0 : m === "find" ? undefined : []}; el.querySelectorAll(".vz-item").forEach(x => { x.className = "vz-item"; x.querySelector("em").textContent = ""; }); draw(); };
    const draw = () => {
      el.querySelectorAll("[data-m]").forEach(b => b.setAttribute("aria-pressed", b.dataset.m === m));
      el.querySelector(".vz-mcode").textContent = "const result = " + M[m].code + ";";
      el.querySelector(".vz-say").textContent = M[m].txt;
      const out = acc.out;
      el.querySelector(".vz-result").innerHTML = `<span class="hint">result =</span> <code>${vEsc(Array.isArray(out) ? JSON.stringify(out) : out === undefined ? "undefined" : JSON.stringify(out))}</code>`;
      el.querySelector(".vz-step").disabled = i >= items.length || acc.done;
    };
    el.querySelector(".vz-step").onclick = () => {
      const r = M[m].step(items[i], acc); const node = el.querySelector(`[data-i="${i}"]`);
      el.querySelectorAll(".vz-item").forEach(x => x.classList.remove("cur"));
      if(r){ acc = {...acc, ...r}; node.classList.add("cur", /✕/.test(r.mark) ? "no" : "yes"); node.querySelector("em").textContent = r.mark; }
      i++; draw();
    };
    el.querySelector(".vz-reset").onclick = reset;
    el.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { m = b.dataset.m; reset(); });
    reset();
  }
};

/* ---------- 8. Event loop ---------- */
VIZ.loop = {
  title:"Event loop по шагам",
  lead:"Проходи код по шагам и следи за стеком, очередями и консолью.",
  render(el){
    const S1 = {code:['console.log("A");','setTimeout(() => console.log("B"), 0);','Promise.resolve().then(() => console.log("C"));','console.log("D");'], st:[
      {l:-1, s:["main()"], t:"Скрипт начал выполняться: в стеке вызовов главный код."},
      {l:0, s:["main()","console.log(\"A\")"], o:["A"], t:"Обычный вызов выполняется сразу."},
      {l:1, s:["main()","setTimeout()"], w:["таймер 0 мс → B"], o:["A"], t:"setTimeout отдаёт таймер браузеру (Web API) и сразу идёт дальше. Даже 0 мс — это «потом»."},
      {l:1, s:["main()"], ma:["() => log(\"B\")"], o:["A"], t:"Таймер истёк, колбэк встал в очередь задач (макрозадачи). Ждёт, пока стек освободится."},
      {l:2, s:["main()","then()"], mi:["() => log(\"C\")"], ma:["() => log(\"B\")"], o:["A"], t:"Промис уже выполнен, колбэк then встаёт в очередь микрозадач."},
      {l:3, s:["main()","console.log(\"D\")"], mi:["() => log(\"C\")"], ma:["() => log(\"B\")"], o:["A","D"], t:"Синхронный код всегда доходит до конца первым."},
      {l:-1, s:[], mi:["() => log(\"C\")"], ma:["() => log(\"B\")"], o:["A","D"], t:"Стек пуст. Event loop сначала опустошает ВСЕ микрозадачи."},
      {l:-1, s:["() => log(\"C\")"], ma:["() => log(\"B\")"], o:["A","D","C"], t:"Выполнился колбэк промиса."},
      {l:-1, s:["() => log(\"B\")"], o:["A","D","C","B"], t:"Микрозадач больше нет — берётся одна макрозадача: таймер."},
      {l:-1, s:[], o:["A","D","C","B"], t:"Готово: A, D, C, B. Это классический вопрос на собеседовании."}]};
    const S2 = {code:['async function load() {','  console.log("1");','  await null;','  console.log("3");','}','load();','console.log("2");'], st:[
      {l:5, s:["main()","load()"], t:"Вызываем async-функцию. Её код до первого await выполняется сразу."},
      {l:1, s:["main()","load()"], o:["1"], t:"Вывели 1."},
      {l:2, s:["main()"], mi:["продолжение load()"], o:["1"], t:"await ставит остаток функции в очередь микрозадач и возвращает управление."},
      {l:6, s:["main()","console.log(\"2\")"], mi:["продолжение load()"], o:["1","2"], t:"Синхронный код идёт дальше: вывели 2."},
      {l:3, s:["продолжение load()"], o:["1","2","3"], t:"Стек пуст — выполняется микрозадача: остаток функции после await."},
      {l:-1, s:[], o:["1","2","3"], t:"Итог: 1, 2, 3. await — это «подожди, но не блокируй остальных»."}]};
    const SC = {"Таймер и промис":S1, "async / await":S2};
    let sc = S1, i = 0;
    el.innerHTML = `<div class="chips vz-wrap">${Object.keys(SC).map((k, n) => `<button class="chip" data-sc="${n}">${k}</button>`).join("")}</div>
      <div class="vz-loop"><pre class="vz-code vz-lcode"></pre>
      <div class="vz-boxes"><div><h5>Стек вызовов</h5><ul class="vz-q stack"></ul></div><div><h5>Web API</h5><ul class="vz-q web"></ul></div>
        <div><h5>Микрозадачи</h5><ul class="vz-q micro"></ul></div><div><h5>Задачи (таймеры)</h5><ul class="vz-q macro"></ul></div>
        <div class="wide"><h5>Консоль</h5><div class="vz-out"></div></div></div></div>
      <p class="vz-say" aria-live="polite"></p>
      <div class="row"><button class="btn ghost sm vz-prev">← Назад</button><button class="btn sm vz-next">Шаг →</button><span class="hint vz-count"></span></div>`;
    const list = (sel, arr) => el.querySelector(sel).innerHTML = (arr || []).map(x => `<li>${vEsc(x)}</li>`).join("") || '<li class="empty">пусто</li>';
    const draw = () => {
      const s = sc.st[i];
      el.querySelector(".vz-lcode").innerHTML = sc.code.map((c, n) => `<span class="${n === s.l ? "hl" : ""}">${vEsc(c)}</span>`).join("\n");
      list(".stack", [...(s.s || [])].reverse()); list(".web", s.w); list(".micro", s.mi); list(".macro", s.ma);
      el.querySelector(".vz-out").textContent = (s.o || []).join("\n") || " ";
      el.querySelector(".vz-say").textContent = s.t;
      el.querySelector(".vz-count").textContent = `Шаг ${i + 1} из ${sc.st.length}`;
      el.querySelector(".vz-prev").disabled = i === 0;
      el.querySelector(".vz-next").textContent = i === sc.st.length - 1 ? "Сначала ↺" : "Шаг →";
      el.querySelectorAll("[data-sc]").forEach(b => b.setAttribute("aria-pressed", Object.values(SC)[+b.dataset.sc] === sc));
    };
    el.querySelector(".vz-next").onclick = () => { i = i === sc.st.length - 1 ? 0 : i + 1; draw(); };
    el.querySelector(".vz-prev").onclick = () => { if(i) i--; draw(); };
    el.querySelectorAll("[data-sc]").forEach(b => b.onclick = () => { sc = Object.values(SC)[+b.dataset.sc]; i = 0; draw(); });
    draw();
  }
};

/* ---------- 9. Рендер React ---------- */
VIZ.react = {
  title:"Кто перерисовывается в React",
  lead:"Меняй состояние и смотри, какие компоненты рендерятся заново. Потом включи React.memo.",
  render(el){
    const comps = ["App","Header","Counter","Footer"];
    let count = 0, title = "Студия", memo = false; const renders = {App:1, Header:1, Counter:1, Footer:1};
    el.innerHTML = `<div class="vz-split"><div class="vz-tree">
        <div class="vz-comp" data-c="App"><b>&lt;App&gt;</b><small>state: count = <span class="vz-cnt">0</span>, title = «<span class="vz-tt">Студия</span>»</small><i></i>
          <div class="vz-kids">
            <div class="vz-comp" data-c="Header"><b>&lt;Header title&gt;</b><i></i></div>
            <div class="vz-comp" data-c="Counter"><b>&lt;Counter count&gt;</b><i></i></div>
            <div class="vz-comp" data-c="Footer"><b>&lt;Footer&gt;</b><small>без props</small><i></i></div>
          </div></div></div>
      <div class="vz-controls"><button class="btn sm" data-a="inc">setCount(count + 1)</button><button class="btn ghost sm" data-a="title">setTitle("Новая студия")</button>
        <label class="vz-check"><input type="checkbox" class="vz-memo"> React.memo для Header и Footer</label></div></div>
      <p class="vz-say" aria-live="polite">Изменение состояния в App перерисовывает App и всех его детей.</p>`;
    const flash = cs => cs.forEach(c => { renders[c]++; const n = el.querySelector(`[data-c="${c}"]`); n.classList.remove("flash"); void n.offsetWidth; n.classList.add("flash"); });
    const draw = () => { comps.forEach(c => el.querySelector(`[data-c="${c}"] > i`).textContent = `рендеров: ${renders[c]}`); el.querySelector(".vz-cnt").textContent = count; el.querySelector(".vz-tt").textContent = title; };
    el.querySelectorAll("[data-a]").forEach(b => b.onclick = () => {
      if(b.dataset.a === "inc"){ count++; flash(memo ? ["App","Counter"] : comps);
        el.querySelector(".vz-say").textContent = memo ? "С memo Header и Footer пропустили рендер: их props не изменились." : "Header и Footer тоже перерисовались, хотя count им не нужен. По умолчанию React рендерит всех детей."; }
      else { title = title === "Студия" ? "Новая студия" : "Студия"; flash(memo ? ["App","Header"] : comps); el.querySelector(".vz-say").textContent = "Поменялся title — Header обязан перерисоваться: у него новые props."; }
      draw();
    });
    el.querySelector(".vz-memo").onchange = e => { memo = e.target.checked; };
    draw();
  }
};

/* ---------- 10. HTTP-запрос ---------- */
VIZ.http = {
  title:"Собери HTTP-запрос",
  lead:"Выбери метод, адрес и тело. Увидишь сырой текст запроса и ответ учебного API задач.",
  render(el){
    let tasks = [{id:1, title:"Сверстать шапку", done:false}], next = 2;
    const reasons = {200:"OK — всё хорошо, вот данные.", 201:"Created — запись создана.", 204:"No Content — готово, тела нет.", 400:"Bad Request — ошибка в запросе клиента.", 401:"Unauthorized — сервер не знает, кто ты.", 404:"Not Found — такого ресурса нет."};
    const names = {200:"OK", 201:"Created", 204:"No Content", 400:"Bad Request", 401:"Unauthorized", 404:"Not Found"};
    el.innerHTML = `<div class="vz-reqrow"><select class="vz-m" aria-label="Метод"><option>GET</option><option>POST</option><option>PATCH</option><option>DELETE</option></select>
      <select class="vz-p" aria-label="Адрес"><option>/api/tasks</option><option>/api/tasks/1</option><option>/api/tasks/99</option></select>
      <label class="vz-check"><input type="checkbox" class="vz-auth" checked> токен</label><button class="btn sm vz-send">Отправить</button></div>
      <textarea class="vz-body" rows="2" aria-label="Тело запроса" spellcheck="false">{"title": "Подключить оплату"}</textarea>
      <div class="vz-two"><div><h5>Запрос</h5><pre class="vz-raw vz-rq"></pre></div><div><h5>Ответ</h5><pre class="vz-raw vz-rs"></pre></div></div>
      <p class="vz-say" aria-live="polite"></p>`;
    const sync = () => { const m = el.querySelector(".vz-m").value; el.querySelector(".vz-body").hidden = !["POST","PATCH"].includes(m); if(m === "PATCH") el.querySelector(".vz-body").value = '{"done": true}'; else if(m === "POST") el.querySelector(".vz-body").value = '{"title": "Подключить оплату"}'; };
    el.querySelector(".vz-m").onchange = sync;
    el.querySelector(".vz-send").onclick = () => {
      const m = el.querySelector(".vz-m").value, p = el.querySelector(".vz-p").value, auth = el.querySelector(".vz-auth").checked;
      let body = null, raw = el.querySelector(".vz-body").value;
      const hasBody = ["POST","PATCH"].includes(m);
      el.querySelector(".vz-rq").textContent = `${m} ${p} HTTP/1.1\nHost: api.studio.dev${auth ? "\nAuthorization: Bearer eyJhbGciOi…" : ""}${hasBody ? "\nContent-Type: application/json\n\n" + raw : ""}`;
      let st = 200, out;
      const id = +(p.split("/")[3] || 0), t = tasks.find(x => x.id === id);
      if(m !== "GET" && !auth){ st = 401; out = {error:"Нужно войти"}; }
      else if(hasBody){ try{ body = JSON.parse(raw); }catch(e){ st = 400; out = {error:"Тело — не JSON"}; } }
      if(st === 200){
        if(m === "GET") out = id ? (t || (st = 404, {error:"Задача не найдена"})) : tasks;
        if(m === "POST"){ if(id){ st = 404; out = {error:"Нет такого адреса"}; } else if(!body.title || String(body.title).length < 3){ st = 400; out = {error:"title — от 3 символов"}; } else { out = {id:next++, title:body.title, done:false}; tasks.push(out); st = 201; } }
        if(m === "PATCH"){ if(!t){ st = 404; out = {error:"Задача не найдена"}; } else if(typeof body.done !== "boolean"){ st = 400; out = {error:"done — true или false"}; } else { t.done = body.done; out = t; } }
        if(m === "DELETE"){ if(!t){ st = 404; out = {error:"Задача не найдена"}; } else { tasks = tasks.filter(x => x !== t); st = 204; out = undefined; } }
      }
      el.querySelector(".vz-rs").innerHTML = `<span class="s${String(st)[0]}">HTTP/1.1 ${st} ${names[st]}</span>${out !== undefined ? "\nContent-Type: application/json\n\n" + vEsc(JSON.stringify(out, null, 2)) : ""}`;
      el.querySelector(".vz-say").textContent = `${st}: ${reasons[st]}`;
    };
    sync(); el.querySelector(".vz-send").click();
  }
};

/* ---------- 11. Цепочка middleware ---------- */
VIZ.mw = {
  title:"Запрос идёт через middleware",
  lead:"Переключай условия и отправляй запрос. Каждый пост либо пропускает дальше, либо сам отвечает.",
  render(el){
    const chain = [
      {n:"logger", t:"Пишет в лог: POST /api/admin/users", ok:() => true},
      {n:"express.json()", t:"Разбирает тело запроса", ok:s => s.json, fail:[400, "Тело — не JSON"]},
      {n:"requireAuth", t:"Проверяет токен", ok:s => s.token, fail:[401, "Нужно войти"]},
      {n:"requireAdmin", t:"Проверяет роль", ok:s => s.admin, fail:[403, "Только для администратора"]},
      {n:"обработчик", t:"Создаёт пользователя", ok:() => true, end:[201, "{ id: 7 }"]}
    ];
    el.innerHTML = `<div class="row vz-wrap"><label class="vz-check"><input type="checkbox" data-s="json" checked> тело — корректный JSON</label>
      <label class="vz-check"><input type="checkbox" data-s="token" checked> есть токен</label><label class="vz-check"><input type="checkbox" data-s="admin"> роль admin</label>
      <button class="btn sm vz-go">Отправить POST /api/admin/users</button></div>
      <div class="vz-scroll"><div class="vz-chain">${chain.map((c, i) => `<div class="vz-mwbox" data-i="${i}"><b>${c.n}</b><small>${c.t}</small></div>`).join('<span class="vz-arrow">→</span>')}</div></div>
      <pre class="vz-code vz-mwlog" aria-live="polite"></pre>`;
    el.querySelector(".vz-go").onclick = async () => {
      const s = {}; el.querySelectorAll("[data-s]").forEach(x => s[x.dataset.s] = x.checked);
      const boxes = el.querySelectorAll(".vz-mwbox"); boxes.forEach(b => b.className = "vz-mwbox");
      const log = el.querySelector(".vz-mwlog"); log.textContent = "→ POST /api/admin/users";
      const btn = el.querySelector(".vz-go"); btn.disabled = true;
      for(let i = 0; i < chain.length; i++){
        boxes[i].classList.add("cur"); await new Promise(r => setTimeout(r, reduceMotion() ? 0 : 450));
        const c = chain[i];
        if(!c.ok(s)){ boxes[i].classList.replace("cur", "stop"); log.textContent += `\n  ${c.n}: стоп → res.status(${c.fail[0]}).json({ error: "${c.fail[1]}" })\n← ${c.fail[0]}`; break; }
        boxes[i].classList.replace("cur", "pass");
        if(c.end){ log.textContent += `\n  ${c.n}: res.status(${c.end[0]}).json(${c.end[1]})\n← ${c.end[0]}`; }
        else log.textContent += `\n  ${c.n}: next()`;
      }
      btn.disabled = false;
    };
  }
};

/* ---------- 12. JOIN ---------- */
VIZ.join = {
  title:"Как работает JOIN",
  lead:"Проходи по клиентам по одному: для каждого ищутся проекты с тем же client_id.",
  render(el){
    const C = [[1,"Кофейня"],[2,"Барбершоп"],[3,"Йога"],[4,"Пекарня"]];
    const P = [[10,1,"Лендинг"],[11,1,"Магазин"],[12,2,"Онлайн-запись"],[13,3,"Кабинет"]];
    let type = "INNER", i = -1, res = [];
    el.innerHTML = `<div class="chips vz-wrap">${["INNER","LEFT"].map(t => `<button class="chip" data-t="${t}">${t} JOIN</button>`).join("")}</div>
      <pre class="vz-code vz-jsql"></pre>
      <div class="vz-tables"><table class="vz-t c"><thead><tr><th>id</th><th>name</th></tr></thead><tbody>${C.map(r => `<tr data-c="${r[0]}"><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</tbody></table>
        <table class="vz-t p"><thead><tr><th>id</th><th>client_id</th><th>title</th></tr></thead><tbody>${P.map(r => `<tr data-p="${r[0]}" data-cl="${r[1]}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>
        <table class="vz-t r"><thead><tr><th>name</th><th>title</th></tr></thead><tbody></tbody></table></div>
      <p class="vz-say" aria-live="polite"></p><div class="row"><button class="btn sm vz-next">Следующий клиент →</button><button class="btn ghost sm vz-reset">Сначала</button></div>`;
    const draw = () => {
      el.querySelectorAll("[data-t]").forEach(b => b.setAttribute("aria-pressed", b.dataset.t === type));
      el.querySelector(".vz-jsql").textContent = `SELECT c.name, p.title\nFROM clients c\n${type} JOIN projects p ON p.client_id = c.id;`;
      el.querySelectorAll("tr[data-c]").forEach(r => r.classList.toggle("cur", i >= 0 && +r.dataset.c === C[i][0]));
      el.querySelectorAll("tr[data-p]").forEach(r => r.classList.toggle("match", i >= 0 && +r.dataset.cl === C[i][0]));
      el.querySelector(".vz-t.r tbody").innerHTML = res.map(r => `<tr class="${r[1] === null ? "nul" : ""}"><td>${r[0]}</td><td>${r[1] === null ? "NULL" : r[1]}</td></tr>`).join("");
      el.querySelector(".vz-next").disabled = i >= C.length - 1;
    };
    el.querySelector(".vz-next").onclick = () => {
      i++; const [id, name] = C[i]; const m = P.filter(p => p[1] === id);
      if(m.length) m.forEach(p => res.push([name, p[2]])); else if(type === "LEFT") res.push([name, null]);
      el.querySelector(".vz-say").textContent = m.length ? `У «${name}» проектов: ${m.length}. Каждая пара — отдельная строка результата.` : type === "LEFT" ? `У «${name}» проектов нет. LEFT JOIN всё равно оставляет клиента, а колонки проекта — NULL.` : `У «${name}» проектов нет. INNER JOIN такого клиента просто выбрасывает.`;
      draw();
    };
    const reset = () => { i = -1; res = []; el.querySelector(".vz-say").textContent = "Нажми «Следующий клиент»."; draw(); };
    el.querySelector(".vz-reset").onclick = reset;
    el.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { type = b.dataset.t; reset(); });
    reset();
  }
};

/* ---------- 13. Индекс ---------- */
VIZ.index = {
  title:"Зачем индекс: перебор против поиска по указателю",
  lead:"Ищем число в отсортированном индексе. Сравни, сколько шагов нужно без индекса и с ним.",
  render(el){
    const arr = Array.from({length:16}, (_, i) => i * 7 + 3);
    el.innerHTML = `<label class="vz-sel">Ищем<select class="vz-target">${arr.map(v => `<option ${v === 80 ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <div class="vz-scroll"><div class="vz-cells">${arr.map(v => `<span data-v="${v}">${v}</span>`).join("")}</div></div>
      <div class="row vz-wrap"><button class="btn ghost sm" data-a="scan">Без индекса: перебор</button><button class="btn sm" data-a="bin">С индексом: делим пополам</button><span class="hint vz-steps"></span></div>
      <label class="vz-range">строк в таблице <output></output><input type="range" min="1" max="7" value="6" class="vz-n"></label>
      <div class="vz-bars"></div>`;
    const cells = () => el.querySelectorAll(".vz-cells span");
    const wait = ms => new Promise(r => setTimeout(r, reduceMotion() ? 0 : ms));
    let busy = false;
    el.querySelectorAll("[data-a]").forEach(b => b.onclick = async () => {
      if(busy) return; busy = true;
      const t = +el.querySelector(".vz-target").value; cells().forEach(c => c.className = "");
      let steps = 0;
      if(b.dataset.a === "scan"){ for(const c of cells()){ steps++; c.className = "look"; await wait(140); if(+c.dataset.v === t){ c.className = "hit"; break; } c.className = "out"; } }
      else { let lo = 0, hi = arr.length - 1; while(lo <= hi){ steps++; const mid = (lo + hi) >> 1; const c = cells()[mid]; c.className = "look"; await wait(420);
        if(arr[mid] === t){ c.className = "hit"; break; } cells().forEach((x, k) => { if(arr[mid] < t ? k <= mid : k >= mid) x.className = "out"; }); if(arr[mid] < t) lo = mid + 1; else hi = mid - 1; } }
      el.querySelector(".vz-steps").textContent = `Шагов: ${steps}`; busy = false;
    });
    const bars = () => {
      const N = 10 ** +el.querySelector(".vz-n").value; el.querySelector(".vz-n").previousElementSibling.textContent = N.toLocaleString("ru-RU");
      const log = Math.ceil(Math.log2(N));
      el.querySelector(".vz-bars").innerHTML = `<div><span>Без индекса</span><i style="width:100%"></i><b>до ${N.toLocaleString("ru-RU")} сравнений</b></div><div><span>B-дерево</span><i style="width:${Math.max(1.5, log / N * 100)}%"></i><b>около ${log} шагов</b></div>`;
    };
    el.querySelector(".vz-n").oninput = bars; bars();
  }
};

/* ---------- 14. JWT ---------- */
VIZ.jwt = {
  title:"JWT изнутри: что видно и что защищено",
  lead:"Поменяй данные — токен пересчитается. Потом попробуй подделать роль и посмотри, что скажет сервер.",
  render(el){
    el.innerHTML = `<div class="vz-two"><label class="vz-field">Данные (payload)<textarea class="vz-pl" rows="5" spellcheck="false">{
  "sub": 42,
  "name": "Борис",
  "role": "student"
}</textarea></label><label class="vz-field">Секрет сервера<input type="text" class="vz-sec" value="очень-длинный-секрет" spellcheck="false"></label></div>
      <h5>Токен</h5><div class="vz-token" aria-live="polite"></div>
      <div class="row vz-wrap"><button class="btn ghost sm vz-hack">Подделать: role → admin</button></div>
      <pre class="vz-code vz-verdict" aria-live="polite"></pre>`;
    const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    const sign = async (data, secret) => {
      if(!(window.crypto && crypto.subtle)) return "нужен-https-для-подписи";
      const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data));
      return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    };
    let token = null;
    const build = async () => {
      let pl; try{ pl = JSON.stringify(JSON.parse(el.querySelector(".vz-pl").value)); }catch(e){ el.querySelector(".vz-token").textContent = "Данные — не JSON"; return; }
      const h = b64(JSON.stringify({alg:"HS256", typ:"JWT"})), p = b64(pl), s = await sign(h + "." + p, el.querySelector(".vz-sec").value);
      token = [h, p, s];
      el.querySelector(".vz-token").innerHTML = `<span class="h">${h}</span>.<span class="p">${p}</span>.<span class="s">${s}</span>`;
      el.querySelector(".vz-verdict").textContent = `Заголовок и данные — просто base64, их прочитает кто угодно:\n${pl}\n\nПоэтому в JWT не кладут пароли и секреты. Защищена только целостность: подпись знает лишь сервер.`;
    };
    el.querySelector(".vz-hack").onclick = async () => {
      if(!token) return;
      const fake = JSON.parse(decodeURIComponent(escape(atob(token[1].replace(/-/g, "+").replace(/_/g, "/"))))); fake.role = "admin";
      const p2 = b64(JSON.stringify(fake)), real = await sign(token[0] + "." + p2, el.querySelector(".vz-sec").value);
      el.querySelector(".vz-token").innerHTML = `<span class="h">${token[0]}</span>.<span class="p bad">${p2}</span>.<span class="s">${token[2]}</span>`;
      el.querySelector(".vz-verdict").textContent = `Злоумышленник поменял роль, но подпись оставил старую — новую без секрета не посчитать.\n\nСервер пересчитывает подпись: ${real.slice(0, 22)}…\nВ токене подпись:          ${token[2].slice(0, 22)}…\n\nНе совпало → 401. Подделка не прошла.`;
    };
    el.querySelectorAll("textarea,input").forEach(i => i.oninput = build);
    build();
  }
};

/* ---------- 15. Кеш и TTL ---------- */
VIZ.cache = {
  title:"Кеш: попадания, промахи и устаревшие данные",
  lead:"Отправляй запросы, меняй TTL и данные. Следи, когда кеш помогает, а когда показывает старое.",
  render(el){
    let entry = null, db = 1000, log = [], hits = 0, total = 0;
    el.innerHTML = `<div class="row vz-wrap"><label class="vz-range">TTL <output></output><input type="range" min="2" max="20" value="6" class="vz-ttl"></label>
      <label class="vz-check"><input type="checkbox" class="vz-inv"> сбрасывать кеш при изменении</label></div>
      <div class="row vz-wrap"><button class="btn sm vz-req">GET /api/price</button><button class="btn ghost sm vz-upd">Цена в базе +100 ₽</button><span class="hint vz-rate"></span></div>
      <div class="vz-cachebar"><i></i><span></span></div>
      <ul class="vz-clog" aria-live="polite"></ul>`;
    const ttl = () => +el.querySelector(".vz-ttl").value;
    const tick = () => {
      if(!el.isConnected){ clearInterval(timer); return; }
      el.querySelector(".vz-ttl").previousElementSibling.textContent = ttl() + " с";
      const bar = el.querySelector(".vz-cachebar");
      if(entry){ const left = Math.max(0, ttl() - (Date.now() - entry.t) / 1000); bar.querySelector("i").style.width = (left / ttl() * 100) + "%"; bar.querySelector("span").textContent = left > 0 ? `в кеше ${entry.v} ₽, живёт ещё ${left.toFixed(1)} с` : "запись устарела"; if(left === 0) entry = null; }
      else { bar.querySelector("i").style.width = "0"; bar.querySelector("span").textContent = "кеш пуст"; }
    };
    const timer = setInterval(tick, 200);
    const push = (cls, t) => { log.unshift(`<li class="${cls}">${t}</li>`); log = log.slice(0, 8); el.querySelector(".vz-clog").innerHTML = log.join(""); };
    el.querySelector(".vz-req").onclick = () => {
      total++;
      if(entry && (Date.now() - entry.t) / 1000 < ttl()){ hits++; push(entry.v !== db ? "stale" : "hit", entry.v !== db ? `HIT за 2 мс, но цена устарела: ${entry.v} ₽ вместо ${db} ₽` : `HIT за 2 мс → ${entry.v} ₽`); }
      else { entry = {v:db, t:Date.now()}; push("miss", `MISS: сходили в базу за 300 мс → ${db} ₽, положили в кеш`); }
      el.querySelector(".vz-rate").textContent = `Попаданий: ${Math.round(hits / total * 100)}%`; tick();
    };
    el.querySelector(".vz-upd").onclick = () => { db += 100; if(el.querySelector(".vz-inv").checked && entry){ entry = null; push("info", `Цена в базе ${db} ₽. Кеш сброшен — следующий запрос возьмёт свежие данные.`); } else push("info", `Цена в базе ${db} ₽. Кеш об этом не знает.`); tick(); };
    tick();
  }
};

/* Какие схемы показывать на каких уроках */
const VIZ_FOR = {
  web:["url"], "be-linux":["url"], tools:["git"], polish:["git"],
  css1:["spec","box"], css2:["box","flex"], css3:["grid"],
  js4:["arr"], js6:["loop"], node1:["loop"], career:["loop"], "be-career":["loop"], "fs-career":["loop"],
  react1:["react"], react2:["react"], http:["http"], "fs-integration":["http"], express1:["mw"], express2:["http"], auth:["jwt","mw"], security:["mw"],
  sql2:["join"], sql3:["index"], "pg-node":["index"], cache:["cache"]
};
function mountViz(root){
  root.querySelectorAll("[data-viz]").forEach(box => {
    const v = VIZ[box.dataset.viz]; if(!v || box.dataset.ready) return;
    box.dataset.ready = "1";
    box.innerHTML = `<div class="vz-head"><h4>${vEsc(v.title)}</h4><p class="hint">${vEsc(v.lead)}</p></div><div class="vz-body"></div>`;
    try{ v.render(box.querySelector(".vz-body")); }catch(e){ console.error(e); box.querySelector(".vz-body").innerHTML = '<p class="hint">Схема не загрузилась.</p>'; }
  });
}
