<template>
  <view class="chat-page">
    <!-- 顶部导航栏 -->
    <view class="chat-header">
      <view class="back-btn" @click="goBack">
        <image src="/static/general/return-icon.png" class="icon-img" />
      </view>
      <text class="chat-title">{{ contactName }}</text>
      <view class="header-actions">
        <view class="action-btn" @click="showHistory">
          <image src="/static/msg/history-icon.png" class="icon-img" />
        </view>
        <view class="action-btn" @click="clearChat">
          <image src="/static/msg/ashbin-icon.png" class="icon-img" />
        </view>
      </view>
    </view>

    <!-- 历史记录面板 -->
    <view v-if="showHistoryPanel" class="history-panel">
      <scroll-view scroll-y class="history-list">
        <view 
          v-for="(item, index) in chatHistoryList" 
          :key="index"
          class="history-item"
          @click="loadHistory(item.id)"
        >
          <text>{{ formatDate(new Date(item.time)) }}</text>
          <text class="preview">{{ item.preview }}</text>
        </view>
      </scroll-view>
      <view class="panel-close" @click="showHistoryPanel = false">
        <image src="/static/icons/close.png" class="icon-img" />
      </view>
    </view>

    <!-- 聊天记录区域 -->
    <scroll-view 
      scroll-y 
      class="chat-content"
      :scroll-into-view="scrollToId"
      :scroll-with-animation="true"
      :style="{ height: chatContentHeight + 'px' }"
    >
      <view 
        v-for="(msg, index) in messages" 
        :key="msg.id"
        :id="'msg-' + msg.id"
        class="chat-message"
        :class="{
          'own-message': msg.isOwn,
          'ai-message': !msg.isOwn,
          'loading': msg.loading
        }"
      >
        <image 
          :src="msg.isOwn ? ownAvatar : contactAvatar" 
          class="avatar" 
          mode="aspectFill"
        />
        
        <view class="message-content">
          <view class="message-bubble">
            <text v-if="msg.type === 'text'">{{ msg.content }}</text>
            <image 
              v-if="msg.type === 'image'" 
              :src="msg.content" 
              class="message-image"
              mode="widthFix"
              @click="previewImage(msg.content)"
            />
          </view>
          
          <view class="message-status">
            <text class="message-time">{{ formatTime(msg.time) }}</text>
            <view v-if="msg.isOwn" class="status-icon">
              <image src="/static/icons/check.png" class="icon-img" />
            </view>
            <view v-if="msg.loading" class="loading-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区域 -->
    <view 
      class="chat-input-area"
      :style="{ paddingBottom: keyboardHeight + 'px' }"
    >
      <view class="input-container">
        <view class="file-btn" @click="openFilePicker">
          <image src="/static/msg/image.png" class="icon-img" />
        </view>
        <input 
          v-model="inputText" 
          class="chat-input" 
          placeholder="输入消息..." 
          @confirm="sendMessage"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
        />
        <view v-if="imageUrl" class="image-preview">
          <image :src="imageUrl" mode="aspectFill" class="preview-img" />
          <view class="clear-img" @click="imageUrl = ''">
            <image src="/static/icons/close.png" class="icon-img" />
          </view>
        </view>
      </view>
      <button 
        class="send-btn" 
        :class="{active: inputText.length > 0 || imageUrl}"
        @click="sendMessage"
        :disabled="!inputText && !imageUrl"
      >
        发送
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { getDoubaoStreamResponse } from '@/utils/doubaoApi.js'
import { chatStorage } from '@/utils/storage.js'

// 基础配置
const contactName = ref('AI医生')
const contactAvatar = ref('/static/msg/ai.jpg')
const ownAvatar = ref('/static/own-avatar.png')

// 消息相关
const messages = ref([])
const inputText = ref('')
const imageUrl = ref('')
const scrollToId = ref('')
const isStreaming = ref(false)
const showHistoryPanel = ref(false)
const chatHistoryList = ref([])

// 布局相关
const chatContentHeight = ref(0)
const keyboardHeight = ref(0)

// 初始化
onMounted(() => {
  calcChatContentHeight()
  loadChatHistory()
  loadHistoryList()
  scrollToBottom()
  
  uni.onKeyboardHeightChange(res => {
    keyboardHeight.value = res.height
    if (res.height > 0) scrollToBottom()
  })
})

