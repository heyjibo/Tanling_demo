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
            {{ collisionDetected ? '边界修正' : '定位正常' }}
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

      <!-- 地图容器 -->
      <div 
        class="relative flex-1 w-full min-h-[60vh] bg-[#0a0e17] rounded-xl overflow-hidden border border-slate-700 shadow-inner select-none" 
        ref="containerRef"
        v-loading="!mapLoaded"
        element-loading-text="正在加载 SVG 地图..."
        element-loading-background="rgba(10, 14, 23, 0.95)"
        element-loading-spinner="el-icon-loading"
      >
        <!-- 网格背景 -->
        <div class="absolute inset-0 pointer-events-none bg-grid opacity-10"></div>
        
        <!-- 1. SVG 地图显示层 -->
        <div 
          v-if="mapLoaded"
          v-html="svgContent"
          class="absolute inset-0 w-full h-full inner-svg-wrapper map-fade-in"
        ></div>

        <!-- 2. Canvas 轨迹层 -->
        <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none" style="z-index: 10;"></canvas>

        <!-- 3. 动态定位小人 -->
        <div 
          class="absolute will-change-transform"
          :style="{ transform: `translate(${currentPos.x}px, ${currentPos.y}px)`, zIndex: 20 }"
          v-show="isReady"
        >
          <!-- 偏移校正 div，确保中心对齐 -->
          <div class="relative -top-2 -left-2 w-4 h-4 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full animate-ping bg-cyan-500/30 shadow-lg shadow-cyan-500/20"></div>
            <div class="w-3 h-3 rounded-full border border-cyan-400 z-10 flex items-center justify-center bg-[#0a0e17] shadow-[0_0_8px_rgba(34,211,238,0.8)]">
              <div class="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
            </div>
          </div>
        </div>
      </div>

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

             <!-- 右侧地图区域 -->
             <div class="flex-1 bg-[#0a0e17] rounded-lg relative overflow-hidden border border-slate-700 flex items-center justify-center">
                <div class="absolute inset-0 pointer-events-none bg-grid opacity-8"></div>
                <div v-if="mapLoaded" class="w-full h-full select-none pointer-events-none admin-map-container">
                   <div v-html="svgContent" class="w-full h-full inner-svg-wrapper admin-svg-style"></div>
                </div>
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <el-icon class="is-loading mb-2" :size="30"><Loading /></el-icon>
                    <span class="text-slate-400">正在同步地图数据...</span>
                </div>

                <!-- 3. 用户定位标记 (演示用) -->
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
// 运动配置
const CONFIG = { 
  SPEED: 0.2,           
  WANDER_FORCE: 0.1,    
  MAX_TRAIL: 300 
};

// ======================= 2. 全局状态 =======================
const isAdmin = ref(false); 
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const isRunning = ref(false);
const isReady = ref(false);
const showTrajectory = ref(true);
const collisionDetected = ref(false); // 这里仅表示接触到边界
const fps = ref(0);

// 小人当前位置
const currentPos = reactive({ x: 0, y: 0 });
// 运动矢量
const velocity = reactive({ angle: Math.random() * Math.PI * 2 });
// 历史路径点
const pathHistory = ref<{x: number, y: number}[]>([]); 

// 活动范围边界 (Bounding Box)
const boundary = reactive({ minX: 0, maxX: 0, minY: 0, maxY: 0 });

// 历史回放相关
const isHistoryMode = ref(false);
const historyDialogVisible = ref(false);
const selectedHistoryRange = ref('1h');

// 临时变量
let animationFrameId: number;
let resizeObserver: ResizeObserver | null = null;
let lastTime = 0;

// ======================= 3. 地图加载与边界计算 =======================
const loadMapFromFile = async () => {
  mapLoaded.value = false;
  isReady.value = false;
  
  try {
    const svgPath = '/src/assets/map/Untitled-Model.svg';
    const response = await fetch(svgPath); 
    if (!response.ok) throw new Error(`加载失败: ${response.status}`);
    
    let text = await response.text();
    // 强制SVG填满，但保持比例，这样我们能算出它的真实渲染区域
    text = text
      .replace(/width=".*?"/, 'width="100%"')
      .replace(/height=".*?"/, 'height="100%"')
      .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"');
    
    svgContent.value = text;
    mapLoaded.value = true;
    
    // 等待DOM渲染后计算边界
    nextTick(() => initBoundaries());

  } catch (error) {
    console.warn('SVG加载失败，使用默认地图', error);
    // 默认 SVG
    svgContent.value = `
      <svg width="100%" height="100%" viewBox="0 0 1000 600" style="background: transparent;">
        <rect x="10" y="10" width="980" height="580" fill="none" stroke="#333" stroke-width="2"/>
        <text x="500" y="300" fill="#666" font-size="20" text-anchor="middle">DEFAULT MAP AREA</text>
      </svg>
    `;
    mapLoaded.value = true;
    nextTick(() => initBoundaries());
  }
};

