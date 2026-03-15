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
          @click="loadHistory(index)"
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
        :key="index"
        :id="'msg-' + index"
        class="chat-message"
        :class="{
          'own-message': msg.isOwn,
          'ai-message': !msg.isOwn,  // 添加ai-message类
          'loading': msg.status === 'sending'
        }"
        @longpress="showMsgMenu(msg, index)"
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
              :src="msg.imageUrl" 
              class="message-image"
              mode="widthFix"
              @click="previewImage(msg.imageUrl)"
            />
          </view>
          
          <view class="message-status">
            <text class="message-time">{{ formatTime(msg.time) }}</text>
            <view v-if="msg.isOwn" class="status-icon">
              <image v-if="msg.status === 'sent'" src="/static/msg/sent-icon.png" class="icon-img" />
              <image v-if="msg.status === 'read'" src="/static/msg/read-icon.png" class="icon-img" />
              <view v-if="msg.status === 'sending'" class="loading-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
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
        <view class="file-btn" @click="showImagePicker">
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

    <!-- 长按菜单 -->
    <view class="msg-menu" v-if="showMenu" @touchmove.prevent>
      <view class="menu-item" @click="copyMessage">复制</view>
      <view class="menu-item" @click="deleteMessage">删除</view>
      <view class="menu-item" @click="closeMenu">取消</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick,watch } from 'vue'
import { onLoad,onShow } from '@dcloudio/uni-app'
import { getMessages, sendMessage as apiSendMessage, markMessagesAsRead } from '@/api/message'
// 状态管理
const contactName = ref('')
const contactAvatar = ref('')
const conversationId = ref(null)
const ownAvatar = ref('/static/user/avatar.jpg')
const messages = ref([]) // 添加缺失的messages定义
const onlineStatus = ref('在线')

// 输入文本
const inputText = ref('')
const imageUrl = ref('')

// 滚动到底部的目标ID
const scrollToId = ref('')

// 聊天内容区域高度
const chatContentHeight = ref(0)

// 键盘高度
const keyboardHeight = ref(0)

// 长按菜单
const showMenu = ref(false)
const selectedMsg = ref(null)
const selectedMsgIndex = ref(-1)

// 历史记录面板
const showHistoryPanel = ref(false)
const chatHistoryList = ref([
  { id: 1, time: new Date(), preview: '您好，有什么可以帮助您的吗？' },
  { id: 2, time: new Date(Date.now() - 86400000), preview: '关于订单的问题' },
  { id: 3, time: new Date(Date.now() - 172800000), preview: '咨询产品信息' }
])

// 加载聊天记录
const loadMessages = async () => {
  if (!conversationId.value) return
  
  try {
    const res = await getMessages(conversationId.value)
    messages.value = res.map(msg => ({
      id: msg.id,
      content: msg.content,
      time: new Date(msg.createTime),
      isOwn: msg.senderType === 1, // 1-用户 2-联系人
      type: 'text',
      status: 'read' // 默认已读
    }))
    
    // 标记消息为已读
    await markMessagesAsRead(conversationId.value)
    
    // 滚动到底部
    nextTick(() => {
      if (messages.value.length > 0) {
        scrollToId.value = 'msg-' + (messages.value.length - 1)
      }
    })
  } catch (error) {
    console.error('加载消息失败:', error)
    uni.showToast({ title: '加载消息失败', icon: 'none' })
  }
}



// 计算聊天区域高度
const calcChatContentHeight = () => {
  const systemInfo = uni.getSystemInfoSync()
  const windowHeight = systemInfo.windowHeight
  const headerHeight = 90 // 顶部导航栏高度
  const inputHeight = 120 // 底部输入区域高度
  const padding = 20 // 额外边距
  
  chatContentHeight.value = windowHeight - headerHeight - inputHeight - padding
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim() && !imageUrl.value) return
  if (!conversationId.value) return
  
  // 构建新消息
  const newMessage = {
    id: Date.now(),
    content: inputText.value || '[图片]',
    time: new Date(),
    isOwn: true,
    type: imageUrl.value ? 'image' : 'text',
    imageUrl: imageUrl.value,
    status: 'sending'
  }
  
  // 添加到本地
  messages.value.push(newMessage)
  inputText.value = ''
  imageUrl.value = ''
  
  // 滚动到底部
  nextTick(() => {
    scrollToId.value = 'msg-' + (messages.value.length - 1)
  })
  
  try {
    // 发送到后端
    await apiSendMessage({
      conversationId: conversationId.value,
      senderType: 1, // 1-用户
      content: newMessage.content
    })
    
    // 更新状态为已发送
    newMessage.status = 'sent'
    
    // 模拟对方回复（实际应由后端推送）
    setTimeout(() => {
      const replyMessage = {
        id: Date.now() + 1,
        content: '收到，我们会尽快处理您的请求',
        time: new Date(),
        isOwn: false,
        type: 'text',
        status: 'sent'
      }
      messages.value.push(replyMessage)
      scrollToId.value = 'msg-' + (messages.value.length - 1)
      
      // 更新自己消息状态为已读
      setTimeout(() => {
        newMessage.status = 'read'
      }, 1000)
    }, 1500)
  } catch (error) {
    console.error('发送消息失败:', error)
    uni.showToast({ title: '发送失败', icon: 'none' })
    newMessage.status = 'failed'
  }
}
// 页面显示时刷新消息
onShow(() => {
  if (conversationId.value) {
    loadMessages()
  }
})
// 格式化时间
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 格式化日期
const formatDate = (date) => {
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return '今天'
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 处理输入框聚焦（键盘弹出）
const handleInputFocus = (e) => {
  // 获取键盘高度
  keyboardHeight.value = e.detail.height
  
  // 滚动到底部
  nextTick(() => {
    if (messages.value.length > 0) {
      scrollToId.value = 'msg-' + (messages.value.length - 1)
    }
  })
}

// 处理输入框失焦（键盘收起）
const handleInputBlur = () => {
  keyboardHeight.value = 0
}

// 显示图片选择器
const showImagePicker = () => {
  // 模拟选择图片
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      imageUrl.value = res.tempFilePaths[0]
    }
  })
}

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url
  })
}

