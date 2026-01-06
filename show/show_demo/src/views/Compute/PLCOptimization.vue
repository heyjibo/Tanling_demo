<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
    <!-- 返回按钮 -->
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

    <!-- 顶部标题 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mr-4">
            <span class="text-3xl">💧</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              循环水PLC控制优化系统
            </h1>
            <p class="text-slate-400 mt-2">基于四大AI模型的智能控制与能耗优化</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-sm text-slate-400">
            {{ formatNowTime() }}
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-400">系统状态:</span>
            <span class="px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-xs font-medium border border-green-500/30">
              运行正常
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型切换导航 -->
    <div class="mb-8">
      <div class="relative bg-slate-800/40 rounded-2xl p-1 border border-slate-700/50">
        <!-- 背景滑块 -->
        <div 
          class="absolute top-1 bottom-1 rounded-xl transition-all duration-500 ease-out"
          :class="[
            activeModel === 'waterQuality' ? 'w-[calc(25%-0.5rem)] left-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' :
            activeModel === 'concentration' ? 'w-[calc(25%-0.5rem)] left-[calc(25%+0.1875rem)] bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' :
            activeModel === 'microorganism' ? 'w-[calc(25%-0.5rem)] left-[calc(50%+0.375rem)] bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
            'w-[calc(25%-0.5rem)] left-[calc(75%+0.5625rem)] bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
          ]"
        ></div>
        
        <div class="relative z-10 grid grid-cols-4 gap-1">
          <button
            v-for="model in modelNavItems"
            :key="model.id"
            @click="switchModel(model.id)"
            class="py-4 px-2 rounded-xl text-center transition-all duration-300 group"
            :class="activeModel === model.id ? model.activeClass : 'text-slate-400 hover:text-slate-200'"
          >
            <div class="flex flex-col items-center">
              <span class="text-2xl mb-2">{{ model.icon }}</span>
              <span class="font-medium text-sm">{{ model.name }}</span>
              <div v-if="activeModel === model.id" class="w-1.5 h-1.5 rounded-full mt-2 animate-pulse" :class="model.dotClass"></div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 模型内容区域 -->
    <div class="space-y-6">
      <!-- 水质稳定指数模型 -->
      <transition name="module-fade" mode="out-in">
        <div v-if="activeModel === 'waterQuality'" class="space-y-6">
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
            <!-- 模型标题 -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-4">
                  <span class="text-2xl">📊</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-200">水质稳定指数模型</h2>
                  <p class="text-slate-400">LSI、RSI、AI综合指数计算与评估</p>
                </div>
              </div>
              <div class="flex gap-3">
                <el-button type="primary" @click="manualCalculateWSI" :loading="calculatingWSI">
                  <el-icon class="mr-2"><MagicStick /></el-icon>
                  手动计算WSI
                </el-button>
                <el-button @click="exportWSIReport">
                  <el-icon class="mr-2"><Download /></el-icon>
                  导出报告
                </el-button>
              </div>
            </div>

            <!-- 第一层级：实时水质指数 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <div class="w-3 h-3 rounded-full bg-cyan-500 mr-2 animate-pulse"></div>
                实时水质指数
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">朗格利尔指数 (LSI)</div>
                  <div class="text-3xl font-bold mb-1" :class="getLSIColor(waterQualityRealTime.LSI)">
                    {{ waterQualityRealTime.LSI.toFixed(3) }}
                  </div>
                  <div class="text-xs text-slate-400">{{ getLSIDescription(waterQualityRealTime.LSI) }}</div>
                  <div class="mt-2 text-xs text-cyan-400">实时更新: {{ formatNowTime() }}</div>
                </div>
                
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">赖森指数 (RSI)</div>
                  <div class="text-3xl font-bold mb-1" :class="getRSIColor(waterQualityRealTime.RSI)">
                    {{ waterQualityRealTime.RSI.toFixed(3) }}
                  </div>
                  <div class="text-xs text-slate-400">{{ getRSIDescription(waterQualityRealTime.RSI) }}</div>
                  <div class="mt-2 text-xs text-blue-400">实时更新: {{ formatNowTime() }}</div>
                </div>
                
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">侵蚀指数 (AI)</div>
                  <div class="text-3xl font-bold mb-1" :class="getAIColor(waterQualityRealTime.AI)">
                    {{ waterQualityRealTime.AI.toFixed(3) }}
                  </div>
                  <div class="text-xs text-slate-400">{{ getAIDescription(waterQualityRealTime.AI) }}</div>
                  <div class="mt-2 text-xs text-green-400">实时更新: {{ formatNowTime() }}</div>
                </div>
                
                <div class="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-5 rounded-xl border border-cyan-500/30">
                  <div class="text-sm text-slate-400 mb-2">综合水质指数 (WSI)</div>
                  <div class="text-4xl font-bold mb-1" :class="getWSIColor(waterQualityRealTime.WSI)">
                    {{ waterQualityRealTime.WSI.toFixed(4) }}
                  </div>
                  <div class="text-sm font-medium mt-1" :class="getWSIColor(waterQualityRealTime.WSI)">
                    {{ getWSICategory(waterQualityRealTime.WSI) }}
                  </div>
                  <div class="mt-2 text-xs text-slate-400">更新时间: {{ formatNowTime() }}</div>
                </div>
              </div>
            </div>

            <!-- 第二层级：历史趋势图 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                WSI历史趋势 (最近24小时)
              </h3>
              <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <div ref="wsiChartRef" class="h-72 w-full"></div>
              </div>
            </div>

            <!-- 第三层级：手动计算器 -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-300 flex items-center">
                  <div class="w-3 h-3 rounded-full bg-slate-500 mr-2"></div>
                  手动水质计算器
                </h3>
                <span class="text-sm text-slate-400">用于方案验证和参数调整</span>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 参数输入区域 -->
                <div class="lg:col-span-2">
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">水质参数输入</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">pH值 (0-14)</label>
                        <el-input-number 
                          v-model="waterQualityParams.pH" 
                          :min="0" :max="14" :step="0.01"
                          :precision="2"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">电导率 (μS/cm)</label>
                        <el-input-number 
                          v-model="waterQualityParams.conductivity" 
                          :min="0" :max="5000" :step="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">水温 (°C)</label>
                        <el-input-number 
                          v-model="waterQualityParams.temperature" 
                          :min="0" :max="100" :step="0.1"
                          :precision="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">总硬度 (mg/L CaCO₃)</label>
                        <el-input-number 
                          v-model="waterQualityParams.hardness" 
                          :min="0" :max="2000" :step="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">总碱度 (mg/L CaCO₃)</label>
                        <el-input-number 
                          v-model="waterQualityParams.alkalinity" 
                          :min="0" :max="1000" :step="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">钙离子浓度 (mg/L)</label>
                        <el-input-number 
                          v-model="waterQualityParams.calcium" 
                          :min="0" :max="500" :step="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">镁离子浓度 (mg/L)</label>
                        <el-input-number 
                          v-model="waterQualityParams.magnesium" 
                          :min="0" :max="300" :step="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">氯离子浓度 (mg/L)</label>
                        <el-input-number 
                          v-model="waterQualityParams.chloride" 
                          :min="0" :max="1000" :step="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 计算结果区域 -->
                <div>
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700 h-full">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">手动计算结果</h4>
                    <div class="space-y-3 mb-4">
                      <div class="flex items-center justify-between">
                        <span class="text-slate-300">LSI计算结果</span>
                        <span :class="getLSIColor(waterQualityResults.LSI)" class="font-bold text-lg">
                          {{ waterQualityResults.LSI.toFixed(3) }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-slate-300">RSI计算结果</span>
                        <span :class="getRSIColor(waterQualityResults.RSI)" class="font-bold text-lg">
                          {{ waterQualityResults.RSI.toFixed(3) }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-slate-300">AI计算结果</span>
                        <span :class="getAIColor(waterQualityResults.AI)" class="font-bold text-lg">
                          {{ waterQualityResults.AI.toFixed(3) }}
                        </span>
                      </div>
                      <div class="pt-3 border-t border-slate-700">
                        <div class="flex items-center justify-between">
                          <span class="text-slate-300">WSI综合结果</span>
                          <span :class="getWSIColor(waterQualityResults.WSI)" class="text-xl font-bold">
                            {{ waterQualityResults.WSI.toFixed(4) }}
                          </span>
                        </div>
                        <div class="text-sm text-slate-400 mt-1">
                          {{ getWSICategory(waterQualityResults.WSI) }}
                        </div>
                      </div>
                    </div>
                    
                    <el-button 
                      type="primary" 
                      class="w-full" 
                      @click="manualCalculateWSI" 
                      :loading="calculatingWSI"
                    >
                      <el-icon class="mr-2"><MagicStick /></el-icon>
                      执行手动计算
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 浓缩倍数模型 -->
      <transition name="module-fade" mode="out-in">
        <div v-if="activeModel === 'concentration'" class="space-y-6">
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
            <!-- 模型标题 -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mr-4">
                  <span class="text-2xl">🌡️</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-200">浓缩倍数模型</h2>
                  <p class="text-slate-400">补水、排污优化与浓缩倍数控制</p>
                </div>
              </div>
              <div class="flex gap-3">
                <el-button type="success" @click="manualCalculateConcentration" :loading="optimizingConcentration">
                  <el-icon class="mr-2"><VideoPlay /></el-icon>
                  手动计算
                </el-button>
                <el-button @click="runConcentrationOptimization">
                  <el-icon class="mr-2"><MagicStick /></el-icon>
                  智能优化
                </el-button>
              </div>
            </div>

            <!-- 第一层级：实时浓缩倍数 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <div class="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                实时浓缩倍数状态
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">当前浓缩倍数 N</div>
                  <div class="text-4xl font-bold mb-1" :class="getNColor(concentrationRealTime.N)">
                    {{ concentrationRealTime.N.toFixed(2) }}
                  </div>
                  <div class="text-sm text-slate-400">{{ getNStatus(concentrationRealTime.N) }}</div>
                  <div class="mt-2 text-xs text-green-400">目标范围: 7.0-8.0</div>
                </div>
                
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">实时补水量</div>
                  <div class="text-3xl font-bold mb-1 text-blue-400">
                    {{ concentrationRealTime.Qm.toFixed(1) }} m³/h
                  </div>
                  <div class="text-sm text-slate-400">总补水量</div>
                  <div class="mt-2 text-xs text-blue-400">实时更新: {{ formatNowTime() }}</div>
                </div>
                
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-yellow-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">实时排污量</div>
                  <div class="text-3xl font-bold mb-1 text-yellow-400">
                    {{ concentrationRealTime.Qb1.toFixed(1) }} m³/h
                  </div>
                  <div class="text-sm text-slate-400">强制排污</div>
                  <div class="mt-2 text-xs text-yellow-400">实时更新: {{ formatNowTime() }}</div>
                </div>
                
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">实时蒸发水量</div>
                  <div class="text-3xl font-bold mb-1 text-purple-400">
                    {{ concentrationRealTime.Qe.toFixed(1) }} m³/h
                  </div>
                  <div class="text-sm text-slate-400">蒸发损失</div>
                  <div class="mt-2 text-xs text-purple-400">实时更新: {{ formatNowTime() }}</div>
                </div>
              </div>
            </div>

            <!-- 第二层级：能耗与成本分析 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <div class="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                能耗与成本分析趋势
              </h3>
              <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <div ref="concentrationChartRef" class="h-72 w-full"></div>
              </div>
            </div>

            <!-- 第三层级：手动计算器 -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-300 flex items-center">
                  <div class="w-3 h-3 rounded-full bg-slate-500 mr-2"></div>
                  手动浓缩倍数计算器
                </h3>
                <span class="text-sm text-slate-400">用于方案验证和参数调整</span>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 基础参数配置 -->
                <div>
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700 h-full">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">基础参数配置</h4>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">循环水量 Qr (m³/h)</label>
                        <el-input-number 
                          v-model="concentrationParams.Qr" 
                          :min="100" :max="5000" :step="10"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">进出水温差 ΔT (°C)</label>
                        <el-input-number 
                          v-model="concentrationParams.deltaT" 
                          :min="1" :max="15" :step="0.1"
                          :precision="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">蒸发系数 K (1/°C)</label>
                        <el-input-number 
                          v-model="concentrationParams.K" 
                          :min="0.0005" :max="0.002" :step="0.0001"
                          :precision="4"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">风吹损失量 Qw (m³/h)</label>
                        <el-input-number 
                          v-model="concentrationParams.Qw" 
                          :min="0" :max="20" :step="0.1"
                          :precision="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 水源配置 -->
                <div>
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700 h-full">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">水源配置</h4>
                    <div class="space-y-3">
                      <div v-for="source in waterSources" :key="source.id" 
                           class="border rounded-lg p-3 cursor-pointer transition-all"
                           :class="concentrationParams.selectedSource === source.id 
                             ? 'border-green-500 bg-green-900/20' 
                             : 'border-slate-700 hover:border-slate-500'"
                           @click="concentrationParams.selectedSource = source.id">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium text-slate-200">{{ source.name }}</div>
                            <div class="text-xs text-slate-400">
                              含盐量: {{ source.salinity }} mg/L | 成本: {{ source.cost }} 元/m³
                            </div>
                          </div>
                          <el-radio :model-value="concentrationParams.selectedSource" :label="source.id" @click.stop />
                        </div>
                      </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-slate-700">
                      <h5 class="text-sm font-semibold text-slate-300 mb-2">优化计算结果</h5>
                      <div class="space-y-2">
                        <div class="flex justify-between items-center">
                          <span class="text-slate-300">优化浓缩倍数</span>
                          <span class="text-lg font-bold text-green-400">{{ concentrationResults.N.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-slate-300">优化补水量</span>
                          <span class="text-sm font-bold text-blue-400">{{ concentrationResults.Qm.toFixed(1) }} m³/h</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-slate-300">运行成本</span>
                          <span class="text-sm font-bold text-purple-400">{{ concentrationResults.cost.toFixed(2) }} 元/h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 计算结果与操作 -->
                <div>
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700 h-full">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">计算结果与操作</h4>
                    
                    <div class="mb-4">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-slate-300">目标浓缩倍数</span>
                        <span class="text-lg font-bold text-green-400">{{ concentrationParams.N_target.toFixed(1) }}</span>
                      </div>
                      <el-slider 
                        v-model="concentrationParams.N_target" 
                        :min="5" :max="10" :step="0.1"
                        :format-tooltip="(val: number) => val.toFixed(1)"
                        class="mb-4"
                      />
                    </div>
                    
                    <div class="space-y-3 mb-4">
                      <div class="flex justify-between items-center">
                        <span class="text-slate-300">循环水含盐量 Cx</span>
                        <el-input-number 
                          v-model="concentrationParams.Cx" 
                          :min="100" :max="5000" :step="10"
                          size="small"
                          controls-position="right"
                          class="w-32"
                        />
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-slate-300">自然排污量 Qb2</span>
                        <el-input-number 
                          v-model="concentrationParams.Qb2" 
                          :min="0" :max="10" :step="0.1"
                          :precision="1"
                          size="small"
                          controls-position="right"
                          class="w-32"
                        />
                      </div>
                    </div>
                    
                    <div class="mt-4 space-y-2">
                      <el-button 
                        type="success" 
                        class="w-full" 
                        @click="manualCalculateConcentration" 
                        :loading="optimizingConcentration"
                      >
                        <el-icon class="mr-2"><VideoPlay /></el-icon>
                        执行手动计算
                      </el-button>
                      
                      <el-button 
                        class="w-full" 
                        @click="runConcentrationOptimization"
                      >
                        <el-icon class="mr-2"><MagicStick /></el-icon>
                        智能优化计算
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 微生物含量模型 -->
      <transition name="module-fade" mode="out-in">
        <div v-if="activeModel === 'microorganism'" class="space-y-6">
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
            <!-- 模型标题 -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mr-4">
                  <span class="text-2xl">🦠</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-200">微生物含量模型</h2>
                  <p class="text-slate-400">基于Monod方程的微生物生长预测与控制</p>
                </div>
              </div>
              <div class="flex gap-3">
                <el-button type="warning" @click="manualCalculateMicroorganism" :loading="calculatingMicroorganism">
                  <el-icon class="mr-2"><VideoPlay /></el-icon>
                  手动计算
                </el-button>
                <el-button type="success" @click="startTraining" :loading="trainingModel">
                  <el-icon class="mr-2"><Cpu /></el-icon>
                  开始训练
                </el-button>
              </div>
            </div>

            <!-- 第一层级：实时微生物状态 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <div class="w-3 h-3 rounded-full bg-orange-500 mr-2 animate-pulse"></div>
                实时微生物状态
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-orange-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">当前微生物浓度</div>
                  <div class="text-3xl font-bold mb-1 text-orange-400">
                    {{ microorganismRealTime.currentConcentration.toExponential(2) }} CFU/mL
                  </div>
                  <div class="text-sm text-slate-400">实时浓度</div>
                  <div class="mt-2 text-xs text-orange-400">安全范围: <1e5 CFU/mL</div>
                </div>
                
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-red-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">实时生长速率</div>
                  <div class="text-3xl font-bold mb-1" :class="microorganismRealTime.growthRate > 0 ? 'text-red-400' : 'text-green-400'">
                    {{ microorganismRealTime.growthRate.toFixed(4) }} /h
                  </div>
                  <div class="text-sm text-slate-400">净生长速率</div>
                  <div class="mt-2 text-xs" :class="microorganismRealTime.growthRate > 0 ? 'text-red-400' : 'text-green-400'">
                    {{ microorganismRealTime.growthRate > 0 ? '生长中' : '衰减中' }}
                  </div>
                </div>
                
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">抑制效应</div>
                  <div class="text-3xl font-bold mb-1 text-blue-400">
                    {{ microorganismRealTime.inhibitionEffect.toFixed(3) }}
                  </div>
                  <div class="text-sm text-slate-400">余氯+ORP抑制</div>
                  <div class="mt-2 text-xs text-blue-400">目标: >0.7</div>
                </div>
                
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                  <div class="text-sm text-slate-400 mb-2">温度影响因子</div>
                  <div class="text-3xl font-bold mb-1 text-purple-400">
                    {{ microorganismRealTime.temperatureFactor.toFixed(4) }}
                  </div>
                  <div class="text-sm text-slate-400">温度修正系数</div>
                  <div class="mt-2 text-xs text-purple-400">范围: 0-1</div>
                </div>
              </div>
              
              <!-- 控制建议 -->
              <div class="mt-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-4 rounded-xl border border-slate-700">
                <div class="flex items-center">
                  <el-icon class="text-orange-400 mr-2"><Warning /></el-icon>
                  <span class="text-sm font-medium text-slate-300">控制建议:</span>
                  <span class="text-sm text-slate-400 ml-2">{{ microorganismRealTime.controlAdvice }}</span>
                </div>
              </div>
            </div>

            <!-- 第二层级：微生物生长趋势预测 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                微生物生长趋势预测 (48小时)
              </h3>
              <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <div ref="microorganismChartRef" class="h-72 w-full"></div>
              </div>
            </div>

            <!-- 第三层级：手动计算器和训练配置 -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-300 flex items-center">
                  <div class="w-3 h-3 rounded-full bg-slate-500 mr-2"></div>
                  手动计算与模型训练
                </h3>
                <span class="text-sm text-slate-400">用于参数验证和模型优化</span>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 生长参数配置 -->
                <div>
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700 h-full">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">生长参数配置</h4>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">余氯浓度 FC (mg/L)</label>
                        <el-input-number 
                          v-model="microorganismParams.FC" 
                          :min="0" :max="2" :step="0.01"
                          :precision="3"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">ORP (mV)</label>
                        <el-input-number 
                          v-model="microorganismParams.ORP" 
                          :min="200" :max="600" :step="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">营养物质 S (mg/L)</label>
                        <el-input-number 
                          v-model="microorganismParams.S" 
                          :min="0" :max="1000" :step="10"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">水温 T (°C)</label>
                        <el-input-number 
                          v-model="microorganismParams.T" 
                          :min="10" :max="40" :step="0.1"
                          :precision="1"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 模型参数配置 -->
                <div>
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700 h-full">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">模型参数配置</h4>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">最大比生长速率 μ_max (h⁻¹)</label>
                        <el-input-number 
                          v-model="microorganismParams.mu_max" 
                          :min="0.1" :max="2" :step="0.01"
                          :precision="3"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">半饱和常数 Ks (mg/L)</label>
                        <el-input-number 
                          v-model="microorganismParams.Ks" 
                          :min="10" :max="500" :step="10"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">活化能 Ea (J/mol)</label>
                        <el-input-number 
                          v-model="microorganismParams.Ea" 
                          :min="1000" :max="10000" :step="100"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-400 mb-2">死亡速率 kd (h⁻¹)</label>
                        <el-input-number 
                          v-model="microorganismParams.kd" 
                          :min="0.01" :max="0.5" :step="0.01"
                          :precision="3"
                          controls-position="right"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 训练配置和计算结果 -->
                <div class="space-y-6">
                  <!-- 在线训练配置 -->
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">在线训练配置</h4>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs text-slate-400 mb-1">训练数据天数</label>
                        <el-input-number 
                          v-model="trainingConfig.days" 
                          :min="1" :max="60" :step="1"
                          controls-position="right"
                          class="w-full"
                          size="small"
                        />
                      </div>
                      <div>
                        <label class="block text-xs text-slate-400 mb-1">训练轮次</label>
                        <el-input-number 
                          v-model="trainingConfig.epochs" 
                          :min="10" :max="500" :step="10"
                          controls-position="right"
                          class="w-full"
                          size="small"
                        />
                      </div>
                      <div>
                        <label class="block text-xs text-slate-400 mb-1">学习率</label>
                        <el-input-number 
                          v-model="trainingConfig.learningRate" 
                          :min="0.0001" :max="0.01" :step="0.0001"
                          :precision="4"
                          controls-position="right"
                          class="w-full"
                          size="small"
                        />
                      </div>
                      <div>
                        <label class="block text-xs text-slate-400 mb-1">批处理大小</label>
                        <el-input-number 
                          v-model="trainingConfig.batchSize" 
                          :min="8" :max="128" :step="8"
                          controls-position="right"
                          class="w-full"
                          size="small"
                        />
                      </div>
                    </div>
                    
                    <el-button 
                      type="success" 
                      class="w-full mt-4" 
                      @click="startTraining" 
                      :loading="trainingModel"
                    >
                      <el-icon class="mr-2"><Cpu /></el-icon>
                      开始训练模型
                    </el-button>
                  </div>

                  <!-- 手动计算结果 -->
                  <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <h4 class="text-md font-semibold text-slate-300 mb-4">手动计算结果</h4>
                    <div class="space-y-2 mb-4">
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-300">预测浓度</span>
                        <span class="text-sm font-bold text-orange-400">
                          {{ microorganismResults.predictedConcentration.toExponential(2) }}
                        </span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-300">生长速率</span>
                        <span class="text-sm font-bold" :class="microorganismResults.growthRate > 0 ? 'text-red-400' : 'text-green-400'">
                          {{ microorganismResults.growthRate.toFixed(5) }} /h
                        </span>
                      </div>
                    </div>
                    
                    <el-button 
                      type="warning" 
                      class="w-full" 
                      @click="manualCalculateMicroorganism" 
                      :loading="calculatingMicroorganism"
                    >
                      <el-icon class="mr-2"><VideoPlay /></el-icon>
                      执行手动计算
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 智慧综合加药模型 -->
      <transition name="module-fade" mode="out-in">
        <div v-if="activeModel === 'medication'" class="space-y-6">
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
            <!-- 模型标题 -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mr-4">
                  <span class="text-2xl">🧪</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-200">智慧综合加药模型</h2>
                  <p class="text-slate-400">基于历史数据的智能加药优化</p>
                </div>
              </div>
              <div class="flex gap-3">
                <el-button type="primary" @click="analyzeWaterQuality" :loading="analyzingWater">
                  <el-icon class="mr-2"><TrendCharts /></el-icon>
                  分析水质
                </el-button>
                <el-button @click="generateMedicationPlan">
                  <el-icon class="mr-2"><MagicStick /></el-icon>
                  生成方案
                </el-button>
              </div>
            </div>

            <!-- 第一层级：历史水质综合分析 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <div class="w-3 h-3 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                历史水质综合分析 (60天)
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- WSI分析 -->
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-lg bg-cyan-900/30 flex items-center justify-center mr-3">
                        <span class="text-lg">📊</span>
                      </div>
                      <div>
                        <div class="text-slate-300">综合水质指数 (WSI)</div>
                        <div class="text-xs text-slate-400">平均值: {{ historicalData.wsiAvg.toFixed(4) }}</div>
                      </div>
                    </div>
                    <el-tag size="small" :type="getWSITrend(historicalData.wsiTrend)">
                      {{ historicalData.wsiTrend }}
                    </el-tag>
                  </div>
                  <div class="text-center mb-4">
                    <div class="text-4xl font-bold" :class="getWSIColor(historicalData.wsiAvg)">
                      {{ historicalData.wsiAvg.toFixed(4) }}
                    </div>
                    <div class="text-xs text-slate-400 mt-1">
                      范围: {{ historicalData.wsiMin.toFixed(2) }}-{{ historicalData.wsiMax.toFixed(2) }}
                    </div>
                  </div>
                  <el-progress 
                    :percentage="Math.min(100, historicalData.wsiAvg * 20)" 
                    :color="customColors"
                  />
                </div>

                <!-- 浓缩倍数分析 -->
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-colors">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-lg bg-green-900/30 flex items-center justify-center mr-3">
                        <span class="text-lg">🌡️</span>
                      </div>
                      <div>
                        <div class="text-slate-300">浓缩倍数 N</div>
                        <div class="text-xs text-slate-400">平均值: {{ historicalData.nAvg.toFixed(2) }}</div>
                      </div>
                    </div>
                    <el-tag size="small" :type="getNTrend(historicalData.nTrend)">
                      {{ historicalData.nTrend }}
                    </el-tag>
                  </div>
                  <div class="text-center mb-4">
                    <div class="text-4xl font-bold" :class="getNColor(historicalData.nAvg)">
                      {{ historicalData.nAvg.toFixed(2) }}
                    </div>
                    <div class="text-xs text-slate-400 mt-1">
                      范围: {{ historicalData.nMin.toFixed(1) }}-{{ historicalData.nMax.toFixed(1) }}
                    </div>
                  </div>
                  <el-progress 
                    :percentage="Math.min(100, (historicalData.nAvg - 5) * 20)" 
                    :color="customColors"
                  />
                </div>

                <!-- 微生物分析 -->
                <div class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-orange-500/30 transition-colors">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-lg bg-orange-900/30 flex items-center justify-center mr-3">
                        <span class="text-lg">🦠</span>
                      </div>
                      <div>
                        <div class="text-slate-300">微生物浓度</div>
                        <div class="text-xs text-slate-400">平均值: {{ historicalData.microorganismAvg.toExponential(2) }}</div>
                      </div>
                    </div>
                    <el-tag size="small" :type="getMicroorganismTrend(historicalData.microorganismTrend)">
                      {{ historicalData.microorganismTrend }}
                    </el-tag>
                  </div>
                  <div class="text-center mb-4">
                    <div class="text-3xl font-bold text-orange-400">
                      {{ historicalData.microorganismAvg.toExponential(2) }}
                    </div>
                    <div class="text-xs text-slate-400 mt-1">
                      最新: {{ historicalData.microorganismLatest.toExponential(2) }} CFU/mL
                    </div>
                  </div>
                  <el-progress 
                    :percentage="Math.min(100, Math.log10(historicalData.microorganismAvg) * 10)" 
                    :color="customColors"
                  />
                </div>
              </div>
            </div>

            <!-- 第二层级：智能加药推荐 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <div class="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                智能加药推荐
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="med in medicationRecommendations" :key="med.id" 
                     class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all hover:scale-[1.02]">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center">
                      <el-icon class="text-2xl mr-3" :class="med.iconClass"><component :is="med.icon" /></el-icon>
                      <div>
                        <div class="font-bold text-slate-200">{{ med.name }}</div>
                        <div class="text-xs text-slate-400">{{ med.type }} | 基于{{ med.basedOn }}</div>
                      </div>
                    </div>
                    <el-tag size="small" :type="med.priority === '高' ? 'danger' : 'warning'">
                      {{ med.priority }}优先级
                    </el-tag>
                  </div>
                  <div class="mb-4">
                    <div class="text-3xl font-bold text-green-400 mb-1">{{ med.dose }} {{ med.unit }}</div>
                    <div class="text-sm text-slate-300">{{ med.effect }}</div>
                  </div>
                  <div class="text-xs text-slate-400 border-t border-slate-700 pt-3">
                    参考数据: {{ med.referenceData }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 第三层级：优化效果和PLC控制 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 优化效果预测 -->
              <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <h3 class="text-lg font-semibold text-slate-300 mb-4">优化效果预测</h3>
                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-sm mb-2">
                      <span class="text-slate-400">WSI改善</span>
                      <span class="text-green-400">→ {{ medicationResults.wsiImprovement.toFixed(4) }}</span>
                    </div>
                    <el-progress 
                      :percentage="Math.min(100, medicationResults.wsiImprovement * 20)" 
                      :color="customColors"
                    />
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-2">
                      <span class="text-slate-400">N值稳定</span>
                      <span class="text-blue-400">→ {{ medicationResults.nStability.toFixed(2) }}</span>
                    </div>
                    <el-progress 
                      :percentage="Math.min(100, medicationResults.nStability * 10)" 
                      :color="customColors"
                    />
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-2">
                      <span class="text-slate-400">微生物抑制</span>
                      <span class="text-orange-400">↓ {{ medicationResults.microorganismReduction.toFixed(1) }}%</span>
                    </div>
                    <el-progress 
                      :percentage="medicationResults.microorganismReduction" 
                      :color="customColors"
                    />
                  </div>
                  <div class="flex justify-between items-center pt-4 border-t border-slate-700">
                    <span class="text-slate-300">药剂成本</span>
                    <span class="text-xl font-bold text-yellow-400">{{ medicationResults.medicationCost.toFixed(2) }} 元/天</span>
                  </div>
                </div>
              </div>

              <!-- PLC控制指令 -->
              <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <h3 class="text-lg font-semibold text-slate-300 mb-4">PLC控制指令</h3>
                <div class="space-y-3 mb-4">
                  <div v-for="cmd in medicationResults.plcCommands" :key="cmd.id" 
                       class="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg hover:bg-slate-900/50 transition-colors">
                    <div>
                      <div class="text-sm font-medium text-slate-200">{{ cmd.device }}</div>
                      <div class="text-xs text-slate-400">{{ cmd.command }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <el-switch 
                        v-model="cmd.enabled" 
                        size="small" 
                        :disabled="cmd.status !== '待执行'"
                      />
                      <el-tag size="small" :type="cmd.status === '已执行' ? 'success' : cmd.status === '执行中' ? 'warning' : 'info'">
                        {{ cmd.status }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                <el-button 
                  type="primary" 
                  class="w-full" 
                  @click="executePLCCommands" 
                  :disabled="!hasPendingCommands"
                >
                  <el-icon class="mr-2"><VideoPlay /></el-icon>
                  执行PLC指令
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- PLC控制面板 -->
    <div class="mt-8">
      <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-200">PLC集中控制面板</h3>
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-400">实时更新间隔:</span>
            <el-select v-model="updateInterval" size="small" class="w-32">
              <el-option label="1秒" value="1000" />
              <el-option label="5秒" value="5000" />
              <el-option label="10秒" value="10000" />
              <el-option label="30秒" value="30000" />
            </el-select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
            <h4 class="text-lg font-semibold text-slate-300 mb-4">加药控制</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-slate-300">缓蚀阻垢剂泵</span>
                <el-switch v-model="plcControls.inhibitorPump" active-color="#10b981" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">杀菌剂泵</span>
                <el-switch v-model="plcControls.bactericidePump" active-color="#10b981" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">pH调节泵</span>
                <el-switch v-model="plcControls.phPump" active-color="#10b981" />
              </div>
            </div>
          </div>

          <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
            <h4 class="text-lg font-semibold text-slate-300 mb-4">排污控制</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-slate-300">强制排污阀</span>
                <el-switch v-model="plcControls.forcedDrainValve" active-color="#f59e0b" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">自动补水阀</span>
                <el-switch v-model="plcControls.autoMakeupValve" active-color="#10b981" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">水源切换阀</span>
                <el-switch v-model="plcControls.waterSourceValve" active-color="#3b82f6" />
              </div>
            </div>
          </div>

          <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
            <h4 class="text-lg font-semibold text-slate-300 mb-4">监控状态</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-slate-300">在线监测</span>
                <el-tag size="small" type="success">运行中</el-tag>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">数据采集</span>
                <el-tag size="small" type="success">正常</el-tag>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">通讯状态</span>
                <el-tag size="small" type="success">已连接</el-tag>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
            <h4 class="text-lg font-semibold text-slate-300 mb-4">控制模式</h4>
            <div class="space-y-3">
              <el-radio-group v-model="plcControls.controlMode" class="w-full">
                <el-radio label="auto" class="w-full mb-2">
                  <div class="flex items-center">
                    <el-icon class="mr-2"><Cpu /></el-icon>
                    <span>全自动模式</span>
                  </div>
                </el-radio>
                <el-radio label="semi" class="w-full mb-2">
                  <div class="flex items-center">
                    <el-icon class="mr-2"><Connection /></el-icon>
                    <span>半自动模式</span>
                  </div>
                </el-radio>
                <el-radio label="manual" class="w-full">
                  <div class="flex items-center">
                    <el-icon class="mr-2"><User /></el-icon>
                    <span>手动模式</span>
                  </div>
                </el-radio>
              </el-radio-group>
              <el-button type="primary" class="w-full mt-2" @click="syncPLCControls">
                <el-icon class="mr-2"><Refresh /></el-icon>
                同步PLC状态
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="mt-8 pt-6 border-t border-slate-700/30">
      <div class="flex items-center justify-between text-sm text-slate-500">
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <div class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span>系统运行正常</span>
          </div>
          <span>•</span>
          <span>当前模型: {{ getActiveModelName() }}</span>
          <span>•</span>
          <span>最后更新: {{ formatNowTime() }}</span>
        </div>
        <div>循环水智能控制优化系统 v1.0 | 数据采样频率: {{ updateIntervalLabel }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  Cpu, Connection, User, Refresh, VideoPlay, 
  Warning, Download, MagicStick, DataAnalysis, 
  Setting, Histogram, TrendCharts, DataBoard
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 当前激活的模型
const activeModel = ref<'waterQuality' | 'concentration' | 'microorganism' | 'medication'>('waterQuality')

// 模型导航项
const modelNavItems = [
  { 
    id: 'waterQuality', 
    name: '水质稳定', 
    icon: '📊',
    activeClass: 'text-cyan-300',
    dotClass: 'bg-cyan-400'
  },
  { 
    id: 'concentration', 
    name: '浓缩倍数', 
    icon: '🌡️',
    activeClass: 'text-green-300',
    dotClass: 'bg-green-400'
  },
  { 
    id: 'microorganism', 
    name: '微生物', 
    icon: '🦠',
    activeClass: 'text-yellow-300',
    dotClass: 'bg-yellow-400'
  },
  { 
    id: 'medication', 
    name: '智能加药', 
    icon: '🧪',
    activeClass: 'text-purple-300',
    dotClass: 'bg-purple-400'
  }
]

// 实时更新间隔
const updateInterval = ref('5000')
const updateIntervalLabel = computed(() => {
  const ms = parseInt(updateInterval.value)
  return ms < 1000 ? `${ms}ms` : `${ms/1000}秒`
})

// 图表实例
let wsiChart: echarts.ECharts | null = null
let concentrationChart: echarts.ECharts | null = null
let microorganismChart: echarts.ECharts | null = null

// 图表ref
const wsiChartRef = ref<HTMLElement>()
const concentrationChartRef = ref<HTMLElement>()
const microorganismChartRef = ref<HTMLElement>()

// 定时器
let realTimeTimer: number | null = null
let simulationTimer: number | null = null

// ========== 水质稳定指数模型 ==========
const waterQualityParams = reactive({
  pH: 7.5,
  conductivity: 850,
  temperature: 30,
  hardness: 450,
  alkalinity: 300,
  calcium: 120,
  magnesium: 40,
  chloride: 150,
  sulfate: 80
})

// 实时值
const waterQualityRealTime = reactive({
  pH: 7.5,
  conductivity: 850,
  temperature: 30,
  hardness: 450,
  alkalinity: 300,
  calcium: 120,
  magnesium: 40,
  chloride: 150,
  sulfate: 80,
  LSI: 0,
  RSI: 0,
  AI: 0,
  WSI: 0
})

// 手动计算结果
const waterQualityResults = reactive({
  LSI: 0,
  RSI: 0,
  AI: 0,
  WSI: 0
})

const calculatingWSI = ref(false)

// ========== 浓缩倍数模型 ==========
const waterSources = [
  { id: '汽提水', name: '汽提水', salinity: 300, cost: 2.5, qualityAlert: '' },
  { id: 'RO回用水', name: 'RO回用水', salinity: 500, cost: 3.0, qualityAlert: '' },
  { id: '新鲜水', name: '新鲜水', salinity: 1000, cost: 5.0, qualityAlert: '氨氮超标' }
]

const concentrationParams = reactive({
  Qr: 1000,
  deltaT: 5,
  K: 0.001,
  Qw: 5,
  Qb2: 2,
  Cx: 1500,
  N_target: 7.5,
  selectedSource: '汽提水'
})

// 实时值
const concentrationRealTime = reactive({
  N: 7.5,
  Qm: 0,
  Qb1: 0,
  Qe: 0,
  status: '正常'
})

// 优化计算结果
const concentrationResults = reactive({
  N: 7.5,
  Qm: 12.0,
  Qb1: 1.5,
  cost: 30.0,
  status: '等待优化'
})

const optimizingConcentration = ref(false)

// ========== 微生物含量模型 ==========
const microorganismParams = reactive({
  FC: 0.5,
  ORP: 300,
  S: 200,
  T: 25,
  mu_max: 0.5,
  Ks: 100,
  Ea: 5000,
  kd: 0.05,
  a_FC: 1.0,
  b_ORP: 1.0,
  c: 5.0
})

// 训练配置
const trainingConfig = reactive({
  days: 30,
  epochs: 100,
  learningRate: 0.001,
  batchSize: 32
})

const trainingModel = ref(false)

// 实时值
const microorganismRealTime = reactive({
  currentConcentration: 1e5,
  growthRate: 0.1,
  inhibitionEffect: 0.5,
  temperatureFactor: 0.8,
  controlAdvice: '当前杀菌剂浓度适当，建议维持现有投加方案'
})

// 手动计算结果
const microorganismResults = reactive({
  predictedConcentration: 1e5,
  growthRate: 0.1,
  temperatureFactor: 0.8,
  controlAdvice: '计算结果待更新'
})

const calculatingMicroorganism = ref(false)

// 模拟的预测数据
const microorganismPredictionData = ref<number[]>([])

// ========== 智慧综合加药模型 ==========
const historicalData = reactive({
  wsiAvg: 0.45,
  wsiMin: 0.35,
  wsiMax: 0.55,
  wsiTrend: '稳定',
  nAvg: 7.5,
  nMin: 6.8,
  nMax: 8.2,
  nTrend: '良好',
  microorganismAvg: 1.2e5,
  microorganismLatest: 1.1e5,
  microorganismTrend: '可控'
})

const analyzingWater = ref(false)

// 加药推荐
const medicationRecommendations = [
  {
    id: 'med1',
    name: '无磷缓蚀阻垢剂',
    type: '缓蚀阻垢剂',
    dose: 50,
    unit: 'ppm',
    effect: '腐蚀速率降低30%，结垢倾向改善25%',
    priority: '高',
    basedOn: 'WSI指数和腐蚀倾向',
    referenceData: 'WSI: 0.45, 腐蚀指数: 中',
    icon: DataAnalysis,
    iconClass: 'text-blue-400'
  },
  {
    id: 'med2',
    name: '氧化性杀菌剂703',
    type: '杀菌剂',
    dose: 5,
    unit: 'ppm',
    effect: '微生物抑制90%，生物膜清除率80%',
    priority: '高',
    basedOn: '微生物浓度趋势',
    referenceData: '微生物: 1.1e5 CFU/mL, 趋势: 上升',
    icon: Warning,
    iconClass: 'text-green-400'
  },
  {
    id: 'med3',
    name: 'pH调节剂',
    type: 'pH调节',
    dose: 2,
    unit: 'L/h',
    effect: 'pH稳定在7.5±0.2，减少腐蚀倾向',
    priority: '中',
    basedOn: 'pH波动分析',
    referenceData: 'pH: 7.5, 波动: ±0.3',
    icon: TrendCharts,
    iconClass: 'text-purple-400'
  }
]

const medicationResults = reactive({
  wsiImprovement: 0.48,
  nStability: 7.6,
  microorganismReduction: 75,
  medicationCost: 1250.5,
  plcCommands: [
    { id: 'cmd1', device: '缓蚀剂加药泵', command: '启动，剂量50ppm', status: '待执行', enabled: true },
    { id: 'cmd2', device: '杀菌剂加药泵', command: '启动，剂量5ppm', status: '待执行', enabled: true },
    { id: 'cmd3', device: 'pH调节泵', command: '启动，剂量2L/h', status: '待执行', enabled: false }
  ]
})

const hasPendingCommands = computed(() => {
  return medicationResults.plcCommands.some(cmd => cmd.enabled && cmd.status === '待执行')
})

// ========== PLC控制面板 ==========
const plcControls = reactive({
  inhibitorPump: true,
  bactericidePump: true,
  phPump: false,
  forcedDrainValve: false,
  autoMakeupValve: true,
  waterSourceValve: false,
  controlMode: 'auto'
})

// ========== 工具函数 ==========
const formatNowTime = () => {
  return new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getActiveModelName = () => {
  const model = modelNavItems.find(m => m.id === activeModel.value)
  return model?.name || '未知'
}

// 自定义进度条颜色
const customColors = [
  { color: '#f43f5e', percentage: 20 },
  { color: '#f97316', percentage: 50 },
  { color: '#eab308', percentage: 70 },
  { color: '#84cc16', percentage: 90 },
  { color: '#10b981', percentage: 100 }
]

// ========== 水质稳定指数计算方法 ==========
const calculate_pHs = (params: typeof waterQualityParams) => {
  const TDS = params.conductivity * 0.65
  const A = Math.log10(TDS) - 1
  const B = -13.12 * Math.log10(params.temperature + 273.15) + 34.55
  const C = Math.log10(params.hardness)
  const D = Math.log10(params.alkalinity)
  return (9.3 + A + B) - (C + D)
}

const calculate_LSI = (pH: number, pHs: number) => {
  return pH - pHs
}

const calculate_RSI = (pH: number, pHs: number) => {
  return 2 * pHs - pH
}

const calculate_AI = (pH: number, hardness: number, alkalinity: number) => {
  return pH + Math.log10(hardness / alkalinity)
}

const calculate_WSI = (LSI: number, RSI: number, AI: number) => {
  const normalize = (value: number, min: number, max: number) => {
    return (value - min) / (max - min)
  }
  
  const LSI_n = normalize(LSI, -2, 2)
  const RSI_n = normalize(RSI, 4, 10)
  const AI_n = normalize(AI, 8, 12)
  
  return 0.4 * LSI_n + 0.3 * RSI_n + 0.3 * AI_n
}

// 手动计算 WSI
const manualCalculateWSI = () => {
  calculatingWSI.value = true
  
  setTimeout(() => {
    const pHs = calculate_pHs(waterQualityParams)
    
    waterQualityResults.LSI = calculate_LSI(waterQualityParams.pH, pHs)
    waterQualityResults.RSI = calculate_RSI(waterQualityParams.pH, pHs)
    waterQualityResults.AI = calculate_AI(waterQualityParams.pH, waterQualityParams.hardness, waterQualityParams.alkalinity)
    waterQualityResults.WSI = calculate_WSI(
      waterQualityResults.LSI,
      waterQualityResults.RSI,
      waterQualityResults.AI
    )
    
    calculatingWSI.value = false
    ElMessage.success('水质稳定指数计算完成')
  }, 1000)
}

// 颜色和描述函数
const getLSIColor = (lsi: number) => {
  if (lsi > 0.5) return 'text-red-400'
  if (lsi > 0) return 'text-orange-400'
  if (lsi > -0.5) return 'text-yellow-400'
  return 'text-green-400'
}

const getLSIDescription = (lsi: number) => {
  if (lsi > 0.5) return '严重结垢倾向'
  if (lsi > 0) return '轻微结垢倾向'
  if (lsi > -0.5) return '轻微腐蚀倾向'
  return '严重腐蚀倾向'
}

const getRSIColor = (rsi: number) => {
  if (rsi < 6) return 'text-red-400'
  if (rsi < 7) return 'text-yellow-400'
  return 'text-green-400'
}

const getRSIDescription = (rsi: number) => {
  if (rsi < 6) return '结垢倾向'
  if (rsi < 7) return '平衡状态'
  return '腐蚀倾向'
}

const getAIColor = (ai: number) => {
  if (ai > 12) return 'text-green-400'
  if (ai > 10) return 'text-yellow-400'
  return 'text-red-400'
}

const getAIDescription = (ai: number) => {
  if (ai > 12) return '稳定'
  if (ai > 10) return '轻微腐蚀'
  return '显著腐蚀'
}

const getWSIColor = (wsi: number) => {
  if (wsi < 0.2) return 'text-red-400'
  if (wsi < 0.4) return 'text-yellow-400'
  return 'text-green-400'
}

const getWSICategory = (wsi: number) => {
  if (wsi < 0.2) return '不稳定（高腐蚀/高结垢）'
  if (wsi < 0.4) return '基本稳定'
  return '非常稳定'
}

// ========== 浓缩倍数计算方法 ==========
const calculate_Qe = (K: number, deltaT: number, Qr: number) => {
  return K * deltaT * Qr
}

const calculate_N = (Qm: number, Qb1: number, Qb2: number, Qw: number) => {
  return Qm / (Qb1 + Qb2 + Qw)
}

// 手动计算浓缩倍数
const manualCalculateConcentration = () => {
  optimizingConcentration.value = true
  
  setTimeout(() => {
    const selectedSource = waterSources.find(s => s.id === concentrationParams.selectedSource)
    
    const Qe = calculate_Qe(concentrationParams.K, concentrationParams.deltaT, concentrationParams.Qr)
    
    const optimalQb1 = 1.5 + Math.random() * 0.5
    const Qm = Qe + optimalQb1 + concentrationParams.Qb2 + concentrationParams.Qw
    const N = calculate_N(Qm, optimalQb1, concentrationParams.Qb2, concentrationParams.Qw)
    
    concentrationResults.N = N
    concentrationResults.Qm = Qm
    concentrationResults.Qb1 = optimalQb1
    concentrationResults.cost = Qm * (selectedSource?.cost || 5)
    concentrationResults.status = '计算完成'
    
    optimizingConcentration.value = false
    ElMessage.success('浓缩倍数计算完成')
  }, 1500)
}

// 智能优化
const runConcentrationOptimization = () => {
  const selectedSource = waterSources.find(s => s.id === concentrationParams.selectedSource)
  
  const Qe = calculate_Qe(concentrationParams.K, concentrationParams.deltaT, concentrationParams.Qr)
  const optimalQb1 = Math.max(1.0, concentrationParams.N_target * (concentrationParams.Qb2 + concentrationParams.Qw) - Qe)
  const optimalQm = Qe + optimalQb1 + concentrationParams.Qb2 + concentrationParams.Qw
  
  concentrationResults.N = calculate_N(optimalQm, optimalQb1, concentrationParams.Qb2, concentrationParams.Qw)
  concentrationResults.Qm = optimalQm
  concentrationResults.Qb1 = optimalQb1
  concentrationResults.cost = optimalQm * (selectedSource?.cost || 5)
  concentrationResults.status = '优化完成'
  
  ElMessage.success('浓缩倍数优化完成')
}

const getNColor = (n: number) => {
  if (n < 6.5) return 'text-red-400'
  if (n < 7) return 'text-orange-400'
  if (n < 8) return 'text-green-400'
  return 'text-yellow-400'
}

const getNStatus = (n: number) => {
  if (n < 6.5) return '过低'
  if (n < 7) return '偏低'
  if (n < 8) return '正常'
  return '偏高'
}

// ========== 微生物含量计算方法 ==========
const calculate_temp_factor = (T: number, Ea: number) => {
  const R = 8.314
  return Math.exp(-Ea / (R * (T + 273.15)))
}

const calculate_inhibition = (FC: number, ORP: number, a_FC: number, b_ORP: number, c: number) => {
  const z = a_FC * FC + b_ORP * ORP - c
  return 1.0 / (1.0 + Math.exp(-z))
}

const calculate_growth_rate = (params: typeof microorganismParams) => {
  const tempFactor = calculate_temp_factor(params.T, params.Ea)
  const inhibition = calculate_inhibition(params.FC, params.ORP, params.a_FC, params.b_ORP, params.c)
  
  const mu = params.mu_max * (params.S / (params.Ks + params.S)) * tempFactor * (1 - inhibition)
  
  return mu - params.kd
}

// 手动计算微生物
const manualCalculateMicroorganism = () => {
  calculatingMicroorganism.value = true
  
  setTimeout(() => {
    const growthRate = calculate_growth_rate(microorganismParams)
    const tempFactor = calculate_temp_factor(microorganismParams.T, microorganismParams.Ea)
    const inhibition = calculate_inhibition(microorganismParams.FC, microorganismParams.ORP, 
                                           microorganismParams.a_FC, microorganismParams.b_ORP, microorganismParams.c)
    
    const predictedConcentration = microorganismRealTime.currentConcentration * Math.exp(growthRate * 24)
    
    microorganismResults.growthRate = growthRate
    microorganismResults.temperatureFactor = tempFactor
    microorganismResults.predictedConcentration = predictedConcentration
    
    if (predictedConcentration > 1e6) {
      microorganismResults.controlAdvice = '预测浓度过高！建议立即增加杀菌剂投加量至8ppm以上'
    } else if (growthRate > 0.15) {
      microorganismResults.controlAdvice = '生长速率较快，建议将杀菌剂增加至6ppm'
    } else if (inhibition < 0.3) {
      microorganismResults.controlAdvice = '抑制效果不足，建议优化余氯和ORP控制'
    } else {
      microorganismResults.controlAdvice = '当前参数下微生物控制效果良好，建议维持现有方案'
    }
    
    calculatingMicroorganism.value = false
    ElMessage.success('微生物生长计算完成')
  }, 1500)
}

// 开始训练
const startTraining = () => {
  trainingModel.value = true
  
  let progress = 0
  const interval = setInterval(() => {
    progress += 10
    if (progress >= 100) {
      clearInterval(interval)
      trainingModel.value = false
      
      generatePredictionData()
      
      ElMessage.success('模型训练完成，已生成预测结果')
    }
  }, 200)
}

// 生成预测数据
const generatePredictionData = () => {
  const hours = 48
  microorganismPredictionData.value = []
  
  let currentConc = microorganismRealTime.currentConcentration
  const growthRate = microorganismResults.growthRate
  
  for (let i = 0; i < hours; i++) {
    const fluctuation = 1 + (Math.random() - 0.5) * 0.1
    currentConc *= Math.exp(growthRate * fluctuation)
    microorganismPredictionData.value.push(currentConc)
  }
  
  updateMicroorganismChart()
}

// ========== 智能加药模型方法 ==========
const analyzeWaterQuality = () => {
  analyzingWater.value = true
  
  setTimeout(() => {
    historicalData.wsiAvg = 0.45 + (Math.random() - 0.5) * 0.05
    historicalData.nAvg = 7.5 + (Math.random() - 0.5) * 0.3
    historicalData.microorganismAvg = 1.2e5 * (1 + (Math.random() - 0.5) * 0.2)
    historicalData.microorganismLatest = 1.1e5 * (1 + (Math.random() - 0.5) * 0.1)
    
    historicalData.wsiTrend = historicalData.wsiAvg > 0.4 ? '稳定' : '不稳定'
    historicalData.nTrend = historicalData.nAvg > 7 && historicalData.nAvg < 8 ? '良好' : '需调整'
    historicalData.microorganismTrend = historicalData.microorganismLatest < 2e5 ? '可控' : '偏高'
    
    analyzingWater.value = false
    ElMessage.success('水质分析完成')
  }, 2000)
}

const generateMedicationPlan = () => {
  medicationResults.wsiImprovement = 0.48 + (Math.random() - 0.5) * 0.02
  medicationResults.nStability = 7.6 + (Math.random() - 0.5) * 0.1
  medicationResults.microorganismReduction = 75 + (Math.random() - 0.5) * 5
  
  ElMessage.success('加药方案生成完成')
}

const getWSITrend = (trend: string) => {
  return trend === '稳定' ? 'success' : 'warning'
}

const getNTrend = (trend: string) => {
  return trend === '良好' ? 'success' : 'warning'
}

const getMicroorganismTrend = (trend: string) => {
  return trend === '可控' ? 'success' : 'danger'
}

const executePLCCommands = () => {
  medicationResults.plcCommands.forEach(cmd => {
    if (cmd.enabled && cmd.status === '待执行') {
      cmd.status = '执行中'
      
      setTimeout(() => {
        cmd.status = '已执行'
      }, 1000 + Math.random() * 2000)
    }
  })
  
  ElMessage.success('PLC指令开始执行')
}

// ========== PLC控制方法 ==========
const syncPLCControls = () => {
  ElMessage.info('PLC状态同步完成')
}

const exportWSIReport = () => {
  ElMessage.success('水质稳定指数报告已导出')
}

// ========== 实时数据更新 ==========
const updateRealTimeData = () => {
  // 1. 更新水质稳定指数实时值
  waterQualityRealTime.pH = waterQualityParams.pH + (Math.random() - 0.5) * 0.1
  waterQualityRealTime.conductivity = waterQualityParams.conductivity + (Math.random() - 0.5) * 10
  waterQualityRealTime.temperature = waterQualityParams.temperature + (Math.random() - 0.5) * 0.5
  waterQualityRealTime.hardness = waterQualityParams.hardness + (Math.random() - 0.5) * 5
  waterQualityRealTime.alkalinity = waterQualityParams.alkalinity + (Math.random() - 0.5) * 5
  
  const pHs = calculate_pHs(waterQualityRealTime)
  waterQualityRealTime.LSI = calculate_LSI(waterQualityRealTime.pH, pHs)
  waterQualityRealTime.RSI = calculate_RSI(waterQualityRealTime.pH, pHs)
  waterQualityRealTime.AI = calculate_AI(waterQualityRealTime.pH, waterQualityRealTime.hardness, waterQualityRealTime.alkalinity)
  waterQualityRealTime.WSI = calculate_WSI(
    waterQualityRealTime.LSI,
    waterQualityRealTime.RSI,
    waterQualityRealTime.AI
  )
  
  // 2. 更新浓缩倍数实时值
  const Qe = calculate_Qe(concentrationParams.K, concentrationParams.deltaT, concentrationParams.Qr)
  concentrationRealTime.Qe = Qe
  
  const fluctuation = 1 + (Math.random() - 0.5) * 0.05
  concentrationRealTime.Qm = concentrationResults.Qm * fluctuation
  concentrationRealTime.Qb1 = concentrationResults.Qb1 * fluctuation
  concentrationRealTime.N = calculate_N(
    concentrationRealTime.Qm,
    concentrationRealTime.Qb1,
    concentrationParams.Qb2,
    concentrationParams.Qw
  )
  
  // 3. 更新微生物实时值
  const growthRate = calculate_growth_rate(microorganismParams)
  const tempFactor = calculate_temp_factor(microorganismParams.T, microorganismParams.Ea)
  const inhibition = calculate_inhibition(microorganismParams.FC, microorganismParams.ORP, 
                                         microorganismParams.a_FC, microorganismParams.b_ORP, microorganismParams.c)
  
  const microFluctuation = 1 + (Math.random() - 0.5) * 0.02
  microorganismRealTime.currentConcentration *= Math.exp(growthRate * microFluctuation / 3600)
  
  if (microorganismRealTime.currentConcentration > 1e7) {
    microorganismRealTime.currentConcentration = 1e7
  } else if (microorganismRealTime.currentConcentration < 1e4) {
    microorganismRealTime.currentConcentration = 1e4
  }
  
  microorganismRealTime.growthRate = growthRate
  microorganismRealTime.temperatureFactor = tempFactor
  microorganismRealTime.inhibitionEffect = inhibition
  
  if (microorganismRealTime.currentConcentration > 5e5) {
    microorganismRealTime.controlAdvice = '微生物浓度偏高，建议增加杀菌剂投加量'
  } else if (growthRate > 0.1) {
    microorganismRealTime.controlAdvice = '生长速率较快，建议加强监测'
  } else {
    microorganismRealTime.controlAdvice = '当前控制效果良好'
  }
  
  // 4. 更新图表数据
  updateWSIChart()
  updateConcentrationChart()
  if (microorganismPredictionData.value.length > 0) {
    updateMicroorganismChart()
  }
}

// ========== 图表相关方法 ==========
const initWSIChart = () => {
  if (!wsiChartRef.value) return
  
  if (wsiChart) {
    wsiChart.dispose()
  }
  
  wsiChart = echarts.init(wsiChartRef.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const wsiData = Array.from({ length: 24 }, () => 0.45 + (Math.random() - 0.5) * 0.1)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#475569',
      textStyle: { color: '#e2e8f0' },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>WSI: <b style="color:#3b82f6">${data.value.toFixed(4)}</b>`
      }
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(71, 85, 105, 0.3)' } }
    },
    series: [{
      name: '综合水质指数',
      type: 'line',
      data: wsiData,
      smooth: true,
      lineStyle: { width: 3, color: '#3b82f6' },
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
        ])
      }
    }]
  }
  
  wsiChart.setOption(option)
}

const updateWSIChart = () => {
  if (!wsiChart) return
  
  const option = wsiChart.getOption()
  if (option && Array.isArray(option.series)) {
    const newData = [...(option.series[0].data as number[]).slice(1), waterQualityRealTime.WSI]
    wsiChart.setOption({
      series: [{
        data: newData
      }]
    })
  }
}

const initConcentrationChart = () => {
  if (!concentrationChartRef.value) return
  
  if (concentrationChart) {
    concentrationChart.dispose()
  }
  
  concentrationChart = echarts.init(concentrationChartRef.value)
  
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
  const nData = [7.2, 7.5, 7.8, 7.6, 7.4, 7.3]
  const costData = [120, 135, 145, 138, 128, 122]
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#475569'
    },
    legend: {
      textStyle: { color: '#94a3b8' },
      top: '10px'
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: [
      {
        type: 'value',
        name: '浓缩倍数',
        position: 'left',
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' }
      },
      {
        type: 'value',
        name: '成本(元)',
        position: 'right',
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' }
      }
    ],
    series: [
      {
        name: '浓缩倍数',
        type: 'line',
        yAxisIndex: 0,
        data: nData,
        smooth: true,
        lineStyle: { width: 3, color: '#10b981' },
        itemStyle: { color: '#10b981' }
      },
      {
        name: '运行成本',
        type: 'bar',
        yAxisIndex: 1,
        data: costData,
        itemStyle: { color: '#8b5cf6' }
      }
    ]
  }
  
  concentrationChart.setOption(option)
}

const updateConcentrationChart = () => {
  if (!concentrationChart) return
  
  const option = concentrationChart.getOption()
  if (option && Array.isArray(option.series)) {
    const newNData = [...(option.series[0].data as number[]).slice(1), concentrationRealTime.N]
    const newCostData = [...(option.series[1].data as number[]).slice(1), concentrationResults.cost]
    
    concentrationChart.setOption({
      series: [
        { data: newNData },
        { data: newCostData }
      ]
    })
  }
}

const initMicroorganismChart = () => {
  if (!microorganismChartRef.value) return
  
  if (microorganismChart) {
    microorganismChart.dispose()
  }
  
  microorganismChart = echarts.init(microorganismChartRef.value)
  
  const hours = Array.from({ length: 48 }, (_, i) => `${i}h`)
  const initialData = Array.from({ length: 48 }, (_, i) => 1e5 * Math.exp(0.02 * i))
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#475569',
      textStyle: { color: '#e2e8f0' },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>浓度: <b style="color:#f59e0b">${data.value.toExponential(2)} CFU/mL</b>`
      }
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { 
        color: '#94a3b8',
        rotate: 45
      }
    },
    yAxis: {
      type: 'log',
      name: '微生物浓度(CFU/mL)',
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { 
        color: '#94a3b8',
        formatter: (value: number) => value.toExponential(0)
      },
      splitLine: { lineStyle: { color: 'rgba(71, 85, 105, 0.3)' } }
    },
    series: [{
      name: '微生物浓度',
      type: 'line',
      data: initialData,
      smooth: true,
      lineStyle: { width: 3, color: '#f59e0b' },
      itemStyle: { color: '#f59e0b' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
          { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
        ])
      }
    }]
  }
  
  microorganismChart.setOption(option)
}

const updateMicroorganismChart = () => {
  if (!microorganismChart) return
  
  if (microorganismPredictionData.value.length > 0) {
    const hours = Array.from({ length: microorganismPredictionData.value.length }, (_, i) => `${i}h`)
    
    microorganismChart.setOption({
      xAxis: { data: hours },
      series: [{
        data: microorganismPredictionData.value
      }]
    })
  } else {
    const option = microorganismChart.getOption()
    if (option && Array.isArray(option.series)) {
      const newData = [...(option.series[0].data as number[]).slice(1), microorganismRealTime.currentConcentration]
      microorganismChart.setOption({
        series: [{
          data: newData
        }]
      })
    }
  }
}

// 切换模型时重新初始化图表
const switchModel = (modelId: 'waterQuality' | 'concentration' | 'microorganism' | 'medication') => {
  activeModel.value = modelId
  
  nextTick(() => {
    switch (modelId) {
      case 'waterQuality':
        if (wsiChartRef.value) initWSIChart()
        break
      case 'concentration':
        if (concentrationChartRef.value) initConcentrationChart()
        break
      case 'microorganism':
        if (microorganismChartRef.value) initMicroorganismChart()
        break
    }
  })
}

// ========== 生命周期管理 ==========
onMounted(() => {
  // 初始化实时数据
  manualCalculateWSI()
  manualCalculateConcentration()
  manualCalculateMicroorganism()
  
  // 启动实时更新
  startRealTimeUpdate()
  
  // 初始化图表
  nextTick(() => {
    initWSIChart()
    initConcentrationChart()
    initMicroorganismChart()
  })
  
  // 监听窗口变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 停止所有定时器
  stopRealTimeUpdate()
  
  // 清理图表
  if (wsiChart) wsiChart.dispose()
  if (concentrationChart) concentrationChart.dispose()
  if (microorganismChart) microorganismChart.dispose()
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})

// 启动实时更新
const startRealTimeUpdate = () => {
  if (realTimeTimer) clearInterval(realTimeTimer)
  
  realTimeTimer = window.setInterval(() => {
    updateRealTimeData()
  }, parseInt(updateInterval.value))
}

// 停止实时更新
const stopRealTimeUpdate = () => {
  if (realTimeTimer) {
    clearInterval(realTimeTimer)
    realTimeTimer = null
  }
  
  if (simulationTimer) {
    clearInterval(simulationTimer)
    simulationTimer = null
  }
}

// 监听更新间隔变化
watch(updateInterval, (newValue) => {
  stopRealTimeUpdate()
  startRealTimeUpdate()
})

// 窗口大小变化处理
const handleResize = () => {
  if (wsiChart) wsiChart.resize()
  if (concentrationChart) concentrationChart.resize()
  if (microorganismChart) microorganismChart.resize()
}
</script>

<style scoped>
.module-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.3s ease-out;
}

.module-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideOut 0.2s ease-in;
}

.module-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.module-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}

/* 卡片悬停效果 */
.hover-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}
</style>