import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        short_name: 'ServiCUCEI',
        name: 'ServiCUCEI',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: '/icons/icon-512x512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        start_url: '/chatbot',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
      },
      workbox: {
        runtimeCaching: [
          {
            // la raiz de la url, direccion base de la app
            urlPattern: /^\/$/, // <-- Corregido: patrón para la raíz
            handler: 'NetworkFirst',
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
          },
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // Esto permite que el servidor sea accesible desde la red local
    allowedHosts: [
      'localhost',
      'd165-2806-310-116-9a47-fdb3-f969-539c-a6c0.ngrok-free.app'
    ]
  }
})