import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

/** Split stable vendor code and bulky case data into their own long-cacheable chunks. */
function manualChunks(id: string): string | undefined {
  const p = id.replace(/\\/g, '/');
  if (p.includes('/node_modules/')) {
    if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(p)) return 'motion';
    if (/\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)\//.test(p)) {
      return 'react';
    }
    return undefined;
  }
  if (p.includes('/src/data/cases/')) return 'cases';
  return undefined;
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks } },
  },
});
