<template>
    <div class="todo-card">
      <div class="card-header">
        <span class="card-icon">📋</span>
        <span class="card-title">今日待办</span>
        <router-link to="/memo" class="more-link">查看更多 →</router-link>
      </div>
      <div v-if="todayTodos.length === 0" class="empty-todo">
        🎉 今天没有待办，休息一下吧~
      </div>
      <div v-else class="todo-list">
        <div v-for="todo in todayTodos.slice(0, 5)" :key="todo.id" class="todo-item">
          <el-checkbox :model-value="todo.completed" @change="toggleComplete(todo.id)">
            <span :class="{ completed: todo.completed }">{{ todo.title }}</span>
          </el-checkbox>
          <el-tag :type="getPriorityType(todo.priority)" size="small">
            {{ getPriorityText(todo.priority) }}
          </el-tag>
        </div>
        <div v-if="todayTodos.length > 5" class="more-tip">
          还有 {{ todayTodos.length - 5 }} 项待办，点击查看更多
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useMemoStore } from '../stores/memo'
  
  const memoStore = useMemoStore()
  
  const todayTodos = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return memoStore.todos.filter(t => t.date === today && !t.completed)
  })
  
  const getPriorityType = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      default: return 'info'
    }
  }
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高'
      case 'medium': return '中'
      default: return '低'
    }
  }
  
  const toggleComplete = (id: number) => {
    memoStore.toggleComplete(id)
  }
  </script>
  
  <style scoped>
  .todo-card {
    background: white;
    border-radius: 20px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .more-link {
    margin-left: auto;
    font-size: 12px;
    color: #f59f00;
    text-decoration: none;
  }
  
  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .completed {
    text-decoration: line-through;
    color: #adb5bd;
  }
  
  .empty-todo {
    text-align: center;
    padding: 20px;
    color: #adb5bd;
    font-size: 14px;
  }
  
  .more-tip {
    text-align: center;
    font-size: 12px;
    color: #adb5bd;
    margin-top: 8px;
  }
  </style>