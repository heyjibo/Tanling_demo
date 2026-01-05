<template>
  <div class="h-full flex flex-col gap-4">
    <!-- ==================== 0. 顶部全局切换栏 ==================== -->
    <GlassCard class="flex-none p-3 flex justify-between items-center bg-slate-800/80">
      <div class="flex items-center gap-3">
        <el-avatar :size="32" :icon="isAdmin ? 'Management' : 'UserFilled'" :class="isAdmin ? 'bg-purple-500' : 'bg-cyan-500'" />
        <span class="text-slate-200 font-bold text-lg">{{ isAdmin ? '管理员控制台' : '室内定位 - 个人终端' }}</span>
      </div>
      <el-button 
        :type="isAdmin ? 'primary' : 'warning'" 
        @click="switchMode" 
        round
      >
        <el-icon class="mr-2"><Switch /></el-icon>
        切换到{{ isAdmin ? '个人端' : '管理端' }}
      </el-button>
    </GlassCard>

    <!-- ==================== A. 个人端视图 ==================== -->
    <GlassCard v-if="!isAdmin" title="b) 超声波室内高精定位 " class="flex-1 flex flex-col min-h-0">
      <!-- 1. 顶部控制栏 -->
      <div class="flex-none flex justify-between items-center mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
        <div class="flex items-center gap-4">
          <!-- 状态标签 -->
          <el-tag v-if="!isHistoryMode" :type="collisionDetected ? 'danger' : 'success'" effect="dark" class="font-mono transition-colors duration-200">
            {{ collisionDetected ? '避障转向' : '正常巡检' }}
          </el-tag>
          <el-tag v-else type="warning" effect="dark" class="font-mono">
            历史回放模式
          </el-tag>
          
          <div class="text-xs text-slate-400 font-mono flex gap-3">
            <span v-if="!isHistoryMode">X: {{ currentPos.x.toFixed(0) }}</span>
            <span v-if="!isHistoryMode">Y: {{ currentPos.y.toFixed(0) }}</span>
            <span v-if="!isHistoryMode">FPS: {{ fps }}</span>
            <span v-else class="text-orange-400 font-bold">正在查看: {{ historyRangeLabel }}</span>
          </div>
        </div>
        
        <el-button-group>
          <!-- 历史轨迹按钮 -->
          <el-button type="primary" plain size="small" @click="openHistoryDialog" :disabled="isRunning">
             <el-icon class="mr-1"><Clock /></el-icon> 历史轨迹
          </el-button>

          <el-button type="primary" size="small" @click="startSimulation" :disabled="isRunning || !isReady || isHistoryMode">
            <el-icon class="mr-1"><VideoPlay /></el-icon> 启动
          </el-button>
          <el-button type="warning" size="small" @click="stopSimulation" :disabled="!isRunning">
            <el-icon class="mr-1"><VideoPause /></el-icon> 暂停
          </el-button>
          <el-button type="info" size="small" @click="toggleTrajectory" :disabled="isHistoryMode">
            <el-icon class="mr-1"><Share /></el-icon> {{ showTrajectory ? '隐藏轨迹' : '显示轨迹' }}
          </el-button>
          <el-button type="danger" size="small" @click="resetSimulation">
            <el-icon class="mr-1"><RefreshRight /></el-icon> {{ isHistoryMode ? '退出回放' : '重置' }}
          </el-button>
        </el-button-group>
      </div>

      <!-- 2. 地图容器 (添加 min-h 确保显示) -->
      <div 
        class="relative flex-1 w-full min-h-[60vh] bg-[#0B1121] rounded-xl overflow-hidden border border-slate-700 shadow-inner select-none" 
        ref="containerRef"
      >
        <!-- 2.1 SVG 地图层 -->
        <svg 
          class="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 1100 500" 
          preserveAspectRatio="none"
        >
          <defs>
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
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" stroke-width="0.5"/>
            </pattern>
          </defs>

          <!-- 背景网格 -->
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1" />

          <!-- 墙体与结构 -->
          <g stroke="#0ea5e9" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#neon-glow)">
             <path v-for="(d, i) in SVG_WALLS" :key="'w'+i" :d="d" class="drop-shadow-lg" />
             <rect v-for="(r, i) in SVG_PILLARS" :key="'p'+i" :x="r.x" :y="r.y" :width="r.w" :height="r.h" fill="#0ea5e9" stroke="none" opacity="0.8" />
             <rect x="960" y="220" width="40" height="60" fill="url(#stairs)" stroke="#0ea5e9" stroke-width="2"/>
          </g>
        </svg>

        <!-- 2.2 Canvas 层 (用于绘制实时轨迹 或 历史轨迹) -->
        <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none" style="z-index: 10;"></canvas>

        <!-- 2.3 动态小人 (仅在非历史模式显示) -->
        <div 
          class="absolute will-change-transform transition-transform duration-100 ease-linear"
          :style="{ 
            transform: `translate(${currentPos.x}px, ${currentPos.y}px)`, 
            zIndex: 20 
          }"
          v-show="isReady && !isHistoryMode"
        >
          <div class="relative -top-3 -left-3 w-6 h-6 flex items-center justify-center">
              <div class="absolute inset-0 rounded-full animate-ping bg-cyan-500/30"></div>
              <div class="w-4 h-4 rounded-full border-2 border-cyan-400 shadow-lg z-10 flex items-center justify-center bg-[#0B1121] shadow-[#22d3ee]">
                 <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
              </div>
          </div>
        </div>

        <!-- 2.4 历史回放图例 -->
        <div v-if="isHistoryMode" class="absolute top-4 right-4 bg-slate-900/80 p-3 rounded-lg border border-slate-700 z-30 shadow-xl backdrop-blur-sm">
          <div class="text-xs text-slate-400 mb-2 font-bold">图例说明</div>
          <div class="flex items-center gap-2 mb-1">
             <div class="w-3 h-3 rounded-full bg-orange-400 border border-white/20"></div>
             <span class="text-xs text-slate-300">历史路径</span>
          </div>
          <div class="flex items-center gap-2">
             <div class="w-3 h-3 rounded-full bg-red-500 border border-white/20"></div>
             <span class="text-xs text-slate-300">常驻停留点</span>
          </div>
        </div>
      </div>
      
      <!-- 隐形物理层 (用于碰撞检测) -->
      <canvas ref="collisionCanvasRef" class="hidden"></canvas>

      <!-- 历史轨迹选择对话框 -->
      <el-dialog v-model="historyDialogVisible" title="选择历史轨迹时间段" width="450px" class="glass-dialog" append-to-body>
        <div class="flex flex-col gap-6 py-4">
          <div class="flex flex-col items-center gap-3">
            <span class="text-slate-400 text-sm">请选择回溯时间范围</span>
            <el-radio-group v-model="selectedHistoryRange" size="large" class="w-full flex justify-center">
              <el-radio-button label="1h">近1小时</el-radio-button>
              <el-radio-button label="24h">近1天</el-radio-button>
              <el-radio-button label="10d">近10天</el-radio-button>
            </el-radio-group>
          </div>

          <div class="bg-slate-800/50 p-5 rounded-lg border border-slate-700 text-sm text-slate-300 shadow-inner">
            <h4 class="text-slate-200 font-bold mb-3 border-b border-slate-700 pb-2">数据统计预览</h4>
            <p class="mb-2 flex justify-between"><span>记录数据点：</span> <span class="text-cyan-400 font-mono font-bold">{{ getHistoryStats.points }}</span></p>
            <p class="mb-2 flex justify-between"><span>累计里程：</span> <span class="text-cyan-400 font-mono font-bold">{{ getHistoryStats.distance }} m</span></p>
            <p class="flex justify-between"><span>主要活动区域：</span> <span class="text-cyan-400">A区办公区 / B区走廊</span></p>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="historyDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmHistoryView">
              <el-icon class="mr-1"><VideoPlay /></el-icon> 加载并回放
            </el-button>
          </span>
        </template>
      </el-dialog>
    </GlassCard>

    <!-- ==================== B. 管理端视图 ==================== -->
    <GlassCard v-else class="flex-1 overflow-hidden flex flex-col min-h-0">
      <el-tabs v-model="activeAdminTab" class="h-full flex flex-col demo-tabs">
        
        <!-- Tab 1: 用户管理 -->
        <el-tab-pane label="用户管理" name="users" class="h-full">
          <div class="flex flex-col h-full gap-4">
            <div class="flex justify-between items-center">
              <div class="flex gap-2">
                <el-input v-model="searchQuery" placeholder="搜索用户..." prefix-icon="Search" class="w-64" />
                <el-select v-model="filterStatus" placeholder="状态" class="w-32">
                  <el-option label="全部" value="" />
                  <el-option label="在线" value="online" />
                  <el-option label="离线" value="offline" />
                </el-select>
              </div>
              <el-button type="primary" @click="handleAddUser">
                <el-icon class="mr-1"><Plus /></el-icon> 新增用户
              </el-button>
            </div>

            <el-table :data="filteredUsers" style="width: 100%" height="100%" class="rounded-lg bg-transparent">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="用户名" width="150" />
              <el-table-column label="状态" width="120">
                <template #default="scope">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" :class="scope.row.status === 'online' ? 'bg-green-500' : 'bg-slate-500'"></div>
                    <span :class="scope.row.status === 'online' ? 'text-green-400' : 'text-slate-400'">
                      {{ scope.row.status === 'online' ? '在线' : '离线' }}
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="lastActive" label="最后活跃时间" width="200" />
              <el-table-column prop="device" label="设备ID" />
              <el-table-column label="操作" width="250" fixed="right">
                <template #default="scope">
                  <el-button link type="primary" size="small" @click="viewHistory(scope.row)">
                    <el-icon class="mr-1"><Location /></el-icon> 轨迹
                  </el-button>
                  <el-button link type="warning" size="small" @click="handleEditUser(scope.row)">
                    <el-icon class="mr-1"><Edit /></el-icon> 编辑
                  </el-button>
                  <el-button link type="danger" size="small" @click="handleDeleteUser(scope.row)">
                    <el-icon class="mr-1"><Delete /></el-icon> 删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- Tab 2: 实时监控 -->
        <el-tab-pane label="全域监控" name="monitor" class="h-full">
          <div class="flex h-full gap-4">
             <div class="w-64 bg-slate-800/30 rounded-lg p-2 overflow-y-auto border border-slate-700/50">
                <div class="text-sm text-slate-400 mb-2 px-2 font-bold">在线设备 ({{ mockUsers.filter(u=>u.status==='online').length }})</div>
                <div 
                  v-for="user in mockUsers.filter(u => u.status === 'online')" 
                  :key="user.id"
                  class="p-2 mb-1 rounded hover:bg-slate-700/50 cursor-pointer flex justify-between items-center transition-colors"
                >
                  <span class="text-slate-200 text-sm">{{ user.name }}</span>
                  <el-tag size="small" type="success" effect="dark" class="scale-90">RF: -45dBm</el-tag>
                </div>
             </div>
             <div class="flex-1 bg-slate-900 rounded-lg relative overflow-hidden border border-slate-700 flex items-center justify-center">
                <svg viewBox="0 0 1100 500" class="w-full h-full opacity-50 select-none pointer-events-none">
                   <g stroke="#0ea5e9" stroke-width="4" fill="none">
                     <path v-for="(d, i) in SVG_WALLS" :key="'mw'+i" :d="d" />
                   </g>
                </svg>
                <div class="absolute inset-0">
                  <div class="absolute top-1/2 left-1/3 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-slate-800 px-1 rounded">张三</div>
                  </div>
                   <div class="absolute top-1/3 left-2/3 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-slate-800 px-1 rounded">李四</div>
                  </div>
                </div>
                <div class="absolute bottom-4 right-4 text-slate-500 text-xs font-mono border border-slate-700 px-2 py-1 rounded">
                  LIVE MONITORING MODE
                </div>
             </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3: 地图配置 -->
        <el-tab-pane label="地图配置" name="map" class="h-full">
           <div class="flex flex-col items-center justify-center h-full gap-6">
              <div class="w-full max-w-2xl bg-slate-800/50 p-8 rounded-xl border border-dashed border-slate-600 hover:border-cyan-500 transition-colors">
                <el-upload
                  class="upload-demo w-full"
                  drag
                  action="#"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  accept=".dxf,.dwg"
                  multiple
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text text-slate-300">
                    拖拽 CAD 文件 (.dxf, .dwg) 到此处或 <em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip text-slate-500 text-center mt-2">
                      支持 AutoCAD 格式文件，单文件大小不超过 50MB
                    </div>
                  </template>
                </el-upload>
              </div>
              
              <div class="w-full max-w-2xl">
                <h3 class="text-slate-300 mb-3 font-bold">已加载地图</h3>
                <el-table :data="mapFiles" style="width: 100%" class="bg-transparent">
                  <el-table-column prop="name" label="文件名" />
                  <el-table-column prop="size" label="大小" width="120" />
                  <el-table-column prop="date" label="上传日期" width="180" />
                  <el-table-column label="操作" width="120">
                     <template #default>
                        <el-button link type="danger">删除</el-button>
                     </template>
                  </el-table-column>
                </el-table>
              </div>
           </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 用户编辑对话框 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" class="glass-dialog" append-to-body>
        <el-form :model="userForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="userForm.name" />
          </el-form-item>
          <el-form-item label="设备ID">
             <el-input v-model="userForm.device" />
          </el-form-item>
          <el-form-item label="权限">
            <el-select v-model="userForm.role" class="w-full">
              <el-option label="普通用户" value="user" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveUser">确认</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 管理员端-查看用户历史轨迹 (Mock) -->
      <el-dialog v-model="historyVisible" title="用户历史轨迹回放" width="800px" class="glass-dialog" append-to-body>
         <div class="h-[400px] bg-slate-900 rounded border border-slate-700 flex items-center justify-center text-slate-400">
            <div class="text-center">
              <el-icon :size="40" class="mb-2"><VideoPlay /></el-icon>
              <p>正在回放用户 [{{ currentUser?.name }}] 2026-01-05 的轨迹数据...</p>
            </div>
         </div>
      </el-dialog>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed, nextTick } from 'vue';
