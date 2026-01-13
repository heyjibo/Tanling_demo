<template>
  <div class="h-screen w-full bg-[#0b1121] text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-cyan-500 selection:text-white" :class="{ 'emergency-flash': isEmergency }">
    
    <!-- ==================== 0. 顶部全局导航栏 ==================== -->
    <div class="flex-none h-16 bg-slate-900/80 border-b border-slate-700/60 z-50 backdrop-blur-md flex items-center justify-between px-6 transition-colors duration-500" :class="isEmergency ? 'bg-red-900/50 border-red-500/50' : ''">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded border border-slate-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <el-icon :size="24" color="#fff"><DataLine /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r" :class="isEmergency ? 'from-red-400 to-yellow-400' : 'from-cyan-400 to-blue-400'">
            {{ isEmergency ? '⚠ 应急指挥模式 ACTIVATED' : '会展中心高精度定位运营平台' }}
          </h1>
          <div class="text-[10px] text-slate-400 font-mono tracking-widest">UWB HIGH PRECISION POSITIONING SYSTEM</div>
        </div>
      </div>

      <!-- 顶部数据概览 (管理员) -->
      <div v-if="isAdmin" class="hidden xl:flex gap-8">
        <div class="flex flex-col items-center">
          <span class="text-[10px] text-slate-500 uppercase">Total Visitors</span>
          <span class="text-xl font-mono font-bold text-slate-200">{{ visitorCount }}</span>
        </div>
        <div class="flex flex-col items-center">
           <span class="text-[10px] text-slate-500 uppercase">Security Staff</span>
           <span class="text-xl font-mono font-bold text-blue-400">{{ staffCounts.security }}/{{ staffCounts.totalSecurity }}</span>
        </div>
        <div class="flex flex-col items-center cursor-pointer" @click="toggleNightMode">
           <span class="text-[10px] text-slate-500 uppercase">Mode</span>
           <span class="text-xl font-bold" :class="isNightMode ? 'text-indigo-400' : 'text-yellow-400'">
             {{ isNightMode ? '🌙 Night' : '☀ Day' }}
           </span>
        </div>
        <!-- 应急按钮 -->
        <button @click="toggleEmergency" class="px-4 py-1 rounded border font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]" :class="isEmergency ? 'bg-red-600 text-white border-white animate-pulse' : 'bg-transparent text-red-500 border-red-500 hover:bg-red-900/30'">
            {{ isEmergency ? '结束应急' : '启动应急预案' }}
        </button>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right hidden sm:block">
           <div class="text-xs text-slate-400">{{ isAdmin ? '管理员控制台' : '访客小程序' }}</div>
           <div class="text-[10px] text-slate-600 font-mono">{{ currentTime }}</div>
        </div>
        <el-button :type="isAdmin ? 'primary' : 'warning'" @click="switchRole" circle size="large" class="!border-0 shadow-lg">
          <el-icon :size="18"><Switch /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- ==================== 内容区域 ==================== -->
    <div class="flex-1 flex min-h-0 overflow-hidden relative">
      
      <!-- [用户端] Mobile View (简化版) -->
      <div v-if="!isAdmin" class="w-full h-full flex items-center justify-center bg-slate-950 relative overflow-hidden animate-fade-in">
        <div class="w-full h-full max-w-[420px] bg-[#0f172a] flex flex-col relative shadow-2xl overflow-hidden sm:rounded-xl sm:h-[90vh] sm:border sm:border-slate-700">
          <div class="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-700/50 flex items-center justify-between px-4 z-20">
             <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                   <el-icon color="#fff"><LocationFilled /></el-icon>
                </div>
                <div>
                   <div class="text-xs text-slate-400">设备: UWB手环 (ID: 999)</div>
                   <div class="text-sm font-bold text-slate-100 flex items-center gap-1">
                      {{ userLocationText }} 
                      <el-tag size="small" :type="isEmergency ? 'danger' : 'success'" effect="dark">{{ isEmergency ? '请立即撤离' : '定位正常' }}</el-tag>
                   </div>
                </div>
             </div>
          </div>
          
          <!-- ✅ 修改：地图容器（移除 cursor-move） -->
          <div class="flex-1 relative bg-[#0a0e17] overflow-hidden">
             <!-- 导航指示 -->
             <div v-if="isNavigating || isEmergency" class="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white px-4 py-2 rounded-full z-30 shadow-lg backdrop-blur flex items-center gap-2 animate-bounce-slow whitespace-nowrap" :class="isEmergency ? '!bg-red-600' : ''">
                <el-icon><Guide /></el-icon> {{ isEmergency ? '前往最近出口' : `前往：${navigatingTo}` }} <span class="font-mono text-sm">{{ navigationDistance }}m</span>
             </div>
             
             <!-- ✅ 修改：地图层（应用相机跟随样式） -->
             <div class="absolute inset-0 will-change-transform" :style="userCameraStyle">
                <!-- SVG 地图 -->
                <div v-html="svgContent" class="absolute top-0 left-0 w-[1000px] h-[600px] opacity-50"></div>
                
                <!-- 导航线 -->
                <svg v-if="(isNavigating || isEmergency) && myPerson" class="absolute top-0 left-0 w-[1000px] h-[600px] pointer-events-none z-10">
                   <path :d="`M${myPerson.x},${myPerson.y} L${navTarget.x},${navTarget.y}`" :stroke="isEmergency ? '#ef4444' : '#3b82f6'" stroke-width="4" stroke-dasharray="8,6" class="animate-pulse" />
                   <circle :cx="navTarget.x" :cy="navTarget.y" r="10" :fill="isEmergency ? '#ef4444' : '#3b82f6'" class="animate-ping" />
                </svg>
                
                <!-- 自己的位置标记 -->
                <div v-if="myPerson" class="absolute w-0 h-0 z-50 transition-transform duration-100 linear" :style="{ transform: `translate(${myPerson.x}px, ${myPerson.y}px)` }">
                     <div class="absolute -top-3 -left-3 w-6 h-6 bg-cyan-500 border-2 border-white rounded-full shadow-[0_0_15px_cyan] flex items-center justify-center z-50 pulse-ring">
                       <el-icon :size="12" color="#fff"><User /></el-icon>
                     </div>
                </div>
             </div>
          </div>
          
          <div class="h-auto bg-slate-900 border-t border-slate-700/50 p-4 z-20 flex flex-col gap-3">
             <div class="flex justify-between items-center text-xs text-slate-400">
                <span>推荐目的地</span>
                <span v-if="isEmergency" class="text-red-500 font-bold animate-pulse">紧急状态生效中</span>
             </div>
             <div class="grid grid-cols-4 gap-2">
                <button v-for="dest in ['A-01', 'B-02', '主舞台', '出口']" :key="dest" @click="startNavigation(dest)" class="py-2 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700 hover:border-cyan-500">{{ dest }}</button>
             </div>
          </div>
        </div>
      </div>

      <!-- [管理端] -->
      <template v-else>
        <!-- A. 左侧导航 -->
        <div class="w-20 bg-slate-900 border-r border-slate-700/50 flex flex-col items-center py-6 gap-6 z-20">
          <el-tooltip content="数据看板" placement="right"><button @click="currentTab = 'dashboard'" :class="navClass('dashboard')"><el-icon :size="22"><DataAnalysis /></el-icon></button></el-tooltip>
          <el-tooltip content="全域监控" placement="right"><button @click="currentTab = 'monitor'" :class="navClass('monitor')"><el-icon :size="22"><MapLocation /></el-icon></button></el-tooltip>
          <el-tooltip content="展位分析" placement="right"><button @click="currentTab = 'heatmap'" :class="navClass('heatmap')"><el-icon :size="22"><TrendCharts /></el-icon></button></el-tooltip>
          <el-tooltip content="工单与调度" placement="right"><button @click="currentTab = 'workorder'" :class="navClass('workorder')"><el-icon :size="22"><List /></el-icon></button></el-tooltip>
        </div>

        <!-- B. 主工作区 -->
        <div class="flex-1 bg-[#0f172a] relative overflow-hidden flex flex-col">
          
          <!-- TAB 1: Dashboard (数据看板) -->
          <div v-if="currentTab === 'dashboard'" class="p-6 h-full overflow-y-auto custom-scrollbar animate-fade-in">
             <!-- 核心指标 -->
             <div class="grid grid-cols-4 gap-6 mb-6">
                <div class="bg-slate-800/60 p-5 rounded-xl border border-slate-700/50 shadow-lg"><div class="text-slate-400 text-xs uppercase">今日客流</div><div class="text-2xl font-bold font-mono text-slate-100 mt-1">18,542 <span class="text-xs text-green-400 font-normal">↑ 12%</span></div></div>
                <div class="bg-slate-800/60 p-5 rounded-xl border border-slate-700/50 shadow-lg"><div class="text-slate-400 text-xs uppercase">平均驻留</div><div class="text-2xl font-bold font-mono text-slate-100 mt-1">4h 12m</div></div>
                <div class="bg-slate-800/60 p-5 rounded-xl border border-slate-700/50 shadow-lg"><div class="text-slate-400 text-xs uppercase">拥堵指数</div><div class="text-2xl font-bold font-mono mt-1" :class="avgCongestion > 80 ? 'text-red-400' : 'text-orange-400'">{{ avgCongestion }}</div></div>
                <div class="bg-slate-800/60 p-5 rounded-xl border border-slate-700/50 shadow-lg"><div class="text-slate-400 text-xs uppercase">工单响应</div><div class="text-2xl font-bold font-mono text-blue-400 mt-1">3.5 <span class="text-xs text-slate-400">min</span></div></div>
             </div>

             <div class="grid grid-cols-3 gap-6 h-[500px]">
                <!-- 左：分区饱和度 (自定义进度条) -->
                <div class="col-span-2 bg-slate-800/60 rounded-xl border border-slate-700/50 p-5 flex flex-col">
                   <div class="flex justify-between mb-4">
                       <h3 class="text-slate-200 font-bold">区域实时饱和度与安全阈值</h3>
                       <el-tag size="small" type="info">每10s刷新</el-tag>
                   </div>
                   <div class="flex-1 flex flex-col justify-center gap-6 overflow-y-auto pr-2">
                      <div v-for="zone in zones" :key="zone.name" class="relative">
                         <div class="flex justify-between text-sm mb-1">
                             <span class="text-slate-300 font-medium">{{ zone.name }}</span>
                             <span class="font-mono text-xs" :class="zone.count > zone.capacity ? 'text-red-400 font-bold' : 'text-slate-400'">
                                 {{ zone.count }} / {{ zone.capacity }} ({{ ((zone.count/zone.capacity)*100).toFixed(0) }}%)
                             </span>
                         </div>
                         <div class="w-full bg-slate-700 h-3 rounded-full overflow-hidden relative">
                             <!-- 进度条 -->
                             <div class="h-full rounded-full transition-all duration-500" 
                                  :class="zone.count > zone.capacity ? 'bg-red-500' : (zone.count > zone.capacity*0.8 ? 'bg-orange-400' : 'bg-blue-500')"
                                  :style="{ width: `${Math.min((zone.count/zone.capacity)*100, 100)}%` }">
                             </div>
                             <!-- 阈值线 -->
                             <div class="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10" style="left: 80%" title="80% 预警线"></div>
                         </div>
                         <div v-if="zone.count > zone.capacity" class="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                             <el-icon><Warning /></el-icon> 超过安全阈值，请立即疏导
                         </div>
                      </div>
                   </div>
                </div>

                <!-- 右：实时告警列表 -->
                <div class="col-span-1 bg-slate-800/60 rounded-xl border border-slate-700/50 p-5 flex flex-col">
                   <h3 class="text-slate-200 font-bold mb-4 flex items-center gap-2">
                       <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> 实时告警中心
                   </h3>
                   <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                       <div v-for="a in alerts" :key="a.id" class="p-3 bg-slate-900/80 border-l-2 text-sm rounded transition-all hover:bg-slate-800" 
                            :class="a.level === 'high' ? 'border-red-500' : 'border-orange-400'">
                           <div class="flex justify-between items-start">
                               <span class="font-bold text-slate-200">{{ a.title }}</span>
                               <span class="text-[10px] text-slate-500">{{ a.time }}</span>
                           </div>
                           <div class="text-xs text-slate-400 mt-1">{{ a.loc }}</div>
                           <div v-if="a.level === 'high'" class="mt-2 text-right">
                               <el-button size="small" type="danger" plain class="!py-0 !h-6 !text-[10px]" @click="dispatchStaffToAlert(a)">立即派单</el-button>
                           </div>
                       </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- TAB 2: 全域监控 (Monitor) -->
          <div v-show="currentTab === 'monitor'" class="h-full flex flex-col relative animate-fade-in">
             <!-- 顶部控制条 -->
             <div class="absolute top-4 left-4 z-20 flex gap-4 pointer-events-auto">
                <div class="bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg flex items-center gap-4 shadow-xl">
                   <!-- 图例 -->
                   <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-cyan-400"></span><span class="text-[10px] text-slate-300">观众</span></div>
                   <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-purple-400"></span><span class="text-[10px] text-slate-300">展商</span></div>
                   <div class="flex items-center gap-2">
                       <div class="w-3 h-3 rounded bg-green-500 flex items-center justify-center text-[8px] text-black font-bold">S</div>
                       <span class="text-[10px] text-slate-300">安保</span>
                   </div>
                   <div class="flex items-center gap-2">
                       <div class="w-3 h-3 rounded bg-blue-400 flex items-center justify-center text-[8px] text-black font-bold">C</div>
                       <span class="text-[10px] text-slate-300">保洁</span>
                   </div>
                   <div class="h-4 w-px bg-slate-700"></div>
                   <!-- 巡检控制 -->
                   <el-button size="small" :type="patrolMode ? 'danger' : 'success'" @click="togglePatrol">
                       {{ patrolMode ? '结束巡检' : '开始安保巡检' }}
                   </el-button>
                </div>
             </div>

             <!-- 巡检信息面板 -->
             <div v-if="patrolMode" class="absolute top-4 right-4 z-20 w-64 bg-slate-900/90 backdrop-blur border border-green-500/50 p-3 rounded-lg shadow-xl">
                 <div class="flex justify-between items-center mb-2">
                     <span class="text-sm font-bold text-green-400">正在执行: 安保日常巡检</span>
                     <span class="animate-pulse w-2 h-2 rounded-full bg-green-500"></span>
                 </div>
                 <div class="space-y-2">
                     <div v-for="point in patrolRoutePoints" :key="point.id" class="text-xs flex items-center justify-between p-1 rounded" 
                          :class="point.status === 'done' ? 'bg-green-900/30' : (point.status === 'checking' ? 'bg-blue-900/30' : '')">
                         <span :class="point.status === 'done' ? 'text-green-400 line-through' : 'text-slate-300'">{{ point.name }}</span>
                         <span v-if="point.status === 'checking'" class="text-blue-400 font-mono">{{ point.progress }}%</span>
                         <el-icon v-if="point.status === 'done'" color="#4ade80"><CircleCheckFilled /></el-icon>
                     </div>
                 </div>
                 <div class="mt-2 pt-2 border-t border-slate-700 text-[10px] text-slate-500">
                     巡检员: Staff-001 (Security)
                 </div>
             </div>
             
             <!-- ✅ 修改：监控主视图（固定尺寸 + 居中 + 滚动条） -->
             <div ref="adminMonitorRef" class="flex-1 relative overflow-auto custom-scrollbar bg-[#0a0e17] flex items-center justify-center">
                <!-- ✅ 固定尺寸容器（1000x600） -->
                <div class="relative" style="width: 1000px; height: 600px; flex-shrink: 0;">
                  <!-- SVG 地图 -->
                  <div v-if="mapLoaded" v-html="svgContent" class="absolute inset-0 w-full h-full opacity-40 pointer-events-none select-none transition-opacity duration-300" :class="isNightMode ? 'opacity-20' : 'opacity-40'"></div>
                  
                  <!-- 围栏与区域 -->
                  <svg class="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <!-- 机房高危禁区 -->
                      <rect :x="serverRoom.x" :y="serverRoom.y" :width="serverRoom.w" :height="serverRoom.h" fill="rgba(255, 0, 0, 0.1)" stroke="red" stroke-width="2" />
                      <text :x="serverRoom.x+5" :y="serverRoom.y+15" fill="red" font-weight="bold" font-size="10">核心机房 (报警)</text>

                      <!-- 应急路线 (仅应急模式显示) -->
                      <g v-if="isEmergency" class="animate-pulse">
                          <path d="M500,300 L500,550" stroke="#ef4444" stroke-width="4" stroke-dasharray="10,5" marker-end="url(#arrow)" />
                          <path d="M250,300 L50,300" stroke="#ef4444" stroke-width="4" stroke-dasharray="10,5" />
                          <path d="M750,300 L950,300" stroke="#ef4444" stroke-width="4" stroke-dasharray="10,5" />
                      </g>
                  </svg>

                  <!-- 人员图层 -->
                  <div class="absolute inset-0 pointer-events-none z-20">
                      <div v-for="p in crowd" :key="p.id" class="absolute transition-transform duration-100 ease-linear will-change-transform flex items-center justify-center"
                          :style="{ transform: `translate(${p.x}px, ${p.y}px)` }">
                          
                          <!-- 观众/参展商 -->
                          <div v-if="p.role === 'visitor' || p.role === 'exhibitor'" 
                               class="rounded-full w-1.5 h-1.5"
                               :class="p.role === 'visitor' ? 'bg-cyan-300 opacity-80' : 'bg-purple-400 opacity-90'">
                          </div>

                          <!-- 工作人员 (带图标) -->
                          <div v-else class="relative">
                               <div class="w-4 h-4 rounded text-[8px] flex items-center justify-center font-bold text-black shadow-lg z-30 transition-colors"
                                    :class="getStaffColorClass(p.role)">
                                   {{ getStaffIcon(p.role) }}
                               </div>
                               <!-- 巡检/忙碌状态指示 -->
                               <div v-if="p.isBusy || (p.role === 'security' && patrolMode)" 
                                    class="absolute -inset-1 rounded border animate-ping opacity-50"
                                    :class="p.role === 'security' ? 'border-green-500' : 'border-blue-400'">
                               </div>
                          </div>
                      </div>
                  </div>
                </div>
             </div>
          </div>

          <!-- TAB 3: 展位分析 (Heatmap) -->
          <div v-show="currentTab === 'heatmap'" class="h-full flex gap-4 p-4 animate-fade-in relative">
             <!-- 左侧分析面板 -->
             <div class="w-80 flex-none flex flex-col gap-4 h-full overflow-hidden">
                <!-- 展位漏斗 -->
                <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 flex-none">
                   <h3 class="text-slate-200 font-bold mb-3 border-b border-slate-700 pb-2">热门展位转化漏斗</h3>
                   <div class="space-y-4">
                      <div v-for="(booth, i) in topBooths" :key="i" class="relative">
                          <div class="flex justify-between text-xs mb-1">
                              <span class="text-slate-300 font-bold">#{{ i+1 }} {{ booth.name }}</span>
                              <span class="text-slate-400">转化率 {{ booth.conversion }}%</span>
                          </div>
                          <!-- 漏斗条 -->
                          <div class="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                              <div class="h-full bg-blue-500" :style="{ width: booth.exposure + '%' }" title="曝光量"></div>
                          </div>
                          <div class="h-1.5 mt-0.5 bg-slate-700/50 rounded-full overflow-hidden flex w-[90%] mx-auto">
                               <div class="h-full bg-green-500" :style="{ width: booth.stay + '%' }" title="停留量"></div>
                          </div>
                      </div>
                   </div>
                </div>

                <!-- 智能疏导 -->
                <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 flex-1 flex flex-col">
                   <h3 class="text-slate-200 font-bold mb-3">智能疏导中心</h3>
                   <div class="flex-1 overflow-y-auto custom-scrollbar pr-1">
                       <div v-if="congestionAlerts.length === 0" class="h-full flex flex-col items-center justify-center text-slate-500 gap-2 opacity-50">
                           <el-icon :size="40"><CircleCheck /></el-icon>
                           <span class="text-xs">当前无严重拥堵</span>
                       </div>
                       <div v-else class="space-y-3">
                           <div v-for="(alert, idx) in congestionAlerts" :key="idx" class="p-3 bg-orange-900/20 border border-orange-500/30 rounded">
                               <div class="flex items-center gap-2 mb-1 text-orange-400 font-bold text-sm">
                                   <el-icon><Warning /></el-icon> {{ alert.zone }} 拥堵
                               </div>
                               <div class="text-xs text-slate-400 mb-2">密度: {{ alert.density }}% | 持续: {{ alert.duration }}min</div>
                               <el-button size="small" type="warning" plain class="w-full" @click="autoDispatch(alert)">
                                   一键调度最近安保
                               </el-button>
                           </div>
                       </div>
                   </div>
                </div>
             </div>

             <!-- ✅ 修改：热力图容器（固定尺寸 + 居中 + 滚动条） -->
             <div ref="adminHeatmapContainerRef" class="flex-1 bg-[#0a0e17] rounded-xl border border-slate-700/50 relative overflow-auto custom-scrollbar flex items-center justify-center">
                <!-- ✅ 固定尺寸容器（1000x600） -->
                <div class="relative" style="width: 1000px; height: 600px; flex-shrink: 0;">
                  <div v-if="mapLoaded" v-html="svgContent" class="absolute inset-0 w-full h-full opacity-30 pointer-events-none grayscale"></div>
                  <canvas ref="heatmapCanvasRef" width="1000" height="600" class="absolute inset-0 w-full h-full opacity-90"></canvas>
                  
                  <!-- 准确的4色图例 -->
                  <div class="absolute bottom-4 left-4 bg-slate-900/90 p-3 rounded border border-slate-700 backdrop-blur flex flex-col gap-1 shadow-lg">
                     <div class="text-[10px] text-slate-400 mb-1">实时热力密度</div>
                     <div class="w-32 h-3 rounded-sm" style="background: linear-gradient(to right, #0000ff, #00ff00, #ffff00, #ff0000);"></div>
                     <div class="flex justify-between text-[8px] text-slate-500 px-0.5">
                         <span>Low</span><span>High</span>
                     </div>
                  </div>
                </div>
             </div>
          </div>

          <!-- TAB 4: WorkOrder (工单与调度) -->
          <div v-if="currentTab === 'workorder'" class="h-full p-6 flex flex-col animate-fade-in overflow-hidden">
             <div class="flex justify-between items-center mb-4">
                 <h2 class="text-xl font-bold text-slate-200">工单与人员调度中心</h2>
                 <el-button type="primary" size="small" @click="createManualOrder">新建工单</el-button>
             </div>
             
             <div class="flex gap-6 h-full min-h-0">
                 <!-- 左：工单列表 -->
                 <div class="flex-1 bg-slate-800/40 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                    <el-table :data="filteredOrders" style="width: 100%; height: 100%; --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(30,41,59,0.5);">
                       <el-table-column prop="id" label="ID" width="70" />
                       <el-table-column prop="title" label="任务内容" show-overflow-tooltip />
                       <el-table-column prop="priority" label="优先级" width="80">
                           <template #default="{row}">
                               <span :class="row.priority==='high'?'text-red-400 font-bold':'text-slate-400'">{{ row.priority==='high'?'紧急':'普通' }}</span>
                           </template>
                       </el-table-column>
                       <el-table-column prop="status" label="状态" width="90">
                           <template #default="{row}">
                               <el-tag size="small" :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
                           </template>
                       </el-table-column>
                       <el-table-column label="执行人">
                           <template #default="{row}">
                               <div v-if="row.assignee" class="flex items-center gap-1 text-xs">
                                   <div class="w-2 h-2 rounded-full bg-green-500"></div> {{ row.assignee }}
                               </div>
                               <span v-else class="text-slate-600 text-xs italic">待分配</span>
                           </template>
                       </el-table-column>
                       <el-table-column label="操作" width="80">
                           <template #default="{row}">
                               <el-button v-if="row.status==='pending'" type="primary" link size="small" @click="autoDispatchOrder(row)">派单</el-button>
                           </template>
                       </el-table-column>
                    </el-table>
                 </div>

                 <!-- 右：人员状态列表 -->
                 <div class="w-72 bg-slate-800/40 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                     <div class="p-3 bg-slate-900/50 border-b border-slate-700 font-bold text-sm text-slate-300">工作人员状态</div>
                     <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                         <div v-for="staff in staffList" :key="staff.id" class="p-2 rounded bg-slate-900/40 border border-slate-700 flex items-center justify-between">
                             <div class="flex items-center gap-2">
                                 <div class="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-black" :class="getStaffColorClass(staff.role)">
                                     {{ getStaffIcon(staff.role) }}
                                 </div>
                                 <div>
                                     <div class="text-xs font-bold text-slate-300">Staff-{{ staff.id.toFixed(0).slice(-3) }}</div>
                                     <div class="text-[10px] text-slate-500 capitalize">{{ staff.role }}</div>
                                 </div>
                             </div>
                             <el-tag size="small" :type="staff.isBusy ? 'warning' : 'success'" effect="dark" class="!h-5 !text-[10px]">
                                 {{ staff.isBusy ? '忙碌' : '空闲' }}
                             </el-tag>
                         </div>
                     </div>
                 </div>
             </div>
          </div>

        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { 
  DataLine, Switch, DataAnalysis, MapLocation, List, 
  TrendCharts, User, LocationFilled, CircleCheckFilled, 
  Guide, Warning, CircleCheck 
} from '@element-plus/icons-vue';
import { ElMessage, ElNotification } from 'element-plus';

