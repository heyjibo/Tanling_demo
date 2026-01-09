<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "FlowingLine",
  props: {
    lineCount: {
      type: Number,
      default: 5, // 控制生成的线段数量
    },
    delay: {
      type: Number,
      default: 1, // 每条线段的动画延迟
    },
    position: {
      type: Object,
      default: () => ({
        top: 0,
        left: 0,
      }),
    },
    width: {
      type: Number,
      default: 600, // 管道宽度
    },
    height: {
      type: Number,
      default: 10, // 管道高度（厚度）
    },
    angle: {
      type: Number,
      default: 0, // 管道的旋转角度
    },
    lineWidth: {
      type: Number,
      default: 10, // 流动线段的宽度
    },
    speed: {
      type: Number,
      default: 10, // 流动速度，动画持续时间（秒）
    },
    color: {
      type: String,
      default: "rgba(237, 107, 74, 0.4)", // 默认半透明红色
    },
  },
})
</script>

<template>
  <div
      class="pipeline-container"
      :style="{
      top: `${position.top}%`,
      left: `${position.left}%`,
      width: `${width}%`,
      height: `${height}px`,
      transform: `rotate(${angle}deg)`
    }"
  >
    <div class="pipeline">
      <!-- 使用 v-for 动态生成多个流动线段 -->
      <div
          v-for="n in lineCount"
          :key="n"
          class="flowing-line"
          :style="{
          animationDelay: `${n * delay}s`,
          width: `${lineWidth}px`,
          animationDuration: `${speed}s`,
          backgroundColor: color
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
/* 管道容器 */
.pipeline-container {
  position: absolute;
  border-radius: 5px;
  overflow: hidden; /* 确保动画在线段内 */
  z-index: 10;
}

/* 管道背景 */
.pipeline {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 65, 65, 0); /* 管道背景色为透明 */
}

/* 流动的线段 */
.flowing-line {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 5px;
  animation: flow linear infinite; /* 动画循环设置 */
}

/* 定义动画 */
@keyframes flow {
  0% {
    left: -100px; /* 从管道左边开始 */
  }
  100% {
    left: 100%; /* 到达管道右边 */
  }
}
</style>