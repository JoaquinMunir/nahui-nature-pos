import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Agregamos los nuevos nombres a los assets
      includeAssets: ['icon-192.png', 'app-icon-192.png', 'app-icon-512.png', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Nahui Nature POS',
        short_name: 'Nahui POS',
        description: 'Punto de Venta para rutas de reparto de Nahui Nature',
        theme_color: '#5B8A3C', 
        background_color: '#F8F6EF',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            // Esta es la imagen que se instalará en el celular
            src: '/app-icon-192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            // Esta es la imagen que se instalará en el celular (tamaño grande)
            src: '/app-icon-512.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