// 计算矩形活动范围
const initBoundaries = () => {
  if (!containerRef.value) return;

  const containerW = containerRef.value.clientWidth;
  const containerH = containerRef.value.clientHeight;

  // 1. 尝试解析 viewBox
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent.value, "image/svg+xml");
  const svgEl = doc.documentElement;
  const viewBox = svgEl.getAttribute('viewBox');

  let vw = 1000, vh = 600; // 默认值
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      vw = parts[2];
      vh = parts[3];
    }
  }

  // 2. 计算缩放比例 (模拟 object-fit: contain / preserveAspectRatio="xMidYMid meet")
  const containerRatio = containerW / containerH;
  const svgRatio = vw / vh;
  
  let renderW, renderH, offsetX, offsetY;

  if (containerRatio > svgRatio) {
    // 容器更宽，高度适配
    renderH = containerH;
    renderW = vh * svgRatio * (containerH / vh); // 其实就是 renderH * svgRatio
    offsetY = 0;
    offsetX = (containerW - renderW) / 2;
  } else {
    // 容器更高，宽度适配
    renderW = containerW;
    renderH = vw / svgRatio * (containerW / vw);
    offsetX = 0;
    offsetY = (containerH - renderH) / 2;
  }

  // 3. 设定活动边界 (内缩 10px 防止贴边太死)
  const PADDING = 130;
  boundary.minX = offsetX + PADDING;
  boundary.maxX = offsetX + renderW - PADDING;
  boundary.minY = offsetY + PADDING;
  boundary.maxY = offsetY + renderH - PADDING;

  // 4. 初始化 Canvas
  const dpr = window.devicePixelRatio || 1;
  if (canvasRef.value) {
    canvasRef.value.width = containerW * dpr;
    canvasRef.value.height = containerH * dpr;
    canvasRef.value.style.width = `${containerW}px`;
    canvasRef.value.style.height = `${containerH}px`;
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }

  // 5. 设置初始位置 (中心点)
  currentPos.x = offsetX + renderW / 2;
  currentPos.y = offsetY + renderH / 2;
  
  isReady.value = true;
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

// ======================= 5. 物理引擎 (矩形边界反弹) =======================
const updatePhysics = () => {
  if (!isReady.value) return;

  // 1. 随机微调角度 (模拟自然行走)
  velocity.angle += (Math.random() - 0.5) * CONFIG.WANDER_FORCE;

  // 2. 计算下一步坐标
  let nextX = currentPos.x + Math.cos(velocity.angle) * CONFIG.SPEED;
  let nextY = currentPos.y + Math.sin(velocity.angle) * CONFIG.SPEED;
  
  let hitBoundary = false;

  // 3. 边界检测与反弹
  // X轴检测
  if (nextX < boundary.minX) {
    nextX = boundary.minX;
    velocity.angle = Math.PI - velocity.angle; // 水平翻转
    hitBoundary = true;
  } else if (nextX > boundary.maxX) {
    nextX = boundary.maxX;
    velocity.angle = Math.PI - velocity.angle;
    hitBoundary = true;
  }

  // Y轴检测
  if (nextY < boundary.minY) {
    nextY = boundary.minY;
    velocity.angle = -velocity.angle; // 垂直翻转
    hitBoundary = true;
  } else if (nextY > boundary.maxY) {
    nextY = boundary.maxY;
    velocity.angle = -velocity.angle;
    hitBoundary = true;
  }

  // 更新状态
  currentPos.x = nextX;
  currentPos.y = nextY;
  collisionDetected.value = hitBoundary;

  // 4. 记录轨迹
  if (showTrajectory.value && isRunning.value) {
    const last = pathHistory.value[pathHistory.value.length - 1];
    // 只有移动距离超过 2px 才记录，避免密集点
    if (!last || Math.hypot(last.x - currentPos.x, last.y - currentPos.y) > 2) {
      pathHistory.value.push({x: currentPos.x, y: currentPos.y});
      if (pathHistory.value.length > CONFIG.MAX_TRAIL) {
        pathHistory.value.shift();
      }
    }
  }
};

