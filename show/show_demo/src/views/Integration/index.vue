<template>
  <div>
    <!-- 顶部装饰彩条 -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

    <!-- 主页 -->
    <div
      v-if="currentPage === 'home'"
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8"
    >
      <div class="max-w-7xl mx-auto">
        <!-- 标题区 - 替换为管道保冷算量报价系统标题 -->
        <div class="text-center mb-12 pt-8">
          <div class="inline-flex items-center mb-6">
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-6"
            >
              <span class="text-4xl">🧮</span>
            </div>
            <div>
              <h1
                class="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2"
              >
                管道保冷算量报价管理系统
              </h1>
              <p class="text-xl text-slate-300">工业管道保冷成本核算与报价智能分析平台</p>
            </div>
          </div>
        </div>

        <!-- 两张大卡片 - 替换为保冷算量报价相关业务 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-16">
          <!-- 项目与算量报价管理卡片 - 对应截图项目总览/保冷算量报价 -->
          <div
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
            @click="navigate('iot')"
          >
            <div
              class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"
            />
            <div class="relative z-10 p-10">
              <div class="flex items-center mb-8">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500"
                >
                  <span class="text-4xl">📊</span>
                </div>
                <div class="ml-6">
                  <h3
                    class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-cyan-300 transition-colors"
                  >
                    管道状态实时监控
                  </h3>
                  <div class="flex items-center">
                    <span
                      class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium"
                      >实时数据</span
                    >
                    <span class="mx-2 text-slate-500">•</span>
                    <span
                      class="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm font-medium"
                      >位移监测</span
                    >
                  </div>
                </div>
              </div>
              <p class="text-slate-400 text-lg mb-8 leading-relaxed border-l-4 border-cyan-500/30 pl-4">
                实时采集一代/二代管道温度、压力、流量数据，同步监测环境仪（风速/温湿度/CO₂）、位移传感器等关键指标，可视化展示管道运行状态。
              </p>
              <div class="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div class="text-sm text-slate-500">
                  监测点位: <span class="text-cyan-400 font-bold">7 个</span>
                </div>
                <div class="flex items-center space-x-3 group-hover:space-x-4 transition-all duration-300">
                  <span class="text-slate-400 group-hover:text-slate-300">进入系统</span>
                  <div
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center transform group-hover:translate-x-2 transition-transform shadow-lg group-hover:shadow-cyan-500/30"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/30 rounded-3xl transition-all duration-500"
            />
          </div>

          <!-- 成本分析与数据管理卡片 - 对应截图成本汇总/材料数据库/取数逻辑 -->
          <div
            class="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
            @click="navigate('slxcx')"
          >
            <div
              class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"
            />
            <div class="relative z-10 p-10">
              <div class="flex items-center mb-8">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500"
                >
                  <span class="text-4xl">💰</span>
                </div>
                <div class="ml-6">
                  <h3
                    class="text-3xl font-bold text-slate-200 mb-2 group-hover:text-purple-300 transition-colors"
                  >
                    成本分析与数据管理
                  </h3>
                  <div class="flex items-center">
                    <span
                      class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium"
                      >成本汇总</span
                    >
                    <span class="mx-2 text-slate-500">•</span>
                    <span
                      class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm font-medium"
                      >数据溯源</span
                    >
                  </div>
                </div>
              </div>
              <p class="text-slate-400 text-lg mb-8 leading-relaxed border-l-4 border-purple-500/30 pl-4">
                基于算量数据自动生成材料成本汇总表，维护冷热材料价格及放量系数数据库，配置钢带/密封胶/管道粘接剂等取数逻辑规则，实现报价成本精准核算与数据可追溯。
              </p>
              <div class="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div class="text-sm text-slate-500">
                  材料数据库: <span class="text-purple-400 font-bold">6+ 类</span>
                </div>
                <div class="flex items-center space-x-3 group-hover:space-x-4 transition-all duration-300">
                  <span class="text-slate-400 group-hover:text-slate-300">进入系统</span>
                  <div
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:translate-x-2 transition-transform shadow-lg group-hover:shadow-purple-500/30"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/30 rounded-3xl transition-all duration-500"
            />
          </div>
        </div>

        <!-- 底部统计 - 匹配保冷算量报价业务数据 -->
        <!-- 底部统计 - 匹配截图业务数据 -->
        <div class="mt-16 max-w-4xl mx-auto">
          <div
            class="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
          >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div
                  class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-900/20 mb-4"
                >
                  <span class="text-3xl">✅</span>
                </div>
                <div class="text-2xl font-bold text-green-400 mb-2">系统正常</div>
                <div class="text-sm text-slate-400">管道监测链路稳定</div>
              </div>
              <div>
                <div
                  class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-900/20 mb-4"
                >
                  <span class="text-3xl">📍</span>
                </div>
                <div class="text-2xl font-bold text-blue-400 mb-2">4 个</div>
                <div class="text-sm text-slate-400">位移传感器在线</div>
              </div>
              <div>
                <div
                  class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-900/20 mb-4"
                >
                  <span class="text-3xl">🕒</span>
                </div>
                <div class="text-2xl font-bold text-purple-400 mb-2">{{ currentTime }}</div>
                <div class="text-sm text-slate-400">最后更新</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 页脚 - 替换为保冷算量报价系统信息 -->
        <div class="mt-12 text-center text-slate-500 text-sm">
          管道保冷算量报价管理系统 v2.1.0 • 数据更新时间: {{ currentDate }}
        </div>
      </div>
    </div>

    <!-- 子页面 - 保留原有组件引用，匹配新业务 -->
    <IOTBase v-if="currentPage === 'iot'" @back="goBackToHome" />
    <slxcx v-if="currentPage === 'slxcx'" @back="goBackToHome" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import IOTBase from './IOTBase.vue'
import slxcx from './slxcx.vue'

type Page = 'home' | 'iot' | 'slxcx'
const currentPage = ref<Page>('home')

const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const navigate = (p: Page) => (currentPage.value = p)
const goBackToHome = () => (currentPage.value = 'home')

onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<style scoped>
/* 悬停光晕 */
.group:hover {
  box-shadow:
    0 25px 50px -12px rgba(0,0,0,.4),
    0 0 100px rgba(6,182,212,.15);
}
/* 背景网格 */
.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(30,41,59,.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30,41,59,.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>