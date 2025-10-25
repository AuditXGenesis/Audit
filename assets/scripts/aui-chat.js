/**
 * =====================================================
 *  AUI-Bot for AuditX Genesis
 *  Local + OpenAI-powered chat assistant
 *  Author: Inferaq AI Labs
 * =====================================================
 */

const OPENAI_KEY = "sk-YOUR_OPENAI_KEY_HERE";   // 🔑 paste your key here
const EMBED_MODEL = "text-embedding-3-small";
const CHAT_MODEL  = "gpt-4o-mini";

let embeddings = [];
let chatVisible = false;

/* ---------------------- Utility ---------------------- */
function cosineSim(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const na = Math.sqrt(a.reduce((s, ai) => s + ai * ai, 0));
  const nb = Math.sqrt(b.reduce((s, bi) => s + bi * bi, 0));
  return dot / (na * nb);
}

/* ------------------ Load Embeddings ------------------ */
async function loadEmbeddings() {
  try {
    const res = await fetch("/data/embeddings.json");
    const json = await res.json();
    embeddings = json.chunks;
    console.log(`✅ AUI-Bot loaded ${embeddings.length} knowledge chunks.`);
  } catch (err) {
    console.error("❌ Failed to load embeddings:", err);
  }
}

/* ------------------ Embed Question ------------------- */
async function embedText(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text })
  });
  const data = await res.json();
  return data.data[0].embedding;
}

/* ------------- Find Top Context Snippets ------------- */
async function findContext(question) {
  const qEmb = await embedText(question);
  const scored = embeddings.map(ch => ({
    ...ch,
    score: cosineSim(qEmb, ch.embedding.slice(0, qEmb.length))
  }));
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,3);
}

/* ---------------- Get AI-Powered Reply ---------------- */
async function answerQuestion(question) {
  const ctx = await findContext(question);
  const snippets = ctx.map(c => c.content).join("\n\n");

  const systemPrompt = `
  You are AUI-Bot, the official AuditX Genesis assistant.
  Use only the verified context below to answer clearly, concisely and professionally.
  If unsure, say you don’t have that information.
  -----
  Context:
  ${snippets}
  -----
  `;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.4
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response available.";
}

/* -------------------- Chat UI -------------------- */
function initChatUI() {
  const style = document.createElement("style");
  style.textContent = `
    #aui-btn {
      position: fixed; bottom: 20px; right: 20px;
      background: linear-gradient(90deg,#22d3ee,#10b981);
      border: none; color: #000; font-weight: 700;
      padding: 12px 20px; border-radius: 50px;
      cursor: pointer; box-shadow: 0 0 18px rgba(34,211,238,0.4);
      z-index: 9999;
    }
    #aui-chat {
      position: fixed; bottom: 80px; right: 20px;
      width: 350px; height: 430px;
      background: rgba(10,14,22,0.96); color: #fff;
      border: 1px solid rgba(34,211,238,0.25);
      border-radius: 16px; padding: 12px;
      display: none; flex-direction: column;
      z-index: 9998;
      font-family: system-ui, sans-serif;
    }
    #aui-chat.visi
