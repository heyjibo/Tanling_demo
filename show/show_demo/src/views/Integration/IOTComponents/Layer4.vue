<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "Layer4",
  props: {
    title: {
      type: String,
      required: true,
    },
    tube1temperature1: {
      type: Object, // 修改为 Object 类型
      required: true,
    },
    tube2temperature1: {
      type: Object, // 修改为 Object 类型
      required: true,
    },
    tube1temperature2: {
      type: Object, // 修改为 Object 类型
      required: true,
    },
    tube2temperature2: {
      type: Object, // 修改为 Object 类型
      required: true,
    },
    tube1temperature3: {
      type: Object, // 修改为 Object 类型
      required: true,
    },
    tube2temperature3: {
      type: Object, // 修改为 Object 类型
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
  methods: {
    getTemperatureColor(state: number) {
      return state === 1 ? 'red' : '#ffa200'; // 根据状态返回颜色
    },
  },
})
</script>

<template>
  <div class="layer-data-box" :style="position">
    <h3 class="layer-title">{{ title }}</h3>
    <table class="layer-table">
      <thead>
      <tr>
        <th class="text1" colspan="3">并行管道1</th>
        <th class="text2" colspan="3">并行管道2</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td class="layer-label">温度1：</td>
        <td class="layer-value" :style="{ color: getTemperatureColor(tube1temperature1.state) }">
          {{ tube1temperature1.value }}
        </td>
        <td class="layer-unit">°C</td>
        <td class="layer-label">温度2：</td>
        <td class="layer-value" :style="{ color: getTemperatureColor(tube2temperature1.state) }">
          {{ tube2temperature1.value }}
        </td>
        <td class="layer-unit">°C</td>
      </tr>
      <tr>
        <td class="layer-label">温度1：</td>
        <td class="layer-value" :style="{ color: getTemperatureColor(tube1temperature2.state) }">
          {{ tube1temperature2.value }}
        </td>
        <td class="layer-unit">°C</td>
        <td class="layer-label">温度2：</td>
        <td class="layer-value" :style="{ color: getTemperatureColor(tube2temperature2.state) }">
          {{ tube2temperature2.value }}
        </td>
        <td class="layer-unit">°C</td>
      </tr>
      <tr>
        <td class="layer-label">温度3：</td>
        <td class="layer-value" :style="{ color: getTemperatureColor(tube1temperature3.state) }">
          {{ tube1temperature3.value }}
        </td>
        <td class="layer-unit">°C</td>
        <td class="layer-label">温度3：</td>
        <td class="layer-value" :style="{ color: getTemperatureColor(tube2temperature3.state) }">
          {{ tube2temperature3.value }}
        </td>
        <td class="layer-unit">°C</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.layer-data-box {
  position: absolute;
  width: 28%;
  height: 18%;
  background-color: rgba(25, 41, 79, 0.4);
  padding: 10px;
  border-radius: 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid #20407b;
  color: #ffffff;
  z-index: 10;
}

.layer-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 5px;
  text-align: center;
  color: #ffa200;
}

.layer-table {
  width: 100%;
  border-collapse: collapse; /* 去除表格内部的空隙 */
}

.layer-table th {
  text-align: center;
  padding: 5px;
  font-size: 12px;
  font-weight: bold;
}

.text1 {
  text-align: center;
  padding: 2px 0;
  font-size: 12px;
  color: #fef058;
  font-weight: 600;
}

.text2 {
  text-align: center;
  padding: 2px 0;
  font-size: 12px;
  color: #f36d50;
  font-weight: 600;
}

.layer-table td {
  padding: 5px 0px 5px 5px;
  vertical-align: middle; /* 确保数据垂直居中 */
  font-size: 12px;
  width: 18%;
  font-weight: 500;
  line-height: 255%;
}

.layer-label {
  text-align: left; /* 使标签靠近数据值 */
  color: #ffffff; /* 标签字体颜色为白色 */
  font-weight: bold;
  padding-right: 0px;
}

.layer-value {
  text-align: left; /* 数值左对齐 */
  color: #ffa200; /* 数值字体颜色为绿色 */
  padding-right: 2px;
}

.layer-unit {
  text-align: left; /* 单位左对齐 */
  color: #ffffff; /* 单位字体颜色为白色 */
}
</style>