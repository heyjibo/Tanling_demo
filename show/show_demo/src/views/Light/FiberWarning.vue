<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
    <div>
       <!-- 返回按钮 -->
      <div class="mb-6">
        <button 
          @click="$emit('back')"
          class="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors group"
        >
          <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回主页
        </button>
      </div>
      <!-- 标题与简介 -->
      <div class="mb-8"> 
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500"
        >  
        光纤传感预警系统</h1> 
        <p class="text-slate-400 mt-2"> ({{ currentDeviceType === 'boiler' ? '火电锅炉管道' : currentDeviceType === 'lng' ? 'LNG输送管线' : currentDeviceType === 'pressure' ? '压力容器区段' : '关键阀门区段' }})
        </p>
      </div>

      <!-- 顶部状态面板 -->
      <div class="status-panel">
        <div class="status-item">
          <span class="label">系统状态</span>
          <span class="value normal">运行正常</span>
          <span class="update-time">更新于 {{ updateTime }}</span>
        </div>
        <div class="status-item">
          <span class="label">监测点数</span>
          <span class="value">{{ totalMonitorPoints }}</span>
        </div>
        <div class="status-item">
          <span class="label">当前告警数</span>
          <span class="value alarm">{{ currentAlarmCount }}</span>
        </div>
        <div class="status-item">
          <span class="label">系统总告警数</span>
          <span class="value alarm">{{ totalSystemAlarms }}</span>
        </div>
        <div class="status-item">
          <span class="label">响应延迟</span>
          <span class="value">{{ responseDelay }}ms</span>
        </div>
      </div>

      <!-- GLB模型展示容器 -->
      <div class="mb-6">
        <div ref="modelContainer" class="glb-model-container w-full h-[300px] rounded-xl overflow-hidden border border-slate-700/50"></div>
      </div>

      <!-- 设备类型切换按钮组 -->
      <div class="device-switch w-full mb-6">
        <div class="relative bg-slate-800/40 rounded-2xl p-1 border border-slate-700/50 w-full">
          <div 
            class="absolute top-1 bottom-1 rounded-xl transition-all duration-500 ease-out"
            :class="[
              currentDeviceType === 'boiler' ? 'w-[calc(25%-0.5rem)] left-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30' :
              currentDeviceType === 'lng' ? 'w-[calc(25%-0.5rem)] left-[calc(25%+0.1875rem)] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30' :
              currentDeviceType === 'pressure' ? 'w-[calc(25%-0.5rem)] left-[calc(50%+0.375rem)] bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30' :
              'w-[calc(25%-0.5rem)] left-[calc(75%+0.5625rem)] bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
            ]"
          ></div>
          <div class="relative z-10 grid grid-cols-4 gap-1">
            <button
              v-for="device in deviceTypeItems"
              :key="device.value"
              @click="switchDeviceType(device.value)"
              class="py-4 px-2 rounded-xl text-center transition-all duration-300 group w-full"
              :class="currentDeviceType === device.value ? 'text-white' : 'text-slate-400 hover:text-slate-200'"
            >
              <div class="flex flex-col items-center">
                <span class="text-2xl mb-2">{{ device.icon }}</span>
                <span class="font-medium text-sm">{{ device.label }}</span>
                <div v-if="currentDeviceType === device.value" class="w-1.5 h-1.5 rounded-full mt-2 animate-pulse" :class="device.dotClass"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 监测维度切换 -->
      <div class="dimension-tabs">
        <button 
          v-for="dim in dimensions" 
          :key="dim.key"
          class="dim-tab"
          :class="{ active: activeDimension === dim.key }"
          @click="switchDimension(dim.key)"
        >
          <span class="icon">{{ dim.icon }}</span>
          <span class="name">{{ dim.name }}</span>
        </button>
      </div>

      <!-- 管道区域 -->
      <div class="pipeline-wrap">
        <div class="pipeline-shell">
          <div class="pipeline-inner">
            <div
              v-for="fiber in visibleFibers"
              :key="fiber.id"
              class="fiber-track"
              :class="{ active: fiber.id === activeFiberId, 'has-alarm': fiber.hasAlarm }"
              :style="{ top: fiber.top + 'px' }"
              @click="selectFiber(fiber.id)"
              @mousemove="onFiberMove($event, fiber)"
              @mouseleave="hideHoverPoint"
            >
              <span class="fiber-label">{{ fiber.name }}</span>
              <div class="fiber-core" :style="{ background: getFiberGradient(fiber) }"></div>
              <div
                v-if="hover.visible && hover.fiberId === fiber.id"
                class="hover-point"
                :class="{ alarm: hover.isAlarm }"
                :style="{ left: hover.x + 'px' }"
              >
                <div class="popover-content">
                  <span class="idx">#{{ hover.index + 1 }}</span>
                  <span class="val">{{ hover.value }}{{ dimensionUnit }}</span>
                  <span v-if="hover.isAlarm" class="alarm-tag">告警</span>
                </div>
              </div>
            </div>
          </div>
          <div class="shine-overlay"></div>
        </div>
        <div class="fiber-controls">
          <button class="ctrl-btn up" @click="prevGroup" :disabled="startIndex === 0">
            <i class="arrow"></i>
          </button>
          <button class="ctrl-btn down" @click="nextGroup" :disabled="startIndex >= FIBER_COUNT - VIEW_SIZE">
            <i class="arrow"></i>
          </button>
        </div>
      </div>

      <!-- 双图表区域 -->
      <div class="charts-container">
        <div ref="chartRef" class="chart-item main-chart"></div>
        <div ref="subChartRef" class="chart-item sub-chart"></div>
      </div>

      <!-- ==================== 新增：AI智能预警展示区域 ==================== -->
      <div class="prediction-panel mb-6" v-if="predictionList.length > 0">
        <div class="prediction-header">
          <div class="flex items-center gap-2">
            <span class="animate-pulse text-amber-500 text-xl">⚡</span>
            <h3 class="text-amber-500 font-bold text-base">AI 趋势预测 & 风险预警</h3>
          </div>
          <span class="text-slate-400 text-xs">基于线性回归分析预测未来1小时风险</span>
        </div>
        
        <div class="grid grid-cols-1 gap-3">
          <div 
            v-for="pred in predictionList" 
            :key="pred.id"
            class="prediction-card group"
            :class="{'dispatched': pred.status === 'dispatched'}"
          >
            <!-- 预警图标 -->
            <div class="pred-icon-box">
              <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <!-- 预警内容 -->
            <div class="flex-1">
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-slate-200 text-sm">{{ pred.fiberName }} - {{ pred.section }}</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                  风险概率: {{ pred.probability }}%
                </span>
              </div>
              
              <div class="flex items-center gap-4 text-xs">
                <span class="text-slate-400">异常类型: <span class="text-amber-400">{{ pred.type }}</span></span>
                <span class="text-slate-400">预计事故发生: <span class="text-red-400 font-bold text-sm">{{ pred.timeToFail }}</span> 后</span>
              </div>
              
              <!-- 进度条模拟风险值 -->
              <div class="w-full bg-slate-700/50 h-1.5 mt-2 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000" :style="{ width: pred.riskLevel + '%' }"></div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center ml-4 border-l border-slate-700 pl-4">
              <button 
                v-if="pred.status === 'pending'"
                @click="sendWorkOrder(pred)"
                class="flex flex-col items-center justify-center gap-1 text-xs text-amber-500 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                派发工单
              </button>
              <div v-else class="flex flex-col items-center justify-center gap-1 text-xs text-emerald-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>已派单</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="prediction-panel mb-6 flex items-center justify-center h-[80px] text-slate-500 text-sm">
        <span class="mr-2">✅</span> AI 智能分析中，暂无高风险趋势
      </div>
      <!-- ==================== 结束新增区域 ==================== -->

      <!-- 告警列表 -->
      <div class="alarm-list">
        <div class="alarm-list-header">
          <h4>实时告警列表 <span class="count">({{ alarmList.length }})</span></h4>
          <button class="clear-alarm" @click="clearAlarms">清空已处理</button>
        </div>
        <div class="alarm-items">
          <div v-for="alarm in alarmList" :key="alarm.id" class="alarm-item">
            <span class="alarm-type">{{ alarm.type }}</span>
            <span class="alarm-position">{{ alarm.position }}</span>
            <span class="alarm-value">{{ alarm.value }}{{ dimensionUnit }}</span>
          <span class="alarm-time">{{ alarm.time }}</span>
          <el-button size="small" type="primary" @click="handleAlarm(alarm.id)">处理</el-button>
          </div>
          <div v-if="alarmList.length === 0" class="empty-alarm">暂无告警</div>
        </div>
      </div>

      <!-- 温度异常处理弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        title="温度异常处理"
        width="400px"
        :close-on-click-modal="false"
      >
        <div v-if="currentHandleAlarm" class="alarm-handle-content">
          <p>告警位置：{{ currentHandleAlarm.position }}</p>
          <p>当前温度：{{ currentHandleAlarm.value }}℃</p>
          <p class="mt-2">请选择处理方式：</p>
          <el-radio-group v-model="handleType" class="mt-2">
            <el-radio-button label="保温">保温</el-radio-button>
            <el-radio-button label="保冷">保冷</el-radio-button>
          </el-radio-group>
        </div>
        <template #footer>
          <el-button @click="cancelHandleAlarm">取消</el-button>
          <el-button type="primary" @click="confirmHandleAlarm" :disabled="!handleType">确认处理</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import GlassCard from '@/components/Common/GlassCard.vue';
