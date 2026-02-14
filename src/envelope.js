import "./style.css";
import { gsap } from "gsap";

/* ---------- Hearts overlay ---------- */
const heartsLayer = document.getElementById("hearts");

function heartBurst(count = 14) {
  if (!heartsLayer) return;
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.textContent = Math.random() > 0.5 ? "💗" : "💖";
    el.style.position = "absolute";
    el.style.left = Math.random() * w + "px";
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
      delay: 1.4 + Math.random() * 1.2,
      ease: "power1.out",
    });
  }
}

/* ---------- Envelope animation ---------- */
const openBtn = document.getElementById("openBtn");
const flap = document.getElementById("flap");
const behindHearts = document.getElementById("behindHearts");
const letter = document.getElementById("letter");

let opened = false;

const tl = gsap.timeline({ paused: true })
  .to(behindHearts, { opacity: 1, duration: 0.25, ease: "power1.out" })
  .to(flap, { rotateX: 170, transformOrigin: "top center", duration: 0.65, ease: "power2.out" })
  .to(letter, { y: -60, opacity: 1, duration: 0.55, ease: "power2.out" }, "-=0.2");

openBtn?.addEventListener("click", () => {
  console.log("OPEN CLICK ✅");

  if (opened) return;
  opened = true;

  heartBurst(14);
  tl.play();

  setTimeout(() => {
    console.log("REDIRECT ✅");
    window.location.assign(import.meta.env.BASE_URL + "carta/");



  }, 700);
});
