import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('legacy-runtime.html?raw')) {
            return 'legacy-runtime';
          }

          if (id.includes('/src/legacy/')) {
            return 'clinic-pages';
          }
        },
      },
    },
  },
});
