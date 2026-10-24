import * as THREE from 'three';
import { canvasTexture, mulberry32 } from './utils.js';
import { currentHour, daylightAt } from './daylight.js';
import { fetchWeather } from './services/weather.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...o });

function mesh(geo, material, [x = 0, y = 0, z = 0] = []) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const box = (w, h, d, material, pos) => mesh(new THREE.BoxGeometry(w, h, d), material, pos);
const cyl = (rt, rb, h, material, pos, seg = 32) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material, pos);

// ---------------------------------------------------------------- TV sehpası
function tvStand() {
  const g = new THREE.Group();
  const wood = std('#6b4a33', { roughness: 0.6 });
  const front = std('#7d5a40', { roughness: 0.6 });
  const brass = std('#c9a45c', { metalness: 0.8, roughness: 0.3 });
  const dark = std('#1d1a17');
  g.add(box(2.6, 0.46, 0.45, wood, [0, 0.29, 0]));
  for (let i = 0; i < 3; i++) {
    const x = -0.86 + i * 0.86;
    g.add(box(0.82, 0.38, 0.012, front, [x, 0.29, 0.226]));
    const knob = cyl(0.014, 0.014, 0.02, brass, [x, 0.36, 0.24], 12);
    knob.rotation.x = Math.PI / 2;
    g.add(knob);
  }
  for (const [x, z] of [[-1.22, -0.18], [1.22, -0.18], [-1.22, 0.18], [1.22, 0.18]]) {
    g.add(cyl(0.022, 0.014, 0.06, dark, [x, 0.03, z], 12));
  }
  g.add(box(1.1, 0.07, 0.1, std('#18181b', { roughness: 0.5 }), [0, 0.555, 0.14]));
  g.position.set(0, 0, -3.2);
  return g;
}

// ---------------------------------------------------------------- Pikap
function recordPlayer() {
  const g = new THREE.Group();
  const body = std('#2d3a3a', { roughness: 0.55 });
  g.add(box(0.9, 0.62, 0.45, body, [0, 0.35, 0]));
  g.add(box(0.8, 0.5, 0.012, std('#223030'), [0, 0.35, 0.226]));
  // Raftaki plak kapakları
  const sleeves = ['#d35400', '#f1c40f', '#2c3e50', '#e8e1d0', '#8e44ad', '#16a085'];
  sleeves.forEach((c, i) => g.add(box(0.012, 0.32, 0.3, std(c), [-0.33 + i * 0.024, 0.28, 0.06])));
  for (const x of [-0.4, 0.4]) for (const z of [-0.18, 0.18]) g.add(cyl(0.018, 0.012, 0.04, std('#1d1a17'), [x, 0.02, z], 10));

  g.add(box(0.52, 0.07, 0.38, std('#c9a77c', { roughness: 0.45 }), [0, 0.695, 0]));
  g.add(cyl(0.165, 0.165, 0.02, std('#9aa0a6', { metalness: 0.8, roughness: 0.3 }), [-0.06, 0.74, 0]));
  const record = new THREE.Group();
  record.position.set(-0.06, 0.753, 0);
  record.add(cyl(0.15, 0.15, 0.006, std('#0c0c0c', { roughness: 0.25 }), [0, 0, 0], 48));
  record.add(cyl(0.05, 0.05, 0.007, std('#c0392b'), [0, 0, 0]));
  record.add(box(0.03, 0.008, 0.008, std('#f5f0e6'), [0.025, 0.001, 0]));
  g.add(record);
  const metal = std('#d0d3d6', { metalness: 0.9, roughness: 0.25 });
  g.add(cyl(0.02, 0.025, 0.04, metal, [0.18, 0.75, -0.12], 16));
  const arm = box(0.01, 0.01, 0.27, metal, [0.14, 0.775, 0.0]);
  arm.rotation.y = 0.3;
  g.add(arm);
  g.position.set(2.05, 0, -3.2);
  return { group: g, record };
}

