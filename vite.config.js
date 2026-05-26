import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repo name on GitHub — site is served from https://<user>.github.io/WBGG/
export default defineConfig({
  plugins: [react()],
  base: '/WBGG/',
  server: { port: 5173 }
});
