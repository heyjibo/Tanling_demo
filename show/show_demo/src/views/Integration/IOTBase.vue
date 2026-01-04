<template>
  <GlassCard title="a) 工业物联网底座 (连云港一期)">
    <el-table :data="tableData" style="width: 100%; background: transparent" class="transparent-table">
      <el-table-column prop="date" label="时间" width="180" />
      <el-table-column prop="name" label="采集点位" width="180" />
      <el-table-column prop="value" label="实时数值" />
    </el-table>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
const tableData = [
  { date: '10:42:01', name: '泵站A-流量', value: '420 m³/h' },
  { date: '10:42:02', name: '阀门B-开度', value: '85 %' },
];
</script>
<style>
.transparent-table, .transparent-table tr, .transparent-table th, .transparent-table td {
  background-color: transparent !important;
  color: #ccc !important;
  border-bottom: 1px solid #333 !important;
}
</style>