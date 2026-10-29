// oda WebGL2 istiyor. yoksa ya da ?basit varsa aynı içerik düz sayfa olarak açılıyor
// TODO: basit görünüm utils.js yüzünden three.js'i de çekiyor, sorun olursa esc'yi ayrı dosyaya al
const webgl = !!document.createElement('canvas').getContext('webgl2');
if (!webgl || new URLSearchParams(location.search).has('basit')) import('./simple.js');
else import('./main.js');
