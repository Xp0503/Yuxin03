<template>
  <view class="complaint-container">
    <!-- 顶部导航栏 -->
    <view class="profile-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <image src="/static/general/return-icon.png" class="back-icon" />
        </view>
        <text class="header-title">我的投诉</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">

      <!-- 投诉筛选 -->
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{active: activeTab === 'all'}" 
          @click="changeTab('all')"
        >
          全部
        </view>
        <view 
          class="filter-tab" 
          :class="{active: activeTab === 'pending'}" 
          @click="changeTab('pending')"
        >
          待处理
        </view>
        <view 
          class="filter-tab" 
          :class="{active: activeTab === 'resolved'}" 
          @click="changeTab('resolved')"
        >
          已处理
        </view>
      </view>
      
      <!-- 投诉列表 -->
      <view class="complaint-list">
        <view 
          class="complaint-card" 
          v-for="(item, index) in filteredComplaints" 
          :key="item.id"
          @click="showDetail(item, index)"
          :class="{'active-item': activeIndex === index}"
          :style="{animationDelay: `${index * 0.05}s`}"
        >
          <view class="item-header">
            <text class="service-name">{{ item.serviceName }}</text>
            <text class="status-tag" :class="{'resolved': item.status === '已处理'}">{{ item.status }}</text>
          </view>
          
          <view class="patient-info">
            <image src="/static/service/people-icon.png" class="user-icon" />
            <text class="patient-name">{{ item.patientName }}</text>
          </view>
          
          <view class="complaint-reason">
            <image src="/static/appointment/complaint-icon.png" class="warning-icon" />
            <text class="reason-text">{{ item.reason }}</text>
          </view>
          
          <view class="item-footer">
            <text class="time">{{ item.complaintTime }}</text>
            <image src="/static/service/detail-icon.png" class="arrow-icon" />
          </view>
        </view>
      </view>
      
      <!-- 空状态提示 -->
      <view class="empty-tip" v-if="filteredComplaints.length === 0">
        <image src="/static/general/empty-icon.png" class="empty-image"></image>
        <text class="empty-text">暂无投诉记录</text>
      </view>
    </scroll-view>
    
    <!-- 投诉详情弹窗 -->
    <view class="detail-modal" v-if="showModal" @touchmove.stop.prevent>
      <view class="modal-mask" @click="closeModal"></view>
      <view class="modal-content" :class="{'modal-show': showModal}">
        <view class="modal-header">
          <text class="modal-title">投诉详情</text>
          <image src="/static/index/close-icon.png" class="close-icon" @click="closeModal" />
        </view>
        
        <scroll-view scroll-y class="modal-scroll">
          <view class="detail-section">
            <!-- 基本信息卡片 -->
            <view class="info-card">
              <view class="info-row">
                <text class="info-label">服务名称</text>
                <text class="info-value">{{ currentComplaint.serviceName }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">患者姓名</text>
                <text class="info-value">{{ currentComplaint.patientName }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">服务时间</text>
                <text class="info-value">{{ currentComplaint.serviceTime }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">投诉时间</text>
                <text class="info-value">{{ currentComplaint.complaintTime }}</text>
              </view>
            </view>
            
            <!-- 投诉理由卡片 -->
            <view class="reason-card">
              <text class="card-title">投诉理由</text>
              <text class="reason-content">{{ currentComplaint.reason }}</text>
            </view>
            
            <!-- 投诉详情卡片 -->
            <view class="details-card">
              <text class="card-title">投诉详情</text>
              <text class="details-content">{{ currentComplaint.details }}</text>
            </view>
            
            <!-- 回复内容卡片 -->
            <view class="reply-card" v-if="currentComplaint.status === '待处理'">
              <text class="card-title">回复内容</text>
              <textarea 
                class="reply-input" 
                v-model="replyContent" 
                placeholder="请输入回复内容..." 
                placeholder-class="placeholder"
                auto-height
                maxlength="500"
              ></textarea>
            </view>
            
            <!-- 处理结果卡片 -->
            <view class="result-card" v-else>
              <text class="card-title">处理结果</text>
              <text class="result-content">{{ currentComplaint.replyContent }}</text>
              <text class="result-time">处理时间: {{ currentComplaint.handleTime }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer" v-if="currentComplaint.status === '待处理'">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="confirm-btn" @click="handleReply">回复</button>
        </view>
        
        <view class="modal-footer" v-else>
          <button class="confirm-btn only-btn" @click="closeModal">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDoctorTokenStore } from '@/stores/token'
import { getComplaintsByDoctor, updateComplaint } from '@/api/complaint'
import { onLoad } from '@dcloudio/uni-app'
// 使用医生token store
const doctorTokenStore = useDoctorTokenStore()
// 当前激活的tab
const activeTab = ref('all')
// 投诉列表数据
const complaintList = ref([])
// 加载医生投诉列表
const loadDoctorComplaints = async () => {
  try {
    const doctorId = doctorTokenStore.doctor?.id
    if (!doctorId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    const response = await getComplaintsByDoctor(doctorId)
    complaintList.value = response.map(item => ({
      id: item.id,
      serviceName: item.serviceName || '医疗服务',
      patientName: item.patientName || '患者',
      reason: item.content ? item.content.substring(0, 20) + (item.content.length > 20 ? '...' : '') : '无',
      details: item.content || '无',
      serviceTime: formatDate(item.createTime),
      complaintTime: formatDate(item.createTime),
      status: item.status === 1 ? '已处理' : '待处理',
      replyContent: item.feedback || '',
      handleTime: formatDate(item.updateTime),
      // 后端实际状态值
      rawStatus: item.status
    }))
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    console.error('加载投诉列表失败:', error)
  }
}



// 过滤后的投诉列表
const filteredComplaints = computed(() => {
  if (activeTab.value === 'all') return complaintList.value
  if (activeTab.value === 'pending') return complaintList.value.filter(item => item.status === '待处理')
  if (activeTab.value === 'resolved') return complaintList.value.filter(item => item.status === '已处理')
  return complaintList.value
})

// 当前激活的投诉项索引
const activeIndex = ref(-1)
// 是否显示详情弹窗
const showModal = ref(false)
// 当前查看的投诉详情
const currentComplaint = ref({})
// 回复内容
const replyContent = ref('')

// 切换tab
const changeTab = (tab) => {
  activeTab.value = tab
}

// 显示投诉详情
const showDetail = (item, index) => {
  uni.vibrateShort({ type: 'light' })
  activeIndex.value = index
  currentComplaint.value = {...item}
  replyContent.value = item.replyContent || ''
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    activeIndex.value = -1
  }, 300)
}

// 处理回复
const handleReply = async () => {
  if (!replyContent.value.trim()) {
    uni.showToast({ title: '请填写回复内容', icon: 'none' })
    return
  }
  
  try {
    const doctorId = doctorTokenStore.doctor?.id
    if (!doctorId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    // 调用API处理投诉
    await updateComplaint(currentComplaint.value.id, {
      status: 2, // 已处理
      feedback: replyContent.value,
      handlerDoctorId: doctorId
    })
	
   // 更新本地数据
      const index = complaintList.value.findIndex(item => item.id === currentComplaint.value.id)
      if (index !== -1) {
        complaintList.value[index].rawStatus = 1
        complaintList.value[index].status = '已处理'
        complaintList.value[index].replyContent = replyContent.value
        complaintList.value[index].handleTime = new Date().toLocaleString()
        
        uni.showToast({ title: '处理成功', icon: 'success' })
        closeModal()
      }
    } catch (error) {
      uni.showToast({ title: '处理失败', icon: 'none' })
      console.error('处理投诉失败:', error)
    }
  }
// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  loadDoctorComplaints()
})
    
   

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

onLoad(() => {
  // 可以在这里加载投诉数据
})
</script>

<style lang="scss" scoped>
.complaint-container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 顶部导航栏 */
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
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.3);
  border-bottom: 1rpx solid #f1f5f9;
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

