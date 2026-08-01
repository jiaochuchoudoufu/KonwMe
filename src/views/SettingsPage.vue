<template>
    <div class="settings-page">
      <div class="page-header">
        <el-icon class="page-icon"><Setting /></el-icon>
        <h1>设置</h1>
      </div>
  
      <el-card class="settings-card">
        <template #header>
          <span>🤖 AI 配置</span>
        </template>
  
        <el-form label-width="140px">
          <el-form-item label="DeepSeek API Key">
            <el-input
              v-model="deepseekKey"
              type="password"
              placeholder="请输入你的 DeepSeek API Key"
              show-password
              clearable
            />
            <div class="form-tip">
              <span>💡 在 </span>
              <a href="https://platform.deepseek.com/api_keys" target="_blank">DeepSeek 平台</a>
              <span> 获取你的 API Key（充值 3 元可用很久）</span>
            </div>
          </el-form-item>
  
          <el-form-item>
            <el-button type="primary" @click="saveKeys" :loading="saving">
              💾 保存配置
            </el-button>
            <el-button @click="resetKeys">恢复默认</el-button>
          </el-form-item>
  
          <el-divider />
  
          <div class="status-info">
            <p>
              <span class="status-label">当前状态：</span>
              <el-tag :type="hasDeepseekKey ? 'success' : 'warning'">
                {{ hasDeepseekKey ? '已配置 DeepSeek Key' : '未配置（将使用默认 Key）' }}
              </el-tag>
            </p>
            <p class="tip-text">
              ⚠️ 你的 API Key 仅保存在本地浏览器中，不会上传到任何服务器。
            </p>
            <p class="tip-text">
              🌤️ 天气服务使用默认 Key，无需配置。
            </p>
          </div>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Setting } from '@element-plus/icons-vue'
  
  const deepseekKey = ref('')
  const saving = ref(false)
  
  const hasDeepseekKey = computed(() => !!deepseekKey.value)
  
  const loadKeys = () => {
    deepseekKey.value = localStorage.getItem('user_deepseek_key') || ''
  }
  
  const saveKeys = () => {
    saving.value = true
    try {
      if (deepseekKey.value.trim()) {
        localStorage.setItem('user_deepseek_key', deepseekKey.value.trim())
      } else {
        localStorage.removeItem('user_deepseek_key')
      }
      ElMessage.success('配置保存成功！')
      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      ElMessage.error('保存失败')
    } finally {
      saving.value = false
    }
  }
  
  const resetKeys = () => {
    localStorage.removeItem('user_deepseek_key')
    loadKeys()
    ElMessage.info('已恢复默认配置')
  }
  
  onMounted(() => {
    loadKeys()
  })
  </script>
  
  <style scoped>
  .settings-page {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .page-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    border-bottom: 3px solid #f59f00;
    padding-bottom: 12px;
    width: fit-content;
  }
  
  .page-icon {
    font-size: 28px;
    color: #f59f00;
  }
  
  .page-header h1 {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    border: none;
    padding: 0;
  }
  
  .settings-card {
    border-radius: 16px;
  }
  
  .form-tip {
    font-size: 12px;
    color: #868e96;
    margin-top: 4px;
  }
  
  .form-tip a {
    color: #f59f00;
    text-decoration: none;
  }
  
  .form-tip a:hover {
    text-decoration: underline;
  }
  
  .status-info {
    margin-top: 8px;
  }
  
  .status-label {
    font-weight: 500;
    color: #2c3e50;
  }
  
  .tip-text {
    font-size: 12px;
    color: #868e96;
    margin-top: 8px;
  }
  </style>