// 引入 Notification 用于工单提示
import { ElMessage, ElNotification, ElDialog, ElRadioGroup, ElRadioButton, ElButton } from 'element-plus';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ===============================
   配置与类型定义
=============================== */
const FIBER_COUNT = 10;     // 光纤数量
const VIEW_SIZE = 3;        // 可视区域显示数量
const POINT_COUNT = 40;     // 每根光纤检测点数
// 多维度阈值配置
const THRESHOLDS = {
  temperature: { min: 20, max: 90, alarmDiff: 15, highValue: 75 }, // 温度：℃
  strain: { min: 0, max: 500, alarmDiff: 50, highValue: 350 },    // 应变：με
  vibration: { min: 0, max: 100, alarmDiff: 20, highValue: 70 }   // 振动：mm/s
};
const INIT_STEP_MAX = 4;    // 初始生成时：相邻点差值不超过4
const SIM_STEP_MAX = 5;     // 动态模拟时：单次变化不超过5

// 设备类型与维度定义
type DeviceType = 'boiler' | 'lng' | 'pressure' | 'valve';
type DimensionType = 'temperature' | 'strain' | 'vibration';

interface Dimension {
  key: DimensionType;
  name: string;
  icon: string;
  unit: string;
}

interface FiberData {
  id: number;
  name: string;
  // 多维度数据
  temperature: number[];
  strain: number[];
  vibration: number[];
  // 多维度告警
  alarms: Record<DimensionType, boolean[]>;
  hasAlarm: boolean;
}

