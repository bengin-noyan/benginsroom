import { config } from '../config.js';
import { esc } from '../utils.js';

export function mount(host) {
  const { title, paragraphs, tags } = config.about;
  host.innerHTML = `
    <div class="page about">
      <div class="kicker">Kitaplıktan · Hakkımda</div>
      <h1>${esc(title)}</h1>
      ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      <div class="tags">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
    </div>`;
}
