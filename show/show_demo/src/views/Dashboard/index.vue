<template>
  <div class="space-y-6 p-4 bg-slate-900 min-h-screen">
    <!-- 标题 -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
      <h2 class="text-2xl md:text-3xl font-bold text-white tracking-tight">全厂运行总览</h2>
      <span class="text-xs text-gray-400 mt-1 md:mt-0 bg-slate-800/50 px-2 py-1 rounded">声 · 光 · 算 一体化运行态势</span>
    </div>

    <!-- 一、系统核心：声 / 光 / 算 - 调整高度并优化内部间距 -->
   
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 声 · 智能感知能力 -->
      <GlassCard title="声 · 智能感知能力" class="h-40 bg-slate-800/60 border border-red-900/30 shadow-lg shadow-red-900/10">
        <div class="flex flex-col h-full justify-start items-center p-2 pt-1">
          <div class="flex flex-row justify-between items-center w-full mb-2">
            <div class="text-4xl text-red-400 font-mono font-semibold">96.8%</div>
            <div class="text-xs text-gray-400 bg-slate-700/50 px-2 py-1 rounded">
              覆盖率 ｜ 今日事件 128
            </div>
          </div>
          <div class="w-full">            
            <!-- 进度条 -->
            <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style="width: 96.8%"></div>
            </div>
          </div>
        </div>
      </GlassCard>

      <!-- 光 · 光纤传输能力 -->
      <GlassCard title="光 · 光纤传输能力" class="h-40 bg-slate-800/60 border border-yellow-900/30 shadow-lg shadow-yellow-900/10">
        <div class="flex flex-col h-full justify-start items-center p-2 pt-1">
          <div class="flex flex-row justify-between items-center w-full mb-2">
            <div class="text-4xl text-yellow-400 font-mono font-semibold">99.3%</div>
            <div class="text-xs text-gray-400 bg-slate-700/50 px-2 py-1 rounded">
              链路健康 ｜ 实时在线
            </div>
          </div>
          <div class="w-full">
            <!-- 进度条 -->
            <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full" style="width: 99.3%"></div>
            </div>
          </div>
        </div>
      </GlassCard>

      <!-- 算 · 智能分析能力 -->
      <GlassCard title="算 · 智能分析能力" class="h-40 bg-slate-800/60 border border-blue-900/30 shadow-lg shadow-blue-900/10">
        <div class="flex flex-col h-full justify-start items-center p-2 pt-1">
          <div class="flex flex-row justify-between items-center w-full mb-2">
            <div class="text-4xl text-blue-400 font-mono font-semibold">72%</div>
            <div class="text-xs text-gray-400 bg-slate-700/50 px-2 py-1 rounded">
              算力负载 ｜ 实时推演
            </div>
          </div>
          <div class="w-full">
            <!-- 进度条 -->
            <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style="width: 72%"></div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- 二、全局KPI -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <GlassCard title="系统健康度" class="h-36 bg-slate-800/60 border border-green-900/30">
        <div class="flex flex-col items-center justify-center h-full">
          <div class="text-5xl text-green-400 font-mono font-bold">98.5%</div>
          <div class="text-xs text-gray-400 mt-2">综合评估</div>
        </div>
      </GlassCard>
      <GlassCard title="在线设备" class="h-36 bg-slate-800/60 border border-blue-900/30">
        <div class="flex flex-col items-center justify-center h-full">
          <div class="text-5xl text-blue-400 font-mono font-bold">1,240</div>
          <div class="text-xs text-gray-400 mt-2">台/套</div>
        </div>
      </GlassCard>
      <GlassCard title="今日告警" class="h-36 bg-slate-800/60 border border-yellow-900/30">
        <div class="flex flex-col items-center justify-center h-full">
          <div class="text-5xl text-yellow-400 font-mono font-bold">3</div>
          <div class="text-xs text-gray-400 mt-2">未处理 0</div>
        </div>
      </GlassCard>
      <GlassCard title="节能估算" class="h-36 bg-slate-800/60 border border-red-900/30">
        <div class="flex flex-col items-center justify-center h-full">
          <div class="text-5xl text-red-400 font-mono font-bold">12%</div>
          <div class="text-xs text-gray-400 mt-2">环比昨日</div>
        </div>
      </GlassCard>
    </div>

    <!-- 三、声光算融合分析 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 调高卡片高度从 h-72 改为 h-96 (24rem/384px) -->
      <GlassCard title="声光算融合分析趋势" class="col-span-2 h-96 bg-slate-800/60">
        <div ref="fusionChartRef" class="w-full h-full p-2"></div>
      </GlassCard>

      <!-- 调高卡片高度从 h-72 改为 h-96 (24rem/384px) -->
      <GlassCard title="告警与事件态势" class="h-96 bg-slate-800/60">
        <div class="h-full flex flex-col p-2">
          <ul class="space-y-5 text-sm text-gray-300 mt-4 flex-grow">
            <li class="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <div class="flex items-center">
                <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span>声异常</span>
              </div>
              <span class="text-red-400 font-medium">2 起</span>
            </li>
            <li class="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <div class="flex items-center">
                <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span>光纤异常</span>
              </div>
              <span class="text-yellow-400 font-medium">0 起</span>
            </li>
            <li class="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <div class="flex items-center">
                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span>算智能分析预警</span>
              </div>
              <span class="text-blue-400 font-medium">1 起</span>
            </li>
            <li class="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <div class="flex items-center">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>已处置</span>
              </div>
              <span class="text-green-400 font-medium">100%</span>
            </li>
          </ul>
          
          <!-- 总异常相关统计指标 -->
          <div class="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
            <!-- 总异常数（明细） -->
            <div class="flex justify-between items-center">
              <div class="flex items-center text-sm text-gray-400">
                <svg class="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>总异常数</span>
              </div>
              <span class="text-xl font-bold text-white">3 <span class="text-xs text-gray-400 font-normal">起</span></span>
            </div>
            
            <!-- 新增：总异常（按等级统计） -->
            <div class="flex justify-between items-center">
              <div class="flex items-center text-sm text-gray-400">
                <svg class="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>总异常（等级分布）</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-yellow-400">一般: 2</span>
                <span class="text-sm text-orange-400">重要: 1</span>
                <span class="text-sm text-gray-500">紧急: 0</span>
              </div>
            </div>
          </div>
        </div>       
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import GlassCard from '@/components/Common/GlassCard.vue'

const fusionChartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  if (!fusionChartRef.value) return

  // 初始化图表
  chartInstance = echarts.init(fusionChartRef.value)
  
  // 定义红黄蓝三色配置（声-红、光-黄、算-蓝）
  const COLORS = {
    sound: '#ef4444',     // 声-感知 - 红色
    light: '#eab308',     // 光-传输 - 黄色
    compute: '#3b82f6'    // 算-分析 - 蓝色
  }
  
  // 自定义渐变函数
  const getGradient = (color: string) => {
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: color + '80' }, // 50% 透明度
      { offset: 1, color: color + '00' }  // 0% 透明度
    ])
  }

  const chartOption = {
    backgroundColor: 'transparent',
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 40
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      padding: 10,
      borderRadius: 6,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    },
    legend: {
      top: 0,
      data: [
        { name: '声-感知', icon: 'circle' },
        { name: '光-传输', icon: 'circle' },
        { name: '算-分析', icon: 'circle' }
      ],
      itemGap: 20,
      // 自定义图例颜色，确保与折线颜色完全一致
      textStyle: {
        color: '#cbd5e1',
        fontSize: 12,
        rich: {
          sound: { color: COLORS.sound },
          light: { color: COLORS.light },
          compute: { color: COLORS.compute }
        }
      },
      formatter: function(name: string) {
        if (name === '声-感知') return '{sound|' + name + '}';
        if (name === '光-传输') return '{light|' + name + '}';
        if (name === '算-分析') return '{compute|' + name + '}';
        return name;
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { show: false },
      data: ['00', '04', '08', '12', '16', '20', '24']
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: {
        lineStyle: { color: 'rgba(148,163,184,0.1)' }
      },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      min: 0,
      max: 100
    },
    series: [
      {
        name: '声-感知',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: [32, 48, 61, 55, 72, 68, 74],
        lineStyle: { width: 3, color: COLORS.sound },
        itemStyle: { color: COLORS.sound }, // 确保数据点颜色一致
        areaStyle: { 
          opacity: 0.2,
          color: getGradient(COLORS.sound)
        },
        emphasis: {
          lineStyle: { width: 4, color: COLORS.sound }
        }
      },
      {
        name: '光-传输',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: [45, 52, 58, 62, 66, 70, 73],
        lineStyle: { width: 3, color: COLORS.light },
        itemStyle: { color: COLORS.light }, // 确保数据点颜色一致
        areaStyle: { 
          opacity: 0.2,
          color: getGradient(COLORS.light)
        },
        emphasis: {
          lineStyle: { width: 4, color: COLORS.light }
        }
      },
      {
        name: '算-分析',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: [28, 36, 49, 57, 63, 69, 72],
        lineStyle: { width: 3, color: COLORS.compute },
        itemStyle: { color: COLORS.compute }, // 确保数据点颜色一致
        areaStyle: { 
          opacity: 0.2,
          color: getGradient(COLORS.compute)
        },
        emphasis: {
          lineStyle: { width: 4, color: COLORS.compute }
        }
      }
    ]
  }

  chartInstance.setOption(chartOption)

  // 响应式调整
  const resizeHandler = () => {
    chartInstance?.resize()
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    chartInstance?.dispose()
  })
})
</script>

<style scoped>
/* 自定义动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>