<template>
  <div class="h-full flex flex-col gap-4 p-4">
    <!-- ==================== 0. 顶部全局切换栏 ==================== -->
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

    <GlassCard class="flex-none !p-0 bg-slate-800/80 overflow-hidden">
      <div class="flex items-center justify-between w-full p-3">
        <!-- 左侧：Logo 与标题 -->
        <div class="flex items-center gap-4">
          <div class="relative">
            <el-avatar 
              :size="40" 
              :icon="isAdmin ? 'Management' : 'UserFilled'" 
              :class="isAdmin ? 'bg-purple-600' : 'bg-cyan-600'" 
              class="shadow-lg shadow-cyan-500/20"
            />
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </div>
          <div class="flex flex-col">
            <span class="text-slate-100 font-bold text-lg leading-tight tracking-wide">
              {{ isAdmin ? '管理员控制台' : '室内定位 - 个人终端' }}
            </span>
            <span class="text-slate-400 text-xs font-mono">
              {{ isAdmin ? 'SYSTEM: ADMIN_ROOT' : 'ID: USER_8842_X' }}
            </span>
          </div>
        </div>

        <!-- 右侧：切换按钮 -->
        <el-button 
          :type="isAdmin ? 'primary' : 'warning'" 
          @click="switchMode" 
          round
          class="ml-auto shadow-md transition-all hover:scale-105"
        >
          <el-icon class="mr-2"><Switch /></el-icon>
          <span class="font-bold">切换到{{ isAdmin ? '个人端' : '管理端' }}</span>
        </el-button>
      </div>
    </GlassCard>

    <!-- ==================== A. 个人端视图 ==================== -->
    <GlassCard v-if="!isAdmin" title="b) 超声波室内高精定位 " class="flex-1 flex flex-col min-h-0">
      <!-- 1. 顶部控制栏 -->
      <div class="flex-none flex justify-between items-center mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
        <div class="flex items-center gap-4">
          <!-- 状态标签 -->
          <el-tag v-if="!isHistoryMode" :type="collisionDetected ? 'danger' : 'success'" effect="dark" class="font-mono transition-colors duration-200">
            {{ collisionDetected ? '定位中' : '定位中' }}
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

      <!-- 地图容器 (核心优化) -->
      <div 
        class="relative flex-1 w-full min-h-[60vh] bg-[#0a0e17] rounded-xl overflow-hidden border border-slate-700 shadow-inner select-none" 
        ref="containerRef"
        v-loading="!mapLoaded"
        element-loading-text="正在加载 SVG 地图..."
        element-loading-background="rgba(10, 14, 23, 0.95)"
        element-loading-spinner="el-icon-loading"
      >
        <!-- 网格背景 (提升层次感) -->
        <div class="absolute inset-0 pointer-events-none bg-grid opacity-10"></div>
        
        <!-- 1. SVG 地图显示层 (优化渲染) -->
        <div 
          v-if="mapLoaded"
          v-html="svgContent"
          class="absolute inset-0 w-full h-full inner-svg-wrapper map-fade-in"
        ></div>

        <!-- 2. Canvas 轨迹层 -->
        <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none" style="z-index: 10;"></canvas>

        <!-- 3. 动态定位小人 (优化视觉) -->
        <div 
          class="absolute will-change-transform transition-transform duration-100 ease-linear"
          :style="{ transform: `translate(${currentPos.x}px, ${currentPos.y}px)`, zIndex: 20 }"
          v-show="isReady && !isHistoryMode"
        >
          <div class="relative -top-3 -left-3 w-6 h-6 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full animate-ping bg-cyan-500/30 shadow-lg shadow-cyan-500/20"></div>
      
              <div class="w-4 h-4 rounded-full border-2 border-cyan-400 z-10 flex items-center justify-center bg-[#0a0e17] shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
              </div>
            </div>
          </div>
        </div>

      <!-- 隐形碰撞检测Canvas -->
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

        <!-- Tab 2: 全域监控 -->
        <el-tab-pane label="全域监控" name="monitor" class="h-full">
          <div class="flex h-full gap-4">
             <!-- 左侧在线设备列表 -->
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

             <!-- 右侧地图区域 (优化显示) -->
             <div class="flex-1 bg-[#0a0e17] rounded-lg relative overflow-hidden border border-slate-700 flex items-center justify-center">
                <!-- 网格背景 -->
                <div class="absolute inset-0 pointer-events-none bg-grid opacity-8"></div>
                
                <!-- 1. 地图层 -->
                <div v-if="mapLoaded" class="w-full h-full select-none pointer-events-none admin-map-container">
                   <div v-html="svgContent" class="w-full h-full inner-svg-wrapper admin-svg-style"></div>
                </div>

                <!-- 2. Loading 状态 -->
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <el-icon class="is-loading mb-2" :size="30"><Loading /></el-icon>
                    <span class="text-slate-400">正在同步地图数据...</span>
                </div>

                <!-- 3. 用户定位标记 -->
                <div class="absolute inset-0" v-if="mapLoaded">
                  <div class="absolute top-1/2 left-1/3 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50 ring-1 ring-green-400/50">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-slate-800/90 px-1.5 py-0.5 rounded shadow-md">张三</div>
                  </div>
                   <div class="absolute top-1/3 left-2/3 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50 ring-1 ring-green-400/50">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-slate-800/90 px-1.5 py-0.5 rounded shadow-md">李四</div>
                  </div>
                </div>

                <div class="absolute bottom-4 right-4 text-slate-500 text-xs font-mono border border-slate-700 px-2 py-1 rounded bg-slate-800/70">
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
                  accept=".dxf,.dwg,.svg"
                  multiple
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text text-slate-300">
                    拖拽 CAD/SVG 文件 (.dxf, .dwg, .svg) 到此处或 <em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip text-slate-500 text-center mt-2">
                      当前使用的是系统预设：/src/assets/map/map.svg
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
      
      <!-- 历史轨迹回放对话框 -->
      <el-dialog v-model="historyVisible" title="用户历史轨迹回放" width="800px" class="glass-dialog" append-to-body>
         <div class="h-[400px] bg-[#0a0e17] rounded border border-slate-700 flex items-center justify-center text-slate-400 relative">
            <div class="absolute inset-0 pointer-events-none bg-grid opacity-10"></div>
            <div class="text-center relative z-10">
              <el-icon :size="40" class="mb-2 text-cyan-400"><VideoPlay /></el-icon>
              <p class="text-slate-300">正在回放用户 [{{ currentUser?.name }}] 2026-01-05 的轨迹数据...</p>
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
  Edit, Delete, Location, UploadFilled, Clock, Loading
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// ======================= 1. 基础配置 =======================
const emit = defineEmits(['back']);

