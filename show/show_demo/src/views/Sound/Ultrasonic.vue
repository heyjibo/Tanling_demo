<template>
  <GlassCard title="b) 超声波室内精确定位" class="h-full flex flex-col">
    <!-- 1. 顶部控制栏 -->
    <div class="flex-none flex justify-between items-center mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
      <div class="flex items-center gap-4">
        <el-tag type="info" effect="dark" class="font-mono">
          坐标: X:{{ currentPos.x.toFixed(0) }} Y:{{ currentPos.y.toFixed(0) }}
        </el-tag>
        <div class="flex items-center text-xs text-slate-400">
          <span class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          状态: {{ isMoving ? '移动中' : '静止' }}
        </div>
      </div>
      
      <el-button-group>
        <el-button type="primary" size="small" @click="startSimulation" :disabled="isMoving">
          <el-icon class="mr-1"><VideoPlay /></el-icon> 开始
        </el-button>
        <el-button type="warning" size="small" @click="stopSimulation" :disabled="!isMoving">
          <el-icon class="mr-1"><VideoPause /></el-icon> 停止
        </el-button>
        <el-button type="info" size="small" @click="toggleTrajectory">
          <el-icon class="mr-1"><View /></el-icon> {{ showTrajectory ? '隐藏轨迹' : '显示轨迹' }}
        </el-button>
        <el-button type="danger" size="small" @click="resetSimulation">
          <el-icon class="mr-1"><RefreshRight /></el-icon> 重置
        </el-button>
      </el-button-group>
    </div>

    <!-- 2. 地图与画布容器 -->
    <div 
      class="relative flex-1 w-full bg-[#0B1121] rounded-xl overflow-hidden border border-slate-700 shadow-inner" 
      ref="containerRef"
      style="min-height: 500px;" 
    >
      <!-- ================= 地图层 (使用内联样式确保绝对显示) ================= -->
      
      <!-- 2.0 背景网格 -->
      <div class="absolute inset-0 opacity-20 pointer-events-none" 
           style="background-image: linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px); background-size: 40px 40px; z-index: 0;">
      </div>
      
      <!-- 2.1 入口 (Bottom) -->
      <div class="absolute border border-cyan-500/30 rounded bg-cyan-900/20 flex items-center justify-center backdrop-blur-sm pointer-events-none"
           style="bottom: 10px; left: 50%; transform: translateX(-50%); width: 200px; height: 60px; z-index: 1;">
        <span class="text-cyan-500 font-bold text-sm">⬇ 主入口 / 安检</span>
      </div>

      <!-- 2.2 售票处 (Right) -->
      <div class="absolute border border-cyan-500/30 rounded bg-cyan-900/20 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none"
           style="top: 50%; right: 10px; transform: translateY(-50%); width: 70px; height: 200px; z-index: 1;">
        <div style="writing-mode: vertical-lr; letter-spacing: 4px;" class="text-cyan-400 font-bold text-sm">自动售票区</div>
        <el-icon class="text-xl mt-4 text-cyan-600"><Ticket /></el-icon>
      </div>

      <!-- 2.3 洗手间 (Top Right) -->
      <div class="absolute border border-blue-500/30 rounded-lg bg-blue-900/10 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none"
           style="top: 15px; right: 15px; width: 100px; height: 80px; z-index: 1;">
        <el-icon class="text-xl text-blue-400"><ToiletPaper /></el-icon>
        <span class="text-blue-300 text-xs mt-1">洗手间</span>
      </div>

      <!-- 2.4 候车大厅 (Center) -->
      <div class="absolute border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-800/20 pointer-events-none"
           style="top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60%; height: 40%; z-index: 0;">
        <span class="text-slate-500 font-bold text-2xl opacity-30 whitespace-nowrap" style="letter-spacing: 1em;">候车大厅</span>
      </div>

      <!-- 2.5 检票口 (Top Left) -->
      <div class="absolute border border-green-500/30 rounded bg-green-900/10 flex items-center justify-center backdrop-blur-sm pointer-events-none"
           style="top: 15px; left: 15px; width: 140px; height: 60px; z-index: 1;">
        <span class="text-green-500 font-bold text-sm">⬆ 检票口 / 站台</span>
      </div>
      
      <!-- 装饰柱子 -->
      <div class="absolute bg-slate-600 rounded-full shadow-[0_0_8px_black]" style="top: 33%; left: 25%; width: 12px; height: 12px; z-index: 1;"></div>
      <div class="absolute bg-slate-600 rounded-full shadow-[0_0_8px_black]" style="top: 33%; right: 25%; width: 12px; height: 12px; z-index: 1;"></div>
      <div class="absolute bg-slate-600 rounded-full shadow-[0_0_8px_black]" style="bottom: 33%; left: 25%; width: 12px; height: 12px; z-index: 1;"></div>
      <div class="absolute bg-slate-600 rounded-full shadow-[0_0_8px_black]" style="bottom: 33%; right: 25%; width: 12px; height: 12px; z-index: 1;"></div>

      <!-- ================= 动态层 ================= -->

      <!-- 3. Canvas层 (绘制轨迹) -->
      <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none" style="z-index: 10;"></canvas>

      <!-- 4. 当前位置图标 -->
      <div 
        class="absolute transition-transform duration-75 ease-linear will-change-transform"
        :style="{ transform: `translate(${currentPos.x - 10}px, ${currentPos.y - 10}px)`, zIndex: 20 }"
        v-show="hasStarted || isMoving"
      >
        <!-- 核心点 -->
        <div class="w-5 h-5 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee] flex items-center justify-center relative">
          <div class="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
          <el-icon class="text-black text-xs font-bold relative z-10"><UserFilled /></el-icon>
        </div>
        <!-- 标签 -->
        <div class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded text-[10px] text-cyan-300 border border-cyan-500/30 shadow-lg">
          Target
        </div>
      </div>

    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, watch, nextTick } from 'vue';
