<template>
  <div>
    <!-- 安庆石化设备诊断页面 -->
    <DeviceDiagnosis 
      v-if="currentPage === 'anqing'" 
      @back="goBackToHome" 
    />
    
    <!-- 循环水PLC控制优化页面 -->
    <PLCOptimization 
      v-if="currentPage === 'water'" 
      @back="goBackToHome" 
    />
    
    <!-- 主页导航页面 -->
    <div v-if="currentPage === 'home'" class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <!-- 顶部装饰 -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
      
      <div class="max-w-7xl mx-auto">
        <!-- 标题区域 -->
        <div class="text-center mb-12 pt-8">
          <div class="inline-flex items-center mb-6">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-6">
              <span class="text-4xl">⚡</span>
            </div>
            <div>
              <h1 class="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2">
                智能工业平台
              </h1>
              <p class="text-xl text-slate-300">
                工业设备智能管理与优化控制系统
              </p>
            </div>
          </div>
        </div>

        <!-- 导航卡片区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-16">
          <!-- 安庆石化设备诊断卡片 -->
          <div 
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
            @click="navigateToAnqing"
          >
            <!-- 背景光效 -->
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div class="relative z-10 p-10">
              <!-- 图标和标题 -->
              <div class="flex items-center mb-8">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <span class="text-4xl">🏭</span>
                </div>
                <div class="ml-6">
                  <h3 class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-cyan-300 transition-colors">
                    安庆石化设备诊断
                  </h3>
                  <div class="flex items-center">
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium">设备诊断</span>
                    <span class="mx-2 text-slate-500">•</span>
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium">异常检测</span>
                    <span class="mx-2 text-slate-500">•</span>
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium">AI预测</span>
                  </div>
                </div>
              </div>
              
              <!-- 描述 -->
              <p class="text-slate-400 text-lg mb-8 leading-relaxed border-l-4 border-cyan-500/30 pl-4">
                安庆石化设备智能诊断系统，实时监测生产设备运行状态，
                基于AI算法进行异常检测和故障预测，保障生产安全
              </p>
              
              <!-- 核心设备 -->
              <div class="mb-8">
                <h4 class="text-sm text-slate-500 mb-3">主要监测设备</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm">反应器ARA-21201</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm">泵P-2106A/S</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm">流量控制器FC21101</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm">阀门V-601B</span>
                </div>
              </div>
              
              <!-- 进入按钮 -->
              <div class="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div class="text-sm text-slate-500">
                  在线设备: <span class="text-cyan-400 font-bold">28台</span>
                </div>
                <div class="flex items-center space-x-3 group-hover:space-x-4 transition-all duration-300">
                  <span class="text-slate-400 group-hover:text-slate-300 transition-colors">进入系统</span>
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300 shadow-lg group-hover:shadow-cyan-500/30">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 悬停效果边框 -->
            <div class="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/30 rounded-3xl transition-all duration-500"></div>
          </div>

          <!-- 循环水PLC控制优化卡片 -->
          <div 
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
            @click="navigateToWater"
          >
            <!-- 背景光效 -->
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div class="relative z-10 p-10">
              <!-- 图标和标题 -->
              <div class="flex items-center mb-8">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <span class="text-4xl">💧</span>
                </div>
                <div class="ml-6">
                  <h3 class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-purple-300 transition-colors">
                    循环水PLC控制优化
                  </h3>
                  <div class="flex items-center">
                    <span class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium">PLC控制</span>
                    <span class="mx-2 text-slate-500">•</span>
                    <span class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium">节能优化</span>
                    <span class="mx-2 text-slate-500">•</span>
                    <span class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium">智能调节</span>
                  </div>
                </div>
              </div>
              
              <!-- 描述 -->
              <p class="text-slate-400 text-lg mb-8 leading-relaxed border-l-4 border-purple-500/30 pl-4">
                循环水系统智能控制优化平台，基于PLC的精准控制算法，
                实现能耗优化和系统稳定性提升，节约能源成本
              </p>
              
              <!-- 核心功能 -->
              <div class="mb-8">
                <h4 class="text-sm text-slate-500 mb-3">主要优化参数</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm">水泵频率控制</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm">阀门开度调节</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm">水温控制</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm">流量平衡</span>
                </div>
              </div>
              
              <!-- 进入按钮 -->
              <div class="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div class="text-sm text-slate-500">
                  能耗降低: <span class="text-purple-400 font-bold">18.5%</span>
                </div>
                <div class="flex items-center space-x-3 group-hover:space-x-4 transition-all duration-300">
                  <span class="text-slate-400 group-hover:text-slate-300 transition-colors">进入系统</span>
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300 shadow-lg group-hover:shadow-purple-500/30">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 悬停效果边框 -->
            <div class="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/30 rounded-3xl transition-all duration-500"></div>
          </div>
        </div>

        <!-- 系统状态面板 -->
        <div class="mt-16 max-w-4xl mx-auto">
          <div class="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- 平台状态 -->
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-900/20 mb-4">
                  <span class="text-3xl">✅</span>
                </div>
                <div class="text-2xl font-bold text-green-400 mb-2">系统正常</div>
                <div class="text-sm text-slate-400">所有平台运行稳定</div>
              </div>
              
              <!-- 数据统计 -->
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-900/20 mb-4">
                  <span class="text-3xl">📊</span>
                </div>
                <div class="text-2xl font-bold text-blue-400 mb-2">35+</div>
                <div class="text-sm text-slate-400">在线监测设备</div>
              </div>
              
              <!-- 更新时间 -->
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-900/20 mb-4">
                  <span class="text-3xl">🕒</span>
                </div>
                <div class="text-2xl font-bold text-purple-400 mb-2">{{ currentTime }}</div>
                <div class="text-sm text-slate-400">最后更新时间</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="mt-12 text-center">
          <p class="text-slate-500 text-sm">
            工业智能平台 v2.1.0 • 数据更新时间: {{ currentDate }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DeviceDiagnosis from './DeviceDiagnosis.vue'
import PLCOptimization from './PLCOptimization.vue'

// 当前页面状态
const currentPage = ref<'home' | 'anqing' | 'water'>('home')

// 时间相关
const currentTime = ref('')
const currentDate = ref('')

// 更新时间函数
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 跳转到安庆石化设备诊断
const navigateToAnqing = () => {
  currentPage.value = 'anqing'
}

// 跳转到循环水PLC控制优化
const navigateToWater = () => {
  currentPage.value = 'water'
}

// 返回主页
const goBackToHome = () => {
  currentPage.value = 'home'
}

// 初始化时间
onMounted(() => {
  updateTime()
  // 每秒更新时间
  const timer = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<style scoped>
/* 自定义动画 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.group:hover .floating {
  animation: float 2s ease-in-out infinite;
}

/* 卡片阴影效果 */
.group:hover {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 100px rgba(6, 182, 212, 0.15);
}

/* 背景网格效果 */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(30, 41, 59, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 41, 59, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 文本渐变效果 */
.text-gradient {
  background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 平滑过渡效果 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.3s ease;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}
</style>