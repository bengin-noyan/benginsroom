import * as THREE from 'three';

// Günün saatine göre gökyüzü ve ışık. [saat, gök üstü, gök altı, yıldız, güneş rengi, güneş gücü, ortam ışığı]
const KEYS = [
  [0, '#050a1c', '#121836', 1, '#6d7fb3', 0.15, 0.25],
  [5, '#0c1534', '#382a4d', 0.7, '#7d86b8', 0.2, 0.28],
  [6.5, '#3d5a99', '#f2a46b', 0.1, '#ffb37a', 2.2, 0.5],
  [9, '#4f8fd6', '#bfe0f5', 0, '#fff1dc', 3.4, 0.75],
  [16, '#5b95d6', '#cfe6f5', 0, '#fff0d6', 3.2, 0.75],
  [18.5, '#36508f', '#f49a5b', 0.05, '#ff9a5a', 2.4, 0.55],
  [20, '#1a2050', '#6b3a5e', 0.5, '#8a6fb0', 0.5, 0.35],
  [22, '#050a1c', '#121836', 1, '#6d7fb3', 0.15, 0.25],
  [24, '#050a1c', '#121836', 1, '#6d7fb3', 0.15, 0.25],
].map(([h, top, bottom, stars, sun, sunI, amb]) => ({
  h,
  top: new THREE.Color(top),
  bottom: new THREE.Color(bottom),
  stars,
  sun: new THREE.Color(sun),
  sunI,
  amb,
}));

export function currentHour(date = new Date()) {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

export function daylightAt(hour) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].h <= hour) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = (hour - a.h) / (b.h - a.h);
  const lerp = (x, y) => x + (y - x) * k;
  return {
    top: a.top.clone().lerp(b.top, k),
    bottom: a.bottom.clone().lerp(b.bottom, k),
    stars: lerp(a.stars, b.stars),
    sun: a.sun.clone().lerp(b.sun, k),
    sunIntensity: lerp(a.sunI, b.sunI),
    ambient: lerp(a.amb, b.amb),
  };
}
