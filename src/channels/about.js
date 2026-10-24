import { config } from '../config.js';
import { esc } from '../utils.js';

// Ekran kaydırılamadığı için özgeçmiş sekmelere bölünür.
const TABS = [
  ['intro', 'Hakkımda'],
  ['experience', 'Deneyim'],
  ['skills', 'Yetenekler'],
];

export function mount(host) {
  const { title, role, photo, paragraphs, languages } = config.about;
  host.innerHTML = `
    <div class="page about">
      <div class="about-head">
        <div class="kicker">Kitaplıktan · Özgeçmiş</div>
        <nav class="about-tabs">${TABS.map(([id, t]) => `<button data-tab="${id}">${t}</button>`).join('')}</nav>
      </div>

      <section data-panel="intro">
        <div class="about-intro">
          <div>
            <img class="about-photo" src="${esc(photo)}" alt="${esc(title)} portresi" />
            <ul class="about-langs">${languages.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          </div>
          <div>
            <h1>${esc(title)}</h1>
            <div class="about-role">${esc(role)}</div>
            ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>
        </div>
      </section>

      <section data-panel="experience" hidden>
        ${config.experience
          .map(
            (x) => `
          <div class="xp">
            <div class="xp-role">${esc(x.role)}</div>
            <div class="xp-meta">${esc(x.org)} · ${esc(x.date)} · ${esc(x.place)}</div>
            ${x.desc ? `<div class="xp-desc">${esc(x.desc)}</div>` : ''}
          </div>`,
          )
          .join('')}
      </section>

      <section data-panel="skills" hidden>
        <dl class="skills">
          ${config.skills.map((s) => `<dt>${esc(s.group)}</dt><dd>${s.items.map(esc).join(' · ')}</dd>`).join('')}
        </dl>
      </section>
    </div>`;

  const show = (id) => {
    host.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
    host.querySelectorAll('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== id));
  };
  host.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  show('intro');
}
