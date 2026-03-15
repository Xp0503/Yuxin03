<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
          <!-- 左侧：返回按钮 -->
          <view class="header-left">
        <view class="back-icon" @click="handleBack">
          <image src="/static/general/return-icon.png"></image>
        </view>
          </view>
          
          <!-- 中间：标题 -->
          <view class="header-center">
            <text class="title">我的服务</text>
          </view>
          
          <!-- 右侧：编辑按钮 -->
          <view class="header-right">
            <view class="edit-container" @click="toggleEditMode">
              <text class="edit-btn">{{ isEditing ? '完成' : '编辑' }}</text>
            </view>
          </view>
        </view>
    <!-- 内容区域 -->
    <scroll-view 
      scroll-y 
      class="scroll-container"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="detail-content">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-state">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="isEmpty" class="empty-state">
          <view class="empty-icon">
            <view class="icon-inner"></view>
          </view>
          <text class="empty-title">暂无服务数据</text>
          <text class="empty-desc">添加您的服务项目和时间吧</text>
        </view>

        <!-- 服务列表 -->
        <view v-else class="evaluation-list">
          <!-- 服务项目区域 -->
          <view class="section service-section">
            <view class="section-header">
              <text class="section-title">预约服务</text>
              <view 
                class="add-btn" 
                v-if="isEditing"
                @click="openServiceModal"
              >+ 添加服务</view>
            </view>
            
            <view class="service-list">
              <view 
                class="service-item" 
                v-for="(service, index) in serviceList" 
                :key="service.id"
                :style="{animationDelay: `${index * 0.1}s`}"
              >
                <!-- 浅绿色圆角矩形框 -->
                <view class="service-tag">{{ service.name }}</view>
                
                <view class="service-actions" v-if="isEditing">
                  <view class="edit-icon" @click="editService(service)"></view>
                  <view class="delete-icon" @click="deleteService(service.id)"></view>
                </view>
              </view>
            </view>
          </view>

          <!-- 时间区域 -->
          <view class="section time-section">
            <view class="section-header">
              <text class="section-title">选的时间</text>
              <view 
                class="add-btn" 
                v-if="isEditing"
                @click="openTimeSelector"
              >+ 添加时段</view>
            </view>
            
            <view class="time-list">
              <view 
                class="time-item" 
                v-for="(time, index) in timeList" 
                :key="time.id"
                :style="{animationDelay: `${index * 0.1}s`}"
              >
                <text class="time-text">{{ time.period }}</text>
                
                <view class="time-actions" v-if="isEditing">
                  <view class="edit-icon" @click="editTime(time)"></view>
                  <view class="delete-icon" @click="deleteTime(time.id)"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 服务编辑弹窗 -->
    <view class="modal-mask" v-if="showServiceModal" @click="closeServiceModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ currentService.id ? '编辑服务' : '添加服务' }}</text>
        
        <view class="form-group">
          <text class="form-label">服务名称*</text>
          <input 
            class="form-input" 
            v-model="currentService.name" 
            placeholder="如：术后康复护理"
          />
        </view>
        
        <view class="modal-buttons">
          <button class="cancel-button" @click="closeServiceModal">取消</button>
          <button class="confirm-button" @click="saveService">确认</button>
        </view>
      </view>
    </view>

    <!-- 时间选择器弹窗 -->
    <view class="modal-mask" v-if="showTimeSelector" @click="closeTimeSelector">
      <view class="time-modal" @click.stop>
        <text class="modal-title">{{ currentTime.id ? '编辑时段' : '添加时段' }}</text>
        
        <view class="time-picker-content">
          <!-- 星期选择 -->
          <view class="week-selector">
            <text class="picker-label">选择星期:</text>
            <view class="week-buttons">
              <view 
                class="week-btn" 
                :class="{ selected: selectedWeeks.includes(week.value) }"
                @click="toggleWeek(week.value)"
                v-for="week in weekOptions" 
                :key="week.value"
              >
                {{ week.label }}
              </view>
            </view>
          </view>
          
          <!-- 时间范围选择 -->
          <view class="time-range-selector">
            <text class="picker-label">选择时间:</text>
            <view class="time-input-group">
              <picker mode="time" class="time-input" @change="onStartTimeChange">
                <view>{{ startTime || '开始时间' }}</view>
              </picker>
              <text class="time-separator">至</text>
              <picker mode="time" class="time-input" @change="onEndTimeChange">
                <view>{{ endTime || '结束时间' }}</view>
              </picker>
            </view>
          </view>
        </view>
        
        <view class="modal-buttons">
          <button class="cancel-button" @click="closeTimeSelector">取消</button>
          <button class="confirm-button" @click="saveTimeFromSelector">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// 状态管理
const isEditing = ref(false)
const refreshing = ref(false)
const loading = ref(true)
const showServiceModal = ref(false)
const showTimeSelector = ref(false)

// 数据存储
const serviceList = ref([])
const timeList = ref([])