// ---------------------------------------------------------------- Kitaplık
function bookshelf() {
  const g = new THREE.Group();
  const rand = mulberry32(11);
  const W = 1.0, H = 2.1, D = 0.36;
  const wood = std('#8a6446', { roughness: 0.65 });
  g.add(box(0.04, H, D, wood, [-W / 2 + 0.02, H / 2, 0]));
  g.add(box(0.04, H, D, wood, [W / 2 - 0.02, H / 2, 0]));
  g.add(box(W, 0.04, D, wood, [0, H - 0.02, 0]));
  g.add(box(W, H, 0.02, std('#5f4330'), [0, H / 2, -D / 2 + 0.01]));
  const palette = ['#8e2c2c', '#264653', '#e9c46a', '#2a9d8f', '#e76f51', '#3d405b', '#f2e8cf', '#6d597a', '#386641'].map((c) =>
    std(c, { roughness: 0.8 }),
  );
  for (let i = 0; i < 5; i++) {
    const y = 0.06 + i * 0.5;
    g.add(box(W - 0.08, 0.03, D - 0.02, wood, [0, y, 0]));
    if (i === 4) break;
    let x = -0.44;
    while (x < 0.4) {
      if (rand() < 0.08) {
        x += 0.08;
        continue;
      }
      const w = 0.03 + rand() * 0.04;
      const h = 0.24 + rand() * 0.16;
      if (x + w > 0.44) break;
      const book = box(w, h, 0.2 + rand() * 0.06, palette[Math.floor(rand() * palette.length)], [x + w / 2, y + 0.015 + h / 2, 0.02]);
      g.add(book);
      x += w + 0.004;
    }
  }
  // Rafın üstünde küçük bir küre
  g.add(cyl(0.05, 0.07, 0.03, std('#3a2a1e'), [0.25, H + 0.015, 0], 16));
  g.add(mesh(new THREE.SphereGeometry(0.11, 24, 16), std('#3f7cac', { roughness: 0.5 }), [0.25, H + 0.14, 0]));
  g.position.set(3.32, 0, -3.27);
  return g;
}

// ---------------------------------------------------------------- Çalışma masası + bilgisayar
function codeTexture() {
  const rand = mulberry32(5);
  return canvasTexture(512, 288, (g, w, h) => {
    g.fillStyle = '#0f1420';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#1a2133';
    g.fillRect(0, 0, 70, h);
    const colors = ['#7aa2f7', '#9ece6a', '#bb9af7', '#e0af68', '#f7768e', '#c0caf5'];
    for (let line = 0; line < 22; line++) {
      const y = 14 + line * 12;
      g.fillStyle = '#3b4261';
      g.fillRect(10, y, 14, 5);
      let x = 84 + Math.floor(rand() * 3) * 16;
      const tokens = 1 + Math.floor(rand() * 5);
      for (let t = 0; t < tokens; t++) {
        const len = 20 + rand() * 70;
        g.fillStyle = colors[Math.floor(rand() * colors.length)];
        g.fillRect(x, y, len, 5);
        x += len + 8;
      }
    }
  });
}