// 地图核心配置
const svgContent = ref('');
const mapLoaded = ref(false);
const CONFIG = { 
  SPEED: 1.5, 
  SENSOR_DIST: 40, 
  WANDER_FORCE: 0.2, 
  WALL_THICKNESS: 15, 
  MAX_TRAIL: 200 
};

// ======================= 2. 全局状态 =======================
const isAdmin = ref(false); 
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

// 历史回放相关
const isHistoryMode = ref(false);
const historyDialogVisible = ref(false);
const selectedHistoryRange = ref('1h');

// 临时变量
let animationFrameId: number;
let mapData: Uint8ClampedArray | null = null;
let mapWidth = 0, mapHeight = 0;
let scaleX = 1, scaleY = 1;
let resizeObserver: ResizeObserver | null = null;
let lastTime = 0;

// ======================= 3. 地图加载逻辑 (核心优化) =======================
const loadMapFromFile = async () => {
  mapLoaded.value = false;
  isReady.value = false;
  
  try {
    // 1. 加载SVG地图文件
    const svgPath = '/src/assets/map/Untitled-Model.svg';
    const response = await fetch(svgPath); 
    
    if (!response.ok) throw new Error(`加载失败: ${response.status}`);
    
    // 2. 处理SVG内容
    let text = await response.text();
    // 优化SVG渲染属性
    text = text
      .replace(/width=".*?"/, 'width="100%"')
      .replace(/height=".*?"/, 'height="100%"')
      .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" preserveAspectRatio="xMidYMid meet"')
      .replace(/viewBox=".*?"/, 'viewBox="0 0 1000 600"');
    
    svgContent.value = text;
    mapLoaded.value = true;
    ElMessage.success('SVG 地图加载成功');

    // 3. 初始化碰撞检测
    nextTick(() => {
      initCollisionMap();
    });

  } catch (error) {
    // 降级处理：使用默认地图
    console.error('地图加载失败:', error);
    ElMessage.error('地图加载失败，使用默认地图');
    
    svgContent.value = `
      <svg width="100%" height="100%" viewBox="0 0 1000 600" style="background: #0a0e17; fill: #1e293b; stroke: #38bdf8; stroke-width: 2;">
        <rect x="50" y="50" width="900" height="500" fill="none" stroke="#2dd4bf" stroke-width="3"/>
        <line x1="300" y1="50" x2="300" y2="550" stroke="#2dd4bf" stroke-width="2"/>
        <line x1="600" y1="50" x2="600" y2="550" stroke="#2dd4bf" stroke-width="2"/>
        <line x1="50" y1="200" x2="950" y2="200" stroke="#2dd4bf" stroke-width="2"/>
        <line x1="50" y1="400" x2="950" y2="400" stroke="#2dd4bf" stroke-width="2"/>
        <text x="175" y="120" fill="#94a3b8" font-size="14">A区办公区</text>
        <text x="450" y="120" fill="#94a3b8" font-size="14">B区走廊</text>
        <text x="750" y="120" fill="#94a3b8" font-size="14">C区机房</text>
        <text x="175" y="320" fill="#94a3b8" font-size="14">D区会议室</text>
        <text x="450" y="320" fill="#94a3b8" font-size="14">E区过道</text>
        <text x="750" y="320" fill="#94a3b8" font-size="14">F区储藏室</text>
      </svg>
    `;
    mapLoaded.value = true;
    nextTick(() => initCollisionMap());
  }
};

