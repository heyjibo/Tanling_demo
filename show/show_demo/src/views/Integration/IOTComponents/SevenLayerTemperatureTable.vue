<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "SevenLayerTemperatureTable",
  props: {
    mediumTemperature: {
      type: Number,
      required: true,
    },
    // 所有温度属性为对象
    tube1layer1temperature1: Object,
    tube1layer1temperature2: Object,
    tube1layer1temperature3: Object,

    tube2layer1temperature1: Object,
    tube2layer1temperature2: Object,
    tube2layer1temperature3: Object,

    tube1layer2temperature1: Object,
    tube1layer2temperature2: Object,
    tube1layer2temperature3: Object,

    tube2layer2temperature1: Object,
    tube2layer2temperature2: Object,
    tube2layer2temperature3: Object,

    tube1layer3temperature1: Object,
    tube1layer3temperature2: Object,
    tube1layer3temperature3: Object,

    tube2layer3temperature1: Object,
    tube2layer3temperature2: Object,
    tube2layer3temperature3: Object,

    tube1layer4temperature1: Object,
    tube1layer4temperature2: Object,
    tube1layer4temperature3: Object,

    tube2layer4temperature1: Object,
    tube2layer4temperature2: Object,
    tube2layer4temperature3: Object,

    tube1layer5temperature1: Object,
    tube1layer5temperature2: Object,
    tube1layer5temperature3: Object,

    tube2layer5temperature1: Object,
    tube2layer5temperature2: Object,
    tube2layer5temperature3: Object,

    tube1layer6temperature1: Object,
    tube1layer6temperature2: Object,
    tube1layer6temperature3: Object,

    tube2layer6temperature1: Object,
    tube2layer6temperature2: Object,
    tube2layer6temperature3: Object,

    tube1layer7temperature1: Object,
    tube1layer7temperature2: Object,
    tube1layer7temperature3: Object,

    tube2layer7temperature1: Object,
    tube2layer7temperature2: Object,
    tube2layer7temperature3: Object,

    tube3layer1temperature1: Object,
    tube3layer1temperature2: Object,
    tube3layer1temperature3: Object,

    tube3layer2temperature1: Object,
    tube3layer2temperature2: Object,
    tube3layer2temperature3: Object,

    tube3layer4temperature1: Object,
    tube3layer4temperature2: Object,
    tube3layer4temperature3: Object,

    tube3layer6temperature1: Object,
    tube3layer6temperature2: Object,
    tube3layer6temperature3: Object,

    tube3layer7temperature1: Object,
    tube3layer7temperature2: Object,
    tube3layer7temperature3: Object,
  },
  data() {
    return {
      tableData: [],
    }
  },
  watch: {
    tube1layer1temperature1() {
      this.processTemperatureData()
    },
    tube1layer1temperature2() {
      this.processTemperatureData()
    },
    tube1layer1temperature3() {
      this.processTemperatureData()
    },
    // ... 继续监听其他温度属性
  },
  mounted() {
    this.processTemperatureData()
  },
  methods: {
    processTemperatureData() {
      this.categorizeTemperatures()
      this.fillTableData()
    },
    categorizeTemperatures() {
      this.tube1Temperature1 = [
        this.tube1layer1temperature1,
        this.tube1layer2temperature1,
        this.tube1layer3temperature1,
        this.tube1layer4temperature1,
        this.tube1layer5temperature1,
        this.tube1layer6temperature1,
        this.tube1layer7temperature1,
      ]
      this.tube1Temperature2 = [
        this.tube1layer1temperature2,
        this.tube1layer2temperature2,
        this.tube1layer3temperature2,
        this.tube1layer4temperature2,
        this.tube1layer5temperature2,
        this.tube1layer6temperature2,
        this.tube1layer7temperature2,
      ]
      this.tube1Temperature3 = [
        this.tube1layer1temperature3,
        this.tube1layer2temperature3,
        this.tube1layer3temperature3,
        this.tube1layer4temperature3,
        this.tube1layer5temperature3,
        this.tube1layer6temperature3,
        this.tube1layer7temperature3,
      ]

      this.tube2Temperature1 = [
        this.tube2layer1temperature1,
        this.tube2layer2temperature1,
        this.tube2layer3temperature1,
        this.tube2layer4temperature1,
        this.tube2layer5temperature1,
        this.tube2layer6temperature1,
        this.tube2layer7temperature1,
      ]
      this.tube2Temperature2 = [
        this.tube2layer1temperature2,
        this.tube2layer2temperature2,
        this.tube2layer3temperature2,
        this.tube2layer4temperature2,
        this.tube2layer5temperature2,
        this.tube2layer6temperature2,
        this.tube2layer7temperature2,
      ]
      this.tube2Temperature3 = [
        this.tube2layer1temperature3,
        this.tube2layer2temperature3,
        this.tube2layer3temperature3,
        this.tube2layer4temperature3,
        this.tube2layer5temperature3,
        this.tube2layer6temperature3,
        this.tube2layer7temperature3,
      ]
      this.tube3Temperature1 = [
        this.tube3layer1temperature1,
        this.tube3layer2temperature1,
        this.tube3layer4temperature1,
        this.tube3layer6temperature1,
        this.tube3layer7temperature1,
      ]

      this.tube3Temperature2 = [
        this.tube3layer1temperature2,
        this.tube3layer2temperature2,
        this.tube3layer4temperature2,
        this.tube3layer6temperature2,
        this.tube3layer7temperature2,
      ]

      this.tube3Temperature3 = [
        this.tube3layer1temperature3,
        this.tube3layer2temperature3,
        this.tube3layer4temperature3,
        this.tube3layer6temperature3,
        this.tube3layer7temperature3,
      ]
      console.log('补口0度:', this.tube3Temperature1)
      console.log('补口45度:', this.tube3Temperature2)
      console.log('补口225度:', this.tube3Temperature3)
    },
    fillTableData() {
      this.tableData = [] // 清空之前的数据
      for (let i = 0; i < 7; i++) {
        // 假设有7层，i从6到0代表层级 7层到 1层
        const layerData = {
          layer: `第${i + 1}层`,
          tube1Temperature1: this.tube1Temperature1[i],
          tube1Temperature2: this.tube1Temperature2[i],
          tube1Temperature3: this.tube1Temperature3[i],
          tube2Temperature1: this.tube2Temperature1[i],
          tube2Temperature2: this.tube2Temperature2[i],
          tube2Temperature3: this.tube2Temperature3[i],
        }

        // 处理补口数据的层级
        // 这里需要根据补口的层级对应的索引来填充数据
        if (i === 6) {
          // 第七层
          layerData.tube3Temperature1 = this.tube3Temperature1[4] // 补口第5个数据（第1层）
          layerData.tube3Temperature2 = this.tube3Temperature2[4]
          layerData.tube3Temperature3 = this.tube3Temperature3[4]
        } else if (i === 5) {
          // 第六层
          layerData.tube3Temperature1 = this.tube3Temperature1[3]
          layerData.tube3Temperature2 = this.tube3Temperature1[3]
          layerData.tube3Temperature3 = this.tube3Temperature1[3]
        } else if (i === 4) {
          // 第五层
          layerData.tube3Temperature1 = null
          layerData.tube3Temperature2 = null
          layerData.tube3Temperature3 = null
        } else if (i === 3) {
          // 第四层
          layerData.tube3Temperature1 = this.tube3Temperature1[2] // 补口第4个数据
          layerData.tube3Temperature2 = this.tube3Temperature2[2]
          layerData.tube3Temperature3 = this.tube3Temperature3[2]
        } else if (i === 2) {
          // 第三层
          layerData.tube3Temperature1 = null
          layerData.tube3Temperature2 = null
          layerData.tube3Temperature3 = null
        } else if (i === 1) {
          // 第二层
          layerData.tube3Temperature1 = this.tube3Temperature1[1] // 补口第2个数据
          layerData.tube3Temperature2 = this.tube3Temperature2[1]
          layerData.tube3Temperature3 = this.tube3Temperature3[1]
        } else if (i === 0) {
          // 第一层
          layerData.tube3Temperature1 = this.tube3Temperature1[0] // 补口第1个数据
          layerData.tube3Temperature2 = this.tube3Temperature2[0]
          layerData.tube3Temperature3 = this.tube3Temperature3[0]
        }

        this.tableData.push(layerData)
      }
      console.log(this.tableData)
    },

    getTemperatureStyle(temperature) {
      console.log(temperature, this.mediumTemperature)
      return temperature.value > this.mediumTemperature + 2
          ? { color: 'red' } // 如果温度大于介质温度，颜色为红色
          : { color: '#00378b' } // 如果温度小于等于介质温度，颜色为蓝色
    },
  },
})
</script>

