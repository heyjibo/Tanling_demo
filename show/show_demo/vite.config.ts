import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
    server: {
    // 配置允许访问的主机列表
    allowedHosts: [
      'localhost', // 保留本地访问（可选，默认已允许）
      '127.0.0.1', // 保留本地访问（可选，默认已允许）
      'hrs-cod-arcade-synopsis.trycloudflare.com' // 添加localtunnel生成的公网域名
    ]
  }
})