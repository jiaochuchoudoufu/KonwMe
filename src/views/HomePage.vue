<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h1>LifeLog AI</h1>
      <p>你的智能生活记录助手</p>
    </div>
    <!--AI 智能建议卡片-->
    <AISuggestion />

    <!-- 两列布局（PC端） -->
    <div class="dashboard-grid">
      <!-- 左侧列 -->
      <div class="left-column">
        <WeatherCard />
        <TodoCard />
      </div>

      <!-- 右侧列 -->
      <div class="right-column">
        <AICard />
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
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 32px;
  text-align: center;
}

.welcome-section h1 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.welcome-section p {
  font-size: 16px;
  color: #868e96;
}

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

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>