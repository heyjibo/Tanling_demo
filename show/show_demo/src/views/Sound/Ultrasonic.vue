<template>
  <div class="h-screen w-full bg-[#020617] text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-cyan-500 selection:text-white">
    <!-- ==================== 0. 顶部全局导航栏 ==================== -->
    <div class="flex-none h-16 bg-slate-900/90 border-b border-slate-700/60 z-50 backdrop-blur-md">
      <div class="flex items-center justify-between w-full h-full px-6">
        <!-- 左侧：平台标识 -->
        <div class="flex items-center gap-4">
          <div class="relative group cursor-pointer">
            <div class="absolute inset-0 bg-cyan-500 blur opacity-20 group-hover:opacity-40 transition-opacity rounded"></div>
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded border border-slate-600 relative z-10 flex items-center justify-center shadow-lg">
              <el-icon :size="24" color="#fff"><DataLine /></el-icon>
            </div>
          </div>
          <div class="flex flex-col">
            <h1 class="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              会展中心高精度定位运营平台
            </h1>
            <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase">
              <span class="px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-400 border border-cyan-800/50">Sim-Physics Engine</span>
              <span class="px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400 border border-purple-800/50">Accuracy ±10cm</span>
            </div>
          </div>
        </div>

        <!-- 中间：核心指标 (仅管理员可见) -->
        <div v-if="isAdmin" class="hidden lg:flex gap-12">
          <div class="text-center group cursor-default">
            <div class="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">当前馆内人数</div>
            <div class="text-2xl font-mono font-bold text-slate-200">{{ dashboardData.totalVisitors.toLocaleString() }}</div>
          </div>
          <div class="text-center group cursor-default">
            <div class="text-xs text-slate-500 group-hover:text-green-400 transition-colors">安保在岗</div>
            <div class="text-2xl font-mono font-bold text-slate-200">{{ dashboardData.securityCount }} <span class="text-sm text-slate-500 font-normal">/ 24</span></div>
          </div>
          <div class="text-center group cursor-default">
            <div class="text-xs text-slate-500 group-hover:text-red-400 transition-colors">今日告警</div>
            <div class="text-2xl font-mono font-bold text-red-400 animate-pulse">{{ dashboardData.alerts }}</div>
          </div>
        </div>

        <!-- 右侧：角色切换 -->
        <div class="flex items-center gap-6">
          <div class="text-right hidden sm:block">
            <div class="text-sm font-bold text-slate-200">{{ isAdmin ? '运营指挥中心' : '观众/展商端' }}</div>
            <div class="text-xs text-slate-500 font-mono">{{ currentTime }}</div>
          </div>
          <el-button 
            :type="isAdmin ? 'primary' : 'warning'" 
            @click="switchMode" 
            circle
            size="large"
            class="!border-0 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform"
          >
            <el-icon :size="20"><Switch /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ==================== 内容区域 ==================== -->
    <div class="flex-1 p-4 min-h-0 overflow-hidden relative">
      
      <!-- ==================== A. 个人端视图 (智能导览/小程序体验) ==================== -->
      <div v-if="!isAdmin" class="h-full w-full flex justify-center items-center relative animate-fade-in">
        <!-- 手机外框 -->
        <div class="w-[380px] h-[90vh] max-h-[850px] border-[8px] border-slate-800 rounded-[3rem] shadow-2xl bg-[#0f172a] overflow-hidden relative flex flex-col ring-1 ring-slate-700">
           <!-- 手机刘海 -->
           <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-xl z-50"></div>
           
           <!-- App Header -->
           <div class="h-16 bg-slate-900/95 backdrop-blur flex items-center px-5 pt-4 border-b border-slate-700/50 z-20 justify-between">
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-sm font-bold text-slate-200">定位导航中...</span>
             </div>
             <div class="text-xs text-slate-500 font-mono">FPS: {{ fps }}</div>
           </div>

           <!-- 手机地图区域 -->
           <div class="flex-1 relative overflow-hidden bg-[#0b1121]" ref="userContainerRef">
              <div v-if="mapLoaded" v-html="svgContent" class="w-full h-full opacity-50 grayscale contrast-125"></div>
              <canvas ref="userCanvasRef" class="absolute inset-0 pointer-events-none"></canvas>
              <!-- 用户自身定位点 -->
              <div 
                 class="absolute will-change-transform transition-transform duration-100 ease-linear z-30"
                 :style="{ transform: `translate(${userPos.x}px, ${userPos.y}px)` }"
               >
                 <div class="relative -top-4 -left-4 w-8 h-8 flex items-center justify-center">
                   <div class="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping"></div>
                   <div class="w-5 h-5 rounded-full border-2 border-white bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center relative z-10">
                     <el-icon color="white" :size="10"><LocationFilled /></el-icon>
                   </div>
                   <!-- 方向箭头 -->
                   <div class="absolute top-1/2 left-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white transform -translate-x-1/2 -translate-y-full origin-bottom"
                        :style="{ transform: `rotate(${userAngle + 90}deg) translate(0, -18px)` }">
                   </div>
                 </div>
              </div>
              <!-- 终点标记 -->
              <div class="absolute top-[33%] right-[25%] animate-bounce z-20">
                 <el-icon :size="32" color="#f59e0b"><Place /></el-icon>
              </div>
           </div>

           <!-- 底部操作栏 -->
           <div class="h-auto bg-slate-800/95 p-5 rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.6)] z-30 border-t border-slate-700/50">
             <div class="flex justify-between items-center mb-5">
               <div>
                 <div class="text-xs text-slate-400 mb-1">距离目的地</div>
                 <div class="text-2xl font-bold text-white font-mono">128 <span class="text-sm font-normal text-slate-400 font-sans">米</span></div>
               </div>
               <div class="text-right">
                 <div class="text-xs text-slate-400 mb-1">预计耗时</div>
                 <div class="text-2xl font-bold text-white font-mono">2 <span class="text-sm font-normal text-slate-400 font-sans">分钟</span></div>
               </div>
             </div>
             <el-button type="primary" class="w-full !rounded-xl !h-12 !text-lg font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform" @click="startNavigationDemo">
               {{ isNavigating ? '重新规划路线' : '开始导航至 A区会议室' }}
             </el-button>
           </div>
        </div>
      </div>

      <!-- ==================== B. 管理端视图 (运营指挥中心) ==================== -->
      <div v-else class="h-full flex gap-4 animate-fade-in">
        
        <!-- 左侧：功能控制面板 (Fix: h-full) -->
        <div class="w-80 flex-none flex flex-col gap-4 h-full">
          
          <!-- 1. 展会数据看板 -->
          <div class="flex-none bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700/50 p-4 shadow-xl">
            <div class="flex items-center gap-2 mb-4 text-slate-200 font-bold border-b border-slate-700/50 pb-2">
              <el-icon class="text-cyan-400"><DataAnalysis /></el-icon> 展会数据看板
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-slate-900/50 p-3 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                <div class="text-xs text-slate-400 mb-1">今日累计客流</div>
                <div class="text-xl font-bold text-cyan-300 font-mono">12,450</div>
              </div>
              <div class="bg-slate-900/50 p-3 rounded border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                <div class="text-xs text-slate-400 mb-1">平均停留时长</div>
                <div class="text-xl font-bold text-purple-300 font-mono">48m</div>
              </div>
            </div>
            <div class="h-24 flex items-end justify-between gap-1 px-1 border-b border-slate-700/30 pb-2 mb-2">
              <div v-for="(h, i) in [30, 45, 70, 90, 60, 40, 80, 50, 65, 85]" :key="i" 
                   class="w-full bg-gradient-to-t from-cyan-900 to-cyan-500/80 rounded-t-sm transition-all duration-500 hover:opacity-100 opacity-70"
                   :style="{ height: h + '%' }">
              </div>
            </div>
            <div class="text-[10px] text-center text-slate-500">分时段人流热度 (09:00 - 17:00)</div>
          </div>

          <!-- 2. 图层控制 -->
          <div class="flex-none bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700/50 p-4 shadow-xl">
             <div class="flex items-center gap-2 mb-4 text-slate-200 font-bold border-b border-slate-700/50 pb-2">
              <el-icon class="text-cyan-400"><SetUp /></el-icon> 视图图层控制
            </div>
            <div class="flex flex-col gap-3">
               <div class="flex items-center justify-between group">
                 <span class="text-sm text-slate-300 group-hover:text-cyan-300 transition-colors">人员实时分布</span>
                 <el-switch v-model="layers.people" active-color="#06b6d4" />
               </div>
               <div class="flex items-center justify-between group">
                 <span class="text-sm text-slate-300 group-hover:text-amber-400 transition-colors">人流热力图</span>
                 <el-switch v-model="layers.heatmap" active-color="#f59e0b" />
               </div>
               <div class="flex items-center justify-between group">
                 <span class="text-sm text-slate-300 group-hover:text-red-400 transition-colors">电子围栏/禁区</span>
                 <el-switch v-model="layers.fence" active-color="#ef4444" />
               </div>
               <div class="flex items-center justify-between group">
                 <span class="text-sm text-slate-300 group-hover:text-green-400 transition-colors">安保巡检轨迹</span>
                 <el-switch v-model="layers.patrol" active-color="#10b981" />
               </div>
            </div>
          </div>

          <!-- 3. 安全预警中心 (Fix: flex-1 + overflow-hidden) -->
          <div class="flex-1 min-h-0 bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700/50 p-4 shadow-xl flex flex-col overflow-hidden">
             <div class="flex-none flex items-center justify-between mb-4 border-b border-slate-700/50 pb-2">
                <div class="flex items-center gap-2 text-slate-200 font-bold">
                  <el-icon class="text-red-500 animate-pulse"><Warning /></el-icon> 安全预警中心
                </div>
                <span class="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded-full border border-red-800">{{ alerts.length }}</span>
             </div>
             <!-- 告警列表容器 (Fix: overflow-y-auto) -->
             <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <transition-group name="list">
                  <div v-for="(alert, idx) in alerts" :key="alert.id" 
                       class="p-3 rounded-lg bg-red-950/30 border border-red-900/50 flex gap-3 items-start hover:bg-red-900/20 transition-colors group">
                     <div class="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0 group-hover:animate-ping"></div>
                     <div class="flex-1">
                       <div class="text-xs text-red-300 font-bold mb-0.5">{{ alert.title }}</div>
                       <div class="flex justify-between text-[10px] text-red-400/60 font-mono">
                         <span>{{ alert.time }}</span>
                         <span>{{ alert.loc }}</span>
                       </div>
                     </div>
                  </div>
                </transition-group>
                <div v-if="alerts.length === 0" class="h-full flex flex-col items-center justify-center text-slate-500 gap-2 opacity-50">
                  <el-icon :size="30"><CircleCheck /></el-icon>
                  <span class="text-xs">系统运行正常</span>
                </div>
             </div>
          </div>
        </div>

        <!-- 右侧：核心地图可视区 -->
        <div class="flex-1 bg-[#0f172a] rounded-xl border border-slate-700/50 relative overflow-hidden shadow-2xl group flex flex-col">
           <!-- 顶部悬浮图例 -->
           <div class="absolute top-4 left-4 z-20 flex gap-4 bg-slate-900/90 p-3 rounded-lg border border-slate-700 backdrop-blur-md shadow-lg">
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span><span class="text-xs text-slate-300 font-bold">观众</span></div>
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]"></span><span class="text-xs text-slate-300 font-bold">参展商</span></div>
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-green-500 border border-white shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span><span class="text-xs text-slate-300 font-bold">安保人员</span></div>
           </div>

           <!-- 地图绘制容器 -->
           <div ref="adminContainerRef" class="flex-1 relative cursor-crosshair overflow-hidden">
              
              <!-- 1. SVG 底图 -->
              <div v-if="mapLoaded" v-html="svgContent" class="absolute inset-0 w-full h-full opacity-30 admin-map pointer-events-none select-none"></div>
              
              <!-- 2. 热力图层 (Canvas) -->
              <canvas ref="heatmapCanvasRef" class="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ease-in-out" 
                      :class="layers.heatmap ? 'opacity-80' : 'opacity-0'"></canvas>

              <!-- 3. 电子围栏层 (SVG Overlay) -->
              <svg v-if="layers.fence" class="absolute inset-0 w-full h-full pointer-events-none z-0">
                 <rect :x="fence.x" :y="fence.y" :width="fence.w" :height="fence.h" 
                       fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2" stroke-dasharray="8,4"
                       class="animate-pulse-slow" />
                 <text :x="fence.x + 10" :y="fence.y + 24" fill="#ef4444" font-size="14" font-weight="bold" letter-spacing="2">RESTRICTED AREA</text>
              </svg>

              <!-- 4. 巡检轨迹层 (Canvas) -->
              <canvas ref="patrolCanvasRef" 
                      class="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-300"
                      :class="layers.patrol ? 'opacity-100' : 'opacity-0'"></canvas>

              <!-- 5. 人员实体层 (DOM) -->
              <div v-if="layers.people" class="absolute inset-0 pointer-events-none z-20">
                 <div v-for="p in crowd" :key="p.id" 
                      class="absolute rounded-full transition-transform duration-100 ease-linear will-change-transform"
                      :class="{
                        'w-2 h-2 bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]': p.role === 'visitor',
                        'w-2 h-2 bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]': p.role === 'exhibitor',
                        'w-3.5 h-3.5 bg-green-500 border-2 border-slate-100 shadow-[0_0_10px_rgba(74,222,128,0.8)] z-30': p.role === 'staff'
                      }"
                      :style="{ 
                        /* Fix 3: 使用 mapScale 乘以逻辑坐标，解决错位 */
                        transform: `translate(${p.x * mapScale.x}px, ${p.y * mapScale.y}px)` 
                      }">
                      <div v-if="p.role === 'staff'" class="absolute -top-5 -left-4 text-[9px] text-green-300 font-bold whitespace-nowrap bg-slate-900/90 px-1.5 py-0.5 rounded border border-green-900/50">
                        SEC-0{{p.id % 10}}
                      </div>
                 </div>
              </div>

           </div>

           <!-- 底部操作条 -->
           <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-700/60 backdrop-blur-md z-40 shadow-2xl">
              <el-tooltip content="重置视图" placement="top">
                <el-button circle color="#334155" :icon="RefreshRight" @click="resetAdminView" />
              </el-tooltip>
              <el-tooltip content="模拟突发事件" placement="top">
                <el-button type="danger" circle :icon="Warning" @click="triggerEmergency" class="animate-pulse" />
              </el-tooltip>
              <el-tooltip content="导出数据报表" placement="top">
                <el-button type="primary" circle :icon="Download" />
              </el-tooltip>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, nextTick } from 'vue';
