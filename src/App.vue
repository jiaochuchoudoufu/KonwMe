<template>
  <div class="app">
    <!-- PC端：侧边栏模式 -->
    <el-container v-if="!isMobile" class="pc-layout">
      <el-aside :width="sidebarWidth" class="sidebar">
        <el-menu 
          router 
          :collapse="isCollapse" 
          :collapse-transition="false"
          :default-active="$route.path"
        >
        <el-menu-item index="/">
    <el-icon><HomeFilled /></el-icon>
    <span class="menu-label">首页</span>
  </el-menu-item>
  <el-menu-item index="/ledger">
    <el-icon><Money /></el-icon>
    <span class="menu-label">记账本</span>
  </el-menu-item>
  <el-menu-item index="/journal">
    <el-icon><EditPen /></el-icon>
    <span class="menu-label">日记</span>
  </el-menu-item>
  <el-menu-item index="/memo">
    <el-icon><Check /></el-icon>
    <span class="menu-label">备忘录</span>
  </el-menu-item>
  <el-menu-item index="/data-manager">
    <el-icon><DataAnalysis /></el-icon>
    <span class="menu-label">数据管理</span>
  </el-menu-item>
        </el-menu>
        
        <!-- 折叠/展开按钮 -->
        <div class="collapse-btn" @click="toggleCollapse">
          {{ isCollapse ? '→' : '←' }}
        </div>
      </el-aside>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>

    <!-- 移动端：底边栏模式 -->
    <div v-else class="mobile-layout">
      <div class="mobile-content">
        <router-view />
      </div>
      
      <div class="bottom-nav">
        <div 
    v-for="item in navItems" 
    :key="item.path"
    class="nav-item"
    :class="{ active: $route.path === item.path }"
    @click="navigateTo(item.path)"
  >
    <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
    <span class="nav-label">{{ item.label }}</span>
  </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Money, EditPen, Check, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式断点
const isMobile = ref(window.innerWidth < 768)
const isCollapse = ref(false)

// 侧边栏宽度
const sidebarWidth = computed(() => isCollapse.value ? '64px' : '200px')

// 底部导航栏配置
const navItems = [
  { path: '/', label: '首页', icon: HomeFilled },
  { path: '/ledger', label: '记账', icon: Money },
  { path: '/journal', label: '日记', icon: EditPen },
  { path: '/memo', label: '备忘', icon: Check },
  { path: '/data-manager', label: '数据', icon: DataAnalysis }
]

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app {
  height: 100vh;
  overflow: hidden;
}

/* ========== PC端样式 ========== */
.pc-layout {
  height: 100%;
}

.sidebar {
  background: linear-gradient(180deg, #f5f7fa 0%, #e9ecef 100%);
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.el-menu {
  border-right: none;
  flex: 1;
  background: transparent;
  margin-top: 20px;
}

.el-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 50px;
  line-height: 50px;
}

.menu-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.menu-label {
  font-size: 14px;
  white-space: nowrap;
}

/* 折叠状态下的样式 */
.el-menu--collapse .menu-label {
  display: none;
}

.el-menu--collapse .menu-icon {
  font-size: 24px;
  width: 100%;
}

.collapse-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.collapse-btn:hover {
  background: #f0f0f0;
  transform: translateX(-50%) scale(1.05);
}

/* ========== 移动端样式 ========== */
.mobile-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px 0;
  color: #666;
}

.nav-item.active {
  color: #409eff;
}

.nav-icon {
  font-size: 24px;
}

.nav-label {
  font-size: 12px;
}

/* 响应式 */
@media (min-width: 768px) and (max-width: 1024px) {
  .sidebar {
    width: 180px !important;
  }
}

@media (max-width: 768px) {
  .pc-layout {
    display: none;
  }
}

/* 全局移动端适配 */
* {
  -webkit-tap-highlight-color: transparent; /* 移除移动端点击灰色背景 */
}

/* 增大按钮点击区域 */
button,
.el-button,
.nav-item,
.menu-item {
  touch-action: manipulation; /* 优化触摸响应 */
}

/* 移动端字体调整 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
  
  /* 增大表单元素点击区域 */
  input,
  select,
  textarea,
  .el-input__inner,
  .el-textarea__inner {
    font-size: 16px !important; /* 防止 iOS 缩放 */
  }
}

/* 全局样式 */
:root {
  --primary-color: #f59f00;
  --primary-light: #fff3e0;
  --primary-dark: #e67700;
  --success-color: #67c23a;
  --danger-color: #f56c6c;
  --text-primary: #2c3e50;
  --text-secondary: #868e96;
  --bg-gray: #f8f9fa;
  --border-radius: 16px;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}

* {
  box-sizing: border-box;
}

body {
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 统一卡片样式 */
.card-common {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.card-common:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 统一按钮样式 */
.el-button--primary {
  background: linear-gradient(135deg, #f59f00, #f76707);
  border: none;
  border-radius: 24px;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 159, 0, 0.3);
}

.el-button--primary:active {
  transform: translateY(0);
}

/* App.vue 侧边栏样式优化 */
.sidebar {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-right: none;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
}

.el-menu-item {
  border-radius: 12px;
  margin: 8px 12px;
  transition: all 0.2s ease;
}

.el-menu-item:hover {
  background: var(--primary-light) !important;
  color: var(--primary-color) !important;
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, var(--primary-light), #ffe8cc) !important;
  color: var(--primary-dark) !important;
  font-weight: 500;
}
</style>