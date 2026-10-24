/* ================= вход и регистрация ================= */
let authMode = "login";
async function showAuth(){
  $("#app").hidden = true; $("#auth").hidden = false; $("#boot").hidden = true;
  let cfg = {registration:true};
  try{ cfg = await api("GET", "/api/config"); }catch(e){}
  $("#authSwitch").hidden = !cfg.registration;
  setAuthMode(cfg.registration && /[?&]mode=register\b/.test(location.search) ? "register" : "login");
  $("#authUser").focus();
}
function setAuthMode(m){
  authMode = m;
  $$("#authSwitch button").forEach(b => b.setAttribute("aria-pressed", b.dataset.auth === m));
  $("#authNameRow").hidden = m !== "register";
  $("#authSubmit").textContent = m === "register" ? "Создать аккаунт" : "Войти";
  $("#authPass").autocomplete = m === "register" ? "new-password" : "current-password";
  $("#authHint").textContent = m === "register" ? "Логин латиницей, 3–32 символа. Пароль от 8 символов." : "";
  $("#authErr").textContent = "";
}
document.addEventListener("submit", async e => {
  if(e.target.id === "authForm"){
    e.preventDefault();
    const btn = $("#authSubmit"), err = $("#authErr");
    btn.disabled = true; err.textContent = "";
    try{
      const body = {username:$("#authUser").value.trim(), password:$("#authPass").value};
      if(authMode === "register") body.displayName = $("#authName").value.trim();
      await api("POST", authMode === "register" ? "/api/auth/register" : "/api/auth/login", body);
      const me = await api("GET", "/api/me");
      $("#authPass").value = "";
      await startApp(me);
    }catch(x){ err.textContent = x.message; }
    btn.disabled = false;
  }
  if(e.target.id === "nameForm"){
    e.preventDefault();
    try{ const r = await api("PATCH", "/api/me", {displayName:$("#accName").value}); ME = r.user; $("#accountTab").textContent = ME.displayName; toast("Имя сохранено"); }
    catch(x){ toast(x.message); }
  }
  if(e.target.id === "passForm"){
    e.preventDefault();
    const msg = $("#passMsg");
    try{ await api("POST", "/api/me/password", {oldPassword:$("#passOld").value, newPassword:$("#passNew").value}); msg.textContent = "Пароль изменён. На других устройствах нужно будет войти заново."; e.target.reset(); }
    catch(x){ msg.textContent = x.message; }
  }
});

