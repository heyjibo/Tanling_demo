<template>
  <GlassCard title="a) 声纹监测系统">
    <template #action><el-tag size="small" effect="dark">监测中</el-tag></template>
    <div class="h-64 bg-slate-900/50 rounded flex items-center justify-center border border-slate-700 border-dashed">
      <p class="text-slate-500">[ECharts] 声纹波形实时跳动图</p>
    </div>
    <div class="mt-4 text-sm text-slate-300">
      <p>关联技术: 恩智浦(NXP) 边缘计算芯片</p>
      <p>当前精度: 99.2%</p>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>