import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom)[\\/]/,
              priority: 20,
            },
            {
              name: 'mui-vendor',
              test: /node_modules[\\/](?:@mui|@emotion)[\\/]/,
              priority: 15,
            },
            {
              name: 'forms-vendor',
              test: /node_modules[\\/](?:react-hook-form|@hookform|zod)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
