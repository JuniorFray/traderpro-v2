import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

 // ✅ ADICIONAR ESTA SEÇÃO:
  server: {
    port: 5174,
    open: '/admin/login'  // Abre direto no Admin!
  },
  build: {
    outDir: 'dist-admin',
    emptyOutDir: true,
    rollupOptions: {
      input: './index-admin.html'  // ✅ Correto!
    }
  },
  define: {
    'import.meta.env.VITE_ADMIN_MODE': JSON.stringify('true'),
  }
})