interface AlarmItem {
  id: number;
  type: string;
  position: string;
  value: number;
  time: string;
  fiberId: number;
  pointIndex: number;
}

// 新增：预测项接口
interface PredictionItem {
  id: string;
  fiberId: number;
  fiberName: string;
  section: string;
  type: string; // "持续升温", "应力累积", "频发震颤"
  probability: number; // 0-100
  timeToFail: string; // "xx分xx秒"
  riskLevel: number; // 0-100 进度条
  status: 'pending' | 'dispatched';
}

// 新增设备类型配置项（和原有逻辑联动）
const deviceTypeItems = ref([
  { 
    value: 'boiler', 
    label: '火电锅炉管道', 
    icon: '🔥', 
    dotClass: 'bg-red-500' 
  },
  { 
    value: 'lng', 
    label: 'LNG输送管线', 
    icon: '🧊', 
    dotClass: 'bg-blue-500' 
  },
  { 
    value: 'pressure', 
    label: '压力容器区段', 
    icon: '⚡', 
    dotClass: 'bg-purple-500' 
  },
  { 
    value: 'valve', 
    label: '关键阀门区段', 
    icon: '🔧', 
    dotClass: 'bg-green-500' 
  }
]);

/* ===============================
   核心状态管理
=============================== */
// 设备与维度切换
const currentDeviceType = ref<DeviceType>('boiler');
const activeDimension = ref<DimensionType>('temperature');
const dimensions = ref<Dimension[]>([
  { key: 'temperature', name: '温度监测', icon: '🌡️', unit: '℃' },
  { key: 'strain', name: '应变监测', icon: '📏', unit: 'με' },
  { key: 'vibration', name: '振动监测', icon: '🔴', unit: 'mm/s' }
]);

// 核心数据
const fibers = ref<FiberData[]>([]);
const alarmList = ref<AlarmItem[]>([]);
// 新增：预测列表状态
const predictionList = ref<PredictionItem[]>([]);

const startIndex = ref(0);
const activeFiberId = ref(1);
const hover = ref({
  visible: false,
  fiberId: 0,
  index: 0,
  x: 0,
  value: 0,
  isAlarm: false
});
let simulationTimer: any = null;
let chart: echarts.ECharts;
let subChart: echarts.ECharts;

// 状态面板数据
const updateTime = ref('');
const totalMonitorPoints = computed(() => FIBER_COUNT * POINT_COUNT);
const currentAlarmCount = computed(() => alarmList.value.length);
// 告警处理弹窗相关
const dialogVisible = ref(false);
const currentHandleAlarm = ref<AlarmItem | null>(null);
const handleType = ref(''); // 保温/保冷
// 定义响应延迟的正常范围
const RESPONSE_DELAY_MIN = 60;
const RESPONSE_DELAY_MAX = 100;

// 初始化：在范围内生成随机初始值
const responseDelay = ref(
  Math.floor(Math.random() * (RESPONSE_DELAY_MAX - RESPONSE_DELAY_MIN + 1)) + RESPONSE_DELAY_MIN
);

// 可选：定时小幅波动
let delayTimer: any = null;
function updateResponseDelay() {
  const fluctuation = Math.floor(Math.random() * 11) - 5; 
  let newDelay = responseDelay.value + fluctuation;
  newDelay = Math.max(RESPONSE_DELAY_MIN, Math.min(RESPONSE_DELAY_MAX, newDelay));
  responseDelay.value = newDelay;
  delayTimer = setTimeout(updateResponseDelay, 5000);
}

onMounted(() => {
  updateResponseDelay();
});

onUnmounted(() => {
  clearTimeout(delayTimer);
  if (simulationTimer) clearTimeout(simulationTimer);
});

// 系统总告警数
const totalSystemAlarms = computed(() => {
  if (fibers.value.length === 0) return 0;
  let total = 0;
  fibers.value.forEach(fiber => {
    Object.keys(fiber.alarms).forEach(dimKey => {
      const dim = dimKey as DimensionType;
      total += fiber.alarms[dim].filter(Boolean).length;
    });
  });
  return total;
});

/* ===============================
   GLB模型相关变量
=============================== */
const modelContainer = ref<HTMLDivElement>();
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let model: THREE.Object3D | null = null;
let animationId: number | null = null;

