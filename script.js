const API = "https://testimai-backend.onrender.com";
let guestId = localStorage.getItem("guest_id") || crypto.randomUUID();
localStorage.setItem("guest_id", guestId);

function addMessage(role, text = "") {
  const container = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = role;
  div.innerText = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

async function send() {
  const input = document.getElementById("textInput");
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  addMessage("user", msg);
  const assistantDiv = addMessage("assistant", "...");
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ message: msg, guest_id: guestId })
    });

    if (res.status === 401) {
      assistantDiv.remove();
      document.getElementById("loginModal").classList.remove("hidden");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    assistantDiv.innerText = ""; // Clear the "..."

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      
      // Check for Security Shield trigger
      if (chunk.includes("[SYSTEM SHIELD]")) {
        assistantDiv.classList.add("security-alert");
      }
      
      assistantDiv.innerText += chunk;
      assistantDiv.scrollIntoView({ behavior: "smooth" });
    }
  } catch (err) {
    assistantDiv.innerText = "Error: Check your connection.";
  }
}

// Enter Key Logic
document.getElementById("textInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
