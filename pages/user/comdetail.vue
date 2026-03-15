<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-container" @click="handleBack">
        <image src="/static/general/return-icon.png" class="back-icon" />
        <text class="back-text">返回</text>
      </view>
      <text class="title">投诉详情</text>
    </view>
    
    <!-- 详情内容区域 -->
    <scroll-view class="scroll-container" scroll-y>
      <!-- 数据加载完成且存在时显示 -->
      <view class="detail-content" v-if="!loading && complaint.id">
        <!-- 处理状态 -->
        <view class="status-bar">
          <view class="status-container">
            <text class="status-text">处理状态：</text>
            <text class="status-value" :class="statusClass">{{ complaintStatus }}</text>
          </view>
          <view class="status-illustration">
            <image src="/static/general/star-filled.png" class="status-icon" />
          </view>
        </view>

        <!-- 基本信息区域 -->
        <view class="info-section">
          <view class="section-header">
            <text class="section-title">基本信息</text>
            <view class="divider"></view>
          </view>
          
          <view class="info-item">
            <view class="info-left">
              <image src="/static/index/info-icon.png" class="info-icon" />
              <text class="info-label">投诉类型：</text>
            </view>
            <text class="info-value">{{ complaintType }}</text>
          </view>
          
          <view class="info-item">
            <view class="info-left">
              <image src="/static/appointment/calendar-icon.png" class="info-icon" />
              <text class="info-label">投诉时间：</text>
            </view>
            <text class="info-value">{{ formatDate(complaint.createTime) }}</text>
          </view>
          
          <view class="info-item">
            <view class="info-left">
              <image src="/static/appointment/time-icon.png" class="info-icon" />
              <text class="info-label">更新时间：</text>
            </view>
            <text class="info-value">{{ formatDate(complaint.updateTime) }}</text>
          </view>
          
          <!-- 修改订单ID布局 -->
          <view class="info-item">
            <view class="info-left">
              <image src="/static/msg/send-icon.png" class="info-icon" />
              <text class="info-label">订单ID：</text>
            </view>
            <view class="info-right">
              <text class="info-value">{{ complaint.orderId || '无关联订单' }}</text>
              <button class="copy-btn" @click="copyToClipboard(complaint.orderId || '')">
                <image src="/static/general/copy-icon.png" class="copy-icon" />
                复制
              </button>
            </view>
          </view>
          
          <!-- 修改联系方式布局 -->
          <view class="info-item">
            <view class="info-left">
              <image src="/static/appointment/phone-icon.png" class="info-icon" />
              <text class="info-label">联系方式：</text>
            </view>
            <view class="info-right">
              <!-- 静态数据：后端未提供用户手机号 -->
              <text class="info-value">{{ userPhone }}</text>
              <button class="copy-btn" @click="copyToClipboard(userPhone)">
                <image src="/static/general/copy-icon.png" class="copy-icon" />
                复制
              </button>
            </view>
          </view>
        </view>
        
        <!-- 问题描述区域 -->
        <view class="description-section">
          <view class="section-header">
            <text class="section-title">问题描述</text>
            <view class="divider"></view>
          </view>
          
          <view class="description-box" :class="{'expanded': expandedDescription}">
            {{ complaint.content || '暂无描述' }}
          </view>
        </view>

        <!-- 处理结果 -->
        <view class="result-section" v-if="showResult">
          <view class="section-header">
            <text class="section-title">处理结果</text>
            <view class="divider"></view>
          </view>
          
          <view class="result-box">
            {{ complaint.feedback || '暂无处理反馈' }}
          </view>
          
          <!-- 静态数据：后端未提供评分功能 -->
          <view class="feedback-rating" v-if="showResult">
            <text class="rating-label">服务评分：</text>
            <view class="rating-images">
              <image 
                v-for="star in 5" 
                :key="star" 
                :src="star <= rating ? '/static/general/star-filled.png' : '/static/general/star.png'"
                class="rating-star"
                @click="setRating(star)"
              />
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-buttons" v-if="showActions">
          <button class="action-btn cancel" @click="handleCancel">取消投诉</button>
          <button class="action-btn appeal" @click="handleAppeal">申诉处理</button>
        </view>
      </view>
      
      <!-- 数据为空时的提示 -->
      <view v-else-if="!loading && !complaint.id" class="empty-container">
        <image src="/static/general/empty-icon.png" class="empty-icon" />
        <text class="empty-text">投诉详情不存在</text>
      </view>
    </scroll-view>
    
    <!-- 重构后的骨架屏 -->
    <view class="skeleton-container" v-if="loading">
      <view class="skeleton-card">
        <view class="skeleton-header">
          <view class="skeleton-line" style="width: 60%; height: 50rpx;"></view>
          <view class="skeleton-avatar"></view>
        </view>
      </view>
      
      <view class="skeleton-card">
        <view class="skeleton-header">
          <view class="skeleton-line" style="width: 40%; height: 40rpx;"></view>
        </view>
        <view class="skeleton-item" v-for="i in 4" :key="i">
          <view class="skeleton-icon"></view>
          <view class="skeleton-info">
            <view class="skeleton-line" style="width: 30%; height: 30rpx;"></view>
            <view class="skeleton-line" style="width: 70%; height: 40rpx;"></view>
          </view>
        </view>
      </view>
      
      <view class="skeleton-card">
        <view class="skeleton-header">
          <view class="skeleton-line" style="width: 40%; height: 40rpx;"></view>
        </view>
        <view class="skeleton-content">
          <view class="skeleton-line" style="width: 100%; height: 40rpx;"></view>
          <view class="skeleton-line" style="width: 90%; height: 40rpx;"></view>
          <view class="skeleton-line" style="width: 80%; height: 40rpx;"></view>
        </view>
      </view>
      
      <view class="skeleton-card" v-if="showResult">
        <view class="skeleton-header">
          <view class="skeleton-line" style="width: 40%; height: 40rpx;"></view>
        </view>
        <view class="skeleton-content">
          <view class="skeleton-line" style="width: 100%; height: 40rpx;"></view>
          <view class="skeleton-line" style="width: 70%; height: 40rpx;"></view>
        </view>
        <view class="skeleton-rating">
          <view class="skeleton-line" style="width: 30%; height: 40rpx;"></view>
          <view class="skeleton-stars">
            <view class="skeleton-star" v-for="i in 5" :key="i"></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 操作成功提示 -->
    <view class="success-toast" v-if="showSuccessToast">
      <image src="/static/general/success-icon.png" class="toast-icon" />
      <text>{{ successMessage }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getComplaintDetail } from '@/api/complaint'
