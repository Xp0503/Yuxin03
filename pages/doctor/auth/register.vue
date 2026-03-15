<template>
  <view class="register-container">
    <!-- 品牌头部 -->
    <view class="brand-header">
      <image src="/static/auth/logo.png" class="logo" mode="aspectFit"></image>
      <text class="app-name">愈心护理</text>
	  <text class="slogan">（医生端）</text>
      <text class="slogan">专业护理服务，关爱您的健康</text>
    </view>
    
    <!-- 表单卡片 -->
    <view class="login-card">
      <text class="form-title">用户注册</text>
      
      <!-- 昵称 -->
      <view class="input-group" :class="{'input-error': realNameError}">
        <image 
          src="/static/auth/name-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.realName" 
          placeholder="昵称" 
          maxlength="20"
          @input="validateRealName"
        />
      </view>
      <view class="error-msg">{{ realNameError }}</view>
      
	  <!-- 性别选择  -->
	  <view class="input-group">
	    <image 
	      src="/static/auth/name-icon.png" 
	      class="input-icon"
	      mode="aspectFit"
	    />
		<view class="gender-container"> 
	    <text class="gender-label" :class="{ active: form.gender }">
	      {{ form.gender ? (form.gender === 'male' ? '性别：男' : '性别：女') : '性别' }}
	    </text>
	    <view class="gender-buttons">
	      <button 
	        class="gender-btn" 
	        :class="{ active: form.gender === 'male' }"
	        @click="form.gender = 'male'"
	      >
	        <image 
	          src="/static/auth/male-icon.png" 
	          class="gender-icon"
	          mode="aspectFit"
	        />
	        <text>男</text>
	      </button>
	      <button 
	        class="gender-btn" 
	        :class="{ active: form.gender === 'female' }"
	        @click="form.gender = 'female'"
	      >
	        <image 
	          src="/static/auth/female-icon.png" 
	          class="gender-icon"
	          mode="aspectFit"
	        />
	        <text>女</text>
	      </button>
	    </view>
	  </view>
	  </view>
	  
      <!-- 手机号 -->
      <view class="input-group" :class="{'input-error': phoneError}">
        <image 
          src="/static/auth/phone-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <view class="phone-prefix">+86</view>
        <input 
          v-model="form.phone" 
          type="number" 
          placeholder="请输入手机号" 
          maxlength="11"
          @input="validatePhone"
		  class="phone-input"
        />
      </view>
      <view class="error-msg">{{ phoneError }}</view>
      
      <!-- 验证码 -->
      <view class="input-group" :class="{'input-error': verificationCodeError}">
        <image 
          src="/static/auth/sms-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.verificationCode" 
          placeholder="验证码" 
          maxlength="6"
          @input="validateVerificationCode"
        />
        <view class="captcha-btn" @click="getVerificationCode" :class="{disabled: countdown > 0}">
          <text v-if="countdown > 0">重新发送({{ countdown }}s)</text>
          <text v-else>获取验证码</text>
        </view>
      </view>
      <view class="error-msg">{{ verificationCodeError }}</view>
      
      <!-- 身份证码 -->
      <view class="input-group" :class="{'input-error': idCardError}">
        <image 
          src="/static/auth/cmt-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.idCard" 
          placeholder="身份证号码" 
          maxlength="18"
          @input="validateIdCard"
        />
      </view>
      <view class="error-msg">{{ idCardError }}</view>
      
      <!-- 创建密码 -->
      <view class="input-group" :class="{'input-error': passwordError}">
        <image 
          src="/static/auth/pass-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="创建密码" 
          password
          @input="validatePassword"
        />
      </view>
      <view class="error-msg">{{ passwordError }}</view>
      
      <!-- 确认密码 -->
      <view class="input-group" :class="{'input-error': confirmPasswordError}">
        <image 
          src="/static/auth/pass-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="确认密码" 
          password
          @input="validateConfirmPassword"
        />
      </view>
      <view class="error-msg">{{ confirmPasswordError }}</view>
      
      <!-- 注册按钮 -->
      <button class="login-btn" @click="handleRegister">注册</button>
      
      <!-- 登录链接 -->
      <view class="login-link">
        <text>已有账号?</text>
        <text class="login-text" @click="navigateTo('/pages/doctor/auth/login')">立即登录</text>
      </view>
    </view>
    
    <!-- 底部版权信息 -->
    <view class="footer">
      <text>© 2025 愈心护理 版权所有</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerDoctor, sendDoctorSmsCode } from '@/api/doctor'
