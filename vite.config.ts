// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue(),
  ],
  base: '/KonwMe/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          //vue核心库
          if (id.includes('node_modules/vue') || 
              id.includes('node_modules/vue-router') || 
              id.includes('node_modules/pinia')) {
                return 'vue-vendor'
              }

          // Element Plus
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus'
          }

          //Echarts
          if (id.includes('node_modules/echarts')) {
            return 'echarts'
          }

          //其他第三方组件库
          if(id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    // 提高警告阈值到 1000KB
    chunkSizeWarningLimit: 1000,
  },
})