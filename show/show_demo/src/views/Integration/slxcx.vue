<template>
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
  <!-- 第一步：用 GlassCard 包裹核心内容，可自定义 title 属性 -->
  <GlassCard title="">

  <!-- 外层容器：确保占满父容器高度，使用 Tailwind 类 -->
  <div class="h-full min-h-[calc(100vh-100px)] w-full bg-white text-slate-800 font-sans selection:bg-blue-100 overflow-auto">
    
    <!-- ================= 视图 1: 项目总览 (Project Overview) ================= -->
    <div v-if="currentView === 'home'" class="p-8 max-w-[1600px] mx-auto animate-fade-in">
      <h1 class="text-4xl text-center font-normal mb-12 tracking-wide text-black">项目总览</h1>

      <!-- 新建栏 -->
      <div class="bg-blue-50/50 p-4 rounded mb-6 flex items-center gap-4 border border-blue-100 shadow-sm">
        <span class="font-bold text-blue-600 whitespace-nowrap">新建项目：</span>
        <el-input v-model="newProjectName" placeholder="请输入项目名称" class="w-80" />
        <div class="h-6 w-[1px] bg-gray-300 mx-2"></div>
        <span class="text-gray-600 whitespace-nowrap">防潮方式：</span>
        <el-radio-group v-model="dampProofMethod">
          <el-radio label="mastic_glass">玛蹄脂 + 玻璃布</el-radio>
          <el-radio label="mastic_roll">防潮卷材</el-radio>
        </el-radio-group>
        <el-button type="success" class="ml-4 !bg-[#67c23a] border-none hover:!bg-[#5daf34]">确认新建</el-button>
      </div>

      <!-- 搜索与入口 -->
      <div class="flex justify-between items-center mb-4">
        <el-input v-model="searchQuery" placeholder="搜索项目..." class="w-64" prefix-icon="Search" />
        <div class="flex gap-2">
          <el-button plain class="!bg-gray-50" @click="currentView = 'summary'">总报价表</el-button>
          <el-button plain class="!bg-gray-50" @click="currentView = 'pipeDB'">管外径数据库</el-button>
        </div>
      </div>

      <!-- 项目列表 -->
      <el-table :data="projectList" border class="shadow-sm custom-header-gray">
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column label="操作" width="500">
          <template #default="scope">
            <div class="flex gap-3">
              <el-button type="primary" size="small" class="!bg-[#00a0e9] border-none" @click="currentView = 'calculation'">报价算量</el-button>
              <el-button plain size="small" @click="currentView = 'summary'">总报价表</el-button>
              <el-button plain size="small" @click="currentView = 'materialDB'">价格数据库</el-button>
              <el-button plain size="small" @click="currentView = 'logic'">部分取数逻辑</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ================= 视图 2: 传统保冷算量报价 (Detailed Calculation) ================= -->
    <div v-else-if="currentView === 'calculation'" class="flex flex-col h-full min-h-screen bg-white">
      <!-- 顶部蓝色工具栏 -->
      <div class="px-6 py-3 bg-white border-b flex justify-between items-center shadow-sm z-10">
        <div class="flex gap-2 items-center">
          <el-button type="primary" class="!bg-[#00a0e9] border-none" @click="currentView = 'home'">新增</el-button>
          <div class="bg-gray-200 px-4 py-1.5 text-sm text-gray-600 rounded cursor-pointer hover:bg-gray-300 transition">上传文件</div>
        </div>
        <h2 class="text-3xl font-bold tracking-wider text-black">传统保冷算量报价</h2>
        <div class="flex gap-2">
          <el-button type="primary" class="!bg-[#00a0e9] border-none px-6" @click="currentView = 'home'">返回</el-button>
        </div>
      </div>
      
      <!-- 统计栏 -->
      <div class="bg-gray-50 px-4 py-2 flex justify-end items-center gap-3 text-sm border-b">
        <span class="text-gray-500 mr-4">总行数: 5</span>
        <el-button size="small">导出 Excel</el-button>
        <el-button type="danger" size="small" class="!bg-[#f56c6c] border-none">批量重算</el-button>
        <el-button size="small">刷新数据</el-button>
      </div>

      <!-- 核心复杂表格 -->
      <div class="flex-1 overflow-hidden p-2">
        <el-table 
          :data="calculationData" 
          border 
          height="100%" 
          style="width: 100%" 
          size="small"
          class="custom-table-blue-header"
        >
          <!-- 左侧固定操作列 -->
          <el-table-column fixed label="操作" width="110" align="center" class-name="bg-gray-50">
             <template #default>
               <div class="flex justify-center gap-1">
                 <el-button link type="primary" size="small" class="!text-blue-500 border border-blue-200 px-2">更新</el-button>
                 <el-button link type="danger" size="small" class="!text-red-500 border border-red-200 px-2">删除</el-button>
               </div>
             </template>
          </el-table-column>
          <el-table-column fixed prop="category" label="类别" width="60" align="center" />
          <el-table-column fixed prop="model" label="管径号" width="90" align="center" />
          <el-table-column fixed prop="count" label="数量" width="60" align="center" />
          <el-table-column fixed prop="structure" label="结构" width="150" align="center" show-overflow-tooltip />
          <el-table-column prop="outerDia" label="管外径" width="70" align="center" />
          <el-table-column prop="insulationDia" label="绝热外径" width="70" align="center" />

          <!-- 主绝热层 (多级表头) -->
          <el-table-column label="主绝热层" align="center">
            <el-table-column label="D1" align="center">
              <el-table-column label="材料" width="100" align="center" class-name="bg-yellow-50"><template #default="{row}">{{row.d1_mat}}</template></el-table-column>
              <el-table-column prop="d1_thick" label="厚度" width="50" align="center" />
              <el-table-column prop="d1_net" label="净量" width="50" align="center" />
              <el-table-column prop="d1_use" label="用量" width="50" align="center" />
            </el-table-column>
            <el-table-column label="D2" align="center">
              <el-table-column label="材料" width="100" align="center" class-name="bg-yellow-50"><template #default="{row}">{{row.d2_mat}}</template></el-table-column>
              <el-table-column prop="d2_thick" label="厚度" width="50" align="center" />
              <el-table-column prop="d2_net" label="净量" width="50" align="center" />
              <el-table-column prop="d2_use" label="用量" width="50" align="center" />
            </el-table-column>
            <el-table-column label="D3" align="center">
              <el-table-column label="材料" width="100" align="center" class-name="bg-yellow-50"><template #default="{row}">{{row.d3_mat}}</template></el-table-column>
              <el-table-column prop="d3_thick" label="厚度" width="50" align="center" />
              <el-table-column prop="d3_net" label="净量" width="50" align="center" />
              <el-table-column prop="d3_use" label="用量" width="50" align="center" />
            </el-table-column>
             <el-table-column label="D4" align="center">
              <el-table-column label="材料" width="100" align="center" class-name="bg-yellow-50"><template #default="{row}">{{row.d4_mat}}</template></el-table-column>
              <el-table-column prop="d4_thick" label="厚度" width="50" align="center" />
              <el-table-column prop="d4_net" label="净量" width="50" align="center" />
              <el-table-column prop="d4_use" label="用量" width="50" align="center" />
            </el-table-column>
          </el-table-column>

          <!-- 密封胶 -->
          <el-table-column label="密封胶" align="center">
            <el-table-column prop="sealant_name" label="密封胶" width="100" align="center" class-name="bg-yellow-50" />
            <el-table-column prop="sealant_net" label="净量" width="50" align="center" />
            <el-table-column prop="sealant_use" label="用量" width="50" align="center" />
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ================= 视图 3: 成本汇总模板 (Cost Summary) ================= -->
    <div v-else-if="currentView === 'summary'" class="p-6 bg-white min-h-screen">
      <div class="mb-6 flex items-center relative">
         <el-button type="primary" class="!bg-[#00a0e9] border-none absolute left-0" @click="currentView = 'home'">返回</el-button>
         <h1 class="text-4xl w-full text-center">成本汇总模板</h1>
      </div>
      
      <div class="bg-gray-100 p-2 border flex justify-between items-center mb-0 rounded-t-lg">
         <span class="text-sm text-gray-600 pl-2 font-bold">材料成本分析表 (ID: 92)</span>
         <div class="flex gap-2">
            <el-button type="primary" size="small" class="!bg-[#00a0e9] border-none">刷新数据</el-button>
            <el-button type="success" size="small" class="!bg-[#67c23a] border-none">导出 Excel</el-button>
         </div>
      </div>

      <el-table 
        :data="summaryData" 
        border 
        style="width: 100%"
        :row-class-name="summaryRowClassName"
        header-cell-class-name="bg-gray-200 text-black font-bold text-center text-xs border-gray-300"
      >
        <el-table-column prop="name" label="材料名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="factor" label="放量系数" width="80" align="center" />
        <el-table-column prop="costPrice" label="成本单价" width="90" align="right" />
        <el-table-column prop="quotePrice" label="报价单价" width="90" align="right" />
        
        <el-table-column label="管道 (净)" prop="pipeNet" width="80" align="right" />
        <el-table-column label="弯头 (净)" prop="elbowNet" width="80" align="right" />
        <el-table-column label="三通 (净)" prop="teeNet" width="80" align="right" />
        <el-table-column label="变径管 (净)" prop="reducerNet" width="80" align="right" />
        <el-table-column label="管帽 (净)" prop="capNet" width="80" align="right" />
        <el-table-column label="阀门 (净)" prop="valveNet" width="80" align="right" />
        <el-table-column label="法兰 (净)" prop="flangeNet" width="80" align="right" />

        <el-table-column prop="totalNet" label="合计净量" width="100" align="right" class-name="font-bold bg-slate-50" />
        <el-table-column prop="totalUse" label="合计使用量 (SYL)" width="110" align="right" class-name="font-bold bg-slate-50" />
        <el-table-column prop="totalNetAmount" label="净量总额" width="110" align="right" class-name="text-red-500 font-bold" />
        <el-table-column prop="totalUseAmount" label="使用量总额" width="110" align="right" class-name="text-red-500 font-bold" />
      </el-table>
    </div>

    <!-- ================= 视图 4: 部分取数逻辑 (Logic) ================= -->
    <div v-else-if="currentView === 'logic'" class="p-8 bg-white min-h-screen">
       <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
             <el-button type="primary" class="!bg-[#00a0e9] border-none" @click="currentView = 'home'">返回</el-button>
          </div>
          <h1 class="text-4xl text-center flex-1">部分数据取数逻辑</h1>
          <div class="w-[80px]"></div> <!-- Spacer -->
       </div>

       <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-slate-800">部分取数逻辑 - 项目ID: 92</h2>
          <el-button plain size="small" class="!text-blue-500 !border-blue-300">刷新数据</el-button>
       </div>

       <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 1. 钢带/钢扣 -->
          <div class="border rounded-lg shadow-sm overflow-hidden">
             <el-table :data="logicData1" stripe border header-cell-class-name="bg-[#dae8fc] text-slate-800 font-bold">
                <el-table-column prop="name" label="名称" align="center" />
                <el-table-column prop="condition" label="绝热外径" align="center" />
                <el-table-column prop="value" label="取值设置" align="center" />
                <el-table-column label="操作" align="center" width="80">
                   <template #default><el-button link type="primary" class="!border border-blue-400 !px-2">修改</el-button></template>
                </el-table-column>
             </el-table>
          </div>
          <!-- 2. 密封胶 -->
          <div class="border rounded-lg shadow-sm overflow-hidden">
             <el-table :data="logicData2" stripe border header-cell-class-name="bg-[#dae8fc] text-slate-800 font-bold">
                <el-table-column prop="name" label="名称" align="center" />
                <el-table-column prop="value" label="取值设置" align="center" />
                <el-table-column label="操作" align="center" width="80">
                   <template #default><el-button link type="primary" class="!border border-blue-400 !px-2">修改</el-button></template>
                </el-table-column>
             </el-table>
          </div>
          <!-- 3. 管件 -->
          <div class="border rounded-lg shadow-sm overflow-hidden">
             <el-table :data="logicData3" stripe border header-cell-class-name="bg-[#dae8fc] text-slate-800 font-bold">
                <el-table-column prop="name" label="名称" align="center" width="70" />
                <el-table-column prop="size" label="管径" align="center" width="60" />
                <el-table-column prop="value" label="取值设置" align="center" />
                <el-table-column label="操作" align="center" width="80">
                   <template #default><el-button link type="primary" class="!border border-blue-400 !px-2">修改</el-button></template>
                </el-table-column>
             </el-table>
          </div>
       </div>
    </div>

    <!-- ================= 视图 5: 材料价格数据库 (Material DB) ================= -->
    <div v-else-if="currentView === 'materialDB'" class="p-4 bg-white min-h-screen">
       <div class="flex justify-between items-center mb-6 bg-white sticky top-0 z-20 pb-2 border-b">
          <div class="flex gap-2">
            <el-button type="primary" class="!bg-[#00a0e9] border-none">新增</el-button>
          </div>
          <h1 class="text-3xl text-center font-bold tracking-tight">(冷热) 材料价格及放量系数数据库</h1>
          <el-button type="primary" class="!bg-[#00a0e9] border-none" @click="currentView = 'home'">返回</el-button>
       </div>

       <el-table :data="materialDB" border stripe header-cell-class-name="bg-[#b0c4de] text-black text-center font-bold border-gray-400">
          <el-table-column prop="id" label="序号" width="60" align="center" />
          <el-table-column prop="type" label="分类" width="60" align="center" />
          <el-table-column prop="category" label="类别" width="100" align="center" />
          <el-table-column prop="name" label="材料名称及规格" min-width="200" align="center" />
          <el-table-column prop="unit" label="单位" width="60" align="center" />
          <el-table-column prop="factor" label="放量系数" width="80" align="center" />
          <el-table-column prop="costPrice" label="成本单价" width="100" align="center" />
          <el-table-column prop="currentCost" label="本次成本单价" width="120" align="center" />
          <el-table-column prop="remarks" label="备注" min-width="150" align="center" />
          <el-table-column label="操作" width="80" align="center">
             <template #default><span class="text-red-500 cursor-pointer font-bold">删除</span></template>
          </el-table-column>
       </el-table>
    </div>

    <!-- ================= 视图 6: 管径数据库 (Pipe DB) ================= -->
    <div v-else-if="currentView === 'pipeDB'" class="p-4 bg-white flex flex-col items-center min-h-screen">
       <div class="w-full flex justify-between mb-4 px-10">
          <el-button type="primary" class="!bg-[#00a0e9] border-none" @click="currentView = 'home'">返回</el-button>
       </div>
       <h1 class="text-4xl mb-8 font-normal text-black">管径 管外径数据库</h1>
       
       <div class="w-[800px] border shadow-lg rounded overflow-hidden">
          <el-table :data="pipeDB" border stripe header-cell-class-name="bg-[#a5c7d8] text-black font-bold text-lg border-gray-400">
             <el-table-column label="操作" width="100" align="center">
                <template #default><span class="text-green-700 font-bold cursor-pointer text-lg">更新</span></template>
             </el-table-column>
             <el-table-column prop="id" label="序号" width="100" align="center" />
             <el-table-column prop="imperial" label='英制管径 (")' width="200" align="center" />
             <el-table-column prop="dn" label="公称直径" width="200" align="center" />
             <el-table-column prop="outer" label="管外径" width="200" align="center" />
          </el-table>
       </div>
    </div>

  </div>
  </GlassCard> <!-- 闭合 GlassCard 组件 -->
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Search } from '@element-plus/icons-vue';
// 第二步：导入 GlassCard 组件（路径与你的项目保持一致）
import GlassCard from '@/components/Common/GlassCard.vue';

