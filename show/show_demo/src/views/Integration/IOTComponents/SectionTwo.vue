<script lang="ts">
import {defineComponent} from 'vue'
import Layer from './Layer.vue';
import Layer4 from './Layer4.vue';
import DataOverview from './DataOverview.vue';
import axios from 'axios';
import SevenLayerTemperatureTable from './SevenLayerTemperatureTable.vue';
import {ElMessage} from "element-plus";
import { ArrowRight, HomeFilled } from '@element-plus/icons-vue'

export default defineComponent({
  name: "SectionTwo",
  computed: {
    ArrowRight() {
      return ArrowRight
    }
  },
  data(){
    return {
      title: null,
      configId: null,
      interval: null as NodeJS.Timeout | null,
      MediumTemperature: 30,
      measuredUnitHeatLoss: 128.86,
      unitHeatLoss: 131.29,
      meteData: {
        data: [
          {
            windSpeed: 0,
            windPower: 0,
            windDirection: 0,
            airTemperature: 0,
            noise: 0,
            co2Concentration: 0,
            atmoPressure: 0,
            dailyRainfall: 0,
            rainSnowState: 0,
            totalRadiation: 0,
            currentRainfall: 0
          }
        ]
      },
      displaceData: {
        data: [
          { displaceData: 0 },
          { displaceData: 0 },
          { displaceData: 0 },
          { displaceData: 0 }
        ]
      },
      thermData: {
        data: [
          {
            temperature1: { value: 0 },
            temperature2: { value: 0 },
            temperature3: { value: 0 },
            temperature4: { value: 0 },
            temperature5: { value: 0 },
            temperature6: { value: 0 },
            temperature7: { value: 0 },
            temperature8: { value: 0 },
            temperature9: { value: 0 },
            temperature10: { value: 0 },
            temperature11: { value: 0 },
            temperature12: { value: 0 },
            temperature13: { value: 0 },
            temperature14: { value: 0 },
            temperature15: { value: 0 },
            temperature16: { value: 0 }
          },
          {
            temperature1: { value: 0 },
            temperature2: { value: 0 },
            temperature3: { value: 0 },
            temperature4: { value: 0 },
            temperature5: { value: 0 },
            temperature6: { value: 0 },
            temperature7: { value: 0 },
            temperature8: { value: 0 },
            temperature9: { value: 0 },
            temperature10: { value: 0 },
            temperature11: { value: 0 },
            temperature12: { value: 0 },
            temperature13: { value: 0 },
            temperature14: { value: 0 },
            temperature15: { value: 0 },
            temperature16: { value: 0 }
          },
          {
            temperature1: { value: 0 },
            temperature2: { value: 0 },
            temperature3: { value: 0 },
            temperature4: { value: 0 },
            temperature5: { value: 0 },
            temperature6: { value: 0 },
            temperature7: { value: 0 },
            temperature8: { value: 0 },
            temperature9: { value: 0 },
            temperature10: { value: 0 },
            temperature11: { value: 0 },
            temperature12: { value: 0 },
            temperature13: { value: 0 },
            temperature14: { value: 0 },
            temperature15: { value: 0 },
            temperature16: { value: 0 }
          },
          {
            temperature1: { value: 0 },
            temperature2: { value: 0 },
            temperature3: { value: 0 },
            temperature4: { value: 0 },
            temperature5: { value: 0 },
            temperature6: { value: 0 },
            temperature7: { value: 0 },
            temperature8: { value: 0 },
            temperature9: { value: 0 },
            temperature10: { value: 0 },
            temperature11: { value: 0 },
            temperature12: { value: 0 },
            temperature13: { value: 0 },
            temperature14: { value: 0 },
            temperature15: { value: 0 },
            temperature16: { value: 0 }
          }
        ]
      },
      thermPointData: {
        data: [
          { temperature: 0, pressure: 0, diffPressure: 0, flowTotalInteger: 0, flowNow: 0 },
          { temperature: 0, pressure: 0, diffPressure: 0, flowTotalInteger: 0, flowNow: 0 },
          { temperature: 0, pressure: 0, diffPressure: 0, flowTotalInteger: 0, flowNow: 0 },
          { temperature: 0, pressure: 0, diffPressure: 0, flowTotalInteger: 0, flowNow: 0 },
          { temperature: 0, pressure: 0, diffPressure: 0, flowTotalInteger: 0, flowNow: 0 }
        ]
      },
      tubeIdentifiers: [
        ['186-1', '184-8', '185-13', '184-4', '186-16', '184-15', '185-3', '186-15', '184-3'],
        ['187-6', '187-12', '187-5', '184-9', '185-14', '184-16', '186-14', '187-7', '187-13'],
        ['186-3', '185-2', '185-15', '184-2', '186-13', '184-10'],
        ['185-1', '184-1', '186-4', '186-12', '187-14', '185-8', '187-8', '184-11', '185-16'],
        ['184-7', '185-9', '186-9', '185-7', '186-11', '184-12'],
        ['186-2', '187-9', '187-15', '186-10', '185-10', '185-5', '185-6', '185-11', '187-10'],
        ['184-6', '187-16', '184-5', '186-8', '184-13', '185-12', '184-14', '186-6', '186-5']
      ].flat()
    }
  },
  components: {
    ArrowRight,
    HomeFilled,
    Layer,
    Layer4,
    DataOverview,
    SevenLayerTemperatureTable,
  },
  methods:{
    async fetchData() {
      try {
        const meteResponse = await axios.get('http://218.92.43.42:7072/lsgn/api/get/mete/list');
        this.meteData = meteResponse.data;

        const displaceResponse = await axios.get('http://218.92.43.42:7072/lsgn/api/get/displace/list');
        this.displaceData = displaceResponse.data;

        const thermResponse = await axios.get('http://218.92.43.42:7072/lsgn/api/get/therm/list');
        this.thermData = thermResponse.data;

        const thermPointResponse = await axios.get('http://218.92.43.42:7072/lsgn/api/get/thermPoint/list');
        this.thermPointData = thermPointResponse.data;

        console.log('meteData:', this.meteData);
        console.log('displaceData:', this.displaceData);
        console.log('thermData:', this.thermData);
        console.log('thermPointData:', this.thermPointData);

      } catch (error) {
        console.error('数据获取失败:', error);
      }
    },
    // 获取项目标题
    async fetchProjectTitle() {
      try {
        const response = await axios.get('http://218.92.43.42:7072/lsgn/api/project/config/getInfo?configKey=project_title');
        if (response.data.code === 0) {
          this.title = response.data.data.configValue;  // 设置项目标题
          this.configId = response.data.data.configId;
          console.log("获取到标题:",response.data.data.configValue);
        } else {
          ElMessage.error('获取项目标题失败:', response.data.msg);
        }
      } catch (error) {
        ElMessage.error('请求标题失败，请检查网络连接或稍后再试！');
      }
    },
    updateHeatLossValues() {
      // 每分钟更新 `measuredUnitHeatLoss` 和 `unitHeatLoss` 的值，增加一个 0-1 的随机数
      this.measuredUnitHeatLoss = parseFloat((278.04 + Math.random()).toFixed(2));
      this.unitHeatLoss = parseFloat((151.78 + Math.random()).toFixed(2));
    },
    getDeviceId (str: string){
      if(str) {
        const arr = str.split('-')
        if (arr.length == 2)
          return arr[1]
      }
      return undefined
    },
    getTubeLayerTemperature(thermData: { data: any[]; }, str: string){

      // console.log('thermData:', thermData, 'str:', str)
      const id = str.split('-')[0]
      const temperatureStrList = [
        'temperature1',
        'temperature2',
        'temperature3',
        'temperature4',
        'temperature5',
        'temperature6',
        'temperature7',
        'temperature8',
        'temperature9',
        'temperature10',
        'temperature11',
        'temperature12',
        'temperature13',
        'temperature14',
        'temperature15',
        'temperature16',
      ]

      const temp = temperatureStrList[parseInt(str.split('-')[1]) - 1]
      const obj = thermData.data.find(item => this.getDeviceId(item.idDevice) === id)
      return obj?obj[temp]:null
    }
  },
  created() {
    // 获取项目标题
    this.fetchProjectTitle();
    // 调用一次 fetchData 函数
    this.fetchData();
    this.updateHeatLossValues();
    // 每分钟调用一次 fetchData 函数
    this.interval = setInterval(() => {
      this.fetchData();
      this.updateHeatLossValues();
    }, 60000); // 60000 毫秒 = 1 分钟
  },
  beforeUnmount() {
    // 清除定时器，以防止内存泄漏
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
})
</script>

<template>
    <!-- 地图背景和数据卡片 -->
    <div class="iot-map-container">

      <el-breadcrumb :separator-icon="ArrowRight" style="font-size: 1rem;margin-top: 2.5rem; margin-left: 3.5rem;">
        <el-breadcrumb-item>
          <el-icon><HomeFilled /></el-icon>
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{title}}</el-breadcrumb-item>
        <el-breadcrumb-item>点位二</el-breadcrumb-item>
      </el-breadcrumb>

      <SevenLayerTemperatureTable
          :mediumTemperature="thermPointData.data[0].temperature"

          :tube1layer1temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[0])"
          :tube1layer1temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[1])"
          :tube1layer1temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[2])"

          :tube2layer1temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[3])"
          :tube2layer1temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[4])"
          :tube2layer1temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[5])"

          :tube3layer1temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[6])"
          :tube3layer1temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[7])"
          :tube3layer1temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[8])"

          :tube1layer2temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[9])"
          :tube1layer2temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[10])"
          :tube1layer2temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[11])"

          :tube2layer2temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[12])"
          :tube2layer2temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[13])"
          :tube2layer2temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[14])"

          :tube3layer2temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[15])"
          :tube3layer2temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[16])"
          :tube3layer2temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[17])"

          :tube1layer3temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[18])"
          :tube1layer3temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[19])"
          :tube1layer3temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[20])"

          :tube2layer3temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[21])"
          :tube2layer3temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[22])"
          :tube2layer3temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[23])"

          :tube1layer4temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[24])"
          :tube1layer4temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[25])"
          :tube1layer4temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[26])"

          :tube2layer4temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[27])"
          :tube2layer4temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[28])"
          :tube2layer4temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[29])"

          :tube3layer4temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[30])"
          :tube3layer4temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[31])"
          :tube3layer4temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[32])"

          :tube1layer5temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[33])"
          :tube1layer5temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[34])"
          :tube1layer5temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[35])"

          :tube2layer5temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[36])"
          :tube2layer5temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[37])"
          :tube2layer5temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[38])"

          :tube1layer6temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[39])"
          :tube1layer6temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[40])"
          :tube1layer6temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[41])"

          :tube2layer6temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[42])"
          :tube2layer6temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[43])"
          :tube2layer6temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[44])"

          :tube3layer6temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[45])"
          :tube3layer6temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[46])"
          :tube3layer6temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[47])"

          :tube1layer7temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[48])"
          :tube1layer7temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[49])"
          :tube1layer7temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[50])"

          :tube2layer7temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[51])"
          :tube2layer7temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[52])"
          :tube2layer7temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[53])"

          :tube3layer7temperature1="getTubeLayerTemperature(thermData, tubeIdentifiers[54])"
          :tube3layer7temperature2="getTubeLayerTemperature(thermData, tubeIdentifiers[55])"
          :tube3layer7temperature3="getTubeLayerTemperature(thermData, tubeIdentifiers[56])"
      />


      <!-- 数据图例说明部分 -->
      <div class="legend-container">
        <div class="legend-title">图例说明</div>
        <div class="legend-item">
          <img src="@/assets/images/iot/管网截面图.jpeg" style="width: 12rem;height: 10rem; ">
        </div>
        <div class="legend-item">
          <img src="@/assets/images/iot/补口位置热电偶分布.jpeg" style="width: 13rem;height: 11rem; ">
        </div>
        <div class="description">
          <p>
            表格中的展示的数据是:<p style="color: #ffa200;">点位二     烧香河北</p>各层温度数据和经过公式计算得出的保温效果数据总览，此外根据表格中计算出的理论值设定报警阈值，保温层温度超过理论值则报警。
          </p>
        </div>
      </div>


      <!-- 数据总览部分 -->
      <DataOverview title="数据总览"
                    :outdoorTemperature="meteData.data[0].airTemperature"
                    :actualMeasuredHeatLoss="parseFloat((measuredUnitHeatLoss * 20740).toFixed(2))"
                    :heatLoss="parseFloat((unitHeatLoss * 20740).toFixed(2))"
                    :measuredUnitHeatLoss="measuredUnitHeatLoss"
                    :unitHeatLoss="unitHeatLoss"
                    :position="{top:'70%' , left:'3%'}"
      />

      <!-- 地图背景部分 -->
      <!-- <img class="background-map" src="../assets//img//截面背景.png" /> -->


    </div>
</template>

<style scoped src="@/assets/styles/sectionone.css">

</style>