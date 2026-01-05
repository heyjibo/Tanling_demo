<template>
  <GlassCard title="a) 光纤传感预警系统 (火电 / LNG)">
    <!-- 管道区域 -->
    <div class="pipeline-wrap">
      <!-- 管道外壳 -->
      <div class="pipeline-shell">
        <div class="pipeline-inner">
          <div
            v-for="fiber in visibleFibers"
            :key="fiber.id"
            class="fiber-track"
            :class="{ active: fiber.id === activeFiberId, 'has-alarm': fiber.hasAlarm }"
            :style="{ top: fiber.top + 'px' }"
            @click="selectFiber(fiber.id)"
            @mousemove="onFiberMove($event, fiber)"
            @mouseleave="hideHoverPoint"
          >
            <!-- 光纤名称 -->
            <span class="fiber-label">{{ fiber.name }}</span>
            
            <!-- 光纤本体（微缩热力图） -->
            <div class="fiber-core" :style="{ background: getFiberGradient(fiber) }"></div>

            <!-- 悬浮提示点 -->
            <div
              v-if="hover.visible && hover.fiberId === fiber.id"
              class="hover-point"
              :class="{ alarm: hover.isAlarm }"
              :style="{ left: hover.x + 'px' }"
            >
              <div class="popover-content">
                <span class="idx">#{{ hover.index + 1 }}</span>
                <span class="val">{{ hover.temp }}℃</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 装饰性光泽 -->
        <div class="shine-overlay"></div>
      </div>

      <!-- 翻页控制 -->
      <div class="fiber-controls">
        <button class="ctrl-btn up" @click="prevGroup" :disabled="startIndex === 0">
          <i class="arrow"></i>
        </button>
        <button class="ctrl-btn down" @click="nextGroup" :disabled="startIndex >= FIBER_COUNT - VIEW_SIZE">
          <i class="arrow"></i>
        </button>
      </div>
    </div>

    <!-- 图表 -->
    <div ref="chartRef" class="chart-container"></div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import GlassCard from '@/components/Common/GlassCard.vue';

/* ===============================
   配置与类型定义
=============================== */
const FIBER_COUNT = 10;     // 光纤数量
const VIEW_SIZE = 3;        // 可视区域显示数量
const POINT_COUNT = 40;     // 每根光纤检测点数
const TEMP_MIN = 20;        // 最低温度
const TEMP_MAX = 90;        // 最高温度

// 核心参数
const INIT_STEP_MAX = 4;    // 初始生成时：相邻点温差不超过 4℃
const SIM_STEP_MAX = 5;     // 动态模拟时：单次变化不超过 5℃
const DIFF_ALARM = 15;      // 告警阈值：邻近点温差 > 15℃

interface FiberData {
  id: number;
  name: string;
  temps: number[];
  alarms: boolean[]; 
  hasAlarm: boolean;
}

/* ===============================
   数据核心逻辑
=============================== */
const fibers = ref<FiberData[]>([]);
let simulationTimer: any = null;

// 1. 生成初始数据（随机游走算法）
// 保证相邻点变化 <= 4度
function initData() {
  fibers.value = Array.from({ length: FIBER_COUNT }, (_, i) => {
    const temps: number[] = [];
    
    // 随机一个起始温度 (例如 30-70 之间，避免开局就撞到底部或顶部)
    let currentTemp = Math.floor(30 + Math.random() * 40);

    for (let j = 0; j < POINT_COUNT; j++) {
      temps.push(currentTemp);

      // 计算下一个点的变化：在 -4 到 +4 之间随机
      // Math.random() * 9 生成 0~8.99，floor后是 0~8，减去4得到 -4~4
      const change = Math.floor(Math.random() * (INIT_STEP_MAX * 2 + 1)) - INIT_STEP_MAX;
      
      currentTemp += change;

      // 边界限制
      if (currentTemp < TEMP_MIN) currentTemp = TEMP_MIN;
      if (currentTemp > TEMP_MAX) currentTemp = TEMP_MAX;
    }

    return analyzeFiber({
      id: i + 1,
      name: `光纤 Loop-${String(i + 1).padStart(2, '0')}`,
      temps,
      alarms: [],
      hasAlarm: false
    });
  });
}

