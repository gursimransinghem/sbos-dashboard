import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/sbos-dashboard/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        finance: resolve(__dirname, 'finance-dashboard.html'),
        launchpad: resolve(__dirname, 'sbos-launchpad.html'),
        decisions: resolve(__dirname, 'decision-timeline.html'),
        menubar: resolve(__dirname, 'sbos-menubar.html'),
      },
    },
  },
});