import { 
  Switch, DataLine, LocationFilled, Place, 
  DataAnalysis, SetUp, Warning,
  RefreshRight, Download, CircleCheck
} from '@element-plus/icons-vue';
import { ElMessage, ElNotification } from 'element-plus';

// ======================= 1. 全局状态 =======================
const isAdmin = ref(true); 
const currentTime = ref('');

// 仪表盘数据
const dashboardData = reactive({
  totalVisitors: 12450,
  securityCount: 18,
  alerts: 2
});

// 图层控制
const layers = reactive({
  people: true,
  heatmap: false,
  fence: true,
  patrol: false
});

// 地图缩放比例 (Fix 3: 用于同步 DOM 和 Canvas)
const mapScale = reactive({ x: 1, y: 1 });

// 告警队列
const alerts = ref<{id: number, title: string, time: string, loc: string}[]>([
  { id: 1, title: '非授权人员闯入', time: '13:02', loc: '核心机房 #01' },
  { id: 2, title: '设备离线', time: '12:45', loc: 'B区网关' }
]);

// 地图相关 Ref
const mapLoaded = ref(false);
const svgContent = ref('');
const adminContainerRef = ref<HTMLElement>();
const userContainerRef = ref<HTMLElement>();
const heatmapCanvasRef = ref<HTMLCanvasElement>();
const patrolCanvasRef = ref<HTMLCanvasElement>();
const userCanvasRef = ref<HTMLCanvasElement>();

