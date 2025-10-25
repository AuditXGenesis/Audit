/* ============================================================
   AuditX Genesis – main.js
   Handles dashboard counters, audit listings, dynamic updates,
   and smooth UI behaviour across desktop & mobile.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 AuditX Genesis UI loaded");

  // === Utility: animated number counter ===
  const animateValue = (el, start, end, duration = 1200) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      el.textContent = Math.floor(progress * (end - start) + start);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  // === Utility: badge formatter ===
  const formatBadge = (status) => {
    switch (status.toUpperCase()) {
      case "VERIFIED":
        return `<span class="badge badge-green">VERIFIED</span>`;
      case "IN AUDIT":
        return `<span class="badge badge-orange">IN AUDIT</span>`;
      case "IN PROGRESS":
        return `<span class="badge badge-blue">IN PROGRESS</span>`;
      default:
        return `<span class="badge badge-gray">${status}</span>`;
    }
  };

  // === Load audits from local JSON ===
  try {
    const res = await fetch("data/audits.json");
    const audits = await res.json();

    if (!Array.isArray(audits) || audits.length === 0) {
      console.warn("⚠️ No audit data found in data/audits.json");
      return;
    }

    // ---- Counters ----
    const total = audits.length;
    const verified = audits.filter(a => a.status?.toUpperCase() === "VERIFIED").length;
    const inAudit = audits.filter(a => a.status?.toUpperCase().includes("AUDIT")).length;
    const avgConfidence = (() => {
      const confVals = audits.map(a => parseFloat(a.confidence)).filter(Boolean);
      return confVals.length ? (confVals.reduce((a,b) => a + b) / confVals.length).toFixed(2) : 0;
    })();

    animateValue(document.getElementById("total-audits"), 0, total);
    animateValue(document.getElementById("verified-audits"), 0, verified);
    animateValue(document.getElementById("in-audit"), 0, inAudit);
    animateValue(document.getElementById("avg-confidence"), 0, avgConfidence);

    // ---- Populate Audit Table ----
    const tableBody = document.getElementById("audit-table-body");
    if (tableBody) {
      tableBody.innerHTML = "";
      audits.forEach((a) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${a.company || "-"}</td>
          <td>${a.project || "-"}</td>
          <td>${formatBadge(a.status || "PENDING")}</td>
          <td>${a.confidence ? `${a.confidence} / 5` : "—"}</td>
          <td>${a.updated || "—"}</td>
          <td>
            ${
              a.report && a.report.startsWith("http")
                ? `<a href="${a.report}" target="_blank" class="view-link">View Audit →</a>`
                : `<span class="muted">Coming Soon 🚀</span>`
            }
          </td>
        `;
        tableBody.appendChild(row);
      });
    }

    // ---- Recent Audits Ticker ----
    const ticker = document.getElementById("recent-audits");
    if (ticker) {
      const verifiedNames = audits
        .filter(a => a.status?.toUpperCase() === "VERIFIED")
        .map(a => a.project)
        .join(" • ");
      ticker.textContent = verifiedNames || "No verified audits yet.";
    }

  } catch (err) {
    console.error("❌ Error loading audits.json:", err);
  }

  // === Handle Announcements (optional data/announce.json) ===
  try {
    const ann = await fetch("data/announce.json");
    if (ann.ok) {
      const annData = await ann.json();
      const annDiv = document.getElementById("announcement");
      if (annDiv && annData?.text) {
        annDiv.textContent = annData.text;
      }
    }
  } catch (e) {
    console.warn("Announcements file not found – skipping.");
  }

  // === Responsive link wrapping for long URLs ===
  const fixLinks = () => {
    document.querySelectorAll("a, code, .address, .link").forEach(el => {
      el.style.wordWrap = "break-word";
      el.style.overflowWrap = "anywhere";
      el.style.whiteSpace = "normal";
      el.style.maxWidth = "100%";
    });
  };
  fixLinks();

  // === Dark glow hover effect on cards ===
  document.querySelectorAll(".card, .section").forEach((el) => {
    el.addEventListener("mouseenter", () => el.classList.add("glow"));
    el.addEventListener("mouseleave", () => el.classList.remove("glow"));
  });

  // === Footer Year auto-update ===
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // === Lazy-load Chatbot (AUI-Bot) ===
  try {
    const chatLoaded = document.getElementById("aui-bot-loaded");
    if (!chatLoaded) {
      const s = document.createElement("script");
      s.src = "assets/scripts/aui-chat.js";
      s.onload = () => {
        if (typeof initAUIChat === "function") {
          initAUIChat({
            welcome: "👋 Hi, I’m AUI-Bot! Ask me about audits, PoA, or AUI token.",
            position: "bottom-right",
            accent: "#10B981",
            endpoint: "https://auditx-api.onrender.com/api/chat" // change when ready
          });
        } else {
          console.warn("AUI-Bot script loaded but init function missing.");
        }
      };
      s.id = "aui-bot-loaded";
      document.body.appendChild(s);
    }
  } catch (e) {
    console.error("Chatbot load error:", e);
  }
});
