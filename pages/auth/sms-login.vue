<template>
  <view class="captcha-login-container">
    <!-- 品牌头部 -->
    <view class="brand-header">
      <image src="/static/auth/logo.png" class="logo" mode="aspectFit"></image>
      <text class="app-name">愈心护理</text>
      <text class="slogan">专业护理服务，关爱您的健康</text>
    </view>
    
    <!-- 登录表单 -->
    <view class="login-card">
      <text class="form-title">验证码登录</text>
      
      <!-- 手机号输入 -->
      <view class="input-group" :class="{'input-error': phoneError}">
        <!-- 使用图片图标 -->
        <image 
          src="/static/auth/phone-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          type="number" 
          v-model="form.phone" 
          placeholder="请输入手机号"
          maxlength="11"
          @input="validatePhone"
        />
        <view class="clear-icon" v-if="form.phone" @click="form.phone = ''">
          <image 
            src="/static/auth/clear-icon.png" 
            class="clear-icon-img"
            mode="aspectFit"
          />
        </view>
      </view>
      <view class="error-msg">{{ phoneError }}</view>
      
      <!-- 验证码输入 -->
      <view class="input-group" :class="{'input-error': captchaError}">
        <!-- 修改：使用图片图标 -->
        <image 
          src="/static/auth/sms-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          type="number" 
          v-model="form.captcha" 
          placeholder="请输入6位验证码"
          maxlength="6"
          @input="validateCaptcha"
        />
        <view class="captcha-btn" @click="sendCaptcha" :class="{disabled: !canSendCaptcha}">
          <text v-if="countdown > 0">重新发送({{ countdown }}s)</text>
          <text v-else>获取验证码</text>
        </view>
      </view>
      <view class="error-msg">{{ captchaError }}</view>
      
      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        :class="{disabled: !canLogin}" 
        @click="handleLogin"
      >
        登录
      </button>
      
      <!-- 底部选项 -->
      <view class="action-links">
        <text class="action-link" @click="switchToPasswordLogin">密码登录</text>
        <text class="action-link" @click="navigateTo('/pages/auth/forgot')">忘记密码</text>
      </view>
    </view>
    
    <!-- 注册入口 -->
    <view class="register-section">
      <text>还没有账号?</text>
      <text class="register-link" @click="navigateTo('/pages/auth/register')">立即注册</text>
    </view>
    
    <!-- 底部版权信息 -->
    <view class="footer">
      <text>© 2025 愈心护理 版权所有</text>
    </view>
  </view>
</template>

<script setup>
import { reactive,ref, computed, onUnmounted } from 'vue'
import { loginWithSms, sendSmsCode } from '@/api/user'
import { useTokenStore } from '@/stores/token'

const form = reactive({
  phone: '',
  captcha: ''
})

const countdown = ref(0)
const phoneError = ref('')
const captchaError = ref('')
const isLoading = ref(false)
let countdownTimer = null

const tokenStore = useTokenStore()

// 发送验证码
const sendCaptcha = async () => {
  validatePhone()
  if (phoneError.value) return
  
  try {
    uni.showLoading({ title: '发送中...', mask: true })
    
    // 调用发送验证码API
    await sendSmsCode(form.phone, 2) // 2-登录验证码
    
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    
    // 开始倒计时
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(countdownTimer)
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

// 登录处理
const handleLogin = async () => {
  validatePhone()
  validateCaptcha()
  if (phoneError.value || captchaError.value) return
  
  isLoading.value = true
  uni.showLoading({ title: '登录中...', mask: true })
  
  try {
    // 调用短信登录API
    const response = await loginWithSms(form.phone, form.captcha)
    
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    // 登录成功后跳转到首页
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 1500)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    isLoading.value = false
    uni.hideLoading()
  }
}
const validatePhone = () => {
  if (!form.phone) {
    phoneError.value = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    phoneError.value = '手机号格式错误'
  } else {
    phoneError.value = ''
  }
}

const validateCaptcha = () => {
  if (!form.captcha) {
    captchaError.value = '请输入验证码'
  } else if (form.captcha.length !== 6) {
    captchaError.value = '验证码必须是6位数字'
  } else {
    captchaError.value = ''
  }
}
// 切换到密码登录
const switchToPasswordLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

// 导航函数
const navigateTo = (url) => {
  uni.navigateTo({ url })
}

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})


</script>

<style lang="scss" scoped>
.captcha-login-container {
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
  margin-bottom: 80rpx;
  
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
  transition: all 0.3s;
  
  &.input-error {
    border-bottom-color: #f44336;
  }
  
  /* 新增：输入图标样式 */
  .input-icon {
    width: 36rpx;
    height: 36rpx;
    margin-right: 16rpx;
  }
  
  input {
    flex: 1;
    height: 100%;
    padding: 0 20rpx;
    font-size: 32rpx;
  }
  
  .clear-icon {
    padding: 10rpx;
    .clear-icon-img {
      width: 32rpx;
      height: 32rpx;
    }
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
}

.error-msg {
  height: 50rpx;
  line-height: 50rpx;
  font-size: 26rpx;
  color: #f44336;
  padding-left: 50rpx;
}

.login-btn {
  margin-top: 70rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  font-size: 34rpx;
  box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.3);
  
  &.disabled {
    background: #c8e6c9;
    box-shadow: none;
  }
}

.action-links {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
  
  .action-link {
    color: #4CAF50;
    font-size: 28rpx;
  }
}

.register-section {
  margin-top: 60rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  
  .register-link {
    color: #4CAF50;
    font-weight: 600;
    margin-left: 10rpx;
  }
}

.footer {
  margin-top: auto;
  padding: 40rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.brand-header { animation: fadeIn 0.6s ease; }
.login-card { animation: fadeIn 0.8s ease; }
.register-section { animation: fadeIn 1s ease; }
.footer { animation: fadeIn 1.2s ease; }
</style>