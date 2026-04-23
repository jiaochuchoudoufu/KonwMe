<template>
  <div class="journal-page">
    <h1>📝 心情日记</h1>

    <!-- 写日记按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="openWriteDialog">
        ✏️ 写日记
      </el-button>
    </div>

    <!-- 日记列表 -->
    <div v-if="store.entries.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>还没有日记，写第一篇吧~</p>
    </div>

    <div v-else class="journal-list">
      <div v-for="entry in sortedEntries" :key="entry.id" class="journal-card">
        <div class="card-header">
          <div class="date">{{ entry.date }}</div>
          <div class="actions">
            <el-button type="primary" size="small" text @click="editEntry(entry)">编辑</el-button>
            <el-button type="danger" size="small" text @click="deleteEntry(entry.id)">删除</el-button>
          </div>
        </div>
        <div class="mood">
          <span class="mood-label">心情：</span>
          <span class="mood-icon">{{ getMoodIcon(entry.mood) }}</span>
          <span class="mood-text">{{ getMoodText(entry.mood) }}</span>
        </div>
        <div class="content">{{ entry.content }}</div>
      </div>
    </div>

<!-- 写日记/编辑弹窗 -->
<el-dialog 
  v-model="showDialog" 
  :title="dialogTitle" 
  :fullscreen="isMobile"
  :width="isMobile ? '100%' : '500px'"
  class="journal-dialog"
  :close-on-click-modal="false"
>
  <el-form :model="form" label-position="top" :label-width="isMobile ? undefined : '70px'">
    <el-form-item label="日期">
      <el-date-picker
        v-model="form.date"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :disabled-date="disabledDate"
        style="width: 100%"
      />
    </el-form-item>
    
    <el-form-item label="心情">
      <div class="mood-selector">
        <div
          v-for="mood in moodOptions"
          :key="mood.value"
          class="mood-option"
          :class="{ active: form.mood === mood.value }"
          @click="form.mood = mood.value"
        >
          <span class="mood-emoji">{{ mood.emoji }}</span>
          <span class="mood-name">{{ mood.label }}</span>
        </div>
      </div>
    </el-form-item>
    
    <el-form-item label="内容">
      <el-input
        v-model="form.content"
        type="textarea"
        :rows="8"
        placeholder="记录今天的心情和发生的事情..."
        maxlength="1000"
        show-word-limit
      />
    </el-form-item>
  </el-form>
  
  <template #footer>
    <div class="dialog-footer">
      <el-button @click="showDialog = false">取消</el-button>
      <el-button type="primary" @click="saveEntry">保存</el-button>
    </div>
  </template>
</el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useJournalStore, type JournalEntry } from '../stores/journal'

//定义心情类型
type Mood = 'happy' | 'excited' | 'normal' | 'tired' | 'sad'

const store = useJournalStore()
const showDialog = ref(false)
const editingId = ref<number | null>(null)

// 心情选项
const moodOptions: { value: Mood; label: string; emoji: string }[] = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'excited', label: '兴奋', emoji: '🎉' },
  { value: 'normal', label: '一般', emoji: '😐' },
  { value: 'tired', label: '疲惫', emoji: '😴' },
  { value: 'sad', label: '难过', emoji: '😢' },
]

// 表单数据
const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  mood: 'normal' as Mood,
  content: '',
})

// 排序后的日记（按日期倒序）
const sortedEntries = computed(() => {
  return [...store.entries].sort((a, b) => b.date.localeCompare(a.date))
})

const dialogTitle = computed(() =>
  editingId.value ? '编辑日记' : '写日记'
)

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 获取心情图标
const getMoodIcon = (mood: string) => {
  const option = moodOptions.find(m => m.value === mood)
  return option?.emoji || '😐'
}

// 获取心情文字
const getMoodText = (mood: string) => {
  const option = moodOptions.find(m => m.value === mood)
  return option?.label || '一般'
}

// 重置表单
const resetForm = () => {
  form.date = new Date().toISOString().slice(0, 10)
  form.mood = 'normal'
  form.content = ''
  editingId.value = null
}

// 打开写日记弹窗
const openWriteDialog = () => {
  resetForm()
  showDialog.value = true
}

// 编辑日记
const editEntry = (entry: JournalEntry) => {
  editingId.value = entry.id
  form.date = entry.date
  form.mood = entry.mood
  form.content = entry.content
  showDialog.value = true
}

// 保存日记
const saveEntry = () => {
  if (!form.content.trim()) {
    ElMessage.warning('请填写日记内容')
    return
  }

  const entry = {
    date: form.date,
    mood: form.mood,
    content: form.content.trim(),
  }

  if (editingId.value) {
    store.updateEntry(editingId.value, entry)
    ElMessage.success('更新成功')
  } else {
    const existing = store.getEntryByDate(form.date)
    if (existing) {
      ElMessage.warning('当天已有日记，可以编辑修改')
      return
    }
    store.addEntry(entry)
    ElMessage.success('添加成功')
  }

  showDialog.value = false
  resetForm()
}

// 删除日记
const deleteEntry = (id: number) => {
  ElMessageBox.confirm('确定删除这篇日记吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    store.deleteEntry(id)
    ElMessage.success('删除成功')
  })
}

// 移动端检测
const isMobile = ref(window.innerWidth < 768)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.journal-page {
  padding: 20px;
  max-width: 100%;
  overflow-x: hidden;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
}

.action-bar {
  margin-bottom: 24px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #adb5bd;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.journal-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片式日记 */
.journal-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.journal-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.date {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 8px;
}

.mood {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.mood-label {
  font-size: 13px;
  color: #868e96;
}

.mood-icon {
  font-size: 18px;
}

.mood-text {
  font-size: 13px;
  color: #495057;
}

.content {
  font-size: 14px;
  line-height: 1.6;
  color: #212529;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 心情选择器 */
.mood-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
}

.mood-option:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.mood-option.active {
  background: #f59f00;
  color: white;
}

.mood-option.active .mood-name {
  color: white;
}

.mood-emoji {
  font-size: 24px;
}

.mood-name {
  font-size: 12px;
  color: #495057;
}

/* 弹窗样式 */
.journal-dialog :deep(.el-dialog) {
  border-radius: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .journal-page {
    padding: 12px;
  }
  
  .journal-card {
    padding: 14px;
  }
  
  .date {
    font-size: 13px;
  }
  
  .mood-option {
    min-width: 50px;
    padding: 6px 8px;
  }
  
  .mood-emoji {
    font-size: 20px;
  }
  
  .content {
    font-size: 13px;
  }
  
  .actions .el-button--small {
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .mood-selector {
    gap: 8px;
  }
  
  .mood-option {
    min-width: 45px;
  }
}

/* 弹窗样式 */
.journal-dialog :deep(.el-dialog) {
  border-radius: 20px;
}

.journal-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 移动端全屏弹窗样式 */
@media (max-width: 768px) {
  .journal-dialog :deep(.el-dialog) {
    border-radius: 0 !important;
    margin: 0 !important;
    height: 100vh !important;
    display: flex;
    flex-direction: column;
  }
  
  .journal-dialog :deep(.el-dialog__header) {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .journal-dialog :deep(.el-dialog__body) {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  
  .journal-dialog :deep(.el-dialog__footer) {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
  }
  
  .mood-selector {
    justify-content: center;
  }
  
  .mood-option {
    min-width: 55px;
    padding: 8px 10px;
  }
}
</style>