<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden bg-[#0b1121] text-slate-300 p-3 select-none">
    <!-- ==================== 顶部标题栏 ==================== -->
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
    <div class="flex-none flex justify-between items-center bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <el-icon class="text-cyan-400" :size="20"><Monitor /></el-icon>
        </div>
        <div>
          <h1 class="text-slate-100 font-bold text-xl tracking-wide font-sans">水泵组 #01 - 声纹特征监测终端</h1>
          <div class="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span class="text-green-400 font-bold">SYSTEM ONLINE</span>
            <span class="mx-1 text-slate-600">|</span>
            <span>{{ currentTime }}</span>
          </div>
        </div>
      </div>
      <!-- 右侧状态指示 -->
      <div class="flex gap-8 pr-4">
        <div class="text-right">
          <div class="text-[10px] uppercase text-slate-500 tracking-wider">Sample Rate</div>
          <div class="text-cyan-400 font-mono font-bold text-lg leading-none">48.0 <span class="text-sm">kHz</span></div>
        </div>
        <div class="text-right">
          <div class="text-[10px] uppercase text-slate-500 tracking-wider">CPU Load</div>
          <div class="text-green-400 font-mono font-bold text-lg leading-none">12<span class="text-sm">%</span></div>
        </div>
      </div>
    </div>

    <!-- ==================== 主内容区 ==================== -->
    <div class="flex-1 flex gap-3 min-h-0">
      
      <!-- [左侧] 设备信息与现场实景 (30%) -->
      <GlassCard class="w-[30%] flex flex-col gap-3 min-h-0 !p-3">
        <!-- 1. 设备状态卡片 (紧凑模式) -->
        <div class="flex-none bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 rounded-lg border border-slate-700/50 shadow-lg">
          <div class="flex justify-between items-start mb-3">
            <div>
              <div class="text-slate-100 font-bold text-lg">主电机监测点</div>
              <div class="text-xs text-slate-500 font-mono mt-1">ID: SWJC-NXP-ROA-01</div>
            </div>
            <div class="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold animate-pulse">
              RUNNING
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-2 text-sm text-slate-400 font-mono">
             <div class="p-2 bg-black/20 rounded border border-slate-700/30">
               <div class="text-[10px] text-slate-500 mb-0.5">温度 (Temp)</div>
               <div class="text-slate-200 font-bold text-base">42.5<span class="text-xs font-normal text-slate-500 ml-1">°C</span></div>
             </div>
             <div class="p-2 bg-black/20 rounded border border-slate-700/30">
               <div class="text-[10px] text-slate-500 mb-0.5">震动 (Vib)</div>
               <div class="text-slate-200 font-bold text-base">2.4<span class="text-xs font-normal text-slate-500 ml-1">mm/s</span></div>
             </div>
             <div class="col-span-2 p-2 bg-black/20 rounded border border-slate-700/30 flex justify-between items-center">
               <span class="text-xs text-slate-500">信号质量</span>
               <div class="flex gap-1 items-end h-2.5">
                  <div class="w-1 h-[40%] bg-cyan-500 rounded-sm"></div>
                  <div class="w-1 h-[60%] bg-cyan-500 rounded-sm"></div>
                  <div class="w-1 h-[80%] bg-cyan-500 rounded-sm"></div>
                  <div class="w-1 h-full bg-cyan-500 rounded-sm"></div>
                  <div class="w-1 h-full bg-slate-700 rounded-sm"></div>
               </div>
             </div>
          </div>
        </div>

        <!-- 2. 拓扑示意图 (高度固定，标记常驻) -->
        <div class="flex-none h-[28%] bg-slate-800/50 rounded-lg border border-slate-700/50 relative overflow-hidden flex flex-col">
           <div class="absolute top-2 left-3 text-xs text-slate-400 font-bold z-10 uppercase tracking-wider">Sensor Topology</div>
           <div class="relative w-full h-full p-4 flex items-center justify-center">
             <img src="/src/assets/images/pump_swzd.svg" class="w-full h-full object-contain opacity-80 drop-shadow-2xl" alt="Topology" />
             <template v-for="marker in sensorMarkers" :key="marker.id">
               <div 
                 class="absolute flex flex-col items-center justify-center cursor-pointer"
                 :style="{ left: marker.x, top: marker.y, transform: 'translate(-50%, -50%)' }"
               >
                 <!-- 标记常驻显示 -->
                 <div class="bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-600/50 mb-1 whitespace-nowrap z-20 shadow-lg">
                   {{ marker.name }}
                 </div>
                 <div class="relative w-3 h-3">
                   <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-slate-800"></span>
                 </div>
               </div>
             </template>
           </div>
        </div>

        <!-- 3. 现场实拍图 (Flex-1 占满剩余空间，object-cover 保证填满) -->
        <div class="flex-1 bg-slate-800/50 rounded-lg border border-slate-700/50 relative overflow-hidden group">
           <!-- 使用 object-cover 配合 object-bottom 确保下方关键区域不被裁切 -->
           <img src="/src/assets/images/zd.png" class="w-full h-full object-cover object-bottom opacity-80 group-hover:opacity-100 transition-all duration-700" alt="Site Photo" />
           <div class="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent pointer-events-none"></div>
           <div class="absolute bottom-3 left-3 flex items-center gap-2 bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
             <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <span class="text-xs text-slate-200 font-bold uppercase tracking-wider drop-shadow-md">Live Camera</span>
           </div>
        </div>
      </GlassCard>

      <!-- [右侧] 数据图表区 (70%) -->
      <GlassCard class="w-[70%] flex flex-col min-h-0 bg-slate-800/30 gap-3 !p-3">
        
        <!-- R1. 实时波形 -->
        <div class="h-[30%] flex flex-col bg-slate-900/40 rounded border border-slate-700/30 p-2 overflow-hidden">
           <div class="flex justify-between items-center px-2 mb-1 border-b border-slate-800 pb-2">
             <div class="flex items-center gap-2">
               <el-icon class="text-cyan-500"><Histogram /></el-icon>
               <span class="text-sm font-bold text-slate-300">声纹特征</span>
             </div>
             <div class="flex items-center gap-4">
               <el-button link size="small" @click="resetControls" class="!text-slate-500 hover:!text-cyan-400">
                 <el-icon><RefreshLeft /></el-icon>
               </el-button>
               <div class="h-3 w-[1px] bg-slate-700"></div>
               <div class="flex items-center gap-2">
                 <span class="text-[10px] text-slate-500 uppercase">Offset</span>
                 <div class="flex bg-slate-800 rounded border border-slate-700 overflow-hidden">
                    <button class="px-1.5 hover:bg-slate-700 text-slate-400 transition-colors" @click="changeOffset(-0.2)"><el-icon :size="10"><ArrowDown /></el-icon></button>
                    <span class="px-1 text-xs font-mono text-cyan-400 min-w-[2.5em] text-center bg-slate-900/50 pt-0.5">{{ controls.offset.toFixed(1) }}</span>
                    <button class="px-1.5 hover:bg-slate-700 text-slate-400 transition-colors" @click="changeOffset(0.2)"><el-icon :size="10"><ArrowUp /></el-icon></button>
                 </div>
               </div>
               <div class="flex items-center gap-2 w-28">
                 <span class="text-[10px] text-slate-500 uppercase">Gain</span>
                 <el-slider v-model="controls.amplitude" :min="0" :max="3" :step="0.1" size="small" :show-tooltip="false" class="flex-1" />
               </div>
               <div class="flex items-center gap-3 pl-2 border-l border-slate-700">
                 <div class="cursor-pointer text-slate-400 hover:text-white transition-colors" @click="controls.muted = !controls.muted">
                   <el-icon :size="16" :class="controls.muted ? 'text-red-500' : ''">
                      <Mute v-if="controls.muted" /><Microphone v-else />
                   </el-icon>
                 </div>
                 <el-switch v-model="controls.playing" size="small" style="--el-switch-on-color: #06b6d4; --el-switch-off-color: #334155" />
               </div>
             </div>
           </div>
           <div ref="waveChartRef" class="flex-1 w-full min-h-0"></div>
        </div>

        <!-- R2. 仪表盘 + 热力图 -->
        <div class="h-[35%] flex gap-3 min-h-0">
           <!-- 仪表盘 -->
           <div class="flex-1 bg-slate-900/40 rounded border border-slate-700/30 p-2 flex flex-col relative overflow-hidden">
              <div class="flex justify-between px-2 mb-1 z-10">
                 <div class="text-xs text-slate-400 font-bold">声压级</div>
                 <span class="text-[10px] font-mono" :class="controls.playing ? 'text-green-500' : 'text-yellow-500'">{{ controls.playing ? 'MONITORING' : 'PAUSED' }}</span>
              </div>
              <div ref="gaugeChartRef" class="absolute inset-0 top-6"></div>
           </div>
           
           <!-- 热力图 -->
           <div class="flex-1 bg-slate-900/40 rounded border border-slate-700/30 p-0 flex flex-col relative overflow-hidden">
              <div class="absolute top-2 left-3 z-10 flex flex-col">
                 <span class="text-xs text-slate-300 font-bold shadow-black drop-shadow-md">梅尔时频图</span>
              </div>
              <div ref="heatmapChartRef" class="w-full h-full"></div>
           </div>
        </div>

        <!-- R3. 1/3倍频程谱 -->
        <div class="flex-1 bg-slate-900/40 rounded border border-slate-700/30 p-2 flex flex-col min-h-[180px]">
           <div class="flex justify-between items-center px-2 h-8 border-b border-slate-800/50 mb-1">
             <div class="flex gap-2 items-baseline">
               <span class="text-sm font-bold text-slate-300">1/3 倍频程谱</span>
             </div>
             <div class="flex gap-2 items-center">
                <span class="text-[10px] text-cyan-500 font-mono opacity-70">{{ currentTime }}</span>
                <el-icon class="text-slate-600 hover:text-white cursor-pointer transition-colors"><Download /></el-icon>
             </div>
           </div>
           <div class="flex-1 w-full relative min-h-0">
              <div ref="barChartRef" class="absolute inset-0"></div>
           </div>
        </div>

      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import GlassCard from '@/components/Common/GlassCard.vue'; 
import { Monitor, Histogram, ArrowUp, ArrowDown, Microphone, Mute, RefreshLeft, Download } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

// ================= 状态与数据 =================
const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'));
const controls = reactive({ playing: true, muted: false, amplitude: 1.0, offset: 0 });
const emit = defineEmits(['back']);
// 传感器标记
const sensorMarkers = [
  { id: 1, name: '终端1', x: '63%', y: '25%' },
  { id: 2, name: '终端2', x: '63%', y: '50%' },
  { id: 3, name: '终端3', x: '36%', y: '25%' },
  { id: 4, name: '终端4', x: '36%', y: '50%' },
  { id: 5, name: '终端5', x: '75%', y: '70%' },
];

const categories = ['20','25','31.5','40','50','63','80','100','125','160','200','250','315','400','500','630','800','1k','1.25k','1.6k','2k','2.5k','3.15k','4k','5k','6.3k','8k','10k','12.5k','16k','20k'];
const HEAT_X = 60; 
const SPECTROGRAM_BINS = 80;

const resetControls = () => { controls.playing = true; controls.muted = false; controls.amplitude = 1.0; controls.offset = 0; };
const changeOffset = (val: number) => { controls.offset = parseFloat((controls.offset + val).toFixed(1)); };

// ================= DOM Refs =================
const waveChartRef = ref<HTMLElement | null>(null);
const gaugeChartRef = ref<HTMLElement | null>(null);
const heatmapChartRef = ref<HTMLElement | null>(null);
const barChartRef = ref<HTMLElement | null>(null);

// 使用 shallowRef 或普通变量均可，但在 Unmount 时必须置空
let waveChart: echarts.ECharts | null = null;
let gaugeChart: echarts.ECharts | null = null;
let heatmapChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;

// ================= 图表初始化 =================
const initCharts = () => {
  // 1. 波形图
  if (waveChartRef.value) {
    waveChart = echarts.init(waveChartRef.value);
    waveChart.setOption({
      animation: false,
      grid: { top: 5, bottom: 5, left: 0, right: 0 },
      xAxis: { type: 'category', show: false, boundaryGap: false, max: 200 },
      yAxis: { type: 'value', min: -4, max: 4, show: false }, 
      series: [{ 
        type: 'line', 
        data: new Array(200).fill(0), 
        showSymbol: false, 
        smooth: true, 
        lineStyle: { width: 2, color: '#22d3ee' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 211, 238, 0.2)' },
            { offset: 1, color: 'rgba(34, 211, 238, 0)' }
          ])
        }
      }]
    });
  }

  // 2. 仪表盘
  if (gaugeChartRef.value) {
    gaugeChart = echarts.init(gaugeChartRef.value);
    const gaugeCommon = {
      type: 'gauge',
      startAngle: 200, endAngle: -20,
      min: 0, max: 100,
      radius: '75%', 
      splitNumber: 5,
      itemStyle: { color: '#22d3ee' },
      progress: { show: true, width: 3 }, 
      pointer: { show: true, length: '60%', width: 3, itemStyle: { color: '#fff' } },
      axisLine: { lineStyle: { width: 3, color: [[1, '#1e293b']] } },
      axisTick: { show: false },
      splitLine: { show: true, distance: -3, length: 6, lineStyle: { color: '#475569', width: 1 } },
      axisLabel: { show: false }, 
      anchor: { show: true, showAbove: true, size: 6, itemStyle: { borderWidth: 0, color: '#fff' } },
      title: { 
        show: true, 
        offsetCenter: [0, '100%'], 
        fontSize: 12, 
        color: '#94a3b8', 
        fontWeight: 'bold' 
      },
      detail: { 
        valueAnimation: false, 
        offsetCenter: [0, '65%'], 
        fontSize: 16, 
        fontWeight: 'bold', 
        formatter: '{value}', 
        color: '#fff' 
      }
    };
    gaugeChart.setOption({
      series: [
        { ...gaugeCommon, name: 'A计权', center: ['18%', '55%'], detail: { ...gaugeCommon.detail, color: '#4ade80' } },
        { ...gaugeCommon, name: 'C计权', center: ['50%', '55%'], detail: { ...gaugeCommon.detail, color: '#22d3ee' } },
        { ...gaugeCommon, name: 'Z计权', center: ['82%', '55%'], detail: { ...gaugeCommon.detail, color: '#f472b6' } }
      ]
    });
  }

  // 3. 热力图
  if (heatmapChartRef.value) {
    const xData = new Array(HEAT_X).fill(''); 
    const yData = new Array(SPECTROGRAM_BINS).fill(0).map((_, i) => i);
    const data = [];
    for (let i = 0; i < HEAT_X; i++) {
        for (let j = 0; j < SPECTROGRAM_BINS; j++) {
            data.push([i, j, 0]);
        }
    }
    heatmapChart = echarts.init(heatmapChartRef.value);
    heatmapChart.setOption({
      animation: false,
      grid: { top: 0, bottom: 0, left: 0, right: 30 },
      xAxis: { type: 'category', data: xData, show: false },
      yAxis: { type: 'category', data: yData, show: false },
      visualMap: { 
        min: 0, max: 80, calculable: false, show: true, right: 0, top: 'center', itemWidth: 8, itemHeight: 100,
        text: ['High', 'Low'], textStyle: { color: '#64748b', fontSize: 9 },
        inRange: { color: ['#000004', '#180f3d', '#440f76', '#721f81', '#9e2f7f', '#cd4071', '#f1605d', '#fd9668', '#fcfdbf'] } 
      }, 
      series: [{ type: 'heatmap', data: data, itemStyle: { borderWidth: 0 }, silent: true, progressive: 0 }]
    });
  }

  // 4. 1/3 倍频程谱
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value);
    barChart.setOption({
      animation: false,
      grid: { top: 10, bottom: 25, left: 35, right: 10 }, 
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: '#334155', textStyle: { color: '#cbd5e1' } },
      xAxis: { 
        type: 'category', 
        data: categories, 
        axisLabel: { fontSize: 9, color: '#64748b', interval: 0, rotate: 0, margin: 8 },
        axisTick: { alignWithLabel: true, lineStyle: { color: '#334155' } },
        axisLine: { lineStyle: { color: '#334155' } }
      },
      yAxis: { 
        type: 'value', min: -10, max: 90, interval: 20,
        splitLine: { show: true, lineStyle: { color: '#334155', type: 'dashed', opacity: 0.3 } }, 
        axisLabel: { color: '#64748b', fontSize: 9 } 
      },
      series: [{
        type: 'bar',
        data: new Array(categories.length).fill(0), 
        itemStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#6366f1' },
                { offset: 1, color: '#3b82f6' }
            ]),
            borderRadius: [2, 2, 0, 0]
        },
        barWidth: '60%'
      }]
    });
  }
};

