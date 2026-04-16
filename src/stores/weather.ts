import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

// 从环境变量读取 API Key
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const WEATHER_API_URL = 'https://n42k5phv9p.re.qweatherapi.com/v7'  // 天气 API
const GEO_API_URL = 'https://n42k5phv9p.re.qweatherapi.com/v2'      // 城市查询 API

// 如果没有配置 API Key，给出警告
if (!API_KEY) {
    console.warn('请在 .env 文件中配置 VITE_WEATHER_API_KEY')
  }

export interface WeatherData {
  city: string
  temp: number
  text: string
  humidity: number
  windSpeed: number
  updateTime: string
}

export const useWeatherStore = defineStore('weather', () => {
  const weather = ref<WeatherData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取用户当前位置
  const getCurrentPosition = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (err) => {
          reject(new Error('定位失败：' + err.message))
        }
      )
    })
  }

// 根据经纬度获取城市信息
const getCityByLocation = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await axios.get(`https://n42k5phv9p.re.qweatherapi.com/geo/v2/city/lookup`, {  // 注意：用 geoapi
      params: {
        location: `${lon},${lat}`,
        key: API_KEY
      }
    })
    // 根据实际返回结构调整
    if (response.data.code === '200' && response.data.location?.length > 0) {
      return response.data.location[0].name
    }
    return '未知城市'
  } catch (err) {
    console.error('获取城市失败:', err)
    return '未知城市'
  }
}

  // 获取实时天气
  const fetchWeather = async () => {
    loading.value = true
    error.value = null

    try {
      // 1. 获取位置
      const { lat, lon } = await getCurrentPosition()
      
      // 2. 获取城市名
      const city = await getCityByLocation(lat, lon)
      
      // 3. 获取天气数据
      const response = await axios.get(`https://n42k5phv9p.re.qweatherapi.com/v7/weather/now`, {
        params: {
          location: `${lon},${lat}`,
          key: API_KEY
        }
      })

      // ✅ 检查返回码
    if (response.data.code !== '200') {
      throw new Error(`天气接口返回错误: ${response.data.code}`)
    }
      
      const data = response.data.now
      weather.value = {
        city,
        temp: data.temp,
        text: data.text,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        updateTime: data.obsTime
      }
      
      // 保存到 localStorage
      localStorage.setItem('weather_data', JSON.stringify(weather.value))
      localStorage.setItem('weather_update_time', Date.now().toString())
    } catch (err: any) {
      error.value = err.message || '获取天气失败'
      console.error('天气获取失败:', err)
      
      // 尝试从缓存读取
      const cached = localStorage.getItem('weather_data')
      if (cached) {
        weather.value = JSON.parse(cached)
        error.value = '使用缓存数据，请检查网络'
      }
    } finally {
      loading.value = false
    }
  }

  // 检查是否需要更新天气（1小时更新一次）
  const shouldUpdate = (): boolean => {
    const lastUpdate = localStorage.getItem('weather_update_time')
    if (!lastUpdate) return true
    const hourAgo = Date.now() - 60 * 60 * 1000
    return parseInt(lastUpdate) < hourAgo
  }

  // 初始化天气
  const initWeather = async () => {
    if (shouldUpdate()) {
      await fetchWeather()
    } else {
      const cached = localStorage.getItem('weather_data')
      if (cached) {
        weather.value = JSON.parse(cached)
      } else {
        await fetchWeather()
      }
    }
  }

  return {
    weather,
    loading,
    error,
    fetchWeather,
    initWeather,
    shouldUpdate
  }
})