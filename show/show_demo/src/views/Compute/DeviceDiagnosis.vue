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
    <!-- 顶部标题栏 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            安庆石化设备诊断
          </h1>
          <p class="text-slate-400 mt-2">安庆石化 - 基于相关性的实时设备异常检测</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-sm text-slate-400">
            {{ formatNowTime() }}
          </div>
          <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <el-icon class="text-xl text-cyan-400"><User /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块切换导航 -->
    <div class="mb-8">
      <div class="relative bg-slate-800/40 rounded-2xl p-1 border border-slate-700/50">
        <!-- 背景滑块 -->
        <div 
          class="absolute top-1 bottom-1 rounded-xl transition-all duration-500 ease-out"
          :class="[
            activeModule === 'training' ? 'w-[calc(33.333%-0.5rem)] left-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' :
            activeModule === 'prediction' ? 'w-[calc(33.333%-0.5rem)] left-[calc(33.333%+0.25rem)] bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' :
            'w-[calc(33.333%-0.5rem)] left-[calc(66.666%+0.25rem)] bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30'
          ]"
        ></div>
        
        <div class="relative z-10 grid grid-cols-3 gap-1">
          <!-- 在线训练导航 -->
          <button
            @click="activeModule = 'training'"
            class="py-4 px-2 rounded-xl text-center transition-all duration-300 group"
            :class="activeModule === 'training' ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'"
          >
            <div class="flex flex-col items-center">
              <el-icon class="text-2xl mb-2">
                <Cpu />
              </el-icon>
              <span class="font-medium text-sm">在线训练</span>
              <div v-if="activeModule === 'training'" class="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 animate-pulse"></div>
            </div>
          </button>

          <!-- 实时预测导航 -->
          <button
            @click="activeModule = 'prediction'"
            class="py-4 px-2 rounded-xl text-center transition-all duration-300 group"
            :class="activeModule === 'prediction' ? 'text-green-300' : 'text-slate-400 hover:text-slate-200'"
          >
            <div class="flex flex-col items-center">
              <el-icon class="text-2xl mb-2">
                <TrendCharts />
              </el-icon>
              <span class="font-medium text-sm">实时预测</span>
              <div v-if="activeModule === 'prediction'" class="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 animate-pulse"></div>
            </div>
          </button>

          <!-- 模型库导航 -->
          <button
            @click="activeModule = 'models'"
            class="py-4 px-2 rounded-xl text-center transition-all duration-300 group"
            :class="activeModule === 'models' ? 'text-purple-300' : 'text-slate-400 hover:text-slate-200'"
          >
            <div class="flex flex-col items-center">
              <el-icon class="text-2xl mb-2">
                <DataBoard />
              </el-icon>
              <span class="font-medium text-sm">模型库</span>
              <div v-if="activeModule === 'models'" class="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 animate-pulse"></div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 模块内容区域 -->
    <div class="relative min-h-[600px]">
      <!-- 在线训练模块 -->
      <transition name="module-fade" mode="out-in">
        <div v-if="activeModule === 'training'" class="space-y-6">
          <!-- 训练配置卡片 -->
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
            <!-- 卡片标题 -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-4">
                  <el-icon class="text-2xl text-cyan-400"><Cpu /></el-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-200">在线模型训练配置</h2>
                  <p class="text-slate-400">为设备训练新的异常检测模型</p>
                </div>
              </div>
              <div class="flex gap-3">
                <el-button type="primary" @click="startTraining" :loading="isTraining" :disabled="!canStartTraining">
                  <el-icon class="mr-2"><VideoPlay /></el-icon>
                  开始训练
                </el-button>
                <el-button @click="resetTrainingConfig">
                  <el-icon class="mr-2"><Refresh /></el-icon>
                  重置
                </el-button>
              </div>
            </div>

            <!-- 配置内容 -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- 左列：模型选择和设备配置 -->
              <div class="lg:col-span-2 space-y-6">
                <!-- 模型类型选择 -->
                <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                    <el-icon class="mr-2"><MagicStick /></el-icon>
                    选择AI算法模型
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div 
                      v-for="model in modelTypes" 
                      :key="model.id"
                      class="border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] group"
                      :class="selectedModelType === model.id 
                        ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                        : 'border-slate-700 hover:border-slate-500'"
                      @click="selectedModelType = model.id"
                    >
                      <div class="flex items-center mb-2">
                        <el-icon :class="model.iconClass" class="text-xl mr-3">
                          <component :is="model.icon" />
                        </el-icon>
                        <span class="font-bold text-slate-200">{{ model.name }}</span>
                      </div>
                      <div class="text-xs text-slate-400">{{ model.description }}</div>
                    </div>
                  </div>
                </div>

                <!-- 设备与数据配置 -->
                <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4">训练数据配置</h3>
                  <div class="space-y-6">
                    <!-- 设备选择 -->
                    <div>
                      <label class="block text-sm text-slate-400 mb-2">选择设备</label>
                      <el-select 
                        v-model="trainingConfig.deviceId" 
                        placeholder="请选择设备" 
                        class="w-full"
                        @change="handleDeviceChange"
                        filterable
                      >
                        <el-option
                          v-for="device in deviceList"
                          :key="device.id"
                          :label="device.name"
                          :value="device.id"
                        />
                      </el-select>
                    </div>

                    <!-- 模型名称 -->
                    <div v-if="trainingConfig.deviceId">
                      <label class="block text-sm text-slate-400 mb-2">模型名称</label>
                      <el-input 
                        v-model="trainingConfig.modelName" 
                        placeholder="自动生成或自定义"
                        :prefix-icon="Edit"
                        class="w-full"
                      >
                        <template #append>
                          <el-button @click="generateModelName">
                            <el-icon><Refresh /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                      <div class="text-xs text-slate-500 mt-1">
                        格式: 设备名_模型类型 (如: 反应器ARA-21201_Transformer)
                      </div>
                    </div>

                    <!-- 点位选择 -->
                    <div v-if="availablePoints.length > 0">
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm text-slate-400">选择监测点位</label>
                        <div class="flex gap-2">
                          <el-button size="small" @click="selectAllPoints">全选</el-button>
                          <el-button size="small" @click="clearAllPoints">清空</el-button>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-3 bg-slate-900/30 rounded-lg">
                        <el-checkbox 
                          v-for="point in availablePoints" 
                          :key="point.id"
                          v-model="trainingConfig.selectedPointIds"
                          :label="point.id"
                          :title="point.name"
                          class="w-full"
                        >
                          <div class="flex items-center text-xs truncate">
                            <el-icon class="mr-1 text-slate-400"><CircleCheck /></el-icon>
                            <span class="text-slate-300">{{ point.label }}</span>
                          </div>
                        </el-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右列：参数配置 -->
              <div class="space-y-6">
                <!-- 模型参数配置 -->
                <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4">模型参数配置</h3>
                  
                  <!-- Transformer参数 -->
                  <div v-if="selectedModelType === 'transformer'" class="space-y-4">
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">隐藏层维度</label>
                      <el-slider 
                        v-model="modelParams.transformer.hiddenDim" 
                        :min="32" :max="512" :step="32"
                        show-input
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">注意力头数</label>
                      <el-input-number 
                        v-model="modelParams.transformer.numHeads" 
                        :min="1" :max="16"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">编码器层数</label>
                      <el-input-number 
                        v-model="modelParams.transformer.numLayers" 
                        :min="1" :max="8"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">学习率</label>
                      <el-input-number 
                        v-model="modelParams.transformer.learningRate" 
                        :min="0.0001" :max="0.01" :step="0.0001"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <!-- LSTM参数 -->
                  <div v-if="selectedModelType === 'lstm'" class="space-y-4">
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">隐藏层大小</label>
                      <el-input-number 
                        v-model="modelParams.lstm.hiddenSize" 
                        :min="16" :max="256"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">LSTM层数</label>
                      <el-input-number 
                        v-model="modelParams.lstm.numLayers" 
                        :min="1" :max="4"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">序列长度</label>
                      <el-input-number 
                        v-model="modelParams.lstm.seqLength" 
                        :min="32" :max="128"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <!-- 孤立森林参数 -->
                  <div v-if="selectedModelType === 'isolation_forest'" class="space-y-4">
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">树的数量</label>
                      <el-slider 
                        v-model="modelParams.isolationForest.nEstimators" 
                        :min="10" :max="500" :step="10"
                        show-input
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">污染率</label>
                      <el-slider 
                        v-model="modelParams.isolationForest.contamination" 
                        :min="0.01" :max="0.5" :step="0.01"
                        :format-tooltip="(val: number) => `${(val * 100).toFixed(1)}%`"
                        show-input
                      />
                    </div>
                  </div>

                  <!-- GRU参数 -->
                  <div v-if="selectedModelType === 'gru'" class="space-y-4">
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">隐藏层大小</label>
                      <el-input-number 
                        v-model="modelParams.gru.hiddenSize" 
                        :min="16" :max="256"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">GRU层数</label>
                      <el-input-number 
                        v-model="modelParams.gru.numLayers" 
                        :min="1" :max="4"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                  </div>
                </div>

                <!-- 训练控制 -->
                <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4">训练控制</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm text-slate-400 mb-1">训练轮数</label>
                      <el-input-number 
                        v-model="trainingConfig.epochs" 
                        :min="10" :max="1000"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-sm text-slate-400 mb-1">批量大小</label>
                      <el-input-number 
                        v-model="trainingConfig.batchSize" 
                        :min="8" :max="128"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 训练进度 - 添加ID用于滚动定位 -->
            <transition name="fade">
              <div v-if="isTraining" id="training-progress" class="mt-6 pt-6 border-t border-slate-700/50">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-slate-300">训练进度</h3>
                  <div class="text-cyan-400 font-mono">{{ trainingProgress.epoch }}/{{ trainingConfig.epochs }}</div>
                </div>
                
                <el-progress 
                  :percentage="Math.round((trainingProgress.epoch / trainingConfig.epochs) * 100)" 
                  :color="progressColors"
                  :show-text="false"
                  class="mb-4"
                />
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-slate-800/40 p-3 rounded-lg">
                    <div class="text-sm text-slate-400 mb-1">当前损失</div>
                    <div class="text-lg font-bold" :class="getLossColor(trainingProgress.currentLoss)">
                      {{ trainingProgress.currentLoss.toFixed(4) }}
                    </div>
                  </div>
                  <div class="bg-slate-800/40 p-3 rounded-lg">
                    <div class="text-sm text-slate-400 mb-1">学习率</div>
                    <div class="text-lg font-bold text-green-400">{{ trainingProgress.learningRate.toFixed(6) }}</div>
                  </div>
                  <div class="bg-slate-800/40 p-3 rounded-lg">
                    <div class="text-sm text-slate-400 mb-1">训练时间</div>
                    <div class="text-lg font-bold text-blue-400">{{ trainingProgress.elapsedTime }}s</div>
                  </div>
                  <div class="bg-slate-800/40 p-3 rounded-lg">
                    <div class="text-sm text-slate-400 mb-1">批次进度</div>
                    <div class="text-lg font-bold text-yellow-400">{{ trainingProgress.batch }}/{{ trainingProgress.totalBatches }}</div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </transition>

      <!-- 实时预测模块 -->
      <transition name="module-fade" mode="out-in">
        <div v-if="activeModule === 'prediction'" class="space-y-6">
          <!-- 预测配置卡片 -->
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
            <!-- 卡片标题 -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mr-4">
                  <el-icon class="text-2xl text-green-400"><TrendCharts /></el-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-200">实时异常预测</h2>
                  <p class="text-slate-400">使用已训练模型进行实时监测和预警</p>
                </div>
              </div>
              <div class="flex gap-3">
                <el-button type="success" @click="startPrediction" :loading="isPredicting" :disabled="!canStartPrediction">
                  <el-icon class="mr-2"><VideoPlay /></el-icon>
                  开始预测
                </el-button>
                <el-button @click="stopPrediction" :disabled="!isPredicting">
                  <el-icon class="mr-2"><VideoPause /></el-icon>
                  停止
                </el-button>
                <el-button type="primary" @click="exportToPDF" :disabled="predictionResults.alerts.length === 0">
                  <el-icon class="mr-2"><Download /></el-icon>
                  导出文本
                </el-button>
              </div>
            </div>

            <!-- 新的布局：上部分配置，下部分结果 -->
            <div class="space-y-6">
              <!-- 配置区域 -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 配置区块1：设备选择 -->
                <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                    <el-icon class="mr-2"><Setting /></el-icon>
                    预测配置
                  </h3>
                  <div class="space-y-4">
                    <!-- 设备选择 -->
                    <div>
                      <label class="block text-sm text-slate-400 mb-2">选择设备</label>
                      <el-select 
                        v-model="predictionConfig.deviceId" 
                        placeholder="请选择设备" 
                        class="w-full"
                        @change="loadDeviceModels"
                        filterable
                      >
                        <el-option
                          v-for="device in deviceList"
                          :key="device.id"
                          :label="device.name"
                          :value="device.id"
                        />
                      </el-select>
                    </div>

                    <!-- 模型选择 -->
                    <div v-if="predictionConfig.deviceId">
                      <label class="block text-sm text-slate-400 mb-2">选择预测模型</label>
                      <div class="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-900/30 rounded-lg">
                        <div 
                          v-for="model in availablePredictionModels" 
                          :key="model.id"
                          class="border rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.01] group"
                          :class="selectedPredictionModels.includes(model.id) 
                            ? 'border-green-500 bg-green-900/20' 
                            : 'border-slate-700 hover:border-slate-500'"
                          @click="togglePredictionModel(model.id)"
                        >
                          <div class="flex items-center justify-between">
                            <div class="flex items-center">
                              <div class="relative">
                                <div 
                                  v-if="selectedPredictionModels.includes(model.id)"
                                  class="absolute -inset-1 bg-green-500/20 rounded-full blur-sm"
                                ></div>
                                <el-checkbox 
                                  :model-value="selectedPredictionModels.includes(model.id)" 
                                  @click.stop
                                  @change="togglePredictionModel(model.id)"
                                />
                              </div>
                              <div class="ml-3">
                                <div class="font-medium text-slate-200">{{ model.name }}</div>
                                <div class="text-xs text-slate-400">{{ model.type.toUpperCase() }} 模型</div>
                              </div>
                            </div>
                            <el-tag size="small" :type="model.status === 'ready' ? 'success' : 'warning'">
                              {{ model.status === 'ready' ? '就绪' : '训练中' }}
                            </el-tag>
                          </div>
                        </div>
                        <div v-if="availablePredictionModels.length === 0" 
                             class="text-center py-4 text-slate-500 text-sm">
                          该设备暂无已训练模型
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 配置区块2：输出选项 -->
                <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                    <el-icon class="mr-2"><DataBoard /></el-icon>
                    输出选项
                  </h3>
                  <div class="space-y-3">
                    <el-checkbox v-model="predictionOutput.realtimeAlerts" label="实时异常预警" />
                    <el-checkbox v-model="predictionOutput.healthScore" label="健康评分趋势" />
                    <el-checkbox v-model="predictionOutput.reasonAnalysis" label="异常原因解释" />
                    <el-checkbox v-model="predictionOutput.inspectionPlan" label="巡检任务计划" />
                    <el-checkbox v-model="predictionOutput.sendAlarm" label="发送报警通知" />
                  </div>
                </div>

                <!-- 配置区块3：预测状态 -->
                <div class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                    <el-icon class="mr-2"><InfoFilled /></el-icon>
                    预测状态
                  </h3>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-300">预测状态</span>
                      <el-tag :type="isPredicting ? 'success' : 'info'">
                        {{ isPredicting ? '运行中' : '未开始' }}
                      </el-tag>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-300">选中设备</span>
                      <span class="text-green-400">{{ getDeviceName(predictionConfig.deviceId) || '未选择' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-300">选中模型</span>
                      <span class="text-blue-400">{{ predictionConfig.selectedModelIds.length }}个</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-300">异常预警</span>
                      <span class="text-red-400">{{ predictionResults.alerts.length }}条</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分割线：清晰区分配置和结果 -->
              <div v-if="isPredicting || predictionResults.alerts.length > 0" class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-700/50"></div>
                </div>
                <div class="relative flex justify-center">
                  <span class="px-4 bg-slate-800 text-slate-300 text-sm font-medium">预测结果</span>
                </div>
              </div>

              <!-- 结果区域 -->
              <div v-if="isPredicting || predictionResults.alerts.length > 0" class="space-y-6">
                <!-- 实时异常预警 -->
                <div v-if="predictionOutput.realtimeAlerts && predictionResults.alerts.length > 0" 
                     class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                    <el-icon class="mr-2 text-red-400"><Warning /></el-icon>
                    实时异常预警
                    <span class="ml-2 text-sm font-normal text-slate-400">(最近{{ Math.min(5, predictionResults.alerts.length) }}条)</span>
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div 
                      v-for="(alert, index) in (showAllAlerts ? predictionResults.alerts : predictionResults.alerts.slice(0, 6))" 
                      :key="alert.id"
                      class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl border-l-4 transition-all hover:scale-[1.02] hover:shadow-lg"
                      :class="getAlertBorderClass(alert.level)"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="flex items-center mb-2">
                            <span class="text-lg font-bold text-slate-200 truncate">{{ alert.device }}</span>
                            <el-tag size="small" class="ml-2">{{ alert.model }}</el-tag>
                          </div>
                          <div class="text-sm text-slate-300 mb-3 line-clamp-2">{{ alert.description }}</div>
                          <div class="text-xs text-slate-400">{{ alert.time }}</div>
                        </div>
                        <div class="text-right ml-3">
                          <div class="text-2xl font-bold mb-1" :class="getAlertScoreColor(alert.score)">
                            {{ alert.score.toFixed(2) }}
                          </div>
                          <el-tag size="small" :type="getAlertLevelType(alert.level)">
                            {{ getAlertLevelText(alert.level) }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="predictionResults.alerts.length > 6" class="text-center mt-4">
                    <el-button size="small" @click="showAllAlerts = !showAllAlerts">
                      {{ showAllAlerts ? '收起' : '查看全部' }} (共{{ predictionResults.alerts.length }}条)
                    </el-button>
                  </div>
                </div>

                <!-- 健康评分趋势图和异常原因分析（并排显示） -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- 健康评分趋势图 -->
                  <div v-if="predictionOutput.healthScore && predictionResults.healthScores.length > 0" 
                       class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                      <el-icon class="mr-2 text-green-400"><TrendCharts /></el-icon>
                      健康评分趋势 - {{ getDeviceName(predictionConfig.deviceId) }}
                    </h3>
                    <div class="h-64 relative">
                      <!-- 折线图容器 -->
                      <div ref="healthChartRef" class="w-full h-full"></div>
                    </div>
                  </div>
                  <div v-else-if="predictionOutput.healthScore" 
                       class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <div class="flex flex-col items-center justify-center h-64">
                      <el-icon class="text-4xl text-slate-600 mb-4"><TrendCharts /></el-icon>
                      <p class="text-slate-500">暂无健康评分数据</p>
                    </div>
                  </div>

                  <!-- 异常原因分析 -->
                  <div v-if="predictionOutput.reasonAnalysis && predictionResults.reasons.length > 0" 
                       class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                      <el-icon class="mr-2 text-blue-400"><Histogram /></el-icon>
                      异常原因分析
                    </h3>
                    <div class="space-y-4 max-h-64 overflow-y-auto pr-2">
                      <div 
                        v-for="reason in predictionResults.reasons" 
                        :key="reason.id"
                        class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-colors"
                      >
                        <div class="flex items-start justify-between mb-3">
                          <span class="font-medium text-slate-200">{{ reason.device }}</span>
                          <el-tag size="small" :type="getImpactType(reason.impact)">
                            {{ reason.impact }}
                          </el-tag>
                        </div>
                        <div class="text-sm text-slate-300 mb-2">{{ reason.description }}</div>
                        <div class="text-xs text-slate-400 mt-2">
                          <span class="font-medium">可能原因：</span>
                          <span class="text-slate-300">{{ reason.cause }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 巡检任务计划 -->
                <div v-if="predictionOutput.inspectionPlan && predictionResults.inspectionTasks.length > 0" 
                     class="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                  <h3 class="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                    <el-icon class="mr-2 text-yellow-400"><DataAnalysis /></el-icon>
                    巡检任务计划
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      v-for="task in predictionResults.inspectionTasks" 
                      :key="task.id"
                      class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl border border-slate-700/50 hover:border-yellow-500/30 transition-colors"
                    >
                      <div class="flex items-start justify-between mb-3">
                        <span class="font-medium text-slate-200">{{ task.device }}</span>
                        <el-tag size="small" :type="task.priority === '高' ? 'danger' : 'warning'">
                          {{ task.priority }}
                        </el-tag>
                      </div>
                      <div class="text-sm text-slate-300 mb-3">{{ task.task }}</div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-400">执行时间：</span>
                        <span class="text-yellow-400">{{ task.time }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 未开始预测时的提示 -->
              <div v-else class="text-center py-12">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                  <el-icon class="text-3xl text-slate-500"><TrendCharts /></el-icon>
                </div>
                <h3 class="text-xl font-semibold text-slate-300 mb-2">等待预测开始</h3>
                <p class="text-slate-400 mb-6">请先选择设备和模型，然后点击"开始预测"按钮</p>
                <div class="flex justify-center gap-4">
                  <el-button type="success" @click="startPrediction" :disabled="!canStartPrediction">
                    <el-icon class="mr-2"><VideoPlay /></el-icon>
                    开始预测
                  </el-button>
                  <el-button @click="activeModule = 'models'">
                    <el-icon class="mr-2"><DataBoard /></el-icon>
                    前往模型库
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 模型库模块 -->
      <transition name="module-fade" mode="out-in">
        <div v-if="activeModule === 'models'" class="space-y-6">
          <!-- 模型库卡片 -->
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
            <!-- 卡片标题 -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mr-4">
                  <el-icon class="text-2xl text-purple-400"><DataBoard /></el-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-200">AI模型库</h2>
                  <p class="text-slate-400">管理所有已训练的AI模型</p>
                </div>
              </div>
              <div class="flex gap-3">
                <el-button @click="refreshModels">
                  <el-icon class="mr-2"><Refresh /></el-icon>
                  刷新
                </el-button>
                <el-button type="primary" @click="exportAllModels">
                  <el-icon class="mr-2"><Download /></el-icon>
                  导出全部
                </el-button>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="bg-slate-800/40 p-4 rounded-xl">
                <div class="text-sm text-slate-400 mb-1">总模型数</div>
                <div class="text-2xl font-bold text-slate-200">{{ modelStats.total }}</div>
              </div>
              <div class="bg-slate-800/40 p-4 rounded-xl">
                <div class="text-sm text-slate-400 mb-1">就绪模型</div>
                <div class="text-2xl font-bold text-green-400">{{ modelStats.ready }}</div>
              </div>
              <div class="bg-slate-800/40 p-4 rounded-xl">
                <div class="text-sm text-slate-400 mb-1">训练中</div>
                <div class="text-2xl font-bold text-yellow-400">{{ modelStats.training }}</div>
              </div>
              <div class="bg-slate-800/40 p-4 rounded-xl">
                <div class="text-sm text-slate-400 mb-1">平均准确率</div>
                <div class="text-2xl font-bold text-blue-400">{{ modelStats.avgAccuracy }}%</div>
              </div>
            </div>

            <!-- 模型列表 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                v-for="model in trainedModels" 
                :key="model.id"
                class="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-5 border border-slate-700/50 hover:border-slate-500/50 transition-all duration-300 hover:scale-[1.02] group"
              >
                <!-- 模型头部 -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <el-tag size="small" :type="getModelTypeColor(model.type)">
                        {{ model.type.toUpperCase() }}
                      </el-tag>
                      <el-tag size="small" :type="model.status === 'ready' ? 'success' : 'warning'">
                        {{ model.status === 'ready' ? '就绪' : '训练中' }}
                      </el-tag>
                    </div>
                    <h4 class="text-xl font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                      {{ model.name }}
                    </h4>
                    <div class="text-sm text-slate-400 mt-1">{{ model.deviceName }}</div>
                  </div>
                  <el-dropdown trigger="click">
                    <el-icon class="text-xl text-slate-500 hover:text-slate-300 cursor-pointer">
                      <MoreFilled />
                    </el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="useModelForPrediction(model)">使用预测</el-dropdown-item>
                        <el-dropdown-item @click="viewModelDetails(model)">查看详情</el-dropdown-item>
                        <el-dropdown-item @click="retrainModel(model)" :disabled="model.status === 'training'">重新训练</el-dropdown-item>
                        <el-dropdown-item @click="exportModel(model)">导出模型</el-dropdown-item>
                        <el-dropdown-item @click="deleteModel(model)" divided class="text-red-400">删除模型</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>

                <!-- 模型信息 -->
                <div class="space-y-3 mb-6">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">训练时间</span>
                    <span class="text-slate-300">{{ formatTime(model.createdAt) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">准确率</span>
                    <span class="text-green-400 font-bold">{{ model.accuracy }}%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">点位数量</span>
                    <span class="text-slate-300">{{ model.pointCount }}个</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">最后使用</span>
                    <span class="text-slate-300">{{ getLastUsedTime(model) }}</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="pt-4 border-t border-slate-700/50">
                  <div class="flex gap-2">
                    <el-button 
                      size="small" 
                      class="flex-1" 
                      @click="useModelForPrediction(model)"
                      :disabled="model.status !== 'ready'"
                    >
                      使用预测
                    </el-button>
                    <el-button 
                      size="small" 
                      class="flex-1" 
                      type="warning"
                      @click="retrainModel(model)"
                      :disabled="model.status === 'training'"
                    >
                      重新训练
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
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
          <span>当前模块: {{ getModuleName(activeModule) }}</span>
          <span>•</span>
          <span>最后更新: {{ formatNowTime() }}</span>
        </div>
        <div>安庆石化 - 智能设备异常检测系统</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  Cpu, TrendCharts, DataBoard, Connection, VideoPlay, VideoPause,
  Warning, Refresh, MagicStick, DataAnalysis, CircleCheck, Edit,
  ArrowDown, InfoFilled, Plus, MoreFilled, User, ArrowRight,
  Download, Setting, Histogram
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 当前激活的模块
const activeModule = ref<'training' | 'prediction' | 'models'>('training')

// ========== 在线训练配置 ==========
const selectedModelType = ref('transformer')
const isTraining = ref(false)

const modelTypes = [
  { 
    id: 'transformer', 
    name: 'Transformer', 
    icon: Connection, 
    description: '基于注意力机制，适合长期依赖序列',
    iconClass: 'text-blue-400'
  },
  { 
    id: 'lstm', 
    name: 'LSTM', 
    icon: Cpu, 
    description: '长短期记忆网络，经典时间序列模型',
    iconClass: 'text-green-400'
  },
  { 
    id: 'gru', 
    name: 'GRU', 
    icon: DataAnalysis, 
    description: '门控循环单元，LSTM的简化版',
    iconClass: 'text-purple-400'
  },
  { 
    id: 'isolation_forest', 
    name: '孤立森林', 
    icon: MagicStick, 
    description: '快速无监督异常检测',
    iconClass: 'text-cyan-400'
  }
]

// 设备列表（完整设备信息）
const deviceList = [
  { id: 'FC21101', name: '流量控制器 FC21101', type: 'flow_controller' },
  { id: 'P-2106', name: '泵 P-2106A/S', type: 'pump' },
  { id: 'P-2122', name: '泵 P-2122A/S', type: 'pump' },
  { id: 'V-601B', name: '阀门 V-601B', type: 'valve' },
  { id: 'FC24101', name: '流量控制器 FC24101', type: 'flow_controller' },
  { id: 'ARA-21201', name: '反应器 ARA-21201', type: 'reactor' }
]

// 设备点位数据
const devicePoints = {
  'FC21101': [
    { id: 'FC21101_PV', label: 'PV', name: '过程值', unit: 'm³/h' },
    { id: 'FC21101_SV', label: 'SV', name: '设定值', unit: 'm³/h' },
    { id: 'FC21101_MV', label: 'MV', name: '输出值', unit: '%' },
    { id: 'FI21101A', label: 'A', name: '流量计A', unit: 'm³/h' },
    { id: 'FI21101B', label: 'B', name: '流量计B', unit: 'm³/h' },
    { id: 'FC21101_TEMP', label: 'TEMP', name: '温度', unit: '°C' },
    { id: 'FC21101_PRESS', label: 'PRESS', name: '压力', unit: 'MPa' }
  ],
  'P-2106': [
    { id: 'P2106_VIBRATION', label: '振动', name: '振动传感器', unit: 'mm/s' },
    { id: 'P2106_TEMP', label: '温度', name: '温度传感器', unit: '°C' },
    { id: 'P2106_CURRENT', label: '电流', name: '电流传感器', unit: 'A' },
    { id: 'P2106_PRESSURE', label: '压力', name: '压力传感器', unit: 'MPa' },
    { id: 'P2106_FLOW', label: '流量', name: '流量计', unit: 'm³/h' },
    { id: 'P2106_SPEED', label: '转速', name: '转速传感器', unit: 'rpm' }
  ],
  'P-2122': [
    { id: 'P2122_VIBRATION', label: '振动', name: '振动传感器', unit: 'mm/s' },
    { id: 'P2122_TEMP', label: '温度', name: '温度传感器', unit: '°C' },
    { id: 'P2122_CURRENT', label: '电流', name: '电流传感器', unit: 'A' },
    { id: 'P2122_PRESSURE', label: '压力', name: '压力传感器', unit: 'MPa' },
    { id: 'P2122_FLOW', label: '流量', name: '流量计', unit: 'm³/h' }
  ],
  'V-601B': [
    { id: 'V601B_POSITION', label: '位置', name: '位置反馈', unit: '%' },
    { id: 'V601B_TORQUE', label: '扭矩', name: '扭矩传感器', unit: 'N·m' },
    { id: 'V601B_TEMP', label: '温度', name: '温度传感器', unit: '°C' },
    { id: 'V601B_PRESSURE', label: '压力', name: '压力传感器', unit: 'MPa' },
    { id: 'V601B_FLOW', label: '流量', name: '流量计', unit: 'm³/h' }
  ],
  'FC24101': [
    { id: 'FC24101_PV', label: 'PV', name: '过程值', unit: 'm³/h' },
    { id: 'FC24101_SV', label: 'SV', name: '设定值', unit: 'm³/h' },
    { id: 'FC24101_MV', label: 'MV', name: '输出值', unit: '%' },
    { id: 'FI24101A', label: 'A', name: '流量计A', unit: 'm³/h' },
    { id: 'FC24101_TEMP', label: 'TEMP', name: '温度', unit: '°C' },
    { id: 'FC24101_PRESS', label: 'PRESS', name: '压力', unit: 'MPa' }
  ],
  'ARA-21201': [
    { id: 'ARA21201_TEMP', label: '温度', name: '反应温度', unit: '°C' },
    { id: 'ARA21201_PRESSURE', label: '压力', name: '反应压力', unit: 'MPa' },
    { id: 'ARA21201_PH', label: 'pH值', name: 'pH传感器', unit: 'pH' },
    { id: 'ARA21201_CONC', label: '浓度', name: '物料浓度', unit: 'mol/L' },
    { id: 'ARA21201_LEVEL', label: '液位', name: '液位传感器', unit: 'm' },
    { id: 'ARA21201_FLOW_IN', label: '进料', name: '进料流量', unit: 'm³/h' },
    { id: 'ARA21201_FLOW_OUT', label: '出料', name: '出料流量', unit: 'm³/h' }
  ]
}

// 设备异常原因数据
const deviceReasons = {
  'flow_controller': [
    { cause: '上游压力波动导致流量不稳定', description: '流量控制器检测到流量波动超出正常范围', impact: '中' },
    { cause: '阀门执行机构响应延迟', description: '阀门响应时间超过设定阈值', impact: '低' },
    { cause: '传感器校准偏差', description: '流量传感器读数与实际值存在偏差', impact: '中' },
    { cause: 'PID参数设置不当', description: '控制回路调节不稳定', impact: '高' }
  ],
  'pump': [
    { cause: '轴承磨损导致振动增大', description: '泵振动频率异常增高，超过安全阈值', impact: '高' },
    { cause: '密封件老化泄漏', description: '泵体温度异常升高，检测到泄漏', impact: '高' },
    { cause: '电机电流不平衡', description: '电机三相电流不平衡度超过10%', impact: '中' },
    { cause: '叶轮磨损效率下降', description: '泵效率降低，能耗增加', impact: '中' }
  ],
  'valve': [
    { cause: '执行器定位不准确', description: '阀门位置反馈与指令存在较大偏差', impact: '中' },
    { cause: '密封面磨损泄漏', description: '阀门关闭状态下检测到泄漏', impact: '高' },
    { cause: '阀杆卡涩动作延迟', description: '阀门响应时间延长', impact: '低' },
    { cause: '控制信号干扰', description: '接收到异常控制信号', impact: '中' }
  ],
  'reactor': [
    { cause: '反应温度控制不稳定', description: '反应器温度波动超出工艺要求', impact: '高' },
    { cause: '催化剂活性下降', description: '反应效率降低，产品浓度异常', impact: '高' },
    { cause: '物料配比失衡', description: '检测到进料比例异常', impact: '中' },
    { cause: '搅拌器故障', description: '物料混合不均匀', impact: '中' }
  ]
}

// 训练配置
const trainingConfig = reactive({
  deviceId: '',
  modelName: '',
  selectedPointIds: [] as string[],
  startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endTime: new Date(),
  sampleFrequency: '5min',
  epochs: 100,
  batchSize: 32,
  features: {
    slidingMean: true,
    slidingStd: true,
    slidingMax: true,
    slidingMin: true,
    diffMean: true,
    correlation: true,
    freqDomain: false,
    statistical: true
  }
})

// 模型参数
const modelParams = reactive({
  transformer: {
    hiddenDim: 256,
    numHeads: 8,
    numLayers: 4,
    learningRate: 0.001,
    dropout: 0.1,
    feedforwardDim: 512,
    attentionDropout: 0.1
  },
  
  lstm: {
    hiddenSize: 128,
    numLayers: 2,
    seqLength: 64,
    learningRate: 0.001,
    batchSize: 32,
    bidirectional: false,
    dropout: 0.2
  },
  
  gru: {
    hiddenSize: 128,
    numLayers: 2,
    seqLength: 64,
    learningRate: 0.001,
    batchSize: 32,
    bidirectional: false,
    dropout: 0.2
  },
  
  isolationForest: {
    nEstimators: 100,
    contamination: 0.1,
    maxSamples: 256,
    randomState: 42,
    maxFeatures: 1.0,
    bootstrap: false,
    nJobs: -1
  }
})

// 点位数据
const availablePoints = computed(() => {
  if (!trainingConfig.deviceId || !devicePoints[trainingConfig.deviceId as keyof typeof devicePoints]) {
    return []
  }
  return devicePoints[trainingConfig.deviceId as keyof typeof devicePoints]
})

// ========== 训练进度监控 ==========
const trainingProgress = reactive({
  epoch: 0,
  currentLoss: 0,
  learningRate: 0.001,
  elapsedTime: 0,
  totalBatches: 0,
  batch: 0,
  lossHistory: [] as number[]
})

const trainingLogs = ref<Array<{time: string, message: string, type: string}>>([])

const progressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

// ========== 实时预测配置 ==========
const isPredicting = ref(false)
const showAllAlerts = ref(false)
const predictionConfig = reactive({
  deviceId: '',
  selectedModelIds: [] as string[]
})

const selectedPredictionModels = computed({
  get: () => predictionConfig.selectedModelIds,
  set: (value) => predictionConfig.selectedModelIds = value
})

// 修改输出选项，移除exportExcel，改为sendAlarm
const predictionOutput = reactive({
  realtimeAlerts: true,
  healthScore: true,
  reasonAnalysis: true,
  inspectionPlan: true,
  sendAlarm: false,
  saveToDatabase: false,
  showHeatmap: false
})

const predictionResults = reactive({
  alerts: [] as any[],
  healthScores: [] as any[],
  reasons: [] as any[],
  inspectionTasks: [] as any[]
})

// ECharts实例
let healthChart: echarts.ECharts | null = null
const healthChartRef = ref<HTMLElement>()

// ========== 模型库 ==========
const trainedModels = ref([
  {
    id: 'model_001',
    name: 'FC21101_Transformer',
    device: 'FC21101',
    deviceName: '流量控制器 FC21101',
    type: 'transformer',
    createdAt: new Date('2024-01-04 14:30:00'),
    status: 'ready',
    accuracy: 97.3,
    pointCount: 7,
    lastUsed: new Date('2024-01-04 15:30:00'),
    filePath: 'models/FC21101_Transformer.pth'
  },
  {
    id: 'model_002',
    name: 'FC21101_LSTM',
    device: 'FC21101',
    deviceName: '流量控制器 FC21101',
    type: 'lstm',
    createdAt: new Date('2024-01-03 10:15:00'),
    status: 'ready',
    accuracy: 95.8,
    pointCount: 7,
    lastUsed: new Date('2024-01-04 14:00:00'),
    filePath: 'models/FC21101_LSTM.pth'
  },
  {
    id: 'model_003',
    name: 'P-2106_IsolationForest',
    device: 'P-2106',
    deviceName: '泵 P-2106A/S',
    type: 'isolation_forest',
    createdAt: new Date('2024-01-02 16:45:00'),
    status: 'ready',
    accuracy: 92.1,
    pointCount: 6,
    lastUsed: new Date('2024-01-04 13:30:00'),
    filePath: 'models/P-2106_IsolationForest.pth'
  },
  {
    id: 'model_004',
    name: 'V-601B_Transformer',
    device: 'V-601B',
    deviceName: '阀门 V-601B',
    type: 'transformer',
    createdAt: new Date('2024-01-01 09:20:00'),
    status: 'training',
    accuracy: 0,
    pointCount: 0,
    lastUsed: null,
    filePath: ''
  },
  {
    id: 'model_005',
    name: '反应器ARA-21201_LSTM',
    device: 'ARA-21201',
    deviceName: '反应器 ARA-21201',
    type: 'lstm',
    createdAt: new Date('2024-01-05 11:00:00'),
    status: 'ready',
    accuracy: 96.2,
    pointCount: 7,
    lastUsed: new Date('2024-01-05 12:00:00'),
    filePath: 'models/ARA-21201_LSTM.pth'
  }
])

const availablePredictionModels = computed(() => {
  if (!predictionConfig.deviceId) {
    return []
  }
  return trainedModels.value.filter(m => 
    m.device === predictionConfig.deviceId && m.status === 'ready'
  )
})

const modelStats = computed(() => {
  const total = trainedModels.value.length
  const ready = trainedModels.value.filter(m => m.status === 'ready').length
  const training = trainedModels.value.filter(m => m.status === 'training').length
  const avgAccuracy = trainedModels.value
    .filter(m => m.status === 'ready')
    .reduce((acc, model) => acc + model.accuracy, 0) / (ready || 1)
  
  return { 
    total, 
    ready, 
    training, 
    avgAccuracy: avgAccuracy.toFixed(1) 
  }
})

// ========== 计算属性 ==========
const canStartTraining = computed(() => {
  return trainingConfig.deviceId && 
         trainingConfig.selectedPointIds.length > 0 &&
         trainingConfig.startTime && 
         trainingConfig.endTime
})

const canStartPrediction = computed(() => {
  return predictionConfig.deviceId && 
         predictionConfig.selectedModelIds.length > 0
})

// ========== 方法定义 ==========
const handleDeviceChange = () => {
  trainingConfig.selectedPointIds = []
  generateModelName()
}

const generateModelName = () => {
  if (trainingConfig.deviceId && selectedModelType.value) {
    const device = deviceList.find(d => d.id === trainingConfig.deviceId)
    const modelType = selectedModelType.value === 'lstm' ? 'LSTM' : 
                     selectedModelType.value === 'transformer' ? 'Transformer' :
                     selectedModelType.value === 'gru' ? 'GRU' : 'IsolationForest'
    // 使用完整的设备名称，如"反应器ARA-21201"
    trainingConfig.modelName = `${device?.name}_${modelType}`
  }
}

const selectAllPoints = () => {
  trainingConfig.selectedPointIds = availablePoints.value.map(p => p.id)
}

const clearAllPoints = () => {
  trainingConfig.selectedPointIds = []
}

const addTrainingLog = (type: string, message: string) => {
  const time = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  trainingLogs.value.unshift({ time, message, type })
}

const startTraining = async () => {
  if (!trainingConfig.deviceId) {
    ElMessage.warning('请先选择设备')
    return
  }
  
  if (trainingConfig.selectedPointIds.length === 0) {
    ElMessage.warning('请至少选择一个监测点位')
    return
  }
  
  isTraining.value = true
  trainingProgress.epoch = 0
  trainingProgress.lossHistory = []
  trainingLogs.value = []
  
  // 添加训练开始日志
  addTrainingLog('info', `开始训练模型: ${trainingConfig.modelName}`)
  addTrainingLog('info', `设备: ${trainingConfig.deviceId}, 点位数量: ${trainingConfig.selectedPointIds.length}`)
  addTrainingLog('info', `模型类型: ${selectedModelType.value.toUpperCase()}`)
  
  // 自动滚动到训练进度区域
  setTimeout(() => {
    const progressElement = document.getElementById('training-progress')
    if (progressElement) {
      progressElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)

  // 模拟训练过程
  await simulateTrainingProcess()

}

const simulateTrainingProcess = async () => {
  const totalEpochs = trainingConfig.epochs
  const startTime = Date.now()
  
  for (let epoch = 1; epoch <= totalEpochs; epoch++) {
    if (!isTraining.value) break
    
    // 更新训练进度
    trainingProgress.epoch = epoch
    trainingProgress.elapsedTime = Math.floor((Date.now() - startTime) / 1000)
    
    // 模拟损失下降
    const baseLoss = 2.0
    const decay = Math.exp(-epoch / 50)
    const noise = (Math.random() - 0.5) * 0.1
    const loss = baseLoss * decay + noise
    
    trainingProgress.currentLoss = loss
    trainingProgress.lossHistory.push(loss)
    
    // 模拟批次进度
    trainingProgress.totalBatches = Math.ceil(1000 / trainingConfig.batchSize)
    trainingProgress.batch = (epoch % trainingProgress.totalBatches) || trainingProgress.totalBatches
    
    // 记录日志
    if (epoch % 10 === 0) {
      addTrainingLog('info', `Epoch ${epoch}/${totalEpochs} - Loss: ${loss.toFixed(4)}`)
    }
    
    // 每25轮调整学习率
    if (epoch % 25 === 0) {
      trainingProgress.learningRate *= 0.9
      addTrainingLog('success', `学习率调整: ${trainingProgress.learningRate.toFixed(6)}`)
    }
    
    // 随机添加一些事件日志
    if (Math.random() > 0.9) {
      const events = [
        '特征工程计算完成',
        '梯度下降优化中...',
        '验证集准确率提升',
        '模型权重保存成功'
      ]
      addTrainingLog('info', events[Math.floor(Math.random() * events.length)])
    }
    
    // 模拟训练延迟
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  if (isTraining.value) {
    // 训练完成
    addTrainingLog('success', `模型训练完成! 最终损失: ${trainingProgress.currentLoss.toFixed(4)}`)
    
    // 添加新模型到列表
    const device = deviceList.find(d => d.id === trainingConfig.deviceId)
    const newModel = {
      id: `model_${Date.now()}`,
      name: trainingConfig.modelName,
      device: trainingConfig.deviceId,
      deviceName: device?.name || trainingConfig.deviceId,
      type: selectedModelType.value,
      createdAt: new Date(),
      status: 'ready' as const,
      accuracy: Math.max(85, 100 - trainingProgress.currentLoss * 20),
      pointCount: trainingConfig.selectedPointIds.length,
      lastUsed: null,
      filePath: `models/${trainingConfig.modelName.replace(/[\/\s]/g, '_')}.pth`
    }
    
    trainedModels.value.unshift(newModel)
    
    // 延迟重置状态
    setTimeout(() => {
      isTraining.value = false
      ElMessage.success(`模型 ${trainingConfig.modelName} 训练完成！`)
    }, 1000)
  }
}

const resetTrainingConfig = () => {
  trainingConfig.deviceId = ''
  trainingConfig.modelName = ''
  trainingConfig.selectedPointIds = []
  trainingConfig.startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  trainingConfig.endTime = new Date()
  selectedModelType.value = 'transformer'
  isTraining.value = false
}

const loadDeviceModels = () => {
  predictionConfig.selectedModelIds = []
  // 自动加载时会触发availablePredictionModels更新
}

const togglePredictionModel = (modelId: string) => {
  const index = predictionConfig.selectedModelIds.indexOf(modelId)
  if (index > -1) {
    predictionConfig.selectedModelIds.splice(index, 1)
  } else {
    predictionConfig.selectedModelIds.push(modelId)
  }
}

const initHealthChart = () => {
  if (!healthChartRef.value) return
  
  // 销毁旧的图表实例
  if (healthChart) {
    healthChart.dispose()
  }
  
  // 创建新的图表实例
  healthChart = echarts.init(healthChartRef.value)
  
  // 设置图表配置
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#475569',
      textStyle: {
        color: '#e2e8f0'
      },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>健康评分: <b style="color:#10b981">${data.value}%</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: predictionResults.healthScores.map(item => item.time),
      axisLine: {
        lineStyle: {
          color: '#475569'
        }
      },
      axisLabel: {
        color: '#94a3b8'
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#475569'
        }
      },
      axisLabel: {
        color: '#94a3b8',
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(71, 85, 105, 0.3)'
        }
      }
    },
    series: [
      {
        name: '健康评分',
        type: 'line',
        data: predictionResults.healthScores.map(item => item.score),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#10b981'
        },
        itemStyle: {
          color: '#10b981'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
          ])
        },
        symbol: 'circle',
        symbolSize: 8,
        markLine: {
          silent: true,
          lineStyle: {
            color: '#ef4444',
            type: 'dashed'
          },
          data: [
            { yAxis: 70, name: '警戒线' }
          ]
        }
      }
    ]
  }
  
  healthChart.setOption(option)
}

const updateHealthChart = () => {
  if (healthChart && predictionResults.healthScores.length > 0) {
    const option = {
      xAxis: {
        data: predictionResults.healthScores.map(item => item.time)
      },
      series: [
        {
          data: predictionResults.healthScores.map(item => item.score)
        }
      ]
    }
    healthChart.setOption(option)
  }
}

const startPrediction = async () => {
  if (!predictionConfig.deviceId) {
    ElMessage.warning('请先选择设备')
    return
  }
  
  if (predictionConfig.selectedModelIds.length === 0) {
    ElMessage.warning('请至少选择一个模型进行预测')
    return
  }
  
  isPredicting.value = true
  showAllAlerts.value = false
  
  // 清空旧结果
  predictionResults.alerts = []
  predictionResults.healthScores = []
  predictionResults.reasons = []
  predictionResults.inspectionTasks = []
  
  // 获取选中的模型
  const selectedModels = trainedModels.value.filter(m => 
    predictionConfig.selectedModelIds.includes(m.id)
  )
  
  // 获取设备类型
  const device = deviceList.find(d => d.id === predictionConfig.deviceId)
  const deviceType = device?.type || 'flow_controller'
  
  // 生成模拟预警
  selectedModels.forEach(model => {
    // 为每个模型生成2-4条预警
    const alertCount = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < alertCount; i++) {
      const levels = ['critical', 'high', 'medium', 'low']
      const level = levels[Math.floor(Math.random() * levels.length)]
      const alertDesc = getDeviceAlertDescription(deviceType)
      
      predictionResults.alerts.push({
        id: `${model.id}_alert_${i}`,
        device: device?.name || predictionConfig.deviceId,
        model: model.type.toUpperCase(),
        description: alertDesc,
        score: 0.6 + Math.random() * 0.4,
        time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('zh-CN'),
        duration: `${Math.floor(Math.random() * 60)}分钟`,
        level
      })
    }
  })
  
  // 生成健康评分数据（24小时）
  predictionResults.healthScores = []
  for (let i = 0; i < 24; i++) {
    const baseScore = 80 + Math.random() * 15
    const trend = Math.sin(i * 0.3) * 5
    predictionResults.healthScores.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      score: Math.max(0, Math.min(100, baseScore + trend)),
      device: device?.name || predictionConfig.deviceId
    })
  }
  
  // 生成异常原因（基于设备类型）
  if (deviceReasons[deviceType as keyof typeof deviceReasons]) {
    const reasons = deviceReasons[deviceType as keyof typeof deviceReasons]
    selectedModels.forEach(model => {
      const reason = reasons[Math.floor(Math.random() * reasons.length)]
      predictionResults.reasons.push({
        id: `${model.id}_reason`,
        device: device?.name || predictionConfig.deviceId,
        model: model.type.toUpperCase(),
        description: reason.description,
        cause: reason.cause,
        impact: reason.impact
      })
    })
  }
  
  // 生成巡检任务
  predictionResults.inspectionTasks = [
    {
      id: 'task_1',
      device: device?.name || predictionConfig.deviceId,
      task: getInspectionTask(deviceType),
      priority: '高',
      time: '立即执行'
    },
    {
      id: 'task_2',
      device: device?.name || predictionConfig.deviceId,
      task: '检查所有传感器连接状态',
      priority: '中',
      time: '2小时内完成'
    }
  ]
  
  // 更新模型最后使用时间
  selectedModels.forEach(model => {
    model.lastUsed = new Date()
  })
  
  // 初始化或更新图表
  nextTick(() => {
    if (predictionOutput.healthScore && predictionResults.healthScores.length > 0) {
      initHealthChart()
    }
  })
  
  ElMessage.success(`开始使用 ${selectedModels.length} 个模型进行预测`)
}

