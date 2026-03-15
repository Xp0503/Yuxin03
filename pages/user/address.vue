<template>
  <!-- 地址管理页面 -->
  <view class="address-container">
    <!-- 顶部导航栏  -->
    <view class="profile-header">
      <view class="header-left">
        <view class="back-icon" @click="goBack">
          <image src="/static/general/return-icon.png"></image>
        </view>
        <text class="header-title">地址管理</text>
      </view>
      <view class="add-btn" @click="addAddress">
        <image src="/static/general/add-icon.png"></image>
        <text>添加</text>
      </view>
    </view>
    <!-- 选择模式提示 -->
    <view v-if="isSelectMode" class="selection-notice">
      <text>点击地址进行选择</text>
    </view>
	
    <!-- 地址列表  -->
    <scroll-view class="address-list" scroll-y="true" @scroll="handleScroll">
      <view 
        v-for="(address, index) in addressList" 
        :key="index"
        class="address-card"
        :class="{'default-address': address.isDefault}"
        :style="{animationDelay: `${index * 0.05}s`}"
        @click="handleSelectAddress(address)"
      >
        <view class="card-header">
          <view class="recipient-info">
            <text class="recipient">{{address.recipient}}</text>
            <text class="phone">{{address.phone}}</text>
          </view>
          <view v-if="address.isDefault" class="default-tag">
            <text>默认地址</text>
          </view>
        </view>
        
        <view class="address-content">
          <text class="address-text">{{address.province}} {{address.city}} {{address.district}} {{address.detail}}</text>
        </view>
        
        <view class="card-footer">
          <view class="set-default" @click.stop="toggleDefault(index)">
            <view class="check-box" :class="{'checked': address.isDefault}">
              <image v-if="address.isDefault" src="/static/general/star.png" class="check-icon"></image>
            </view>
            <text>设为默认</text>
          </view>
          
          <view class="actions">
            <view class="action-btn" @click.stop="editAddress(index)">
              <image src="/static/general/edit-icon.png" class="action-icon"></image>
              <text>编辑</text>
            </view>
            <view class="action-btn" @click.stop="deleteAddress(index)">
              <image src="/static/index/close-icon.png" class="action-icon"></image>
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 空状态提示  -->
    <view v-if="addressList.length === 0" class="empty-state">
      <image src="/static/index/empty-location.png" class="empty-icon"></image>
      <text class="empty-text">您还没有添加任何地址</text>
      <button class="add-address-btn" @click="addAddress">添加新地址</button>
    </view>
    
    <!-- 添加地址按钮 -->
    <view v-if="addressList.length > 0" class="add-address-section">
      <button class="add-address-btn" @click="addAddress">添加新地址</button>
    </view>
    
    <!-- 添加/编辑地址页面 -->
    <view class="edit-address-container" :class="{'show': showEditPage}">
      <view class="edit-overlay" @click="cancelEdit"></view>
      <view class="edit-content">
        <!-- 顶部导航栏 -->
        <view class="profile-header">
          <view class="header-left">
            <view class="back-icon" @click="cancelEdit">
              <image src="/static/general/return-icon.png"></image>
            </view>
            <text class="header-title">{{isEditing ? '编辑地址' : '添加新地址'}}</text>
          </view>
        </view>
        
        <!-- 地址表单 -->
        <scroll-view class="form-scroll" scroll-y="true">
          <view class="form-section">
            <!-- 收货人 -->
            <view class="form-item">
              <text class="item-label">收货人</text>
              <input 
                type="text" 
                class="item-input" 
                v-model="currentAddress.recipient"
                placeholder="请输入收货人姓名"
                placeholder-class="placeholder"
              />
            </view>
            
            <!-- 手机号 -->
            <view class="form-item">
              <text class="item-label">手机号</text>
              <input 
                type="tel" 
                class="item-input" 
                v-model="currentAddress.phone"
                placeholder="请输入收货人手机号"
                placeholder-class="placeholder"
              />
            </view>
            
            <!-- 所在地区 -->
            <view class="form-item region-item">
              <text class="item-label">所在地区</text>
              <view class="region-input-group">
                <input 
                  type="text" 
                  class="region-input" 
                  v-model="currentAddress.province"
                  placeholder="省"
                  placeholder-class="placeholder"
                />
                <input 
                  type="text" 
                  class="region-input" 
                  v-model="currentAddress.city"
                  placeholder="市"
                  placeholder-class="placeholder"
                />
                <input 
                  type="text" 
                  class="region-input" 
                  v-model="currentAddress.district"
                  placeholder="区"
                  placeholder-class="placeholder"
                />
              </view>
            </view>
            
            <!-- 详细地址 -->
            <view class="form-item">
              <text class="item-label">详细地址</text>
              <input 
                type="text" 
                class="item-input" 
                v-model="currentAddress.detail"
                placeholder="街道、小区、门牌号等"
                placeholder-class="placeholder"
              />
            </view>
            
            <!-- 设为默认地址 -->
            <view class="form-item no-border">
              <text class="item-label">设为默认地址</text>
              <view class="switch" :class="{'active': currentAddress.isDefault}" @click="toggleDefaultSwitch">
                <view class="switch-handle"></view>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <!-- 保存按钮 -->
        <button 
          class="save-btn" 
          @click="saveAddress"
        >
          保存地址
        </button>
        
        <!-- 删除按钮（编辑模式显示） -->
        <button 
          class="delete-btn" 
          v-if="isEditing"
          @click="confirmDelete"
        >
          删除地址
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getUserAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress,
  setDefaultAddress
} from '@/api/address';