<template>
  <div class="temperature-table">
    <h3 class="table-title">保温层温度表</h3>
    <div class="table-container">
      <table class="temperature-table__content">
        <thead>
        <tr>
          <th>层级</th>
          <th colspan="3" class="tube-column">直管</th>
          <th colspan="3" class="tube-column">弯头</th>
          <th colspan="3" class="tube-column">补口</th>
        </tr>
        <tr>
          <th></th>
          <th>垂直0度</th>
          <th>45度</th>
          <th>225度</th>
          <th>垂直0度</th>
          <th>45度</th>
          <th>225度</th>
          <th>垂直0度</th>
          <th>45度</th>
          <th>225度</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(row, index) in tableData"
            :key="index"
            style="font-size: 0.8rem">
          <td>{{ row.layer }}</td>
          <td
              v-if="row.tube1Temperature1"
              :style="getTemperatureStyle(row.tube1Temperature1)">
            {{ row.tube1Temperature1.value }} °C
          </td>
          <td v-else>N/A</td>
          <td
              v-if="row.tube1Temperature2"
              :style="getTemperatureStyle(row.tube1Temperature2)">
            {{ row.tube1Temperature2.value }} °C
          </td>
          <td v-else>N/A</td>
          <td
              v-if="row.tube1Temperature3"
              :style="getTemperatureStyle(row.tube1Temperature3)">
            {{ row.tube1Temperature3.value }} °C
          </td>
          <td v-else>N/A</td>

          <td
              v-if="row.tube2Temperature1"
              :style="getTemperatureStyle(row.tube2Temperature1)">
            {{ row.tube2Temperature1.value }} °C
          </td>
          <td v-else>N/A</td>
          <td
              v-if="row.tube2Temperature2"
              :style="getTemperatureStyle(row.tube2Temperature2)">
            {{ row.tube2Temperature2.value }} °C
          </td>
          <td v-else>N/A</td>
          <td
              v-if="row.tube2Temperature3"
              :style="getTemperatureStyle(row.tube2Temperature3)">
            {{ row.tube2Temperature3.value }} °C
          </td>
          <td v-else>N/A</td>

          <!-- 补口的温度信息 -->
          <td
              v-if="row.tube3Temperature1"
              :style="getTemperatureStyle(row.tube3Temperature1)">
            {{ row.tube3Temperature1.value }} °C
          </td>
          <td v-else>\</td>
          <td
              v-if="row.tube3Temperature2"
              :style="getTemperatureStyle(row.tube3Temperature2)">
            {{ row.tube3Temperature2.value }} °C
          </td>
          <td v-else>\</td>
          <td
              v-if="row.tube3Temperature3"
              :style="getTemperatureStyle(row.tube3Temperature3)">
            {{ row.tube3Temperature3.value }} °C
          </td>
          <td v-else>\</td>
        </tr>
        <!-- 添加介质温度的行 -->
        <tr>
          <td style="font-size: 0.9rem">介质温度</td>
          <td
              colspan="9"
              style="text-align: center; color: #00378b; font-size: 0.9rem">
            {{ mediumTemperature }} <a style="color: #00378b">°C</a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.temperature-table {
  position: absolute;
  margin-top: 6%;
  width: 100%;
  height: 30%; /* 让表格自适应高度 */
  left: 3%;
  background-color: transparent;
  max-height: 30%;
}

.table-title {
  color: #005183; /* 统一字体颜色 */
  font-size: 1rem;
  margin-bottom: 1%;
}

.table-container {
  display: flex;
  justify-content: flex-start;
}

.temperature-table__content {
  width: 70%;
  height: 60%;
  border-collapse: collapse;
  color: #000000;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0 0.3rem 0.6rem 0.9rem rgba(210, 210, 210, 0.3); /* 添加阴影效果 */
  border-radius: 0.5rem;
  overflow: hidden;
}

.temperature-table__content th,
.temperature-table__content td {
  border: 0.3px solid rgb(216, 216, 216);
  padding: 0.6rem;
  text-align: center;
  transition: background-color 1s;
}

.temperature-table__content th {
  background-color: rgba(235, 247, 255, 0.811);
}

.temperature-table__content tr:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.tube-column {
  width: 12rem;
}
</style>