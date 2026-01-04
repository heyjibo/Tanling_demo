<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <DeviceDiagnosis />
    <PLCOptimization />
  </div>
</template>
<script setup lang="ts">
import DeviceDiagnosis from './DeviceDiagnosis.vue';
import PLCOptimization from './PLCOptimization.vue';
</script>