export default {
  data() {
    return {
      addressList: [], 
      showEditPage: false,
      isEditing: false,
      editIndex: -1,
	  isSelectMode: false, // 新增选择模式标志
      currentAddress: {
        id: null,
        recipient: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        detail: "",
        isDefault: false
      },
    }
  },
  computed: {
    hasRegionSelected() {
      return this.currentAddress.province && 
             this.currentAddress.city && 
             this.currentAddress.district;
    }
  },
  mounted() {
    this.loadAddresses();
  },
  onLoad(options) {
    // 获取事件通道
    const eventChannel = this.getOpenerEventChannel();
    
    // 监听来自结算页的选择模式指令
    if (eventChannel) {
      eventChannel.on('fromCheckout', (data) => {
        this.isSelectMode = data.mode === 'select';
      });
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    async loadAddresses() {
      try {
        const response = await getUserAddresses();
        console.log('地址列表响应:', response);
        this.addressList = response.map(item => ({
          id: item.id,
          recipient: item.contactName,
          phone: item.contactPhone,
          province: item.province,
          city: item.city,
          district: item.district,
          detail: item.detail,
          isDefault: item.isDefault === 1
        }));
      } catch (error) {
        console.error('加载地址失败:', error);
        uni.showToast({
          title: '加载地址失败',
          icon: 'none'
        });
      }
    },
    addAddress() {
      this.resetForm();
      this.isEditing = false;
      this.showEditPage = true;
    },
    editAddress(index) {
	console.log('编辑地址，索引：', index);
      console.log('地址列表：', this.addressList);
      this.currentAddress = JSON.parse(JSON.stringify(this.addressList[index]));
      this.isEditing = true;
      this.editIndex = index;
      this.showEditPage = true;
    },
    cancelEdit() {
      this.showEditPage = false;
    },
    resetForm() {
      this.currentAddress = {
        id: null,
        recipient: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        detail: "",
        isDefault: false
      };
    },
    toggleDefaultSwitch(e) {
      this.currentAddress.isDefault = e.detail.value;
    },
    async saveAddress() {
      try {
      
        
        // 获取用户ID
        const userId = uni.getStorageSync('userId') || 1;
        
        if (this.isEditing) {
          // 确保有有效的地址ID
          if (!this.currentAddress.id) {
            console.error('更新地址失败：缺少地址ID');
            uni.showToast({
              title: '更新地址失败：缺少地址ID',
              icon: 'none'
            });
            return;
          }
          
          console.log('更新地址...', this.currentAddress.id);
          
          // 更新地址 - 传递整个对象
          await updateAddress({
            ...this.currentAddress,
            userId // 添加用户ID
          });
          
          uni.showToast({
            title: '地址已更新',
            icon: 'success'
          });
        } else {
          // 添加地址
          const newAddress = await addAddress({
            ...this.currentAddress,
            userId // 添加用户ID
          });
          uni.showToast({
            title: '地址已添加',
            icon: 'success'
          });
          
          // 更新当前地址ID（用于后续设置默认地址）
          this.currentAddress.id = newAddress.id;
        }
    
        // 如果设置为默认地址
        if (this.currentAddress.isDefault) {
          console.log('设置为默认地址...', this.currentAddress.id);
          await setDefaultAddress(this.currentAddress.id);
        }
    
        // 重新加载地址列表
        await this.loadAddresses();
        
        // 返回地址列表
        this.showEditPage = false;
      } catch (error) {
        console.error('保存地址失败:', error);
        uni.showToast({
          title: '保存地址失败: ' + (error.message || ''),
          icon: 'none'
        });
      }
    },
   
    async toggleDefault(index) {
      try {
        const addressId = this.addressList[index].id;
        await setDefaultAddress(addressId);
        this.addressList.forEach((addr, i) => {
          addr.isDefault = (i === index);
        });
        uni.showToast({
          title: '默认地址已更新',
          icon: 'success'
        });
      } catch (error) {
        console.error('设置默认地址失败:', error);
        uni.showToast({
          title: '设置默认地址失败',
          icon: 'none'
        });
      }
    },
    confirmDelete() {
      uni.showModal({
        title: '删除地址',
        content: '确定要删除这个地址吗？',
        success: (res) => {
          if (res.confirm) {
            this.deleteAddress(this.editIndex);
          }
        }
      });
    },
    async deleteAddress(index) {  // 在此方法后添加逗号
      try {
        const addressId = this.addressList[index].id;
        await deleteAddress(addressId);
        this.addressList.splice(index, 1);
        uni.showToast({
          title: '地址已删除',
          icon: 'success'
        });
        this.showEditPage = false;
      } catch (error) {
        console.error('删除地址失败:', error);
        uni.showToast({
          title: '删除地址失败',
          icon: 'none'
        });
      }
    },  // 添加逗号
	// 处理地址选择（选择模式）
	handleSelectAddress(address) {
	  if (!this.isSelectMode) return;
	  
	  // 获取事件通道
	  const eventChannel = this.getOpenerEventChannel();
	  
	  if (eventChannel) {
	    // 发送地址数据回结算页
	    eventChannel.emit('addressSelected', {
		 id: address.id, // 添加id字段
	      recipient: address.recipient,
	      phone: address.phone,
	      province: address.province,
	      city: address.city,
	      district: address.district,
	      detail: address.detail
	    });
	  }
	  
	  // 返回结算页
	  uni.navigateBack();
	},
	
  }
}
</script>

<style lang="scss" scoped>
.address-container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  padding-bottom: 120rpx;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏*/
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

.add-btn {
  display: flex;
  align-items: center;
  color: white;
  font-size: 32rpx;
  font-weight: 500;
  padding: 12rpx 25rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  transition: all 0.3s ease;
  
  image {
    width: 36rpx;
    height: 36rpx;
    margin-right: 10rpx;
  }
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }
}


