import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Vite 8 uses rolldown + oxc by default — no esbuild needed
    minify: true,
    // Raise chunk warning threshold (lucide-react + firebase are large)
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Manual chunk splitting — function form required by rolldown/Vite 8
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },

  // Ensure env vars are picked up correctly
  envPrefix: 'VITE_',
})
