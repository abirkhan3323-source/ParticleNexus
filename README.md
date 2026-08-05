<p align="center">
  <img src="https://img.shields.io/badge/particles-20%2C000-ff00ff?style=for-the-badge&logo=threedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/hand%20tracking-MediaPipe-00ffff?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/rendering-Three.js%20%2B%20Bloom-black?style=for-the-badge&logo=threedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
</p>

<h1 align="center">⚡ ParticleNexus</h1>
<h3 align="center">20,000 Particles. 10 Geometries. Your Hands Are the Controller.</h3>

<p align="center">
  <em>Move your hand to rotate reality. Pinch to expand the universe. Clap to shatter it into something new.</em>
</p>

<br>

---

## 🧠 What Is This?

**ParticleNexus** is a real-time neural particle morphing engine. 20,000 individually-particle-rendered points swarm between 10 distinct 3D geometries — driven entirely by your hand gestures through a webcam. No mouse. No keyboard. Just you.

Every particle is alive. They don't pop — they **swirl through a vortex**, flash white, and bloom into the next shape. The bloom spikes to 5.5x during transitions. It feels like tearing a hole in space.

<p align="center">
  <pre>
  MOVE HAND  →  Rotate the particle field in 3D
  PINCH      →  Hyper-expand geometry (up to 4× scale)
  TWO HANDS  →  Clap to trigger Vortex Transition™
  KEYS 1-0   →  Manual shape override
  </pre>
</p>

---

## 🔮 Shapes

| Key | Geometry | Description |
|-----|----------|-------------|
| `1` | **DNA** | Double helix with cross-strand rungs — 3 turns, 10 units tall |
| `2` | **Firework** | Volumetric bursts — `pow(random, 0.5)` distribution, 4.5 unit radius |
| `3` | **Heart** | Classical parametric — `16sin³(t)`, `13cos(t) − 5cos(2t) − 2cos(3t) − cos(4t)` |
| `4` | **Spring** | 20-coil helical solenoid, 8 units stretched |
| `5` | **Sphere** | Uniform spherical distribution via trigonometric sampling |
| `6` | **Butterfly** | Fay's butterfly curve — `e^(sin θ) − 2cos(4θ) + sin⁵((2θ−π)/24)` |
| `7` | **Saturn** | 40% spherical core + 60% ring disc at 2.4–3.0 unit radius |
| `8` | **Dragon** | 85% sinusoidal body tube + 15% fire-breath particle cone |
| `9` | **Galaxy** | 4-arm logarithmic spiral — `angle = dist × 3.5 + arm offset`, 6 unit radius |
| `0` | **Flower** | 5-petal rose curve — `r = 2.5 × sin(5t)` |

---

## ⚙️ How It Works

### Particle Engine
```
20,000 particles × Float32Array(3) = 240KB position buffers
Each particle lerps toward target at rate 0.1 per frame
Dynamic RGB colors oscillate via sin/cos(time + position)
```

### Hand Tracking (MediaPipe Hands)
```
Landmark 9 (middle finger MCP)  →  X drives Y-rotation, Y drives X-rotation
Landmarks 4–8 (thumb–index)     →  Distance maps to scale [1.0 … 4.0]
Two hands, landmarks [0][9]–[1][9] → Gap < 0.12 triggers vortex
```

### Vortex Transition™
```
1. transitionFactor lerps 0 → 1 over ~1 second
2. Particles swirl around Y-axis: tx = tx·cos(θ) − tz·sin(θ)
3. Particles shrink: all axes × (1 − transitionFactor)
4. Colors saturate to white when transitionFactor > 0.8
5. UnrealBloomPass spikes from 1.5 → 5.5
6. After 1000ms, new shape targets load, reverse lerp begins
```

### Rendering Pipeline
```
Scene → RenderPass → UnrealBloomPass (strength: 1.5, radius: 0.4, threshold: 0.85)
Point size: 0.015, AdditiveBlending, depthWrite: false
```

---

## 🚀 Run Locally

```bash
git clone https://github.com/abirkhan3323-source/ParticleNexus.git
cd ParticleNexus
npm install
npm run dev
```

Opens at `http://localhost:5173`. Allow webcam access when prompted. Hold your hand up and move.

**Requirements:** Node.js 18+, a webcam, a browser with WebGL 2.0 support.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Rendering | Three.js r170 + WebGL 2.0 |
| Post-processing | UnrealBloomPass (neon glow) |
| Hand tracking | MediaPipe Hand Landmarker (float16, GPU delegate) |
| Particle system | Custom BufferGeometry, 60 FPS lerp engine |
| Bundler | Vite 6 (ESM, HMR) |
| Language | Vanilla JavaScript (zero framework) |

---

## 📁 Project Structure

```
ParticleNexus/
├── index.html          # Entry point, webcam preview, UI overlay
├── package.json        # Dependencies (three, vite)
├── vite.config.js      # Vite dev server config
└── src/
    ├── main.js         # Scene, hand tracking, animation loop, vortex logic
    ├── shapes.js       # 10 parametric shape generators
    └── style.css       # Dark theme, webcam preview, neon UI
```

---

<p align="center">
  <sub>Built with Three.js, MediaPipe, and zero frameworks. Particles don't lie.</sub>
</p>

## Status
![GitHub stars](https://img.shields.io/github/stars/abirkhan3323-source/ParticleNexus?style=social)
