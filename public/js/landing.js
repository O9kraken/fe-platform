/* ZERO/STACK — лендинг: аккаунт, программа из данных курса, живые демо */
document.documentElement.classList.add("js");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n => String(n).padStart(2, "0");
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; };
const dayKey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const LEVEL_TITLES = ["Новичок","Ученик","Верстальщик","Скриптер","Компонентщик","Джуниор","Уверенный джуниор","Мидл в пути","Мастер стека","Сеньор-курица"];
const lvlStart = L => 50 * L * (L - 1);
const TRACK_C = {frontend:"var(--m3)", backend:"var(--m5)", fullstack:"var(--red)"};

/* ---------- меню на телефоне ---------- */
$("#burger").addEventListener("click", () => {
  const open = $("#navLinks").classList.toggle("open");
  $("#burger").setAttribute("aria-expanded", open);
});
$("#navLinks").addEventListener("click", e => { if(e.target.closest("a")){ $("#navLinks").classList.remove("open"); $("#burger").setAttribute("aria-expanded", "false"); } });

/* ---------- блоки программы ---------- */
function runsOf(track){
  const out = [];
  TRACKS[track].ids.forEach((id, i) => {
    const l = LES[id], last = out[out.length - 1];
    if(last && last.mod === l.mod) last.items.push({id, n:i + 1});
    else out.push({mod:l.mod, items:[{id, n:i + 1}]});
  });
  return out;
}
function modNames(track){ return [...new Set(TRACKS[track].ids.map(id => LES[id].mod))]; }

function renderTracks(){
  $("#trackCards").innerHTML = Object.entries(TRACKS).map(([k, t], i) => `
    <article class="track reveal" style="--c:${TRACK_C[k]}">
      <span class="track-num">${pad(i + 1)} / ${esc(t.name)}</span>
      <h3>${esc(t.name)}</h3>
      <div class="track-weeks"><b>${t.ids.length}</b><span>${plural(t.ids.length, "неделя", "недели", "недель")}</span></div>
      <p>${esc(t.sub)}</p>
      <div class="mods">${modNames(k).map(m => `<span style="--mc:var(${MODULES[m].c})">${esc(MODULES[m].name)}</span>`).join("")}</div>
      <button class="track-go" data-prog="${k}" aria-label="Программа направления ${esc(t.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </article>`).join("");
}

let progTrack = "fullstack";
function renderProgram(){
  $("#progTabs").innerHTML = Object.entries(TRACKS).map(([k, t]) => `<button role="tab" aria-selected="${k === progTrack}" data-prog="${k}">${esc(t.name)}</button>`).join("");
  const t = TRACKS[progTrack], runs = runsOf(progTrack);
  const ex = t.ids.reduce((n, id) => n + (LES[id].quiz || []).length, 0);
  $("#progSum").innerHTML = `<span><b>${t.ids.length}</b>${plural(t.ids.length, "неделя", "недели", "недель")}</span><span><b>${new Set(runs.map(r => r.mod)).size}</b>модулей</span><span><b>${ex}</b>вопросов в тестах</span><span><b>8–12</b>часов в неделю</span>`;
  $("#progList").innerHTML = runs.map((r, i) => {
    const a = r.items[0].n, b = r.items[r.items.length - 1].n;
    return `<details class="mod" style="--c:var(${MODULES[r.mod].c})"${i === 0 ? " open" : ""}>
      <summary><i class="mod-dot"></i><h3>${esc(MODULES[r.mod].name)}</h3><span class="mod-w">${a === b ? "Неделя " + a : "Недели " + a + "–" + b}</span><i class="mod-plus" aria-hidden="true"></i></summary>
      <ol>${r.items.map(({id, n}) => `<li><em>${pad(n)}</em><span><b>${esc(LES[id].t)}</b><small>${esc(LES[id].goal)}</small></span></li>`).join("")}</ol>
    </details>`;
  }).join("");
}
document.addEventListener("click", e => {
  const p = e.target.closest("[data-prog]"); if(!p) return;
  progTrack = p.dataset.prog; renderProgram();
  if(p.classList.contains("track-go")) $("#program").scrollIntoView({behavior:reduced ? "auto" : "smooth"});
});

