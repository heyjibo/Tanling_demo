<template>
  <GlassCard title="b) 超声波室内高精定位 " class="h-full flex flex-col">
    <!-- 1. 顶部控制栏 -->
    <div class="flex-none flex justify-between items-center mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
      <div class="flex items-center gap-4">
        <!-- 状态标签 -->
        <el-tag 
          :type="collisionDetected ? 'danger' : 'success'" 
          effect="dark" 
          class="font-mono transition-colors duration-200"
        >
          {{ collisionDetected ? '避障转向' : '正常巡检' }}
        </el-tag>
        
        <div class="text-xs text-slate-400 font-mono flex gap-3">
          <span>X: {{ currentPos.x.toFixed(0) }}</span>
          <span>Y: {{ currentPos.y.toFixed(0) }}</span>
          <span>FPS: {{ fps }}</span>
        </div>
      </div>
      
      <el-button-group>
        <el-button type="primary" size="small" @click="startSimulation" :disabled="isRunning || !isReady">
          <el-icon class="mr-1"><VideoPlay /></el-icon> 启动
        </el-button>
        <el-button type="warning" size="small" @click="stopSimulation" :disabled="!isRunning">
          <el-icon class="mr-1"><VideoPause /></el-icon> 暂停
        </el-button>
        <el-button type="info" size="small" @click="toggleTrajectory">
          <el-icon class="mr-1"><Share /></el-icon> {{ showTrajectory ? '隐藏轨迹' : '显示轨迹' }}
        </el-button>
        <el-button type="danger" size="small" @click="resetSimulation">
          <el-icon class="mr-1"><RefreshRight /></el-icon> 重置
        </el-button>
      </el-button-group>
    </div>

    <!-- 2. 地图容器 -->
    <div 
      class="relative flex-1 w-full bg-[#0B1121] rounded-xl overflow-hidden border border-slate-700 shadow-inner select-none" 
      ref="containerRef"
      style="min-height: 450px;" 
    >
      <!-- ================= 2.1 矢量地图层 (Visual SVG) ================= -->
      <svg 
        class="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 1100 500" 
        preserveAspectRatio="none"
      >
        <defs>
          <!-- 蓝色光晕滤镜 -->
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <pattern id="stairs" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#38bdf8" stroke-width="2" opacity="0.5"/>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1" />
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" stroke-width="0.5"/>
        </pattern>

        <!-- 墙体绘制 -->
        <g stroke="#0ea5e9" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#neon-glow)">
           <path v-for="(d, i) in SVG_WALLS" :key="'w'+i" :d="d" class="drop-shadow-lg" />
           <rect v-for="(r, i) in SVG_PILLARS" :key="'p'+i" :x="r.x" :y="r.y" :width="r.w" :height="r.h" fill="#0ea5e9" stroke="none" opacity="0.8" />
           <rect x="960" y="220" width="40" height="60" fill="url(#stairs)" stroke="#0ea5e9" stroke-width="2"/>
        </g>
      </svg>

      <!-- ================= 2.2 轨迹 Canvas 层 ================= -->
      <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none" style="z-index: 10;"></canvas>

      <!-- ================= 2.3 动态小人 ================= -->
      <div 
        class="absolute will-change-transform"
        :style="{ 
          transform: `translate(${currentPos.x}px, ${currentPos.y}px)`, 
          zIndex: 20 
        }"
        v-show="isReady"
      >
        <!-- 小人本体 (已修复 CSS 冲突) -->
        <div class="relative -top-3 -left-3 w-6 h-6 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full animate-ping bg-cyan-500/30"></div>
            <!-- 修复点：移除了 border-white，仅保留 border-cyan-400 -->
            <div class="w-4 h-4 rounded-full border-2 border-cyan-400 shadow-lg z-10 flex items-center justify-center bg-[#0B1121] shadow-[#22d3ee]">
               <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
            </div>
        </div>
      </div>
    </div>
    
    <!-- 隐形物理层 -->
    <canvas ref="collisionCanvasRef" class="hidden"></canvas>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import GlassCard from '@/components/Common/GlassCard.vue';
