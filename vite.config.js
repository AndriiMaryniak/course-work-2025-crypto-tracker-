import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cg-api': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/cg-api/, '')
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
