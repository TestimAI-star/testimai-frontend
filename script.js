const API = "https://testimai-frontend.onrender.com"; // change this

// ----------------------------
// GUEST ID
// ----------------------------
let guestId = localStorage.getItem("guest_id");
if (!guestId) {
  guestId = crypto.randomUUID();
  localStorage.setItem("guest_id", guestId);
}

// ----------------------------
// AUTH TOKEN
// ----------------------------
let token = localStorage.getItem("token");

// ----------------------------
// CHAT
// ----------------------------
async function send() {
  const input = document.getElementById("textInput");
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  hideWelcome();
  addMessage("user", msg);

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

  // 🔐 Backend says login required
  if (data.auth_required) {
    showLoginModal();
    return;
  }

  addMessage("assistant", data.reply);
}

// ----------------------------
// AUTH
// ----------------------------
async function login() {
  await auth("/auth/login");
}

async function signup() {
  await auth("/auth/signup");
}

async function auth(path) {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.token) {
    alert(data.detail || "Authentication failed");
    return;
  }

  token = data.token;
  localStorage.setItem("token", token);

  hideLoginModal();
  addMessage("assistant", "You're now signed in. Continue chatting 👋");
}

// ----------------------------
// UI HELPERS
// ----------------------------
function addMessage(role, text) {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function hideWelcome() {
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.style.display = "none";
}

function showLoginModal() {
  document.getElementById("loginModal").style.display = "flex";
}

function hideLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}