import GlassCard from '@/components/Common/GlassCard.vue';
import { VideoPlay, VideoPause, RefreshRight, View, Ticket, ToiletPaper, UserFilled } from '@element-plus/icons-vue';

// --- 状态定义 ---
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isMoving = ref(false);
const showTrajectory = ref(true);
const hasStarted = ref(false);

const currentPos = reactive({ x: 0, y: 0 }); // 实时坐标
const pathHistory = ref<{x: number, y: number}[]>([]); // 轨迹历史

// 移动逻辑变量
let animationFrameId: number;
let progress = 0; // 当前两点之间的进度 (0.0 - 1.0)
let moveStep = 0.005; // 每一帧增加的进度（根据距离动态计算）

// 随机漫游的关键点
let startPoint = { x: 0, y: 0 }; // 当前段落起点
let endPoint = { x: 0, y: 0 };   // 当前段落终点
const CONSTANT_SPEED = 0.8;      // 像素/帧，控制移动速度

// --- 核心功能 ---

// 1. 初始化画布
const initCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return;
  const { clientWidth, clientHeight } = containerRef.value;
  
  if (clientWidth === 0 || clientHeight === 0) return;

  const dpr = window.devicePixelRatio || 1;
  canvasRef.value.width = clientWidth * dpr;
  canvasRef.value.height = clientHeight * dpr;
  canvasRef.value.style.width = `${clientWidth}px`;
  canvasRef.value.style.height = `${clientHeight}px`;
  
  const ctx = canvasRef.value.getContext('2d');
  if (ctx) ctx.scale(dpr, dpr);
  
  // 如果是第一次初始化，把小人放在屏幕中间
  if (!hasStarted.value) {
     currentPos.x = clientWidth / 2;
     currentPos.y = clientHeight / 2;
     startPoint = { x: currentPos.x, y: currentPos.y };
     // 先生成一个目标点备用
     endPoint = generateRandomPoint(clientWidth, clientHeight);
  } else {
    draw(); // 只是重绘轨迹
  }
};

// 2. 生成随机目标点（带边界保护）
const generateRandomPoint = (maxX: number, maxY: number) => {
  // 留出 10% 的内边距，防止贴边
  const paddingX = maxX * 0.1;
  const paddingY = maxY * 0.1;
  
  const randomX = paddingX + Math.random() * (maxX - paddingX * 2);
  const randomY = paddingY + Math.random() * (maxY - paddingY * 2);
  
  return { x: randomX, y: randomY };
};

