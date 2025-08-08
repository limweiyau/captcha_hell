import stage1 from "./stages/stage1.js";
import stage2 from "./stages/stage2.js";
import stage3 from "./stages/stage3.js";
import stage4 from "./stages/stage4.js";
// Add/remove as needed

const stages = [stage1, stage2, stage3, stage4]; // Easy config

const appEl   = document.getElementById("app");
const errorEl = document.getElementById("error");
let current = 0;
let startTime = 0, timerInt = null;

function formatTime(ms) {
  const m = Math.floor(ms / 60000).toString().padStart(2, "0");
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  const hs = Math.floor((ms % 1000) / 10).toString().padStart(2, "0");
  return `${m}:${s}:${hs}`;
}

showIntro();

function showIntro() {
  clear();
  appEl.innerHTML = `
    <div class="center" style="margin-top:1.5rem;">
      <h2>😈 Just a Regular Captcha</h2>
      <p>Please complete all ${stages.length} stages.<br>
      <strong>You will be timed.</strong></p>
      <button class="btn" id="begin">Begin Challenge</button>
    </div>
  `;
  document.getElementById("begin").onclick = startChallenge;
}

function startChallenge() {
  startTime = Date.now();
  current = 0;
  showTimer();
  nextStage();
}

function showTimer() {
  let timerEl = document.getElementById("timer");
  if (!timerEl) {
    timerEl = document.createElement("div");
    timerEl.id = "timer";
    timerEl.style.cssText = "position:fixed;top:24px;right:30px;background:var(--accent);color:#000;padding:.5rem 1.2rem;border-radius:20px;font-weight:700;z-index:50";
    document.body.appendChild(timerEl);
  }
  timerEl.hidden = false;
  setInterval(() => {
    const ms = Date.now() - startTime;
    timerEl.textContent = `⏱️ ${formatTime(ms)}`;
  }, 10);
}

export function nextStage() {
  if (current >= stages.length) {
    return showSuccess();
  }
  clear();
  stages[current++]({ nextStage, showError });
}
function clear() { appEl.innerHTML = ""; hideError(); }

function showSuccess() {
  if (timerInt) clearInterval(timerInt);
  const ms = Date.now() - startTime;
  const timeTaken = formatTime(ms);
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.hidden = true;

  appEl.innerHTML = `
    <h2>🎉 Congratulations! 🎉</h2>
    <p class="center">You passed all ${stages.length} stages.<br>
    <b>in ${timeTaken}!</b></p>
    <div class="center" style="font-size:3rem;margin:2rem 0 1rem 0">🥳✨🎊</div>
    <div class="center">
      <button class="btn" onclick="location.reload()">Restart</button>
    </div>
    <canvas id="confetti" style="position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:99"></canvas>
  `;
  confettiBurst();
}

function confettiBurst() {
  const c = document.getElementById("confetti");
  if (!c) return;
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext("2d");
  const confetti = [];
  for(let i=0;i<90;i++){
    confetti.push({
      x: Math.random()*c.width,
      y: Math.random()*-c.height/2,
      r: Math.random()*8+6,
      d: Math.random()*c.height/1.2,
      color: `hsl(${Math.random()*360},90%,65%)`,
      tilt: Math.random()*20-10,
      tiltAngleIncremental: (Math.random()*0.09)+.03,
      tiltAngle: 0
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    for (let i = 0; i < confetti.length; i++) {
      const p = confetti[i];
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r/2, p.tilt, 0, 2*Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += Math.cos(frame/8+p.d) + 2 + p.r/5;
      p.x += Math.sin(frame/6+p.d) * 2;
      p.tiltAngle += p.tiltAngleIncremental;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      if (p.y > c.height) {
        p.x = Math.random()*c.width;
        p.y = -10;
      }
    }
    frame++;
    // --- No stop condition (runs forever until reload)
    requestAnimationFrame(draw);
  }
  draw();
}

/* ----- global error banner ----- */
export function showError(msg){
  errorEl.textContent = msg;
  errorEl.hidden = false;
  setTimeout(()=>{ errorEl.hidden = true; }, 3000);
}
function hideError(){ errorEl.hidden = true; }
