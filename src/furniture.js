import * as THREE from 'three';
import { canvasTexture, mulberry32 } from './utils.js';
import { currentHour, daylightAt } from './daylight.js';
import { fetchWeather, precipitation } from './services/weather.js';
import { config } from './config.js';

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

// --- TV sehpası
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

// --- Plak çalar
function recordPlayer() {
  const g = new THREE.Group();
  const body = std('#2d3a3a', { roughness: 0.55 });
  g.add(box(0.9, 0.62, 0.45, body, [0, 0.35, 0]));
  g.add(box(0.8, 0.5, 0.012, std('#223030'), [0, 0.35, 0.226]));
  // raftaki plaklar
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

  // tek dokunuş çal/durdur (kaldığı yerden devam), çift dokunuş sonraki parça
  // parça bitince sıradakine geçiyor, liste bitince başa dönüyor
  const audio = new Audio();
  let track = -1;
  let lastTap = 0;
  const play = (i) => {
    track = i % config.music.length;
    audio.src = config.music[track].src;
    audio.play().catch(() => {});
  };
  audio.addEventListener('ended', () => play(track + 1));

  return {
    group: g,
    toggle() {
      // ilk dokunuşu bekletmiyorum, 350 ms içinde ikincisi gelirse sonraki parça
      const now = performance.now();
      const double = now - lastTap < 350;
      lastTap = double ? 0 : now;
      if (double) play(track + 1);
      else if (track < 0) play(0);
      else if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    },
    get hint() {
      if (track < 0) return 'Müzik çal';
      const { title, artist } = config.music[track];
      return `♪ ${title} · ${artist} — dokun: ${audio.paused ? 'devam et' : 'durdur'} · çift dokun: sonraki`;
    },
    update(dt) {
      if (!audio.paused) record.rotation.y -= dt * 3.5;
    },
  };
}

// --- Kitaplık
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
  // rafın üstüne küçük bir küre
  g.add(cyl(0.05, 0.07, 0.03, std('#3a2a1e'), [0.25, H + 0.015, 0], 16));
  g.add(mesh(new THREE.SphereGeometry(0.11, 24, 16), std('#3f7cac', { roughness: 0.5 }), [0.25, H + 0.14, 0]));
  g.position.set(3.32, 0, -3.27);
  return g;
}

// --- Çalışma masası + bilgisayar
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

