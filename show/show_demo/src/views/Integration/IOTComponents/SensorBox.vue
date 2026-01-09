<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "SensorBox",
  props: {
    title: {
      type: String,
      required: true,
    },
    windSpeed: {
      type: Number,
      required: true,
    },
    windForce: {
      type: Number,
      required: true,
    },
    windDirection: {
      type: Number,
      required: true,
    },
    airTemperature: {
      type: Number,
      required: true,
    },
    noise: {
      type: Number,
      required: true,
    },
    co2Concentration: {
      type: Number,
      required: true,
    },
    atmosphericPressure: {
      type: Number,
      required: true,
    },
    rainfall: {
      type: Number,
      required: true,
    },
    rainSnowState: {
      type: Number,
      required: true,
    },
    totalRadiation: {
      type: Number,
      required: true,
    },
    dailyRainfall: {
      type: Number,
      required: true,
    },
    currentRainfall: {
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
  <div class="sensor-box" :style="computedPosition">
    <h3 class="sensor-title">{{ title }}</h3>
    <div class="sensor-data">
      <div class="sensor-row">
        <div class="sensor-label">风速：</div>
        <div class="sensor-value">{{ windSpeed }}</div>
        <div class="sensor-unit">m/s</div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">风力：</div>
        <div class="sensor-value">{{ windForce }}</div>
        <div class="sensor-unit"></div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">风向：</div>
        <div class="sensor-value">{{ windDirection }}</div>
        <div class="sensor-unit"></div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">空气温度：</div>
        <div class="sensor-value">{{ airTemperature }}</div>
        <div class="sensor-unit">°C</div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">噪声：</div>
        <div class="sensor-value">{{ noise }}</div>
        <div class="sensor-unit">db</div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">CO2浓度：</div>
        <div class="sensor-value">{{ co2Concentration }}</div>
        <div class="sensor-unit">ppm</div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">大气压力：</div>
        <div class="sensor-value">{{ atmosphericPressure }}</div>
        <div class="sensor-unit">kPa</div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">瞬时雨量：</div>
        <div class="sensor-value">{{ rainfall }}</div>
        <div class="sensor-unit">ml</div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">雨雪状态：</div>
        <div class="sensor-value">{{ rainSnowState }}</div>
        <div class="sensor-unit"></div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">总辐射：</div>
        <div class="sensor-value">{{ totalRadiation }}</div>
        <div class="sensor-unit">usv</div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">日雨量：</div>
        <div class="sensor-value">{{ dailyRainfall }}</div>
        <div class="sensor-unit">ml</div>
      </div>
      <div class="sensor-row">
        <div class="sensor-label">当前雨量：</div>
        <div class="sensor-value">{{ currentRainfall }}</div>
        <div class="sensor-unit">ml</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sensor-box {
  position: absolute;
  width: 100%; /* 使用百分比宽度以便于适应不同大小 */
  max-width: 14%; /* 设置最大宽度以保证显示效果 */
  height: 100%;
  max-height: 36%;
  background-color: rgba(67, 114, 254, 0.6); /* 半透明蓝色背景，颜色为 #4372fe，透明度 0.8 */
  padding: 0.8rem;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */
  border: 1px solid #00bfff; /* 边框为淡蓝色 */
  color: #ffffff; /* 字体颜色为白色 */
  z-index: 10; /* 确保数据框显示在背景地图上 */
}

.sensor-title {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 0px;
  text-align: center;
}

.sensor-data {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.sensor-row {
  display: grid;
  grid-template-columns: 45% 35% 30%; /* 使用百分比确保不同列的相对宽度 */
  gap: 0.2rem;
  align-items: center; /* 垂直方向居中对齐 */
}

.sensor-label {
  font-size: 0.6rem;
  color: #ffffff;
}

.sensor-value {
  font-size: 0.6rem;
  color: #00ff00; /* 绿色数值颜色 */
}

.sensor-unit {
  font-size: 0.6rem;
  color: #ffffff; /* 单位字体颜色 */
}
</style>