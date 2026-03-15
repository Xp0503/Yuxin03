<template>
  <view class="profile-container">
    <!-- 顶部导航栏 -->
    <view class="profile-header">
      <view class="header-left">
        <view class="back-icon" @click="goBack">
          <image src="/static/general/return-icon.png"></image>
        </view>
        <text class="header-title">个人信息</text>
      </view>
      <view class="edit-btn" @click="toggleEditMode">
        <text v-if="!editMode">编辑</text>
        <text v-else>完成</text>
      </view>
    </view>
    
    <!-- 用户信息卡片 -->
    <view class="profile-card">
      <!-- 用户头像区域 -->
      <view class="avatar-section">
        <view class="avatar-wrapper">
          <image 
            src="/static/user/avatar.jpg" 
            class="avatar"
          ></image>
          <view 
            class="change-avatar" 
            v-if="editMode"
            @click="changeAvatar"
          >
          </view>
        </view>
        <text class="username">{{ userInfo.nickname || '用户昵称' }}</text>
      </view>
      
      <!-- 个人信息表单 -->
      <view class="form-section">
        <!-- 昵称 -->
        <view class="form-item">
          <view class="item-left">
            <image src="/static/user/user-icon.png" class="item-icon"></image>
            <text class="item-label">昵称</text>
          </view>
          <input 
            type="text" 
            class="item-input" 
            v-model="userInfo.nickname"
            :disabled="!editMode"
            :class="{'editable': editMode, 'readonly-mode': !editMode}"
            placeholder="请输入昵称"
          />
        </view>
        
        <!-- 手机号 -->
        <view class="form-item">
          <view class="item-left">
            <image src="/static/auth/phone-icon.png" class="item-icon"></image>
            <text class="item-label">手机号</text>
          </view>
          <input 
            type="tel" 
            class="item-input" 
            v-model="userInfo.phone"
            :disabled="!editMode"
            :class="{'editable': editMode, 'readonly-mode': !editMode}"
            placeholder="请输入手机号"
          />
        </view>
        
        <!-- 密码 -->
        <view class="form-item">
          <view class="item-left">
            <image src="/static/auth/pass-icon1.png" class="item-icon"></image>
            <text class="item-label">密码</text>
          </view>
          <input 
            :type="showPassword ? 'text' : 'password'"
            class="item-input" 
            v-model="userInfo.password"
            :disabled="!editMode"
            :class="{'editable': editMode, 'readonly-mode': !editMode}"
            placeholder="请输入密码"
          />
          <image 
            :src="showPassword ? '/static/auth/eye-open.png' : '/static/auth/eye-close.png'"
            class="password-eye"
            @click="togglePassword"
            v-if="editMode"
          ></image>
          
          <!-- 密码强度指示器 -->
          <view class="password-strength" v-if="editMode && userInfo.password">
            <view class="strength-bar" :class="strengthClass"></view>
            <text class="strength-text">{{ strengthText }}</text>
          </view>
        </view>
        
        <!-- 身份证号 -->
        <view class="form-item">
          <view class="item-left">
            <image src="/static/auth/cmt-icon.png" class="item-icon"></image>
            <text class="item-label">身份证号</text>
          </view>
          <input 
            type="text" 
            class="item-input" 
            v-model="userInfo.idnumber"
            :disabled="!editMode"
            :class="{'editable': editMode, 'readonly-mode': !editMode}"
            placeholder="请输入身份证号"
          />
        </view>
        
        <!-- 性别 -->
        <view class="form-item">
          <view class="item-left">
            <image src="/static/auth/name-icon.png" class="item-icon"></image>
            <text class="item-label">性别</text>
          </view>
          <view class="gender-selector">
            <view 
              class="gender-option"
              :class="{'selected': userInfo.gender === '男'}"
              @click="setGender('男')"
              v-if="editMode"
            >
              <image 
                src="/static/auth/male-icon.png" 
                class="gender-icon"
              ></image>
              <text>男</text>
            </view>
            <view 
              class="gender-option"
              :class="{'selected': userInfo.gender === '女'}"
              @click="setGender('女')"
              v-if="editMode"
            >
              <image 
                src="/static/auth/female-icon.png" 
                class="gender-icon"
              ></image>
              <text>女</text>
            </view>
            <text v-if="!editMode" class="gender-display">
              {{ userInfo.gender === '男' ? '男' : '女' }}
            </text>
          </view>
        </view>
        
        <!-- 出生日期 -->
        <view class="form-item">
          <view class="item-left">
            <image src="/static/auth/carlendar-icon.png" class="item-icon"></image>
            <text class="item-label">出生日期</text>
          </view>
          <picker 
            v-if="editMode"
            mode="date" 
            :value="userInfo.birthDate" 
            @change="onDateChange"
            class="date-picker"
          >
            <view class="date-display editable">
              {{ userInfo.birthDate || '请选择出生日期' }}
            </view>
          </picker>
          <!-- 非编辑状态下显示静态文本 -->
          <view v-else class="date-display readonly-mode">
            {{ userInfo.birthDate || '请选择出生日期' }}
          </view>
          <image 
            src="/static/auth/register/calendar.png" 
            class="calendar-icon"
            v-if="editMode"
          ></image>
        </view>
      </view>
      
      <!-- 保存按钮 -->
      <button 
        class="save-btn" 
        v-if="editMode"
        @click="saveProfile"
      >
        保存个人信息
      </button>
    </view>
    
    <!-- 安全退出 -->
    <view class="logout-section">
      <button class="logout-btn" @click="logout">安全退出</button>
    </view>
    
    <!-- 头像选择弹窗 -->
    <view class="avatar-modal" v-if="showAvatarModal" @click="closeAvatarModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">更换头像</text>
        </view>
        <view class="avatar-options">
          <view 
            v-for="(avatar, index) in avatarOptions" 
            :key="index" 
            class="avatar-option"
            @click="selectAvatar(avatar)"
          >
            <image :src="avatar" class="option-avatar"></image>
          </view>
        </view>
        <button class="modal-btn" @click="closeAvatarModal">取消</button>
      </view>
    </view>
    
    <!-- 操作成功提示 -->
    <view class="success-toast" v-if="showSuccessToast">
      <image src="/static/general/success-icon.png" class="toast-icon"></image>
      <text>{{ successMessage }}</text>
    </view>
  </view>