// 2. 数据分析（计算告警）
// 规则：如果一个点和临近的点温度差值大于 15℃ 则标记为红色
function analyzeFiber(fiber: FiberData): FiberData {
  const alarms = fiber.temps.map((temp, i) => {
    const prev = fiber.temps[i - 1] ?? temp; // 边界：无前点则对比自己
    const next = fiber.temps[i + 1] ?? temp; // 边界：无后点则对比自己
    
    const diffPrev = Math.abs(temp - prev);
    const diffNext = Math.abs(temp - next);
    
    return diffPrev > DIFF_ALARM || diffNext > DIFF_ALARM;
  });

  return {
    ...fiber,
    alarms,
    hasAlarm: alarms.includes(true)
  };
}

// 3. 模拟数据变化
// 15s-30s 变化一次，幅度不超过 5℃
function updateSimulation() {
  // 随机生成下一次更新时间：15000ms - 30000ms
  const nextDelay = Math.floor(15000 + Math.random() * 15000);
  
  fibers.value = fibers.value.map(fiber => {
    const newTemps = fiber.temps.map(t => {
      // 随机变化 -5 到 +5
      const change = Math.floor(Math.random() * (SIM_STEP_MAX * 2 + 1)) - SIM_STEP_MAX;
      let newT = t + change;
      
      // 限制范围
      if (newT < TEMP_MIN) newT = TEMP_MIN;
      if (newT > TEMP_MAX) newT = TEMP_MAX;
      return newT;
    });

    return analyzeFiber({ ...fiber, temps: newTemps });
  });

  // 刷新当前选中的图表
  renderChart(activeFiberId.value);

  // 递归调用
  // console.log(`数据更新完毕，下一次更新在 ${nextDelay / 1000}s 后`);
  simulationTimer = setTimeout(updateSimulation, nextDelay);
}

/* ===============================
   视觉逻辑
=============================== */
function getFiberGradient(fiber: FiberData) {
  const stops = fiber.temps.map((t, i) => {
    const pct = (i / (POINT_COUNT - 1)) * 100;
    // 基础色：低温蓝 -> 高温青
    let color = 'rgba(56, 189, 248, 0.4)'; 
    
    // 逻辑：告警 > 高温(>75) > 正常
    if (fiber.alarms[i]) {
      color = '#ef4444'; // 告警红
    } else if (t > 75) {
      color = '#fbbf24'; // 较高温黄
    }
    
    return `${color} ${pct}%`;
  });
  
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}

/* ===============================
   UI 交互逻辑
=============================== */
const startIndex = ref(0);
const activeFiberId = ref(1);

const visibleFibers = computed(() =>
  fibers.value
    .slice(startIndex.value, startIndex.value + VIEW_SIZE)
    .map((fiber, idx) => ({
      ...fiber,
      top: 15 + idx * 32
    }))
);

function prevGroup() {
  startIndex.value = Math.max(0, startIndex.value - 1);
}

function nextGroup() {
  startIndex.value = Math.min(FIBER_COUNT - VIEW_SIZE, startIndex.value + 1);
}

// 悬浮逻辑
const hover = ref({
  visible: false,
  fiberId: 0,
  index: 0,
  x: 0,
  temp: 0,
  isAlarm: false
});

function onFiberMove(e: MouseEvent, fiber: FiberData) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const rawX = e.clientX - rect.left;
  const ratio = rawX / rect.width;
  const index = Math.min(POINT_COUNT - 1, Math.max(0, Math.floor(ratio * POINT_COUNT)));

  hover.value = {
    visible: true,
    fiberId: fiber.id,
    index,
    x: rawX,
    temp: fiber.temps[index],
    isAlarm: fiber.alarms[index]
  };
}

function hideHoverPoint() {
  hover.value.visible = false;
}

/* ===============================
   图表逻辑 (ECharts)
=============================== */
const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts;

function selectFiber(id: number) {
  activeFiberId.value = id;
  renderChart(id);
}

