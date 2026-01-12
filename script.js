const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}
const API_URL = "https://testimai-frontend.onrender.com/chat";

let userId = localStorage.getItem("user_id");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("user_id", userId);
}

function addMessage(text, sender) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function startChatUI() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");
  document.getElementById("input-area").classList.remove("hidden");
}

async function sendFirstMessage() {
  const input = document.getElementById("first-message");
  const text = input.value.trim();
  if (!text) return;

  startChatUI();
  addMessage(text, "user");

  await sendToAPI(text);
}

async function sendMessage() {
  const input = document.getElementById("message");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  await sendToAPI(text);
}

async function sendToAPI(text) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        user_id: userId
      })
    });

    const data = await res.json();
    addMessage(data.reply, "ai");
  } catch {
    addMessage("Something went wrong. Try again.", "ai");
  }
}

function newChat() {
  document.getElementById("chat").innerHTML = "";
  document.getElementById("chat").classList.add("hidden");
  document.getElementById("input-area").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");
}

