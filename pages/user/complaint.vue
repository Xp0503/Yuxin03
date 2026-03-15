<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="profile-header">
      <view class="header-left">
        <view class="back-icon" @click="handleBack">
          <image src="/static/general/return-icon.png"></image>
        </view>
        <text class="header-title">我的投诉</text>
      </view>
    </view>

    <!-- 投诉列表 -->
    <scroll-view 
      class="complaint-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态提示 -->
      <view v-if="complaints.length === 0 && !loading" class="empty-state">
        <image src="/static/general/empty-icon.png" class="empty-icon" />
        <text class="empty-text">暂无投诉记录</text>
        <text class="empty-hint">您还没有任何投诉记录</text>
        <button class="empty-btn" @click="refreshList">刷新试试</button>
      </view>

      <!-- 投诉卡片  -->
      <view 
        v-for="(complaint, index) in complaints" 
        :key="index" 
        class="complaint-card"
        :style="{animationDelay: `${index * 0.05}s`}"
        @click="navigateToDetail(complaint.id)"
      >
        <!-- 服务图片 -->
        <image src="/static/index/info-pic1.jpg" class="service-image" mode="aspectFill"></image>
        
        <!-- 服务信息 -->
        <view class="service-info">
          <view class="info-top">
            <text class="service-name">{{ complaint.serviceName }}</text>
            <view class="status-tag" :class="complaint.statusClass">
              {{ complaint.status }}
            </view>
          </view>
          <text class="service-desc">{{ complaint.serviceDesc }}</text>
          <view class="time-container">
            <view class="time-item">
              <text class="time-icon">📅</text>
              <text class="time-text">{{ complaint.serviceTime }}</text>
            </view>
            <view class="time-item">
              <text class="time-icon">🕒</text>
              <text class="time-text">{{ complaint.complaintTime }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="loading && complaints.length > 0" class="loading-container">
        <text class="loading-text">加载中...</text>
        <view class="loading-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
    </scroll-view>

    <!-- 空列表时的加载提示 -->
    <view v-if="loading && complaints.length === 0" class="loading-container">
      <text class="loading-text">加载中...</text>
      <view class="loading-dots">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTokenStore } from '@/stores/token'
import { getComplaintsByUser } from '@/api/complaint' 

// 使用Pinia tokenStore
const tokenStore = useTokenStore()
// 投诉数据列表
const complaints = ref([])
const loading = ref(true)
const refreshing = ref(false)
const error = ref(null)

// 获取用户投诉列表
const fetchComplaints = async () => {
  try {
    // 检查用户是否登录
    if (!tokenStore.isLoggedIn) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
      }, 1500)
      return
    }
    
    // 获取用户ID
    const userId = tokenStore.user.id
    
    // 使用导入的API方法
    const response = await getComplaintsByUser()
    
    // 处理响应数据 
    complaints.value = response.map(item => ({
      id: item.id,
      serviceImage: item.imageUrls ? item.imageUrls.split(',')[0] : '/static/service/people-icon.png',
      serviceName: `投诉类型: ${getComplaintType(item.type)}`,
      serviceDesc: item.content,
      serviceTime: item.createTime ? formatDate(item.createTime) : '未知时间',
      complaintTime: item.updateTime ? formatDate(item.updateTime) : '未知时间',
      status: getStatusText(item.status),
      statusClass: getStatusClass(item.status)
    }))
    
  } catch (err) {
    console.error('获取投诉列表失败', err)
    error.value = '获取投诉列表失败，请重试'
    uni.showToast({
      title: '获取投诉列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 辅助函数：格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 辅助函数：获取投诉类型文本
const getComplaintType = (type) => {
  const types = {
    1: '服务态度',
    2: '服务质量',
    3: '时间延误',
    4: '费用问题',
    5: '其他'
  }
  return types[type] || '未知类型'
}

// 辅助函数：获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待处理',
    1: '处理中',
    2: '已解决',
    3: '已关闭'
  }
  return statusMap[status] || '未知状态'
}

// 辅助函数：获取状态类名
const getStatusClass = (status) => {
  const classMap = {
    0: 'status-pending',
    1: 'status-processing',
    2: 'status-solved',
    3: 'status-closed'
  }
  return classMap[status] || 'status-pending'
}

// 刷新列表
const refreshList = () => {
  refreshing.value = true
  fetchComplaints()
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  fetchComplaints()
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchComplaints()
})

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}

// 跳转到投诉详情页
const navigateToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/user/comdetail?id=${id}`
  })
}
</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  position: relative;
}

/* 顶部导航栏  */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx 60rpx;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.3);
  border-bottom: 1rpx solid #f1f5f9;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  padding: 30rpx;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200rpx;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    z-index: 0;
  }
}

.header-left {
  display: flex;
  align-items: center;
}

.back-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  transition: all 0.3s ease;
  
  image {
    width: 36rpx;
    height: 36rpx;
  }
  
  &:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 0.3);
  }
}

.header-title {
  font-size: 38rpx;
  font-weight: bold;
  color: white;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

/* 投诉列表 */
.complaint-list {
  height: calc(100vh - 200rpx);
  padding: 0 30rpx 150rpx; /* 增加底部内边距，防止内容被遮挡 */
}

/* 空状态提示 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  text-align: center;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.7;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 15rpx;
  font-weight: bold;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 40rpx;
  padding: 12rpx 50rpx;
  font-size: 28rpx;
  border: none;
  box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.4);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.4);
  }
}

/* 投诉卡片 */
.complaint-card {
  display: flex;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  margin-top: 25rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30rpx);
  animation: fadeInUp 0.5s ease forwards;
  
  &:active {
    transform: translateY(-5rpx) scale(0.99);
    box-shadow: 0 12rpx 30rpx rgba(76, 175, 80, 0.2);
  }
}

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

.service-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 15rpx;
  margin-right: 25rpx;
  flex-shrink: 0;
  object-fit: cover;
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
  flex: 1;
}

.status-tag {
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  color: #fff;
  font-weight: bold;
  min-width: 100rpx;
  text-align: center;
  margin-left: 15rpx;
  flex-shrink: 0;
}

.status-pending {
  background: linear-gradient(135deg, #ff7675, #d63031);
}

.status-processing {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.status-solved {
  background: linear-gradient(135deg, #55efc4, #00b894);
}

.status-closed {
  background: linear-gradient(135deg, #b2bec3, #636e72);
}

.service-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.time-container {
  display: flex;
  justify-content: space-between;
}

.time-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.time-icon {
  margin-right: 8rpx;
  font-size: 28rpx;
}

/* 加载更多 */
.loading-container {
  padding: 30rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.loading-dots {
  display: flex;
  justify-content: center;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  background: #4CAF50;
  border-radius: 50%;
  margin: 0 8rpx;
  animation: bounce 1.4s infinite ease-in-out both;
  
  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式调整 */
@media (max-width: 750px) {
  .service-name {
    font-size: 28rpx;
  }
  
  .service-desc {
    font-size: 24rpx;
  }
  
  .status-tag {
    font-size: 22rpx;
    padding: 4rpx 15rpx;
  }
}
</style>