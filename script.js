const API = "https://testimai-frontend.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");

async function send() {
  const text = textInput.value;
  if (!text) return;

  welcome.style.display = "none";

  messages.innerHTML += `<div class="message user">You: ${text}</div>`;
  textInput.value = "";

  const res = await fetch(API + "/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  messages.innerHTML += `<div class="message ai">TestimAI: ${data.reply}</div>`;
  messages.scrollTop = messages.scrollHeight;
}