// ======================= 4. 计算属性 =======================
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

// ======================= 5. 物理引擎 (优化精度) =======================
const initCollisionMap = () => {
  if (!mapLoaded.value || !containerRef.value || !collisionCanvasRef.value) return;

  const container = containerRef.value;
  mapWidth = container.clientWidth;
  mapHeight = container.clientHeight;
  
  // 适配设备像素比
  const dpr = window.devicePixelRatio || 1;
  const canvas = collisionCanvasRef.value;
  canvas.width = mapWidth * dpr;
  canvas.height = mapHeight * dpr;
  canvas.style.width = `${mapWidth}px`;
  canvas.style.height = `${mapHeight}px`;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  // 初始化背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, mapWidth, mapHeight);

  // 解析SVG
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent.value, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;

  // 计算缩放比例
  const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 1000, 600];
  const [x0, y0, svgW, svgH] = viewBox;
  const scale = Math.min(mapWidth / svgW, mapHeight / svgH);
  scaleX = scale;
  scaleY = scale;

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.translate(-x0, -y0);

  // 绘制障碍物
  ctx.strokeStyle = '#000000'; 
  ctx.fillStyle = '#000000';
  ctx.lineWidth = CONFIG.WALL_THICKNESS; 
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 处理Path
  const paths = svgDoc.querySelectorAll('path');
  paths.forEach(p => {
    const d = p.getAttribute('d');
    const stroke = p.getAttribute('stroke');
    const fill = p.getAttribute('fill');
    
    if (d) {
      const path2d = new Path2D(d);
      if (stroke && stroke !== 'none' && !stroke.includes('transparent')) {
         ctx.stroke(path2d);
      }
      if (fill && fill !== 'none' && fill !== '#ffffff' && !fill.includes('transparent')) {
         if (!fill.includes('#15803d') && !fill.includes('green')) { 
            ctx.fill(path2d);
         }
      }
    }
  });

  // 处理Rect
  const rects = svgDoc.querySelectorAll('rect');
  rects.forEach(r => {
      const x = Number(r.getAttribute('x') || 0);
      const y = Number(r.getAttribute('y') || 0);
      const w = Number(r.getAttribute('width') || 0);
      const h = Number(r.getAttribute('height') || 0);
      const fill = r.getAttribute('fill');
      
      if (w > 0 && h > 0 && !(w > svgW * 0.9 && h > svgH * 0.9)) {
        if (fill && fill !== 'none' && fill !== '#ffffff') {
           ctx.fillRect(x, y, w, h);
        } else {
           ctx.strokeRect(x, y, w, h);
        }
      }
  });

  // 处理Line
  const lines = svgDoc.querySelectorAll('line');
  lines.forEach(l => {
      const x1 = Number(l.getAttribute('x1') || 0);
      const y1 = Number(l.getAttribute('y1') || 0);
      const x2 = Number(l.getAttribute('x2') || 0);
      const y2 = Number(l.getAttribute('y2') || 0);
      const stroke = l.getAttribute('stroke');
      
      if (stroke && stroke !== 'none') {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

  ctx.restore();

  // 获取碰撞数据
  mapData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  
  // 初始化视觉Canvas
  initVisualCanvas(dpr);
  
  // 找安全起点
  if (!isReady.value) {
     findSafeStartPos();
  }
  isReady.value = true;
};

// 初始化视觉Canvas
const initVisualCanvas = (dpr: number) => {
  if (!canvasRef.value) return;
  canvasRef.value.width = mapWidth * dpr;
  canvasRef.value.height = mapHeight * dpr;
  canvasRef.value.style.width = `${mapWidth}px`;
  canvasRef.value.style.height = `${mapHeight}px`;
  const ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, mapWidth, mapHeight);
  }
};

