# Mouth Vitals — Interactive Prototype (Docter & Gambit · Project DH)

A small static, clickable hi-fi prototype of the **Mouth Vitals** concept — a free, holistic
mouth-body companion. The five screens (Onboarding → Score → Mouth-body → Breath → Today) are
shown inside an iPhone 17 Pro mockup with tappable hotspots that follow the Figma prototype flow.

- **Stack:** plain HTML/CSS/JS, served by nginx (single static container).
- **Screens:** exported from the Figma design system (Brand / Midnight Mint hi-fi mode).
- **Deploy:** Docker → Coolify on `docter-gambit-app.ontwrpn.com`.

## Run locally
```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Build / run with Docker
```bash
docker build -t mouth-vitals-proto .
docker run --rm -p 8080:80 mouth-vitals-proto   # http://localhost:8080  ·  /health → ok
```

## Structure
```
index.html      · layout (header, iPhone mockup, rail, footer)
styles.css      · dark premium theme + CSS iPhone frame
app.js          · screen data, hotspots, navigation
assets/*.png    · the 5 hi-fi screens (402×874)
Dockerfile      · nginx:alpine static image
nginx.conf      · gzip, cache, security headers, /health
```
