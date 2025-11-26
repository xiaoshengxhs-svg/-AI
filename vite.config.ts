import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // 这里的配置非常重要：它允许前端代码读取 process.env.API_KEY
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})