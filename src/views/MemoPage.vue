<template>
  <div class="memo-page">
    <h1>📋 备忘录</h1>

    <!-- 添加待办按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">
        ➕ 添加待办
      </el-button>
    </div>

    <!-- 今日待办提醒 -->
    <div v-if="store.todayTodos.length > 0" class="today-section">
      <h3>📅 今日待办 ({{ store.todayTodos.length }})</h3>
      <div class="todo-list">
        <div v-for="todo in store.todayTodos" :key="todo.id" class="todo-card" :class="todo.priority">
          <div class="todo-header">
            <el-checkbox :model-value="todo.completed" @change="toggleComplete(todo.id)" />
            <span class="todo-title" :class="{ completed: todo.completed }">{{ todo.title }}</span>
          </div>
          <div class="todo-footer">
            <el-tag :type="getPriorityType(todo.priority)" size="small">
              {{ getPriorityText(todo.priority) }}
            </el-tag>
            <span class="todo-date">📅 {{ todo.date }}</span>
            <div class="todo-actions">
              <el-button type="primary" size="small" text @click="editTodo(todo)">编辑</el-button>
              <el-button type="danger" size="small" text @click="deleteTodo(todo.id)">删除</el-button>
            </div>
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
        <div v-for="todo in store.incompleteTodos" :key="todo.id" class="todo-card" :class="todo.priority">
          <div class="todo-header">
            <el-checkbox :model-value="todo.completed" @change="toggleComplete(todo.id)" />
            <span class="todo-title" :class="{ completed: todo.completed }">{{ todo.title }}</span>
          </div>
          <div class="todo-footer">
            <el-tag :type="getPriorityType(todo.priority)" size="small">
              {{ getPriorityText(todo.priority) }}
            </el-tag>
            <span class="todo-date">📅 {{ todo.date }}</span>
            <div class="todo-actions">
              <el-button type="primary" size="small" text @click="editTodo(todo)">编辑</el-button>
              <el-button type="danger" size="small" text @click="deleteTodo(todo.id)">删除</el-button>
            </div>
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
        <div v-for="todo in store.completedTodos" :key="todo.id" class="todo-card completed-card" :class="todo.priority">
          <div class="todo-header">
            <el-checkbox :model-value="todo.completed" @change="toggleComplete(todo.id)" />
            <span class="todo-title completed">{{ todo.title }}</span>
          </div>
          <div class="todo-footer">
            <el-tag :type="getPriorityType(todo.priority)" size="small">
              {{ getPriorityText(todo.priority) }}
            </el-tag>
            <span class="todo-date">📅 {{ todo.date }}</span>
            <div class="todo-actions">
              <el-button type="danger" size="small" text @click="deleteTodo(todo.id)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="90%" class="memo-dialog">
      <el-form :model="form" label-width="70px">
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
            style="width: 100%"
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
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMemoStore, type Todo } from '../stores/memo'

const store = useMemoStore()
const showDialog = ref(false)
const editingId = ref<number | null>(null)

// 表单数据
const form = reactive({
  title: '',
  date: new Date().toISOString().slice(0, 10),
  priority: 'medium' as 'high' | 'medium' | 'low'
})

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 86400000
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
</script>

<style scoped>
.memo-page {
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

/* 卡片式待办 */
.todo-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  border-left: 4px solid;
}

.todo-card.high {
  border-left-color: #f56c6c;
}

.todo-card.medium {
  border-left-color: #e6a23c;
}

.todo-card.low {
  border-left-color: #909399;
}

.todo-card.completed-card {
  opacity: 0.7;
  background: #f8f9fa;
}

.todo-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.todo-header :deep(.el-checkbox) {
  margin-top: 2px;
}

.todo-title {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #212529;
  word-break: break-word;
  line-height: 1.4;
}

.todo-title.completed {
  text-decoration: line-through;
  color: #adb5bd;
}

.todo-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: 30px;
}

.todo-date {
  font-size: 12px;
  color: #868e96;
}

.todo-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #adb5bd;
  background: #f8f9fa;
  border-radius: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .memo-page {
    padding: 12px;
  }
  
  .todo-footer {
    margin-left: 0;
    justify-content: space-between;
  }
  
  .todo-actions {
    margin-left: 0;
  }
  
  .todo-actions .el-button--small {
    padding: 4px 10px;
  }
}

/* 弹窗移动端适配 */
.memo-dialog :deep(.el-dialog) {
  border-radius: 16px;
}

@media (max-width: 768px) {
  .memo-dialog :deep(.el-dialog) {
    width: 95%;
    margin: 20px auto;
  }
}
</style>