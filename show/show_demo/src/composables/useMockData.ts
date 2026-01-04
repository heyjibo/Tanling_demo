import { ref, onUnmounted } from 'vue';

// 模拟实时数值波动
export function useRealtimeValue(initial: number, range: number = 5) {
  const value = ref(initial);
  const interval = setInterval(() => {
    const diff = (Math.random() - 0.5) * range;
    value.value = Number((value.value + diff).toFixed(2));
  }, 1500);
  onUnmounted(() => clearInterval(interval));
  return value;
}

// 模拟图表数组数据生成
export function useChartData(length: number = 10) {
  return Array.from({ length }, () => Math.floor(Math.random() * 100));
}