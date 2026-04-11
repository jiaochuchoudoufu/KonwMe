import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface JournalEntry {
  id: number
  date: string
  mood: 'happy' | 'normal' | 'sad' | 'excited' | 'tired'
  content: string
}

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<JournalEntry[]>([])

  // 加载本地数据
  const loadFromLocal = () => {
    const data = localStorage.getItem('journal_entries')
    if (data) {
      entries.value = JSON.parse(data)
    } else {
      // 示例数据
      entries.value = [
        { id: 1, date: '2025-04-08', mood: 'happy', content: '初始数据可删除' },
        { id: 2, date: '2025-04-09', mood: 'excited', content: '初始数据可删除' },
        { id: 3, date: '2025-04-10', mood: 'normal', content: '初始数据可删除' },
      ]
    }
  }

  // 保存到本地
  const saveToLocal = () => {
    localStorage.setItem('journal_entries', JSON.stringify(entries.value))
  }

  // 添加日记
  const addEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newId = entries.value.length > 0
      ? Math.max(...entries.value.map(e => e.id)) + 1
      : 1
    entries.value.push({ ...entry, id: newId })
    saveToLocal()
  }

  // 更新日记
  const updateEntry = (id: number, entry: Omit<JournalEntry, 'id'>) => {
    const index = entries.value.findIndex(e => e.id === id)
    if (index !== -1) {
      entries.value[index] = { ...entry, id }
      saveToLocal()
    }
  }

  // 删除日记
  const deleteEntry = (id: number) => {
    const index = entries.value.findIndex(e => e.id === id)
    if (index !== -1) {
      entries.value.splice(index, 1)
      saveToLocal()
    }
  }

  // 按日期获取日记
  const getEntryByDate = (date: string) => {
    return entries.value.find(e => e.date === date)
  }

  loadFromLocal()

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryByDate,
  }
})