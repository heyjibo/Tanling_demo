<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-white">全厂运行总览</h2>
    <div class="grid grid-cols-4 gap-6">
      <GlassCard title="系统健康度" class="h-40"><div class="text-4xl text-green-400 font-mono mt-4">98.5%</div></GlassCard>
      <GlassCard title="在线设备" class="h-40"><div class="text-4xl text-blue-400 font-mono mt-4">1,240</div></GlassCard>
      <GlassCard title="今日告警" class="h-40"><div class="text-4xl text-yellow-400 font-mono mt-4">3</div></GlassCard>
      <GlassCard title="节能估算" class="h-40"><div class="text-4xl text-cyan-400 font-mono mt-4">12%</div></GlassCard>
    </div>
  </div>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>