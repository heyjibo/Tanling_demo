<template>
  <div>
    <!-- 光纤传感器预警子页面 -->
    <FiberWarning
      v-if="currentPage === 'fiber'"
      @back="goBackToHome"
    />

    <!-- 管损分析与预测子页面 -->
    <PipePrediction
      v-if="currentPage === 'pipe'"
      @back="goBackToHome"
    />

    <!-- 主页 (完全对齐模板UI样式，保留业务内容) -->
    <div
      v-if="currentPage === 'home'"
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 font-sans relative overflow-hidden"
    >
      <!-- 顶部装饰线 (与模板完全一致) -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 z-20"></div>

      <div class="max-w-7xl mx-auto relative z-10">
        <!-- 标题区域 (完全对齐模板字体/间距/样式) -->
        <div class="text-center mb-12 pt-8">
          <div class="inline-flex items-center mb-6">
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-6 border border-white/5 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              <span class="text-4xl">🧵</span>
            </div>
            <div>
              <h1
                class="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2 tracking-tight"
              >
                光纤传感预警系统
              </h1>
              <p class="text-xl text-slate-300 tracking-wide font-light">
                面向火电厂与 LNG 工厂的智能感知与风险预警平台
              </p>
            </div>
          </div>
        </div>

        <!-- 功能卡片 (完全对齐模板视觉效果，保留业务内容) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-16">

          <!-- 光纤传感器预警 (样式100%对齐模板，保留青色主题) -->
          <div
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-xl"
            @click="goFiberWarning"
          >
            <!-- 背景光效 (与模板完全一致) -->
            <div
              class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"
            ></div>

            <!-- 悬停光晕边框 (与模板完全一致) -->
            <div class="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/30 rounded-3xl transition-all duration-500 pointer-events-none"></div>

            <div class="relative z-10 p-10">
              <!-- 图标和标题 (样式完全对齐模板) -->
              <div class="flex items-center mb-8">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-white/5"
                >
                  <span class="text-4xl">📡</span>
                </div>
                <div class="ml-6">
                  <h3 class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-cyan-300 transition-colors">
                    光纤传感器预警
                  </h3>
                  <div class="flex items-center flex-wrap gap-2">
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/20">火电厂</span>
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/20">LNG 工厂</span>
                    <span class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/20">实时预警</span>
                  </div>
                </div>
              </div>

              <!-- 描述文本 (样式完全对齐模板) -->
              <p class="text-slate-400 text-lg mb-8 leading-relaxed border-l-4 border-cyan-500/30 pl-4">
                基于分布式光纤传感技术，对关键设备与管线进行实时状态监测，
                快速识别温度、应变与振动异常，实现秒级风险预警。
              </p>

              <!-- 核心功能/监测对象 (样式完全对齐模板) -->
              <div class="mb-8">
                <h4 class="text-sm text-slate-500 mb-3">主要监测对象 Feature</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">锅炉管道</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">LNG 输送管线</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">压力容器</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">关键阀门区段</span>
                </div>
              </div>

              <!-- 底部栏 (样式完全对齐模板，保留业务数据) -->
              <div class="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div class="text-sm text-slate-500">
                  在线光纤通道: <span class="text-cyan-400 font-bold text-lg">64 路</span>
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
          </div>

          <!-- 管损分析与预测 (样式100%对齐模板，保留橙色主题) -->
          <div
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-xl"
            @click="goPipePrediction"
          >
            <!-- 背景光效 (与模板完全一致) -->
            <div
              class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"
            ></div>

            <!-- 悬停光晕边框 (与模板完全一致) -->
            <div class="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/30 rounded-3xl transition-all duration-500 pointer-events-none"></div>

            <div class="relative z-10 p-10">
              <!-- 图标和标题 (样式完全对齐模板) -->
              <div class="flex items-center mb-8">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-white/5"
                >
                  <span class="text-4xl">🧠</span>
                </div>
                <div class="ml-6">
                  <h3 class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-orange-300 transition-colors">
                    管损分析与预测
                  </h3>
                  <div class="flex items-center flex-wrap gap-2">
                    <span class="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm font-medium border border-orange-500/20">AI分析</span>
                    <span class="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm font-medium border border-orange-500/20">寿命预测</span>
                    <span class="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm font-medium border border-orange-500/20">风险评估</span>
                  </div>
                </div>
              </div>

              <!-- 描述文本 (样式完全对齐模板) -->
              <p class="text-slate-400 text-lg mb-8 leading-relaxed border-l-4 border-orange-500/30 pl-4">
                结合光纤监测数据与 AI 模型，对管道损伤程度进行智能分析，
                提前预测潜在失效风险，辅助制定检修与运维决策。
              </p>

              <!-- 核心能力 (样式完全对齐模板) -->
              <div class="mb-8">
                <h4 class="text-sm text-slate-500 mb-3">核心能力 Feature</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">管损等级评估</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">趋势演化分析</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">剩余寿命预测</span>
                  <span class="px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700">检修优先级建议</span>
                </div>
              </div>

              <!-- 底部栏 (样式完全对齐模板，保留业务数据) -->
              <div class="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div class="text-sm text-slate-500">
                  预测准确率: <span class="text-orange-400 font-bold text-lg">92.4%</span>
                </div>
                <div class="flex items-center space-x-3 group-hover:space-x-4 transition-all duration-300">
                  <span class="text-slate-400 group-hover:text-slate-300 transition-colors text-sm font-medium">进入系统</span>
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300 shadow-lg group-hover:shadow-orange-500/30">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 系统状态面板 (样式完全对齐模板，保留业务内容) -->
        <div class="mt-16 max-w-4xl mx-auto">
          <div class="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- 状态 A: 系统正常 -->
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-900/20 mb-4">
                  <span class="text-3xl">✅</span>
                </div>
                <div class="text-2xl font-bold text-green-400 mb-2">系统正常</div>
                <div class="text-sm text-slate-400">光纤链路稳定</div>
              </div>
              
              <!-- 状态 B: 监测管段数 -->
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-900/20 mb-4">
                  <span class="text-3xl">📈</span>
                </div>
                <div class="text-2xl font-bold text-blue-400 mb-2">120+</div>
                <div class="text-sm text-slate-400">监测管段</div>
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

        <!-- 底部版权 (样式完全对齐模板) -->
        <div class="mt-12 text-center">
          <p class="text-slate-500 text-sm font-mono">
            工业智能平台 v2.1.0 • © 2024 安庆石化 • 数据更新时间: {{ currentDate }}
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import FiberWarning from './FiberWarning.vue'
import PipePrediction from './PipePrediction.vue'

type Page = 'home' | 'fiber' | 'pipe'
const currentPage = ref<Page>('home')

const goFiberWarning = () => {
  currentPage.value = 'fiber'
}

const goPipePrediction = () => {
  currentPage.value = 'pipe'
}

const goBackToHome = () => {
  currentPage.value = 'home'
}

const currentTime = ref('')
const currentDate = ref('')
let timer: any = null // 声明定时器变量，用于销毁

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

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000) // 绑定定时器到window，提高兼容性
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer) // 销毁定时器，避免内存泄漏
    timer = null
  }
})
</script>

<style scoped>
/* 完全继承模板的动画和样式 (视觉100%一致) */
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

/* 滚动条样式 (与模板完全一致) */
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

/* 橙色主题扩展 (匹配模板的色彩规范) */
.bg-orange-900\/30 {
  background-color: rgba(124, 45, 18, 0.3);
}
.text-orange-300 {
  color: #fdba74;
}
.border-orange-500\/20 {
  border-color: rgba(249, 115, 22, 0.2);
}
.border-orange-500\/30 {
  border-color: rgba(249, 115, 22, 0.3);
}
.text-orange-400 {
  color: #fb923c;
}
.shadow-orange-500\/30 {
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.3);
}
</style>