// 3. 计算新段落的速度
// (为了让长距离和短距离的移动看起来速度一致)
const calculateStep = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx*dx + dy*dy);
  
  // 避免除以0
  if (distance < 1) return 1; 
  
  // 步进 = 恒定速度 / 总距离
  return CONSTANT_SPEED / distance;
};

// 4. 线性插值
const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

// 5. 动画循环 (核心逻辑)
const animate = () => {
  if (!isMoving.value) return;

  // 每一帧增加进度
  progress += moveStep;

  // 如果到达当前终点，开始下一段随机路程
  if (progress >= 1) {
    progress = 0;
    
    // 旧的终点变成新的起点
    startPoint = { ...endPoint };
    
    // 生成新的随机终点
    if (containerRef.value) {
      endPoint = generateRandomPoint(containerRef.value.clientWidth, containerRef.value.clientHeight);
      // 重新计算移动步幅
      moveStep = calculateStep(startPoint, endPoint);
    }
  }

  // 计算当前位置
  const targetX = lerp(startPoint.x, endPoint.x, progress);
  const targetY = lerp(startPoint.y, endPoint.y, progress);

  currentPos.x = targetX;
  currentPos.y = targetY;

  // 记录轨迹
  pathHistory.value.push({ x: targetX, y: targetY });

  // 性能优化：限制轨迹长度，避免无限增长导致内存溢出
  if (pathHistory.value.length > 500) {
    pathHistory.value.shift(); // 移除最老的点，形成“拖尾”效果
  }

  draw();
  animationFrameId = requestAnimationFrame(animate);
};

// 6. 绘制轨迹
const draw = () => {
  if (!canvasRef.value || !containerRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  const { clientWidth, clientHeight } = containerRef.value;
  ctx.clearRect(0, 0, clientWidth, clientHeight);

  if (showTrajectory.value && pathHistory.value.length > 1) {
    ctx.beginPath();
    ctx.moveTo(pathHistory.value[0].x, pathHistory.value[0].y);
    for (let i = 1; i < pathHistory.value.length; i++) {
      ctx.lineTo(pathHistory.value[i].x, pathHistory.value[i].y);
    }
    
    // 使用渐变色模拟时间流逝（尾部淡出）
    const gradient = ctx.createLinearGradient(0, 0, clientWidth, clientHeight);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)'); // 青色
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)');
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22d3ee'; // 简单纯色配合 globalAlpha 也许更好，这里用纯色
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }
};

// --- 按钮事件 ---

const startSimulation = () => {
  if (!containerRef.value) return;
  
  if (!hasStarted.value) {
    hasStarted.value = true;
    
    // 首次开始：从当前位置（中心）出发，去往第一个随机点
    startPoint = { x: currentPos.x, y: currentPos.y };
    endPoint = generateRandomPoint(containerRef.value.clientWidth, containerRef.value.clientHeight);
    moveStep = calculateStep(startPoint, endPoint);
    
    pathHistory.value = [];
    pathHistory.value.push({ ...startPoint });
  }
  
  isMoving.value = true;
  animate();
};

const stopSimulation = () => {
  isMoving.value = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
};

const resetSimulation = () => {
  stopSimulation();
  hasStarted.value = false;
  pathHistory.value = [];
  progress = 0;
  
  // 重置回中心
  if (containerRef.value) {
    const cx = containerRef.value.clientWidth / 2;
    const cy = containerRef.value.clientHeight / 2;
    currentPos.x = cx;
    currentPos.y = cy;
    startPoint = { x: cx, y: cy };
  }
  
  draw();
};

const toggleTrajectory = () => {
  showTrajectory.value = !showTrajectory.value;
  draw();
};

// --- 生命周期 ---
onMounted(() => {
  nextTick(() => {
    setTimeout(initCanvas, 300);
  });
  window.addEventListener('resize', initCanvas);
});

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

watch(showTrajectory, draw);
</script>

<style scoped>
/* 全部使用内联样式，确保兼容性 */
</style>
