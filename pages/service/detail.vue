<template>
  <view class="detail-container">
    
    <!-- 分类顶部横幅 -->
    <view class="category-header" :style="headerStyle">
		<view class="back-btn" @click="handleBack">
		  <image src="/static/general/return-icon.png" class="back-icon" />
		</view>
      <text class="category-title">{{ service.name }}</text>
      <image :src="service.image" class="banner-bg" mode="aspectFill"></image>
      <view class="overlay"></view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      
      <!-- 服务详情 -->
      <view class="detail-section section">
        <view class="section-header">
          <text class="section-title">服务详情</text>
          <image src="/static/service/detail-icon.png" class="section-icon"></image>
        </view>
        
        <view class="section-item">
          <view class="item-header">
            <image src="/static/service/sub-icon.png" class="item-icon"></image>
            <text class="section-subtitle">服务介绍</text>
          </view>
          <text class="section-content">{{ service.description }}</text>
        </view>
        
        <view class="section-item">
          <view class="item-header">
            <image src="/static/service/people-icon.png" class="item-icon"></image>
            <text class="section-subtitle">适用人群</text>
          </view>
          <text class="section-content">{{ service.suitableFor }}</text>
        </view>
        
        <view class="section-item">
          <view class="item-header">
            <image src="/static/service/clock-icon.png" class="item-icon"></image>
            <text class="section-subtitle">服务时长</text>
          </view>
          <text class="section-content">{{ service.duration }}</text>
        </view>
      </view>
      
      <!-- 用户评价 -->
      <view class="reviews-section section" v-if="service.reviewsList.length > 0">
        <view class="section-header">
          <text class="section-title">用户评价</text>
        </view>
        
        <view class="review-list">
          <view class="review-item" v-for="(review, index) in service.reviewsList" :key="index">
            <view class="review-header">
              <image :src="review.avatar" class="avatar"></image>
              <view class="reviewer-info">
                <text class="reviewer-name">{{ review.name }}</text>
                <view class="rating">
                  <image v-for="star in 5" :key="star" 
                    :src="star <= review.rating ? '/static/general/star-filled.png' : '/static/general/star.png'" 
                    class="star-icon">
                  </image>
                </view>
              </view>
              <text class="review-date">{{ review.date }}</text>
            </view>
            <text class="review-content">{{ review.content }}</text>
          </view>
        </view>
      </view>
      
      <!-- 服务保障卡片 -->
      <view class="guarantee-section section">
        <view class="section-header">
          <text class="section-title">服务保障</text>
          <image src="/static/icons/shield-check.png" class="section-icon"></image>
        </view>
        <view class="guarantee-list">
          <view class="guarantee-item">
            <image src="/static/service/zhi-icon.png" class="guarantee-icon"></image>
            <text>专业认证服务人员</text>
          </view>
          <view class="guarantee-item">
            <image src="/static/service/tui-icon.png" class="guarantee-icon"></image>
            <text>不满意全额退款</text>
          </view>
          <view class="guarantee-item">
            <image src="/static/service/bao-icon.png" class="guarantee-icon"></image>
            <text>全程服务保障</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部预约栏 -->
    <view class="footer">
      <view class="price-info">
        <text class="current-price">¥{{ service.price }}</text>
        <text class="original-price" v-if="service.originalPrice">¥{{ service.originalPrice }}</text>
        <view class="discount-tag" v-if="service.originalPrice">
          <text>省¥{{ (service.originalPrice - service.price).toFixed(2) }}</text>
        </view>
      </view>
     
      <button class="book-btn" @click="handleBook">立即预约</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getServiceDetails } from '@/api/service'

