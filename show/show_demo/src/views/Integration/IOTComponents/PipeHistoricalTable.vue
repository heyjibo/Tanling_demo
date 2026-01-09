<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "PipeHistoricalTable",
  data() {
    return {
      dateRange: [], // 存储用户选择的日期范围
      tableData: [] // 存储表格数据
    };
  },
  mounted() {
    this.setDefaultDateRange(); // 设置默认时间范围
    this.fetchData(); // 初次加载时获取数据
  },
  methods: {
    setDefaultDateRange() {
      const endTime = new Date(); // 当前时间
      const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 一小时前
      this.dateRange = [startTime, endTime]; // 设置默认时间范围
    },
    async fetchData() {
      const startTime = this.formatDate(this.dateRange[0]); // 格式化开始时间
      const endTime = this.formatDate(this.dateRange[1]); // 格式化结束时间
      const response = await fetch(`http://218.92.43.42:7072/lsgn/api/get/thermPoint/history?startTime=${startTime}&endTime=${endTime}`);
      const result = await response.json();
      console.log(result);

      if (result.code === 0) {
        this.processData(result.data);
      }
    },
    onDateChange(value) {
      console.log('选择的日期范围:', value);
      this.fetchData(); // 在选择日期后重新获取数据
    },
    processData(data) {
      const tempData = {};

      // 初始化数据结构
      data.forEach(item => {
        item.historyData.forEach(entry => { // 遍历 historyData 数组
          const date = entry.date; // 获取每条历史数据的日期

          if (!tempData[date]) {
            tempData[date] = {
              time: date,
              location1Temperature: null,
              location1Pressure: null,
              location1DiffPressure: null,
              location2Temperature: null,
              location2Pressure: null,
              location2DiffPressure: null,
              location3Temperature: null,
              location3Pressure: null,
              location3DiffPressure: null,
              location4Temperature: null,
              location4Pressure: null,
              location4DiffPressure: null,
              location5Temperature: null,
              location5Pressure: null,
              location5DiffPressure: null,
              location6Temperature: null,
              location6Pressure: null,
              location6DiffPressure: null,
            };
          }

          // 根据 location 填充温度、压力和压差数据
          switch (item.remark) {
            case "01跨南中心河2号管测点":
              tempData[date].location1Temperature = entry.temperature;
              tempData[date].location1Pressure = entry.pressure;
              tempData[date].location1DiffPressure = entry.diffPressure;
              break;
            case "001核电流量计2号管测点":
              tempData[date].location2Temperature = entry.temperature;
              tempData[date].location2Pressure = entry.pressure;
              tempData[date].location2DiffPressure = entry.diffPressure;
              break;
            case "核电内-2-副":
              tempData[date].location3Temperature = entry.temperature;
              tempData[date].location3Pressure = entry.pressure;
              tempData[date].location3DiffPressure = entry.diffPressure;
              break;
            case "21西港河北(G-G010)2号管流量（未核对）":
              tempData[date].location4Temperature = entry.temperature;
              tempData[date].location4Pressure = entry.pressure;
              tempData[date].location4DiffPressure = entry.diffPressure;
              break;
            case "03烧香河北(B-H034)2号管测点":
              tempData[date].location5Temperature = entry.temperature;
              tempData[date].location5Pressure = entry.pressure;
              tempData[date].location5DiffPressure = entry.diffPressure;
              break;
            case "04烧香河南(B-H034)2号管测点":
              tempData[date].location6Temperature = entry.temperature;
              tempData[date].location6Pressure = entry.pressure;
              tempData[date].location6DiffPressure = entry.diffPressure;
              break;
            default:
              break;
          }
        });
      });

      // 将 tempData 转换为数组格式
      this.tableData = Object.values(tempData);
    },
    formatDate(date) {
      const d = new Date(date); // 创建日期对象
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0'); // 月份从0开始
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 返回格式化后的字符串
    },
  }
})
</script>

<template>
  <div class="iot-map-container">

    <div class="content-container">
      <!-- 时间筛选器 -->
      <div class="date-picker-container">
        <div style="font-size: 1rem;font-weight: bold;padding-bottom: 1%;margin-left: 1%; color: #000000;">2代管历史数据时间筛选器</div>
        <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onDateChange"
            style="margin-left: 1%;"
        ></el-date-picker>
      </div>

      <!-- 表格展示 -->
      <el-table
          :data="tableData"
          style="width: 99%; margin-left:1%; overflow: auto; height: 100%"
          :header-cell-style="{ fontSize: '0.8rem', padding: '3px 0' }"
      >
        <el-table-column prop="time" label="时间" width="170"></el-table-column>

        <!-- 温度列 -->
        <el-table-column label="温度">
          <el-table-column prop="location1Temperature" label="01跨南中心河2号管测点"></el-table-column>
          <el-table-column prop="location2Temperature" label="001核电流量计2号管测点"></el-table-column>
          <el-table-column prop="location3Temperature" label="核电内-2-副"></el-table-column>
          <el-table-column prop="location4Temperature" label="21西港河北(G-G010)2号管流量（未核对）"></el-table-column>
          <el-table-column prop="location5Temperature" label="03烧香河北(B-H034)2号管测点"></el-table-column>
          <el-table-column prop="location6Temperature" label="04烧香河南(B-H034)2号管测点"></el-table-column>
        </el-table-column>

        <!-- 压力列 -->
        <el-table-column label="压力">
          <el-table-column prop="location1Pressure" label="01跨南中心河2号管测点"></el-table-column>
          <el-table-column prop="location2Pressure" label="001核电流量计2号管测点"></el-table-column>
          <el-table-column prop="location3Pressure" label="核电内-2-副"></el-table-column>
          <el-table-column prop="location4Pressure" label="21西港河北(G-G010)2号管流量（未核对）"></el-table-column>
          <el-table-column prop="location5Pressure" label="03烧香河北(B-H034)2号管测点"></el-table-column>
          <el-table-column prop="location6Pressure" label="04烧香河南(B-H034)2号管测点"></el-table-column>
        </el-table-column>

        <!-- 压差列 -->
        <el-table-column label="压差">
          <el-table-column prop="location1DiffPressure" label="01跨南中心河2号管测点"></el-table-column>
          <el-table-column prop="location2DiffPressure" label="001核电流量计2号管测点"></el-table-column>
          <el-table-column prop="location3DiffPressure" label="核电内-2-副"></el-table-column>
          <el-table-column prop="location4DiffPressure" label="21西港河北(G-G010)2号管流量（未核对）"></el-table-column>
          <el-table-column prop="location5DiffPressure" label="03烧香河北(B-H034)2号管测点"></el-table-column>
          <el-table-column prop="location6DiffPressure" label="04烧香河南(B-H034)2号管测点"></el-table-column>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>

.content-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* 确保容器占满整个父元素 */
  overflow: auto; /* 超出部分显示滚动条 */
}

.date-picker-container {
  margin: 10px;
}


</style>