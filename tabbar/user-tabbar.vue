<template>
  <view class="user-tabbar">
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
import { ref, onMounted, onUnmounted } from 'vue';

const currentPage = ref('');

const tabList = [
  {
    pagePath: "pages/index/index",
    text: "首页",
    iconPath: "/static/bottom/index.png",
    selectedIconPath: "/static/bottom/index.png" // 添加激活图标
  },
  {
    pagePath: "pages/msg/list",
    text: "消息",
    iconPath: "/static/bottom/message.png",
    selectedIconPath: "/static/bottom/message.png" // 添加激活图标
  },
  {
    pagePath: "pages/user/center",
    text: "我的",
    iconPath: "/static/bottom/user.png",
    selectedIconPath: "/static/bottom/user.png"
  }
];

const updateCurrentPage = () => {
  const pages = getCurrentPages();
  if (pages.length) {
    // 确保路径格式一致
    const route = pages[pages.length - 1].route;
    currentPage.value = route.startsWith('/') ? route.substring(1) : route;
    console.log('当前路由:', currentPage.value); // 调试用
  }
};

const switchTab = (item) => {
  if (currentPage.value === item.pagePath) return;
  
  console.log('跳转到:', item.pagePath);
  
  uni.switchTab({
    url: `/${item.pagePath}`,
    fail: (err) => {
      console.error('跳转失败:', err);
    }
  });
};

onMounted(() => {
  updateCurrentPage();
  uni.$on('routeChange', updateCurrentPage);
  
  // 添加手动触发更新
  setTimeout(updateCurrentPage, 300);
});

onUnmounted(() => {
  uni.$off('routeChange', updateCurrentPage);
});
</script>


<style scoped>
.user-tabbar {
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
  color: #4a8cff;
  font-weight: bold;
}
</style>