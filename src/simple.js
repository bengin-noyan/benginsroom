import { config } from './config.js';
import { esc } from './utils.js';

// Basit görünüm: odadaki içeriğin tamamı, kaydırılabilir tek bir sayfada.
const { about } = config;
document.documentElement.classList.add('simple');
document.body.innerHTML = `
  <main class="simple-page">
    <header>
      <img src="${esc(about.photo)}" alt="${esc(about.title)} portresi" />
      <div>
        <h1>${esc(about.title)}</h1>
        <p class="simple-meta">${esc(about.role)}</p>
      </div>
    </header>
    ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}

    <h2>Deneyim ve eğitim</h2>
    ${config.experience
      .map(
        (x) => `
      <h3>${esc(x.role)}</h3>
      <p class="simple-meta">${esc(x.org)} · ${esc(x.date)} · ${esc(x.place)}</p>
      ${x.desc ? `<p>${esc(x.desc)}</p>` : ''}`,
      )
      .join('')}

    <h2>Projeler</h2>
    ${config.projects
      .map(
        (p) => `
      <h3>${p.href ? `<a href="${esc(p.href)}">${esc(p.name)}</a>` : esc(p.name)}</h3>
      <p class="simple-meta">${esc(p.year)} · ${p.tags.map(esc).join(' · ')}</p>
      <p>${esc(p.desc)}</p>`,
      )
      .join('')}

    <h2>Yetenekler</h2>
    <dl>${config.skills.map((s) => `<dt>${esc(s.group)}</dt><dd>${s.items.map(esc).join(' · ')}</dd>`).join('')}</dl>

    <h2>Sertifikalar</h2>
    <ul>${config.certificates.map((c) => `<li>${esc(c.name)}</li>`).join('')}</ul>

    <h2>Diller</h2>
    <ul>${about.languages.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>

    <h2>İletişim</h2>
    <ul>${config.contact.map((c) => `<li>${esc(c.label)}: <a href="${esc(c.href)}">${esc(c.value)}</a></li>`).join('')}</ul>

    <p><a href="./">← 3B odaya git</a></p>
  </main>`;
