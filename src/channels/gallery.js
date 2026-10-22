import { config } from '../config.js';
import { esc } from '../utils.js';

export function mount(host) {
  const images = config.gallery;
  host.innerHTML = `
    <div class="gallery">
      ${images.map((img, i) => `<img src="${esc(img.src)}" alt="${esc(img.caption)}" class="${i === 0 ? 'active' : ''}" />`).join('')}
      <div class="gallery-bar">
        <button data-dir="-1" aria-label="Önceki">‹</button>
        <div class="gallery-caption"></div>
        <button data-dir="1" aria-label="Sonraki">›</button>
      </div>
    </div>`;
  const imgs = [...host.querySelectorAll('img')];
  const caption = host.querySelector('.gallery-caption');
  let index = 0;
  const show = (i) => {
    index = (i + imgs.length) % imgs.length;
    imgs.forEach((img, j) => img.classList.toggle('active', j === index));
    caption.textContent = `${index + 1} / ${imgs.length} · ${images[index].caption}`;
  };
  show(0);
  let id = setInterval(() => show(index + 1), 5000);
  host.querySelectorAll('[data-dir]').forEach((b) =>
    b.addEventListener('click', () => {
      clearInterval(id);
      show(index + Number(b.dataset.dir));
      id = setInterval(() => show(index + 1), 5000);
    }),
  );
  return () => clearInterval(id);
}
