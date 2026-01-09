<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
    <div>
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button 
          @click="$emit('back')"
          class="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors group"
        >
          <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回主页
        </button>
      </div>
      <div class="mb-8"> 
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500"
        >  
        管道分析与预测系统</h1> 
        <p class="text-slate-400 mt-2">基于光纤预警数据的管损趋势、寿命预测与维修建议
        </p>
      </div>
    </div>
    <div class="w-full h-full text-gray-100 p-4">
      <!-- 核心指标概览 -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <!-- 管损等级 -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-sm text-gray-400">当前管损等级</div>
          <div :class="riskLevel.color" class="text-2xl font-bold mt-1">
            {{ riskLevelText }}
          </div>
          <div class="text-xs text-gray-400 mt-1">管损指数: {{ currentDamage.toFixed(1) }}</div>
        </div>
        <!-- 剩余寿命 -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-sm text-gray-400">剩余预测寿命</div>
          <div class="text-2xl font-bold mt-1 text-blue-400">
            {{ remainingLife.toFixed(1) }} 个月
          </div>
          <div class="text-xs text-gray-400 mt-1">衰减速率: {{ decayRate.toFixed(2) }} %/月</div>
        </div>
        <!-- 检修优先级 -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-sm text-gray-400">检修优先级</div>
          <div class="text-2xl font-bold mt-1" :class="maintenancePriorityColor">
            {{ maintenancePriority }}
          </div>
          <div class="text-xs text-gray-400 mt-1">风险系数: {{ riskCoefficient.toFixed(2) }}</div>
        </div>
        <!-- 预警触发次数 -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-sm text-gray-400">光纤预警触发</div>
          <div class="text-2xl font-bold mt-1 text-purple-400">
            {{ fiberWarningCount }} 次
          </div>
          <div class="text-xs text-gray-400 mt-1">近7天: {{ fiberWarning7d }} 次</div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <!-- 1. 管损趋势演化分析 -->
        <div class="bg-gray-800 rounded-lg p-4 h-[400px]">
          <div class="text-lg font-medium mb-4">管损趋势演化（历史+预测）</div>
          <div ref="trendRef" class="w-full h-[calc(100%-40px)]"></div>
        </div>
        <!-- 2. 剩余寿命预测曲线 -->
        <div class="bg-gray-800 rounded-lg p-4 h-[400px]">
          <div class="text-lg font-medium mb-4">剩余寿命衰减预测</div>
          <div ref="lifeRef" class="w-full h-[calc(100%-40px)]"></div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <!-- 3. 光纤预警与管损相关性分析 -->
        <div class="bg-gray-800 rounded-lg p-4 h-[400px]">
          <div class="text-lg font-medium mb-4">光纤预警-管损相关性</div>
          <div ref="correlationRef" class="w-full h-[calc(100%-40px)]"></div>
        </div>
        <!-- 4. 检修优先级分布 -->
        <div class="bg-gray-800 rounded-lg p-4 h-[400px]">
          <div class="text-lg font-medium mb-4">管段检修优先级分布</div>
          <div ref="priorityRef" class="w-full h-[calc(100%-40px)]"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'

// ================= 模拟光纤预警原始数据（模拟 fiberwarning 页面生成）=================
// 光纤预警数据：时间、光功率衰减值(dB)、振动幅值、预警类型、触发次数
const fiberWarningData = [
  { time: '08:00', powerAttenuation: 2.1, vibration: 15.2, type: '轻微', count: 1 },
  { time: '09:00', powerAttenuation: 2.8, vibration: 18.7, type: '轻微', count: 1 },
  { time: '10:00', powerAttenuation: 3.5, vibration: 22.1, type: '中度', count: 2 },
  { time: '11:00', powerAttenuation: 4.2, vibration: 25.8, type: '中度', count: 1 },
  { time: '12:00', powerAttenuation: 5.1, vibration: 29.3, type: '重度', count: 3 },
  { time: '13:00', powerAttenuation: 4.8, vibration: 27.6, type: '重度', count: 2 },
  { time: '14:00', powerAttenuation: 5.5, vibration: 31.2, type: '重度', count: 2 },
  { time: '15:00', powerAttenuation: 6.2, vibration: 33.7, type: '紧急', count: 4 },
]

// ================= 管损核心计算公式（AI 模拟工业级算法）=================
/**
 * 管损指数计算公式
 * 管损指数 = 基础系数(80) × 光功率衰减系数 × 振动幅值系数 × 环境修正系数 + 随机波动值
 * 光功率衰减系数 = 1 + (衰减值 / 10)
 * 振动幅值系数 = 1 + (振动幅值 / 50)
 * 环境修正系数 = 1.05（固定模拟）
 */
const calculateDamageIndex = (powerAttenuation: number, vibration: number): number => {
  const baseCoeff = 80
  const powerCoeff = 1 + (powerAttenuation / 10)
  const vibrationCoeff = 1 + (vibration / 50)
  const envCoeff = 1.05
  const randomFluctuation = Math.random() * 5 - 2.5 // ±2.5 波动
  return baseCoeff * powerCoeff * vibrationCoeff * envCoeff + randomFluctuation
}