/* 地址列表  */
.address-list {
  flex: 1;
  padding: 0 30rpx;
  padding-bottom: 150rpx;
  padding-top: 10rpx;
  box-sizing: border-box;
}

.address-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30rpx);
  animation: fadeInUp 0.5s ease forwards;
  transition: all 0.3s ease;
  border: 1rpx solid #e8f5e9;
  
  &:active {
    transform: translateY(-5rpx);
    box-shadow: 0 12rpx 30rpx rgba(76, 175, 80, 0.2);
  }
  
  &.default-address {
    border-left: 8rpx solid #4CAF50;
  }
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.recipient-info {
  display: flex;
  align-items: center;
  
  .recipient {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    margin-right: 20rpx;
  }
  
  .phone {
    font-size: 30rpx;
    color: #666;
  }
}

.default-tag {
  display: flex;
  align-items: center;
  background: #e8f5e9;
  color: #4CAF50;
  font-size: 26rpx;
  padding: 6rpx 18rpx;
  border-radius: 30rpx;
  
}

.address-content {
  padding: 20rpx 0;
  
  .address-text {
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f1f5f9;
  
  .set-default {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 28rpx;
    
    .check-box {
      width: 40rpx;
      height: 40rpx;
      border: 2rpx solid #ddd;
      border-radius: 50%;
      margin-right: 15rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &.checked {
        background: #e8f5e9;
      }
      
      .check-icon {
        width: 24rpx;
        height: 24rpx;
      }
    }
  }
  
  .actions {
    display: flex;
    
    .action-btn {
      display: flex;
      align-items: center;
      margin-left: 30rpx;
      font-size: 28rpx;
      padding: 10rpx 15rpx;
      border-radius: 10rpx;
      transition: all 0.3s ease;
      color: #4CAF50;
      .action-icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 8rpx;
      }
    
        &:active {
          background: rgba(76, 175, 80, 0.1);
          transform: scale(0.95);
        }
    }
  }
}

