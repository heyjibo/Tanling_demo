<script lang="ts">
import {defineComponent} from 'vue'
import SensorBox from './SensorBox.vue';
import SectionData from './SectionData.vue';
import DisplacementSensor from './DisplacementSensor.vue';
import FlowingLine from './FlowingLine.vue';
import axios from 'axios';
import {ElMessage} from "element-plus";
import { Check, Close } from '@element-plus/icons-vue'

export default defineComponent({
  name: "Mainpage",
  computed: {
    Close() {
      return Close
    },
    Check() {
      return Check
    }
  },
  components: {
    SensorBox,
    SectionData,
    DisplacementSensor,
    FlowingLine,
    Check,   // 添加到组件注册中
    Close,
  },
  data(){
    return {
      interval: null as NodeJS.Timeout | null,
      // isDataLoaded: false,
      title: '智慧管道低温实时监测系统',
      tempTitle: '',
      isEditing: false,
      configId: 13,
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
        data: Array(8).fill({ displaceData: 0 })
      },
      thermData: {
        data: [
          { temperature: 0, pressure: 0, diffPressure: 0, flowTotalInteger: 0, flowNow: 0 },
        ]
      },
      thermPointData: {
        data: Array(14).fill({ temperature: 0, pressure: 0, diffPressure: 0, flowTotalInteger: 0, flowNow: 0 })
      }
    }
  },
  methods: {
    async fetchData() {
      try {
        const meteResponse = await axios.get('http://218.92.43.42:7072/lsgn/api/get/mete/list');
        this.meteData = meteResponse.data;

        const displaceResponse = await axios.get('http://218.92.43.42:7072/lsgn/api/get/displace/list');
        console.log(displaceResponse);
        const receivedDisplaceData = displaceResponse.data;

        for (let i = 0; i < receivedDisplaceData.data.length; i++) {
          const currentDisplaceValue = receivedDisplaceData.data[i].displaceData;
          console.log(currentDisplaceValue)
          if (currentDisplaceValue > 10000) {
            this.displaceData.data[i].displaceData = 226;
          }
        }

        const thermResponse = await axios.get('http://218.92.43.42:7072/lsgn/api/get/therm/list');
        this.thermData = thermResponse.data;

        const thermPointResponse = await axios.get('http://218.92.43.42:7072/lsgn/api/get/thermPoint/list');
        this.thermPointData = thermPointResponse.data;

        console.log('meteData:', this.meteData);
        console.log('displaceData:', this.displaceData);
        console.log('thermData:', this.thermData);
        console.log('thermPointData:', this.thermPointData);
        console.log('pressure:', this.thermPointData.data[0].pressure);

        // 数据加载完成
        // this.isDataLoaded = true;

      } catch (error) {
        console.error('数据获取失败:', error);
      }
    },
    // 双击编辑标题
    editTitle() {
      this.tempTitle = this.title;
      this.isEditing = true;
    },
    // 保存修改
    async saveTitle() {
      try {
        // 发送 PUT 请求保存项目标题
        const response = await axios.put(
            'http://218.92.43.42:7072/lsgn/api/project/config/update',
            {
              configId: this.configId,
              configValue: this.tempTitle,
            }
        );

        if (response.data.code === 0) {
          this.title = this.tempTitle;
          this.isEditing = false;
          ElMessage.success('标题保存成功！');
        } else {
          ElMessage.error('标题保存失败，请稍后再试！');
        }
      } catch (error) {
        console.error('保存标题时发生错误:', error);
        ElMessage.error('保存标题失败，请检查网络连接或稍后再试！');
      }
    },
    async fetchProjectTitle() {
      try {
        const response = await axios.get('http://218.92.43.42:7072/lsgn/api/project/config/getInfo?configKey=project_title');
        if (response.data.code === 0) {
          this.title = response.data.data.configValue;
          this.configId = response.data.data.configId;
          console.log("获取到标题:",response.data.data.configValue);
        } else {
          ElMessage.error('获取项目标题失败:', response.data.msg);
        }
      } catch (error) {
        ElMessage.error('请求标题失败，请检查网络连接或稍后再试！');
      }
    },
    cancelEdit() {
      this.isEditing = false;
    },
  },
  created() {
    this.fetchProjectTitle();
    this.fetchData();
    this.interval = setInterval(() => {
      this.fetchData();
    }, 60000);
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
})
</script>

