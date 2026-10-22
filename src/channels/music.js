import { config } from '../config.js';
import { esc } from '../utils.js';

export function mount(host) {
  const { youtubeId, title, artist } = config.music;
  host.innerHTML = `
    <div class="music">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0&modestbranding=1"
        title="${esc(title)}"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen></iframe>
      <div class="now-playing">
        <div class="vinyl"></div>
        <div>
          <div class="kicker">Pikaptan · şimdi çalıyor</div>
          <div class="np-title">${esc(title)}</div>
          <div class="np-artist">${esc(artist)}</div>
        </div>
      </div>
    </div>`;
}