// ======================= Logo 资源导入 =======================
/*import logoA01 from '@/assets/logo/a-01.svg?raw';
import logoA02 from '@/assets/logo/a-02.svg?raw';
import logoA03 from '@/assets/logo/a-03.svg?raw';
import logoB01 from '@/assets/logo/b-01.svg?raw';
import logoB02 from '@/assets/logo/b-02.svg?raw';
import logoB03 from '@/assets/logo/b-03.svg?raw';
import logoC01 from '@/assets/logo/c-01.svg?raw';
import logoC02 from '@/assets/logo/c-02.svg?raw';
import logoD01 from '@/assets/logo/d-01.svg?raw';
import logoD02 from '@/assets/logo/d-02.svg?raw';
// Logo 映射表
const logoMap: Record<string, string> = {
  'A-01': logoA01, 'A-02': logoA02, 'A-03': logoA03,
  'B-01': logoB01, 'B-02': logoB02, 'B-03': logoB03,
  'C-01': logoC01, 'C-02': logoC02,
  'D-01': logoD01, 'D-02': logoD02,
};
*/

// ======================= 类型定义（完整） =======================
type Role = 'visitor' | 'exhibitor' | 'security' | 'cleaner' | 'maintenance';
type DeviceType = 'tag' | 'phone'; // 胸牌 / 手机
type OrderStatus = 'pending' | 'dispatched' | 'processing' | 'done';
type AlertLevel = 'low' | 'high';

