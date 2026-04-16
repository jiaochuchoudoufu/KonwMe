import axios from 'axios'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

//流式输出
export async function sendMessageStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
): Promise<string> {
    try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            stream: true,  // 开启流式输出
          }),
        })
    
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
    
        while (reader) {
          const { done, value } = await reader.read()
          if (done) break
    
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.slice(6))
                const content = json.choices[0]?.delta?.content || ''
                if (content) {
                  fullContent += content
                  onChunk(content)  // 逐字回调
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
    
        return fullContent
      } catch (error) {
        console.error('AI 请求失败:', error)
        onChunk('AI 服务暂时不可用，请稍后再试。')
        return 'AI 服务暂时不可用，请稍后再试。'
      }
    }
    
    // 分析消费记录（流式版本）
    export async function analyzeExpenseStream(
      records: any[],
      onChunk: (chunk: string) => void
    ): Promise<string> {
      if (records.length === 0) {
        const msg = '暂无消费记录，添加一些记录后我来帮你分析吧～'
        onChunk(msg)
        return msg
      }
    
      const systemPrompt = `你是一个专业的个人理财助手，帮助用户分析消费习惯。回复要简洁友好。`
      
      const userPrompt = `
    请分析以下消费记录，给出：
    1. 消费概况（总支出、主要消费类别）
    2. 消费建议（哪些支出可以优化）
    3. 正能量鼓励
    
    消费记录：
    ${JSON.stringify(records, null, 2)}
    `
      return sendMessageStream(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        onChunk
      )
    }

// 分析待办建议
export async function analyzeTodoSuggestions(todos: any[]) {
  if (todos.length === 0) {
    return '暂无待办，添加一些后我来帮你规划吧～'
  }

  const today = new Date().toISOString().slice(0, 10)
  const overdueTodos = todos.filter(t => t.date < today && !t.completed)
  const todayTodos = todos.filter(t => t.date === today && !t.completed)
  const upcomingTodos = todos.filter(t => t.date > today && !t.completed)

  const systemPrompt = `你是一个时间管理助手，帮助用户规划待办事项。`
  
  const userPrompt = `
请根据以下待办数据，给出：
1. 紧急事项提醒（逾期的待办）
2. 今日重点（今天的待办）
3. 时间管理建议（1-2条）

数据：
- 逾期待办：${overdueTodos.length} 项，标题：${overdueTodos.map(t => t.title).join('、') || '无'}
- 今日待办：${todayTodos.length} 项，标题：${todayTodos.map(t => t.title).join('、') || '无'}
- 未来待办：${upcomingTodos.length} 项

回复要简洁友好，有鼓励性。
`
  return sendMessageStream([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
  () => {}
)
}