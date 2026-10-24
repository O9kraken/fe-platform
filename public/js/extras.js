/* Конспекты уроков и поиск по курсу */

/* ---------- конспекты ---------- */
const NOTES = {};
let NOTES_LOADED = false;
async function loadNotes(){
  try{
    const parts = await Promise.all(["front", "back"].map(n => fetch(`/notes/${n}.md`).then(r => r.ok ? r.text() : "")));
    parts.join("\n").split(/^@@ (\S+)\s*$/m).forEach((chunk, i, arr) => { if(i % 2) NOTES[chunk] = (arr[i + 1] || "").trim(); });
  }catch(e){ console.warn("notes", e); }
  NOTES_LOADED = true;
  if(view === "route" && !$("#week").contains(document.activeElement)) renderWeek();
}
function notesSec(id){
  if(!NOTES[id]) return NOTES_LOADED ? "" : '<div class="sec" id="sec-notes"><p class="hint">Загружаю конспект…</p></div>';
  const read = !!(S.read && S.read[id]);
  return `<div class="sec" id="sec-notes"><h3><span class="n">✎</span>Конспект</h3>
    <div class="notes ai-text">${md(NOTES[id])}</div>
    <div class="row notes-foot"><button class="btn sm ${read ? "ghost" : ""}" data-read="${id}">${read ? "✓ Прочитано" : "Прочитал, всё понятно · +5 XP"}</button>
    <span class="hint">Что-то непонятно — нажми «Разобрать» у темы ниже или спроси наставника.</span></div></div>`;
}
document.addEventListener("click", e => {
  const r = e.target.closest("[data-read]"); if(!r) return;
  const id = r.dataset.read; S.read = S.read || {};
  if(S.read[id]){ delete S.read[id]; } else { S.read[id] = today(); award("n:" + id, 5); }
  saveCourse(); renderWeek();
});