interface Person { 
  id: number; 
  x: number; 
  y: number; 
  vx: number; 
  vy: number; 
  role: Role; 
  device: DeviceType;
  
  // 行为状态
  behaviorState: 'wandering' | 'approaching' | 'staying' | 'responding' | 'patrolling' | 'evacuating';
  targetHotspotIndex: number; 
  stayTimer: number; 
  
  // 工作人员属性
  isBusy: boolean;
  targetOrderId?: number; // 正在响应的工单ID
  
  // 巡检属性
  targetPointIdx?: number; 
  isChecking?: boolean;
}

interface WorkOrder {
  id: number;
  title: string;
  priority: 'normal' | 'high';
  status: OrderStatus;
  loc: string; // 坐标或区域名
  targetX: number;
  targetY: number;
  time: string;
  assignee?: string; // StaffID
}

interface Alert {
  id: number;
  title: string;
  loc: string;
  time: string;
  level: AlertLevel;
  zoneObj?: any;
}

interface PatrolRoutePoint {
  id: number;
  name: string;
  x: number;
  y: number;
  status: 'pending' | 'checking' | 'done';
  progress: number;
}

// ======================= 物理碰撞体定义 =======================
interface Collider {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'wall' | 'booth' | 'stage';
}

const colliders = ref<Collider[]>([
  // 外墙
  { x: 50, y: 50, w: 900, h: 4, type: 'wall' },      // 上墙
  { x: 50, y: 546, w: 900, h: 4, type: 'wall' },     // 下墙
  { x: 50, y: 50, w: 4, h: 500, type: 'wall' },      // 左墙
  { x: 946, y: 50, w: 4, h: 500, type: 'wall' },     // 右墙
  
  // 内部隔断墙
  { x: 300, y: 50, w: 4, h: 170, type: 'wall' },     // 左上隔断
  { x: 300, y: 380, w: 4, h: 170, type: 'wall' },    // 左下隔断
  { x: 700, y: 50, w: 4, h: 170, type: 'wall' },     // 右上隔断
  { x: 700, y: 380, w: 4, h: 170, type: 'wall' },    // 右下隔断
  
  // A区展位
  { x: 100, y: 80, w: 120, h: 80, type: 'booth' },   // A-01
  { x: 100, y: 260, w: 120, h: 80, type: 'booth' },  // A-02
  { x: 100, y: 440, w: 120, h: 80, type: 'booth' },  // A-03
  
  // B区展位
  { x: 780, y: 80, w: 120, h: 80, type: 'booth' },   // B-01
  { x: 780, y: 260, w: 120, h: 80, type: 'booth' },  // B-02
  { x: 780, y: 440, w: 120, h: 80, type: 'booth' },  // B-03
  
  // C区展位（舞台上方）
  { x: 360, y: 80, w: 120, h: 80, type: 'booth' },   // C-01
  { x: 520, y: 80, w: 120, h: 80, type: 'booth' },   // C-02
  
  // D区展位（舞台下方）
  { x: 360, y: 440, w: 120, h: 80, type: 'booth' },  // D-01
  { x: 520, y: 440, w: 120, h: 80, type: 'booth' },  // D-02
  
  // 中央舞台（圆形近似为正方形碰撞体）
  { x: 420, y: 220, w: 160, h: 160, type: 'stage' }, // Central Stage
]);


