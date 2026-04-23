import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Todo {
    id: number
    title: string
    completed: boolean
    date: string // 截止日期 YYYY-MM-DD
    priority: 'high' | 'medium' | 'low'  // 优先级
    createdAt: number
}

export const useMemoStore = defineStore ('memo', () => {
    const todos = ref<Todo[]>([])

    //加载本地数据
    const loadFromLocal = () => {
        const data = localStorage.getItem('memo_todos')
        if(data){
            todos.value = JSON.parse(data)
        } else {
            // 示例数据
            todos.value = [
                {
                  id: 1,
                  title: '洗碗(示例数据)',
                  completed: true,
                  date: '2025-04-10',
                  priority: 'high',
                  createdAt: Date.now()
                },
                {
                  id: 2,
                  title: '洗衣服(示例数据)',
                  completed: false,
                  date: '2025-04-15',
                  priority: 'medium',
                  createdAt: Date.now()
                },
                {
                  id: 3,
                  title: '睡觉(示例数据)',
                  completed: false,
                  date: '2025-04-12',
                  priority: 'low',
                  createdAt: Date.now()
                }
              ]
        }
    }

    //保存到本地
    const saveToLocal = () => {
        localStorage.setItem('memo_todos', JSON.stringify(todos.value))
    }

    //添加代办
    const addTodo = (todo: Omit<Todo, 'id' | 'createdAt'>) => {
        const newId = todos.value.length > 0
            ? Math.max(...todos.value.map(t => t.id)) + 1 : 1
        todos.value.push({
            ...todo,
            id: newId,
            createdAt: Date.now()
        })
        saveToLocal()
    }

    // 更新待办
  const updateTodo = (id: number, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
        todos.value[index] = Object.assign({}, todos.value[index], updates)
        saveToLocal()
    }
  }

  // 删除待办
  const deleteTodo = (id: number) => {
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      todos.value.splice(index, 1)
      saveToLocal()
    }
  }

  // 切换完成状态
  const toggleComplete = (id: number) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      saveToLocal()
    }
  }

  // 获取未完成的待办
  const incompleteTodos = computed(() => 
    todos.value.filter(t => !t.completed).sort((a, b) => a.date.localeCompare(b.date))
  )

  // 获取已完成的待办
  const completedTodos = computed(() => 
    todos.value.filter(t => t.completed).sort((a, b) => b.date.localeCompare(a.date))
  )

  // 获取今天的待办
  const todayTodos = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return todos.value.filter(t => t.date === today && !t.completed)
  })

  // 检查并发送提醒
  const checkAndNotify = () => {
    const today = new Date().toISOString().slice(0, 10)
    const todayUncompleted = todos.value.filter(t => t.date === today && !t.completed)
    
    if (todayUncompleted.length > 0 && Notification.permission === 'granted') {
      const titles = todayUncompleted.map(t => t.title).join('、')
      new Notification('今日待办提醒', {
        body: `你今天还有 ${todayUncompleted.length} 项待办未完成：${titles}`,
        icon: '/favicon.ico'
      })
    }
  }

  loadFromLocal()

  // 请求通知权限
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }

  return {
    todos,
    incompleteTodos,
    completedTodos,
    todayTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    checkAndNotify
  }
})