<template>
  <view class="detail-container">
    <!-- 分类顶部横幅 -->
    <view class="category-header" :style="headerStyle">
      <view class="back-btn" @click="goBack">
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
      
      <!-- 医生注意事项 -->
      <view class="notes-section section">
        <view class="section-header">
          <text class="section-title">注意事项</text>
          <image src="/static/appointment/complaint-icon.png" class="section-icon"></image>
        </view>
        
        <view class="notes-list">
          <view class="note-item" v-for="(note, index) in service.notes" :key="index">
            <text>{{ note }}</text>
          </view>
        </view>
      </view>
      
      <!-- 操作流程 -->
      <view class="process-section section">
        <view class="section-header">
          <text class="section-title">操作流程</text>
          <image src="/static/service/process-icon.png" class="section-icon"></image>
        </view>
        
        <view class="process-steps">
          <view class="step-item" v-for="(step, index) in service.process" :key="index">
            <view class="step-number">{{ index + 1 }}</view>
            <view class="step-content">
              <text class="step-title">{{ step.title }}</text>
              <text class="step-desc">{{ step.desc }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 服务保障卡片 -->
      <view class="guarantee-section section">
        <view class="section-header">
          <text class="section-title">服务保障</text>
          <image src="/static/service/shield-icon.png" class="section-icon"></image>
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
    
    <!-- 底部操作栏 -->
    <view class="footer">
      <view class="price-info">
        <text class="current-price">¥{{ service.price }}</text>
      </view>
      <button class="book-btn" @click="openTimePicker">
        <image v-if="adding" src="/static/general/loading.gif" class="loading-icon" />
        <image v-else src="/static/general/add-icon.png" class="section-icon" />
        <text>{{ buttonText }}</text>
      </button>
    </view>

    <!-- 时间选择器弹窗 -->
    <view class="custom-popup" v-if="showPopup">
      <view class="popup-mask" @click="closeTimePicker"></view>
      <view class="popup-content">
        <view class="picker-header">
          <text class="picker-title">选择服务时间</text>
          <text class="picker-close" @click="closeTimePicker">×</text>
        </view>
        
        <view class="picker-body">
          <view class="date-picker">
            <text class="picker-label">日期</text>
            <picker mode="date" :value="selectedDate" :start="startDate" :end="endDate" @change="onDateChange">
              <view class="picker-value">{{ selectedDate }}</view>
            </picker>
          </view>
          
          <view class="time-picker">
            <text class="picker-label">时间</text>
            <picker mode="selector" :range="timeSlots" @change="onTimeChange">
              <view class="picker-value">{{ selectedTime }}</view>
            </picker>
          </view>
        </view>
        
        <button class="confirm-btn" @click="confirmSchedule">确认添加</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createSchedule } from '@/api/schedule' // 导入新的API

// 服务数据
const service = ref({
  id: 1,
  name: '术后康复护理',
  price: 298,
  duration: 60, // 添加时长字段（单位分钟）
  durationDisplay: '60分钟/次',
  tags: ['术后护理', '专业级', '康复训练'],
  description: '针对术后患者的专业护理服务，包括伤口护理、康复训练指导、疼痛管理等，帮助患者更快恢复健康。由专业护理师提供一对一服务。',
  suitableFor: '各类手术后患者，特别是骨科、神经外科和胸外科手术患者',
  image: '/static/service/default1.jpg',
  notes: [
    '护理前需确认患者手术类型和恢复情况',
    '检查患者伤口情况，如有异常及时报告医生',
    '康复训练需根据患者承受能力逐步增加强度',
    '记录每次护理的详细情况和患者反应',
    '注意观察患者用药后的反应'
  ],
  process: [
    {
      title: '初步评估',
      desc: '了解患者手术情况、当前恢复状态和医嘱要求'
    },
    {
      title: '伤口护理',
      desc: '检查伤口愈合情况，进行必要的清洁和换药'
    },
    {
      title: '康复训练',
      desc: '根据患者情况指导适当的康复训练动作'
    },
    {
      title: '疼痛管理',
      desc: '评估疼痛程度，按医嘱给予止痛措施'
    },
    {
      title: '健康指导',
      desc: '向患者及家属讲解术后注意事项和家庭护理要点'
    }
  ]
})

// 医生状态
const doctor = ref(null)
const adding = ref(false)
const buttonText = computed(() => adding.value ? '添加中...' : '加入服务')

// 时间选择器相关状态
const showPopup = ref(false)
const selectedDate = ref('')
const selectedTime = ref('')
const timeSlots = ref([])

// 计算开始日期（今天）
const startDate = computed(() => {
  return formatDate(new Date())
})

// 计算结束日期（30天后）
const endDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return formatDate(date)
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

// 初始化时间选择器
const initTimePicker = () => {
  const today = new Date()
  selectedDate.value = formatDate(today)
  
  // 生成时间槽（8:00-18:00 整点）
  timeSlots.value = []
  for (let i = 8; i <= 18; i++) {
    timeSlots.value.push(`${i < 10 ? '0' + i : i}:00`)
  }
  
  // 设置默认时间为下一个整点
  const currentHour = today.getHours()
  const nextHour = currentHour < 18 ? (currentHour + 1) : 8
  selectedTime.value = `${nextHour < 10 ? '0' + nextHour : nextHour}:00`
}

