import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Trailing slash so client routes like /api-keys aren't proxied to the backend.
      '/api/': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/media/': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});