</template>

<script>
import { getCurrentUser, updateUser } from '@/api/user'
import { useTokenStore } from '@/stores/token'
 export default {
   data() {
     return {
       editMode: false,
       saving: false,
       showPassword: false,
       showAvatarModal: false,
       showSuccessToast: false,
       successMessage: '',
       userInfo: {
         id: null,
         nickname: '',
         phone: '',
         idnumber: '',
         gender: '',
         birthDate: '',
         avatar: ''
       },
       avatarOptions: [
		 '/static/user/avatar.png',
         '/static/user/avatar1.png',
         '/static/user/avatar2.png',
         '/static/user/avatar3.png',
         '/static/user/avatar4.png',
         '/static/user/avatar5.png',
         '/static/user/avatar6.png'
       ]
     }
   },
   created() {
       this.initFromStore()
     },
  computed: {
    // 计算密码强度
    passwordStrength() {
      if (!this.userInfo.password) return 0
      
      let strength = 0
      if (this.userInfo.password.length >= 6) strength += 1
      if (/[A-Z]/.test(this.userInfo.password)) strength += 1
      if (/[a-z]/.test(this.userInfo.password)) strength += 1
      if (/\d/.test(this.userInfo.password)) strength += 1
      if (/[^A-Za-z0-9]/.test(this.userInfo.password)) strength += 1
      
      return Math.min(strength, 4)
    },
    
    // 密码强度类名
    strengthClass() {
      return `strength-${this.passwordStrength}`
    },
    
    // 密码强度文本
    strengthText() {
      const texts = ['弱', '一般', '中等', '强', '非常强']
      return texts[this.passwordStrength - 1] || ''
    }
  },
  methods: {
    initFromStore() {
          const tokenStore = useTokenStore()
          
          if (tokenStore.user) {
            this.userInfo = {
              id: tokenStore.user.id,
              nickname: tokenStore.user.nickname || '',
              phone: tokenStore.user.phone || '',
              idnumber: tokenStore.user.idnumber || '',
              gender: tokenStore.user.gender || '',
              birthDate: tokenStore.user.birth || '',
              avatar: tokenStore.user.avatar || ''
            }
          }
        },
        async fetchUserInfo() {
          try {
            const tokenStore = useTokenStore()
            
            if (!tokenStore.isLoggedIn) {
              uni.navigateTo({ url: '/pages/login/login' })
              return
            }
            
            const res = await getCurrentUser()
            if (res.data) {
              this.userInfo = {
                id: res.data.id,
                nickname: res.data.nickname || '',
                phone: res.data.phone || '',
                idnumber: res.data.idnumber || '',
                gender: res.data.gender || '',
                birthDate: res.data.birth || '',
                avatar: res.data.avatar || ''
              }
              
              tokenStore.setUser({ 
                ...tokenStore.user, 
                ...this.userInfo 
              })
            }
          } catch (error) {
            console.error('获取用户信息失败', error)
            uni.showToast({
              title: '获取信息失败',
              icon: 'none'
            })
          }
        },  
    // 返回上一页
    goBack() {
      uni.navigateBack({
        animationType: 'slide-out-right',
        animationDuration: 300
      })
    },
    
    // 切换编辑模式
    toggleEditMode() {
      if (this.editMode) {
        this.saveProfile()
      } else {
        // 进入编辑模式时重置密码显示状态
        this.showPassword = false
      }
      this.editMode = !this.editMode
    },
    
    // 更换头像
    changeAvatar() {
      this.showAvatarModal = true
    },
    
    // 关闭头像弹窗
    closeAvatarModal() {
      this.showAvatarModal = false
    },
    
    // 选择头像
    selectAvatar(avatar) {
      this.userInfo.avatar = avatar
      this.showAvatarModal = false
      
      this.showSuccessToast = true
      this.successMessage = "头像更换成功"
      setTimeout(() => {
        this.showSuccessToast = false
      }, 1500)
    },
    
    // 切换密码显示状态
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    // 设置性别
    setGender(gender) {
      this.userInfo.gender = gender
    },
    
    // 日期选择器变化事件
    onDateChange(e) {
      this.userInfo.birthDate = e.detail.value
    },
    
     async saveProfile() {
          if (!this.validateForm()) return
          
          this.saving = true
          const tokenStore = useTokenStore()
          
          try {
            const updateData = {
              id: this.userInfo.id,
              nickname: this.userInfo.nickname,
              phone: this.userInfo.phone,
              idnumber: this.userInfo.idnumber,
              gender: this.userInfo.gender,
              birth: this.userInfo.birthDate,
              avatar: this.userInfo.avatar
            }
            
            if (this.userInfo.password) {
              updateData.password = this.userInfo.password
            }
            
            const response = await updateUser(updateData)
            
            tokenStore.setUser({
              ...tokenStore.user,
              ...updateData
            })
            
            this.showSuccessToast = true
            this.successMessage = "个人信息已更新"
            setTimeout(() => {
              this.showSuccessToast = false
            }, 1500)
            
            this.userInfo.password = ''
            
            setTimeout(() => {
              this.editMode = false
              this.saving = false
            }, 1500)
          } catch (error) {
            console.error('保存失败', error)
            uni.showToast({
              title: '保存失败: ' + (error.message || '未知错误'),
              icon: 'none',
              duration: 3000
            })
            this.saving = false
          }
        },
    
    // 表单验证
    validateForm() {
      if (!this.userInfo.nickname) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return false
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.userInfo.phone)) {
        uni.showToast({
          title: '请输入正确手机号',
          icon: 'none'
        })
        return false
      }
      
      if (!this.userInfo.password || this.userInfo.password.length < 6) {
        uni.showToast({
          title: '密码至少6位',
          icon: 'none'
        })
        return false
      }
      
      if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(this.userInfo.idnumber)) {
        uni.showToast({
          title: '请输入正确身份证号',
          icon: 'none'
        })
        return false
      }
      
      if (!this.userInfo.birthDate) {
        uni.showToast({
          title: '请选择出生日期',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 安全退出
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '您确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 实际项目中清除用户信息并跳转到登录页
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  padding: 0;
  position: relative;
}

/* 顶部导航栏样式 */
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

/* 编辑按钮 */
.edit-btn {
  display: flex;
  align-items: center;
  color: white;
  font-size: 32rpx;
  font-weight: 500;
  padding: 12rpx 25rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }
}

/* 用户卡片 */
.profile-card {
  background: #fff;
  border-radius: 30rpx;
  margin: 30rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
  position: relative;
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(60rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar-wrapper {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 20rpx;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6rpx solid #e0f2fe;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.2);
  transition: all 0.3s ease;
}

.change-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #4CAF50;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.9);
    background-color: #2E7D32;
  }
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 表单区域 */
.form-section {
  margin-top: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
}

.item-left {
  display: flex;
  align-items: center;
  width: 200rpx;
}

.item-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 15rpx;
}

.item-label {
  font-size: 30rpx;
  color: #666;
}

.item-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  padding: 12rpx 0;
  border: none;
  outline: none;
  transition: all 0.3s ease;
  
  &.editable {
    color: #2E7D32;
    font-weight: 500;
  }
  
  /* 只读模式样式 */
  &.readonly-mode {
    color: #666;
    background-color: #f9f9f9;
    border-radius: 8rpx;
    padding: 12rpx 20rpx;
    pointer-events: none;
  }
}