/* ---------- лестница уровней и цель дня ---------- */
function renderLadder(myLevel){
  $("#ladder").innerHTML = LEVEL_TITLES.map((t, i) => `<li class="${myLevel === i + 1 ? "me" : ""}"><b>${pad(i + 1)}</b><span>${esc(t)}${myLevel === i + 1 ? " — ты здесь" : ""}<i style="width:${(i + 1) * 10}%"></i></span><em>${lvlStart(i + 1).toLocaleString("ru-RU")} XP</em></li>`).join("");
}
const GOAL_MIN = {30:"≈ 25 минут в день", 50:"≈ 40 минут в день", 100:"≈ 1,5 часа в день", 150:"≈ 2 часа в день"};
function setGoal(g){
  $$("#goalChips button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.g === g));
  $("#goalVal").textContent = g;
  $("#goalMin").textContent = GOAL_MIN[g];
  $("#goalArc").style.strokeDashoffset = 327 * (1 - g / 150);
}
$("#goalChips").addEventListener("click", e => { const b = e.target.closest("[data-g]"); if(b) setGoal(+b.dataset.g); });

/* ---------- демо лаборатории ---------- */
let ideBusy = false;
async function runIde(){
  if(ideBusy) return; ideBusy = true;
  const items = $$("#ideTests li"), score = $("#ideScore");
  items.forEach(li => li.className = ""); score.classList.remove("pass"); score.textContent = "0/" + items.length;
  const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
  for(let i = 0; i < items.length; i++){
    items[i].className = "run"; await wait(380);
    items[i].className = "ok"; score.textContent = (i + 1) + "/" + items.length;
  }
  score.classList.add("pass"); ideBusy = false;
}
$("#ideRun").addEventListener("click", runIde);

/* ---------- демо flexbox ---------- */
const fd = {justifyContent:"flex-start", alignItems:"stretch"};
$("#flexDemo").addEventListener("click", e => {
  const b = e.target.closest(".fd-chips button"); if(!b) return;
  const grp = b.parentElement, prop = grp.dataset.prop;
  $$("button", grp).forEach(x => x.setAttribute("aria-pressed", x === b));
  fd[prop] = b.dataset.v;
  Object.assign($("#fdBox").style, fd);
  $("#fdCode").textContent = `.box { display: flex; justify-content: ${fd.justifyContent}; align-items: ${fd.alignItems}; }`;
});

/* ---------- появление и счётчики ---------- */
function countUp(el){
  const to = +el.textContent; if(!to || reduced) return;
  const len = el.textContent.length, t0 = performance.now(), dur = 900;
  const step = now => { const k = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = String(v).padStart(len, "0"); if(k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => entries.forEach(en => {
  if(!en.isIntersecting) return;
  en.target.classList.add("in"); io.unobserve(en.target);
  if(en.target.classList.contains("strip")) $$("b", en.target).forEach(countUp);
  if(en.target.id === "ide") setTimeout(runIde, 500);
  if(en.target.classList.contains("game")) setGoal(+($('#goalChips [aria-pressed="true"]') || {dataset:{g:50}}).dataset.g);
}), {threshold:.15, rootMargin:"0px 0px -40px 0px"}) : null;
function observe(){ $$(".reveal:not(.in)").forEach(el => io ? io.observe(el) : el.classList.add("in")); }

/* ---------- аккаунт ---------- */
async function getJSON(url){
  const r = await fetch(url, {credentials:"same-origin"});
  if(!r.ok) throw Object.assign(new Error(r.status), {status:r.status});
  return r.json();
}
/* сводка сохраняется платформой; если с тех пор прошли дни — сдвигаем недельную активность и обнуляем «сегодня» */
function freshen(s){
  const today = dayKey(new Date());
  const days = Array.from({length:7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return {k:dayKey(d), w:["вс","пн","вт","ср","чт","пт","сб"][d.getDay()]}; });
  const diff = s.day ? Math.round((new Date(today) - new Date(s.day)) / 864e5) : 0;
  const vals = (s.days7 || []).slice(Math.max(0, diff)).concat(Array(Math.min(7, Math.max(0, diff))).fill(0)).slice(-7);
  while(vals.length < 7) vals.unshift(0);
  /* после сохранения сводки занятий не было: серия сгорает, если с тех пор прошёл учебный день */
  let streak = s.streak || 0;
  const plan = Array.isArray(s.plan) && s.plan.length ? s.plan : [0, 1, 2, 3, 4, 5, 6];
  if(diff > 0 && s.day){
    const d0 = new Date(s.day + "T12:00:00");
    for(let i = s.today ? 1 : 0; i < diff; i++){ const d = new Date(d0); d.setDate(d0.getDate() + i); if(plan.includes(d.getDay())){ streak = 0; break; } }
  }
  return {...s, today:diff > 0 ? 0 : s.today, streak, days:days.map((d, i) => ({...d, v:vals[i] || 0}))};
}
function continueHref(s){ return s && !s.done && s.week ? "/app#w" + s.week : "/app#today"; }

function renderGuest(cfg){
  const reg = cfg.registration !== false;
  $("#navAcc").innerHTML = `<a class="btn ghost sm" href="/app">Войти</a>${reg ? '<a class="btn cta sm" href="/app?mode=register">Начать</a>' : ""}`;
  if(!reg) $$("[data-reg]").forEach(a => { a.href = "/app"; a.textContent = "Войти"; });
  renderLadder(0);
}

function renderUser(me, s0){
  const u = me.user, name = u.displayName || u.username, init = name.trim().charAt(0).toUpperCase() || "?";
  const admin = u.role === "admin";
  const s = s0 && s0.v ? freshen(s0) : null;
  const href = continueHref(s);

  $("#navAcc").innerHTML = `<a class="acc-chip" href="${href}" title="Открыть платформу"><i class="av">${esc(init)}</i><span><b>${esc(name)}</b><small>${s ? `LVL ${pad(s.level)} · ${s.pct}%` : admin ? "Админ" : "В сети"}</small></span></a>`;

  $("#heroCta").innerHTML = `<a class="btn cta" href="${href}">${s && !s.done ? "Продолжить · неделя " + s.week : "Открыть платформу"}</a><a class="btn line" href="/app#today">Мой день</a>`;

  let body;
  if(s){
    const pctLvl = Math.max(0, Math.min(100, (s.xp - s.lvlFrom) / Math.max(1, s.lvlTo - s.lvlFrom) * 100));
    const maxV = Math.max(s.goal || 50, ...s.days.map(d => d.v));
    body = `
      <div class="acct-lvl">
        <div class="lvl-num" aria-label="Уровень ${s.level}">${pad(s.level)}</div>
        <div class="lvl-info"><b>${esc(s.title)}</b><small>${s.xp.toLocaleString("ru-RU")} XP · до ${s.level + 1} уровня ${(s.lvlTo - s.xp).toLocaleString("ru-RU")}</small><div class="bar"><i data-w="${pctLvl}"></i></div></div>
      </div>
      <div class="acct-stats">
        <div><span>Сегодня</span><b>${s.today}<small>/${s.goal}</small></b></div>
        <div class="${s.streak ? "hot" : ""}"><span>Серия</span><b>${s.streak}<small>${plural(s.streak, "день", "дня", "дней")}</small></b></div>
        <div><span>Задачи</span><b>${s.solved}<small>/${s.exTotal}</small></b></div>
        <div><span>Курс</span><b>${s.pct}<small>%</small></b></div>
      </div>
      <a class="acct-next" href="${href}">
        <span>${s.done ? "Курс пройден" : `Неделя ${pad(s.week)} / ${s.weeks} · ${esc(s.trackName)}`}</span>
        <b>${s.done ? "Все уроки закрыты — время для проектов и собеседований" : esc(s.lesson)}</b>
        <em>${s.done ? esc(s.trackName) : esc(s.mod)}${s.cards ? ` · ${s.cards} ${plural(s.cards, "карточка ждёт", "карточки ждут", "карточек ждут")} повторения` : ""}</em>
      </a>
      <div class="days" aria-label="Опыт за последние 7 дней">${s.days.map((d, i) => `<div class="${i === 6 ? "td" : ""}" title="${d.v} XP"><i class="${d.v >= (s.goal || 50) ? "full" : d.v ? "some" : ""}" style="height:${Math.max(d.v ? 8 : 3, d.v / maxV * 34)}px"></i><span>${d.w}</span></div>`).join("")}</div>`;
  } else {
    body = `<p class="acct-empty">Открой платформу — здесь появятся твой уровень, серия дней и следующий урок.</p>`;
  }

  const side = $("#heroSide");
  side.classList.add("has-acct");
  $(".acct", side)?.remove();
  side.insertAdjacentHTML("beforeend", `
    <section class="acct" aria-label="Твой аккаунт">
      <div class="acct-top"><span class="live">Ты вошёл</span><span class="role ${admin ? "admin" : ""}">${admin ? "Администратор" : "Ученик"}</span></div>
      <div class="acct-who"><i class="av">${esc(init)}</i><div><b>${esc(name)}</b><small>@${esc(u.username)}${u.createdAt ? " · с " + new Date(u.createdAt).toLocaleDateString("ru-RU", {day:"numeric", month:"long", year:"numeric"}) : ""}</small></div></div>
      ${body}
      <div class="acct-act">
        <a class="btn cta sm" href="${href}">${s && !s.done ? "Продолжить" : "Открыть платформу"}</a>
        ${admin ? '<a class="btn ghost sm" href="/app#admin">Ученики</a>' : ""}
        <button class="btn ghost sm" id="logout" type="button">Выйти</button>
      </div>
    </section>`);
  requestAnimationFrame(() => setTimeout(() => $$(".acct .bar i").forEach(i => i.style.width = i.dataset.w + "%"), 60));

  $("#finalTitle").innerHTML = `С возвращением, ${esc(name)}<span class="red">.</span>`;
  $("#finalLead").textContent = s
    ? (s.done ? "Все уроки направления закрыты. Загляни в раздел «Готов к работе?» и доведи проекты до портфолио." : `Ты на неделе ${s.week} из ${s.weeks}. Следующий урок — «${s.lesson}».`)
    : "Твой аккаунт готов. Открой платформу и начни с первого урока.";
  $("#finalCta").innerHTML = `<a class="btn cta" href="${href}">Продолжить обучение</a><a class="btn line" href="/app#cards">Повторить карточки</a>`;

  renderLadder(s ? s.level : 0);
}

document.addEventListener("click", async e => {
  if(e.target.id !== "logout") return;
  e.target.disabled = true;
  try{ await fetch("/api/auth/logout", {method:"POST", credentials:"same-origin", headers:{"Content-Type":"application/json"}, body:"{}"}); }catch(x){}
  location.reload();
});

(async function boot(){
  renderTracks(); renderProgram(); renderLadder(0); setGoal(50);
  observe();
  let cfg = {registration:true};
  try{ cfg = await getJSON("/api/config"); }catch(e){}
  try{
    const me = await getJSON("/api/me");
    let sum = null;
    try{ sum = await getJSON("/api/docs/summary"); }catch(e){}
    renderUser(me, sum);
  }catch(e){ renderGuest(cfg); }
  observe();
})();