import GlassCard from '@/components/Common/GlassCard.vue';
import { 
  VideoPlay, VideoPause, RefreshRight, Share, 
  Switch, UserFilled, Management, Plus, Search, 
  Edit, Delete, Location, UploadFilled, Clock
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// ======================= 1. 数据常量与配置 =======================

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

const CONFIG = {
  SPEED: 1,
  SENSOR_DIST: 55,
  WANDER_FORCE: 0.25, 
  WALL_THICKNESS: 20,
  MAX_TRAIL: 120
};

// ======================= 2. 全局状态与物理引擎状态 =======================

const isAdmin = ref(false); // 模式切换
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

// 个人端 - 历史回放状态
const isHistoryMode = ref(false);
const historyDialogVisible = ref(false);
const selectedHistoryRange = ref('1h');

let animationFrameId: number;
let mapData: Uint8ClampedArray | null = null;
let mapWidth = 0, mapHeight = 0;
let scaleX = 1, scaleY = 1;
let resizeObserver: ResizeObserver | null = null;
let lastTime = 0;

// ======================= 3. 计算属性 =======================

const historyRangeLabel = computed(() => {
  const map: Record<string, string> = { '1h': '1小时', '24h': '1天', '10d': '10天' };
  return map[selectedHistoryRange.value];
});

const getHistoryStats = computed(() => {
  const stats = { 
    '1h': { points: 120, distance: 450 }, 
    '24h': { points: 2800, distance: 8500 }, 
    '10d': { points: 15000, distance: 92000 } 
  };
  return stats[selectedHistoryRange.value as keyof typeof stats];
});

// ======================= 4. 物理引擎与地图初始化 =======================

const initCollisionMap = () => {
  if (!collisionCanvasRef.value || !containerRef.value) return;
  const container = containerRef.value;
  
  // 关键修复：确保获取到真实的高度
  mapWidth = container.clientWidth || 1100;
  mapHeight = container.clientHeight || 500;
  
  if (mapWidth === 0 || mapHeight === 0) return;

  const canvas = collisionCanvasRef.value;
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  scaleX = mapWidth / 1100;
  scaleY = mapHeight / 500;

  // 1. 绘制白底
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, mapWidth, mapHeight);
  
  // 2. 绘制黑色障碍物（墙体）
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

  // 3. 提取像素数据用于碰撞检测
  mapData = ctx.getImageData(0, 0, mapWidth, mapHeight).data;
  
  // 4. 初始化视觉层
    initVisualCanvas();
  
  if (!isReady.value) {
    findSafeStartPos();
  }
  isReady.value = true;
};