// --- Pencere
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
  uniform float rain;
  uniform float snow;
  uniform vec2 sunPos;
  uniform vec3 sunCol;
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
    // gündüz güneş, gece ay. bulut arttıkça soluyor
    float sd = length((vUv - sunPos) * vec2(1.15, 1.0));
    col += sunCol * (smoothstep(0.065, 0.055, sd) + 0.3 * smoothstep(0.3, 0.0, sd)) * (1.0 - 0.85 * cloud);
    float n = noise(vUv * vec2(4.0, 3.0) + vec2(time * 0.02, 0.0)) * 0.6
            + noise(vUv * vec2(9.0, 6.0) + vec2(time * 0.035, 0.0)) * 0.4;
    float cl = smoothstep(0.62 - cloud * 0.45, 0.9, n) * (0.35 + cloud * 0.65);
    float bright = max(max(top.r, top.g), top.b);
    col = mix(col, vec3(0.92, 0.92, 0.95) * (0.25 + 0.9 * bright), cl * 0.85);
    // uzakta şehir silüeti, gece pencereler yanıyor
    float bx = floor(vUv.x * 22.0);
    float bh = 0.08 + 0.17 * hash(vec2(bx, 1.0));
    if (vUv.y < bh) {
      col = bottom * 0.18;
      vec2 wc = floor(vUv * vec2(110.0, 70.0));
      float lit = step(0.72, hash(wc)) * step(0.45, fract(vUv.x * 110.0)) * step(0.4, fract(vUv.y * 70.0));
      col += vec3(1.0, 0.78, 0.42) * lit * (0.15 + stars * 0.8);
    }
    // yağmur, hafif eğik çizgiler
    vec2 rp = vUv * vec2(70.0, 5.0) + vec2(vUv.y * 2.0, time * 6.0);
    vec2 rf = fract(rp);
    float drop = step(0.55, hash(floor(rp))) * step(abs(rf.x - 0.5), 0.05) * step(0.55, rf.y);
    col = mix(col, vec3(0.78, 0.84, 0.95), drop * rain * 0.55);
    // kar, sallanarak düşüyor
    vec2 sp = vUv * vec2(18.0, 14.0) + vec2(0.0, time * 0.5);
    sp.x += sin(time * 0.8 + floor(sp.y)) * 0.3;
    float flake = step(0.5, hash(floor(sp) + 7.0)) * smoothstep(0.13, 0.06, length(fract(sp) - 0.5));
    col = mix(col, vec3(1.0), flake * snow);
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
      rain: { value: 0 },
      snow: { value: 0 },
      sunPos: { value: new THREE.Vector2() },
      sunCol: { value: new THREE.Color() },
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

  const rod = cyl(0.015, 0.015, W + 1.0, std('#2b2420', { metalness: 0.5 }), [0, H / 2 + 0.26, 0.17], 10);
  rod.rotation.z = Math.PI / 2;
  g.add(rod);

  g.position.set(-3.985, 1.62, -1.0);
  g.rotation.y = Math.PI / 2;

  // perde ayrı eşya. kapanırken kıvrımlar ortaya kayıp genişliyor, camı kapatıyor
  const curtain = new THREE.Group();
  curtain.position.copy(g.position);
  curtain.rotation.copy(g.rotation);
  const curtainMat = std('#b85c38', { roughness: 1, side: THREE.DoubleSide });
  const folds = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const fold = cyl(0.045, 0.05, H + 0.5, curtainMat, [0, 0, 0.16 + (i % 2) * 0.03], 10);
      fold.userData.open = side * (W / 2 + 0.12 + i * 0.065);
      fold.userData.closed = side * (0.04 + (i * (W / 2 + 0.08)) / 4);
      folds.push(fold);
      curtain.add(fold);
    }
  }
  let closed = false;
  let shade = 0;

  // yağmur sesi = filtrelenmiş beyaz gürültü (Web Audio), dosyaya gerek yok
  let rainLevel = 0;
  let wantSound = false;
  let rainGain = null;
  const startRain = () => {
    if (!wantSound || !rainLevel || rainGain) return;
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    src.connect(filter).connect(rainGain).connect(ctx.destination);
    src.start();
  };

  fetchWeather()
    .then((d) => {
      const c = d.current ?? {};
      const { rain, snow } = precipitation(c.weather_code);
      sky.uniforms.cloud.value = (c.cloud_cover ?? 20) / 100;
      sky.uniforms.rain.value = rain;
      sky.uniforms.snow.value = snow;
      rainLevel = rain;
      startRain();
    })
    .catch(() => {});

  const moonCol = new THREE.Color('#cfd8f5');

  return {
    group: g,
    curtain,
    toggleCurtain() {
      closed = !closed;
    },
    get shade() {
      return shade;
    },
    // tarayıcı tıklama olmadan ses açtırmıyor, o yüzden "Odaya gir"de çağırıyorum
    startSound() {
      wantSound = true;
      startRain();
    },
    update(t, dt) {
      shade += ((closed ? 1 : 0) - shade) * Math.min(1, dt * 3);
      for (const f of folds) {
        f.position.x = f.userData.open + (f.userData.closed - f.userData.open) * shade;
        f.scale.x = 1 + shade * 1.6;
      }
      // perde kapalıysa yağmur sesini kıs
      if (rainGain) rainGain.gain.value = 0.05 * rainLevel * (1 - shade * 0.6);
      const dl = daylightAt(currentHour());
      sky.uniforms.top.value.copy(dl.top);
      sky.uniforms.bottom.value.copy(dl.bottom);
      sky.uniforms.stars.value = dl.stars;
      sky.uniforms.time.value = t;
      // güneş 06-20, ay 20-06 arası soldan sağa yay çiziyor
      const h = currentHour();
      const day = h >= 6 && h < 20;
      const k = day ? (h - 6) / 14 : ((h + 4) % 24) / 10;
      sky.uniforms.sunPos.value.set(0.12 + 0.76 * k, 0.15 + 0.7 * Math.sin(Math.PI * k));
      sky.uniforms.sunCol.value.copy(day ? dl.sun : moonCol);
    },
  };
}

// --- Duvar saati
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

// --- Tablo
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

// --- Ayaklı lamba
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

  return lampSwitch(g, (level) => {
    light.intensity = 5 * level;
    shadeMat.emissiveIntensity = 0.6 * level;
    bulbMat.emissiveIntensity = 2 * level;
  });
}

// lamba hava kararınca kendi yanıyor, aydınlanınca sönüyor. arada ziyaretçi ne seçtiyse o
function lampSwitch(group, apply) {
  let on = false;
  let level = 0;
  let wasDark = null;
  return {
    group,
    toggle() {
      on = !on;
    },
    update(dt, dark) {
      if (dark !== wasDark) on = wasDark = dark;
      level += ((on ? 1 : 0) - level) * Math.min(1, dt * 8);
      apply(level);
    },
  };
}

// --- Saksı bitkisi
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

// --- Sehpa, oyun kolu, telefon
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

