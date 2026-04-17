import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 這裡就是關鍵！告訴 Vite 你的 GitHub 儲存庫名稱
  base: '/my-portfolio/',
  plugins: [vue()],
})