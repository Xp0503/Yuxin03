<template>
  <view class="container">
    <!-- 顶部搜索区域 -->
    <view class="header">
      <view class="search-container">
        <image src="/static/index/search-icon.png" class="search-icon-img" />
        <input 
          class="search-input" 
          placeholder="搜索患者或服务" 
          placeholder-class="placeholder-style"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          :class="{'focused': inputFocused}"
        />
        <button class="search-btn" @click="handleSearch" :class="{'active': inputFocused}">搜索</button>
      </view>
    </view>

    <!-- 服务分类 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">服务分类</text>
      </view>
      <view class="categories-grid">
        <view 
          v-for="(category, index) in categories" 
          :key="index" 
          class="category-item"
          @click="handleCategoryClick(category.id)"
          :style="{animationDelay: `${index * 0.05}s`}"
        >
          <view class="category-icon">
            <image :src="category.icon" class="icon-img" />
          </view>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>
	

    <!-- 待办事项 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">待办事项</text>
      </view>
      
      <view class="todo-list">
        <view 
          class="todo-item"
          v-for="(item, index) in todos" 
          :key="index"
          @click="handleTodoClick(item.path)"
        >
          <view class="todo-icon">
            <image :src="item.icon" class="icon-img" />
          </view>
          <view class="todo-content">
            <text class="todo-title">{{ item.title }}</text>
            <text class="todo-count" v-if="item.count > 0">{{ item.count }}条待处理</text>
          </view>
          <image src="/static/general/right-icon.png" class="icon-img" />
        </view>
      </view>
    </view>

    <!-- 健康资讯 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">健康资讯</text>
      </view>
      
      <view class="news-list">
        <view 
          class="news-card" 
          v-for="(item, index) in healthNews" 
          :key="index"
          @click="openNewsDetail(item)"
        >
          <view class="news-header">
            <image :src="item.icon" class="news-icon"></image>
            <text class="news-title">{{ item.title }}</text>
          </view>
          <text class="news-desc">{{ item.description }}</text>
          <view class="news-footer">
            <text class="news-date">{{ item.date }}</text>
            <text class="news-read">阅读全文 →</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 资讯详情弹窗 -->
    <view class="news-modal" v-if="showNewsModal" @click="closeNewsModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentNews.title }}</text>
		   <image src="/static/index/close-icon.png"  @click="closeNewsModal" class="icon-img" />
        </view>
        <scroll-view class="modal-body" scroll-y>
          <image :src="currentNews.image" class="news-detail-image" mode="widthFix"></image>
          <text class="news-detail-date">发布日期：{{ currentNews.date }}</text>
          <text class="news-detail-content">{{ currentNews.content }}</text>
          <view class="news-tags">
            <text class="tag" v-for="(tag, index) in currentNews.tags" :key="index">{{ tag }}</text>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="close-btn" @click="closeNewsModal">关闭</button>
        </view>
      </view>
    </view>

    <!-- 浮动按钮 -->
    <view class="floating-button" @click="scrollToTop" v-if="showScrollTop">
      <image src="/static/general/up-icon.png" class="floating-icon" />
    </view>
	<admin-tabbar />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onPageScroll } from '@dcloudio/uni-app'
import { useTokenStore } from '@/stores/token'
import AdminTabbar from '@/tabbar/admin-tabbar.vue';
const tokenStore = useTokenStore()
const inputFocused = ref(false)
const showScrollTop = ref(false)
const showNewsModal = ref(false)
const currentNews = ref(null)

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

// 输入框焦点事件
const handleInputFocus = () => {
  inputFocused.value = true
}

const handleInputBlur = () => {
  inputFocused.value = false
}

// 功能分类数据
const categories = ref([
  { id: 1, name: '生活护理', icon: '/static/doctor/index/1.png' },
  { id: 2, name: '健康监测', icon: '/static/doctor/index/2.png' },
  { id: 3, name: '康复训练', icon: '/static/doctor/index/3.png' },
  { id: 4, name: '专业护理', icon: '/static/doctor/index/4.png' },
  { id: 5, name: '健康咨询', icon: '/static/doctor/index/5.png' },
  { id: 6, name: '特殊护理', icon: '/static/doctor/index/6.png' },
  { id: 7, name: '应急医疗', icon: '/static/doctor/index/7.png' },
  { id: 8, name: '智能设备', icon: '/static/doctor/index/8.png' }
])

// 待办事项数据
const todos = ref([
  { 
    id: 1, 
    title: '服务预约', 
    count: 5, 
    icon: '/static/doctor/index/appoint-icon.png',
    path: '/pages/doctor/index/appointment' 
  },
  { 
    id: 2, 
    title: '投诉管理', 
    count: 2, 
    icon: '/static/doctor/index/com-icon.png', 
    path: '/pages/doctor/index/complaint'
  }
])