// 绘制轨迹
const drawTrajectory = () => {
  if (!canvasRef.value || !showTrajectory.value || pathHistory.value.length < 2) return;
  
  const container = containerRef.value;
  if(!container) return;
  
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;

  const totalPoints = pathHistory.value.length;
  for (let i = 0; i < totalPoints - 1; i++) {
    const pt1 = pathHistory.value[i];
    const pt2 = pathHistory.value[i + 1];
    
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    
    // 渐变色
    const alpha = (i / totalPoints);
    ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`; 
    ctx.stroke();
  }
};

const animate = (time: number) => {
  if (!isRunning.value) return;
  if (lastTime) {
    const delta = time - lastTime;
    fps.value = Math.round(1000 / delta);
  }
  lastTime = time;

  updatePhysics();
  drawTrajectory();
  
  animationFrameId = requestAnimationFrame(animate);
};

// ======================= 6. 控制逻辑 =======================
const startSimulation = () => {
  if (isRunning.value || !isReady.value || isHistoryMode.value) return;
  isRunning.value = true;
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(animate);
  ElMessage.success('定位模拟已启动');
};

const stopSimulation = () => {
  if (!isRunning.value) return;
  isRunning.value = false;
  cancelAnimationFrame(animationFrameId);
  ElMessage.info('定位模拟已暂停');
};

const resetSimulation = () => {
  stopSimulation();
  pathHistory.value = [];
  const ctx = canvasRef.value?.getContext('2d');
  const container = containerRef.value;
  if (ctx && container) ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);

  if (isHistoryMode.value) {
    isHistoryMode.value = false;
    ElMessage.info('已退出历史回放模式');
  }
  
  // 回到中心
  currentPos.x = (boundary.minX + boundary.maxX) / 2;
  currentPos.y = (boundary.minY + boundary.maxY) / 2;
};

const toggleTrajectory = () => {
  showTrajectory.value = !showTrajectory.value;
  if (!showTrajectory.value && canvasRef.value && containerRef.value) {
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, containerRef.value.clientWidth, containerRef.value.clientHeight);
  } else {
    drawTrajectory();
  }
};

// ======================= 7. 历史回放逻辑 (生成有效区域内的轨迹) =======================
const openHistoryDialog = () => {
  if (isRunning.value) {
    ElMessage.warning('请先暂停定位模拟再查看历史轨迹');
    return;
  }
  historyDialogVisible.value = true;
};

const confirmHistoryView = () => {
  historyDialogVisible.value = false;
  isHistoryMode.value = true;
  pathHistory.value = [];
  
  const ctx = canvasRef.value?.getContext('2d');
  const container = containerRef.value;
  if (ctx && container) ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);

  // 1. 在边界内随机找个起点
  let simX = boundary.minX + Math.random() * (boundary.maxX - boundary.minX);
  let simY = boundary.minY + Math.random() * (boundary.maxY - boundary.minY);
  let simAngle = Math.random() * Math.PI * 2;
  
  const stats = getHistoryStats.value;
  const pointsToGen = Math.min(stats.points, 1000); 

  // 2. 模拟运动并记录
  for(let i = 0; i < pointsToGen; i++) {
    simAngle += (Math.random() - 0.5) * 0.5;
    
    let nextX = simX + Math.cos(simAngle) * 5;
    let nextY = simY + Math.sin(simAngle) * 5;

    // 简单的边界检查
    if (nextX < boundary.minX || nextX > boundary.maxX) {
      nextX = Math.max(boundary.minX, Math.min(nextX, boundary.maxX));
      simAngle = Math.PI - simAngle;
    }
    if (nextY < boundary.minY || nextY > boundary.maxY) {
      nextY = Math.max(boundary.minY, Math.min(nextY, boundary.maxY));
      simAngle = -simAngle;
    }
    
    simX = nextX;
    simY = nextY;
    pathHistory.value.push({x: simX, y: simY});
  }

  // 将小人移动到轨迹终点
  if (pathHistory.value.length > 0) {
    const last = pathHistory.value[pathHistory.value.length - 1];
    currentPos.x = last.x;
    currentPos.y = last.y;
  }

  drawTrajectory();
  ElMessage.success(`已加载近${historyRangeLabel.value}的历史轨迹`);
};

// ======================= 8. 管理端逻辑 =======================
const activeAdminTab = ref('users');

const mockUsers = ref([
  { id: 1001, name: '张三', status: 'online', lastActive: '2026-01-05 14:30:00', device: 'UWB-TAG-01', role: 'user' },
  { id: 1002, name: '李四', status: 'offline', lastActive: '2026-01-04 18:00:00', device: 'UWB-TAG-02', role: 'user' },
  { id: 1003, name: '系统管理员', status: 'online', lastActive: '2026-01-05 15:00:00', device: 'PC-CONSOLE', role: 'admin' },
]);

const mapFiles = ref([
  { name: 'map.dxf', size: '3.2 MB', date: '2026-01-06 10:20:30' }, 
  { name: 'office_layout.svg', size: '1.8 MB', date: '2026-01-05 09:10:05' },
]);

const userForm = reactive({ id: 0, name: '', device: '', role: 'user', status: 'offline' });
const dialogVisible = ref(false);
const historyVisible = ref(false);
const dialogTitle = ref('新增用户');
const currentUser = ref<any>(null);
const searchQuery = ref('');
const filterStatus = ref('');

const filteredUsers = computed(() => {
  return mockUsers.value.filter(user => {
    const matchName = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                      user.device.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus = filterStatus.value ? user.status === filterStatus.value : true;
    return matchName && matchStatus;
  });
});

const switchMode = () => {
  isAdmin.value = !isAdmin.value;
  if (isAdmin.value) {
    stopSimulation();
  } else {
    // 切换回个人端，重新初始化边界
    mapLoaded.value = false;
    setTimeout(() => {
      loadMapFromFile();
    }, 100);
  }
  ElMessage.success(`已切换到${isAdmin.value ? '管理员控制台' : '个人定位终端'}`);
};

const handleAddUser = () => {
  dialogTitle.value = '新增用户';
  Object.assign(userForm, { id: 0, name: '', device: '', role: 'user', status: 'offline' });
  dialogVisible.value = true;
};

const handleEditUser = (row: any) => {
  dialogTitle.value = '编辑用户';
  Object.assign(userForm, { ...row });
  currentUser.value = row;
  dialogVisible.value = true;
};

const handleDeleteUser = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户【${row.name}】吗？`, '警告',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' }
  ).then(() => {
    const idx = mockUsers.value.findIndex(u => u.id === row.id);
    if (idx > -1) mockUsers.value.splice(idx, 1);
    ElMessage.success(`用户【${row.name}】已删除`);
  });
};

