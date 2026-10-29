import * as THREE from 'three';
import { canvasTexture, mulberry32 } from './utils.js';
import { currentHour, daylightAt } from './daylight.js';
import { fetchWeather, precipitation } from './services/weather.js';

export const ROOM = { w: 8, h: 3.2, d: 7, back: -3.5, front: 3.5 };

function plankTexture() {
  const rand = mulberry32(7);
  const tex = canvasTexture(1024, 1024, (g, w, h) => {
    const rows = 8;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -((r * 173) % 400);
      while (x < w) {
        const len = 320 + rand() * 360;
        g.fillStyle = `hsl(${24 + rand() * 6}, ${32 + rand() * 10}%, ${30 + rand() * 9}%)`;
        g.fillRect(x, r * rh, len, rh);
        g.strokeStyle = 'rgba(40,20,10,0.10)';
        g.lineWidth = 1.5;
        for (let i = 0; i < 9; i++) {
          const y = r * rh + 6 + rand() * (rh - 12);
          g.beginPath();
          g.moveTo(x, y);
          g.bezierCurveTo(x + len * 0.3, y + rand() * 6 - 3, x + len * 0.7, y + rand() * 6 - 3, x + len, y);
          g.stroke();
        }
        g.fillStyle = 'rgba(0,0,0,0.45)';
        g.fillRect(x, r * rh, 3, rh);
        x += len;
      }
      g.fillStyle = 'rgba(0,0,0,0.5)';
      g.fillRect(0, r * rh, w, 3);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 2.5);
  return tex;
}

// kilim desenli halı
function kilimTexture() {
  return canvasTexture(1024, 720, (g, w, h) => {
    g.fillStyle = '#7a2a22';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e6d3b0';
    g.fillRect(28, 28, w - 56, h - 56);
    g.fillStyle = '#9c3a2c';
    g.fillRect(44, 44, w - 88, h - 88);
    const diamond = (cx, cy, rx, ry, color) => {
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(cx, cy - ry);
      g.lineTo(cx + rx, cy);
      g.lineTo(cx, cy + ry);
      g.lineTo(cx - rx, cy);
      g.closePath();
      g.fill();
    };
    for (let i = 0; i < 3; i++) {
      const cx = w * (0.22 + i * 0.28);
      diamond(cx, h / 2, 130, 210, '#1f3a4d');
      diamond(cx, h / 2, 100, 165, '#e6d3b0');
      diamond(cx, h / 2, 70, 120, '#d08b2c');
      diamond(cx, h / 2, 34, 60, '#1f3a4d');
    }
    g.fillStyle = '#e6d3b0';
    for (let x = 70; x < w - 60; x += 36) {
      diamond(x, 72, 12, 14, '#e6d3b0');
      diamond(x, h - 72, 12, 14, '#e6d3b0');
    }
  });
}

export function buildRoom(scene) {
  const { w, h, d } = ROOM;
  const wall = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.95 });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ map: plankTexture(), roughness: 0.55 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(w, d), wall('#e9e1d4'));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = h;
  scene.add(ceiling);

  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wall('#33504a'));
  back.position.set(0, h / 2, ROOM.back);
  back.receiveShadow = true;
  scene.add(back);

  const left = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wall('#cdbda5'));
  left.rotation.y = Math.PI / 2;
  left.position.set(-w / 2, h / 2, 0);
  left.receiveShadow = true;
  scene.add(left);

  const right = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wall('#cdbda5'));
  right.rotation.y = -Math.PI / 2;
  right.position.set(w / 2, h / 2, 0);
  right.receiveShadow = true;
  scene.add(right);

  const trim = new THREE.MeshStandardMaterial({ color: '#efe7da', roughness: 0.6 });
  const baseboard = (len, x, z, ry) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.02), trim);
    b.position.set(x, 0.05, z);
    b.rotation.y = ry;
    scene.add(b);
  };
  baseboard(w, 0, ROOM.back + 0.01, 0);
  baseboard(d, -w / 2 + 0.01, 0, Math.PI / 2);
  baseboard(d, w / 2 - 0.01, 0, Math.PI / 2);

  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 2.4),
    new THREE.MeshStandardMaterial({ map: kilimTexture(), roughness: 1 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.004, -1.5);
  rug.receiveShadow = true;
  scene.add(rug);

  return { dust: buildDust(scene) };
}

// pencere ışığında uçuşan toz
function buildDust(scene) {
  const count = 260;
  const rand = mulberry32(3);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = -3.8 + rand() * 6;
    pos[i * 3 + 1] = 0.2 + rand() * 2.8;
    pos[i * 3 + 2] = -3.3 + rand() * 5.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: '#ffe2b8',
      size: 0.008,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  points.raycast = () => {};
  scene.add(points);

  return (dt, t) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p[i * 3] += Math.sin(t * 0.3 + i) * 0.0006;
      p[i * 3 + 1] += 0.02 * dt;
      p[i * 3 + 2] += Math.cos(t * 0.25 + i * 1.3) * 0.0006;
      if (p[i * 3 + 1] > 3.0) p[i * 3 + 1] = 0.2;
    }
    geo.attributes.position.needsUpdate = true;
  };
}

export function buildLighting(scene) {
  const hemi = new THREE.HemisphereLight('#ffe9d2', '#3a2a22', 0.5);
  scene.add(hemi);

  // pencereden giren ışık, pervaz gölgesi zemine düşüyor
  const sun = new THREE.SpotLight('#fff1dc', 3, 0, 0.42, 0.7, 0);
  sun.position.set(-7.5, 3.6, -0.6);
  sun.target.position.set(-1.2, 0, -0.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.bias = -0.0015;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  // bulutlu/yağışlı havada oda loşlaşıyor (0 açık, 1 en kasvetli)
  let gloom = 0;
  fetchWeather()
    .then((d) => {
      const c = d.current ?? {};
      const { rain, snow } = precipitation(c.weather_code);
      gloom = Math.min(1, ((c.cloud_cover ?? 0) / 100) * 0.5 + Math.max(rain, snow) * 0.5);
    })
    .catch(() => {});

  let acc = 1;
  const state = { daylight: daylightAt(currentHour()), dark: false };
  return {
    state,
    // shade = perde ne kadar kapalı (0-1). perde her karede değişebiliyor, ışığı da her karede güncelliyorum
    update(dt, shade = 0) {
      acc += dt;
      if (acc >= 1) {
        acc = 0;
        state.daylight = daylightAt(currentHour());
      }
      const dl = state.daylight;
      const outside = dl.sunIntensity * (1 - gloom * 0.6);
      sun.color.copy(dl.sun);
      sun.intensity = outside * (1 - shade * 0.9);
      hemi.intensity = dl.ambient * (1 - gloom * 0.3) * (1 - shade * 0.4);
      // lambalar ~19:20 sonrası ve ~06:00 öncesi kendi yanıyor, kapalı havada biraz daha erken
      state.dark = outside < 1.5;
    },
  };
}
