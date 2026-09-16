import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        notFound: resolve(__dirname, '404.html'),
        landing: resolve(__dirname, 'index.html'),
        workspace: resolve(__dirname, 'app.html'),
        standaloneLanding: resolve(__dirname, 'landing.html'),
      },
    },
  },
});