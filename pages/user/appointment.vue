<template>
  <view class="container">
    <!-- 顶部导航栏  -->
    <view class="profile-header">
      <view class="header-left">
        <view class="back-icon" @click="handleBack">
          <image src="/static/general/return-icon.png"></image>
        </view>
        <text class="header-title">我的预约</text>
      </view>
     <view class="filter-btn" @click="showFilter = !showFilter">
        <image src="/static/general/filter-icon.png" style="width: 36rpx; height: 36rpx;"></image>
      </view>
    </view>
  
  <!-- 筛选条件 -->
      <view class="filter-bar" v-if="showFilter">
        <picker :range="filterOptions" @change="filterChange">
          <view class="filter-item">
            <text>{{filterOptions[filterIndex]}}</text>
            <image src="/static/general/down-icon.png" class="filter-icon"></image>
          </view>
        </picker>
      </view>
	  
    <!-- 预约列表  -->
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
        <text class="empty-subtext">快去预约服务吧</text>
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
            <text class="service-desc">{{ item.serviceDescription }}</text>
            <view class="info-row">
              <image src="/static/appointment/time-icon.png" class="icon-img" style="width:48rpx;height:48rpx;"/>
              <text class="service-time">{{ item.time }}</text>
            </view>
            <view class="info-row">
              <image src="/static/index/info-icon.png" class="icon-img" style="width:48rpx;height:48rpx;"/>
              <text class="service-time">订单号: {{ item.orderNo }}</text>
            </view>
          </view>
          <view class="status-actions">
            <text class="status pending">{{ getStatusText(item.status) }}</text>
            <button class="cancel-btn" @click="showCancelModal(item.id)">
              <image src="/static/index/close-icon.png" style="width:48rpx;height:48rpx;margin-right:10rpx;"/>
              <text>取消</text>
            </button>
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
          <image src="/static/appointment/appo-pic.jpg" class="service-image"></image>
          <view class="card-content">
            <text class="service-name">{{ item.serviceName }}</text>
            <text class="service-desc">{{ item.serviceDescription }}</text>
            <view class="info-row">
              <image src="/static/appointment/calendar-icon.png" class="icon-img" style="width:48rpx;height:48rpx;"/>
              <text class="service-time">{{ item.time }}</text>
            </view>
            <view class="info-row">
              <image src="/static/msg/send-icon.png" class="icon-img" style="width:48rpx;height:48rpx;"/>
              <text class="service-time">订单号: {{ item.orderNo }}</text>
            </view>
          </view>
          <view class="status-actions">
            <text class="status completed">{{ getStatusText(item.status) }}</text>
            <view class="btn-group">
              <button class="eval-btn" @click="showEvalModal(item.id)">
                <image src="/static/appointment/comment-icon.png" style="width:48rpx;height:48rpx;margin-right:10rpx;"/>
                <text>评价</text>
              </button>
              <button class="complain-btn" @click="showComplainModal(item.id)">
                <image src="/static/appointment/complaint-icon.png" style="width:48rpx;height:48rpx;margin-right:10rpx;"/>
                <text>投诉</text>
              </button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 弹窗部分 -->
    <!-- 取消预约弹窗 -->
    <view class="modal-mask" v-if="showCancel">
      <view class="cancel-modal">
        <text class="modal-title">确认取消预约</text>
        <text class="modal-subtitle">您确定要取消此预约吗？</text>
        <view class="modal-btns">
          <button class="confirm-btn" @click="confirmCancel">确认取消</button>
          <button class="cancel-btn" @click="hideCancelModal">再想想</button>
        </view>
      </view>
    </view>

    <!-- 评价弹窗 -->
    <view class="modal-mask" v-if="showEval">
      <view class="eval-modal">
        <view class="modal-header">
          <text class="modal-title">服务评价</text>
          <image 
            src="/static/index/close-icon.png" 
            @click="showEval = false"
            class="close-icon"
            style="width:60rpx;height:60rpx;"
          />
        </view>
        <view class="stars">
          <view 
            v-for="(star, index) in 5" 
            :key="index" 
            class="star-wrapper"
            @click="selectStar(index + 1)"
          >
            <image 
              :src="index < selectedStar ? '/static/general/star-filled.png' : '/static/general/star.png'"
              style="width:80rpx;height:80rpx;"
            />
          </view>
        </view>
        <text class="rating-text">评分: {{ selectedStar }}星</text>
        <textarea 
          class="eval-textarea" 
          placeholder="请输入评价详情" 
          v-model="evalContent"
          maxlength="200"
        ></textarea>
        <text class="char-count">{{ evalContent.length }}/200</text>
        <button class="submit-btn" @click="submitEval">提交评价</button>
      </view>
    </view>

    <!-- 投诉弹窗 -->
    <view class="modal-mask" v-if="showComplain">
      <view class="complain-modal">
        <view class="modal-header">
          <text class="modal-title">服务投诉</text>
          <image 
            src="/static/index/close-icon.png" 
            @click="showComplain = false"
            class="close-icon"
            style="width:60rpx;height:60rpx;"
          />
        </view>
        <view class="complain-header">
          <text>投诉理由</text>
          <picker 
            mode="selector" 
            :range="complainReasons" 
            @change="handleComplainReasonChange"
          >
            <view class="picker-view">{{ selectedReason }}</view>
          </picker>
        </view>
        <textarea 
          class="complain-textarea" 
          placeholder="请输入投诉详情" 
          v-model="complainContent"
        ></textarea>
        <button class="submit-btn" @click="submitComplain">提交投诉</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getUserAppointments, cancelAppointment } from '@/api/appointment'
