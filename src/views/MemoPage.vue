<template>
    <div class="memo-page">
      <h1>📋 备忘录</h1>
  
      <!-- 添加待办按钮 -->
      <div class="action-bar">
        <el-button type="primary" @click="openAddDialog">
          ➕ 添加待办
        </el-button>
        <el-button type="warning" @click="getAISuggestion" :loading="aiLoading">
          🤖 AI 智能建议
        </el-button>
      </div>
  
      <!-- 今日待办提醒 -->
      <div v-if="store.todayTodos.length > 0" class="today-section">
        <h3>📅 今日待办 ({{ store.todayTodos.length }})</h3>
        <div class="todo-list">
          <div v-for="todo in store.todayTodos" :key="todo.id" class="todo-item" :class="todo.priority">
            <el-checkbox :model-value="todo.completed" @change="toggleComplete(todo.id)">
              <span :class="{ completed: todo.completed }">{{ todo.title }}</span>
            </el-checkbox>
            <div class="todo-meta">
              <el-tag :type="getPriorityType(todo.priority)" size="small">
                {{ getPriorityText(todo.priority) }}
              </el-tag>
              <span class="todo-date">{{ todo.date }}</span>
              <el-button type="primary" size="small" @click="editTodo(todo)">编辑</el-button>
              <el-button type="danger" size="small" @click="deleteTodo(todo.id)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 未完成待办 -->
      <div class="section">
        <h3>⏳ 进行中 ({{ store.incompleteTodos.length }})</h3>
        <div v-if="store.incompleteTodos.length === 0" class="empty-state">
          暂无未完成待办，休息一下吧~
        </div>
        <div v-else class="todo-list">
          <div v-for="todo in store.incompleteTodos" :key="todo.id" class="todo-item" :class="todo.priority">
            <el-checkbox :model-value="todo.completed" @change="toggleComplete(todo.id)">
              <span :class="{ completed: todo.completed }">{{ todo.title }}</span>
            </el-checkbox>
            <div class="todo-meta">
              <el-tag :type="getPriorityType(todo.priority)" size="small">
                {{ getPriorityText(todo.priority) }}
              </el-tag>
              <span class="todo-date">截止: {{ todo.date }}</span>
              <el-button type="primary" size="small" @click="editTodo(todo)">编辑</el-button>
              <el-button type="danger" size="small" @click="deleteTodo(todo.id)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 已完成待办 -->
      <div class="section">
        <h3>✅ 已完成 ({{ store.completedTodos.length }})</h3>
        <div v-if="store.completedTodos.length === 0" class="empty-state">
          暂无已完成待办
        </div>
        <div v-else class="todo-list">
          <div v-for="todo in store.completedTodos" :key="todo.id" class="todo-item" 
          :class="[todo.priority, { overdue: isOverdue(todo.date) && !todo.completed }]">
            <el-checkbox :model-value="todo.completed" @change="toggleComplete(todo.id)">
              <span :class="{ completed: todo.completed }">{{ todo.title }}</span>
            </el-checkbox>
            <div class="todo-meta">
              <el-tag :type="getPriorityType(todo.priority)" size="small">
                {{ getPriorityText(todo.priority) }}
              </el-tag>
              <span class="todo-date" 
              :class="{ 'overdue-text': isOverdue(todo.date) && !todo.completed }">
              完成于: {{ todo.date }}
                <span v-if="isOverdue(todo.date) && !todo.completed" class="overdue-badge">
                  已逾期
                </span>
              </span>
              <el-button type="primary" size="small" @click="editTodo(todo)">编辑</el-button>
              <el-button type="danger" size="small" @click="deleteTodo(todo.id)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 添加/编辑弹窗 -->
      <el-dialog v-model="showDialog" :title="dialogTitle" width="400px">
        <el-form :model="form" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="输入待办标题" />
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
            />
          </el-form-item>
          <el-form-item label="优先级">
            <el-radio-group v-model="form.priority">
              <el-radio value="high">高</el-radio>
              <el-radio value="medium">中</el-radio>
              <el-radio value="low">低</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="saveTodo">保存</el-button>
        </template>
      </el-dialog>
    </div>

    <!-- AI 建议弹窗 -->
<el-dialog v-model="showAiDialog" title="🤖 AI 智能建议" width="90%" class="ai-dialog">
  <div class="ai-content">
    <div v-if="aiLoading" class="ai-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>AI 正在分析中...</span>
    </div>
    <div v-else class="ai-result">
      <div class="typing-text">{{ aiSuggestion }}</div>
    </div>
  </div>
  <template #footer>
    <el-button @click="showAiDialog = false">关闭</el-button>
  </template>
</el-dialog>
  </template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useMemoStore, type Todo } from '@/stores/memo';
import { analyzeTodoSuggestions } from '@/services/ai';
import { Loading } from '@element-plus/icons-vue';

const store = useMemoStore()
const showDialog = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    priority: 'medium' as 'high' | 'medium' | 'low'
})

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 86400000  // 只允许今天及以后
}