.back-btn {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  transition: all 0.3s ease;
  
  .back-icon {
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

/* 筛选标签 */
.filter-tabs {
  display: flex;
  justify-content: space-around;
  margin: 20rpx 30rpx;
  background-color: #fff;
  border-radius: 40rpx;
  padding: 10rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
  
  .filter-tab {
    padding: 12rpx 30rpx;
    font-size: 28rpx;
    color: #666;
    border-radius: 30rpx;
    transition: all 0.3s ease;
    
    &.active {
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      color: #fff;
      font-weight: bold;
    }
  }
}

/* 滚动区域 */
.scroll-content {
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx 30rpx 30rpx;
  
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 投诉列表 */
.complaint-list {
  .complaint-card {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 25rpx;
    margin-top: 25rpx;
    box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(30rpx);
    animation: fadeInUp 0.5s ease forwards;
    
    /* 添加悬停效果 */
    &:hover {
      transform: translateY(-5rpx);
      box-shadow: 0 12rpx 30rpx rgba(76, 175, 80, 0.2);
    }
    
    &.active-item {
      transform: scale(0.98);
      opacity: 0.9;
    }
    
    &:active {
      transform: translateY(-5rpx) scale(0.99);
      box-shadow: 0 12rpx 30rpx rgba(76, 175, 80, 0.2);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 8rpx;
      height: 100%;
      background: linear-gradient(to bottom, #4CAF50, #2E7D32);
      transition: height 0.3s ease;
    }
    
    /* 添加悬停动画 */
    &:hover::before {
      height: 100%;
    }
  }
  
  /* 淡入动画 */
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
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25rpx;
    animation: slideInLeft 0.3s ease;
    
    .service-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      flex: 1;
      margin-right: 20rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .status-tag {
      font-size: 26rpx;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      background-color: #FFEB3B;
      color: #FF9800;
      font-weight: bold;
      transition: all 0.3s ease;
      
      &.resolved {
        background-color: #E8F5E9;
        color: #4CAF50;
      }
    }
  }
  
  .patient-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    animation: slideInLeft 0.4s ease;
    
    .user-icon {
      width: 32rpx;
      height: 32rpx;
      transition: transform 0.3s ease;
    }
    
    .patient-name {
      font-size: 28rpx;
      color: #555;
      margin-left: 10rpx;
    }
    
    &:hover .user-icon {
      transform: scale(1.2);
    }
  }
  
  .complaint-reason {
    display: flex;
    align-items: flex-start;
    margin-bottom: 25rpx;
    animation: slideInLeft 0.5s ease;
    
    .warning-icon {
      width: 32rpx;
      height: 32rpx;
      margin-top: 2rpx;
      transition: transform 0.3s ease;
    }
    
    .reason-text {
      font-size: 28rpx;
      color: #FF5722;
      margin-left: 10rpx;
      flex: 1;
      line-height: 1.4;
      font-weight: 500;
      word-break: break-word; /* 确保长文本换行 */
    }
    
    &:hover .warning-icon {
      transform: rotate(10deg);
    }
  }
  
  .item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slideInLeft 0.6s ease;
    
    .time {
      font-size: 24rpx;
      color: #999;
      transition: color 0.3s ease;
    }
    
    .arrow-icon {
      width: 24rpx;
      height: 24rpx;
      opacity: 0.6;
      transition: all 0.3s ease;
    }
    
    &:hover .time {
      color: #4CAF50;
    }
    
    &:hover .arrow-icon {
      transform: translateX(5rpx);
      opacity: 1;
    }
  }
  
  /* 左侧滑入动画 */
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30rpx);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

/* 空状态提示 */
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  animation: fadeIn 0.5s ease;
  
  .empty-image {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 30rpx;
    opacity: 0.6;
    animation: bounce 2s infinite ease-in-out;
  }
  
  .empty-text {
    font-size: 30rpx;
    color: #999;
  }
  
  /* 弹跳动画 */
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20rpx);
    }
  }
  
  /* 淡入动画 */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

