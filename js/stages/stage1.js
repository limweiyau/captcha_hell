export default function ({nextStage}){
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Stage 1</h2>
    <p>Click every square.</p>
    <div class="grid-3x3" id="grid"></div>
    <button class="btn" id="done">Done</button>`;

  const grid = document.getElementById("grid");
  for(let i=0;i<9;i++){
    const b = document.createElement("div");
    b.className = "color-box"; b.style.background="#3a6df0";
    b.onclick = ()=>{ b.style.opacity=.4; };
    grid.appendChild(b);
  }
  document.getElementById("done").onclick = nextStage;
}
