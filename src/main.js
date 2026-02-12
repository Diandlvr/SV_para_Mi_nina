import "./style.css";
import { gsap } from "gsap";

/* ---------- Hearts overlay ---------- */
const heartsLayer = document.getElementById("hearts");
function heartBurst(count = 18) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.textContent = Math.random() > 0.5 ? "💗" : "💖";
    el.style.position = "absolute";
    el.style.left = Math.floor(Math.random() * w) + "px";
    el.style.top = h + 20 + "px";
    el.style.fontSize = 14 + Math.random() * 22 + "px";
    el.style.opacity = "0.95";
    el.style.userSelect = "none";
    heartsLayer.appendChild(el);

    gsap.to(el, {
      y: -(h + 180),
      x: Math.random() * 140 - 70,
      rotation: Math.random() * 80 - 40,
      duration: 2.2 + Math.random() * 1.6,
      ease: "power1.out",
      onComplete: () => el.remove(),
    });

    gsap.to(el, {
      opacity: 0,
      duration: 0.8,
      delay: 1.5 + Math.random() * 1.3,
      ease: "power1.out",
    });
  }
}

/* ---------- Tabs / Screens ---------- */
const tabEnvelope = document.getElementById("tabEnvelope");
const tabLetter = document.getElementById("tabLetter");

const screenEnvelope = document.getElementById("screenEnvelope");
const screenLetter = document.getElementById("screenLetter");

function setActiveTab(which) {
  const isEnvelope = which === "envelope";
  screenEnvelope.classList.toggle("hidden", !isEnvelope);
  screenLetter.classList.toggle("hidden", isEnvelope);

  // look active (simple)
  tabEnvelope.style.opacity = isEnvelope ? "1" : ".65";
  tabLetter.style.opacity = isEnvelope ? ".65" : "1";
}

tabEnvelope.addEventListener("click", () => setActiveTab("envelope"));
tabLetter.addEventListener("click", () => setActiveTab("letter"));

/* ---------- Envelope animation ---------- */
const openBtn = document.getElementById("openBtn");
const flap = document.getElementById("flap");
const behindHearts = document.getElementById("behindHearts");
const letter = document.getElementById("letter"); // vacío

let opened = false;

const openTL = gsap.timeline({ paused: true })
  .to(behindHearts, { opacity: 1, duration: 0.25, ease: "power1.out" })
  .to(flap, { rotateX: 170, transformOrigin: "top center", duration: 0.65, ease: "power2.out" })
  .to(letter, { y: -60, opacity: 1, duration: 0.55, ease: "power2.out" }, "-=0.2");

