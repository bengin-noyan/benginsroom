import { config } from '../config.js';
import { esc } from '../utils.js';

export function mount(host) {
  const tracks = config.music;
  host.innerHTML = `
    <div class="music">
      <iframe allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      <div class="now-playing">
        <div class="vinyl"></div>
        <div>
          <div class="kicker">Pikaptan · şimdi çalıyor</div>
          <div class="np-title"></div>
          <div class="np-artist"></div>
        </div>
        <div class="tracks">
          ${tracks.map((t, i) => `<button data-i="${i}">${esc(t.title)}<span>${esc(t.artist)}</span></button>`).join('')}
        </div>
      </div>
    </div>`;

  const iframe = host.querySelector('iframe');
  const buttons = [...host.querySelectorAll('.tracks button')];
  const play = (i) => {
    const t = tracks[i];
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(t.youtubeId)}?autoplay=1&rel=0&modestbranding=1`;
    iframe.title = t.title;
    host.querySelector('.np-title').textContent = t.title;
    host.querySelector('.np-artist').textContent = t.artist;
    buttons.forEach((b, j) => b.classList.toggle('active', j === i));
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => play(i)));
  play(0);
}
