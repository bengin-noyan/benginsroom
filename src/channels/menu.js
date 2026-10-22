import { config } from '../config.js';

export function mount(host, { channels, goTo }) {
  const list = channels.filter((c) => c.id !== 'menu');
  host.innerHTML = `
    <div class="menu">
      <header>
        <div class="logo">benginsroom</div>
        <div class="menu-clock" data-clock></div>
      </header>
      <p class="lead">${config.owner}'in odasına hoş geldin. Odadaki eşyalara tıkla ya da buradan bir kanal seç.</p>
      <div class="menu-grid">
        ${list
          .map(
            (c, i) => `
          <button class="tile" data-id="${c.id}" style="--accent:${c.accent}">
            <span class="tile-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="tile-icon">${c.icon}</span>
            <span class="tile-title">${c.title}</span>
          </button>`,
          )
          .join('')}
      </div>
    </div>`;
  host.querySelectorAll('.tile').forEach((b) => b.addEventListener('click', () => goTo(b.dataset.id)));
  const clock = host.querySelector('[data-clock]');
  const tick = () => (clock.textContent = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}