// ======================= 2. 模拟数据引擎 =======================

type Person = { 
  id: number, 
  x: number, y: number, 
  vx: number, vy: number, 
  role: 'visitor'|'staff'|'exhibitor', 
  path: {x:number, y:number}[] 
};

const crowd = ref<Person[]>([]);
const fence = { x: 620, y: 80, w: 180, h: 120 }; 

// 个人端模拟状态
const userPos = reactive({ x: 100, y: 300 });
const userAngle = ref(0);
const isNavigating = ref(false);
const fps = ref(60);
let animId: number;
let lastTime = 0;

// ======================= 修改部分 1: 定义精准的物理墙体 =======================
// x, y, w, h 完全对应 SVG 的视觉元素
// SVG 视口: 1000 x 600. 内部可行走区域: x[50-950], y[50-550]
const obstacles = [
  // --- 1. 四周边界墙 (这是最关键的，把四周封死) ---
  { x: 0, y: 0, w: 1000, h: 50 },     // 上墙 (y < 50)
  { x: 0, y: 550, w: 1000, h: 50 },   // 下墙 (y > 550)
  { x: 0, y: 50, w: 50, h: 500 },     // 左墙 (x < 50)
  { x: 950, y: 50, w: 50, h: 500 },   // 右墙 (x > 950)

  // --- 2. 内部隔断墙 (SVG 中 stroke-width=4，这里设为 8 增加碰撞容错) ---
  // 左上隔断 (SVG: M300,50 V220) -> 中心300，上下延伸
  { x: 296, y: 50, w: 8, h: 170 },
  // 左下隔断 (SVG: M300,380 V550)
  { x: 296, y: 380, w: 8, h: 170 },
  // 右上隔断 (SVG: M700,50 V220)
  { x: 696, y: 50, w: 8, h: 170 },
  // 右下隔断 (SVG: M700,380 V550)
  { x: 696, y: 380, w: 8, h: 170 },

  // --- 3. 展位实体 (A区 & B区) ---
  // A区 (左侧)
  { x: 100, y: 100, w: 140, h: 80 },
  { x: 100, y: 250, w: 140, h: 80 },
  { x: 100, y: 400, w: 140, h: 80 },
  // B区 (右侧)
  { x: 760, y: 100, w: 140, h: 80 },
  { x: 760, y: 250, w: 140, h: 80 },
  { x: 760, y: 400, w: 140, h: 80 },
];