// 查找安全起点
const findSafeStartPos = () => {
  const candidates = [
    {x: mapWidth * 0.2, y: mapHeight * 0.2},
    {x: mapWidth * 0.5, y: mapHeight * 0.5},
    {x: mapWidth * 0.8, y: mapHeight * 0.8}
  ];
  
  for (const pos of candidates) {
    if (!isWall(pos.x, pos.y)) {
      currentPos.x = pos.x;
      currentPos.y = pos.y;
      return;
    }
  }

  // 兜底
// 接续上文的findSafeStartPos兜底部分
  currentPos.x = 100;
  currentPos.y = 100;
  for (let y = 50; y < mapHeight - 50; y += 20) {
    for (let x = 50; x < mapWidth - 50; x += 20) {
      if (!isWall(x, y)) {
        currentPos.x = x;
        currentPos.y = y;
        return;
      }
    }
  }
};

// 碰撞检测核心函数（适配DPR）
const isWall = (x: number, y: number) => {
  if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return true;
  if (!mapData) return false;
  
  const dpr = window.devicePixelRatio || 1;
  const scaledX = Math.floor(x * dpr);
  const scaledY = Math.floor(y * dpr);
  const idx = (scaledY * Math.floor(mapWidth * dpr) + scaledX) * 4;
  
  return mapData[idx] < 128; 
};

