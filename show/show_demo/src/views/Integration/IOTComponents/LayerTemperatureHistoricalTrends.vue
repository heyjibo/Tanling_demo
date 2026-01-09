<script>
import {defineComponent} from 'vue'
import * as XLSX from 'xlsx';

export default defineComponent({
  name: "LayerTemperatureHistoricalTrends",
  data() {
    return {
      dateRange: [], // 存储用户选择的日期范围
      tableData: [], // 用来存储填充的数据
      tableHeaders: [], // 用来存储表头数据
      originalData: [], // 存储接口返回的原始数据
      selectedPoint: 'point1', // 默认选中的点位为 'point1'
      pointData: [], // 默认的空数据
      point1Data: [
        ['402-16', '404-5', '401-9', '401-16', '404-12', '404-13', '402-15', '401-11', '403-12'],
        ['402-4', '403-6', '401-8', '404-4', '404-6', '404-14', '401-12', '402-5', '402-14'],
        ['401-7', '403-7', '403-10', '403-1', '404-15', '404-7'],
        ['401-13', '402-6', '402-13', '401-6', '404-16', '403-9', '403-16', '403-4', '401-14'],
        ['402-1', '402-7', '402-12', '403-15', '401-5', '403-8'],
        ['403-3', '401-15', '402-11', '404-9', '402-8', '401-1', '401-4', '403-14', '401-2'],
        ['404-10', '402-2', '403-13', '403-2', '402-9', '404-11', '401-3', '401-10', '402-10']
      ],
      point2Data: [
        ['184-8', '187-11', '186-1', '185-4', '185-13', '186-16', '184-4', '187-6', '185-3'],
        ['187-5', '184-9', '186-15', '187-12', '185-14', '184-15', '184-3', '187-7', '184-16'],
        ['185-15', '186-3', '187-13', '186-14', '185-2', '184-10'],
        ['184-2', '185-1', '186-13', '184-11', '187-8', '186-4', '187-14', '185-16', '184-1'],
        ['184-7', '186-12', '185-9', '184-12', '186-9', '186-2'],
        ['187-15', '185-8', '187-9', '185-7', '186-11', '186-10', '185-5', '185-10', '185-11'],
        ['187-10', '187-16', '185-6', '184-6', '184-5', '186-6', '184-13', '184-14', '186-8']
      ],
      point3Data: [
        ['176-9', '175-5', '175-12', '174-15', '177-15', '177-8', '174-5', '177-9', '177-16'],
        ['175-4', '176-1', '174-16', '175-13', '174-9', '174-4', '176-7', '176-11', '177-7'],
        [ '175-8', '175-14', '174-10', '177-13', '175-3', '176-12'],
        ['177-6', '176-6', '174-3', '174-2', '175-9', '174-11', '177-11', '176-13', '176-16'],
        [ '176-3', '177-5', '175-10', '174-12', '175-16', '177-12'],
        ['175-1', '176-14', '174-1', '177-4', '177-10', '176-4', '174-14', '174-13', '176-15'],
        [ '174-7', '174-6', '176-8', '175-7', '175-11', '177-3', '177-14', '175-2', '175-6']
      ],
      point4Data:[
        ['216-14', '217-11', '216-15', '216-9', '217-12', '219-9'],
        ['218-16', '216-10', '216-16','216-11', '217-8', '219-10'],
        ['218-7', '217-14', '216-12', '219-11', '217-15', '217-9'],
        ['218-6', '217-16', '219-5', '219-12', '216-13', '219-6'],
        ['218-5', '216-7', '216-4', '217-1', '217-7', '217-2'],
        ['216-6', '218-4', '216-5','217-6', '218-14', '217-4']
      ]
    };
  },
  mounted() {
    this.setDefaultDateRange(); // 设置默认时间范围
    this.selectedPoint = 'point1'; // 在mounted时初始化selectedPoint
    this.pointData=this.point1Data;
    this.onPointChange(); // 根据selectedPoint初始化pointData
    this.fetchData(); // 初次加载时获取数据
  },
  methods: {
    setDefaultDateRange() {
      const endTime = new Date(); // 当前时间
      const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 一小时前
      this.dateRange = [startTime, endTime]; // 设置默认时间范围
    },
    async fetchData() {
      try {
        const startTime = this.formatDate(this.dateRange[0]); // 格式化开始时间
        const endTime = this.formatDate(this.dateRange[1]); // 格式化结束时间
        const response = await fetch(`http://218.92.43.42:7072/lsgn/api/get/therm/history?startTime=${startTime}&endTime=${endTime}`);
        const result = await response.json();
        console.log(result);

        if (result.code === 0) {
          this.originalData = result.data; // 获取返回的数据
          if (this.originalData && Array.isArray(this.originalData) && this.originalData.length > 0) {
            this.tableHeaders = this.generateTableHeaders();
            console.log('header:',this.tableHeaders);
            this.processTemperatureData();
            this.tableData = this.generateTableData();

            console.log("tableData:", this.tableData);
          } else {
            console.error('没有返回有效的设备数据');
          }
        }
      } catch (error) {
        console.error("温度数据请求失败:", error);
      }
    },
    onPointChange() {
      console.log("selectedPoint:", this.selectedPoint); // 调试打印，确保 selectedPoint 变化
      if (this.selectedPoint === 'point1') {
        this.pointData = this.point1Data;
      } else if (this.selectedPoint === 'point2') {
        this.pointData = this.point2Data;
      } else if (this.selectedPoint === 'point3') {
        this.pointData = this.point3Data;
      } else if (this.selectedPoint === 'point4') {
        this.pointData = this.point4Data;
      }

      console.log("pointData:", this.pointData); // 确保 pointData 已经正确赋值

      this.tableHeaders = this.generateTableHeaders(); // 重新生成表头
      this.tableData = this.generateTableData(); // 重新生成表格数据
    },

    onDateChange(value) {
      console.log('选择的日期范围:', value);
      this.fetchData();
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 返回格式化后的字符串
    },
    // 创建表格表头
    generateTableHeaders() {
      const layers = ['第一层', '第二层', '第三层', '第四层', '第五层', '第六层', '第七层']; // 7个层级
      const layers2 = ['第一层', '第二层', '第三层', '第四层', '第五层', '第六层']; // 6个层级
      const pipeTypes = ['直管', '弯头', '补口']; // 管道类型
      const angles = ['垂直0度', '45度', '225度']; // 角度
      const point4Pipes = ['一号管', '二号管']; // 点位四的管道类型
      const tempTypes = ['温度1', '温度2', '温度3']; // 点位四的温度类型

      const headers = ["时间"];

      if (this.selectedPoint === 'point1' || this.selectedPoint === 'point2' || this.selectedPoint === 'point3') {
        // 点位一、二、三的表头生成
        layers.forEach(layer => {
          pipeTypes.forEach(pipe => {
            angles.forEach(angle => {
              // 跳过第三层和第五层的补口
              headers.push(`${this.selectedPoint === 'point1' ? '点位一' : this.selectedPoint === 'point2' ? '点位二' : '点位三'}${layer}${pipe}${angle}`);
            });
          });
        });
      } else if (this.selectedPoint === 'point4') {
        // 点位四的表头生成
        layers2.forEach(layer => {
          point4Pipes.forEach(pipe => {
            tempTypes.forEach(temp => {
              headers.push(`点位四${pipe}${layer}${temp}`); // 生成每层每管道的温度
            });
          });
        });
      }

      return headers;
    },
    // 处理返回的数据
    processTemperatureData() {
      const temperatureData = {}; // 用来存储每个温度项的数据

      // 遍历返回的历史数据
      this.originalData.forEach(deviceData => {
        const deviceId = deviceData.idDevice; // 获取设备ID

        deviceData.historyData.forEach(entry => {
          const time = entry.date; // 获取时间点

          Object.keys(entry).forEach(key => {
            if (key.startsWith('temperature')) {
              const temperatureKey = `${deviceId}${key}`;
              if (!temperatureData[temperatureKey]) {
                temperatureData[temperatureKey] = [];
              }
              temperatureData[temperatureKey].push(entry[key]?.value || null);
            }
          });
        });
      });

      this.temperatureData = temperatureData;
    },

    generateTableData() {
      const tableRows = [];
      const timeData = this.originalData[0]?.historyData || [];

      const point4Pipes = ['一号管', '二号管']; // 点位四的管道类型
      const tempTypes = ['温度1', '温度2', '温度3']; // 温度类型

      if (!this.pointData || this.pointData.length === 0) {
        console.error("pointData 未初始化！");
        return []; // 如果 pointData 没有被赋值，直接返回空数组
      }
      console.log("pointData:",this.pointData);
      timeData.forEach((entry, timeIndex) => {
        const row = { "时间": entry.date }; // 添加时间列

        if (this.selectedPoint === 'point4') {
          console.log("开始处理点位四的数据...");
          // 点位四的特殊处理，按照每一层、每根管道和温度顺序
          this.pointData.forEach((deviceArray, layerIndex) => {
            console.log(`处理第 ${layerIndex + 1} 层的数据...`);

            // 对于每一层的数据，直接按顺序获取温度
            deviceArray.forEach((deviceId, tempIndex) => {
              console.log(`  正在处理设备ID: ${deviceId} (索引: ${tempIndex})`);

              if (!deviceId) {
                console.error(`  无效的设备ID: ${deviceId}, 跳过...`);
                return; // 如果设备 ID 无效，则跳过此数据
              }

              const deviceNumber = deviceId.split('-')[0];  // 获取设备编号
              const deviceTempIndex = parseInt(deviceId.split('-')[1]);  // 获取温度索引
              const temperatureKey = `${deviceNumber}temperature${deviceTempIndex}`;
              const comparisonKey = Object.keys(this.temperatureData).find(key => {
                const comparisonKeySuffix = key.split('-').pop();
                return comparisonKeySuffix === temperatureKey;
              });

              if (!comparisonKey) {
                console.error(`    没有找到匹配的键: ${temperatureKey}`);
                return; // 如果没有找到匹配的温度键，跳过此数据
              }
              const temperatureValue = this.temperatureData[comparisonKey]
                  ? this.temperatureData[comparisonKey][timeIndex]
                  : null;
              const formattedTemperature = temperatureValue !== null ? `${temperatureValue}℃` : null;
              const columnIndex = layerIndex * this.pointData[0].length  + tempIndex + 1;
              row[this.tableHeaders[columnIndex]] = formattedTemperature;
            });
          });
        } else {
          // 点位一、二、三的处理逻辑
          this.pointData.forEach((deviceArray, layerIndex) => {
            deviceArray.forEach((deviceId, tempIndex) => {
              const deviceNumber = deviceId.split('-')[0];
              const deviceTempIndex = parseInt(deviceId.split('-')[1]);
              const temperatureKey = `${deviceNumber}temperature${deviceTempIndex}`;
              const comparisonKey = Object.keys(this.temperatureData).find(key => {
                const comparisonKeySuffix = key.split('-').pop();
                return comparisonKeySuffix === temperatureKey;
              });

              const temperatureValue = this.temperatureData[comparisonKey]
                  ? this.temperatureData[comparisonKey][timeIndex]
                  : null;
              const formattedTemperature = temperatureValue !== null ? `${temperatureValue}℃` : null;
              const columnIndex = layerIndex * 9 + tempIndex + 1;
              row[this.tableHeaders[columnIndex]] = formattedTemperature;
            });
          });
        }
        tableRows.push(row);
      });

      return tableRows;
    },


    downloadExcel() {
      const headers = this.tableHeaders; // 获取表头数据
      this.tableData = this.generateTableData();  // 确保获取了填充数据

      //确保 tableData 的每一项都包含时间，并且每一行的数据都与表头对应
      const formattedTableData = this.tableData.map(row => {
        const rowData = { time: row.time };  // 确保每一行都有时间字段

        // 填充数据时保持时间列的顺序
        headers.forEach((header, index) => {
          rowData[header] = row[header] || null; // 保证每一列数据存在
        });
        return rowData;
      });

      // 动态设置导出文件的名称
      const pointName = this.selectedPoint === 'point1' ? '点位一' :
          this.selectedPoint === 'point2' ? '点位二' :
              this.selectedPoint === 'point3' ? '点位三' : '点位四';
      const fileName = `${pointName}历史温度数据表`;

      console.log('formattedtable:', formattedTableData);

      // 使用第三方库导出Excel (例如 SheetJS)
      const wb = XLSX.utils.book_new(); // 新建一个Excel文件
      const ws = XLSX.utils.json_to_sheet(formattedTableData, { header: headers }); // 将数据转为表格格式
      XLSX.utils.book_append_sheet(wb, ws, 'TemperatureData'); // 将工作表加入Excel
      XLSX.writeFile(wb, `${fileName}.xlsx`); // 导出Excel文件，使用动态文件名
    }
  }
})
</script>

