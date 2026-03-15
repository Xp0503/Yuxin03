<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="profile-header">
      <view class="header-left">
        <view class="back-icon" @click="handleBack">
          <image src="/static/general/return-icon.png"></image>
        </view>
        <text class="header-title">我的预约</text>
      </view>
      <view class="filter-btn">
        <!-- 保留过滤按钮位置 -->
      </view>
    </view>
    
    <!-- 预约列表 -->
    <scroll-view 
      scroll-y 
      class="appointment-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态 -->
      <view v-if="pendingAppointments.length === 0 && completedAppointments.length === 0" class="empty-state">
        <image src="/static/general/empty-icon.png" class="empty-icon"></image>
        <text class="empty-text">暂无预约记录</text>
        <text class="empty-subtext">当前没有患者预约您的服务</text>
        <button class="empty-btn" @click="goToService">去预约</button>
      </view>
      
      <!-- 待完成预约 -->
      <view v-if="pendingAppointments.length > 0">
        <view class="section-title">待完成预约</view>
        <view 
          v-for="(item, index) in pendingAppointments" 
          :key="index" 
          class="appointment-card"
          :style="{animationDelay: `${index * 0.05}s`}"
        >
          <image :src="item.serviceImage" class="service-image"></image>
          <view class="card-content">
            <text class="service-name">{{ item.serviceName }}</text>
            <text class="patient-info">患者: {{ item.patientName }}</text>
            <text class="service-desc">{{ item.serviceDescription }}</text>
            <view class="info-row">
              <text class="info-label">日期:</text>
              <text class="service-time">{{ item.time }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">价格:</text>
              <text class="service-time">¥{{ item.price }}</text>
            </view>
          </view>
          <view class="status-actions">
            <text class="status pending">{{ getStatusText(item.status) }}</text>
            <view class="btn-group">
              <button class="btn accept-btn" @click="acceptAppointment(item.id)" v-if="item.status === 1">
                接单
              </button>
              <button class="btn complete-btn" @click="completeAppointment(item.id)" v-if="item.status === 2">
                完成
              </button>
              <button class="btn cancel-btn" @click="showCancelModal(item.id)">
                拒绝
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 已完成预约 -->
      <view v-if="completedAppointments.length > 0">
        <view class="section-title">已完成预约</view>
        <view 
          v-for="(item, index) in completedAppointments" 
          :key="index" 
          class="appointment-card"
          :style="{animationDelay: `${index * 0.05}s`}"
        >
          <image :src="item.serviceImage" class="service-image"></image>
          <view class="card-content">
            <text class="service-name">{{ item.serviceName }}</text>
            <text class="patient-info">患者: {{ item.patientName }}</text>
            <text class="service-desc">{{ item.serviceDescription }}</text>
            <view class="info-row">
              <text class="info-label">日期:</text>
              <text class="service-time">{{ item.time }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">价格:</text>
              <text class="service-time">¥{{ item.price }}</text>
            </view>
          </view>
          <view class="status-actions">
            <text class="status completed">{{ getStatusText(item.status) }}</text>
            <button class="btn detail-btn" @click="viewAppointmentDetail(item)">
              详情
            </button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 拒绝预约弹窗 -->
    <view class="modal-mask" :class="{ 'show': showCancel }" @click="hideCancelModal">
      <view class="cancel-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认拒绝预约</text>
          <image 
            src="/static/index/close-icon.png" 
            @click="hideCancelModal"
            class="close-icon"
            style="width:48rpx;height:48rpx;"
          />
        </view>
        <view class="modal-content">
          <image src="/static/appointment/cancel-icon.png" class="modal-icon"></image>
          <text class="modal-subtitle">您确定要拒绝此预约吗？</text>
        </view>
		<view class="modal-content">
			<text class="modal-tip">拒绝后患者将收到通知</text>
			</view>
        <view class="modal-btns">
          <button class="btn confirm-btn" @click="hideCancelModal">再想想</button>
          <button class="btn cancel-btn" @click="confirmCancel">确认拒绝</button>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view class="modal-mask" :class="{ 'show': showDetail }" @click="hideDetailModal">
      <view class="detail-modal" @click.stop>
        <view class="detail-header">
          <text class="detail-title">预约详情</text>
          <image 
            src="/static/index/close-icon.png" 
            @click="hideDetailModal"
            class="close-icon"
            style="width:60rpx;height:60rpx;"
          />
        </view>
        <view class="detail-content">
          <view class="detail-item">
            <text class="detail-label">患者名称:</text>
            <text class="detail-value">{{ currentDetail.patientName || '' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">联系电话:</text>
            <text class="detail-value">{{ currentDetail.patientPhone || '' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">患者地址:</text>
            <text class="detail-value">{{ currentDetail.patientAddress || '' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">预约时间:</text>
            <text class="detail-value">{{ currentDetail.time || '' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">服务名称:</text>
            <text class="detail-value">{{ currentDetail.serviceName || '' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">服务简介:</text>
            <text class="detail-value">{{ currentDetail.serviceDescription || '' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">诊断记录:</text>
            <text class="detail-value">{{ currentDetail.diagnosis || '暂无记录' }}</text>
          </view>
        </view>
        <view class="detail-footer">
          <button class="btn back-btn" @click="hideDetailModal">返回</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDoctorAppointments, acceptOrder, completeOrder, rejectOrder,getAppointmentDetail } from '@/api/appointment'
import { useDoctorTokenStore } from '@/stores/token'

// 使用医生token store
const doctorTokenStore = useDoctorTokenStore()

// 预约数据
const pendingAppointments = ref([])  // 待完成预约（状态1-待接单，2-已接单待服务）
const completedAppointments = ref([]) // 已完成预约（状态3-已完成，4-已取消）

// 弹窗控制变量
const showCancel = ref(false)
const showDetail = ref(false)
const currentOrderId = ref(null)
const currentDetail = ref({})
const refreshing = ref(false)



// 获取预约列表
const fetchAppointments = async () => {
  try {
	const doctorId = doctorTokenStore.doctor?.id
    if (!doctorId) {
      console.error("医生ID不存在")
      return
    }
    
    const response = await getDoctorAppointments(doctorId)
    
    if (Array.isArray(response)) {
      // 过滤并分类订单
      pendingAppointments.value = response.filter(order => 
        order.status === 1 || order.status === 2
      )
      completedAppointments.value = response.filter(order => 
        order.status === 3 || order.status === 4
      )
      
      // 格式化时间显示
      pendingAppointments.value.forEach(order => {
        order.time = formatDateTime(order.appointmentTime)
      })
      completedAppointments.value.forEach(order => {
        order.time = formatDateTime(order.appointmentTime)
      })
    } else {
      uni.showToast({ title: '获取预约列表失败', icon: 'none' })
    }
  } catch (error) {
    console.error('获取预约列表失败', error)
    uni.showToast({ title: '网络错误，请重试', icon: 'none' })
  } finally {
    refreshing.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  
  try {
    const date = new Date(dateTimeStr)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (e) {
    console.error('日期格式化错误:', e)
    return dateTimeStr
  }
}

// 状态文本转换
const getStatusText = (status) => {
  switch(status) {
    case 0: return '待支付'
    case 1: return '待接单'
    case 2: return '已接单'
    case 3: return '已完成'
    case 4: return '已拒绝'
    default: return '未知状态'
  }
}

// 返回按钮逻辑
const handleBack = () => {
  uni.navigateBack()
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  fetchAppointments()
}

// 接单
const acceptAppointment = async (orderId) => {
  try {
    await acceptOrder(orderId)
    uni.showToast({ title: '接单成功', icon: 'success' })
    
    // 更新本地状态
    const order = pendingAppointments.value.find(o => o.id === orderId)
    if (order) {
      order.status = 2
      order.statusText = '已接单'
    }
  } catch (error) {
    console.error('接单失败', error)
    uni.showToast({ title: '接单失败，请重试', icon: 'none' })
  }
}



// 完成预约
const completeAppointment = async (orderId) => {
  try {
    await completeOrder(orderId)
    uni.showToast({ title: '服务已完成', icon: 'success' })
    
    // 更新本地列表
    const index = pendingAppointments.value.findIndex(o => o.id === orderId)
    if (index !== -1) {
      const order = pendingAppointments.value[index]
      order.status = 3
      
      // 移动到已完成列表
      completedAppointments.value.unshift(order)
      pendingAppointments.value.splice(index, 1)
    }
  } catch (error) {
    console.error('完成预约失败', error)
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

// 显示取消预约弹窗
const showCancelModal = (orderId) => {
  currentOrderId.value = orderId
  showCancel.value = true
}

// 确认取消预约
const confirmCancel = async () => {
  try {
    if (!currentOrderId.value) return
    
    await rejectOrder(currentOrderId.value)
    uni.showToast({ title: '已拒绝预约', icon: 'success' })
    
    // 更新本地列表
    const index = pendingAppointments.value.findIndex(o => o.id === currentOrderId.value)
    if (index !== -1) {
      const order = pendingAppointments.value[index]
      order.status = 4
      
      // 移动到已完成列表
      completedAppointments.value.unshift(order)
      pendingAppointments.value.splice(index, 1)
    }
  } catch (error) {
    console.error('拒绝预约失败', error)
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  } finally {
    showCancel.value = false
    currentOrderId.value = null
  }
}

// 隐藏取消预约弹窗
const hideCancelModal = () => {
  showCancel.value = false
  currentOrderId.value = null
}

// 查看预约详情
const viewAppointmentDetail = async (item) => {
  try {
    // 调用API获取完整详情
    const response = await getAppointmentDetail(item.id)
    
    currentDetail.value = {
      patientName: response.patientName || '未知患者',
      patientPhone: response.patientPhone || '未提供',
      patientAddress: response.patientAddress || '未提供',
      time: formatDateTime(response.appointmentTime),
      serviceName: response.serviceName || '未知服务',
      serviceDescription: response.serviceDescription || '无描述',
      diagnosis: response.diagnosis || '暂无记录',
      amount: `¥${response.amount || '0.00'}`
    }
    
    showDetail.value = true
  } catch (error) {
    console.error('获取预约详情失败', error)
    uni.showToast({ title: '获取详情失败', icon: 'none' })
  }
}

// 隐藏详情弹窗
const hideDetailModal = () => {
  showDetail.value = false
  currentDetail.value = {}
}

// 去预约服务
const goToService = () => {
  uni.navigateTo({
    url: '/pages/service/service'
  })
}

onMounted(() => {
  fetchAppointments()
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
  padding: 30rpx;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 40rpx; 
  border-bottom-right-radius: 40rpx; 
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.3);
  border-bottom: 1rpx solid #f1f5f9;
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

.filter-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.5;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.empty-subtext {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 15rpx 50rpx;
  font-size: 30rpx;
  box-shadow: 0 4rpx 15rpx rgba(46, 125, 50, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(46, 125, 50, 0.3);
  }
}

/* 预约列表样式 */
.appointment-list {
  padding: 10rpx 20rpx 100rpx;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 200rpx);
  box-sizing: border-box;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin: 30rpx 0 20rpx;
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

.appointment-card {
  display: flex;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: translateY(30rpx);
  animation: fadeInUp 0.5s ease forwards;
  
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

.service-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 30rpx;
  background-color: #f1f5f9;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.service-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.patient-info {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.service-desc {
  font-size: 26rpx;
  color: #666;
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

.info-label {
  font-size: 24rpx;
  color: #999;
  min-width: 80rpx;
}

.service-time {
  font-size: 24rpx;
  color: #333;
}

.status-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 160rpx;
}

.status {
  font-size: 26rpx;
  margin-bottom: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
  text-align: center;
}

.pending {
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
}

.completed {
  background: rgba(46, 204, 113, 0.1);
  color: #2ECC71;
}

/* 按钮样式 - 统一使用category风格 */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  padding: 12rpx 30rpx;
  font-size: 26rpx;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;
  
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
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
  }
}

.accept-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: #fff;
}

.complete-btn {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: #fff;
}

.cancel-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #fff;
}

.detail-btn {
  background: linear-gradient(135deg, #9C27B0, #7B1FA2);
  color: #fff;
}

/* 按钮组样式 */
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  width: 100%;
  
  .btn {
    width: 100%;
    box-sizing: border-box;
  }
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
  justify-content: center;
  align-items: center;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  &.show {
    opacity: 1;
    pointer-events: auto;
  }
}

.cancel-modal {
  background-color: #fff;
  border-radius: 24rpx;
  width: 85%;
  max-width: 600rpx;
  overflow: hidden;
  transform: scale(0.9);
  transition: transform 0.3s ease;
  
  .modal-mask.show & {
    transform: scale(1);
  }
}

.modal-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-content {
  padding: 5rpx;
  text-align: center;
}

.modal-icon {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 20rpx;
}

.modal-subtitle {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.modal-tip {
  font-size: 26rpx;
  color: #999;
}

.modal-btns {
  display: flex;
  padding: 50rpx 30rpx 30rpx;
  gap: 20rpx;
  
  .btn {
    flex: 1;
    padding: 15rpx 0;
    font-size: 28rpx;
  }
}

/* 详情弹窗样式 */
.detail-modal {
  background-color: #fff;
  border-radius: 24rpx;
  width: 85%;
  max-height: 80vh;
  overflow-y: auto;
  transform: scale(0.9);
  opacity: 0;
  transition: all 0.3s ease;
  
  .modal-mask.show & {
    transform: scale(1);
    opacity: 1;
  }
}

.detail-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.detail-content {
  padding: 30rpx;
}

.detail-item {
  display: flex;
  margin-bottom: 25rpx;
  padding-bottom: 25rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  min-width: 200rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.detail-footer {
  padding: 30rpx;
  display: flex;
  justify-content: center;
}

.back-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: #fff;
  padding: 12rpx 60rpx;
}
</style>