function desk() {
  const g = new THREE.Group();
  const top = std('#b48a62', { roughness: 0.5 });
  const metal = std('#2a2a2e', { metalness: 0.6, roughness: 0.4 });
  g.add(box(1.6, 0.05, 0.7, top, [0, 0.75, 0]));
  for (const x of [-0.76, 0.76]) for (const z of [-0.31, 0.31]) g.add(box(0.05, 0.725, 0.05, metal, [x, 0.3625, z]));
  g.add(box(0.26, 0.015, 0.18, metal, [0, 0.783, -0.2]));
  g.add(box(0.05, 0.3, 0.04, metal, [0, 0.93, -0.22]));
  g.add(box(0.94, 0.55, 0.035, std('#141417', { roughness: 0.4 }), [0, 1.13, -0.2]));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.495), new THREE.MeshBasicMaterial({ map: codeTexture() }));
  screen.position.set(0, 1.13, -0.181);
  g.add(screen);
  g.add(box(0.44, 0.02, 0.14, std('#d9d6cf'), [0, 0.785, 0.06]));
  g.add(box(0.06, 0.02, 0.1, std('#d9d6cf'), [0.33, 0.785, 0.08]));
  const mugMat = std('#e2725b');
  g.add(cyl(0.04, 0.035, 0.1, mugMat, [-0.55, 0.825, -0.05], 20));
  const handle = mesh(new THREE.TorusGeometry(0.025, 0.007, 8, 16), mugMat, [-0.595, 0.83, -0.05]);
  handle.rotation.y = Math.PI / 2;
  g.add(handle);

  const chair = new THREE.Group();
  const fabric = std('#2b2b30', { roughness: 0.9 });
  chair.add(box(0.5, 0.08, 0.48, fabric, [0, 0.48, 0]));
  chair.add(box(0.5, 0.55, 0.06, fabric, [0, 0.82, 0.24]));
  chair.add(cyl(0.025, 0.025, 0.4, metal, [0, 0.24, 0], 12));
  for (let i = 0; i < 5; i++) {
    const leg = box(0.32, 0.03, 0.04, metal, [0, 0.04, 0]);
    leg.rotation.y = (i / 5) * Math.PI * 2;
    leg.geometry.translate(0.16, 0, 0);
    chair.add(leg);
  }
  chair.position.set(0.1, 0, 0.62);
  chair.rotation.y = 0.25;
  g.add(chair);

  g.position.set(3.62, 0, -0.4);
  g.rotation.y = -Math.PI / 2;
  return g;
}