// 日期格式化
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
}

// 打开时间选择器
const openTimePicker = () => {
  if (!doctor.value || !doctor.value.id) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  initTimePicker()
  showPopup.value = true
}

// 关闭时间选择器
const closeTimePicker = () => {
  showPopup.value = false
}

// 日期变化处理
const onDateChange = (e) => {
  selectedDate.value = e.detail.value
}

// 时间变化处理
const onTimeChange = (e) => {
  selectedTime.value = timeSlots.value[e.detail.value]
}

// 确认添加服务
const confirmSchedule = async () => {
  if (!selectedDate.value || !selectedTime.value) {
    uni.showToast({
      title: '请选择完整时间',
      icon: 'none'
    })
    return
  }
  
  // 使用ISO格式日期时间
  const dateObj = new Date(`${selectedDate.value}T${selectedTime.value}:00+08:00`)
  const startTime = dateObj.toISOString()
  
  uni.vibrateShort()
  adding.value = true
  showPopup.value = false

  try {
    // 调用API添加日程
    await createSchedule({
      doctorId: doctor.value.id,
      serviceId: service.value.id,
      startTime: startTime,
      duration: service.value.duration, // 传递服务持续时间
      status: 0,
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    })
    
    uni.showToast({
      title: '服务添加成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('添加服务失败', error)
    uni.showToast({
      title: '添加失败，请重试',
      icon: 'none'
    })
  } finally {
    adding.value = false
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

onLoad((options) => {
  if (options.id) {
    // 实际项目中这里可以加载对应id的服务详情
    console.log('加载服务ID:', options.id)
    service.value.id = parseInt(options.id)
  }
  
  // 从本地存储获取医生信息
  try {
    const doctorData = uni.getStorageSync('doctor')
    if (doctorData) {
      doctor.value = doctorData
    }
  } catch (e) {
    console.log('获取医生信息失败', e)
  }
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

.loading-icon {
  width: 36rpx;
  height: 36rpx;
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
  
  .back-btn {
    position: absolute;
    top: 70rpx; 
    left: 30rpx;
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
      transform: scale(0.9);
      background: rgba(255,255,255,0.4);
    }
    
    .back-icon {
      width: 44rpx;
      height: 44rpx;
      filter: drop-shadow(0 0 2rpx rgba(0,0,0,0.3));
    }
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

/* 注意事项 */
.notes-section {
  .notes-list {
    .note-item {
      position: relative;
      padding-left: 35rpx;
      margin-bottom: 20rpx;
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
      
      &::before {
        content: '';
        position: absolute;
        left: 15rpx;
        top: 12rpx;
        width: 8rpx;
        height: 8rpx;
        background: #4CAF50;
        border-radius: 50%;
      }
    }
  }
}

/* 操作流程 */
.process-section {
  .process-steps {
    .step-item {
      display: flex;
      margin-bottom: 30rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .step-number {
        width: 50rpx;
        height: 50rpx;
        background: #4CAF50;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26rpx;
        font-weight: bold;
        margin-right: 20rpx;
        flex-shrink: 0;
      }
      
      .step-content {
        flex: 1;
        
        .step-title {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .step-desc {
          font-size: 26rpx;
          color: #666;
          line-height: 1.5;
        }
      }
    }
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
    
  }
  
  .book-btn {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: white;
    border-radius: 50rpx;
    height: 86rpx;
    line-height: 86rpx;
    font-size: 30rpx;
    padding: 0 60rpx;
    box-shadow: 0 6rpx 20rpx rgba(46, 125, 50, 0.4);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    font-weight: bold;
    letter-spacing: 2rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
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
    
    text {
      margin-left: 10rpx;
    }
  }
}

/* 时间选择器弹窗 */
.custom-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: relative;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx;
  z-index: 1000;
  animation: popup-show 0.3s ease;
}

@keyframes popup-show {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 时间选择器样式 */
.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.picker-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.picker-close {
  font-size: 50rpx;
  color: #999;
  padding: 0 20rpx;
}

.picker-body {
  padding: 40rpx 0;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.date-picker, .time-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.picker-label {
  font-size: 32rpx;
  color: #666;
}

.picker-value {
  font-size: 34rpx;
  color: #333;
  font-weight: bold;
  padding: 15rpx 30rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.confirm-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 50rpx;
  padding: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(76, 175, 80, 0.4);
  margin-top: 30rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 3rpx 10rpx rgba(76, 175, 80, 0.4);
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

  .popup-content {
    padding: 30rpx;
  }
  
  .picker-title {
    font-size: 32rpx;
  }
  
  .picker-value {
    font-size: 30rpx;
    padding: 12rpx 25rpx;
  }
  
  .confirm-btn {
    font-size: 30rpx;
    padding: 18rpx;
  }
}
</style>