// ======================= 修改部分 2: 碰撞检测算法 =======================
// 增加 buffer 缓冲距离，防止仅仅贴着墙穿过去
const checkCollision = (x: number, y: number, radius: number = 4) => {
  for (const obs of obstacles) {
    // AABB 碰撞检测 (Axis-Aligned Bounding Box)
    // 检查点 (x,y) 的半径范围内是否与矩形 obs 重叠
    if (
      x + radius > obs.x &&           // 粒子右边缘 > 墙左边缘
      x - radius < obs.x + obs.w &&   // 粒子左边缘 < 墙右边缘
      y + radius > obs.y &&           // 粒子下边缘 > 墙上边缘
      y - radius < obs.y + obs.h      // 粒子上边缘 < 墙下边缘
    ) {
      return true;
    }
  }
  return false;
};

// ======================= 修改部分 3: 出生点生成 (防止出生在墙里) =======================
const createPerson = (role: 'visitor'|'staff'|'exhibitor'): Person => {
  let safeX, safeY;
  let attempts = 0;
  // 尝试 100 次找到一个空闲位置
  do {
    // 限制随机生成范围在内部区域 (60~940, 60~540)
    safeX = 60 + Math.random() * 880;
    safeY = 60 + Math.random() * 480;
    attempts++;
  } while (checkCollision(safeX, safeY, 8) && attempts < 100);

  // 如果实在找不到（极端情况），强制放在中庭 (500, 300)
  if (attempts >= 100) {
    safeX = 500;
    safeY = 300;
  }

  return {
    id: Math.floor(Math.random() * 100000),
    x: safeX,
    y: safeY,
    // 稍微降低一点速度，避免速度过快导致的"穿墙"（隧道效应）
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    role: role,
    path: [] 
  };
};

