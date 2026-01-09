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
            {{ collisionDetected ? '避障修正' : '定位正常' }}
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
        element-loading-text="正在解析建筑结构..."
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
                      系统将自动识别 SVG 中的 &lt;rect&gt;, &lt;line&gt;, &lt;polygon&gt; 作为实体墙壁
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
const collisionDetected = ref(false); 
const fps = ref(0);

const currentPos = reactive({ x: 0, y: 0 });
const velocity = reactive({ x: 0, y: 0, angle: 0 });

const pathHistory = ref<{x: number, y: number}[]>([]); 

const svgContent = ref('');
const mapLoaded = ref(false);

type Line = { x1: number, y1: number, x2: number, y2: number };
const walls = ref<Line[]>([]);
const mapTransform = reactive({ scale: 1, offsetX: 0, offsetY: 0, width: 0, height: 0 });

const isHistoryMode = ref(false);
const historyDialogVisible = ref(false);
const selectedHistoryRange = ref('1h');

let animationFrameId: number;
let resizeObserver: ResizeObserver | null = null;
let lastTime = 0;

// ======================= 3. 核心：地图加载与墙体提取 =======================
const loadMapFromFile = async () => {
  mapLoaded.value = false;
  isReady.value = false;
  walls.value = []; 
  
  try {
    const svgPath = '/src/assets/map/map.svg';
    const response = await fetch(svgPath); 
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    let text = await response.text();
    // 强制填满
    text = text
      .replace(/width=".*?"/g, 'width="100%"')
      .replace(/height=".*?"/g, 'height="100%"')
      .replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"');
    
    svgContent.value = text;
    mapLoaded.value = true;
    nextTick(() => extractWallsFromSVG(text));
  } catch (error) {
    console.warn('加载失败，使用兜底SVG');
    const fallback = `
      <svg width="100%" height="100%" viewBox="0 0 1000 600">
        <rect x="200" y="150" width="100" height="300" fill="none" stroke="#333"/>
        <rect x="600" y="100" width="200" height="50" fill="none" stroke="#333"/>
        <polygon points="500,300 600,450 400,450" fill="none" stroke="#333"/>
      </svg>`;
    svgContent.value = fallback;
    mapLoaded.value = true;
    nextTick(() => extractWallsFromSVG(fallback));
  }
};

