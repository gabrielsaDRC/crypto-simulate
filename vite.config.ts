import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/binance-futures-trading-app/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