const saveUser = () => {
  if (!userForm.name) return ElMessage.warning('请输入用户名');
  if (userForm.id === 0) {
    const newUser = {
      id: Date.now(),
      name: userForm.name,
      device: userForm.device || 'UWB-TAG-NEW',
      role: userForm.role,
      status: 'offline',
      lastActive: '未激活'
    };
    mockUsers.value.push(newUser);
  } else {
    const idx = mockUsers.value.findIndex(u => u.id === userForm.id);
    if (idx > -1) mockUsers.value[idx] = { ...mockUsers.value[idx], ...userForm };
  }
  dialogVisible.value = false;
};

const viewHistory = (row: any) => {
  currentUser.value = row;
  historyVisible.value = true;
};

const handleFileChange = (file: any) => {
  ElMessage.info(`文件【${file.name}】已选择`);
};

// ======================= 9. 生命周期 =======================
onMounted(() => {
  loadMapFromFile();

  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && !isAdmin.value) {
          stopSimulation();
          nextTick(() => initBoundaries());
        }
      }
    });
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  stopSimulation();
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
/* 网格背景 */
.bg-grid {
  background-image: linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 动画 */
.map-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
  opacity: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

/* SVG 滤镜 - 高对比度深色模式 */
:deep(.inner-svg-wrapper svg) {
  width: 100%;
  height: 100%;
  display: block;
  /* 将黑色线条转为亮色，适应深色背景 */
  filter: invert(0.9) hue-rotate(180deg) saturate(1.5) brightness(0.8) contrast(1.2);
  transition: filter 0.3s ease;
}

/* 管理端地图 */
:deep(.admin-map-container) {
  opacity: 0.6;
}
:deep(.admin-svg-style svg) {
  filter: invert(0.95) hue-rotate(180deg) saturate(0.5) brightness(0.7);
}

/* 小人波纹动画 */
:deep(.animate-ping) {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.will-change-transform {
  will-change: transform;
  transition: transform 0.05s linear; /* 线性过渡，确保平滑 */
}

/* Element Plus 覆盖 */
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
}
:deep(.glass-dialog .el-dialog__title) { color: #f1f5f9; }
:deep(.glass-dialog .el-dialog__body) { color: #cbd5e1; }
:deep(.el-tabs__item.is-active) { color: #38bdf8; }
:deep(.el-tabs__nav-wrap::after) { background-color: #334155; }
:deep(.el-upload-dragger) { background: transparent; border-color: #475569; }
:deep(.el-radio-button__inner) { background: transparent; border-color: #475569; color: #94a3b8; }
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #0ea5e9; border-color: #0ea5e9; color: white;
}
</style>
