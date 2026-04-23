<template>
    <div class="ai-suggestion-card">
      <div class="card-header">
        <div class="header-left">
          <span class="icon">🤖</span>
          <span class="title">AI 智能建议</span>
          
        </div>
        <el-button 
          text 
          size="small" 
          @click="refreshSuggestion" 
          :loading="loading"
          class="refresh-btn"
        >
          🔄 刷新
        </el-button>
      </div>
      
      <div class="suggestion-content" :class="{ loading: loading }">
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>AI 正在分析你的数据...</span>
        </div>
        <div v-else class="content">
          <div class="suggestion-text">{{ suggestion }}</div>
          <div class="suggestion-tip">
            <span>💡 基于你的 {{ dataSummary }} 生成</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import { useLedgerStore } from '../stores/ledger'
  import { useJournalStore } from '../stores/journal'
  import { useMemoStore } from '../stores/memo'
  import { sendMessageStream } from '../services/ai'
  
  const ledgerStore = useLedgerStore()
  const journalStore = useJournalStore()
  const memoStore = useMemoStore()
  
  const loading = ref(false)
  const suggestion = ref('加载中...')
  
  // 数据摘要（用于显示）
  const dataSummary = computed(() => {
    const parts = []
    if (ledgerStore.records.length > 0) parts.push(`${ledgerStore.records.length}条记账`)
    if (journalStore.entries.length > 0) parts.push(`${journalStore.entries.length}篇日记`)
    if (memoStore.todos.length > 0) parts.push(`${memoStore.incompleteTodos.length}项待办`)
    return parts.join('、') || '暂无数据'
  })
  
  // 构建用户数据（给 AI 用）
  const buildUserDataPrompt = () => {
    const today = new Date().toISOString().slice(0, 10)
    
    // 最近7天支出
    const recentExpenses = ledgerStore.records
      .filter(r => r.type === 'expense')
      .slice(-7)
      .map(r => `${r.date} ${r.category} ${r.amount}元`)
      .join('；')
  
    // 最近3篇日记
    const recentJournals = journalStore.entries
      .slice(-3)
      .map(j => `${j.date}【${j.mood}】${j.content.slice(0, 80)}`)
      .join('；')
  
    // 未完成待办
    const pendingTodos = memoStore.incompleteTodos
      .map(t => `${t.title}（${t.date}）`)
      .join('；')
  
    return `
  【消费数据】
  ${recentExpenses || '暂无消费记录'}
  本月总支出：${ledgerStore.totalExpense}元
  本月总收入：${ledgerStore.totalIncome}元
  
  【日记数据】
  ${recentJournals || '暂无日记'}
  
  【待办数据】
  未完成：${memoStore.incompleteTodos.length}项
  ${pendingTodos || '暂无待办'}
    `
  }
  
  // 获取 AI 建议
  const fetchSuggestion = async () => {
    loading.value = true
    
    try {
      const userData = buildUserDataPrompt()
      
      let fullResponse = ''
      await sendMessageStream(
        [
          { 
            role: 'system', 
            content: `你是用户的私人生活助手。基于用户数据给出1条简短建议（不超过50字）。
  要求：
  1. 温暖友好，像朋友一样说话
  2. 可以提醒待办、分析消费、鼓励日记
  3. 每次回复不同，不要重复`
          },
          { 
            role: 'user', 
            content: `用户数据：${userData}\n\n请给出一条简短的生活建议。` 
          }
        ],
        (chunk: string) => {
          fullResponse += chunk
          suggestion.value = fullResponse
        }
      )
    } catch (error) {
      console.error('获取 AI 建议失败:', error)
      suggestion.value = '今天也要开心地记录生活呀 ✨'
    } finally {
      loading.value = false
    }
  }
  
  // 刷新建议
  const refreshSuggestion = () => {
    fetchSuggestion()
    ElMessage.success('正在生成新建议...')
  }
  
  // 初始化
  onMounted(() => {
    fetchSuggestion()
  })
  </script>
  
  <style scoped>
  .ai-suggestion-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 20px;
    color: white;
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .icon {
    font-size: 24px;
  }
  
  .title {
    font-size: 18px;
    font-weight: 600;
  }
  
  .badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
  }
  
  .refresh-btn {
    color: white !important;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    padding: 4px 12px;
  }
  
  .refresh-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  
  .suggestion-content {
    min-height: 80px;
  }
  
  .loading-state {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    opacity: 0.8;
  }
  
  .suggestion-text {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 12px;
  }
  
  .suggestion-tip {
    font-size: 11px;
    opacity: 0.7;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 8px;
  }
  
  </style>