// ======================= 修改部分 4: 物理引擎更新 (更严格的反弹) =======================
const updatePhysics = () => {
  if (!mapLoaded.value) return;

  crowd.value.forEach(p => {
    // 1. 随机扰动 (模拟行走意图)
    if (Math.random() < 0.05) {
      p.vx += (Math.random() - 0.5) * 0.5;
      p.vy += (Math.random() - 0.5) * 0.5;
    }
    
    // 2. 摩擦力/阻力 (限制最大速度，防止穿墙)
    const speed = Math.hypot(p.vx, p.vy);
    const maxSpeed = 3.0; // 限制最大速度
    if (speed > maxSpeed) {
      p.vx = (p.vx / speed) * maxSpeed;
      p.vy = (p.vy / speed) * maxSpeed;
    } else if (speed > 0.1) {
       // 正常的空气阻力
       p.vx *= 1.0;
       p.vy *= 1.0;
    }

    // 3. 分轴碰撞检测 (分离 X 和 Y 轴，确保贴墙滑行效果)
    const radius = 4; // 粒子半径

    // --- X 轴移动尝试 ---
    let nextX = p.x + p.vx;
    if (checkCollision(nextX, p.y, radius)) {
      p.vx *= -0.6; // 碰到墙反弹，并损失能量
      // 简单的重叠修正：如果反弹后还在墙里，这一帧不移动 X
    } else {
      p.x = nextX;
    }

    // --- Y 轴移动尝试 ---
    let nextY = p.y + p.vy;
    if (checkCollision(p.x, nextY, radius)) {
      p.vy *= -0.6; // 碰到墙反弹
    } else {
      p.y = nextY;
    }

    // 4. 电子围栏逻辑 (保持不变)
    if (layers.fence && p.role !== 'staff') {
      if (p.x > fence.x && p.x < fence.x + fence.w && 
          p.y > fence.y && p.y < fence.y + fence.h) {
        if (Math.random() < 0.005) {
           addAlert(`越界告警: ${p.role === 'visitor' ? '观众' : '展商'}闯入`, '机房禁区 #01');
           // 强力推离
           p.vx = -Math.abs(p.vx) * 6; 
           p.vy = (Math.random() - 0.5) * 6;
        }
      }
    }

    // 5. 记录轨迹
    if (p.role === 'staff') {
      p.path.push({x: p.x, y: p.y});
      if (p.path.length > 300) p.path.shift();
    }
  });

  // 模拟数据变动
  if (Math.random() < 0.1) {
    dashboardData.totalVisitors += Math.floor(Math.random() * 5) - 2;
  }
};


