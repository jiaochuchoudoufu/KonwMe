<template>
    <div class="ledger-page">
      <h1>📊 记账本</h1>
  
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-card>
            <div class="stat-card">
              <div class="stat-label">总收入</div>
              <div class="stat-value income">¥{{ store.totalIncome }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div class="stat-card">
              <div class="stat-label">总支出</div>
              <div class="stat-value expense">¥{{ store.totalExpense }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div class="stat-card">
              <div class="stat-label">结余</div>
              <div class="stat-value" :class="store.balance >= 0 ? 'income' : 'expense'">
                ¥{{ store.balance }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 添加按钮 -->
      <div class="action-bar">
        <el-button type="primary" @click="showDialog = true">
          ➕ 添加记录
        </el-button>
      </div>
  
      <!-- 记录列表 -->
      <el-table :data="store.records" stripe border>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'income' : 'expense'">
              {{ row.type === 'income' ? '+' : '-' }}¥{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editRecord(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteRecord(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 添加/编辑弹窗 -->
      <el-dialog v-model="showDialog" :title="dialogTitle" width="500px">
        <el-form :model="form" label-width="80px">
          <el-form-item label="类型">
            <el-radio-group v-model="form.type">
              <el-radio label="income">收入</el-radio>
              <el-radio label="expense">支出</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="form.category" placeholder="请选择">
              <el-option
                v-for="cat in categories"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="金额">
            <el-input-number v-model="form.amount" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker v-model="form.date" type="date" format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.note" placeholder="可选" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="saveRecord">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useLedgerStore, type LedgerRecord } from '../stores/ledger'
  
  const store = useLedgerStore()
  const showDialog = ref(false)
  const editingId = ref<number | null>(null)
  
  const form = reactive({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    note: '',
  })
  
  const categories = computed(() =>
    form.type === 'income'
      ? ['工资', '兼职', '理财', '红包', '其他']
      : ['餐饮', '交通', '购物', '娱乐', '房租', '医疗', '其他']
  )
  
  const dialogTitle = computed(() =>
    editingId.value ? '编辑记录' : '添加记录'
  )
  
  const resetForm = () => {
    form.type = 'expense'
    form.category = categories.value[0]
    form.amount = 0
    form.date = new Date().toISOString().slice(0, 10)
    form.note = ''
    editingId.value = null
  }
  
  const editRecord = (record: LedgerRecord) => {
    editingId.value = record.id
    form.type = record.type
    form.category = record.category
    form.amount = record.amount
    form.date = record.date
    form.note = record.note || ''
    showDialog.value = true
  }
  
  const saveRecord = () => {
    if (!form.amount || form.amount <= 0) {
      ElMessage.warning('请输入金额')
      return
    }
    if (!form.category) {
      ElMessage.warning('请选择分类')
      return
    }
  
    const record = {
      type: form.type,
      amount: form.amount,
      category: form.category,
      date: form.date,
      note: form.note,
    }
  
    if (editingId.value) {
      store.updateRecord(editingId.value, record)
      ElMessage.success('更新成功')
    } else {
      store.addRecord(record)
      ElMessage.success('添加成功')
    }
  
    showDialog.value = false
    resetForm()
  }
  
  const deleteRecord = (id: number) => {
    ElMessageBox.confirm('确定删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      store.deleteRecord(id)
      ElMessage.success('删除成功')
    })
  }
  </script>
  
  <style scoped>
  .ledger-page {
    padding: 20px;
  }
  
  .stats-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    text-align: center;
    padding: 10px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: bold;
  }
  
  .income {
    color: #67c23a;
  }
  
  .expense {
    color: #f56c6c;
  }
  
  .action-bar {
    margin-bottom: 20px;
  }
  </style>