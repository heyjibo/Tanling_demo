<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "DisplacementSensor",
  props: {
    title: {
      type: String,
      required: true,
    },
    displacement1: {
      type: Number,
      required: true,
    },
    displacement2: {
      type: Number,
      required: true,
    },
    position: {
      type: Object,
      default: () => ({
        top: '0%',
        left: '0%',
      }),
    },
  },
  computed: {
    formattedDisplacement1() {
      const displacementInMm = this.displacement1; // 转换为 mm
      return (displacementInMm >= 0 ? '+' : '') + displacementInMm.toFixed(2); // 保留三位小数
    },
    formattedDisplacement2() {
      const displacementInMm = this.displacement2 // 转换为 mm
      return (displacementInMm >= 0 ? '+' : '') + displacementInMm.toFixed(2); // 保留三位小数
    },
  },
})
</script>

<template>
  <div class="displacement-sensor" :style="position">
    <h3 class="sensor-title">{{ title }}</h3>
    <div class="sensor-data">
      <div class="sensor-row">
        <div class="sensor-label">位移1：</div>
        <div
            class="sensor-value"
            :style="{ color: displacement1 > 1000 ? 'red' : '#00ff00' }"
        >
          {{ formattedDisplacement1 }}
        </div>
        <div class="sensor-unit">mm</div> <!-- 修改为 mm -->
      </div>
      <div class="sensor-row">
        <div class="sensor-label">位移2：</div>
        <div
            class="sensor-value"
            :style="{ color: displacement2 > 1000 ? 'red' : '#00ff00' }"
        >
          {{ formattedDisplacement2 }}
        </div>
        <div class="sensor-unit">mm</div> <!-- 修改为 mm -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.displacement-sensor {
  position: absolute;
  width: 10%; /* 控制组件的宽度 */
  background-color: rgba(230, 157, 0, 0.6); /* 半透明橙色背景 */
  padding: 0.2rem;
  border-radius: 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */
  border: 1px solid #ffffff; /* 边框为白色 */
  color: #ffffff; /* 字体颜色为白色 */
  z-index: 10;
}

.sensor-title {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 5px;
  text-align: center;
}

.sensor-data {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sensor-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sensor-label {
  font-size: 0.6rem;
  margin-left: 0.2rem;
}

.sensor-value {
  font-size: 0.6rem;
  color: #00ff00; /* 绿色数值 */
}

.sensor-unit {
  font-size: 0.6rem;
  margin-right: 0.2rem;
}
</style>