// 显示消息菜单
const showMsgMenu = (msg, index) => {
  selectedMsg.value = msg
  selectedMsgIndex.value = index
  showMenu.value = true
}

// 复制消息
const copyMessage = () => {
  uni.setClipboardData({
    data: selectedMsg.value.content,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'none' })
      closeMenu()
    }
  })
}

// 删除消息
const deleteMessage = () => {
  if (selectedMsgIndex.value !== -1) {
    messages.value.splice(selectedMsgIndex.value, 1)
    closeMenu()
  }
}

// 关闭菜单
const closeMenu = () => {
  showMenu.value = false
  selectedMsg.value = null
  selectedMsgIndex.value = -1
}

// 清空聊天
const clearChat = () => {
  uni.showModal({
    title: '清空对话',
    content: '确定要清空当前聊天记录吗？',
    success: (res) => {
      if (res.confirm) {
        messages.value = [
          {
            id: 1,
            content: '您好，有什么可以帮助您的吗？',
            time: new Date(),
            isOwn: false,
            type: 'text',
            status: 'sent'
          }
        ]
        scrollToId.value = 'msg-0'
      }
    }
  })
}

// 显示历史记录
const showHistory = () => {
  showHistoryPanel.value = true
}

// 加载历史记录
const loadHistory = (index) => {
  // 这里模拟加载历史记录
  messages.value = [
    {
      id: 1,
      content: `历史记录 ${index + 1} 的初始消息`,
      time: new Date(),
      isOwn: false,
      type: 'text',
      status: 'sent'
    }
  ]
  showHistoryPanel.value = false
  nextTick(() => {
    scrollToId.value = 'msg-0'
  })
}
//初始加载
onLoad((options) => {
  // 双重解码处理函数
  const safeDecode = (str) => {
    if (!str) return '';
    try {
      // 尝试双重解码
      const onceDecoded = decodeURIComponent(str);
      // 检查是否还有编码字符
      if (/%[0-9A-Fa-f]{2}/.test(onceDecoded)) {
        return decodeURIComponent(onceDecoded);
      }
      return onceDecoded;
    } catch (e) {
      console.error('解码失败:', e);
      return str;
    }
  };

  if (options.conversationId) {
    conversationId.value = parseInt(options.conversationId);
    console.log('会话ID:', conversationId.value);
  }
  
  if (options.contactName) {
    contactName.value = safeDecode(options.contactName);
    console.log('联系人:', contactName.value);
  }
  
  if (options.contactAvatar) {
    contactAvatar.value = safeDecode(options.contactAvatar);
    console.log('头像:', contactAvatar.value);
  }
  
  // 立即加载消息
  loadMessages();
});
// 初始化时计算高度并滚动到底部
onMounted(() => {
  calcChatContentHeight()
  
  nextTick(() => {
    if (messages.value.length > 0) {
      scrollToId.value = 'msg-' + (messages.value.length - 1)
    }
  })
  
  // 修复：添加环境判断，只在支持该API的平台使用
  if (typeof uni.onKeyboardHeightChange === 'function') {
    uni.onKeyboardHeightChange(res => {
      keyboardHeight.value = res.height
    })
  } else {
    console.log('当前环境不支持uni.onKeyboardHeightChange API')
  }
})

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
  padding: 8px 16px;
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


.header-actions {
  display: flex; 
  gap: 12px; 
}

/* 历史记录面板 */
.history-panel {
  position: absolute;
  top: 48px;
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
    
    /* 添加对方消息样式 - 与detail页面一致 */
    &.ai-message {
      .message-bubble {
        background: white;
        border-radius: 4px 18px 18px 18px;
        animation: fadeIn 0.3s ease;
      }
    }
    
    &.loading {
      .message-bubble {
        min-height: 20px;
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
          margin-top: 8px;
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
    
    .preview-img {
      width: 100%;
      height: 100%;
    }
    
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

/* 消息菜单 */
.msg-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  .menu-item {
    padding: 30rpx 0;
    text-align: center;
    font-size: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    transition: background 0.3s;
    
    &:active {
      background: #f0f8f0;
    }
    
    &:last-child {
      border-bottom: none;
      color: #2E7D32;
      font-weight: bold;
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