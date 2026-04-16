<template>
  <div class="app">
    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-menu router>
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/ledger">记账本</el-menu-item>
          <el-menu-item index="/journal">日记</el-menu-item>
          <el-menu-item index="/memo">备忘录</el-menu-item>
          <!-- <el-menu-item index="/weather">天气</el-menu-item> -->
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>

    <!--AI 悬浮窗-->
    <AiFloatButton />
  </div>
</template>

<script setup lang="ts">
import AiFloatButton from './components/AiFloatButton.vue'
</script>

<style scoped>
.app {
  height: 100vh;
}
.sidebar {
  background: #f5f5f5;
  border-right: 1px solid #e0e0e0;
}
</style>