/**
 * 状态管理
 * currentView: 控制当前显示的页面 (home | calculation | summary | logic | materialDB | pipeDB)
 */
const currentView = ref('home');

// ================= 数据源模拟 =================

// 1. 项目列表
const newProjectName = ref('');
const dampProofMethod = ref('mastic_glass');
const searchQuery = ref('');
const projectList = ref([
  { name: '1233333333' },
  { name: 'CS1219' },
  { name: 'Project_Alpha_Rev01' },
]);

// 2. 算量报价 (复杂表格数据)
const calculationData = ref([
  { 
    category: '管道', model: 'DN20', count: 100, structure: 'PIR-PIR管壳50', outerDia: 26.7, insulationDia: 126.7,
    d1_mat: 'PIR-PIR管壳', d1_thick: 50, d1_net: 1.27, d1_use: 1.31,
    d2_mat: '', d2_thick: '', d2_net: '', d2_use: '',
    d3_mat: '', d3_thick: '', d3_net: '', d3_use: '', d4_mat: '',
    sealant_name: '密封胶-STI9550', sealant_net: 13.5, sealant_use: 14.2
  },
  { 
    category: '管道', model: 'DN25', count: 100, structure: 'PIR-PIR管壳50/PIR-PIR管壳60', outerDia: 33.4, insulationDia: 253.4,
    d1_mat: 'PIR-PIR管壳', d1_thick: 50, d1_net: 1.38, d1_use: 1.42,
    d2_mat: 'PIR-PIR管壳', d2_thick: 60, d2_net: 3.8, d2_use: 3.92,
    d3_mat: '', d3_thick: '', d3_net: '', d3_use: '', d4_mat: '',
    sealant_name: '密封胶-STI9550', sealant_net: 39.5, sealant_use: 41.2
  },
  { 
    category: '管道', model: 'DN40', count: 100, structure: '30PIR-PIR管壳/40PIR-PIR管壳50', outerDia: 48.3, insulationDia: 288.3,
    d1_mat: 'PIR-PIR管壳', d1_thick: 30, d1_net: 0.77, d1_use: 0.8,
    d2_mat: 'PIR-PIR管壳', d2_thick: 40, d2_net: 1.94, d2_use: 2,
    d3_mat: 'PIR-PIR管壳', d3_thick: 50, d3_net: 3.89, d3_use: 4.01, d4_mat: '',
    sealant_name: '密封胶-STI9550', sealant_net: 61.4, sealant_use: 64.5
  },
  { 
    category: '管道', model: 'DN50', count: 100, structure: '30PIR-PIR管壳/50PIR-PIR管壳50', outerDia: 60.3, insulationDia: 320.3,
    d1_mat: 'PIR-PIR管壳', d1_thick: 30, d1_net: 0.89, d1_use: 0.92,
    d2_mat: 'PIR-PIR管壳', d2_thick: 50, d2_net: 2.79, d2_use: 2.87,
    d3_mat: 'PIR-PIR管壳', d3_thick: 50, d3_net: 4.41, d3_use: 4.55, d4_mat: '',
    sealant_name: '密封胶-STI9550', sealant_net: 75.6, sealant_use: 79.4
  },
  { 
    category: '管道', model: 'DN80', count: 100, structure: '40PIR-PIR管壳/50PIR-PIR管壳50', outerDia: 89, insulationDia: 369,
    d1_mat: 'PIR-PIR管壳', d1_thick: 40, d1_net: 1.69, d1_use: 1.74,
    d2_mat: 'PIR-PIR管壳', d2_thick: 50, d2_net: 3.58, d2_use: 3.69,
    d3_mat: 'PIR-PIR管壳', d3_thick: 50, d3_net: 5.2, d3_use: 5.36, d4_mat: '',
    sealant_name: '密封胶-STI9550', sealant_net: 92.2, sealant_use: 96.8
  },
  // ... 更多数据行模拟
]);

