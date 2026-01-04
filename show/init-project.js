const fs = require('fs');
const path = require('path');

const projectName = 'show_demo';
const rootDir = path.join(process.cwd(), projectName);

// ---------------------------------------------------------
// 1. 目录结构定义 (严格对应规划)
// ---------------------------------------------------------
const directories = [
  'public',
  'src/api',
  'src/assets/images',
  'src/assets/styles',
  'src/components/Charts',
  'src/components/Common',
  'src/components/Visual',
  'src/composables',
  'src/layout',
  'src/router',
  'src/store',
  'src/types',
  'src/utils',
  // Views - 二级目录结构
  'src/views/Dashboard',
  'src/views/Sound',
  'src/views/Light',
  'src/views/Compute',
  'src/views/Integration',
];

// ---------------------------------------------------------
// 2. 文件内容定义
// ---------------------------------------------------------
const files = {
  // === 根目录配置 ===
  'package.json': JSON.stringify({
    "name": projectName,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vue-tsc && vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "vue": "^3.3.4",
      "vue-router": "^4.2.4",
      "pinia": "^2.1.6",
      "element-plus": "^2.3.12",
      "echarts": "^5.4.3",
      "@element-plus/icons-vue": "^2.1.0",
      "@vueuse/core": "^10.4.1"
    },
    "devDependencies": {
      "@vitejs/plugin-vue": "^4.2.3",
      "typescript": "^5.0.2",
      "vite": "^4.4.5",
      "vue-tsc": "^1.8.5",
      "tailwindcss": "^3.3.3",
      "postcss": "^8.4.27",
      "autoprefixer": "^10.4.14",
      "@types/node": "^20.5.1"
    }
  }, null, 2),

  'vite.config.ts': `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})`,

  'tsconfig.json': JSON.stringify({
    "compilerOptions": {
      "target": "ESNext",
      "useDefineForClassFields": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "strict": true,
      "jsx": "preserve",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "esModuleInterop": true,
      "lib": ["ESNext", "DOM"],
      "skipLibCheck": true,
      "noEmit": true,
      "baseUrl": ".",
      "paths": { "@/*": ["src/*"] }
    },
    "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }, null, 2),

  'tsconfig.node.json': JSON.stringify({
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
  }, null, 2),

  'tailwind.config.js': `
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#06b6d4', // Cyan
        secondary: '#3b82f6', // Blue
        dark: '#0f172a',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    },
  },
  plugins: [],
}`,

  'postcss.config.js': `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`,
  
  'index.html': `
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo系统 - 工业数字孪生</title>
  </head>
  <body class="bg-dark text-white">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,

  // === SRC 核心入口 ===
  'src/main.ts': `
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')`,

  'src/App.vue': `
<template>
  <router-view />
</template>`,

  'src/assets/styles/main.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

body { margin: 0; padding: 0; background-color: #0f172a; }`,

  // === Types ===
  'src/types/dashboard.d.ts': `
export interface ChartData {
  label: string;
  value: number;
}
export interface DeviceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  temperature?: number;
}`,

  // === Composables (核心 Hook) ===
  'src/composables/useMockData.ts': `
import { ref, onUnmounted } from 'vue';

// 模拟实时数值波动
export function useRealtimeValue(initial: number, range: number = 5) {
  const value = ref(initial);
  const interval = setInterval(() => {
    const diff = (Math.random() - 0.5) * range;
    value.value = Number((value.value + diff).toFixed(2));
  }, 1500);
  onUnmounted(() => clearInterval(interval));
  return value;
}

// 模拟图表数组数据生成
export function useChartData(length: number = 10) {
  return Array.from({ length }, () => Math.floor(Math.random() * 100));
}`,

  // === Components: Common (通用组件) ===
  'src/components/Common/GlassCard.vue': `
<template>
  <div class="glass-card relative p-6 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-cyan-900/20 hover:shadow-xl">
    <div class="absolute inset-0 bg-slate-800/60 backdrop-blur-md z-0"></div>
    <div class="absolute inset-0 border border-glass-border rounded-xl z-10 pointer-events-none"></div>
    <div class="relative z-20 h-full">
      <div v-if="title" class="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <h3 class="text-lg font-bold text-cyan-400 tracking-wide">{{ title }}</h3>
        <slot name="action"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
<style scoped>
.glass-card { box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
</style>`,

  // === Components: Charts (图表封装示例) ===
  'src/components/Charts/BaseLineChart.vue': `
<template>
  <div ref="chartRef" class="w-full h-full min-h-[200px]"></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLElement>();
onMounted(() => {
  if(!chartRef.value) return;
  const myChart = echarts.init(chartRef.value);
  myChart.setOption({
    grid: { top: 10, bottom: 20, left: 30, right: 10 },
    xAxis: { type: 'category', data: ['0s','10s','20s','30s','40s','50s'] },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#333' } } },
    series: [{ data: [120, 200, 150, 80, 70, 110], type: 'line', smooth: true, itemStyle: { color: '#06b6d4' } }]
  });
});
</script>`,

  // === Layout (布局) ===
  'src/layout/MainLayout.vue': `
<template>
  <div class="flex h-screen w-full bg-dark text-slate-200 overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <Header />
      <main class="flex-1 p-6 overflow-y-auto overflow-x-hidden relative">
        <!-- 背景装饰 -->
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none"></div>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>
<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>`,

  'src/layout/Sidebar.vue': `
<template>
  <aside class="w-64 h-full bg-slate-900/80 border-r border-slate-700/50 flex flex-col backdrop-blur-sm z-30">
    <div class="h-16 flex items-center justify-center border-b border-slate-700/50">
      <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">ShowDemo</span>
    </div>
    <nav class="flex-1 p-4 space-y-2">
      <router-link to="/dashboard" class="nav-item">🏠 总览驾驶舱</router-link>
      <div class="text-xs text-slate-500 mt-4 mb-2 px-2">核心功能模块</div>
      <router-link to="/sound" class="nav-item">🔊 声 - 智能感知</router-link>
      <router-link to="/light" class="nav-item">💡 光 - 预警预测</router-link>
      <router-link to="/compute" class="nav-item">🧠 算 - 智慧大脑</router-link>
      <router-link to="/integration" class="nav-item">🔗 集成 - 基础底座</router-link>
    </nav>
  </aside>
</template>
<style scoped>
.nav-item { @apply block px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors; }
.router-link-active { @apply bg-cyan-900/30 text-cyan-400 border border-cyan-500/20; }
</style>`,

  'src/layout/Header.vue': `
<template>
  <header class="h-16 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center px-6 z-20 backdrop-blur-sm">
    <div class="text-sm text-slate-400">当前演示项目: <span class="text-white">连云港一期项目 (Mock环境)</span></div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span class="text-xs text-green-400">系统运行正常</span>
      </div>
    </div>
  </header>
</template>`,

  // === Router (路由) ===
  'src/router/index.ts': `
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('@/views/Dashboard/index.vue') },
      { path: 'sound', component: () => import('@/views/Sound/index.vue') },
      { path: 'light', component: () => import('@/views/Light/index.vue') },
      { path: 'compute', component: () => import('@/views/Compute/index.vue') },
      { path: 'integration', component: () => import('@/views/Integration/index.vue') },
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router`,

  // =========================================================
  // === VIEWS (核心业务页面 - 对应您的4大需求) ===
  // =========================================================

  // --- 0. Dashboard ---
  'src/views/Dashboard/index.vue': `
<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-white">全厂运行总览</h2>
    <div class="grid grid-cols-4 gap-6">
      <GlassCard title="系统健康度" class="h-40"><div class="text-4xl text-green-400 font-mono mt-4">98.5%</div></GlassCard>
      <GlassCard title="在线设备" class="h-40"><div class="text-4xl text-blue-400 font-mono mt-4">1,240</div></GlassCard>
      <GlassCard title="今日告警" class="h-40"><div class="text-4xl text-yellow-400 font-mono mt-4">3</div></GlassCard>
      <GlassCard title="节能估算" class="h-40"><div class="text-4xl text-cyan-400 font-mono mt-4">12%</div></GlassCard>
    </div>
  </div>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>`,

  // --- 1. Sound (声) ---
  'src/views/Sound/index.vue': `
<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
    <VoicePrint />
    <Ultrasonic />
  </div>
</template>
<script setup lang="ts">
import VoicePrint from './VoicePrint.vue';
import Ultrasonic from './Ultrasonic.vue';
</script>`,

  'src/views/Sound/VoicePrint.vue': `
<template>
  <GlassCard title="a) NXP 声纹监测系统">
    <template #action><el-tag size="small" effect="dark">监测中</el-tag></template>
    <div class="h-64 bg-slate-900/50 rounded flex items-center justify-center border border-slate-700 border-dashed">
      <p class="text-slate-500">[ECharts] 声纹波形实时跳动图</p>
    </div>
    <div class="mt-4 text-sm text-slate-300">
      <p>关联技术: 恩智浦(NXP) 边缘计算芯片</p>
      <p>当前精度: 99.2%</p>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>`,

  'src/views/Sound/Ultrasonic.vue': `
<template>
  <GlassCard title="b) 超声波精准定位">
    <div class="h-64 bg-slate-900/50 rounded flex items-center justify-center border border-slate-700 border-dashed relative">
      <div class="absolute top-10 left-20 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
      <p class="text-slate-500">[Canvas] 工厂平面图 - 故障热点</p>
    </div>
    <div class="mt-4 text-sm text-slate-300">
      <p>应用: 工业环境气体泄漏/机械摩擦检测</p>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>`,

  // --- 2. Light (光) ---
  'src/views/Light/index.vue': `
<template>
  <div class="flex flex-col gap-6">
    <FiberWarning />
    <PipePrediction />
  </div>
</template>
<script setup lang="ts">
import FiberWarning from './FiberWarning.vue';
import PipePrediction from './PipePrediction.vue';
</script>`,

  'src/views/Light/FiberWarning.vue': `
<template>
  <GlassCard title="a) 光纤传感预警系统 (火电/LNG)">
    <div class="h-48 bg-slate-900/50 rounded flex items-center justify-center border border-slate-700 border-dashed">
      <p class="text-slate-500">[ECharts] 3km光纤温度分布折线图</p>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>`,

  'src/views/Light/PipePrediction.vue': `
<template>
  <GlassCard title="b) AI 管损分析与预测">
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2 h-48 bg-slate-900/50 rounded flex items-center justify-center border border-slate-700 border-dashed">
         <p class="text-slate-500">[ECharts] 腐蚀趋势预测曲线</p>
      </div>
      <div class="col-span-1 flex flex-col justify-center items-center bg-cyan-900/20 rounded border border-cyan-500/20">
        <span class="text-slate-400 text-sm">减少停机时间</span>
        <span class="text-2xl font-bold text-white mt-2">15.5 小时</span>
      </div>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>`,

  // --- 3. Compute (算) ---
  'src/views/Compute/index.vue': `
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <DeviceDiagnosis />
    <PLCOptimization />
  </div>
</template>
<script setup lang="ts">
import DeviceDiagnosis from './DeviceDiagnosis.vue';
import PLCOptimization from './PLCOptimization.vue';
</script>`,

  'src/views/Compute/DeviceDiagnosis.vue': `
<template>
  <GlassCard title="a) 安庆石化设备诊断 (AI)">
    <div class="h-60 bg-slate-900/50 rounded flex items-center justify-center border border-slate-700 border-dashed">
      <p class="text-slate-500">[ECharts] 仪表盘：健康度评分</p>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>`,

  'src/views/Compute/PLCOptimization.vue': `
<template>
  <GlassCard title="b) 循环水 PLC 控制优化">
    <div class="h-60 bg-slate-900/50 rounded flex items-center justify-center border border-slate-700 border-dashed">
      <p class="text-slate-500">[SVG] 水循环流程动态图</p>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>`,

  // --- 4. Integration (集成) ---
  'src/views/Integration/index.vue': `
<template>
  <div class="space-y-6">
    <IOTBase />
    <IPShowcase />
  </div>
</template>
<script setup lang="ts">
import IOTBase from './IOTBase.vue';
import IPShowcase from './IPShowcase.vue';
</script>`,

  'src/views/Integration/IOTBase.vue': `
<template>
  <GlassCard title="a) 工业物联网底座 (连云港一期)">
    <el-table :data="tableData" style="width: 100%; background: transparent" class="transparent-table">
      <el-table-column prop="date" label="时间" width="180" />
      <el-table-column prop="name" label="采集点位" width="180" />
      <el-table-column prop="value" label="实时数值" />
    </el-table>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
const tableData = [
  { date: '10:42:01', name: '泵站A-流量', value: '420 m³/h' },
  { date: '10:42:02', name: '阀门B-开度', value: '85 %' },
];
</script>
<style>
.transparent-table, .transparent-table tr, .transparent-table th, .transparent-table td {
  background-color: transparent !important;
  color: #ccc !important;
  border-bottom: 1px solid #333 !important;
}
</style>`,

  'src/views/Integration/IPShowcase.vue': `
<template>
  <GlassCard title="b) IP 知识产权展示">
    <div class="grid grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="h-32 bg-slate-800 rounded border border-slate-600 flex items-center justify-center text-xs text-slate-500">
        专利证书截图 {{i}}
      </div>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>`,
};

// ---------------------------------------------------------
// 3. 执行写入逻辑
// ---------------------------------------------------------
console.log(`\x1b[36m🚀 正在创建项目: ${projectName} ...\x1b[0m`);

// 创建根目录
if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir);

// 创建文件夹
directories.forEach(dir => {
  const target = path.join(rootDir, dir);
  if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    console.log(`  📁 创建目录: ${dir}`);
  }
});

// 写入文件
Object.entries(files).forEach(([filePath, content]) => {
  const target = path.join(rootDir, filePath);
  // 确保父级目录存在 (防止某些未定义的深层目录报错)
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(target, content.trim());
  console.log(`  📄 写入文件: ${filePath}`);
});

console.log(`
\x1b[32m✅ 项目结构创建完成！\x1b[0m

-------------------------------------------------------
  \x1b[33m下一步操作指南:\x1b[0m
  1. 进入项目目录:   \x1b[36mcd ${projectName}\x1b[0m
  2. 安装依赖:       \x1b[36mnpm install\x1b[0m
  3. 启动开发服务器: \x1b[36mnpm run dev\x1b[0m
-------------------------------------------------------
`);
