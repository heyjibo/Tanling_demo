<template>
  <GlassCard title="b) 超声波室内精确定位 (高铁站场景)" class="h-full flex flex-col">
    <!-- 1. 顶部控制栏 -->
    <div class="flex-none flex justify-between items-center mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
      <div class="flex items-center gap-4">
        <el-tag type="info" effect="dark" class="font-mono">
          坐标: X:{{ currentPos.x.toFixed(0) }} Y:{{ currentPos.y.toFixed(0) }}
        </el-tag>
        <div class="flex items-center text-xs text-slate-400">
          <span class="w-2 h-2 rounded-full mr-2 animate-pulse" 
                :class="isResting ? 'bg-yellow-500' : (isMoving ? 'bg-green-500' : 'bg-gray-500')">
          </span>
          状态: {{ statusText }}
        </div>
      </div>
      
      <el-button-group>
        <el-button type="primary" size="small" @click="startSimulation" :disabled="isMoving || isResting">
          <el-icon class="mr-1"><VideoPlay /></el-icon> 开始
        </el-button>
        <el-button type="warning" size="small" @click="stopSimulation" :disabled="!isMoving && !isResting">
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
      <!-- ================= 地图层 ================= -->
      
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
           style="top: 55%; right: 37px; transform: translateY(-50%); width: 70px; height: 180px; z-index: 2;">
        <div style="writing-mode: vertical-lr; letter-spacing: 4px;" class="text-cyan-400 font-bold text-sm">自动售票区</div>
        <el-icon class="text-xl mt-4 text-cyan-600"><Ticket /></el-icon>
      </div>

      <!-- 2.3 洗手间 (Top Right) -->
      <div class="absolute border border-blue-500/30 rounded-lg bg-blue-900/10 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none"
           style="top: 75px; right: 37px; width: 100px; height: 80px; z-index: 2;">
        <el-icon class="text-xl text-blue-400"><ToiletPaper /></el-icon>
        <span class="text-blue-300 text-xs mt-1">洗手间</span>
      </div>

      <!-- 2.4 候车大厅 -->
      <div class="absolute border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20 pointer-events-none"
           style="top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; height: 70%; z-index: 0;">
        
        <div class="absolute inset-0 flex items-center justify-center">
             <span class="text-slate-500 font-bold text-2xl opacity-20 whitespace-nowrap select-none" style="letter-spacing: 1em;">候车大厅</span>
        </div>

        <div class="absolute inset-0 flex justify-between items-center opacity-70 pl-8 pr-28 md:pr-40 py-8">
            <!-- 左侧排椅区 (添加 ref) -->
            <div ref="leftSeatingRef" class="flex flex-col gap-4 md:gap-6 justify-center h-full p-2 rounded border border-transparent">
                <div v-for="row in 4" :key="'L'+row" class="flex gap-1 md:gap-2">
                    <div v-for="seat in 5" :key="'Ls'+seat" 
                         class="w-6 md:w-8 h-4 md:h-5 bg-slate-600/40 rounded-sm border-t-2 border-slate-500/60 shadow-sm"
                         :class="{'bg-cyan-500/20 border-cyan-500/50': Math.random() > 0.9}"> 
                    </div>
                </div>
            </div>

            <!-- 右侧排椅区 (添加 ref) -->
            <div ref="rightSeatingRef" class="flex flex-col gap-4 md:gap-6 justify-center h-full p-2 rounded border border-transparent">
                <div v-for="row in 4" :key="'R'+row" class="flex gap-1 md:gap-2">
                    <div v-for="seat in 5" :key="'Rs'+seat" 
                         class="w-6 md:w-8 h-4 md:h-5 bg-slate-600/40 rounded-sm border-t-2 border-slate-500/60 shadow-sm"
                         :class="{'bg-cyan-500/20 border-cyan-500/50': Math.random() > 0.9}">
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- 2.5 检票口 (Top Left) -->
      <div class="absolute border border-green-500/30 rounded bg-green-900/10 flex items-center justify-center backdrop-blur-sm pointer-events-none"
           style="top: 15px; left: 77px; width: 80%; height: 60px; z-index: 1;">
        <span class="text-green-500 font-bold text-sm">⬆ 检票口 / 站台</span>
      </div>
      
      <!-- 装饰柱子 (实体障碍物) -->
      <div class="absolute bg-slate-600 rounded-full shadow-[0_0_8px_black]" style="top: 33%; left: 25%; width: 12px; height: 12px; z-index: 5;"></div>
      <div class="absolute bg-slate-600 rounded-full shadow-[0_0_8px_black]" style="top: 33%; right: 25%; width: 12px; height: 12px; z-index: 5;"></div>
      <div class="absolute bg-slate-600 rounded-full shadow-[0_0_8px_black]" style="bottom: 33%; left: 25%; width: 12px; height: 12px; z-index: 5;"></div>
      <div class="absolute bg-slate-600 rounded-full shadow-[0_0_8px_black]" style="bottom: 33%; right: 25%; width: 12px; height: 12px; z-index: 5;"></div>

      <!-- ================= 动态层 ================= -->

      <!-- 3. Canvas层 (绘制轨迹) -->
      <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none" style="z-index: 10;"></canvas>

      <!-- 4. 当前位置图标 -->
      <div 
        class="absolute transition-transform duration-75 ease-linear will-change-transform"
        :style="{ transform: `translate(${currentPos.x - 10}px, ${currentPos.y - 10}px)`, zIndex: 20 }"
        v-show="hasStarted || isMoving || isResting"
      >
        <!-- 核心点 -->
        <div class="w-5 h-5 rounded-full shadow-[0_0_15px_#22d3ee] flex items-center justify-center relative transition-colors duration-300"
             :class="isResting ? 'bg-yellow-400 shadow-[0_0_15px_#facc15]' : 'bg-cyan-400'">
          <div class="absolute inset-0 rounded-full animate-ping opacity-75"
               :class="isResting ? 'bg-yellow-400' : 'bg-cyan-400'"></div>
          <el-icon class="text-black text-xs font-bold relative z-10">
            <UserFilled v-if="!isResting"/>
            <component :is="Coffee" v-else />
          </el-icon>
        </div>
        <!-- 标签 -->
        <div class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded text-[10px] border shadow-lg transition-colors duration-300"
             :class="isResting ? 'text-yellow-300 border-yellow-500/30' : 'text-cyan-300 border-cyan-500/30'">
          {{ isResting ? 'Resting...' : 'Target' }}
        </div>
      </div>

    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, watch, nextTick, computed } from 'vue';