function initGLBScene() {
  if (!modelContainer.value) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e293b);

  camera = new THREE.PerspectiveCamera(60, modelContainer.value.clientWidth / modelContainer.value.clientHeight, 0.001, 10000);
  camera.position.set(3, 2, 0); 
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance" as const
  });
  renderer.setSize(modelContainer.value.clientWidth, modelContainer.value.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  modelContainer.value.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(10, 8, 3);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  const directionalLight2 = new THREE.DirectionalLight(0xaaaaaa, 0.8);
  directionalLight2.position.set(3, 5, -2);
  scene.add(directionalLight2);

  if (camera && renderer) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);
    controls.update();
  }

  const loader = new GLTFLoader();
  loader.load(
    '/src/assets/3D/factory.glb',
    (gltf) => {
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 130;
      const scaleRatio = targetSize / maxDim;
      
      model.scale.set(scaleRatio, scaleRatio, scaleRatio);
      box.setFromObject(model);
      box.getCenter(center);
      box.getSize(size);
      model.position.sub(center);
      
      const fitDistance = size.length() * 0.8;
      const safeDistance = Math.max(fitDistance, controls?.minDistance || 1.0);
      
      if (camera) {
        camera.position.set(safeDistance * 0.8, safeDistance * 0.2, 0); 
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      }
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
      scene?.add(model);
    },
    (xhr) => {
      console.log(`GLB模型加载进度: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    (error: unknown) => {
      const errorMsg = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : '未知错误';
      console.error('GLB模型加载失败:', error);
      ElMessage.error(`3D模型加载失败: ${errorMsg || '请检查模型文件是否存在或格式正确'}`);
    }
  );

  function animate() {
    animationId = requestAnimationFrame(animate);
    controls?.update();
    if (scene && camera && renderer) {
      renderer.render(scene, camera);
    }
  }
  animate();

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  if (!modelContainer.value || !camera || !renderer) return;

  camera.aspect = modelContainer.value.clientWidth / modelContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(modelContainer.value.clientWidth, modelContainer.value.clientHeight);
  
  if (model && camera && controls) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const fitDistance = size.length() * 0.8;
    const safeDistance = Math.max(fitDistance, controls.minDistance || 1.0);
    
    camera.position.set(safeDistance * 0.8, safeDistance * 0.2, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    controls.update();
  }
}

function disposeGLBScene() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (controls) {
    controls.dispose();
    controls = null;
  }
  if (model && scene) {
    scene.remove(model);
    model = null;
  }
  if (renderer) {
    if (modelContainer.value && renderer.domElement) {
      modelContainer.value.removeChild(renderer.domElement);
    }
    renderer.dispose();
    renderer = null;
  }
  scene = null;
  camera = null;
  window.removeEventListener('resize', onWindowResize);
}

/* ===============================
   数据生成与更新逻辑
=============================== */
// 生成初始数据
function initData() {
  const now = new Date();
  updateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  fibers.value = Array.from({ length: FIBER_COUNT }, (_, i) => {
    const baseTemp = currentDeviceType.value === 'boiler' ? 50 : currentDeviceType.value === 'lng' ? -10 : 25;
    const baseStrain = currentDeviceType.value === 'pressure' ? 200 : 100;
    const baseVibration = currentDeviceType.value === 'valve' ? 30 : 10;

    const temperature = generateDimensionData(baseTemp, THRESHOLDS.temperature);
    const strain = generateDimensionData(baseStrain, THRESHOLDS.strain);
    const vibration = generateDimensionData(baseVibration, THRESHOLDS.vibration);

    const alarms = {
      temperature: analyzeDimensionAlarm(temperature, THRESHOLDS.temperature),
      strain: analyzeDimensionAlarm(strain, THRESHOLDS.strain),
      vibration: analyzeDimensionAlarm(vibration, THRESHOLDS.vibration)
    };

    const hasAlarm = [
      ...alarms.temperature,
      ...alarms.strain,
      ...alarms.vibration
    ].includes(true);

    return {
      id: i + 1,
      name: `${currentDeviceType.value === 'boiler' ? '锅炉' : currentDeviceType.value === 'lng' ? 'LNG管线' : currentDeviceType.value === 'pressure' ? '压力容器' : '阀门'}-Loop${String(i + 1).padStart(2, '0')}`,
      temperature,
      strain,
      vibration,
      alarms,
      hasAlarm
    };
  });

  generateAlarmList();
  analyzePredictions(); // 新增：初始化时进行一次预测
}

// 生成单维度数据
function generateDimensionData(baseValue: number, thresholds: any) {
  const data: number[] = [];
  let currentValue = Math.floor(baseValue + Math.random() * 30);
  
  for (let j = 0; j < POINT_COUNT; j++) {
    data.push(currentValue);
    const change = Math.floor(Math.random() * (INIT_STEP_MAX * 2 + 1)) - INIT_STEP_MAX;
    currentValue += change;
    if (currentValue < thresholds.min) currentValue = thresholds.min;
    if (currentValue > thresholds.max) currentValue = thresholds.max;
  }
  return data;
}

// 分析单维度告警
function analyzeDimensionAlarm(data: number[], thresholds: any) {
  return data.map((val, i) => {
    const prev = data[i - 1] ?? val;
    const next = data[i + 1] ?? val;
    const diffPrev = Math.abs(val - prev);
    const diffNext = Math.abs(val - next);
    return diffPrev > thresholds.alarmDiff || diffNext > thresholds.alarmDiff || val > thresholds.highValue;
  });
}

// 生成告警列表
function generateAlarmList() {
  alarmList.value = [];
  let alarmId = 1;
  
  fibers.value.forEach(fiber => {
    const dimAlarms = fiber.alarms[activeDimension.value];
    dimAlarms.forEach((isAlarm, index) => {
      if (isAlarm) {
        alarmList.value.push({
          id: alarmId++,
          type: `${activeDimension.value === 'temperature' ? '温差异常' : activeDimension.value === 'strain' ? '应变突变' : '振动超限'}`,
          position: `${fiber.name}-检测点#${index + 1}`,
          value: fiber[activeDimension.value][index],
          time: updateTime.value,
          fiberId: fiber.id,
          pointIndex: index
        });
      }
    });
  });
}

