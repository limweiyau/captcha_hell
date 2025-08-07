/* -----------------------------------------------------------------------
   Stage X – Deep-Fried Text 2.0  (solvable + extra crispy)
------------------------------------------------------------------------ */
export default function ({ nextStage, showError }) {
  /* ---------- Scaffold ---------- */
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Stage X – Deep-Fried Text</h2>
    <div class="captcha-card">
      <canvas id="cap" width="320" height="110"></canvas>
      <button id="rf" title="New CAPTCHA" aria-label="Refresh">⟳</button>
      <input id="inp" type="text" placeholder="Type what you see…" autocomplete="off"/>
      <button id="go"  class="btn">Verify</button>
      <p id="msg" role="alert"></p>
    </div>`;

  /* ---------- Quick style injection (once) ---------- */
  if (!document.getElementById("df-style")){
    const s=document.createElement("style"); s.id="df-style";
    s.textContent=`.captcha-card{position:relative;width:min(340px,95vw);margin:auto;padding:1.5rem 1rem 2rem;
      background:#1b2230;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.35);display:grid;gap:1rem;justify-items:center;color:#e7ecff}
      #cap {filter: contrast(300%) saturate(2000%) brightness(110%) hue-rotate(20deg) blur(0.3px) drop-shadow(0 0 6px orange);}
      #rf{position:absolute;top:1rem;right:1rem;background:transparent;border:0;color:#8ad3ff;font-size:1.25rem;cursor:pointer;transition:transform .2s}
      #rf:hover{transform:rotate(90deg)}#inp{width:100%;padding:.65rem .75rem;border-radius:4px;border:1px solid rgba(255,255,255,.12);
      background:rgba(255,255,255,.05);color:#e7ecff}#go{width:100%;padding:.6rem;background:#8ad3ff;border:0;border-radius:4px;color:#000;font-weight:600;cursor:pointer}
      #msg{min-height:1.4em;text-align:center;font-size:.9rem}`;
    document.head.appendChild(s);
  }

  /* ---------- Word bank ---------- */
  const BANK = [
    "9z@F!2#", "x1$e3^T", "P7^#d0r", "q!M9&2a", "8v%Y$3j", "l@7#W9!", "r*2J$6o", "k!4#Z7g", "3^pE$1u", "A6&*qL2",
    "t9%zM!7", "c1@X*4v", "7^dW&0o", "e@8#H3u", "m5^&P#1", "Z2$!r6x", "j9!B&*4", "v@1#yU7", "n3$^T0k", "xL8%*e2",
    "w@7^Q#3", "U0$&j1z", "a6!T^%9", "o1#M$&v", "9^G@z*3", "H2!k7$L", "p3%X^0e", "F@5$z!w", "dY^1&*7o", "s3#U@x9",
    "M!6$qL2", "v9#z&^P", "q@X1!7c", "rL*3&%0y", "5z$T@u9", "n0&k7#^p", "W@1^$vX", "gL!2%*9z", "j8$&qY0m", "o@7^p#3r",
    "3xL$&T!c", "h0@W9*^z", "e!7q#%2L", "9@p^X*3u", "a6!$z&vM", "r@9L#^oT", "x1$e3^K", "q0@T#&u8", "M@z5$!yP", "L1^*9o#x",
    "k7&^@Xp2", "z!qW$*39", "J8^#x@0p", "uL$*1z^v", "F7!k9@#c", "q3^&%X1p", "z9$@T&wo", "bL7!#x@2", "p8@^z#M1", "N3$!kY^o",
    "xL@7#^2m", "o5$&qX!v", "z@3^T#c1", "u9X!$&Lp", "K@0^#z7w", "m1!qL$8x", "x7$&^Tpo", "pL@z#X!2", "e9^$qW@3", "zL0!^&x7m",
    "a@8#pTX^", "v7!$z&0L", "qX#1@^wp", "n5$L&!z8", "o0@p^T#X", "rL7!$xq^2", "X9$&@Tp1", "p3^L!zW@0", "zX#o7$&1q", "L@q^!8pTX",
    "x9$@^zLp0", "w1T#&qL!3", "J@p^Xz#78", "Lq!$o2X^p", "z3^@WL$1p", "o7T!qX#^p0", "v@9$z&TL#1", "pX1^oL$@z8", "k3@^$qWpX1",
    "xT0!^Lpz@9", "uL7@^$qXp1", "z9p$XoL^!3", "q0!@zXpLT^9", "pXL@!^zq8T#", "o7qX$Lp@^T1", "zT!X@Lp^9q#", "LXp@^!zq37T",
    "1z^LpXq@!T", "T@Xq!Lp^9z", "X9q^TLp@!z"
  ];


  /* ---------- Helpers ---------- */
  const $=(id)=>document.getElementById(id);
  const rand=(a,b)=>Math.random()*(b-a)+a;
  const pick=(a)=>a[Math.floor(Math.random()*a.length)];
  const words = () => pick(BANK);

  /* ---------- Canvas refs ---------- */
  const C=$("cap"),ctx=C.getContext("2d");
  const rf=$("rf"),inp=$("inp"),go=$("go"),msg=$("msg");
  let answer="";

  /* ---------- Drawing utilities ---------- */
  function fitFont(txt,maxW){
    for(let size=38;size>14;size--){
      ctx.font=`700 ${size}px "Courier New",monospace`;
      if(ctx.measureText(txt).width<=maxW) return size;
    }
    return 14;
  }
  function noise(){
    const d=ctx.getImageData(0,0,C.width,C.height).data;
    for(let i=0;i<d.length;i+=4){
      const n=rand(-5,20);
      d[i]+=n;d[i+1]+=n;d[i+2]+=n;
    }
    ctx.putImageData(new ImageData(new Uint8ClampedArray(d),C.width,C.height),0,0);
  }
  function wave(){
    const a=0.6,f=.05,tmp=ctx.getImageData(0,0,C.width,C.height);
    const out=ctx.createImageData(tmp);
    for(let y=0;y<C.height;y++){
      const dx=Math.floor(a*Math.sin(y*f+rand(0,Math.PI)));
      for(let x=0;x<C.width;x++){
        const sx=x+dx;
        if(sx>=0&&sx<C.width){
          const si=(y*C.width+sx)*4,di=(y*C.width+x)*4;
          out.data.set(tmp.data.slice(si,si+4),di);
        }
      }
    }
    ctx.putImageData(out,0,0);
  }
  function lines(){
    ctx.lineWidth=1;
    for(let i=0;i<6;i++){
      ctx.strokeStyle=`hsla(${rand(0,360)},90%,60%,.8)`;
      ctx.beginPath();ctx.moveTo(rand(0,320),rand(0,110));ctx.lineTo(rand(0,320),rand(0,110));ctx.stroke();
    }
  }
  function pixelCrunch(){
    const off=document.createElement("canvas");
    off.width= C.width/0.8; 
    off.height= C.height/0.8;
    const octx=off.getContext("2d");
    octx.drawImage(C,0,0,off.width,off.height);
    ctx.imageSmoothingEnabled=false;
    ctx.clearRect(0,0,C.width,C.height);
    ctx.drawImage(off,0,0,C.width,C.height);
  }

  /* ---------- Render one CAPTCHA ---------- */
  function render(){
    answer=words();
    ctx.clearRect(0,0,C.width,C.height);
    /* bg */
    const g = ctx.createRadialGradient(160, 55, 10, 160, 55, 160); // center X,Y
    g.addColorStop(0, "#552200");   // bright orange core
    g.addColorStop(1, "#1a0900");   // fades to dark
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 320, 110);

    /* wrap onto 1-2 lines */
    const linesTxt = [answer];
    ctx.font = `700 40px "Courier New", monospace`;
    ctx.textBaseline="middle";

    linesTxt.forEach((t,i)=>{
      let x=20,y= C.height*(0.33+i*0.34);
      t.split("").forEach(ch=>{
        ctx.save();ctx.translate(x, y+rand(-5,5));ctx.rotate(rand(-.35,.35));
        ctx.fillStyle=`hsl(${rand(20,30)}, 90%, ${rand(60, 75)}%)`;ctx.fillText(ch,0,0);ctx.restore();

        x+= ctx.measureText(ch).width+rand(-2,2);
      });
    });

    lines();           // coloured slashes
    noise();           // static
    wave();            // first wave
    wave();            // second wave for extra scramble
    pixelCrunch();     // up-scale pixel-bleed

    inp.value=""; msg.textContent="";
  }

  /* ---------- Verification ---------- */
  function check(){
    if(inp.value.trim() === answer){
      msg.textContent="✅ Verified… for now."; nextStage();
    }else showError("❌ Wrong.  Try again or refresh.");
  }

  /* ---------- Wire up ---------- */
  rf.onclick=render;  go.onclick=check;
  inp.addEventListener("keydown",e=>e.key==="Enter"&&check());

  /* ---------- Bootstrap ---------- */
  render();
}