// --- Dekor
function pendantLamp() {
  const g = new THREE.Group();
  const black = std('#1d1d1f', { metalness: 0.4, roughness: 0.5, side: THREE.DoubleSide });
  g.add(cyl(0.004, 0.004, 0.55, black, [0, 2.925, 0], 6));
  const shade = mesh(new THREE.CylinderGeometry(0.05, 0.28, 0.22, 32, 1, true), black, [0, 2.55, 0]);
  shade.castShadow = false;
  g.add(shade);
  const bulbMat = new THREE.MeshStandardMaterial({ emissive: '#ffd9a8', emissiveIntensity: 3 });
  const bulb = mesh(new THREE.SphereGeometry(0.05, 16, 12), bulbMat, [0, 2.48, 0]);
  bulb.castShadow = false;
  g.add(bulb);
  const light = new THREE.PointLight('#ffd2a1', 9, 0, 2);
  light.position.set(0, 2.4, 0);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.bias = -0.002;
  light.shadow.radius = 4;
  g.add(light);
  g.position.set(0, 0, -0.2);

  return lampSwitch(g, (level) => {
    light.intensity = 9 * level;
    bulbMat.emissiveIntensity = 3 * level;
  });
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

// --- Kedi
// tekir kedi. mobilyalara çarpmadan geziyor, arada oturup yalanıyor, güneşte uyuyor,
// uyanınca geriniyor. dokununca oturup sana bakıyor. duruşlar eklem açısı (radyan), aralarında yumuşak geçiş var
// açı + ise bacak öne, kuyruk arkaya, baş yukarı
// f/r = ön/arka bacak, U/L = üst/alt parça
const CAT_POSES = {
  stand: { hip: 0.17, pitch: 0, fU: 0.05, fL: -0.05, rU: 0.35, rL: -0.7, head: 0.05, headY: 0, eyes: 1, tailBase: 1.15, tailUp: -0.16, tailCurl: -0.7, tailSide: 0 },
  sit: { hip: 0.055, pitch: 0.55, fU: -0.55, fL: 0, rU: 0.9, rL: -3.0, head: -0.4, headY: 0, eyes: 1, tailBase: 1.3, tailUp: 0.02, tailCurl: 0, tailSide: 0.3 },
  sleep: { hip: 0.05, pitch: 0, fU: 1.5, fL: -3.0, rU: 1.45, rL: -3.0, head: -0.15, headY: -0.035, eyes: 0.08, tailBase: 1.6, tailUp: 0, tailCurl: 0, tailSide: 0.5 },
  stretch: { hip: 0.15, pitch: -0.3, fU: 1.1, fL: 0.2, rU: 0.2, rL: -0.5, head: 0.35, headY: 0, eyes: 0.5, tailBase: 0.4, tailUp: -0.05, tailCurl: 0, tailSide: 0 },
};
CAT_POSES.groom = CAT_POSES.look = CAT_POSES.sit;
const CAT_ROUTE = [
  { x: -2.0, z: -1.1, act: 'sleep', time: 14 }, // güneşin vurduğu yer
  { x: -1.7, z: -2.45 },
  { x: 1.6, z: -2.45, act: 'groom', time: 5 },
  { x: 2.4, z: -1.4, act: 'sit', time: 3 },
  { x: 1.6, z: -0.15 },
  { x: -1.6, z: -0.15 },
];
const VIEWER = { x: 0, z: 3.35 }; // genel görünüm kamerası, dokununca kedi buraya bakıyor
const STRIDE = 0.24; // bir adım döngüsündeki yol. adımı yola bağladım ki patiler kaymasın

// tekir deseni. gövde kutupları x ekseninde bir küre: u=0 sırt, u=0.5 karın, canvas üstü göğüs, altı kalça
// çizgiler sırttan yanlara iniyor, karına doğru inceliyor. sırtın ortasında koyu bir şerit var
const CAT_ORANGE = '#c98545';
function tabbyTexture() {
  const rand = mulberry32(5);
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = CAT_ORANGE;
    g.fillRect(0, 0, w, h);
    const back = (x) => 0.5 + 0.5 * Math.cos((2 * Math.PI * x) / w); // sırtta 1, karında 0
    g.filter = 'blur(2px)';
    g.fillStyle = 'rgba(112, 56, 20, 0.62)';
    for (let i = 0; i < 13; i++) {
      const y = h * (0.12 + (i + rand() * 0.4) * 0.066);
      const thick = 4 + rand() * 4;
      const wob = rand() * 6;
      for (let x = 0; x < w; x += 3) {
        const k = Math.max(0, back(x) - 0.28) / 0.72;
        if (k > 0) g.fillRect(x, y + Math.sin(x * 0.035 + wob) * 6 + Math.sin(x * 0.11 + i) * 2, 3, thick * k);
      }
    }
    // sırt şeridi
    g.fillStyle = 'rgba(100, 48, 16, 0.55)';
    g.fillRect(0, h * 0.1, 14, h * 0.85);
    g.fillRect(w - 14, h * 0.1, 14, h * 0.85);
    // karın ve göğüs krem
    const belly = g.createLinearGradient(0, 0, w, 0);
    belly.addColorStop(0.3, 'rgba(242, 222, 192, 0)');
    belly.addColorStop(0.42, 'rgba(242, 222, 192, 0.85)');
    belly.addColorStop(0.58, 'rgba(242, 222, 192, 0.85)');
    belly.addColorStop(0.7, 'rgba(242, 222, 192, 0)');
    g.fillStyle = belly;
    g.fillRect(0, 0, w, h);
    // tüy dokusu: kısa açık/koyu kıllar
    g.filter = 'none';
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = rand() < 0.5 ? 'rgba(255, 230, 190, 0.12)' : 'rgba(70, 35, 10, 0.12)';
      g.fillRect(rand() * w, rand() * h, 1, 3 + rand() * 4);
    }
  });
}