// 3. 成本汇总数据
const summaryData = ref([
  { name: 'PIR-PIR管壳', unit: 'm³', factor: 1.03, costPrice: 1800.00, quotePrice: 2194.17, pipeNet: 3053.85, totalNet: 3145.62, totalUse: 5496930.00, totalNetAmount: 5662116.00, totalUseAmount: 84.75 },
  { name: 'PIR-PIR整体弯头', unit: 'm³', factor: 1.03, costPrice: 3500.00, quotePrice: '', pipeNet: 669.18, totalNet: 689.28, totalUse: 2342130.00, totalNetAmount: 2412480.00, totalUseAmount: '' },
  { name: '钢板-镀铝锌板0.8', unit: 'm²', factor: 1.20, costPrice: 106.76, quotePrice: 8060.76, pipeNet: 8475.57, totalNet: 10170.63, totalUse: 904851.85, totalNetAmount: 1085816.46, totalUseAmount: '' },
  { name: '弹性玻璃棉-弹性板', unit: 'm³', factor: 1.03, costPrice: 252.00, quotePrice: '', pipeNet: '', totalNet: 84.75, totalUse: 21357.00, totalNetAmount: '', totalUseAmount: '' },
]);
// 汇总行样式
const summaryRowClassName = ({ row }: { row: any }) => {
  if (row.name === '总计') return 'bg-yellow-100 font-bold';
  return '';
};

