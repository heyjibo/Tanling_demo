<template>
  <div ref="chartRef" class="w-full h-full min-h-[200px]"></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLElement>();
onMounted(() => {
  if(!chartRef.value) return;
  const myChart = echarts.init(chartRef.value);
  myChart.setOption({
    grid: { top: 10, bottom: 20, left: 30, right: 10 },
    xAxis: { type: 'category', data: ['0s','10s','20s','30s','40s','50s'] },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#333' } } },
    series: [{ data: [120, 200, 150, 80, 70, 110], type: 'line', smooth: true, itemStyle: { color: '#06b6d4' } }]
  });
});
</script>