// ---------------------------------------------------------------- Pencere
const skyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const skyFragment = /* glsl */ `
  uniform vec3 top;
  uniform vec3 bottom;
  uniform float stars;
  uniform float time;
  uniform float cloud;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  void main() {
    vec3 col = mix(bottom, top, smoothstep(0.0, 1.0, vUv.y));
    vec2 sc = floor(vUv * vec2(150.0, 130.0));
    float star = step(0.995, hash(sc)) * stars * (0.55 + 0.45 * sin(time * 2.0 + hash(sc) * 40.0));
    col += vec3(star);
    float n = noise(vUv * vec2(4.0, 3.0) + vec2(time * 0.02, 0.0)) * 0.6
            + noise(vUv * vec2(9.0, 6.0) + vec2(time * 0.035, 0.0)) * 0.4;
    float cl = smoothstep(0.62 - cloud * 0.45, 0.9, n) * (0.35 + cloud * 0.65);
    float bright = max(max(top.r, top.g), top.b);
    col = mix(col, vec3(0.92, 0.92, 0.95) * (0.25 + 0.9 * bright), cl * 0.85);
    // Uzaktaki şehir silüeti ve gece yanan pencereler
    float bx = floor(vUv.x * 22.0);
    float bh = 0.08 + 0.17 * hash(vec2(bx, 1.0));
    if (vUv.y < bh) {
      col = bottom * 0.18;
      vec2 wc = floor(vUv * vec2(110.0, 70.0));
      float lit = step(0.72, hash(wc)) * step(0.45, fract(vUv.x * 110.0)) * step(0.4, fract(vUv.y * 70.0));
      col += vec3(1.0, 0.78, 0.42) * lit * (0.15 + stars * 0.8);
    }
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function windowObj() {
  const g = new THREE.Group();
  const W = 1.5, H = 1.3;
  const sky = new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color() },
      bottom: { value: new THREE.Color() },
      stars: { value: 0 },
      time: { value: 0 },
      cloud: { value: 0.2 },
    },
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
  });
  const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), sky);
  g.add(skyPlane);

  const frame = std('#f3ede2', { roughness: 0.5 });
  g.add(box(W + 0.16, 0.08, 0.12, frame, [0, H / 2 + 0.04, 0.05]));
  g.add(box(W + 0.16, 0.08, 0.12, frame, [0, -H / 2 - 0.04, 0.05]));
  g.add(box(0.08, H, 0.12, frame, [-W / 2 - 0.04, 0, 0.05]));
  g.add(box(0.08, H, 0.12, frame, [W / 2 + 0.04, 0, 0.05]));
  g.add(box(0.04, H, 0.05, frame, [0, 0, 0.03]));
  g.add(box(W, 0.04, 0.05, frame, [0, 0.18, 0.03]));
  g.add(box(W + 0.34, 0.04, 0.24, frame, [0, -H / 2 - 0.1, 0.1]));

  const curtainMat = std('#b85c38', { roughness: 1, side: THREE.DoubleSide });
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const fold = cyl(0.045, 0.05, H + 0.5, curtainMat, [side * (W / 2 + 0.12 + i * 0.065), 0.0, 0.16 + (i % 2) * 0.03], 10);
      g.add(fold);
    }
  }
  const rod = cyl(0.015, 0.015, W + 1.0, std('#2b2420', { metalness: 0.5 }), [0, H / 2 + 0.26, 0.17], 10);
  rod.rotation.z = Math.PI / 2;
  g.add(rod);

  g.position.set(-3.985, 1.62, -1.0);
  g.rotation.y = Math.PI / 2;

  fetchWeather()
    .then((d) => (sky.uniforms.cloud.value = (d.current?.cloud_cover ?? 20) / 100))
    .catch(() => {});

  return {
    group: g,
    update(t) {
      const dl = daylightAt(currentHour());
      sky.uniforms.top.value.copy(dl.top);
      sky.uniforms.bottom.value.copy(dl.bottom);
      sky.uniforms.stars.value = dl.stars;
      sky.uniforms.time.value = t;
    },
  };
}

// ---------------------------------------------------------------- Duvar saati
function wallClock() {
  const g = new THREE.Group();
  const rim = cyl(0.25, 0.25, 0.05, std('#2b2420', { roughness: 0.4 }), [0, 0, 0], 48);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  const face = cyl(0.225, 0.225, 0.052, std('#f4efe4', { roughness: 0.6 }), [0, 0, 0], 48);
  face.rotation.x = Math.PI / 2;
  g.add(face);
  const tickMat = std('#2b2420');
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tick = box(i % 3 === 0 ? 0.016 : 0.008, 0.035, 0.004, tickMat, [Math.sin(a) * 0.185, Math.cos(a) * 0.185, 0.028]);
    tick.rotation.z = -a;
    g.add(tick);
  }
  const hand = (w, len, color, z) => {
    const pivot = new THREE.Group();
    pivot.position.z = z;
    const h = box(w, len, 0.004, std(color), [0, len / 2 - 0.02, 0]);
    pivot.add(h);
    g.add(pivot);
    return pivot;
  };
  const hours = hand(0.016, 0.12, '#2b2420', 0.03);
  const minutes = hand(0.01, 0.17, '#2b2420', 0.034);
  const seconds = hand(0.004, 0.19, '#c0392b', 0.038);
  g.add(cyl(0.012, 0.012, 0.012, std('#c0392b'), [0, 0, 0.04], 12).rotateX(Math.PI / 2));
  g.position.set(0, 2.38, -3.47);
  return {
    group: g,
    update() {
      const now = new Date();
      const s = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;
      seconds.rotation.z = -(s / 60) * Math.PI * 2;
      minutes.rotation.z = -(m / 60) * Math.PI * 2;
      hours.rotation.z = -(h / 12) * Math.PI * 2;
    },
  };
}

// ---------------------------------------------------------------- Tablo
function posterTexture() {
  return canvasTexture(600, 800, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#1b1f3b');
    sky.addColorStop(0.55, '#c2554a');
    sky.addColorStop(1, '#f2a65a');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd27a';
    g.beginPath();
    g.arc(w / 2, h * 0.5, 170, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#c2554a';
    for (let i = 0; i < 6; i++) g.fillRect(0, h * 0.5 + 20 + i * 26, w, 6 + i * 2);
    g.fillStyle = '#1b1f3b';
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, h * 0.7);
    g.quadraticCurveTo(w * 0.3, h * 0.6, w * 0.55, h * 0.72);
    g.quadraticCurveTo(w * 0.8, h * 0.62, w, h * 0.68);
    g.lineTo(w, h);
    g.fill();
    g.fillStyle = '#f4efe4';
    g.font = '600 34px "Space Grotesk", sans-serif';
    g.textAlign = 'center';
    g.fillText('benginsroom', w / 2, h - 50);
  });
}

function poster() {
  const g = new THREE.Group();
  g.add(box(0.95, 1.25, 0.03, std('#1c1c1c', { roughness: 0.4 }), [0, 0, 0]));
  g.add(mesh(new THREE.PlaneGeometry(0.85, 1.15), std('#f1ebe0'), [0, 0, 0.016]));
  g.add(mesh(new THREE.PlaneGeometry(0.72, 0.96), std('#ffffff', { map: posterTexture(), roughness: 0.9 }), [0, 0, 0.017]));
  g.position.set(-2.1, 1.6, -3.48);
  return g;
}

// ---------------------------------------------------------------- Ayaklı lamba
function floorLamp() {
  const g = new THREE.Group();
  const brass = std('#b8924a', { metalness: 0.8, roughness: 0.35 });
  g.add(cyl(0.16, 0.18, 0.03, brass, [0, 0.015, 0]));
  g.add(cyl(0.012, 0.012, 1.5, brass, [0, 0.78, 0], 12));
  const shadeMat = std('#efe2c4', { side: THREE.DoubleSide, emissive: '#ffb36b', emissiveIntensity: 0.6, roughness: 1 });
  const shade = mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.32, 32, 1, true), shadeMat, [0, 1.6, 0]);
  shade.castShadow = false;
  g.add(shade);
  const bulbMat = new THREE.MeshStandardMaterial({ color: '#fff4e0', emissive: '#ffcf8a', emissiveIntensity: 2 });
  const bulb = mesh(new THREE.SphereGeometry(0.045, 16, 12), bulbMat, [0, 1.52, 0]);
  bulb.castShadow = false;
  g.add(bulb);
  const light = new THREE.PointLight('#ffb36b', 5, 0, 2);
  light.position.set(0, 1.45, 0);
  g.add(light);
  g.position.set(-3.4, 0, -3.05);

  let on = true;
  let level = 1;
  return {
    group: g,
    toggle() {
      on = !on;
    },
    get on() {
      return on;
    },
    update(dt) {
      level += ((on ? 1 : 0) - level) * Math.min(1, dt * 8);
      light.intensity = 5 * level;
      shadeMat.emissiveIntensity = 0.6 * level;
      bulbMat.emissiveIntensity = 2 * level;
    },
  };
}

// ---------------------------------------------------------------- Saksı bitkisi
function plant() {
  const g = new THREE.Group();
  const rand = mulberry32(21);
  g.add(cyl(0.17, 0.13, 0.34, std('#c46a43', { roughness: 0.9 }), [0, 0.17, 0], 24));
  g.add(cyl(0.16, 0.16, 0.02, std('#3b2a20'), [0, 0.335, 0], 24));
  const leaves = new THREE.Group();
  leaves.position.y = 0.34;
  const leafMats = [std('#2f6b3a', { roughness: 0.6 }), std('#3f8a4a', { roughness: 0.6 }), std('#24552e', { roughness: 0.6 })];
  for (let i = 0; i < 13; i++) {
    const yaw = new THREE.Group();
    yaw.rotation.y = (i / 13) * Math.PI * 2 + rand() * 0.4;
    const tilt = new THREE.Group();
    tilt.rotation.x = 0.25 + rand() * 0.7;
    const len = 0.22 + rand() * 0.22;
    const leaf = mesh(new THREE.SphereGeometry(1, 12, 8), leafMats[i % 3], [0, len, 0]);
    leaf.scale.set(0.075, len, 0.018);
    tilt.add(leaf);
    yaw.add(tilt);
    leaves.add(yaw);
  }
  g.add(leaves);
  g.position.set(-3.45, 0, 0.45);

  let wiggle = 0;
  return {
    group: g,
    poke() {
      wiggle = 1;
    },
    update(dt, t) {
      wiggle *= Math.exp(-dt * 2.5);
      leaves.rotation.z = Math.sin(t * 0.7) * 0.02 + Math.sin(t * 16) * 0.09 * wiggle;
      leaves.rotation.x = Math.cos(t * 0.5) * 0.015 + Math.cos(t * 13) * 0.06 * wiggle;
    },
  };
}

// ---------------------------------------------------------------- Sehpa, oyun kolu, telefon
function coffeeTable() {
  const g = new THREE.Group();
  const wood = std('#5a3b28', { roughness: 0.5 });
  g.add(box(1.3, 0.05, 0.7, wood, [0, 0.42, 0]));
  g.add(box(1.18, 0.02, 0.58, wood, [0, 0.13, 0]));
  for (const x of [-0.58, 0.58]) for (const z of [-0.28, 0.28]) g.add(cyl(0.025, 0.018, 0.4, wood, [x, 0.2, z], 12));
  g.add(box(0.32, 0.03, 0.24, std('#e9c46a'), [0.1, 0.155, 0.02]));
  g.add(box(0.3, 0.03, 0.22, std('#264653'), [0.12, 0.185, 0.0]));
  g.add(cyl(0.09, 0.06, 0.05, std('#d9d0c1', { roughness: 0.4 }), [0.05, 0.47, -0.18], 24));
  g.position.set(0, 0, -1.55);
  return g;
}

function controller() {
  const g = new THREE.Group();
  const shell = std('#2c2f3a', { roughness: 0.45 });
  const body = mesh(new THREE.CapsuleGeometry(0.03, 0.1, 6, 16), shell);
  body.rotation.z = Math.PI / 2;
  body.scale.set(0.5, 1, 1);
  g.add(body);
  for (const x of [-0.07, 0.07]) {
    const grip = mesh(new THREE.SphereGeometry(0.034, 16, 12), shell, [x, -0.004, 0.03]);
    grip.scale.set(1, 0.55, 1.3);
    g.add(grip);
  }
  const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f'];
  [[0.06, -0.012], [0.072, 0], [0.06, 0.012], [0.048, 0]].forEach(([x, z], i) => g.add(cyl(0.006, 0.006, 0.006, std(colors[i]), [x, 0.016, z], 10)));
  const pad = std('#15161b');
  g.add(box(0.03, 0.006, 0.009, pad, [-0.06, 0.016, 0]));
  g.add(box(0.009, 0.006, 0.03, pad, [-0.06, 0.016, 0]));
  g.position.set(-0.3, 0.462, -1.5);
  g.rotation.y = 0.35;
  return g;
}

function phone() {
  const g = new THREE.Group();
  g.add(box(0.08, 0.012, 0.16, std('#111114', { roughness: 0.3, metalness: 0.4 })));
  const tex = canvasTexture(144, 300, (c, w, h) => {
    const grad = c.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#5f2c82');
    grad.addColorStop(1, '#49a09d');
    c.fillStyle = grad;
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.9)';
    c.font = '600 34px sans-serif';
    c.textAlign = 'center';
    c.fillText('21:47', w / 2, 70);
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.fillRect(14, 120, w - 28, 44);
    c.fillStyle = '#333';
    c.font = '13px sans-serif';
    c.fillText('1 yeni mesaj', w / 2, 147);
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.072, 0.15), new THREE.MeshBasicMaterial({ map: tex }));
  screen.rotation.x = -Math.PI / 2;
  screen.position.y = 0.0065;
  g.add(screen);
  g.position.set(0.35, 0.451, -1.45);
  g.rotation.y = -0.45;
  return g;
}

// ---------------------------------------------------------------- Dekor
function pendantLamp() {
  const g = new THREE.Group();
  const black = std('#1d1d1f', { metalness: 0.4, roughness: 0.5, side: THREE.DoubleSide });
  g.add(cyl(0.004, 0.004, 0.55, black, [0, 2.925, 0], 6));
  const shade = mesh(new THREE.CylinderGeometry(0.05, 0.28, 0.22, 32, 1, true), black, [0, 2.55, 0]);
  shade.castShadow = false;
  g.add(shade);
  const bulb = mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshStandardMaterial({ emissive: '#ffd9a8', emissiveIntensity: 3 }), [0, 2.48, 0]);
  bulb.castShadow = false;
  g.add(bulb);
  g.position.set(0, 0, -0.2);
  return g;
}

function armchair() {
  const g = new THREE.Group();
  const fabric = std('#3f5e6b', { roughness: 0.95 });
  const wood = std('#5a3b28');
  g.add(box(0.8, 0.16, 0.75, fabric, [0, 0.36, 0]));
  g.add(box(0.8, 0.6, 0.14, fabric, [0, 0.68, -0.33]));
  g.add(box(0.12, 0.28, 0.7, fabric, [-0.4, 0.52, 0]));
  g.add(box(0.12, 0.28, 0.7, fabric, [0.4, 0.52, 0]));
  for (const x of [-0.34, 0.34]) for (const z of [-0.3, 0.3]) g.add(cyl(0.022, 0.015, 0.28, wood, [x, 0.14, z], 10));
  g.position.set(-2.3, 0, 0.9);
  g.rotation.y = Math.atan2(2.3, -4.0);
  return g;
}

function sofa() {
  const g = new THREE.Group();
  const fabric = std('#3f5e6b', { roughness: 0.95 });
  const cushion = std('#4a6d7b', { roughness: 0.95 });
  const wood = std('#5a3b28');
  g.add(box(2.0, 0.22, 0.9, fabric, [0, 0.3, 0]));
  g.add(box(2.0, 0.56, 0.18, fabric, [0, 0.69, -0.36]));
  for (const x of [-1.0, 1.0]) g.add(box(0.16, 0.32, 0.9, fabric, [x, 0.54, 0]));
  for (const x of [-0.46, 0.46]) {
    g.add(box(0.9, 0.12, 0.7, cushion, [x, 0.47, 0.08]));
    g.add(box(0.88, 0.4, 0.12, cushion, [x, 0.72, -0.22]));
  }
  for (const x of [-0.92, 0.92]) for (const z of [-0.38, 0.38]) g.add(cyl(0.025, 0.018, 0.19, wood, [x, 0.095, z], 10));
  return g;
}

// ---------------------------------------------------------------- Kurulum
export function buildFurniture(scene) {
  const player = recordPlayer();
  const win = windowObj();
  const clock = wallClock();
  const lamp = floorLamp();
  const pot = plant();

  // Ortadaki kanepe TV'ye bakar; sehpadaki oyun kolu ve telefonu genel görünümde örtmesin diye geride durur.
  const couch = sofa();
  couch.position.set(0, 0, 0.6);
  couch.rotation.y = Math.PI;

  const decor = [tvStand(), coffeeTable(), pendantLamp(), armchair(), couch];
  decor.forEach((d) => scene.add(d));

  // Her eşya bir tetikleyici: channel → TV'de açılır, action → odada bir şey olur.
  const items = [
    { id: 'bookshelf', label: 'Kitaplık', hint: 'Hakkımda', channel: 'about', object: bookshelf() },
    { id: 'desk', label: 'Bilgisayar', hint: 'Projeler', channel: 'projects', object: desk() },
    { id: 'record', label: 'Pikap', hint: 'Müzik', channel: 'music', object: player.group },
    { id: 'window', label: 'Pencere', hint: 'Hava durumu', channel: 'weather', object: win.group },
    { id: 'clock', label: 'Duvar saati', hint: 'Saat', channel: 'time', object: clock.group },
    { id: 'controller', label: 'Oyun kolu', hint: 'Oyna', channel: 'game', object: controller() },
    { id: 'poster', label: 'Tablo', hint: 'Galeri', channel: 'gallery', object: poster() },
    { id: 'phone', label: 'Telefon', hint: 'İletişim', channel: 'contact', object: phone() },
    { id: 'lamp', label: 'Lamba', hint: 'Aç / kapat', action: () => lamp.toggle(), object: lamp.group },
    { id: 'plant', label: 'Bitki', hint: 'Dokun', action: () => pot.poke(), object: pot.group },
  ];
  items.forEach((i) => scene.add(i.object));

  return {
    items,
    update(dt, t, state) {
      if (state.channel === 'music') player.record.rotation.y -= dt * 3.5;
      win.update(t);
      clock.update();
      lamp.update(dt);
      pot.update(dt, t);
    },
  };
}
