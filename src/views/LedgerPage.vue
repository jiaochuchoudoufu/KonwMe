<template>
  <div class="ledger-page">
    <h1>📊 记账本</h1>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">总收入</div>
            <div class="stat-value income">¥{{ store.totalIncome }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">总支出</div>
            <div class="stat-value expense">¥{{ store.totalExpense }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">结余</div>
            <div class="stat-value" :class="store.balance >= 0 ? 'income' : 'expense'">
              ¥{{ store.balance }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 月份筛选器 -->
    <div class="filter-bar">
      <el-date-picker
        v-model="selectedMonth"
        type="month"
        placeholder="选择月份"
        format="YYYY年MM月"
        value-format="yyyy-MM"
        @change="onMonthChange"
      />
    </div>

    <!-- 图表区域（两列卡片布局） -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="12">
        <el-card class="chart-card" header="📈 每日支出趋势">
          <ExpenseChart type="line" :key="chartKey" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card class="chart-card" header="🥧 支出分类占比">
          <ExpenseChart type="pie" :key="chartKey" />
        </el-card>
      </el-col>
    </el-row>

    <!-- AI 分析按钮 -->
    <div class="ai-button-wrapper">
      <el-button 
        type="warning" 
        size="large" 
        @click="openAIAnalysis"
        :loading="aiLoading"
        class="ai-btn"
      >
        🤖 AI 分析我的消费
      </el-button>
    </div>

    <!-- 添加按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="showDialog = true">
        ➕ 添加记录
      </el-button>
    </div>

    <!-- 记录列表 -->
    <el-table :data="store.records" stripe border style="width: 100%">
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
      <el-table-column label="操作" width="150" align="center" fixed="right">
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

    <!-- AI 分析结果弹窗 -->
    <el-dialog v-model="showAiDialog" title="🤖 AI 消费分析" width="90%" class="ai-dialog">
      <div class="ai-content">
        <div v-if="aiLoading" class="ai-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>AI 正在分析中...</span>
        </div>
        <div v-else class="ai-result">
          <div class="typing-text">{{ displayText }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAiDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useLedgerStore, type LedgerRecord } from '../stores/ledger'
import { analyzeExpenseStream } from '../services/ai'
import ExpenseChart from '../components/ExpenseChart.vue'

const store = useLedgerStore()
const showDialog = ref(false)
const editingId = ref<number | null>(null)

// 月份筛选
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const chartKey = ref(0)

const onMonthChange = () => {
  chartKey.value++
}

// AI 相关
const aiLoading = ref(false)
const showAiDialog = ref(false)
const aiResult = ref('')
const displayText = ref('')
let typingTimer: any = null

// 表单数据
const form = reactive({
  type: 'expense' as 'income' | 'expense',
  category: '',
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  note: '',
})

// 分类选项
const categories = computed(() =>
  form.type === 'income'
    ? ['工资', '兼职', '理财', '红包', '其他']
    : ['餐饮', '交通', '购物', '娱乐', '房租', '医疗', '其他']
)

const dialogTitle = computed(() =>
  editingId.value ? '编辑记录' : '添加记录'
)

// 重置表单
const resetForm = () => {
  form.type = 'expense'
  form.category = categories.value[0] || '餐饮'
  form.amount = 0
  form.date = new Date().toISOString().slice(0, 10)
  form.note = ''
  editingId.value = null
}

// 编辑记录
const editRecord = (record: LedgerRecord) => {
  editingId.value = record.id
  form.type = record.type
  form.category = record.category
  form.amount = record.amount
  form.date = record.date
  form.note = record.note || ''
  showDialog.value = true
}

// 保存记录
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

// 删除记录
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

// 监听 aiResult 的变化，实现打字机效果
watch(aiResult, (newText) => {
  if (typingTimer) clearInterval(typingTimer)
  
  displayText.value = ''
  let index = 0
  
  typingTimer = setInterval(() => {
    if (index < newText.length) {
      displayText.value += newText[index]
      index++
    } else {
      clearInterval(typingTimer)
    }
  }, 30)
})

// AI 分析函数
const openAIAnalysis = async () => {
  if (store.records.length === 0) {
    ElMessage.warning('暂无记录，请先添加一些收支记录')
    return
  }
  
  aiLoading.value = true
  showAiDialog.value = true
  aiResult.value = ''
  displayText.value = ''
  
  try {
    await analyzeExpenseStream(store.records, (chunk: string) => {
      aiResult.value += chunk
    })
  } catch (error) {
    aiResult.value = '分析失败，请稍后再试'
  } finally {
    aiLoading.value = false
  }
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card:active {
  transform: translateY(-2px);
}

.stat-content {
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

.filter-bar {
  margin: 20px 0;
  text-align: center;
}

.charts-row {
  margin: 20px 0;
}

.chart-card {
  height: 100%;
}

.action-bar {
  margin-bottom: 20px;
}

.ai-button-wrapper {
  text-align: center;
  margin: 20px 0;
}

.ai-btn {
  width: 80%;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
  background: linear-gradient(135deg, #f59f00, #f76707);
  border: none;
  color: white;
  font-weight: 500;
}

.ai-btn:hover {
  background: linear-gradient(135deg, #f76707, #f59f00);
  transform: translateY(-2px);
}

.ai-dialog :deep(.el-dialog) {
  border-radius: 20px;
}

.ai-content {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.ai-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 150px;
  color: #f59f00;
}

.ai-result {
  line-height: 1.6;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-word;
}

.typing-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.typing-text::after {
  content: '|';
  display: inline-block;
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }
}
</style>