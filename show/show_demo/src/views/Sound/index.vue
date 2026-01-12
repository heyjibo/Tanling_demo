<template>
  <div>
    <!-- 1. 声纹识别技术页面 (子组件) -->
    <VoicePrint 
      v-if="currentPage === 'voiceprint'" 
      @back="goBackToHome" 
    />

    <!-- 2. 超声波定位页面 (子组件) -->
    <Ultrasonic 
      v-if="currentPage === 'ultrasonic'" 
      @back="goBackToHome" 
    />

    <!-- 3. 主页导航页面 (统一UI样式) -->
    <div v-if="currentPage === 'home'" class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 font-sans relative overflow-hidden">
      <!-- 顶部彩色装饰条 (与模板一致) -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 z-20"></div>

      <div class="max-w-7xl mx-auto relative z-10">
        <!-- 标题区域 (与模板字体、间距、样式统一) -->
        <div class="text-center mb-12 pt-8">
          <div class="inline-flex items-center mb-6">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-6 border border-white/5 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <span class="text-4xl">📡</span>
            </div>
            <div>
              <h1 class="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2 tracking-tight">
                声学感知与定位系统
              </h1>
              <p class="text-xl text-slate-300 tracking-wide font-light">
                Industrial Acoustic Sensing & Positioning Platform
              </p>
            </div>
          </div>
        </div>

        <!-- 导航卡片区域 (与模板视觉效果统一，保留内容) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-16">
          <!-- 卡片 A: 声纹识别技术 (样式对齐模板) -->
          <div 
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-xl"
            @click="navigateToVoicePrint"
          >
            <!-- 背景光效 (与模板一致) -->
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div class="relative z-10 p-10">
              <!-- 图标和标题 (样式对齐模板) -->
              <div class="flex items-center mb-8">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-white/5">
                  <span class="text-4xl">🔊</span>
                </div>
                <div class="ml-6">
                  <h3 class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-cyan-300 transition-colors">
                    声纹识别技术
                  </h3>
                  <div class="flex items-center flex-wrap gap-2">
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/20">非接触监测</span>
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/20">故障预警</span>
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/20">AI分析</span>
                  </div>
                </div>
              </div>
              
              <!-- 描述 (保留内容，样式对齐模板) -->
              <p class="text-slate-400 text-lg mb-8 leading-relaxed border-l-4 border-cyan-500/30 pl-4">
                基于先进的麦克风阵列与AI算法，对工业设备运行声音进行实时采集与特征提取，精准识别异常状态。
              </p>
              
              <!-- 核心功能 (保留内容，样式对齐模板) -->
              <div class="mb-8">
                <h4 class="text-sm text-slate-500 mb-3">核心功能 Feature</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">电机异响监测</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">轴承磨损识别</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">声源定位</span>
                </div>
              </div>
              
              <!-- 底部栏 (样式对齐模板，保留数据) -->
              <div class="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div class="text-sm text-slate-500">
                  识别准确率: <span class="text-cyan-400 font-bold text-lg">98.5%</span>
                </div>
                <div class="flex items-center space-x-3 group-hover:space-x-4 transition-all duration-300">
                  <span class="text-slate-400 group-hover:text-slate-300 transition-colors text-sm font-medium">进入系统</span>
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300 shadow-lg group-hover:shadow-cyan-500/30">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 悬停光晕边框 (与模板一致) -->
            <div class="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/30 rounded-3xl transition-all duration-500 pointer-events-none"></div>
          </div>

          <!-- 卡片 B: 超声波室内精确定位 (样式对齐模板) -->
          <div 
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-xl"
            @click="navigateToUltrasonic"
          >
            <!-- 背景光效 (与模板一致) -->
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div class="relative z-10 p-10">
              <!-- 图标和标题 (样式对齐模板) -->
              <div class="flex items-center mb-8">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-white/5">
                  <span class="text-4xl">🎯</span>
                </div>
                <div class="ml-6">
                  <h3 class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-purple-300 transition-colors">
                    超声波室内精确定位
                  </h3>
                  <div class="flex items-center flex-wrap gap-2">
                    <span class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium border border-purple-500/20">厘米级精度</span>
                    <span class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium border border-purple-500/20">电子围栏</span>
                    <span class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium border border-purple-500/20">轨迹追踪</span>
                  </div>
                </div>
              </div>
              
              <!-- 描述 (保留内容，样式对齐模板) -->
              <p class="text-slate-400 text-lg mb-8 leading-relaxed border-l-4 border-purple-500/30 pl-4">
                利用高频超声波测距技术，实现复杂工业环境下的高精度人员与物资定位，保障作业安全。
              </p>
              
              <!-- 核心功能 (保留内容，样式对齐模板) -->
              <div class="mb-8">
                <h4 class="text-sm text-slate-500 mb-3">应用场景 Scenario</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">人员安全管理</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">巡检轨迹回放</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">危险区域报警</span>
                </div>
              </div>
              
              <!-- 底部栏 (样式对齐模板，保留数据) -->
              <div class="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div class="text-sm text-slate-500">
                  定位误差: <span class="text-purple-400 font-bold text-lg">±5cm</span>
                </div>
                <div class="flex items-center space-x-3 group-hover:space-x-4 transition-all duration-300">
                  <span class="text-slate-400 group-hover:text-slate-300 transition-colors text-sm font-medium">进入系统</span>
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300 shadow-lg group-hover:shadow-purple-500/30">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 悬停光晕边框 (与模板一致) -->
            <div class="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/30 rounded-3xl transition-all duration-500 pointer-events-none"></div>
          </div>
        </div>

        <!-- 系统状态面板 (样式对齐模板，保留内容) -->
        <div class="mt-16 max-w-4xl mx-auto">
          <div class="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- 状态 A: 系统正常 -->
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-900/20 mb-4">
                  <span class="text-3xl">⚡</span>
                </div>
                <div class="text-2xl font-bold text-green-400 mb-2">系统正常</div>
                <div class="text-sm text-slate-400">所有系统在线</div>
              </div>
              
              <!-- 状态 B: 监听设备数 -->
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-900/20 mb-4">
                  <span class="text-3xl">📡</span>
                </div>
                <div class="text-2xl font-bold text-blue-400 mb-2">128</div>
                <div class="text-sm text-slate-400">正在监听设备数</div>
              </div>
              
              <!-- 状态 C: 最后更新时间 -->
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

        <!-- 底部版权 (样式对齐模板) -->
        <div class="mt-12 text-center">
          <p class="text-slate-500 text-sm font-mono">
            工业智能平台 v2.1.0 • 数据更新时间: {{ currentDate }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 导入子组件 (保持原有路径，内容不变)
import VoicePrint from './VoicePrint.vue'
import Ultrasonic from './Ultrasonic.vue'

// 定义页面状态类型 (保持原有逻辑)
type PageState = 'home' | 'voiceprint' | 'ultrasonic'

// 当前页面状态 (保持原有逻辑)
const currentPage = ref<PageState>('home')

// 时间相关状态 (保持原有逻辑，样式统一由模板控制)
const currentTime = ref('')
const currentDate = ref('')
let timer: any = null

// 更新时间函数 (保持原有逻辑，格式不变)
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
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

// 导航逻辑 (保持原有功能，无修改)
const navigateToVoicePrint = () => {
  currentPage.value = 'voiceprint'
}
const navigateToUltrasonic = () => {
  currentPage.value = 'ultrasonic'
}
const goBackToHome = () => {
  currentPage.value = 'home'
}

// 生命周期 (保持原有逻辑，无修改)
onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
/* 统一继承模板的动画和样式 (保持视觉一致性) */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.group:hover .floating {
  animation: float 2s ease-in-out infinite;
}

.group:hover {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 100px rgba(6, 182, 212, 0.15);
}

.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(30, 41, 59, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 41, 59, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.text-gradient {
  background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.3s ease;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}

/* 滚动条样式 (与模板一致) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>