// kafa dokusu, küre UV'si: u=0.5 yüzün önü, canvas üstü kafanın tepesi
// alında "M" çizgileri, göz kenarından yanaklara uzanan çizgiler, krem ağız ve çene
function headTexture() {
  const rand = mulberry32(9);
  return canvasTexture(256, 128, (g, w, h) => {
    g.fillStyle = CAT_ORANGE;
    g.fillRect(0, 0, w, h);
    g.filter = 'blur(1.5px)';
    g.strokeStyle = 'rgba(112, 56, 20, 0.7)';
    g.lineCap = 'round';
    const line = (x1, y1, x2, y2, lw) => {
      g.lineWidth = lw;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
    };
    for (const dx of [-11, -4, 4, 11]) line(w / 2 + dx, 22, w / 2 + dx * 0.6, 50, 3);
    for (const s of [-1, 1]) {
      line(w / 2 + s * 26, 66, w / 2 + s * 52, 70, 2.5);
      line(w / 2 + s * 30, 74, w / 2 + s * 54, 80, 2);
      for (let i = 0; i < 4; i++) line(w / 2 + s * (70 + i * 16), 10, w / 2 + s * (78 + i * 16), 46, 2.5); // tepe ve ense
    }
    const muzzle = g.createRadialGradient(w / 2, h * 0.82, 4, w / 2, h * 0.82, 40);
    muzzle.addColorStop(0, 'rgba(244, 226, 198, 1)');
    muzzle.addColorStop(0.6, 'rgba(244, 226, 198, 0.8)');
    muzzle.addColorStop(1, 'rgba(244, 226, 198, 0)');
    g.fillStyle = muzzle;
    g.fillRect(0, h * 0.5, w, h * 0.5);
    g.filter = 'none';
    for (let i = 0; i < 1500; i++) {
      g.fillStyle = rand() < 0.5 ? 'rgba(255, 230, 190, 0.12)' : 'rgba(70, 35, 10, 0.12)';
      g.fillRect(rand() * w, rand() * h, 1, 2 + rand() * 2);
    }
  });
}

// bacak dokusu, dikey eksen bacak boyu: soluk halkalar, alt bacakta patiye doğru krem
function legTexture(sock) {
  return canvasTexture(32, 128, (g, w, h) => {
    g.fillStyle = CAT_ORANGE;
    g.fillRect(0, 0, w, h);
    g.filter = 'blur(2px)';
    g.fillStyle = 'rgba(112, 56, 20, 0.4)';
    for (const y of [24, 56, 88]) g.fillRect(0, y, w, 8);
    if (sock) {
      const s = g.createLinearGradient(0, h * 0.55, 0, h);
      s.addColorStop(0, 'rgba(244, 226, 198, 0)');
      s.addColorStop(1, 'rgba(244, 226, 198, 1)');
      g.fillStyle = s;
      g.fillRect(0, 0, w, h);
    }
  });
}

// kuyruk dokusu, yatay eksen kuyruk boyu: halkalar + koyu uç
function tailTexture() {
  return canvasTexture(256, 32, (g, w, h) => {
    g.fillStyle = CAT_ORANGE;
    g.fillRect(0, 0, w, h);
    g.filter = 'blur(2px)';
    g.fillStyle = 'rgba(112, 56, 20, 0.7)';
    for (let x = 18; x < w * 0.85; x += 24) g.fillRect(x, 0, 9, h);
    g.fillStyle = '#7a4019';
    g.fillRect(w * 0.86, 0, w, h);
  });
}

// tüy katmanları (shell fur): aynı geometri normal yönünde katman katman şişiriliyor, her katmanda yalnızca
// o yüksekliğe ulaşan kıllar (strand dokusundaki parlak pikseller) kalıyor. dipteki katmanlar koyu, uçlar açık
const SHELLS = 6;
const FUR_LEN = 0.005;
function strandTexture() {
  const rand = mulberry32(11);
  const tex = canvasTexture(128, 128, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const v = Math.pow(rand(), 0.6) * 255;
      img.data.set([v, v, v, 255], i * 4);
    }
    g.putImageData(img, 0, 0);
  });
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}
function addFur(root, mats) {
  const strands = strandTexture();
  const layers = new Map();
  const shellMats = (base) => {
    if (!layers.has(base)) {
      layers.set(base, Array.from({ length: SHELLS }, (_, i) => {
        const k = (i + 1) / SHELLS;
        const m = new THREE.MeshStandardMaterial({
          map: base.map,
          color: base.color.clone().multiplyScalar(0.5 + 0.5 * k),
          roughness: 1,
          alphaMap: strands,
          alphaTest: k * 0.85,
        });
        // kalınlık uniform'da, böylece bütün katmanlar tek shader programını paylaşıyor
        const furOffset = { value: k * FUR_LEN };
        m.onBeforeCompile = (sh) => {
          sh.uniforms.furOffset = furOffset;
          sh.vertexShader =
            'uniform float furOffset;\n' +
            sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normal * furOffset;');
        };
        m.customProgramCacheKey = () => 'catfur';
        return m;
      }));
    }
    return layers.get(base);
  };
  const targets = [];
  root.traverse((o) => o.isMesh && mats.includes(o.material) && targets.push(o));
  for (const o of targets) {
    for (const m of shellMats(o.material)) {
      const sh = new THREE.Mesh(o.geometry, m);
      sh.receiveShadow = true;
      o.add(sh);
    }
  }
}

