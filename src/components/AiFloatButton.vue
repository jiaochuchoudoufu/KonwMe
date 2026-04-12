<template>
    <div class="ai-float-container">
      <!-- 可拖拽的悬浮按钮 -->
      <div 
        ref="dragElement"
        class="ai-float-btn"
        :style="positionStyle"
        @click="openChat"
      >
        <div class="ai-icon">🤖</div>
        <div class="ai-tip-text">{{ tipText }}</div>
      </div>
      
      <!-- AI 聊天抽屉 -->
      <el-drawer
        v-model="drawerVisible"
        title="AI 助手"
        direction="rtl"
        size="400px"
        :with-header="true"
      >
        <div class="chat-container">
          <!-- 会话列表侧边栏 -->
          <div class="chat-sidebar" v-if="showSidebar">
            <div class="sidebar-header">
              <el-button type="primary" size="small" @click="createNewSession">
                + 新对话
              </el-button>
            </div>
            <div class="session-list">
              <div
                v-for="session in chatStore.sessions"
                :key="session.id"
                class="session-item"
                :class="{ active: chatStore.currentSessionId === session.id }"
                @click="switchSession(session.id)"
              >
                <span class="session-title">{{ session.title }}</span>
                <el-icon class="delete-icon" @click.stop="deleteSession(session.id)">
                  <Close />
                </el-icon>
              </div>
            </div>
          </div>
          
          <!-- 聊天主区域 -->
          <div class="chat-main">
            <div class="messages-area" ref="messagesArea">
              <div
                v-for="msg in chatStore.currentMessages()"
                :key="msg.id"
                class="message"
                :class="msg.role"
              >
                <div class="message-avatar">
                  {{ msg.role === 'user' ? '👤' : '🤖' }}
                </div>
                <div class="message-content">{{ msg.content }}</div>
              </div>
              
              <!-- AI 正在输入提示 -->
              <div v-if="isTyping" class="message assistant typing">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                  <span class="typing-dots">...</span>
                </div>
              </div>
            </div>
            
            <!-- 输入区域 -->
            <div class="input-area">
              <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="2"
                placeholder="说点什么吧..."
                @keyup.enter="sendMessage"
              />
              <el-button type="primary" @click="sendMessage" :loading="isTyping">
                发送
              </el-button>
            </div>
          </div>
        </div>
      </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { ElDrawer, ElMessage } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { useChatStore } from '@/stores/chat';
import type { CSSProperties } from 'vue';

const chatStore = useChatStore()
const drawerVisible = ref(false)
const inputMessage = ref('')
const isTyping = ref(false)
const showSidebar = ref(false) //侧边栏默认隐藏，点击展开
const messagesArea = ref<HTMLElement>()
  
  // 悬浮窗提示文字
  const tipText = ref('有什么我可以帮你的吗？')

//悬浮窗位置
const dragElement = ref<HTMLElement>()
const position = ref({ x: window.innerWidth - 80, y: window.innerHeight - 120 })
const positionStyle =  ref<CSSProperties>({
  position: 'fixed',
  left: position.value.x + 'px',
  top: position.value.y + 'px',
})

//滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if(messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
  })
}

//打开聊天
const openChat = () => {
  drawerVisible.value = true
}

//发送消息
const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content) return
  
  // 添加用户消息
  chatStore.addMessage('user', content)
  inputMessage.value = ''
  scrollToBottom()
  
  // 调用 AI
  isTyping.value = true
  let aiResponse = ''
  
  // 先添加一个临时的 AI 消息占位
  chatStore.addMessage('assistant', '')
  scrollToBottom()
  
  try {
    let fullResponse = ''
    // 调用 AI，流式输出
    await chatStore.sendToAI(content, (chunk: string) => {
      fullResponse += chunk
      // 更新最后一条消息（AI的回复）
      const messages = chatStore.currentMessages()
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'assistant') {
      lastMessage.content += chunk  // ← 不报错
    }
    scrollToBottom()
  })
  } catch (error) {
    ElMessage.error('AI 服务出错，请稍后再试')
    // 删除失败的 AI 消息
    const messages = chatStore.currentMessages()
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant' && !lastMessage.content) {
    messages.pop()
  }
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

//创建新对话
const createNewSession = () => {
  chatStore.createNewSession()
}

//切换会话
const switchSession = (sessionId: number) => {
  chatStore.switchSession(sessionId)
  scrollToBottom()
}

// 删除会话
const deleteSession = (sessionId: number) => {
  chatStore.deleteSession(sessionId)
}

//拖拽功能
let isDragging = false
let startX = 0, startY = 0
let startLeft = 0, startTop = 0

const onMouseDown = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.ai-float-btn')) {
    isDragging = true
    startX = e.clientX
    startY = e.clientY
    startLeft = position.value.x
    startTop = position.value.y
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    e.preventDefault()
  }
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  let newLeft = startLeft + dx
  let newTop = startTop + dy

  //边界限制
  newLeft = Math.min(Math.max(0, newLeft), window.innerWidth - 70)
  newTop = Math.min(Math.max(0, newTop), window.innerHeight - 70)
  position.value = { x: newLeft, y: newTop }
  positionStyle.value = {
    position: 'fixed',
    left: newLeft + 'px',
    top: newTop + 'px'
  }
}

const onMouseUp = () => {
  isDragging = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

onMounted(() => {
  document.addEventListener('mousedown', onMouseDown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onMouseDown)
})
</script>

<style scoped>
.ai-float-container {
  position: relative;
  z-index: 1000;
}

.ai-float-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f59f00, #f76707);
  color: white;
  padding: 10px 16px;
  border-radius: 40px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 1000;
}

.ai-float-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.ai-icon {
  font-size: 24px;
}

.ai-tip-text {
  font-size: 14px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 聊天界面样式 */
.chat-container {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fa;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  background: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #f59f00;
  color: white;
}

.message-content {
  max-width: 70%;
  padding: 10px 14px;
  background: white;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message.user .message-content {
  background: #f59f00;
  color: white;
}

.message.assistant .message-content {
  background: white;
  color: #212529;
}

.typing-dots {
  animation: blink 1.4s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.input-area {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.input-area :deep(.el-textarea__inner) {
  resize: none;
}
</style>