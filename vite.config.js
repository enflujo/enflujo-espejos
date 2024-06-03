import { defineConfig } from 'vite';
import { resolve } from 'path';
console.log(resolve(__dirname, 'paginas/liquido.html'));
export default defineConfig({
  // base: '/',
  server: {
    port: 3000,
  },
  publicDir: 'estaticos',
  build: {
    outDir: 'publico',
    assetsDir: 'estaticos',
    sourcemap: true,
    rollupOptions: {
      input: {
        principal: resolve(__dirname, 'index.html'),
        liquido: resolve(__dirname, 'liquido.html'),
      },
    },
  },
});
