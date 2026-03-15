
// 豆包API调用工具（支持流式响应）
export const getDoubaoStreamResponse = async (messages, callback) => {
  try {
    // 1. 获取API Key（建议从安全存储获取）
    const apiKey = uni.getStorageSync('ARK_API_KEY') || 'd0905dae-b7a0-48bf-b59f-5e82956a05e9'
    
    // 2. 构造请求
    const requestData = {
      model: "doubao-seed-1-6-250615",
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    }

    // 3. 网页版使用fetch API（支持流式）
    if (typeof fetch !== 'undefined') {
      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data:') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.substring(5))
              if (data.choices?.[0]?.delta?.content) {
                const content = cleanContent(data.choices[0].delta.content)
                fullContent += content
                callback(content, false)
              }
            } catch (e) {
              console.warn('解析JSON失败:', e)
            }
          }
        }
      }

      callback('', true)
      return { message: { content: fullContent } }
    }

    // 4. 小程序/App版降级方案
    const [error, response] = await new Promise(resolve => {
      uni.request({
        url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
        method: "POST",
        header: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        data: requestData,
        success: res => resolve([null, res]),
        fail: err => resolve([err, null])
      })
    })

    if (error) throw error
    if (response.statusCode !== 200) {
      throw new Error(response.data?.error?.message || '请求失败')
    }

    const content = cleanContent(response.data.choices[0].message.content)
    callback(content, true)
    return response.data

  } catch (err) {
    console.error('API调用失败:', err)
    callback(`请求出错: ${err.message}`, true)
    throw err
  }
}

// 清理内容（移除markdown等）
const cleanContent = (content) => {
  return content
    .replace(/^#+\s*/gm, '') // 移除标题
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/`{3}.*?\n[\s\S]*?\n`{3}/g, '') // 移除代码块
    .replace(/`(.*?)`/g, '$1') // 移除行内代码
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接
}

// 兼容旧版API
export const getDoubaoResponse = async (messages) => {
  return new Promise(resolve => {
    let fullContent = ''
    getDoubaoStreamResponse(messages, (content, done) => {
      if (!done) {
        fullContent += content
      } else {
        resolve({ message: { content: fullContent } })
      }
    })
  })
}