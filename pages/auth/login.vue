<template>
  <view class="login-container">
    <!-- 品牌头部 -->
    <view class="brand-header">
      <image src="/static/auth/logo.png" class="logo" mode="aspectFit"></image>
      <text class="app-name">愈心护理</text>
      <text class="slogan">专业护理服务，关爱您的健康</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-card">
      <text class="form-title">登录</text>
      
      <!-- 手机号输入 -->
      <view class="input-group">
        <image 
          src="/static/auth/phone-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.phone" 
          type="number" 
          placeholder="请输入手机号" 
          placeholder-class="placeholder"
          maxlength="11"
          class="phone-input"
        />
        <view class="clear-icon" v-if="form.phone" @click="form.phone = ''">
          <image 
            src="/static/auth/clear-icon.png" 
            class="clear-icon-img"
            mode="aspectFit"
          />
        </view>
      </view>
      
      <!-- 输入密码 -->
      <view class="input-group">
        <image 
          src="/static/auth/pass-icon.png" 
          class="input-icon"
          mode="aspectFit"
        />
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码" 
          placeholder-class="placeholder"
          password
          class="password-input"
        />
        <view class="clear-icon" v-if="form.password" @click="form.password = ''">
          <image 
            src="/static/auth/clear-icon.png" 
            class="clear-icon-img"
            mode="aspectFit"
          />
        </view>
      </view>
      
      <!-- 登录按钮 -->
      <button class="login-btn" @click="handleLogin">登录</button>
      
      <!-- 底部选项 -->
      <view class="action-links">
        <text class="action-link" @click="switchToSMSLogin">验证码登录</text>
        <text class="action-link" @click="navigateTo('/pages/auth/forgot')">忘记密码？</text>
		<text class="action-link" @click="navigateTo('/pages/doctor/auth/login')">医生端</text>
      </view>
    </view>
    
    <!-- 注册入口 -->
    <view class="register-section">
      <text>还没有账号？</text>
      <text class="register-link" @click="navigateTo('/pages/auth/register')">注册</text>
    </view>
	
    <!-- 底部版权信息 -->
    <view class="footer">
      <text>© 2025 愈心护理 版权所有</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '@/api/user'
import { useTokenStore } from '@/stores/token'

const form = ref({
  phone: '',
  password: ''
})

const tokenStore = useTokenStore()
const isLoading = ref(false)

const handleLogin = async () => {
  if (!form.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    uni.showToast({ title: '手机号格式错误', icon: 'none' })
    return
  }
  
  if (!form.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  isLoading.value = true
  uni.showLoading({ title: '登录中...', mask: true })
  
   try {
     // 调用登录API
     const userData = await login(form.value.phone, form.value.password)
     
     // 调试日志
     console.log('登录成功，用户信息:', userData)
     console.log('Pinia 存储的用户信息:', tokenStore.user)
     
     uni.showToast({ title: '登录成功', icon: 'success' })
 
     // 跳转到首页
     setTimeout(() => {
       uni.switchTab({ url: '/pages/index/index' })
     }, 1500)
   } catch (error) {
     console.error('登录失败:', error)
     uni.showToast({ 
       title: '登录失败: ' + (error.message || '未知错误'), 
       icon: 'none' 
     })
   } finally {
     isLoading.value = false
     uni.hideLoading()
   }
   
 }


const navigateTo = (url) => {
  uni.navigateTo({ url })
}

const switchToSMSLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/sms-login'
  })
}
</script>

<style lang="scss" scoped>
.login-container {
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
  margin-bottom: 20rpx;
  
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
}

.placeholder {
  color: #999;
  font-size: 34rpx;
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
  animation: fadeIn 1s ease;
  
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
  animation: fadeIn 1.2s ease;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>