import { createEvaluation } from '@/api/evaluation'
import { useTokenStore } from '@/stores/token'
import { createComplaint } from '@/api/complaint';
import { getServiceDetails } from '@/api/service'; // 导入服务详情接口

const tokenStore = useTokenStore()
const loading = ref(true)
const refreshing = ref(false)

// 预约数据
const pendingAppointments = ref([])
const completedAppointments = ref([])

// 服务名称映射
const serviceNameMap = ref({})

// 弹窗控制变量
const showCancel = ref(false)
const showEval = ref(false)
const showComplain = ref(false)
const currentOrderId = ref(null)
const selectedStar = ref(0)
const evalContent = ref('')

// 投诉相关变量
const complainReasons = ref(['服务质量', '服务安排', '费用相关', '信息问题'])
const selectedReason = ref('服务质量')
const complainContent = ref('')

// 获取预约列表
const fetchAppointments = async () => {
  try {
    if (!tokenStore.isLoggedIn) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/auth/login' })
      }, 1500)
      return
    }
    
    loading.value = true
    const response = await getUserAppointments()
    
    if (Array.isArray(response)) {
      // 提取所有有效的服务ID
      const validServiceIds = response
        .map(order => order.serviceId) // 使用正确的字段名: serviceId
        .filter(id => id != null && id !== undefined && id !== 0);
      
      // 去重服务ID
      const uniqueServiceIds = [...new Set(validServiceIds)];
      
      // 并发获取所有服务详情
      const servicePromises = uniqueServiceIds.map(id => {
        return getServiceDetails(id)
          .then(serviceResponse => {
            // 修改点1：正确处理服务详情响应结构
            if (serviceResponse && serviceResponse.name) {
              return {
                id,
                name: serviceResponse.name || '未知服务'
              };
            }
            return null;
          })
          .catch(error => {
            console.error(`获取服务ID ${id} 详情失败:`, error);
            return null;
          });
      });
      
      const serviceResponses = await Promise.all(servicePromises);
      
      // 构建服务ID到名称的映射
      serviceNameMap.value = {};
      serviceResponses.forEach(service => {
        if (service) {
          serviceNameMap.value[service.id] = service.name;
        }
      });
      
       // 处理预约数据
      pendingAppointments.value = response.filter(order => 
        order.status === 1 || order.status === 2
      ).map(order => mapOrder(order, serviceNameMap.value)); // 修改点2：传递映射表
      
      completedAppointments.value = response.filter(order => 
        order.status === 3
      ).map(order => mapOrder(order, serviceNameMap.value)); // 修改点2：传递映射表
    } else {
      uni.showToast({
        title: '获取预约列表失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取预约列表失败', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 修改点3：重构mapOrder函数，接收映射表作为参数
const mapOrder = (order, nameMap) => {
  const serviceId = order.serviceId;
  
  return {
    id: order.id,
    orderNo: order.orderNo,
    serviceName: nameMap[serviceId] || `未命名服务(${serviceId})`,
    serviceImage: '/static/default-service.jpg',
    serviceDescription: order.remark || '无描述',
    appointmentTime: order.appointmentTime,
    status: order.status,
    time: formatDateTime(order.appointmentTime)
  };
};


const getStatusText = (status) => {
  switch(status) {
    case 0: return '待支付'
    case 1: return '待服务'
    case 2: return '服务中'
    case 3: return '已完成'
    case 4: return '已取消'
    default: return '未知状态'
  }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const onRefresh = () => {
  refreshing.value = true
  fetchAppointments()
}

const showCancelModal = (orderId) => {
  currentOrderId.value = orderId
  showCancel.value = true
}


const confirmCancel = async () => {
  try {
    if (!currentOrderId.value) return
    
    // 调用取消预约API
    await cancelAppointment(currentOrderId.value)
    
    // 直接显示成功提示（因为如果没有抛出错误，就表示成功）
    uni.showToast({ 
      title: '预约已取消', 
      icon: 'success',
      duration: 2000
    })
    
    // 重新加载预约列表
    fetchAppointments()
  } catch (error) {
    console.error('取消预约失败', error)
    
    // 使用更友好的错误提示
    const errorMessages = {
      400: '该预约无法取消',
      401: '请重新登录',
      403: '没有操作权限',
      404: '预约不存在',
      500: '服务器错误，请稍后再试'
    }
    
    const status = error?.response?.status || error?.code || 500
    const errorMessage = errorMessages[status] || 
                         error?.message || 
                         '取消预约失败，请重试'
    
    uni.showToast({ 
      title: errorMessage, 
      icon: 'none',
      duration: 2000
    })
  } finally {
    showCancel.value = false
    currentOrderId.value = null
  }
}
const hideCancelModal = () => {
  showCancel.value = false
  currentOrderId.value = null
}

const showEvalModal = (orderId) => {
  currentOrderId.value = orderId
  showEval.value = true
  selectedStar.value = 0
  evalContent.value = ''
}

const selectStar = (rating) => {
console.log('选择了星级:', rating);
  selectedStar.value = rating;
}

const submitEval = async () => {
  try {
    if (!currentOrderId.value || selectedStar.value === 0) {
      uni.showToast({ title: '请选择星级', icon: 'none' })
      return
    }
    
    if (!evalContent.value.trim()) {
      uni.showToast({ title: '请输入评价内容', icon: 'none' })
      return
    }
    
    const evaluation = {
      orderId: currentOrderId.value,
      rating: selectedStar.value,
      comment: evalContent.value
    }
    
    const response = await createEvaluation(evaluation)
    
    if (response) {
      uni.showToast({ title: '评价提交成功', icon: 'success' })
      showEval.value = false
      
      const order = completedAppointments.value.find(
        o => o.id === currentOrderId.value
      );
      if (order) {
        order.hasEvaluation = true;
      }
    } else {
      uni.showToast({ title: '评价提交失败', icon: 'none' })
    }
  } catch (error) {
    console.error('提交评价失败', error)
    uni.showToast({ 
      title: error.response?.data?.message || '提交失败', 
      icon: 'none' 
    })
  } finally {
    selectedStar.value = 0
    evalContent.value = ''
    currentOrderId.value = null
  }
}

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}

const showComplainModal = (orderId) => {
  currentOrderId.value = orderId
  showComplain.value = true
  selectedReason.value = '服务质量'
  complainContent.value = ''
}

const handleComplainReasonChange = (e) => {
  selectedReason.value = complainReasons.value[e.detail.value]
}

const submitComplain = async () => {
  try {
    if (!currentOrderId.value) {
      uni.showToast({ title: '请选择订单', icon: 'none' });
      return;
    }
    
    if (!complainContent.value.trim()) {
      uni.showToast({ title: '请输入投诉内容', icon: 'none' });
      return;
    }
    
    const complaint = {
      orderId: currentOrderId.value,
      userId: tokenStore.user.id,
      type: complainReasons.value.indexOf(selectedReason.value) + 1,
      content: complainContent.value
    };
    
    const response = await createComplaint(complaint);
    
    if (response) {
      uni.showToast({ 
        title: '投诉提交成功', 
        icon: 'success',
        duration: 2000
      });
      showComplain.value = false;
    } else {
      uni.showToast({ 
        title: '投诉提交失败', 
        icon: 'none',
        duration: 2000
      });
    }
  } catch (error) {
    console.error('提交投诉失败', error);
    uni.showToast({ 
      title: error.response?.data?.message || '投诉提交失败', 
      icon: 'none',
      duration: 2000
    });
  } finally {
    selectedReason.value = '服务质量';
    complainContent.value = '';
    currentOrderId.value = null;
  }
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
  padding-bottom: constant(safe-area-inset-bottom); /* 兼容 iOS < 11.2 */
  padding-bottom: env(safe-area-inset-bottom); /* 兼容 iOS >= 11.2 */
}

/* 顶部导航栏  */
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

/* 预约列表样式  */
.appointment-list {
  padding: 10rpx 30rpx 100rpx; /* 增加顶部内边距 */
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 200rpx); /* 确保滚动区域高度合适 */
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
.icon-img {
  margin-right: 10rpx;
}
.service-time {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
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
.cancel-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #fff;
  border-radius: 40rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

/* 按钮组样式 */
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}
.eval-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: #fff;
  border-radius: 40rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}
.complain-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #fff;
  border-radius: 40rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
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
}

.cancel-modal {
  background-color: #fff;
  padding: 40rpx;
  border-radius: 24rpx;
  width: 80%;
  text-align: center;
}
.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}
.modal-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}
.modal-btns {
  display: flex;
  justify-content: space-around;
}
.confirm-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #fff;
  border-radius: 40rpx;
  padding: 15rpx 30rpx;
  font-size: 28rpx;
}
.cancel-btn {
  background: #f1f5f9;
  color: #666;
  border-radius: 40rpx;
  padding: 15rpx 30rpx;
  font-size: 28rpx;
}

/*评价与投诉弹窗*/
.eval-modal, .complain-modal {
  background-color: #fff;
  padding: 40rpx;
  border-radius: 24rpx;
  width: 80%;
  max-width: 600rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  border-bottom: 1rpx solid #eee;
  padding-bottom: 20rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.stars {
  display: flex;
  justify-content: center;
  margin: 20rpx 0 30rpx;
}

.star-wrapper {
  padding: 10rpx;
  margin: 0 5rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(1.2);
  }
}

.rating-text {
  font-size: 28rpx;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.eval-textarea {
  width: 100%;
  height: 200rpx;
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.char-count {
  align-self: flex-end;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.complain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.picker-view {
  font-size: 26rpx;
  color: #333;
  padding: 10rpx 20rpx;
  background: #f8f9fb;
  border-radius: 8rpx;
}
.complain-textarea {
  width: 100%;
  height: 200rpx;
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 30rpx;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: #fff;
  border-radius: 40rpx;
  padding: 20rpx 0;
  font-size: 32rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}
</style>