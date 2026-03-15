<template>
  <view class="checkout-page">
    <!-- 顶部导航栏 -->
    <view class="profile-header">
      <view class="header-left">
        <view class="back-icon" @click="goBack">
          <image src="/static/general/return-icon.png" class="icon"></image>
        </view>
        <text class="header-title">订单结算</text>
      </view>
      <view style="width: 70rpx;"></view>
    </view>

    <view class="service-card">
      <image :src="serviceImage" class="service-image" mode="aspectFill"></image>
      <view class="service-details">
        <text class="service-name">{{ serviceName }}</text>
        <text class="service-desc">{{ serviceDescription }}</text>
        <view class="price-section">
          <text class="price-label">价格:</text>
          <text class="service-price">¥{{ servicePrice }}</text>
          <text class="original-price" v-if="originalPrice > servicePrice">¥{{ originalPrice }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">选择支付方式</text>
      <radio-group @change="handlePaymentChange">
        <label class="payment-method" v-for="method in paymentMethods" :key="method.value">
          <view class="method-info">
            <image :src="method.icon" class="method-icon"></image>
            <text class="method-name">{{ method.name }}</text>
          </view>
          <radio :value="method.value" :checked="selectedMethod === method.value" color="#2ecc71" />
        </label>
      </radio-group>
    </view>

     <view class="section coupon-section" @click="showCouponPopup">
          <text class="section-title">优惠券</text>
          <view class="coupon-select">
            <text class="coupon-text">{{ selectedCoupon || '选择优惠券' }}</text>
            <image src="/static/general/right-icon.png" class="icon" />
          </view>
        </view>

     <view class="section coupon-section" @click="goSelectAddress">
          <text class="section-title">服务地址</text>
          <view class="coupon-select">
            <text class="coupon-text">{{ selectedAddressText  }}</text>
            <image src="/static/general/right-icon.png" class="icon" />
          </view>
        </view>
    
  <view class="section coupon-section" @click="showSchedulePopup">
      <text class="section-title">预约时间</text>
      <view class="coupon-select">
        <text class="coupon-text">{{ selectedScheduleText }}</text>
        <image src="/static/general/right-icon.png" class="icon" />
      </view>
    </view>

    <!-- 预约时间选择弹窗 -->
    <uni-popup ref="schedulePopup" type="bottom">
      <view class="schedule-popup">
        <view class="popup-header">
          <text class="popup-title">选择预约时间</text>
          <image src="/static/index/close-icon.png" class="icon" @click="closeSchedulePopup"></image>
        </view>
        
        <!-- 日期选择器 -->
        <scroll-view class="date-scroll" scroll-x>
          <view 
            v-for="(date, index) in availableDates" 
            :key="index"
            class="date-item"
            :class="{ active: selectedDate === date }"
            @click="selectDate(date)"
          >
            <text class="date-day">{{ formatDateDay(date) }}</text>
            <text class="date-week">{{ formatDateWeek(date) }}</text>
          </view>
        </scroll-view>
        
        <!-- 时间段选择 -->
        <scroll-view class="time-list" scroll-y>
          <view 
            v-for="schedule in filteredSchedules" 
            :key="schedule.id"
            class="time-item"
            :class="{ selected: selectedScheduleId === schedule.id }"
            @click="selectSchedule(schedule)"
          >
            <text class="time-range">{{ formatTime(schedule.startTime) }} - {{ formatEndTime(schedule) }}</text>
            <text class="time-status">{{ schedule.status === 1 ? '可预约' : '已满' }}</text>
          </view>
          
          <view v-if="filteredSchedules.length === 0" class="no-schedule">
            <text>该日期暂无可用时间段</text>
          </view>
        </scroll-view>
        
        <button class="confirm-button" @click="confirmSchedule">确认选择</button>
      </view>
    </uni-popup>

    <!-- Note Section -->
    <view class="section">
      <text class="section-title">备注信息</text>
      <textarea 
        v-model="noteContent"
        placeholder="请输入您的备注，例如服务要求、门禁信息等"
        class="note-textarea"
        auto-height
        maxlength="200"
      />
    </view>

    <!-- Order Summary -->
    <view class="order-summary">
      <view class="summary-row">
        <text>商品金额</text>
        <text>¥{{ originalPrice > servicePrice ? originalPrice : servicePrice }}</text>
      </view>
      <view class="summary-row" v-if="originalPrice > servicePrice">
        <text>限时折扣</text>
        <text>-¥{{ originalPrice - servicePrice }}</text>
      </view>
      <view class="summary-row" v-if="discountAmount > 0">
        <text>优惠券</text>
        <text>-¥{{ discountAmount }}</text>
      </view>
      <view class="summary-row total-row">
        <text class="total-label">实付款</text>
        <text class="total-price">¥{{ actualPayment }}</text>
      </view>
    </view>

    <view class="checkout-footer">
      <view class="price-display">
        <text class="total-label">合计:</text>
        <text class="total-price">¥{{ actualPayment }}</text>
      </view>
      <button class="pay-button" @click="handlePayment">立即支付</button>
    </view>

    <uni-popup ref="couponPopup" type="bottom">
      <view class="coupon-popup">
        <view class="popup-header">
          <text class="popup-title">选择优惠券</text>
          <image src="/static/index/close-icon.png" 
		  class="icon" @click="closeCouponPopup"></image>        </view>
        <scroll-view class="coupon-list" scroll-y>
          <view 
            class="coupon-item" 
            v-for="coupon in availableCoupons" 
            :key="coupon.id"
            @click="selectCoupon(coupon)"
          >
            <view class="coupon-left">
              <text class="coupon-value">¥{{ coupon.value }}</text>
              <text class="coupon-condition">满{{ coupon.condition }}元可用</text>
            </view>
            <view class="coupon-right">
              <text class="coupon-name">{{ coupon.name }}</text>
              <text class="coupon-date">有效期至{{ coupon.expiryDate }}</text>
            </view>
            <radio :checked="selectedCouponId === coupon.id" color="#2ecc71" />
          </view>
        </scroll-view>
        <button class="confirm-button" @click="applyCoupon">确认使用</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, watch} from 'vue'