// ================= 动画与数据生成 =================
let animationFrameId: number;
let waveBuffer: number[] = new Array(200).fill(0);
let heatMatrix: number[][] = []; 
for(let t=0; t<HEAT_X; t++) heatMatrix[t] = new Array(SPECTROGRAM_BINS).fill(0);

let phase = 0;

const loop = () => {
  // 如果组件已卸载，直接停止
  if (!waveChart) return; 

  if (!controls.playing) {
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
    animationFrameId = requestAnimationFrame(loop);
    return;
  }

  phase += 0.2;
  const isMuted = controls.muted;

  // 1. 生成数据 (省略部分计算细节，保持原样)
  const freqData = categories.map((_, i) => {
    if (isMuted) return 0;
    let base = 70 - i * 1.5; 
    let fluctuation = Math.sin(phase * 0.5 + i * 0.8) * 5 + (Math.random() - 0.5) * 8;
    if (i >= 16 && i <= 18) fluctuation += 15 * (Math.sin(phase) + 1);
    return Math.max(0, Math.min(100, base + fluctuation));
  });

  const currentMelColumn = new Array(SPECTROGRAM_BINS).fill(0).map((_, yIndex) => {
    if (isMuted) return 0;
    let val = Math.random() * 10;
    const lines = [20, 35, 60];
    lines.forEach(lineY => {
       const dist = Math.abs(yIndex - lineY);
       if (dist < 3) val += (50 - dist * 10) * (0.6 + 0.4 * Math.sin(phase * 0.2));
    });
    if (Math.random() > 0.99) val += 30;
    return Math.min(80, val);
  });

  heatMatrix.shift(); 
  heatMatrix.push(currentMelColumn);
  
  const flatHeatData = [];
  for (let x = 0; x < HEAT_X; x++) {
    for (let y = 0; y < SPECTROGRAM_BINS; y++) {
      flatHeatData.push([x, y, heatMatrix[x][y]]);
    }
  }

  waveBuffer.shift();
  if (isMuted) {
    waveBuffer.push(0);
  } else {
    let raw = Math.sin(phase) * 1.5 + Math.sin(phase * 3.5) * 0.5 + (Math.random() - 0.5) * 0.4;
    waveBuffer.push((raw * controls.amplitude) + controls.offset);
  }

  // 4. 更新图表 (关键修复：先判断 !== null)
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
  
  if (waveChart) waveChart.setOption({ series: [{ data: waveBuffer }] });
  if (barChart) barChart.setOption({ series: [{ data: freqData }] });
  if (heatmapChart) heatmapChart.setOption({ series: [{ data: flatHeatData }] });
  
  if (gaugeChart) {
    const energy = isMuted ? 0 : 50 + Math.sin(phase * 0.5) * 10 + (Math.random() - 0.5) * 5;
    gaugeChart.setOption({
      series: [
        { data: [{ value: (energy * 0.8).toFixed(1), name: 'A计权' }] },
        { data: [{ value: energy.toFixed(1), name: 'C计权' }] },
        { data: [{ value: (energy * 1.1).toFixed(1), name: 'Z计权' }] }
      ]
    });
  }

  animationFrameId = requestAnimationFrame(loop);
};

