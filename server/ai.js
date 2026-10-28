/* Наставник: несколько провайдеров нейросетей за одним маршрутом POST /api/ai.
   Какой провайдер работает — решают переменные окружения на Render:
     GIGACHAT_AUTH_KEY  — GigaChat (Сбер), бесплатный тариф для физлиц  ← основной вариант
     DEEPSEEK_API_KEY   — DeepSeek (платно, но очень дёшево)
     GROQ_API_KEY       — Groq (бесплатный лимит)
     OPENROUTER_API_KEY — OpenRouter (модели :free)
     AI_API_KEY + AI_BASE_URL + AI_MODEL — любой OpenAI-совместимый API
     ANTHROPIC_API_KEY  — Claude
   Если задано несколько ключей, первый — основной, остальные — запасные: при сбое запрос уйдёт к следующему.
   Порядок можно задать явно: AI_PROVIDER=gigachat,deepseek */
import https from "node:https";
import tls from "node:tls";
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { q } from "./db.js";

const env = process.env;
const DAILY = Number(env.AI_DAILY_LIMIT || 30);            // вопросов в день на ученика
const GLOBAL_DAILY = Number(env.AI_GLOBAL_DAILY_LIMIT || 500); // на всю платформу — бережём бесплатную квоту
const TEMP = Number(env.AI_TEMPERATURE || 0.2);            // низкая температура — меньше фантазий

const SYSTEM_CHAT = `Ты — наставник учебной платформы по веб-разработке: HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, Express, SQL, PostgreSQL, Git, Docker. Отвечай по-русски, понятно и по делу.
Правила точности:
- Опирайся на стандарты и официальную документацию (MDN, react.dev, nodejs.org, postgresql.org). Не выдумывай функции, параметры, флаги и библиотеки.
- Если не уверен в факте — прямо скажи «не уверен» и подскажи, как проверить (документация, консоль, DevTools).
- Код в ответе должен быть рабочим и современным (const/let, async/await, ES-модули). Перед ответом мысленно выполни его и проверь результат.
- Если в вопросе ученика ошибка — мягко укажи на неё, а не подстраивайся.
- Не пиши готовое решение учебной задачи, если тебя просят только подсказать.`;
const SYSTEM_JSON = "Ты помогаешь учебной платформе по веб-разработке. Отвечай строго одним JSON-объектом без пояснений и без markdown-обёртки. Код внутри JSON должен быть рабочим.";

/* ---------- общий разбор потока Server-Sent Events в формате OpenAI ---------- */
function sseParser(onText){
  let buf = "";
  return chunk => {
    buf += chunk;
    let i;
    while((i = buf.indexOf("\n")) >= 0){
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if(!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if(!data || data === "[DONE]") continue;
      try{
        const j = JSON.parse(data);
        const t = j.choices?.[0]?.delta?.content;
        if(t) onText(t);
      }catch{}
    }
  };
}
const toMessages = (system, messages) => [{ role: "system", content: system }, ...messages];
class ProviderError extends Error {
  constructor(message, status, retryable = true){ super(message); this.status = status; this.retryable = retryable; }
}

/* ---------- OpenAI-совместимые API: DeepSeek, Groq, OpenRouter и любой другой ---------- */
function openaiCompat({ name, label, base, key, model, headers = {} }){
  return {
    name, label, model,
    async stream({ system, messages, maxTokens, json }, onText, signal){
      const r = await fetch(base.replace(/\/$/, "") + "/chat/completions", {
        method: "POST", signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, ...headers },
        body: JSON.stringify({
          model, stream: true, temperature: TEMP, max_tokens: maxTokens,
          messages: toMessages(system, messages),
          ...(json && name === "deepseek" ? { response_format: { type: "json_object" } } : {})
        })
      });
      if(!r.ok){
        const text = await r.text().catch(() => "");
        throw new ProviderError(`${label}: HTTP ${r.status} ${text.slice(0, 200)}`, r.status, r.status !== 400);
      }
      const feed = sseParser(onText), dec = new TextDecoder();
      for await (const part of r.body) feed(dec.decode(part, { stream: true }));
    }
  };
}

