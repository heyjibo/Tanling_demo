<template>
  <GlassCard title="a) 声纹监测系统" class="h-full">
    <template #action><el-tag size="small" effect="dark">监测中</el-tag></template>
    <div class="h-3/4 bg-slate-900/50 rounded flex items-center justify-center border border-slate-700 border-dashed">
<!--      <p class="text-slate-500">[ECharts] 声纹波形实时跳动图</p>-->
      <div class="grid grid-cols-4 grid-rows-4 gap-4 w-full px-4">
        <div class="bg-slate-800/50 rounded-lg p-2">
          <el-descriptions title="终端1" class="terminal-descriptions" :column="2" size="small">
            <el-descriptions-item :span="2">
              <el-tag type="success" size="small" effect="dark">
                在线
              </el-tag>
              <el-tag type="success" size="small" effect="dark">
                采集中
              </el-tag>
              <el-icon><Link /></el-icon>
              <div class="inline-block text-cyan-400">已注册</div>
              <el-tag class="bg-cyan-400" size="small" effect="dark">
                查看历史数据
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="终端ID:" :span="2">SWJC-NXP-ROA-01</el-descriptions-item>
            <el-descriptions-item label="部署方位:"></el-descriptions-item>
            <el-descriptions-item label="部署距离:"></el-descriptions-item>
            <el-descriptions-item label="部署视角:"></el-descriptions-item>
            <el-descriptions-item label="部署范围:"></el-descriptions-item>
          </el-descriptions>
<!--          <div class="h-20 w-full bg-slate-700 rounded-lg"></div>-->
        </div>
        <div class="bg-slate-800/50 rounded-lg p-2 col-span-3 row-span-4">
          <el-tabs class="demo-tabs">
            <el-tab-pane label="声纹特征" name="voiceprint-features">
              <div class="grid grid-cols-5 gap-4 w-full px-2">
                <div class="rounded-lg p-2 flex flex-col gap-2">
                  <div class="flex items-center justify-center rounded-lg bg-cyan-400 text-xs p-2">功率谱</div>
                  <div class="flex items-center justify-center rounded-lg bg-cyan-400 text-xs p-2">梅尔时频图</div>
                  <div class="flex items-center justify-center rounded-lg bg-cyan-400 text-xs p-2">时频图</div>
                  <div class="flex items-center justify-center rounded-lg bg-cyan-400 text-xs p-2">环境声识别</div>
                  <div class="flex items-center justify-center rounded-lg bg-cyan-400 text-xs p-2">环境声识别（前N项）</div>
                </div>
                <div class="rounded-lg p-2 col-span-4 grid grid-rows-3">
                  <div>1</div>
                  <div>2</div>
                  <div>3</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="bg-slate-800/50 rounded-lg">
          <img class="h-36 w-96 object-fill" src="../../assets//img//水泵.png">
        </div>
        <div class="bg-slate-800/50 rounded-lg row-span-2">
          <img class="h-60 w-96 object-fill" src="../../assets//img//声纹4.png">
        </div>
      </div>
    </div>
    <div class="mt-4 text-sm text-slate-300">
      <p>关联技术: 恩智浦(NXP) 边缘计算芯片</p>
      <p>当前精度: 99.2%</p>
    </div>
  </GlassCard>
</template>
<script setup lang="ts">
import GlassCard from '@/components/Common/GlassCard.vue';
import { ElTag, ElDescriptions, ElDescriptionsItem } from 'element-plus';
import {Link} from "@element-plus/icons-vue";
</script>
<style scoped>
.terminal-descriptions ::v-deep(.el-descriptions__title) {
  color: #94a3b8; /* slate-400 颜色 */
  /* 或者使用其他颜色 */
}

.terminal-descriptions ::v-deep(.el-descriptions) {
  background-color: transparent;
}

.terminal-descriptions ::v-deep(.el-descriptions__header) {
  background-color: transparent;
  border-bottom: none;
}

.terminal-descriptions ::v-deep(.el-descriptions__body) {
  background-color: transparent;
}

.terminal-descriptions ::v-deep(.el-descriptions-item) {
  background-color: transparent;
}

.terminal-descriptions ::v-deep(.el-descriptions__label) {
  color: #94a3b8; /* slate-400 颜色 */
  //font-size: 0.8rem;
}
</style>