const initVisualCanvas = () => {
  if (!canvasRef.value) return;
  const dpr = window.devicePixelRatio || 1;
  // 确保视觉 Canvas 与容器尺寸一致
  canvasRef.value.width = mapWidth * dpr;
  canvasRef.value.height = mapHeight * dpr;
  const ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, mapWidth, mapHeight);
  }
};

const findSafeStartPos = () => {
  currentPos.x = 80 * scaleX;
  currentPos.y = 300 * scaleY;
  pathHistory.value = [];
};

const isWall = (x: number, y: number) => {
  if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return true;
  if (!mapData) return false;
  const idx = (Math.floor(y) * mapWidth + Math.floor(x)) * 4;
  return mapData[idx] < 128; // 黑色部分为墙
};

const updatePhysics = () => {
  if (!isReady.value) return;

  // 虚拟传感器探测
  const sensorX = currentPos.x + Math.cos(velocity.angle) * CONFIG.SENSOR_DIST;
  const sensorY = currentPos.y + Math.sin(velocity.angle) * CONFIG.SENSOR_DIST;
  
  const hit = isWall(sensorX, sensorY);
  collisionDetected.value = hit;

  if (hit) {
    // 遇到障碍，大幅转向
    velocity.angle += 0.3; 
  } else {
    // 随机漫步
    velocity.angle += (Math.random() - 0.5) * CONFIG.WANDER_FORCE;
  }

  const nextX = currentPos.x + Math.cos(velocity.angle) * CONFIG.SPEED;
  const nextY = currentPos.y + Math.sin(velocity.angle) * CONFIG.SPEED;

  if (isWall(nextX, nextY)) {
    // 直接撞墙，反弹
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

// ======================= 5. 个人端 - 控制逻辑 =======================

const startSimulation = () => {
  if (isHistoryMode.value) return;
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
  
  if (isHistoryMode.value) {
    // 退出历史模式
    isHistoryMode.value = false;
    const ctx = canvasRef.value?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, mapWidth, mapHeight);
    pathHistory.value = [];
    ElMessage.info('已退出历史回放模式');
  } else {
    // 重置实时仿真
    findSafeStartPos();
    const ctx = canvasRef.value?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, mapWidth, mapHeight);
    pathHistory.value = [];
  }
};

