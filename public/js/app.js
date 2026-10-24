/* ================= utils ================= */
const CHICK = '<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M17 9c1-4 4-5 5-3 1-3 5-2 4 2" fill="#E03131"/><ellipse cx="21" cy="27" rx="13" ry="12" fill="#fff" stroke="currentColor" stroke-width="2"/><circle cx="21" cy="15" r="7" fill="#fff" stroke="currentColor" stroke-width="2"/><circle cx="23" cy="14" r="1.4" fill="currentColor"/><path d="M27 15l5 1.5-5 1.5z" fill="#F59F00"/><path d="M15 27c3 3 7 3 9 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 39v3M25 39v3" stroke="#F59F00" stroke-width="2" stroke-linecap="round"/></svg>';
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MON = ["янв","февр","мар","апр","мая","июня","июля","авг","сент","окт","нояб","дек"];
const START = new Date(2026, 9, 26);
const MODE_LABEL = {web:"HTML · CSS · JS", js:"JavaScript", ts:"TypeScript", react:"React", api:"Node API", sql:"SQL"};
const MODE_FILES = {web:["html","css","js"], js:["js"], ts:["ts"], react:["jsx","css"], api:["js"], sql:["sql"]};
const FILE_NAMES = {html:"index.html", css:"style.css", js:"script.js", ts:"main.ts", jsx:"App.jsx", sql:"query.sql"};
const fileLabel = (mode, f) => mode === "api" && f === "js" ? "server.js" : FILE_NAMES[f];

function toast(t){ const el=$("#toast"); el.textContent=t; el.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>el.hidden=true,2600); }
function today(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function loadScript(src){
  loadScript.cache = loadScript.cache || {};
  if(!loadScript.cache[src]) loadScript.cache[src] = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => { delete loadScript.cache[src]; rej(new Error("Не загрузилось: " + src)); };
    document.head.appendChild(s);
  });
  return loadScript.cache[src];
}

