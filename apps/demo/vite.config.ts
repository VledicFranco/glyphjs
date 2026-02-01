import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'node:crypto': path.resolve(__dirname, 'src/crypto-shim.ts'),
      crypto: path.resolve(__dirname, 'src/crypto-shim.ts'),
    },
  },
});