const toggleTrajectory = () => {
  if (isHistoryMode.value) return;
  showTrajectory.value = !showTrajectory.value;
};

// ======================= 6. 个人端 - 历史轨迹逻辑 =======================

const openHistoryDialog = () => {
  historyDialogVisible.value = true;
};

// 生成模拟历史路径（带有碰撞检测，避免穿墙）
const generateMockHistory = (count: number) => {
  const points = [];
  let cx = 80 * scaleX;
  let cy = 300 * scaleY;
  let angle = 0;
  
  for(let i=0; i<count; i++) {
    angle += (Math.random() - 0.5) * 1.5;
    const nx = cx + Math.cos(angle) * 5;
    const ny = cy + Math.sin(angle) * 5;
    
    if (!isWall(nx, ny)) {
      cx = nx;
      cy = ny;
      points.push({x: cx, y: cy});
    } else {
      angle += Math.PI; // 简单的反弹
    }
  }
  return points;
};

const confirmHistoryView = () => {
  historyDialogVisible.value = false;
  stopSimulation(); 
  isHistoryMode.value = true;
  
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, mapWidth, mapHeight);
  
  ElMessage.success(`正在加载 ${historyRangeLabel.value} 的数据...`);
  
  // 模拟数据量
  const pointCount = Math.min(getHistoryStats.value.points, 2000); // 限制绘制点数防止卡顿
  const historyPoints = generateMockHistory(pointCount);
  
  // 绘制橙色历史轨迹
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fb923c'; // Orange-400
  
  ctx.beginPath();
  if (historyPoints.length > 0) {
    ctx.moveTo(historyPoints[0].x, historyPoints[0].y);
    for (let i = 1; i < historyPoints.length; i++) {
      ctx.lineTo(historyPoints[i].x, historyPoints[i].y);
    }
    ctx.stroke();
  }

  // 随机绘制红色“停留点”
  const stopPoints = Math.min(5, Math.floor(historyPoints.length / 50));
  for(let i=0; i<stopPoints; i++) {
    const idx = Math.floor(Math.random() * historyPoints.length);
    const p = historyPoints[idx];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444'; // Red-500
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

// ======================= 7. 管理端逻辑 =======================

const activeAdminTab = ref('users');
const searchQuery = ref('');
const filterStatus = ref('');
const dialogVisible = ref(false);
const historyVisible = ref(false);
const dialogTitle = ref('新增用户');

const mockUsers = ref([
  { id: 1001, name: '张三', status: 'online', lastActive: '2026-01-05 14:30:00', device: 'UWB-TAG-01', role: 'user' },
  { id: 1002, name: '李四', status: 'offline', lastActive: '2026-01-04 18:00:00', device: 'UWB-TAG-02', role: 'user' },
  { id: 1003, name: 'Admin', status: 'online', lastActive: '2026-01-05 15:00:00', device: 'PC-CONSOLE', role: 'admin' },
  { id: 1004, name: '巡检机器人A', status: 'online', lastActive: '2026-01-05 15:05:00', device: 'BOT-001', role: 'user' },
]);

const mapFiles = ref([
  { name: 'Floor_1_Main.dxf', size: '2.4 MB', date: '2025-12-10' },
  { name: 'Basement_Structure.dwg', size: '5.1 MB', date: '2025-11-05' },
]);

const userForm = reactive({
  id: 0,
  name: '',
  device: '',
  role: 'user',
  status: 'offline'
});

const currentUser = ref<any>(null);

const filteredUsers = computed(() => {
  return mockUsers.value.filter(user => {
    const matchName = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                      user.device.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus = filterStatus.value ? user.status === filterStatus.value : true;
    return matchName && matchStatus;
  });
});

const switchMode = () => {
  if (!isAdmin.value) {
    stopSimulation();
    isAdmin.value = true;
  } else {
    isAdmin.value = false;
    // 切换回个人端，重新初始化地图
    nextTick(() => {
      setTimeout(() => {
        if (containerRef.value) initCollisionMap();
      }, 50);
    });
  }
};

const handleAddUser = () => {
  dialogTitle.value = '新增用户';
  userForm.id = 0;
  userForm.name = '';
  userForm.device = '';
  userForm.role = 'user';
  dialogVisible.value = true;
};

const handleEditUser = (row: any) => {
  dialogTitle.value = '编辑用户';
  Object.assign(userForm, row);
  dialogVisible.value = true;
};

const handleDeleteUser = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.name}" 吗？`,
    '警告',
    { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    const index = mockUsers.value.findIndex(u => u.id === row.id);
    if (index !== -1) {
      mockUsers.value.splice(index, 1);
      ElMessage.success('删除成功');
    }
  }).catch(() => {});
};