// 健康资讯数据
const healthNews = ref([
  {
    title: "老年痴呆患者的护理要点",
    description: "针对老年痴呆患者的特殊护理方法，帮助改善患者生活质量...",
    date: "2025-7-10",
    icon: "/static/doctor/index/info-icon.png",
    image: "/static/doctor/index/info-pic1.jpg",
    content: `老年痴呆症是一种常见的神经系统退行性疾病，随着病情发展，患者会出现记忆力减退、认知功能障碍等症状。作为护理人员，掌握专业的护理方法对改善患者生活质量至关重要。

一、日常护理要点
1. 安全环境设置
   - 保持环境整洁，移除危险物品
   - 安装防滑地板和扶手
   - 使用定位设备防止走失

2. 生活护理
   - 建立规律的作息时间
   - 简化日常任务流程
   - 使用提醒工具帮助记忆

3. 饮食护理
   - 提供营养均衡的饮食
   - 使用防滑餐具
   - 监督进食过程防止噎食

二、心理护理
1. 沟通技巧
   - 使用简单直接的语言
   - 保持眼神交流
   - 给予充分回应时间

2. 情绪管理
   - 识别并安抚焦虑情绪
   - 避免争执和纠正
   - 使用回忆疗法缓解情绪

三、认知训练
1. 记忆训练
   - 使用照片、音乐触发记忆
   - 进行简单的记忆游戏
   - 鼓励讲述过去经历

2. 定向训练
   - 使用大字体日历和时钟
   - 定期提醒时间和地点
   - 标记常用物品位置

四、家属支持
1. 提供护理培训
2. 建立支持小组
3. 关注照顾者心理健康

通过科学的护理方法，我们可以帮助老年痴呆患者维持更好的生活质量，减轻家属负担。`,
    tags: ["老年痴呆", "专业护理", "认知训练"]
  },
  {
    title: "术后康复训练的最佳实践",
    description: "骨科手术后康复训练的科学方法，加速患者恢复进程...",
    date: "2025-7-8",
     icon: "/static/doctor/index/info-icon.png",
    image: "/static/doctor/index/info-pic2.jpg",
    content: `术后康复是手术成功的重要环节，科学的康复训练能显著提高恢复效果。本文将介绍骨科术后康复的最佳实践方案。

一、康复阶段划分
1. 早期阶段(术后0-2周)
   - 目标：控制肿胀疼痛，预防并发症
   - 方法：冰敷、抬高患肢、被动关节活动

2. 中期阶段(术后2-6周)
   - 目标：恢复关节活动度和肌力
   - 方法：主动辅助训练、等长收缩训练

3. 后期阶段(术后6-12周)
   - 目标：恢复功能性和协调性
   - 方法：抗阻训练、平衡训练、功能性训练

二、常见手术康复方案
1. 膝关节置换术
   - 重点：恢复膝关节屈伸活动度
   - 特殊训练：直腿抬高、滑墙训练

2. 髋关节置换术
   - 重点：预防脱位，恢复步态
   - 注意事项：避免内收内旋动作

3. 脊柱手术后
   - 重点：核心肌群训练
   - 禁忌：避免弯腰和扭转动作

三、疼痛管理策略
1. 药物管理
   - 按时给药而非按需给药
   - 阶梯式镇痛方案

2. 非药物方法
   - 冷热疗法
   - 经皮电刺激
   - 放松技巧

四、康复评估指标
1. 关节活动度测量
2. 肌力评估
3. 疼痛评分
4. 日常生活能力评估

科学规范的康复训练能帮助患者更快恢复功能，重返正常生活。`,
    tags: ["术后康复", "骨科护理", "康复训练"]
  },
  {
    title: "慢性病患者的长期护理策略",
    description: "针对高血压、糖尿病等慢性病患者的长期护理方案...",
    date: "2025-7-5",
     icon: "/static/doctor/index/info-icon.png",
    image: "/static/doctor/index/info-pic3.jpg",
    content: `慢性病管理是医疗护理的重要组成部分，有效的长期护理能显著改善患者预后。本文将介绍常见慢性病的护理策略。

一、高血压护理
1. 监测管理
   - 定期测量血压
   - 记录血压日记
   - 识别危险信号

2. 生活方式干预
   - DASH饮食原则
   - 规律有氧运动
   - 戒烟限酒

3. 用药指导
   - 强调依从性
   - 解释药物副作用
   - 定期复诊调整

二、糖尿病护理
1. 血糖监测
   - 自我监测频率
   - 糖化血红蛋白检测
   - 识别高低血糖症状

2. 足部护理
   - 每日足部检查
   - 选择合适的鞋袜
   - 预防足部损伤

3. 并发症筛查
   - 眼底检查
   - 肾功能评估
   - 神经病变检查

三、COPD护理
1. 呼吸训练
   - 腹式呼吸
   - 缩唇呼吸
   - 呼吸肌训练

2. 排痰技巧
   - 体位引流
   - 叩击排痰
   - 正确咳嗽方法

3. 氧疗指导
   - 长期氧疗指征
   - 氧疗设备使用
   - 氧疗安全事项

四、综合管理策略
1. 多学科团队协作
2. 患者教育计划
3. 远程监测技术
4. 社区支持网络

通过系统化的长期护理方案，可以有效控制慢性病进展，提高患者生活质量。`,
    tags: ["慢性病", "长期护理", "健康管理"]
  }
])

