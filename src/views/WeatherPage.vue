<template>
    <div class="weather-page">
        <h1>🌤️ 天气助手</h1>

        <!-- 加载状态 -->
        <div v-if="store.loading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>获取天气信息中...</span>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="store.error" class="error-state">
            <p>{{ store.error }}</p>
            <el-button @click="store.fetchWeather">重试</el-button>
        </div>
        
        <!-- 天气卡片 -->
        <div v-else-if="store.weather" class="weather-card">
            <div class="weather-header">
                <div class="city">{{ store.weather.city }}</div>
                <div class="update-time">
                    更新于 {{ store.weather.updateTime?.slice(5, 16) || '刚刚' }}
                </div>
            </div>

            <div class="weather-main">
                <div class="weather-icon">{{ getWeatherIcon(store.weather.text) }}</div>
                <div class="weather-temp">{{ store.weather.temp }}°C</div>
                <div class="weather-text">{{ store.weather.text }}</div>
            </div>

            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-label">💧 湿度</span>
                    <span class="detail-value">{{ store.weather.humidity }}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">🌬️ 风速</span>
                    <span class="detail-value">{{ store.weather.windSpeed }} km/h</span>
                </div>
            </div>
        </div>

        <!-- AI 分析卡片（自动加载，高亮显示） -->
        <div v-if="analysisResult" class="analysis-card">
            <div class="analysis-header">
                <span class="analysis-icon">🤖</span>
                <span class="analysis-title">AI 天气分析</span>
                <span class="analysis-badge">智能推荐</span>
            </div>
            <div class="analysis-content">{{ analysisResult }}</div>
        </div>
        <div v-else-if="analysisLoading" class="analysis-card loading-card">
            <div class="analysis-header">
                <span class="analysis-icon">🤖</span>
                <span class="analysis-title">AI 正在分析中...</span>
            </div>
            <div class="analysis-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>生成个性化建议中...</span>
            </div>
        </div>

        <!-- 今日建议卡片 -->
        <div v-if="store.weather" class="suggestion-card">
            <div class="suggestion-header">
                <span class="suggestion-icon">💡</span>
                <span class="suggestion-title">今日建议</span>
            </div>
            <div class="suggestion-content">{{ getSuggestion() }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { useWeatherStore } from '@/stores/weather';
import { analyzeWeatherImpact } from '@/services/ai';

const store = useWeatherStore()
const analysisLoading = ref(false)
const analysisResult = ref('')

//获取天气图标
const getWeatherIcon = (text: string) => {
  const iconMap: Record<string, string> = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '雨': '🌧️',
    '雪': '❄️',
    '雾': '🌫️',
    '雷': '⚡'
  }
  for (const [key, icon] of Object.entries(iconMap)) {
    if (text.includes(key)) return icon
  }
  return '🌤️'
}

//获取今日建议
const getSuggestion = () => {
    if (!store.weather) return ''

    const temp = store.weather.temp
    const text = store.weather.text

    if (text.includes('雨')) {
    return '🌂 今天有雨，出门记得带伞，注意交通安全。'
  }
  if (temp > 30) {
    return '🥵 天气炎热，注意防暑降温，多喝水。'
  }
  if (temp < 10) {
    return '🧣 天气寒冷，注意保暖，多穿衣服。'
  }
  if (text.includes('雪')) {
    return '⛄ 下雪天路滑，出门小心慢行。'
  }
  return '🌿 天气不错，适合出门走走，保持好心情~'
}

//自动获取AI 分析
const fetchAIAnalysis  = async () => {
    if (!store.weather) return

    analysisLoading.value = true
    analysisResult.value = ''

    try {
    const result = await analyzeWeatherImpact(store.weather)
    analysisResult.value = result
  } catch (error) {
    analysisResult.value = '分析失败，请稍后再试'
  } finally {
    analysisLoading.value = false
  }
}

// 监听天气数据变化， 自动触发 AI 分析
watch(() => store.weather, (newWeather) => {
    if(newWeather) {
        fetchAIAnalysis()
    }
}, { immediate: true})

onMounted(() => {
  store.initWeather()
})
</script>

<style scoped>
.weather-page {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
  color: #868e96;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* 天气卡片 */
.weather-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 24px;
  color: white;
  margin-bottom: 20px;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.city {
  font-size: 20px;
  font-weight: 600;
}

.update-time {
  font-size: 12px;
  opacity: 0.8;
}

.weather-main {
  text-align: center;
  margin-bottom: 20px;
}

.weather-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.weather-temp {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 8px;
}

.weather-text {
  font-size: 18px;
  opacity: 0.9;
}

.weather-details {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
}

.detail-item {
  text-align: center;
}

.detail-label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
}

/* AI 分析卡片（高亮渐变背景） */
.analysis-card {
  background: linear-gradient(135deg, #ffe8cc 0%, #fff3e0 100%);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  border-left: 4px solid #f59f00;
  box-shadow: 0 4px 12px rgba(245, 159, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 159, 0, 0.2);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.analysis-icon {
  font-size: 24px;
}

.analysis-title {
  font-size: 16px;
  font-weight: 600;
  color: #e67700;
}

.analysis-badge {
  background: #f59f00;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
}

.analysis-content {
  font-size: 14px;
  line-height: 1.6;
  color: #495057;
}

.analysis-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #f59f00;
}

/* 今日建议卡片 */
.suggestion-card {
  background: #e8f4fd;
  border-radius: 16px;
  padding: 16px;
  margin-top: 8px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestion-icon {
  font-size: 20px;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.suggestion-content {
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
}
</style>