const saveUser = () => {
  if (!userForm.name || !userForm.device) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  
  if (userForm.id === 0) {
    mockUsers.value.push({
      id: Date.now(),
      name: userForm.name,
      device: userForm.device,
      role: userForm.role,
      status: 'offline',
      lastActive: '-'
    });
    ElMessage.success('用户添加成功');
  } else {
    const index = mockUsers.value.findIndex(u => u.id === userForm.id);
    if (index !== -1) {
      Object.assign(mockUsers.value[index], userForm);
      ElMessage.success('用户信息更新成功');
    }
  }
  dialogVisible.value = false;
};

const viewHistory = (row: any) => {
  currentUser.value = row;
  historyVisible.value = true;
};

const handleFileChange = (file: any) => {
  const fileName = file.name;
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  
  if (ext !== '.dxf' && ext !== '.dwg') {
    ElMessage.error('仅支持上传 .dxf 或 .dwg 格式的 CAD 文件');
    return false;
  }
  
  ElMessage.success(`文件 ${fileName} 校验通过，正在解析...`);
  setTimeout(() => {
    mapFiles.value.unshift({
      name: fileName,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toISOString().split('T')[0]
    });
  }, 1000);
};

// ======================= 8. 生命周期 =======================

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && !isAdmin.value && !isHistoryMode.value) {
          stopSimulation();
          initCollisionMap();
        }
      }
    });
    resizeObserver.observe(containerRef.value);
    
    // 强制首次初始化
    nextTick(() => {
       initCollisionMap();
    });
  }
});

