// Odadaki içeriklerin tamamı buradan yönetilir.
// Metinleri, linkleri, videoları kendi içeriğinle değiştir.

export const config = {
  owner: 'Bengin',

  // Kaynak: bengin-portfolio.vercel.app
  about: {
    title: 'Bengin Noyan',
    role: 'Software Developer',
    photo: 'bengin-noyan.jpg', // public/ içinde
    paragraphs: [
      'Pamukkale Üniversitesi Yönetim Bilişim Sistemleri bölümü mezunu olarak; C#, .NET, Go ve Python ekosistemlerinde modern web ve masaüstü uygulamaları geliştiriyorum.',
      'Kurumsal kaynak planlama (ERP), süreç otomasyonları ve veritabanı mimarileri üzerine uçtan uca sistemler kurgularken; yazılım altyapımı Makine Öğrenmesi ve Görüntü İşleme modellerini uygulamalara entegre etme yetkinliğiyle güçlendiriyorum.',
      'Yönetim Bilişim Sistemleri disiplininden gelen sistem analizi ve süreç yönetimi vizyonumu, güçlü yazılım pratikleriyle harmanlayarak karmaşık iş problemlerine katma değerli ve sürdürülebilir çözümler sunmayı hedefliyorum.',
    ],
    languages: ['Türkçe · Ana dil', 'İngilizce · B1', 'Almanca · A1'],
  },

  experience: [
    { role: 'Proje Lideri', org: 'NowlSoft', date: '10/2026 – Devam ediyor', place: 'Batman' },
    {
      role: 'Yazılım Geliştirme Stajyeri',
      org: 'NowlSoft',
      date: '07/2026 – 10/2026',
      place: 'Batman',
      desc: 'Kamu kurumları ve işletmeler için ERP ve süreç otomasyonları; Go (Wails3), C# (.NET), Vue 3 ve React ile LAN tabanlı dağıtık sistemler, UBL-TR 1.2 e-Fatura, RBAC ve YOLOv8 entegrasyonları.',
    },
    {
      role: 'IT Destek Asistanı · İŞKUR Gençlik Programı',
      org: 'Pamukkale Üniversitesi İİBF Bilgi İşlem',
      date: '01/2026 – 06/2026',
      place: 'Denizli',
      desc: 'Sunucu ve bilgisayar yapılandırması, yazılım kurulum ve lisanslama, Active Directory yetkilendirmeleri, veri yedekleme takibi ve ticket yönetimi.',
    },
    {
      role: 'Yönetim Bilişim Sistemleri, Lisans',
      org: 'Pamukkale Üniversitesi',
      date: '09/2022 – 06/2026',
      place: 'Denizli',
    },
  ],

  skills: [
    { group: 'Diller', items: ['Go', 'C#', '.NET', 'Python', 'TypeScript', 'JavaScript', 'C', 'HTML5', 'CSS3', 'VBA'] },
    {
      group: 'Web & masaüstü',
      items: ['Wails3', 'Vue 3', 'React 18', 'Tailwind CSS', 'Vite', 'Node.js', 'Streamlit', 'chi', 'Leaflet', 'RESTful API', 'Multi-tenant SaaS', 'RBAC', 'Web3', 'DApps'],
    },
    {
      group: 'Veritabanı',
      items: ['PostgreSQL', 'MS SQL Server', 'SQLite', 'Firebase', 'Row-Level Security', 'Triggers', 'ER diyagramları', '3NF'],
    },
    {
      group: 'Yapay zekâ & görüntü',
      items: ['YOLOv8', 'Computer Vision', 'Machine / Deep Learning', 'OpenCV', 'Ultralytics', 'Transfer Learning', 'Roboflow', 'Gemini API', 'Scikit-learn', 'NumPy', 'Pandas', 'Plotly'],
    },
    {
      group: 'Entegrasyonlar',
      items: ['UBL-TR 1.2 e-Fatura', 'QNB e-Fatura / e-Arşiv', 'iyzico', 'NetGSM', 'WhatsApp Business', 'Google Calendar', 'Sentinel Hub', 'TCMB Kur'],
    },
    {
      group: 'DevOps & test',
      items: ['Docker', 'Docker Compose', 'nginx', 'GitHub Actions', 'Linux', 'Playwright', 'Birim & entegrasyon testi', 'Yük testi'],
    },
    {
      group: 'Araçlar & yöntem',
      items: ['Git', 'GitHub', 'Postman', 'VS Code', 'Visual Studio', 'PyCharm', 'SDLC', 'UML', 'DFD', 'NPV / IRR'],
    },
  ],

  // Portföyde veren kurum ve tarih yazmıyor; eklenirse `org` ve `date` alanları kanalda görünür.
  certificates: [
    { name: 'The Complete Full-Stack Web Development Bootcamp' },
    { name: 'Uygulamalarla SQL Öğreniyorum' },
    { name: 'Versiyon Kontrolleri: Git ve GitHub' },
    { name: 'Go ile Programlamaya Giriş' },
  ],

  projects: [
    {
      name: 'DentalPro',
      year: 'Canlıda',
      desc: 'Diş klinikleri ve protez laboratuvarları için çok kiracılı SaaS. PostgreSQL RLS ile veri izolasyonu, ödeme, SMS ve e-Fatura entegrasyonları.',
      tags: ['Go', 'Vue 3', 'PostgreSQL'],
      href: 'https://dentalpro.tr',
    },
    {
      name: 'NowlTarım',
      year: '2026',
      desc: '~20.000 dönümlük tarım işletmeleri için 13 modüllü ERP; uydu NDVI haritaları ve YOLOv8 + Gemini zirai analizleri.',
      tags: ['Go', 'React 18', 'PostgreSQL 16'],
    },
    {
      name: 'Bitki Hastalığı Teşhisi',
      year: '2026',
      desc: 'Bitirme tezi: YOLOv8 ile bitki hastalığı teşhisi (%94.1 mAP50) ve Streamlit tabanlı karar destek paneli.',
      tags: ['Python', 'YOLOv8', 'Streamlit'],
    },
    {
      name: 'BraDent',
      year: '2026',
      desc: 'Diş klinikleri için yerel ağda istemci-sunucu modelinde çalışan masaüstü klinik otomasyonu; FDI diş şeması, randevu ve SMS kuyruğu.',
      tags: ['Go', 'Wails3', 'PostgreSQL 17'],
    },
    {
      name: 'MLS KİMYA',
      year: '2026',
      desc: 'CGO-free saf Go ile tek dosyalı (.exe) muhasebe ve iş takip otomasyonu; tamsayı tabanlı kur farkı hesap motoru.',
      tags: ['Go', 'Wails3', 'SQLite'],
    },
    {
      name: 'PauGo',
      year: '2025',
      desc: 'Kampüs içi akıllı e-scooter paylaşım sisteminin uçtan uca tasarımı ve finansal fizibilitesi (IRR %60, NPV 7.22M TL).',
      tags: ['C#', 'MS SQL Server', 'UML'],
    },
  ],

  // Plak çaların çaldığı parçalar (public/music). Kayıtlar Wikimedia Commons'tan, kamu malı (public domain).
  music: [
    { src: 'music/debussy-clair-de-lune.mp3', title: 'Clair de Lune', artist: 'Claude Debussy' },
    { src: 'music/beethoven-moonlight.mp3', title: 'Ay Işığı Sonatı', artist: 'Ludwig van Beethoven' },
    { src: 'music/chopin-nocturne-op9-2.mp3', title: 'Nocturne Op. 9 No. 2', artist: 'Frédéric Chopin' },
    { src: 'music/satie-gymnopedie-1.mp3', title: 'Gymnopédie No. 1', artist: 'Erik Satie' },
    { src: 'music/bach-cello-suite-1-prelude.mp3', title: 'Çello Süiti No. 1 · Prélude', artist: 'J. S. Bach' },
    { src: 'music/satie-gnossienne-1.mp3', title: 'Gnossienne No. 1', artist: 'Erik Satie' },
    { src: 'music/schumann-traumerei.mp3', title: 'Träumerei', artist: 'Robert Schumann' },
    { src: 'music/bach-air.mp3', title: 'Air (Sol Teli Üzerine Arya)', artist: 'J. S. Bach' },
    { src: 'music/chopin-waltz-op64-2.mp3', title: 'Vals Op. 64 No. 2', artist: 'Frédéric Chopin' },
    { src: 'music/mozart-quartet-15-andante.mp3', title: 'Yaylı Çalgılar Dörtlüsü No. 15 · Andante', artist: 'W. A. Mozart' },
    { src: 'music/satie-gymnopedie-3.mp3', title: 'Gymnopédie No. 3', artist: 'Erik Satie' },
  ],

  weather: {
    city: 'İstanbul',
    latitude: 41.01,
    longitude: 28.98,
  },

  contact: [
    { label: 'GitHub', value: 'github.com/bengin-noyan', href: 'https://github.com/bengin-noyan' },
    { label: 'E-posta', value: 'benginnyn72@gmail.com', href: 'mailto:benginnyn72@gmail.com' },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/bengin-noyan',
      href: 'https://www.linkedin.com/in/bengin-noyan-028b07312',
    },
  ],
};
