<template>
  <div class="h-full flex flex-col gap-4">
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
      <!-- 使用内部 div 确保布局撑满且对齐，避免拥挤 -->
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

        <!-- 右侧：切换按钮 (强制靠右) -->
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

<!-- 地图容器 -->
<div 
  class="relative flex-1 w-full min-h-[60vh] bg-[#000000] rounded-xl overflow-hidden border border-slate-700 shadow-inner select-none" 
  ref="containerRef"
  v-loading="!mapLoaded"
  element-loading-text="正在加载 SVG 地图..."
  element-loading-background="rgba(0, 0, 0, 0.8)"
>
  <!-- 1. SVG 地图显示层 (通过 v-html 注入) -->
  <!-- 这里的 inner-svg 类用于控制注入后的 SVG 样式 -->
  <div 
    v-if="mapLoaded"
    v-html="svgContent"
    class="absolute inset-0 w-full h-full inner-svg-wrapper"
  ></div>

  <!-- 2. Canvas 层 (用于绘制实时轨迹，覆盖在 SVG 之上) -->
  <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none" style="z-index: 10;"></canvas>

  <!-- 3. 动态小人 -->
  <div 
    class="absolute will-change-transform transition-transform duration-100 ease-linear"
    :style="{ transform: `translate(${currentPos.x}px, ${currentPos.y}px)`, zIndex: 20 }"
    v-show="isReady && !isHistoryMode"
  >
    <div class="relative -top-3 -left-3 w-6 h-6 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full animate-ping bg-cyan-500/30"></div>
        <div class="w-4 h-4 rounded-full border-2 border-cyan-400 shadow-lg z-10 flex items-center justify-center bg-[#000] shadow-[#22d3ee]">
           <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
        </div>
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
        <!-- Tab 2: 实时监控 -->
        <el-tab-pane label="全域监控" name="monitor" class="h-full">
          <div class="flex h-full gap-4">
             <!-- 左侧列表保持不变 -->
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

             <!-- 右侧地图区域 (修改处) -->
             <div class="flex-1 bg-slate-900 rounded-lg relative overflow-hidden border border-slate-700 flex items-center justify-center">
                
                <!-- 1. 地图层：使用 v-html 注入 svgContent，并加滤镜 -->
                <div v-if="mapLoaded" class="w-full h-full opacity-40 select-none pointer-events-none admin-map-filter">
                   <!-- inner-svg-wrapper 确保 SVG 撑满 -->
                   <div v-html="svgContent" class="w-full h-full inner-svg-wrapper"></div>
                </div>

                <!-- 2. Loading 状态 -->
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <el-icon class="is-loading mb-2" :size="30"><Loading /></el-icon>
                    <span>正在同步地图数据...</span>
                </div>

                <!-- 3. 动态元素层 (保持不变) -->
                <div class="absolute inset-0" v-if="mapLoaded">
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
                      当前使用的是系统预设：/src/assets/map/map.dxf
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
  Edit, Delete, Location, UploadFilled, Clock, Loading
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// ======================= 1. 数据常量与配置 =======================
const emit = defineEmits(['back']);

// 响应式地图数据
const svgContent = ref(''); // 存储 SVG 的原始字符串
const mapLoaded = ref(false);
const CONFIG = { SPEED: 1.5, SENSOR_DIST: 40, WANDER_FORCE: 0.2, WALL_THICKNESS: 15, MAX_TRAIL: 200 };


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

// 个人端 - 历史回放
const isHistoryMode = ref(false);
const historyDialogVisible = ref(false);
const selectedHistoryRange = ref('1h');

let animationFrameId: number;
let mapData: Uint8ClampedArray | null = null;
let mapWidth = 0, mapHeight = 0;
let scaleX = 1, scaleY = 1;
let resizeObserver: ResizeObserver | null = null;
let lastTime = 0;

// ======================= 3. 地图加载逻辑 (核心修改) =======================

/**
 * 模拟加载并解析 DWG 文件
 * 这里手动构建了与您提供的黑色底 CAD 图片一致的矢量路径
 */
