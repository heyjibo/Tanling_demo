<template>
  <!-- 模板部分无变化，复用之前的代码 -->
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

      <!-- 智能维修建议 -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="text-lg font-medium mb-2">智能维修建议</div>
        <div class="text-slate-300" :class="maintenanceAdvice.color">
          {{ maintenanceAdvice.text }}
        </div>
      </div>

      <!-- 管道损失待检优先级表格 -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="text-lg font-medium mb-4 flex justify-between items-center">
          <span>管道损失待检优先级列表</span>
          <span class="text-xs text-gray-400">数据每10秒自动刷新</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase bg-gray-700">
              <tr>
                <th class="px-4 py-3 rounded-l-lg">管段编号</th>
                <th class="px-4 py-3">管损指数</th>
                <th class="px-4 py-3">剩余寿命(月)</th>
                <th class="px-4 py-3">预警次数</th>
                <th class="px-4 py-3">待检优先级</th>
                <th class="px-4 py-3 rounded-r-lg">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in pipeCheckList" 
                :key="index" 
                class="bg-gray-800 border-b border-gray-700 hover:bg-gray-750 transition-colors"
              >
                <td class="px-4 py-3">{{ item.pipeNo }}</td>
                <td class="px-4 py-3">{{ item.damageIndex.toFixed(1) }}</td>
                <td class="px-4 py-3">{{ item.remainingLife.toFixed(1) }}</td>
                <td class="px-4 py-3">{{ item.warningCount }}</td>
                <td class="px-4 py-3">
                  <span :class="getPriorityClass(item.priority)">{{ item.priority }}</span>
                </td>
                <td class="px-4 py-3">
                  <span 
                    :class="getStatusClass(item.status)" 
                    @click="openStatusModal(item)"
                    class="cursor-pointer hover:underline"
                  >
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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

    <!-- 状态修改弹窗 -->
    <teleport to="body">
      <div v-if="statusModalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-lg p-6 w-80">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">修改管段状态</h3>
            <button @click="closeStatusModal" class="text-gray-400 hover:text-gray-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div v-if="currentEditItem" class="space-y-4">
            <div>
              <label class="text-sm text-gray-300 mb-1 block">管段编号</label>
              <input 
                v-model="currentEditItem.pipeNo" 
                disabled 
                class="w-full bg-gray-700 rounded px-3 py-2 text-gray-100 disabled:opacity-70"
              >
            </div>
            <div>
              <label class="text-sm text-gray-300 mb-1 block">当前状态</label>
              <select 
                v-model="currentEditItem.status" 
                class="w-full bg-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="待检测">待检测</option>
                <option value="检测中">检测中</option>
                <option value="已排期">已排期</option>
                <option value="已处理">已处理</option>
              </select>
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <button 
                @click="closeStatusModal"
                class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button 
                @click="saveStatusChange"
                class="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 transition-colors"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
// ================= 模拟光纤预警原始数据 =================
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

// ================= 管道待检优先级表格相关 =================
// 定义表格数据类型
interface PipeCheckItem {
  pipeNo: string;
  damageIndex: number;
  remainingLife: number;
  warningCount: number;
  priority: '极高' | '高' | '中' | '低';
  status: '待检测' | '检测中' | '已排期' | '已处理';
}

// 初始化管道待检列表
const pipeCheckList = ref<PipeCheckItem[]>([])

// 修复：调整数据生成范围 + 优先级计算权重，让优先级分布合理
const generatePipeCheckData = (): PipeCheckItem[] => {
  return Array.from({ length: 8 }, (_, i) => {
    // 1. 调整管损指数范围：80~200（原50~120），提升基数
    const damageIndex = 80 + Math.random() * 120;
    // 2. 调整预警次数范围：0~20（原0~9），增加权重占比
    const warningCount = Math.floor(Math.random() * 20);
    // 3. 调整衰减速率计算基数：提升系数，让衰减速率更大
    const powerAttenuation = 5 + Math.random() * 15; // 光功率衰减5~20dB
    const decayRate = damageIndex * 0.005 * powerAttenuation; // 系数从0.001→0.005
    // 4. 计算优先级（调整阈值 + 权重）
    const { level } = calculateMaintenancePriority(damageIndex, warningCount, decayRate);
    // 计算剩余寿命
    const { life } = calculateRemainingLife(damageIndex, powerAttenuation);
    
    return {
      pipeNo: `GD-${1001 + i}`,
      damageIndex,
      remainingLife: life,
      warningCount,
      priority: level as '极高' | '高' | '中' | '低',
      status: '待检测' // 默认状态为待检测
    };
  });
};