/* ===============================
   新增：AI预测分析逻辑
=============================== */
function analyzePredictions() {
  // 1. 清理已不存在风险的条目（只保留状态为 dispatched 的）
  //    这里为了演示，简单地每次重新计算 pending 状态的
  const currentDispatched = predictionList.value.filter(p => p.status === 'dispatched');
  const newPredictions: PredictionItem[] = [];

  fibers.value.forEach(fiber => {
    // 简化的趋势分析逻辑：
    // 获取当前维度数据
    const data = fiber[activeDimension.value];
    const threshold = THRESHOLDS[activeDimension.value].highValue; // 使用高位阈值作为警戒线
    const maxVal = THRESHOLDS[activeDimension.value].max; // 绝对上限
    
    // 找出增长最快的点（简单的斜率计算）
    let maxSlope = 0;
    let maxSlopeIndex = -1;
    let currentVal = 0;

    for(let i=1; i<data.length; i++) {
      const slope = data[i] - data[i-1];
      if (slope > 0 && data[i] > threshold * 0.8) { // 只关注处于高位且在增长的点
         if(slope > maxSlope) {
           maxSlope = slope;
           maxSlopeIndex = i;
           currentVal = data[i];
         }
      }
    }

    // 如果存在高风险趋势点
    if (maxSlopeIndex !== -1 && maxSlope >= 2) { // 阈值判定：斜率>=2 且数值在高位
      // 检查是否已经在 dispatched 列表中
      const exists = currentDispatched.find(p => p.fiberId === fiber.id && p.section.includes(`#${maxSlopeIndex + 1}`));
      if(exists) {
        newPredictions.push(exists);
        return;
      }

      // 计算剩余时间：(最大值 - 当前值) / (斜率 * 模拟频率因子)
      // 假设模拟每15秒更新一次，斜率为每次增加的值
      const remainingValue = maxVal - currentVal;
      const stepsToFail = remainingValue / maxSlope;
      const secondsToFail = Math.floor(stepsToFail * 15); // 假设15s更新一次
      
      const minutes = Math.floor(secondsToFail / 60);
      const seconds = secondsToFail % 60;
      const timeStr = `${minutes > 0 ? minutes + '分' : ''}${seconds}秒`;

      // 风险概率
      const probability = Math.min(99, Math.floor(70 + (currentVal / maxVal) * 25));
      
      newPredictions.push({
        id: `pred-${fiber.id}-${maxSlopeIndex}`,
        fiberId: fiber.id,
        fiberName: fiber.name,
        section: `检测点#${maxSlopeIndex + 1}`,
        type: activeDimension.value === 'temperature' ? '持续升温' : activeDimension.value === 'strain' ? '应力累积' : '频发震颤',
        probability,
        timeToFail: timeStr,
        riskLevel: probability,
        status: 'pending'
      });
    }
  });

  // 合并结果
  predictionList.value = [...currentDispatched, ...newPredictions];
}

// 发送工单逻辑
function sendWorkOrder(pred: PredictionItem) {
  pred.status = 'dispatched';
  const orderId = 'WO-' + Date.now().toString().slice(-6);
  
  ElNotification({
    title: '工单派发成功',
    message: `工单号：${orderId}
已通知运维组前往【${pred.fiberName} ${pred.section}】核查风险。`,
    type: 'success',
    duration: 4000
  });
}

// 模拟数据更新
function updateSimulation() {
  const nextDelay = Math.floor(15000 + Math.random() * 15000);
  
  fibers.value = fibers.value.map(fiber => {
    const temperature = updateDimensionData(fiber.temperature, THRESHOLDS.temperature);
    const strain = updateDimensionData(fiber.strain, THRESHOLDS.strain);
    const vibration = updateDimensionData(fiber.vibration, THRESHOLDS.vibration);

    const alarms = {
      temperature: analyzeDimensionAlarm(temperature, THRESHOLDS.temperature),
      strain: analyzeDimensionAlarm(strain, THRESHOLDS.strain),
      vibration: analyzeDimensionAlarm(vibration, THRESHOLDS.vibration)
    };

    const hasAlarm = [
      ...alarms.temperature,
      ...alarms.strain,
      ...alarms.vibration
    ].includes(true);

    return { ...fiber, temperature, strain, vibration, alarms, hasAlarm };
  });

  const now = new Date();
  updateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  generateAlarmList();
  
  // 新增：每次数据更新后，重新分析预测
  analyzePredictions();

  renderChart(activeFiberId.value);
  renderSubChart(activeFiberId.value);

  simulationTimer = setTimeout(updateSimulation, nextDelay);
}