import { VideoPlay, VideoPause, RefreshRight, Share } from '@element-plus/icons-vue';

/* ================= 1. 地图数据 (1:1 还原) ================= */
const SVG_WALLS = [
  // 外轮廓
  `M 20 20 L 380 20 L 380 10 L 400 10 L 400 20 L 720 20 L 720 10 L 880 10 L 880 20 L 1080 20 
   L 1080 480 L 980 480 L 980 440 L 900 440 L 900 480 
   L 700 480 L 700 440 L 600 440 L 600 480 
   L 350 480 L 350 440 L 250 440 L 250 480 
   L 20 480 Z`,
  // 内部结构
  `M 960 80 L 960 380`, 
  `M 740 220 L 900 220 L 900 380`, 
  `M 820 220 L 820 380`, 
  `M 900 260 L 930 260`, 
  `M 900 340 L 930 340`, 
  `M 600 240 L 680 240 L 680 440`, 
  `M 600 100 L 640 100 L 640 180`, 
  `M 460 20 L 460 260 L 560 260`, 
  `M 560 260 L 560 360`, 
  `M 400 60 Q 430 90 430 160 L 430 260 L 500 260`,
  `M 220 120 L 380 120 L 380 320 L 300 320 L 300 200 L 220 200`,
  `M 20 140 L 120 140 L 120 180 L 160 180 L 160 20`,
  `M 20 340 L 60 340`,
];

const SVG_PILLARS = [
  { x: 100, y: 260, w: 25, h: 25 }, { x: 180, y: 260, w: 25, h: 25 },
  { x: 100, y: 340, w: 25, h: 25 }, { x: 180, y: 340, w: 25, h: 25 },
  { x: 100, y: 420, w: 25, h: 25 }, { x: 180, y: 420, w: 25, h: 25 },
];

/* ================= 2. 配置与状态 ================= */
const CONFIG = {
  SPEED: 1,
  SENSOR_DIST: 55,
  WANDER_FORCE: 0.25, 
  WALL_THICKNESS: 20,
  MAX_TRAIL: 120
};

const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const collisionCanvasRef = ref<HTMLCanvasElement | null>(null);

const isRunning = ref(false);
const isReady = ref(false);
const showTrajectory = ref(true);
const collisionDetected = ref(false);
const fps = ref(0);

const currentPos = reactive({ x: 0, y: 0 });
const velocity = reactive({ angle: Math.PI });
const pathHistory = ref<{x: number, y: number}[]>([]); 

let animationFrameId: number;
let mapData: Uint8ClampedArray | null = null;
let mapWidth = 0, mapHeight = 0;
let scaleX = 1, scaleY = 1;
let resizeObserver: ResizeObserver | null = null;
let lastTime = 0;

/* ================= 3. 初始化与地图构建 ================= */
const initCollisionMap = () => {
  if (!collisionCanvasRef.value || !containerRef.value) return;
  const container = containerRef.value;
  if (container.clientWidth === 0) return;

  mapWidth = container.clientWidth;
  mapHeight = container.clientHeight;
  const canvas = collisionCanvasRef.value;
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  scaleX = mapWidth / 1100;
  scaleY = mapHeight / 500;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, mapWidth, mapHeight);
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#000000';
  ctx.lineWidth = CONFIG.WALL_THICKNESS;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  SVG_WALLS.forEach(d => {
    const p = new Path2D(d);
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.stroke(p);
    ctx.restore();
  });

  SVG_PILLARS.forEach(p => {
    ctx.fillRect(p.x * scaleX, p.y * scaleY, p.w * scaleX, p.h * scaleY);
  });

  mapData = ctx.getImageData(0, 0, mapWidth, mapHeight).data;
  initVisualCanvas();
  if (!isReady.value) findSafeStartPos();
  isReady.value = true;
};

