<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
        <view class="back-icon" @click="handleBack">
          <image src="/static/general/return-icon.png"></image>
        </view>
      <text class="title">我的评价</text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="avg-score">
        <text class="score-number">{{ avgScore }}</text>
        <text class="score-desc">平均评分</text>
      </view>
      <view class="score-distribution">
        <view class="distribution-item" v-for="(item, index) in scoreDistribution" :key="index">
          <text class="star-count">{{ item.star }}星</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: item.percent + '%', backgroundColor: getProgressColor(index) }"></view>
          </view>
          <text class="percent-text">{{ item.percent }}%</text>
        </view>
      </view>
    </view>

    <!-- 评价列表 -->
    <scroll-view 
      scroll-y 
      class="review-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态 -->
      <view v-if="reviews.length === 0" class="empty-state">
        <view class="empty-icon">
          <view class="empty-star"></view>
        </view>
        <text class="empty-text">暂无评价记录</text>
        <text class="empty-subtext">完成服务后将收到患者的评价</text>
      </view>

      <!-- 评价列表 -->
      <view 
        class="review-item" 
        v-for="(review, index) in reviews" 
        :key="index"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <view class="review-header">
          <image :src="review.patientAvatar" class="patient-avatar"></image>
          <view class="patient-info">
            <text class="patient-name">{{ review.patientName }}</text>
            <view class="review-stars">
              <view class="star" v-for="i in 5" :key="i" :class="{ filled: i <= review.rating }"></view>
            </view>
          </view>
          <text class="review-time">{{ review.createTime }}</text>
        </view>
        
        <text class="review-content">{{ review.comment }}</text>
        
        <view class="review-images" v-if="review.images.length > 0">
          <image 
            :src="image" 
            class="review-image" 
            v-for="(image, imgIndex) in review.images" 
            :key="imgIndex"
            @click="previewImage(review.images, imgIndex)"
          ></image>
        </view>
        
        <view class="service-info">
          <text class="service-name">{{ review.serviceName }}</text>
          <text class="service-date">{{ review.serviceDate }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 状态管理
const refreshing = ref(false)
const avgScore = ref(4.8)
const reviews = ref([])

// 评分分布数据
const scoreDistribution = ref([
  { star: 5, percent: 75 },
  { star: 4, percent: 15 },
  { star: 3, percent: 5 },
  { star: 2, percent: 3 },
  { star: 1, percent: 2 }
])

// 模拟评价数据
const mockReviews = [
  {
    id: 'r1001',
    patientName: '李奶奶',
    patientAvatar: '/static/service/comment1.jpg',
    rating: 5,
    comment: '护理非常专业，态度也很好，耐心解答了我的很多问题，非常满意！',
    images: ['/static/service/default1.jpg'],
    serviceName: '术后康复护理',
    serviceDate: '2025-06-10',
    createTime: '16:45'
  },
  {
    id: 'r1002',
    patientName: '张爷爷',
    patientAvatar: '/static/service/comment2.jpg',
    rating: 4,
    comment: '护士很准时，操作规范，就是希望下次能提前联系确认一下时间',
    images: [],
    serviceName: '慢性病管理',
    serviceDate: '2025-06-15',
    createTime: '15:30'
  },
  {
    id: 'r1003',
    patientName: '王阿姨',
    patientAvatar: '/static/service/comment3.jpg',
    rating: 5,
    comment: '非常专业的护理服务，解决了我的困扰，谢谢！',
    images: ['/static/service/default2.jpg', '/static/service/default3.jpg'],
    serviceName: '伤口护理',
    serviceDate: '2025-06-22',
    createTime: '11:20'
  },
  {
    id: 'r1004',
    patientName: '赵爷爷',
    patientAvatar: '/static/service/comment4.jpg',
    rating: 5,
    comment: '上门服务很方便，对于我们老年人来说太实用了，护理人员技术好态度也好',
    images: [],
    serviceName: '老年日常护理',
    serviceDate: '2025-07-05',
    createTime: '09:15'
  },
  {
    id: 'r1005',
    patientName: '刘阿姨',
    patientAvatar: '/static/service/comment5.jpg',
    rating: 4,
    comment: '服务总体不错，但希望下次能更准时一些',
    images: ['/static/service/default4.jpg'],
    serviceName: '健康监测',
    serviceDate: '2025-07-08',
    createTime: '14:30'
  }
]

// 获取进度条颜色
const getProgressColor = (index) => {
  // 星级越高颜色越深
  const colors = [
    '#2E7D32', // 5星
    '#4CAF50', // 4星
    '#81C784', // 3星
    '#A5D6A7', // 2星
    '#C8E6C9'  // 1星
  ]
  return colors[index]
}

// 获取评价数据
const fetchReviews = () => {
  // 模拟API请求
  setTimeout(() => {
    reviews.value = mockReviews
    refreshing.value = false
  }, 800)
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  fetchReviews()
}

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}

