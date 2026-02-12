import "./style.css";
import { gsap } from "gsap";

/* ---------- Overlay layer (lluvia) ---------- */
const heartsLayer = document.getElementById("hearts");
const canvas = document.getElementById("tree");

/* ✅ Lista de fotos (deben estar en /public) */
const photos = [
  "/foto1.jpeg",  "/foto2.jpeg",  "/foto3.jpeg",  "/foto4.jpeg",  "/foto5.jpeg",
  "/foto6.jpeg",  "/foto7.jpeg",  "/foto8.jpeg",  "/foto9.jpeg",  "/foto10.jpeg",
  "/foto11.jpeg", "/foto12.jpeg", "/foto13.jpeg", "/foto14.jpeg", "/foto15.jpeg",
  "/foto16.jpeg", "/foto17.jpeg", "/foto18.jpeg", "/foto19.jpeg", "/foto20.jpeg",
  "/foto21.jpeg",
];

/* ---------- Cargar texto editable desde public/texto.txt ---------- */
async function loadLetterText() {
  const el = document.getElementById("letterText");
  if (!el) return;

  try {
    // ✅ funciona en dev y en GH Pages (base correcto en vite.config.js)
    const res = await fetch("./texto.txt", { cache: "no-store" });
    const txt = await res.text();
    el.textContent = txt;
  } catch {
    el.textContent = "No se pudo cargar el texto.";
  }
}
loadLetterText();

/* ---------- Lluvia de FOTOS (pantalla completa) ---------- */
function photoBurst(count = 28) {
  if (!heartsLayer) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.src = photos[(Math.random() * photos.length) | 0];

    img.style.position = "absolute";
    img.style.left = Math.random() * w + "px";
    img.style.top = h + 40 + "px";
    img.style.width = 70 + Math.random() * 60 + "px";
    img.style.height = "auto";
    img.style.borderRadius = "14px";
    img.style.boxShadow = "0 10px 24px rgba(0,0,0,.22)";
    img.style.opacity = "0.98";
    img.style.pointerEvents = "none";
    img.style.userSelect = "none";

    heartsLayer.appendChild(img);

    gsap.to(img, {
      y: -(h + 320),
      x: Math.random() * 260 - 130,
      rotation: Math.random() * 60 - 30,
      duration: 2.8 + Math.random() * 2.2,
      ease: "power1.out",
      onComplete: () => img.remove(),
    });

    gsap.to(img, {
      opacity: 0,
      duration: 1.0,
      delay: 1.8 + Math.random() * 1.8,
      ease: "power1.out",
    });
  }
}

/* ✅ Botón: dispara fotos */
document.getElementById("heartRainBtn")?.addEventListener("click", () => photoBurst(30));

/* ✅ Tocar el árbol: también dispara fotos (igual que el botón: pantalla completa) */
canvas?.addEventListener("click", () => photoBurst(30));

/* ---------- Tree ---------- */
const ctx = canvas?.getContext("2d", { alpha: true });

let TRUNK_X = 0;
let TRUNK_TOPY = 0;
let parts = [];
let startTime = 0;

function fitCanvas() {
  if (!canvas || !ctx) return;

  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(r.width * dpr);
  canvas.height = Math.floor(r.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", () => {
  fitCanvas();
  init();
});

/* --------- Hoja corazón --------- */
const HEART = (() => {
  const p = new Path2D();
  p.moveTo(0, 0.28);
  p.bezierCurveTo(-0.6, -0.35, -1.25, 0.4, 0, 1.25);
  p.bezierCurveTo(1.25, 0.4, 0.6, -0.35, 0, 0.28);
  p.closePath();
  return p;
})();

function drawHeart(x, y, s, color, alpha = 1) {
  if (!ctx) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill(HEART);
  ctx.restore();
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* --------- Más forma corazón --------- */
function insideHeart(nx, ny) {
  const x = nx * 1.15;
  const y = ny * 1.25;

  const a = x * x + y * y - 1;
  let v = a * a * a - x * x * y * y * y;

  // punta inferior más picuda
  const tip = Math.max(0, (-ny - 0.1));
  v += tip * tip * 0.30;

  return v <= 0;
}

const palette = [
  "#b10f2e", "#c81d3a", "#d62839", "#e63946",
  "#ff4d6d", "#ff758f", "#ff8fab", "#ffb3c1",
  "#ffcad4", "#ffd6e0"
];

/* --------- Generar hojas (no tan densas) --------- */
function init() {
  if (!canvas || !ctx) return;
  fitCanvas();

  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;

  TRUNK_X = w * 0.60;
  TRUNK_TOPY = h * 0.56;

  const cx = w * 0.60;
  const cy = h * 0.405;
  const scale = Math.min(w, h) * 0.315;

  const count = (w * h > 260000) ? 900 : 740;

  parts = [];
  startTime = performance.now() / 1000;

  let tries = 0;
  while (parts.length < count && tries < count * 260) {
    tries++;

    const nx = rand(-1.15, 1.15);
    const ny = rand(-1.15, 1.05);
    if (!insideHeart(nx, ny)) continue;

    const tx = cx + nx * scale;
    const ty = cy - ny * scale;

    parts.push({
      sx: TRUNK_X + rand(-7, 7),
      sy: TRUNK_TOPY + rand(-2, 6),
      tx,
      ty,
      d: rand(1.05, 1.55),
      delay: rand(0, 0.70),
      s: rand(15, 24),
      c: palette[(Math.random() * palette.length) | 0],
      phase: Math.random() * Math.PI * 2,
      amp: rand(0.15, 0.9),
    });
  }
}

/* --------- Tronco --------- */
function drawTrunk(w, h) {
  if (!ctx) return;

  const x = w * 0.60;
  const baseY = h * 0.92;
  const topY = h * 0.56;

  TRUNK_X = x;
  TRUNK_TOPY = topY;

  const trunkTopW = Math.min(w, h) * 0.018;
  const trunkBotW = Math.min(w, h) * 0.055;

  ctx.save();

  const g = ctx.createLinearGradient(x, topY, x, baseY);
  g.addColorStop(0, "#7a3b2e");
  g.addColorStop(1, "#4a241b");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - trunkTopW, topY);
  ctx.lineTo(x + trunkTopW, topY);
  ctx.lineTo(x + trunkBotW, baseY);
  ctx.lineTo(x - trunkBotW, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/* --------- Render --------- */
function render() {
  if (!canvas || !ctx) return;

  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  const t = performance.now() / 1000 - startTime;

  ctx.clearRect(0, 0, w, h);

  // tronco primero
  drawTrunk(w, h);

  // hojas encima del tronco
  for (const p of parts) {
    const tt = (t - p.delay) / p.d;
    if (tt <= 0) continue;

    const k = Math.min(1, tt);
    const e = easeOutCubic(k);

    const fx = p.sx + (p.tx - p.sx) * e;
    const fy = p.sy + (p.ty - p.sy) * e;

    const float = k >= 1 ? Math.sin(p.phase + t * 0.9) * p.amp : 0;

    drawHeart(fx, fy + float * 0.30, p.s, p.c, 0.95);
  }

  requestAnimationFrame(render);
}

init();
requestAnimationFrame(render);
