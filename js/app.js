/* =========================================================================
   Core state-machine + helpers
   ========================================================================= */
import stage1 from "./stages/stage1.js";
import stage2 from "./stages/stage2.js";
import stage3 from "./stages/stage3.js";
import stage4 from "./stages/stage4.js";

const stages = [stage1, stage2, stage3, stage4]; // append new modules here

/* ---------------- helpers ---------------- */
const appEl   = document.getElementById("app");
const errorEl = document.getElementById("error");

let current = 0;
nextStage();

export function nextStage(){
  if(current >= stages.length){ return showSuccess(); }
  clear();
  stages[current++]({nextStage, showError});
}
function clear(){ appEl.innerHTML = ""; hideError(); }

function showSuccess(){
  appEl.innerHTML = `
    <h2>You survived the CAPTCHA.</h2>
    <p class="center">Welcome, verified human.</p>`;
}

/* ----- global error banner ----- */
export function showError(msg){
  errorEl.textContent = msg;
  errorEl.hidden = false;
  setTimeout(()=>{ errorEl.hidden = true; }, 3000);
}
function hideError(){ errorEl.hidden = true; }