onLoad(async () => {
  // 如果已登录，显示用户信息
  if (tokenStore.isLoggedIn) {
    console.log('当前登录医生:', tokenStore.user.nickname)
    uni.showToast({ 
      title: `欢迎回来，${tokenStore.user.nickname}医生`, 
      icon: 'none',
      duration: 2000
    })
  }
})

// 处理分类点击
const handleCategoryClick = (id) => {
  uni.vibrateShort();
  uni.navigateTo({
    url: `/pages/doctor/index/category?id=${id}`
  })
}

// 处理待办事项点击
const handleTodoClick = (path) => {
  uni.vibrateShort();
  uni.navigateTo({
    url:  path
  })
}

// 处理搜索
const handleSearch = () => {
  uni.vibrateShort();
  uni.showToast({
    title: '搜索功能',
    icon: 'none'
  })
}

// 打开资讯详情
const openNewsDetail = (news) => {
  currentNews.value = news
  showNewsModal.value = true
}

// 关闭资讯详情
const closeNewsModal = () => {
  showNewsModal.value = false
}
</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  padding-bottom: 80rpx;
  position: relative;
}

/* 顶部搜索区域 */
.header {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  padding: 30rpx 30rpx 60rpx;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.3);
  
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


.search-icon-img {
  width: 40rpx;
  height: 40rpx;
}
.search-container {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 50rpx;
  padding: 10rpx 20rpx 10rpx 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  border: 2rpx solid #a5d6a7; 
  transition: all 0.3s ease;
  
  &.focused {
    box-shadow: 0 8rpx 25rpx rgba(46, 125, 50, 0.3);
    transform: translateY(-5rpx);
  }
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  padding-left: 20rpx;
  transition: all 0.3s ease;
  
  &.focused {
    transform: scale(1.02);
  }
}

.placeholder-style {
  color: #b0b0b0;
  font-size: 28rpx;
}

.search-btn {
  background: #2E7D32; 
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 10rpx 30rpx;
  font-size: 28rpx;
  height: 70rpx;
  line-height: 70rpx;
  margin-left: 10rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.05);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active::after {
    opacity: 1;
  }
  
  &.active {
    background: #1B5E20;
    box-shadow: 0 4rpx 15rpx rgba(46, 125, 50, 0.4);
  }
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

/* 分类网格 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(30rpx);
  animation: fadeInUp 0.5s ease forwards;
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

.category-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f5e9, #d0ebd2);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
  box-shadow: 0 5rpx 15rpx rgba(76, 175, 80, 0.2);
  
  &:active {
    transform: scale(0.9);
    box-shadow: 0 3rpx 8rpx rgba(76, 175, 80, 0.3);
  }
}

.icon-img {
  width: 50rpx;
  height: 50rpx;
  transition: transform 0.3s ease;
}

.category-name {
  font-size: 26rpx;
  color: #555;
  transition: color 0.3s ease;
}

.category-item:active .category-name {
  color: #2E7D32;
  font-weight: bold;
}

/* 待办事项列表 */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 25rpx;
  background: #f8fcf9;
  border-radius: 16rpx;
  border: 1rpx solid #e8f5e9;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(-3rpx);
    box-shadow: 0 5rpx 15rpx rgba(76, 175, 80, 0.1);
  }
}

.todo-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #e8f5e9, #d0ebd2);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 25rpx;
  flex-shrink: 0;
}

.todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.todo-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.todo-count {
  font-size: 24rpx;
  color: #ff5722;
}

/* 健康资讯 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.news-card {
  background: #f8fcf9;
  border-radius: 16rpx;
  padding: 25rpx;
  border: 1rpx solid #e8f5e9;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(-3rpx);
    box-shadow: 0 5rpx 15rpx rgba(76, 175, 80, 0.1);
  }
}

.news-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.news-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 15rpx;
}

.news-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #2E7D32;
}

.news-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-date {
  font-size: 24rpx;
  color: #999;
}

.news-read {
  font-size: 24rpx;
  color: #4CAF50;
  font-weight: bold;
}

/* 资讯详情弹窗 */
.news-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 24rpx;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #f8fcf9;
  border-bottom: 1rpx solid #e8f5e9;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #2E7D32;
  flex: 1;
  padding-right: 20rpx;
}

.modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.news-detail-image {
  width: 100%;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.news-detail-date {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.news-detail-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
}

.news-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-top: 30rpx;
}

.tag {
  background: #e8f5e9;
  color: #2E7D32;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.modal-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e8f5e9;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: #2E7D32;
  color: white;
  border-radius: 40rpx;
  padding: 12rpx 40rpx;
  font-size: 28rpx;
  border: none;
}

/* 浮动按钮 */
.floating-button {
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
 
 .floating-icon {
   width: 46rpx;
   height: 46rpx;
   filter: drop-shadow(0 0 2rpx rgba(0,0,0,0.1));
 }



/* 响应式调整 */
@media (max-width: 750px) {
	.floating-icon {
  width: 40rpx;
  height: 40rpx;
}
  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>