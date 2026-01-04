<template>
  <div class="glass-card relative p-6 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-cyan-900/20 hover:shadow-xl">
    <div class="absolute inset-0 bg-slate-800/60 backdrop-blur-md z-0"></div>
    <div class="absolute inset-0 border border-glass-border rounded-xl z-10 pointer-events-none"></div>
    <div class="relative z-20 h-full">
      <div v-if="title" class="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <h3 class="text-lg font-bold text-cyan-400 tracking-wide">{{ title }}</h3>
        <slot name="action"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
<style scoped>
.glass-card { box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
</style>