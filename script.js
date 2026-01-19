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
   UI HELPERS
========================= */
function addMessage(role, text = "") {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = role;
  div.innerText = text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return div; // important for streaming
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

  // Create assistant bubble first (ChatGPT behavior)
  const assistantDiv = addMessage("assistant", "");

  const token = localStorage.getItem("token");

  let res;
  try {
    res = await fetch(`${API}/chat/chat-stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        message: msg,
        guest_id: guestId
      })
    });
  } catch (err) {
    assistantDiv.innerText = "Connection error. Please try again.";
    return;
  }

  // HARD AUTH FAIL
  if (res.status === 401 || res.status === 403) {
    assistantDiv.remove();
    showLoginModal();
    return;
  }

  if (!res.body) {
    assistantDiv.remove();
    showLoginModal();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    fullText += chunk;

    // AUTH BLOCK DETECTION FROM STREAM
    if (fullText.toLowerCase().includes("please sign in")) {
      assistantDiv.remove();
      showLoginModal();
      return;
    }

    assistantDiv.innerText = fullText;
    assistantDiv.scrollIntoView({ behavior: "smooth", block: "end" });
  }
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
/*
  Your login page / iframe must do:
  window.postMessage({ token: "JWT_TOKEN_HERE" }, "*")
*/
window.addEventListener("message", (e) => {
  if (e.data && e.data.token) {
    localStorage.setItem("token", e.data.token);
    hideLoginModal();
    enableUpgradeUI();
  }
});

/* =========================
   UPGRADE BUTTON
========================= */
function goToUpgrade() {
  alert("Upgrade coming soon (Paystack enabled)");
}

/* =========================
   AUTO SHOW UPGRADE IF LOGGED IN
========================= */
if (localStorage.getItem("token")) {
  enableUpgradeUI();
}