// üstü (y=0) geniş, altı dar, uçları yuvarlak uzuv. top: üst yarıçap, ratio: alt/üst
function limbGeo(top, len, ratio) {
  const geo = new THREE.CapsuleGeometry(top, len, 6, 20);
  geo.translate(0, -len / 2, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = 1 + (ratio - 1) * THREE.MathUtils.clamp(-p.getY(i) / len, 0, 1);
    p.setXYZ(i, p.getX(i) * k, p.getY(i), p.getZ(i) * k);
  }
  geo.computeVertexNormals();
  return geo;
}

// anahtar değerler s=-1..1 aralığına eşit dağılmış, aralarında yumuşak geçiş
function keyed(keys, s) {
  const f = ((s + 1) / 2) * (keys.length - 1);
  const i = Math.min(keys.length - 2, Math.floor(f));
  const t = f - i;
  return keys[i] + (keys[i + 1] - keys[i]) * t * t * (3 - 2 * t);
}

// gövde: tek parça, boyu boyunca kesiti değişen elipsoit. s=-1 kalça ucu, s=+1 göğüs
// sırt düz, bel karından içeri çekik, göğüs derin
function catBodyGeo() {
  const geo = new THREE.SphereGeometry(1, 48, 32);
  geo.rotateZ(-Math.PI / 2);
  const p = geo.attributes.position;
  const top = [0.054, 0.058, 0.053, 0.057, 0.052];
  const bot = [0.056, 0.04, 0.05, 0.07, 0.064];
  const wid = [0.044, 0.047, 0.04, 0.045, 0.042];
  for (let i = 0; i < p.count; i++) {
    const s = p.getX(i);
    const c = Math.sqrt(Math.max(0, 1 - s * s));
    const blunt = c > 1e-4 ? Math.pow(1 - Math.pow(Math.abs(s), 2.6), 1 / 2.6) / c : 0; // uçlar küreden küt
    const y = p.getY(i) * blunt;
    const z = p.getZ(i) * blunt;
    p.setXYZ(i, 0.11 + s * 0.18, 0.02 + y * keyed(y > 0 ? top : bot, s), z * keyed(wid, s));
  }
  geo.computeVertexNormals();
  return geo;
}

// kafatası: önü yassı, alt yanları (yanaklar) dolgun, tepesi hafif basık
function catSkullGeo() {
  const geo = new THREE.SphereGeometry(1, 40, 28);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    if (x > 0) x *= 0.82;
    z *= 1 + 0.22 * Math.max(0, -y) * Math.max(0, x + 0.4);
    if (y > 0) y *= 0.92;
    p.setXYZ(i, x * 0.046, y * 0.044, z * 0.054);
  }
  geo.computeVertexNormals();
  return geo;
}