// ======================= 响应式变量 & 普通变量（顶层声明） =======================
// 系统核心配置
const isAdmin = ref(true);
const currentTab = ref('dashboard');
const currentTime = ref('');
const isNightMode = ref(false);
const isEmergency = ref(false); // 应急模式状态

// 导航相关变量
const isNavigating = ref(false); // 是否正在导航
const navigatingTo = ref(''); // 导航目标名称
const navTarget = reactive({ x: 0, y: 0 }); // 导航目标坐标
const myPersonId = ref(99999);

// 地图资源
const mapLoaded = ref(false);
const svgContent = ref('');
const adminMonitorRef = ref<HTMLElement>(); 
const adminHeatmapContainerRef = ref<HTMLElement>();
const heatmapCanvasRef = ref<HTMLCanvasElement>();
const monitorScale = reactive({ x: 1, y: 1 });
let resizeObserver: ResizeObserver | null = null; // 窗口大小监听实例

// 热力图相关
const heatmapPalette = ref<Uint8ClampedArray | null>(null); // 热力图图例数组
let frameCount = 0; // 热力图绘制节流计数器

// 人员 & 工单 & 告警相关
const crowd = ref<Person[]>([]);
const workOrders = ref<WorkOrder[]>([
  { id: 101, title: 'A-02 展位垃圾清理', priority: 'normal', status: 'processing', loc: 'A-02', targetX: 250, targetY: 300, time: '14:10', assignee: 'Staff-004' },
  { id: 102, title: 'B-01 电路检修', priority: 'high', status: 'done', loc: 'B-01', targetX: 750, targetY: 120, time: '10:30', assignee: 'Staff-005' },
]);
const alerts = ref<Alert[]>([]);
const patrolMode = ref(false);
const patrolRoutePoints = ref<PatrolRoutePoint[]>([
  { id: 1, name: 'A-01 消防点', x: 240, y: 120, status: 'pending', progress: 0 },
  { id: 2, name: '主舞台配电箱', x: 500, y: 300, status: 'pending', progress: 0 },
  { id: 3, name: 'B-02 垃圾桶', x: 760, y: 300, status: 'pending', progress: 0 },
]);

// 区域 & 围栏 & 热点定义
const zones = reactive([
  { name: '主舞台区', x: 420, y: 220, w: 160, h: 160, count: 0, capacity: 50 },
  { name: 'A区通道', x: 230, y: 50, w: 60, h: 500, count: 0, capacity: 60 },
  { name: 'B区通道', x: 710, y: 50, w: 60, h: 500, count: 0, capacity: 60 },
  { name: '入口大厅', x: 400, y: 50, w: 200, h: 100, count: 0, capacity: 80 }
]);
const fence = { x: 620, y: 80, w: 180, h: 120 }; // VIP 区域
const serverRoom = { x: 880, y: 480, w: 60, h: 60 }; // 机房禁区 (高危)
const activeHotspots = [
  { name: '主舞台', x: 500, y: 300, radius: 90 },
  { name: 'A-01 展位', x: 160, y: 120, radius: 40 },
  { name: 'A-02 展位', x: 160, y: 300, radius: 40 },
  { name: 'A-03 展位', x: 160, y: 480, radius: 40 },
  { name: 'B-01 展位', x: 840, y: 120, radius: 40 },
  { name: 'B-02 展位', x: 840, y: 300, radius: 40 },
  { name: 'B-03 展位', x: 840, y: 480, radius: 40 },
  { name: 'C-01 展位', x: 420, y: 120, radius: 40 },
  { name: 'C-02 展位', x: 580, y: 120, radius: 40 },
  { name: 'D-01 展位', x: 420, y: 480, radius: 40 },
  { name: 'D-02 展位', x: 580, y: 480, radius: 40 },
];


// ======================= 计算属性（顶层声明，模板可访问） =======================
// 安全的监控缩放比例
const safeMonitorScale = computed(() => {
  if (monitorScale.x === 0 || monitorScale.y === 0) return { x: 1, y: 1 };
  return monitorScale;
});

// 导航距离计算
const navigationDistance = computed(() => {
  const me = myPerson.value;
  if (!me) return 0;
  return Math.floor(Math.hypot(me.x - navTarget.x, me.y - navTarget.y));
});

// 我的个人信息（从人群中筛选）
const myPerson = computed(() => {
  return crowd.value.find(p => p.id === myPersonId.value);
});

// 用户位置文本
const userLocationText = computed(() => {
  if (isEmergency.value) return '紧急撤离中';
  return myPerson.value ? '会展中心内部' : '定位获取中';
});

// ✅ 新增：访客端相机偏移量（响应式）
const userCameraOffset = reactive({ x: 0, y: 0 });

