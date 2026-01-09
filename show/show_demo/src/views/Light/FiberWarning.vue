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

      <!-- 顶部状态面板 - 新增总告警数 -->
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
        <!-- 新增：系统总告警数 -->
        <div class="status-item">
          <span class="label">系统总告警数</span>
          <span class="value alarm">{{ totalSystemAlarms }}</span>
        </div>
        <div class="status-item">
          <span class="label">响应延迟</span>
          <span class="value">{{ responseDelay }}ms</span>
        </div>
      </div>

      <!-- 新增：GLB模型展示容器 -->
      <div class="mb-6">
        <div ref="modelContainer" class="glb-model-container w-full h-[300px] rounded-xl overflow-hidden border border-slate-700/50"></div>
      </div>

      <!-- 设备类型切换按钮组 -->
      <div class="device-switch w-full mb-6">
        <div class="relative bg-slate-800/40 rounded-2xl p-1 border border-slate-700/50 w-full">
          <!-- 背景滑块 - 适配4个选项的滑动效果 -->
          <div 
            class="absolute top-1 bottom-1 rounded-xl transition-all duration-500 ease-out"
            :class="[
              currentDeviceType === 'boiler' ? 'w-[calc(25%-0.5rem)] left-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30' :
              currentDeviceType === 'lng' ? 'w-[calc(25%-0.5rem)] left-[calc(25%+0.1875rem)] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30' :
              currentDeviceType === 'pressure' ? 'w-[calc(25%-0.5rem)] left-[calc(50%+0.375rem)] bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30' :
              'w-[calc(25%-0.5rem)] left-[calc(75%+0.5625rem)] bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
            ]"
          ></div>
          
          <!-- 按钮组 - 4列均分，占满整行 -->
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
                <!-- 激活态脉冲圆点 -->
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
        <!-- 管道外壳 -->
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
              <!-- 光纤名称 -->
              <span class="fiber-label">{{ fiber.name }}</span>
              
              <!-- 光纤本体（微缩热力图/应变/振动图） -->
              <div class="fiber-core" :style="{ background: getFiberGradient(fiber) }"></div>

              <!-- 悬浮提示点 -->
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
          
          <!-- 装饰性光泽 -->
          <div class="shine-overlay"></div>
        </div>

        <!-- 翻页控制 -->
        <div class="fiber-controls">
          <button class="ctrl-btn up" @click="prevGroup" :disabled="startIndex === 0">
            <i class="arrow"></i>
          </button>
          <button class="ctrl-btn down" @click="nextGroup" :disabled="startIndex >= FIBER_COUNT - VIEW_SIZE">
            <i class="arrow"></i>
          </button>
        </div>
      </div>

      <!-- 双图表区域：原有温度图表 + 新增指标趋势图 -->
      <div class="charts-container">
        <div ref="chartRef" class="chart-item main-chart"></div>
        <div ref="subChartRef" class="chart-item sub-chart"></div>
      </div>

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
            <el-button size="mini" type="primary" @click="handleAlarm(alarm.id)">处理</el-button>
          </div>
          <div v-if="alarmList.length === 0" class="empty-alarm">暂无告警</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import GlassCard from '@/components/Common/GlassCard.vue';
import { ElMessage } from 'element-plus';
// 新增：Three.js 相关导入
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
// 定义响应延迟的正常范围（可根据业务调整，比如 60-100ms）
const RESPONSE_DELAY_MIN = 60;
const RESPONSE_DELAY_MAX = 100;

// 初始化：在范围内生成随机初始值
const responseDelay = ref(
  Math.floor(Math.random() * (RESPONSE_DELAY_MAX - RESPONSE_DELAY_MIN + 1)) + RESPONSE_DELAY_MIN
);

// 可选：定时小幅波动（模拟实时变化，比如每5秒更新一次）
let delayTimer: any = null;
function updateResponseDelay() {
  // 小幅波动：在当前值±5ms范围内，且不超出上下限
  const fluctuation = Math.floor(Math.random() * 11) - 5; // -5 到 +5 的随机数
  let newDelay = responseDelay.value + fluctuation;
  
  // 边界限制：确保值在正常范围内
  newDelay = Math.max(RESPONSE_DELAY_MIN, Math.min(RESPONSE_DELAY_MAX, newDelay));
  responseDelay.value = newDelay;
  
  // 递归调用：每5秒更新一次（可调整间隔）
  delayTimer = setTimeout(updateResponseDelay, 5000);
}