// 当前编辑项
const currentService = ref({ id: '', name: '' })
const currentTime = ref({ id: '', period: '' })

// 时间选择器相关变量
const weekOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 0 }
]
const selectedWeeks = ref([])
const startTime = ref('')
const endTime = ref('')

// 空状态判断
const isEmpty = computed(() => {
  return serviceList.value.length === 0 && timeList.value.length === 0
})

// 模拟数据
const mockServices = [
  { id: 's1', name: '术后康复护理' },
  { id: 's2', name: '慢性病管理' },
  { id: 's3', name: '老年日常护理' }
]

const mockTimes = [
  { id: 't1', period: '周一、周三、周五 09:00-11:30' },
  { id: 't2', period: '周二、周四 14:00-16:30' }
]

// 获取数据
const fetchData = () => {
  setTimeout(() => {
    serviceList.value = [...mockServices]
    timeList.value = [...mockTimes]
    loading.value = false
    refreshing.value = false
  }, 800)
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  fetchData()
}

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}

// 切换编辑模式
const toggleEditMode = () => {
  isEditing.value = !isEditing.value
}

// 服务相关操作
const openServiceModal = () => {
  currentService.value = { id: '', name: '' }
  showServiceModal.value = true
}

const editService = (service) => {
  currentService.value = { ...service }
  showServiceModal.value = true
}

const saveService = () => {
  if (!currentService.value.name.trim()) {
    uni.showToast({ title: '请输入服务名称', icon: 'none' })
    return
  }

  if (currentService.value.id) {
    const index = serviceList.value.findIndex(item => item.id === currentService.value.id)
    if (index !== -1) {
      serviceList.value.splice(index, 1, { ...currentService.value })
    }
  } else {
    serviceList.value.push({
      ...currentService.value,
      id: 's' + Date.now()
    })
  }

  showServiceModal.value = false
  uni.showToast({ title: '操作成功', icon: 'none' })
}

const deleteService = (id) => {
  serviceList.value = serviceList.value.filter(item => item.id !== id)
  uni.showToast({ title: '已删除', icon: 'none' })
}

const closeServiceModal = () => {
  showServiceModal.value = false
}

// 时间选择器相关操作
const openTimeSelector = (time = null) => {
  selectedWeeks.value = []
  startTime.value = ''
  endTime.value = ''
  
  if (time) {
    currentTime.value = { ...time }
    // 这里可以解析已有时间字符串到选择器（简化处理）
  } else {
    currentTime.value = { id: '', period: '' }
  }
  
  showTimeSelector.value = true
}

const toggleWeek = (value) => {
  const index = selectedWeeks.value.indexOf(value)
  if (index === -1) {
    selectedWeeks.value.push(value)
  } else {
    selectedWeeks.value.splice(index, 1)
  }
}

const onStartTimeChange = (e) => {
  startTime.value = e.detail.value
}

const onEndTimeChange = (e) => {
  endTime.value = e.detail.value
}

const saveTimeFromSelector = () => {
  if (selectedWeeks.value.length === 0) {
    uni.showToast({ title: '请选择星期', icon: 'none' })
    return
  }
  
  if (!startTime.value || !endTime.value) {
    uni.showToast({ title: '请选择完整时间段', icon: 'none' })
    return
  }
  
  // 格式化星期文本
  const sortedWeeks = [...selectedWeeks.value].sort((a, b) => a - b)
  const weekText = sortedWeeks.map(week => {
    const weekItem = weekOptions.find(item => item.value === week)
    return weekItem ? weekItem.label : ''
  }).join('、')
  
  // 格式化时间字符串
  const timeText = `${weekText} ${startTime.value}-${endTime.value}`
  
  // 保存时间
  if (currentTime.value.id) {
    const index = timeList.value.findIndex(item => item.id === currentTime.value.id)
    if (index !== -1) {
      timeList.value.splice(index, 1, {
        ...currentTime.value,
        period: timeText
      })
    }
  } else {
    timeList.value.push({
      id: 't' + Date.now(),
      period: timeText
    })
  }
  
  showTimeSelector.value = false
  uni.showToast({ title: '时间已保存', icon: 'none' })
}

const editTime = (time) => {
  openTimeSelector(time)
}

const deleteTime = (id) => {
  timeList.value = timeList.value.filter(item => item.id !== id)
  uni.showToast({ title: '已删除', icon: 'none' })
}

const closeTimeSelector = () => {
  showTimeSelector.value = false
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  position: relative;
}

