<template>
    <div class="data-manager">
      <el-card class="data-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>💾 数据管理</span>
          </div>
        </template>
        
        <div class="data-stats">
          <div class="stat-item" :class="{ 'has-data': ledgerCount > 0 }">
            <span class="stat-label">记账记录</span>
            <span class="stat-value">{{ ledgerCount }}</span>
          </div>
          <div class="stat-item" :class="{ 'has-data': journalCount > 0 }">
            <span class="stat-label">日记数量</span>
            <span class="stat-value">{{ journalCount }}</span>
          </div>
          <div class="stat-item" :class="{ 'has-data': todoCount > 0 }">
            <span class="stat-label">待办数量</span>
            <span class="stat-value">{{ todoCount }}</span>
          </div>
          <div class="stat-item" :class="{ 'has-data': chatSessionsCount > 0 }">
            <span class="stat-label">会话数量</span>
            <span class="stat-value">{{ chatSessionsCount }}</span>
          </div>
        </div>
        
        <div class="data-actions">
          <el-button type="primary" @click="exportData" :loading="exporting">
            📤 导出备份
          </el-button>
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".json"
            class="upload-btn-wrapper"
          >
            <el-button type="success" :loading="importing">
              📥 导入备份
            </el-button>
          </el-upload>
          <el-button type="danger" @click="clearAllData">
            🗑️ 恢复成原始数据
          </el-button>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useLedgerStore } from '../stores/ledger'
  import { useJournalStore } from '../stores/journal'
  import { useMemoStore } from '../stores/memo'
  import { useChatStore } from '../stores/chat'
  
  const ledgerStore = useLedgerStore()
  const journalStore = useJournalStore()
  const memoStore = useMemoStore()
  const chatStore = useChatStore()
  
  const exporting = ref(false)
  const importing = ref(false)
  
  // 统计数据
  const ledgerCount = computed(() => ledgerStore.records.length)
  const journalCount = computed(() => journalStore.entries.length)
  const todoCount = computed(() => memoStore.todos.length)
  const chatSessionsCount = computed(() => chatStore.sessions.length)
  
  // 导出数据
  const exportData = () => {
    exporting.value = true
    
    try {
      const data = {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        ledger: ledgerStore.records,
        journal: journalStore.entries,
        memo: memoStore.todos,
        chat: chatStore.sessions,
      }
      
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `lifelog_backup_${new Date().toISOString().slice(0, 19)}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      ElMessage.success({
        message: `导出成功！包含：
        记账${ledgerCount.value}条、
        日记${journalCount.value}篇、
        待办${todoCount.value}项、
        会话${chatSessionsCount.value}个`,
        duration: 3000
      })
    } catch (error) {
      ElMessage.error('导出失败')
    } finally {
      exporting.value = false
    }
  }
  
  // 导入数据
  const handleFileChange = (file: any) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      importing.value = true
      try {
        const data = JSON.parse(e.target?.result as string)
        
        // 验证数据格式
        if (!data.ledger || !data.journal || !data.memo) {
          throw new Error('数据格式不正确')
        }
        
        // 计算导入数据量
        const importStats = {
            ledger: data.ledger.length,
            journal: data.journal.length,
            memo: data.memo.length,
            chat: data.chat?.length || 0
        }

        await ElMessageBox.confirm(
          `即将导入：记账${importStats.ledger}条、
            日记${importStats.journal}篇、
            待办${importStats.memo}项、
            会话${importStats.chat}个
          \n\n当前数据:记账${ledgerCount.value}条、
            日记${journalCount.value}篇、
            待办${todoCount.value}项、
            会话${chatSessionsCount.value}个
          \n\n导入将覆盖现有数据,确定吗?`,
            '确认导入',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        )
        

        // 导入数据
        localStorage.setItem('ledger_records', JSON.stringify(data.ledger))
        localStorage.setItem('journal_entries', JSON.stringify(data.journal))
        localStorage.setItem('memo_todos', JSON.stringify(data.memo))
        if (data.chat) {
          localStorage.setItem('chat_sessions', JSON.stringify(data.chat))
        }
        
        // 刷新页面重新加载
        ElMessage.success('导入成功，即将刷新页面')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error: any) {
        ElMessage.error(error.message || '导入失败')
      } finally {
        importing.value = false
      }
    }
    reader.readAsText(file.raw)
  }
  
  // 清除所有数据
  const clearAllData = async () => {
    await ElMessageBox.confirm(
      '这将删除所有数据（记账、日记、待办、聊天记录），且不可恢复！确定吗？',
      '危险操作',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error' }
    )
    
    // 清空 localStorage
    localStorage.removeItem('ledger_records')
    localStorage.removeItem('journal_entries')
    localStorage.removeItem('memo_todos')
    localStorage.removeItem('chat_sessions')
    
    ElMessage.success('已清除所有数据，即将刷新页面')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
  </script>
  
  <style scoped>
  .data-manager {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.data-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.data-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: default;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item.has-data {
  background: linear-gradient(135deg, #e8f4fd, #f0f9ff);
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #868e96;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-actions .action-btn {
  width: 100%;
  margin: 0;
}

.upload-btn-wrapper {
  display: block;
  width: 100%;
}

.upload-btn-wrapper :deep(.el-button) {
  width: 100%;
}
</style>