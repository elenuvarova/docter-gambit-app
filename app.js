// Mouth Vitals — interactive prototype navigation
// Bump ASSET_V whenever the screen PNGs change so browsers fetch fresh art
// (nginx caches png/js for 7d; the query string busts that cache).
const ASSET_V = "14";
const v = (p) => `${p}?v=${ASSET_V}`;
const SCREENS = [
  { id: "onboarding", img: v("assets/onboarding.png"), label: "Onboarding",
    alt: "Welcome screen: Let's get your Mouth Vitals — a 60-second private scan, no account, no cost. Primary action: Start 60-sec scan.",
    hotspots: [{ l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "score", name: "Start 60-sec scan" }] },
  { id: "score", img: v("assets/score.png"), label: "Score",
    alt: "Home screen: your Mouth Vitals score is 82 out of 100, shown as a progress ring. Cards: Gums healthy, Breath fresh. Primary action: see today's fix.",
    hotspots: [
      { l: 4.98, t: 56.1, w: 42.5, h: 11.0, to: "mouthbody", name: "Open Gums detail" },
      { l: 52.5, t: 56.1, w: 42.5, h: 11.0, to: "breath", name: "Open Breath detail" },
      { l: 4.98, t: 81.7, w: 90.0, h: 6.4, to: "today", name: "See today's fix" },
    ] },
  { id: "mouthbody", img: v("assets/mouthbody.png"), label: "Mouth-body",
    alt: "Education screen: your gums and your whole body — a diagram linking gums to the heart. 47 percent of adults 30 and older have gum disease. Primary action: see my 20-second fix.",
    hotspots: [
      { l: 4.0, t: 7.2, w: 26.0, h: 4.6, to: "score", name: "Back to score" },
      { l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "today", name: "See my 20-sec fix" },
    ] },
  { id: "breath", img: v("assets/breath.png"), label: "Breath",
    alt: "Breath check screen: result is Fresh, shown as a ring. Primary action: check now.",
    hotspots: [
      { l: 4.0, t: 7.2, w: 26.0, h: 4.6, to: "score", name: "Back to score" },
      { l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "score", name: "Check now" },
    ] },
  { id: "today", img: v("assets/today.png"), label: "Today",
    alt: "Today screen: your daily streak and today's 20-second fix — floss the back-left where your gums flag. Primary action: brush with Max.",
    hotspots: [{ l: 4.98, t: 46.0, w: 90.0, h: 10.3, to: "breath", name: "Brush with Max" }] },
];

const byId = (id) => SCREENS.find((s) => s.id === id);
const order = SCREENS.map((s) => s.id);
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const img = document.getElementById("screenImg");
const hotEl = document.getElementById("hotspots");
const railEl = document.getElementById("rail");
const stepEl = document.getElementById("step");
const snameEl = document.getElementById("sname");
const liveEl = document.getElementById("live");
let current = null;
let pending = null;

function preload() { SCREENS.forEach((s) => { const i = new Image(); i.src = s.img; }); }

function paint(s) {
  current = s.id;
  img.alt = s.alt || s.label + " screen";
  const reveal = () => { if (current === s.id) img.classList.remove("is-swapping"); }; // ignore a stale load from a superseded swap
  img.onload = reveal;
  img.onerror = reveal;            // a missing/blocked asset never leaves a blank screen
  img.src = s.img;
  if (img.complete) requestAnimationFrame(reveal);  // cached images may not fire load
  const idx = order.indexOf(s.id);
  if (stepEl) stepEl.textContent = String(idx + 1).padStart(2, "0") + " / " + String(order.length).padStart(2, "0");
  if (snameEl) snameEl.textContent = s.label;
  // single, atomic announcement for screen readers (the visual step/name is just chrome)
  if (liveEl) liveEl.textContent = `Screen ${idx + 1} of ${order.length}: ${s.label}`;
  hotEl.setAttribute("role", "group");
  hotEl.setAttribute("aria-label", `Actions on the ${s.label} screen`);
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
  updateRail();
}

function render(id) {
  const s = byId(id);
  if (!s) return;
  if (pending) { clearTimeout(pending); pending = null; }
  if (reduce) { paint(s); return; }
  img.classList.add("is-swapping");
  pending = setTimeout(() => { pending = null; paint(s); }, 150);
}

function buildRail() {
  SCREENS.forEach((s) => {
    const t = document.createElement("button");
    t.className = "thumb";
    t.dataset.id = s.id;
    t.title = s.label;
    t.setAttribute("aria-label", `Go to ${s.label}`);
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
  const t = e.target;                                   // don't hijack arrows from a focused field
  if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

// Subtle 3D pointer tilt on the phone (pointer devices only, respects reduced-motion)
const frame = document.querySelector(".phone__frame");
if (!reduce && frame) {
  let raf = 0;
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const px = e.clientX / window.innerWidth - 0.5;
    const py = e.clientY / window.innerHeight - 0.5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      frame.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
    });
  });
  window.addEventListener("pointerleave", () => { frame.style.transform = ""; });
}

preload();
buildRail();
paint(byId("onboarding"));
