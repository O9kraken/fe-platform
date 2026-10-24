/* Игровые механики, главная «Сегодня» и карточки для повторения */

/* ---------- иконки модулей ---------- */
const GLYPH_PATHS = {
  base:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/>',
  markup:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  js:'<path d="M8 4C6 4 5 5 5 7v2c0 1-1 2-2 3 1 1 2 2 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1 1 2 2 3-1 1-2 2-2 3v2c0 2-1 3-3 3"/>',
  react:'<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
  next:'<path d="M5 20V4l14 16V4"/>',
  quality:'<path d="M12 3l8 3v6c0 5-3.6 8-8 9-4.4-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  node:'<path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M9 9.5v5M9 9.5l6 5v-5"/>',
  data:'<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  sec:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 018 0V11M12 15v2"/>',
  infra:'<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6"/>',
  fs:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  proj:'<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>'
};
const glyph = (mod, cls = "") => `<svg class="glyph ${cls}" viewBox="0 0 24 24" aria-hidden="true">${GLYPH_PATHS[mod] || GLYPH_PATHS.base}</svg>`;
const FLAME = '<svg class="flame" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 1.5-4.5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>';

/* ---------- даты ---------- */
const dayKey = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); };

/* ---------- XP и уровни ---------- */
const LEVEL_TITLES = ["Новичок","Ученик","Верстальщик","Скриптер","Компонентщик","Джуниор","Уверенный джуниор","Мидл в пути","Мастер стека","Сеньор-курица"];
const lvlStart = L => 50 * L * (L - 1);
function levelOf(x){ let L = 1; while(lvlStart(L + 1) <= x) L++; return L; }
const levelTitle = L => LEVEL_TITLES[L - 1] || "Легенда";
function gameInit(s){
  s.aw = s.aw || {}; s.xpDay = s.xpDay || {}; s.ach = s.ach || {}; s.cards = s.cards || {}; s.cardsNew = s.cardsNew || {};
  s.goal = s.goal || 50; s.cardXp = s.cardXp || 0; s.reviewed = s.reviewed || 0; s.doneL = s.doneL || {};
  return s;
}
function award(key, pts){
  if(S.aw[key]) return 0;
  S.aw[key] = 1;
  const t = today(); S.xpDay[t] = (S.xpDay[t] || 0) + pts;
  return pts;
}
const xpToday = () => S.xpDay[today()] || 0;

