<template>
  <view class="container">
    <!-- 分类顶部横幅 -->
    <view class="category-header" :style="headerStyle">
      <view class="back-btn" @click="handleBack">
        <image src="/static/general/return-icon.png" class="back-icon" />
      </view>
      <text class="category-title">{{ categoryName }}</text>
      <image :src="categoryBanner" class="banner-bg" mode="aspectFill"></image>
      <view class="overlay"></view>
    </view>

    <!-- 推荐护理服务 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">{{ categoryName }}服务</text>
      </view>
      
      <!-- 骨架屏 -->
      <view v-if="loading" class="skeleton-container">
        <view v-for="i in 3" :key="i" class="skeleton-card">
          <view class="skeleton-image"></view>
          <view class="skeleton-content">
            <view class="skeleton-line" style="width: 70%"></view>
            <view class="skeleton-line" style="width: 40%"></view>
            <view class="skeleton-line" style="width: 90%"></view>
            <view class="skeleton-line" style="width: 60%"></view>
          </view>
        </view>
      </view>
      
      <!-- 服务列表 -->
      <view v-else class="service-list">
        <view 
          v-for="(service, index) in services" 
          :key="service.id" 
          class="service-card"
          @click="navigateToDetail(service.id)"
          :style="{animationDelay: `${index * 0.05}s`}"
        >
          <image :src="service.image" class="service-image" mode="aspectFill"></image>
          <view class="service-content">
            <view class="service-header">
              <text class="service-name">{{ service.name }}</text>
              <text class="service-price">¥{{ service.price }}</text>
            </view>
            <text class="service-desc">{{ service.description }}</text>
            <view class="service-footer">
              <button class="appointment-btn" @click.stop="handleBook(service.id)">
                立即预约
                <view class="arrow-icon">→</view>
              </button>
            </view>
          </view>
        </view>
      </view>
      <!-- 无数据提示 -->
      <view v-if="!loading && services.length === 0" class="empty-container">
        <image src="/static/empty.png" class="empty-icon"></image>
        <text class="empty-text">暂无相关服务</text>
        <button class="retry-btn" @click="loadCategoryServices">重新加载</button>
      </view>
    </view>

    <!-- 返回顶部按钮 -->
    <view class="scroll-top-btn" @click="scrollToTop" v-if="showScrollTop">
      <image src="/static/general/up-icon.png" class="scroll-top-icon" />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onPageScroll, onPullDownRefresh } from '@dcloudio/uni-app'
import { getActiveServicesByCategory } from '@/api/service'

// 用户状态
const user = ref(null)
// 分类ID
const categoryId = ref(null)
// 护理服务数据
const services = ref([])
// 加载状态
const loading = ref(true)
// 滚动显示按钮
const showScrollTop = ref(false)

// 分类名称映射
const categoryNames = {
  1: '生活护理',
  2: '健康监测',
  3: '康复训练',
  4: '专业护理',
  5: '健康咨询',
  6: '特殊护理',
  7: '应急医疗',
  8: '智能设备'
}

// 在顶部定义图片数组
const localServiceImages = [
  '/static/service/default1.jpg',
  '/static/service/default2.jpg',
  '/static/service/default3.jpg',
  '/static/service/default4.jpg',
  '/static/service/default5.jpg',
  '/static/service/default6.jpg'
]


// 分类背景映射
const categoryBanners = {
  1: '/static/category/banner1.jpg',
  2: '/static/category/banner2.jpg',
  3: '/static/category/banner3.jpg',
  4: '/static/category/banner4.jpg',
  5: '/static/category/banner5.jpg',
  6: '/static/category/banner6.jpg',
  7: '/static/category/banner7.jpg',
  8: '/static/category/banner8.jpg'
}

// 计算分类名称
const categoryName = computed(() => {
  return categoryNames[categoryId.value] || '护理服务'
})

// 计算分类横幅
const categoryBanner = computed(() => {
  return categoryBanners[categoryId.value] || '/static/category/default.jpg'
})

// 计算顶部背景样式
const headerStyle = computed(() => {
  const colors = {
    1: 'linear-gradient(135deg, #81C784, #4CAF50)',
    2: 'linear-gradient(135deg, #66BB6A, #2E7D32)',
    3: 'linear-gradient(135deg, #43A047, #1B5E20)',
    4: 'linear-gradient(135deg, #A5D6A7, #66BB6A)',
    5: 'linear-gradient(135deg, #4CAF50, #388E3C)',
    6: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
    7: 'linear-gradient(135deg, #1B5E20, #0D5302)',
    8: 'linear-gradient(135deg, #66BB6A, #43A047)'
  }
  
  return {
    background: colors[categoryId.value] || 'linear-gradient(135deg, #4CAF50, #2E7D32)'
  }
})

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