// 物理引擎更新（优化碰撞反馈）
const updatePhysics = () => {
  if (!isReady.value) return;

  // 1. 传感器检测
  const sensorX = currentPos.x + Math.cos(velocity.angle) * CONFIG.SENSOR_DIST;
  const sensorY = currentPos.y + Math.sin(velocity.angle) * CONFIG.SENSOR_DIST;
  
  // 2. 碰撞状态更新
  const hit = isWall(sensorX, sensorY);
  collisionDetected.value = hit;

  // 3. 角度调整（优化转向平滑度）
  if (hit) {
    velocity.angle += 0.3 + Math.random() * 0.2; // 随机偏移避免卡死
  } else {
    velocity.angle += (Math.random() - 0.5) * CONFIG.WANDER_FORCE;
  }

  // 4. 位置更新
  const nextX = currentPos.x + Math.cos(velocity.angle) * CONFIG.SPEED;
  const nextY = currentPos.y + Math.sin(velocity.angle) * CONFIG.SPEED;

  if (isWall(nextX, nextY)) {
    velocity.angle += Math.PI * 0.9; // 碰撞后大幅转向
  } else {
    currentPos.x = nextX;
    currentPos.y = nextY;
  }
  
  // 5. 轨迹记录
  if (showTrajectory.value && isRunning.value) {
    pathHistory.value.push({x: currentPos.x, y: currentPos.y});
    if (pathHistory.value.length > CONFIG.MAX_TRAIL) {
      pathHistory.value.shift();
    }
  }
};