// SVG 初始化
const loadMap = async () => {
  const svg = `
    <svg viewBox="0 0 1000 600" width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- 墙体结构 -->
      <path d="M50,50 H950 V550 H50 Z" fill="none" stroke="#64748b" stroke-width="4" />
      <path d="M300,50 V220" stroke="#64748b" stroke-width="4" />
      <path d="M300,380 V550" stroke="#64748b" stroke-width="4" />
      <path d="M700,50 V220" stroke="#64748b" stroke-width="4" />
      <path d="M700,380 V550" stroke="#64748b" stroke-width="4" />

      <!-- 展位 A区 -->
      <g fill="#1e293b" stroke="#334155" stroke-width="2">
        <rect x="100" y="100" width="140" height="80" rx="4" />
        <rect x="100" y="250" width="140" height="80" rx="4" />
        <rect x="100" y="400" width="140" height="80" rx="4" />
      </g>
      <!-- 展位 B区 -->
      <g fill="#1e293b" stroke="#334155" stroke-width="2">
        <rect x="760" y="100" width="140" height="80" rx="4" />
        <rect x="760" y="250" width="140" height="80" rx="4" />
        <rect x="760" y="400" width="140" height="80" rx="4" />
      </g>
      
      <!-- 中庭 -->
      <circle cx="500" cy="300" r="100" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="8,4" />
      <text x="500" y="305" fill="#64748b" font-family="monospace" font-size="20" text-anchor="middle" font-weight="bold" opacity="0.5">CENTRAL HALL</text>
      
      <text x="170" y="145" fill="#475569" font-size="14" text-anchor="middle">A-01</text>
      <text x="170" y="295" fill="#475569" font-size="14" text-anchor="middle">A-02</text>
      <text x="830" y="145" fill="#475569" font-size="14" text-anchor="middle">B-01</text>
    </svg>
  `;
  svgContent.value = svg;
  mapLoaded.value = true;
  initCrowd();
};

