// 3B oda WebGL2 ister. Desteklenmiyorsa ya da ?basit ile istenirse aynı içerik düz bir sayfa olarak gösterilir.
// shortcut: basit görünüm utils.js üzerinden three.js'i de indirir; önemli olursa esc ayrı dosyaya taşınır.
const webgl = !!document.createElement('canvas').getContext('webgl2');
if (!webgl || new URLSearchParams(location.search).has('basit')) import('./simple.js');
else import('./main.js');
