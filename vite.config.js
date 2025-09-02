import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


// vite.config.js 加上
export default defineConfig({
  base: '/amber-anderson.github.io/',  // 重要！
  plugins: [react()]
})