/* 详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
    animation: fadeIn 0.3s ease;
  }
  
  .modal-content {
    position: relative;
    width: 90%; 
    max-height: 85vh; 
    background-color: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    transform: translateY(100rpx);
    opacity: 0;
    transition: all 0.3s ease;
    animation: slideUp 0.4s ease forwards;
    display: flex;
    flex-direction: column;
    
    &.modal-show {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  /* 弹窗内容上滑动画 */
  @keyframes slideUp {
    from {
      transform: translateY(100rpx);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    flex-shrink: 0;
    
    .modal-title {
      font-size: 34rpx;
      font-weight: bold;
      color: white;
    }
    
    .close-icon {
      width: 36rpx;
      height: 36rpx;
      opacity: 0.8;
      transition: all 0.3s ease;
      
      &:active {
        opacity: 1;
        transform: rotate(90deg);
      }
    }
  }
  
  .modal-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0 20rpx;
    box-sizing: border-box;
  }
  
  .detail-section {
    padding: 20rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* 卡片样式  */
  .info-card, .reason-card, .details-card, .reply-card, .result-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 25rpx;
    margin-bottom: 25rpx;
    box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
    border: 1rpx solid #e8f5e9;
    transition: all 0.3s ease;
    animation: popIn 0.4s ease;
    width: 95%;
    max-width: 650rpx;
    box-sizing: border-box;
    
    &:hover {
      transform: translateY(-5rpx);
      box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.15);
    }
  }
  
  /* 卡片弹出动画 */
  @keyframes popIn {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    70% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 15rpx 0;
    border-bottom: 1rpx dashed #e0e0e0;
    animation: fadeIn 0.4s ease;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .info-label {
    font-size: 28rpx;
    color: #666;
    width: 150rpx;
    flex-shrink: 0;
  }
  
  .info-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    text-align: right;
    flex: 1;
    word-break: break-word;
    padding-left: 10rpx;
  }
  
  .card-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: #4CAF50;
    margin-bottom: 15rpx;
    text-align: center;
    position: relative;
    padding-bottom: 10rpx;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80rpx;
      height: 4rpx;
      background: linear-gradient(90deg, #4CAF50, #2E7D32);
      border-radius: 2rpx;
    }
  }
  
  .reason-content, .details-content {
    font-size: 28rpx;
    color: #555;
    line-height: 1.6;
    text-align: center;
    display: block;
    padding: 15rpx 0;
    word-break: break-word;
  }
  
  .reply-input {
    width: 100%;
    min-height: 180rpx;
    padding: 20rpx;
    background-color: #f8f9fb;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.4;
    border: 1rpx solid #e0e0e0;
    transition: all 0.3s ease;
    margin-top: 15rpx;
    text-align: left;
    box-sizing: border-box;
    max-height: 300rpx;
    
    &:focus {
      border-color: #4CAF50;
      background-color: #fff;
      box-shadow: 0 0 10rpx rgba(76, 175, 80, 0.2);
    }
  }
  
  .placeholder {
    color: #bbb;
    font-size: 26rpx;
  }
  
  .result-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    text-align: center;
    display: block;
    padding: 15rpx 0;
    background: #f8f9fb;
    border-radius: 12rpx;
    margin: 15rpx 0;
    word-break: break-word;
  }
  
  .result-time {
    font-size: 24rpx;
    color: #999;
    display: block;
    text-align: center;
    font-style: italic;
  }
  
  .modal-footer {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f0f0f0;
    flex-shrink: 0;
    
    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 30rpx;
      border-radius: 40rpx;
      transition: all 0.3s ease;
      border: none;
      animation: popIn 0.5s ease;
      
      &.cancel-btn {
        background-color: #f8f9fb;
        color: #666;
        margin-right: 20rpx;
        
        &:active {
          background-color: #e0e0e0;
          transform: scale(0.95);
        }
      }
      
      &.confirm-btn {
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
        color: white;
        
        &:active {
          opacity: 0.9;
          transform: scale(0.95);
        }
        
        &.only-btn {
          margin-left: 0;
          width: 100%;
        }
      }
    }
  }
}
</style>