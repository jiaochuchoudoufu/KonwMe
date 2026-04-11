import { defineStore } from "pinia";
import {ref, computed} from 'vue';

export interface LedgerRecord {
    id: number
    type: 'income' | 'expense'
    amount: number
    category: string
    date: string
    note?: string 
}

export const useLedgerStore = defineStore('ledger', () => {
     // 状态
    const records = ref<LedgerRecord[]>([])

    //计算属性:总收入
    const totalIncome = computed(() => 
        records.value.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
    )

    //计算属性：总支出
    const totalExpense = computed(() => 
        records.value.filter(r => r.type ==='expense').reduce((sum, r) => sum + r.amount, 0)
    )

    //计算属性：结余
    const balance = computed(() => totalIncome.value - totalExpense.value)

    //保存到 localstorage
    // 保存到 localStorage
    function saveToLocal() {
        localStorage.setItem('ledger_records', JSON.stringify(records.value))
}

    //添加记录
    function addRecord(record: Omit<LedgerRecord, 'id'>) {
        const newId = records.value.length > 0 ? Math.max(...records.value.map(r => r.id)) + 1 : 1
        records.value.push({...record, id: newId})
        saveToLocal()
    }

    //更新记录
    function updateRecord(id: number, record: Omit<LedgerRecord, 'id'>) {
        const index = records.value.findIndex(r => r.id === id)
        if (index !== -1) {
            records.value[index] = { ...record, id }
            saveToLocal()
        }
}

    //删除记录
function deleteRecord(id: number) {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
        records.value.splice(index, 1)
        saveToLocal()
    }
}

    // 从 localStorage 加载
    function loadFromLocal() {
    const data = localStorage.getItem('ledger_records')
    if (data) {
        records.value = JSON.parse(data)
    } else {
      // 添加示例数据
        records.value = [
            { id: 1, type: 'income', amount: 5000, category: '工资', date: '2024-04-01', note: '4月工资(示例数据可删除）' },
            { id: 2, type: 'expense', amount: 68, category: '餐饮', date: '2024-04-02', note: '火锅(示例数据可删除）' },
            { id: 3, type: 'expense', amount: 1200, category: '房租', date: '2024-04-01', note: '4月房租(示例数据可删除）' },
        ]
    }
}
    //初始化加载
    loadFromLocal()

    return{
        records,
        totalIncome,
        totalExpense,
        balance,
        addRecord,
        updateRecord,
        deleteRecord,
    }
})