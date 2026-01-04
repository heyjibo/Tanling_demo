<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
    <VoicePrint />
    <Ultrasonic />
  </div>
</template>
<script setup lang="ts">
import VoicePrint from './VoicePrint.vue';
import Ultrasonic from './Ultrasonic.vue';
</script>