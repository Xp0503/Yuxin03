<template>
  <view class="admin-tabbar">
    <view 
      v-for="(item, index) in tabList" 
      :key="index"
      class="tab-item"
      :class="{ active: currentPage === item.pagePath }"
      @click="switchTab(item)"
    >
      <image 
        :src="currentPage === item.pagePath ? item.selectedIconPath : item.iconPath" 
        class="tab-icon"
      />
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentPage = ref('');

const tabList = [
  {
    pagePath: "pages/doctor/index/index",
    text: "首页",
    iconPath: "/static/bottom/index.png",
    selectedIconPath: "/static/bottom/index.png"
  },
  {
    pagePath: "pages/doctor/msg/list",
    text: "消息",
    iconPath: "/static/bottom/message.png",
    selectedIconPath: "/static/bottom/message.png"
  },
  {
    pagePath: "pages/doctor/user/center",
    text: "我的",
    iconPath: "/static/bottom/user.png",
    selectedIconPath: "/static/bottom/user.png"
  }
];

const updateCurrentPage = () => {
  const pages = getCurrentPages();
  if (pages.length) {
    currentPage.value = pages[pages.length - 1].route;
  }
};

const switchTab = (item) => {
  if (currentPage.value === item.pagePath) return;
  
  uni.switchTab({
    url: `/${item.pagePath}`
  });
};

onMounted(() => {
  updateCurrentPage();
  uni.$on('routeChange', updateCurrentPage);
});
</script>

<style scoped>
.admin-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 100rpx;
  background: white;
  border-top: 1rpx solid #f0f0f0;
  padding: 10rpx 0;
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.tab-icon {
  width: 44rpx;
  height: 44rpx;
  margin-bottom: 6rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #ff6b6b;
  font-weight: bold;
}
</style>