import GlassCard from '@/components/Common/GlassCard.vue';
import { VideoPlay, VideoPause, RefreshRight, View, Ticket, ToiletPaper, UserFilled, Coffee } from '@element-plus/icons-vue';

// --- 状态定义 ---
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
// 定义椅子区域的 DOM 引用
const leftSeatingRef = ref<HTMLElement | null>(null);
const rightSeatingRef = ref<HTMLElement | null>(null);

// 状态标志
const isMoving = ref(false);
const isResting = ref(false); 
const showTrajectory = ref(true);
const hasStarted = ref(false);

const currentPos = reactive({ x: 0, y: 0 }); 
const pathHistory = ref<{x: number, y: number}[]>([]); 

// 计时相关
let animationFrameId: number;
let progress = 0; 
let moveStep = 0.005; 

// 休息逻辑控制
let lastRestTimestamp = 0; 
let restEndTimestamp = 0;  
const MIN_REST_INTERVAL = 30000; // 最少间隔 30秒
const MAX_REST_DURATION = 10000; // 最大休息 10秒
const MIN_REST_DURATION = 3000;  // 最小休息 3秒

// 漫游控制
let startPoint = { x: 0, y: 0 }; 
let endPoint = { x: 0, y: 0 };   
const CONSTANT_SPEED = 0.8;      

// 状态文案
const statusText = computed(() => {
  if (isResting.value) return '静止休息中';
  if (isMoving.value) return '区域漫游中';
  return '静止';
});

// --- 核心逻辑 ---

// 1. 定义障碍物 (柱子)
const getPillars = (w: number, h: number) => {
  return [
    { x: w * 0.25, y: h * 0.33, r: 25 },
    { x: w * 0.75, y: h * 0.33, r: 25 },
    { x: w * 0.25, y: h * 0.67, r: 25 },
    { x: w * 0.75, y: h * 0.67, r: 25 },
  ];
};

// 2. 精确判断是否在座椅区域 (使用 getBoundingClientRect)
const isInSeatingArea = (x: number, y: number) => {
  if (!containerRef.value || !leftSeatingRef.value || !rightSeatingRef.value) return false;

  const containerRect = containerRef.value.getBoundingClientRect();
  
  // 辅助函数：检测点是否在矩形内 (坐标系需要转换到容器内部)
  const isInside = (element: HTMLElement, targetX: number, targetY: number) => {
    const rect = element.getBoundingClientRect();
    
    // 计算元素相对于容器左上角的坐标范围
    const minX = rect.left - containerRect.left;
    const maxX = rect.right - containerRect.left;
    const minY = rect.top - containerRect.top;
    const maxY = rect.bottom - containerRect.top;

    return targetX >= minX && targetX <= maxX && targetY >= minY && targetY <= maxY;
  };

  return isInside(leftSeatingRef.value, x, y) || isInside(rightSeatingRef.value, x, y);
};

// 3. 碰撞检测：点是否在柱子安全范围内
const isCollidingWithPillar = (x: number, y: number, w: number, h: number) => {
  const pillars = getPillars(w, h);
  for (const p of pillars) {
    const dx = x - p.x;
    const dy = y - p.y;
    if (Math.sqrt(dx * dx + dy * dy) < p.r) {
      return true;
    }
  }
  return false;
};

