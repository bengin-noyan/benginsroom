import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { wait } from './utils.js';

// ekran gerçek bir DOM öğesi, CSS3DRenderer ile TV'nin üstüne oturuyor.
// bu sayede iframe, video vs. ekranda canlı çalışıyor
export const SCREEN_PX = { w: 1280, h: 720 };

export class TV {
  constructor(channels, ctx) {
    this.channels = channels;
    this.ctx = ctx;
    this.current = null;
    this.cleanup = null;
    this.screenW = 1.84;
    this.screenH = (this.screenW * 9) / 16;

    this.group = new THREE.Group();
    const shell = new THREE.MeshStandardMaterial({ color: '#121214', roughness: 0.55, metalness: 0.1 });
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(this.screenW + 0.08, this.screenH + 0.08, 0.06), shell);
    bezel.castShadow = true;
    this.group.add(bezel);
    const backBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.06), shell);
    backBox.position.z = -0.055;
    this.group.add(backBox);
    // ekranı "delik" olarak çiziyorum: WebGL orayı saydam bırakıyor, arkadaki DOM görünüyor.
    // öndeki nesneler derinlik testiyle ekranı yine doğru kapatıyor
    const hole = new THREE.MeshBasicMaterial({ color: '#000', opacity: 0, blending: THREE.NoBlending });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(this.screenW, this.screenH), hole);
    screen.position.z = 0.031;
    this.group.add(screen);
    for (const x of [-0.7, 0.7]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.13, 0.035), shell);
      foot.position.set(x, -this.screenH / 2 - 0.1, 0);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.14), shell);
      plate.position.set(x, -this.screenH / 2 - 0.16, 0.02);
      this.group.add(foot, plate);
    }

    this.el = document.createElement('div');
    this.el.className = 'tv-screen off';
    this.el.innerHTML = `
      <div class="tv-content"></div>
      <div class="tv-static"><canvas width="256" height="144"></canvas></div>
      <div class="tv-scanlines"></div>
      <div class="tv-glass"></div>
      <div class="tv-osd"></div>`;
    this.content = this.el.querySelector('.tv-content');
    this.osd = this.el.querySelector('.tv-osd');
    this.noise = this.el.querySelector('canvas').getContext('2d');
    this.noiseImg = this.noise.createImageData(256, 144);

    // DOM ekran ayrı CSS sahnesinde, dünya cssScale kat büyük çiziliyor.
    // böylece 1280 px'lik öğe 1:1 kalıyor, metrede minicik scale değerleriyle uğraşmıyorum
    this.cssScale = SCREEN_PX.w / this.screenW;
    this.cssObject = new CSS3DObject(this.el);

    // TV ışığı kanalın rengini alıyor
    this.glow = new THREE.PointLight('#7aa2ff', 0, 6, 2);
    this.glow.position.set(0, 0, 0.7);
    this.group.add(this.glow);
    this.glowTarget = new THREE.Color('#7aa2ff');
    this.glowLevel = 0;
  }

  // yakından ve karşıdan bakınca arada nesne kalmıyor, DOM'u öne alıp etkileşimli yap
  isViewedHeadOn(camera) {
    const center = this.screenCenter();
    const toCam = camera.position.clone().sub(center);
    const dist = toCam.length();
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.getWorldQuaternion(new THREE.Quaternion()));
    return dist < 4.8 && toCam.normalize().dot(normal) > 0.93;
  }

  screenCenter() {
    return this.group.localToWorld(new THREE.Vector3(0, 0, 0.031));
  }

  syncCss() {
    this.cssObject.position.copy(this.screenCenter()).multiplyScalar(this.cssScale);
    this.group.getWorldQuaternion(this.cssObject.quaternion);
  }

  channel(id) {
    return this.channels.find((c) => c.id === id);
  }

  async show(id) {
    const ch = this.channel(id);
    if (!ch || this.current === id) return;
    this.current = id;
    this.el.classList.remove('off');
    this.el.classList.add('switching');
    this.cleanup?.();
    this.cleanup = null;
    this.content.replaceChildren();

    const num = String(this.channels.indexOf(ch)).padStart(2, '0');
    this.osd.textContent = `CH ${num}  ${ch.title.toLocaleUpperCase('tr-TR')}`;
    this.osd.classList.add('show');
    clearTimeout(this.osdTimer);
    this.osdTimer = setTimeout(() => this.osd.classList.remove('show'), 2600);

    await wait(380);
    if (this.current !== id) return;
    const host = document.createElement('div');
    host.className = `channel channel-${id}`;
    host.style.setProperty('--accent', ch.accent);
    this.content.appendChild(host);
    this.cleanup = ch.mount(host, this.ctx) || null;
    this.glowTarget.set(ch.accent);
    this.el.classList.remove('switching');
  }

  update(dt) {
    const on = !this.el.classList.contains('off');
    this.glowLevel += ((on ? 1 : 0) - this.glowLevel) * Math.min(1, dt * 4);
    this.glow.color.lerp(this.glowTarget, Math.min(1, dt * 3));
    this.glow.intensity = 2.2 * this.glowLevel;

    if (this.el.classList.contains('switching')) {
      const d = this.noiseImg.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      this.noise.putImageData(this.noiseImg, 0, 0);
    }
  }
}
