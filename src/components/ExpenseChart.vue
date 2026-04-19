<template>
    <div class="chart-container">
      <div v-if="type === 'line'" ref="lineChartRef" class="chart"></div>
      <div v-if="type === 'pie'" ref="pieChartRef" class="chart"></div>
    </div>
  </template>
  
<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
/* import * as echarts from 'echarts' */
// 改成按需导入（减小体积）
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, PieChart, CanvasRenderer])

import { useLedgerStore } from '../stores/ledger'
  
  const props = defineProps<{ type: 'line' | 'pie' }>()
  const store = useLedgerStore()
  
  const lineChartRef = ref<HTMLElement>()
  const pieChartRef = ref<HTMLElement>()
  let lineChart: echarts.ECharts | null = null
  let pieChart: echarts.ECharts | null = null
  
  // 获取当前选中的月份（从父组件传入或使用当前月份）
  // 这里简单处理，实际可以从父组件 prop 传入
  const getCurrentMonth = () => {
    // 从 sessionStorage 获取或使用当前月份
    const stored = sessionStorage.getItem('selectedMonth')
    return stored || new Date().toISOString().slice(0, 7)
  }
  
  const selectedMonth = ref(getCurrentMonth())
  
  // 监听 store 数据变化，更新图表
  watch(() => store.records, () => {
    if (props.type === 'line') renderLineChart()
    if (props.type === 'pie') renderPieChart()
  }, { deep: true })
  
  // 监听月份变化（通过 sessionStorage 跨组件通信）
  watch(selectedMonth, () => {
    if (props.type === 'line') renderLineChart()
    if (props.type === 'pie') renderPieChart()
  })
  
  // 折线图数据
  const prepareLineData = () => {
    const yearMonth = selectedMonth.value
    const daysInMonth = new Date(parseInt(yearMonth.slice(0, 4)), parseInt(yearMonth.slice(5)), 0).getDate()
    const dailyExpense = Array(daysInMonth).fill(0)
    
    store.records.forEach(record => {
      if (record.type === 'expense' && record.date.startsWith(yearMonth)) {
        const day = parseInt(record.date.slice(8)) - 1
        dailyExpense[day] += record.amount
      }
    })
    
    return {
      xAxis: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
      series: dailyExpense
    }
  }
  
  // 饼图数据
  const preparePieData = () => {
    const yearMonth = selectedMonth.value
    const categoryMap = new Map<string, number>()
    
    store.records.forEach(record => {
      if (record.type === 'expense' && record.date.startsWith(yearMonth)) {
        const current = categoryMap.get(record.category) || 0
        categoryMap.set(record.category, current + record.amount)
      }
    })
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))
  }
  
  // 渲染折线图
  const renderLineChart = () => {
    if (!lineChartRef.value) return
    if (!lineChart) {
      lineChart = echarts.init(lineChartRef.value)
    }
    
    const data = prepareLineData()
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: 30, left: 50, right: 20, bottom: 20 },
      xAxis: { type: 'category', data: data.xAxis, axisLabel: { rotate: 45, interval: 5 } },
      yAxis: { type: 'value', name: '金额 (元)' },
      series: [{ 
        type: 'line', 
        data: data.series, 
        smooth: true, 
        lineStyle: { color: '#f56c6c', width: 2 }, 
        areaStyle: { opacity: 0.2 }, 
        symbol: 'circle', 
        symbolSize: 6 
      }]
    })
  }
  
  // 渲染饼图
  const renderPieChart = () => {
    if (!pieChartRef.value) return
    if (!pieChart) {
      pieChart = echarts.init(pieChartRef.value)
    }
    
    const data = preparePieData()
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{ 
        type: 'pie', 
        radius: '55%', 
        data, 
        label: { show: true, formatter: '{b}: {d}%' }, 
        emphasis: { scale: true } 
      }]
    })
  }
  
  // 监听窗口大小变化
  const handleResize = () => {
    if (props.type === 'line' && lineChart) lineChart.resize()
    if (props.type === 'pie' && pieChart) pieChart.resize()
  }
  
  // 监听 sessionStorage 变化（跨组件通信）
  const storageListener = () => {
    const newMonth = sessionStorage.getItem('selectedMonth')
    if (newMonth && newMonth !== selectedMonth.value) {
      selectedMonth.value = newMonth
    }
  }
  
  onMounted(() => {
    if (props.type === 'line') renderLineChart()
    if (props.type === 'pie') renderPieChart()
    window.addEventListener('resize', handleResize)
    window.addEventListener('storage', storageListener)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('storage', storageListener)
    if (lineChart) lineChart.dispose()
    if (pieChart) pieChart.dispose()
  })
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    height: 100%;
  }
  
  .chart {
    width: 100%;
    height: 280px;
  }
  </style>