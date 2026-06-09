// Mouth Vitals — interactive prototype navigation
const SCREENS = [
  {
    id: "onboarding", img: "assets/onboarding.png", label: "Onboarding",
    hotspots: [{ l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "score", name: "Start scan" }],
  },
  {
    id: "score", img: "assets/score.png", label: "Score",
    hotspots: [
      { l: 4.98, t: 56.1, w: 42.5, h: 11.0, to: "mouthbody", name: "Gums" },
      { l: 52.5, t: 56.1, w: 42.5, h: 11.0, to: "breath", name: "Breath" },
      { l: 4.98, t: 81.7, w: 90.0, h: 6.4, to: "today", name: "See today’s fix" },
    ],
  },
  {
    id: "mouthbody", img: "assets/mouthbody.png", label: "Mouth-body",
    hotspots: [
      { l: 4.0, t: 7.2, w: 26.0, h: 4.6, to: "score", name: "Back" },
      { l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "today", name: "See my 20-sec fix" },
    ],
  },
  {
    id: "breath", img: "assets/breath.png", label: "Breath",
    hotspots: [
      { l: 4.0, t: 7.2, w: 26.0, h: 4.6, to: "score", name: "Back" },
      { l: 4.98, t: 84.7, w: 90.0, h: 6.4, to: "score", name: "Check now" },
    ],
  },
  {
    id: "today", img: "assets/today.png", label: "Today",
    hotspots: [{ l: 4.98, t: 46.0, w: 90.0, h: 10.3, to: "breath", name: "Brush with Max" }],
  },
];

const byId = (id) => SCREENS.find((s) => s.id === id);
const order = SCREENS.map((s) => s.id);

const img = document.getElementById("screenImg");
const hotEl = document.getElementById("hotspots");
const railEl = document.getElementById("rail");
let current = "onboarding";

function preload() {
  SCREENS.forEach((s) => { const i = new Image(); i.src = s.img; });
}

function render(id, withSwap = true) {
  const s = byId(id);
  if (!s) return;
  current = id;
  const paint = () => {
    img.src = s.img;
    img.alt = s.label + " screen";
    hotEl.innerHTML = "";
    s.hotspots.forEach((h) => {
      const b = document.createElement("button");
      b.className = "hotspot";
      b.style.left = h.l + "%";
      b.style.top = h.t + "%";
      b.style.width = h.w + "%";
      b.style.height = h.h + "%";
      b.setAttribute("aria-label", h.name);
      b.title = h.name;
      b.addEventListener("click", () => {
        b.classList.add("tap");
        setTimeout(() => render(h.to), 90);
      });
      hotEl.appendChild(b);
    });
    requestAnimationFrame(() => img.classList.remove("is-swapping"));
    updateRail();
  };
  if (withSwap) {
    img.classList.add("is-swapping");
    setTimeout(paint, 150);
  } else paint();
}

function buildRail() {
  SCREENS.forEach((s) => {
    const t = document.createElement("button");
    t.className = "thumb";
    t.dataset.id = s.id;
    t.title = s.label;
    t.innerHTML = `<img src="${s.img}" alt="${s.label}" />`;
    t.addEventListener("click", () => render(s.id));
    railEl.appendChild(t);
  });
}
function updateRail() {
  railEl.querySelectorAll(".thumb").forEach((t) =>
    t.classList.toggle("active", t.dataset.id === current)
  );
}

function step(dir) {
  const i = order.indexOf(current);
  const next = (i + dir + order.length) % order.length;
  render(order[next]);
}

document.getElementById("next").addEventListener("click", () => step(1));
document.getElementById("prev").addEventListener("click", () => step(-1));
document.getElementById("reset").addEventListener("click", () => render("onboarding"));
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

preload();
buildRail();
render("onboarding", false);