// 加载分类服务
const loadCategoryServices = async () => {
  if (!categoryId.value) return
  
  loading.value = true
  uni.showLoading({ title: '加载中...', mask: true })
  
  try {
    const res = await getActiveServicesByCategory(categoryId.value)
    
    // 模拟延迟，展示骨架屏
    setTimeout(() => {
      services.value = res.map((service, index) => ({
        id: service.id,
        name: service.name,
        price: service.price,
        appointments: service.appointments || 0,
        description: service.description || '暂无描述',
        // 使用本地图片数组，按索引分配图片
        image: localServiceImages[index % 6] || '/static/default-service.jpg'
      }))
      
      loading.value = false
      uni.hideLoading()
      uni.stopPullDownRefresh()
    }, 800)
    
    // 设置页面标题为分类名称
    uni.setNavigationBarTitle({
      title: categoryName.value
    })
    
  } catch (error) {
    console.error('加载分类服务失败', error)
    loading.value = false
    uni.hideLoading()
    uni.stopPullDownRefresh()
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}
// 下拉刷新
onPullDownRefresh(() => {
  loadCategoryServices()
})

// 预约服务
const handleBook = (id) => {
  uni.vibrateShort()
  uni.navigateTo({
    url: `/pages/payments/checkout?id=${id}`
  })
}

// 跳转到详情页
const navigateToDetail = (id) => {
  uni.vibrateShort()
  uni.navigateTo({
    url: `/pages/service/detail?id=${id}`
  })
}

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}

onLoad((options) => {
  // 获取路由参数中的分类ID
  if (options.id) {
    categoryId.value = parseInt(options.id)
    loadCategoryServices()
  }
  
  // 直接从本地存储获取用户信息
  try {
    const userData = uni.getStorageSync('user')
    if (userData) {
      user.value = userData
    }
  } catch (e) {
    console.log('获取用户信息失败', e)
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

/* 分类顶部横幅 */
.category-header {
  height: 360rpx; 
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center; 
  align-items: center; 
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
  
  .banner-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.2;
    z-index: 0;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05));
    z-index: 1;
  }
}

/* 返回按钮调整 */
.back-btn {
  position: absolute;
  top: 50%; 
  left: 30rpx;
  transform: translateY(-50%); 
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(255,255,255,0.4);
  box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(-50%) scale(0.9);
    background: rgba(255,255,255,0.4);
  }
}

.back-icon {
  width: 44rpx;
  height: 44rpx;
  filter: drop-shadow(0 0 2rpx rgba(0,0,0,0.3));
}

/* 标题文字增大 */
.category-title {
  font-size: 54rpx; 
  font-weight: 800;
  color: white;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.4);
  position: relative;
  z-index: 2;
  letter-spacing: 1rpx;
  padding: 0 100rpx;
  text-align: center;
}

/* 通用区域样式 */
.section {
  background-color: #fff;
  border-radius: 24rpx;
  margin: 30rpx;
  padding: 30rpx;
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e8f5e9;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
  
  &:active {
    transform: scale(0.99);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
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
    transition: height 0.3s ease;
  }
  
  &:hover::before {
    height: 40rpx;
  }
}

/* 骨架屏 */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.skeleton-card {
  background: #f8fcf9;
  border-radius: 20rpx;
  overflow: hidden;
  height: 300rpx;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    animation: loading 1.5s infinite;
  }
}

@keyframes loading {
  100% {
    left: 100%;
  }
}

.skeleton-image {
  height: 180rpx;
  background: #e0f2e9;
}

.skeleton-content {
  padding: 20rpx;
}

.skeleton-line {
  height: 30rpx;
  background: #e8f5e9;
  border-radius: 15rpx;
  margin-bottom: 15rpx;
}

/* 服务列表 */
.service-list {
  margin-top: 20rpx;
}

.service-card {
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  background-color: #fff;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(50rpx);
  animation: fadeInUp 0.5s ease forwards;
  
  &:active {
    transform: translateY(-5rpx) scale(0.98) !important;
    box-shadow: 0 12rpx 30rpx rgba(76, 175, 80, 0.2);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.service-image {
  width: 100%;
  height: 300rpx;
  transition: transform 0.5s ease;
}

.service-card:active .service-image {
  transform: scale(1.03);
}

.service-content {
  padding: 30rpx;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.service-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #2E7D32;
}

.service-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 30rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.appointment-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 40rpx;
  padding: 12rpx 35rpx;
  font-size: 26rpx;
  border: none;
  box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.2);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active::after {
    opacity: 1;
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.4);
  }
}

.arrow-icon {
  margin-left: 10rpx;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.appointment-btn:active .arrow-icon {
  transform: translateX(10rpx);
}

/* 无数据提示 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.8;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.retry-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 40rpx;
  padding: 15rpx 50rpx;
  font-size: 28rpx;
  border: none;
  box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.4);
}

/* 返回顶部按钮  */
.scroll-top-btn {
  position: fixed;
  bottom: 180rpx;
  right: 40rpx;
  width: 90rpx; 
  height: 90rpx;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(46, 125, 50, 0.5);
  z-index: 100;
  transition: all 0.3s ease;
  border: 2rpx solid #fff;
  
  &:active {
    transform: scale(0.9);
    box-shadow: 0 3rpx 10rpx rgba(46, 125, 50, 0.5);
  }
}

.scroll-top-icon {
  width: 46rpx;
  height: 46rpx;
  filter: drop-shadow(0 0 2rpx rgba(0,0,0,0.1));
}

/* 响应式调整 */
@media (max-width: 750px) {
  .category-header {
    height: 320rpx;
  }
  
  .category-title {
    font-size: 46rpx;
    padding: 0 80rpx;
  }
  
  .back-btn {
    width: 70rpx;
    height: 70rpx;
  }
  
  .back-icon {
    width: 40rpx;
    height: 40rpx;
  }
  
  .scroll-top-btn {
    width: 80rpx;
    height: 80rpx;
    bottom: 160rpx;
    right: 30rpx;
  }
  
  .scroll-top-icon {
    width: 40rpx;
    height: 40rpx;
  }
}
</style>