/* markdown for AI text */
const CODES = [];
function md(src){
  const parts = String(src || "").split(/```/);
  return parts.map((b, i) => {
    if(i % 2){
      const m = /^([\w+-]*)\n/.exec(b); const lang = m ? m[1].toLowerCase() : "";
      const code = (m ? b.slice(m[0].length) : b).replace(/\n$/, "");
      const idx = CODES.push({code, lang}) - 1;
      const runnable = /^(js|javascript|jsx|ts|tsx|typescript|html|css|sql|)$/.test(lang);
      return `<div class="codeblk">${lang ? `<span class="lang">${esc(lang)}</span>` : ""}<pre><code>${esc(code)}</code></pre>${runnable ? `<button class="to-sb" data-ci="${idx}">В песочницу</button>` : ""}</div>`;
    }
    return b.trim().split(/\n{2,}/).filter(Boolean).map(par => {
      const lines = par.split("\n");
      const inl = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      if(lines.length === 1 && /^#{1,4}\s/.test(lines[0])) return "<h4>" + inl(lines[0].replace(/^#+\s*/, "")) + "</h4>";
      if(lines.length > 1 && /^#{1,4}\s/.test(lines[0])) return "<h4>" + inl(lines[0].replace(/^#+\s*/, "")) + "</h4>" + md(lines.slice(1).join("\n"));
      if(lines.every(l => /^\s*\|.*\|\s*$/.test(l)) && lines.length > 1){
        const cells = l => l.trim().replace(/^\||\|$/g, "").split("|").map(c => inl(c.trim()));
        const body = lines.filter(l => !/^\s*\|[\s:|-]+\|\s*$/.test(l));
        return `<div class="tbl"><table><thead><tr>${cells(body[0]).map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${body.slice(1).map(r => `<tr>${cells(r).map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      }
      if(lines.every(l => /^\s*[-*•]\s+/.test(l))) return "<ul>" + lines.map(l => "<li>" + inl(l.replace(/^\s*[-*•]\s+/, "")) + "</li>").join("") + "</ul>";
      if(lines.every(l => /^\s*\d+[.)]\s+/.test(l))) return "<ol>" + lines.map(l => "<li>" + inl(l.replace(/^\s*\d+[.)]\s+/, "")) + "</li>").join("") + "</ol>";
      return "<p>" + lines.map(l => /^#{1,4}\s/.test(l) ? "<strong>" + inl(l.replace(/^#+\s*/, "")) + "</strong>" : inl(l)).join("<br>") + "</p>";
    }).join("");
  }).join("");
}
/* our own task text: paragraphs + "- " lists, HTML allowed */
function taskHtml(t){
  return String(t).split(/\n{2,}/).map(par => {
    if(/^<pre/.test(par.trim())) return par;
    const lines = par.split("\n");
    if(lines.every(l => /^- /.test(l))) return "<ul>" + lines.map(l => "<li>" + l.slice(2) + "</li>").join("") + "</ul>";
    const out = []; let list = [];
    lines.forEach(l => { if(/^- /.test(l)) list.push("<li>" + l.slice(2) + "</li>"); else { if(list.length){ out.push("<ul>" + list.join("") + "</ul>"); list = []; } out.push("<p>" + l + "</p>"); } });
    if(list.length) out.push("<ul>" + list.join("") + "</ul>");
    return out.join("");
  }).join("");
}

/* ================= API & storage ================= */
let ME = null;
async function api(method, url, body){
  const r = await fetch(url, {method, credentials:"same-origin", headers: body !== undefined ? {"Content-Type":"application/json"} : {}, body: body !== undefined ? JSON.stringify(body) : undefined});
  let data = null; try{ data = await r.json(); }catch(e){}
  if(!r.ok){
    const e = new Error((data && data.error) || ("Ошибка " + r.status)); e.status = r.status;
    if(r.status === 401 && ME && !url.startsWith("/api/auth")) location.reload();
    throw e;
  }
  return data;
}
function setSync(state){
  const el = $("#storeNote"); if(!el) return;
  el.textContent = state === "saving" ? "Сохраняю…" : state === "error" ? "Нет связи с сервером. Изменения сохранены в браузере, повторю отправку." : "Всё сохранено в твоём аккаунте.";
  el.dataset.state = state;
}
const Store = {
  uid:null, mem:{}, timers:{}, pending:new Set(),
  key(n){ return "fe3:" + this.uid + ":" + n; },
  get(n){
    if(!this.mem[n]){
      let v = null; try{ v = JSON.parse(localStorage.getItem(this.key(n))); }catch(e){}
      this.mem[n] = v && typeof v === "object" ? v : {};
    }
    return this.mem[n];
  },
  save(n){ this.pending.add(n); setSync("saving"); clearTimeout(this.timers[n]); this.timers[n] = setTimeout(() => this.flush(n), 800); },
  async flush(n){
    const v = this.mem[n]; if(!v) return;
    try{ localStorage.setItem(this.key(n), JSON.stringify(v)); }catch(e){}
    try{ await api("PUT", "/api/docs/" + n, v); this.pending.delete(n); if(!this.pending.size) setSync("ok"); }
    catch(e){ if(e.status === 413){ toast("Слишком много данных в «" + n + "», не сохранилось."); this.pending.delete(n); return; } setSync("error"); clearTimeout(this.timers[n]); this.timers[n] = setTimeout(() => this.flush(n), 15000); }
  },
  async loadAll(){
    const all = await api("GET", "/api/docs");
    for(const [n, d] of Object.entries(all)){ this.mem[n] = d; try{ localStorage.setItem(this.key(n), JSON.stringify(d)); }catch(e){} }
    setSync("ok");
  },
  beacon(){
    for(const n of this.pending){ clearTimeout(this.timers[n]); try{ fetch("/api/docs/" + n, {method:"PUT", keepalive:true, credentials:"same-origin", headers:{"Content-Type":"application/json"}, body:JSON.stringify(this.mem[n])}); }catch(e){} }
  }
};
addEventListener("pagehide", () => Store.beacon());
addEventListener("visibilitychange", () => { if(document.visibilityState === "hidden") Store.beacon(); });
let S; // course doc: {c,q,j,ex,days}
function normCourse(d){
  d.c = d.c || {}; d.q = d.q || {}; d.j = d.j || {}; d.ex = d.ex || {}; d.days = d.days || {};
  for(const k of Object.keys(d.c)) if(k.includes(".")){ d.c[k.replace(/\./g, "_")] = d.c[k]; delete d.c[k]; }
  for(const k of Object.keys(d.q)) if(k.includes(".")){ d.q[k.replace(/\./g, "_")] = d.q[k]; delete d.q[k]; }
  return d;
}
function migrateCourse(s){
  if(s.v >= 2) return false;
  const id = n => (FRONT[n - 1] || [])[0];
  let m;
  for(const k of Object.keys(s.c)){
    if((m = /^w(\d+)_(l\d+|do|ck)$/.exec(k)) && id(+m[1])){ s.c[id(+m[1]) + "_" + m[2]] = s.c[k]; delete s.c[k]; }
    else if((m = /^r(\d+)$/.exec(k))){ s.c["r_frontend_" + m[1]] = s.c[k]; delete s.c[k]; }
  }
  for(const k of Object.keys(s.q)) if((m = /^(\d+)_(\d+)$/.exec(k)) && id(+m[1])){ s.q[id(+m[1]) + "_q" + m[2]] = s.q[k]; delete s.q[k]; }
  for(const k of Object.keys(s.j)) if(/^\d+$/.test(k) && id(+k)){ s.j[id(+k)] = s.j[k]; delete s.j[k]; }
  s.v = 2;
  return true;
}
function migrateDocs(){
  const g = Store.get("gen"); let gm = false;
  for(const k of Object.keys(g)){ const m = /^w(\d+)$/.exec(k); const id = m && (FRONT[+m[1] - 1] || [])[0]; if(id){ g[id] = (g[id] || []).concat(g[k].map(e => ({...e, l:id}))); delete g[k]; gm = true; } }
  if(gm) Store.save("gen");
  for(let n = 1; n <= 30; n++){ const d = Store.mem["deep" + n]; if(d && Object.keys(d).length){ const id = FRONT[n - 1][0]; Object.assign(Store.get("deep-" + id), d); Store.save("deep-" + id); Store.mem["deep" + n] = {}; Store.save("deep" + n); } }
}
function initCourse(){ S = gameInit(normCourse(Store.get("course"))); if(migrateCourse(S)) Store.save("course"); migrateDocs(); }
function touch(){ S.days[today()] = 1; }
function saveCourse(){ touch(); gameTick(); Store.save("course"); renderStats(); }

/* ================= progress ================= */
const trackKey = (s = S) => (s && TRACKS[s.track]) ? s.track : "fullstack";
const trackIds = (s = S) => TRACKS[trackKey(s)].ids;
const trackLen = (s = S) => trackIds(s).length;
const lessonAt = n => LES[trackIds()[n - 1]];
const posOf = id => trackIds().indexOf(id) + 1;
function weekDates(n){
  const a = new Date(START); a.setDate(a.getDate() + 7 * (n - 1));
  const b = new Date(a); b.setDate(b.getDate() + 6);
  return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MON[b.getMonth()]}` : `${a.getDate()} ${MON[a.getMonth()]} – ${b.getDate()} ${MON[b.getMonth()]}`;
}
function calWeek(){ const d = Math.floor((new Date() - START) / 864e5); return Math.min(S ? trackLen() : 30, Math.max(1, Math.floor(d / 7) + 1)); }
const exOf = id => EX.filter(e => e.l === id || (e.also || []).includes(id));
function genOf(id){ const g = Store.get("gen"); return g[id] || []; }
function allEx(){ const out = [...EX]; const g = Store.get("gen"); for(const k of Object.keys(g)) if(Array.isArray(g[k])) out.push(...g[k]); return out; }
function findEx(id){ return EX.find(e => e.id === id) || allEx().find(e => e.id === id); }
function keys(id){ const w = LES[id]; return [...w.learn.map((_, i) => `${id}_l${i}`), `${id}_do`, `${id}_ck`]; }
function wp(id, s = S){
  const k = keys(id); const ex = exOf(id);
  const d = k.filter(x => s.c[x]).length + ex.filter(e => s.ex[e.id] && s.ex[e.id].passed).length;
  return {d, t: k.length + ex.length};
}
function xp(s = S){
  let x = 0;
  x += Object.keys(s.c).filter(k => s.c[k] && /_(l\d+|do|ck)$/.test(k)).length * 5;
  for(const l of LESSONS) l.quiz.forEach((q, i) => { if(s.q[`${l.id}_q${i}`] === q.a) x += 10; });
  x += Object.values(s.ex).filter(e => e && e.passed).length * 40;
  x += Object.values(s.j).filter(j => j && Object.values(j).some(v => v && String(v).trim())).length * 10;
  x += s.cardXp || 0;
  return x;
}
function coursePct(s = S){ let d = 0, t = 0; for(const id of trackIds(s)){ const p = wp(id, s); d += p.d; t += p.t; } return Math.round(d / t * 100); }
function streak(s = S){
  const d = new Date();
  const key = x => x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  let k = 0;
  if(!s.days[key(d)]) d.setDate(d.getDate() - 1);
  while(s.days[key(d)]){ k++; d.setDate(d.getDate() - 1); }
  return k;
}
/* модули текущего направления: подряд идущие уроки одного модуля — одна линия */
function trackRuns(s = S){
  const runs = [];
  trackIds(s).forEach((id, i) => { const l = LES[id]; const last = runs[runs.length - 1];
    if(last && last.mod === l.mod) last.items.push({id, n:i + 1}); else runs.push({mod:l.mod, items:[{id, n:i + 1}]}); });
  return runs;
}

/* ================= sandbox engine ================= */
const abs = p => new URL(p, location.href).href;
const CDN = {
  cm: "/vendor/codemirror/",
  babel: "/vendor/babel/babel.min.js",
  react: abs("/vendor/react/react.development.js"),
  reactDom: abs("/vendor/react-dom/react-dom.development.js")
};
let cmReady = null;
function ensureCM(){
  if(!cmReady) cmReady = (async () => {
    await loadScript(CDN.cm + "lib/codemirror.js");
    for(const m of ["xml","javascript","css"]) await loadScript(CDN.cm + `mode/${m}/${m}.js`);
    await loadScript(CDN.cm + "mode/htmlmixed/htmlmixed.js");
    await loadScript(CDN.cm + "mode/jsx/jsx.js");
    await loadScript(CDN.cm + "mode/sql/sql.js");
    for(const a of ["edit/closebrackets","edit/matchbrackets","edit/closetag","comment/comment"]) await loadScript(CDN.cm + `addon/${a}.js`);
    return true;
  })().catch(e => { console.warn(e); return false; });
  return cmReady;
}
let babelReady = null;
function ensureBabel(){ if(!babelReady) babelReady = loadScript(CDN.babel).then(() => true, e => { babelReady = null; throw e; }); return babelReady; }

function prepJs(code, mode){
  let c = code.replace(/^\s*import\s+[^;\n]*?from\s+['"][^'"]+['"];?[ \t]*$/gm, "").replace(/^\s*import\s+['"][^'"]+['"];?[ \t]*$/gm, "");
  c = c.replace(/^export\s+default\s+(?=function|class)/gm, "").replace(/^export\s+(?=(const|let|var|function|class|type|interface|async)\b)/gm, "");
  if(mode === "react" && !/createRoot|ReactDOM\.render/.test(c) && /(function\s+App\b|const\s+App\s*=)/.test(c))
    c += '\n\nReactDOM.createRoot(document.getElementById("root")).render(<App />);';
  return c;
}
async function compile(mode, files){
  if(mode === "web") return {js: files.js || ""};
  if(mode === "js" || mode === "api") return {js: files.js || ""};
  const src = mode === "react" ? files.jsx || "" : files.ts || "";
  try{ await ensureBabel(); }catch(e){ return {error: "Не загрузился компилятор Babel. Проверь интернет и запусти ещё раз."}; }
  try{
    const out = Babel.transform(prepJs(src, mode), {
      presets: mode === "react" ? [["react", {runtime:"classic"}], ["typescript", {isTSX:true, allExtensions:true}]] : [["typescript", {allExtensions:true}]],
      filename: mode === "react" ? "App.tsx" : "main.ts", retainLines: true, sourceType: "script"
    });
    return {js: out.code};
  }catch(e){
    const loc = e.loc ? ` (строка ${e.loc.line})` : "";
    return {error: "Синтаксическая ошибка" + loc + ": " + String(e.message).replace(/^[^:]*:\s*/, "").split("\n")[0]};
  }
}

/* code that runs inside the sandbox — serialized with toString() */
function __labPre(TOK){
  var send = function(t, d){ try{ parent.postMessage({__lab:TOK, t:t, d:d}, "*"); }catch(e){} };
  var fmt = function(v){
    try{
      if(typeof v === "string") return v;
      if(v === undefined) return "undefined";
      if(typeof v === "function") return "ƒ " + (v.name || "анонимная") + "()";
      if(v instanceof Error) return v.name + ": " + v.message;
      if(typeof Element !== "undefined" && v instanceof Element) return "<" + v.tagName.toLowerCase() + (v.id ? "#" + v.id : "") + (typeof v.className === "string" && v.className.trim() ? "." + v.className.trim().split(/\s+/).join(".") : "") + ">";
      if(typeof v === "bigint") return v + "n";
      if(typeof v === "symbol") return v.toString();
      if(v instanceof Promise) return "Promise {…}";
      if(v instanceof Map) return "Map " + fmt(Array.from(v.entries()));
      if(v instanceof Set) return "Set " + fmt(Array.from(v));
      if(typeof URL !== "undefined" && v instanceof URL) return "URL " + v.href;
      var seen = new WeakSet();
      var s = JSON.stringify(v, function(k, x){ if(typeof x === "object" && x){ if(seen.has(x)) return "[цикл]"; seen.add(x); } if(typeof x === "function") return "ƒ"; if(x === undefined) return "undefined"; return x; }, 2);
      if(s === undefined) return String(v);
      return s.length > 3000 ? s.slice(0, 3000) + "…" : s;
    }catch(e){ return String(v); }
  };
  ["log","info","warn","error","table","debug"].forEach(function(k){
    var o = console[k];
    console[k] = function(){ var a = [].slice.call(arguments); send("log", {k: k === "table" || k === "debug" ? "log" : k, a: a.map(fmt)}); try{ o && o.apply(console, a); }catch(e){} };
  });
  var line = function(n){ var u = window.__UL || 0; return n && u && n >= u ? " (строка " + (n - u + 1) + ")" : ""; };
  addEventListener("error", function(e){ send("log", {k:"error", a:[(e.message || "Ошибка") + line(e.lineno)]}); });
  addEventListener("unhandledrejection", function(e){ send("log", {k:"error", a:["Необработанная ошибка в промисе: " + fmt(e.reason)]}); });
  window.alert = function(m){ send("log", {k:"info", a:["alert: " + fmt(m)]}); };
  window.confirm = function(m){ send("log", {k:"info", a:["confirm: " + fmt(m) + " → false"]}); return false; };
  window.prompt = function(m){ send("log", {k:"info", a:["prompt: " + fmt(m) + " → null"]}); return null; };
  window.__send = send;
  addEventListener("message", function(e){
    var d = e.data; if(!d || d.__labReq !== TOK) return;
    var a = (typeof app !== "undefined") ? app : window.app;
    if(!a || typeof a.inject !== "function"){ send("resp", {id:d.id, error:"В коде нет приложения: объяви const app = express()"}); return; }
    a.inject(d).then(function(r){ send("resp", {id:d.id, r:r}); });
  });
  addEventListener("load", function(){ send("ready", {}); });
  document.addEventListener("click", function(e){
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if(a){ var h = a.getAttribute("href") || ""; if(h.charAt(0) !== "#"){ e.preventDefault(); send("log", {k:"info", a:["Переход по ссылке «" + h + "». В песочнице ссылки не открываются."]}); } }
  }, true);
}
/* Симуляция Express: тот же API (маршруты, middleware, req/res, ошибки), но работает в браузере. */
function __miniExpress(){
  function compile(path){
    var keys = [];
    var src = String(path).replace(/\/+$/, "").replace(/[.+*?^${}()|[\]\\]/g, "\\$&").replace(/:(\w+)/g, function(_, k){ keys.push(k); return "([^/]+)"; });
    return {re:new RegExp("^" + src + "/?$", "i"), keys:keys};
  }
  function makeRes(){
    var res = {statusCode:200, headers:{}, body:undefined, finished:false, locals:{}};
    function finish(){ if(!res.finished){ res.finished = true; if(res._done) res._done(); } return res; }
    res.status = function(c){ res.statusCode = c; return res; };
    res.set = res.header = res.setHeader = function(k, v){ if(typeof k === "object"){ for(var x in k) res.set(x, k[x]); return res; } res.headers[String(k).toLowerCase()] = String(v); return res; };
    res.get = function(k){ return res.headers[String(k).toLowerCase()]; };
    res.type = function(t){ return res.set("content-type", t === "json" ? "application/json" : t); };
    res.json = function(o){ if(res.finished){ console.warn("Ответ уже отправлен, повторный res.json() проигнорирован"); return res; } if(!res.headers["content-type"]) res.set("content-type", "application/json"); res.body = o === undefined ? null : JSON.parse(JSON.stringify(o)); return finish(); };
    res.send = function(x){ if(res.finished){ console.warn("Ответ уже отправлен, повторный res.send() проигнорирован"); return res; } if(x !== null && typeof x === "object") return res.json(x); res.body = x === undefined ? "" : String(x); if(!res.headers["content-type"]) res.set("content-type", "text/html; charset=utf-8"); return finish(); };
    res.sendStatus = function(c){ res.statusCode = c; return res.send(String(c)); };
    res.end = function(x){ if(x !== undefined) res.body = String(x); return finish(); };
    res.redirect = function(a, b){ var url = b === undefined ? a : b; res.statusCode = b === undefined ? 302 : a; res.set("location", url); return finish(); };
    res.cookie = function(n, v){ res.set("set-cookie", n + "=" + v); return res; };
    return res;
  }
  function express(){
    var stack = [];
    var app = function(req, res, next){ app.handle(req, res, next); };
    app.__isApp = true; app.locals = {};
    function route(method, path, fns){ fns.flat().forEach(function(fn){ var c = compile(path); stack.push({method:method, re:c.re, keys:c.keys, fn:fn}); }); return app; }
    ["get","post","put","patch","delete","options","head"].forEach(function(m){ app[m] = function(p){ return route(m.toUpperCase(), p, [].slice.call(arguments, 1)); }; });
    app.all = function(p){ return route("ALL", p, [].slice.call(arguments, 1)); };
    app.use = function(){ var a = [].slice.call(arguments), prefix = "/"; if(typeof a[0] === "string") prefix = a.shift().replace(/\/+$/, "") || "/"; a.flat().forEach(function(fn){ stack.push({method:"USE", prefix:prefix, fn:fn}); }); return app; };
    app.listen = function(port, cb){ console.info("Сервер запущен на порту " + (port || 3000) + " (симуляция). Запросы отправляй из панели «Запрос» справа."); if(typeof cb === "function") cb(); return {close:function(){}}; };
    app.handle = function(req, res, out){
      var i = 0;
      function next(err){
        if(res.finished) return;
        if(err === "route") err = undefined;
        while(i < stack.length){
          var L = stack[i++], m;
          if(L.method === "USE"){
            if(!(L.prefix === "/" || req.path === L.prefix || req.path.indexOf(L.prefix + "/") === 0)) continue;
          } else {
            if(L.method !== "ALL" && L.method !== req.method) continue;
            m = L.re.exec(req.path); if(!m) continue;
            req.params = {}; L.keys.forEach(function(k, j){ req.params[k] = decodeURIComponent(m[j + 1]); });
          }
          var isErr = typeof L.fn === "function" && L.fn.length === 4;
          if(typeof L.fn !== "function") continue;
          if(err && !isErr) continue;
          if(!err && isErr) continue;
          if(L.method === "USE" && L.fn.__isApp){
            var sp = req.path, sb = req.baseUrl || "";
            if(L.prefix !== "/"){ req.path = req.path.slice(L.prefix.length) || "/"; req.baseUrl = sb + L.prefix; }
            return L.fn.handle(req, res, function(e){ req.path = sp; req.baseUrl = sb; next(e); });
          }
          try{
            var r = isErr ? L.fn(err, req, res, next) : L.fn(req, res, next);
            if(r && typeof r.then === "function") r.then(null, function(e){ next(e || new Error("Промис отклонён")); });
          }catch(e){ next(e); }
          return;
        }
        out(err);
      }
      next();
    };
    app.inject = function(o){
      o = o || {};
      return new Promise(function(resolve){
        var method = String(o.method || "GET").toUpperCase();
        var url = String(o.url || "/"); if(url.charAt(0) !== "/") url = "/" + url;
        var u = new URL(url, "http://localhost");
        var headers = {}, h = o.headers || {};
        for(var k in h) if(h[k] != null && h[k] !== "") headers[k.toLowerCase()] = String(h[k]);
        var body = o.body;
        if(typeof body === "string"){ if(body.trim() === "") body = undefined; else { try{ body = JSON.parse(body); }catch(e){} } }
        if(body !== undefined && body !== null){ body = JSON.parse(JSON.stringify(body)); if(!headers["content-type"]) headers["content-type"] = "application/json"; }
        var req = {method:method, url:u.pathname + u.search, originalUrl:u.pathname + u.search, path:decodeURI(u.pathname), baseUrl:"", headers:headers, params:{}, query:{}, body:undefined, __raw:body, ip:"127.0.0.1", app:app};
        u.searchParams.forEach(function(v, k){ req.query[k] = k in req.query ? [].concat(req.query[k], v) : v; });
        req.get = req.header = function(n){ return headers[String(n).toLowerCase()]; };
        var res = makeRes(); res.req = req; req.res = res;
        var timer = setTimeout(function(){
          if(!res.finished){ res.finished = true; console.error("Запрос " + method + " " + req.path + " завис: обработчик не отправил ответ и не вызвал next()."); resolve({status:0, body:null, headers:{}, timeout:true}); }
        }, 2000);
        res._done = function(){ clearTimeout(timer); resolve({status:res.statusCode, body:res.body, headers:Object.assign({}, res.headers)}); };
        app.handle(req, res, function(err){
          if(res.finished) return;
          if(err){ console.error("Необработанная ошибка: " + (err && err.message || err)); res.status(err.status || err.statusCode || 500).send("Internal Server Error"); }
          else res.status(404).send("Cannot " + method + " " + req.path);
        });
      });
    };
    return app;
  }
  express.json = function(){ return function jsonParser(req, res, next){ req.body = req.__raw != null ? req.__raw : {}; next(); }; };
  express.urlencoded = function(){ return function(req, res, next){ if(req.body === undefined) req.body = req.__raw != null ? req.__raw : {}; next(); }; };
  express.Router = function(){ return express(); };
  express.static = function(){ return function(req, res, next){ next(); }; };
  window.express = express;
}
const TEST_HELPERS = `
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
const css = (el, p) => el ? getComputedStyle(el)[p] : "";
const ok = (c, m) => { if(!c) throw new Error(m || "Условие не выполнено"); return true; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const call = (method, url, body, headers) => { if (typeof app === "undefined" || !app.inject) throw new Error("Не найдено приложение: объяви const app = express()"); return app.inject({method, url, body: body == null ? undefined : body, headers: headers || {}}); };
const typeInto = (el, v) => { if(typeof el === "string") el = document.querySelector(el); if(!el) throw new Error("Поле не найдено"); const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value"); d.set.call(el, v); el.dispatchEvent(new Event("input", {bubbles:true})); el.dispatchEvent(new Event("change", {bubbles:true})); };
const __ru = m => String(m)
  .replace(/^(\\w+) is not defined$/, "«$1» не объявлена: проверь имя или ошибку выше в коде")
  .replace(/Cannot read properties of (null|undefined) \\(reading '([^']+)'\\)/, "Обращение к «$2» у $1: элемент или значение не найдено")
  .replace(/^(.+) is not a function$/, "«$1» не функция или не объявлена")
  .replace(/Cannot access '(\\w+)' before initialization/, "«$1» используется до объявления");
`;
function testScript(tests, delay, srcObj){
  const T = tests.map(([n, body]) => `[${JSON.stringify(n)}, async () => {\n${body}\n}]`).join(",\n");
  return `(async () => {
${TEST_HELPERS}
const src = ${JSON.stringify(srcObj)};
let T;
try { T = [${T}]; } catch(e) { __send("tests", [{n:"Тесты", ok:false, m:"Ошибка в самих тестах: " + e.message}]); return; }
await new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r));
await sleep(${delay});
const res = [];
for (const [n, f] of T) {
  try {
    const r = await Promise.race([f(), sleep(3000).then(() => { throw new Error("Тест не дождался ответа за 3 секунды"); })]);
    res.push({n, ok: r !== false});
  } catch (e) { res.push({n, ok:false, m: __ru(e && e.message || e)}); }
}
__send("tests", res);
})();`;
}
const scr = s => "<script>" + String(s).replace(/<\/script/gi, "<\\/script") + "<\/script>";

function buildDoc({mode, files, prelude, tests, delay, js, tok}){
  const PRE = scr(`window.__UL=__UL__;(${__labPre.toString()})(${JSON.stringify(tok)});`);
  const baseCss = "<style>html{color-scheme:light}body{font:16px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;margin:16px;color:#16202a;background:#fff}</style>";
  const userCss = `<style id="user-css">${(files.css || "").replace(/<\/style/gi, "<\\/style")}</style>`;
  let head = PRE + baseCss + userCss, bodyStart = "", bodyEnd = "";
  if(mode === "react"){
    bodyStart = '<div id="root"></div>';
    bodyEnd += `<script src="${CDN.react}"><\/script><script src="${CDN.reactDom}"><\/script>`;
    bodyEnd += scr("Object.assign(window,{useState:React.useState,useEffect:React.useEffect,useContext:React.useContext,createContext:React.createContext,useReducer:React.useReducer,useRef:React.useRef,useMemo:React.useMemo,useCallback:React.useCallback,useId:React.useId,useLayoutEffect:React.useLayoutEffect,Fragment:React.Fragment});");
  }
  if(mode === "api") bodyEnd += scr(`(${__miniExpress.toString()})();`);
  if(prelude) bodyEnd += scr(prelude);
  bodyEnd += "<script>\n__USERCODE__\n<\/script>";
  const srcObj = {html: files.html || "", css: files.css || "", js: files.js || "", ts: files.ts || "", jsx: files.jsx || ""};
  if(tests && tests.length) bodyEnd += scr(testScript(tests, delay, srcObj));
  let doc;
  const html = mode === "web" ? (files.html || "") : "";
  if(/<html[\s>]/i.test(html)){
    doc = html;
    if(/<head[^>]*>/i.test(doc)) doc = doc.replace(/<head[^>]*>/i, m => m + head);
    else doc = doc.replace(/<html[^>]*>/i, m => m + "<head>" + head + "</head>");
    if(/<\/body>/i.test(doc)) doc = doc.replace(/<\/body>/i, () => bodyEnd + "</body>"); else doc += bodyEnd;
  } else {
    doc = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}</head><body>${bodyStart}${html}${bodyEnd}</body></html>`;
  }
  const safe = String(js || "").replace(/<\/script/gi, "<\\/script");
  const i = doc.indexOf("__USERCODE__");
  const ul = doc.slice(0, i).split("\n").length;
  doc = doc.slice(0, i) + safe + doc.slice(i + "__USERCODE__".length);
  return doc.replace("__UL__", String(ul));
}

const RUNS = new Map();
window.addEventListener("message", e => {
  const d = e.data; if(!d || !d.__lab) return;
  const r = RUNS.get(d.__lab); if(!r || e.source !== r.frame.contentWindow) return;
  if(d.t === "log") r.onLog && r.onLog(d.d);
  else if(d.t === "ready"){ r.ready = true; r.onReady && r.onReady(); }
  else if(d.t === "tests"){ r.gotTests = true; clearTimeout(r.timer); r.onTests && r.onTests(d.d); }
  else if(d.t === "resp"){ r.onResp && r.onResp(d.d); }
});
function makeFrame(host){
  const f = document.createElement("iframe");
  f.setAttribute("sandbox", "allow-scripts allow-forms");
  f.setAttribute("title", "Результат кода");
  host.appendChild(f);
  return f;
}
async function runCode(opts){
  const {frame, mode, files, prelude, tests, onLog, onTests, onReady, onCompileError} = opts;
  const delay = opts.delay != null ? opts.delay : (mode === "react" ? 150 : 40);
  if(frame.__tok) RUNS.delete(frame.__tok);
  const tok = "t" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  frame.__tok = tok;
  const c = await compile(mode, files);
  if(frame.__tok !== tok) return;
  if(c.error){
    onCompileError && onCompileError(c.error);
    if(tests && tests.length && onTests) onTests(tests.map(t => ({n:t[0], ok:false, m:"Код не скомпилировался"})));
    frame.srcdoc = "<!doctype html><body></body>";
    return;
  }
  const r = {frame, onLog, onTests, onReady, onResp:opts.onResp, ready:false, gotTests:false};
  RUNS.set(tok, r);
  frame.srcdoc = buildDoc({mode, files, prelude, tests, delay, js:c.js, tok});
  if(tests && tests.length) r.timer = setTimeout(() => {
    if(RUNS.get(tok) === r && !r.gotTests && onTests)
      onTests(tests.map(t => ({n:t[0], ok:false, m: r.ready ? "Тесты не завершились. Возможно, страница перезагрузилась: проверь preventDefault в обработчике формы." : "Песочница не запустилась. Проверь бесконечные циклы или перезапусти."})));
  }, 12000);
  return tok;
}
/* ---------- SQL: SQLite в браузере (sql.js) ---------- */
let sqlReady = null;
function ensureSql(){
  if(!sqlReady) sqlReady = loadScript("/vendor/sqljs/sql-wasm.js").then(() => initSqlJs({locateFile: f => "/vendor/sqljs/" + f})).catch(e => { sqlReady = null; throw e; });
  return sqlReady;
}
async function execSql(schema, code){
  let SQL;
  try{ SQL = await ensureSql(); }catch(e){ return {error:"Не загрузился движок SQL. Обнови страницу.", results:[]}; }
  const db = new SQL.Database();
  try{ db.run("PRAGMA foreign_keys = ON;"); if(schema) db.exec(schema); }catch(e){ db.close(); return {error:"Ошибка в схеме: " + e.message, results:[]}; }
  const results = []; let error = null, changes = 0, count = 0;
  try{
    for(const st of db.iterateStatements(code || "")){
      count++;
      const cols = st.getColumnNames(), rows = [];
      while(st.step()) rows.push(st.get());
      if(cols.length) results.push({columns:cols, values:rows});
      else changes += db.getRowsModified();
      st.free();
    }
  }catch(e){ error = e.message; }
  return {db, results, error, changes, count};
}
function normRes(r, ordered){
  if(!r) return null;
  const cols = r.columns.map(c => c.toLowerCase());
  let rows = r.values.map(row => row.map(v => v === null ? null : typeof v === "number" ? String(Number.isInteger(v) ? v : +v.toFixed(6)) : String(v).trim().toLowerCase()));
  if(!ordered) rows = rows.map(x => JSON.stringify(x)).sort().map(x => JSON.parse(x));
  return {cols, rows};
}
function cmpRes(u, s, ordered){
  const a = normRes(u, ordered), b = normRes(s, ordered);
  if(!b) return a ? {ok:false, m:"Запрос не должен возвращать строки"} : {ok:true};
  if(!a) return {ok:false, m:"Запрос ничего не вернул. Последней командой должен быть SELECT."};
  if(a.cols.join() !== b.cols.join()) return {ok:false, m:`Колонки: ${a.cols.join(", ") || "—"}. Ожидались: ${b.cols.join(", ")}.`};
  if(a.rows.length !== b.rows.length) return {ok:false, m:`Строк: ${a.rows.length}, ожидалось ${b.rows.length}.`};
  for(let i = 0; i < a.rows.length; i++) if(JSON.stringify(a.rows[i]) !== JSON.stringify(b.rows[i]))
    return {ok:false, m: ordered && JSON.stringify([...a.rows].map(x => JSON.stringify(x)).sort()) === JSON.stringify([...b.rows].map(x => JSON.stringify(x)).sort()) ? "Строки верные, но порядок другой. Проверь ORDER BY." : `Строка ${i + 1} отличается от ожидаемой.`};
  return {ok:true};
}
async function checkSql(ex, files){
  const u = await execSql(ex.schema, files.sql || ""), s = await execSql(ex.schema, ex.sol.sql);
  const res = ex.checks.map(c => {
    if(c.re) return {n:c.n, ok:new RegExp(c.re, c.flags || "").test(files.sql || ""), m:"Не найдено в коде"};
    if(u.error) return {n:c.n, ok:false, m:"Ошибка SQL: " + u.error};
    if(c.last) return {n:c.n, ...cmpRes(u.results[u.results.length - 1], s.results[s.results.length - 1], c.ordered)};
    let a, b;
    try{ a = u.db.exec(c.q)[0] || {columns:[], values:[]}; }catch(e){ return {n:c.n, ok:false, m:"Не получилось проверить: " + e.message}; }
    try{ b = s.db.exec(c.q)[0] || {columns:[], values:[]}; }catch(e){ return {n:c.n, ok:false, m:"Ошибка проверки"}; }
    return {n:c.n, ...cmpRes(a, b, c.ordered)};
  });
  u.db && u.db.close(); s.db && s.db.close();
  return {res, run:u};
}

/* run tests in a hidden frame — used to validate generated exercises */
function runHidden(ex, files){
  if(ex.mode === "sql") return checkSql(ex, files).then(({res}) => ({res, logs:[]}));
  return new Promise(resolve => {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-10000px;top:0;width:900px;height:700px;overflow:hidden";
    document.body.appendChild(host);
    const f = makeFrame(host);
    f.style.cssText = "width:100%;height:100%;border:0";
    const logs = [];
    const done = res => { host.remove(); resolve({res, logs}); };
    runCode({frame:f, mode:ex.mode, files, prelude:ex.prelude, tests:ex.tests, delay:ex.delay, onLog:l => logs.push(l), onTests:done, onCompileError:e => logs.push({k:"error", a:[e]})});
  });
}
window.__verify = async id => { const ex = findEx(id); const {res, logs} = await runHidden(ex, ex.sol); return {id, pass: res.every(r => r.ok), res, logs}; };

/* ================= code editor ================= */
const CM_MODE = {html:"htmlmixed", css:"css", js:"javascript", ts:"text/typescript", jsx:{name:"jsx", base:{name:"javascript", typescript:true}}, sql:"text/x-sqlite"};
class CodeEditor{
  constructor(host, files, order, handlers){
    this.host = host; this.order = order; this.h = handlers; this.cur = order[0]; this.docs = {}; this.vals = {...files};
    host.innerHTML = "";
    if(window.CodeMirror){
      const run = () => this.h.run(), check = () => this.h.check();
      this.cm = CodeMirror(host, {
        theme:"lab", lineNumbers:true, tabSize:2, indentUnit:2, autoCloseBrackets:true, matchBrackets:true, autoCloseTags:true,
        extraKeys:{
          Tab: cm => cm.somethingSelected() ? cm.indentSelection("add") : cm.replaceSelection("  "),
          "Shift-Tab": cm => cm.indentSelection("subtract"),
          "Ctrl-/":"toggleComment", "Cmd-/":"toggleComment",
          "Ctrl-Enter":run, "Cmd-Enter":run, "Shift-Ctrl-Enter":check, "Shift-Cmd-Enter":check
        }
      });
      order.forEach(n => { this.docs[n] = CodeMirror.Doc(files[n] || "", CM_MODE[n]); });
      this.cm.swapDoc(this.docs[this.cur]);
      this.cm.on("change", () => { this.vals[this.cur] = this.cm.getValue(); this.h.change(); });
      setTimeout(() => this.cm.refresh(), 30);
    } else {
      const ta = document.createElement("textarea"); ta.className = "fallback"; ta.spellcheck = false; ta.setAttribute("aria-label", "Редактор кода");
      ta.value = files[this.cur] || "";
      ta.addEventListener("input", () => { this.vals[this.cur] = ta.value; this.h.change(); });
      ta.addEventListener("keydown", e => {
        if(e.key === "Tab"){ e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("  ", s, ta.selectionEnd, "end"); this.vals[this.cur] = ta.value; this.h.change(); }
        if(e.key === "Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); e.shiftKey ? this.h.check() : this.h.run(); }
      });
      host.appendChild(ta); this.ta = ta;
    }
  }
  show(n){ this.cur = n; if(this.cm){ this.cm.swapDoc(this.docs[n]); this.cm.focus(); } else { this.ta.value = this.vals[n] || ""; this.ta.focus(); } }
  get(){ return {...this.vals}; }
  set(files){ this.vals = {...files}; if(this.cm){ this.order.forEach(n => this.docs[n] = CodeMirror.Doc(files[n] || "", CM_MODE[n])); this.cm.swapDoc(this.docs[this.cur]); } else this.ta.value = files[this.cur] || ""; }
  refresh(){ this.cm && this.cm.refresh(); }
}

/* ================= AI ================= */
let sampleFn = null, aiChecked = false;
function aiOff(){ return aiChecked && !sampleFn; }
const AI_OFF_TEXT = "Наставник пока не подключён: администратору нужно добавить ANTHROPIC_API_KEY в настройках сервера на Render.";
function makeAi(){
  async function call(input, opts = {}, json = false){
    const r = await fetch("/api/ai", {method:"POST", credentials:"same-origin", headers:{"Content-Type":"application/json"}, body:JSON.stringify({input, json}), signal:opts.signal});
    if(!r.ok){
      let m = "Не получилось получить ответ. Попробуй ещё раз."; try{ m = (await r.json()).error || m; }catch(e){}
      const e = new Error(m); e.userMessage = m; e.code = r.status === 429 ? "rate_limited" : r.status === 503 ? "not_configured" : "error"; throw e;
    }
    const reader = r.body.getReader(), dec = new TextDecoder(); let text = "";
    for(;;){ const {done, value} = await reader.read(); if(done) break; text += dec.decode(value, {stream:true}); opts.onText && opts.onText({text}); }
    return {text};
  }
  const f = (input, opts) => call(input, opts, false);
  f.json = async (input, opts) => {
    const {text} = await call(input, opts, true);
    const a = text.indexOf("{"), b = text.lastIndexOf("}");
    try{ return JSON.parse(text.slice(a, b + 1)); }catch(e){ const err = new Error("invalid_json"); err.code = "invalid_json"; throw err; }
  };
  return f;
}
async function aiStream(input, el, opts = {}){
  if(!sampleFn){ el.innerHTML = `<p class="hint">${AI_OFF_TEXT}</p>`; return null; }
  el.innerHTML = '<p class="thinking">Думаю…</p>';
  try{
    const r = await sampleFn(input, {cache:false, onText:({text}) => { el.innerHTML = md(text); }, ...opts});
    el.innerHTML = md(r.text);
    return r.text;
  }catch(e){
    el.innerHTML = `<p class="hint">${aiErr(e)}</p>`;
    if(e && e.code === "not_configured") sampleFn = null;
    return null;
  }
}
function aiErr(e){
  if(e && e.userMessage) return e.userMessage;
  return "Не получилось получить ответ. Попробуй ещё раз.";
}
const mentorRules = () => MENTOR_RULES.replace("«Frontend с нуля»", `«${TRACKS[trackKey()].title}»`);
const MENTOR_RULES = `Ты наставник в курсе «Frontend с нуля». Отвечай по-русски. Объясняй максимально просто, «так, чтобы поняла даже курица»: бытовая аналогия, потом суть, при необходимости короткий пример кода в блоке \`\`\` с указанием языка. Новые термины сразу поясняй. Не решай задачу ученика целиком — подсказывай и задавай наводящие вопросы. Будь кратким и конкретным.`;
const strip = h => String(h).replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/* ================= rendering: header ================= */
let sel = 1, view = "today";
const hist = {};
function renderHero(){
  const t = TRACKS[trackKey()];
  $("#heroEyebrow").textContent = `${t.name} · ${trackLen()} недель · 8–12 часов в неделю · старт 26 октября 2026`;
  $("#heroTitle").textContent = t.title;

}
function renderStats(){ renderHero(); renderHeader(); }
function renderRail(){
  const now = calWeek();
  $("#rail").innerHTML = `<button class="track-chip" data-goview="account">Направление: <b>${TRACKS[trackKey()].name}</b><span>сменить</span></button>` +
    trackRuns().map((r, ri) => { const m = MODULES[r.mod]; return `
    <div class="line" style="--c:var(${m.c})">
      <h3><span class="pill">${glyph(r.mod)}</span>${m.name}</h3>
      <div class="stations">${r.items.map(({id, n}) => {
        const p = wp(id); const cls = [p.d === p.t ? "done" : p.d ? "part" : "", n === now ? "now" : ""].join(" ");
        return `<button class="st ${cls}" data-w="${n}" style="--p:${Math.round(p.d / p.t * 100)}%" ${n === sel ? 'aria-current="true"' : ""} title="Неделя ${n}: ${esc(LES[id].t)}">
          <span class="dot">${n}</span><span class="st-name">${esc(LES[id].t)}<small>${weekDates(n)}${n === now ? " · сейчас" : ""}</small></span></button>`;
      }).join("")}</div>
    </div>`; }).join("");
}
function trackPickerHtml(){
  const cur = S.track;
  return `<div class="tracks">${Object.entries(TRACKS).map(([k, t]) => `
    <button class="trackcard" data-track="${k}" aria-pressed="${cur === k}">
      <span class="eyebrow">${t.ids.length} недель</span><b>${t.name}</b><span>${esc(t.sub)}</span>
      <em>${cur === k ? "Выбрано" : "Выбрать"}</em></button>`).join("")}</div>
    <p class="hint">Общие уроки засчитываются во всех направлениях: при смене направления прогресс не теряется.</p>`;
}
function ckItem(key, html){ return `<label class="ck"><input type="checkbox" id="${key}" data-k="${key}" ${S.c[key] ? "checked" : ""}><span>${html}</span></label>`; }
function exStatus(ex){
  const s = S.ex[ex.id];
  if(s && s.passed) return '<span class="status pass">Зачтено</span>';
  const code = Store.get("code")[ex.id];
  if(code || (s && s.tries)) return '<span class="status wip">В процессе</span>';
  return '<span class="status new">Не начато</span>';
}
function exCard(ex, withWeek){
  const n = posOf(ex.l);
  return `<button class="excard" data-ex="${ex.id}">${withWeek ? `<span class="hint">${n ? "Неделя " + n : esc((LES[ex.l] || {}).t || "")}</span>` : ""}<div class="row"><span class="chipm">${esc(MODE_LABEL[ex.mode])}</span>${ex.ai ? '<span class="ai-badge">AI</span>' : ""}</div><b>${esc(ex.t)}</b><div class="row">${exStatus(ex)}<span class="hint">${ex.tests.length} тестов</span></div></button>`;
}

/* ================= rendering: week ================= */
function renderWeek(){
  const n = sel, w = lessonAt(n), id = w.id, m = MODULES[w.mod], p = wp(id), total = trackLen();
  const jr = S.j[id] || {};
  const deep = Store.get("deep-" + id);
  const modNo = trackRuns().findIndex(r => r.items.some(x => x.id === id)) + 1;
  const qs = w.quiz.map((q, qi) => {
    const k = `${id}_q${qi}`, ans = S.q[k], answered = ans !== undefined;
    return `<div class="q"><p>${esc(q.q)}</p><div class="opts">${q.o.map((o, oi) => {
      let c = ""; if(answered){ if(oi === q.a) c = "right"; else if(oi === ans) c = "wrong"; }
      return `<button class="opt ${c}" data-q="${k}" data-o="${oi}" ${answered ? "disabled" : ""}>${esc(o)}</button>`; }).join("")}</div>
      ${answered ? `<p class="expl"><b>${ans === q.a ? "Верно." : "Не совсем."}</b> ${esc(q.e)} <button class="linkish" data-reset="${k}">Ответить ещё раз</button></p>` : ""}</div>`;
  }).join("");
  const builtIn = exOf(id), gen = genOf(id);
  const h = hist[id] || [];
  $("#week").innerHTML = `
  <div class="week-head" style="--c:var(${m.c})">
    <div class="wh-icon">${glyph(w.mod, "lg")}</div>
    <div class="wh-txt">
      <div class="meta"><span class="mod">Модуль ${modNo} · ${m.name}</span><span>Неделя ${n} из ${total}</span><span>${weekDates(n)}</span></div>
      <h2>${esc(w.t)}</h2>
      <p class="goal">${esc(w.goal)}</p>
    </div>
    <div class="wh-ring" id="whRing">${weekRing(p)}</div>
  </div>
  <div class="sec">
    <div class="chicken">${CHICK}<div><span class="lbl">Объяснение для курицы</span><p>${esc(w.why)}</p></div></div>
  </div>
  ${notesSec(id)}
  ${(VIZ_FOR[id] || []).length ? `<div class="sec" id="sec-viz"><h3><span class="n">00</span>Посмотри, как это работает</h3>${VIZ_FOR[id].map(v => `<div class="viz" data-viz="${v}"></div>`).join("")}</div>` : ""}
  <div class="sec" id="sec-learn"><h3><span class="n">01</span>Что изучить</h3>
    <p class="sec-sub">Отмечай то, что можешь объяснить своими словами. Непонятный пункт — жми «Разобрать»: наставник напишет подробный урок с примером и мини-заданием.</p>
    <ul class="checks">${w.learn.map((l, i) => { const key = `l${i}`; return `<li class="topic" id="topic-${i}">
      <div class="topic-row">${ckItem(`${id}_l${i}`, esc(l))}<button class="deep-btn ${deep[key] ? "has" : ""}" data-deep="${i}" aria-expanded="false">Разобрать</button></div>
      <div class="deep" id="deep-${i}" hidden></div></li>`; }).join("")}</ul>
    ${w.code ? `<div class="codeblk"><pre><code>${esc(w.code)}</code></pre><button class="to-sb" data-wcode="${id}">В песочницу</button></div>` : ""}
  </div>
  <div class="sec" id="sec-practice"><h3><span class="n">02</span>Практика в редакторе</h3>
    <p class="sec-sub">${builtIn.length ? "Пиши код прямо здесь. Тесты проверят решение, подсказки открываются по одной." : "У этой недели нет задач, которые можно проверить в браузере. Сгенерируй тренировочную задачу по теме."}</p>
    ${builtIn.length || gen.length ? `<div class="exlist">${[...builtIn, ...gen].map(exCard).join("")}</div>` : ""}
    <div class="gen">
      <select id="genLevel" aria-label="Сложность"><option value="лёгкая">Лёгкая</option><option value="средняя" selected>Средняя</option><option value="сложная">Сложная</option></select>
      <button class="btn ghost" id="genBtn">Сгенерировать задачу</button>
      <span class="hint" id="genHint">${aiOff() ? AI_OFF_TEXT : "Наставник придумает задачу с тестами и проверит их своим решением."}</span>
    </div>
  </div>
  <div class="sec" id="sec-project"><h3><span class="n">03</span>Проект недели и контрольная точка</h3>
    <ul class="checks task"><li>${ckItem(`${id}_do`, `<b>Сделать</b>${esc(w.do)}`)}</li><li>${ckItem(`${id}_ck`, `<b>Контроль</b>${esc(w.check)}`)}</li></ul>
  </div>
  <div class="sec" id="sec-quiz"><h3><span class="n">04</span>Проверь себя</h3><div class="quiz">${qs}</div></div>
  <div class="sec" id="sec-res"><h3><span class="n">05</span>Ресурсы недели</h3>
    <div class="res">${w.res.map(r => `<a href="${L[r][1]}" target="_blank" rel="noopener">${esc(L[r][0])}</a>`).join("")}</div>
  </div>
  <div class="sec" id="sec-ask"><h3><span class="n">06</span>Спроси наставника</h3>
    <div class="ask">
      <div class="chips">
        <button class="chip" data-chip="Объясни тему этой недели совсем просто, как курице.">Объясни совсем просто</button>
        <button class="chip" data-chip="Нарисуй словами, как это работает внутри, шаг за шагом.">Как это устроено внутри</button>
        <button class="chip" data-chip="Проверь меня: задай 3 вопроса по теме недели по одному и жди моего ответа.">Проверь меня</button>
        <button class="chip" data-chip="Какие самые частые ошибки новичков в этой теме и как их заметить?">Частые ошибки</button>
        <button class="chip" data-chip="Какие вопросы по этой теме задают на собеседовании Junior ${TRACKS[trackKey()].name}? Дай 3 вопроса и короткие ответы.">Вопросы с собеседований</button>
      </div>
      <div class="dialog" id="dialog">${h.map(x => `<div class="msg ${x.role === "user" ? "me" : "ai ai-text"}">${x.role === "user" ? esc(x.content) : md(x.content)}</div>`).join("")}</div>
      <textarea id="askIn" rows="3" placeholder="Что непонятно? Можно вставить код или текст ошибки."></textarea>
      <div class="row"><button class="btn" id="askBtn">Спросить</button>${h.length ? '<button class="btn ghost" id="askClear">Новый разговор</button>' : ""}<p class="hint" id="askHint">${aiOff() ? AI_OFF_TEXT : "Ctrl + Enter — отправить."}</p></div>
    </div>
  </div>
  <div class="sec" id="sec-journal"><h3><span class="n">07</span>Дневник недели</h3>
    <div class="journal">
      ${[["a","Что я создал?"],["b","Что могу объяснить без подсказки?"],["c","Где застрял и что пробовал?"],["d","Какой один результат сделаю на следующей неделе?"]].map(([k, l]) =>
        `<label for="j-${id}-${k}">${l}<textarea id="j-${id}-${k}" data-j="${k}" rows="3">${esc(jr[k] || "")}</textarea></label>`).join("")}
    </div>
  </div>
  <div class="nav">
    <button class="btn ghost" data-go="${n - 1}" ${n === 1 ? "disabled" : ""}>← Неделя ${Math.max(1, n - 1)}</button>
    <button class="btn" data-go="${n + 1}" ${n === total ? "disabled" : ""}>Неделя ${Math.min(total, n + 1)} →</button>
  </div>`;
  mountViz($("#week"));
  renderWeekbar();
}
function weekRing(p){ return `${ring(p.d / p.t, 76, 8)}<div><b>${p.d}/${p.t}</b><span>${p.d === p.t ? "готово" : "пунктов"}</span></div>`; }
function updateWeekProgress(){
  const p = wp(lessonAt(sel).id), el = $("#whRing");
  if(el){ el.innerHTML = weekRing(p); el.classList.toggle("hit", p.d === p.t); }
  renderWeekbar();
}
function secDone(id){
  const w = LES[id], ex = exOf(id);
  return {
    "sec-notes": !!(S.read && S.read[id]),
    "sec-learn": w.learn.every((_, i) => S.c[`${id}_l${i}`]),
    "sec-practice": ex.length ? ex.every(e => S.ex[e.id] && S.ex[e.id].passed) : false,
    "sec-project": !!(S.c[`${id}_do`] && S.c[`${id}_ck`]),
    "sec-quiz": w.quiz.every((q, i) => S.q[`${id}_q${i}`] === q.a),
    "sec-journal": !!(S.j[id] && Object.values(S.j[id]).some(v => v && String(v).trim()))
  };
}
function renderWeekbar(){
  const n = sel, w = lessonAt(n), id = w.id, total = trackLen(), done = secDone(id);
  const secs = [...(NOTES[id] ? [["sec-notes","Конспект"]] : []), ...((VIZ_FOR[id] || []).length ? [["sec-viz","Схема"]] : []), ["sec-learn","Темы"], ["sec-practice","Практика"], ["sec-project","Проект"], ["sec-quiz","Тест"], ["sec-ask","Наставник"], ["sec-journal","Дневник"]];
  const bar = $("#weekbar"); if(!bar) return;
  bar.style.setProperty("--c", `var(${MODULES[w.mod].c})`);
  bar.innerHTML = `<div class="wb-row">
      <button class="iconbtn" data-go="${n - 1}" ${n === 1 ? "disabled" : ""} aria-label="Предыдущая неделя">←</button>
      <button class="wb-title" id="openMap" aria-haspopup="dialog"><span>Неделя ${n} из ${total}</span><b>${esc(w.t)}</b><i aria-hidden="true">▾</i></button>
      <button class="iconbtn" data-go="${n + 1}" ${n === total ? "disabled" : ""} aria-label="Следующая неделя">→</button>
    </div>
    <div class="wb-secs" role="navigation" aria-label="Разделы недели">${secs.map(([k, l]) => `<button class="sc ${done[k] ? "done" : ""}" data-sec="${k}">${done[k] ? "✓ " : ""}${l}</button>`).join("")}</div>`;
  markActiveSec();
}
function markActiveSec(){
  if(view !== "route") return;
  let cur = null;
  $$("#week .sec[id]").forEach(el => { if(el.getBoundingClientRect().top < 190) cur = el.id; });
  $$("#weekbar .sc").forEach(b => b.classList.toggle("cur", b.dataset.sec === cur));
}
addEventListener("scroll", () => { if(view === "route") markActiveSec(); }, {passive:true});

/* ================= deep dive ================= */
async function toggleDeep(i, regen){
  const n = sel, w = lessonAt(n), box = $("#deep-" + i), btn = $(`[data-deep="${i}"]`);
  if(!box) return;
  if(!regen && !box.hidden){ box.hidden = true; btn.setAttribute("aria-expanded", "false"); return; }
  box.hidden = false; btn.setAttribute("aria-expanded", "true");
  const store = Store.get("deep-" + w.id), key = "l" + i;
  const tools = '<div class="row"><button class="btn ghost sm" data-deepregen="' + i + '">Объяснить по-другому</button><button class="btn ghost sm" data-deepclose="' + i + '">Свернуть</button></div>';
  if(store[key] && !regen){ box.innerHTML = `<div class="ai-text">${md(store[key])}</div>${tools}`; return; }
  box.innerHTML = '<div class="ai-text"></div>';
  const topic = w.learn[i];
  const prompt = `${mentorRules()}

Ученик на неделе ${n} из ${trackLen()}, тема недели «${w.t}». Напиши подробный урок по пункту: «${topic}».
Структура (заголовки через ###):
### На пальцах — бытовая аналогия в 2–3 предложениях
### Как это работает — суть по шагам, без воды
### Пример — короткий рабочий код с комментариями на языке темы (HTML/CSS, JavaScript/TypeScript, SQL или Node.js)
### Частые ошибки — 2–3 пункта
### Мини-задание — одно небольшое упражнение на 5–10 минут, без решения
Объём — как одна страница учебника.${regen ? " Объясни иначе, чем обычно: другая аналогия и другой пример." : ""}`;
  const text = await aiStream(prompt, box.firstChild);
  if(text){ store[key] = text; Store.save("deep-" + w.id); btn.classList.add("has"); }
  box.insertAdjacentHTML("beforeend", tools);
}

/* ================= week chat ================= */
let chatBusy = false;
async function ask(text){
  if(!text || !text.trim() || chatBusy) return;
  if(!sampleFn){ $("#askHint").textContent = AI_OFF_TEXT; return; }
  const n = sel, w = lessonAt(n), hk = w.id; chatBusy = true;
  hist[hk] = hist[hk] || [];
  hist[hk].push({role:"user", content:text.trim()});
  renderWeek();
  const box = document.createElement("div"); box.className = "msg ai ai-text"; $("#dialog").appendChild(box);
  $("#askBtn").disabled = true;
  const pre = `${mentorRules()}\nУченик на неделе ${n} из ${trackLen()}: «${w.t}». Цель: ${w.goal} Темы: ${w.learn.join("; ")}. В конце ответа задай один короткий вопрос на проверку понимания.\n\nВопрос ученика:\n`;
  const msgs = hist[hk].map((m, i) => i === 0 ? {role:"user", content:pre + m.content} : m);
  let out = null;
  try{
    const r = await sampleFn(msgs, {cache:false, onText:({text}) => { if(sel === n) box.innerHTML = md(text); }});
    out = r.text;
  }catch(e){ hist[hk].pop(); chatBusy = false; if(sel === n){ renderWeek(); $("#askHint").textContent = aiErr(e); } if(e && e.code === "not_configured") sampleFn = null; return; }
  hist[hk].push({role:"assistant", content:out}); chatBusy = false; if(sel === n) renderWeek();
}

/* ================= exercise generation ================= */
const GEN_SPEC = `Формат задачи — JSON-объект:
{"t": "короткое название", "mode": "web" | "js" | "ts" | "react" | "api" | "sql",
 "task": "условие на русском, 3–8 строк; списки строками с '- ' в начале; код в <code>…</code>",
 "files": {...стартовые файлы...}, "sol": {...эталонное решение, те же ключи...},
 "hints": ["3 подсказки от мягкой к прямой"],
 "tests": [["название теста", "тело async-функции на JS"], ...]}
Ключи файлов: web → html, css, js; js → js; ts → ts; react → jsx, css; api → js; sql → sql.
api — серверный код на Express, который работает в браузере: функция express() уже доступна, express.json() тоже. Код начинается с const app = express(); app.use(express.json()); и заканчивается app.listen(3000);. В тестах запросы отправляет функция call(метод, адрес, тело, заголовки) → {status, body, headers} (заголовки ответа в нижнем регистре). Пример теста: "const r = await call('POST', '/api/tasks', { title: 'Тест' }); ok(r.status === 201, 'Статус ' + r.status); return r.body.title === 'Тест'".
sql — SQLite в браузере. Вместо tests укажи "schema" (CREATE TABLE и INSERT с реалистичными данными на русском) и "checks": [{"n": "название", "last": true, "ordered": true}] — сравнить последний результат ученика с эталоном, или {"n": "…", "q": "SELECT … проверочный запрос", "ordered": true} — для задач на INSERT/UPDATE/CREATE. В условии точно назови колонки результата и их порядок.
Песочница: web — html вставляется в body (или полный документ, если есть <html>), css — в <style id="user-css">, js — обычный скрипт в конце body. js/ts — только консоль. ts компилируется Babel (типы удаляются). react — React 18 UMD, хуки useState, useEffect, useContext, createContext, useReducer, useRef, useMemo, useCallback доступны глобально без import; jsx должен заканчиваться строкой ReactDOM.createRoot(document.getElementById("root")).render(<App />);
Тесты выполняются после загрузки страницы в том же документе. Глобальные функции и переменные решения доступны по имени. В теле теста доступны: $(селектор), $$(селектор) → массив, css(элемент, "свойствоCamelCase") → вычисленный стиль, ok(условие, "сообщение при провале"), await sleep(мс), typeInto(селектор, текст) — ввод в поле с событием input (работает и для React), src.html/src.css/src.js/src.ts/src.jsx — исходный код ученика строкой.
Тест должен вернуть true при успехе (или false / бросить ошибку). Тесты идут по порядку в одном документе, состояние сохраняется между ними. 3–5 тестов. Проверяй поведение и результат, а не точную форму кода. Без сети, без внешних картинок, без alert. В строках JSON экранируй переносы как \\n.`;
async function generateExercise(n, level){
  const w = lessonAt(n);
  const allowed = w.pm;
  const prev = [...exOf(w.id), ...genOf(w.id)].map(e => e.t).join("; ");
  const base = `Придумай одну практическую задачу для ученика курса «${TRACKS[trackKey()].title}». Неделя ${n}: «${w.t}». Темы недели: ${w.learn.join("; ")}. Сложность: ${level}. Режим: ${allowed}. Ученик знает только темы этой и прошлых недель. Не повторяй задачи: ${prev || "нет"}. Задача должна быть жизненной: сайт студии, магазин, кафе, личный кабинет, API сервиса. Если тема недели — инструмент, который нельзя запустить в браузере (Docker, Git, деплой, ORM), придумай задачу на JavaScript, моделирующую идею темы: например, функцию, которая собирает конфиг или проверяет данные.
${GEN_SPEC}
Ответь только JSON.`;
  let input = base, last = null;
  for(let attempt = 0; attempt < 2; attempt++){
    const ex = await sampleFn.json(input, {cache:false});
    const v = validateGen(ex);
    if(!v.ok){ last = v.err; input = base + `\n\nПрошлый вариант был с ошибкой формата: ${v.err}. Исправь.`; continue; }
    ex.id = "g_" + w.id.replace(/-/g, "_") + "_" + Date.now().toString(36); ex.l = w.id; ex.ai = true;
    const {res, logs} = await runHidden(ex, ex.sol);
    if(res.every(r => r.ok)) return ex;
    last = res.filter(r => !r.ok).map(r => r.n + (r.m ? ": " + r.m : "")).join("; ");
    const errs = logs.filter(l => l.k === "error").map(l => l.a.join(" ")).join("; ");
    input = base + `\n\nТвой прошлый вариант:\n${JSON.stringify(ex)}\n\nЭталонное решение не прошло тесты: ${last}${errs ? ". Ошибки консоли: " + errs : ""}. Исправь тесты или решение, чтобы эталон проходил все тесты.`;
  }
  throw new Error(last || "не удалось");
}
function validateGen(ex){
  if(!ex || typeof ex !== "object") return {ok:false, err:"не объект"};
  if(!MODE_FILES[ex.mode]) return {ok:false, err:"mode должен быть web, js, ts, react, api или sql"};
  if(!ex.t || !ex.task) return {ok:false, err:"нет t или task"};
  if(!ex.files || !ex.sol) return {ok:false, err:"нет files или sol"};
  for(const k of MODE_FILES[ex.mode]){ ex.files[k] = String(ex.files[k] || ""); ex.sol[k] = String(ex.sol[k] || ""); }
  if(ex.mode === "sql"){
    if(!Array.isArray(ex.checks) || !ex.checks.length) return {ok:false, err:"для sql нужен массив checks"};
    ex.schema = String(ex.schema || STUDIO_SQL);
    ex.checks = ex.checks.map(c => ({n:String(c.n || c.name || "Проверка"), last:!!c.last, q:c.q ? String(c.q) : undefined, ordered:c.ordered !== false, re:c.re, flags:c.flags}));
    ex.tests = ex.checks.map(c => [c.n, ""]);
  }
  if(!Array.isArray(ex.tests) || !ex.tests.length) return {ok:false, err:"нет tests"};
  ex.tests = ex.tests.map(t => Array.isArray(t) ? [String(t[0]), String(t[1])] : [String(t.name || t.n || "Тест"), String(t.code || t.body || "")]);
  ex.hints = Array.isArray(ex.hints) ? ex.hints.map(String) : [];
  ex.task = esc(ex.task).replace(/&lt;code&gt;/g, "<code>").replace(/&lt;\/code&gt;/g, "</code>");
  ex.t = String(ex.t).slice(0, 80);
  return {ok:true};
}
async function onGenerate(){
  if(!sampleFn){ $("#genHint").textContent = AI_OFF_TEXT; return; }
  const n = sel, level = $("#genLevel").value, btn = $("#genBtn"), hint = $("#genHint");
  btn.disabled = true; hint.textContent = "Придумываю задачу и проверяю тесты эталонным решением… Это займёт до минуты.";
  try{
    const ex = await generateExercise(n, level);
    const g = Store.get("gen"); (g[ex.l] = g[ex.l] || []).push(ex); Store.save("gen");
    if(sel === n){ renderWeek(); } toast("Новая задача готова");
    openExercise(ex.id);
  }catch(e){
    if(sel === n){ btn.disabled = false; hint.textContent = e && e.userMessage ? e.userMessage : "Не получилось собрать задачу с рабочими тестами. Попробуй ещё раз."; }
  }
}

/* ================= LAB ================= */
const Lab = {cfg:null, editor:null, frame:null, logs:0, autoT:null, results:null, hintsShown:0, mentorBusy:false, retFocus:null};
async function openLab(cfg){
  Lab.cfg = cfg; Lab.results = null; Lab.hintsShown = 0; Lab.retFocus = document.activeElement;
  const lab = $("#lab");
  lab.hidden = false; lab.dataset.mode = cfg.mode; document.documentElement.classList.add("lab-open");
  setPane(window.innerWidth <= 1100 && cfg.kind === "ex" ? "task" : "code");
  $("#labTitleBox").innerHTML = cfg.kind === "play"
    ? `<label class="hint" for="labName">Название</label><input type="text" id="labName" value="${esc(cfg.name)}">`
    : `<b id="labTitle">${esc(cfg.title)}</b><small id="labSub">${esc(cfg.sub || "")}</small>`;
  $("#labCheck").hidden = !(cfg.tests && cfg.tests.length);
  $("#labScore").hidden = true;
  $("#labAuto").checked = cfg.mode === "web" || cfg.mode === "react" || cfg.mode === "sql";
  const mu = /(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s<?&]*)/.exec(strip(cfg.task || ""));
  $("#reqMethod").value = mu ? mu[1] : "GET"; $("#reqUrl").value = mu ? mu[2] : "/api/"; $("#reqBody").value = ""; $("#reqHeaders").value = "";
  $("#reqBody").hidden = !["POST","PUT","PATCH"].includes($("#reqMethod").value);
  $("#sqlOut").innerHTML = "";
  $("#labReset").hidden = !cfg.starter;
  $("#outLabel").textContent = cfg.mode === "react" ? "Результат (React)" : "Результат";
  const order = MODE_FILES[cfg.mode];
  $("#labFiles").innerHTML = order.map((f, i) => `<button role="tab" data-file="${f}" aria-selected="${i === 0}">${fileLabel(cfg.mode, f)}</button>`).join("");
  renderTaskPane();
  clearConsole();
  $("#frameWrap").innerHTML = ""; Lab.frame = makeFrame($("#frameWrap"));
  $("#labEditor").innerHTML = '<p class="hint" style="padding:12px">Загружаю редактор…</p>';
  await ensureCM();
  if(Lab.cfg !== cfg) return;
  Lab.editor = new CodeEditor($("#labEditor"), cfg.files, order, {change:onCodeChange, run:labRun, check:labCheck});
  $("#labSaved").textContent = "";
  labRun();
  if(cfg.mode === "react" || cfg.mode === "ts") ensureBabel().catch(() => {});
  setTimeout(() => { const b = $("#labClose"); if(window.innerWidth <= 1100) b.focus(); else if(Lab.editor) Lab.editor.show(Lab.editor.cur); }, 60);
}
function closeLab(){
  const lab = $("#lab"); if(lab.hidden) return;
  if(Lab.frame && Lab.frame.__tok) RUNS.delete(Lab.frame.__tok);
  lab.hidden = true; document.documentElement.classList.remove("lab-open");
  Lab.cfg = null; Lab.editor = null;
  rerender();
  if(Lab.retFocus && document.contains(Lab.retFocus)) Lab.retFocus.focus();
}
function setPane(p){ $("#lab").dataset.pane = p; $$(".lab-switch button").forEach(b => b.setAttribute("aria-pressed", b.dataset.pane === p)); if(p === "code" && Lab.editor) setTimeout(() => Lab.editor.refresh(), 20); }
function onCodeChange(){
  const cfg = Lab.cfg; if(!cfg) return;
  const files = Lab.editor.get();
  cfg.onSave && cfg.onSave(files);
  $("#labSaved").textContent = "Сохранено";
  clearTimeout(Lab.autoT);
  if($("#labAuto").checked) Lab.autoT = setTimeout(labRun, 800);
}
function clearConsole(){ Lab.logs = 0; $("#conList").innerHTML = ""; $("#conCount").textContent = ""; }
function addLog(k, text){
  Lab.logs++;
  const li = document.createElement("li"); li.className = k; li.textContent = text;
  const list = $("#conList"); list.appendChild(li); list.scrollTop = list.scrollHeight;
  $("#conCount").textContent = "(" + Lab.logs + ")";
  if(Lab.logs > 500) list.firstChild.remove();
}
function labRun(withTests){
  const cfg = Lab.cfg; if(!cfg || !Lab.editor) return;
  clearConsole();
  const files = Lab.editor.get();
  Lab.lastErrors = [];
  if(cfg.mode === "sql"){ runSqlLab(files, withTests); return; }
  $("#frameWrap").querySelector(".frame-msg")?.remove();
  runCode({
    frame: Lab.frame, mode: cfg.mode, files, prelude: cfg.prelude, delay: cfg.delay,
    tests: withTests ? cfg.tests : null,
    onLog: d => { const t = d.a.join(" "); addLog(d.k, t); if(d.k === "error") Lab.lastErrors.push(t); },
    onCompileError: e => { addLog("error", e); Lab.lastErrors.push(e); },
    onTests: res => onResults(res),
    onResp: d => {
      if(d.error){ addLog("error", d.error); return; }
      const r = d.r; if(r.timeout){ addLog("error", "← нет ответа (таймаут 2 с)"); return; }
      const body = r.body === undefined || r.body === "" ? "(пустое тело)" : typeof r.body === "string" ? r.body : JSON.stringify(r.body, null, 2);
      const hdr = Object.entries(r.headers || {}).filter(([k]) => k !== "content-type").map(([k, v]) => `${k}: ${v}`).join("\n");
      addLog(r.status >= 400 ? "warn" : "resp", `← ${r.status}${hdr ? "\n" + hdr : ""}\n${body}`);
    }
  });
  if(cfg.mode === "api" && !withTests) addLog("sys", "Сервер перезапущен. Отправь запрос из панели выше.");
  if(withTests) addLog("sys", "Запускаю тесты…");
  setTimeout(() => {
    if(Lab.cfg !== cfg || !Lab.frame || !Lab.frame.__tok) return;
    const r = RUNS.get(Lab.frame.__tok);
    if(r && !r.ready && !$("#frameWrap .frame-msg")) $("#frameWrap").insertAdjacentHTML("beforeend", '<div class="frame-msg">Результат не загрузился. Если в коде бесконечный цикл — исправь и нажми «Запустить».</div>');
  }, 6000);
}
async function runSqlLab(files, withTests){
  const cfg = Lab.cfg;
  const r = await execSql(cfg.schema || STUDIO_SQL, files.sql || "");
  if(Lab.cfg !== cfg) return;
  renderSqlOut(r);
  if(r.error){ addLog("error", "Ошибка SQL: " + r.error); Lab.lastErrors.push(r.error); }
  else addLog("info", `Выполнено команд: ${r.count}. Таблиц в результате: ${r.results.length}.${r.changes ? " Изменено строк: " + r.changes + "." : ""}`);
  r.db && r.db.close();
  if(withTests && cfg.kind === "ex"){ addLog("sys", "Сравниваю с эталоном…"); const {res} = await checkSql(findEx(cfg.id), files); if(Lab.cfg === cfg) onResults(res); }
}
function renderSqlOut(r){
  const box = $("#sqlOut");
  if(!r.results.length){ box.innerHTML = `<p class="hint">${r.error ? "Запрос не выполнился, ошибка в консоли." : "Команды выполнены, строк для показа нет. Добавь SELECT, чтобы увидеть данные."}</p>`; return; }
  box.innerHTML = r.results.map((t, i) => `<div class="sqlres"><p class="hint">Результат${r.results.length > 1 ? " " + (i + 1) : ""} · строк: ${t.values.length}</p><div class="tbl"><table><thead><tr>${t.columns.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${t.values.slice(0, 200).map(row => `<tr>${row.map(v => `<td>${v === null ? '<span class="null">NULL</span>' : esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`).join("");
}
function sendRequest(){
  const cfg = Lab.cfg; if(!cfg || !Lab.frame || !Lab.frame.__tok) return;
  const method = $("#reqMethod").value, url = $("#reqUrl").value.trim() || "/";
  const headers = {};
  $("#reqHeaders").value.split(/;|\n/).forEach(p => { const i = p.indexOf(":"); if(i > 0) headers[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
  let body = $("#reqBody").hidden ? undefined : $("#reqBody").value.trim();
  if(body){ try{ body = JSON.parse(body); }catch(e){ addLog("error", "Тело запроса — не JSON: " + e.message); return; } } else body = undefined;
  addLog("sys", `→ ${method} ${url}${body !== undefined ? " " + JSON.stringify(body) : ""}`);
  Lab.frame.contentWindow.postMessage({__labReq:Lab.frame.__tok, id:Date.now(), method, url, body, headers}, "*");
  if(window.innerWidth <= 1100) setPane("out");
}
function labCheck(){ if(!Lab.cfg || !Lab.cfg.tests) return; labRun(true); if(window.innerWidth <= 1100) setPane("task"); }
function onResults(res){
  const cfg = Lab.cfg; if(!cfg) return;
  Lab.results = res;
  const passed = res.filter(r => r.ok).length, all = res.length && passed === res.length;
  const sc = $("#labScore"); sc.hidden = false; sc.textContent = `${passed}/${res.length}`; sc.classList.toggle("pass", all);
  addLog(all ? "info" : "warn", all ? `Все тесты пройдены: ${passed} из ${res.length}.` : `Пройдено ${passed} из ${res.length}. Подробности — во вкладке «Задание».`);
  if(cfg.kind === "ex"){
    const st = S.ex[cfg.id] = S.ex[cfg.id] || {tries:0};
    if(all){ const first = !st.passed; st.passed = true; st.at = st.at || Date.now(); if(first){ award("x:" + cfg.id, 40); toast("Зачтено! +40 XP"); confetti(); } }
    else st.tries = (st.tries || 0) + 1;
    saveCourse();
  }
  renderTaskPane();
}
function renderTaskPane(){
  const cfg = Lab.cfg; if(!cfg) return;
  const box = $("#labTask");
  if(cfg.kind === "play"){
    const note = {react:"Хуки React доступны без import.", ts:"Типы удаляются при запуске, но не проверяются.", api:"Симуляция Express: express() доступен сразу. Запросы — из панели «Запрос» справа.", sql:"SQLite в браузере с базой студии: клиенты, проекты, платежи. База пересоздаётся при каждом запуске."}[cfg.mode] || "";
    box.innerHTML = `<div class="blk"><h4>Песочница · ${esc(MODE_LABEL[cfg.mode])}</h4><p class="hint">Пиши что угодно. Код сохраняется автоматически. ${note}</p>${cfg.mode === "sql" ? `<details class="prelude"><summary>Схема базы</summary><pre><code>${esc(STUDIO_SQL)}</code></pre></details>` : ""}</div>${mentorBlock()}`;
    return;
  }
  const ex = findEx(cfg.id), st = S.ex[cfg.id] || {};
  const res = Lab.results;
  const tests = cfg.tests.map((t, i) => {
    const r = res && res[i]; const cls = r ? (r.ok ? "ok" : "bad") : "";
    return `<li class="${cls}"><i>${r ? (r.ok ? "✓" : "✕") : i + 1}</i><span>${esc(t[0])}${r && !r.ok && r.m ? `<small>${esc(r.m)}</small>` : ""}</span></li>`;
  }).join("");
  const hints = (ex.hints || []).slice(0, Lab.hintsShown).map(h => `<li>${esc(h)}</li>`).join("");
  const canSol = st.passed || (st.tries || 0) >= 3;
  box.innerHTML = `
    <div class="blk"><h4>Задание</h4><div class="task-text">${taskHtml(ex.task)}</div>
      ${ex.prelude ? `<details class="prelude"><summary>Код, который уже есть в песочнице</summary><pre><code>${esc(ex.prelude)}</code></pre></details>` : ""}
      ${ex.mode === "sql" ? `<details class="prelude"><summary>Схема базы</summary><pre><code>${esc(ex.schema || STUDIO_SQL)}</code></pre></details><p class="hint">В песочнице SQLite: синтаксис запросов почти как в PostgreSQL. База создаётся заново при каждом запуске.</p>` : ""}
      ${ex.mode === "api" ? `<p class="hint">Это симуляция Express в браузере: тот же код работает в настоящем Node.js. Запросы отправляй из панели «Запрос» справа.</p>` : ""}</div>
    <div class="blk"><h4>Тесты</h4><ul class="tests">${tests}</ul>
      <div class="row"><button class="btn sm" data-lab="check">Проверить</button>${st.passed ? '<span class="status pass">Зачтено</span>' : ""}</div></div>
    <div class="blk"><h4>Подсказки</h4>${hints ? `<ul class="hints">${hints}</ul>` : ""}
      <div class="row">${Lab.hintsShown < (ex.hints || []).length ? `<button class="btn ghost sm" data-lab="hint">Подсказка ${Lab.hintsShown + 1} из ${ex.hints.length}</button>` : '<span class="hint">Встроенные подсказки закончились. Спроси наставника ниже.</span>'}</div></div>
    ${mentorBlock()}
    <div class="blk"><h4>Эталон</h4>${canSol ? `<button class="btn ghost sm" data-lab="sol" aria-expanded="false">${st.passed ? "Сравнить с эталоном" : "Показать эталон"}</button><div id="solBox" hidden>${MODE_FILES[ex.mode].filter(f => ex.sol[f]).map(f => `<p class="hint">${fileLabel(cfg.mode, f)}</p><pre><code>${esc(ex.sol[f])}</code></pre>`).join("")}</div>` : `<p class="hint">Откроется после решения или трёх попыток. Попыток: ${st.tries || 0}.</p>`}</div>`;
}
function mentorBlock(){
  return `<div class="blk"><h4>Наставник</h4>
    <div class="chips">${Lab.cfg.kind === "ex" ? '<button class="chip" data-lm="hint">Подскажи, куда смотреть</button><button class="chip" data-lm="review">Разбери мой код</button>' : '<button class="chip" data-lm="review">Разбери мой код</button><button class="chip" data-lm="next">Что улучшить?</button>'}<button class="chip" data-lm="error">Объясни ошибку</button></div>
    <textarea id="labQ" rows="2" placeholder="Свой вопрос про этот код"></textarea>
    <div class="row"><button class="btn ghost sm" data-lm="ask">Спросить</button></div>
    <div class="ai-text" id="labAi">${aiOff() ? `<p class="hint">${AI_OFF_TEXT}</p>` : ""}</div></div>`;
}
async function labMentor(kind){
  if(Lab.mentorBusy || !Lab.cfg || !Lab.editor) return;
  const cfg = Lab.cfg, files = Lab.editor.get(), out = $("#labAi");
  const ex = cfg.kind === "ex" ? findEx(cfg.id) : null;
  const q = kind === "ask" ? ($("#labQ").value || "").trim() : "";
  if(kind === "ask" && !q) return;
  const code = MODE_FILES[cfg.mode].map(f => `--- ${fileLabel(cfg.mode, f)} ---\n${files[f] || ""}`).join("\n");
  const tests = Lab.results ? Lab.results.map(r => `${r.ok ? "✓" : "✕"} ${r.n}${r.m ? " — " + r.m : ""}`).join("\n") : "тесты ещё не запускались";
  const errs = (Lab.lastErrors || []).slice(-8).join("\n") || "нет";
  const ask = {
    hint: "Ученик застрял. Дай одну подсказку: куда смотреть и почему. Не пиши готовое решение и не исправляй код целиком.",
    review: "Разбери код ученика: что сделано хорошо, где ошибки или слабые места и почему. Готовое решение не давай, укажи на строки и подскажи направление.",
    next: "Предложи 2–3 улучшения этого кода и объясни зачем каждое.",
    error: "Объясни простыми словами ошибки из консоли: что они значат, на какой строке причина и как такое искать в будущем. Если ошибок нет — скажи, что консоль чистая, и объясни, что проверять дальше.",
    ask: "Вопрос ученика: " + q
  }[kind];
  const prompt = `${mentorRules()}
${ex ? `Задача (тема «${(LES[ex.l] || {}).t || ""}»): «${ex.t}». Условие: ${strip(ex.task)}\nРезультаты тестов:\n${tests}` : `Ученик экспериментирует в песочнице, режим ${MODE_LABEL[cfg.mode]}.`}
Код ученика:
${code}
Ошибки консоли:
${errs}

${ask}`;
  Lab.mentorBusy = true;
  await aiStream(prompt, out);
  Lab.mentorBusy = false;
  if(kind === "ask") $("#labQ").value = "";
}

function openExercise(id){
  const ex = findEx(id); if(!ex) return;
  const drafts = Store.get("code");
  const starter = {...ex.files};
  openLab({
    kind:"ex", id, title:ex.t, sub:`${posOf(ex.l) ? "Неделя " + posOf(ex.l) : (LES[ex.l] || {}).t || ""} · ${MODE_LABEL[ex.mode]}${ex.ai ? " · задача от наставника" : ""}`,
    mode:ex.mode, files:drafts[id] || starter, starter, prelude:ex.prelude, delay:ex.delay, tests:ex.tests, schema:ex.schema, task:ex.task,
    onSave: f => { drafts[id] = f; Store.save("code"); }
  });
}
function snips(){ const s = Store.get("snips"); s.items = s.items || []; return s; }
const TEMPLATES = {
  web:{name:"Страница", files:{html:"<h1>Привет!</h1>\n<button id=\"btn\">Нажми</button>\n", css:"body { font-family: system-ui; }\nh1 { color: #1f4fd8; }\n", js:"document.querySelector(\"#btn\").addEventListener(\"click\", () => {\n  console.log(\"Клик!\");\n});\n"}},
  js:{name:"JavaScript", files:{js:"const items = [3, 1, 2];\nconsole.log(items.sort());\n"}},
  ts:{name:"TypeScript", files:{ts:"type User = { name: string; age: number };\n\nconst user: User = { name: \"Аня\", age: 25 };\nconsole.log(user);\n"}},
  api:{name:"Node API", files:{js:"const app = express();\napp.use(express.json());\n\nconst tasks = [{ id: 1, title: \"Сверстать шапку\", done: false }];\n\napp.get(\"/api/tasks\", (req, res) => {\n  res.json(tasks);\n});\n\napp.post(\"/api/tasks\", (req, res) => {\n  const task = { id: tasks.length + 1, title: req.body.title, done: false };\n  tasks.push(task);\n  res.status(201).json(task);\n});\n\napp.listen(3000);\n"}},
  sql:{name:"SQL", files:{sql:"-- База студии: clients, projects, payments\nSELECT c.name, p.title, p.budget\nFROM projects p\nJOIN clients c ON c.id = p.client_id\nORDER BY p.budget DESC;\n"}},
  react:{name:"React", files:{jsx:"function App() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Нажато {count} раз</button>;\n}\n\nReactDOM.createRoot(document.getElementById(\"root\")).render(<App />);\n", css:"button { font-size: 18px; padding: 8px 14px; }\n"}}
};
function newSnippet(mode, files, name){
  const s = snips();
  const it = {id:"s" + Date.now().toString(36), mode, name: name || TEMPLATES[mode].name + " " + (s.items.length + 1), files: files || {...TEMPLATES[mode].files}, updated: Date.now()};
  s.items.unshift(it); Store.save("snips");
  return it;
}
function openSnippet(id){
  const it = snips().items.find(x => x.id === id); if(!it) return;
  openLab({kind:"play", id, name:it.name, mode:it.mode, files:it.files,
    onSave: f => { it.files = f; it.updated = Date.now(); Store.save("snips"); }});
}
function guessMode(code, lang){
  if(/^(sql|postgresql|pgsql|sqlite)$/.test(lang) || /^\s*(SELECT|CREATE TABLE|INSERT INTO|UPDATE|WITH)\b/i.test(code)) return {mode:"sql", files:{sql:code}};
  if(/express\(\)|app\.(get|post|use)\(/.test(code) && !/require\(['"]pg|from ['"]pg/.test(code)) return {mode:"api", files:{js:code.replace(/^.*require\(['"]express['"]\).*$/m, "").replace(/^import\s+express.*$/m, "")}};
  if(/^(html|xml)$/.test(lang) || /^\s*</.test(code)) return {mode:"web", files:{html:code, css:"", js:""}};
  if(lang === "css") return {mode:"web", files:{html:"<p>Пример</p>", css:code, js:""}};
  if(/^(jsx|tsx)$/.test(lang) || /(useState|useEffect|ReactDOM|<\w+[\s/>])/.test(code) && /return\s*\(?\s*</.test(code)) return {mode:"react", files:{jsx:code, css:""}};
  if(/^(ts|typescript)$/.test(lang)) return {mode:"ts", files:{ts:code}};
  return {mode:"js", files:{js:code}};
}
function codeToSandbox(code, lang){
  const g = guessMode(code, lang);
  const it = newSnippet(g.mode, {...Object.fromEntries(MODE_FILES[g.mode].map(f => [f, ""])), ...g.files}, "Из объяснения · " + new Date().toLocaleDateString("ru-RU"));
  openSnippet(it.id);
}

/* ================= other views ================= */
let pfilter = "all";
function renderPractice(){
  const ids = new Set(trackIds());
  const list = allEx().filter(e => ids.has(e.l) || (e.also || []).some(x => ids.has(x)));
  const passed = list.filter(e => S.ex[e.id] && S.ex[e.id].passed).length;
  const show = e => pfilter === "all" || (pfilter === "todo" ? !(S.ex[e.id] && S.ex[e.id].passed) : (S.ex[e.id] && S.ex[e.id].passed));
  const lessonOfEx = e => ids.has(e.l) ? e.l : (e.also || []).find(x => ids.has(x));
  $("#tab-practice").innerHTML = `
    <div class="panel-head"><div><h2>Практика · ${TRACKS[trackKey()].name}</h2><p class="hint" style="margin-top:6px">Все задачи направления. Решено ${passed} из ${list.length}.</p></div>
      <div class="chips" role="group" aria-label="Фильтр">${[["all","Все"],["todo","Не решены"],["done","Решены"]].map(([k, l]) => `<button class="chip" data-pf="${k}" aria-pressed="${pfilter === k}" style="${pfilter === k ? "border-color:var(--fg);font-weight:600" : ""}">${l}</button>`).join("")}</div></div>
    ${trackRuns().map((r, ri) => { const m = MODULES[r.mod]; const rid = new Set(r.items.map(x => x.id));
      const items = list.filter(e => rid.has(lessonOfEx(e)) && show(e)).sort((a, b) => posOf(lessonOfEx(a)) - posOf(lessonOfEx(b)));
      if(!items.length) return "";
      return `<div class="modgroup" style="--c:var(${m.c})"><h3><span class="pill">${ri + 1}</span>${m.name}</h3><div class="exlist">${items.map(e => exCard({...e, l:lessonOfEx(e)}, true)).join("")}</div></div>`; }).join("") || '<p class="empty">Здесь пока пусто.</p>'}`;
}
let delArm = null;
function renderPlay(){
  const s = snips();
  $("#tab-play").innerHTML = `
    <div><h2>Песочница</h2><p class="hint" style="margin-top:6px">Свободное место для экспериментов. Всё сохраняется само.</p></div>
    <div class="tpl">
      <button data-new="web"><b>HTML · CSS · JS</b><span>Страница с живым превью</span></button>
      <button data-new="js"><b>JavaScript</b><span>Код и консоль</span></button>
      <button data-new="ts"><b>TypeScript</b><span>Типы + консоль</span></button>
      <button data-new="react"><b>React</b><span>Компоненты и хуки</span></button>
      <button data-new="api"><b>Node API</b><span>Express и запросы</span></button>
      <button data-new="sql"><b>SQL</b><span>Запросы к базе студии</span></button>
    </div>
    <div class="blk"><h3 style="font-size:15px">Мои файлы</h3>
    ${s.items.length ? `<ul class="snips">${s.items.map(it => `<li><span class="chipm">${esc(MODE_LABEL[it.mode])}</span><span class="nm">${esc(it.name)}</span><small>${new Date(it.updated).toLocaleString("ru-RU", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}</small><button class="btn ghost sm" data-snip="${it.id}">Открыть</button><button class="btn ghost sm danger" data-del="${it.id}">${delArm === it.id ? "Точно удалить?" : "Удалить"}</button></li>`).join("")}</ul>` : '<p class="empty">Пока ничего. Начни с шаблона выше или нажми «В песочницу» у любого примера кода.</p>'}</div>`;
}
function renderOther(){
  $("#gloss").innerHTML = GLOSS.map(([t, d, a]) => `<div class="term"><b>${esc(t)}</b><span>${esc(d)}</span><em>${esc(a)}</em></div>`).join("");
  renderReady();
}
function renderReady(){
  const k = trackKey(), rt = READY_BY_TRACK[k];
  $("#readyTitle").textContent = `Готов откликаться на Junior ${TRACKS[k].name}?`;
  $("#readyList").innerHTML = rt.items.map((r, i) => `<li>${ckItem(`r_${k}_${i}`, esc(r))}</li>`).join("");
  $("#rolesList").innerHTML = rt.roles.map(r => `<li>${esc(r)}</li>`).join("");
}
function rerender(){
  renderStats();
  if(view === "ready") renderReady();
  if(view === "today") renderToday();
  if(view === "cards") renderCards();
  if(view === "route"){ renderWeek(); if(!$("#mapDrawer").hidden) renderRail(); }
  if(view === "practice") renderPractice();
  if(view === "play") renderPlay();
  if(view === "account") renderAccount();
  if(view === "admin") renderAdmin();
}
const VIEW_TITLES = {today:"Сегодня", route:"Маршрут", practice:"Практика", cards:"Повторение", play:"Песочница", gloss:"Словарь", method:"Как учиться", ready:"Готов к работе?", account:"Аккаунт", admin:"Ученики"};
function setView(v){
  view = v;
  $$("[data-tab]").forEach(x => { const on = x.dataset.tab === v; x.classList.toggle("on", on); if(on) x.setAttribute("aria-current", "page"); else x.removeAttribute("aria-current"); });
  $("#viewTitle").textContent = VIEW_TITLES[v] || "";
  closeSide(); closeMap();
  ["today","route","practice","cards","play","gloss","method","ready","account","admin"].forEach(id => $("#tab-" + id).hidden = id !== v);
  rerender();
}
function openSide(){ document.body.classList.add("side-open"); $("#scrim").hidden = false; $("#menuBtn").setAttribute("aria-expanded", "true"); }
function closeSide(){ document.body.classList.remove("side-open"); if($("#mapDrawer").hidden) $("#scrim").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false"); }
function openMap(){ renderRail(); $("#mapDrawer").hidden = false; $("#scrim").hidden = false; const cur = $('#rail .st[aria-current="true"]'); if(cur){ cur.scrollIntoView({block:"center"}); cur.focus(); } }
function closeMap(){ const m = $("#mapDrawer"); if(!m || m.hidden) return; m.hidden = true; if(!document.body.classList.contains("side-open")) $("#scrim").hidden = true; }
function go(n){ if(n < 1 || n > trackLen()) return; sel = n; closeMap(); try{ history.replaceState(null, "", "#w" + n); }catch(e){} renderRail(); renderWeek(); }

/* ================= events ================= */
document.addEventListener("click", e => {
  const t = e.target;
  const st = t.closest(".st"); if(st){ go(+st.dataset.w); window.scrollTo({top:0}); return; }
  const g = t.closest("[data-go]"); if(g && !g.disabled){ go(+g.dataset.go); window.scrollTo({top:0, behavior:"smooth"}); return; }
  const o = t.closest(".opt"); if(o && !o.disabled){ S.q[o.dataset.q] = +o.dataset.o; const m = /^(.+)_q(\d+)$/.exec(o.dataset.q); if(m && LES[m[1]] && LES[m[1]].quiz[+m[2]].a === +o.dataset.o) award("q:" + o.dataset.q, 10); saveCourse(); renderWeek(); return; }
  const r = t.closest("[data-reset]"); if(r){ delete S.q[r.dataset.reset]; saveCourse(); renderWeek(); return; }
  const c = t.closest("[data-chip]"); if(c){ ask(c.dataset.chip); return; }
  if(t.id === "askBtn"){ ask($("#askIn").value); return; }
  if(t.id === "askClear"){ hist[sel] = []; renderWeek(); return; }
  if(t.id === "genBtn"){ onGenerate(); return; }
  const dp = t.closest("[data-deep]"); if(dp){ toggleDeep(+dp.dataset.deep); return; }
  const dr = t.closest("[data-deepregen]"); if(dr){ toggleDeep(+dr.dataset.deepregen, true); return; }
  const dc = t.closest("[data-deepclose]"); if(dc){ toggleDeep(+dc.dataset.deepclose); return; }
  const exb = t.closest("[data-ex]"); if(exb){ openExercise(exb.dataset.ex); return; }
  const ci = t.closest("[data-ci]"); if(ci){ const x = CODES[+ci.dataset.ci]; if(x) codeToSandbox(x.code, x.lang); return; }
  const wc = t.closest("[data-wcode]"); if(wc){ codeToSandbox(LES[wc.dataset.wcode].code, "html"); return; }
  const tr = t.closest("[data-track]"); if(tr){ S.track = tr.dataset.track; sel = Math.min(sel, trackLen()); if(view === "route") sel = calWeek(); saveCourse(); renderOther(); rerender(); toast("Направление: " + TRACKS[S.track].name); return; }
  const gv = t.closest("[data-goview]"); if(gv){ setView(gv.dataset.goview); window.scrollTo({top:0, behavior:"smooth"}); return; }
  const tab = t.closest("[data-tab]"); if(tab){ setView(tab.dataset.tab); window.scrollTo({top:0}); return; }
  if(t.closest("#menuBtn") || t.closest("#moreBtn")){ openSide(); return; }
  if(t.closest("#scrim") || t.closest("#mapClose")){ closeSide(); closeMap(); return; }
  if(t.closest("#openMap")){ openMap(); return; }
  const sc = t.closest("[data-sec]"); if(sc){ const el = document.getElementById(sc.dataset.sec); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); return; }
  const pf = t.closest("[data-pf]"); if(pf){ pfilter = pf.dataset.pf; renderPractice(); return; }
  const nw = t.closest("[data-new]"); if(nw){ const it = newSnippet(nw.dataset.new); openSnippet(it.id); return; }
  const sn = t.closest("[data-snip]"); if(sn){ openSnippet(sn.dataset.snip); return; }
  const dl = t.closest("[data-del]"); if(dl){ const id = dl.dataset.del; if(delArm === id){ const s = snips(); s.items = s.items.filter(x => x.id !== id); Store.save("snips"); delArm = null; } else { delArm = id; setTimeout(() => { if(delArm === id){ delArm = null; if(view === "play") renderPlay(); } }, 4000); } renderPlay(); return; }
  /* lab */
  if(t.closest("#labClose")){ closeLab(); return; }
  if(t.closest("#labRun")){ labRun(); if(window.innerWidth <= 1100) setPane("out"); return; }
  if(t.closest("#labCheck")){ labCheck(); return; }
  if(t.closest("#conClear")){ clearConsole(); return; }
  const sw = t.closest(".lab-switch button"); if(sw){ setPane(sw.dataset.pane); return; }
  const fb = t.closest("[data-file]"); if(fb && Lab.editor){ $$("#labFiles button").forEach(b => b.setAttribute("aria-selected", b === fb)); Lab.editor.show(fb.dataset.file); return; }
  const la = t.closest("[data-lab]"); if(la){
    const k = la.dataset.lab;
    if(k === "check") labCheck();
    if(k === "hint"){ Lab.hintsShown++; renderTaskPane(); }
    if(k === "sol"){ const b = $("#solBox"); b.hidden = !b.hidden; la.setAttribute("aria-expanded", !b.hidden); }
    return;
  }
  const lm = t.closest("[data-lm]"); if(lm){ labMentor(lm.dataset.lm); return; }
  if(t.closest("#labReset")){
    const b = $("#labReset");
    if(b.dataset.armed){ delete b.dataset.armed; b.textContent = "Сбросить код"; if(Lab.cfg && Lab.editor){ Lab.editor.set(Lab.cfg.starter); onCodeChange(); labRun(); } }
    else { b.dataset.armed = "1"; b.textContent = "Точно сбросить? Нажми ещё раз"; setTimeout(() => { if(b.dataset.armed){ delete b.dataset.armed; b.textContent = "Сбросить код"; } }, 4000); }
    return;
  }
});
document.addEventListener("change", e => {
  const k = e.target.dataset && e.target.dataset.k;
  if(k){ S.c[k] = e.target.checked; if(e.target.checked && !k.startsWith("r_")) award("c:" + k, 5); saveCourse(); if(view === "route"){ renderRail(); updateWeekProgress(); } }
});
document.addEventListener("input", e => {
  if(e.target.dataset && e.target.dataset.j){ const lid = lessonAt(sel).id; (S.j[lid] = S.j[lid] || {})[e.target.dataset.j] = e.target.value; if(e.target.value.trim()) award("j:" + lid, 10); saveCourse(); }
  if(e.target.id === "reqMethod"){ $("#reqBody").hidden = !["POST","PUT","PATCH"].includes(e.target.value); }
  if(e.target.id === "labName" && Lab.cfg){ const it = snips().items.find(x => x.id === Lab.cfg.id); if(it){ it.name = e.target.value || "Без названия"; Store.save("snips"); } }
});
document.addEventListener("submit", e => { if(e.target.id === "reqForm"){ e.preventDefault(); sendRequest(); } });
document.addEventListener("keydown", e => {
  if(e.target.id === "askIn" && e.key === "Enter" && (e.metaKey || e.ctrlKey)){ e.preventDefault(); ask(e.target.value); }
  if(e.target.id === "labQ" && e.key === "Enter" && (e.metaKey || e.ctrlKey)){ e.preventDefault(); labMentor("ask"); }
  if(e.key === "Escape" && !$("#lab").hidden){ closeLab(); }
  else if(e.key === "Escape"){ closeSide(); closeMap(); }
  if(!$("#lab").hidden && e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.target.closest(".editor") && e.target.id !== "labQ"){ e.preventDefault(); e.shiftKey ? labCheck() : labRun(); }
});

/* ================= boot ================= */
async function startApp(me){
  ME = me.user; Store.uid = ME.id; Store.mem = {};
  $("#auth").hidden = true; $("#app").hidden = false;
  $("#adminTab").hidden = ME.role !== "admin";
  $("#accountTab").textContent = ME.displayName || ME.username;
  $("#accAvatar").textContent = (ME.displayName || ME.username).trim().charAt(0).toUpperCase();
  try{ await Store.loadAll(); }catch(e){ setSync("error"); }
  initCourse();
  if(me.ai) sampleFn = makeAi();
  aiChecked = true;
  sel = calWeek();
  const hm = /^#w(\d{1,2})$/.exec(location.hash || ""); if(hm){ const v = +hm[1]; if(v >= 1 && v <= trackLen()) sel = v; }
  loadNotes();
  renderOther(); setView(view);
  maybeOnboard();
  setTimeout(() => ensureCM(), 1500);
}
(async () => {
  try{ const me = await api("GET", "/api/me"); await startApp(me); }
  catch(e){ showAuth(); }
})();