function cat() {
  // Physical ve bumpMap yok: ikisi de açılışta ayrı shader derletip sayfayı donduruyordu. tüy görünümünü katmanlar veriyor
  const furOpts = { roughness: 1 };
  const furMat = (o) => new THREE.MeshStandardMaterial({ ...furOpts, ...o });
  const fur = furMat({ map: tabbyTexture() });
  const headFur = furMat({ map: headTexture() });
  const legFur = furMat({ map: legTexture(false) });
  const sockFur = furMat({ map: legTexture(true) });
  const face = furMat({ color: CAT_ORANGE });
  const tip = furMat({ color: '#7a4019' });
  const cream = furMat({ color: '#f2e0c4' });
  const pink = std('#c98080', { roughness: 0.5 });
  const dark = std('#120d0a', { roughness: 0.3 });
  const irisMat = std('#c4ae3a', { emissive: '#221c06', roughness: 0.15 });

  // root'un +x'i kedinin önü, gövde arka kalçadan dönüyor
  const root = new THREE.Group();
  const torso = new THREE.Group();
  torso.position.x = -0.12;
  root.add(torso);

  const body = mesh(catBodyGeo(), fur);
  torso.add(body);
  // boyun gövdeden kafaya yükseliyor. kafa dokusunun krem çenesi boynun önüne gelip göğüs oluyor
  const neck = mesh(new THREE.SphereGeometry(0.048, 20, 14), headFur, [0.262, 0.06, 0]);
  neck.scale.set(1.1, 1.05, 0.85);
  neck.rotation.z = 0.5;
  torso.add(neck);

  // kind 'f': omuz küreği + düz ön bacak, 'r': geniş but + ince arka bacak
  const leg = (x, z, kind) => {
    const f = kind === 'f';
    const upper = f ? 0.08 : 0.09;
    const lower = f ? 0.075 : 0.085;
    const top = new THREE.Group();
    top.position.set(x, 0, z);
    // omuz ve but yukarıda gövdenin içine giriyor ki bacak gövdeden çıkıyormuş gibi dursun
    const muscle = mesh(new THREE.SphereGeometry(f ? 0.03 : 0.04, 18, 14), legFur, f ? [-0.004, 0.004, 0] : [0, 0, 0]);
    muscle.scale.set(f ? 0.9 : 1.05, f ? 1.6 : 1.45, f ? 0.75 : 0.72);
    top.add(mesh(limbGeo(f ? 0.021 : 0.027, upper, f ? 0.65 : 0.5), legFur), muscle);
    const knee = new THREE.Group();
    knee.position.y = -upper;
    top.add(knee);
    knee.add(mesh(limbGeo(f ? 0.0125 : 0.0115, lower, 0.85), sockFur));
    // pati: taban + önde dört parmak
    const paw = mesh(new THREE.SphereGeometry(0.0155, 14, 10), cream, [0.004, -lower - 0.003, 0]);
    paw.scale.set(1.2, 0.55, 1);
    knee.add(paw);
    for (const tz of [-0.0105, -0.0035, 0.0035, 0.0105]) {
      const toe = mesh(new THREE.SphereGeometry(0.006, 10, 8), cream, [0.019 - Math.abs(tz) * 0.35, -lower - 0.005, tz * 1.1]);
      toe.scale.set(1.1, 0.8, 1);
      knee.add(toe);
    }
    torso.add(top);
    return { top, knee };
  };
  const front = [leg(0.22, -0.026, 'f'), leg(0.22, 0.026, 'f')];
  const rear = [leg(0.02, -0.03, 'r'), leg(0.02, 0.03, 'r')];

  const head = new THREE.Group();
  head.rotation.order = 'YZX'; // önce baş kalkıyor sonra yana dönüyor
  head.position.set(0.28, 0.07, 0);
  head.scale.setScalar(1.05);
  torso.add(head);
  head.add(mesh(catSkullGeo(), headFur, [0.03, 0.02, 0]));
  // burun sırtı, bıyık yastıkları, çene, burun
  const bridge = mesh(new THREE.SphereGeometry(0.02, 16, 12), face, [0.058, 0.004, 0]);
  bridge.scale.set(1, 0.75, 0.8);
  head.add(bridge);
  for (const s of [-1, 1]) {
    const pad = mesh(new THREE.SphereGeometry(0.0125, 14, 10), cream, [0.071, -0.009, s * 0.0105]);
    pad.scale.set(0.75, 0.8, 1);
    head.add(pad);
  }
  const chin = mesh(new THREE.SphereGeometry(0.011, 12, 8), cream, [0.064, -0.022, 0]);
  chin.scale.set(0.9, 0.6, 1);
  head.add(chin);
  const nose = mesh(new THREE.SphereGeometry(0.0075, 12, 8), pink, [0.08, 0.001, 0]);
  nose.scale.set(0.6, 0.55, 1);
  head.add(nose);
  // gözler badem biçimli, yüze gömülü: koyu kenar, iris, dikey göz bebeği, parıltı
  const eyes = [-1, 1].map((s) => {
    const e = new THREE.Group();
    e.rotation.order = 'YXZ';
    e.position.set(0.063, 0.021, s * 0.023);
    e.rotation.y = -s * 0.45;
    e.rotation.x = s * 0.18; // dış köşe hafif yukarı
    const rim = mesh(new THREE.SphereGeometry(0.0125, 16, 12), dark);
    rim.scale.set(0.5, 0.72, 1);
    const iris = mesh(new THREE.SphereGeometry(0.0108, 16, 12), irisMat, [0.0012, 0, 0]);
    iris.scale.set(0.5, 0.7, 0.9);
    const pupil = mesh(new THREE.SphereGeometry(0.006, 10, 8), dark, [0.0058, 0, 0]);
    pupil.scale.set(0.2, 0.95, 0.22);
    const glint = mesh(new THREE.SphereGeometry(0.0016, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff' }), [0.0066, 0.003, -0.002]);
    e.add(rim, iris, pupil, glint);
    head.add(e);
    return e;
  });
  // kulaklar geniş tabanlı üçgen, önü pembe
  const ears = [-1, 1].map((s) => {
    const ear = new THREE.Group();
    ear.position.set(0.018, 0.05, s * 0.03);
    ear.rotation.x = s * 0.38; // dışa eğik
    const outer = mesh(new THREE.ConeGeometry(0.025, 0.044, 16), face, [0, 0.02, 0]);
    outer.scale.x = 0.38;
    const inner = mesh(new THREE.ConeGeometry(0.017, 0.032, 12), pink, [0.0045, 0.016, 0]);
    inner.scale.x = 0.22;
    ear.add(outer, inner);
    head.add(ear);
    return ear;
  });
  // bıyıklar, her yana 3 tane, yastıklardan çıkıyor
  const whisker = [];
  for (const s of [-1, 1]) {
    for (const dy of [-0.008, 0, 0.008]) whisker.push(0.076, -0.009, s * 0.016, 0.06, -0.009 + dy * 2, s * 0.1);
  }
  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.Float32BufferAttribute(whisker, 3));
  head.add(new THREE.LineSegments(wGeo, new THREE.LineBasicMaterial({ color: '#f6efe2', transparent: true, opacity: 0.6 })));

  // kuyruk 11 eklem, her açı bir öncekine ekleniyor ki kıvrılabilsin
  // görünen kısım eklemlerden geçen, uca doğru incelen tek tüp. her karede yeniden kuruluyor
  const tail = new THREE.Group();
  tail.position.set(-0.06, 0.045, 0);
  torso.add(tail);
  const segs = [];
  let parent = tail;
  for (let i = 0; i < 11; i++) {
    const s = new THREE.Group();
    s.position.y = i ? 0.026 : 0;
    parent.add(s);
    segs.push(s);
    parent = s;
  }
  const tailMat = furMat({ map: tailTexture() });
  const tailMesh = mesh(new THREE.BufferGeometry(), tailMat);
  tail.add(tailMesh);
  const tipCap = mesh(new THREE.SphereGeometry(0.0078, 8, 6), tip);
  tail.add(tipCap);
  const toTail = new THREE.Matrix4();
  const buildTail = () => {
    root.updateMatrixWorld(true);
    toTail.copy(tail.matrixWorld).invert();
    const curve = new THREE.CatmullRomCurve3(segs.map((s) => new THREE.Vector3().setFromMatrixPosition(s.matrixWorld).applyMatrix4(toTail)));
    const N = 24;
    const geo = new THREE.TubeGeometry(curve, N, 1, 10);
    const p = geo.attributes.position;
    const c = new THREE.Vector3();
    const v = new THREE.Vector3();
    for (let j = 0; j <= N; j++) {
      curve.getPointAt(j / N, c);
      const r = 0.017 * (1 - 0.55 * (j / N));
      for (let i = 0; i <= 10; i++) {
        const idx = j * 11 + i;
        v.fromBufferAttribute(p, idx).sub(c).multiplyScalar(r).add(c);
        p.setXYZ(idx, v.x, v.y, v.z);
      }
    }
    tailMesh.geometry.dispose();
    tailMesh.geometry = geo;
    tailMesh.children.forEach((sh) => (sh.geometry = geo));
    tipCap.position.copy(c);
  };
  addFur(root, [fur, headFur, legFur, tailMat]); // alt bacak tüyü kısa, katman yok

  const pose = { ...CAT_POSES.sleep };
  const pos = new THREE.Vector2(CAT_ROUTE[0].x, CAT_ROUTE[0].z);
  let state = 'sleep';
  let timer = 8;
  let target = 1;
  let heading = 0;
  let walk = 0;
  let phase = 0;
  let yaw = 0;
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  return {
    group: root,
    get hint() {
      return state === 'sleep' ? 'Uyuyor · sev' : 'Sev';
    },
    poke() {
      state = 'look';
      timer = 3.5;
    },
    update(dt, t) {
      timer -= dt;
      if (state === 'walk') {
        const wp = CAT_ROUTE[target];
        const dx = wp.x - pos.x;
        const dz = wp.z - pos.y;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.02) {
          if (wp.act) {
            state = wp.act;
            timer = wp.time;
          }
          target = (target + 1) % CAT_ROUTE.length;
        } else {
          // önce hedefe dönüyor, döndükçe hızlanıyor
          const turn = wrap(Math.atan2(-dz, dx) - heading);
          const spin = THREE.MathUtils.clamp(turn, -2.5 * dt, 2.5 * dt);
          heading += spin;
          const step = Math.min(dist, 0.26 * dt * Math.max(0, Math.cos(turn)));
          pos.x += (dx / dist) * step;
          pos.y += (dz / dist) * step;
          phase += (step / STRIDE) * Math.PI * 2 + Math.abs(spin) * 2;
        }
      } else if (timer <= 0) {
        state = state === 'sleep' ? 'stretch' : 'walk';
        timer = 2;
      }

      const k = Math.min(1, dt * 3);
      const goal = CAT_POSES[state === 'walk' ? 'stand' : state];
      for (const key in goal) pose[key] += (goal[key] - pose[key]) * k;
      walk += ((state === 'walk' ? 1 : 0) - walk) * k;
      const lookYaw =
        state === 'look' ? THREE.MathUtils.clamp(wrap(Math.atan2(-(VIEWER.z - pos.y), VIEWER.x - pos.x) - heading), -1.3, 1.3) : 0;
      // uyurken başı kıvrılmış gövdesine yaslı, yalanırken patiye dönük
      const restYaw = { sleep: -0.6, groom: -0.3 }[state] ?? lookYaw;
      yaw += (restYaw - yaw) * k;

      root.position.set(pos.x, 0, pos.y);
      root.rotation.y = heading;
      const bob = Math.sin(phase * 2) * 0.004 * walk;
      torso.position.y = pose.hip + bob;
      torso.rotation.z = pose.pitch;
      torso.rotation.x = Math.sin(phase) * 0.035 * walk; // yürürken kalça ve omuz iki yana yatıyor
      body.scale.x = 1 + Math.sin(t * (state === 'sleep' ? 1.6 : 2.4)) * 0.025; // nefes

      // yürüyüş sırası: sol arka, sol ön, sağ arka, sağ ön. bacak öne gelirken diz bükülüp pati kalkıyor
      const legs = [[rear[0], 0, 'r'], [front[0], 0.5, 'f'], [rear[1], 1, 'r'], [front[1], 1.5, 'f']];
      for (const [l, off, side] of legs) {
        const p = phase + off * Math.PI;
        l.top.rotation.z = pose[side + 'U'] + Math.sin(p) * 0.4 * walk;
        l.knee.rotation.z = pose[side + 'L'] - Math.max(0, Math.cos(p)) * 0.7 * walk;
      }
      // yalanma: sağ ön pati ağza, baş patiye inip kalkıyor
      const groom = state === 'groom' ? 1 : 0;
      front[1].top.rotation.z += groom * 1.7;
      front[1].knee.rotation.z += groom * -2.2;
      head.rotation.z = pose.head - pose.pitch * walk + groom * (-0.5 + Math.sin(t * 9) * 0.15);
      head.rotation.y = yaw;
      head.rotation.x = -torso.rotation.x; // baş gövdenin sallantısını telafi edip sabit kalıyor
      head.position.y = 0.07 + pose.headY - bob * 0.8;
      const blink = t % 4.3 < 0.12 ? 0.1 : 1;
      eyes.forEach((e) => (e.scale.y = Math.min(pose.eyes, blink)));
      // arada bir kulak seğiriyor
      ears[0].rotation.z = t % 5.7 < 0.15 ? -0.5 : 0;
      tail.rotation.z = pose.tailBase;
      const swish = state === 'look' ? 0.25 : 0.07;
      segs.forEach((s, i) => {
        if (!i) return;
        s.rotation.z = pose.tailUp * (i / 5) + pose.tailCurl * Math.max(0, i - 6) / 4; // yürürken uç kıvrık
        s.rotation.x = pose.tailSide + Math.sin(t * (state === 'look' ? 6 : 1.8) - i * 0.45) * swish * (i / 10);
      });
      buildTail();
    },
  };
}