const initCrowd = () => {
  const newCrowd: Person[] = [];
  for(let i=0; i<60; i++) newCrowd.push(createPerson('visitor'));
  for(let i=0; i<15; i++) newCrowd.push(createPerson('exhibitor'));
  for(let i=0; i<4; i++) newCrowd.push(createPerson('staff'));
  crowd.value = newCrowd;
};

// Fix 4: 生成位置防卡死

const renderCanvas = () => {
  if (!mapLoaded.value || !adminContainerRef.value) return;

  const containerW = adminContainerRef.value.clientWidth;
  const containerH = adminContainerRef.value.clientHeight;
  
  // Fix 3: 计算并同步缩放比例
  const currentScaleX = containerW / 1000;
  const currentScaleY = containerH / 600;
  mapScale.x = currentScaleX;
  mapScale.y = currentScaleY;

  // 热力图
  if (layers.heatmap && heatmapCanvasRef.value) {
    const ctx = heatmapCanvasRef.value.getContext('2d');
    if (ctx) {
      heatmapCanvasRef.value.width = containerW;
      heatmapCanvasRef.value.height = containerH;
      ctx.clearRect(0, 0, containerW, containerH);
      
      crowd.value.forEach(p => {
        const screenX = p.x * currentScaleX;
        const screenY = p.y * currentScaleY;
        ctx.beginPath();
        const grad = ctx.createRadialGradient(screenX, screenY, 5, screenX, screenY, 25);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(screenX - 25, screenY - 25, 50, 50);
      });
    }
  }

  // 轨迹图 (Fix 2: 只绘制 staff)
  if (layers.patrol && patrolCanvasRef.value) {
    const ctx = patrolCanvasRef.value.getContext('2d');
    if (ctx) {
      patrolCanvasRef.value.width = containerW;
      patrolCanvasRef.value.height = containerH;
      ctx.clearRect(0, 0, containerW, containerH);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4ade80'; 
      ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
      ctx.shadowBlur = 4;

      const guards = crowd.value.filter(p => p.role === 'staff');
      guards.forEach(g => {
        if (g.path.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(g.path[0].x * currentScaleX, g.path[0].y * currentScaleY);
        for (let i = 1; i < g.path.length; i++) {
          ctx.lineTo(g.path[i].x * currentScaleX, g.path[i].y * currentScaleY);
        }
        ctx.stroke();
      });
    }
  }
};

// ======================= 4. 用户端导航逻辑 =======================
let navPathIndex = 0;
const navWaypoints = [
  {x: 100, y: 300}, {x: 200, y: 300}, {x: 280, y: 300}, 
  {x: 350, y: 280}, {x: 350, y: 200}, {x: 350, y: 150},
  {x: 450, y: 150}, {x: 550, y: 150}, {x: 600, y: 150},
  {x: 700, y: 180}, {x: 750, y: 220}
];

const updateNavigation = () => {
  if (!isNavigating.value || !userContainerRef.value) return;
  const target = navWaypoints[navPathIndex];
  if (!target) {
    isNavigating.value = false;
    ElMessage.success('已到达目的地: A区会议室');
    return;
  }
  const dx = target.x - userPos.x;
  const dy = target.y - userPos.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 5) { navPathIndex++; return; }

  const speed = 2.5;
  userPos.x += (dx / dist) * speed;
  userPos.y += (dy / dist) * speed;
  userAngle.value = Math.atan2(dy, dx) * (180 / Math.PI);

  if (userCanvasRef.value) {
    const ctx = userCanvasRef.value.getContext('2d');
    if (ctx) {
      userCanvasRef.value.width = userContainerRef.value.clientWidth;
      userCanvasRef.value.height = userContainerRef.value.clientHeight;
      const scaleX = userCanvasRef.value.width / 1000;
      const scaleY = userCanvasRef.value.height / 600;
      ctx.clearRect(0, 0, userCanvasRef.value.width, userCanvasRef.value.height);
      ctx.beginPath();
      ctx.moveTo(userPos.x * scaleX, userPos.y * scaleY);
      for(let i = navPathIndex; i < navWaypoints.length; i++) {
        ctx.lineTo(navWaypoints[i].x * scaleX, navWaypoints[i].y * scaleY);
      }
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 8]);
      ctx.stroke();
    }
  }
};

