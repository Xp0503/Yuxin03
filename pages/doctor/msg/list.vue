<template>
  <view class="msg-page">
    <!-- 顶部装饰圆 -->
    <view class="decorative-circle">
      <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#4CAF50" fill-opacity="0.1"/>
      </svg>
    </view>

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的消息</text>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      scroll-y 
      class="message-list"
      :style="{ height: scrollHeight + 'px' }"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scroll="handleScroll"
    >
      <!-- 系统公告 -->
      <view class="system-notice">
        <image src="/static/msg/sound.png" class="notice-icon" />
        <text>系统维护通知：本周六凌晨2:00-4:00进行系统升级</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="messages.length === 0" class="empty-state">
        <image src="/static/msg/empty.png" class="empty-icon" />
        <text class="empty-text">暂无消息，开始与朋友交流吧</text>
        <button class="empty-action" @click="composeMessage">写消息</button>
      </view>

      <!-- 消息卡片 -->
      <view 
        v-for="(msg, index) in messages" 
        :key="index"
        class="message-card"
        :class="{ unread: !msg.read }"
        @click="viewMessage(msg)"
        @longpress="showActionSheet(msg, index)"
        :style="{animationDelay: `${index * 0.05}s`}"
      >
        <view class="avatar-container">
          <image :src="msg.avatar" class="avatar" mode="aspectFill"/>
          <view v-if="!msg.read" class="unread-dot"></view>
        </view>
        
        <view class="message-content">
          <view class="message-header">
            <text class="sender-name">{{ msg.sender }}</text>
            <text class="message-time">{{ formatTime(msg.time) }}</text>
          </view>
          
          <text class="message-preview">{{ msg.preview }}</text>
          
          <!-- 消息标签 -->
          <view v-if="msg.tags" class="message-tags">
            <view v-for="(tag, tagIndex) in msg.tags" :key="tagIndex" class="tag">
              {{ tag }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-item" @click="toggleAllRead">
        <image src="/static/msg/read-all.png" class="action-icon" />
        <text>{{ allRead ? '标记未读' : '全部已读' }}</text>
      </view>
      <view class="action-item" @click="deleteAllRead">
        <image src="/static/msg/delete.png" class="action-icon" />
        <text>删除已读</text>
      </view>
    </view>
	<admin-tabbar />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDoctorConversations } from '@/api/message'
import { useDoctorTokenStore } from '@/stores/token'
import AdminTabbar from '@/tabbar/admin-tabbar.vue'; 
const refreshing = ref(false)
const allRead = ref(false) // 全部已读状态
// 使用医生token store
const doctorTokenStore = useDoctorTokenStore()
// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    // 模拟加载新数据
    messages.value = [...mockMessages]
    refreshing.value = false
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  }, 1000)
}

// 动态计算滚动区域高度
const scrollHeight = ref(500)
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  // 计算可用高度 = 屏幕高度 - 状态栏 - 标题栏 - 底部操作栏
  const windowHeight = systemInfo.windowHeight
  const titleBarHeight = 100 // 标题栏估算高度
  const bottomHeight = 80 // 底部操作栏高度
  const padding = 40 // 上下内边距
  
  scrollHeight.value = windowHeight - titleBarHeight - bottomHeight - padding
})
const messages = ref([])
const doctorId = doctorTokenStore.doctor?.id

// 加载会话列表
const loadConversations = async () => {
  try {
	 
		  
    const res = await getDoctorConversations(doctorId)
    messages.value = res.map(conversation => ({
      id: conversation.id,
      conversationId: conversation.id,
      sender: conversation.contact?.name || '用户',
      avatar: conversation.contact?.avatar || '/static/user/avatar.jpg',
      preview: conversation.lastMessage || '开始对话',
      time: new Date(conversation.lastMessageTime),
      read: conversation.unreadCount === 0,
      unreadCount: conversation.unreadCount
    }))
  } catch (error) {
    console.error('加载会话失败:', error)
  }
}

// 查看消息
const viewMessage = (msg) => {
  uni.navigateTo({
    url: `/pages/doctor/msg/msgdet?conversationId=${msg.conversationId}&contactName=${msg.sender}&contactAvatar=${msg.avatar}`
  })
}

onMounted(() => {
  loadConversations()
})