const loadMapFromFile = async () => {
  mapLoaded.value = false;
  isReady.value = false;
  
  try {
    // 1. 请求 public 目录下的 SVG 文件
    // 请确保文件存在于 /public/maps/map.svg
    const response = await fetch('/src/assets/map/Untitled-Model.svg'); 
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    // 2. 获取文本内容
    let text = await response.text();
    
    // 3. 简单的预处理 (可选)：去除 SVG 的宽高固定属性，使其自适应容器
    // 这一步是为了让 SVG 能充满我们的 div 容器
    text = text.replace(/width=".*?"/, 'width="100%"').replace(/height=".*?"/, 'height="100%"');
    
    svgContent.value = text;
    mapLoaded.value = true;
    
    ElMessage.success('SVG 地图加载成功');

    // 4. 等待 DOM 渲染完毕后，初始化物理层
    nextTick(() => {
      initCollisionMap();
    });

  } catch (error) {
    console.error(error);
    ElMessage.error('无法加载地图文件，请检查路径 /maps/map.svg');
  }
};


// ======================= 4. 计算属性与辅助 =======================

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

// ======================= 5. 物理引擎 =======================

const initCollisionMap = () => {
  if (!mapLoaded.value || !containerRef.value || !collisionCanvasRef.value) return;

  const container = containerRef.value;
  mapWidth = container.clientWidth;
  mapHeight = container.clientHeight;
  
  const canvas = collisionCanvasRef.value;
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // 1. 初始化背景为白色 (可行走区域)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, mapWidth, mapHeight);

  // 2. 解析 SVG 字符串为 DOM 节点，以便提取路径
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent.value, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;

  // 获取 SVG 原始的 viewBox 尺寸，用于计算缩放比例
  const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 1100, 500];
  const svgOriginalW = viewBox[2];
  const svgOriginalH = viewBox[3];

  // 计算缩放比例：将 Canvas 缩放到与屏幕上显示的 SVG 一致
  scaleX = mapWidth / svgOriginalW;
  scaleY = mapHeight / svgOriginalH;

  ctx.save();
  ctx.scale(scaleX, scaleY); // 应用缩放

  // 3. 提取所有可能的障碍物元素 (<path>, <rect>, <circle>, <line>)
  // 我们假设 SVG 中所有的线条(stroke) 和 黑色填充块(fill) 都是障碍物
  
  // A. 处理 Path (最常见)
  const paths = svgDoc.querySelectorAll('path');
  ctx.strokeStyle = '#000000'; // 障碍物颜色
  ctx.fillStyle = '#000000';
  ctx.lineWidth = CONFIG.WALL_THICKNESS; // 设置物理墙体厚度
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  paths.forEach(p => {
    const d = p.getAttribute('d');
    const stroke = p.getAttribute('stroke');
    const fill = p.getAttribute('fill');
    
    if (d) {
      const path2d = new Path2D(d);
      // 如果有描边，画线作为墙
      if (stroke && stroke !== 'none') {
         ctx.stroke(path2d);
      }
      // 如果有填充且不是白色/透明，视为实心障碍
      // 这里简单判定：只要有 fill 属性且不为 none，就算障碍
      // 实际项目中可能需要根据颜色判断 (比如绿色草坪也是 fill 但不是障碍)
      if (fill && fill !== 'none' && fill !== '#ffffff') {
         // 这里可以加逻辑：如果是绿色(草坪)，则忽略
         if (!fill.includes('#15803d') && !fill.includes('green')) { 
            ctx.fill(path2d);
         }
      }
    }
  });

  // B. 处理 Rect (如果有)
  const rects = svgDoc.querySelectorAll('rect');
  rects.forEach(r => {
      const x = Number(r.getAttribute('x'));
      const y = Number(r.getAttribute('y'));
      const w = Number(r.getAttribute('width'));
      const h = Number(r.getAttribute('height'));
      const fill = r.getAttribute('fill');
      
      // 排除全屏背景 rect
      if (w > svgOriginalW * 0.9) return; 

      if (fill && fill !== 'none') {
         ctx.fillRect(x, y, w, h);
      } else {
         ctx.strokeRect(x, y, w, h);
      }
  });

  // C. 处理 Line (如果有)
  const lines = svgDoc.querySelectorAll('line');
  lines.forEach(l => {
     ctx.beginPath();
     ctx.moveTo(Number(l.getAttribute('x1')), Number(l.getAttribute('y1')));
     ctx.lineTo(Number(l.getAttribute('x2')), Number(l.getAttribute('y2')));
     ctx.stroke();
  });

  ctx.restore();

  // 4. 获取像素数据用于碰撞检测
  mapData = ctx.getImageData(0, 0, mapWidth, mapHeight).data;
  
  // 初始化视觉 Canvas (大小匹配)
  initVisualCanvas();
  
  // 重置小人位置 (找个安全点，这里简单写死，实际可以用算法找白色像素点)
  if (!isReady.value) {
     findSafeStartPos();
  }
  isReady.value = true;
};

