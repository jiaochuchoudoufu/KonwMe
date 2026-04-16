<template>
    <div class="ai-card">
      <div class="card-header">
        <span class="card-icon">🧠</span>
        <span class="card-title">智能助手</span>
      </div>
      
      <div class="data-summary">
        <div class="summary-item">
          <span class="summary-label">本月支出</span>
          <span class="summary-value">¥{{ ledgerStore.totalExpense }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">本月收入</span>
          <span class="summary-value">¥{{ ledgerStore.totalIncome }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">日记数量</span>
          <span class="summary-value">{{ journalStore.entries.length }}篇</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">待办数量</span>
          <span class="summary-value">{{ memoStore.incompleteTodos.length }}项</span>
        </div>
      </div>
  
      <div class="ai-message" :class="{ loading: aiLoading }">
        <div class="ai-avatar">🤖</div>
        <div class="ai-bubble">
          <div v-if="aiLoading" class="typing-dots">
            <span></span><span></span><span></span>
          </div>
          <div v-else class="ai-text">{{ aiMessage }}</div>
        </div>
      </div>
  
      <div class="input-area">
        <el-input
          v-model="userInput"
          placeholder="输入你的问题，AI 会结合你的数据回答..."
          @keyup.enter="sendMessage"
          clearable
        />
        <el-button type="primary" @click="sendMessage" :loading="aiLoading">
          发送
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useLedgerStore } from '../stores/ledger'
  import { useJournalStore } from '../stores/journal'
  import { useMemoStore } from '../stores/memo'
  import { sendMessageStream } from '../services/ai'
  
  const ledgerStore = useLedgerStore()
  const journalStore = useJournalStore()
  const memoStore = useMemoStore()
  
  const userInput = ref('')
  const aiMessage = ref('你好！我是你的智能助手，可以帮你分析消费、回顾日记、规划待办。有什么想问的吗？')
  const aiLoading = ref(false)
  
  // 构建用户数据摘要
  const getUserDataSummary = () => {
    const today = new Date().toISOString().slice(0, 10)
    
    // 最近5条消费记录
    const recentExpenses = ledgerStore.records
      .filter(r => r.type === 'expense')
      .slice(-5)
      .map(r => `${r.date} ${r.category} ${r.amount}元`)
      .join('；')
  
    // 最近3篇日记
    const recentJournals = journalStore.entries
      .slice(-3)
      .map(j => `${j.date}【${j.mood}】${j.content.slice(0, 50)}`)
      .join('；')
  
    // 未完成待办
    const pendingTodos = memoStore.incompleteTodos
      .map(t => `${t.title}（截止${t.date}）`)
      .join('；')
  
    return `
  【消费数据】
  本月总收入：${ledgerStore.totalIncome}元
  本月总支出：${ledgerStore.totalExpense}元
  最近消费：${recentExpenses || '无'}
  
  【日记数据】
  日记总数：${journalStore.entries.length}篇
  最近心情：${recentJournals || '无'}
  
  【待办数据】
  未完成待办：${memoStore.incompleteTodos.length}项
  待办详情：${pendingTodos || '无'}
    `
  }
  
  // 发送消息
  const sendMessage = async () => {
    const content = userInput.value.trim()
    if (!content) return
    
    // 显示用户消息
    userInput.value = ''
    aiLoading.value = true
    
    // 清空之前的 AI 消息，显示新内容
    aiMessage.value = ''
    
    const userData = getUserDataSummary()
    
    try {
      await sendMessageStream(
        [
          { 
            role: 'system', 
            content: `你是用户的私人生活助手。用户会给你他的数据，你要基于这些数据回答问题。
  用户数据：
  ${userData}
  
  回复要求：
  1. 基于数据回答，不要编造
  2. 回复要简短友好，每句话不超过20字
  3. 给出具体建议时引用数据`
          },
          { role: 'user', content: content }
        ],
        (chunk: string) => {
          aiMessage.value += chunk
        }
      )
    } catch (error) {
      aiMessage.value = '抱歉，我出了一点问题，请稍后再试~'
    } finally {
      aiLoading.value = false
    }
  }
  </script>
  
  <style scoped>
  .ai-card {
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .card-icon {
    font-size: 24px;
  }
  
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .data-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 12px;
  }
  
  .summary-item {
    text-align: center;
  }
  
  .summary-label {
    display: block;
    font-size: 12px;
    color: #868e96;
    margin-bottom: 4px;
  }
  
  .summary-value {
    font-size: 18px;
    font-weight: 600;
    color: #212529;
  }
  
  .ai-message {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex: 1;
    min-height: 120px;
    max-height: 200px;
    overflow-y: auto;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 12px;
  }
  
  .ai-avatar {
    font-size: 28px;
  }
  
  .ai-bubble {
    flex: 1;
  }
  
  .ai-text {
    font-size: 14px;
    line-height: 1.6;
    color: #495057;
  }
  
  .typing-dots {
    display: flex;
    gap: 4px;
    padding: 8px 0;
  }
  
  .typing-dots span {
    width: 6px;
    height: 6px;
    background: #adb5bd;
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }
  
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
  
  @keyframes typing {
    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-4px); }
  }
  
  .input-area {
    display: flex;
    gap: 12px;
    margin-top: auto;
  }
  
  .input-area :deep(.el-input__wrapper) {
    border-radius: 24px;
  }
  </style>