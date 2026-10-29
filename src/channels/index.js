import * as menu from './menu.js';
import * as about from './about.js';
import * as projects from './projects.js';
import * as weather from './weather.js';
import * as time from './time.js';
import * as game from './game.js';
import * as contact from './contact.js';

// sıra = kanal numarası, accent = TV ışığının rengi
export const channels = [
  { id: 'menu', title: 'Kanal rehberi', icon: '📺', accent: '#8fb3ff', mount: menu.mount },
  { id: 'about', title: 'Hakkımda', icon: '📚', accent: '#e9c46a', mount: about.mount },
  { id: 'projects', title: 'Projeler', icon: '💻', accent: '#7aa2f7', mount: projects.mount },
  { id: 'weather', title: 'Hava durumu', icon: '🌤️', accent: '#7fd1ff', mount: weather.mount },
  { id: 'time', title: 'Saat', icon: '🕰️', accent: '#ffd27a', mount: time.mount },
  { id: 'game', title: 'Yılan', icon: '🎮', accent: '#7CFF8A', mount: game.mount },
  { id: 'contact', title: 'İletişim', icon: '📞', accent: '#c59bff', mount: contact.mount },
];