// 组件挂载时启动波动，卸载时清除定时器
onMounted(() => {
  updateResponseDelay();
});

onUnmounted(() => {
  clearTimeout(delayTimer);
  // 顺带清除模拟数据的定时器（避免内存泄漏）
  if (simulationTimer) clearTimeout(simulationTimer);
});
// const responseDelay = ref(80); // 模拟响应延迟

// 新增：系统总告警数（所有设备+所有维度）
const totalSystemAlarms = computed(() => {
  if (fibers.value.length === 0) return 0;
  
  let total = 0;
  // 遍历所有光纤
  fibers.value.forEach(fiber => {
    // 遍历所有维度
    Object.keys(fiber.alarms).forEach(dimKey => {
      const dim = dimKey as DimensionType;
      // 统计该维度下的告警数
      total += fiber.alarms[dim].filter(Boolean).length;
    });
  });
  return total;
});

/* ===============================
   新增：GLB模型相关变量
=============================== */
const modelContainer = ref<HTMLDivElement>();
// Three.js 核心对象
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let model: THREE.Object3D | null = null;
// 动画循环ID
let animationId: number | null = null;


function initGLBScene() {
  if (!modelContainer.value) return;

  // 1. 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e293b);

  // 2. 创建相机 - 右转90° + 极近初始位置
  camera = new THREE.PerspectiveCamera(60, modelContainer.value.clientWidth / modelContainer.value.clientHeight, 0.001, 10000);
  // 右转90°核心：x轴方向，z轴=0；极近初始位置
  camera.position.set(3, 2, 0); 
  camera.lookAt(0, 0, 0);

  // 3. 创建渲染器 - 确保近距离细节清晰
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance" as const // 解决TS类型警告
  });
  renderer.setSize(modelContainer.value.clientWidth, modelContainer.value.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  modelContainer.value.appendChild(renderer.domElement);

  // 4. 光照系统 - 适配极近距离视角
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // 增强环境光，确保细节清晰
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // 增强主光源
  directionalLight.position.set(10, 8, 3); // 适配极近视角
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  const directionalLight2 = new THREE.DirectionalLight(0xaaaaaa, 0.8);
  directionalLight2.position.set(3, 5, -2);
  scene.add(directionalLight2);

  // 5. 轨道控制器 - 终极近距离配置
  if (camera && renderer) { // 增加非空判断，解决TS警告
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.5; // 最小距离降至0.5，允许超近距离缩放
    controls.maxDistance = 20; // 最大距离进一步缩小，防止拉远
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);
    controls.update();
  }

  // 6. 加载GLB模型 - 终极放大 + 超近距离适配
  const loader = new GLTFLoader();
  loader.load(
    '/src/assets/3D/factory.glb',
    (gltf) => {
      model = gltf.scene;
      
      // 计算模型包围盒
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // 目标显示尺寸调至25（终极放大，模型占满大部分容器）
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 130; // 极致放大模型
      const scaleRatio = targetSize / maxDim;
      
      // 缩放模型
      model.scale.set(scaleRatio, scaleRatio, scaleRatio);
      
      // 重新计算缩放后的包围盒
      box.setFromObject(model);
      box.getCenter(center);
      box.getSize(size);
      
      // 模型居中
      model.position.sub(center);
      
      // 安全距离倍数降至0.8（超近距离，几乎贴在模型表面）
      const fitDistance = size.length() * 0.8; // 终极近距离倍数
      // 强制确保安全距离 > 控制器最小距离，防止进入模型
      const safeDistance = Math.max(fitDistance, controls?.minDistance || 1.0);
      
      // 修复TS警告：添加camera非空判断
      if (camera) {
        // 右转90°的超近相机位置（x轴方向）
        // 核心：x轴=safeDistance * 0.8（进一步贴近），z轴=0，高度极低
        camera.position.set(safeDistance * 0.8, safeDistance * 0.2, 0); 
        camera.lookAt(0, 0, 0); // 保持看向模型中心
        camera.updateProjectionMatrix();
      }
      
      if (controls) { // 非空判断
        controls.target.set(0, 0, 0);
        controls.update();
      }
      
      scene?.add(model);
      
      console.log('模型加载完成 - 缩放后尺寸:', size, '缩放比例:', scaleRatio, '超近相机距离:', safeDistance);
    },
    (xhr) => {
      console.log(`GLB模型加载进度: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    // 修复TS警告：参数类型改为unknown，内部做类型检查
    (error: unknown) => {
      // 类型守卫：检查是否为Error实例
      const errorMsg = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : '未知错误';
      
      console.error('GLB模型加载失败:', error);
      ElMessage.error(`3D模型加载失败: ${errorMsg || '请检查模型文件是否存在或格式正确'}`);
    }
  );

  // 7. 动画循环
  function animate() {
    animationId = requestAnimationFrame(animate);
    controls?.update();
    // 修复TS警告：添加scene、camera、renderer非空判断
    if (scene && camera && renderer) {
      renderer.render(scene, camera);
    }
  }
  animate();

  // 8. 窗口大小调整（适配超近距离+右转90°）
  window.addEventListener('resize', onWindowResize);
}


function onWindowResize() {
  if (!modelContainer.value || !camera || !renderer) return; // 提前返回，简化判断

  camera.aspect = modelContainer.value.clientWidth / modelContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(modelContainer.value.clientWidth, modelContainer.value.clientHeight);
  
  if (model && camera && controls) { // 非空组合判断
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    
    const fitDistance = size.length() * 0.8;
    const safeDistance = Math.max(fitDistance, controls.minDistance || 1.0);
    
    // 窗口变化时，强制保持超近距离+右转90°视角
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
    model.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
      if ((obj as THREE.Mesh).material) {
        const material = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[];
        if (Array.isArray(material)) {
          material.forEach(m => m.dispose());
        } else {
          material.dispose();
        }
      }
      if ((obj as THREE.Light).dispose) {
        (obj as THREE.Light).dispose();
      }
    });
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
// 生成初始数据（多维度）
function initData() {
  const now = new Date();
  updateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  fibers.value = Array.from({ length: FIBER_COUNT }, (_, i) => {
    // 不同设备类型初始值偏移
    const baseTemp = currentDeviceType.value === 'boiler' ? 50 : currentDeviceType.value === 'lng' ? -10 : 25;
    const baseStrain = currentDeviceType.value === 'pressure' ? 200 : 100;
    const baseVibration = currentDeviceType.value === 'valve' ? 30 : 10;

    // 生成各维度数据
    const temperature = generateDimensionData(baseTemp, THRESHOLDS.temperature);
    const strain = generateDimensionData(baseStrain, THRESHOLDS.strain);
    const vibration = generateDimensionData(baseVibration, THRESHOLDS.vibration);

    // 分析各维度告警
    const alarms = {
      temperature: analyzeDimensionAlarm(temperature, THRESHOLDS.temperature),
      strain: analyzeDimensionAlarm(strain, THRESHOLDS.strain),
      vibration: analyzeDimensionAlarm(vibration, THRESHOLDS.vibration)
    };

    // 总告警状态
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

  // 生成初始告警列表
  generateAlarmList();
}

// 生成单维度数据（随机游走）
function generateDimensionData(baseValue: number, thresholds: any) {
  const data: number[] = [];
  let currentValue = Math.floor(baseValue + Math.random() * 30);
  
  for (let j = 0; j < POINT_COUNT; j++) {
    data.push(currentValue);
    // 随机变化
    const change = Math.floor(Math.random() * (INIT_STEP_MAX * 2 + 1)) - INIT_STEP_MAX;
    currentValue += change;
    // 边界限制
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

// 模拟数据更新
function updateSimulation() {
  const nextDelay = Math.floor(15000 + Math.random() * 15000);
  
  fibers.value = fibers.value.map(fiber => {
    // 更新各维度数据
    const temperature = updateDimensionData(fiber.temperature, THRESHOLDS.temperature);
    const strain = updateDimensionData(fiber.strain, THRESHOLDS.strain);
    const vibration = updateDimensionData(fiber.vibration, THRESHOLDS.vibration);

    // 重新分析告警
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

  // 更新时间和告警列表
  const now = new Date();
  updateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  generateAlarmList();

  // 刷新图表
  renderChart(activeFiberId.value);
  renderSubChart(activeFiberId.value);

  // 递归调用
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
  renderChart(activeFiberId.value);
  renderSubChart(activeFiberId.value);
}

// 设备类型切换
// 原有切换逻辑改造（接收value参数）
const switchDeviceType = (value: string) => {
  currentDeviceType.value = value as 'boiler' | 'lng' | 'pressure' | 'valve';
  initData();
  renderChart(activeFiberId.value);
  renderSubChart(activeFiberId.value);
};

// 光纤渐变样式（适配多维度）
function getFiberGradient(fiber: FiberData) {
  const thresholds = THRESHOLDS[activeDimension.value];
  const values = fiber[activeDimension.value];
  const alarms = fiber.alarms[activeDimension.value];
  
  const stops = values.map((val, i) => {
    const pct = (i / (POINT_COUNT - 1)) * 100;
    let color = 'rgba(56, 189, 248, 0.4)'; // 基础色
    
    if (alarms[i]) {
      color = '#ef4444'; // 告警红
    } else if (val > thresholds.highValue) {
      color = '#fbbf24'; // 高值黄
    }
    
    return `${color} ${pct}%`;
  });
  
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}

// 可视光纤计算
const visibleFibers = computed(() =>
  fibers.value
    .slice(startIndex.value, startIndex.value + VIEW_SIZE)
    .map((fiber, idx) => ({
      ...fiber,
      top: 15 + idx * 32
    }))
);

// 翻页控制
function prevGroup() {
  startIndex.value = Math.max(0, startIndex.value - 1);
}

function nextGroup() {
  startIndex.value = Math.min(FIBER_COUNT - VIEW_SIZE, startIndex.value + 1);
}

// 悬浮逻辑
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

// 告警处理
function handleAlarm(alarmId: number) {
  alarmList.value = alarmList.value.filter(item => item.id !== alarmId);
  ElMessage.success('告警已处理');
}

function clearAlarms() {
  alarmList.value = [];
  ElMessage.success('已清空所有已处理告警');
}

/* ===============================
   图表逻辑 (原有主图表 + 新增子图表)
=============================== */
const chartRef = ref<HTMLDivElement>();
const subChartRef = ref<HTMLDivElement>();

// 状态扩展（GlassCard标题右侧）
const statusExtra = computed(() => {
  return `<span style="color: ${alarmList.value.length > 0 ? '#ef4444' : '#10b981'}">
    ${alarmList.value.length > 0 ? '⚠️ 存在告警' : '✅ 无异常'}
  </span>`;
});

function selectFiber(id: number) {
  activeFiberId.value = id;
  renderChart(id);
  renderSubChart(id);
}

// 原有主图表（保持逻辑不变，适配多维度）
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

// 新增子图表：多维度对比趋势
function renderSubChart(fiberId: number) {
  if (!subChartRef.value) return;
  if (!subChart) {
    subChart = echarts.init(subChartRef.value);
    window.addEventListener('resize', () => subChart.resize());
  }
  
  const fiber = fibers.value.find(f => f.id === fiberId);
  if (!fiber) return;

  const xData = fiber.temperature.map((_, i) => i + 1);
  // 归一化数据（0-100）用于对比
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

/* ===============================
   生命周期
=============================== */
onMounted(() => {
  initData();
  
  // 初始化图表
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    renderChart(activeFiberId.value);
  }
  
  if (subChartRef.value) {
    subChart = echarts.init(subChartRef.value);
    renderSubChart(activeFiberId.value);
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart && chart.resize();
    subChart && subChart.resize();
  });

  // 启动模拟
  updateSimulation();

  // 新增：初始化GLB模型场景
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

  // 新增：销毁GLB模型场景
  disposeGLBScene();
});

// 监听维度切换刷新样式
watch(activeDimension, () => {
  // 触发重新渲染光纤渐变
  fibers.value = [...fibers.value];
});
</script>

<style scoped>
/* 原有样式保留，新增以下样式 */
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

/* 原有样式 */
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

/* 新增：GLB模型容器样式 */
.glb-model-container {
  position: relative;
  overflow: hidden;
  background-color: #1e293b;
}
</style>