// 加载当前聊天记录
const loadChatHistory = () => {
  const history = chatStorage.getCurrentChat()
  messages.value = history.length > 0 ? history : [createWelcomeMessage()]
}

// 加载历史记录列表
const loadHistoryList = () => {
  chatHistoryList.value = chatStorage.getHistoryList()
}

// 创建欢迎消息
const createWelcomeMessage = () => ({
  id: Date.now(),
  type: 'text',
  content: '你好！我是AI医生，你可以通过文字或者图片向我咨询健康问题。',
  time: new Date(),
  isOwn: false,
  loading: false
})

// 发送消息
const sendMessage = async () => {
  if ((!inputText.value.trim() && !imageUrl.value) || isStreaming.value) return
  
  // 保存用户消息
  const userMsg = createMessage(
    imageUrl.value ? 'image' : 'text',
    imageUrl.value || inputText.value.trim(),
    true
  )
  messages.value.push(userMsg)
  
  // 清空输入
  const currentInput = inputText.value
  const currentImage = imageUrl.value
  inputText.value = ''
  imageUrl.value = ''
  
  scrollToBottom()

  // 准备API请求
  const apiMessages = messages.value
    .filter(msg => !msg.loading)
    .map(msg => ({
      role: msg.isOwn ? 'user' : 'assistant',
      content: msg.type === 'text' 
        ? [{ type: 'text', text: msg.content }] 
        : [{ type: 'image_url', image_url: { url: msg.content } }]
    }))

  // 添加loading消息
  const loadingMsg = createMessage('text', '', false, true)
  messages.value.push(loadingMsg)
  isStreaming.value = true
  
  scrollToBottom()

  try {
    let fullContent = ''
    await getDoubaoStreamResponse(apiMessages, (content, done) => {
      if (done) {
        // 完成时替换loading消息
        replaceLoadingMessage(fullContent)
        isStreaming.value = false
        chatStorage.saveCurrentChat(messages.value)
        loadHistoryList()
      } else {
        // 处理流式内容
        const cleanContent = content.replace(/#/g, '')
        fullContent += cleanContent
        updateLoadingMessage(fullContent)
      }
      scrollToBottom()
    })
  } catch (err) {
    console.error('发送失败:', err)
    replaceLoadingMessage(`回复失败：${err.message}`)
    // 恢复用户输入
    inputText.value = currentInput
    if (currentImage) imageUrl.value = currentImage
  }
}

// 创建消息
const createMessage = (type, content, isOwn, loading = false) => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  type,
  content,
  time: new Date(),
  isOwn,
  loading
})

// 更新loading消息
const updateLoadingMessage = (content) => {
  const index = messages.value.findIndex(m => m.loading)
  if (index !== -1) {
    messages.value[index].content = content
  }
}

// 替换loading消息
const replaceLoadingMessage = (content) => {
  const index = messages.value.findIndex(m => m.loading)
  if (index !== -1) {
    messages.value[index] = createMessage('text', content, false)
  }
}

// 打开文件选择器
const openFilePicker = () => {
  // 网页版
  if (typeof window !== 'undefined' && window.FileReader) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file && file.type.match('image.*')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          imageUrl.value = event.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  } 
  // 小程序/App版
  else {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        imageUrl.value = res.tempFilePaths[0]
      }
    })
  }
}

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url
  })
}

// 加载历史记录
const loadHistory = (id) => {
  messages.value = chatStorage.getChatById(id) || [createWelcomeMessage()]
  showHistoryPanel.value = false
  nextTick(() => {
    scrollToBottom()
  })
}

// 显示历史记录
const showHistory = () => {
  loadHistoryList()
  showHistoryPanel.value = true
}

// 清空聊天
const clearChat = () => {
  uni.showModal({
    title: '清空对话',
    content: '确定要清空当前聊天记录吗？',
    success: (res) => {
      if (res.confirm) {
        messages.value = [createWelcomeMessage()]
        chatStorage.saveCurrentChat(messages.value)
        scrollToBottom()
      }
    }
  })
}

// 辅助函数
const calcChatContentHeight = () => {
  const systemInfo = uni.getSystemInfoSync()
  chatContentHeight.value = systemInfo.windowHeight - 50 - 60 - 20 // 根据实际布局调整
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messages.value.length > 0) {
      scrollToId.value = `msg-${messages.value[messages.value.length - 1].id}`
    }
  })
}