/* ---------- достижения ---------- */
const passedEx = (s, f = () => true) => Object.entries(s.ex).filter(([id, e]) => e && e.passed && f(findEx(id) || {})).length;
const goalDays = s => Object.values(s.xpDay || {}).filter(v => v >= (s.goal || 50)).length;
const ACH = [
  {id:"first-step", t:"Первый шаг", d:"Отметить первую тему", test:s => Object.keys(s.c).some(k => s.c[k] && /_(l\d+|do|ck)$/.test(k))},
  {id:"first-ex", t:"Зелёные тесты", d:"Решить первую задачу", test:s => passedEx(s) >= 1},
  {id:"ex5", t:"Разогрелся", d:"Решить 5 задач", test:s => passedEx(s) >= 5},
  {id:"ex20", t:"Набил руку", d:"Решить 20 задач", test:s => passedEx(s) >= 20},
  {id:"ex50", t:"Полсотни", d:"Решить 50 задач", test:s => passedEx(s) >= 50},
  {id:"react", t:"Первый компонент", d:"Решить задачу на React", test:s => passedEx(s, e => e.mode === "react") >= 1},
  {id:"api", t:"Свой сервер", d:"Решить задачу на API", test:s => passedEx(s, e => e.mode === "api") >= 1},
  {id:"sql", t:"Говорю на SQL", d:"Решить задачу на SQL", test:s => passedEx(s, e => e.mode === "sql") >= 1},
  {id:"week", t:"Неделя закрыта", d:"Закрыть все пункты недели", test:s => trackIds(s).some(id => { const p = wp(id, s); return p.d === p.t; })},
  {id:"module", t:"Модуль пройден", d:"Закрыть целый модуль", test:s => trackRuns(s).some(r => r.items.every(({id}) => { const p = wp(id, s); return p.d === p.t; }))},
  {id:"quiz10", t:"Знаток", d:"10 верных ответов в тестах", test:s => LESSONS.reduce((n, l) => n + l.quiz.filter((q, i) => s.q[`${l.id}_q${i}`] === q.a).length, 0) >= 10},
  {id:"journal4", t:"Летописец", d:"Заполнить дневник 4 недель", test:s => Object.values(s.j).filter(j => j && Object.values(j).some(v => v && String(v).trim())).length >= 4},
  {id:"streak3", t:"Три дня подряд", d:"Заниматься 3 дня подряд", test:s => streak(s) >= 3},
  {id:"streak7", t:"Без пропусков", d:"Заниматься 7 дней подряд", test:s => streak(s) >= 7},
  {id:"streak30", t:"Железная дисциплина", d:"Заниматься 30 дней подряд", test:s => streak(s) >= 30},
  {id:"goal", t:"Цель дня", d:"Набрать дневную цель XP", test:s => goalDays(s) >= 1},
  {id:"goal7", t:"Семь целей", d:"Набрать цель в 7 разных дней", test:s => goalDays(s) >= 7},
  {id:"cards50", t:"Память слона", d:"Повторить 50 карточек", test:s => (s.reviewed || 0) >= 50},
  {id:"lvl5", t:"Пятый уровень", d:"Дойти до 5 уровня", test:s => levelOf(xp(s)) >= 5}
];
let gameReady = false;
function gameTick(){
  if(!S) return;
  const news = [];
  const L = levelOf(xp());
  if(gameReady && S.lvl && L > S.lvl) news.push(`Новый уровень ${L}: ${levelTitle(L)}`);
  S.lvl = L;
  for(const a of ACH) if(!S.ach[a.id]){ let ok = false; try{ ok = a.test(S); }catch(e){} if(ok){ S.ach[a.id] = today(); if(gameReady) news.push("Достижение: " + a.t); } }
  for(const id of trackIds()){ const p = wp(id); if(p.d === p.t && !S.doneL[id]){ S.doneL[id] = today(); if(gameReady) news.push(`Неделя «${LES[id].t}» закрыта`); } }
  if(xpToday() >= S.goal && !S.goalHit){ S.goalHit = today(); if(gameReady) news.push("Цель дня выполнена"); }
  if(S.goalHit && S.goalHit !== today() && xpToday() < S.goal) S.goalHit = null;
  if(news.length){ toast(news.join(" · ")); confetti(); }
  gameReady = true;
}

/* ---------- конфетти ---------- */
function confetti(){
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas"); c.className = "confetti"; document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const x = c.getContext("2d"); x.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const cols = ["--m1","--m2","--m3","--m4","--m5","--m6","--m7"].map(v => cs.getPropertyValue(v).trim() || "#1f4fd8");
  const P = Array.from({length:140}, () => ({x:innerWidth / 2 + (Math.random() - .5) * 200, y:innerHeight * .35, vx:(Math.random() - .5) * 14, vy:-Math.random() * 12 - 4, r:Math.random() * 6 + 4, a:Math.random() * 6, va:(Math.random() - .5) * .4, c:cols[Math.floor(Math.random() * cols.length)]}));
  const t0 = performance.now();
  const frame = t => {
    const k = (t - t0) / 1600; x.clearRect(0, 0, innerWidth, innerHeight);
    P.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      x.save(); x.globalAlpha = Math.max(0, 1 - k); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); });
    if(k < 1) requestAnimationFrame(frame); else c.remove();
  };
  requestAnimationFrame(frame);
}

/* ---------- шапка ---------- */
function ring(pct, size = 44, stroke = 5){
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.min(1, pct));
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
}
function renderHeader(){
  const x = xp(), L = levelOf(x), a = lvlStart(L), b = lvlStart(L + 1);
  $("#lvlNum").textContent = L;
  $("#lvlTitle").textContent = levelTitle(L);
  $("#lvlNext").textContent = `${x} XP · до ${L + 1} уровня ${b - x}`;
  $("#lvlBar").style.width = ((x - a) / (b - a) * 100) + "%";
  const t = xpToday();
  $("#goalRing").innerHTML = ring(t / S.goal) + `<div><b>${t}/${S.goal}</b><span>XP сегодня</span></div>`;
  $("#goalRing").classList.toggle("hit", t >= S.goal);
  $("#stStreak").textContent = streak();
  $("#streakBox").classList.toggle("on", !!S.days[today()]);
}