// 格式化时间
const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (1000 * 60))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${diffHours}小时前`
  if (diff < 48 * 60 * 60 * 1000) return '昨天'
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 长按显示操作菜单
const showActionSheet = (msg, index) => {
  uni.vibrateShort()
  uni.showActionSheet({
    itemList: msg.read ? ['标记未读', '删除消息'] : ['标记已读', '删除消息'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 标记已读/未读
        messages.value[index].read = !msg.read
        uni.showToast({
          title: msg.read ? '已标记未读' : '已标记已读',
          icon: 'success'
        })
      } else if (res.tapIndex === 1) {
        // 删除消息
        messages.value.splice(index, 1)
        uni.showToast({
          title: '消息已删除',
          icon: 'success'
        })
      }
    }
  })
}

// 切换全部已读/未读
const toggleAllRead = () => {
  allRead.value = !allRead.value
  messages.value.forEach(msg => {
    msg.read = allRead.value
  })
  
  uni.showToast({
    title: allRead.value ? '全部已读' : '全部未读',
    icon: 'success'
  })
}

// 删除所有已读消息
const deleteAllRead = () => {
  // 过滤出未读消息
  messages.value = messages.value.filter(msg => !msg.read)
  uni.showToast({
    title: '已删除所有已读消息',
    icon: 'success'
  })
}
</script>

<style lang="scss">
/* 确保页面高度100% */
page {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  height: 100%;
  overflow: hidden; /* 防止整个页面滚动 */
}

.msg-page {
  padding: 20rpx 30rpx 100rpx; /* 底部增加内边距避免被操作栏遮挡 */
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
   padding-bottom: 100rpx;
}

.decorative-circle {
  position: absolute;
  left: 50%;
  top: 15%;
  transform: translate(-50%, -50%);
  z-index: 0;
  width: 400rpx;
  height: 400rpx;
  opacity: 0.1;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0 20rpx;
  position: relative;
  z-index: 1;
  
  .page-title {
    font-size: 44rpx;
    font-weight: bold;
    color: #333;
    position: relative;
    padding-left: 20rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8rpx;
      height: 32rpx;
      background: linear-gradient(to bottom, #4CAF50, #2E7D32);
      border-radius: 4rpx;
    }
  }
}

.system-notice {
  display: flex;
  align-items: center;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  color: #2E7D32;
  font-size: 28rpx;
  
  .notice-icon {
    width: 36rpx;
    height: 36rpx;
    margin-right: 12rpx;
  }
}

.message-list {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  text-align: center;
  
  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    opacity: 0.5;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
  
  .empty-action {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: white;
    border: none;
    border-radius: 50rpx;
    padding: 15rpx 50rpx;
    font-size: 30rpx;
    box-shadow: 0 4rpx 15rpx rgba(46, 125, 50, 0.3);
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
      box-shadow: 0 2rpx 8rpx rgba(46, 125, 50, 0.3);
    }
  }
}

.message-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  opacity: 0;
  transform: translateY(30rpx);
  animation: fadeInUp 0.5s ease forwards;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &:active {
    transform: scale(0.98) !important;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  }
  
  &.unread {
    background: rgba(76, 175, 80, 0.05);
    border-left: 6rpx solid #4CAF50;
  }
  
  .avatar-container {
    position: relative;
    margin-right: 24rpx;
    
    .avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background-color: #f0f0f0;
      transition: transform 0.3s ease;
    }
    
    .unread-dot {
      position: absolute;
      top: 0;
      right: 0;
      width: 20rpx;
      height: 20rpx;
      border-radius: 50%;
      background: #ff6b6b;
      border: 2rpx solid white;
    }
  }
  
  .message-content {
    flex: 1;
    
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12rpx;
      
      .sender-name {
        font-size: 34rpx;
        font-weight: 500;
        color: #333;
      }
      
      .message-time {
        font-size: 26rpx;
        color: #999;
      }
    }
    
    .message-preview {
      font-size: 30rpx;
      color: #666;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 8rpx;
    }
    
    .message-tags {
      display: flex;
      flex-wrap: wrap;
      margin-top: 10rpx;
      
      .tag {
        background: rgba(76, 175, 80, 0.1);
        color: #2E7D32;
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        margin-right: 10rpx;
        margin-bottom: 5rpx;
      }
    }
  }
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  padding: 20rpx 0;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
  z-index: 10;
  
  .action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .action-icon {
      width: 48rpx;
      height: 48rpx;
      margin-bottom: 10rpx;
    }
    
    text {
      font-size: 26rpx;
      color: #666;
    }
  }
}
</style>