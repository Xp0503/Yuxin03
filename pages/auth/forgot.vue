<template>
  <view class="forgot-container">
    <!-- 品牌头部 -->
    <view class="brand-header">
      <image src="/static/auth/logo.png" class="logo" mode="aspectFit"></image>
      <text class="app-name">愈心护理</text>
      <text class="slogan">专业护理服务，关爱您的健康</text>
    </view>
    
    <!-- 表单卡片 -->
    <view class="login-card">
      <text class="form-title">重置密码</text>
      
      <!-- 手机号输入 -->
      <view class="input-group" :class="{'input-error': phoneError}">
        <image 
          src="/static/auth/phone-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.phone" 
          type="number" 
          placeholder="请输入手机号" 
          maxlength="11"
          class="input-field"
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
      <view class="input-group" :class="{'input-error': codeError}">
        <image 
          src="/static/auth/sms-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.code" 
          type="number" 
          placeholder="请输入验证码" 
          maxlength="6"
          class="input-field"
          @input="validateCode"
        />
        <view class="captcha-btn" @click="getVerificationCode" :class="{disabled: countdown > 0}">
          <text v-if="countdown > 0">重新发送({{ countdown }}s)</text>
          <text v-else>获取验证码</text>
        </view>
      </view>
      <view class="error-msg">{{ codeError }}</view>
      
      <!-- 新密码输入 -->
      <view class="input-group" :class="{'input-error': newPasswordError}">
        <image 
          src="/static/auth/pass-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.newPassword" 
          type="password" 
          placeholder="请输入新密码" 
          password
          class="input-field"
          @input="validateNewPassword"
        />
        <view class="clear-icon" v-if="form.newPassword" @click="form.newPassword = ''">
          <image 
            src="/static/auth/clear-icon.png" 
            class="clear-icon-img"
            mode="aspectFit"
          />
        </view>
      </view>
      <view class="error-msg">{{ newPasswordError }}</view>
      
      <!-- 确认密码输入 -->
      <view class="input-group" :class="{'input-error': confirmPasswordError}">
        <image 
          src="/static/auth/pass-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="请确认新密码" 
          password
          class="input-field"
          @input="validateConfirmPassword"
        />
        <view class="clear-icon" v-if="form.confirmPassword" @click="form.confirmPassword = ''">
          <image 
            src="/static/auth/clear-icon.png" 
            class="clear-icon-img"
            mode="aspectFit"
          />
        </view>
      </view>
      <view class="error-msg">{{ confirmPasswordError }}</view>
      
      <!-- 重置按钮 -->
      <button class="login-btn" @click="handleResetPassword">重置密码</button>
      
      <!-- 返回登录 -->
      <view class="action-links">
        <text class="action-link" @click="navigateToLogin">想起密码? 返回登录</text>
      </view>
    </view>
    
    <!-- 底部版权信息 -->
    <view class="footer">
      <text>© 2025 愈心护理 版权所有</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { sendSmsCode, changePasswordBySms } from '@/api/user'
import { useTokenStore } from '@/stores/token'

const form = ref({
  phone: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

// 添加错误信息变量
const phoneError = ref('')
const codeError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

const countdown = ref(0);
const isLoading = ref(false)
let countdownTimer = null;

const tokenStore = useTokenStore()

// 添加验证函数
const validatePhone = () => {
  if (!form.value.phone) {
    phoneError.value = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    phoneError.value = '手机号格式错误'
  } else {
    phoneError.value = ''
  }
}

const validateCode = () => {
  if (!form.value.code) {
    codeError.value = '请输入验证码'
  } else if (form.value.code.length !== 6) {
    codeError.value = '验证码必须是6位数字'
  } else {
    codeError.value = ''
  }
}

const validateNewPassword = () => {
  if (!form.value.newPassword) {
    newPasswordError.value = '请输入新密码'
  } else if (form.value.newPassword.length < 6) {
    newPasswordError.value = '密码长度至少6位'
  } else {
    newPasswordError.value = ''
    // 当新密码变化时，同时验证确认密码
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!form.value.confirmPassword) {
    confirmPasswordError.value = '请确认新密码'
  } else if (form.value.confirmPassword !== form.value.newPassword) {
    confirmPasswordError.value = '两次输入的密码不一致'
  } else {
    confirmPasswordError.value = ''
  }
}

const getVerificationCode = async () => {
  validatePhone()
  if (phoneError.value) return
  
  try {
    uni.showLoading({ title: '发送中...', mask: true })
    await sendSmsCode(form.value.phone, 3) // 3-重置密码
    uni.hideLoading()
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

const startCountdown = () => {
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

const handleResetPassword = async () => {
  // 验证所有字段
  validatePhone()
  validateCode()
  validateNewPassword()
  validateConfirmPassword()
  
  // 如果有错误则停止
  if (phoneError.value || codeError.value || newPasswordError.value || confirmPasswordError.value) {
    return
  }
  
  try {
    isLoading.value = true
    uni.showLoading({ title: '重置中...', mask: true });
    
    await changePasswordBySms(
      form.value.phone,
      form.value.code,
      form.value.newPassword,
      form.value.confirmPassword
    )
    
    // 密码重置成功后清除认证信息
    tokenStore.clearUser()
    
    uni.showToast({ title: '密码重置成功', icon: 'success' });
    
    // 跳转到登录页面
    setTimeout(() => {
      navigateToLogin();
    }, 1500);
  } catch (error) {
    console.error('重置密码失败:', error)
  } finally {
    isLoading.value = false
    uni.hideLoading()
  }
};

const navigateToLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' });
};

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style lang="scss" scoped>
.forgot-container {
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
  margin-bottom: 10rpx; /* 减少底部间距，为错误信息留空间 */
  transition: all 0.3s;
  
  /* 添加错误状态样式 */
  &.input-error {
    border-bottom-color: #f44336;
  }
  
  .input-icon {
    width: 36rpx;
    height: 36rpx;
    margin-right: 16rpx;
  }
  
  .input-field {
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
  margin-bottom: 20rpx;
}

.login-btn {
  margin-top: 40rpx; /* 减少顶部间距 */
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  font-size: 34rpx;
  box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.3);
}

.action-links {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
  
  .action-link {
    color: #4CAF50;
    font-size: 28rpx;
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