// 轨迹绘制（优化视觉效果）
const drawTrajectory = () => {
  if (!canvasRef.value || !showTrajectory.value || pathHistory.value.length < 2) return;
  
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  // 清屏（适配DPR）
  ctx.clearRect(0, 0, mapWidth * dpr, mapHeight * dpr);
  ctx.scale(dpr, dpr);

  // 绘制轨迹（渐变透明度）
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2;

  const totalPoints = pathHistory.value.length;
  for (let i = 0; i < totalPoints - 1; i++) {
    const pt1 = pathHistory.value[i];
    const pt2 = pathHistory.value[i + 1];
    const alpha = (i / totalPoints) * 0.8 + 0.2; // 透明度范围0.2-1.0
    
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`; 
    ctx.stroke();
  }
  
  // 绘制轨迹终点标记
  if (totalPoints > 0) {
    const head = pathHistory.value[totalPoints - 1];
    ctx.beginPath();
    ctx.arc(head.x, head.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();
  }
};

// 动画循环（优化FPS计算）
const animate = (time: number) => {
  if (!isRunning.value) return;
  
  // 计算FPS
  if (lastTime) {
    const delta = time - lastTime;
    fps.value = Math.round(1000 / delta);
  }
  lastTime = time;

  // 更新物理和绘制
  updatePhysics();
  drawTrajectory();
  
  // 循环调用
  animationFrameId = requestAnimationFrame(animate);
};

// ======================= 6. 控制逻辑 =======================
// 启动定位模拟
const startSimulation = () => {
  if (isRunning.value || !isReady.value || isHistoryMode.value) return;
  isRunning.value = true;
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(animate);
  ElMessage.success('定位模拟已启动');
};

// 暂停模拟
const stopSimulation = () => {
  if (!isRunning.value) return;
  isRunning.value = false;
  cancelAnimationFrame(animationFrameId);
  ElMessage.info('定位模拟已暂停');
};

// 重置模拟/退出回放
const resetSimulation = () => {
  stopSimulation();
  
  // 清空轨迹
  pathHistory.value = [];
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvasRef.value?.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, mapWidth * dpr, mapHeight * dpr);
  }

  // 退出历史回放模式
  if (isHistoryMode.value) {
    isHistoryMode.value = false;
    findSafeStartPos();
    ElMessage.info('已退出历史回放模式');
  } else {
    findSafeStartPos();
    ElMessage.info('定位模拟已重置');
  }
};

// 显示/隐藏轨迹
const toggleTrajectory = () => {
  showTrajectory.value = !showTrajectory.value;
  
  // 隐藏时清空轨迹绘制
  if (!showTrajectory.value && canvasRef.value) {
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, mapWidth * dpr, mapHeight * dpr);
    }
  } else if (showTrajectory.value) {
    drawTrajectory(); // 重新绘制
  }
  
  ElMessage.info(showTrajectory.value ? '轨迹已显示' : '轨迹已隐藏');
};

// ======================= 7. 历史回放逻辑 =======================
// 打开历史回放对话框
const openHistoryDialog = () => {
  if (isRunning.value) {
    ElMessage.warning('请先暂停定位模拟再查看历史轨迹');
    return;
  }
  historyDialogVisible.value = true;
};

// 确认加载历史轨迹
const confirmHistoryView = () => {
  historyDialogVisible.value = false;
  isHistoryMode.value = true;
  
  // 清空原有轨迹
  pathHistory.value = [];
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvasRef.value?.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, mapWidth * dpr, mapHeight * dpr);
  }

  // 模拟生成历史轨迹
  const stats = getHistoryStats.value;
  let cx = mapWidth * 0.5;
  let cy = mapHeight * 0.5;
  let angle = 0;
  
  for(let i=0; i<stats.points; i++) {
    angle += (Math.random() - 0.5) * 1.5;
    const nx = cx + Math.cos(angle) * 5;
    const ny = cy + Math.sin(angle) * 5;
    
    if (!isWall(nx, ny)) {
      cx = nx;
      cy = ny;
      pathHistory.value.push({x: cx, y: cy});
    } else {
      angle += Math.PI;
    }
  }

  // 绘制历史轨迹
  drawTrajectory();
  ElMessage.success(`已加载近${historyRangeLabel.value}的历史轨迹（共${stats.points}个数据点）`);
};

// ======================= 8. 管理端逻辑 =======================
// 管理端Tab切换
const activeAdminTab = ref('users');

// 模拟用户数据
const mockUsers = ref([
  { id: 1001, name: '张三', status: 'online', lastActive: '2026-01-05 14:30:00', device: 'UWB-TAG-01', role: 'user' },
  { id: 1002, name: '李四', status: 'offline', lastActive: '2026-01-04 18:00:00', device: 'UWB-TAG-02', role: 'user' },
  { id: 1003, name: '系统管理员', status: 'online', lastActive: '2026-01-05 15:00:00', device: 'PC-CONSOLE', role: 'admin' },
]);

// 模拟地图文件列表
const mapFiles = ref([
  { name: 'map.dxf', size: '3.2 MB', date: '2026-01-06 10:20:30' }, 
  { name: 'Basement_Structure.dwg', size: '5.1 MB', date: '2025-12-28 15:45:12' },
  { name: 'office_layout.svg', size: '1.8 MB', date: '2026-01-05 09:10:05' },
]);

// 用户表单
const userForm = reactive({
  id: 0,
  name: '',
  device: '',
  role: 'user',
  status: 'offline'
});

// 管理端对话框状态
const dialogVisible = ref(false);
const historyVisible = ref(false);
const dialogTitle = ref('新增用户');
const currentUser = ref<any>(null);
const searchQuery = ref('');
const filterStatus = ref('');

// 筛选用户
const filteredUsers = computed(() => {
  return mockUsers.value.filter(user => {
    const matchName = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                      user.device.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus = filterStatus.value ? user.status === filterStatus.value : true;
    return matchName && matchStatus;
  });
});

// 切换管理端/个人端
const switchMode = () => {
  isAdmin.value = !isAdmin.value;
  
  // 切换时重置状态
  if (isAdmin.value) {
    stopSimulation();
  } else {
    nextTick(() => {
      initCollisionMap(); // 重新初始化地图
    });
  }
  
  ElMessage.success(`已切换到${isAdmin.value ? '管理员控制台' : '个人定位终端'}`);
};

// 新增用户
const handleAddUser = () => {
  dialogTitle.value = '新增用户';
  Object.assign(userForm, { id: 0, name: '', device: '', role: 'user', status: 'offline' });
  dialogVisible.value = true;
};

// 编辑用户
const handleEditUser = (row: any) => {
  dialogTitle.value = '编辑用户';
  Object.assign(userForm, { ...row });
  currentUser.value = row;
  dialogVisible.value = true;
};

// 删除用户
const handleDeleteUser = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户【${row.name}】吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      // dangerMode: true, // <--- 删除这一行
      confirmButtonClass: 'el-button--danger' // <--- 添加这一行（可选，使按钮变红）
    }
  ).then(() => {
    // ... 原有逻辑保持不变
    const idx = mockUsers.value.findIndex(u => u.id === row.id);
    if (idx > -1) {
      mockUsers.value.splice(idx, 1);
      ElMessage.success(`用户【${row.name}】已删除`);
    }
  }).catch(() => {
    ElMessage.info('已取消删除操作');
  });
};


// 保存用户
const saveUser = () => {
  if (!userForm.name) {
    ElMessage.warning('请输入用户名');
    return;
  }
  
  if (userForm.id === 0) {
    // 新增
    const newUser = {
      id: Date.now(),
      name: userForm.name,
      device: userForm.device || `UWB-TAG-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      role: userForm.role,
      status: 'offline',
      lastActive: '未激活'
    };
    mockUsers.value.push(newUser);
    ElMessage.success(`用户【${userForm.name}】已创建`);
  } else {
    // 编辑
    const idx = mockUsers.value.findIndex(u => u.id === userForm.id);
    if (idx > -1) {
      mockUsers.value[idx] = { ...mockUsers.value[idx], ...userForm };
      ElMessage.success(`用户【${userForm.name}】已更新`);
    }
  }
  
  dialogVisible.value = false;
};