/* ---------- поиск по курсу ---------- */
const norm = s => String(s || "").toLowerCase().replace(/ё/g, "е");
let searchIdx = [], searchSel = 0, searchRes = [];
function buildIndex(){
  const out = [];
  trackIds().forEach((id, i) => {
    const l = LES[id], n = i + 1;
    out.push({kind:"Урок", title:l.t, sub:`Неделя ${n} · ${MODULES[l.mod].name}`, text:[l.goal, ...l.learn, l.why].join(" "), go:() => { setView("route"); go(n); }});
    (NOTES[id] || "").split("\n").filter(x => /^###\s/.test(x)).forEach(h => {
      const head = h.replace(/^###\s*/, "");
      if(head === "Запомни") return;
      out.push({kind:"Конспект", title:head, sub:`Неделя ${n} · ${l.t}`, text:"", go:() => { setView("route"); go(n); setTimeout(() => {
        const t = [...$$("#sec-notes h4")].find(x => x.textContent === head) || $("#sec-notes"); if(t) t.scrollIntoView({behavior:"smooth", block:"center"}); }, 80); }});
    });
    (VIZ_FOR[id] || []).forEach(v => out.push({kind:"Схема", title:VIZ[v].title, sub:`Неделя ${n} · ${l.t}`, text:VIZ[v].lead, go:() => { setView("route"); go(n); setTimeout(() => { const t = $(`[data-viz="${v}"]`); if(t) t.scrollIntoView({behavior:"smooth", block:"start"}); }, 80); }}));
    [...exOf(id), ...genOf(id)].forEach(ex => out.push({kind:"Задача", title:ex.t, sub:`Неделя ${n} · ${MODE_LABEL[ex.mode]}${S.ex[ex.id] && S.ex[ex.id].passed ? " · решена" : ""}`, text:strip(ex.task), go:() => openExercise(ex.id)}));
  });
  GLOSS.forEach(([t, d, a]) => out.push({kind:"Термин", title:t, sub:d, text:a, go:() => { setView("gloss"); setTimeout(() => {
    const el = [...$$(".term")].find(x => x.querySelector("b").textContent === t); if(el){ el.scrollIntoView({behavior:"smooth", block:"center"}); el.classList.remove("hl"); void el.offsetWidth; el.classList.add("hl"); } }, 60); }}));
  Object.entries(VIEW_TITLES).forEach(([v, t]) => { if(v !== "admin" || ME.role === "admin") out.push({kind:"Раздел", title:t, sub:"Перейти в раздел", text:"", go:() => setView(v)}); });
  return out;
}
function openSearch(){
  if(!S || !$("#lab").hidden) return;
  searchIdx = buildIndex(); searchSel = 0;
  let box = $("#search");
  if(!box){ box = document.createElement("div"); box.id = "search"; box.className = "search"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Поиск по курсу"); document.body.appendChild(box); }
  box.innerHTML = `<div class="search-card">
    <div class="search-in"><svg class="ni" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input type="text" id="searchQ" placeholder="Урок, тема, задача или термин" autocomplete="off" spellcheck="false" aria-controls="searchList"><kbd>Esc</kbd></div>
    <ul class="search-list" id="searchList" role="listbox"></ul>
    <p class="search-foot hint">↑ ↓ — выбрать · Enter — открыть</p></div>`;
  box.hidden = false; document.documentElement.classList.add("lab-open");
  runSearch(""); setTimeout(() => $("#searchQ").focus(), 0);
}
function closeSearch(){ const b = $("#search"); if(b && !b.hidden){ b.hidden = true; document.documentElement.classList.remove("lab-open"); } }
function runSearch(q){
  const n = norm(q).trim();
  if(!n){
    const cur = lessonAt(sel), step = nextStep();
    searchRes = searchIdx.filter(x => x.kind === "Раздел" || (x.kind === "Урок" && (x.title === cur.t || (step && x.title === LES[step.id].t)))).slice(0, 12);
  } else {
    const words = n.split(/\s+/);
    searchRes = searchIdx.map(x => {
      const t = norm(x.title), all = t + " " + norm(x.sub) + " " + norm(x.text);
      if(!words.every(w => all.includes(w))) return null;
      let sc = t.startsWith(n) ? 100 : t.includes(n) ? 60 : words.every(w => t.includes(w)) ? 40 : 10;
      sc += {Урок:8, Конспект:6, Задача:5, Схема:5, Термин:4, Раздел:3}[x.kind] || 0;
      return {...x, sc};
    }).filter(Boolean).sort((a, b) => b.sc - a.sc).slice(0, 40);
  }
  searchSel = 0; drawSearch(q);
}
function drawSearch(q){
  const hl = s => { const e = esc(s); if(!q.trim()) return e; const i = norm(s).indexOf(norm(q).trim()); return i < 0 ? e : esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + q.trim().length)) + "</mark>" + esc(s.slice(i + q.trim().length)); };
  $("#searchList").innerHTML = searchRes.length ? searchRes.map((x, i) => `<li role="option" id="sr-${i}" aria-selected="${i === searchSel}" data-sr="${i}"><span class="sr-k k-${x.kind}">${x.kind}</span><span class="sr-t"><b>${hl(x.title)}</b><small>${esc(x.sub)}</small></span></li>`).join("")
    : `<li class="sr-empty">Ничего не нашлось. Попробуй другое слово — например, «flex», «JOIN» или «промис».</li>`;
  $("#searchQ").setAttribute("aria-activedescendant", searchRes.length ? "sr-" + searchSel : "");
}
function pickSearch(i){ const x = searchRes[i]; if(!x) return; closeSearch(); x.go(); }
document.addEventListener("input", e => { if(e.target.id === "searchQ") runSearch(e.target.value); });
document.addEventListener("click", e => {
  if(e.target.closest("#searchBtn")){ openSearch(); return; }
  const r = e.target.closest("[data-sr]"); if(r){ pickSearch(+r.dataset.sr); return; }
  if(e.target.id === "search") closeSearch();
});
document.addEventListener("keydown", e => {
  const box = $("#search"), open = box && !box.hidden;
  if((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "л")){ e.preventDefault(); open ? closeSearch() : openSearch(); return; }
  if(!open){ if(e.key === "/" && !e.target.closest("input,textarea,select,.CodeMirror") && $("#lab").hidden && S){ e.preventDefault(); openSearch(); } return; }
  if(e.key === "Escape"){ e.preventDefault(); closeSearch(); }
  if(e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); searchSel = (searchSel + (e.key === "ArrowDown" ? 1 : -1) + searchRes.length) % Math.max(1, searchRes.length); drawSearch($("#searchQ").value); const el = $("#sr-" + searchSel); if(el) el.scrollIntoView({block:"nearest"}); }
  if(e.key === "Enter"){ e.preventDefault(); pickSearch(searchSel); }
});
