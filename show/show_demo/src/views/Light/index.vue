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

    <!-- 主页 -->
    <div
      v-if="currentPage === 'home'"
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8"
    >
      <!-- 顶部装饰线 -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>

      <div class="max-w-7xl mx-auto">
        <!-- 标题区域 -->
        <div class="text-center mb-14 pt-10">
          <div class="inline-flex items-center mb-6">
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-6">
              <span class="text-4xl">🧵</span>
            </div>
            <div>
              <h1
                class="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2">
                光纤传感预警系统
              </h1>
              <p class="text-xl text-slate-300">
                面向火电厂与 LNG 工厂的智能感知与风险预警平台
              </p>
            </div>
          </div>
        </div>

        <!-- 功能卡片 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-16">

          <!-- 光纤传感器预警 -->
          <div
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
            @click="goFiberWarning"
          >
            <!-- 光效 -->
            <div
              class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700">
            </div>

            <div class="relative z-10 p-10">
              <!-- 标题 -->
              <div class="flex items-center mb-8">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <span class="text-4xl">📡</span>
                </div>
                <div class="ml-6">
                  <h3 class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-cyan-300">
                    光纤传感器预警
                  </h3>
                  <div class="flex items-center">
                    <span class="tag-cyan">火电厂</span>
                    <span class="dot">•</span>
                    <span class="tag-cyan">LNG 工厂</span>
                    <span class="dot">•</span>
                    <span class="tag-cyan">实时预警</span>
                  </div>
                </div>
              </div>

              <p class="desc border-cyan">
                基于分布式光纤传感技术，对关键设备与管线进行实时状态监测，
                快速识别温度、应变与振动异常，实现秒级风险预警。
              </p>

              <div class="mb-8">
                <h4 class="sub-title">主要监测对象</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="badge">锅炉管道</span>
                  <span class="badge">LNG 输送管线</span>
                  <span class="badge">压力容器</span>
                  <span class="badge">关键阀门区段</span>
                </div>
              </div>

              <div class="card-footer">
                <div class="text-sm text-slate-500">
                  在线光纤通道: <span class="text-cyan-400 font-bold">64 路</span>
                </div>
                <div class="enter-btn">
                  <span>进入系统</span>
                  <div class="icon-btn cyan">➜</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 管损分析与预测 -->
          <div
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
            @click="goPipePrediction"
          >
            <!-- 光效 -->
            <div
              class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700">
            </div>

            <div class="relative z-10 p-10">
              <div class="flex items-center mb-8">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <span class="text-4xl">🧠</span>
                </div>
                <div class="ml-6">
                  <h3 class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-orange-300">
                    管损分析与预测
                  </h3>
                  <div class="flex items-center">
                    <span class="tag-orange">AI分析</span>
                    <span class="dot">•</span>
                    <span class="tag-orange">寿命预测</span>
                    <span class="dot">•</span>
                    <span class="tag-orange">风险评估</span>
                  </div>
                </div>
              </div>

              <p class="desc border-orange">
                结合光纤监测数据与 AI 模型，对管道损伤程度进行智能分析，
                提前预测潜在失效风险，辅助制定检修与运维决策。
              </p>

              <div class="mb-8">
                <h4 class="sub-title">核心能力</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="badge">管损等级评估</span>
                  <span class="badge">趋势演化分析</span>
                  <span class="badge">剩余寿命预测</span>
                  <span class="badge">检修优先级建议</span>
                </div>
              </div>

              <div class="card-footer">
                <div class="text-sm text-slate-500">
                  预测准确率: <span class="text-orange-400 font-bold">92.4%</span>
                </div>
                <div class="enter-btn">
                  <span>进入系统</span>
                  <div class="icon-btn orange">➜</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 系统状态 -->
      <div class="mt-16 max-w-4xl mx-auto">
        <div class="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
             <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-900/20 mb-4">
                  <span class="text-3xl">✅</span>
                </div>
                <div class="text-2xl font-bold text-green-400 mb-2">系统正常</div>
                <div class="text-sm text-slate-400">光纤链路稳定</div>
              </div>
            <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-900/20 mb-4">
                  <span class="text-3xl">📈</span>
                </div>
                <div class="text-2xl font-bold text-blue-400 mb-2">120+</div>
                <div class="text-sm text-slate-400">监测管段</div>
              </div>
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

      <!-- 底部 -->
      <div class="mt-12 text-center text-slate-500 text-sm">
        光纤传感预警系统 v1.0 • © 2024 工业安全智能平台 • {{ currentDate }}
      </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN')
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})
</script>

<style scoped>
.tag-cyan,
.tag-orange {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
}
.tag-cyan { background: rgba(8,145,178,.3); color:#67e8f9 }
.tag-orange { background: rgba(234,88,12,.3); color:#fdba74 }
.dot { margin: 0 .5rem; color:#64748b }

.desc {
  color:#94a3b8;
  font-size:1.05rem;
  margin-bottom:2rem;
  padding-left:1rem;
  border-left-width:4px;
}
.border-cyan { border-color: rgba(34,211,238,.3) }
.border-orange { border-color: rgba(251,146,60,.3) }

.sub-title { font-size:.8rem;color:#64748b;margin-bottom:.75rem }
.badge {
  background: rgba(30,41,59,.6);
  color:#e5e7eb;
  padding:.35rem .75rem;
  border-radius:.5rem;
  font-size:.8rem;
}

.card-footer {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding-top:1.5rem;
  border-top:1px solid rgba(51,65,85,.6);
}

.enter-btn {
  display:flex;
  align-items:center;
  gap:.75rem;
}
.icon-btn {
  width:3rem;height:3rem;
  border-radius:999px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:white;
}
.cyan { background: linear-gradient(135deg,#06b6d4,#3b82f6) }
.orange { background: linear-gradient(135deg,#f97316,#ef4444) }

.status-icon {
  width:4rem;height:4rem;
  border-radius:1rem;
  display:flex;
  align-items:center;
  justify-content:center;
  margin:0 auto 1rem;
}
.green { background:rgba(22,163,74,.2);color:#4ade80 }
.blue { background:rgba(59,130,246,.2);color:#60a5fa }
.purple { background:rgba(139,92,246,.2);color:#c4b5fd }

.status-title { font-size:1.5rem;font-weight:bold }
.status-desc { font-size:.85rem;color:#94a3b8 }
</style>
