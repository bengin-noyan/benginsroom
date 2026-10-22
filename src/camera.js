import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { easeInOutCubic } from './utils.js';

const BOUNDS = new THREE.Box3(new THREE.Vector3(-3.7, 0.3, -3.1), new THREE.Vector3(3.7, 3.0, 3.4));

// Serbest bakış (sınırlandırılmış orbit) + noktalar arası yumuşak uçuş.
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

  // Uçuş gerçek saate bağlı: yavaş cihazda kare düşse de süre değişmez.
  update() {
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
