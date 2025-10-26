// assets/scripts/aui-chat.js
async function initAUIChat({ welcome, position = "bottom-right", accent = "#10B981" }) {
  // Chat bubble
  const bubble = document.createElement("div");
  bubble.id = "aui-chat-bubble";
  bubble.innerHTML = "💬";
  Object.assign(bubble.style, {
    position: "fixed",
    bottom: position.includes("bottom") ? "20px" : "",
    right: position.includes("right") ? "20px" : "",
    top: position.includes("top") ? "20px" : "",
    left: position.includes("left") ? "20px" : "",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: accent,
    color: "#fff",
    fontSize: "28px",
    textAlign: "center",
    lineHeight: "55px",
    cursor: "pointer",
    boxShadow: "0 0 12px rgba(0,0,0,0.4)",
    zIndex: "9999"
  });

  // Chat window
  const chat = document.createElement("div");
  chat.id = "aui-chat-window";
  chat.style.cssText = `
    position: fixed;
    ${position.includes("bottom") ? "bottom: 90px;" : "top: 90px;"}
    ${position.includes("right") ? "right: 20px;" : "left: 20px;"}
    width: 320px; max-height: 460px;
    background: rgba(17,24,39,0.95);
    color: #e2e8f0;
    border: 1px solid rgba(34,211,238,0.2);
    border-radius: 12px;
    box-shadow: 0 0 16px rgba(34,211,238,0.3);
    display: none;
    flex-direction: column;
    font-family: system-ui, sans-serif;
    overflow: hidden;
    z-index: 9998;
  `;
  chat.innerHTML = `
    <div style="padding:10px; background:${accent}; color:#fff; font-weight:600;">
      AUI-Bot 🤖
    </div>
    <div id="aui-messages" style="flex:1; padding:10px; overflow-y:auto; font-size:0.9rem;"></div>
    <div style="display:flex; border-top:1px solid rgba(34,211,238,0.2);">
      <input id="aui-input" placeholder="Ask about AuditX..." style="flex:1; padding:8px; border:none; background:#0f172a; color:#fff;"/>
      <button id="aui-send" style="padding:8px 12px; background:${accent}; color:#fff; border:none; cursor:pointer;">➤</button>
    </div>
  `;
  document.body.appendChild(chat);
  document.body.appendChild(bubble);

  const messages = chat.querySelector("#aui-messages");
  const input = chat.querySelector("#aui-input");
  const sendBtn = chat.querySelector("#aui-send");

  function appendMessage(text, from) {
    const msg = document.createElement("div");
    msg.style.margin = "6px 0";
    msg.style.textAlign = from === "user" ? "right" : "left";
    msg.innerHTML = from === "user"
      ? `<div style="display:inline-block;background:${accent};padding:6px 10px;border-radius:8px;color:white;">${text}</div>`
      : `<div style="display:inline-block;background:rgba(255,255,255,0.08);padding:6px 10px;border-radius:8px;">${text}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, "user");
    input.value = "";

    appendMessage("⏳ Thinking...", "bot");

    try {
      const context = await fetch("data/embeddings.json").then(r => r.json());
      const reply = await fetch(
        `https://api.openai.com/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are AUI-Bot, the AI auditor for AuditX Genesis. Use context if relevant." },
              { role: "user", content: text },
              { role: "system", content: JSON.stringify(context.slice(0, 3)) }
            ]
          })
        }
      ).then(r => r.json());

      const message = reply.choices?.[0]?.message?.content || "⚠️ No response.";
      messages.lastChild.remove(); // remove "Thinking..."
      appendMessage(message, "bot");
    } catch (e) {
      messages.lastChild.remove();
      appendMessage("⚠️ Error accessing OpenAI. Check your GitHub secret.", "bot");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
  bubble.addEventListener("click", () => {
    chat.style.display = chat.style.display === "none" ? "flex" : "none";
  });

  appendMessage(welcome, "bot");
}
