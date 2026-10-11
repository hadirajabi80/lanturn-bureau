import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
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
  if (p.includes('/src/grid/engine/')) return 'engine';
  if (p.includes('/src/grid/board/')) return 'board';
  return undefined;
}

const THEME = '#120E0B';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered by src/pwa (workbox-window) so updates show a toast instead of force-reloading.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/favicon-32.png', 'icons/apple-touch-icon.png', 'icons/og.png'],
      manifest: {
        id: '/',
        name: 'Lantern Bureau — Floorplan Mysteries',
        short_name: 'Floorplans',
        description: 'Pin the suspects, cross out the impossible, stamp the case closed. 1,040 floor-plan murder puzzles across eight districts of Greywick.',
        lang: 'en',
        start_url: '/plans',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: THEME,
        theme_color: THEME,
        categories: ['games', 'puzzle'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        globIgnores: ['**/icons/og.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/sw\.js$/, /^\/workbox-/],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks } },
  },
});