onUnmounted(() => {
  stopSimulation();
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
/* Element Plus 表格透明化样式 */
:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(30, 41, 59, 0.5);
  --el-table-text-color: #cbd5e1;
  --el-table-header-text-color: #e2e8f0;
  --el-table-row-hover-bg-color: rgba(56, 189, 248, 0.1);
  --el-table-border-color: #334155;
}

:deep(.el-table__inner-wrapper::before) {
  background-color: #334155;
}

/* 玻璃拟态对话框 */
:deep(.glass-dialog) {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

:deep(.glass-dialog .el-dialog__title) {
  color: #f1f5f9;
}

:deep(.glass-dialog .el-dialog__body) {
  color: #cbd5e1;
}

/* Tabs 样式定制 */
:deep(.el-tabs__item) {
  color: #94a3b8;
}
:deep(.el-tabs__item.is-active) {
  color: #38bdf8;
}
:deep(.el-tabs__nav-wrap::after) {
  background-color: #334155;
}
:deep(.el-upload-dragger) {
  background-color: transparent;
  border-color: #475569;
}
:deep(.el-upload-dragger:hover) {
  border-color: #38bdf8;
  background-color: rgba(56, 189, 248, 0.05);
}

/* Radio Button 样式覆盖 */
:deep(.el-radio-button__inner) {
  background: transparent;
  border-color: #475569;
  color: #94a3b8;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #0ea5e9;
  border-color: #0ea5e9;
  color: white;
  box-shadow: -1px 0 0 0 #0ea5e9;
}
</style>