// 视觉层初始化
const initVisualCanvas = () => {
  if (!canvasRef.value) return;
  const dpr = window.devicePixelRatio || 1;
  canvasRef.value.width = mapWidth * dpr;
  canvasRef.value.height = mapHeight * dpr;
  const ctx = canvasRef.value.getContext('2d');
  if (ctx) ctx.scale(dpr, dpr);
};

const findSafeStartPos = () => {
  currentPos.x = 80 * scaleX;
  currentPos.y = 300 * scaleY;
  pathHistory.value = [];
};

/* ================= 4. 物理逻辑 ================= */
const isWall = (x: number, y: number) => {
  if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return true;
  if (!mapData) return false;
  const idx = (Math.floor(y) * mapWidth + Math.floor(x)) * 4;
  return mapData[idx] < 128; 
};

const updatePhysics = () => {
  if (!isReady.value) return;

  const sensorX = currentPos.x + Math.cos(velocity.angle) * CONFIG.SENSOR_DIST;
  const sensorY = currentPos.y + Math.sin(velocity.angle) * CONFIG.SENSOR_DIST;
  
  const hit = isWall(sensorX, sensorY);
  collisionDetected.value = hit;

  if (hit) {
    velocity.angle += 0.3; 
  } else {
    velocity.angle += (Math.random() - 0.5) * CONFIG.WANDER_FORCE;
  }

  const nextX = currentPos.x + Math.cos(velocity.angle) * CONFIG.SPEED;
  const nextY = currentPos.y + Math.sin(velocity.angle) * CONFIG.SPEED;

  if (isWall(nextX, nextY)) {
    velocity.angle += Math.PI * 0.9; 
  } else {
    currentPos.x = nextX;
    currentPos.y = nextY;
  }
  
  pathHistory.value.push({x: currentPos.x, y: currentPos.y});
  if (pathHistory.value.length > CONFIG.MAX_TRAIL) {
    pathHistory.value.shift();
  }
};

/* ================= 5. 轨迹绘制 ================= */
const drawTrajectory = () => {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, mapWidth, mapHeight);
  if (!showTrajectory.value) return;

  if (pathHistory.value.length < 2) return;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;

  const totalPoints = pathHistory.value.length;
  for (let i = 0; i < totalPoints - 1; i++) {
    const pt1 = pathHistory.value[i];
    const pt2 = pathHistory.value[i + 1];
    const alpha = (i / totalPoints);
    
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`; 
    ctx.stroke();
  }
  
  if (totalPoints > 0) {
    const head = pathHistory.value[totalPoints - 1];
    ctx.beginPath();
    ctx.arc(head.x, head.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();
  }
};

const animate = (time: number) => {
  if (!isRunning.value) return;
  const delta = time - lastTime;
  if (delta >= 1000) {
    fps.value = Math.round(1000 / (delta / 60));
    lastTime = time;
  }
  updatePhysics();
  drawTrajectory();
  animationFrameId = requestAnimationFrame(animate);
};

/* ================= 6. 控制 ================= */
const startSimulation = () => {
  if (!isReady.value) initCollisionMap();
  isRunning.value = true;
  lastTime = performance.now();
  animate(lastTime);
};

const stopSimulation = () => {
  isRunning.value = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
};

const resetSimulation = () => {
  stopSimulation();
  findSafeStartPos();
  const ctx = canvasRef.value?.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, mapWidth, mapHeight);
};

const toggleTrajectory = () => showTrajectory.value = !showTrajectory.value;

onMounted(() => {
  if (!containerRef.value) return;
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect.width > 0) {
        stopSimulation();
        initCollisionMap();
      }
    }
  });
  resizeObserver.observe(containerRef.value);
});

onUnmounted(() => {
  stopSimulation();
  if (resizeObserver) resizeObserver.disconnect();
});
</script>
