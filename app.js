// Mouth Vitals — interactive prototype navigation
const SCREENS = [
  { id: "onboarding", img: "assets/onboarding.png", label: "Onboarding",
    hotspots: [{ l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "score", name: "Start scan" }] },
  { id: "score", img: "assets/score.png", label: "Score",
    hotspots: [
      { l: 4.98, t: 56.1, w: 42.5, h: 11.0, to: "mouthbody", name: "Gums" },
      { l: 52.5, t: 56.1, w: 42.5, h: 11.0, to: "breath", name: "Breath" },
      { l: 4.98, t: 81.7, w: 90.0, h: 6.4, to: "today", name: "See today's fix" },
    ] },
  { id: "mouthbody", img: "assets/mouthbody.png", label: "Mouth-body",
    hotspots: [
      { l: 4.0, t: 7.2, w: 26.0, h: 4.6, to: "score", name: "Back" },
      { l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "today", name: "See my 20-sec fix" },
    ] },
  { id: "breath", img: "assets/breath.png", label: "Breath",
    hotspots: [
      { l: 4.0, t: 7.2, w: 26.0, h: 4.6, to: "score", name: "Back" },
      { l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "score", name: "Check now" },
    ] },
  { id: "today", img: "assets/today.png", label: "Today",
    hotspots: [{ l: 4.98, t: 46.0, w: 90.0, h: 10.3, to: "breath", name: "Brush with Max" }] },
];

const byId = (id) => SCREENS.find((s) => s.id === id);
const order = SCREENS.map((s) => s.id);
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const img = document.getElementById("screenImg");
const hotEl = document.getElementById("hotspots");
const railEl = document.getElementById("rail");
let current = null;
let pending = null;

function preload() { SCREENS.forEach((s) => { const i = new Image(); i.src = s.img; }); }

// paint() is the single place that mutates `current` + the DOM, so an aborted
// transition can never leave state ahead of what's on screen.
function paint(s) {
  current = s.id;
  img.src = s.img;
  img.alt = s.label + " screen";
  hotEl.replaceChildren();
  s.hotspots.forEach((h) => {
    const b = document.createElement("button");
    b.className = "hotspot";
    b.style.cssText = `left:${h.l}%;top:${h.t}%;width:${h.w}%;height:${h.h}%`;
    b.setAttribute("aria-label", h.name);
    b.title = h.name;
    b.addEventListener("click", () => { b.classList.add("tap"); render(h.to); });
    hotEl.appendChild(b);
  });
  requestAnimationFrame(() => img.classList.remove("is-swapping"));
  updateRail();
}

function render(id) {
  const s = byId(id);
  if (!s) return;
  if (pending) { clearTimeout(pending); pending = null; }   // cancel any in-flight swap
  if (reduce) { paint(s); return; }
  img.classList.add("is-swapping");
  pending = setTimeout(() => { pending = null; paint(s); }, 150);
}

function buildRail() {
  SCREENS.forEach((s, i) => {
    const t = document.createElement("button");
    t.className = "thumb";
    t.dataset.id = s.id;
    t.title = s.label;
    t.style.animationDelay = (0.35 + i * 0.06) + "s";
    const im = document.createElement("img");
    im.src = s.img; im.alt = ""; im.loading = "lazy";
    t.appendChild(im);
    t.addEventListener("click", () => render(s.id));
    railEl.appendChild(t);
  });
}
function updateRail() {
  railEl.querySelectorAll(".thumb").forEach((t) => {
    const on = t.dataset.id === current;
    t.classList.toggle("active", on);
    if (on) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
  });
}

function step(dir) {
  const i = order.indexOf(current);
  render(order[(i + dir + order.length) % order.length]);
}

document.getElementById("next").addEventListener("click", () => step(1));
document.getElementById("prev").addEventListener("click", () => step(-1));
document.getElementById("reset").addEventListener("click", () => render("onboarding"));
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

// Subtle 3D pointer tilt on the phone (pointer devices only, respects reduced-motion)
const stage = document.querySelector(".stage");
const frame = document.querySelector(".phone__frame");
if (!reduce && stage && frame) {
  let raf = 0;
  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      frame.style.transform = `rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
    });
  });
  stage.addEventListener("pointerleave", () => { frame.style.transform = ""; });
}

preload();
buildRail();
paint(byId("onboarding"));
