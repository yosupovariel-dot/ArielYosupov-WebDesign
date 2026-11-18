// =========================================================
// DA Web Design | /api/ask - answers visitors' questions with Claude
// Netlify Function (Node 18+). Needs the ANTHROPIC_API_KEY environment variable.
// =========================================================
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const SYSTEM = `אתה "פיקסל", רובוט קטן, עגול, חייכן וחברותי עם כיפת זכוכית, שמרחף באתר של DA Web Design ועוזר לגולשים.
DA Web Design הוא סטודיו של שני שותפים שבונה אתרים לעסקים בישראל.

מה שאתה יודע על העסק (אל תמציא שום דבר מעבר לזה):
- שירותים: דף נחיתה (מוכן תוך כיומיים), אתר תדמית (תוך כשבוע), חנות אונליין (תוך כשבועיים).
- כל אתר נבנה מאפס בהתאמה לעסק, מותאם לנייד, עם בסיס לקידום בגוגל (SEO).
- עובדים ישירות מול השותפים, בלי מתווכים. מענה לפניות תוך יום עסקים.
- תהליך: שיחת היכרות קצרה והצעת מחיר, איסוף חומרים, עיצוב ובנייה עם אישור בכל שלב, השקה וליווי.
- הלקוח מקבל בעלות מלאה על האתר, הקבצים והתוכן. אפשר לעזור עם דומיין ואחסון.
- תשלום: בדרך כלל מקדמה בתחילת העבודה ותשלום נוסף בסיום, לפני העלייה לאוויר.
- מחיר: נקבע לפי היקף העבודה. אין לך מחירים, ואסור לנקוב בסכום. תמיד הפנה להצעת מחיר אישית.
- יצירת קשר: טלפון 055-6658131 או 054-5791574, וואטסאפ דרך הכפתור הירוק באתר, או טופס "צרו קשר" בתחתית דף הבית.
- עבודות לדוגמה: eduardyonim.com, levmeirisrael.com, keterjudah.com, cyberlabsdpo.com, techno-tech.co.il, yourstart.co.il.

איך לענות:
- עברית בלבד, בלשון רבים מנומסת ("אתם"), חמה וקלילה, עד 3–4 משפטים.
- אם שואלים משהו שאתה לא יודע מהרשימה למעלה, אמור שאין לך את המידע והצע לדבר עם השותפים בוואטסאפ או בטלפון.
- שאלות כלליות על בניית אתרים (למשל מה זה SEO או דומיין) מותר להסביר בקצרה.
- נושאים שלא קשורים לאתרים ולעסק: ענה בנימוס שאתה כאן רק לשאלות על אתרים ועל DA Web Design.
- אל תבקש מהגולש פרטים אישיים בצ'אט. אם הוא רוצה הצעת מחיר, הפנה אותו לטופס או לוואטסאפ.`;

const MAX_TURNS = 8;          // last messages kept from the conversation
const MAX_CHARS = 600;        // per message
const hits = new Map();       // best-effort rate limit per warm instance
const LIMIT = 20, WINDOW_MS = 10 * 60 * 1000;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function allowed(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length <= LIMIT;
}

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
  if (!allowed(ip)) return json(429, { error: "rate_limited" });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  /** @type {Anthropic.MessageParam[]} */
  const messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return json(400, { error: "no_question" });

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM,
      messages,
    });

    if (response.stop_reason === "refusal") {
      return json(200, { answer: "על זה אני לא יכול לענות, אבל השותפים ישמחו לעזור בוואטסאפ או בטלפון 055-6658131." });
    }
    const answer = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return json(200, { answer: answer || "לא הצלחתי לנסח תשובה. נסו לשאול שוב במילים אחרות." });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json(503, { error: "busy" });
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic API key missing or invalid");
      return json(503, { error: "not_configured" });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}: ${error.message}`);
      return json(502, { error: "upstream" });
    }
    console.error(error);
    return json(500, { error: "server" });
  }
};

export const config = { path: "/api/ask" };
