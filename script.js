const API = "https://testimai-frontend.onrender.com";

let guestId = localStorage.getItem("guest_id");
if (!guestId) {
  guestId = crypto.randomUUID();
  localStorage.setItem("guest_id", guestId);
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function send() {
  const input = textInput;
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

function showLoginModal() {
  loginModal.classList.remove("hidden");
}

function hideLoginModal() {
  loginModal.classList.add("hidden");
}