/* 顶部导航栏  */
.header {
  display: flex;
  align-items: center;
  padding: 60rpx 30rpx 30rpx;
  justify-content: space-between;
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
  /* 移除标题的绝对定位 */
    .title {
      position: static; 
      transform: none;  
      left: auto;       
    }
  
    /* 新增三列布局样式 */
    .header-left,
    .header-center,
    .header-right {
      flex: 1; /* 平均分配空间 */
      display: flex;
      z-index: 1;
    }
  
    .header-left {
      justify-content: flex-start;
    }
  
    .header-center {
      justify-content: center;
    }
  
    .header-right {
      justify-content: flex-end;
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

.edit-container {
  display: flex;
  align-items: center;
  z-index: 1;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  transition: all 0.3s ease;
  
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }
}

.edit-btn {
  color: #fff;
  font-size: 28rpx;
}

/* 滚动容器 - 使用comdetail风格 */
.scroll-container {
  height: calc(100vh - 180rpx);
  padding: 0 30rpx;
  box-sizing: border-box;
}

.detail-content {
  padding: 30rpx 0 60rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #e8f5e9;
    border-top-color: #4CAF50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }

  .loading-text {
    font-size: 28rpx;
    color: #666;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-icon {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-inner {
      width: 80rpx;
      height: 80rpx;
      border: 4rpx solid #d0d7d1;
      border-radius: 16rpx;
      position: relative;
    }
  }

  .empty-title {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 15rpx;
  }

  .empty-desc {
    font-size: 26rpx;
    color: #999;
  }
}

/* 评价列表 */
.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 通用区域样式 */
.section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25rpx;
    padding-bottom: 15rpx;
    border-bottom: 1rpx solid #f1f5f1;
  
    .section-title {
      font-size: 30rpx;
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
  
    .add-btn {
      color: #4CAF50;
      font-size: 26rpx;
      padding: 8rpx 16rpx;
      border: 1rpx dashed #4CAF50;
      border-radius: 20rpx;
      transition: all 0.3s;
  
      &:active {
        background-color: #f1f8e9;
      }
    }
  }
}

/* 服务列表样式 */
.service-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.service-item {
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateY(20rpx);
  animation: fadeInUp 0.5s ease forwards;

  .service-tag {
    background-color: #e8f5e9;
    color: #2E7D32;
    font-size: 26rpx;
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
  }

  .service-actions {
    display: flex;
    margin-left: 15rpx;
  }
}

/* 时间列表样式 */
.time-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.time-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  opacity: 0;
  transform: translateY(20rpx);
  animation: fadeInUp 0.5s ease forwards;

  .time-text {
    font-size: 26rpx;
    color: #333;
    flex: 1;
  }

  .time-actions {
    display: flex;
  }
}

/* 编辑和删除图标 */
.edit-icon, .delete-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 10rpx;
  position: relative;
  transition: opacity 0.3s;

  &:active {
    opacity: 0.7;
  }
}

.edit-icon::after {
  content: '';
  position: absolute;
  width: 24rpx;
  height: 4rpx;
  background-color: #4CAF50;
  top: 18rpx;
  left: 8rpx;
}

.edit-icon::before {
  content: '';
  position: absolute;
  width: 4rpx;
  height: 24rpx;
  background-color: #4CAF50;
  top: 8rpx;
  left: 18rpx;
}

.delete-icon::before {
  content: '';
  position: absolute;
  width: 24rpx;
  height: 4rpx;
  background-color: #f44336;
  top: 18rpx;
  left: 8rpx;
  transform: rotate(45deg);
}

.delete-icon::after {
  content: '';
  position: absolute;
  width: 24rpx;
  height: 4rpx;
  background-color: #f44336;
  top: 18rpx;
  left: 8rpx;
  transform: rotate(-45deg);
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content, .time-modal {
  width: 85%;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;

  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 30rpx;
  }
}

/* 表单组 */
.form-group {
  margin-bottom: 30rpx;

  .form-label {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 10rpx;
  }

  .form-input {
    width: 100%;
    height: 70rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 26rpx;
    box-sizing: border-box;
  }
}

/* 时间选择器样式 */
.time-picker-content {
  margin-bottom: 30rpx;
}

.picker-label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.week-selector {
  margin-bottom: 25rpx;
}

.week-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.week-btn {
  padding: 12rpx 18rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
  text-align: center;
  
  &.selected {
    background-color: #e8f5e9;
    border-color: #4CAF50;
    color: #2E7D32;
  }
}

.time-range-selector {
  .time-input-group {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }
  
  .time-input {
    flex: 1;
    height: 70rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 26rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  
  .time-separator {
    font-size: 26rpx;
    color: #666;
  }
}

.modal-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;

  .cancel-button, .confirm-button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    padding: 0;
  }

  .cancel-button {
    background-color: #f5f5f5;
    color: #666;
    
    &::before {
      border: none;
    }
    
    &:active {
      background-color: #e8e8e8;
    }
  }

  .confirm-button {
    background-color: #4CAF50;
    color: #fff;
    
    &::before {
      border: none;
    }
    
    &:active {
      background-color: #3d8b40;
    }
  }
}

/* 动画效果 */
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 375rpx) {
  .service-tag {
    font-size: 24rpx !important;
    padding: 10rpx 20rpx !important;
  }
  
  .time-text {
    font-size: 24rpx !important;
  }
  
  .week-btn {
    padding: 10rpx 15rpx !important;
    font-size: 24rpx !important;
  }
}
</style>