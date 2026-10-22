# benginsroom

Kullanıcıların nesnelerle etkileşime geçebileceği dinamik website.

Klasik bir web sayfası yerine ziyaretçiyi canlı, etkileşimli bir odanın içinde karşılayan mekânsal arayüz (spatial UI).
Odadaki eşyalar birer menü gibi çalışır: bir eşyaya tıklayınca kamera televizyona yaklaşır ve o eşyaya bağlı içerik TV ekranında açılır.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ klasörüne statik çıktı
```

## Eşyalar → kanallar

| Eşya | TV'de açılan | Kaynak |
| --- | --- | --- |
| Televizyon | Kanal rehberi | — |
| Kitaplık | Hakkımda | `config.about` |
| Bilgisayar | Projeler | GitHub API (canlı) |
| Pikap | Müzik | YouTube gömme |
| Pencere | Hava durumu | Open-Meteo (canlı) |
| Duvar saati | Saat + dünya saatleri | — |
| Oyun kolu | Yılan oyunu | — |
| Tablo | Galeri | `config.gallery` |
| Telefon | İletişim | `config.contact` |
| Lamba | Odanın ışığını açar/kapatır | — |
| Bitki | Dokununca sallanır | — |

Oda kendi kendine de yaşar: pencere gerçek saate göre gündüz/gece olur, bulut miktarı canlı hava verisinden gelir,
duvar saati gerçek saati gösterir, müzik çalarken plak döner, TV'nin odaya yaydığı ışık açık kanalın rengini alır.

## İçeriği değiştirmek

Metinler, linkler, video, galeri ve konum `src/config.js` içinde.

Yeni bir kanal eklemek için:

1. `src/channels/` altına `mount(host, ctx)` fonksiyonu dışa aktaran bir dosya yaz. `host` içine DOM'u kur, gerekiyorsa temizlik fonksiyonu döndür (interval, event listener vb.).
2. `src/channels/index.js` içindeki `channels` listesine ekle.
3. `src/furniture.js` sonundaki `items` listesinde bir eşyaya `channel: '<id>'` ver.

TV ekranı 1280×720 px'lik gerçek bir DOM öğesidir; iframe, video ve form gibi her şey çalışır.

## Yapı

```
src/
  main.js         render döngüsü, kamera akışı, eşya → kanal bağlantısı
  room.js         duvarlar, zemin, halı, ışıklar, toz zerreleri
  furniture.js    tüm eşyalar (kodla üretilir, harici model yok)
  tv.js           TV + CSS3D ekran, kanal geçişi, parazit efekti
  interaction.js  hover vurgusu, ipucu balonu, tıklama
  camera.js       sınırlı serbest bakış + yumuşak uçuşlar
  daylight.js     günün saatine göre gökyüzü ve ışık
  channels/       TV'de açılan içerikler
  services/       harici API'ler
```

### TV ekranı nasıl çalışıyor

Ekran içeriği `CSS3DRenderer` ile 3B TV'nin üzerine oturtulan gerçek bir DOM öğesidir. Uzaktan bakarken DOM katmanı
WebGL'in arkasında durur ve TV ekranı WebGL'de saydam bir "delik" olarak çizilir. Böylece ekranın önündeki eşyalar
ekranı doğru şekilde örter. TV'ye yakın ve karşıdan bakılınca DOM katmanı öne alınır ve ekran içeriği tıklanabilir hale gelir.
