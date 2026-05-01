<template>
  <div class="home-page">
    <!-- 欢迎区域 - 低调融入 -->
    <div class="welcome-section">
      <h1>LifeLog AI</h1>
      <p>你的智能生活记录助手</p>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <AISuggestion />

      <div class="dashboard-grid">
        <div class="left-column">
          <WeatherCard />
          <TodoCard />
        </div>
        <div class="right-column">
          <AICard />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AISuggestion from '@/components/AISuggestion.vue';
import WeatherCard from '../components/WeatherCard.vue';
import TodoCard from '../components/TodoCard.vue';
import AICard from '../components/AICard.vue';
</script>

<style scoped>
.home-page {
  background: #f5f7fa;
  min-height: 100vh;
}

/* 欢迎区域 - 低调融入页面背景 */
.welcome-section {
  background: transparent;
  padding: 32px 24px 20px;
  margin-bottom: 8px;
  text-align: center;
}

.welcome-section h1 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.welcome-section p {
  font-size: 13px;
  color: #adb5bd;
  letter-spacing: 0.5px;
}

/* 内容区域 */
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 两列布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home-page {
    background: #f5f7fa;
  }
  
  .welcome-section {
    padding: 24px 16px 16px;
  }
  
  .welcome-section h1 {
    font-size: 20px;
  }
  
  .content-wrapper {
    padding: 0 16px;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>