/* 确保禁用状态下样式一致 */
.item-input:disabled {
  opacity: 1;
  background-color: #f9f9f9;
  color: #666;
  -webkit-text-fill-color: #666;
}

.password-eye,
.calendar-icon {
  position: absolute;
  right: 0;
  width: 40rpx;
  height: 40rpx;
}

/* 密码强度指示器 */
.password-strength {
  position: absolute;
  bottom: 5rpx;
  left: 200rpx;
  right: 0;
  display: flex;
  align-items: center;
}

.strength-bar {
  height: 6rpx;
  border-radius: 3rpx;
  margin-right: 15rpx;
  flex: 1;
  transition: all 0.3s ease;
  
  &.strength-1 {
    width: 25%;
    background: #ff7675;
  }
  
  &.strength-2 {
    width: 50%;
    background: #ffb859;
  }
  
  &.strength-3 {
    width: 75%;
    background: #55e6c1;
  }
  
  &.strength-4 {
    width: 100%;
    background: #4CAF50;
  }
}

.strength-text {
  font-size: 24rpx;
  color: #999;
}

/* 日期选择器 */
.date-picker {
  flex: 1;
}

.date-display {
  font-size: 30rpx;
  color: #333;
  padding: 12rpx 0;
  width: 100%;
  
  &.editable {
    color: #2E7D32;
    font-weight: 500;
  }
  
  /* 只读模式样式 */
  &.readonly-mode {
    color: #666;
    background-color: #f9f9f9;
    border-radius: 8rpx;
    padding: 12rpx 20rpx;
    pointer-events: none;
  }
}