// 更新单维度数据
function updateDimensionData(oldData: number[], thresholds: any) {
  return oldData.map(val => {
    const change = Math.floor(Math.random() * (SIM_STEP_MAX * 2 + 1)) - SIM_STEP_MAX;
    let newVal = val + change;
    if (newVal < thresholds.min) newVal = thresholds.min;
    if (newVal > thresholds.max) newVal = thresholds.max;
    return newVal;
  });
}

/* ===============================
   视觉与交互逻辑
=============================== */
// 维度切换
function switchDimension(dim: DimensionType) {
  activeDimension.value = dim;
  generateAlarmList();
  analyzePredictions(); // 切换维度时重新分析预测
  renderChart(activeFiberId.value);
  renderSubChart(activeFiberId.value);
}

// 设备类型切换
const switchDeviceType = (value: string) => {
  currentDeviceType.value = value as 'boiler' | 'lng' | 'pressure' | 'valve';
  initData();
  renderChart(activeFiberId.value);
  renderSubChart(activeFiberId.value);
};

// 光纤渐变样式
function getFiberGradient(fiber: FiberData) {
  const thresholds = THRESHOLDS[activeDimension.value];
  const values = fiber[activeDimension.value];
  const alarms = fiber.alarms[activeDimension.value];
  
  const stops = values.map((val, i) => {
    const pct = (i / (POINT_COUNT - 1)) * 100;
    let color = 'rgba(56, 189, 248, 0.4)'; 
    
    if (alarms[i]) {
      color = '#ef4444'; 
    } else if (val > thresholds.highValue) {
      color = '#fbbf24'; 
    }
    
    return `${color} ${pct}%`;
  });
  
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}

const visibleFibers = computed(() =>
  fibers.value
    .slice(startIndex.value, startIndex.value + VIEW_SIZE)
    .map((fiber, idx) => ({
      ...fiber,
      top: 15 + idx * 32
    }))
);

function prevGroup() {
  startIndex.value = Math.max(0, startIndex.value - 1);
}

function nextGroup() {
  startIndex.value = Math.min(FIBER_COUNT - VIEW_SIZE, startIndex.value + 1);
}

const dimensionUnit = computed(() => {
  const dim = dimensions.value.find(d => d.key === activeDimension.value);
  return dim ? dim.unit : '';
});

function onFiberMove(e: MouseEvent, fiber: FiberData) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const rawX = e.clientX - rect.left;
  const ratio = rawX / rect.width;
  const index = Math.min(POINT_COUNT - 1, Math.max(0, Math.floor(ratio * POINT_COUNT)));

  hover.value = {
    visible: true,
    fiberId: fiber.id,
    index,
    x: rawX,
    value: fiber[activeDimension.value][index],
    isAlarm: fiber.alarms[activeDimension.value][index]
  };
}

function hideHoverPoint() {
  hover.value.visible = false;
}

function handleAlarm(alarmId: number) {
  const alarm = alarmList.value.find(item => item.id === alarmId);
  if (alarm && alarm.type === '温差异常') { 
    currentHandleAlarm.value = alarm;
    const tempThreshold = THRESHOLDS.temperature;
    if (alarm.value < tempThreshold.min + (tempThreshold.max - tempThreshold.min) / 2) {
      handleType.value = '保温';
    } else {
      handleType.value = '保冷';
    }
    dialogVisible.value = true;
  } else {
    alarmList.value = alarmList.value.filter(item => item.id !== alarmId);
    ElMessage.success('告警已处理');
  }
}

function confirmHandleAlarm() {
  if (!currentHandleAlarm.value) return;
  alarmList.value = alarmList.value.filter(item => item.id !== currentHandleAlarm.value!.id);
  ElMessage.success(`已对【${currentHandleAlarm.value.position}】执行${handleType.value}处理`);
  dialogVisible.value = false;
  currentHandleAlarm.value = null;
  handleType.value = '';
}

function cancelHandleAlarm() {
  dialogVisible.value = false;
  currentHandleAlarm.value = null;
  handleType.value = '';
}

function clearAlarms() {
  alarmList.value = [];
  ElMessage.success('已清空所有已处理告警');
}

/* ===============================
   图表逻辑
=============================== */
const chartRef = ref<HTMLDivElement>();
const subChartRef = ref<HTMLDivElement>();

function selectFiber(id: number) {
  activeFiberId.value = id;
  renderChart(id);
  renderSubChart(id);
}