<template>
  <!-- 地图背景和数据卡片 -->
  <div class="iot-map-container">

    <!-- 地图背景部分 -->
    <img class="iot-background-map" src="@/assets/images/iot/背景.png" />
    <!-- 顶部标题栏 -->
    <div class="iot-header-banner">
      <div style="margin-bottom: 0.1%;" @dblclick="editTitle" class="iot-title-container">
        <span v-if="!isEditing">{{ title }}</span>
        <div v-if="isEditing" class="iot-input-container">
          <el-input v-model="tempTitle" size="small" class="iot-title-input" />
          <div class="iot-button-container">
            <el-button size="small" :icon="Check" @click="saveTitle" circle type="success"></el-button>
            <el-button size="small" :icon="Close" @click="cancelEdit" circle type="danger"></el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 环境仪部分 -->
    <!-- 使用环境仪组件 -->
    <SensorBox
        title="环境仪1数据总览"
        :windSpeed="meteData.data[0].windSpeed"
        :windForce="meteData.data[0].windPower"
        :windDirection="meteData.data[0].windDirection"
        :airTemperature="meteData.data[0].airTemperature"
        :noise="meteData.data[0].noise"
        :co2Concentration="meteData.data[0].co2Concentration"
        :atmosphericPressure="meteData.data[0].atmoPressure"
        :rainfall="meteData.data[0].dailyRainfall"
        :rainSnowState="meteData.data[0].rainSnowState"
        :totalRadiation="meteData.data[0].totalRadiation"
        :dailyRainfall="meteData.data[0].dailyRainfall"
        :currentRainfall="meteData.data[0].currentRainfall"
        :position="{ top: '5%', left: '3%' }"
    />
    <SensorBox
        title="环境仪2数据总览"
        :windSpeed="2"
        :windForce="2"
        :windDirection="5"
        :airTemperature="0"
        :noise="28"
        :co2Concentration="0"
        :atmosphericPressure="103"
        :rainfall="0"
        :rainSnowState="0"
        :totalRadiation="0"
        :dailyRainfall="0"
        :currentRainfall="0"
        :position="{ top: '5%', right: '3%' }"
    />

    <!-- 截面总览部分 -->
    <!-- 使用截面总览组件 -->
    <SectionData
        title="截面1数据总览"
        :temperature1="thermPointData.data[1]?.temperature || 0"
        :temperature2="thermPointData.data[0]?.temperature || 0"
        :pressure1="thermPointData.data[1]?.pressure || 0"
        :pressure2="thermPointData.data[0]?.pressure || 0"
        :differentialPressure1="thermPointData.data[1]?.diffPressure || 0"
        :differentialPressure2="thermPointData.data[0]?.diffPressure || 0"
        :cumulativeFlow1="thermPointData.data[1]?.flowTotalInteger || 0"
        :cumulativeFlow2="thermPointData.data[0]?.flowTotalInteger || 0"
        :instantaneousFlow1="thermPointData.data[1]?.flowNow || 0"
        :instantaneousFlow2="thermPointData.data[0]?.flowNow || 0"
        :position="{ top: '65%', left: '3%' }"
    />
    <SectionData
        title="截面2数据总览"
        :temperature1="thermPointData.data[11]?.temperature || 0"
        :temperature2="thermPointData.data[10]?.temperature || 0"
        :pressure1="thermPointData.data[11]?.pressure || 0"
        :pressure2="thermPointData.data[10]?.pressure || 0"
        :differentialPressure1="thermPointData.data[11]?.diffPressure || 0"
        :differentialPressure2="thermPointData.data[10]?.diffPressure || 0"
        :cumulativeFlow1="thermPointData.data[11]?.flowTotalInteger || 0"
        :cumulativeFlow2="thermPointData.data[10]?.flowTotalInteger || 0"
        :instantaneousFlow1="thermPointData.data[11]?.flowNow || 0"
        :instantaneousFlow2="thermPointData.data[10]?.flowNow || 0"
        :position="{ top: '9%', left: '19%' }"
    />
    <SectionData
        title="截面3数据总览"
        :temperature1="thermPointData.data[13]?.temperature || 0"
        :temperature2="thermPointData.data[12]?.temperature || 0"
        :pressure1="thermPointData.data[13]?.pressure || 0"
        :pressure2="thermPointData.data[12].pressure || 0"
        :differentialPressure1="thermPointData.data[13]?.diffPressure || 0"
        :differentialPressure2="thermPointData.data[12]?.diffPressure || 0"
        :cumulativeFlow1="thermPointData.data[13]?.flowTotalInteger || 0"
        :cumulativeFlow2="thermPointData.data[12]?.flowTotalInteger || 0"
        :instantaneousFlow1="thermPointData.data[13]?.flowNow || 0"
        :instantaneousFlow2="thermPointData.data[12]?.flowNow || 0"
        :position="{ top: '9%', left: '53%' }"
    />
    <SectionData
        title="截面4数据总览"
        :temperature1="thermPointData.data[6]?.temperature || 0"
        :temperature2="thermPointData.data[9]?.temperature || 0"
        :pressure1="thermPointData.data[6]?.pressure || 0"
        :pressure2="thermPointData.data[9]?.pressure || 0"
        :differentialPressure1="thermPointData.data[6]?.diffPressure || 0"
        :differentialPressure2="thermPointData.data[9]?.diffPressure || 0"
        :cumulativeFlow1="thermPointData.data[6]?.flowTotalInteger || 0"
        :cumulativeFlow2="thermPointData.data[9]?.flowTotalInteger || 0"
        :instantaneousFlow1="thermPointData.data[6]?.flowNow || 0"
        :instantaneousFlow2="thermPointData.data[9]?.flowNow || 0"
        :position="{ top: '65%', left: '70%' }"
    />


    <!-- 位移传感器部分 -->
    <!-- 使用位移传感器组件 -->
    <DisplacementSensor
        title="位移传感器1"
        :displacement1= "269-displaceData.data[0].displaceData"
        :displacement2="378-displaceData.data[1].displaceData"
        :position="{ top: '54%', left: '5%' }"
    />
    <DisplacementSensor
        title="位移传感器2"
        :displacement1="1-displaceData.data[2].displaceData"
        :displacement2="221-displaceData.data[3].displaceData"
        :position="{ top: '54%', left: '20%' }"
    />
    <DisplacementSensor
        title="位移传感器3"
        :displacement1="237-displaceData.data[4].displaceData"
        :displacement2="348-displaceData.data[5].displaceData"
        :position="{ top: '54%', left: '50%' }"
    />
    <DisplacementSensor
        title="位移传感器4"
        :displacement1="357-displaceData.data[6].displaceData"
        :displacement2="268-displaceData.data[7].displaceData"
        :position="{ top: '54%', left: '70%' }"
    />

    <!-- 指示线段部分 -->
    <div class="line1"></div>
    <div class="line2"></div>
    <div class="line3"></div>
    <div class="line4"></div>
    <div class="line5"></div>
    <div class="line6"></div>
    <div class="line7"></div>
    <div class="line8"></div>

    <!-- 管道一代二代区分 -->
    <div class="tubetype1">
      <a>一代管</a>
    </div>
    <div class="tubetype2">
      <a>二代管</a>
    </div>


    <!-- 管道部分 -->
    <img class="start" src="@/assets/images/iot/开端锅炉.png">
    <img class="interface1" src="@/assets/images/iot/管道连接件.png">
    <img class="tube1" src="@/assets/images/iot/管道.png">
    <img class="turn1" src="@/assets/images/iot/管道左接下.png">
    <img class="turn2" src="@/assets/images/iot/管道左接下.png">
    <img class="tube2" src="@/assets/images/iot/管道.png">
    <img class="tube3" src="@/assets/images/iot/管道.png">
    <img class="interface2" src="@/assets/images/iot/管道连接件.png">
    <img class="tube4" src="@/assets/images/iot/管道.png">
    <img class="turn3" src="@/assets/images/iot/管道左接下.png">
    <img class="turn4" src="@/assets/images/iot/管道左接下.png">
    <img class="tube5" src="@/assets/images/iot/管道.png">
    <img class="interface3" src="@/assets/images/iot/管道连接件.png">
    <img class="tube6" src="@/assets/images/iot/管道.png">
    <img class="turn5" src="@/assets/images/iot/管道左接下.png">
    <!-- <img class="tube7" src="../assets//img//管道.png"> -->
    <img class="turn6" src="@/assets/images/iot/管道左接下.png">
    <img class="tube8" src="@/assets/images/iot/管道.png">
    <img class="tube9" src="@/assets/images/iot/管道.png">
    <img class="end" src="@/assets/images/iot/末端锅炉.png">

    <!-- 流动部分 -->
    <FlowingLine :lineCount="10" :delay="1" :position="{ top: 49, left: 2.50 }" :width="3" :height="8" :angle="100" :lineWidth="12" :speed="10"/>
    <FlowingLine :lineCount="6" :delay="1" :position="{ top: 51.5, left: 3.6 }" :width="1.5" :height="8" :angle="35" :lineWidth="12" :speed="10"/>
    <FlowingLine :lineCount="18" :delay="1" :position="{ top: 51, left: 5 }" :width="12" :height="8" :angle="-4.5" :lineWidth="12" :speed="15"/>
    <FlowingLine :lineCount="18" :delay="1" :position="{ top: 50.5, left: 17 }" :width="15.4" :height="8" :angle="0.5" :lineWidth="12" :speed="15"/>
    <FlowingLine :lineCount="18" :delay="1" :position="{ top: 50.2, left: 33 }" :width="20" :height="8" :angle="-1" :lineWidth="12" :speed="15"/>
    <FlowingLine :lineCount="6" :delay="1" :position="{ top: 50.7, left: 52.7  }" :width="1.7" :height="8" :angle="55" :lineWidth="12" :speed="10"/>
    <FlowingLine :lineCount="18" :delay="1" :position="{ top: 51.9, left: 54 }" :width="9.6" :height="8" :angle="1" :lineWidth="12" :speed="10"/>
    <FlowingLine :lineCount="18" :delay="1" :position="{ top: 51, left: 64.3 }" :width="21.3" :height="8" :angle="-3.5" :lineWidth="12" :speed="15"/>
    <FlowingLine :lineCount="18" :delay="1" :position="{ top: 50.5, left: 85.5 }" :width="1.6" :height="8" :angle="45" :lineWidth="12" :speed="10"/>
    <FlowingLine :lineCount="18" :delay="1" :position="{ top: 55.5, left: 85.6 }" :width="7" :height="8" :angle="47" :lineWidth="12" :speed="10"/>
    <FlowingLine :lineCount="18" :delay="1" :position="{ top: 60.4, left: 91.5 }" :width="4.5" :height="8" :angle="-2" :lineWidth="12" :speed="10" color="rgba(41, 189, 0, 0.4)"/>




  </div>
</template>

<style scoped>

</style>