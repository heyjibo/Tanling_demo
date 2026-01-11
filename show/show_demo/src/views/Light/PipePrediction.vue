<template>
  <div class="min-h-screen bg-[#0b1121] text-slate-300 p-4 md:p-6 relative overflow-hidden font-sans select-none">
    
    <!-- 背景装饰 -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
    </div>

    <div class="relative z-10 flex flex-col h-full gap-5">
      <!-- 头部 -->
      <div class="flex justify-between items-end border-b border-slate-800/60 pb-4">
        <div>
          <button 
            @click="$emit('back')"
            class="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group mb-2 text-sm"
          >
            <el-icon class="mr-1 group-hover:-translate-x-1 transition-transform"><ArrowLeft /></el-icon>
            返回监控大屏
          </button>
          <div class="flex items-center gap-3">
             <div class="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
                <el-icon size="24" color="white"><DataLine /></el-icon>
             </div>
             <div>
                <h1 class="text-2xl font-bold text-white tracking-wide">
                  管道全生命周期分析与预测
                </h1>
                <p class="text-xs text-slate-400 mt-1 font-mono">
                  基于 DAS 光纤传感与 AI 深度学习模型
                </p>
             </div>
          </div>
        </div>
        
        <!-- 系统状态指示 -->
        <div class="flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
           <div class="text-right">
              <div class="text-[10px] text-slate-500 uppercase">System Status</div>
              <div class="font-bold flex items-center justify-end gap-2" :class="riskLevel.color">
                 <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="riskLevel.bg"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2" :class="riskLevel.bg"></span>
                 </span>
                 {{ riskLevel.level }}
              </div>
           </div>
           <div class="h-8 w-[1px] bg-slate-700"></div>
           <div class="text-right">
              <div class="text-[10px] text-slate-500 uppercase">Last Update</div>
              <div class="text-cyan-400 font-mono font-bold">{{ currentTime }}</div>
           </div>
        </div>
      </div>

      <!-- 核心指标概览 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group">
          <div class="flex justify-between items-start">
             <div class="text-sm text-slate-400">综合管损指数</div>
             <el-icon class="text-slate-600 group-hover:text-cyan-400 transition-colors"><Odometer /></el-icon>
          </div>
          <div class="text-3xl font-bold mt-2 font-mono text-white">
            {{ currentDamage.toFixed(1) }}
          </div>
          <div class="w-full bg-slate-700 h-1 mt-3 rounded-full overflow-hidden">
             <div class="h-full bg-gradient-to-r from-green-400 to-red-500 transition-all duration-1000" :style="{ width: Math.min(currentDamage, 100) + '%' }"></div>
          </div>
        </div>

        <div class="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 group">
          <div class="flex justify-between items-start">
             <div class="text-sm text-slate-400">剩余预测寿命</div>
             <el-icon class="text-slate-600 group-hover:text-blue-400 transition-colors"><Timer /></el-icon>
          </div>
          <div class="text-3xl font-bold mt-2 font-mono text-blue-400">
            {{ remainingLife.toFixed(1) }} <span class="text-sm text-slate-500 font-sans font-normal">个月</span>
          </div>
          <div class="text-xs text-slate-500 mt-2 flex items-center gap-1">
             <el-icon class="text-red-400"><TrendCharts /></el-icon> 
             衰减速率: <span class="text-slate-300">{{ decayRate.toFixed(2) }}%/月</span>
          </div>
        </div>

        <div class="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 hover:border-yellow-500/30 transition-all duration-300 group">
          <div class="flex justify-between items-start">
             <div class="text-sm text-slate-400">检修紧迫度</div>
             <el-icon class="text-slate-600 group-hover:text-yellow-400 transition-colors"><FirstAidKit /></el-icon>
          </div>
          <div class="text-3xl font-bold mt-2 font-mono" :class="maintenancePriorityColor">
            {{ maintenancePriority }}
          </div>
          <div class="text-xs text-slate-500 mt-2">
             风险系数: <span class="font-bold text-slate-300">{{ riskCoefficient.toFixed(2) }}</span>
          </div>
        </div>

        <div class="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 group">
          <div class="flex justify-between items-start">
             <div class="text-sm text-slate-400">光纤预警累计</div>
             <el-icon class="text-slate-600 group-hover:text-purple-400 transition-colors"><Bell /></el-icon>
          </div>
          <div class="text-3xl font-bold mt-2 font-mono text-purple-400">
            {{ fiberWarningCount }}
          </div>
          <div class="text-xs text-slate-500 mt-2">
             7日新增: <span class="text-purple-300">+{{ fiberWarning7d }}</span> 次
          </div>
        </div>
      </div>

      <!-- 智能维修建议 -->
      <div class="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl p-1 border border-slate-700/50">
        <div class="bg-[#0f172a] rounded-lg p-4 flex items-center gap-4">
           <div class="p-3 rounded-full bg-slate-800 border border-slate-700 shrink-0">
              <el-icon size="20" :class="maintenanceAdvice.iconColor" class="animate-pulse"><Cpu /></el-icon>
           </div>
           <div>
              <div class="text-sm font-bold text-slate-400 mb-1">AI 智能决策建议</div>
              <div class="text-sm font-medium" :class="maintenanceAdvice.color">
                {{ maintenanceAdvice.text }}
              </div>
           </div>
           <div class="ml-auto">
              <el-button v-if="maintenancePriority === '极高'" type="danger" size="small" round class="animate-bounce" @click="handleBatchDispatch">
                 一键生成紧急工单
              </el-button>
           </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden flex flex-col h-[320px]">
        <div class="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
          <h3 class="font-bold text-white flex items-center gap-2">
            <el-icon class="text-cyan-500"><List /></el-icon> 风险管段实时监控列表
          </h3>
          <div class="flex items-center gap-2">
             <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
             </span>
             <span class="text-xs text-cyan-400 font-mono">实时同步中...</span>
          </div>
        </div>
        <div class="flex-1 overflow-auto">
          <table class="w-full text-sm text-left border-collapse">
            <thead class="text-xs uppercase bg-slate-900/50 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th class="px-6 py-3 font-semibold">管段编号</th>
                <th class="px-6 py-3 font-semibold">管损指数</th>
                <th class="px-6 py-3 font-semibold">预测寿命</th>
                <th class="px-6 py-3 font-semibold">预警频次</th>
                <th class="px-6 py-3 font-semibold">优先级</th>
                <th class="px-6 py-3 font-semibold">状态</th>
                <th class="px-6 py-3 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/30">
              <transition-group name="list">
                <tr 
                  v-for="(item, index) in pipeCheckList" 
                  :key="item.pipeNo" 
                  class="hover:bg-slate-700/30 transition-colors duration-200"
                  :class="{'bg-red-500/10 hover:bg-red-500/20 animate-[pulse_2s_infinite]': item.priority === '极高'}"
                >
                  <td class="px-6 py-3 font-mono text-slate-300">{{ item.pipeNo }}</td>
                  <td class="px-6 py-3">
                     <div class="flex items-center gap-2">
                        <span :class="item.damageIndex > 100 ? 'text-red-400 font-bold' : 'text-slate-300'">{{ item.damageIndex.toFixed(1) }}</span>
                        <el-progress :percentage="Math.min(item.damageIndex, 100)" :show-text="false" :status="item.damageIndex > 100 ? 'exception' : ''" class="w-16 !m-0"/>
                     </div>
                  </td>
                  <td class="px-6 py-3 font-mono">{{ item.remainingLife.toFixed(1) }} <span class="text-xs text-slate-500">月</span></td>
                  <td class="px-6 py-3">
                     <span class="px-2 py-0.5 rounded bg-slate-700 text-xs text-slate-300 border border-slate-600">{{ item.warningCount }}</span>
                  </td>
                  <td class="px-6 py-3">
                    <span :class="getPriorityClass(item.priority)" class="flex items-center gap-1">
                       <el-icon v-if="item.priority === '极高'"><Warning /></el-icon>
                       {{ item.priority }}
                    </span>
                  </td>
                  <td class="px-6 py-3">
                    <span 
                      :class="getStatusClass(item.status)" 
                      @click="openStatusModal(item)"
                      class="cursor-pointer hover:underline decoration-dashed underline-offset-4"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-right">
                     <button 
                       v-if="item.status === '待检测'"
                       @click="dispatchDrone(item)"
                       class="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded transition-colors"
                     >
                        无人机派单
                     </button>
                  </td>
                </tr>
              </transition-group>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 图表区域：修正高度和布局 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 1. 管损趋势演化分析 -->
        <div class="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 h-[360px]">
          <div class="text-sm font-bold text-slate-300 mb-2 pl-2 border-l-4 border-cyan-500 flex justify-between h-8 items-center">
             <span>管损趋势演化预测 (Trend)</span>
             <el-tag size="small" type="info" effect="dark">LSTM Model</el-tag>
          </div>
          <div ref="trendRef" class="w-full h-[calc(100%-2rem)]"></div>
        </div>
        <!-- 2. 剩余寿命预测曲线 -->
        <div class="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 h-[360px]">
          <div class="text-sm font-bold text-slate-300 mb-2 pl-2 border-l-4 border-blue-500 flex justify-between h-8 items-center">
             <span>剩余寿命衰减模型 (RUL)</span>
             <el-tag size="small" type="info" effect="dark">Weibull Dist</el-tag>
          </div>
          <div ref="lifeRef" class="w-full h-[calc(100%-2rem)]"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 3. 光纤预警与管损相关性分析 -->
        <div class="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 h-[360px]">
          <div class="text-sm font-bold text-slate-300 mb-2 pl-2 border-l-4 border-purple-500 h-8 flex items-center">光纤预警-管损特征关联 (Correlation)</div>
          <div ref="correlationRef" class="w-full h-[calc(100%-2rem)]"></div>
        </div>
        <!-- 4. 检修优先级分布 -->
        <div class="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 h-[360px]">
          <div class="text-sm font-bold text-slate-300 mb-2 pl-2 border-l-4 border-yellow-500 h-8 flex items-center">全网检修优先级分布 (Distribution)</div>
          <div ref="priorityRef" class="w-full h-[calc(100%-2rem)]"></div>
        </div>
      </div>
    </div>

    <!-- 状态修改弹窗 -->
    <el-dialog
       v-model="statusModalVisible"
       title="管段状态变更"
       width="400px"
       :modal-append-to-body="true"
       custom-class="bg-slate-800 border border-slate-700"
    >
        <div v-if="currentEditItem" class="space-y-4 text-slate-300">
                     <div class="p-3 bg-slate-900/50 rounded border border-slate-700">
              <div class="text-xs text-slate-500">Target Pipeline</div>
              <div class="text-lg font-bold text-white">{{ currentEditItem.pipeNo }}</div>
              <div class="text-xs mt-1" :class="getPriorityClass(currentEditItem.priority)">当前风险等级: {{ currentEditItem.priority }}</div>
           </div>
           
           <div>
              <label class="block text-sm mb-2 text-slate-400">变更状态为</label>
              <el-select v-model="currentEditItem.status" class="w-full" placeholder="Select">
                 <el-option value="待检测" label="待检测" />
                 <el-option value="检测中" label="检测中" />
                 <el-option value="已排期" label="已排期" />
                 <el-option value="已处理" label="已处理" />
              </el-select>
           </div>
        </div>
        <template #footer>
           <span class="dialog-footer">
              <el-button @click="closeStatusModal">取消</el-button>
              <el-button type="primary" @click="saveStatusChange">确认变更</el-button>
           </span>
        </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { 
  ArrowLeft, DataLine, Warning, 
  Odometer, Timer, TrendCharts, FirstAidKit, Bell, Cpu, List
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import dayjs from 'dayjs'

// ================= 类型定义 =================
interface PipeCheckItem {
  pipeNo: string;
  damageIndex: number;
  remainingLife: number;
  warningCount: number;
  priority: '极高' | '高' | '中' | '低';
  status: '待检测' | '检测中' | '已排期' | '已处理';
}

// ================= 状态与核心数据 =================
const currentTime = ref(dayjs().format('HH:mm:ss'))
const pipeCheckList = ref<PipeCheckItem[]>([])

// 基础模拟数据（用于驱动图表和指标）
const fiberWarningData = [
  { time: '08:00', powerAttenuation: 2.1, vibration: 15.2, count: 1 },
  { time: '09:00', powerAttenuation: 2.8, vibration: 18.7, count: 1 },
  { time: '10:00', powerAttenuation: 3.5, vibration: 22.1, count: 2 },
  { time: '11:00', powerAttenuation: 4.2, vibration: 25.8, count: 1 },
  { time: '12:00', powerAttenuation: 5.1, vibration: 29.3, count: 3 },
  { time: '13:00', powerAttenuation: 4.8, vibration: 27.6, count: 2 },
  { time: '14:00', powerAttenuation: 5.5, vibration: 31.2, count: 2 },
  { time: '15:00', powerAttenuation: 6.2, vibration: 33.7, count: 4 },
]

// ================= 逻辑方法 =================

const calculateMaintenancePriority = (damageIndex: number, warningCount: number, decayRate: number): { level: string; coefficient: number } => {
  const coefficient = damageIndex * 0.05 + warningCount * 0.3 + decayRate * 0.8;
  let level = '低';
  if (coefficient >= 10) level = '极高';
  else if (coefficient >= 8) level = '高';
  else if (coefficient >= 5) level = '中';
  return { level, coefficient };
};

const calculateDamageIndex = (powerAttenuation: number, vibration: number): number => {
  const baseCoeff = 80
  const powerCoeff = 1 + (powerAttenuation / 10)
  const vibrationCoeff = 1 + (vibration / 50)
  const envCoeff = 1.05
  return baseCoeff * powerCoeff * vibrationCoeff * envCoeff + (Math.random() * 5 - 2.5)
}

const calculateRemainingLife = (damageIndex: number, powerAttenuation: number): { life: number; decayRate: number } => {
  const baseLife = 24
  const decayRate = damageIndex * 0.001 * powerAttenuation
  const life = baseLife / (damageIndex / 100) * (1 - decayRate / 10)
  return { life: Math.max(life, 0.5), decayRate }
}

const generatePipeCheckData = (): PipeCheckItem[] => {
  const isEmergency = Math.random() > 0.7;
  
  return Array.from({ length: 8 }, (_, i) => {
    let damageIndex = 60 + Math.random() * 50; 
    let warningCount = Math.floor(Math.random() * 10);
    let powerAttenuation = 5 + Math.random() * 5;

    if (i === 0 && isEmergency) {
        damageIndex = 110 + Math.random() * 20;
        warningCount = 15 + Math.floor(Math.random() * 10);
        powerAttenuation = 15;
    }

    const decayRate = damageIndex * 0.005 * powerAttenuation;
    const { level } = calculateMaintenancePriority(damageIndex, warningCount, decayRate);
    const { life } = calculateRemainingLife(damageIndex, powerAttenuation);
    
    // 显式类型声明修复 TS 错误
    const status: '待检测' | '检测中' | '已排期' | '已处理' = '待检测';

    return {
      pipeNo: `GD-${1001 + i}`,
      damageIndex,
      remainingLife: life,
      warningCount,
      priority: level as '极高' | '高' | '中' | '低',
      status
    };
  }).sort((a,b) => b.damageIndex - a.damageIndex);
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case '极高': return 'text-red-500 font-bold animate-pulse';
    case '高': return 'text-orange-400 font-bold';
    case '中': return 'text-yellow-400 font-medium';
    case '低': return 'text-green-400 font-medium';
    default: return 'text-slate-400';
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case '待检测': return 'text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10 text-xs';
    case '检测中': return 'text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded bg-purple-500/10 text-xs';
    case '已排期': return 'text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded bg-yellow-500/10 text-xs';
    case '已处理': return 'text-green-400 border border-green-500/30 px-2 py-0.5 rounded bg-green-500/10 text-xs';
    default: return '';
  }
};