import { getServiceSchedules,
   createOrder, 
   paymentSuccess,
   occupySchedule,
   releaseSchedule} from '@/api/appointment'
import { onLoad } from '@dcloudio/uni-app'
import { getServiceDetails } from '@/api/service'
import { useTokenStore } from '@/stores/token'
import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'
import UniDatetimePicker from '@dcloudio/uni-ui/lib/uni-datetime-picker/uni-datetime-picker.vue'

const tokenStore = useTokenStore(); // 确保已导入
const userId = tokenStore.userId; // 获取当前用户 ID
// --- 服务信息 ---
const serviceId = ref('')
const serviceName = ref('')
const servicePrice = ref(0)
const originalPrice = ref(0)
const serviceDescription = ref('')
const serviceImage = ref('')

// --- 支付方式 ---
const paymentMethods = ref([
  { value: 'wechat', name: '微信支付', icon: '/static/appointment/wechat-icon.png' },
  { value: 'alipay', name: '支付宝', icon: '/static/appointment/alipay-icon.png' },
  { value: 'unionpay', name: '银联支付', icon: '/static/appointment/unionpay-icon.png' }
])
const selectedMethod = ref('wechat')

// --- 优惠券 ---
const availableCoupons = ref([
  { id: 1, name: '新用户优惠', value: 20, condition: 100, expiryDate: '2025-12-31' },
  { id: 2, name: '节日特惠', value: 30, condition: 150, expiryDate: '2025-12-31' }
])
const selectedCouponId = ref(null)
const selectedCoupon = ref('')
const discountAmount = ref(0)

// 获取服务详情
const fetchServiceDetails = async (id) => {
  try {
    const response = await getServiceDetails(id)
    const serviceData = response
    serviceName.value = serviceData.name || ''
    servicePrice.value = parseFloat(serviceData.price) || 0
    originalPrice.value = parseFloat(serviceData.originalPrice) || servicePrice.value
    serviceDescription.value = serviceData.description || '暂无描述'
    serviceImage.value = serviceData.image || '/static/default-service.jpg'
  } catch (error) {
    console.error('获取服务详情失败:', error)
    uni.showToast({
      title: '获取服务详情失败',
      icon: 'none'
    })
  }
}

