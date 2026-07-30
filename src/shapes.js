/**
 * Shape generators matching original Hand-Tracked-Particle-Simulator.
 * Each generates target positions for a count of particles.
 * Order: dna, firework, heart, spring, sphere, butterfly, saturn, dragon, galaxy, flower
 */

const TWO_PI = Math.PI * 2;

export function dna(count) {
  const arr = new Float32Array(count * 3);
  const height = 10;
  const turns = 3;
  const radius = 1.8;

  for (let i = 0; i < count; i++) {
    const p = i / count;
    let x, y, z;

    if (p < 0.4) {
      const pStrand = p / 0.4;
      const angle = pStrand * TWO_PI * turns;
      x = radius * Math.cos(angle);
      y = (pStrand - 0.5) * height;
      z = radius * Math.sin(angle);
    } else if (p < 0.8) {
      const pStrand = (p - 0.4) / 0.4;
      const angle = pStrand * TWO_PI * turns + Math.PI;
      x = radius * Math.cos(angle);
      y = (pStrand - 0.5) * height;
      z = radius * Math.sin(angle);
    } else {
      const pRung = (p - 0.8) / 0.2;
      const rungStep = Math.floor(pRung * (turns * 12)) / (turns * 12);
      const angle = rungStep * TWO_PI * turns;
      const lerpVal = (Math.random() * 2 - 1) * radius;
      x = lerpVal * Math.cos(angle);
      y = (rungStep - 0.5) * height;
      z = lerpVal * Math.sin(angle);
    }
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
  }
  return arr;
}

export function firework(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.5) * 4.5;
    const v = Math.random() * Math.PI;
    const u = Math.random() * TWO_PI;
    arr[i * 3] = r * Math.sin(v) * Math.cos(u);
    arr[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
    arr[i * 3 + 2] = r * Math.cos(v);
  }
  return arr;
}

export function heart(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = i * 0.1;
    arr[i * 3] = 0.18 * (16 * Math.pow(Math.sin(phi), 3));
    arr[i * 3 + 1] = 0.18 * (13 * Math.cos(phi) - 5 * Math.cos(2 * phi) - 2 * Math.cos(3 * phi) - Math.cos(4 * phi));
    arr[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return arr;
}

export function spring(count) {
  const arr = new Float32Array(count * 3);
  const coils = 20;
  const radius = 1.5;
  const height = 8;
  for (let i = 0; i < count; i++) {
    const p = i / count;
    const angle = p * TWO_PI * coils;
    const rJitter = radius + (Math.random() - 0.5) * 0.3;
    arr[i * 3] = rJitter * Math.cos(angle);
    arr[i * 3 + 1] = (p - 0.5) * height;
    arr[i * 3 + 2] = rJitter * Math.sin(angle);
  }
  return arr;
}

export function sphere(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = Math.random() * Math.PI;
    const u = Math.random() * TWO_PI;
    arr[i * 3] = 2 * Math.sin(v) * Math.cos(u);
    arr[i * 3 + 1] = 2 * Math.sin(v) * Math.sin(u);
    arr[i * 3 + 2] = 2 * Math.cos(v);
  }
  return arr;
}

export function butterfly(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = i / count;
    const theta = p * TWO_PI * 4;
    let r = Math.exp(Math.sin(theta)) - 2 * Math.cos(4 * theta)
      + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5);
    r *= 1.2;
    arr[i * 3] = r * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(theta) * 0.8;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return arr;
}

export function saturn(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = i / count;
    const t = p * TWO_PI;
    const u = Math.random() * TWO_PI;
    const v = Math.random() * Math.PI;

    if (i < count * 0.4) {
      arr[i * 3] = 1.2 * Math.sin(v) * Math.cos(u);
      arr[i * 3 + 1] = 1.2 * Math.sin(v) * Math.sin(u);
      arr[i * 3 + 2] = 1.2 * Math.cos(v);
    } else {
      const r = 2.4 + Math.random() * 0.6;
      arr[i * 3] = r * Math.cos(t);
      arr[i * 3 + 1] = r * Math.sin(t) * 0.2;
      arr[i * 3 + 2] = r * Math.sin(t);
    }
  }
  return arr;
}

export function dragon(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = i / count;
    const u = Math.random() * TWO_PI;
    let x, y, z;

    if (p < 0.85) {
      const bodyP = p / 0.85;
      const pathX = (bodyP - 0.5) * 8;
      const pathY = Math.sin(bodyP * Math.PI * 6) * 1.5;
      const pathZ = Math.cos(bodyP * Math.PI * 3) * 1.0;
      const bodyRadius = 0.1 + (bodyP * 0.7) + Math.random() * 0.2;
      x = pathX + bodyRadius * Math.cos(u);
      y = pathY + bodyRadius * Math.sin(u);
      z = pathZ + bodyRadius * (Math.random() - 0.5);
    } else {
      const fireP = (p - 0.85) / 0.15;
      const spread = fireP * 2.5;
      x = 4 + fireP * 5 + Math.random() * 2;
      y = (Math.random() - 0.5) * spread;
      z = (Math.random() - 0.5) * spread;
    }
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
  }
  return arr;
}

export function galaxy(count) {
  const arr = new Float32Array(count * 3);
  const arms = 4;
  const armStrength = 3.5;
  const maxRadius = 6;
  for (let i = 0; i < count; i++) {
    const armIndex = i % arms;
    const dist = Math.pow(Math.random(), 0.5) * maxRadius;
    const angle = (dist * armStrength) + (armIndex * (TWO_PI / arms));
    const spread = (1 / (dist + 1)) * 1.5;
    arr[i * 3] = Math.cos(angle) * dist + (Math.random() - 0.5) * spread;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
    arr[i * 3 + 2] = Math.sin(angle) * dist + (Math.random() - 0.5) * spread;
  }
  return arr;
}

export function flower(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = i / count;
    const t = p * TWO_PI;
    const r = 2.5 * Math.sin(5 * t);
    arr[i * 3] = r * Math.cos(t);
    arr[i * 3 + 1] = r * Math.sin(t);
    arr[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return arr;
}

export const SHAPES = [
  { name: 'DNA', fn: dna },
  { name: 'FIREWORK', fn: firework },
  { name: 'HEART', fn: heart },
  { name: 'SPRING', fn: spring },
  { name: 'SPHERE', fn: sphere },
  { name: 'BUTTERFLY', fn: butterfly },
  { name: 'SATURN', fn: saturn },
  { name: 'DRAGON', fn: dragon },
  { name: 'GALAXY', fn: galaxy },
  { name: 'FLOWER', fn: flower },
];
