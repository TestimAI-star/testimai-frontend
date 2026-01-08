const API_URL = "https://testimai-backend.onrender.com/chat";

let userId = localStorage.getItem("user_id") || Date.now();
localStorage.setItem("user_id", userId);

function addMessage(text, sender) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("message");
  const text = input.value;
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      message: text,
      user_id: userId
    })
  });

  const data = await res.json();
  addMessage(data.reply, "ai");
}

function newChat() {
  document.getElementById("chat").innerHTML = "";
}
