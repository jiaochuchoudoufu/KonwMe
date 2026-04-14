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
          <div v-for="todo in store.completedTodos" :key="todo.id" class="todo-item completed-item">
            <el-checkbox :model-value="todo.completed" @change="toggleComplete(todo.id)">
              <span class="completed">{{ todo.title }}</span>
            </el-checkbox>
            <div class="todo-meta">
              <el-tag :type="getPriorityType(todo.priority)" size="small">
                {{ getPriorityText(todo.priority) }}
              </el-tag>
              <span class="todo-date">完成于: {{ todo.date }}</span>
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
              <el-radio label="high">高</el-radio>
              <el-radio label="medium">中</el-radio>
              <el-radio label="low">低</el-radio>
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
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useMemoStore, type Todo } from '@/stores/memo';

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

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
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
</style>