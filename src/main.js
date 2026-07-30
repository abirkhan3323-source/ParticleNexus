import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SHAPES } from './shapes.js';

// ── Original-style constants ──
const PARTICLE_COUNT = 20000;
let shapeIndex = 0;

let isTransitioning = false;
let transitionFactor = 0;
let canSwitch = true;

let targetRotX = 0;
let targetRotY = 0;
let pinchScale = 1;
let isHandDetected = false;

// ── Scene (camera matches original: FOV 75, z=7, no OrbitControls) ──
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('container').appendChild(renderer.domElement);

// ── Post-processing (original: bloom strength 1.5) ──
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85
);
bloom.strength = 1.5;
composer.addPass(bloom);

// ── Particle geometry (original: no sprite texture, size 0.015) ──
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);

// Initialize scattered (particles will lerp to target when hand detected)
for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.015,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// ── Shape switching (original setShape logic) ──
function setShape(type) {
  const shape = SHAPES.find(s => s.name === type);
  if (!shape) return;

  const newTargets = shape.fn(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
    targetPositions[i] = newTargets[i];
  }
  document.getElementById('shape-label').textContent = type;
}

// Start with DNA (original default)
setShape('DNA');

// ── Hand tracking (original: MediaPipe Hands, numHands: 2) ──
let handLandmarker;
let lastHandTime = -1;

async function initAI() {
  try {
    const { HandLandmarker, FilesetResolver } = await import(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0'
    );

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
    });

    document.getElementById('status-text').textContent = 'Neural Link: Searching...';
    startWebcam();
  } catch (err) {
    console.warn('Hand tracking unavailable — use keyboard 1-0:', err.message);
    document.getElementById('status-text').textContent = 'Neural Link: Offline (use keys 1-0)';
    // Fallback: enable keyboard-only mode
    isHandDetected = true; // Enable animation loop updates
    pinchScale = 1;
  }
}

async function startWebcam() {
  try {
    const video = document.getElementById('webcam');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.onloadeddata = predict;
  } catch (err) {
    console.warn('Webcam unavailable:', err.message);
    document.getElementById('status-text').textContent = 'Neural Link: No Camera (keys 1-0)';
    isHandDetected = true;
    pinchScale = 1;
  }
}

async function predict() {
  const video = document.getElementById('webcam');
  if (lastHandTime !== video.currentTime && handLandmarker) {
    lastHandTime = video.currentTime;
    const results = handLandmarker.detectForVideo(video, performance.now());

    if (results.landmarks && results.landmarks.length > 0) {
      isHandDetected = true;
      const hand1 = results.landmarks[0];

      // Original: hand position → rotation
      // hand[9] = middle finger MCP. x → Y rotation, y → X rotation
      targetRotY = (hand1[9].x - 0.5) * Math.PI * 2.5;
      targetRotX = (hand1[9].y - 0.5) * Math.PI * 1.5;

      // Original: thumb tip (4) to index tip (8) distance → scale
      const pinchDist = Math.hypot(hand1[4].x - hand1[8].x, hand1[4].y - hand1[8].y);
      pinchScale = THREE.MathUtils.mapLinear(pinchDist, 0.03, 0.2, 4.0, 1.0);
      pinchScale = THREE.MathUtils.clamp(pinchScale, 1.0, 4.0);

      // Original: two-hand clap → vortex transition
      if (results.landmarks.length === 2 && canSwitch) {
        const h1 = results.landmarks[0][9];
        const h2 = results.landmarks[1][9];
        const handGap = Math.hypot(h1.x - h2.x, h1.y - h2.y);

        if (handGap < 0.12) {
          triggerVortexTransition();
        }
      }

      document.getElementById('status-text').textContent =
        `Neural Link: ${results.landmarks.length} Hand(s) | Scale: ${pinchScale.toFixed(1)}x`;
    } else {
      isHandDetected = false;
      document.getElementById('status-text').textContent = 'Neural Link: Searching...';
    }
  }
  requestAnimationFrame(predict);
}

// ── Original: vortex transition (swirl + shrink + white flash + bloom spike) ──
function triggerVortexTransition() {
  if (isTransitioning) return;
  isTransitioning = true;
  canSwitch = false;

  setTimeout(() => {
    shapeIndex = (shapeIndex + 1) % SHAPES.length;
    setShape(SHAPES[shapeIndex].name);
    isTransitioning = false;
    setTimeout(() => { canSwitch = true; }, 1500);
  }, 1000);
}

// ── Keyboard fallback (1-0 for shapes) ──
window.addEventListener('keydown', (e) => {
  const key = parseInt(e.key);
  if (key >= 1 && key <= SHAPES.length) {
    shapeIndex = key - 1;
    setShape(SHAPES[shapeIndex].name);
  }
  if (key === 0) {
    shapeIndex = 9; // 10th shape
    setShape(SHAPES[shapeIndex].name);
  }
  // Ensure animation runs even without hand
  if (!isHandDetected) {
    isHandDetected = true;
    pinchScale = 1;
    targetRotX = 0;
    targetRotY = 0;
  }
});

// ── Animation loop (original: hand-driven rotation + particle lerp) ──
function animate() {
  requestAnimationFrame(animate);

  if (isHandDetected) {
    const pos = geometry.attributes.position.array;
    const cols = geometry.attributes.color.array;
    const time = performance.now() * 0.001;

    // Original: lerp points rotation toward hand position
    points.rotation.y = THREE.MathUtils.lerp(points.rotation.y, targetRotY, 0.07);
    points.rotation.x = THREE.MathUtils.lerp(points.rotation.x, targetRotX, 0.07);

    // Original: transition factor lerps to 0 or 1
    transitionFactor = THREE.MathUtils.lerp(transitionFactor, isTransitioning ? 1 : 0, 0.08);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Original: apply pinch scale to target positions
      let tx = targetPositions[ix] * pinchScale;
      let ty = targetPositions[iy] * pinchScale;
      let tz = targetPositions[iz] * pinchScale;

      // Original: vortex swirl transition
      if (transitionFactor > 0.05) {
        const swirl = transitionFactor * 15;
        const s = 1 - transitionFactor;
        tx = (tx * Math.cos(swirl) - tz * Math.sin(swirl)) * s;
        tz = (tx * Math.sin(swirl) + tz * Math.cos(swirl)) * s;
        ty *= s;
      }

      // Original: lerp toward target at 0.1 rate
      pos[ix] += (tx - pos[ix]) * 0.1;
      pos[iy] += (ty - pos[iy]) * 0.1;
      pos[iz] += (tz - pos[iz]) * 0.1;

      // Original: dynamic colors → white flash during transition
      if (transitionFactor > 0.8) {
        cols[ix] = cols[iy] = cols[iz] = 1.0;
      } else {
        cols[ix] = 0.4 + 0.6 * Math.sin(time + pos[ix] * 0.2);
        cols[iy] = 0.3 + 0.5 * Math.cos(time + pos[iy] * 0.3);
        cols[iz] = 0.9;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    // Original: bloom spikes during transition
    bloom.strength = 1.5 + transitionFactor * 4;
  }

  composer.render();
}

// ── Resize ──
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ── Start ──
initAI();
animate();

console.log('✨ ' + PARTICLE_COUNT.toLocaleString() + ' particles ready');
console.log('🖐  Hand gestures: move hand = rotate | pinch = expand | two-hand clap = next shape');
console.log('⌨️  Keys 1-0 to switch shapes');