// 4. 部分取数逻辑数据
const logicData1 = ref([
   { name: '钢带', condition: '≤1000', value: '钢带-304/12*0.5' },
   { name: '钢带', condition: '>1000', value: '钢带-304/19*0.5' },
   { name: '钢扣', condition: '≤1000', value: '不锈钢扣-304/L12' },
   { name: '钢扣', condition: '>1000', value: '不锈钢扣-304/L19' },
   { name: '钢板', condition: '≤1000', value: '钢板-镀铝锌/0.8' },
]);
const logicData2 = ref([
   { name: '密封胶', value: '密封胶-STI9550' },
   { name: '金属密封胶', value: '金属密封胶-国产中性硅酮胶' },
   { name: '管道粘接剂', value: '管道粘接剂-STI8184' },
   { name: '粘接剂', value: '粘接剂-STI8184' },
]);
const logicData3 = ref([
   { name: '阀门', size: '-', value: '-' },
   { name: '法兰', size: '-', value: '-' },
   { name: '设备', size: '-', value: '-' },
   { name: '管道', size: '-', value: '-' },
]);

// 5. 材料数据库数据
const materialDB = ref([
  { id: 1, type: '冷', category: '结构材料', name: 'PIR-PIR管壳', unit: 'm³', factor: 1.03, costPrice: 1800, currentCost: 1800, remarks: '760 (一防报价)' },
  { id: 2, type: '冷', category: '结构材料', name: 'PIR-PIR整体弯头', unit: 'm³', factor: 1.03, costPrice: 3500, currentCost: 3500, remarks: '760' },
  { id: 3, type: '冷', category: '结构材料', name: 'PIR-PIR虾米弯头', unit: 'm³', factor: 1.03, costPrice: 3000, currentCost: 3000, remarks: '760' },
  { id: 4, type: '冷', category: '结构材料', name: 'PIR-PIR弧板', unit: 'm³', factor: 1.03, costPrice: 1600, currentCost: 1600, remarks: '760' },
  { id: 6, type: '冷+热', category: '结构材料', name: 'PIR-PIR发泡料', unit: 'kg', factor: 1.03, costPrice: 17.46, currentCost: 17.46, remarks: 'p55-60' },
  { id: 7, type: '冷+热', category: '结构材料', name: '聚氨酯-组合黑白料', unit: 'kg', factor: 1.03, costPrice: 18.5, currentCost: 18.5, remarks: '' },
]);