/* ---------- GigaChat (Сбер) ---------- */
/* Сервера Сбера подписаны сертификатом НУЦ Минцифры, которого нет в стандартном наборе Node.js.
   Порядок поиска: файл server/certs/russian_trusted_root_ca.pem → переменная GIGACHAT_CA_PEM →
   скачать с официального адреса из документации Сбера. */
const CA_URL = "https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt";
const CA_FILE = new URL("./certs/russian_trusted_root_ca.pem", import.meta.url);
let gigaAgentP = null;
function fetchText(url){
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10_000 }, res => {
      if(res.statusCode !== 200){ res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      let s = ""; res.setEncoding("utf8"); res.on("data", d => s += d); res.on("end", () => resolve(s));
    }).on("error", reject).on("timeout", function(){ this.destroy(new Error("timeout")); });
  });
}
function gigaAgent(){
  return gigaAgentP ||= (async () => {
    let pem = existsSync(CA_FILE) ? readFileSync(CA_FILE, "utf8") : env.GIGACHAT_CA_PEM || "";
    if(!pem.includes("BEGIN CERTIFICATE")){
      try{ pem = await fetchText(CA_URL); }catch(e){ console.warn("GigaChat: не удалось скачать сертификат НУЦ Минцифры:", e.message); pem = ""; }
    }
    if(pem.includes("BEGIN CERTIFICATE")) return new https.Agent({ keepAlive: true, ca: [...tls.rootCertificates, pem] });
    if(env.GIGACHAT_INSECURE === "1"){
      console.warn("GigaChat: сертификат не найден, проверка TLS отключена (GIGACHAT_INSECURE=1)");
      return new https.Agent({ keepAlive: true, rejectUnauthorized: false });
    }
    gigaAgentP = null; // попробуем снова при следующем запросе
    throw new ProviderError("GigaChat: нет сертификата НУЦ Минцифры. Положи его в server/certs/russian_trusted_root_ca.pem", 500);
  })();
}
function gigaRequest(url, { method = "POST", headers = {}, body, agent, signal }, onChunk){
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers, agent, timeout: 120_000 }, res => {
      res.setEncoding("utf8");
      if(res.statusCode !== 200){
        let s = ""; res.on("data", d => s += d);
        res.on("end", () => reject(new ProviderError(`GigaChat: HTTP ${res.statusCode} ${s.slice(0, 200)}`, res.statusCode, res.statusCode !== 400)));
        return;
      }
      if(onChunk){ res.on("data", onChunk); res.on("end", () => resolve(null)); }
      else { let s = ""; res.on("data", d => s += d); res.on("end", () => { try{ resolve(JSON.parse(s)); }catch(e){ reject(e); } }); }
      res.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("timeout")));
    if(signal) signal.addEventListener("abort", () => req.destroy(new Error("aborted")), { once: true });
    if(body) req.write(body);
    req.end();
  });
}
function gigachat(){
  const key = env.GIGACHAT_AUTH_KEY.trim().replace(/^Basic\s+/i, "");
  const scope = env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS";
  const authUrl = env.GIGACHAT_AUTH_URL || "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
  const base = (env.GIGACHAT_BASE_URL || "https://gigachat.devices.sberbank.ru/api/v1").replace(/\/$/, "");
  /* от самой сильной модели к простой: кончились бесплатные токены или модель недоступна — берём следующую */
  const models = [...new Set([env.GIGACHAT_MODEL || "GigaChat-3-Ultra", "GigaChat-2-Max", "GigaChat-2-Pro", "GigaChat-2"])];
  let token = null, tokenExp = 0, busy = Promise.resolve();
  async function getToken(agent){
    if(token && Date.now() < tokenExp - 60_000) return token;
    const j = await gigaRequest(authUrl, {
      agent, body: "scope=" + encodeURIComponent(scope),
      headers: { Authorization: "Basic " + key, RqUID: randomUUID(), "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }
    });
    token = j.access_token; tokenExp = Number(j.expires_at) || Date.now() + 25 * 60_000;
    return token;
  }
  /* физлицам доступен один поток: запросы выстраиваются в очередь */
  function exclusive(fn){
    const run = busy.then(fn, fn);
    busy = run.catch(() => {});
    return run;
  }
  return {
    name: "gigachat", label: "GigaChat", get model(){ return models[0]; }, models,
    stream({ system, messages, maxTokens }, onText, signal){
      return exclusive(async () => {
        if(signal?.aborted) throw new ProviderError("aborted", 499, false);
        const agent = await gigaAgent();
        let last;
        for(const model of models){
          try{
            const t = await getToken(agent);
            await gigaRequest(base + "/chat/completions", {
              agent, signal,
              headers: { Authorization: "Bearer " + t, "Content-Type": "application/json", Accept: "text/event-stream" },
              body: JSON.stringify({ model, stream: true, temperature: TEMP, max_tokens: maxTokens, repetition_penalty: 1, messages: toMessages(system, messages) })
            }, sseParser(onText));
            return;
          }catch(e){
            last = e;
            if(e.status === 401){ token = null; }                 // токен протух — получим новый
            if(e.status === 402 || e.status === 404 || (e.status === 400 && /model/i.test(e.message))) continue; // нет токенов или модели — пробуем следующую
            throw e;
          }
        }
        throw last;
      });
    }
  };
}

/* ---------- Claude ---------- */
function anthropic(){
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = env.ANTHROPIC_MODEL || (!env.AI_BASE_URL && env.AI_MODEL) || "claude-sonnet-5-5";
  return {
    name: "anthropic", label: "Claude", model,
    async stream({ system, messages, maxTokens }, onText, signal){
      const s = client.messages.stream({ model, max_tokens: maxTokens, system, messages });
      s.on("text", onText);
      signal?.addEventListener("abort", () => { try{ s.abort(); }catch{} }, { once: true });
      await s.finalMessage();
    }
  };
}

/* ---------- сборка списка провайдеров из переменных окружения ---------- */
const FACTORIES = {
  gigachat: () => env.GIGACHAT_AUTH_KEY && gigachat(),
  deepseek: () => env.DEEPSEEK_API_KEY && openaiCompat({ name: "deepseek", label: "DeepSeek", base: env.DEEPSEEK_BASE_URL || "https://api.deepseek.com", key: env.DEEPSEEK_API_KEY, model: env.DEEPSEEK_MODEL || "deepseek-flash" }),
  groq: () => env.GROQ_API_KEY && openaiCompat({ name: "groq", label: "Groq", base: "https://api.groq.com/openai/v1", key: env.GROQ_API_KEY, model: env.GROQ_MODEL || "openai/gpt-oss-120b" }),
  openrouter: () => env.OPENROUTER_API_KEY && openaiCompat({ name: "openrouter", label: "OpenRouter", base: "https://openrouter.ai/api/v1", key: env.OPENROUTER_API_KEY, model: env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free", headers: { "X-Title": "ZERO/STACK" } }),
  custom: () => env.AI_API_KEY && env.AI_BASE_URL && openaiCompat({ name: "custom", label: env.AI_LABEL || "OpenAI-совместимый API", base: env.AI_BASE_URL, key: env.AI_API_KEY, model: env.AI_MODEL || "gpt-4o-mini" }),
  anthropic: () => env.ANTHROPIC_API_KEY && anthropic()
};
const order = (env.AI_PROVIDER || "").split(",").map(s => s.trim().toLowerCase()).filter(s => FACTORIES[s]);
const PROVIDERS = [...new Set([...order, ...Object.keys(FACTORIES)])].map(n => FACTORIES[n]()).filter(Boolean);
if(PROVIDERS.length) console.log("Наставник:", PROVIDERS.map(p => `${p.label} (${p.model})`).join(" → "));

export const aiEnabled = () => PROVIDERS.length > 0;

/* ---------- лимиты ---------- */
async function usage(user){
  const { rows } = await q(
    `SELECT COALESCE(SUM(count),0)::int AS total, COALESCE(SUM(count) FILTER (WHERE user_id = $1),0)::int AS mine
     FROM ai_usage WHERE day = CURRENT_DATE`, [user.id]);
  return rows[0];
}
async function useQuota(user){
  const u = await usage(user);
  if(u.total >= GLOBAL_DAILY) return { ok: false, msg: "Наставник на сегодня устал: общий дневной лимит платформы исчерпан. Завтра снова можно." };
  if(user.role !== "admin" && u.mine >= DAILY) return { ok: false, msg: `Дневной лимит вопросов (${DAILY}) исчерпан. Завтра снова можно.` };
  await q(`INSERT INTO ai_usage (user_id, day, count) VALUES ($1, CURRENT_DATE, 1)
           ON CONFLICT (user_id, day) DO UPDATE SET count = ai_usage.count + 1`, [user.id]);
  return { ok: true, left: user.role === "admin" ? null : DAILY - u.mine - 1 };
}

function normalize(input){
  const msgs = typeof input === "string" ? [{ role: "user", content: input }] : input;
  if(!Array.isArray(msgs) || !msgs.length) return null;
  const out = msgs
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 30_000) }));
  return out.length && out[out.length - 1].role === "user" ? out : null;
}

