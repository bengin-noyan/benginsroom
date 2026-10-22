const ZONES = [
  ['İstanbul', 'Europe/Istanbul'],
  ['Londra', 'Europe/London'],
  ['New York', 'America/New_York'],
  ['Tokyo', 'Asia/Tokyo'],
];

export function mount(host) {
  host.innerHTML = `
    <div class="page time">
      <div class="kicker">Duvar saatinden</div>
      <div class="big-time" data-time></div>
      <div class="big-date" data-date></div>
      <div class="zones">
        ${ZONES.map(([name]) => `<div class="zone"><span>${name}</span><b data-zone="${name}"></b></div>`).join('')}
      </div>
    </div>`;
  const timeEl = host.querySelector('[data-time]');
  const dateEl = host.querySelector('[data-date]');
  const fmts = ZONES.map(([name, tz]) => [
    host.querySelector(`[data-zone="${name}"]`),
    new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: tz }),
  ]);
  const tick = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('tr-TR');
    dateEl.textContent = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    fmts.forEach(([el, f]) => (el.textContent = f.format(now)));
  };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}
