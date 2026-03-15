<template>
  <view class="container">
    <!-- 医生信息模块 -->
    <view class="user-card" :style="userCardStyle">
      <view class="avatar-container">
        <image src="/static/user/avatar.jpg" class="avatar"></image>
        <view class="user-info">
          <text class="user-name">{{ doctorInfo.name || '未登录医生' }}</text>
          <text class="user-age">{{ doctorInfo.age || '0' }}岁</text>
          
        </view>
      </view>
      <view class="doctor-stats">
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
    
    <!-- 服务统计模块 -->
    <view class="stats-container">
      <view class="stats-header">
        <image src="/static/general/sum-icon.png"></image>
        <text class="stats-title">服务统计</text>
      </view>
      <view class="stats-content">
        <view class="stat-chart">
          <view class="chart-bar" v-for="(item, index) in serviceStats" :key="index">
            <view class="chart-label">{{ item.label }}</view>
            <view class="chart-progress" :style="{width: item.percent + '%'}"></view>
            <view class="chart-value">{{ item.value }}</view>
          </view>
        </view>
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
	<admin-tabbar />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app'
import { useDoctorTokenStore } from '@/stores/token'
import AdminTabbar from '@/tabbar/admin-tabbar.vue'; 
const tokenStore = useDoctorTokenStore()
const darkMode = ref(false)

// 医生信息
const doctorInfo = ref({
  name: '张医生',
  age: 35,
 

})

// 服务统计数据
const serviceStats = ref([
  { label: '订单数量', value: '156单', percent: 80 },
  { label: '服务时长', value: '328小时', percent: 65 },
  { label: '服务评分', value: '4.9分', percent: 98 }
])

// 统计项数据
const statItems = computed(() => [
  { label: '今日预约', value: '12' },
  { label: '本月服务', value: '48' },
  { label: '好评率', value: '98%' }
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
     desc: '查看和编辑个人资料',
     action: () => uni.navigateTo({ url: '/pages/doctor/user/detail' })
   },
  {
    icon: '/static/user/appoint-icon.png',
    title: '我的预约',
    desc: '查看您的护理预约记录',
    action: () => uni.navigateTo({ url: '/pages/doctor/user/appointment' })
  },
  {
    icon: '/static/appointment/comment-icon.png',
    title: '我的评价',
    desc: '查看患者对您的评价',
    action: () => uni.navigateTo({ url: '/pages/doctor/user/comment' })
  },
  {
    icon: '/static/appointment/complaint-icon.png',
    title: '我的投诉',
    desc: '查看患者的投诉记录',
   action: () => uni.navigateTo({ url: '/pages/doctor/user/complaint' })
  },
  {
    icon: '/static/index/info-icon.png',
    title: '我的服务',
    desc: '管理您的服务项目',
    action: () => uni.navigateTo({ url: '/pages/doctor/user/service' })
  }
])

// 处理模块点击
const handleModuleClick = (type) => {
  // 这里可以添加点击后的逻辑
  console.log(`点击了${type}模块`)
}

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}

const clearCache = () => {
  // 清除缓存逻辑
}

const logout = () => {
  // 退出登录逻辑
   uni.showModal({
      title: '确认退出',
      content: '您确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          uni.reLaunch({ url: '/pages/doctor/auth/login' }) // 这里已经实现了跳转到登录页
        }
      }
    })
}

onMounted(() => {
  // 检查登录状态
  if (!tokenStore.isDoctorLoggedIn) {
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/doctor/auth/login' })
    }, 1500)
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

/* 医生信息卡片 */
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
  margin-bottom: 15rpx;
}

.doctor-title {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50rpx;
  padding: 8rpx 20rpx;
  width: fit-content;
  
  text {
    font-size: 26rpx;
  }
}

.doctor-stats {
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
.setting-arrow {
  width: 40rpx;
  height: 40rpx;
}
/* 服务统计模块 */
.stats-container {
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

.stats-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  
  image {
    width: 50rpx;
    height: 50rpx;
    margin-right: 15rpx;
  }
}

.stats-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.stats-content {
  padding-top: 10rpx;
}

.stat-chart {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.chart-bar {
  display: flex;
  align-items: center;
  height: 60rpx;
  position: relative;
}

.chart-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
}

.chart-progress {
  height: 30rpx;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 15rpx;
  position: relative;
  transition: width 1s ease;
  box-shadow: inset 0 2rpx 5rpx rgba(0,0,0,0.1);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.2), transparent);
    border-radius: 15rpx;
  }
}

.chart-value {
  margin-left: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #4CAF50;
  min-width: 120rpx;
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