/**
 * 剩余寿命计算公式
 * 剩余寿命(月) = 基准寿命(24) / (管损指数 / 100) × 衰减速率修正系数
 * 衰减速率 = 管损指数 × 0.001 × 光功率衰减值
 */
const calculateRemainingLife = (damageIndex: number, powerAttenuation: number): { life: number; decayRate: number } => {
  const baseLife = 24 // 基准寿命24个月
  const decayRate = damageIndex * 0.001 * powerAttenuation
  const life = baseLife / (damageIndex / 100) * (1 - decayRate / 10)
  return { life: Math.max(life, 0.5), decayRate } // 最低剩余寿命0.5个月
}

/**
 * 检修优先级计算公式
 * 优先级系数 = 管损指数 × 0.01 + 预警触发次数 × 0.2 + 衰减速率 × 0.5
 * 系数 ≥8 → 极高；6-8 → 高；4-6 → 中；<4 → 低
 */
const calculateMaintenancePriority = (damageIndex: number, warningCount: number, decayRate: number): { level: string; coefficient: number } => {
  const coefficient = damageIndex * 0.01 + warningCount * 0.2 + decayRate * 0.5
  let level = '低'
  if (coefficient >= 8) level = '极高'
  else if (coefficient >= 6) level = '高'
  else if (coefficient >= 4) level = '中'
  return { level, coefficient }
}

// ================= 数据初始化 =================
// 历史管损数据（基于光纤预警计算）
const historyData = fiberWarningData.map(item => ({
  time: item.time,
  value: calculateDamageIndex(item.powerAttenuation, item.vibration)
}))

// 预测管损数据（未来6个时间点）
const predictData = Array.from({ length: 6 }, (_, i) => {
  const baseTime = 16 + i
  const time = `${baseTime < 24 ? baseTime : baseTime - 24}:00`
  // 预测衰减值递增，振动幅值递增
  const powerAttenuation = 6.2 + i * 0.3
  const vibration = 33.7 + i * 1.5
  return {
    time,
    value: calculateDamageIndex(powerAttenuation, vibration)
  }
})

// 核心计算结果
const currentDamage = historyData.at(-1)!.value
const { life: remainingLife, decayRate } = calculateRemainingLife(currentDamage, fiberWarningData.at(-1)!.powerAttenuation)
const fiberWarningCount = fiberWarningData.reduce((sum, item) => sum + item.count, 0)
const fiberWarning7d = Math.floor(fiberWarningCount * 1.2) // 模拟7天数据
const { level: maintenancePriority, coefficient: riskCoefficient } = calculateMaintenancePriority(
  currentDamage,
  fiberWarningCount,
  decayRate
)

// ================= 状态计算 =================
// 管损等级
const riskLevel = computed(() => {
  if (currentDamage < 60) return { color: 'text-green-400', level: '低风险' }
  if (currentDamage < 85) return { color: 'text-yellow-400', level: '中风险' }
  return { color: 'text-red-400', level: '高风险' }
})

const riskLevelText = computed(() => riskLevel.value.level)

// 检修优先级颜色
const maintenancePriorityColor = computed(() => {
  switch (maintenancePriority) {
    case '极高': return 'text-red-500'
    case '高': return 'text-orange-400'
    case '中': return 'text-yellow-400'
    default: return 'text-green-400'
  }
})

