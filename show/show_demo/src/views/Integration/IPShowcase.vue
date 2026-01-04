<template>
  <GlassCard title="b) IP 知识产权展示">
    <div class="grid grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="h-32 bg-slate-800 rounded border border-slate-600 flex items-center justify-center text-xs text-slate-500">
        专利证书截图 {{i}}
      </div>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
</script>