// --- 地址选择 ---
const selectedAddress = ref(null)
const selectedAddressText = computed(() => {
  if (!selectedAddress.value) return '请选择地址'
  return `${selectedAddress.value.recipient} - ${selectedAddress.value.detail}`
})
// --- 地址选择功能 ---
const goSelectAddress = () => {
  uni.navigateTo({
    url: '/pages/user/address?from=checkout',
    events: {
      addressSelected: (address) => {
        // 修复：确保接收完整的地址对象
        selectedAddress.value = {
          id: address.id,
          recipient: address.recipient,
          phone: address.phone,
          province: address.province,
          city: address.city,
          district: address.district,
          detail: address.detail
        };
      }
    },
    success: (res) => {
      res.eventChannel.emit('fromCheckout', { mode: 'select' });
    }
  });
}

// --- 时间选择 ---
const availableSchedules = ref([]) // 存储所有可预约时间段
const selectedScheduleId = ref(null) // 选中的时间段ID
const selectedDate = ref('') // 当前选择的日期
const schedulePopup = ref(null) // 预约时间弹窗引用

// 计算选中的时间段文本
const selectedScheduleText = computed(() => {
  if (!selectedScheduleId.value) return '请选择预约时间'
  
  const schedule = availableSchedules.value.find(s => s.id === selectedScheduleId.value)
  if (!schedule) return '请选择预约时间'
  
  const date = new Date(schedule.startTime)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${formatTime(schedule.startTime)}`
})

// 获取可预约时间段
const fetchAvailableSchedules = async (serviceId) => {
  try {
    uni.showLoading({ title: '加载中...' })
    const response = await getServiceSchedules(serviceId)
    availableSchedules.value = response
      .filter(schedule => schedule.status === 1) // 只显示可预约的
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) // 按时间排序
    
    if (availableSchedules.value.length > 0) {
      // 设置默认选择的日期为第一个可用的日期
      const firstDate = new Date(availableSchedules.value[0].startTime)
      selectedDate.value = firstDate.toISOString().split('T')[0]
    }
  } catch (error) {
    console.error('获取可预约时间失败:', error)
    uni.showToast({
      title: '获取可预约时间失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 计算可选择的日期 (未来7天)
const availableDates = computed(() => {
  const dates = new Set()
  availableSchedules.value.forEach(schedule => {
    const dateStr = new Date(schedule.startTime).toISOString().split('T')[0]
    dates.add(dateStr)
  })
  return Array.from(dates).sort()
})

// 根据选择的日期过滤时间段
const filteredSchedules = computed(() => {
  if (!selectedDate.value) return []
  
  return availableSchedules.value.filter(schedule => {
    const scheduleDate = new Date(schedule.startTime).toISOString().split('T')[0]
    return scheduleDate === selectedDate.value
  })
})

// 日期格式化方法
const formatDateDay = (dateStr) => {
  const date = new Date(dateStr)
  return date.getDate()
}

const formatDateWeek = (dateStr) => {
  const date = new Date(dateStr)
  const weeks = ['日', '一', '二', '三', '四', '五', '六']
  return `周${weeks[date.getDay()]}`
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const formatEndTime = (schedule) => {
  const start = new Date(schedule.startTime)
  const end = new Date(start.getTime() + schedule.duration * 60000)
  const hours = end.getHours().toString().padStart(2, '0')
  const minutes = end.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 时间选择弹窗控制
const showSchedulePopup = () => {
  if (availableSchedules.value.length === 0) {
    uni.showToast({ title: '暂无可用时间段', icon: 'none' })
    return
  }
  schedulePopup.value.open()
}

const closeSchedulePopup = () => {
 schedulePopup.value.close()
}

// 选择日期
const selectDate = (date) => {
  selectedDate.value = date
}

// 选择时间段
const selectSchedule = (schedule) => {
  if (schedule.status !== 1) return
  selectedScheduleId.value = schedule.id
}

// 确认选择
const confirmSchedule = () => {
  if (!selectedScheduleId.value) {
    uni.showToast({ title: '请选择时间段', icon: 'none' })
    return
  }
  closeSchedulePopup()
}

// 页面加载时获取时间表
onLoad(async (options) => {
  if (options.id) {
    serviceId.value = options.id
    await fetchServiceDetails(options.id)
    await fetchAvailableSchedules(options.id) // 获取可预约时间表
  }
})

// --- 备注信息 ---
const noteContent = ref('')

// --- 实付款计算 ---
const actualPayment = computed(() => {
  const basePrice = servicePrice.value
  const totalDiscount = discountAmount.value
  return Math.max(0, basePrice - totalDiscount).toFixed(2)
})
// --- 页面加载 ---
onLoad(async (options) => {
  if (options.id) {
    serviceId.value = options.id
    await fetchServiceDetails(options.id)

  }
})

// --- 支付方式切换 ---
const handlePaymentChange = (e) => {
  selectedMethod.value = e.detail.value
}

// --- 优惠券弹窗逻辑 ---
const couponPopupRef = ref(null)
const showCouponPopup = () => {
  couponPopupRef.value.open()
}
const closeCouponPopup = () => {
  couponPopupRef.value.close()
}
const selectCoupon = (coupon) => {
  selectedCouponId.value = coupon.id
}
const applyCoupon = () => {
  const coupon = availableCoupons.value.find(c => c.id === selectedCouponId.value)
  if (coupon) {
    if (servicePrice.value >= coupon.condition) {
      selectedCoupon.value = coupon.name
      discountAmount.value = coupon.value
    } else {
      uni.showToast({
        title: `需满¥${coupon.condition}才可使用`,
        icon: 'none'
      })
    }
  }
  closeCouponPopup()
}
const handlePayment = async () => {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请先选择地址', icon: 'none' })
    return
  }
  if (!selectedScheduleId.value) {
    uni.showToast({ title: '请先选择预约时间', icon: 'none' })
    return
  }

  uni.showLoading({ title: '支付处理中...', mask: true })
  
  try {
    // 1. 占用时间段
    await occupySchedule(selectedScheduleId.value)
    
    // 2. 创建订单
    const orderData = {
      userId: tokenStore.user.id, // 确保使用正确的用户ID
      serviceId: parseInt(serviceId.value),
      addressId: selectedAddress.value.id,
      appointmentTime: availableSchedules.value
        .find(s => s.id === selectedScheduleId.value)
        .startTime,
      amount: actualPayment.value,
      remark: noteContent.value,
      scheduleId: selectedScheduleId.value
    }
    
    // 创建订单
    const orderResponse = await createOrder(orderData)
    const order = orderResponse
    const orderNo = order.orderNo // 确保后端返回orderNo字段
    
    // 3. 调用支付成功回调
    // 支付方式映射：1-微信 2-支付宝 3-银联
    const payMethodMap = { wechat: 1, alipay: 2, unionpay: 3 }
    const payMethod = payMethodMap[selectedMethod.value] || 1
    
    await paymentSuccess(orderNo, payMethod)
    
    // 4. 显示支付成功提示
    uni.showToast({
      title: '支付成功',
      icon: 'success',
      duration: 2000
    })
    
    // 5. 2秒后跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 2000)
    
  } catch (error) {
    console.error('支付失败:', error)
    uni.showToast({
      title: '支付失败: ' + (error.response?.data?.message || error.message),
      icon: 'none'
    })
    
    // 如果占用时间段后创建订单失败，需要释放时间段
    try {
      if (selectedScheduleId.value) {
        await releaseSchedule(selectedScheduleId.value)
      }
    } catch (releaseError) {
      console.error('释放时间段失败:', releaseError)
    }
  } finally {
    uni.hideLoading()
  }
}
// --- 生成订单号 ---
const generateOrderId = () => {
  return 'ORD' + Date.now().toString().slice(-8)
}

// --- 返回上一页 ---
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.checkout-page {
  padding-bottom: 120rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏样式  */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx 60rpx;
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

.service-card {
  display: flex;
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 16rpx;

  .service-image {
    width: 180rpx;
    height: 180rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
  }

  .service-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .service-name {
      font-size: 32rpx;
      font-weight: bold;
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

    .price-section {
      display: flex;
      align-items: center;

      .price-label {
        font-size: 26rpx;
        color: #999;
        margin-right: 10rpx;
      }

      .service-price {
        font-size: 36rpx;
        color: #ff6b6b;
        font-weight: bold;
      }

      .original-price {
        font-size: 24rpx;
        color: #999;
        text-decoration: line-through;
        margin-left: 10rpx;
      }
    }
  }
}

.section {
  background-color: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
    display: block;
  }
}

.payment-method {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  .method-info {
    display: flex;
    align-items: center;

    .method-icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 20rpx;
    }

    .method-name {
      font-size: 28rpx; 
      color: #333; 
    }
  }
}

.coupon-section {
  .coupon-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;

    .coupon-text {
      font-size: 28rpx; 
      color: #333;
    }
  }
}


/* 新增预约时间弹窗样式 */
.schedule-popup {
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  padding: 30rpx;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  
  .popup-title {
    font-size: 36rpx;
    font-weight: bold;
  }
}

.date-scroll {
  white-space: nowrap;
  padding: 20rpx 0;
  margin-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .date-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 15rpx 30rpx;
    margin-right: 20rpx;
    border-radius: 12rpx;
    background-color: #f8f8f8;
    
    &.active {
      background-color: #e8f5e9;
      border: 1rpx solid #4CAF50;
    }
    
    .date-day {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
    
    .date-week {
      font-size: 24rpx;
      color: #666;
      margin-top: 5rpx;
    }
  }
}

.time-list {
  max-height: 50vh;
  
  .time-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25rpx;
    margin-bottom: 20rpx;
    background-color: #f8f9fb;
    border-radius: 12rpx;
    border: 1rpx solid #eee;
    
    &.selected {
      background-color: #e8f5e9;
      border-color: #4CAF50;
    }
    
    .time-range {
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
    }
    
    .time-status {
      font-size: 26rpx;
      color: #4CAF50;
      font-weight: bold;
    }
  }
  
  .no-schedule {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
  }
}

.confirm-button {
  margin-top: 30rpx;
  background: linear-gradient(135deg, #2ecc71, #4CAF50);
  color: white;
  border: none;
  border-radius: 50rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
}
.note-textarea {
  width: 100%;
  min-height: 140rpx;
  border: 1rpx solid #ccc;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx; 
  color: #333;
  background-color: #fafafa;
  box-sizing: border-box;
  
  &::placeholder {
    font-size: 26rpx;
    color: #999;
  }
}

.order-summary {
  background-color: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    font-size: 28rpx; 
    color: #666;
  }

  .total-row {
    margin-top: 30rpx;
    padding-top: 20rpx;
    border-top: 1rpx dashed #ddd;

    .total-label {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .total-price {
      font-size: 36rpx;
      color: #ff6b6b;
      font-weight: bold;
    }
  }
}

.checkout-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .price-display {
    .total-label {
      font-size: 28rpx;
      margin-right: 10rpx;
    }

    .total-price {
      font-size: 36rpx;
      color: #ff6b6b;
      font-weight: bold;
    }
  }

  .pay-button {
    background: linear-gradient(135deg, #2ecc71, #4CAF50);
    color: white;
    border: none;
    border-radius: 50rpx;
    padding: 0 60rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
    box-shadow: 0 4rpx 10rpx rgba(46, 204, 113, 0.3);
  }
}

.coupon-popup {
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  padding: 30rpx;
  max-height: 70vh;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .popup-title {
      font-size: 36rpx;
      font-weight: bold;
    }
  }

  .coupon-list {
    max-height: 50vh;

    .coupon-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 25rpx;
      margin-bottom: 20rpx;
      background-color: #f8f9fb;
      border-radius: 12rpx;

      .coupon-left {
        .coupon-value {
          font-size: 36rpx;
          font-weight: bold;
          color: #ff6b6b;
        }

        .coupon-condition {
          font-size: 24rpx;
          color: #999;
        }
      }

      .coupon-right {
        flex: 1;
        margin-left: 30rpx;

        .coupon-name {
          font-size: 28rpx; /* 统一文字大小 */
          margin-bottom: 10rpx;
          display: block;
        }

        .coupon-date {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .confirm-button {
    margin-top: 30rpx;
    background: linear-gradient(135deg, #2ecc71, #4CAF50);
    color: white;
    border: none;
    border-radius: 50rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
  }
}

/* 统一图标大小 */
.icon {
  width: 36rpx;
  height: 36rpx;
}

/* 响应式调整 */
@media (max-width: 750px) {
  .service-name {
    font-size: 28rpx;
  }
  
  .service-desc {
    font-size: 24rpx;
  }
}
</style>