// ================= 状态监控与交互逻辑 =================

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
    const item = pipeCheckList.value[targetIndex];
    item.status = currentEditItem.value.status;
    ElMessage.success(`管段 ${item.pipeNo} 状态已更新为 [${item.status}]`);
  }
  closeStatusModal()
}

const handleBatchDispatch = () => {
  ElMessage.success('已自动向最近的无人机基站发送所有高风险管段巡检指令！');
}

const dispatchDrone = (item: PipeCheckItem) => {
  ElMessage({
    message: `已向管段 ${item.pipeNo} 派遣巡检无人机，预计 15分钟 后到达。`,
    type: 'success',
    grouping: true,
  })
  item.status = '检测中';
}

// ================= 指标计算 =================
// 历史数据转换
const historyData = fiberWarningData.map(item => ({
  time: item.time,
  value: calculateDamageIndex(item.powerAttenuation, item.vibration)
}))

const currentDamage = historyData.at(-1)!.value
const { life: remainingLife, decayRate } = calculateRemainingLife(currentDamage, fiberWarningData.at(-1)!.powerAttenuation)
const fiberWarningCount = fiberWarningData.reduce((sum, item) => sum + item.count, 0)
const fiberWarning7d = Math.floor(fiberWarningCount * 1.2)
const { level: maintenancePriority, coefficient: riskCoefficient } = calculateMaintenancePriority(
  currentDamage,
  fiberWarningCount,
  decayRate
)

