import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Усі запити, які починаються з /cg-api,
      // Vite буде прокидати на https://api.coingecko.com/api/v3
      '/cg-api': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/cg-api/, ''),
      },
    },
  },
});
