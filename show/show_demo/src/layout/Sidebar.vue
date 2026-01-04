<template>
  <aside class="w-64 h-full bg-slate-900/80 border-r border-slate-700/50 flex flex-col backdrop-blur-sm z-30">
    <div class="h-16 flex items-center justify-center border-b border-slate-700/50">
      <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">ShowDemo</span>
    </div>
    <nav class="flex-1 p-4 space-y-2">
      <router-link to="/dashboard" class="nav-item">🏠 总览驾驶舱</router-link>
      <div class="text-xs text-slate-500 mt-4 mb-2 px-2">核心功能模块</div>
      <router-link to="/sound" class="nav-item">🔊 声 - 智能感知</router-link>
      <router-link to="/light" class="nav-item">💡 光 - 预警预测</router-link>
      <router-link to="/compute" class="nav-item">🧠 算 - 智慧大脑</router-link>
      <router-link to="/integration" class="nav-item">🔗 集成 - 基础底座</router-link>
    </nav>
  </aside>
</template>
<style scoped>
.nav-item { @apply block px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors; }
.router-link-active { @apply bg-cyan-900/30 text-cyan-400 border border-cyan-500/20; }
</style>