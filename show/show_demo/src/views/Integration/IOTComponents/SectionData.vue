<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "SectionData",
  props: {
    title: {
      type: String,
      required: true,
    },
    temperature1: {
      type: Number,
      required: true,
    },
    temperature2: {
      type: Number,
      required: true,
    },
    pressure1: {
      type: Number,
      required: true,
    },
    pressure2: {
      type: Number,
      required: true,
    },
    differentialPressure1: {
      type: Number,
      required: true,
    },
    differentialPressure2: {
      type: Number,
      required: true,
    },
    cumulativeFlow1: {
      type: Number,
      required: true,
    },
    cumulativeFlow2: {
      type: Number,
      required: true,
    },
    instantaneousFlow1: {
      type: Number,
      required: true,
    },
    instantaneousFlow2: {
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
})
</script>

<template>
  <div class="section-data-box" :style="position">
    <h3 class="section-title">{{ title }}</h3>
    <table class="section-table">
      <thead>
      <tr>
        <th class="pipe-header" colspan="3">一号管</th>
        <th class="pipe-header" colspan="3">二号管</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td class="section-label">温度：</td>
        <td class="section-value">{{ temperature1 }}</td>
        <td class="section-unit">°C</td>
        <td class="section-label">温度：</td>
        <td class="section-value">{{ temperature2 }}</td>
        <td class="section-unit">°C</td>
      </tr>
      <tr>
        <td class="section-label">压力：</td>
        <td class="section-value">{{ pressure1 }}</td>
        <td class="section-unit">kPa</td>
        <td class="section-label">压力：</td>
        <td class="section-value">{{ pressure2 }}</td>
        <td class="section-unit">kPa</td>
      </tr>
      <tr>
        <td class="section-label">差压：</td>
        <td class="section-value">{{ differentialPressure1 }}</td>
        <td class="section-unit">kPa</td>
        <td class="section-label">差压：</td>
        <td class="section-value">{{ differentialPressure2 }}</td>
        <td class="section-unit">kPa</td>
      </tr>
      <tr>
        <td class="section-label">累计流量：</td>
        <td class="section-value">{{ cumulativeFlow1 }}</td>
        <td class="section-unit">t/h</td>
        <td class="section-label">累计流量：</td>
        <td class="section-value">{{ cumulativeFlow2 }}</td>
        <td class="section-unit">t/h</td>
      </tr>
      <tr>
        <td class="section-label">瞬时流量：</td>
        <td class="section-value">{{ instantaneousFlow1 }}</td>
        <td class="section-unit">t/h</td>
        <td class="section-label">瞬时流量：</td>
        <td class="section-value">{{ instantaneousFlow2 }}</td>
        <td class="section-unit">t/h</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.section-data-box {
  position: absolute;
  width: 26%;
  height: 25%;
  background-color: rgba(36, 106, 54, 0.6); /* 半透明绿色背景 */
  padding: 0.6rem;
  border-radius: 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */
  border: 1px solid #ffffff; /* 边框颜色为白色 */
  color: #ffffff; /* 字体颜色为白色 */
  z-index: 10; /* 确保数据框显示在背景地图上方 */
}

.section-title {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 5px;
  text-align: center;
}

.section-table {
  width: 100%;
  border-collapse: collapse; /* 去除表格内部的空隙 */
}

.section-table th {
  text-align: center;
  padding: 5px;
  font-size: 0.6rem;
  color: #ffffff;
  font-weight: bold;
}

.pipe-header {
  text-align: center;
  padding: 2px 0;
}

.section-table td {
  padding: 0.2rem 0 0.2rem 0.2rem;
  vertical-align: middle; /* 确保数据垂直居中 */
  font-size: 0.6rem;
  width: 18%;
  font-weight: 500;
}

.section-label {
  text-align: left; /* 使标签靠近数据值 */
  color: #ffffff; /* 标签字体颜色为白色 */
  font-weight: bold;
  padding-right: 0px;
}

.section-value {
  text-align: left; /* 数值左对齐 */
  color: #67f4fe; /* 数值字体颜色为绿色 */
  padding-right: 2px;
}

.section-unit {
  text-align: left; /* 单位左对齐 */
  color: #ffffff; /* 单位字体颜色为白色 */
}
</style>