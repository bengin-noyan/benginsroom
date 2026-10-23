# CLAUDE.md

Bu dosya, bu depoda çalışırken Claude Code'a yol gösterir. Kullanıcıya yönelik açıklama `README.md` içinde.

## Proje

**benginsroom**: ziyaretçiyi 3B, etkileşimli bir odada karşılayan kişisel site (spatial UI). Odadaki her eşya bir
menü öğesidir: tıklanınca kamera TV'ye uçar ve eşyaya bağlı "kanal" TV ekranında açılır. Bazı eşyalar kanal açmak
yerine odada bir şey yapar (lamba ışığı açar/kapatır, bitki sallanır).

- Teknoloji: Vite 5 + Three.js 0.170, saf JavaScript (ES modülleri). Framework, TypeScript ya da test yok.
- Bütün 3B modeller kodla üretilir (`furniture.js`, `room.js`). Harici model ya da doku dosyası yok; dokular
  `utils.canvasTexture` ile canvas'tan üretilir.
- Arayüz metinleri ve kod yorumları **Türkçe**.
- Commit mesajları İngilizce ve Conventional Commits biçiminde (`feat:`, `fix:`, `docs:`, `chore:` …).
  Commit ve PR'lara `Co-Authored-By: Claude` ya da "Generated with Claude Code" gibi atıf satırları **eklenmez**.

## Komutlar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ (vite.config.js: base './' → statik hosting'e uygun göreli yollar)
npm run preview
```

Lint ya da test komutu yok. Bir değişikliği doğrulamak için `npm run build` çalıştır ve tarayıcıda dene.

## Mimari

- `src/main.js`: giriş noktası. WebGL ve CSS3D renderer'ları kurar, odayı, eşyaları ve TV'yi sahneye ekler,
  kamera akışını (genel görünüm ↔ TV odağı), dock, ipucu ve Esc/geri davranışını yönetir, render döngüsünü çalıştırır.
- `src/tv.js`: TV modeli ve 1280×720 px'lik DOM ekranı (`SCREEN_PX`). Kanal geçişi, parazit efekti, TV'nin odaya
  yaydığı ışık (kanalın `accent` rengini alır).
- **TV ekranı tekniği:** ekran, `CSS3DRenderer` ile TV'ye yerleştirilmiş gerçek bir DOM öğesi. WebGL tarafında ekran
  saydam bir "delik" olarak çizilir ve DOM katmanı WebGL'in arkasında durur, böylece öndeki eşyalar ekranı doğru örter.
  Kamera TV'ye yakın ve karşıdan bakınca (`tv.isViewedHeadOn`) DOM katmanı öne alınır ve tıklanabilir olur.
  Bu katman sırası bozulursa ekran ya görünmez ya da tıklanamaz hale gelir.
- `src/furniture.js`: eşyalar. Dosyanın sonundaki `buildFurniture` içinde `items` listesi var. Her öğe
  `{ id, label, hint, object }` ile birlikte ya `channel: '<kanal id>'` ya da `action: () => ...` alır.
- `src/room.js` (duvarlar, ışıklar, toz; `ROOM` ölçüleri), `src/camera.js` (`CameraRig`: sınırlı serbest bakış +
  yumuşak uçuşlar), `src/interaction.js` (hover vurgusu, ipucu balonu, tıklama), `src/daylight.js` (gerçek saate göre
  gökyüzü ve ışık).
- `src/channels/`: TV içerikleri. Her dosya `mount(host, ctx)` dışa aktarır, DOM'u `host` içine kurar ve gerekiyorsa
  temizlik fonksiyonu döndürür (interval, listener vb.). `ctx` içinde `channels` ve `goTo(id)` var.
  Kayıt `channels/index.js` içinde: listedeki sıra kanal numarasıdır, `accent` TV ışığının rengidir.
- `src/services/`: harici API'ler. `weather.js` Open-Meteo'yu (anahtarsız) 10 dakikalık önbellekle çağırır. Projeler
  kanalı GitHub API'sini canlı kullanır (`config.githubUser`).
- `src/config.js`: tüm kişisel içerik (hakkımda, müzik/YouTube ID, hava konumu, galeri, iletişim). İçerik
  değişikliği buraya yapılır, kanal kodunun içine yazılmaz.
- `src/utils.js`: `esc` (HTML kaçışı), `wait`, `easeInOutCubic`, `mulberry32` (tohumlu rastgele), `canvasTexture`.

## Kurallar

- Kanallar DOM'u template string + `innerHTML` ile kurar. Config'ten ya da API'den gelen her değeri `esc()` ile kaçır.
- Yeni kanal: `src/channels/<ad>.js` yaz → `channels/index.js` listesine ekle → `furniture.js` içindeki `items`'ta bir
  eşyaya `channel: '<ad>'` ver.
- Kanal açıkken başlatılan her interval ya da listener, `mount`'un döndürdüğü temizlik fonksiyonunda kapatılmalı.
- Harici bağımlılık eklemeden önce sor. Şu anki tek runtime bağımlılığı `three`.
- Stiller `src/style.css` içinde. Fontlar Google Fonts'tan yükleniyor (Space Grotesk, ekran için VT323).

## Durum (2026-10-23)

- Tamamlananlar: oda + 10 eşya, TV ve kanal sistemi, 9 kanal (rehber, hakkımda, projeler, müzik, hava durumu, saat,
  yılan oyunu, galeri, iletişim), gündüz/gece döngüsü, canlı hava verisine bağlı bulutlar, giriş ekranı, dock.
- Hakkımda metni, e-posta ve LinkedIn gerçek bilgilerle güncellendi (kaynak: bengin-portfolio.vercel.app).
- Yer tutucu içerik duruyor: `config.js` içindeki picsum galeri görselleri gerçek fotoğraflarla değiştirilecek.
- TV ekranı 1280×720 sabit ve kaydırma yok: hakkımda ve iletişim kanallarına içerik eklerken taşmaya dikkat et.
