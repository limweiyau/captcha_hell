export default function ({nextStage, showError}) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Stage 2</h2>
    <p>Click the square that is <em>slightly</em> more blue.</p>
    <div class="grid-5x5" id="grid"></div>`;

  const grid = document.getElementById("grid");
  const answer = Math.floor(Math.random() * 24); // random index from 0 to 8

  for (let i = 0; i < 25; i++) {
    const b = document.createElement("div");
    b.className = "color-box";
    b.style.background = i === answer
      ? "rgb(100,150,255)"
      : "rgb(100,149,255)";
    b.onclick = () =>
      i === answer ? nextStage()
                   : showError("Nope. Try again.");
    grid.appendChild(b);
  }
}
