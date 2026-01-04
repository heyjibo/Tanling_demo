<template>
  <GlassCard title="a) 光纤传感预警系统 (火电 / LNG)">
    <!-- 管道区域 -->
    <div class="pipeline-wrap">
      <div class="pipeline">
        <div
          v-for="fiber in visibleFibers"
          :key="fiber.id"
          class="fiber"
          :class="{ active: fiber.id === activeFiberId }"
          :style="{ top: fiber.top + 'px' }"
          @click="selectFiber(fiber.id)"
          @mousemove="onFiberMove($event, fiber)"
          @mouseleave="hideHoverPoint"
        >
          {{ fiber.name }}

          <!-- 悬浮提示点 -->
          <div
            v-if="hover.visible && hover.fiberId === fiber.id"
            class="hover-point"
            :class="{ alarm: hover.isAlarm }"
            :style="{ left: hover.x + 'px' }"
          >
            点 {{ hover.index + 1 }}
          </div>
        </div>
      </div>

      <!-- 光纤滚动 -->
      <div class="fiber-scroll">
        <button @click="prevGroup">▲</button>
        <button @click="nextGroup">▼</button>
      </div>
    </div>

    <!-- 图表 -->
    <div ref="chartRef" class="chart"></div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as echarts from 'echarts';
import GlassCard from '@/components/Common/GlassCard.vue';

/* ===============================
   常量配置
=============================== */
const FIBER_COUNT = 10;     // 光纤总数
const VIEW_SIZE = 3;       // 每页显示光纤数
const POINT_COUNT = 40;    // 每根光纤检测点数
const ALARM_TEMP = 70;     // 告警阈值

/* ===============================
   数据生成（假数据）
=============================== */
function generateFiber(id: number) {
  let base = 45 + Math.random() * 10;
  const temps: number[] = [];

  for (let i = 0; i < POINT_COUNT; i++) {
    if (i % 7 === 0) base += (Math.random() - 0.5) * 25;
    temps.push(Math.round(base + Math.random() * 3));
  }

  return {
    id,
    name: `光纤 ${id}`,
    temps,
    alarms: temps.map(t => t >= ALARM_TEMP)
  };
}

const fibers = ref(
  Array.from({ length: FIBER_COUNT }, (_, i) =>
    generateFiber(i + 1)
  )
);

/* ===============================
   光纤窗口控制
=============================== */
const startIndex = ref(0);

const visibleFibers = computed(() =>
  fibers.value
    .slice(startIndex.value, startIndex.value + VIEW_SIZE)
    .map((fiber, idx) => ({
      ...fiber,
      top: 18 + idx * 24
    }))
);

function prevGroup() {
  startIndex.value = Math.max(0, startIndex.value - 1);
}

function nextGroup() {
  startIndex.value = Math.min(
    FIBER_COUNT - VIEW_SIZE,
    startIndex.value + 1
  );
}

/* ===============================
   悬浮点逻辑
=============================== */
const hover = ref({
  visible: false,
  fiberId: 0,
  index: 0,
  x: 0,
  isAlarm: false
});

function onFiberMove(e: MouseEvent, fiber: any) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX - rect.left;

  const index = Math.min(
    fiber.temps.length - 1,
    Math.max(
      0,
      Math.floor((x / rect.width) * fiber.temps.length)
    )
  );

  hover.value = {
    visible: true,
    fiberId: fiber.id,
    index,
    x,
    isAlarm: fiber.alarms[index]
  };
}

function hideHoverPoint() {
  hover.value.visible = false;
}

/* ===============================
   图表
=============================== */
const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts;

const activeFiberId = ref(1);

function renderChart(fiberId: number) {
  const fiber = fibers.value.find(f => f.id === fiberId)!;

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) =>
        `检测点 ${params[0].axisValue}<br/>温度：${params[0].data.value} ℃`
    },
    grid: {
      left: 40,
      right: 20,
      top: 30,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: fiber.temps.map((_, i) => i + 1),
      name: '检测点'
    },
    yAxis: {
      type: 'value',
      name: '℃',
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.08)' }
      }
    },
    series: [
      {
        type: 'line',
        step: 'middle',
        symbolSize: 6,
        data: fiber.temps.map((v, i) => ({
          value: v,
          itemStyle: fiber.alarms[i]
            ? { color: '#ef4444' }
            : undefined
        })),
        lineStyle: {
          width: 2,
          color: '#38bdf8'
        }
      }
    ]
  });
}

function selectFiber(id: number) {
  activeFiberId.value = id;
  renderChart(id);
}

onMounted(() => {
  chart = echarts.init(chartRef.value!);
  renderChart(activeFiberId.value);
});
</script>

<style scoped>
.pipeline-wrap {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.pipeline {
  position: relative;
  flex: 1;
  height: 90px;
  border-radius: 45px;
  background: linear-gradient(to bottom, #0f172a, #020617);
  border: 1px solid #334155;
}

.fiber {
  position: absolute;
  left: 12px;
  right: 12px;
  height: 10px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.25);
  border: 1px solid rgba(56, 189, 248, 0.4);
  font-size: 12px;
  color: #7dd3fc;
  cursor: pointer;
}

.fiber.active {
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
}

/* 悬浮提示 */
.hover-point {
  position: absolute;
  top: -20px;
  transform: translateX(-50%);
  padding: 2px 6px;
  font-size: 11px;
  border-radius: 4px;
  background: #0ea5e9;
  color: #fff;
  white-space: nowrap;
  pointer-events: none;
}

.hover-point::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px 4px 0;
  border-style: solid;
  border-color: #0ea5e9 transparent transparent;
}

.hover-point.alarm {
  background: #ef4444;
}

.hover-point.alarm::after {
  border-color: #ef4444 transparent transparent;
}

/* 滚动按钮 */
.fiber-scroll {
  display: flex;
  flex-direction: column;
}

.fiber-scroll button {
  background: #020617;
  color: #94a3b8;
  border: 1px solid #334155;
  cursor: pointer;
  height: 45px;
}

.chart {
  height: 220px;
}
</style>
