import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('@/views/Dashboard/index.vue') },
      { path: 'sound', component: () => import('@/views/Sound/index.vue') },
      { path: 'light', component: () => import('@/views/Light/index.vue') },
      { path: 'compute', component: () => import('@/views/Compute/index.vue') },
      { path: 'integration', component: () => import('@/views/Integration/index.vue') },
      { path: 'sound/Ultrasonic', component: () => import('@/views/Sound/Ultrasonic.vue') },
      { path: 'sound/VoicePrint', component: () => import('@/views/Sound/VoicePrint.vue') },
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router