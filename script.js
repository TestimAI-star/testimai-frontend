const API = "https://testimai-frontend.onrender.com";

let guestId = localStorage.getItem("guest_id");
if (!guestId) {
  guestId = crypto.randomUUID();
  localStorage.setItem("guest_id", guestId);
}

/* -------------------------
   UI HELPERS
-------------------------- */
function addMessage(role, text) {
  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = role;
  div.innerText = text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
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
   SEND MESSAGE
-------------------------- */
async function send() {
  const input = document.getElementById("textInput");
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  addMessage("user", msg);

  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/chat`, {
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

  const data = await res.json();

  if (data.auth_required) {
    showLoginModal();
    return;
  }

  addMessage("assistant", data.reply);
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
   (called from login.html)
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
