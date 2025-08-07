export default function ({ nextStage, showError }) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Stage 3 – Debate the Gatekeeper</h2>
    <div id="chat" class="chatbox"></div>
    <input id="arg" type="text" placeholder="Your next argument" />
    <button class="btn" id="submit">Send</button>
    <p id="status" class="center"></p>
    <div id="restart" class="center" style="display:none;"></div>`;

  const chat     = document.getElementById("chat");
  const input    = document.getElementById("arg");
  const submit   = document.getElementById("submit");
  const status   = document.getElementById("status");
  const restart  = document.getElementById("restart");

  const MAX_TURNS = 6; // -1 because the first message is from the AI

  const systemRules = `
You are the Gatekeeper of a CAPTCHA from Hell.
Hold a rigorous debate with the user.
Evaluate ONLY their latest message.
Respond in **two sentences** exactly:
1) Start with "ACCEPT:" or "REJECT:".
2) One short challenge or rationale (≤ 20 words).`;

  const history = [
    { role: "user", parts: [{ text: systemRules }] },
    { role: "model", parts: [{ text: "You are to prove to me that you are a human. You have 5 tries or I will be sending you back to where you came from." }] }
  ];
  
  renderAI(history[1].parts[0].text);

  submit.onclick = async () => {
    const userMsg = input.value.trim();
    if (!userMsg) return showError("Say something first.");
    input.value = "";
    renderUser(userMsg);
    status.textContent = "Thinking…";

    history.push({ role: "user", parts: [{ text: userMsg }] });

    try {
      const res = await fetch("http://localhost:3000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: history })
      });

      const data  = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!reply) throw new Error("Empty reply");

      history.push({ role: "model", parts: [{ text: reply }] });
      renderAI(reply);

      const decision = reply.split(":")[0].trim().toUpperCase();
      const attempts = history.filter(m => m.role === "user").length;

      if (decision === "ACCEPT") {
        nextStage();
      } else if (attempts >= MAX_TURNS) {
        lockOut();
      }
    } catch (e) {
      console.error("Gemini error:", e);
      showError("API error. Please retry.");
    } finally {
      status.textContent = "";
    }
  };

  function lockOut() {
    input.disabled = true;
    submit.disabled = true;
    renderAI("REJECT: The Gatekeeper has lost patience. You are not worthy.");
    restart.innerHTML = `<button class="btn" style="margin-top:1rem">Return to Start</button>`;
    restart.style.display = "block";
    restart.querySelector("button").onclick = () => location.reload();
  }

  function renderUser(msg) {
    chat.insertAdjacentHTML("beforeend",
      `<div class="bubble user">${escape(msg)}</div>`);
    chat.scrollTop = chat.scrollHeight;
  }

  function renderAI(msg) {
    chat.insertAdjacentHTML("beforeend",
      `<div class="bubble ai">${escape(msg)}</div>`);
    chat.scrollTop = chat.scrollHeight;
  }

  function escape(str) {
    return str.replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  }
}