// 服务数据
const service = ref({
  id: 0,
  name: '',
  price: 0,
  originalPrice: 0,
  duration: '',
  appointments: 1245,
  rating: 4.9,
  reviews: 0,
  image: '/static/service-detail.jpg',
  tags: ['限时特惠', '深度清洁', '家庭保洁'],
  description: '专业保洁服务，使用环保清洁剂，彻底清洁家居各个角落，让您的家焕然一新。服务包括地面清洁、家具擦拭、厨房油污清理、卫生间消毒等。',
  suitableFor: '家庭、办公室、出租房等所有需要清洁的环境',
  reviewsList: [
	{
	  name: '李女士',
	  avatar: '/static/service/comment1.jpg',
	  rating: 4,
	  date: '2025-06-10',
	  content: '保洁阿姨很认真，打扫了3个多小时，家里焕然一新，价格也很合理。'
	},
    {
      name: '张先生',
      avatar: '/static/service/comment2.jpg',
      rating: 5,
      date: '2025-07-03',
      content: '服务非常专业，清洁得很彻底，连窗户缝隙都擦得干干净净，值得推荐！'
    }
  ]
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
  
  // 使用服务ID对8取模来决定颜色
  const colorId = (service.value.id % 8) || 1
  return {
    background: colors[colorId] || 'linear-gradient(135deg, #4CAF50, #2E7D32)'
  }
})

// 预约服务
const handleBook = () => {
  uni.vibrateShort()
  uni.navigateTo({
    url: `/pages/payments/checkout?id=${service.value.id}`
  })
}

// 收藏状态
const isFavorite = ref(false)
// 倒计时状态
const showCountdown = ref(true)
const countdown = ref('29:59')
let countdownInterval = null

// 切换收藏状态
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  uni.showToast({
    title: isFavorite.value ? '已收藏' : '已取消收藏',
    icon: 'none'
  })
}

// 分享服务
const shareService = () => {
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: service.value.name,
    summary: '我发现了一个很棒的服务，分享给你看看',
    href: 'https://yourdomain.com/service/' + service.value.id,
    success: function (res) {
      console.log('分享成功:', res)
    },
    fail: function (err) {
      console.log('分享失败:', err)
    }
  })
}

// 返回首页
const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 加载服务详情
const loadServiceDetail = async (id) => {
  try {
    const data = await getServiceDetails(id)
    if (!data) {
      throw new Error('服务详情数据为空')
    }
    // 将后端数据映射到前端结构
    service.value = {
      id: data.id,
      name: data.name,
      price: data.price,
      // 计算原价：当前价格×3+9
      originalPrice: (parseFloat(data.price) * 3 + 9).toFixed(2),
      duration: data.duration,
      appointments: data.appointments,
      rating: data.rating,
      reviews: data.reviews,
      image: data.imageUrl || '/static/default-service.jpg',
      tags: data.tags ? data.tags.split(',') : [],
      description: data.description,
      suitableFor: data.suitableCrowd || data.suitableFor || '',
      reviewsList: data.reviewsList || [
        {
          name: '李女士',
          avatar: '/static/service/comment1.jpg',
          rating: 4,
          date: '2025-06-10',
          content: '保洁阿姨很认真，打扫了3个多小时，家里焕然一新，价格也很合理。'
        },
        {
          name: '张先生',
          avatar: '/static/service/comment2.jpg',
          rating: 5,
          date: '2025-07-03',
          content: '服务非常专业，清洁得很彻底，连窗户缝隙都擦得干干净净，值得推荐！'
        }
      ]
    }
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: service.value.name
    })
  } catch (error) {
    console.error('加载服务详情失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onLoad(async (options) => {
  if (options.id) {
    loadServiceDetail(options.id)
  } else {
    // 演示数据
    service.value.originalPrice = (parseFloat(service.value.price) * 3 + 9).toFixed(2)
  }
  startCountdown()
})

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}

// 倒计时逻辑
const startCountdown = () => {
  let seconds = 29 * 60 + 59
  countdownInterval = setInterval(() => {
    seconds--
    if (seconds < 0) {
      showCountdown.value = false
      clearInterval(countdownInterval)
      return
    }
    
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    countdown.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, 1000)
}

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<style lang="scss" scoped>
.detail-container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  position: relative;
  padding-bottom: 120rpx;
  overflow: hidden;
}

