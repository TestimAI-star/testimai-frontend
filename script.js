/* =========================
   CONFIG
========================= */
const API = "https://testimai-backend.onrender.com";

/* =========================
   GUEST ID
========================= */
let guestId = localStorage.getItem("guest_id");
if (!guestId) {
  guestId = crypto.randomUUID();
  localStorage.setItem("guest_id", guestId);
}

/* =========================
   STATE
========================= */
let pendingMessage = null;

/* =========================
   UI HELPERS
========================= */
function addMessage(role, text = "") {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = role;
  div.innerText = text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return div;
}

function showLoginModal() {
  document.getElementById("loginModal").classList.remove("hidden");
}

function hideLoginModal() {
  document.getElementById("loginModal").classList.add("hidden");
}

function enableUpgradeUI() {
  const btn = document.querySelector(".upgrade-btn");
  if (btn) btn.classList.remove("hidden");

  const badge = document.querySelector(".badge");
  if (badge) badge.innerText = "Free";
}

/* =========================
   SEND MESSAGE (STREAMING)
========================= */
async function send() {
  const input = document.getElementById("textInput");
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  addMessage("user", msg);

  pendingMessage = msg;
  const assistantDiv = addMessage("assistant", "");

  const token = localStorage.getItem("token");

  let res;
  try {
    res = await fetch(`${API}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        message: msg,
        guest_id: guestId
      })
    });
  } catch (err) {
    console.error("Network error:", err);
    assistantDiv.innerText = "Connection error. Please try again.";
    return;
  }

  if (res.status === 401 || res.status === 403 || !res.body) {
    assistantDiv.remove();
    showLoginModal();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;

      if (fullText.toLowerCase().includes("sign in")) {
        assistantDiv.remove();
        showLoginModal();
        return;
      }

      assistantDiv.innerText = fullText;
      assistantDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  } catch (err) {
    console.error("Stream error:", err);
    assistantDiv.innerText = "Stream interrupted. Try again.";
  }

  pendingMessage = null;
}

/* =========================
   ENTER KEY SUPPORT
========================= */
const textarea = document.getElementById("textInput");
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

/* =========================
   LOGIN SUCCESS HANDLER
========================= */
window.addEventListener("message", (e) => {
  if (!e.data || !e.data.token) return;

  localStorage.setItem("token", e.data.token);
  hideLoginModal();
  enableUpgradeUI();

  if (pendingMessage) {
    const msg = pendingMessage;
    pendingMessage = null;
    document.getElementById("textInput").value = msg;
    send();
  }
});

/* =========================
   UPGRADE BUTTON
========================= */
function goToUpgrade() {
  alert("Upgrade coming soon (Paystack enabled)");
}

/* =========================
   AUTO-ENABLE UPGRADE UI
========================= */
if (localStorage.getItem("token")) {
  enableUpgradeUI();
}