// ✅ 修改：用户端相机样式（动态计算）
const userCameraStyle = computed(() => {
  if (!myPerson.value) {
    return {
      transform: 'scale(1.5) translate(0px, 0px)',
      transformOrigin: 'center center',
      transition: 'transform 0.3s ease-out'
    };
  }

  // 计算相机偏移（让用户始终在屏幕中心）
  // 地图原始尺寸 1000x600，缩放后需要反向偏移
  const scale = 1.5; // 放大倍数
  const centerX = -myPerson.value.x + 500 / scale; // 500 是容器宽度的一半
  const centerY = -myPerson.value.y + 300 / scale; // 300 是容器高度的一半

  return {
    transform: `scale(${scale}) translate(${centerX}px, ${centerY}px)`,
    transformOrigin: '0 0',
    transition: 'transform 0.3s ease-out' // 平滑过渡
  };
});


// 平均拥堵指数
const avgCongestion = computed(() => {
  const totalRate = zones.reduce((sum, zone) => {
    const rate = (zone.count / zone.capacity) * 100;
    return sum + Math.min(rate, 100);
  }, 0);
  return Math.floor(totalRate / zones.length);
});

// 访客总数
const visitorCount = computed(() => crowd.value.length);

// 工作人员统计
const staffCounts = computed(() => {
  const secs = crowd.value.filter(p => p.role === 'security');
  return { totalSecurity: secs.length, security: secs.length };
});

// 热门展位
const topBooths = computed(() => [
  { name: 'A-02 (AI体验)', exposure: 85, stay: 60, conversion: 70 },
  { name: '主舞台 (新品)', exposure: 95, stay: 45, conversion: 48 },
  { name: 'B-01 (智能硬件)', exposure: 60, stay: 30, conversion: 50 },
]);

// 拥堵告警列表
const congestionAlerts = computed(() => {
  const arr: { zone: string; density: number; duration: number }[] = [];
  for (const z of zones) {
    if (z.count > z.capacity) {
      arr.push({ zone: z.name, density: Math.round((z.count/z.capacity)*100), duration: 5 });
    }
  }
  return arr;
});

// 工作人员列表
const staffList = computed(() => {
  return crowd.value.filter(p => p.role !== 'visitor' && p.role !== 'exhibitor');
});

// 过滤工单（模板可访问）
const filteredOrders = computed(() => {
  return workOrders.value;
});

// ======================= 模板可访问的辅助函数（顶层声明） =======================
// 1. 切换管理员/访客角色
const switchRole = () => {
  isAdmin.value = !isAdmin.value;
  ElMessage.success(`已切换为${isAdmin.value ? '管理员模式' : '访客模式'}`);
};

// 2. 导航按钮样式类
const navClass = (tabName: string) => {
  return `w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
    currentTab.value === tabName 
      ? 'bg-cyan-600/20 text-cyan-400' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
  }`;
};

// 3. 切换巡检模式
const togglePatrol = () => {
  patrolMode.value = !patrolMode.value;
  if (patrolMode.value) {
    patrolRoutePoints.value.forEach(point => {
      point.status = 'pending';
      point.progress = 0;
    });
    ElMessage.success('已启动安保巡检模式');
  } else {
    ElMessage.info('已结束安保巡检模式');
  }
};

// 4. 新建手动工单
const createManualOrder = () => {
  const newOrder: WorkOrder = {
    id: Date.now(),
    title: '手动创建：常规巡检任务',
    priority: 'normal',
    status: 'pending',
    loc: '主舞台区',
    targetX: 500,
    targetY: 300,
    time: new Date().toLocaleTimeString()
  };
  workOrders.value.unshift(newOrder);
  ElMessage.success('已新建手动工单');
};

// 5. 工单状态对应Element标签类型
const getStatusType = (s: OrderStatus) => {
  if (s === 'done') return 'success';
  if (s === 'processing') return 'primary';
  return 'warning';
};

// 6. 工单状态中文标签
const getStatusLabel = (s: OrderStatus) => {
  const map = { pending: '待派单', dispatched: '已接单', processing: '处理中', done: '已完成' };
  return map[s] || s;
};

// 7. 工作人员颜色类
const getStaffColorClass = (role: Role) => {
  switch(role) {
    case 'security': return 'bg-green-500';
    case 'cleaner': return 'bg-blue-400';
    case 'maintenance': return 'bg-orange-400';
    default: return 'bg-gray-400';
  }
};

// 8. 工作人员图标
const getStaffIcon = (role: Role) => {
  switch(role) {
    case 'security': return 'S';
    case 'cleaner': return 'C';
    case 'maintenance': return 'M';
    default: return '?';
  }
};

// ======================= 核心业务逻辑函数（顶层声明） =======================
// 初始化人群
// 初始化人群
const initCrowd = () => {
  const arr: Person[] = [];
  
  // 1. 自己 (Visitor, Phone) - 从入口生成
  const me = createPerson('visitor'); 
  me.id = 99999; 
  me.x = 500; // 入口中心
  me.y = 530; 
  me.device = 'phone';
  arr.push(me);
  
  // 2. 观众 (150人) - 全部从入口生成
  for(let i=0; i<150; i++) {
    arr.push(createPerson('visitor'));
  }
  
// 3. 参展商 (20人) - 随机分布在展位附近，并设置初始行为
for(let i=0; i<20; i++) {
  const exhibitor = createPerson('exhibitor');
  // 参展商在展位附近生成
  const booth = activeHotspots[Math.floor(Math.random() * activeHotspots.length)];
  exhibitor.x = booth.x + (Math.random()-0.5) * 50;
  exhibitor.y = booth.y + (Math.random()-0.5) * 50;
  
  // 🔥 参展商初始状态设置为游荡（避免长时间停留）
  exhibitor.behaviorState = 'wandering';
  exhibitor.targetHotspotIndex = Math.floor(Math.random() * activeHotspots.length);
  
  arr.push(exhibitor);
}

  
  // 4. 工作人员 - 随机分布
  for(let i=0; i<5; i++) {
    const security = createPerson('security');
    security.x = 100 + Math.random() * 800;
    security.y = 100 + Math.random() * 400;
    arr.push(security);
  }
  
  for(let i=0; i<3; i++) {
    const cleaner = createPerson('cleaner');
    cleaner.x = 100 + Math.random() * 800;
    cleaner.y = 100 + Math.random() * 400;
    arr.push(cleaner);
  }
  
  for(let i=0; i<2; i++) {
    const maintenance = createPerson('maintenance');
    maintenance.x = 100 + Math.random() * 800;
    maintenance.y = 100 + Math.random() * 400;
    arr.push(maintenance);
  }
  
  crowd.value = arr;
};


// 创建单个人员（统一从入口生成）
const createPerson = (role: Role): Person => {
  // 🔥 统一入口：安全出口上方，D-01 和 D-02 中间（坐标 440, 520 附近）
  const entranceX = 440 + Math.random() * 120; // 440-560 范围（D-01 和 D-02 之间）
  const entranceY = 520 + Math.random() * 20;  // 520-540 范围（出口上方）
  
  return {
    id: Math.random() * 10000,
    x: entranceX,
    y: entranceY,
    vx: (Math.random()-0.5) * 0.5,
    vy: (Math.random()-0.5) * 0.5,
    role,
    device: (role === 'visitor') ? 'phone' : 'tag',
    behaviorState: 'wandering',
    targetHotspotIndex: -1,
    stayTimer: 0,
    targetPointIdx: 0,
    isBusy: false
  };
};


// 初始化热力图图例
const initHeatmapPalette = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  canvas.width = 256;
  canvas.height = 1;
  
  // 创建渐变图例（蓝 -> 绿 -> 黄 -> 红）
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, '#0000ff');
  gradient.addColorStop(0.3, '#00ff00');
  gradient.addColorStop(0.7, '#ffff00');
  gradient.addColorStop(1, '#ff0000');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  
  // 获取像素数据作为热力图图例
  const imageData = ctx.getImageData(0, 0, 256, 1);
  heatmapPalette.value = imageData.data;
};