/* 空状态提示  */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  padding: 0 30rpx;
  
  .empty-icon {
    width: 280rpx;
    height: 280rpx;
    opacity: 0.3;
    margin-bottom: 40rpx;
  }
  
  .empty-text {
    font-size: 34rpx;
    color: #999;
    margin-bottom: 50rpx;
    text-align: center;
  }
}

/* 添加地址按钮 */
.add-address-section {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  z-index: 5;
}

.add-address-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 50rpx;
  padding: 28rpx;
  font-size: 34rpx;
  border: none;
  box-shadow: 0 8rpx 25rpx rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.4);
  }
}

/* 编辑地址页面  */
.edit-address-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  
  &.show {
    opacity: 1;
    pointer-events: all;
    
    .edit-content {
      transform: translateY(0);
    }
  }
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
}

.edit-content {
  background: #fff;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  width: 100%;
  max-height: 85vh;
  position: relative;
  z-index: 2;
  padding: 0 30rpx;
  box-shadow: 0 -10rpx 50rpx rgba(0,0,0,0.1);
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 表单区域 */
.form-scroll {
  max-height: 60vh;
  padding-bottom: 40rpx;
}

.form-section {
  padding: 20rpx 0;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 40rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
  
  &:last-child, &.no-border {
    border-bottom: none;
  }
}

.item-label {
  width: 180rpx;
  font-size: 30rpx;
  color: #555;
  font-weight: 500;
}

.item-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  padding: 20rpx 0;
  border: none;
  outline: none;
}

.placeholder {
  color: #bbb;
  font-size: 30rpx;
}

/* 添加区域输入组样式 */
.region-input-group {
  display: flex;
  flex: 1;
  justify-content: space-between;
}

.region-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  padding: 20rpx 0;
  border: none;
  outline: none;
  margin-right: 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.region-input:last-child {
  margin-right: 0;
}

/* 开关样式 */
.switch {
  width: 90rpx;
  height: 50rpx;
  background: #e0e0e0;
  border-radius: 30rpx;
  position: relative;
  transition: all 0.3s ease;
  
  &.active {
    background: #4CAF50;
    
    .switch-handle {
      left: 50rpx;
    }
  }
}

.switch-handle {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  background: #fff;
  border-radius: 50%;
  top: 5rpx;
  left: 5rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.2);
}

/* 保存按钮 */
.save-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 50rpx;
  padding: 28rpx;
  font-size: 34rpx;
  border: none;
  margin: 30rpx 0 20rpx;
  box-shadow: 0 8rpx 25rpx rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.4);
  }
}

/* 删除按钮 */
.delete-btn {
  background: transparent;
  color: #ff6b6b;
  border: 1rpx solid #ff6b6b;
  border-radius: 50rpx;
  padding: 28rpx;
  font-size: 34rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    background: rgba(255, 107, 107, 0.05);
  }
}
</style>