// 4. 初始化
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
  
  if (!hasStarted.value) {
     currentPos.x = clientWidth / 2;
     currentPos.y = clientHeight / 2;
     startPoint = { x: currentPos.x, y: currentPos.y };
     endPoint = generateValidPoint(clientWidth, clientHeight);
  } else {
    draw(); 
  }
};

// 5. 生成合法的随机点
const generateValidPoint = (w: number, h: number) => {
  let attempt = 0;
  let p = { x: 0, y: 0 };
  
  while (attempt < 20) {
    p = generateRandomPoint(w, h);
    
    // 检查1: 终点不能撞柱子
    if (isCollidingWithPillar(p.x, p.y, w, h)) {
      attempt++;
      continue;
    }
    
    // 检查2: 路径中点不能撞柱子
    const midX = (startPoint.x + p.x) / 2;
    const midY = (startPoint.y + p.y) / 2;
    if (isCollidingWithPillar(midX, midY, w, h)) {
        attempt++;
        continue;
    }

    return p;
  }
  return { x: w/2, y: h/2 };
};

const generateRandomPoint = (containerW: number, containerH: number) => {
  const zoneWidth = containerW * 0.85;
  const zoneHeight = containerH * 0.7;
  const startX = (containerW - zoneWidth) / 2;
  const startY = (containerH - zoneHeight) / 2;
  const padding = 20;

  const minX = startX + padding;
  const maxX = startX + zoneWidth - padding;
  const minY = startY + padding;
  const maxY = startY + zoneHeight - padding;
  
  const randomX = minX + Math.random() * (maxX - minX);
  const randomY = minY + Math.random() * (maxY - minY);
  
  return { x: randomX, y: randomY };
};

// 6. 速度计算
const calculateStep = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx*dx + dy*dy);
  if (distance < 1) return 1; 
  return CONSTANT_SPEED / distance;
};

const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

// 7. 核心动画循环
const animate = () => {
  if (!containerRef.value) return;

  // === 休息逻辑 ===
  if (isResting.value) {
    const now = Date.now();
    if (now >= restEndTimestamp) {
      // 醒来
      isResting.value = false;
      isMoving.value = true;
      lastRestTimestamp = now;
      
      startPoint = { x: currentPos.x, y: currentPos.y };
      endPoint = generateValidPoint(containerRef.value.clientWidth, containerRef.value.clientHeight);
      moveStep = calculateStep(startPoint, endPoint);
      progress = 0;
    } else {
      draw();
      animationFrameId = requestAnimationFrame(animate);
      return; 
    }
  }

  // === 移动逻辑 ===
  if (!isMoving.value) return;

  progress += moveStep;

  if (progress >= 1) {
    progress = 1;
    
    const now = Date.now();
    const { clientWidth, clientHeight } = containerRef.value;
    
    // 关键修正：使用新的精确检测函数
    const inSeats = isInSeatingArea(endPoint.x, endPoint.y);
    const timeOk = (now - lastRestTimestamp > MIN_REST_INTERVAL);

    // 只有当“真的在椅子上”且“冷却时间到了”才休息
    if (inSeats && timeOk) {
      isResting.value = true;
      isMoving.value = false;
      
      const duration = Math.random() * (MAX_REST_DURATION - MIN_REST_DURATION) + MIN_REST_DURATION;
      restEndTimestamp = now + duration;
      
      currentPos.x = endPoint.x;
      currentPos.y = endPoint.y;
      
      draw();
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    progress = 0;
    startPoint = { ...endPoint };
    endPoint = generateValidPoint(clientWidth, clientHeight);
    moveStep = calculateStep(startPoint, endPoint);
  }

  const targetX = lerp(startPoint.x, endPoint.x, progress);
  const targetY = lerp(startPoint.y, endPoint.y, progress);

  currentPos.x = targetX;
  currentPos.y = targetY;

  pathHistory.value.push({ x: targetX, y: targetY });

  if (pathHistory.value.length > 500) {
    pathHistory.value.shift(); 
  }

  draw();
  animationFrameId = requestAnimationFrame(animate);
};

// 绘制函数
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
    
    const gradient = ctx.createLinearGradient(0, 0, clientWidth, clientHeight);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)'); 
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)');
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22d3ee'; 
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }
};

// --- 按钮事件 ---

const startSimulation = () => {
  if (!containerRef.value) return;
  if (isMoving.value || isResting.value) return;

  if (!hasStarted.value) {
    hasStarted.value = true;
    lastRestTimestamp = Date.now(); 
    
    startPoint = { x: currentPos.x, y: currentPos.y };
    endPoint = generateValidPoint(containerRef.value.clientWidth, containerRef.value.clientHeight);
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
  isResting.value = false;
  pathHistory.value = [];
  progress = 0;
  lastRestTimestamp = Date.now(); 
  
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
/* 内联样式 */
</style>