// ✅ 修改：热力图绘制（适配固定尺寸）
const drawHeatmap = () => {
  frameCount++;
  if (currentTab.value === 'heatmap' && heatmapCanvasRef.value && frameCount % 5 === 0) {
    const ctx = heatmapCanvasRef.value.getContext('2d');
    if (!ctx) return;
    
    // ✅ 固定尺寸 1000x600
    const w = 1000;
    const h = 600;
    
    // ✅ 确保 Canvas 尺寸正确
    if (heatmapCanvasRef.value.width !== w) {
      heatmapCanvasRef.value.width = w; 
      heatmapCanvasRef.value.height = h;
    }
    
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.08;
    
    // ✅ 无需缩放（1:1 映射）
    ctx.beginPath();
    crowd.value.forEach(p => {
      ctx.moveTo(p.x + 35, p.y);
      ctx.arc(p.x, p.y, 35, 0, Math.PI * 2);
    });
    ctx.fillStyle = '#000'; 
    ctx.fill();
    
    // 上色逻辑保持不变
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    if (heatmapPalette.value) {
      const pal = heatmapPalette.value;
      for(let i = 0; i < d.length; i += 4) {
        const a = d[i + 3];
        if(a > 0) {
          const off = a * 4;
          d[i] = pal[off]; 
          d[i + 1] = pal[off + 1]; 
          d[i + 2] = pal[off + 2];
          d[i + 3] = a < 64 ? a * 2 : 220;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }
};


// 机房入侵告警
const triggerServerRoomAlert = (pid: number) => {
  if (!alerts.value.find(a => a.title.includes('入侵'))) {
    const alert: Alert = { 
      id: Date.now(), 
      title: `检测到非法入侵 (ID:${pid.toFixed(0).slice(-3)})`, 
      loc: '核心机房', 
      time: new Date().toLocaleTimeString(), 
      level: 'high' 
    };
    alerts.value.unshift(alert);
    ElNotification({ 
      title: '严重安全警告', 
      message: '有人闯入核心机房区域！已自动生成安保拦截任务。', 
      type: 'error', 
      duration: 5000 
    });
  }
};

// 自动派单（拥堵处理）
const autoDispatch = (alert: { zone: string; density: number; duration: number }) => {
  ElMessage.info(`正在为 ${alert.zone} 匹配最近的安保人员...`);
  // 1. 找到该区域的坐标
  const zone = zones.find(z => z.name === alert.zone);
  if (!zone) return;
  const targetX = zone.x + zone.w/2;
  const targetY = zone.y + zone.h/2;
  
  // 2. 找最近的空闲安保（优化：先获取筛选后的数组，避免类型推断丢失）
  const availableSecurity = crowd.value.filter(p => p.role === 'security' && !p.isBusy);
  let nearestStaff: Person | null = null;
  let minDist = Infinity;
  
  availableSecurity.forEach(p => {
    const d = Math.hypot(p.x - targetX, p.y - targetY);
    if (d < minDist) {
      minDist = d;
      nearestStaff = p; // 此时 p 是明确的 Person 类型，赋值后 nearestStaff 类型正确
    }
  });
  
  // 3. 非空判断 + 类型断言（消除 never 类型）
  if (!nearestStaff) {
    ElMessage.warning('当前无空闲安保人员，已加入待处理队列');
    return;
  }
  // 明确断言 nearestStaff 为 Person 类型（解决核心报错）
  const validStaff = nearestStaff as Person;
  
  // 4. 创建工单并分配（使用断言后的变量访问属性）
  const newOrder: WorkOrder = {
    id: Date.now(),
    title: `紧急疏导: ${alert.zone}`,
    priority: 'high',
    status: 'processing',
    loc: alert.zone,
    targetX, 
    targetY,
    time: new Date().toLocaleTimeString(),
    assignee: `Staff-${validStaff.id.toFixed(0).slice(-3)}` // 修复：使用 validStaff
  };
  workOrders.value.unshift(newOrder);
  
  // 更新人员状态（使用断言后的变量）
  validStaff.isBusy = true; // 修复：无 never 报错
  validStaff.targetOrderId = newOrder.id; // 修复：无 never 报错
  
  ElMessage.success(`派单成功！已指派 Staff-${validStaff.id.toFixed(0).slice(-3)} 前往处理`); // 修复：使用 validStaff
};

// 告警派单
const dispatchStaffToAlert = (alert: Alert) => {
  ElMessage.success('已生成拦截工单');
};

// 工单自动派单（适配工单对象）
const autoDispatchOrder = (row: WorkOrder) => {
  if (row.status !== 'pending') {
    ElMessage.warning('该工单已处理，无需重复派单');
    return;
  }
  
  ElMessage.info(`正在为工单 #${row.id} 匹配最近工作人员...`);
  const targetX = row.targetX;
  const targetY = row.targetY;
  
  // 优化：先获取筛选后的数组，明确类型
  const availableSecurity = crowd.value.filter(p => p.role === 'security' && !p.isBusy);
  let nearestStaff: Person | null = null;
  let minDist = Infinity;
  
  availableSecurity.forEach(p => {
    const d = Math.hypot(p.x - targetX, p.y - targetY);
    if (d < minDist) {
      minDist = d;
      nearestStaff = p;
    }
  });
  
  // 非空判断 + 类型断言
  if (nearestStaff) {
    // 明确断言为 Person 类型，消除 never 推断
    const validStaff = nearestStaff as Person;
    row.status = 'dispatched';
    row.assignee = `Staff-${validStaff.id.toFixed(0).slice(-3)}`; // 修复：无 never 报错
    validStaff.isBusy = true; // 修复：无 never 报错
    validStaff.targetOrderId = row.id; // 修复：无 never 报错
    ElMessage.success(`工单 #${row.id} 已派发给 ${row.assignee}`);
  } else {
    ElMessage.warning('当前无空闲工作人员，工单进入待处理队列');
  }
};

// 切换应急模式
const toggleEmergency = () => {
  isEmergency.value = !isEmergency.value;
  if (isEmergency.value) {
    ElNotification({ 
      title: '应急预案启动', 
      message: '全馆进入紧急撤离模式，所有闸机已开放，疏散路线已下发至用户终端。', 
      type: 'error', 
      duration: 0 
    });
  } else {
    ElMessage.success('应急状态解除，恢复正常运营');
  }
};

// 切换夜间模式
const toggleNightMode = () => {
  isNightMode.value = !isNightMode.value;
};

// 用户端开始导航
const startNavigation = (dest: string) => {
  isNavigating.value = true;
  navigatingTo.value = dest;
  
  // 设置导航目标坐标
  if (dest === '出口') { 
    navTarget.x = 500; 
    navTarget.y = 550; 
  } else if (dest === 'A-01') { 
    navTarget.x = 240; 
    navTarget.y = 120; 
  } else { 
    navTarget.x = 500; 
    navTarget.y = 300; 
  }
};

// 物理引擎核心循环
const updatePhysics = () => {
  // 🔧 调试：统计各状态人数
  if (frameCount % 60 === 0) { // 每秒统计一次
    const stats = {
      wandering: 0,
      approaching: 0,
      staying: 0,
      evacuating: 0
    };
    
    crowd.value.forEach(p => {
      if (p.role === 'visitor' || p.role === 'exhibitor') {
        stats[p.behaviorState as keyof typeof stats]++;
      }
    });
    
    console.log('观众行为统计:', stats);
  }

  if (!mapLoaded.value) return;
  
  // 1. 重置区域计数
  zones.forEach(z => z.count = 0);
  
  // 2. 更新每个人
  crowd.value.forEach((p) => {
    // --- 应急撤离逻辑 ---
    if (isEmergency.value) {
      // 🔥 修改出口坐标为更合理的位置（避免过低）
      const exitX = 500;
      const exitY = 530; // 从 550 改为 530（向上移动 20px）
      const dx = exitX - p.x;
      const dy = exitY - p.y;
      const dist = Math.hypot(dx, dy);
  
      if (dist > 5) { // 缩小到达判定距离
        p.vx = (dx/dist) * 2.5;
        p.vy = (dy/dist) * 2.5;
        p.x += p.vx; 
        p.y += p.vy;
      } else {
        // 🔥 到达出口后，保持在出口附近（避免卡住）
        p.x = 480 + Math.random() * 40; // 480-520 范围
        p.y = 520 + Math.random() * 15; // 520-535 范围
        p.vx = 0;
        p.vy = 0;
      }
      return;
    }

    // --- 角色特定逻辑 ---
    // A. 安保/保洁自动巡逻（未接工单时）
    if ((p.role === 'security' || p.role === 'cleaner') && !p.isBusy && !patrolMode.value) {
      // 🔥 降低切换频率（从 0.008 改为 0.005）
      if (!p.targetPointIdx || Math.random() < 0.005) {
        p.targetPointIdx = Math.floor(Math.random() * activeHotspots.length);
      }
      
      const target = activeHotspots[p.targetPointIdx];
      if (target) {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        // 🔥 放宽到达判定（从 15 改为 25）
        if (dist > 25) {
          // 向目标移动（降低加速度）
          p.vx += (dx/dist) * 0.12; // 从 0.18 降低到 0.12
          p.vy += (dy/dist) * 0.12;
        } else {
          // 🔥 到达目标后立即切换
          p.targetPointIdx = Math.floor(Math.random() * activeHotspots.length);
        }
        
        // 🔥 防止速度过低（降低最低速度要求）
        const speed = Math.hypot(p.vx, p.vy);
        if (speed < 0.3) { // 从 0.5 降低到 0.3
          p.vx += (Math.random()-0.5) * 0.6; // 从 1.0 降低到 0.6
          p.vy += (Math.random()-0.5) * 0.6;
        }
      }
    }
    
    // B. 安保巡检模式（手动启动）
    if (p.role === 'security' && patrolMode.value && !p.isBusy) {
      const target = patrolRoutePoints.value[p.targetPointIdx || 0];
      if (target) {
        const dx = target.x - p.x, dy = target.y - p.y, dist = Math.hypot(dx, dy);
        if (p.isChecking) {
          target.status = 'checking'; 
          target.progress += 2;
          if (target.progress >= 100) { 
            p.isChecking = false; 
            target.status = 'done'; 
            p.targetPointIdx = (p.targetPointIdx || 0) + 1;
            if (p.targetPointIdx >= patrolRoutePoints.value.length) {
              p.targetPointIdx = 0;
            }
          }
        } else if (dist < 10) {
          p.isChecking = true;
        } else {
          p.vx = (dx/dist)*2.5; 
          p.vy = (dy/dist)*2.5;
        }
      }
    }
    
    // C. 工作人员响应工单
    else if (p.isBusy && p.targetOrderId) {
      const order = workOrders.value.find(o => o.id === p.targetOrderId);
      if (order && order.status !== 'done') {
        const dx = order.targetX - p.x;
        const dy = order.targetY - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 10) {
          if (order.status !== 'processing') order.status = 'processing';
          if (Math.random() < 0.01) {
            order.status = 'done';
            p.isBusy = false;
            p.targetOrderId = undefined;
            ElMessage.success(`工单 #${order.id} 已由 Staff-${p.id.toFixed(0).slice(-3)} 完成`);
          }
        } else {
          p.vx = (dx/dist) * 3;
          p.vy = (dy/dist) * 3;
        }
      }
    }

    // D. 普通观众真实参展行为
    else if (p.role === 'visitor' || p.role === 'exhibitor') {
      if (p.behaviorState === 'wandering') {
        // 🔥 刚进入会场，立即选择第一个目标展位
        if (p.targetHotspotIndex === -1) {
          p.targetHotspotIndex = Math.floor(Math.random() * activeHotspots.length);
          p.behaviorState = 'approaching';
        } else {
          // 随机游荡（探索模式）
          p.vx += (Math.random()-0.5) * 0.3; // 从 0.4 降低到 0.3
          p.vy += (Math.random()-0.5) * 0.3;
          
          // 🔥 提高被展位吸引的概率
          if (Math.random() < 0.03) {
            p.behaviorState = 'approaching';
            let newTarget = Math.floor(Math.random() * activeHotspots.length);
            let attempts = 0;
            while (newTarget === p.targetHotspotIndex && attempts < 10) {
              newTarget = Math.floor(Math.random() * activeHotspots.length);
              attempts++;
            }
            p.targetHotspotIndex = newTarget;
          }
        }
      } 
      else if (p.behaviorState === 'approaching') {
        const target = activeHotspots[p.targetHotspotIndex];
        if (target) {
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.hypot(dx, dy);
          
          // 🔥 大幅放宽到达判定（从 radius + 35 改为 radius + 50）
          if (dist < target.radius + 50) { 
            p.behaviorState = 'staying'; 
            p.stayTimer = 60 + Math.random() * 60;
            console.log(`观众 ${p.id.toFixed(0)} 到达展位 ${target.name}`);
          } else {
            // 向目标移动（降低加速度）
            p.vx += (dx/dist) * 0.15; // 从 0.25 降低到 0.15
            p.vy += (dy/dist) * 0.15;
            
            // 🔥 优化防卡住逻辑
            const speed = Math.hypot(p.vx, p.vy);
            if (speed < 0.1 && dist > 50) { // 降低速度阈值
              // 强制切换到下一个展位（避免长时间卡住）
              let newTarget = Math.floor(Math.random() * activeHotspots.length);
              let attempts = 0;
              while (newTarget === p.targetHotspotIndex && attempts < 10) {
                newTarget = Math.floor(Math.random() * activeHotspots.length);
                attempts++;
              }
              p.targetHotspotIndex = newTarget;
              p.vx = (Math.random()-0.5) * 1.0;
              p.vy = (Math.random()-0.5) * 1.0;
              console.warn(`观众 ${p.id.toFixed(0)} 卡住，强制切换目标`);
            }
          }
        }
      } 
      else if (p.behaviorState === 'staying') {
        // 在展位停留
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.stayTimer--;
        
        if (p.stayTimer <= 0) {
          const rand = Math.random();
          
          if (rand < 0.80) {
            // 80% 概率：前往下一个展位
            p.behaviorState = 'approaching';
            
            let newTarget = Math.floor(Math.random() * activeHotspots.length);
            let attempts = 0;
            while (newTarget === p.targetHotspotIndex && attempts < 10) {
              newTarget = Math.floor(Math.random() * activeHotspots.length);
              attempts++;
            }
            p.targetHotspotIndex = newTarget;
            
            console.log(`观众 ${p.id.toFixed(0)} 前往下一个展位: ${activeHotspots[newTarget].name}`);
          } 
          else if (rand < 0.95) {
            p.behaviorState = 'wandering';
          } 
          else {
            p.behaviorState = 'evacuating';
          }
        }
      }
      else if (p.behaviorState === 'evacuating') {
        const exitX = 500;
        const exitY = 530;
        const dx = exitX - p.x;
        const dy = exitY - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 8) {
          p.vx += (dx/dist) * 0.18; // 从 0.22 降低到 0.18
          p.vy += (dy/dist) * 0.18;
        } else {
          // 重新从入口生成
          p.x = 440 + Math.random() * 120;
          p.y = 520 + Math.random() * 20;
          p.behaviorState = 'wandering';
          p.targetHotspotIndex = -1;
          p.vx = (Math.random()-0.5) * 0.5;
          p.vy = (Math.random()-0.5) * 0.5;
        }
      }
    }
    
    // E. 导航逻辑 (自己)
    if (p.id === myPersonId.value && isNavigating.value) {
      const dx = navTarget.x - p.x, dy = navTarget.y - p.y, dist = Math.hypot(dx, dy);
      if (dist > 15) { 
        p.vx += (dx/dist)*0.2; 
        p.vy += (dy/dist)*0.2; 
      } else { 
        isNavigating.value = false; 
        ElMessage.success('到达目的地'); 
      }
    }

    // --- 通用物理更新 ---
    // 🔥 降低速度上限（从 2.8 改为 1.5）
    const v = Math.hypot(p.vx, p.vy);
    const limit = (p.isBusy || isEmergency.value) ? 2.5 : 1.5; // 正常速度 1.5，工作人员 2.5
    if (v > limit) { 
      p.vx = (p.vx/v)*limit; 
      p.vy = (p.vy/v)*limit; 
    }

    // 🔥 优化碰撞检测（更宽松）
    let nextX = p.x + p.vx; 
    let nextY = p.y + p.vy;

    // 检查下一帧位置是否碰撞
    if (checkCollision(nextX, nextY, 3)) {
      // 尝试仅 X 方向移动
      if (!checkCollision(nextX, p.y, 3)) {
        p.x = nextX;
        p.vy *= -0.3;
      } 
      // 尝试仅 Y 方向移动
      else if (!checkCollision(p.x, nextY, 3)) {
        p.y = nextY;
        p.vx *= -0.3;
      } 
      // 完全卡住，添加随机扰动
      else {
        p.vx += (Math.random()-0.5) * 0.5; // 从 0.8 降低到 0.5
        p.vy += (Math.random()-0.5) * 0.5;
      }
    } else {
      // 无碰撞，正常移动
      p.x = nextX; 
      p.y = nextY;
    }

    // 边界检测
    if (p.x < 55) { p.x = 55; p.vx = Math.abs(p.vx) * 0.5; }
    if (p.x > 945) { p.x = 945; p.vx = -Math.abs(p.vx) * 0.5; }
    if (p.y < 55) { p.y = 55; p.vy = Math.abs(p.vy) * 0.5; }
    if (p.y > 545) { p.y = 545; p.vy = -Math.abs(p.vy) * 0.5; }

    // 🔥 恢复正常阻尼（从 0.98 改回 0.96）
    p.vx *= 0.96;
    p.vy *= 0.96;

    // 🔥 全局防卡死机制（兜底）- 第四个改动
    if (!isEmergency.value && p.role !== 'maintenance') {
      const speed = Math.hypot(p.vx, p.vy);
      
      // 如果速度接近 0 且不在停留状态，添加随机扰动
      if (speed < 0.05 && p.behaviorState !== 'staying') {
        p.vx += (Math.random()-0.5) * 0.8;
        p.vy += (Math.random()-0.5) * 0.8;
        
        // 如果是观众且在 approaching 状态，强制切换目标
        if ((p.role === 'visitor' || p.role === 'exhibitor') && p.behaviorState === 'approaching') {
          let newTarget = Math.floor(Math.random() * activeHotspots.length);
          let attempts = 0;
          while (newTarget === p.targetHotspotIndex && attempts < 10) {
            newTarget = Math.floor(Math.random() * activeHotspots.length);
            attempts++;
          }
          p.targetHotspotIndex = newTarget;
          console.warn(`全局防卡死：观众 ${p.id.toFixed(0)} 强制切换目标`);
        }
      }
    }

    // --- 区域统计与越界检测 ---
    // 1. 机房越界检测
    if (p.role === 'visitor' && p.x > serverRoom.x && p.x < serverRoom.x+serverRoom.w && p.y > serverRoom.y && p.y < serverRoom.y+serverRoom.h) {
      if (Math.random() < 0.05) triggerServerRoomAlert(p.id);
    }

    // 2. 区域计数
    for (const z of zones) {
      if (p.x > z.x && p.x < z.x+z.w && p.y > z.y && p.y < z.y+z.h) z.count++;
    }
  });
  
  // 3. 绘制热力图 (节流)
  drawHeatmap();
};



// ======================= 地图 & 窗口监听初始化（顶层声明） =======================
// ======================= 地图加载函数 (完整版) =======================
const loadMap = () => {
  // 动态生成展位 Logo
  
  const generateBoothSVG = (x: number, y: number, w: number, h: number, id: string) => {
    //const logoContent = logoMap[id] || '<circle cx="50" cy="50" r="30" fill="#475569"/>';

    // 🔥 优化 Logo 尺寸和位置
    
    const logoWidth = w * 0.6;   // 增加到 60%
    const logoHeight = h * 0.55; // 增加到 55%
    const logoX = x + (w - logoWidth) / 2; // 水平居中
    const logoY = y + 8; // 距离顶部 8px

    return `
      <g>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <text x="${x + w/2}" y="${y + h - 8}" fill="#94a3b8" font-size="11" text-anchor="middle" font-weight="bold">${id}</text>

      </g>
    `;
  };



  svgContent.value = `
    <svg viewBox="0 0 1000 600" width="100%" height="100%">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
        </pattern>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
        </marker>
        <!-- 舞台聚光灯效果 -->
        <radialGradient id="spotlight">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
        </radialGradient>
      </defs>
      
      <!-- 背景网格 -->
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- 墙体结构 -->
      <path d="M50,50 H950 V550 H50 Z" fill="none" stroke="#64748b" stroke-width="4" />
      <path d="M300,50 V220" stroke="#64748b" stroke-width="4" />
      <path d="M300,380 V550" stroke="#64748b" stroke-width="4" />
      <path d="M700,50 V220" stroke="#64748b" stroke-width="4" />
      <path d="M700,380 V550" stroke="#64748b" stroke-width="4" />
      
      <!-- A区展位 -->
      ${generateBoothSVG(100, 80, 120, 80, 'A-01')}
      ${generateBoothSVG(100, 260, 120, 80, 'A-02')}
      ${generateBoothSVG(100, 440, 120, 80, 'A-03')}
      
      <!-- B区展位 -->
      ${generateBoothSVG(780, 80, 120, 80, 'B-01')}
      ${generateBoothSVG(780, 260, 120, 80, 'B-02')}
      ${generateBoothSVG(780, 440, 120, 80, 'B-03')}
      
      <!-- C区展位（舞台上方） -->
      ${generateBoothSVG(360, 80, 120, 80, 'C-01')}
      ${generateBoothSVG(520, 80, 120, 80, 'C-02')}
      
      <!-- D区展位（舞台下方） -->
      ${generateBoothSVG(360, 440, 120, 80, 'D-01')}
      ${generateBoothSVG(520, 440, 120, 80, 'D-02')}

      <!-- 中央舞台（实体结构） -->
      <g id="central-stage">
        <!-- 舞台底座 -->
        <rect x="420" y="220" width="160" height="160" rx="8" fill="#0f172a" stroke="#475569" stroke-width="3"/>
        
        <!-- 聚光灯效果 -->
        <circle cx="500" cy="300" r="100" fill="url(#spotlight)" />
        
        <!-- 舞台装饰线条 -->
        <circle cx="500" cy="300" r="70" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="8,4" opacity="0.6" />
        <circle cx="500" cy="300" r="50" fill="none" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,2" opacity="0.4" />
        
        <!-- 舞台文字 -->
        <text x="500" y="295" fill="#fbbf24" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" font-weight="bold" opacity="0.8">CENTRAL</text>
        <text x="500" y="315" fill="#fbbf24" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" font-weight="bold" opacity="0.8">STAGE</text>
        
        <!-- 舞台边缘装饰 -->
        <path d="M420,300 L440,300 M560,300 L580,300 M500,220 L500,240 M500,360 L500,380" stroke="#fbbf24" stroke-width="2" opacity="0.5"/>
      </g>
      
      <!-- 底部出口标识 -->
      <text x="500" y="580" fill="#22c55e" font-weight="bold" font-size="16" text-anchor="middle" letter-spacing="4">EXIT 安全出口</text>
    </svg>`;
  
  mapLoaded.value = true;
  initCrowd();
};

// ======================= 碰撞检测函数 =======================
/**
 * AABB 碰撞检测（轴对齐包围盒）
 * @param px 人员 X 坐标
 * @param py 人员 Y 坐标
 * @param radius 人员半径（默认3px，更宽松）
 * @returns 是否发生碰撞
 */
const checkCollision = (px: number, py: number, radius: number = 3): boolean => {
  for (const col of colliders.value) {
    // 扩展碰撞体边界（考虑人员半径）
    const left = col.x - radius;
    const right = col.x + col.w + radius;
    const top = col.y - radius;
    const bottom = col.y + col.h + radius;
    
    if (px > left && px < right && py > top && py < bottom) {
      return true; // 发生碰撞
    }
  }
  return false;
};


/**
 * 碰撞响应（推出碰撞体）
 * @param p 人员对象
 */
const resolveCollision = (p: Person) => {
  for (const col of colliders.value) {
    const radius = 5;
    const left = col.x - radius;
    const right = col.x + col.w + radius;
    const top = col.y - radius;
    const bottom = col.y + col.h + radius;
    
    if (p.x > left && p.x < right && p.y > top && p.y < bottom) {
      // 计算最短推出距离
      const distLeft = p.x - left;
      const distRight = right - p.x;
      const distTop = p.y - top;
      const distBottom = bottom - p.y;
      
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);
      
      // 沿最短方向推出
      if (minDist === distLeft) {
        p.x = left - 1;
        p.vx = Math.abs(p.vx) * -0.5; // 反弹
      } else if (minDist === distRight) {
        p.x = right + 1;
        p.vx = Math.abs(p.vx) * 0.5;
      } else if (minDist === distTop) {
        p.y = top - 1;
        p.vy = Math.abs(p.vy) * -0.5;
      } else {
        p.y = bottom + 1;
        p.vy = Math.abs(p.vy) * 0.5;
      }
      
      return; // 只处理第一个碰撞
    }
  }
};


