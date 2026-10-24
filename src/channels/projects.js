import { config } from '../config.js';
import { esc } from '../utils.js';

export function mount(host) {
  host.innerHTML = `
    <div class="page projects">
      <div class="kicker">Bilgisayardan · Seçilmiş projeler</div>
      <h1>Projeler</h1>
      <div class="repo-grid">
        ${config.projects
          .map((p) => {
            const body = `
            <div class="repo-name">${esc(p.name)}</div>
            <div class="repo-desc">${esc(p.desc)}</div>
            <div class="repo-meta"><span>● ${esc(p.year)}</span>${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;
            return p.href
              ? `<a class="repo" href="${esc(p.href)}" target="_blank" rel="noopener">${body}</a>`
              : `<div class="repo">${body}</div>`;
          })
          .join('')}
      </div>
    </div>`;
}
