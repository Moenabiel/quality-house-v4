import { defineConfig } from 'astro/config';

// Quality House v4 — The Consignment Dossier.
// Dev/preview bound to 127.0.0.1 only (City Law: localhost bind).
export default defineConfig({
  site: 'https://qualityhouseintl.com',
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto', assets: '_assets' },
  compressHTML: true,
  vite: {
    optimizeDeps: { include: ['three/webgpu', 'three/tsl'] },
    build: { chunkSizeWarningLimit: 1000 },
  },
});