/* ---------- главная «Сегодня» ---------- */
function nextStep(){
  const n = calWeek();
  for(let k = 1; k <= trackLen(); k++){
    const id = trackIds()[k - 1], l = LES[id];
    const items = [...l.learn.map((t, i) => [`${id}_l${i}`, t]), [`${id}_do`, "Проект недели: " + l.do], [`${id}_ck`, "Контрольная точка: " + l.check]];
    const ex = exOf(id).find(e => !(S.ex[e.id] && S.ex[e.id].passed));
    const it = items.find(([key]) => !S.c[key]);
    if(ex || it) return {n:k, id, ex, it, behind: k < n};
  }
  return null;
}
function deckCards(){
  const ids = trackIds(); let upto = calWeek();
  ids.forEach((id, i) => { if(wp(id).d) upto = Math.max(upto, i + 1); });
  const cards = GLOSS.map(([t, d, a]) => ({id:"g:" + t, kind:"Термин", front:t, back:d, extra:a}));
  ids.slice(0, upto).forEach(id => LES[id].quiz.forEach((q, i) => cards.push({id:`q:${id}_${i}`, kind:LES[id].t, front:q.q, back:q.o[q.a], extra:q.e})));
  return cards;
}
function cardQueue(){
  const t = today(), deck = deckCards();
  const due = deck.filter(c => S.cards[c.id] && S.cards[c.id].d <= t);
  const newLeft = Math.max(0, 10 - (S.cardsNew[t] || 0));
  const fresh = deck.filter(c => !S.cards[c.id]).slice(0, newLeft);
  return {due, fresh, deck};
}
function renderToday(){
  const t = TRACKS[trackKey()], n = calWeek(), step = nextStep(), x = xp(), L = levelOf(x);
  const q = cardQueue();
  const days = Array.from({length:7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return {k:dayKey(d), w:["вс","пн","вт","ср","чт","пт","сб"][d.getDay()], v:S.xpDay[dayKey(d)] || 0, on:!!S.days[dayKey(d)]}; });
  const maxV = Math.max(S.goal, ...days.map(d => d.v));
  const cur = step ? LES[step.id] : null;
  const vizId = cur && (VIZ_FOR[cur.id] || [])[0];
  const exRec = step && step.ex;
  const unlocked = ACH.filter(a => S.ach[a.id]).length;
  $("#tab-today").innerHTML = `
  <section class="today-hero" style="--c:var(${cur ? MODULES[cur.mod].c : "--accent"})">
    <div class="th-main">
      <span class="eyebrow">${esc(t.name)} · неделя ${n} из ${trackLen()} · ${weekDates(n)}</span>
      <h2>Привет, ${esc(ME.displayName)}!</h2>
      ${step ? `<p class="th-lead">${step.behind ? `Ты на неделе ${step.n}, а по календарю уже ${n}. Не страшно — продолжай в своём темпе.` : "Вот что сделать дальше:"}</p>
        <button class="th-next" data-goweek="${step.n}">${glyph(cur.mod, "lg")}<span><small>Неделя ${step.n} · ${esc(MODULES[cur.mod].name)}</small><b>${esc(cur.t)}</b><em>${step.ex ? "Задача: " + esc(step.ex.t) : esc(step.it[1])}</em></span><i>Продолжить →</i></button>`
        : `<p class="th-lead">Ты прошёл всё направление. Время откликаться на вакансии и делать свои проекты.</p>`}
      <div class="th-pct"><div class="bar"><i style="width:${coursePct()}%"></i></div><span>${coursePct()}% направления</span></div>
    </div>
    <div class="th-goal">
      <div class="th-ring">${ring(xpToday() / S.goal, 132, 12)}<div><b>${xpToday()}</b><span>из ${S.goal} XP</span></div></div>
      <div class="th-week" aria-label="Активность за 7 дней">${days.map(d => `<div class="${d.k === today() ? "td" : ""}"><i style="height:${Math.max(d.on ? 8 : 3, d.v / maxV * 56)}px" class="${d.v >= S.goal ? "full" : d.on ? "some" : ""}"></i><span>${d.w}</span></div>`).join("")}</div>
      <div class="th-streak">${FLAME}<b>${streak()}</b> ${streak() === 1 ? "день" : streak() < 5 && streak() > 1 ? "дня" : "дней"} подряд</div>
    </div>
  </section>
  <div class="today-cards">
    <button class="tcard" data-goview="cards"><span class="tc-k">Повторение</span><b>${q.due.length + q.fresh.length ? `${q.due.length + q.fresh.length} карточ${q.due.length + q.fresh.length === 1 ? "ка" : "ек"}` : "Всё повторено"}</b><span class="hint">${q.due.length} на повтор · ${q.fresh.length} новых</span></button>
    ${exRec ? `<button class="tcard" data-ex="${exRec.id}"><span class="tc-k">Задача дня</span><b>${esc(exRec.t)}</b><span class="hint">${esc(MODE_LABEL[exRec.mode])} · +40 XP</span></button>` : `<button class="tcard" data-goview="practice"><span class="tc-k">Практика</span><b>Все задачи решены</b><span class="hint">Сгенерируй новую в уроке</span></button>`}
    ${vizId ? `<button class="tcard" data-goweek="${step.n}" data-scroll="viz"><span class="tc-k">Схема недели</span><b>${esc(VIZ[vizId].title)}</b><span class="hint">Интерактивное объяснение</span></button>` : `<button class="tcard" data-goview="play"><span class="tc-k">Песочница</span><b>Поэкспериментируй</b><span class="hint">HTML, JS, React, API, SQL</span></button>`}
    <div class="tcard lvlcard"><span class="tc-k">Уровень ${L}</span><b>${esc(levelTitle(L))}</b><div class="bar"><i style="width:${(x - lvlStart(L)) / (lvlStart(L + 1) - lvlStart(L)) * 100}%"></i></div><span class="hint">${x} XP · до следующего ${lvlStart(L + 1) - x}</span></div>
  </div>
  <section class="panel"><div class="panel-head"><h2>Твой путь</h2><span class="hint">Нажми на неделю, чтобы открыть её</span></div><div class="pathmap" id="pathmap"></div><div class="pm-legend">${trackRuns().map(r => `<span style="--c:var(${MODULES[r.mod].c})">${glyph(r.mod)}${esc(MODULES[r.mod].name)}</span>`).join("")}</div></section>
  <section class="panel"><div class="panel-head"><h2>Достижения</h2><span class="hint">${unlocked} из ${ACH.length}</span></div>
    <div class="achs">${ACH.map(a => `<div class="ach ${S.ach[a.id] ? "on" : ""}" title="${esc(a.d)}"><span class="medal">${S.ach[a.id] ? "★" : "☆"}</span><b>${esc(a.t)}</b><small>${esc(a.d)}</small></div>`).join("")}</div></section>
  <section class="panel slim"><div class="panel-head"><h2>Цель на день</h2><div class="chips" role="group" aria-label="Цель на день">${[30, 50, 100, 150].map(g => `<button class="chip" data-goal="${g}" aria-pressed="${S.goal === g}">${g} XP</button>`).join("")}</div></div>
    <p class="hint">XP дают: тема +5, верный ответ в тесте +10, решённая задача +40, запись в дневнике +10, карточка +2. 50 XP — около 40 минут занятий.</p></section>`;
  drawPath();
}
function drawPath(){
  const box = $("#pathmap"); if(!box) return;
  const ids = trackIds(), N = ids.length, cols = box.clientWidth < 620 ? 5 : 10, rows = Math.ceil(N / cols);
  const W = 1000, padX = 60, stepX = (W - 2 * padX) / (cols - 1), rowH = 110, H = rows * rowH + 20, now = calWeek();
  const pt = i => { const r = Math.floor(i / cols), c = i % cols; const x = padX + (r % 2 ? cols - 1 - c : c) * stepX; return [x, 60 + r * rowH]; };
  let d = "";
  ids.forEach((_, i) => { const [x, y] = pt(i); if(!i){ d += `M${x} ${y}`; return; } const [px, py] = pt(i - 1);
    d += py === y ? ` L${x} ${y}` : ` C ${px + (px > W / 2 ? 70 : -70)} ${py}, ${x + (x > W / 2 ? 70 : -70)} ${y}, ${x} ${y}`; });
  let done = 0; ids.forEach(id => { const p = wp(id); if(p.d === p.t) done++; });
  const nodes = ids.map((id, i) => { const [x, y] = pt(i), l = LES[id], p = wp(id), full = p.d === p.t, frac = p.d / p.t;
    return `<g class="pm-node ${full ? "full" : frac ? "part" : ""} ${i + 1 === now ? "now" : ""}" data-goweek="${i + 1}" style="--c:var(${MODULES[l.mod].c})" tabindex="0" role="button" aria-label="Неделя ${i + 1}: ${esc(l.t)}">
      <title>Неделя ${i + 1}: ${esc(l.t)} — ${Math.round(frac * 100)}%</title>
      ${i + 1 === now ? `<circle r="30" cx="${x}" cy="${y}" class="pm-pulse"/>` : ""}
      <circle r="22" cx="${x}" cy="${y}" class="pm-c"/>
      ${frac && !full ? `<circle r="9" cx="${x}" cy="${y}" class="pm-arc" stroke-dasharray="${2 * Math.PI * 9}" stroke-dashoffset="${2 * Math.PI * 9 * (1 - frac)}" transform="rotate(-90 ${x} ${y})"/>` : ""}
      <text x="${x}" y="${y + 6}">${i + 1}</text></g>`; }).join("");
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Карта пути: пройдено недель ${done} из ${N}"><path d="${d}" class="pm-road"/>${nodes}</svg>`;
}