import { useTokenStore } from '@/stores/token'

const route = useRoute()
const tokenStore = useTokenStore()

// 投诉详情数据 - 初始化为空对象避免访问属性错误
const complaint = ref({})
const loading = ref(false)
// 静态数据：后端未提供用户手机号
const userPhone = ref("13800138000") 
const expandedDescription = ref(false)
// 静态数据：后端未提供评分功能
const rating = ref(0) 
const showSuccessToast = ref(false)
const successMessage = ref("")

// 获取投诉ID
const complaintId = ref(route.query.id || 1)

// 计算属性 - 投诉状态
const complaintStatus = computed(() => {
  if (complaint.value.status === undefined || complaint.value.status === null) {
    return "未知状态"
  }
  switch(complaint.value.status) {
    case 0: return "待处理"
    case 1: return "处理中"
    case 2: return "已解决"
    case 3: return "已关闭"
    default: return "未知状态"
  }
})

// 计算属性 - 状态样式类
const statusClass = computed(() => {
  if (complaint.value.status === undefined || complaint.value.status === null) {
    return "status-unknown"
  }
  switch(complaint.value.status) {
    case 0: return "status-pending"
    case 1: return "status-processing"
    case 2: return "status-solved"
    case 3: return "status-closed"
    default: return "status-unknown"
  }
})

// 计算属性 - 投诉类型映射
const complaintType = computed(() => {
  if (complaint.value.type === undefined || complaint.value.type === null) {
    return "未知类型"
  }
  switch(complaint.value.type) {
    case 1: return "服务质量"
    case 2: return "服务态度"
    case 0: return "其他"
    case 3: return "迟到" // 新增类型3的映射
    default: return "未知类型"
  }
})

// 计算属性 - 是否显示处理结果
const showResult = computed(() => {
  return [2, 3].includes(complaint.value.status || -1)
})

