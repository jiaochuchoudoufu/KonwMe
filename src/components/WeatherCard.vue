<template>
    <div class="weather-card" v-if="weatherStore.weather">
      <div class="card-header">
        <span class="card-icon">🌤️</span>
        <span class="card-title">今日天气</span>
      </div>
      <div class="weather-main">
        <div class="weather-icon">{{ getWeatherIcon(weatherStore.weather.text) }}</div>
        <div class="weather-info">
          <div class="city">{{ weatherStore.weather.city }}</div>
          <div class="temp">{{ weatherStore.weather.temp }}°C</div>
          <div class="text">{{ weatherStore.weather.text }}</div>
        </div>
      </div>
      <div class="weather-details">
        <span>💧 {{ weatherStore.weather.humidity }}%</span>
        <span>🌬️ {{ weatherStore.weather.windSpeed }} km/h</span>
      </div>
      <div v-if="weatherAnalysis" class="weather-tip">
        <span class="tip-icon">🤖</span>
        <span class="tip-text">{{ weatherAnalysis }}</span>
      </div>
      <div v-else-if="analysisLoading" class="weather-tip loading">
        <span>🤖 AI 分析中...</span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useWeatherStore } from '../stores/weather'
  import { analyzeWeatherImpact } from '../services/ai'
  
  const weatherStore = useWeatherStore()
  const analysisLoading = ref(false)
  const weatherAnalysis = ref('')
  
  const getWeatherIcon = (text: string) => {
    const iconMap: Record<string, string> = {
      '晴': '☀️', '多云': '⛅', '阴': '☁️',
      '雨': '🌧️', '雪': '❄️', '雾': '🌫️'
    }
    for (const [key, icon] of Object.entries(iconMap)) {
      if (text.includes(key)) return icon
    }
    return '🌤️'
  }
  
  const fetchAnalysis = async () => {
    if (!weatherStore.weather) return
    analysisLoading.value = true
    try {
      weatherAnalysis.value = await analyzeWeatherImpact(weatherStore.weather)
    } catch {
      weatherAnalysis.value = '注意天气变化，照顾好自己~'
    } finally {
      analysisLoading.value = false
    }
  }
  
  watch(() => weatherStore.weather, () => fetchAnalysis(), { immediate: true })

  // 组件挂载时获取天气
onMounted(async () => {
  await weatherStore.initWeather()
  await fetchAnalysis()
})
  </script>
  
  <style scoped>
  .weather-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 16px;
    color: white;
    margin-bottom: 16px;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .weather-main {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }
  
  .weather-icon {
    font-size: 48px;
  }
  
  .weather-info {
    flex: 1;
  }
  
  .city {
    font-size: 18px;
    font-weight: 600;
  }
  
  .temp {
    font-size: 32px;
    font-weight: bold;
  }
  
  .text {
    font-size: 14px;
    opacity: 0.8;
  }
  
  .weather-details {
    display: flex;
    gap: 20px;
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 12px;
  }
  
  .weather-tip {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 8px 12px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .weather-tip.loading {
    opacity: 0.7;
  }
  </style>