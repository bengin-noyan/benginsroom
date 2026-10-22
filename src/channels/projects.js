import { config } from '../config.js';
import { esc } from '../utils.js';

// GitHub'dan canlı depo listesi.
export function mount(host) {
  const user = config.githubUser;
  host.innerHTML = `
    <div class="page projects">
      <div class="kicker">Bilgisayardan · github.com/${esc(user)}</div>
      <h1>Projeler</h1>
      <div class="repo-grid"><div class="status">Depolar yükleniyor…</div></div>
    </div>`;
  const grid = host.querySelector('.repo-grid');
  const ctrl = new AbortController();

  fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=6`, { signal: ctrl.signal })
    .then((r) => {
      if (!r.ok) throw new Error(`GitHub ${r.status}`);
      return r.json();
    })
    .then((repos) => {
      if (!repos.length) {
        grid.innerHTML = `<div class="status">Henüz herkese açık depo yok.</div>`;
        return;
      }
      grid.innerHTML = repos
        .map(
          (r) => `
        <a class="repo" href="${esc(r.html_url)}" target="_blank" rel="noopener">
          <div class="repo-name">${esc(r.name)}</div>
          <div class="repo-desc">${esc(r.description || 'Açıklama yok')}</div>
          <div class="repo-meta">
            ${r.language ? `<span>● ${esc(r.language)}</span>` : ''}
            <span>★ ${r.stargazers_count}</span>
            <span>${new Date(r.pushed_at).toLocaleDateString('tr-TR')}</span>
          </div>
        </a>`,
        )
        .join('');
    })
    .catch((err) => {
      if (err.name === 'AbortError') return;
      grid.innerHTML = `<div class="status">Depolar şu an yüklenemedi. <a href="https://github.com/${esc(user)}" target="_blank" rel="noopener">GitHub'da aç →</a></div>`;
    });

  return () => ctrl.abort();
}
