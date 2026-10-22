// Odadaki içeriklerin tamamı buradan yönetilir.
// Metinleri, linkleri, videoları kendi içeriğinle değiştir.

export const config = {
  owner: 'Bengin',
  githubUser: 'bengin-noyan',

  about: {
    title: 'Merhaba, ben Bengin.',
    paragraphs: [
      'Bu oda benim dijital köşem. Klasik bir web sayfası yerine, yaşadığım ve ürettiğim bir mekânın içinde dolaşman için tasarlandı.',
      'Burada projelerimi, dinlediklerimi, ilham aldıklarımı ve bana ulaşabileceğin yolları bulacaksın. Her eşya bir kapı.',
    ],
    tags: ['Yazılım', 'Tasarım', 'Müzik', 'Oyunlar'],
  },

  music: {
    youtubeId: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio',
    artist: 'Lofi Girl · canlı yayın',
  },

  weather: {
    city: 'İstanbul',
    latitude: 41.01,
    longitude: 28.98,
  },

  gallery: [
    { src: 'https://picsum.photos/seed/benginsroom1/1280/720', caption: 'Sabah ışığı' },
    { src: 'https://picsum.photos/seed/benginsroom2/1280/720', caption: 'Yolda' },
    { src: 'https://picsum.photos/seed/benginsroom3/1280/720', caption: 'Şehir' },
    { src: 'https://picsum.photos/seed/benginsroom4/1280/720', caption: 'Sessizlik' },
  ],

  contact: [
    { label: 'GitHub', value: 'github.com/bengin-noyan', href: 'https://github.com/bengin-noyan' },
    { label: 'E-posta', value: 'merhaba@ornek.com', href: 'mailto:merhaba@ornek.com' },
    { label: 'LinkedIn', value: 'linkedin.com/in/kullanici', href: 'https://www.linkedin.com/' },
  ],
};