const dialogTitle = computed(() =>
  editingId.value ? '编辑待办' : '添加待办'
)

// 获取优先级标签类型
const getPriorityType = (priority: string) => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'info'
  }
}

// 获取优先级文字
const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return '中'
  }
}

// 重置表单
const resetForm = () => {
  form.title = ''
  form.date = new Date().toISOString().slice(0, 10)
  form.priority = 'medium'
  editingId.value = null
}

// 打开添加弹窗
const openAddDialog = () => {
  resetForm()
  showDialog.value = true
}

// 编辑待办
const editTodo = (todo: Todo) => {
  editingId.value = todo.id
  form.title = todo.title
  form.date = todo.date
  form.priority = todo.priority
  showDialog.value = true
}

// 保存待办
const saveTodo = () => {
  if (!form.title.trim()) {
    ElMessage.warning('请输入待办标题')
    return
  }

  if (editingId.value) {
    store.updateTodo(editingId.value, {
      title: form.title.trim(),
      date: form.date,
      priority: form.priority
    })
    ElMessage.success('更新成功')
  } else {
    store.addTodo({
      title: form.title.trim(),
      completed: false,
      date: form.date,
      priority: form.priority
    })
    ElMessage.success('添加成功')
  }

  showDialog.value = false
  resetForm()
}

// 切换完成状态
const toggleComplete = (id: number) => {
  store.toggleComplete(id)
}

// 删除待办
const deleteTodo = (id: number) => {
  ElMessageBox.confirm('确定删除这条待办吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    store.deleteTodo(id)
    ElMessage.success('删除成功')
  })
}

//判断是否逾期
const isOverdue = (date: string) => {
  const today = new Date().toISOString().slice(0, 10)
  return date < today
}

//页面加载时检查并发送提醒
onMounted(() => {
  //请求通知权限
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }

  //检查今日代办并提醒
  const today = new Date().toISOString().slice(0, 10)
  const todayTodos = store.todos.filter(t => t.date === today && !t.completed)

  if(todayTodos.length > 0 && Notification.permission === 'granted') {
    const titles = todayTodos.map(t => t.title).join('、')
    new Notification('📋 今日待办提醒',{
      body: `你今天还有 ${todayTodos.length} 项待办未完成：${titles}`,
      icon: '/favicon.ico'
    })
  }
})

//ai建议函数
const aiLoading = ref(false)
const showAiDialog = ref(false)
const aiSuggestion = ref('')

const getAISuggestion = async () => {
  if(store.todos.length === 0) {
    ElMessage.warning('暂无待办，添加一些后再来获取建议吧~')
    return
  }

  aiLoading.value = true
  showAiDialog.value = true
  aiSuggestion.value = ''

  try {
    const reslut = await analyzeTodoSuggestions(store.todos)
    aiSuggestion.value = reslut
  } catch (error) {
    aiSuggestion.value = '分析失败，请稍后再试'
  } finally {
    aiLoading.value = false
  }
}
</script>

<style scoped>
.memo-page {
  padding: 20px;
}

.action-bar {
  margin-bottom: 24px;
  text-align: center;
}

.section, .today-section {
  margin-bottom: 32px;
}

.section h3, .today-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #212529;
}

.today-section {
  background: #fff3e0;
  padding: 16px;
  border-radius: 12px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
  /* 修复溢出问题 */
  overflow: hidden;
  width: 100%;
}

.todo-item.high {
  border-left: 4px solid #f56c6c;
}

.todo-item.medium {
  border-left: 4px solid #e6a23c;
}

.todo-item.low {
  border-left: 4px solid #909399;
}

.todo-item.completed-item {
  opacity: 0.7;
}

/* 左侧 checkbox 区域 */
.todo-item :deep(.el-checkbox) {
  flex-shrink: 0;
  margin-right: 12px;
}

/* 中间内容区域 */
.todo-item .el-checkbox + span {
  flex: 1;
  min-width: 0;  /* 允许文字截断 */
  word-break: break-word;
  white-space: normal;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.todo-date {
  font-size: 12px;
  color: #868e96;
}

.completed {
  text-decoration: line-through;
  color: #adb5bd;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #adb5bd;
  background: #f8f9fa;
  border-radius: 12px;
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .memo-page {
    padding: 12px;
  }
  
  .todo-item {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  /* 第一行：checkbox + 标题 */
  .todo-item :deep(.el-checkbox) {
    width: auto;
  }
  
  .todo-item .el-checkbox + span {
    flex: 1;
    font-size: 14px;
  }
  
  /* 第二行：元数据（优先级、日期、按钮） */
  .todo-meta {
    width: 100%;
    margin-left: 26px;  /* 对齐 checkbox 位置 */
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .todo-date {
    font-size: 11px;
  }
  
  /* 按钮缩小 */
  .todo-meta .el-button--small {
    padding: 4px 8px;
    font-size: 11px;
  }
}

/* 小屏幕适配 */
@media (max-width: 480px) {
  .todo-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>