function renderChart(fiberId: number) {
  if (!chart) return;
  const fiber = fibers.value.find(f => f.id === fiberId);
  if (!fiber) return;

  const xData = fiber.temps.map((_, i) => i + 1);
  const seriesData = fiber.temps.map((val, i) => ({
    value: val,
    itemStyle: fiber.alarms[i] ? { 
      color: '#ef4444', 
      borderColor: '#fff', 
      borderWidth: 2 
    } : { color: '#38bdf8' },
    symbolSize: fiber.alarms[i] ? 8 : 3,
  }));

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(2, 6, 23, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any) => {
        const p = params[0];
        const isAlarm = fiber.alarms[p.dataIndex];
        const statusStr = isAlarm ? '<span style="color:#ef4444;font-weight:bold">温差异常</span>' : '正常';
        return `检测点 #${p.axisValue}<br/>
                温度：${p.data.value} ℃<br/>
                状态：${statusStr}`;
      }
    },
    grid: { left: 45, right: 20, top: 40, bottom: 25, containLabel: false },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        step: 'middle', // 阶梯线
        smooth: false,
        data: seriesData,
        lineStyle: { width: 2, color: '#38bdf8' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 189, 248, 0.25)' },
            { offset: 1, color: 'rgba(56, 189, 248, 0.0)' }
          ])
        }
      }
    ]
  };

  chart.setOption(option);
}

/* ===============================
   生命周期
=============================== */
onMounted(() => {
  initData();
  
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    window.addEventListener('resize', () => chart.resize());
    renderChart(activeFiberId.value);
  }

  // 启动模拟
  updateSimulation();
});

onUnmounted(() => {
  clearTimeout(simulationTimer);
  window.removeEventListener('resize', () => chart && chart.resize());
  chart && chart.dispose();
});
</script>

<style scoped>
/* 样式与之前保持一致，重点在于视觉优化 */
.pipeline-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  height: 110px;
}

.pipeline-shell {
  flex: 1;
  position: relative;
  height: 100%;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 1) 50%, rgba(30, 41, 59, 0.9) 100%);
  border-radius: 8px;
  border: 1px solid #334155;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}

.pipeline-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.shine-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
  border-radius: 8px 8px 0 0;
}

.fiber-track {
  position: absolute;
  left: 16px;
  right: 16px;
  height: 22px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 8px;
  border-radius: 4px;
}

.fiber-track:hover {
  background: rgba(255, 255, 255, 0.05);
}

.fiber-track.active {
  background: rgba(56, 189, 248, 0.1);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.3);
}

.fiber-label {
  width: 80px;
  font-size: 12px;
  color: #94a3b8;
  font-family: 'DIN Alternate', monospace;
  white-space: nowrap;
}

.active .fiber-label {
  color: #38bdf8;
  text-shadow: 0 0 5px rgba(56, 189, 248, 0.5);
}

.fiber-core {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #1e293b;
  position: relative;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  transition: opacity 0.3s;
}

/* 告警光纤呼吸效果 */
.has-alarm .fiber-core {
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 4px rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.9); }
  100% { box-shadow: 0 0 4px rgba(239, 68, 68, 0.4); }
}

.hover-point {
  position: absolute;
  top: -6px;
  z-index: 10;
  transform: translateX(-50%);
  pointer-events: none;
}

.hover-point::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #0ea5e9;
  margin: 0 auto;
}

.hover-point.alarm::after {
  border-top-color: #ef4444;
}

.popover-content {
  background: #0ea5e9;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  display: flex;
  gap: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.hover-point.alarm .popover-content {
  background: #ef4444;
}

.fiber-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
}

.ctrl-btn {
  flex: 1;
  width: 32px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.ctrl-btn:hover:not(:disabled) {
  background: #1e293b;
  color: #fff;
  border-color: #475569;
}

.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.ctrl-btn .arrow {
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
}

.ctrl-btn.up .arrow { transform: rotate(-135deg); margin-top: 2px; }
.ctrl-btn.down .arrow { transform: rotate(45deg); margin-bottom: 2px; }

.chart-container {
  height: 220px;
  width: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 4px;
}
</style>