// 查看用户历史轨迹
const viewHistory = (row: any) => {
  currentUser.value = row;
  historyVisible.value = true;
};

// 处理文件上传
const handleFileChange = (file: any) => {
  ElMessage.info(`文件【${file.name}】已选择，大小：${(file.size / 1024 / 1024).toFixed(2)} MB`);
};

// ======================= 9. 生命周期钩子 =======================
onMounted(() => {
  // 加载地图
  loadMapFromFile();

  // 监听容器大小变化
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0 && !isAdmin.value) {
          stopSimulation();
          nextTick(() => {
            initCollisionMap(); // 重新初始化碰撞地图
          });
        }
      }
    });
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  // 清理资源
  stopSimulation();
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (containerRef.value) {
    resizeObserver?.unobserve(containerRef.value);
  }
});
</script>

<style scoped>
/* 核心样式优化 - 地图视觉提升 */
.bg-grid {
  background-image: linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 地图淡入动画 */
.map-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

/* SVG渲染优化 - 适配深色背景 */
:deep(.inner-svg-wrapper svg) {
  width: 100%;
  height: 100%;
  display: block;
  filter: invert(0.9) hue-rotate(180deg) saturate(0.8) brightness(0.9);
  transition: filter 0.3s ease;
}

/* 管理端地图样式 */
:deep(.admin-map-container) {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}
:deep(.admin-map-container:hover) {
  opacity: 0.8;
}
:deep(.admin-svg-style svg) {
  filter: invert(0.95) hue-rotate(180deg) saturate(0.7) brightness(0.85);
}

/* 动态定位点动画优化 */
:deep(.animate-ping) {
  animation-duration: 2s;
}

/* Element Plus 组件样式覆盖 */
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

/* 自定义滚动条 */
:deep(.el-scrollbar__bar) {
  background-color: rgba(148, 163, 184, 0.2);
}
:deep(.el-scrollbar__thumb) {
  background-color: rgba(56, 189, 248, 0.5);
}

/* 整体布局样式 */
.h-full {
  height: 100%;
}
.min-h-0 {
  min-height: 0;
}
.min-h-\[60vh\] {
  min-height: 60vh;
}
.will-change-transform {
  will-change: transform;
}
</style>