// 预览图片
const previewImage = (urls, current) => {
  uni.previewImage({
    urls,
    current,
    indicator: 'number'
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchReviews()
})
</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  position: relative;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.3);
  position: relative;
  overflow: hidden;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  
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

/* 统计卡片 */
.stats-card {
  background-color: #fff;
  margin: 30rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease;

  .avg-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30rpx;

    .score-number {
      font-size: 80rpx;
      font-weight: bold;
      color: #4CAF50;
      line-height: 1;
    }

    .score-desc {
      font-size: 28rpx;
      color: #666;
      margin-top: 10rpx;
    }
  }

  .score-distribution {
    width: 100%;

    .distribution-item {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .star-count {
        font-size: 26rpx;
        color: #666;
        width: 80rpx;
      }

      .progress-bar {
        flex: 1;
        height: 16rpx;
        background-color: #f1f1f1;
        border-radius: 8rpx;
        overflow: hidden;

        .progress {
          height: 100%;
          border-radius: 8rpx;
          transition: width 1s ease-in-out;
        }
      }

      .percent-text {
        font-size: 26rpx;
        color: #666;
        width: 80rpx;
        text-align: right;
        margin-left: 20rpx;
      }
    }
  }
}

/* 评价列表 */
.review-list {
  width: 100%;
  height: calc(100vh - 420rpx);
  padding: 0 30rpx;
  box-sizing: border-box;

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 150rpx;

    .empty-icon {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .empty-star {
        width: 120rpx;
        height: 120rpx;
        border: 4rpx solid #e0e0e0;
        border-radius: 50%;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          width: 60rpx;
          height: 30rpx;
          border-right: 4rpx solid #e0e0e0;
          border-bottom: 4rpx solid #e0e0e0;
          transform: rotate(45deg);
          top: 35rpx;
          right: 35rpx;
        }
      }
    }

    .empty-text {
      font-size: 32rpx;
      color: #666;
      margin-bottom: 15rpx;
    }

    .empty-subtext {
      font-size: 26rpx;
      color: #999;
    }
  }

  .review-item {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 25rpx;
    box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
    opacity: 0;
    transform: translateY(30rpx);
    animation: fadeInUp 0.5s ease forwards;

    .review-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .patient-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        object-fit: cover;
        background-color: #f1f1f1;
      }

      .patient-info {
        flex: 1;
        margin-left: 20rpx;

        .patient-name {
          font-size: 30rpx;
          color: #333;
          font-weight: 500;
        }

        .review-stars {
          display: flex;
          margin-top: 10rpx;

          .star {
            width: 30rpx;
            height: 30rpx;
            margin-right: 5rpx;
            position: relative;

            &::after {
              content: '★';
              position: absolute;
              font-size: 30rpx;
              color: #ddd;
            }

            &.filled::after {
              color: #FFC107;
            }
          }
        }
      }

      .review-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .review-content {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 25rpx;
      white-space: pre-line;
    }

    .review-images {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 25rpx;

      .review-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 10rpx;
        margin-right: 15rpx;
        margin-bottom: 15rpx;
        object-fit: cover;
        background-color: #f1f1f1;
        transition: transform 0.3s ease;

        &:active {
          transform: scale(0.95);
        }
      }
    }

    .service-info {
      display: flex;
      justify-content: space-between;
      padding-top: 20rpx;
      border-top: 1rpx solid #f5f5f5;
      margin-top: 15rpx;

      .service-name {
        font-size: 26rpx;
        color: #999;
      }

      .service-date {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
</style>