// 计算属性 - 是否显示操作按钮
const showActions = computed(() => {
  return [0, 1].includes(complaint.value.status || -1)
})

// 返回上一页
const handleBack = () => {
  uni.navigateBack({
    animationType: 'slide-out-right',
    animationDuration: 300
  })
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  
  try {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } catch (e) {
    return '格式错误'
  }
}

// 复制到剪贴板
const copyToClipboard = (text) => {
  if (!text) return;
  
  uni.setClipboardData({
    data: text,
    success: () => {
      showSuccessToast.value = true;
      successMessage.value = "已复制到剪贴板";
      setTimeout(() => {
        showSuccessToast.value = false;
      }, 2000);
    }
  });
}

// 设置评分 (静态功能)
const setRating = (stars) => {
  rating.value = stars
  showSuccessToast.value = true
  successMessage.value = "评分已提交"
  setTimeout(() => {
    showSuccessToast.value = false
  }, 2000)
}

// 取消投诉
const handleCancel = () => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消此投诉吗？',
    success: (res) => {
      if (res.confirm) {
        showSuccessToast.value = true
        successMessage.value = "投诉已取消"
        setTimeout(() => {
          showSuccessToast.value = false
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

// 申诉处理 (静态功能)
const handleAppeal = () => {
  showSuccessToast.value = true
  successMessage.value = "已提交申诉请求"
  setTimeout(() => {
    showSuccessToast.value = false
  }, 2000)
}

// 获取投诉详情
const fetchComplaintDetail = async () => {
  try {
    loading.value = true
    // 使用后端API获取数据
    const response = await getComplaintDetail(complaintId.value)
    complaint.value = response || {}
    
    // 模拟延迟，实际开发中可移除
    await new Promise(resolve => setTimeout(resolve, 300));
    
  } catch (err) {
    console.error('获取投诉详情失败', err)
    showSuccessToast.value = true
    successMessage.value = "获取投诉详情失败"
    setTimeout(() => {
      showSuccessToast.value = false
    }, 2000)
    complaint.value = {}
  } finally {
    loading.value = false
  }
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchComplaintDetail()
})
</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  position: relative;
}

/* 新增图标样式 */
.back-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 10rpx;
}

.info-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 15rpx;
}

.copy-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 5rpx;
}

.toast-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 15rpx;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  padding: 60rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.3);
  position: relative;
  overflow: hidden;
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

.back-container {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx 12rpx 15rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  z-index: 1;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }
}

.back-icon {
  margin-right: 10rpx;
}

.back-text {
  font-size: 28rpx;
  color: #fff;
}

.title {
  font-size: 38rpx;
  font-weight: bold;
  color: #fff;
  flex: 1;
  text-align: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

/* 滚动容器  */
.scroll-container {
  height: calc(100vh - 180rpx);
  padding: 0 30rpx;
  box-sizing: border-box;
}

.detail-content {
  padding: 30rpx 0 60rpx;
}

/* 处理状态 */
.status-bar {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeIn 0.6s ease;
}

.status-container {
  flex: 1;
}

.status-text {
  font-size: 30rpx;
  color: #666;
  margin-right: 15rpx;
}

.status-value {
  font-size: 34rpx;
  font-weight: bold;
  position: relative;
  padding-left: 40rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
  }
}

.status-pending {
  color: #ff6b6b;
  
  &::before {
    background-color: #ff6b6b;
  }
}

.status-processing {
  color: #ffb859;
  
  &::before {
    background-color: #ffb859;
    animation: pulse 1.5s infinite;
  }
}

.status-solved {
  color: #55e6c1;
  
  &::before {
    background-color: #55e6c1;
  }
}

.status-closed {
  color: #999;
  
  &::before {
    background-color: #999;
  }
}

.status-unknown {
  color: #a0a0a0;
  
  &::before {
    background-color: #a0a0a0;
  }
}

.status-illustration {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  width: 100rpx;
  height: 100rpx;
}

/* 通用区域样式 */
.section-header {
  margin-bottom: 30rpx;
  position: relative;
}

.section-title {
  font-size: 34rpx;
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

.divider {
  height: 2rpx;
  background: linear-gradient(to right, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.8), rgba(76, 175, 80, 0.2));
  margin-top: 20rpx;
}