// 6. 管径数据库数据
const pipeDB = ref([
  { id: 1, imperial: '1/8"', dn: 'DN6', outer: 10.3 },
  { id: 2, imperial: '1/4"', dn: 'DN8', outer: 13.7 },
  { id: 3, imperial: '3/8"', dn: 'DN10', outer: 17.1 },
  { id: 4, imperial: '1/2"', dn: 'DN15', outer: 21.3 },
  { id: 5, imperial: '3/4"', dn: 'DN20', outer: 26.7 },
  { id: 6, imperial: '1"', dn: 'DN25', outer: 33.4 },
  { id: 7, imperial: '1.25"', dn: 'DN32', outer: 42 },
  { id: 8, imperial: '1.5"', dn: 'DN40', outer: 48.3 },
  { id: 9, imperial: '2"', dn: 'DN50', outer: 60.3 },
  { id: 10, imperial: '2.5"', dn: 'DN65', outer: 76 },
  { id: 11, imperial: '3"', dn: 'DN80', outer: 89 },
]);
</script>

<style scoped>
/* 样式补充：自定义表格头部颜色 */
:deep(.custom-header-gray th) {
  background-color: #f3f4f6 !important; /* bg-gray-50 */
  color: #374151 !important; /* text-gray-700 */
  font-weight: 500;
}

:deep(.custom-table-blue-header th) {
  background-color: #00a0e9 !important;
  color: white !important;
  border-color: #e5e7eb;
  font-weight: 600;
  text-align: center;
}

/* 隐藏横向滚动条但保留功能 (可选) */
/* ::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
} */
</style>