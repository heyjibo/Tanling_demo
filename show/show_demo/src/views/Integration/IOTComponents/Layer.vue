<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "Layer",
  props: {
    title: {
      type: String,
      required: true,
    },
    tube1temperature1: {
      type: Object, // 这里改为对象以包含值和状态
      required: true,
    },
    tube1temperature2: {
      type: Object,
      required: true,
    },
    tube1temperature3: {
      type: Object,
      required: true,
    },
    tube2temperature1: {
      type: Object,
      required: true,
    },
    tube2temperature2: {
      type: Object,
      required: true,
    },
    tube2temperature3: {
      type: Object,
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
  methods: {
    getTemperatureColor(state: number) {
      return state === 1 ? 'red' : '#ffa200'; // 根据状态返回颜色
    },
  },
})
</script>

<template>
  <div class="layer-box" :style="computedPosition">
    <h3 class="layer-title">{{ title }}</h3>
    <div class="layer-data">
      <div class="text1">并行管道1</div>
      <div class="layer-row">
        <div class="layer-label">温度1：</div>
        <div class="layer-value" :style="{ color: getTemperatureColor(tube1temperature1.state) }">
          {{ tube1temperature1.value }}
        </div>
        <div class="layer-unit">°C</div>
      </div>
      <div class="layer-row">
        <div class="layer-label">温度2：</div>
        <div class="layer-value" :style="{ color: getTemperatureColor(tube1temperature2.state) }">
          {{ tube1temperature2.value }}
        </div>
        <div class="layer-unit">°C</div>
      </div>
      <div class="layer-row">
        <div class="layer-label">温度3：</div>
        <div class="layer-value" :style="{ color: getTemperatureColor(tube1temperature3.state) }">
          {{ tube1temperature3.value }}
        </div>
        <div class="layer-unit">°C</div>
      </div>
      <div class="text2">并行管道2</div>
      <div class="layer-row">
        <div class="layer-label">温度1：</div>
        <div class="layer-value" :style="{ color: getTemperatureColor(tube2temperature1.state) }">
          {{ tube2temperature1.value }}
        </div>
        <div class="layer-unit">°C</div>
      </div>
      <div class="layer-row">
        <div class="layer-label">温度2：</div>
        <div class="layer-value" :style="{ color: getTemperatureColor(tube2temperature2.state) }">
          {{ tube2temperature2.value }}
        </div>
        <div class="layer-unit">°C</div>
      </div>
      <div class="layer-row">
        <div class="layer-label">温度3：</div>
        <div class="layer-value" :style="{ color: getTemperatureColor(tube2temperature3.state) }">
          {{ tube2temperature3.value }}
        </div>
        <div class="layer-unit">°C</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layer-box {
  position: absolute;
  width: 100%; /* 使用百分比宽度以便于适应不同大小 */
  max-width: 11%; /* 设置最大宽度以保证显示效果 */
  height: 100%;
  max-height: 25%;
  background-color: rgba(25, 41, 79, 0.4); /* 半透明蓝色背景，颜色为 #4372fe，透明度 0.8 */
  padding: 15px;
  border-radius: 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */
  border: 2px solid #20407b; /* 边框为淡蓝色 */
  color: #ffffff; /* 字体颜色为白色 */
  z-index: 10; /* 确保数据框显示在背景地图上 */
}

.layer-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
  margin-top: 2px;
  text-align: center;
  color: #ffa200;
}

.layer-data {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.layer-row {
  display: grid;
  grid-template-columns: 45% 35% 30%; /* 使用百分比确保不同列的相对宽度 */
  gap: 6px;
  align-items: center; /* 垂直方向居中对齐 */
  line-height: 180%;
}

.layer-label {
  font-size: 12px;
  color: #ffffff;
}

.layer-value {
  font-size: 12px;
  color: #ffa200; /* 绿色数值颜色 */
}

.layer-unit {
  font-size: 12px;
  color: #ffffff; /* 单位字体颜色 */
}

.text1 {
  font-size: 13px;
  color: #fef058;
  font-weight: 600;
}

.text2 {
  font-size: 13px;
  color: #f36d50;
  font-weight: 600;
}
</style>