/* 基本信息区域 */
.info-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  animation: slideIn 0.5s ease;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 25rpx 0;
  border-bottom: 1px solid #f0f5f0;
  align-items: center;
}

.info-item:last-child {
  border-bottom: none;
}

.info-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.info-label {
  font-size: 30rpx;
  color: #666;
  margin-left: 15rpx;
  white-space: nowrap;
}

.info-value {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  text-align: right;
}

.info-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  flex: 1;
  min-width: 0;
}

/* 订单ID和联系方式文本样式 */
.info-right .info-value {
  flex: 1;
  word-break: break-all;
  font-size: 30rpx;
  color: #1a5f8e;
  font-weight: 500;
  text-align: right;
  padding-right: 20rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 80rpx;
}

/* 复制按钮样式 */
.copy-btn {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 6rpx 20rpx 6rpx 15rpx;
  font-size: 24rpx;
  height: 50rpx;
  transition: all 0.3s ease;
  flex-shrink: 0;
  white-space: nowrap;
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
  
  &:active {
    transform: scale(0.95);
    opacity: 0.9;
    box-shadow: 0 0 10rpx rgba(76, 175, 80, 0.5);
  }
}

/* 窄屏适配 */
@media (max-width: 768px) {
  .info-right .info-value {
    text-align: left;
    -webkit-line-clamp: 2;
    max-height: 80rpx;
  }
  
  .copy-btn {
    position: relative;
    right: 0;
  }
}

/* 问题描述区域 */
.description-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  animation: slideIn 0.6s ease;
}

.description-box {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  padding: 25rpx;
  background-color: #f9fcf9;
  border-radius: 15rpx;
  min-height: 150rpx;
  max-height: 300rpx;
  overflow: hidden;
  transition: all 0.4s ease;
  
  &.expanded {
    max-height: none;
    overflow: visible;
  }
}

/* 处理结果区域 */
.result-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  animation: slideIn 0.7s ease;
}

.result-box {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  padding: 25rpx;
  background-color: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 15rpx;
  min-height: 150rpx;
}

.feedback-rating {
  display: flex;
  align-items: center;
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1px dashed #e0f2e9;
}

.rating-images {
  display: flex;
}

.rating-star {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(1.3);
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
  gap: 30rpx;
}

.action-btn {
  flex: 1;
  border-radius: 50rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active::after {
    opacity: 1;
  }
}

.cancel {
  background: #f8f8f8;
  color: #666;
  border: 1px solid #e0e0e0;
  
  &:active {
    background: #f0f0f0;
  }
}

.appeal {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.4);
  
  &:active {
    transform: translateY(5rpx);
    box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.4);
  }
}

/* 重构骨架屏样式 */
.skeleton-container {
  position: absolute;
  top: 180rpx;
  left: 30rpx;
  right: 30rpx;
  padding-bottom: 60rpx;
  z-index: 10;
}

.skeleton-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.6), 
      transparent
    );
    animation: skeleton-loading 1.5s infinite;
  }
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.skeleton-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #e8f5e9;
}

.skeleton-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
}

.skeleton-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #e8f5e9;
  margin-right: 15rpx;
}

.skeleton-info {
  flex: 1;
}

.skeleton-content {
  padding: 20rpx 0;
}

.skeleton-rating {
  display: flex;
  align-items: center;
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1px dashed #e0f2e9;
}

.skeleton-stars {
  display: flex;
  margin-left: 20rpx;
}

.skeleton-star {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #e8f5e9;
  margin-right: 10rpx;
}

.skeleton-line {
  background: #e8f5e9;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

/* 操作成功提示 */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  z-index: 2000;
  animation: fadeInOut 2s ease;
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.5;
  margin-bottom: 40rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(30rpx); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 184, 89, 0.4); }
  70% { box-shadow: 0 0 0 20rpx rgba(255, 184, 89, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 184, 89, 0); }
}

@keyframes skeleton-loading {
  100% {
    left: 100%;
  }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -40%); }
  20% { opacity: 1; transform: translate(-50%, -50%); }
  80% { opacity: 1; transform: translate(-50%, -50%); }
  100% { opacity: 0; transform: translate(-50%, -60%); }
}
</style>