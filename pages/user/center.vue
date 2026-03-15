<template>
  <view class="container">
    <!-- 用户信息模块 -->
    <view class="user-card" :style="userCardStyle">
      <view class="avatar-container">
        <image src="/static/user/avatar.jpg" class="avatar"></image>
        <view class="user-info">
          <text class="user-name">{{ userInfo.nickname || '未登录用户' }}</text>
          <text class="user-age">{{ userInfo.birth ? calculateAge(userInfo.birth) + '岁' : '未设置年龄' }}</text>
          <view class="health-score">
            <text>健康评分</text>
            <view class="score-container">
              <view class="score-bar" :style="{width: healthScore + '%'}"></view>
            </view>
            <text class="score-value">{{ healthScore }}分</text>
          </view>
        </view>
      </view>
      <view class="user-stats">
        <view 
          class="stat-item"
          v-for="(stat, index) in statItems"
          :key="index"
          :style="{animationDelay: `${index * 0.1}s`}"
        >
          <text class="stat-value">{{ stat.value }}</text>
          <text class="stat-label">{{ stat.label }}</text>
        </view>
      </view>
    </view>
    
    <!-- 功能模块 -->
    <view class="modules-container">
      <view 
        class="module-item" 
        v-for="(module, index) in modules"
        :key="index"
        @click="module.action"
        :style="{animationDelay: `${0.2 + index * 0.05}s`}"
      >
        <view class="module-icon">
          <image :src="module.icon"></image>
        </view>
        <view class="module-info">
          <text class="module-title">{{ module.title }}</text>
          <text class="module-desc">{{ module.desc }}</text>
        </view>
        <view class="module-arrow">
          <image src="/static/general/right-icon.png"></image>
        </view>
      </view>
    </view>
    
    <!-- 健康提醒模块 -->
    <view class="health-reminder" @click="toggleReminder">
      <view class="reminder-header">
        <image src="/static/index/tips-icon.png"></image>
        <text class="reminder-title">今日健康提醒</text>
        <image 
                  :src="reminderExpanded ? '/static/general/up-icon.png' : '/static/general/down-icon.png'" 
                  class="reminder-arrow"
                ></image>
	  </view>
      <view class="reminder-content" v-if="reminderExpanded">
        <text class="reminder-text">定期进行健康检查有助于预防疾病，建议您每月进行一次基础体检。</text>
      </view>
    </view>
    
    <!-- 设置模块 -->
    <view class="setting-container">
      <view class="setting-item" @click="toggleDarkMode">
        <text>修改信息卡片颜色</text>
        <view class="switch" :class="{'active': darkMode}">
          <view class="switch-handle"></view>
        </view>
      </view>
      <view class="setting-item" @click="clearCache">
        <text>清除缓存</text>
        <text class="cache-size">128.5 KB</text>
      </view>
      <view class="setting-item" @click="logout">
        <text>退出登录</text>
         <image src="/static/user/exit-icon.png" class="setting-arrow"></image>
      </view>
    </view>
	<user-tabbar />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app'
import { useTokenStore } from '@/stores/token'
import { getUserAppointments } from '@/api/appointment'
import UserTabbar from '@/tabbar/user-tabbar.vue'; 

const tokenStore = useTokenStore()
const showScrollTop = ref(false)
const reminderExpanded = ref(true)
const darkMode = ref(false)
const healthScore = ref(85)

// 滚动事件处理
onPageScroll((e) => {
  showScrollTop.value = e.scrollTop > 300
})

// 滚动到顶部
const scrollToTop = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300
  })
}

// 计算用户年龄
const calculateAge = (birthDate) => {
  if (!birthDate) return 0
  const birthYear = new Date(birthDate).getFullYear()
  const currentYear = new Date().getFullYear()
  return currentYear - birthYear
}

// 直接使用 store 中的用户信息
const userInfo = ref(tokenStore.user || {})
const appointmentStats = ref({
  total: 0,
  inProgress: 0,
  completed: 0
})

// 统计项数据
const statItems = computed(() => [
  { label: '总预约', value: appointmentStats.value.total },
  { label: '进行中', value: appointmentStats.value.inProgress },
  { label: '已完成', value: appointmentStats.value.completed }
])

// 用户卡片样式
const userCardStyle = computed(() => ({
  background: darkMode.value 
    ? 'linear-gradient(135deg, #55aaff, #0055ff)' 
    : 'linear-gradient(135deg, #4CAF50, #2E7D32)'
}))

// 功能模块数据
const modules = ref([
  {
    icon: '/static/user/user-icon.png',
    title: '个人信息',
    desc: '更新您的个人资料',
    action: () => switchToDetail()
  },
  {
    icon: '/static/user/appoint-icon.png',
    title: '我的预约',
    desc: '查看您的护理预约记录',
    action: () => switchToAppoint()
  },
  {
    icon: '/static/user/complaint-icon.png',
    title: '我的投诉',
    desc: '查看您的护理投诉记录',
    action: () => switchToComplaint()
  },
  {
    icon: '/static/user/address-icon.png',
    title: '地址管理',
    desc: '管理您的服务地址信息',
    action: () => switchToAddress()
  }
])