/* пробуем провайдеров по очереди, пока кто-то не начнёт отвечать */
async function runChain(opts, onText, signal){
  let lastErr;
  for(const p of PROVIDERS){
    let started = false;
    try{
      await p.stream(opts, t => { started = true; onText(t); }, signal);
      return p;
    }catch(e){
      lastErr = e;
      console.error(`AI ${p.label}:`, e.status || "", e.message);
      if(started || signal?.aborted || e.retryable === false) throw e; // половина ответа уже ушла — не начинаем заново
    }
  }
  throw lastErr || new Error("нет провайдеров");
}

/* POST /api/ai  { input, json }  → поток обычного текста. Клиент собирает его по кусочкам. */
export async function aiHandler(req, res){
  if(!PROVIDERS.length) return res.status(503).json({ error: "Наставник не настроен: администратору нужно добавить ключ (например, GIGACHAT_AUTH_KEY) в настройках сервера." });
  const messages = normalize(req.body?.input);
  if(!messages) return res.status(400).json({ error: "Пустой запрос" });
  const quota = await useQuota(req.user);
  if(!quota.ok) return res.status(429).json({ error: quota.msg });

  const json = !!req.body?.json;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");
  if(quota.left != null) res.setHeader("X-AI-Left", String(quota.left));

  const ac = new AbortController();
  res.on("close", () => { if(!res.writableEnded) ac.abort(); });
  try{
    await runChain({ system: json ? SYSTEM_JSON : SYSTEM_CHAT, messages, json, maxTokens: json ? 6000 : 2500 },
      t => { if(!ac.signal.aborted){ if(!res.headersSent) res.flushHeaders(); res.write(t); } }, ac.signal);
    res.end();
  }catch(e){
    if(ac.signal.aborted) return;
    const busy = e.status === 429;
    if(!res.headersSent) res.status(502).json({ error: busy ? "Наставник сейчас перегружен. Попробуй через минуту." : "Наставник не ответил. Попробуй ещё раз." });
    else res.end("\n\n[Ответ прервался. Попробуй ещё раз.]");
  }
}

/* GET /api/ai/status (админ): какие провайдеры подключены, расход за сегодня; ?test=1 — пробный запрос */
export async function aiStatus(req, res){
  const { rows } = await q("SELECT COALESCE(SUM(count),0)::int AS n FROM ai_usage WHERE day = CURRENT_DATE");
  const out = {
    providers: PROVIDERS.map(p => ({ name: p.name, label: p.label, model: p.model })),
    usedToday: rows[0].n, globalLimit: GLOBAL_DAILY, perUser: DAILY, temperature: TEMP
  };
  if(req.query.test && PROVIDERS.length){
    out.test = [];
    for(const p of PROVIDERS){
      const t0 = Date.now(); let text = "";
      try{
        await p.stream({ system: SYSTEM_CHAT, messages: [{ role: "user", content: "Одним предложением: что вернёт [1, 2, 3].map(x => x * 2) в JavaScript?" }], maxTokens: 120 }, t => text += t);
        out.test.push({ label: p.label, ok: true, ms: Date.now() - t0, answer: text.trim().slice(0, 300) });
      }catch(e){
        out.test.push({ label: p.label, ok: false, ms: Date.now() - t0, error: String(e.message).slice(0, 300) });
      }
    }
  }
  res.json(out);
}