import { useDoctorTokenStore } from '@/stores/token'

const router = useRouter()
const doctorTokenStore = useDoctorTokenStore()


const form = ref({
  realName: '',
  phone: '',
  verificationCode: '',
  idCard: '',
  gender: '',
  password: '',
  confirmPassword: ''
})

// 错误信息
const realNameError = ref('')
const phoneError = ref('')
const verificationCodeError = ref('')
const idCardError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const agreementChecked = ref(true)
const countdown = ref(0)
const isLoading = ref(false)

// 验证函数
const validateRealName = () => {
  if (!form.value.realName) {
    realNameError.value = '请输入昵称'
  } else if (form.value.realName.length < 2) {
    realNameError.value = '姓名至少2个字符'
  } else {
    realNameError.value = ''
  }
}

const validatePhone = () => {
  if (!form.value.phone) {
    phoneError.value = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    phoneError.value = '手机号格式错误'
  } else {
    phoneError.value = ''
  }
}

const validateVerificationCode = () => {
  if (!form.value.verificationCode) {
    verificationCodeError.value = '请输入验证码'
  } else if (form.value.verificationCode.length !== 6) {
    verificationCodeError.value = '验证码必须是6位数字'
  } else {
    verificationCodeError.value = ''
  }
}

const validateIdCard = () => {
  if (!form.value.idCard) {
    idCardError.value = '请输入身份证号码'
  } else if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(form.value.idCard)) {
    idCardError.value = '身份证格式不正确'
  } else {
    idCardError.value = ''
  }
}

const validatePassword = () => {
  if (!form.value.password) {
    passwordError.value = '请输入密码'
  } else if (form.value.password.length < 6) {
    passwordError.value = '密码长度至少6位'
  } else {
    passwordError.value = ''
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!form.value.confirmPassword) {
    confirmPasswordError.value = '请确认密码'
  } else if (form.value.confirmPassword !== form.value.password) {
    confirmPasswordError.value = '两次输入的密码不一致'
  } else {
    confirmPasswordError.value = ''
  }
}

// 发送验证码
const getVerificationCode = async () => {
  validatePhone()
  if (phoneError.value) return
  
  try {
    uni.showLoading({ title: '发送中...', mask: true })
    
    // 调用发送验证码API
    await sendDoctorSmsCode(form.value.phone, 1) // 1-注册验证码
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
    uni.showToast({ title: '验证码已发送', icon: 'success' })
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

// 注册处理
const handleRegister = async () => {
  // 验证所有字段
  validateRealName()
  validatePhone()
  validateVerificationCode()
  validateIdCard()
  validatePassword()
  validateConfirmPassword()
  
  // 检查是否有错误
  if (
    realNameError.value || 
    phoneError.value || 
    verificationCodeError.value || 
    idCardError.value || 
    passwordError.value || 
    confirmPasswordError.value
  ) {
    return
  }
  
  // 检查性别是否已选择
  if (!form.value.gender) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return
  }
  
  try {
    isLoading.value = true
    uni.showLoading({ title: '注册中...', mask: true })
    
    // 调用注册API
    const response = await registerDoctor({
      name: form.value.realName,
      phone: form.value.phone,
      idNumber: form.value.idCard,
      gender: form.value.gender === 'male' ? '男' : '女',
      password: form.value.password
    }, form.value.verificationCode)
    
    // 注册成功后自动登录
    doctorTokenStore.setDoctor(response)
    
    uni.showToast({ title: '注册成功', icon: 'success' })
    
    // 跳转到首页
    setTimeout(() => {
      router.push('/pages/doctor/index/index')
    }, 1500)
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    isLoading.value = false
    uni.hideLoading()
  }
}

const navigateTo = (url) => {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 40rpx 50rpx;
  background: linear-gradient(180deg, #e8f5e9 0%, #ffffff 50%);
}

.brand-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
  margin-bottom: 60rpx;
  animation: fadeIn 0.6s ease;
  
  .logo {
    width: 150rpx;
    height: 150rpx;
    border-radius: 30rpx;
    box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.2);
  }
  
  .app-name {
    font-size: 48rpx;
    font-weight: bold;
    color: #2E7D32;
    margin-top: 30rpx;
    letter-spacing: 2rpx;
  }
  
  .slogan {
    font-size: 28rpx;
    color: #7c8d7c;
    margin-top: 15rpx;
  }
}