// 获取优先级样式类
const getPriorityClass = (priority: string) => {
  switch (priority) {
    case '极高': return 'text-red-400 font-medium';
    case '高': return 'text-orange-400 font-medium';
    case '中': return 'text-yellow-400 font-medium';
    case '低': return 'text-green-400 font-medium';
    default: return '';
  }
};

// 获取状态样式类
const getStatusClass = (status: string) => {
  switch (status) {
    case '待检测': return 'text-blue-400';
    case '检测中': return 'text-purple-400';
    case '已排期': return 'text-yellow-400';
    case '已处理': return 'text-green-400';
    default: return '';
  }
};

// 定时刷新数据
let refreshTimer: NodeJS.Timeout;
const startDataRefresh = () => {
  pipeCheckList.value = generatePipeCheckData();
  refreshTimer = setInterval(() => {
    pipeCheckList.value = generatePipeCheckData();
  }, 10000);
};

// ================= 状态修改弹窗相关 =================
const statusModalVisible = ref(false)
const currentEditItem = ref<PipeCheckItem | null>(null)

const openStatusModal = (item: PipeCheckItem) => {
  currentEditItem.value = JSON.parse(JSON.stringify(item))
  statusModalVisible.value = true
}

const closeStatusModal = () => {
  statusModalVisible.value = false
  currentEditItem.value = null
}

const saveStatusChange = () => {
  if (!currentEditItem.value) return
  const targetIndex = pipeCheckList.value.findIndex(item => item.pipeNo === currentEditItem.value!.pipeNo)
  if (targetIndex > -1) {
    const originalStatus = pipeCheckList.value[targetIndex].status
    const newStatus = currentEditItem.value.status
    if (originalStatus === '待检测' && newStatus !== '待检测') {
      alert(`管段${currentEditItem.value.pipeNo}状态已修改为${newStatus}，请注意优先级列表更新！`);
    }
    pipeCheckList.value[targetIndex].status = newStatus
  }
  closeStatusModal()
}

// ================= 管损核心计算公式（修复优先级逻辑）=================
/**
 * 修复：调整优先级计算权重，让系数范围覆盖 0~12（原0~3.6）
 * 新公式：
 * 优先级系数 = 管损指数 × 0.05 + 预警触发次数 × 0.3 + 衰减速率 × 0.8
 * 系数 ≥10 → 极高；8-10 → 高；5-8 → 中；<5 → 低
 */
const calculateMaintenancePriority = (damageIndex: number, warningCount: number, decayRate: number): { level: string; coefficient: number } => {
  // 调整各参数权重，提升总系数范围
  const coefficient = damageIndex * 0.05 + warningCount * 0.3 + decayRate * 0.8;
  let level = '低';
  if (coefficient >= 10) level = '极高';
  else if (coefficient >= 8) level = '高';
  else if (coefficient >= 5) level = '中';
  return { level, coefficient };
};

// 管损指数计算公式（不变）
const calculateDamageIndex = (powerAttenuation: number, vibration: number): number => {
  const baseCoeff = 80
  const powerCoeff = 1 + (powerAttenuation / 10)
  const vibrationCoeff = 1 + (vibration / 50)
  const envCoeff = 1.05
  const randomFluctuation = Math.random() * 5 - 2.5
  return baseCoeff * powerCoeff * vibrationCoeff * envCoeff + randomFluctuation
}

// 剩余寿命计算公式（不变）
const calculateRemainingLife = (damageIndex: number, powerAttenuation: number): { life: number; decayRate: number } => {
  const baseLife = 24
  const decayRate = damageIndex * 0.001 * powerAttenuation
  const life = baseLife / (damageIndex / 100) * (1 - decayRate / 10)
  return { life: Math.max(life, 0.5), decayRate }
}

// ================= 数据初始化（不变）=================
const historyData = fiberWarningData.map(item => ({
  time: item.time,
  value: calculateDamageIndex(item.powerAttenuation, item.vibration)
}))

const predictData = Array.from({ length: 6 }, (_, i) => {
  const baseTime = 16 + i
  const time = `${baseTime < 24 ? baseTime : baseTime - 24}:00`
  const powerAttenuation = 6.2 + i * 0.3
  const vibration = 33.7 + i * 1.5
  return {
    time,
    value: calculateDamageIndex(powerAttenuation, vibration)
  }
})

