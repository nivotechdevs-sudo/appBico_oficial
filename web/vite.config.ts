/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` → dist/ (code-split, served over HTTP).
// `npm run build:standalone` → dist-standalone/index.html with everything inlined, which — like the
// legacy app — also works when opened straight from disk (file://).
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  return {
    base: './',
    plugins: [react(), ...(standalone ? [viteSingleFile()] : [])],
    build: {
      outDir: standalone ? 'dist-standalone' : 'dist',
      target: 'es2020'
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts']
    }
  };
});