openBtn.addEventListener("click", () => {
  if (opened) return;
  opened = true;

  heartBurst(14);
  openTL.play();

  // habilitar tab Carta
  tabLetter.disabled = false;
  tabLetter.style.opacity = "1";

  setTimeout(() => {
    setActiveTab("letter");
    gsap.fromTo(screenLetter, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
    startTree(); // arrancar árbol al entrar a carta
  }, 650);
});

/* ---------- Organic heart rain ---------- */
document.getElementById("heartRainBtn")?.addEventListener("click", () => heartBurst(35));

/* ---------- Music ---------- */
const musicBtn = document.getElementById("musicBtn");
const music = document.getElementById("music");
let musicOn = false;

musicBtn?.addEventListener("click", async () => {
  try {
    if (!musicOn) {
      await music.play();
      musicOn = true;
      musicBtn.textContent = "🔊 Música";
      heartBurst(10);
    } else {
      music.pause();
      musicOn = false;
      musicBtn.textContent = "🔈 Música";
    }
  } catch {}
});

/* ---------- Tree (VIDEO LOOK: tronco marrón + copa grande suave) ---------- */
const canvas = document.getElementById("tree");
const ctx = canvas?.getContext("2d", { alpha: true });

let treeStarted = false;
let rafId = 0;
let particles = [];
let lastT = 0;

function setCanvasSize() {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Path2D corazón (rápido)
const HEART_PATH = (() => {
  const p = new Path2D();
  p.moveTo(0, 0.35);
  p.bezierCurveTo(-0.5, -0.2, -1.1, 0.35, 0, 1.1);
  p.bezierCurveTo(1.1, 0.35, 0.5, -0.2, 0, 0.35);
  p.closePath();
  return p;
})();

function drawHeart(x, y, s, color, a = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha = a;
  ctx.fillStyle = color;
  ctx.fill(HEART_PATH);
  ctx.restore();
}

function insideHeart(nx, ny) {
  const x = nx;
  const y = ny;
  const A = x * x + y * y - 1;
  return (A * A * A - x * x * y * y * y) <= 0;
}

function randBetween(a, b) {
  return a + Math.random() * (b - a);
}

// colores suaves tipo video (más rojos/rosas, no arcoiris fuerte)
const CANOPY_COLORS = [
  "#b10f2e", "#c81d3a", "#d62839", "#e63946",
  "#ff4d6d", "#ff758f", "#ff8fab", "#ffb3c1"
];

function initTree() {
  if (!canvas || !ctx) return;
  setCanvasSize();

  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;

  // copa grande y centrada como el video
  const cx = w * 0.62;
  const cy = h * 0.34;
  const scale = Math.min(w, h) * 0.18;

  // más “amplio” y relleno pero sin trabarse (Path2D aguanta)
  const count = (w * h > 260000) ? 950 : 720;

  particles = [];
  let tries = 0;

  while (particles.length < count && tries < count * 60) {
    tries++;
    const nx = randBetween(-1.25, 1.25);
    const ny = randBetween(-1.25, 1.10);
    if (!insideHeart(nx, ny)) continue;

    // dispersión suave para que se vea “fluffy”
    const jitter = (Math.random() - 0.5) * 6;

    const x = cx + nx * scale + jitter;
    const y = cy - ny * scale + jitter;

    particles.push({
      bx: x,
      by: y,
      s: randBetween(2.0, 3.2),   // más grande (como confeti del video)
      c: CANOPY_COLORS[(Math.random() * CANOPY_COLORS.length) | 0],
      phase: Math.random() * Math.PI * 2,
      spd: randBetween(0.45, 0.95),
      amp: randBetween(1.5, 5.5),
    });
  }
}

function drawTrunk(w, h) {
  // tronco marrón + ramas suaves (como el video)
  const baseY = h * 0.92;
  const topY = h * 0.55;
  const x = w * 0.62;

  ctx.save();

  // tronco
  ctx.fillStyle = "#7a3b2e";
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(x - 18, baseY);
  ctx.lineTo(x + 18, baseY);
  ctx.lineTo(x + 10, topY);
  ctx.lineTo(x - 10, topY);
  ctx.closePath();
  ctx.fill();

  // ramas
  ctx.strokeStyle = "#6b2f25";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  const branches = [
    [x, topY + 10, x - 85, topY - 25],
    [x, topY + 10, x + 85, topY - 25],
    [x, topY + 32, x - 58, topY + 18],
    [x, topY + 32, x + 58, topY + 18],
  ];

  for (const [x1, y1, x2, y2] of branches) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 - 14, x2, y2);
    ctx.stroke();
  }

  // suelo sutil
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#7a3b2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.12, h * 0.94);
  ctx.lineTo(w * 0.88, h * 0.94);
  ctx.stroke();

  ctx.restore();
}

function render(ts) {
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;

  const t = (ts || 0) / 1000;
  lastT = t;

  ctx.clearRect(0, 0, w, h);

  drawTrunk(w, h);

  // copa (flotación suave)
  for (const p of particles) {
    const a = p.phase + t * p.spd;
    const x = p.bx + Math.cos(a) * p.amp + Math.sin(a * 0.7) * (p.amp * 0.25);
    const y = p.by + Math.sin(a * 1.05) * (p.amp * 0.70);
    const alpha = 0.78 + 0.22 * Math.sin(a * 1.15);
    drawHeart(x, y, p.s, p.c, alpha);
  }

  rafId = requestAnimationFrame(render);
}

function startTree() {
  if (treeStarted) return;
  treeStarted = true;
  initTree();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(render);
}

window.addEventListener("resize", () => {
  if (!treeStarted) return;
  initTree();
});
