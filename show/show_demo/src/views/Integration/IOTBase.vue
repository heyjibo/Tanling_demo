<template>
  <GlassCard title="a) 工业物联网底座 (连云港一期)">
    <div class="iot-main-page">
      <!-- 侧边栏 -->
      <div class="iot-sidebar">
        <button class="iot-sidebar-btn" @click="GoToHome()">主界面</button>
        <button class="iot-sidebar-btn" @click="GoToPointOne()">一代管道检测点位1</button>
        <button class="iot-sidebar-btn" @click="GoToPointTwo()">一代管道检测点位2</button>
        <button class="iot-sidebar-btn" @click="GoToPointThree()">一代管道检测点位3</button>
        <button class="iot-sidebar-btn" @click="GoToPointFour()">二代管道检测点位1</button>
        <button class="iot-sidebar-btn" @click="GoToPointTemperatureTrends()">管道温度历史趋势</button>
        <button class="iot-sidebar-btn" @click="GoToLayerTemperatureHistoricalTrends()">保温层历史温度数据表</button>
        <button class="iot-sidebar-btn" @click="GoToPointHistoricalTable()">点位历史数据表</button>
      </div>
      <Mainpage v-if="pageNum === 0"/>
      <SectionOne v-else-if="pageNum === 1"/>
      <SectionTwo v-else-if="pageNum === 2"/>
      <SectionThree v-else-if="pageNum === 3"/>
      <SectionFour v-else-if="pageNum === 4"/>
      <PipeTemperatureHistoricalTrends v-else-if="pageNum === 5"/>
      <LayerTemperatureHistoricalTrends v-else-if="pageNum === 6"/>
      <PipeHistoricalTable v-else-if="pageNum === 7"/>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
import {ref} from "vue";
import Mainpage from "@/views/Integration/IOTComponents/Mainpage.vue";
import SectionTwo from "@/views/Integration/IOTComponents/SectionTwo.vue";
import SectionThree from "@/views/Integration/IOTComponents/SectionThree.vue";
import SectionFour from "@/views/Integration/IOTComponents/SectionFour.vue";
import PipeTemperatureHistoricalTrends from "@/views/Integration/IOTComponents/PipeTemperatureHistoricalTrends.vue";
import LayerTemperatureHistoricalTrends from "@/views/Integration/IOTComponents/LayerTemperatureHistoricalTrends.vue";
import PipeHistoricalTable from "@/views/Integration/IOTComponents/PipeHistoricalTable.vue";
import SectionOne from "@/views/Integration/IOTComponents/SectionOne.vue";

const pageNum = ref(0);

const GoToHome = () => {
  pageNum.value = 0;
}
const GoToPointOne = () => {
  pageNum.value = 1;
}
const GoToPointTwo = () => {
  pageNum.value = 2;
}
const GoToPointThree = () => {
  pageNum.value = 3;
}
const GoToPointFour = () => {
  pageNum.value = 4;
}
const GoToPointTemperatureTrends = () => {
  pageNum.value = 5;
}
const GoToLayerTemperatureHistoricalTrends = () => {
  pageNum.value = 6;
}
const GoToPointHistoricalTable = () => {
  pageNum.value = 7;
}
</script>
<style>
.transparent-table, .transparent-table tr, .transparent-table th, .transparent-table td {
  background-color: transparent !important;
  color: #ccc !important;
  border-bottom: 1px solid #333 !important;
}
</style>