import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  server: { port: 5173, open: true },
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false,
    // O chunk do three passa de 500kB, mas so e baixado por import()
    // dinamico em dispositivos que rodam a cena 3D.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Three.js é pesado: isola em um chunk próprio para não bloquear o first paint.
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        },
      },
    },
  },
});
