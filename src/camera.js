import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { easeInOutCubic } from './utils.js';

// tuş -> [yatay, dikey] bakış yönü
const LOOK_KEYS = {
  KeyA: [1, 0], ArrowLeft: [1, 0],
  KeyD: [-1, 0], ArrowRight: [-1, 0],
  KeyW: [0, 1], ArrowUp: [0, 1],
  KeyS: [0, -1], ArrowDown: [0, -1],
};

const BOUNDS =new THREE.Box3(new THREE.Vector3(-3.7, 0.3, -3.1), new THREE.Vector3(3.7, 3.0, 3.4));

// sınırlı orbit + noktadan noktaya yumuşak geçiş
export class CameraRig {
  constructor(camera, dom) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, dom);
    Object.assign(this.controls, {
      enableDamping: true,
      dampingFactor: 0.08,
      enablePan: false,
      rotateSpeed: 0.45,
      zoomSpeed: 0.6,
      minDistance: 0.8,
      maxDistance: 5.2,
      minPolarAngle: 0.9,
      maxPolarAngle: 1.62,
      minAzimuthAngle: -0.7,
      maxAzimuthAngle: 0.7,
    });
    this.controls.enabled = false;
    this.tween = null;

    // WASD / ok tuşlarıyla bakınma. TV açıkken kapalı, yılan oyunu aynı tuşları kullanıyor
    this.keysEnabled = false;
    this.keys = new Set();
    this.lastTime = performance.now();
    addEventListener('keydown', (e) => {
      if (!this.keysEnabled || !(e.code in LOOK_KEYS)) return;
      e.preventDefault();
      this.keys.add(e.code);
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
  }

  jump(pos, target) {
    this.camera.position.copy(pos);
    this.controls.target.copy(target);
    this.controls.update();
  }

  flyTo(pos, target, duration = 1.5) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) duration = 0.01;
    this.tween = {
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: pos.clone(),
      toTarget: target.clone(),
      start: performance.now(),
      duration,
    };
    this.controls.enabled = false;
  }

  // süreyi gerçek zamana bağladım, fps düşse de uçuş aynı sürede bitiyor
  update() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;
    if (this.keysEnabled && this.controls.enabled && this.keys.size) {
      let yaw = 0;
      let pitch = 0;
      for (const code of this.keys) {
        const [dy, dp] = LOOK_KEYS[code] ?? [0, 0];
        yaw += dy;
        pitch += dp;
      }
      // hedefin etrafında dönüyor, sınırları OrbitControls.update hallediyor
      const offset = this.camera.position.clone().sub(this.controls.target);
      const s = new THREE.Spherical().setFromVector3(offset);
      s.theta += yaw * 1.2 * dt;
      s.phi += pitch * 0.9 * dt;
      this.camera.position.copy(this.controls.target).add(offset.setFromSpherical(s));
    }
    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, (performance.now() - tw.start) / 1000 / tw.duration);
      const k = easeInOutCubic(tw.t);
      this.camera.position.lerpVectors(tw.fromPos, tw.toPos, k);
      this.controls.target.lerpVectors(tw.fromTarget, tw.toTarget, k);
      this.camera.lookAt(this.controls.target);
      if (tw.t >= 1) {
        this.tween = null;
        this.controls.enabled = true;
        this.controls.update();
      }
      return;
    }
    this.controls.update();
    BOUNDS.clampPoint(this.camera.position, this.camera.position);
  }
}
