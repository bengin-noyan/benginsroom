import { config } from '../config.js';
import { esc } from '../utils.js';

export function mount(host) {
  host.innerHTML = `
    <div class="page contact">
      <div class="kicker">Telefondan · 1 yeni mesaj</div>
      <h1>Bir mesaj bırak.</h1>
      <p>Bir fikir, bir proje ya da sadece merhaba — kapım açık.</p>
      <div class="contact-list">
        ${config.contact
          .map(
            (c) => `
          <a href="${esc(c.href)}" target="_blank" rel="noopener">
            <span>${esc(c.label)}</span><b>${esc(c.value)}</b><i>→</i>
          </a>`,
          )
          .join('')}
      </div>
    </div>`;
}