/* ---------- карточки ---------- */
const INTERVALS = {1:1, 2:3, 3:7, 4:14, 5:30, 6:60};
let session = null;
function renderCards(){
  const q = cardQueue(), boxes = [0, 0, 0, 0, 0, 0];
  Object.values(S.cards).forEach(c => boxes[Math.min(6, c.b) - 1]++);
  const learned = boxes[3] + boxes[4] + boxes[5], maxB = Math.max(1, ...boxes);
  if(session && session.queue.length){ renderCardFace(); return; }
  $("#tab-cards").innerHTML = `
    <div class="panel-head"><div><h2>Повторение</h2><p class="hint" style="margin-top:6px">Термины и вопросы из пройденных недель. Что помнишь — возвращается реже, что забываешь — чаще.</p></div></div>
    <div class="kpis"><div><b>${q.due.length}</b><span>на повтор сегодня</span></div><div><b>${q.fresh.length}</b><span>новых сегодня</span></div><div><b>${learned}</b><span>выучено надолго</span></div><div><b>${q.deck.length}</b><span>карточек в колоде</span></div></div>
    <div class="leitner" aria-label="Коробки повторения">${boxes.map((v, i) => `<div><i style="height:${v / maxB * 70 + 4}px"></i><b>${v}</b><span>${INTERVALS[i + 1]} дн</span></div>`).join("")}</div>
    <p class="hint">Коробки показывают, через сколько дней карточка вернётся. Ответил «Помню» — она переезжает в коробку правее.</p>
    ${session && session.done ? `<p class="done-msg">Готово на сегодня: ${session.done} карточ${session.done === 1 ? "ка" : "ек"}, +${session.done * 2} XP.</p>` : ""}
    <div class="row"><button class="btn" data-cards="start" ${q.due.length + q.fresh.length ? "" : "disabled"}>${q.due.length + q.fresh.length ? `Начать: ${q.due.length + q.fresh.length}` : "На сегодня всё"}</button>
    <button class="btn ghost" data-cards="extra">Ещё 10 новых</button></div>`;
}
function startSession(extra){
  const q = cardQueue();
  let queue = [...q.due, ...q.fresh];
  if(extra){ const ids = new Set(queue.map(c => c.id)); queue = queue.concat(q.deck.filter(c => !S.cards[c.id] && !ids.has(c.id)).slice(0, 10)); }
  queue.sort(() => Math.random() - .5);
  session = {queue, flipped:false, done:0, total:queue.length};
  renderCards();
}
function renderCardFace(){
  const c = session.queue[0];
  $("#tab-cards").innerHTML = `
    <div class="panel-head"><h2>Повторение</h2><span class="hint">${session.total - session.queue.length + 1} из ${session.total}</span></div>
    <div class="bar"><i style="width:${(session.total - session.queue.length) / session.total * 100}%"></i></div>
    <div class="fcard ${session.flipped ? "flipped" : ""}" data-cards="flip" tabindex="0" role="button" aria-label="Перевернуть карточку">
      <div class="fcard-in">
        <div class="face front"><span class="eyebrow">${esc(c.kind)}</span><p>${esc(c.front)}</p><span class="hint">Вспомни ответ и нажми, чтобы перевернуть · пробел</span></div>
        <div class="face back"><span class="eyebrow">${esc(c.kind)} · ${esc(c.front.length > 80 ? c.front.slice(0, 80) + "…" : c.front)}</span><p class="ans">${esc(c.back)}</p><p class="hint">${esc(c.extra)}</p></div>
      </div></div>
    <div class="row grade" ${session.flipped ? "" : "hidden"}>
      <button class="btn ghost" data-grade="1">Не помню <kbd>1</kbd></button>
      <button class="btn ghost" data-grade="2">Сложно <kbd>2</kbd></button>
      <button class="btn ok" data-grade="3">Помню <kbd>3</kbd></button></div>
    <div class="row"><button class="linkish" data-cards="stop">Закончить</button></div>`;
}
function gradeCard(g){
  if(!session || !session.flipped) return;
  const c = session.queue.shift(), t = today(), cur = S.cards[c.id];
  if(!cur) S.cardsNew[t] = (S.cardsNew[t] || 0) + 1;
  const b = cur ? cur.b : 0;
  if(g === 1){ S.cards[c.id] = {b:1, d:t}; session.queue.push(c); }
  else if(g === 2) S.cards[c.id] = {b:Math.max(1, b), d:addDays(1)};
  else { const nb = Math.min(6, b + 1); S.cards[c.id] = {b:nb, d:addDays(INTERVALS[nb])}; }
  S.reviewed = (S.reviewed || 0) + 1; S.cardXp += 2; S.xpDay[t] = (S.xpDay[t] || 0) + 2; session.done++;
  session.flipped = false;
  saveCourse();
  if(!session.queue.length){ const done = session.done; session = {queue:[], done}; confetti(); }
  renderCards();
}