/* ================= аккаунт ================= */
function renderAccount(){
  const s = S;
  $("#tab-account").innerHTML = `
    <div class="panel-head"><div><h2>${esc(ME.displayName)}</h2><p class="hint" style="margin-top:6px">@${esc(ME.username)} · ${ME.role === "admin" ? "администратор" : "ученик"} · с ${new Date(ME.createdAt).toLocaleDateString("ru-RU")}</p></div>
      <button class="btn ghost" id="logoutBtn">Выйти</button></div>
    <div class="kpis">
      <div><b>${coursePct(s)}%</b><span>курса</span></div>
      <div><b>${Object.values(s.ex).filter(e => e && e.passed).length}</b><span>задач решено</span></div>
      <div><b>${xp(s)}</b><span>XP</span></div>
      <div><b>${streak(s)}</b><span>дней подряд</span></div>
    </div>
    <div class="blk"><h3>Направление</h3>${trackPickerHtml()}</div>
    <div class="split">
      <form class="blk" id="nameForm"><h3>Имя на платформе</h3>
        <label class="field" for="accName">Как тебя показывать<input type="text" id="accName" value="${esc(ME.displayName)}" maxlength="60" required></label>
        <div class="row"><button class="btn ghost sm">Сохранить имя</button></div></form>
      <form class="blk" id="passForm"><h3>Пароль</h3>
        <label class="field" for="passOld">Текущий пароль<input type="password" id="passOld" autocomplete="current-password" required></label>
        <label class="field" for="passNew">Новый пароль<input type="password" id="passNew" autocomplete="new-password" minlength="8" required></label>
        <div class="row"><button class="btn ghost sm">Сменить пароль</button></div><p class="hint" id="passMsg"></p></form>
    </div>
    <div class="blk"><h3>Резервная копия</h3>
      <p class="hint">Весь прогресс уже хранится в базе. Файл пригодится, чтобы перенести прогресс или сохранить копию у себя.</p>
      <div class="row"><button class="btn ghost sm" id="exportBtn">Скачать копию (.json)</button>
      <label class="btn ghost sm" for="importFile" style="cursor:pointer">Загрузить копию…</label><input type="file" id="importFile" accept="application/json,.json" hidden></div>
      <p class="hint" id="importMsg"></p></div>`;
}
document.addEventListener("click", async e => {
  const t = e.target;
  if(t.closest("#authSwitch button")){ setAuthMode(t.closest("button").dataset.auth); return; }
  if(t.id === "logoutBtn"){ Store.beacon(); await api("POST", "/api/auth/logout", {}).catch(() => {}); location.hash = ""; location.reload(); return; }
  if(t.id === "exportBtn"){
    const all = await api("GET", "/api/docs");
    const blob = new Blob([JSON.stringify({app:"frontend-course", version:1, exportedAt:new Date().toISOString(), docs:all}, null, 2)], {type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `frontend-course-${ME.username}-${today()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return;
  }
  /* админка */
  if(t.id === "admReload"){ adminUsers = null; renderAdmin(); return; }
  const row = t.closest("[data-uid]"); if(row && !t.closest("button")){ adminSel = +row.dataset.uid === adminSel ? null : +row.dataset.uid; renderAdmin(); return; }
  const act = t.closest("[data-adm]"); if(act){ adminAction(act.dataset.adm, +act.dataset.id, act); return; }
});
document.addEventListener("change", async e => {
  if(e.target.id !== "importFile" || !e.target.files[0]) return;
  const msg = $("#importMsg");
  try{
    const data = JSON.parse(await e.target.files[0].text());
    const docs = data && data.docs;
    if(!docs || typeof docs !== "object") throw new Error("Это не файл копии курса.");
    for(const [n, d] of Object.entries(docs)) if(/^[a-z0-9_-]{1,40}$/.test(n) && d && typeof d === "object") await api("PUT", "/api/docs/" + n, d);
    msg.textContent = "Копия загружена. Обновляю страницу…";
    setTimeout(() => location.reload(), 800);
  }catch(x){ msg.textContent = "Не получилось: " + x.message; }
});

/* ================= админка ================= */
let adminUsers = null, adminSel = null;
const ago = d => {
  if(!d) return "никогда";
  const m = Math.round((Date.now() - new Date(d)) / 60000);
  if(m < 2) return "только что"; if(m < 60) return m + " мин назад";
  const h = Math.round(m / 60); if(h < 24) return h + " ч назад";
  const dd = Math.round(h / 24); return dd < 30 ? dd + " дн назад" : new Date(d).toLocaleDateString("ru-RU");
};
const emptyCourse = () => ({c:{}, q:{}, ex:{}, days:{}, j:{}, v:2});
function curWeekOf(s){ let w = 0; trackIds(s).forEach((id, i) => { if(wp(id, s).d) w = i + 1; }); return w; }
async function renderAdmin(){
  const box = $("#tab-admin");
  if(ME.role !== "admin"){ box.innerHTML = "<p>Только для администратора.</p>"; return; }
  if(!adminUsers){
    box.innerHTML = '<p class="hint">Загружаю учеников…</p>';
    try{ adminUsers = await api("GET", "/api/admin/users"); }catch(x){ box.innerHTML = `<p class="hint">${esc(x.message)}</p>`; return; }
  }
  const us = adminUsers.map(u => { const s = u.course ? normCourse(JSON.parse(JSON.stringify(u.course))) : emptyCourse(); migrateCourse(s); gameInit(s); return {...u, s}; });
  const active = us.filter(u => u.lastSeenAt && Date.now() - new Date(u.lastSeenAt) < 7 * 864e5).length;
  const solved = us.reduce((a, u) => a + Object.values(u.s.ex).filter(e => e && e.passed).length, 0);
  box.innerHTML = `
    <div class="panel-head"><div><h2>Ученики</h2><p class="hint" style="margin-top:6px">Прогресс всех аккаунтов. Нажми на строку, чтобы открыть подробности.</p></div><button class="btn ghost sm" id="admReload">Обновить</button></div>
    <div class="kpis"><div><b>${us.length}</b><span>аккаунтов</span></div><div><b>${active}</b><span>активны за 7 дней</span></div><div><b>${solved}</b><span>задач решено всего</span></div></div>
    <div class="tbl"><table class="adm">
      <thead><tr><th>Ученик</th><th>Направление</th><th>Неделя</th><th>Курс</th><th>Задачи</th><th>XP</th><th>Серия</th><th>Был</th><th>AI, 7 дн</th></tr></thead>
      <tbody>${us.map(u => `
        <tr data-uid="${u.id}" class="${adminSel === u.id ? "sel" : ""}" tabindex="0">
          <td><b>${esc(u.displayName)}</b> <span class="hint">@${esc(u.username)}</span>${u.role === "admin" ? ' <span class="tag">админ</span>' : ""}${u.disabled ? ' <span class="tag bad">заблокирован</span>' : ""}</td>
          <td>${u.s.track ? TRACKS[trackKey(u.s)].name : '<span class="hint">не выбрано</span>'}</td>
          <td class="num">${curWeekOf(u.s) || "—"}<span class="hint"> / ${trackLen(u.s)}</span></td>
          <td><div class="mini"><div class="bar"><i style="width:${coursePct(u.s)}%"></i></div><span class="num">${coursePct(u.s)}%</span></div></td>
          <td class="num">${Object.values(u.s.ex).filter(e => e && e.passed).length}</td>
          <td class="num">${xp(u.s)}<span class="hint"> · ур. ${levelOf(xp(u.s))}</span></td>
          <td class="num">${streak(u.s)}</td>
          <td>${ago(u.lastSeenAt)}</td>
          <td class="num">${u.aiWeek}</td>
        </tr>
        ${adminSel === u.id ? `<tr class="detail"><td colspan="9">${adminDetail(u)}</td></tr>` : ""}`).join("")}
      </tbody></table></div>`;
}
function adminDetail(u){
  const s = u.s, me = u.id === ME.id;
  const mods = trackRuns(s).map((r, ri) => { const m = MODULES[r.mod]; let d = 0, t = 0; r.items.forEach(({id}) => { const p = wp(id, s); d += p.d; t += p.t; }); const pct = Math.round(d / t * 100);
    return `<div class="modrow" style="--c:var(${m.c})"><span>${ri + 1}. ${m.name}</span><div class="bar"><i style="width:${pct}%;background:var(${m.c})"></i></div><span class="num">${pct}%</span></div>`; }).join("");
  const ids = trackIds(s), lt = e => esc((LES[e.l] || {}).t || "Задача");
  const solvedList = allEx().filter(e => s.ex[e.id] && s.ex[e.id].passed).map(e => `<li>${lt(e)}: ${esc(e.t)}</li>`).join("");
  const struggling = allEx().filter(e => s.ex[e.id] && !s.ex[e.id].passed && s.ex[e.id].tries >= 3).map(e => `<li>${lt(e)}: ${esc(e.t)} — попыток ${s.ex[e.id].tries}</li>`).join("");
  const jWeeks = Object.keys(s.j).filter(k => s.j[k] && Object.values(s.j[k]).some(v => v && String(v).trim())).sort((a, b) => ids.indexOf(b) - ids.indexOf(a));
  const jn = jWeeks[0];
  const journal = jn ? `<p class="hint">Дневник: ${esc((LES[jn] || {}).t || jn)}</p><ul class="jr">${[["a","Создал"],["b","Могу объяснить"],["c","Застрял"],["d","План"]].filter(([k]) => s.j[jn][k]).map(([k, l]) => `<li><b>${l}:</b> ${esc(s.j[jn][k])}</li>`).join("")}</ul>` : '<p class="hint">Дневник пока пуст.</p>';
  return `<div class="adm-detail">
    <div class="blk"><h4>По модулям</h4>${mods}</div>
    <div class="blk"><h4>Решённые задачи</h4>${solvedList ? `<ul class="jr">${solvedList}</ul>` : '<p class="hint">Пока ни одной.</p>'}
      ${struggling ? `<h4>Застрял (3+ попытки)</h4><ul class="jr">${struggling}</ul>` : ""}</div>
    <div class="blk"><h4>Дневник</h4>${journal}
      <p class="hint">Зарегистрирован ${new Date(u.createdAt).toLocaleDateString("ru-RU")}${u.progressAt ? ", прогресс обновлён " + ago(u.progressAt) : ""}.</p></div>
    <div class="blk"><h4>Действия</h4><div class="row">
      <button class="btn ghost sm" data-adm="reset" data-id="${u.id}">Сбросить пароль</button>
      ${me ? "" : `<button class="btn ghost sm" data-adm="${u.role === "admin" ? "demote" : "promote"}" data-id="${u.id}">${u.role === "admin" ? "Снять права админа" : "Сделать админом"}</button>
      <button class="btn ghost sm" data-adm="${u.disabled ? "unblock" : "block"}" data-id="${u.id}">${u.disabled ? "Разблокировать" : "Заблокировать"}</button>
      <button class="btn ghost sm danger" data-adm="delete" data-id="${u.id}">Удалить аккаунт</button>`}
    </div><p class="hint" id="admMsg-${u.id}"></p></div>
  </div>`;
}
async function adminAction(kind, id, btn){
  const msg = $("#admMsg-" + id);
  if(kind === "delete" && !btn.dataset.armed){
    btn.dataset.armed = "1"; btn.textContent = "Точно удалить? Весь прогресс пропадёт";
    setTimeout(() => { if(btn.isConnected){ delete btn.dataset.armed; btn.textContent = "Удалить аккаунт"; } }, 5000);
    return;
  }
  try{
    if(kind === "delete"){ await api("DELETE", "/api/admin/users/" + id, {}); adminUsers = null; adminSel = null; renderAdmin(); toast("Аккаунт удалён"); return; }
    const body = {reset:{resetPassword:true}, promote:{role:"admin"}, demote:{role:"student"}, block:{disabled:true}, unblock:{disabled:false}}[kind];
    const r = await api("PATCH", "/api/admin/users/" + id, body);
    adminUsers = null; await renderAdmin();
    if(r.tempPassword){
      const m = $("#admMsg-" + id);
      if(m) m.innerHTML = `Временный пароль: <code class="sel-all">${esc(r.tempPassword)}</code>. Передай его ученику — показывается один раз. Ученик сменит его во вкладке «Аккаунт».`;
    } else toast("Готово");
  }catch(x){ if(msg) msg.textContent = x.message; }
}
document.addEventListener("keydown", e => {
  const row = e.target.closest && e.target.closest("tr[data-uid]");
  if(row && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); row.click(); }
});