function renderChart(fiberId: number) {
  if (!chartRef.value) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
    window.addEventListener('resize', () => chart.resize());
  }
  
  const fiber = fibers.value.find(f => f.id === fiberId);
  if (!fiber) return;

  const thresholds = THRESHOLDS[activeDimension.value];
  const xData = fiber[activeDimension.value].map((_, i) => i + 1);
  const seriesData = fiber[activeDimension.value].map((val, i) => ({
    value: val,
    itemStyle: fiber.alarms[activeDimension.value][i] ? { 
      color: '#ef4444', 
      borderColor: '#fff', 
      borderWidth: 2 
    } : { color: '#38bdf8' },
    symbolSize: fiber.alarms[activeDimension.value][i] ? 8 : 3,
  }));

  const option: echarts.EChartsOption = {
    title: {
      text: `${fiber.name}-${activeDimension.value === 'temperature' ? '温度' : activeDimension.value === 'strain' ? '应变' : '振动'}曲线`,
      textStyle: { color: '#94a3b8', fontSize: 12 },
      left: 'center',
      top: 0
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(2, 6, 23, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any) => {
        const p = params[0];
        const isAlarm = fiber.alarms[activeDimension.value][p.dataIndex];
        const statusStr = isAlarm ? '<span style="color:#ef4444;font-weight:bold">异常</span>' : '正常';
        return `检测点 #${p.axisValue}<br/>
                ${activeDimension.value === 'temperature' ? '温度' : activeDimension.value === 'strain' ? '应变' : '振动'}：${p.data.value} ${dimensionUnit.value}<br/>
                状态：${statusStr}`;
      }
    },
    grid: { left: 45, right: 20, top: 50, bottom: 5, containLabel: false },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: thresholds.min,
      max: thresholds.max,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      name: dimensionUnit.value,
      nameTextStyle: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        name: activeDimension.value === 'temperature' ? '温度' : activeDimension.value === 'strain' ? '应变' : '振动',
        type: 'line',
        step: 'middle',
        smooth: false,
        data: seriesData,
        lineStyle: { width: 2, color: '#38bdf8' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 189, 248, 0.25)' },
            { offset: 1, color: 'rgba(56, 189, 248, 0.0)' }
          ])
        }
      }
    ]
  };

  chart.setOption(option);
}

function renderSubChart(fiberId: number) {
  if (!subChartRef.value) return;
  if (!subChart) {
    subChart = echarts.init(subChartRef.value);
    window.addEventListener('resize', () => subChart.resize());
  }
  
  const fiber = fibers.value.find(f => f.id === fiberId);
  if (!fiber) return;

  const xData = fiber.temperature.map((_, i) => i + 1);
  const normalize = (data: number[], thresholds: any) => 
    data.map(val => ((val - thresholds.min) / (thresholds.max - thresholds.min)) * 100);

  const option: echarts.EChartsOption = {
    title: {
      text: '多维度归一化对比',
      textStyle: { color: '#94a3b8', fontSize: 12 },
      left: 'center',
      top: 0
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(2, 6, 23, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' }
    },
    grid: { left: 45, right: 20, top: 50, bottom: 5, containLabel: false },
    legend: {
      data: ['温度', '应变', '振动'],
      textStyle: { color: '#94a3b8', fontSize: 10 },
      top: 20,
      right: 10
    },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      name: '归一化值',
      nameTextStyle: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        smooth: true,
        data: normalize(fiber.temperature, THRESHOLDS.temperature),
        lineStyle: { width: 2, color: '#38bdf8' },
        showSymbol: false
      },
      {
        name: '应变',
        type: 'line',
        smooth: true,
        data: normalize(fiber.strain, THRESHOLDS.strain),
        lineStyle: { width: 2, color: '#10b981' },
        showSymbol: false
      },
      {
        name: '振动',
        type: 'line',
        smooth: true,
        data: normalize(fiber.vibration, THRESHOLDS.vibration),
        lineStyle: { width: 2, color: '#f59e0b' },
        showSymbol: false
      }
    ]
  };

  subChart.setOption(option);
}

onMounted(() => {
  initData();
  
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    renderChart(activeFiberId.value);
  }
  
  if (subChartRef.value) {
    subChart = echarts.init(subChartRef.value);
    renderSubChart(activeFiberId.value);
  }

  window.addEventListener('resize', () => {
    chart && chart.resize();
    subChart && subChart.resize();
  });

  updateSimulation();
  initGLBScene();
});

onUnmounted(() => {
  clearTimeout(simulationTimer);
  window.removeEventListener('resize', () => {
    chart && chart.resize();
    subChart && subChart.resize();
  });
  chart && chart.dispose();
  subChart && subChart.dispose();
  disposeGLBScene();
});

watch(activeDimension, () => {
  fibers.value = [...fibers.value];
});
</script>

<style scoped>
/* 原有样式保留 */
.status-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 70px;
  margin-bottom: 12px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 4px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-item .label {
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.status-item .value {
  font-size: 14px;
  font-weight: bold;
}

.status-item .value.normal {
  color: #10b981;
}

.status-item .value.alarm {
  color: #ef4444;
}

.status-item .update-time {
  font-size: 9px;
  color: #64748b;
  margin-top: 2px;
}

.device-switch {
  margin-top: 16px;
}

.dimension-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.dim-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.dim-tab.active {
  background: rgba(56, 189, 248, 0.1);
  border-color: #38bdf8;
  color: #38bdf8;
}

.dim-tab:hover:not(.active) {
  background: #1e293b;
  color: #fff;
}

.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.chart-item {
  height: 220px;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 4px;
  margin-top: 10px;
}

.alarm-list {
  margin-top: 16px;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
  padding-top: 12px;
}

.alarm-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.alarm-list-header h4 {
  font-size: 14px;
  color: #e2e8f0;
  margin: 0;
}

.alarm-list-header .count {
  color: #ef4444;
  font-size: 12px;
}

.clear-alarm {
  font-size: 10px;
  padding: 2px 8px;
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
}

.alarm-items {
  max-height: 180px;
  overflow-y: auto;
}

.alarm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  margin-bottom: 4px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
  border-left: 3px solid #ef4444;
  font-size: 12px;
}