const riskLevel = computed(() => {
  if (currentDamage < 70) return { color: 'text-green-400', bg: 'bg-green-500', level: 'SYSTEM NORMAL' }
  if (currentDamage < 100) return { color: 'text-yellow-400', bg: 'bg-yellow-500', level: 'ATTENTION REQUIRED' }
  return { color: 'text-red-500', bg: 'bg-red-500', level: 'CRITICAL FAILURE' }
})

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
      iconColor: 'text-red-500',
      text: '检测到管壁应力急剧升高，伴随高频震动信号，存在爆管风险。建议立即隔离该管段并派遣紧急抢修队。'
    }
  } else if (maintenancePriority === '高') {
    return {
      color: 'text-orange-400',
      iconColor: 'text-orange-500',
      text: '剩余寿命预测显示衰减加速，光功率损耗超标。建议在未来 7 天内安排无损探伤检测。'
    }
  } else if (maintenancePriority === '中') {
    return {
      color: 'text-yellow-400',
      iconColor: 'text-yellow-500',
      text: '管损指数处于临界观察区，建议增加光纤DAS系统的采样频率，密切关注趋势变化。'
    }
  } else {
    return {
      color: 'text-green-400',
      iconColor: 'text-green-500',
      text: '当前管道运行状况良好，各项指标均在安全阈值内，建议维持常规巡检计划。'
    }
  }
})

