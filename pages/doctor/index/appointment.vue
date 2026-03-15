<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="profile-header">
      <view class="header-left">
        <view class="back-icon" @click="goBack">
          <image src="/static/general/return-icon.png"></image>
        </view>
        <text class="header-title">服务预约</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="appointment-list">
      <!-- 分类选项卡 -->
      <view class="tabs">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'today' }"
          @click="activeTab = 'today'"
        >
          <text>今日任务</text>
          <view class="indicator" v-if="activeTab === 'today'"></view>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'future' }"
          @click="activeTab = 'future'"
        >
          <text>之后活动</text>
          <view class="indicator" v-if="activeTab === 'future'"></view>
        </view>
      </view>
      
      <!-- 任务列表 -->
      <view class="task-list">
        <!-- 今日任务 -->
        <view v-if="activeTab === 'today'">
          <view 
            class="appointment-card" 
            v-for="(task, index) in todayTasks" 
            :key="'today-' + index"
            :style="{animationDelay: `${index * 0.05}s`}"
          >
            <view class="task-header">
              <text class="service-name">{{ task.serviceName }}</text>
              <text class="task-price">¥{{ task.price }}</text>
            </view>
            <text class="service-desc">{{ task.description }}</text>
            
            <view class="task-actions">
              <button class="action-btn patient-btn" @click="showPatientDetail(task)">
                <image src="/static/service/people-icon.png" class="action-icon"></image>
                <text>患者详情</text>
              </button>
              <button class="action-btn order-btn" @click="showOrderDetail(task)">
                <image src="/static/service/sub-icon.png" class="action-icon"></image>
                <text>订单详情</text>
              </button>
            </view>
          </view>
          
          <view class="empty-state" v-if="todayTasks.length === 0">
            <image src="/static/general/empty-icon.png" class="action-icon"></image>
            <text class="empty-text">今日没有预约任务</text>
          </view>
        </view>
        
        <!-- 之后活动 -->
        <view v-if="activeTab === 'future'">
          <view 
            class="appointment-card" 
            v-for="(task, index) in futureTasks" 
            :key="'future-' + index"
            :style="{animationDelay: `${index * 0.05}s`}"
          >
            <view class="task-header">
              <text class="service-name">{{ task.serviceName }}</text>
              <text class="task-price">¥{{ task.price }}</text>
            </view>
            <text class="service-desc">{{ task.description }}</text>
            <view class="info-row">
              <image src="/static/appointment/calendar-icon.png" class="icon-img"></image>
              <text class="service-time">{{ formatDate(task.date) }}</text>
            </view>
            
            <view class="task-actions">
              <button class="action-btn patient-btn" @click="showPatientDetail(task)">
                <image src="/static/service/people-icon.png" class="action-icon"></image>
                <text>患者详情</text>
              </button>
              <button class="action-btn order-btn" @click="showOrderDetail(task)">
                <image src="/static/service/sub-icon.png" class="action-icon"></image>
                <text>订单详情</text>
              </button>
            </view>
          </view>
          
          <view class="empty-state" v-if="futureTasks.length === 0">
            <uni-icons type="calendar" size="48" color="#4CAF50"></uni-icons>
            <text class="empty-text">暂无未来预约</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 患者详情模态框 -->
    <view class="modal-mask" v-if="showPatientModal" @click="closePatientModal"></view>
    <view class="modal-container patient-modal" v-if="showPatientModal">
      <view class="modal-header">
        <text class="modal-title">患者详情</text>
        <uni-icons type="close" size="24" color="#666" @click="closePatientModal"></uni-icons>
      </view>
      
      <scroll-view scroll-y class="modal-content">
        <view class="patient-info">
          <view class="info-item">
            <text class="info-label">患者姓名:</text>
            <text class="info-value">{{ currentPatient.name }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">年龄:</text>
            <text class="info-value">{{ currentPatient.age }}岁</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系电话:</text>
            <text class="info-value">{{ currentPatient.phone }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务地址:</text>
            <text class="info-value">{{ currentPatient.address }}</text>
          </view>
        </view>
        
        <view class="diagnosis-section">
          <text class="section-title">诊断情况</text>
          <textarea 
            class="diagnosis-input" 
            placeholder="请输入患者的诊断情况..." 
            v-model="currentPatient.diagnosis"
            auto-height
          ></textarea>
        </view>
      </scroll-view>
      
      <view class="modal-footer">
        <button class="modal-btn cancel-btn" @click="closePatientModal">取消</button>
        <button class="modal-btn submit-btn" @click="submitDiagnosis">提交</button>
      </view>
    </view>
    
    <!-- 订单详情模态框 -->
    <view class="modal-mask" v-if="showOrderModal" @click="closeOrderModal"></view>
    <view class="modal-container order-modal" v-if="showOrderModal">
      <view class="modal-header">
        <text class="modal-title">订单详情</text>
        <uni-icons type="close" size="24" color="#666" @click="closeOrderModal"></uni-icons>
      </view>
      
      <scroll-view scroll-y class="modal-content">
        <view class="order-info">
          <view class="info-item">
            <text class="info-label">服务名称:</text>
            <text class="info-value">{{ currentOrder.serviceName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务简介:</text>
            <text class="info-value">{{ currentOrder.description }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">预约时间:</text>
            <text class="info-value">{{ formatDateTime(currentOrder.date) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务地点:</text>
            <text class="info-value">{{ currentOrder.address }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务时长:</text>
            <text class="info-value">{{ currentOrder.duration }}分钟</text>
          </view>
          <view class="info-item">
            <text class="info-label">备注信息:</text>
            <text class="info-value">{{ currentOrder.notes || '无' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">订单状态:</text>
            <text class="info-value status-value" :style="{ color: getStatusColor(currentOrder.status) }">
              {{ currentOrder.status }}
            </text>
          </view>
        </view>
      </scroll-view>
      
      <view class="modal-footer">
        <button class="modal-btn cancel-btn" @click="closeOrderModal">取消</button>
        <button class="modal-btn confirm-btn" @click="confirmService">确认服务</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 当前激活的选项卡
const activeTab = ref('today')

// 模态框显示状态
const showPatientModal = ref(false)
const showOrderModal = ref(false)

// 今日任务数据
const todayTasks = ref([
  {
    id: 1,
    serviceName: '老年痴呆专业护理',
    description: '为老年痴呆患者提供专业护理服务，包括生活照料和认知训练',
    price: 298.00,
    date: new Date(),
    patient: {
      name: '张大爷',
      age: 78,
      phone: '138****1234',
      address: '北京市朝阳区建国路88号',
      diagnosis: '阿尔茨海默症中期，需要定期护理和认知训练'
    },
    order: {
      duration: 120,
      notes: '患者喜欢听老歌，可以准备一些经典歌曲',
      status: '待服务'
    }
  },
  {
    id: 2,
    serviceName: '术后康复护理',
    description: '为术后患者提供专业康复护理，包括伤口护理和康复训练',
    price: 258.00,
    date: new Date(),
    patient: {
      name: '李女士',
      age: 65,
      phone: '139****5678',
      address: '北京市海淀区中关村大街1号',
      diagnosis: '膝关节置换术后，需要康复训练'
    },
    order: {
      duration: 90,
      notes: '患者对疼痛敏感，动作需轻柔',
      status: '待服务'
    }
  }
])

// 未来任务数据
const futureTasks = ref([
  {
    id: 3,
    serviceName: '慢性病日常护理',
    description: '为慢性病患者提供日常护理和健康监测服务',
    price: 198.00,
    date: new Date(Date.now() + 86400000 * 2), // 2天后
    patient: {
      name: '王先生',
      age: 72,
      phone: '136****9012',
      address: '北京市西城区金融街15号',
      diagnosis: '高血压、糖尿病，需要定期监测'
    },
    order: {
      duration: 60,
      notes: '需要记录每日血压和血糖值',
      status: '已预约'
    }
  },
  {
    id: 4,
    serviceName: '临终关怀服务',
    description: '为终末期患者提供身心关怀和疼痛管理服务',
    price: 358.00,
    date: new Date(Date.now() + 86400000 * 5), // 5天后
    patient: {
      name: '赵奶奶',
      age: 85,
      phone: '137****3456',
      address: '北京市东城区东直门内大街9号',
      diagnosis: '肺癌晚期，需要疼痛管理和心理支持'
    },
    order: {
      duration: 180,
      notes: '家属希望多陪伴聊天',
      status: '已预约'
    }
  }
])

// 当前查看的患者和订单
const currentPatient = ref({
  name: '',
  age: '',
  phone: '',
  address: '',
  diagnosis: ''
})
const currentOrder = ref({
  serviceName: '',
  description: '',
  date: '',
  address: '',
  duration: '',
  notes: '',
  status: ''
})

// 显示患者详情模态框
const showPatientDetail = (task) => {
  currentPatient.value = {
    ...task.patient,
    diagnosis: task.patient.diagnosis || ''
  }
  showPatientModal.value = true
}

// 显示订单详情模态框
const showOrderDetail = (task) => {
  currentOrder.value = {
    serviceName: task.serviceName,
    description: task.description,
    date: task.date,
    address: task.patient.address,
    duration: task.order.duration,
    notes: task.order.notes,
    status: task.order.status
  }
  showOrderModal.value = true
}

// 关闭模态框
const closePatientModal = () => {
  showPatientModal.value = false
}
const closeOrderModal = () => {
  showOrderModal.value = false
}

// 提交诊断
const submitDiagnosis = () => {
  uni.showToast({
    title: '诊断记录已提交',
    icon: 'success'
  })
  closePatientModal()
}

// 确认服务
const confirmService = () => {
  uni.showToast({
    title: '服务已确认',
    icon: 'success'
  })
  closeOrderModal()
}

// 格式化日期
const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

// 格式化日期时间
const formatDateTime = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

// 获取状态颜色
const getStatusColor = (status) => {
  switch(status) {
    case '待服务': return '#FF5722'
    case '已预约': return '#2196F3'
    case '已完成': return '#4CAF50'
    default: return '#666'
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

onLoad(() => {
  // 可以在这里加载真实数据
})
</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  padding-bottom: 30rpx;
  position: relative;
  overflow: hidden;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 顶部导航栏 */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.3);
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

/* 预约列表样式 */
.appointment-list {
  padding: 10rpx 30rpx 100rpx;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 200rpx);
  box-sizing: border-box;
}

/* 选项卡样式 */
.tabs {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 30rpx;
    color: #666;
    position: relative;
    transition: all 0.3s ease;
    
    &.active {
      color: #4CAF50;
      font-weight: bold;
    }
    
    .indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80rpx;
      height: 6rpx;
      background: linear-gradient(90deg, #4CAF50, #2E7D32);
      border-radius: 3rpx;
    }
  }
}

/* 任务卡片样式 */
.task-list {
  .appointment-card {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 24rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(30rpx);
    animation: fadeInUp 0.5s ease forwards;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 8rpx;
      height: 100%;
      background: linear-gradient(to bottom, #4CAF50, #2E7D32);
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
  }
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }
  
  .service-name {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
  }
  
  .task-price {
    font-size: 36rpx;
    color: #FF5722;
    font-weight: bold;
    margin-left: 20rpx;
  }
  
  .service-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 20rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  
  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
  }
  
  .icon-img {
    width: 48rpx;
    height: 48rpx;
    margin-right: 10rpx;
  }
  
  .service-time {
    font-size: 26rpx;
    color: #4CAF50;
    font-weight: 500;
  }
  
  .task-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
    
    .action-btn {
      flex: 1;
      height: 64rpx;
      line-height: 64rpx;
      border-radius: 32rpx;
      font-size: 26rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 20rpx;
      transition: all 0.2s ease;
      
      &:active {
        transform: scale(0.96);
        opacity: 0.9;
      }
    }
    
    .patient-btn {
      background: linear-gradient(135deg, #2196F3, #1E88E5);
      color: #fff;
    }
    
    .order-btn {
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      color: #fff;
    }
    
    .action-icon {
      width: 36rpx;
      height: 36rpx;
      margin-right: 10rpx;
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
    color: #666;
    font-size: 28rpx;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
    
    text {
      margin-top: 20rpx;
    }
  }
}

/* 模态框遮罩 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

/* 模态框容器 */
.modal-container {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 90%;
  max-height: 70vh;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  
  &.patient-modal {
    height: 70vh;
  }
  
  &.order-modal {
    height: 65vh;
  }
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 100%);
  }
  to {
    transform: translate(-50%, 0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .modal-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }
}

.modal-content {
  flex: 1;
  padding: 30rpx;
  overflow: hidden;
}

/* 患者信息样式 */
.patient-info {
  .info-item {
    display: flex;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    
    .info-label {
      color: #666;
      width: 160rpx;
    }
    
    .info-value {
      color: #333;
      flex: 1;
      font-weight: 500;
    }
  }
}

/* 诊断输入区域 */
.diagnosis-section {
  margin-top: 40rpx;
  
  .section-title {
    display: block;
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .diagnosis-input {
    width: 100%;
    min-height: 200rpx;
    background-color: #f8f9fb;
    border-radius: 16rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
    border: 1rpx solid #e0e0e0;
  }
}

/* 订单信息样式 */
.order-info {
  .info-item {
    margin-bottom: 20rpx;
    font-size: 28rpx;
    
    .info-label {
      color: #666;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .info-value {
      color: #333;
      font-weight: 500;
      display: block;
      padding-left: 20rpx;
      border-left: 4rpx solid #4CAF50;
    }
    
    .status-value {
      font-weight: bold;
    }
  }
}

/* 模态框底部按钮 */
.modal-footer {
  display: flex;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  
  .modal-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 30rpx;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.96);
    }
  }
  
  .cancel-btn {
    background-color: #f8f9fb;
    color: #666;
    margin-right: 20rpx;
  }
  
  .submit-btn {
    background: linear-gradient(135deg, #2196F3, #1E88E5);
    color: #fff;
  }
  
  .confirm-btn {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: #fff;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
  margin-top: 20rpx;
}
</style>