/* ---------- события ---------- */
document.addEventListener("click", e => {
  const t = e.target;
  const gw = t.closest("[data-goweek]"); if(gw){ const n = +gw.dataset.goweek; setView("route"); go(n); setTimeout(() => { const v = gw.dataset.scroll === "viz" ? $(".viz") : null; (v || $("#week")).scrollIntoView({behavior:"smooth", block:"start"}); }, 60); return; }
  const gl = t.closest("[data-goal]"); if(gl){ S.goal = +gl.dataset.goal; saveCourse(); renderToday(); return; }
  const cb = t.closest("[data-cards]"); if(cb){ const a = cb.dataset.cards;
    if(a === "start") startSession(false); if(a === "extra") startSession(true);
    if(a === "flip" && session){ session.flipped = !session.flipped; renderCardFace(); }
    if(a === "stop"){ const done = session ? session.done : 0; session = {queue:[], done}; renderCards(); }
    return; }
  const gr = t.closest("[data-grade]"); if(gr){ gradeCard(+gr.dataset.grade); return; }
});
document.addEventListener("keydown", e => {
  if(view !== "cards" || !session || !session.queue.length || e.target.closest("input,textarea,select")) return;
  if(e.key === " " || e.key === "Enter"){ e.preventDefault(); session.flipped = !session.flipped; renderCardFace(); }
  if(["1","2","3"].includes(e.key)) gradeCard(+e.key);
});
document.addEventListener("keydown", e => { const g = e.target.closest && e.target.closest(".pm-node"); if(g && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); g.dispatchEvent(new MouseEvent("click", {bubbles:true})); } });
addEventListener("resize", () => { if(view === "today") drawPath(); });