const initVisualCanvas = () => {
  if (!canvasRef.value) return;
  const dpr = window.devicePixelRatio || 1;
  canvasRef.value.width = mapWidth * dpr;
  canvasRef.value.height = mapHeight * dpr;
  const ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, mapWidth, mapHeight);
  }
};

const findSafeStartPos = () => {
    // 从中心开始螺旋查找白色像素点
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    if (!isWall(centerX, centerY)) {
        currentPos.x = centerX;
        currentPos.y = centerY;
        return;
    }
    // 如果中心是墙，默认一个值 (实际项目应遍历像素)
    currentPos.x = 100;
    currentPos.y = 100;
};

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
  if (pathHistory.value.length > CONFIG.MAX_TRAIL) pathHistory.value.shift();
};

const drawTrajectory = () => {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, mapWidth, mapHeight);
  if (!showTrajectory.value || pathHistory.value.length < 2) return;

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

// ======================= 6. 控制逻辑 =======================

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
    isHistoryMode.value = false;
    const ctx = canvasRef.value?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, mapWidth, mapHeight);
    pathHistory.value = [];
    ElMessage.info('已退出历史回放模式');
  } else {
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

const openHistoryDialog = () => {
  historyDialogVisible.value = true;
};

const confirmHistoryView = () => {
  historyDialogVisible.value = false;
  stopSimulation(); 
  isHistoryMode.value = true;
  
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, mapWidth, mapHeight);
  ElMessage.success(`正在加载 ${historyRangeLabel.value} 的数据...`);
  
  // 模拟历史轨迹生成
  let cx = 450 * scaleX;
  let cy = 150 * scaleY;
  let angle = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fb923c';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  
  const count = Math.min(getHistoryStats.value.points, 1000);
  for(let i=0; i<count; i++) {
    angle += (Math.random() - 0.5) * 1.5;
    const nx = cx + Math.cos(angle) * 8;
    const ny = cy + Math.sin(angle) * 8;
    if (!isWall(nx, ny)) {
      cx = nx; cy = ny;
      ctx.lineTo(cx, cy);
    } else {
      angle += Math.PI; 
    }
  }
  ctx.stroke();
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
]);

const mapFiles = ref([
  { name: 'map.dxf', size: '3.2 MB', date: '2026-01-06' }, 
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
    nextTick(() => {
      if (mapLoaded.value && containerRef.value) initCollisionMap();
    });
  }
};

const handleAddUser = () => {
  dialogTitle.value = '新增用户';
  userForm.id = 0; userForm.name = ''; userForm.device = '';
  dialogVisible.value = true;
};

const handleEditUser = (row: any) => {
  dialogTitle.value = '编辑用户';
  Object.assign(userForm, row);
  dialogVisible.value = true;
};

const handleDeleteUser = (row: any) => {
  ElMessageBox.confirm(`确定删除用户 "${row.name}"？`, '警告', { type: 'warning' })
    .then(() => {
      const idx = mockUsers.value.findIndex(u => u.id === row.id);
      if (idx !== -1) mockUsers.value.splice(idx, 1);
      ElMessage.success('删除成功');
    }).catch(() => {});
};

const saveUser = () => {
  if (!userForm.name) return ElMessage.warning('请填写信息');
  if (userForm.id === 0) {
    mockUsers.value.push({ ...userForm, id: Date.now(), status: 'offline', lastActive: '-' } as any);
  } else {
    const idx = mockUsers.value.findIndex(u => u.id === userForm.id);
    if (idx !== -1) Object.assign(mockUsers.value[idx], userForm);
  }
  dialogVisible.value = false;
};

const viewHistory = (row: any) => {
  currentUser.value = row;
  historyVisible.value = true;
};

const handleFileChange = (file: any) => {
  ElMessage.success(`文件 ${file.name} 校验通过 (模拟)`);
};

// ======================= 8. 生命周期 =======================

onMounted(() => {
  loadMapFromFile();
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && !isAdmin.value && !isHistoryMode.value && mapLoaded.value) {
          stopSimulation();
          initCollisionMap();
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

:deep(.inner-svg-wrapper svg) {
  width: 100%;
  height: 100%;
  display: block;
}
/* Element Plus 表格透明化 */
:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(30, 41, 59, 0.5);
  --el-table-text-color: #cbd5e1;
  --el-table-header-text-color: #e2e8f0;
  --el-table-row-hover-bg-color: rgba(56, 189, 248, 0.1);
  --el-table-border-color: #334155;
}
:deep(.el-table__inner-wrapper::before) { background-color: #334155; }

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