<template>
  <div class="iot-map-container">

    <div class="content-container">
      <!-- 时间筛选器 -->
      <div class="date-picker-container">
        <div style="font-size: 1rem; font-weight: bold; padding-bottom: 1%; margin-left: 1%; color: #000000;">保温层历史温度数据时间筛选器</div>
        <div class="controls-row">
        <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onDateChange"
        ></el-date-picker>

        <el-select v-model="selectedPoint" placeholder="选择点位" @change="onPointChange" style="width: 10vw">
          <el-option label="点位一" value="point1"></el-option>
          <el-option label="点位二" value="point2"></el-option>
          <el-option label="点位三" value="point3"></el-option>
          <el-option label="点位四" value="point4"></el-option>
        </el-select>

        <!-- 添加下载 Excel 按钮 -->
        <button class="download-btn" @click="downloadExcel">下载Excel</button>
      </div>
      </div>
      <!-- 表格展示 -->
      <el-table
          :data="tableData"
          style="width: 99%; margin-left: 1%; overflow-x: auto;"
          :header-cell-style="{ fontSize: '0.8rem', padding: '3px 0' }"
      >
        <el-table-column v-for="(header, index) in tableHeaders" :key="index" :prop="header" :label="header" :width="header === '时间' ? '180px' : 'auto'"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.content-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  //height: 100%;
  overflow: auto;
}

.controls-row {
  width: 56%;
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  gap: 15px; /* 控制元素之间的间距 */
  margin-left: 1%;
  margin-top: 10px;
}

.date-picker-container {
  margin: 1rem;
}

/* 下载按钮的样式 */
.download-btn {
  padding: 0.2rem 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 0.3rem;
  white-space: nowrap;
}
.download-btn:hover {
  background-color: #45a049;
}

</style>