// ======================= 5. 交互与控制 =======================

const startNavigationDemo = () => {
  userPos.x = 100;
  userPos.y = 300;
  navPathIndex = 0;
  isNavigating.value = true;
};

const switchMode = () => {
  isAdmin.value = !isAdmin.value;
  if (isAdmin.value) {
    isNavigating.value = false;
    nextTick(() => { if(!crowd.value.length) initCrowd(); });
  } else {
    startNavigationDemo();
  }
};

const triggerEmergency = () => {
  addAlert('检测到人群异常聚集', 'C区中心通道');
  ElNotification({
    title: '应急响应已触发',
    message: '已自动下发疏散指令至最近显示屏，并调度安保人员前往。',
    type: 'error',
    duration: 5000,
    position: 'bottom-right'
  });
  crowd.value.filter(p => p.role === 'staff').forEach(p => {
    // 简单的“寻路”向量，由于增加了物理墙壁，这里可能被墙挡住
    // 在真实系统中需要 A* 寻路，这里简单演示向中心靠拢
    p.vx = (500 - p.x) * 0.02;
    p.vy = (300 - p.y) * 0.02;
  });
};

const resetAdminView = () => {
  layers.heatmap = false;
  layers.patrol = false;
  alerts.value = [];
  initCrowd();
  ElMessage.info('视图已重置');
};

const addAlert = (title: string, loc: string) => {
  alerts.value.unshift({
    id: Date.now(),
    title, loc, 
    time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit', second:'2-digit'})
  });
  if (alerts.value.length > 50) alerts.value.pop();
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
};

const animate = (time: number) => {
  if (lastTime) fps.value = Math.round(1000 / (time - lastTime));
  lastTime = time;

  if (isAdmin.value) {
    updatePhysics();
    renderCanvas();
  } else {
    updateNavigation();
  }
  animId = requestAnimationFrame(animate);
};

onMounted(() => {
  loadMap();
  animId = requestAnimationFrame(animate);
  setInterval(updateTime, 1000);
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4); 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569; 
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b; 
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

div {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
</style>