.login-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 50rpx;
  box-shadow: 0 10rpx 40rpx rgba(76, 175, 80, 0.1);
  animation: fadeIn 0.8s ease;
  
  .form-title {
    display: block;
    text-align: center;
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 60rpx;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -20rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 80rpx;
      height: 8rpx;
      background: linear-gradient(to right, #4CAF50, #2E7D32);
      border-radius: 4rpx;
    }
  }
}

.input-group {
  display: flex;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid #e0e7e0;
  padding: 0 10rpx;
  margin-bottom: 10rpx;
  transition: all 0.3s;
  
  &.input-error {
    border-bottom-color: #f44336;
  }
  
  .input-icon {
    width: 36rpx;
    height: 36rpx;
    margin-right: 16rpx;
  }
  
  .phone-prefix {
    color: #333;
    font-size: 34rpx;
    margin-right: 20rpx;
    font-weight: 500;
	height: 100%; 
	display: flex;  
	align-items: center; 
  }
  .phone-input {
      height: 100%;  
      display: flex; 
      align-items: center; 
      padding: 0; 
    }
  input, .picker {
    flex: 1;
    font-size: 32rpx;
    height: 100%;
    color: #333;
    border: none;
    outline: none;
    background: transparent;
  }
  
  .picker.placeholder {
    color: #999;
  }
  
  .captcha-btn {
    padding: 10rpx 20rpx;
    background-color: #e8f5e9;
    border-radius: 12rpx;
    color: #4CAF50;
    font-size: 26rpx;
    
    &.disabled {
      background-color: #f5f5f5;
      color: #999;
    }
  }
  
    .gender-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
      }
	  
    .gender-label {
		flex:1;
      font-size: 32rpx;
      padding: 0 20rpx;
      color: #999; // 默认灰色，与其他输入框占位符一致
      &.active {
        color: #333; // 选中后变为黑色，与其他输入框输入后一致
        font-weight: 500;
      }
    }
	
    .gender-buttons {
      display: flex;
      gap: 20rpx;
      
      .gender-btn {
        display: flex;
        align-items: center;
		justify-content: center; // 水平居中 
        background: #f5f5f5; // 添加背景色
        color: #666;
        border: none;
        border-radius: 40rpx; // 圆角按钮
        padding: 0 30rpx; // 增加内边距
        height: 70rpx; // 调整高度
        line-height: 70rpx;
        font-size: 30rpx;
		min-width: 120rpx; 
        transition: all 0.3s ease; // 添加过渡效果
        &::after {
          border: none;
        }
        
        .gender-icon {
          width: 36rpx;
          height: 36rpx;
          margin-right: 10rpx;
          transition: all 0.3s ease; // 添加过渡效果
        }
        
        &.active {
          background: rgba(76, 175, 80, 0.1); // 选中背景色
          color: #4CAF50;
          font-weight: bold;
          box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.2); // 添加阴影
          
          .gender-icon {
            transform: scale(1.1); // 选中时图标轻微放大
          }
          
          // 移除下划线，改用整体按钮样式
          &::after {
            content: none;
          }
        }
      }
    }
  }
/* 添加响应式设计 */
@media (min-width: 768px) {
  .input-group .gender-buttons .gender-btn {
    min-width: 200rpx; /* PC端增大按钮宽度 */
    padding: 0 40rpx; /* PC端增加内边距 */
    height: 80rpx; /* PC端增加高度 */
    line-height: 80rpx;
    font-size: 34rpx; /* PC端增大字体 */
    
    .gender-icon {
      width: 40rpx; /* PC端增大图标 */
      height: 40rpx; /* PC端增大图标 */
    }
  }
}

.error-msg {
  height: 50rpx;
  line-height: 50rpx;
  font-size: 26rpx;
  color: #f44336;
  padding-left: 50rpx;
  margin-bottom: 20rpx;
}

.login-btn {
  margin-top: 40rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  font-size: 34rpx;
  box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.3);
}

.login-link {
  text-align: center;
  font-size: 26rpx;
  color: #666;
  margin-top: 30rpx;
  
  .login-text {
    color: #4CAF50;
    margin-left: 10rpx;
    font-weight: 500;
  }
}

.footer {
  margin-top: auto;
  padding: 40rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  animation: fadeIn 1.2s ease;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>