const formatTime = (date) => {
  const d = new Date(date)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const formatDate = (date) => {
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return '今天'
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const goBack = () => uni.navigateBack()

const handleInputFocus = (e) => {
  keyboardHeight.value = e.detail.height
  scrollToBottom()
}

const handleInputBlur = () => {
  keyboardHeight.value = 0
}
</script>

<style lang="scss">
/* 基础样式 */
page {
  background-color: #f5f7fa;
  height: 100%;
}

.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f0f7f0;
  background-image: radial-gradient(circle at 10% 20%, rgba(228, 255, 225, 0.5) 0%, rgba(240, 255, 238, 0) 90%);
}

/* 顶部导航栏 */
.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #4CAF50;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
  
  .chat-title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
  }
  
  .back-btn, .action-btn {
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
    
    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
  .icon-img {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }
}

/* 历史记录面板 */
.history-panel {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 20;
  padding: 16px;
  display: flex;
  flex-direction: column;
  
  .history-list {
    flex: 1;
    
    .history-item {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      
      .preview {
        display: block;
        color: #666;
        font-size: 14px;
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      &:active {
        background-color: #f5f5f5;
      }
    }
  }
  
  .panel-close {
    padding: 16px;
    text-align: center;
    
    .icon-img {
      width: 24px;
      height: 24px;
    }
  }
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  
  .chat-message {
    display: flex;
    margin-bottom: 16px;
    transition: all 0.3s ease;
    
    &.own-message {
      flex-direction: row-reverse;
      
      .message-bubble {
        background: #4CAF50;
        color: white;
        border-radius: 18px 18px 4px 18px;
      }
    }
    
    &.ai-message {
      .message-bubble {
        background: white;
        border-radius: 4px 18px 18px 18px;
        animation: fadeIn 0.3s ease;
      }
    }
    
    &.loading {
      .message-bubble {
        min-height: 20px; // 保持加载状态高度
      }
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin: 0 12px;
      background-color: #eee;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .message-content {
      max-width: 75%;
      
      .message-bubble {
        padding: 12px 16px;
        line-height: 1.5;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        word-break: break-word;
        
        .message-image {
          max-width: 200px;
          border-radius: 8px;
        }
      }
      
      .message-status {
        display: flex;
        align-items: center;
        margin-top: 4px;
        font-size: 12px;
        color: #999;
        
        .status-icon .icon-img {
          width: 16px;
          height: 16px;
          margin-left: 4px;
        }
        
        .loading-dots {
          display: flex;
          margin-left: 8px;
          
          .dot {
            width: 6px;
            height: 6px;
            background-color: #999;
            border-radius: 50%;
            margin: 0 2px;
            animation: bounce 1.4s infinite ease-in-out;
            
            &:nth-child(1) { animation-delay: -0.32s; }
            &:nth-child(2) { animation-delay: -0.16s; }
          }
        }
      }
    }
  }
}

/* 底部输入区域 */
.chat-input-area {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  
  .input-container {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f9f5;
    border-radius: 20px;
    padding: 0 12px;
    height: 40px;
    margin-right: 12px;
    transition: all 0.3s ease;
    
    &:active {
      background: #e5f0e5;
    }
  }
  
  .file-btn {
    padding: 8px;
    
    .icon-img {
      width: 24px;
      height: 24px;
    }
  }
  
  .chat-input {
    flex: 1;
    height: 100%;
    font-size: 16px;
    background: transparent;
    color: #333;
  }
  
  .image-preview {
    position: relative;
    width: 30px;
    height: 30px;
    margin-left: 8px;
    border-radius: 6px;
    overflow: hidden;
    
    .clear-img {
      position: absolute;
      right: -3px;
      top: -3px;
      background: rgba(0,0,0,0.5);
      border-radius: 50%;
      width: 16px;
      height: 16px;
      padding: 2px;
      
      .icon-img {
        width: 12px;
        height: 12px;
        filter: brightness(0) invert(1);
      }
    }
  }
  
  .send-btn {
    min-width: 60px;
    height: 40px;
    border-radius: 20px;
    background: #e0f0e0;
    color: #999;
    font-size: 16px;
    border: none;
    transition: all 0.3s ease;
    
    &.active {
      background: #4CAF50;
      color: white;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }
  }
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); } 
  40% { transform: translateY(-5px); }
}
</style>