// --- Kurulum
export function buildFurniture(scene) {
  const player = recordPlayer();
  const win = windowObj();
  const clock = wallClock();
  const lamp = floorLamp();
  const pot = plant();
  const pendant = pendantLamp();
  const kitty = cat();

  // kanepe TV'ye dönük. genel görünümde sehpadaki kolu ve telefonu kapatmasın diye biraz geride
  const couch = sofa();
  couch.position.set(0, 0, 0.6);
  couch.rotation.y = Math.PI;

  const decor = [tvStand(), coffeeTable(), armchair(), couch, poster()];
  decor.forEach((d) => scene.add(d));

  // her eşya ya channel (TV'de açılır) ya da action (odada bir şey yapar)
  const items = [
    { id: 'bookshelf', label: 'Kitaplık', hint: 'Hakkımda', channel: 'about', object: bookshelf() },
    { id: 'desk', label: 'Bilgisayar', hint: 'Projeler', channel: 'projects', object: desk() },
    {
      id: 'record',
      label: 'Plak çalar',
      get hint() {
        return player.hint;
      },
      action: () => player.toggle(),
      object: player.group,
    },
    { id: 'window', label: 'Hava durumu', hint: 'Hava durumu', channel: 'weather', object: win.group },
    { id: 'clock', label: 'Saat', hint: 'Saat', channel: 'time', object: clock.group },
    { id: 'controller', label: 'Oyun kolu', hint: 'Oyna', channel: 'game', object: controller() },
    { id: 'phone', label: 'Telefon', hint: 'İletişim', channel: 'contact', object: phone() },
    { id: 'lamp', label: 'Lamba', hint: 'Aç / kapat', action: () => lamp.toggle(), object: lamp.group },
    { id: 'pendant', label: 'Tavan lambası', hint: 'Aç / kapat', action: () => pendant.toggle(), object: pendant.group },
    { id: 'curtain', label: 'Perde', hint: 'Aç / kapat', action: () => win.toggleCurtain(), object: win.curtain },
    {
      id: 'cat',
      label: 'Kedi',
      get hint() {
        return kitty.hint;
      },
      action: () => kitty.poke(),
      object: kitty.group,
    },
    { id: 'plant', label: 'Bitki', hint: 'Dokun', action: () => pot.poke(), object: pot.group },
  ];
  items.forEach((i) => scene.add(i.object));

  return {
    items,
    get shade() {
      return win.shade;
    },
    startSound: () => win.startSound(),
    update(dt, t, dark) {
      player.update(dt);
      win.update(t, dt);
      clock.update();
      lamp.update(dt, dark);
      pendant.update(dt, dark);
      kitty.update(dt, t);
      pot.update(dt, t);
    },
  };
}