// 窗口大小监听（仅声明一次，无重复）
const setupResizeObserver = () => {
  monitorScale.x = 1;
  monitorScale.y = 1;
};

// ======================= 生命周期钩子 =======================
// 模拟时间流逝
setInterval(() => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString();
}, 1000);

// 挂载时初始化
onMounted(() => {
  initHeatmapPalette();
  loadMap();
  setupResizeObserver();
  
  // 启动物理循环
  const loop = () => {
    updatePhysics();
    requestAnimationFrame(loop);
  };
  loop();
});

// 卸载时销毁资源
onUnmounted(() => {

});

</script>

<style scoped>
/* 紧急模式下的闪烁背景 */
.emergency-flash {
    animation: bg-flash 2s infinite;
}
@keyframes bg-flash {
    0%, 100% { background-color: #0b1121; }
    50% { background-color: #1a0505; }
}

/* 用户位置的脉冲波纹 */
.pulse-ring::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 100%; height: 100%;
    border-radius: 50%;
    border: 2px solid cyan;
    animation: ring-scale 2s infinite;
}
@keyframes ring-scale {
    0% { width: 100%; height: 100%; opacity: 1; }
    100% { width: 300%; height: 300%; opacity: 0; }
}

/* 滚动条美化 */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 2px; }

/* 动画工具类 */
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Element UI 表格透明化覆盖 */
:deep(.el-table), :deep(.el-table__expanded-cell) { background-color: transparent !important; }
:deep(.el-table tr), :deep(.el-table th.el-table__cell) { background-color: transparent !important; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) { background-color: rgba(56, 189, 248, 0.1) !important; }
:deep(.el-table td.el-table__cell), :deep(.el-table th.el-table__cell.is-leaf) { border-bottom: 1px solid #334155 !important; }
:deep(.el-table__inner-wrapper::before) { display: none; }
</style>