.alarm-type {
  color: #ef4444;
  font-weight: bold;
  min-width: 60px;
}

.alarm-position {
  color: #94a3b8;
  flex: 1;
  margin: 0 8px;
}

.alarm-value {
  color: #fbbf24;
  min-width: 40px;
  text-align: right;
}

.alarm-time {
  color: #64748b;
  min-width: 60px;
  text-align: right;
  margin: 0 8px;
}

.empty-alarm {
  text-align: center;
  padding: 16px;
  color: #64748b;
  font-size: 12px;
}

.popover-content .alarm-tag {
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  padding: 0 2px;
  font-size: 8px;
  margin-left: 4px;
}

.pipeline-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 16px;
  height: 110px;
}

.pipeline-shell {
  flex: 1;
  position: relative;
  height: 100%;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 1) 50%, rgba(30, 41, 59, 0.9) 100%);
  border-radius: 8px;
  border: 1px solid #334155;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}

.pipeline-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.shine-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
  border-radius: 8px 8px 0 0;
}

.fiber-track {
  position: absolute;
  left: 16px;
  right: 16px;
  height: 22px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 8px;
  border-radius: 4px;
}

.fiber-track:hover {
  background: rgba(255, 255, 255, 0.05);
}

.fiber-track.active {
  background: rgba(56, 189, 248, 0.1);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.3);
}

.fiber-label {
  width: 100px;
  font-size: 12px;
  color: #94a3b8;
  font-family: 'DIN Alternate', monospace;
  white-space: nowrap;
}

.active .fiber-label {
  color: #38bdf8;
  text-shadow: 0 0 5px rgba(56, 189, 248, 0.5);
}

.fiber-core {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #1e293b;
  position: relative;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  transition: opacity 0.3s;
}

.has-alarm .fiber-core {
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 4px rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.9); }
  100% { box-shadow: 0 0 4px rgba(239, 68, 68, 0.4); }
}

.hover-point {
  position: absolute;
  top: -6px;
  z-index: 10;
  transform: translateX(-50%);
  pointer-events: none;
}

.hover-point::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #0ea5e9;
  margin: 0 auto;
}

.hover-point.alarm::after {
  border-top-color: #ef4444;
}

.popover-content {
  background: #0ea5e9;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  display: flex;
  gap: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.hover-point.alarm .popover-content {
  background: #ef4444;
}

.fiber-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
}

.ctrl-btn {
  flex: 1;
  width: 32px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.ctrl-btn:hover:not(:disabled) {
  background: #1e293b;
  color: #fff;
  border-color: #475569;
}

.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.ctrl-btn .arrow {
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
}

.ctrl-btn.up .arrow { transform: rotate(-135deg); margin-top: 2px; }
.ctrl-btn.down .arrow { transform: rotate(45deg); margin-bottom: 2px; }

.glb-model-container {
  position: relative;
  overflow: hidden;
  background-color: #1e293b;
}

.alarm-handle-content {
  color: #e2e8f0;
  font-size: 14px;
}
.alarm-handle-content p {
  margin: 8px 0;
}

/* ==================== 新增：预测面板样式 ==================== */
.prediction-panel {
  border: 1px solid rgba(245, 158, 11, 0.3); /* Amber border */
  background: rgba(245, 158, 11, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.prediction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
}

.prediction-card {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 6px;
  padding: 10px;
  transition: all 0.3s ease;
}

.prediction-card:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(245, 158, 11, 0.4);
  transform: translateX(4px);
}

.prediction-card.dispatched {
  opacity: 0.7;
  border-color: rgba(16, 185, 129, 0.3); /* Emerald border */
}

.pred-icon-box {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  margin-right: 12px;
}

/* Element Plus 覆盖样式 */
:deep(.el-radio-button__inner) {
  background-color: #1e293b;
  border-color: #475569;
  color: #e2e8f0;
}
:deep(.el-radio-button__inner:hover) {
  color: #fff;
}
:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background-color: #7c3aed;
  border-color: #7c3aed;
  color: #fff;
}
:deep(.el-dialog) {
  background-color: #0f172a;
  border: 1px solid #334155;
}
:deep(.el-dialog__header) {
  border-bottom: 1px solid #334155;
}
:deep(.el-dialog__title) {
  color: #e2e8f0;
}
:deep(.el-dialog__footer) {
  border-top: 1px solid #334155;
}
:deep(.el-notification) {
  background-color: #0f172a;
  border: 1px solid #334155;
}
:deep(.el-notification__title) {
  color: #e2e8f0;
}
:deep(.el-notification__content) {
  color: #94a3b8;
}
</style>
