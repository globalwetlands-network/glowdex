/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  // GitHub Pages path the build is served under (GLO-181). Build-time config from
  // the PAGES_BASE_PATH repo variable, not a VITE_ var: an unset Actions variable
  // expands to '', so fall back with || and normalise to /leading/trailing/ slashes.
  const pagesBase = (process.env.PAGES_BASE_PATH || '/glowdex/')
    .replace(/^\/*/, '/')
    .replace(/\/*$/, '/');

  return {
    base: isBuild ? pagesBase : '/',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };
});