const extractWallsFromSVG = (svgText: string) => {
  if (!containerRef.value) return;

  const containerW = containerRef.value.clientWidth;
  const containerH = containerRef.value.clientHeight;

  // 解析 viewBox
  const viewBoxMatch = svgText.match(/viewBox=["']?\s*([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s*["']?/i);
  let vw = 1000, vh = 600;
  if (viewBoxMatch) {
    vw = parseFloat(viewBoxMatch[3]);
    vh = parseFloat(viewBoxMatch[4]);
  }

  // 计算缩放和偏移（保持原逻辑）
  const containerRatio = containerW / containerH;
  const svgRatio = vw / vh;
  let scale: number, offsetX: number, offsetY: number;
  if (containerRatio > svgRatio) {
    scale = containerH / vh;
    offsetX = (containerW - vw * scale) / 2;
    offsetY = 0;
  } else {
    scale = containerW / vw;
    offsetX = 0;
    offsetY = (containerH - vh * scale) / 2;
  }
  mapTransform.scale = scale;
  mapTransform.offsetX = offsetX;
  mapTransform.offsetY = offsetY;
  mapTransform.width = vw * scale;
  mapTransform.height = vh * scale;

  const extractedWalls: Line[] = [];
  const addLine = (x1: number, y1: number, x2: number, y2: number) => {
    extractedWalls.push({
      x1: x1 * scale + offsetX,
      y1: y1 * scale + offsetY,
      x2: x2 * scale + offsetX,
      y2: y2 * scale + offsetY
    });
  };

  // 强制添加四周边界墙（防飞出）
  addLine(0, 0, vw, 0);
  addLine(vw, 0, vw, vh);
  addLine(vw, vh, 0, vh);
  addLine(0, vh, 0, 0);

  // 提取 <line>
  const lineRegex = /<line[^>]*x1=["']?([\d\.]+)[^>]*y1=["']?([\d\.]+)[^>]*x2=["']?([\d\.]+)[^>]*y2=["']?([\d\.]+)[^>]*\/?>/gi;
  let match;
  while ((match = lineRegex.exec(svgText)) !== null) {
    const x1 = parseFloat(match[1]);
    const y1 = parseFloat(match[2]);
    const x2 = parseFloat(match[3]);
    const y2 = parseFloat(match[4]);
    addLine(x1, y1, x2, y2);
  }

  // 提取 <rect>
  const rectRegex = /<rect[^>]*x=["']?([\d\.]+)[^>]*y=["']?([\d\.]+)[^>]*width=["']?([\d\.]+)[^>]*height=["']?([\d\.]+)[^>]*\/?>/gi;
  while ((match = rectRegex.exec(svgText)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    const w = parseFloat(match[3]);
    const h = parseFloat(match[4]);
    if (w > 0 && h > 0) {
      addLine(x, y, x + w, y);
      addLine(x + w, y, x + w, y + h);
      addLine(x + w, y + h, x, y + h);
      addLine(x, y + h, x, y);
    }
  }

  // 提取 <polygon> 和 <polyline>
  const polyRegex = /<(polygon|polyline)[^>]*points=["']?\s*([^"'>]+)\s*["']?/gi;
  while ((match = polyRegex.exec(svgText)) !== null) {
    const pointsStr = match[2].trim();
    const nums = pointsStr.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    const worldPts: {x: number, y: number}[] = [];
    for (let i = 0; i < nums.length; i += 2) {
      worldPts.push({x: nums[i], y: nums[i+1]});
    }
    for (let i = 0; i < worldPts.length - 1; i++) {
      addLine(worldPts[i].x, worldPts[i].y, worldPts[i+1].x, worldPts[i+1].y);
    }
    // polygon 闭合
    if (match[1] === 'polygon' && worldPts.length >= 3) {
      addLine(worldPts[worldPts.length-1].x, worldPts[worldPts.length-1].y, worldPts[0].x, worldPts[0].y);
    }
  }

  walls.value = extractedWalls;

  // Canvas 初始化
  if (canvasRef.value) {
    canvasRef.value.width = containerW;
    canvasRef.value.height = containerH;
  }

  // 小人初始位置（地图中心）
  currentPos.x = offsetX + mapTransform.width / 2;
  currentPos.y = offsetY + mapTransform.height / 2;

  velocity.angle = Math.random() * Math.PI * 2;
  velocity.x = Math.cos(velocity.angle) * CONFIG.SPEED;
  velocity.y = Math.sin(velocity.angle) * CONFIG.SPEED;

  isReady.value = true;
};
// ======================= 4. 物理引擎：碰撞与运动 =======================

// 射线检测：优化精度，增加浮点误差容错，解决穿墙问题
const getIntersection = (
  p0_x: number, p0_y: number, p1_x: number, p1_y: number,
  p2_x: number, p2_y: number, p3_x: number, p3_y: number
) => {
  const EPS = 1e-6; // 浮点误差容错值
  const s1_x = p1_x - p0_x;
  const s1_y = p1_y - p0_y;
  const s2_x = p3_x - p2_x;
  const s2_y = p3_y - p2_y;

  const denominator = (-s2_x * s1_y + s1_x * s2_y);
  if (Math.abs(denominator) < EPS) return null; // 避免除以0（平行线段）

  const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / denominator;
  const t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / denominator;

  // 放宽检测范围，增加容错性（解决边缘穿墙）
  if (s >= -EPS && s <= 1 + EPS && t >= -EPS && t <= 1 + EPS) {
    return {
      x: p0_x + (t * s1_x),
      y: p0_y + (t * s1_y),
      nx: -s2_y,
      ny: s2_x
    };
  }
  return null;
};

// 物理步进计算 (核心逻辑复用)
// 物理步进计算：强化反弹与推离逻辑，防止嵌入墙体
const calculatePhysicsStep = (currX: number, currY: number, currVX: number, currVY: number) => {
  let nextX = currX + currVX;
  let nextY = currY + currVY;
  let newVX = currVX;
  let newVY = currVY;
  let hitWall = false;

  let nearestCollision: { x: number, y: number, nx: number, ny: number, dist: number } | null = null;
  let minDistance = Infinity;

  // 1. 墙体碰撞检测
  for (const wall of walls.value) {
    const hit = getIntersection(
      currX, currY, nextX, nextY,
      wall.x1, wall.y1, wall.x2, wall.y2
    );
    if (hit) {
      const dist = Math.hypot(hit.x - currX, hit.y - currY);
      if (dist < minDistance) {
        minDistance = dist;
        const len = Math.hypot(hit.nx, hit.ny);
        if (len < 1e-6) continue; // 避免无效法向量
        nearestCollision = { ...hit, nx: hit.nx / len, ny: hit.ny / len, dist };
      }
    }
  }

  // 2. 处理反弹：增加强制推离，避免嵌入墙体
  if (nearestCollision) {
    hitWall = true;
    const dot = currVX * nearestCollision.nx + currVY * nearestCollision.ny;
    newVX = currVX - 2 * dot * nearestCollision.nx;
    newVY = currVY - 2 * dot * nearestCollision.ny;

    // 强化推离：从墙体边缘推离5px，彻底避免嵌入
    const pushDistance = 5;
    nextX = nearestCollision.x + nearestCollision.nx * pushDistance;
    nextY = nearestCollision.y + nearestCollision.ny * pushDistance;

    // 速度衰减：避免反弹后速度过大再次穿墙
    newVX *= 0.9;
    newVY *= 0.9;
  }

  // 3. 最后一道防线：强制 Clamp 钳制，防止飞出可视区域
  const padding = 5;
  const minX = mapTransform.offsetX + padding;
  const maxX = mapTransform.offsetX + mapTransform.width - padding;
  const minY = mapTransform.offsetY + padding;
  const maxY = mapTransform.offsetY + mapTransform.height - padding;

  if (nextX < minX) { nextX = minX; newVX = Math.abs(newVX); hitWall = true; }
  if (nextX > maxX) { nextX = maxX; newVX = -Math.abs(newVX); hitWall = true; }
  if (nextY < minY) { nextY = minY; newVY = Math.abs(newVY); hitWall = true; }
  if (nextY > maxY) { nextY = maxY; newVY = -Math.abs(newVY); hitWall = true; }

  return { nextX, nextY, newVX, newVY, hitWall };
};
const updatePhysics = () => {
  if (!isReady.value) return; 

  // 随机扰动角度
  velocity.angle += (Math.random() - 0.5) * CONFIG.WANDER_FORCE;
  velocity.x = Math.cos(velocity.angle) * CONFIG.SPEED;
  velocity.y = Math.sin(velocity.angle) * CONFIG.SPEED;

  const result = calculatePhysicsStep(currentPos.x, currentPos.y, velocity.x, velocity.y);

  if (result.hitWall) {
    collisionDetected.value = true;
    // 碰撞后更新全局角度，防止下一帧卡死
    velocity.angle = Math.atan2(result.newVY, result.newVX);
    setTimeout(() => { collisionDetected.value = false; }, 200);
  }

  currentPos.x = result.nextX;
  currentPos.y = result.nextY;
  // 更新速度向量不是必须的，因为下一帧会根据 angle 重算，但为了逻辑严谨性保留
  velocity.x = result.newVX;
  velocity.y = result.newVY;

  // 轨迹记录
  if (showTrajectory.value && isRunning.value) {
    const last = pathHistory.value[pathHistory.value.length - 1];
    if (!last || Math.hypot(last.x - currentPos.x, last.y - currentPos.y) > 5) {
      pathHistory.value.push({x: currentPos.x, y: currentPos.y});
      if (pathHistory.value.length > CONFIG.MAX_TRAIL) pathHistory.value.shift();
    }
  }
};

// ======================= 5. 历史回放 & 动画循环 =======================

const openHistoryDialog = () => {
  if (isRunning.value) {
    ElMessage.warning('请先暂停定位模拟');
    return;
  }
  historyDialogVisible.value = true;
};

const confirmHistoryView = () => {
  historyDialogVisible.value = false;
  isHistoryMode.value = true;
  pathHistory.value = [];
  
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }

  // 生成历史轨迹：使用与实时运动相同的物理引擎
  // 1. 初始点：地图中心
  let simX = mapTransform.offsetX + (mapTransform.width / 2);
  let simY = mapTransform.offsetY + (mapTransform.height / 2);
  
  // 随机初始方向
  let simAngle = Math.random() * Math.PI * 2;
  let simVX = Math.cos(simAngle) * CONFIG.SPEED;
  let simVY = Math.sin(simAngle) * CONFIG.SPEED;

  const pointsToGen = 1200; // 生成点数

  for(let i = 0; i < pointsToGen; i++) {
    // 模拟随机转向
    simAngle += (Math.random() - 0.5) * CONFIG.WANDER_FORCE;
    simVX = Math.cos(simAngle) * CONFIG.SPEED;
    simVY = Math.sin(simAngle) * CONFIG.SPEED;

    const step = calculatePhysicsStep(simX, simY, simVX, simVY);

    if (step.hitWall) {
      simAngle = Math.atan2(step.newVY, step.newVX);
    }
    
    simX = step.nextX;
    simY = step.nextY;
    pathHistory.value.push({x: simX, y: simY});
  }

  // 将小人放置在历史终点
  if (pathHistory.value.length > 0) {
    const last = pathHistory.value[pathHistory.value.length - 1];
    currentPos.x = last.x;
    currentPos.y = last.y;
  }

  drawTrajectory();
  ElMessage.success(`已加载历史轨迹`);
};

const drawTrajectory = () => {
  if (!canvasRef.value || !showTrajectory.value || pathHistory.value.length < 2) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#22d3ee'; // Cyan-400

  ctx.beginPath();
  ctx.moveTo(pathHistory.value[0].x, pathHistory.value[0].y);
  for (let i = 1; i < pathHistory.value.length; i++) {
    ctx.lineTo(pathHistory.value[i].x, pathHistory.value[i].y);
  }
  ctx.stroke();
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

const startSimulation = () => {
  if (isRunning.value || !isReady.value || isHistoryMode.value) return;
  isRunning.value = true;
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(animate);
  ElMessage.success('模拟已启动');
};

const stopSimulation = () => {
  if (!isRunning.value) return;
  isRunning.value = false;
  cancelAnimationFrame(animationFrameId);
};

const resetSimulation = () => {
  stopSimulation();
  pathHistory.value = [];
  const ctx = canvasRef.value?.getContext('2d');
  if (ctx && canvasRef.value) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  if (isHistoryMode.value) {
    isHistoryMode.value = false;
    ElMessage.info('退出历史模式');
  }
  
  // 重置回中心
  if (mapTransform.scale > 0) {
    currentPos.x = mapTransform.offsetX + mapTransform.width / 2;
    currentPos.y = mapTransform.offsetY + mapTransform.height / 2;
  }
};

const toggleTrajectory = () => {
  showTrajectory.value = !showTrajectory.value;
  if (!showTrajectory.value && canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  } else {
    drawTrajectory();
  }
};

// ======================= 6. 管理端逻辑 =======================
const activeAdminTab = ref('users');
const mockUsers = ref([
  { id: 1001, name: '张三', status: 'online', lastActive: '2026-01-05 14:30:00', device: 'UWB-TAG-01', role: 'user' },
  { id: 1002, name: '李四', status: 'offline', lastActive: '2026-01-04 18:00:00', device: 'UWB-TAG-02', role: 'user' },
  { id: 1003, name: '系统管理员', status: 'online', lastActive: '2026-01-05 15:00:00', device: 'PC-CONSOLE', role: 'admin' },
]);
const mapFiles = ref([
  { name: 'map.dxf', size: '3.2 MB', date: '2026-01-06' }, 
  { name: 'office_layout.svg', size: '1.8 MB', date: '2026-01-05' },
]);
const userForm = reactive({ id: 0, name: '', device: '', role: 'user', status: 'offline' });
const dialogVisible = ref(false);
const historyVisible = ref(false);
const dialogTitle = ref('新增用户');
const currentUser = ref<any>(null);
const searchQuery = ref('');
const filterStatus = ref('');

const historyRangeLabel = computed(() => ({ '1h': '1小时', '24h': '1天', '10d': '10天' }[selectedHistoryRange.value]));
const getHistoryStats = computed(() => ({ 
  '1h': { points: 120, distance: 450 }, 
  '24h': { points: 2800, distance: 8500 }, 
  '10d': { points: 15000, distance: 92000 } 
}[selectedHistoryRange.value as string] || {points:0, distance:0}));

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
  if (isAdmin.value) stopSimulation();
  else {
    mapLoaded.value = false;
    setTimeout(() => loadMapFromFile(), 100);
  }
  ElMessage.success(`已切换到${isAdmin.value ? '管理员' : '个人'}模式`);
};

const handleAddUser = () => { dialogTitle.value = '新增用户'; Object.assign(userForm, { id: 0, name: '', device: '', role: 'user' }); dialogVisible.value = true; };
const handleEditUser = (row: any) => { dialogTitle.value = '编辑用户'; Object.assign(userForm, row); currentUser.value = row; dialogVisible.value = true; };
const handleDeleteUser = (row: any) => {
  ElMessageBox.confirm(`删除用户 ${row.name}?`, '警告', { type: 'warning' }).then(() => {
    mockUsers.value = mockUsers.value.filter(u => u.id !== row.id);
    ElMessage.success('已删除');
  });
};
const saveUser = () => {
  if (userForm.id === 0) mockUsers.value.push({ ...userForm, id: Date.now(), status: 'offline', lastActive: '未激活' });
  else { const i = mockUsers.value.findIndex(u => u.id === userForm.id); if(i>-1) mockUsers.value[i] = { ...mockUsers.value[i], ...userForm }; }
  dialogVisible.value = false;
};
const viewHistory = (row: any) => { currentUser.value = row; historyVisible.value = true; };
const handleFileChange = (file: any) => ElMessage.info(`文件 ${file.name} 选中`);

// ======================= 7. 生命周期 =======================
onMounted(() => {
  loadMapFromFile();
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && !isAdmin.value) {
          stopSimulation();
          nextTick(() => {
            // 窗口变化时重新提取墙体
            extractWallsFromSVG(svgContent.value);
          });
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
.bg-grid {
  background-image: linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
.map-fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

/* SVG深色适配 */
:deep(.inner-svg-wrapper svg) {
  width: 100%; height: 100%; display: block;
  filter: invert(0.9) hue-rotate(180deg) saturate(1.5) brightness(0.8) contrast(1.2);
}
:deep(.admin-map-container) { opacity: 0.6; }

/* 动画 */
:deep(.animate-ping) { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
.will-change-transform { will-change: transform; transition: transform 0.05s linear; }

/* Element UI 覆盖 */
:deep(.el-table), :deep(.el-table__expanded-cell) { background: transparent !important; }
:deep(.el-table th), :deep(.el-table tr) { background: transparent !important; }
:deep(.el-table td), :deep(.el-table th.is-leaf) { border-bottom: 1px solid #334155 !important; color: #cbd5e1; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) { background-color: rgba(56, 189, 248, 0.1) !important; }

:deep(.glass-dialog) { background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(12px); border: 1px solid rgba(148, 163, 184, 0.2); }
:deep(.glass-dialog .el-dialog__title) { color: #f1f5f9; }
:deep(.glass-dialog .el-dialog__body) { color: #cbd5e1; }
</style>