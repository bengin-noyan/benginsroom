import * as THREE from 'three';

const HIGHLIGHT = new THREE.Color('#ffb46a').multiplyScalar(0.12);

// hover vurgusu, ipucu balonu ve tıklama
export class Interaction {
  constructor({ camera, scene, dom, items, tooltip, onActivate }) {
    this.camera = camera;
    this.scene = scene;
    this.dom = dom;
    this.items = items;
    this.tooltip = tooltip;
    this.onActivate = onActivate;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hovered = null;
    this.enabled = true;
    items.forEach((item) => this.prepare(item));

    dom.addEventListener('pointermove', (e) => this.onMove(e));
    dom.addEventListener('pointerleave', () => this.setHover(null));
    dom.addEventListener('pointerdown', (e) => (this.down = { x: e.clientX, y: e.clientY }));
    dom.addEventListener('pointerup', (e) => {
      if (!this.down || !this.enabled) return;
      const moved = Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) > 6;
      this.down = null;
      if (moved) return;
      const item = this.pick(e);
      if (item) this.activate(item);
    });
  }

  prepare(item) {
    item.meshes = [];
    item.bump = 0;
    item.baseScale = item.object.scale.clone();
    item.object.traverse((o) => {
      o.userData.item = item;
      if (o.isMesh && o.material?.emissive) {
        o.userData.baseEmissive = o.material.emissive.clone();
        item.meshes.push(o);
      }
    });
  }

  pick(e) {
    const rect = this.dom.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.scene, true).find((h) => h.object.visible);
    return hit?.object.userData.item ?? null;
  }

  onMove(e) {
    if (!this.enabled || e.pointerType === 'touch') return;
    const item = this.pick(e);
    this.setHover(item);
    if (item) {
      this.tooltip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    }
  }

  setHover(item, { showTooltip = true } = {}) {
    if (this.hovered === item) return;
    if (this.hovered) this.highlight(this.hovered, false);
    this.hovered = item;
    if (item) this.highlight(item, true);
    this.dom.style.cursor = item ? 'pointer' : '';
    if (item && showTooltip) {
      this.tooltip.innerHTML = `<b>${item.label}</b><span>${item.hint}</span>`;
      this.tooltip.hidden = false;
    } else {
      this.tooltip.hidden = true;
    }
  }

  highlight(item, on) {
    for (const m of item.meshes) {
      m.material.emissive.copy(m.userData.baseEmissive);
      if (on) m.material.emissive.add(HIGHLIGHT);
    }
  }

  activate(item) {
    item.bump = 1;
    this.setHover(null);
    this.onActivate(item);
  }

  update(dt, t) {
    for (const item of this.items) {
      if (item.bump <= 0.001) continue;
      item.bump *= Math.exp(-dt * 5);
      const s = 1 + Math.sin(t * 30) * 0.035 * item.bump;
      item.object.scale.copy(item.baseScale).multiplyScalar(s);
    }
  }
}