// ================= 生命周期 =================
let resizeObserver: ResizeObserver | null = null;

// 窗口 resize 监听器提取出来，方便移除
const handleWindowResize = () => {
    if (waveChart) waveChart.resize();
    if (gaugeChart) gaugeChart.resize();
    if (heatmapChart) heatmapChart.resize();
    if (barChart) barChart.resize();
};

onMounted(() => {
  setTimeout(() => {
    initCharts();
    loop(); 
    
    // 初始化 ResizeObserver
    resizeObserver = new ResizeObserver(() => {
        // 使用 requestAnimationFrame 避免 loop loop error，但必须加上空值检查
        requestAnimationFrame(() => {
            if (waveChart) waveChart.resize();
            if (gaugeChart) gaugeChart.resize();
            if (heatmapChart) heatmapChart.resize();
            if (barChart) barChart.resize();
        });
    });
    
    const container = document.querySelector('.glass-card'); 
    if (container && resizeObserver) resizeObserver.observe(container);
  }, 100);
  
  window.addEventListener('resize', handleWindowResize);
});

onUnmounted(() => {
  // 1. 停止动画循环
  cancelAnimationFrame(animationFrameId);
  
  // 2. 移除原生事件监听
  window.removeEventListener('resize', handleWindowResize);
  
  // 3. 断开 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 4. 【关键】销毁图表实例 并 将变量置为 null
  // 这样异步的回调检测到 null 就不会去执行 .resize() 了
  if (waveChart) { waveChart.dispose(); waveChart = null; }
  if (gaugeChart) { gaugeChart.dispose(); gaugeChart = null; }
  if (heatmapChart) { heatmapChart.dispose(); heatmapChart = null; }
  if (barChart) { barChart.dispose(); barChart = null; }
});
</script>


<style scoped>
:deep(.glass-card) {
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
:deep(.el-slider__runway) {
  background-color: #334155;
  height: 4px;
}
:deep(.el-slider__bar) {
  background-color: #22d3ee;
  height: 4px;
}
:deep(.el-slider__button) {
  border-color: #22d3ee;
  background-color: #0f172a;
  width: 10px;
  height: 10px;
}
:deep(.el-button:hover) {
  background-color: rgba(255,255,255,0.05);
}
::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
