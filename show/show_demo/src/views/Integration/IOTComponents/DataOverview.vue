<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "DataOverview",
  props: {
    title: {
      type: String,
      required: true,
    },
    outdoorTemperature: {
      type: Number,
      required: true,
    },
    actualMeasuredHeatLoss: {
      type: Number,
      required: true,
    },
    heatLoss: {
      type: Number,
      required: true,
    },
    measuredUnitHeatLoss: {
      type: Number,
      required: true,
    },
    unitHeatLoss: {
      type: Number,
      required: true,
    },
    position: {
      type: Object,
      default: () => ({
        top: '0px',
        left: '0px',
      }),
    },
  },
  computed: {
    computedPosition() {
      return {
        ...this.position,
        position: 'absolute',
      };
    },
  },
})
</script>

<template>
  <div class="layer-box" :style="computedPosition">
    <h3 class="layer-title">{{ title }}</h3>
    <div class="layer-data">
      <div class="layer-row">
        <div class="layer-label">实测热损失量：</div>
        <div class="layer-value">{{ actualMeasuredHeatLoss }}</div>
        <div class="layer-unit">W</div>

        <div class="layer-label">实测单位热损失量：</div>
        <div class="layer-value">{{ measuredUnitHeatLoss }}</div>
        <div class="layer-unit">W/m</div>

        <div class="layer-label">室外温度（Ta）：</div>
        <div class="layer-value">{{ outdoorTemperature }}</div>
        <div class="layer-unit">°C</div>
      </div>
      <div class="layer-row">
        <div class="layer-label">热损失量：</div>
        <div class="layer-value">{{ heatLoss }}</div>
        <div class="layer-unit">W</div>

        <div class="layer-label">单位热损失量：</div>
        <div class="layer-value">{{ unitHeatLoss }}</div>
        <div class="layer-unit">W/m</div>

        <div class="layer-label"></div>
        <div class="layer-value"></div>
        <div class="layer-unit"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layer-box {
  position: absolute;
  width: 100%; /* 使用百分比宽度以便于适应不同大小 */
  max-width: 70%; /* 设置最大宽度以保证显示效果 */
  height: 20%; /* 自适应高度 */
  background-color: rgba(255, 255, 255, 1); /* 半透明蓝色背景 */
  padding: 1%;
  border-radius: 0.6rem;
  box-shadow: 0 0.3rem 0.6rem 0.9rem rgba(210, 210, 210, 0.3); /* 添加阴影效果 */
  border: 2px solid #ffffff; /* 边框为淡蓝色 */
  color: #000000; /* 字体颜色为白色 */
  z-index: 10; /* 确保数据框显示在背景地图上 */
}

.layer-title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 1%;
  //margin-top: 0.2%;
  color: #005183;
}

.layer-data {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.layer-row {
  display: flex; /* 使用 flexbox 布局 */
  justify-content: space-between; /* 在行内分配空间 */
  align-items: center; /* 垂直方向居中对齐 */
  margin-top: 0.8rem;
}

.layer-label {
  font-size: 0.9rem;
  color: #000000;
  flex: 1; /* 每列均分空间 */
  min-width: 10rem;
}

.layer-value {
  font-size: 0.9rem;
  color: #00378b; /* 数值颜色 */
  flex: 1; /* 每列均分空间 */
  padding-left: 1%;
  padding-right: 1%;
  margin-right: 1%;
}

.layer-unit {
  font-size: 0.9rem;
  color: #000000; /* 单位字体颜色 */
  flex: 1; /* 每列均分空间 */
}
</style>