/* 性别选择器 */
.gender-selector {
  flex: 1;
  display: flex;
  align-items: center;
}

.gender-option {
  display: flex;
  align-items: center;
  margin-right: 50rpx;
  padding: 10rpx 25rpx;
  border-radius: 40rpx;
  background-color: #f1f5f9;
  transition: all 0.3s ease;
  
  &.selected {
    background-color: #e0f2fe;
    box-shadow: 0 4rpx 10rpx rgba(76, 175, 80, 0.2);
    
    text {
      color: #2E7D32;
      font-weight: 500;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.gender-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 15rpx;
}

.gender-display {
  font-size: 30rpx;
  color: #333;
}

/* 保存按钮 */
.save-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 50rpx;
  padding: 25rpx;
  font-size: 32rpx;
  border: none;
  margin: 30rpx 0 10rpx;
  box-shadow: 0 6rpx 20rpx rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active::after {
    opacity: 1;
  }
  
  &:active {
    transform: translateY(5rpx);
    box-shadow: 0 3rpx 10rpx rgba(76, 175, 80, 0.3);
  }
}

/* 安全退出按钮 */
.logout-section {
  margin-top: 20rpx;
  display: flex;
  justify-content: center;
}

.logout-btn {
  background-color: transparent;
  color: #ff6b6b;
  border: 1rpx solid #ff6b6b;
  border-radius: 50rpx;
  padding: 20rpx 80rpx;
  font-size: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 107, 107, 0.1);
    transform: scale(0.95);
  }
}

/* 头像选择弹窗 */
.avatar-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 24rpx;
  width: 80%;
  max-width: 600rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.4s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #2E7D32;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.avatar-option {
  width: 100%;
  padding-top: 100%;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.9);
  }
}

.option-avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-btn {
  background: #f8f8f8;
  color: #666;
  border-radius: 50rpx;
  padding: 20rpx;
  font-size: 30rpx;
  border: none;
  transition: all 0.3s ease;
  
  &:active {
    background: #f0f0f0;
  }
}

/* 操作成功提示 */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  z-index: 2000;
  animation: fadeInOut 2s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -40%); }
  20% { opacity: 1; transform: translate(-50%, -50%); }
  80% { opacity: 1; transform: translate(-50%, -50%); }
  100% { opacity: 0; transform: translate(-50%, -60%); }
}

.toast-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 15rpx;
}
</style>