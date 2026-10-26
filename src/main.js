import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { buildRoom, buildLighting } from './room.js';
import { buildFurniture } from './furniture.js';
import { TV } from './tv.js';
import { Interaction } from './interaction.js';
import { CameraRig } from './camera.js';
import { channels } from './channels/index.js';

const app = document.getElementById('app');
const tooltip = document.getElementById('tooltip');
const intro = document.getElementById('intro');
const backBtn = document.getElementById('back');
const dock = document.getElementById('dock');
const hint = document.getElementById('hint');

// ---------------------------------------------------------------- Render katmanları
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

// TV ekranının DOM katmanı. Normalde WebGL'in arkasında durur ve ekrandaki "delik"ten görünür;
// TV'ye karşıdan yakın bakılınca öne alınır ve tıklanabilir olur (bkz. tv.isViewedHeadOn).
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(innerWidth, innerHeight);
cssRenderer.domElement.className = 'css-layer';
app.appendChild(cssRenderer.domElement);

const scene = new THREE.Scene();
const cssScene = new THREE.Scene();
scene.background = new THREE.Color('#0d0b10');
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 50);

// Dikey ekranda oda yanlardan kesilmesin: yatay görüş ~75° kalacak kadar açılır (55°–85° arası).
function fitCamera() {
  camera.aspect = innerWidth / innerHeight;
  const need = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(37.5)) / camera.aspect));
  camera.fov = THREE.MathUtils.clamp(need, 55, 85);
  camera.updateProjectionMatrix();
}
fitCamera();

// ---------------------------------------------------------------- Oda
const room = buildRoom(scene);
const lighting = buildLighting(scene);
const furniture = buildFurniture(scene);

const tv = new TV(channels, { channels, goTo: (id) => openChannel(id) });
tv.group.position.set(0, 1.2, -3.25);
scene.add(tv.group);
cssScene.add(tv.cssObject);

const tvItem = {
  id: 'tv',
  label: 'Televizyon',
  hint: 'Yaklaş · kanal rehberi',
  action: () => (focused || !tv.current ? openChannel('menu') : focusTV()),
  object: tv.group,
};
const items = [tvItem, ...furniture.items];

// ---------------------------------------------------------------- Kamera
const OVERVIEW = { pos: new THREE.Vector3(0, 1.7, 3.35), target: new THREE.Vector3(0, 1.1, -1.6) };
const DOORWAY = { pos: new THREE.Vector3(0, 1.8, 6.5), target: new THREE.Vector3(0, 1.3, -1.6) };
const cssCamera = camera.clone();
const rig = new CameraRig(camera, renderer.domElement);
rig.jump(DOORWAY.pos, DOORWAY.target);

// Ekranın görüntüye sığacağı mesafe, en-boy oranına göre hesaplanır.
function tvView() {
  const center = tv.screenCenter();
  const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
  const byHeight = tv.screenH / 0.78 / 2 / Math.tan(halfFov);
  const byWidth = tv.screenW / 0.9 / 2 / (Math.tan(halfFov) * camera.aspect);
  const dist = Math.max(byHeight, byWidth);
  return { pos: center.clone().add(new THREE.Vector3(0, 0.02, dist)), target: center };
}

let focused = false;
function focusTV() {
  focused = true;
  rig.keysEnabled = false;
  backBtn.hidden = false;
  hint.classList.add('hidden');
  const v = tvView();
  rig.flyTo(v.pos, v.target, 1.3);
}
function leaveTV() {
  if (!focused) return;
  focused = false;
  rig.keysEnabled = true;
  backBtn.hidden = true;
  rig.flyTo(OVERVIEW.pos, OVERVIEW.target, 1.3);
}

function openChannel(id) {
  focusTV();
  tv.show(id);
  dock.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.channel === id));
}

// ---------------------------------------------------------------- Etkileşim
const interaction = new Interaction({
  camera,
  scene,
  dom: renderer.domElement,
  items,
  tooltip,
  onActivate: (item) => {
    if (item.channel) openChannel(item.channel);
    else item.action?.();
  },
});
interaction.enabled = false;

// Erişilebilir alternatif: odadaki her eşya alttaki çubukta da bir düğme.
for (const item of items) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = item.label;
  b.title = item.hint;
  if (item.channel) b.dataset.channel = item.channel;
  b.addEventListener('click', () => interaction.activate(item));
  b.addEventListener('mouseenter', () => interaction.setHover(item, { showTooltip: false }));
  b.addEventListener('mouseleave', () => interaction.setHover(null));
  dock.appendChild(b);
}

if (matchMedia('(hover: none)').matches) {
  hint.textContent = 'Sürükle: etrafına bak · İki parmak: yaklaş · Dokun: eşyayı kullan';
}

backBtn.addEventListener('click', leaveTV);
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') leaveTV();
});

document.getElementById('enter').addEventListener('click', () => {
  intro.classList.add('gone');
  document.body.classList.add('entered');
  rig.flyTo(OVERVIEW.pos, OVERVIEW.target, 2.6);
  interaction.enabled = true;
  rig.keysEnabled = true;
  furniture.startSound();
  setTimeout(() => tv.show('menu'), 1400);
});

addEventListener('resize', () => {
  fitCamera();
  renderer.setSize(innerWidth, innerHeight);
  cssRenderer.setSize(innerWidth, innerHeight);
  if (focused) {
    const v = tvView();
    rig.jump(v.pos, v.target);
  }
});

// ---------------------------------------------------------------- Döngü
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;
  rig.update();
  lighting.update(dt, furniture.shade);
  room.dust(dt, t);
  furniture.update(dt, t, lighting.state.dark);
  interaction.update(dt, t);
  tv.update(dt);
  document.body.classList.toggle('tv-front', tv.isViewedHeadOn(camera));
  renderer.render(scene, camera);
  cssCamera.copy(camera);
  cssCamera.position.multiplyScalar(tv.cssScale);
  cssCamera.updateMatrixWorld();
  tv.syncCss();
  cssRenderer.render(cssScene, cssCamera);
});

if (import.meta.env.DEV) window.__room = { camera, rig, tv, scene };