// 获取预约数据并统计
const fetchAppointments = async () => {
  try {
    const response = await getUserAppointments()
    const appointments = Array.isArray(response) ? response : []
    
    // 统计预约状态
    const stats = {
      total: appointments.length,
      inProgress: appointments.filter(a => 
        a.status === 1 || a.status === 2
      ).length,
      completed: appointments.filter(a => 
        a.status === 3
      ).length
    }
    
    appointmentStats.value = stats
  } catch (error) {
    console.error('获取预约数据失败:', error)
    uni.showToast({
      title: '获取预约数据失败',
      icon: 'none'
    })
  }
}

const switchToDetail = () => {
  uni.navigateTo({ url: '/pages/user/detail' })
}

const switchToAddress = () => {
  uni.navigateTo({ url: '/pages/user/address' })
}

const switchToAppoint = () => {
  uni.navigateTo({ url: '/pages/user/appointment' })
}

const switchToComplaint = () => {
  uni.navigateTo({ url: '/pages/user/complaint' })
}

const toggleReminder = () => {
  reminderExpanded.value = !reminderExpanded.value
}

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  uni.showToast({
    title: darkMode.value ? '已修改信息卡片为蓝色' : '已修改信息卡片为绿色',
    icon: 'none'
  })
}

const clearCache = () => {
  uni.showLoading({ title: '清除中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '缓存已清除',
      icon: 'success'
    })
  }, 800)
}

const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '您确定要退出当前账号吗？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({ url: '/pages/auth/login' })
      }
    }
  })
}

onMounted(() => {
  // 检查登录状态
  if (!tokenStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/auth/login' })
    }, 1500)
  } else {
    // 确保获取最新用户信息
    userInfo.value = tokenStore.user
    fetchAppointments()
    
    // 随机健康评分（模拟）
    healthScore.value = 75 + Math.floor(Math.random() * 20)
  }
})

</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  padding-bottom: 80rpx;
  position: relative;
}

/* 用户信息卡片 */
.user-card {
  border-radius: 24rpx;
  margin: 30rpx;
  padding: 40rpx 30rpx;
  color: white;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  z-index: 2;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200rpx;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    z-index: -1;
  }
}

.avatar-container {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  margin-right: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.reminder-arrow {
  width: 40rpx;
  height: 40rpx;
}

.setting-arrow {
  width: 40rpx;
  height: 40rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 42rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  text-shadow: 0 2rpx 5rpx rgba(0,0,0,0.2);
}

.user-age {
  font-size: 32rpx;
  opacity: 0.9;
  margin-bottom: 20rpx;
}

.health-score {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50rpx;
  padding: 10rpx 20rpx;
  width: fit-content;
  
  text {
    font-size: 26rpx;
    margin-right: 15rpx;
  }
}

.score-container {
  width: 150rpx;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10rpx;
  overflow: hidden;
  margin-right: 15rpx;
}

.score-bar {
  height: 100%;
  background: #fff;
  border-radius: 10rpx;
  transition: width 1s ease;
}

.score-value {
  font-size: 28rpx;
  font-weight: bold;
}

.user-stats {
  display: flex;
  justify-content: space-between;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  padding-top: 30rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  opacity: 0;
  transform: translateY(20rpx);
  animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-value {
  font-size: 44rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  text-shadow: 0 2rpx 5rpx rgba(0,0,0,0.2);
}

.stat-label {
  font-size: 28rpx;
  opacity: 0.9;
}

/* 功能模块 */
.modules-container {
  background-color: #fff;
  border-radius: 24rpx;
  margin: 30rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e8f5e9;
}

.module-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f1f5f9;
  opacity: 0;
  transform: translateX(20rpx);
  animation: fadeInRight 0.5s ease forwards;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.module-icon {
  width: 70rpx;
  height: 70rpx;
  margin-right: 25rpx;
  background: #e8f5e9;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  image {
    width: 40rpx;
    height: 40rpx;
  }
  
  .module-item:active & {
    transform: scale(1.1);
    background: #4CAF50;
  }
}

.module-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.module-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 5rpx;
  transition: color 0.3s ease;
  
  .module-item:active & {
    color: #4CAF50;
  }
}

.module-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.4;
}

.module-arrow {
  width: 40rpx;
  height: 40rpx;
  
  image {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
  }
  
  .module-item:active & image {
    transform: translateX(10rpx);
  }
}

/* 健康提醒 */
.health-reminder {
  background-color: #fff;
  border-radius: 24rpx;
  margin: 30rpx;
  padding: 30rpx;
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e8f5e9;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.99);
  }
}

.reminder-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  image {
    width: 50rpx;
    height: 50rpx;
    margin-right: 15rpx;
  }
}

.reminder-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.reminder-content {
  padding-top: 20rpx;
  border-top: 1rpx dashed #e0f2e1;
}

.reminder-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

/* 设置模块 */
.setting-container {
  background-color: #fff;
  border-radius: 24rpx;
  margin: 30rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e8f5e9;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f1f5f9;
  transition: all 0.3s ease;
  
  &:active {
    background-color: #f8fcf9;
  }
  
  text {
    font-size: 32rpx;
    color: #333;
  }
}

.switch {
  width: 90rpx;
  height: 50rpx;
  background: #e0e0e0;
  border-radius: 30rpx;
  position: relative;
  transition: all 0.3s ease;
  
  &.active {
    background: #4CAF50;
    
    .switch-handle {
      left: 50rpx;
    }
  }
}

.switch-handle {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  background: #fff;
  border-radius: 50%;
  top: 5rpx;
  left: 5rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.2);
}

.cache-size {
  font-size: 28rpx;
  color: #999;
}

</style>