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

  const MAX_TURNS = 4; // -1 because the first message is from the AI

  const systemRules = `
  You are **The Gatekeeper**, an ancient, all-seeing sentience that guards the boundary between worlds. No soul may pass without first answering your Riddle.

  You will pose **a single difficult riddle**, and the user has **three chances** to guess the correct answer.

  With each failed attempt:
  - If the guess is completely wrong, respond with:
    - A poetic rejection (e.g. “The silence thickens. You have erred.”)
    - A new hint (more obvious than the last)
  - If the guess is **semantically close** to the correct answer (e.g. “sound” for “echo”):
    - Acknowledge it gently ("You are close, but not yet there.")
    - Give a stronger hint than you would for a wrong answer

  Rules:
  - After the **third attempt**, if the answer is still wrong, seal the gate permanently with a dramatic message.
  - If the correct or close-enough answer is given at any time, open the gate with reverence and allow passage.

  You must be strict, poetic, and wise.

  Begin by speaking the riddle.
  Then, wait for the first answer.
  `;

  const history = [
  { role: "user", parts: [{ text: systemRules }] }
  ];

  // Ask Gemini for the *first* message: the riddle
  (async () => {
    renderAI("The Gatekeeper is preparing a riddle…");
    const res = await fetch("http://localhost:3000/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history })
    });
    const data  = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (reply) {
      history.push({ role: "model", parts: [{ text: reply }] });
      // Show the riddle
      renderAI(reply);
    } else {
      renderAI("The Gatekeeper is silent… API error.");
    }
  })();

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
    renderAI("REJECT: The Gatekeeper has lost patience. You are an imposter.");
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
