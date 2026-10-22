import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages menaruh website di https://<username>.github.io/Open-Chat-/
// jadi semua alamat file harus diawali /Open-Chat-/ (lihat docs/architecture.md bagian 12).
export default defineConfig({
  base: '/Open-Chat-/',
  plugins: [react()],
});
