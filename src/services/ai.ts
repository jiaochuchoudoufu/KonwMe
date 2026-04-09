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