// 聊天记录存储管理
export const chatStorage = {
  // 获取所有历史记录列表
  getHistoryList() {
    try {
      const records = uni.getStorageSync('chatHistory') || []
      return records.sort((a, b) => new Date(b.time) - new Date(a.time))
    } catch (e) {
      console.error('获取历史记录失败:', e)
      return []
    }
  },

  // 获取当前聊天记录
  getCurrentChat() {
    const currentId = uni.getStorageSync('currentChatId')
    return this.getChatById(currentId) || []
  },

  // 根据ID获取聊天记录
  getChatById(id) {
    try {
      const chats = uni.getStorageSync('chatRecords') || {}
      return chats[id] || []
    } catch (e) {
      console.error('获取聊天记录失败:', e)
      return []
    }
  },

  // 保存当前聊天记录
  saveCurrentChat(messages) {
    try {
      const chatId = uni.getStorageSync('currentChatId') || Date.now().toString()
      const chats = uni.getStorageSync('chatRecords') || {}
      
      // 保存消息
      chats[chatId] = messages.filter(msg => !msg.loading)
      uni.setStorageSync('chatRecords', chats)
      
      // 更新历史记录
      const history = this.getHistoryList()
      const existingIndex = history.findIndex(item => item.id === chatId)
      const preview = this.generatePreview(messages)
      
      if (existingIndex >= 0) {
        history[existingIndex] = {
          id: chatId,
          time: new Date(),
          preview
        }
      } else {
        history.unshift({
          id: chatId,
          time: new Date(),
          preview
        })
      }
      
      uni.setStorageSync('chatHistory', history.slice(0, 50)) // 最多保存50条
      uni.setStorageSync('currentChatId', chatId)
    } catch (e) {
      console.error('保存聊天记录失败:', e)
    }
  },

  // 生成预览文本
  generatePreview(messages) {
    const lastMessage = messages.slice().reverse().find(msg => 
      msg.type === 'text' && !msg.isOwn
    )
    return lastMessage?.content?.substring(0, 30) || '新对话'
  },

  // 清空当前聊天
  clearCurrentChat() {
    try {
      const chatId = uni.getStorageSync('currentChatId')
      if (chatId) {
        const chats = uni.getStorageSync('chatRecords') || {}
        delete chats[chatId]
        uni.setStorageSync('chatRecords', chats)
      }
    } catch (e) {
      console.error('清空聊天失败:', e)
    }
  }
}