const currentDamage = historyData.at(-1)!.value
const { life: remainingLife, decayRate } = calculateRemainingLife(currentDamage, fiberWarningData.at(-1)!.powerAttenuation)
const fiberWarningCount = fiberWarningData.reduce((sum, item) => sum + item.count, 0)
const fiberWarning7d = Math.floor(fiberWarningCount * 1.2)
const { level: maintenancePriority, coefficient: riskCoefficient } = calculateMaintenancePriority(
  currentDamage,
  fiberWarningCount,
  decayRate
)

// ================= 状态计算（不变）=================
const riskLevel = computed(() => {
  if (currentDamage < 60) return { color: 'text-green-400', level: '低风险' }
  if (currentDamage < 85) return { color: 'text-yellow-400', level: '中风险' }
  return { color: 'text-red-400', level: '高风险' }
})

const riskLevelText = computed(() => riskLevel.value.level)

const maintenancePriorityColor = computed(() => {
  switch (maintenancePriority) {
    case '极高': return 'text-red-500'
    case '高': return 'text-orange-400'
    case '中': return 'text-yellow-400'
    default: return 'text-green-400'
  }
})

const maintenanceAdvice = computed(() => {
  if (maintenancePriority === '极高') {
    return {
      color: 'text-red-400',
      text: '【紧急】管损指数已达高风险阈值，建议48小时内安排检修，重点排查光纤预警高频触发区域，更换老化管件'
    }
  } else if (maintenancePriority === '高') {
    return {
      color: 'text-orange-400',
      text: '【高优先级】剩余寿命衰减加速，建议7天内安排专项检测，优化光纤监测频率至每2小时一次'
    }
  } else if (maintenancePriority === '中') {
    return {
      color: 'text-yellow-400',
      text: '【中优先级】建议每月例行检测，关注光功率衰减趋势，暂无需紧急维修'
    }
  } else {
    return {
      color: 'text-green-400',
      text: '【低优先级】维持常规季度巡检即可，当前管损状态稳定'
    }
  }
})

// ================= ECharts 初始化（不变）=================
const trendRef = ref<HTMLDivElement>(null)
const lifeRef = ref<HTMLDivElement>(null)
const correlationRef = ref<HTMLDivElement>(null)
const priorityRef = ref<HTMLDivElement>(null)

onMounted(() => {
  startDataRefresh();

  // 1. 管损趋势演化分析图表
  const trendChart = echarts.init(trendRef.value!)
  trendChart.setOption({
    title: { text: '综合管损趋势折线', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
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

  // 2. 剩余寿命预测曲线
  const lifeChart = echarts.init(lifeRef.value!)
  const lifePredictData = Array.from({ length: 12 }, (_, i) => {
    const currentDamage = historyData.at(-1)!.value + i * 2.5
    const powerAttenuation = fiberWarningData.at(-1)!.powerAttenuation + i * 0.4
    return calculateRemainingLife(currentDamage, powerAttenuation).life
  })
  const lifeTimeData = Array.from({ length: 12 }, (_, i) => `${i + 1}月后`)
  
  lifeChart.setOption({
    title: { text: '剩余寿命预测折线', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
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

  // 3. 光纤预警与管损相关性分析
  const correlationChart = echarts.init(correlationRef.value!)
  correlationChart.setOption({
    title: { text: '管损相关性折线', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
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

  // 4. 检修优先级分布
  const priorityChart = echarts.init(priorityRef.value!)
  const pipeSections = ['管段1', '管段2', '管段3', '管段4', '管段5', '管段6', '管段7', '管段8', '管段9', '管段10']
  const priorityData = pipeSections.map(() => {
    const coeff = Math.random() * 10
    if (coeff >= 8) return '极高'
    else if (coeff >= 6) return '高'
    else if (coeff >= 4) return '中'
    else return '低'
  })
  const priorityCount = {
    '极高': priorityData.filter(p => p === '极高').length,
    '高': priorityData.filter(p => p === '高').length,
    '中': priorityData.filter(p => p === '中').length,
    '低': priorityData.filter(p => p === '低').length
  }

  priorityChart.setOption({
    title: { text: '检修优先级权重饼图', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'item' },
    legend: { top: 30, textStyle: { color: '#cbd5f5' }, right: 10 },
    series: [
      {
        name: '检修优先级',
        type: 'pie',
        radius: ['25%', '50%'],
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

  window.addEventListener('resize', () => {
    trendChart.resize()
    lifeChart.resize()
    correlationChart.resize()
    priorityChart.resize()
  })
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<style scoped>
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

.bg-gray-750 {
  background-color: #2a323c;
}
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>