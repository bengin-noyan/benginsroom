import { config } from '../config.js';
import { describeWeather, fetchWeather } from '../services/weather.js';

const DAYS = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' });

export function mount(host) {
  host.innerHTML = `
    <div class="page weather">
      <div class="kicker">Pencereden · ${config.weather.city}</div>
      <div class="status">Gökyüzüne bakılıyor…</div>
    </div>`;
  const page = host.querySelector('.weather');
  let alive = true;

  fetchWeather()
    .then((d) => {
      if (!alive) return;
      const c = d.current;
      const now = describeWeather(c.weather_code, c.is_day);
      const days = d.daily.time
        .map((date, i) => {
          const w = describeWeather(d.daily.weather_code[i]);
          return `<div class="day">
            <div class="day-name">${i === 0 ? 'Bugün' : DAYS.format(new Date(date))}</div>
            <div class="day-icon">${w.icon}</div>
            <div class="day-temp">${Math.round(d.daily.temperature_2m_max[i])}° <small>${Math.round(d.daily.temperature_2m_min[i])}°</small></div>
          </div>`;
        })
        .join('');
      page.innerHTML = `
        <div class="kicker">Pencereden · ${config.weather.city} · canlı</div>
        <div class="now">
          <div class="now-icon">${now.icon}</div>
          <div>
            <div class="now-temp">${Math.round(c.temperature_2m)}°</div>
            <div class="now-text">${now.text}</div>
          </div>
          <dl class="now-stats">
            <div><dt>Hissedilen</dt><dd>${Math.round(c.apparent_temperature)}°</dd></div>
            <div><dt>Nem</dt><dd>%${c.relative_humidity_2m}</dd></div>
            <div><dt>Rüzgâr</dt><dd>${Math.round(c.wind_speed_10m)} km/s</dd></div>
            <div><dt>Bulut</dt><dd>%${c.cloud_cover}</dd></div>
          </dl>
        </div>
        <div class="days">${days}</div>`;
    })
    .catch(() => {
      if (alive) page.querySelector('.status').textContent = 'Hava durumu şu an alınamadı. Pencereden bakmak zorundayız.';
    });

  return () => (alive = false);
}
