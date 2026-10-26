import { config } from '../config.js';

// Open-Meteo: anahtar gerektirmeyen ücretsiz hava durumu API'si.
const TTL = 10 * 60 * 1000;
let cache = null;

export function fetchWeather() {
  if (cache && Date.now() - cache.at < TTL) return cache.promise;
  const { latitude, longitude } = config.weather;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,cloud_cover,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5';
  const promise = fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
    return r.json();
  });
  cache = { at: Date.now(), promise };
  promise.catch(() => (cache = null));
  return promise;
}

const CODES = [
  [[0], 'Açık', '☀️'],
  [[1, 2], 'Parçalı bulutlu', '⛅'],
  [[3], 'Kapalı', '☁️'],
  [[45, 48], 'Sisli', '🌫️'],
  [[51, 53, 55, 56, 57], 'Çisenti', '🌦️'],
  [[61, 63, 65, 66, 67, 80, 81, 82], 'Yağmurlu', '🌧️'],
  [[71, 73, 75, 77, 85, 86], 'Karlı', '🌨️'],
  [[95, 96, 99], 'Fırtına', '⛈️'],
];

// WMO kodundan yağış şiddeti (0-1): 51-57 çisenti, 61-67 / 80-82 yağmur, 95+ fırtına, 71-77 / 85-86 kar.
export function precipitation(code = 0) {
  return {
    rain: code >= 51 && code <= 57 ? 0.5 : (code >= 61 && code <= 67) || (code >= 80 && code <= 82) || code >= 95 ? 1 : 0,
    snow: (code >= 71 && code <= 77) || code === 85 || code === 86 ? 1 : 0,
  };
}

export function describeWeather(code, isDay = 1) {
  const hit = CODES.find(([codes]) => codes.includes(code));
  if (!hit) return { text: 'Bilinmiyor', icon: '🌡️' };
  const icon = code === 0 && !isDay ? '🌙' : hit[2];
  return { text: hit[1], icon };
}