.scroll-content {
  width: 100%;
  box-sizing: border-box;
  
  /* 彻底隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }
  
  scrollbar-width: none; 
  -ms-overflow-style: none; 
  
  padding: 20rpx 30rpx 140rpx;
  overflow: hidden;
}

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


/* 图标样式 */
.icon {
  width: 48rpx;
  height: 48rpx;
}

.title-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 10rpx;
}

.section-icon {
  width: 40rpx;
  height: 40rpx;
}

.item-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
}

.star-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 4rpx;
}

.guarantee-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
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
  margin-bottom: 30rpx;
  
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
}

/* 通用卡片样式 */
.section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e8f5e9;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(4rpx);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
}

/* 详情部分 */
.detail-section {
  padding: 30rpx;
  
  .item-header {
    display: flex;
    align-items: center;
    margin-bottom: 15rpx;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  
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
    }
  }
}

.section-item {
  margin-bottom: 40rpx;
  
  .section-subtitle {
    font-size: 30rpx;
    font-weight: bold;
    margin-left: 10rpx;
    color: #333;
  }
  
  .section-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    padding-left: 35rpx;
    border-left: 4rpx solid #e8f5e9;
    margin-top: 10rpx;
  }
}

/* 用户评价 */
.review-list {
  .review-item {
    padding: 25rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    transition: all 0.3s ease;
    
    &:active {
      background-color: #f8fcf9;
      transform: translateY(-3rpx);
      border-radius: 16rpx;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .review-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
  }
  
  .avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    background-color: #e0e0e0;
    margin-right: 20rpx;
    border: 2rpx solid #e8f5e9;
  }
  
  .reviewer-info {
    flex: 1;
  }
  
  .reviewer-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 5rpx;
  }
  
  .rating {
    display: flex;
  }
  
  .review-date {
    font-size: 24rpx;
    color: #999;
  }
  
  .review-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    background: #f8f9fb;
    padding: 16rpx;
    border-radius: 12rpx;
    margin-top: 10rpx;
  }
}

/* 服务保障样式 */
.guarantee-section {
  .guarantee-list {
    .guarantee-item {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      padding: 15rpx;
      background: #f8f9fb;
      border-radius: 16rpx;
      
      text {
        margin-left: 15rpx;
        font-size: 28rpx;
        color: #555;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

/* 底部预约栏 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 15rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
  border-top: 1rpx solid #e8f5e9;
  
  .price-info {
    display: flex;
    align-items: center;
    
    .current-price {
      font-size: 42rpx;
      color: #FF5722;
      font-weight: 900;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -4rpx;
        left: 0;
        right: 0;
        height: 8rpx;
        background: linear-gradient(90deg, #FF9800, #FF5722);
        opacity: 0.4;
        border-radius: 4rpx;
      }
    }
    
    .original-price {
      font-size: 28rpx;
      color: #999;
      text-decoration: line-through;
      margin: 0 15rpx;
    }
    
    .discount-tag {
      background: linear-gradient(135deg, #FF5722, #E64A19);
      color: white;
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      font-weight: bold;
    }
  }
  
  .timer {
    position: absolute;
    top: -50rpx;
    left: 30rpx;
    background: linear-gradient(135deg, #FF5722, #E64A19);
    color: white;
    font-size: 24rpx;
    padding: 6rpx 15rpx;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    
    text {
      margin-left: 5rpx;
      font-weight: bold;
    }
  }
  
  .book-btn {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: white;
    border-radius: 50rpx;
    height: 86rpx;
    line-height: 86rpx;
    font-size: 34rpx;
    padding: 0 70rpx;
    box-shadow: 0 6rpx 20rpx rgba(46, 125, 50, 0.4);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    font-weight: bold;
    letter-spacing: 2rpx;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -60%;
      width: 50rpx;
      height: 200%;
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(25deg);
      transition: all 0.8s;
    }
    
    &:active::before {
      left: 120%;
    }
    
    &:active {
      transform: scale(0.96);
      box-shadow: 0 2rpx 8rpx rgba(46, 125, 50, 0.4);
    }
  }
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
}
</style>