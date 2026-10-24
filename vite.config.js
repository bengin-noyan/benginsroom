import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 800 },
  // Bu makinede Chrome, HMR açıkken sayfayı ara sıra yarım yükleyip takılıyordu; değişiklikten sonra F5 ile yenile.
  server: { hmr: false },
});