const stopPrediction = () => {
  isPredicting.value = false
  ElMessage.info('预测已停止')
}

// PDF导出功能
const exportToPDF = async () => {
  if (predictionResults.alerts.length === 0) {
    ElMessage.warning('没有预测结果可以导出')
    return
  }
  
  try {
    // 创建PDF内容
    const deviceName = getDeviceName(predictionConfig.deviceId)
    const exportTime = new Date().toLocaleString('zh-CN')
    
    // 统计信息
    const criticalAlerts = predictionResults.alerts.filter(a => a.level === 'critical').length
    const highAlerts = predictionResults.alerts.filter(a => a.level === 'high').length
    const avgHealthScore = predictionResults.healthScores.reduce((sum, item) => sum + item.score, 0) / predictionResults.healthScores.length
    
    // 创建虚拟PDF内容
    const pdfContent = `
安庆石化 - 智能设备异常检测报告
==============================================

设备信息
--------
设备名称: ${deviceName}
预测时间: ${exportTime}
使用模型: ${predictionConfig.selectedModelIds.length}个
预测状态: ${isPredicting.value ? '运行中' : '已停止'}

统计摘要
--------
总预警数量: ${predictionResults.alerts.length}条
严重预警: ${criticalAlerts}条
高优先级预警: ${highAlerts}条
平均健康评分: ${avgHealthScore.toFixed(1)}%
异常原因分析: ${predictionResults.reasons.length}项
巡检任务: ${predictionResults.inspectionTasks.length}项

详细预警信息
-----------
${predictionResults.alerts.map((alert, index) => `
${index + 1}. [${alert.level.toUpperCase()}] ${alert.device}
   模型: ${alert.model}
   异常分数: ${alert.score.toFixed(3)}
   描述: ${alert.description}
   时间: ${alert.time}
   持续时间: ${alert.duration}
`).join('')}

异常原因分析
-----------
${predictionResults.reasons.map((reason, index) => `
${index + 1}. 设备: ${reason.device}
   模型: ${reason.model}
   影响程度: ${reason.impact}
   描述: ${reason.description}
   可能原因: ${reason.cause}
`).join('')}

巡检任务计划
-----------
${predictionResults.inspectionTasks.map((task, index) => `
${index + 1}. 设备: ${task.device}
   任务: ${task.task}
   优先级: ${task.priority}
   执行时间: ${task.time}
`).join('')}

健康评分趋势
-----------
时间范围: ${predictionResults.healthScores[0]?.time} - ${predictionResults.healthScores[predictionResults.healthScores.length - 1]?.time}
最高评分: ${Math.max(...predictionResults.healthScores.map(h => h.score)).toFixed(1)}%
最低评分: ${Math.min(...predictionResults.healthScores.map(h => h.score)).toFixed(1)}%

报告生成信息
-----------
生成时间: ${exportTime}
系统版本: 1.0
数据源: 安庆石化设备监控系统
    `.trim()
    
    // 创建虚拟文件下载
    const blob = new Blob([pdfContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `设备异常检测报告_${deviceName}_${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    ElMessage.success(`预测报告已导出为PDF文件`)
  } catch (error) {
    console.error('导出文本失败:', error)
    ElMessage.error('导出文本失败，请重试')
  }
}

const useModelForPrediction = (model: any) => {
  if (model.status !== 'ready') {
    ElMessage.warning('模型尚未就绪，无法使用')
    return
  }
  
  predictionConfig.deviceId = model.device
  predictionConfig.selectedModelIds = [model.id]
  activeModule.value = 'prediction'
  
  // 添加一个小的延迟确保DOM更新完成
  setTimeout(() => {
    ElMessage.success(`已选择模型: ${model.name}`)
  }, 100)
}

const retrainModel = (model: any) => {
  if (model.status === 'training') {
    ElMessage.warning('模型正在训练中，请稍后重试')
    return
  }
  
  ElMessageBox.confirm(
    `确定要重新训练模型 "${model.name}" 吗？`,
    '重新训练',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    model.status = 'training'
    model.accuracy = 0
    
    // 模拟重新训练过程
    setTimeout(() => {
      model.status = 'ready'
      model.accuracy = 95 + Math.random() * 5
      model.createdAt = new Date()
      ElMessage.success(`模型 ${model.name} 重新训练完成`)
    }, 3000)
  })
}

const exportModel = async (model: any) => {
  if (!model.filePath) {
    ElMessage.warning('该模型文件路径无效，无法导出')
    return
  }
  
  try {
    // 创建虚拟文件下载
    const content = JSON.stringify({
      model_name: model.name,
      device: model.device,
      device_name: model.deviceName,
      type: model.type,
      accuracy: model.accuracy,
      point_count: model.pointCount,
      created_at: model.createdAt.toISOString(),
      export_time: new Date().toISOString(),
      version: '1.0'
    }, null, 2)
    
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${model.name}_export.pth`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    ElMessage.success(`模型 ${model.name} 已导出到本地`)
  } catch (error) {
    ElMessage.error('导出失败: ' + error)
  }
}

const exportAllModels = async () => {
  try {
    // 为每个模型创建一个文件下载
    trainedModels.value.forEach((model, index) => {
      const exportData = {
        model_name: model.name,
        device: model.device,
        device_name: model.deviceName,
        type: model.type,
        accuracy: model.accuracy,
        point_count: model.pointCount,
        status: model.status,
        created_at: model.createdAt.toISOString(),
        last_used: model.lastUsed ? model.lastUsed.toISOString() : null,
        export_time: new Date().toISOString()
      }
      
      const content = JSON.stringify(exportData, null, 2)
      const blob = new Blob([content], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${model.name}_export.pth`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // 稍微延迟，避免浏览器限制同时下载数量
      setTimeout(() => {}, 100)
    })
    
    ElMessage.success(`成功导出 ${trainedModels.value.length} 个模型到本地`)
  } catch (error) {
    ElMessage.error('导出失败: ' + error)
  }
}

const deleteModel = (model: any) => {
  ElMessageBox.confirm(
    `确定要删除模型 "${model.name}" 吗？此操作不可恢复`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    const index = trainedModels.value.findIndex(m => m.id === model.id)
    if (index > -1) {
      trainedModels.value.splice(index, 1)
      // 从预测模型中移除
      const predIndex = predictionConfig.selectedModelIds.indexOf(model.id)
      if (predIndex > -1) {
        predictionConfig.selectedModelIds.splice(predIndex, 1)
      }
      ElMessage.success('模型删除成功')
    }
  })
}

const refreshModels = () => {
  ElMessage.info('模型列表已刷新')
}

const viewModelDetails = (model: any) => {
  ElMessageBox.alert(
    `<div class="space-y-3">
      <p><strong>模型名称:</strong> ${model.name}</p>
      <p><strong>设备:</strong> ${model.deviceName}</p>
      <p><strong>类型:</strong> ${model.type.toUpperCase()}</p>
      <p><strong>状态:</strong> ${model.status === 'ready' ? '就绪' : '训练中'}</p>
      <p><strong>准确率:</strong> ${model.accuracy}%</p>
      <p><strong>训练时间:</strong> ${formatTime(model.createdAt)}</p>
      <p><strong>点位数量:</strong> ${model.pointCount}个</p>
      <p><strong>最后使用:</strong> ${model.lastUsed ? formatTime(model.lastUsed) : '未使用'}</p>
      <p><strong>文件路径:</strong> ${model.filePath || '未保存'}</p>
    </div>`,
    '模型详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

const showAlertDetail = (alert: any) => {
  ElMessageBox.alert(
    `<div class="space-y-2">
      <p><strong>设备:</strong> ${alert.device}</p>
      <p><strong>模型:</strong> ${alert.model}</p>
      <p><strong>异常分数:</strong> ${alert.score.toFixed(3)}</p>
      <p><strong>级别:</strong> ${getAlertLevelText(alert.level)}</p>
      <p><strong>描述:</strong> ${alert.description}</p>
      <p><strong>持续时间:</strong> ${alert.duration}</p>
      <p><strong>检测时间:</strong> ${alert.time}</p>
    </div>`,
    '异常详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

// ========== 辅助方法 ==========
const getDeviceName = (deviceId: string) => {
  const device = deviceList.find(d => d.id === deviceId)
  return device?.name || deviceId
}

const getDeviceAlertDescription = (deviceType: string) => {
  const descriptions: Record<string, string[]> = {
    flow_controller: [
      '流量波动超出正常范围 (±5%)',
      '阀门响应时间超过设定阈值',
      '控制回路调节不稳定',
      '流量传感器读数异常'
    ],
    pump: [
      '振动频率异常增高',
      '电机电流不平衡',
      '泵体温度异常升高',
      '泵效率降低，能耗增加'
    ],
    valve: [
      '阀门位置反馈与指令存在较大偏差',
      '检测到阀门泄漏',
      '阀门响应时间延长',
      '接收到异常控制信号'
    ],
    reactor: [
      '反应器温度波动超出工艺要求',
      '反应效率降低，产品浓度异常',
      '检测到进料比例异常',
      '物料混合不均匀'
    ]
  }
  
  const deviceDescs = descriptions[deviceType] || descriptions.flow_controller
  return deviceDescs[Math.floor(Math.random() * deviceDescs.length)]
}

const getInspectionTask = (deviceType: string) => {
  const tasks: Record<string, string> = {
    flow_controller: '检查上游阀门和流量传感器状态',
    pump: '检查轴承润滑和密封件情况',
    valve: '检查阀门执行器和密封面',
    reactor: '检查反应温度和催化剂状态'
  }
  return tasks[deviceType] || '检查设备运行状态'
}

const getLossColor = (loss: number) => {
  if (loss > 1) return 'text-red-400'
  if (loss > 0.5) return 'text-yellow-400'
  if (loss > 0.1) return 'text-green-400'
  return 'text-cyan-400'
}

const getAlertBorderClass = (level: string) => {
  switch (level) {
    case 'critical': return 'border-red-500'
    case 'high': return 'border-orange-500'
    case 'medium': return 'border-yellow-500'
    default: return 'border-blue-500'
  }
}

const getAlertScoreColor = (score: number) => {
  if (score > 0.8) return 'text-red-400'
  if (score > 0.6) return 'text-orange-400'
  if (score > 0.4) return 'text-yellow-400'
  return 'text-blue-400'
}

const getAlertLevelType = (level: string) => {
  switch (level) {
    case 'critical': return 'danger'
    case 'high': return 'warning'
    case 'medium': return 'info'
    default: return ''
  }
}

const getAlertLevelText = (level: string) => {
  switch (level) {
    case 'critical': return '严重'
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return level
  }
}

const getImpactType = (impact: string) => {
  switch (impact) {
    case '高': return 'danger'
    case '中': return 'warning'
    default: return 'info'
  }
}

const getModelTypeColor = (type: string) => {
  switch (type) {
    case 'transformer': return 'success'
    case 'lstm': return 'warning'
    case 'gru': return 'info'
    default: return 'primary'
  }
}

const getLastUsedTime = (model: any) => {
  if (!model.lastUsed) return '未使用'
  const diff = Date.now() - model.lastUsed.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

const formatTime = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatNowTime = () => {
  return new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getModuleName = (module: string) => {
  switch (module) {
    case 'training': return '在线训练'
    case 'prediction': return '实时预测'
    case 'models': return '模型库'
    default: return module
  }
}

// 监听健康评分数据变化，更新图表
watch(() => predictionResults.healthScores, () => {
  if (predictionOutput.healthScore && predictionResults.healthScores.length > 0) {
    nextTick(() => {
      updateHealthChart()
    })
  }
}, { deep: true })

// 监听模块切换，修复图表bug
watch(activeModule, (newModule) => {
  if (newModule === 'prediction') {
    // 切换回预测模块时，如果存在健康评分数据，重新初始化图表
    nextTick(() => {
      if (predictionOutput.healthScore && predictionResults.healthScores.length > 0 && healthChartRef.value) {
        initHealthChart()
      }
    })
  }
})

// 监听healthScore选项变化
watch(() => predictionOutput.healthScore, (newValue) => {
  if (newValue && predictionResults.healthScores.length > 0) {
    nextTick(() => {
      initHealthChart()
    })
  } else if (healthChart) {
    healthChart.dispose()
    healthChart = null
  }
})

// 生命周期
onMounted(() => {
  console.log('系统初始化完成')
})

onUnmounted(() => {
  if (healthChart) {
    healthChart.dispose()
  }
})
</script>

<style scoped>
/* 模块切换动画 */
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

/* 淡入动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 导航按钮悬停效果 */
button:hover {
  transform: translateY(-1px);
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
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3);
}

/* 用于截断多行文本 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 渐变边框效果 */
.gradient-border {
  position: relative;
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

.gradient-border::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6);
  border-radius: inherit;
  z-index: -1;
}
</style>