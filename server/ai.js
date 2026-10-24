import Anthropic from "@anthropic-ai/sdk";
import { q } from "./db.js";

const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.AI_MODEL || "claude-sonnet-5-5";
const DAILY = Number(process.env.AI_DAILY_LIMIT || 60);
const client = KEY ? new Anthropic({ apiKey: KEY }) : null;

export const aiEnabled = () => !!client;

async function useQuota(user) {
  if (user.role === "admin") return true;
  const { rows } = await q(
    `INSERT INTO ai_usage (user_id, day, count) VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (user_id, day) DO UPDATE SET count = ai_usage.count + 1
     RETURNING count`, [user.id]);
  return rows[0].count <= DAILY;
}

function normalize(input) {
  const msgs = typeof input === "string" ? [{ role: "user", content: input }] : input;
  if (!Array.isArray(msgs) || !msgs.length) return null;
  const out = msgs
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 30_000) }));
  return out.length && out[out.length - 1].role === "user" ? out : null;
}

/* POST /api/ai  { input, json }  → поток обычного текста. Клиент собирает его по кусочкам. */
export async function aiHandler(req, res) {
  if (!client) return res.status(503).json({ error: "Наставник не настроен: добавь ANTHROPIC_API_KEY на сервере." });
  const messages = normalize(req.body?.input);
  if (!messages) return res.status(400).json({ error: "Пустой запрос" });
  if (!(await useQuota(req.user))) return res.status(429).json({ error: `Дневной лимит вопросов (${DAILY}) исчерпан. Завтра снова можно.` });

  const json = !!req.body?.json;
  const system = json
    ? "Ты помогаешь учебной платформе. Отвечай строго одним JSON-объектом без пояснений и без markdown-обёртки."
    : "Ты наставник учебной платформы «Frontend с нуля». Отвечай по-русски.";

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");

  let closed = false;
  req.on("close", () => { closed = true; });
  try {
    const stream = client.messages.stream({ model: MODEL, max_tokens: json ? 6000 : 2500, system, messages });
    stream.on("text", delta => { if (!closed) res.write(delta); });
    req.on("close", () => { try { stream.abort(); } catch {} });
    await stream.finalMessage();
    res.end();
  } catch (e) {
    console.error("AI error:", e?.status, e?.message);
    if (!res.headersSent) res.status(502).json({ error: "Наставник не ответил. Попробуй ещё раз." });
    else res.end("\n\n[Ответ прервался. Попробуй ещё раз.]");
  }
}
