const API = "https://testimai-frontend.onrender.com";

let guestId = localStorage.getItem("guest_id");
if (!guestId) {
  guestId = crypto.randomUUID();
  localStorage.setItem("guest_id", guestId);
}

/* -------------------------
   UI HELPERS
-------------------------- */
function addMessage(role, text = "") {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = role;
  div.innerText = text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return div; // 🔴 IMPORTANT for streaming
}

function showLoginModal() {
  document.getElementById("loginModal").classList.remove("hidden");
}

function hideLoginModal() {
  document.getElementById("loginModal").classList.add("hidden");
}

function enableUpgradeUI() {
  document.querySelector(".upgrade-btn").classList.remove("hidden");
}

/* -------------------------
   SEND MESSAGE (STREAMING)
-------------------------- */
async function send() {
  const input = document.getElementById("textInput");
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  addMessage("user", msg);

  // Create empty assistant bubble FIRST (ChatGPT behavior)
  const assistantDiv = addMessage("assistant", "");

  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/chat-stream`, {
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

  // 🔴 AUTH CHECK (still works)
  if (!res.body) {
    showLoginModal();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    assistantDiv.innerText += decoder.decode(value);
    assistantDiv.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}

/* -------------------------
   ENTER KEY SUPPORT
-------------------------- */
const textarea = document.getElementById("textInput");

textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

/* -------------------------
   LOGIN SUCCESS HANDLER
-------------------------- */
window.addEventListener("message", (e) => {
  if (e.data?.token) {
    localStorage.setItem("token", e.data.token);
    hideLoginModal();
    enableUpgradeUI();
  }
});

/* -------------------------
   UPGRADE
-------------------------- */
function goToUpgrade() {
  alert("Upgrade coming soon (Paystack / Flutterwave)");
}

