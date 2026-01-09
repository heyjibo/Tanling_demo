<script>
import {defineComponent} from 'vue'
import * as echarts from 'echarts';

export default defineComponent({
  name: "PipeTemperatureHistoricalTrends",
  data() {
    return {
      myChart: null,
      dateRange: [], // 存储用户选择的日期范围
    };
  },
  mounted() {
    this.setDefaultDateRange(); // 设置默认时间范围
    this.initChart();
  },
  methods: {
    setDefaultDateRange() {
      const endTime = new Date(); // 当前时间
      const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 一小时前

      // 格式化时间为合适的字符串格式
      this.dateRange = [startTime, endTime];
      this.updateChart(this.dateRange); // 获取数据并更新图表
    },
    onDateChange(value) {
      console.log('选择的日期范围:', value);
      // 根据日期范围获取新数据并更新图表
      this.updateChart(value);
    },
    initChart() {
      const chartDom = this.$refs.chart;
      this.myChart = echarts.init(chartDom);

      const option = {
        title: {
          text: '管道内部介质数据',
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: [], // 在这里动态设置图例
          bottom: 0, // 将图例放在底部
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%', // 确保图例不会与图表重叠
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 示例数据，可以根据时间筛选器动态更新
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '管道温度', // 这里可以设置图例名称
            type: 'line',
            data: [120, 132, 101, 134, 90, 230, 210], // 示例数据，需根据时间筛选器更新
          },
        ],
      };

      this.myChart.setOption(option);

      // 监听窗口大小变化
      window.addEventListener('resize', () => this.myChart.resize());
    },
    async updateChart(dateRange) {
      const startTime = this.formatDate(dateRange[0]); // 格式化开始时间
      const endTime = this.formatDate(dateRange[1]); // 格式化结束时间

      try {
        console.log(`http://218.92.43.42:7072/lsgn/api/get/thermPoint/history?startTime=${startTime}&endTime=${endTime}`);
        const response = await fetch(`http://218.92.43.42:7072/lsgn/api/get/thermPoint/history?startTime=${startTime}&endTime=${endTime}`);
        const result = await response.json();

        if (result.code === 0) {
          // 提取温度数据
          const targetLocations = [
            "01跨南中心河2号管测点",
            "03烧香河北(B-H034)2号管测点",
            "04烧香河南(B-H034)2号管测点",
            "21西港河北(G-G010)2号管流量（未核对）"
          ];

          const temperatures = targetLocations.map(location => {
            return {
              location,
              dates: [],
              temperatures: []
            };
          });

          // 处理历史数据
          result.data.forEach(deviceData => {
            if (targetLocations.includes(deviceData.remark)) {
              deviceData.historyData.forEach(entry => {
                const index = targetLocations.indexOf(deviceData.remark);
                if (index !== -1) {
                  temperatures[index].dates.push(entry.date);
                  // 检查温度值是否为 0，并用前一个有效值替代
                  const lastTemperature = temperatures[index].temperatures.length > 0 ? temperatures[index].temperatures[temperatures[index].temperatures.length - 1] : null;
                  temperatures[index].temperatures.push(entry.temperature !== 0 ? entry.temperature : lastTemperature);
                }
              });
            }
          });

          // 设置 ECharts 数据
          this.myChart.setOption({
            xAxis: {
              type: 'category',
              data: temperatures[0].dates, // 假设所有数据的日期是相同的
            },
            series: temperatures.map(tempData => ({
              name: tempData.location, // 使用 location 作为图例名称
              type: 'line',
              data: tempData.temperatures,
            })),
            legend: {
              data: temperatures.map(tempData => tempData.location), // 动态设置图例
            },
          });
        }
      } catch (error) {
        console.error('数据请求失败:', error);
      }
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
  },
})
</script>

<template>
    <!-- 时间筛选器和图表的容器 -->
    <div class="content-container">
      <!-- 时间筛选器 -->
      <div class="date-picker-container">
        <div style="font-size: 16px;font-weight: bold;padding-bottom: 1%;margin-left: 1%;color: black">时间筛选器</div>
        <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onDateChange" style="margin-left: 1%;"
        >
        </el-date-picker>
      </div>

      <!-- 图表容器 -->
      <div class="chart-container" ref="chart"></div>
    </div>
</template>

<style scoped>
.content-container {
  display: flex;
  flex-direction: column;
  width: 88%;
  background-color: #f8f8f8;
}

.date-picker-container {
  margin: 10px;
}

.chart-container {
  width: 100%;
  height: 80%;
  margin-left: 1%;
}
</style>