// ================= ECharts 初始化 =================//
const trendRef = ref<HTMLDivElement | null>(null)
const lifeRef = ref<HTMLDivElement | null>(null)
const correlationRef = ref<HTMLDivElement | null>(null)
const priorityRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  // 1. 管损趋势演化分析图表
  if (trendRef.value) {
    const trendChart = echarts.init(trendRef.value)
    trendChart.setOption({
      title: { text: '综合管损趋势（历史 + 预测）', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
      legend: { top: 30, textStyle: { color: '#cbd5f5' } },
      grid: { top: 70, left: 50, right: 40, bottom: 20 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', name: '时间', data: [...historyData, ...predictData].map(d => d.time) },
      yAxis: { type: 'value', name: '管损指数', max: 300 },
      series: [
        {
          name: '管损指数',
          type: 'line',
          smooth: true,
          data: [...historyData.map(d => d.value), ...predictData.map(d => d.value)],
          areaStyle: { opacity: 0.15 },
          lineStyle: { color: '#3b82f6' },
          itemStyle: { color: '#3b82f6' },
          markArea: {
            itemStyle: { color: 'rgba(250,204,21,0.15)' },
            data: [[{ xAxis: predictData[0].time }, { xAxis: predictData.at(-1)!.time }]]
          },
          markLine: {
            data: [{ type: 'average', name: '平均值' }],
            lineStyle: { color: '#94a3b8', type: 'dashed' }
          }
        }
      ],
      backgroundColor: 'transparent'
    })
    // 窗口自适应
    window.addEventListener('resize', () => trendChart.resize())
  }

  // 2. 剩余寿命预测曲线
  if (lifeRef.value) {
    const lifeChart = echarts.init(lifeRef.value)
    // 寿命预测数据：未来12个月的剩余寿命
    const lifePredictData = Array.from({ length: 12 }, (_, i) => {
      const currentDamage = historyData.at(-1)!.value + i * 2.5
      const powerAttenuation = fiberWarningData.at(-1)!.powerAttenuation + i * 0.4
      return calculateRemainingLife(currentDamage, powerAttenuation).life
    })
    const lifeTimeData = Array.from({ length: 12 }, (_, i) => `${i + 1}月后`)
    
    lifeChart.setOption({
      title: { text: '剩余寿命衰减预测', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
      grid: { top: 70, left: 50, right: 40, bottom: 20 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: lifeTimeData },
      yAxis: { type: 'value', name: '剩余寿命(月)', min: 0 },
      series: [
        {
          name: '剩余寿命',
          type: 'line',
          smooth: true,
          data: lifePredictData,
          areaStyle: { opacity: 0.15, color: '#10b981' },
          lineStyle: { color: '#10b981' },
          itemStyle: { color: '#10b981' },
          markPoint: {
            data: [{ name: '临界值', value: '5个月', xAxis: 8, yAxis: 5 }],
            itemStyle: { color: '#ef4444' }
          }
        }
      ],
      backgroundColor: 'transparent'
    })
    window.addEventListener('resize', () => lifeChart.resize())
  }

  // 3. 光纤预警与管损相关性分析
  if (correlationRef.value) {
    const correlationChart = echarts.init(correlationRef.value)
    correlationChart.setOption({
      title: { text: '光纤预警-管损相关性', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
      grid: { top: 70, left: 50, right: 40, bottom: 20 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: fiberWarningData.map(d => d.time) },
      yAxis: [
        { type: 'value', name: '管损指数', max: 120, axisLine: { lineStyle: { color: '#3b82f6' } } },
        { type: 'value', name: '光功率衰减(dB)', max: 10, axisLine: { lineStyle: { color: '#f59e0b' } } }
      ],
      series: [
        {
          name: '管损指数',
          type: 'line',
          smooth: true,
          data: historyData.map(d => d.value),
          yAxisIndex: 0,
          lineStyle: { color: '#3b82f6' },
          itemStyle: { color: '#3b82f6' }
        },
        {
          name: '光功率衰减',
          type: 'line',
          smooth: true,
          data: fiberWarningData.map(d => d.powerAttenuation),
          yAxisIndex: 1,
          lineStyle: { color: '#f59e0b' },
          itemStyle: { color: '#f59e0b' }
        }
      ],
      backgroundColor: 'transparent'
    })
    window.addEventListener('resize', () => correlationChart.resize())
  }

  // 4. 检修优先级分布
  if (priorityRef.value) {
    const priorityChart = echarts.init(priorityRef.value)
    // 模拟10个管段的优先级分布
    const pipeSections = ['管段1', '管段2', '管段3', '管段4', '管段5', '管段6', '管段7', '管段8', '管段9', '管段10']
    const priorityData = pipeSections.map(() => {
      const coeff = Math.random() * 10
      if (coeff >= 8) return '极高'
      else if (coeff >= 6) return '高'
      else if (coeff >= 4) return '中'
      else return '低'
    })
    // 统计各优先级数量
    const priorityCount = {
      '极高': priorityData.filter(p => p === '极高').length,
      '高': priorityData.filter(p => p === '高').length,
      '中': priorityData.filter(p => p === '中').length,
      '低': priorityData.filter(p => p === '低').length
    }

    priorityChart.setOption({
      title: { text: '管段检修优先级分布', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
      tooltip: { trigger: 'item' },
      legend: { top: 30, textStyle: { color: '#cbd5f5' }, right: 10 },
      series: [
        {
          name: '检修优先级',
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: priorityCount['极高'], name: '极高', itemStyle: { color: '#ef4444' } },
            { value: priorityCount['高'], name: '高', itemStyle: { color: '#f97316' } },
            { value: priorityCount['中'], name: '中', itemStyle: { color: '#eab308' } },
            { value: priorityCount['低'], name: '低', itemStyle: { color: '#22c55e' } }
          ],
          label: { color: '#e5e7eb' },
          labelLine: { lineStyle: { color: '#94a3b8' } }
        }
      ],
      backgroundColor: 'transparent'
    })
    window.addEventListener('resize', () => priorityChart.resize())
  }
})

</script>

<style scoped>
/* 基础样式适配 */
:deep(.echarts-tooltip) {
  background-color: #1f2937 !important;
  border-color: #4b5563 !important;
  color: #f9fafb !important;
}
:deep(.echarts-axis-label) {
  color: #94a3b8 !important;
}
:deep(.echarts-axis-line) {
  stroke: #4b5563 !important;
}
:deep(.echarts-grid-border) {
  stroke: #4b5563 !important;
}
:deep(.echarts-legend-text) {
  color: #cbd5f5 !important;
}
</style>