// ================= ECharts 图表逻辑 =================
const trendRef = ref<HTMLDivElement | null>(null)
const lifeRef = ref<HTMLDivElement | null>(null)
const correlationRef = ref<HTMLDivElement | null>(null)
const priorityRef = ref<HTMLDivElement | null>(null)

let timer: any = null;
let trendChart: echarts.ECharts | null = null;
let lifeChart: echarts.ECharts | null = null;
let corrChart: echarts.ECharts | null = null;
let priorityChart: echarts.ECharts | null = null;

onMounted(() => {
  setInterval(() => { currentTime.value = dayjs().format('HH:mm:ss') }, 1000);
  
  pipeCheckList.value = generatePipeCheckData();
  
  timer = setInterval(() => {
      if (!statusModalVisible.value) {
        const newData = generatePipeCheckData();
        pipeCheckList.value.forEach((item, index) => {
           if (item.status !== '待检测') return;
           if (newData[index]) {
             pipeCheckList.value[index] = { ...newData[index], status: item.status };
           }
        });
      }
  }, 8000);

  nextTick(() => {
    // 延迟初始化以确保 DOM 尺寸正确
    setTimeout(initCharts, 100);
  });
})

const initCharts = () => {
    // 预测数据在初始化时生成，确保数据存在
    const predictData = Array.from({ length: 6 }, (_, i) => {
      const baseTime = 16 + i
      const time = `${baseTime}:00`
      const powerAttenuation = 6.2 + i * 0.5 + Math.random() * 0.5
      const vibration = 33.7 + i * 1.5 + Math.random() * 2
      return {
        time,
        value: calculateDamageIndex(powerAttenuation, vibration)
      }
    })

    if(trendRef.value) {
        trendChart = echarts.init(trendRef.value)
        trendChart.setOption({
          grid: { top: 30, left: 40, right: 20, bottom: 20, containLabel: true },
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: '#475569', textStyle: { color: '#cbd5e1' } },
          xAxis: { type: 'category', data: [...historyData, ...predictData].map(d => d.time), axisLabel: { color: '#94a3b8' } },
          yAxis: { 
            type: 'value', 
            splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }, 
            axisLabel: { color: '#94a3b8' },
            min: function (value: any) { return Math.floor(value.min * 0.8); } // 动态最小值
          },
          series: [{
              type: 'line',
              smooth: true,
              data: [...historyData.map(d => d.value), ...predictData.map(d => d.value)],
              markLine: { 
                  data: [{ yAxis: 100, name: '报警阈值' }], 
                  lineStyle: { color: '#ef4444', type: 'solid' },
                  label: { formatter: 'Alert Limit' }
              },
              areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(34, 211, 238, 0.2)' }, 
                      { offset: 1, color: 'rgba(34, 211, 238, 0)' }
                  ])
              },
              itemStyle: { color: '#22d3ee' }
          }]
        })
    }

    if(lifeRef.value) {
        lifeChart = echarts.init(lifeRef.value)
        lifeChart.setOption({
          grid: { top: 30, left: 40, right: 20, bottom: 20, containLabel: true },
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: '#475569', textStyle: { color: '#cbd5e1' } },
          xAxis: { type: 'category', data: Array.from({length: 12}, (_,i) => `M+${i+1}`), axisLabel: { color: '#94a3b8' } },
          yAxis: { type: 'value', name: 'RUL (Month)', splitLine: { show: false }, axisLabel: { color: '#94a3b8' } },
          series: [{
              type: 'bar',
              data: Array.from({length: 12}, (_,i) => Math.max(0, 24 - i * 2.1 - Math.random())),
              itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#3b82f6' }, { offset: 1, color: '#1d4ed8' }
                  ]),
                  borderRadius: [4, 4, 0, 0]
              }
          }]
        })
    }

    if(correlationRef.value) {
        corrChart = echarts.init(correlationRef.value)
        corrChart.setOption({
          grid: { top: 30, left: 40, right: 40, bottom: 20, containLabel: true },
          tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
          xAxis: { type: 'category', data: fiberWarningData.map(d => d.time), axisLabel: { color: '#94a3b8' } },
          yAxis: [
              { type: 'value', name: 'Damage', position: 'left', axisLine: { show: true, lineStyle: { color: '#3b82f6' } }, splitLine: { show: false } },
              { type: 'value', name: 'Attenuation', position: 'right', axisLine: { show: true, lineStyle: { color: '#f59e0b' } }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } }
          ],
          series: [
              { name: '管损指数', type: 'line', data: historyData.map(d => d.value), smooth: true, lineStyle: { width: 3, color: '#3b82f6' } },
              { name: '光衰减', type: 'line', yAxisIndex: 1, data: fiberWarningData.map(d => d.powerAttenuation), smooth: true, lineStyle: { width: 3, type: 'dashed', color: '#f59e0b' } }
          ]
        })
    }

    if(priorityRef.value) {
        priorityChart = echarts.init(priorityRef.value)
        priorityChart.setOption({
          tooltip: { trigger: 'item' },
          legend: { bottom: 0, textStyle: { color: '#cbd5e1' }, icon: 'circle' },
          series: [{
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['50%', '45%'],
              itemStyle: { borderRadius: 5, borderColor: '#1e293b', borderWidth: 2 },
              label: { color: '#cbd5e1' },
              data: [
                  { value: 5, name: '极高', itemStyle: { color: '#ef4444' } },
                  { value: 12, name: '高', itemStyle: { color: '#f97316' } },
                  { value: 25, name: '中', itemStyle: { color: '#eab308' } },
                  { value: 48, name: '低', itemStyle: { color: '#22c55e' } }
              ]
          }]
        })
    }

    window.addEventListener('resize', handleResize)
}

const handleResize = () => {
    trendChart?.resize();
    lifeChart?.resize();
    corrChart?.resize();
    priorityChart?.resize();
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  lifeChart?.dispose();
  corrChart?.dispose();
  priorityChart?.dispose();
})
</script>

<style scoped>
/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Element Plus 覆盖样式 */
:deep(.el-dialog) {
    background-color: #1e293b;
    border: 1px solid #334155;
}
:deep(.el-dialog__title) {
    color: #e2e8f0;
}
:deep(.el-input__inner) {
    background-color: #0f172a;
    border-color: #334155;
    color: #cbd5e1;
}
</style>
