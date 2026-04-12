import { defineStore } from "pinia";
import { ref } from "vue";
import { sendMessageStream } from '../services/ai';

//定义消息类型
export interface ChatMessage {
    id: number
    role: 'user' | 'assistant'  // user: 用户发的, assistant: AI回复的
    content: string
    timestamp: number
}

export const useChatStore = defineStore('chat', () => {
    //会话列表，支持多个会话
    const sessions = ref<{ id: number; title: string; messages: ChatMessage[] }[]>([])
    const currentSessionId = ref<number | null>(null)

    //加载本地存储的聊天记录
    const loadFromLocal = () => {
        const data = localStorage.getItem('chat_sessions')
        if(data){
            sessions.value = JSON.parse(data)
            //如果有对话，默认选中第一个
            if(sessions.value.length > 0) {
                currentSessionId.value = sessions.value[0]?.id || null
            }
        } else {
            //创建默认会话
            const defaultSession = {
                id: Date.now(),
                title: '新对话',
                messages: []
            }
            sessions.value = [defaultSession]
            currentSessionId.value = defaultSession.id
        }
    }

    //保存到本地存储
    const saveToLocal = () => {
        localStorage.setItem('chat_sessions', JSON.stringify(sessions.value))
    }

    //获取当前会话的消息列表
    const currentMessages = () => {
        const session = sessions.value.find(s => s.id === currentSessionId.value)
        return session?.messages || []
    }

    //添加消息到当前会话
    const addMessage = (role: 'user' | 'assistant', content: string) => {
        const session = sessions.value.find(s => s.id === currentSessionId.value)
        if(session) {
            const newMessage: ChatMessage = {
                id: Date.now(),
                role,
                content,
                timestamp: Date.now()
            }
            session.messages.push(newMessage)
            saveToLocal()

            //更新会话标题（取第一条用户消息的前20字）
            if(session.messages.length === 1 && role === 'user') {
                session.title = content.slice(0, 20) + (content.length > 20 ? '...' : '')
                saveToLocal()
            }
        }
    }

    //创建新会话
    const createNewSession = () => {
        const newSession = {
            id: Date.now(),
            title: '新对话',
            messages: []
        }
        sessions.value.unshift(newSession)  //插入到最前面
        currentSessionId.value = newSession.id
        saveToLocal()
        return newSession.id
    }

    //切换会话
    const switchSession = (sessionId: number) => {
        currentSessionId.value = sessionId
    }

    //删除会话
    const deleteSession = (sessionId: number) => {
        const index = sessions.value.findIndex(s => s.id === sessionId)
        if(index !== -1){
            sessions.value.splice(index, 1)
            //如果删除的是当前会话，切换到第一个
            if(currentSessionId.value === sessionId && sessions.value.length > 0) {
                currentSessionId.value === sessions.value[0]?.id
            }else if(sessions.value.length === 0){
                 // 如果没有会话了，创建一个新的
                createNewSession()
            }
            saveToLocal()
        }
    }

    //清空当前会话的所有消息
    const clearCurrentSession = () => {
        const session = sessions.value.find(s => s.id === currentSessionId.value)
        if(session) {
            session.messages = []
            session.title = '新对话'
            saveToLocal()
        }
    }

    // 调用 AI 回复（异步流式）
    const sendToAI = async (
    userMessage: string,
    onChunk: (chunk: string) => void  // 回调函数，每收到一个字就调用一次
        ): Promise<string> => {
        // 构建对话上下文：把最近10条消息传给AI
        const recentMessages = currentMessages().slice(-10)
        const conversationContext = recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
    }))

    // 调用 AI 服务
    const result = await sendMessageStream(
        [
          { role: 'system', content: '你是一个温暖贴心的生活助手...' },
          ...conversationContext,
          { role: 'user', content: userMessage }
        ],
        onChunk
      )

        saveToLocal()
        
      return result
    }

    loadFromLocal()
  
  return {
    sessions,
    currentSessionId,
    currentMessages,
    addMessage,
    createNewSession,
    switchSession,
    deleteSession,
    clearCurrentSession,
    sendToAI
  }
})