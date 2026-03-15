<template>
  <view class="container">
        <!-- 顶部搜索区域 -->
        <view class="header">
          <view class="search-container">
            <image src="/static/index/search-icon.png" class="search-icon-img" />
            <input 
              class="search-input" 
              placeholder="搜索护理服务" 
              placeholder-class="placeholder-style"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
              :class="{'focused': inputFocused}"
            />
            <button class="search-btn" @click="handleSearch" :class="{'active': inputFocused}">搜索</button>
          </view>
        </view>

    <!-- 护理服务分类 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">护理服务分类</text>
      </view>
      <view class="categories-grid">
        <view 
          v-for="(category, index) in categories" 
          :key="index" 
          class="category-item"
          @click="handleCategoryClick(category.id)"
          :style="{animationDelay: `${index * 0.05}s`}"
        >
          <view class="category-icon">
            <image :src="category.icon" class="icon-img" />
          </view>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>

   <!-- 推荐护理服务 -->
     <view class="section">
       <view class="section-header">
         <text class="section-title">推荐护理服务</text>
       </view>
       
       <view class="service-list">
         <view 
           v-for="service in services" 
           :key="service.id" 
           class="service-card"
           @click="navigateToDetail(service.id)"
         >
           <image :src="service.image" class="service-image" mode="aspectFill"></image>
           <view class="service-content">
             <view class="service-header">
               <text class="service-name">{{ service.name }}</text>
               <text class="service-price">¥{{ service.price }}</text>
             </view>
             <text class="service-desc">{{ service.description }}</text>
             <view class="service-footer">
               <button class="appointment-btn" @click.stop="handleBook(service.id)">
                 立即预约
                 <view class="arrow-icon">→</view>
               </button>
             </view>
           </view>
         </view>
       </view>
     </view>

    <!-- 健康资讯 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">健康资讯</text>
      </view>
      <view class="news-list">
        <view 
          class="news-card" 
          v-for="(item, index) in healthNews" 
          :key="index"
          @click="openNewsDetail(item)"
        >
          <view class="news-header">
            <image :src="item.icon" class="news-icon"></image>
            <text class="news-title">{{ item.title }}</text>
          </view>
          <text class="news-desc">{{ item.description }}</text>
          <view class="news-footer">
            <text class="news-date">{{ item.date }}</text>
            <text class="news-read">阅读全文 →</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 健康小贴士 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">健康小贴士</text>
      </view>
      
      <view class="tips-container">
        <view class="tip-card" v-for="(tip, index) in healthTips" :key="index">
          <view class="tip-header">
            <image :src="tip.icon" class="tip-icon"></image>
            <text class="tip-title">{{ tip.title }}</text>
          </view>
          <text class="tip-content">{{ tip.content }}</text>
        </view>
      </view>
    </view>

    <!-- 常见问题 -->
        <view class="section">
          <view class="section-header">
            <text class="section-title">常见问题</text>
          </view>
          
          <view class="faq-list">
            <view 
              class="faq-item" 
              v-for="(faq, index) in faqs" 
              :key="index"
              @click="toggleFaq(index)"
            >
              <view class="faq-question">
                <text>{{ faq.question }}</text>
                <image 
                  :src="faq.expanded ? '/static/general/up-icon.png' : '/static/general/down-icon.png'" 
                  class="faq-arrow-img"
                />
              </view>
              <view class="faq-answer" v-if="faq.expanded">
                <text>{{ faq.answer }}</text>
              </view>
            </view>
          </view>
        </view>


<!-- 资讯详情弹窗 -->
    <view class="news-modal" v-if="showNewsModal" @click="closeNewsModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentNews.title }}</text>
          <image
            src="/static/index/close-icon.png" 
            class="close-icon-img" 
            @click="closeNewsModal" 
          />
        </view>
        <scroll-view class="modal-body" scroll-y>
          <image :src="currentNews.image" class="news-detail-image" mode="widthFix"></image>
          <text class="news-detail-date">发布日期：{{ currentNews.date }}</text>
          <text class="news-detail-content">{{ currentNews.content }}</text>
          <view class="news-tags">
            <text class="tag" v-for="(tag, index) in currentNews.tags" :key="index">{{ tag }}</text>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="close-btn" @click="closeNewsModal">关闭</button>
        </view>
      </view>
    </view>

    <!-- 浮动按钮 -->
        <view class="floating-button" @click="scrollToTop" v-if="showScrollTop">
          <image src="/static/general/up-icon.png" class="floating-icon" />
        </view>
		<user-tabbar />
      </view>
</template>

<script setup>
	
import { ref, onMounted } from 'vue'
import { onLoad, onPageScroll } from '@dcloudio/uni-app'
import { getRecommendedServices } from '@/api/service'
import { checkLogin } from '@/api/user'
import { useTokenStore } from '@/stores/token'
import UserTabbar from '@/tabbar/user-tabbar.vue';


const tokenStore = useTokenStore()
const inputFocused = ref(false)
const showScrollTop = ref(false)
const showNewsModal = ref(false)
const currentNews = ref(null)

// 滚动事件处理
onPageScroll((e) => {
  showScrollTop.value = e.scrollTop > 300
})

// 滚动到顶部
const scrollToTop = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300
  })
}

// 输入框焦点事件
const handleInputFocus = () => {
  inputFocused.value = true
}

const handleInputBlur = () => {
  inputFocused.value = false
}

// 护理服务分类数据
const categories = ref([
  { id: 1, name: '生活护理', icon: '/static/index/1.png' },
  { id: 2, name: '健康监测', icon: '/static/index/2.png' },
  { id: 3, name: '康复训练', icon: '/static/index/3.png' },
  { id: 4, name: '专业护理', icon: '/static/index/4.png' },
  { id: 5, name: '健康咨询', icon: '/static/index/5.png' },
  { id: 6, name: '特殊护理', icon: '/static/index/6.png' },
  { id: 7, name: '应急医疗', icon: '/static/index/7.png' },
  { id: 8, name: '智能设备', icon: '/static/index/8.png' }
])

// 护理服务数据
const services = ref([])
// 用户状态
const user = ref(null)

// 健康资讯数据（添加完整内容）
const healthNews = ref([
  {
    title: "老年人日常护理注意事项",
    description: "了解如何为老人提供最贴心的日常护理服务，包括饮食、起居、卫生等方面...",
    date: "2025-6-30",
    icon: "/static/index/info-icon.png",
    image: "/static/index/info-pic1.jpg",
    content: `随着社会老龄化进程的加快，老年人护理已成为家庭和社会关注的重点。良好的日常护理不仅能提高老人的生活质量，还能预防疾病的发生。

一、饮食护理
1. 营养均衡：确保老人摄入足够的蛋白质、维生素和矿物质，多吃新鲜蔬菜水果
2. 易消化食物：选择易消化的食物，避免油腻、辛辣和生冷食物
3. 少食多餐：每天可分5-6餐，每餐量不宜过多
4. 充足水分：每天保证1500-2000ml的水分摄入

二、个人卫生
1. 定期洗澡：每周2-3次温水澡，注意保暖避免着凉
2. 口腔清洁：早晚刷牙，饭后漱口
3. 皮肤护理：保持皮肤清洁干燥，特别是皱褶部位
4. 指甲修剪：定期修剪指甲，避免抓伤皮肤

三、安全防护
1. 防跌倒：保持地面干燥，清除障碍物，安装扶手
2. 防烫伤：洗澡水温控制在38-40℃，避免使用过热物品
3. 用药安全：按时按量服药，避免错服漏服

四、心理关怀
1. 陪伴交流：多与老人交流，倾听他们的心声
2. 尊重选择：尊重老人的生活习惯和个人选择
3. 鼓励参与：鼓励老人参与家庭活动和社会交往

通过以上护理措施，我们可以为老人创造一个安全、舒适的生活环境，提高他们的生活质量。`,
    tags: ["老年护理", "日常护理", "健康管理"]
  },
  {
    title: "术后康复训练指南",
    description: "专业的术后康复训练方法，帮助患者更快恢复身体功能...",
    date: "2025-7-1",
    icon: "/static/index/info-icon.png",
    image: "/static/index/info-pic2.jpg",
    content: `术后康复训练是手术成功的重要环节，合理的康复计划能帮助患者更快恢复身体功能，减少并发症的发生。

一、康复训练原则
1. 循序渐进：从简单动作开始，逐渐增加难度和强度
2. 个体化方案：根据手术类型和患者身体状况制定专属方案
3. 定期评估：每周评估康复进度，及时调整计划
4. 安全第一：避免过度训练造成二次损伤

二、常见手术康复方案
1. 关节置换术后
   - 早期：关节活动度训练，防止僵硬
   - 中期：肌力训练，增强关节稳定性
   - 后期：功能训练，恢复日常生活能力

2. 心脏手术后
   - 第一阶段：床上呼吸训练和肢体活动
   - 第二阶段：床边坐起和站立训练
   - 第三阶段：步行训练，逐渐增加距离
   - 第四阶段：有氧运动，改善心肺功能

3. 脊柱手术后
   - 核心肌群训练：增强脊柱稳定性
   - 姿势矫正训练：保持正确体位
   - 神经功能训练：促进神经恢复

三、康复注意事项
1. 疼痛管理：合理使用止痛药物，避免因疼痛影响康复
2. 营养支持：高蛋白饮食促进伤口愈合
3. 心理支持：帮助患者建立康复信心
4. 家属参与：指导家属协助康复训练

四、康复效果评估
1. 功能评估：关节活动度、肌力、平衡能力
2. 疼痛评估：使用视觉模拟评分法
3. 生活质量评估：日常生活能力问卷

专业的康复训练团队会根据患者的具体情况制定个性化的康复方案，帮助患者尽快恢复健康。`,
    tags: ["术后康复", "康复训练", "健康管理"]
  },
  {
    title: "冬季老年人健康防护",
    description: "冬季来临，老年人如何做好健康防护，预防常见疾病...",
    date: "2025-7-4",
    icon: "/static/index/info-icon.png",
    image: "/static/index/info-pic3.jpg",
    content: `冬季是老年人健康问题高发季节，低温、干燥和室内外温差大等因素容易诱发多种疾病。做好冬季健康防护对老年人至关重要。

一、常见冬季健康问题
1. 呼吸系统疾病：感冒、流感、慢性支气管炎急性发作
2. 心脑血管疾病：心绞痛、心肌梗死、脑卒中
3. 骨关节疾病：关节炎加重、骨折风险增加
4. 皮肤问题：皮肤干燥、瘙痒、冻伤

二、健康防护措施
1. 保暖防寒
   - 室内温度保持在18-22℃，湿度50%-60%
   - 外出穿戴保暖衣物，特别注意头部、颈部和四肢保暖
   - 使用暖手宝、电热毯等取暖设备时注意安全

2. 合理饮食
   - 增加热量摄入：适量增加高热量食物
   - 补充维生素：多吃新鲜蔬菜水果，增强免疫力
   - 充足水分：每天饮水1500ml以上，预防血液黏稠

3. 适当运动
   - 选择室内运动：太极拳、瑜伽、室内步行
   - 避免晨练：等太阳出来、气温回升后再外出活动
   - 运动前热身：充分活动关节，避免运动损伤

4. 疾病预防
   - 接种疫苗：及时接种流感疫苗和肺炎疫苗
   - 定期监测：高血压、糖尿病患者定期监测指标
   - 按时服药：慢性病患者切勿自行停药或减量

5. 心理健康
   - 保持社交：与家人朋友保持联系
   - 培养爱好：阅读、书法、园艺等有益活动
   - 适度光照：每天接受30分钟自然光照，预防冬季抑郁

三、紧急情况处理
1. 心脑血管意外征兆：突发头痛、眩晕、言语不清、肢体麻木等
2. 跌倒处理：不要急于扶起，先评估伤情
3. 低温症处理：逐渐复温，避免快速加温

冬季老年人健康防护需要家庭和社会的共同关注。通过科学的防护措施，老年人可以安全舒适地度过寒冬。`,
    tags: ["冬季防护", "老年健康", "季节护理"]
  }
])

// 健康小贴士
const healthTips = ref([
  {
    title: "饮食建议",
    content: "每日摄入足够蛋白质和维生素，多吃蔬菜水果，少油少盐",
    icon: "/static/index/tips-icon.png"
  },
  {
    title: "运动建议",
    content: "每天适度运动30分钟，如散步、太极拳等，增强体质",
    icon: "/static/index/tips-icon.png"
  },
  {
    title: "心理健康",
    content: "保持良好心态，多与家人朋友交流，参加社交活动",
    icon: "/static/index/tips-icon.png"
  }
])

// 常见问题
const faqs = ref([
  {
    question: "如何预约护理服务？",
    answer: "您可以在服务详情页面点击'立即预约'按钮，选择服务时间和时长，填写相关信息后提交预约申请。",
    expanded: false
  },
  {
    question: "护理服务如何收费？",
    answer: "我们根据服务类型进行收费，具体价格可在服务详情页面查看。",
    expanded: false
  },
  {
    question: "如何投诉护理服务？",
    answer: "在‘我的’->‘我的预约’中可对已完成服务进行评价和投诉。",
    expanded: false
  }
])

// 加载推荐服务
const loadRecommendedServices = async () => {
  try {
    const res = await getRecommendedServices()
    services.value = res.map((service, index) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      appointments: service.appointments,
      description: service.description,
      // 使用静态图片路径（根据索引选择6张图片）
      image: `/static/service/default${(index % 6) + 1}.jpg`
    }))
  } catch (error) {
    console.error('加载推荐服务失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onLoad(async () => {
	// 调试日志：显示当前用户信息
	console.log('首页用户信息:', tokenStore.user)
	
	// 如果已登录，显示用户信息
	if (tokenStore.isLoggedIn) {
	  console.log('当前登录用户:', tokenStore.user.nickname)
	  uni.showToast({ 
	    title: `欢迎回来，${tokenStore.user.nickname}`, 
	    icon: 'none',
	    duration: 2000
	  })
	}
  // 加载推荐服务
  loadRecommendedServices()
})

// 处理分类点击
const handleCategoryClick = (id) => {
  uni.vibrateShort();
  uni.navigateTo({
    url: `/pages/category/category?id=${id}`
  })
}

// 预约服务
const handleBook = (id) => {
  uni.vibrateShort();
  uni.showToast({
    title: '预约服务',
    icon: 'none'
  })
  uni.navigateTo({
    url: `/pages/payments/checkout?id=${id}`
  })
}

// 跳转到详情页
const navigateToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/service/detail?id=${id}`
  })
}

// 处理搜索
const handleSearch = () => {
  uni.vibrateShort();
  uni.showToast({
    title: '搜索功能',
    icon: 'none'
  })
  uni.navigateTo({
    url: '/pages/category/category'
  })
}

// 展开/收起FAQ
const toggleFaq = (index) => {
  faqs.value[index].expanded = !faqs.value[index].expanded
}

// 打开资讯详情
const openNewsDetail = (news) => {
  currentNews.value = news
  showNewsModal.value = true
}

// 关闭资讯详情
const closeNewsModal = () => {
  showNewsModal.value = false
}

</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f8f9fb 0%, #e8f5e9 100%);
  min-height: 100vh;
  padding-bottom: 80rpx;
  position: relative;
}

/* 顶部搜索区域 */
.header {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  padding: 30rpx 30rpx 60rpx;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 175, 80, 0.3);
  
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

.search-container {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 50rpx;
  padding: 10rpx 20rpx 10rpx 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  border: 2rpx solid #a5d6a7; 
  transition: all 0.3s ease;
  
  &.focused {
    box-shadow: 0 8rpx 25rpx rgba(46, 125, 50, 0.3);
    transform: translateY(-5rpx);
  }
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  padding-left: 20rpx;
  transition: all 0.3s ease;
  
  &.focused {
    transform: scale(1.02);
  }
}

.placeholder-style {
  color: #b0b0b0;
  font-size: 28rpx;
}

/* 搜索按钮样式 */
.search-btn {
  background: #2E7D32; 
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 10rpx 30rpx;
  font-size: 28rpx;
  height: 70rpx;
  line-height: 70rpx;
  margin-left: 10rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.05);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active::after {
    opacity: 1;
  }
  
  &.active {
    background: #1B5E20; /* 更深的绿色 */
    box-shadow: 0 4rpx 15rpx rgba(46, 125, 50, 0.4);
  }
}

/* 新增图标样式 */
.search-icon-img {
  width: 40rpx;
  height: 40rpx;
}

.faq-arrow-img {
  width: 36rpx;
  height: 36rpx;
}

.close-icon-img {
  width: 48rpx;
  height: 48rpx;
}
/* 通用区域样式 */
.section {
  background-color: #fff;
  border-radius: 24rpx;
  margin: 30rpx;
  padding: 30rpx;
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e8f5e9;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
  
  &:active {
    transform: scale(0.99);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  position: relative;
  padding-left: 20rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 32rpx;
    background: linear-gradient(to bottom, #4CAF50, #2E7D32);
    border-radius: 4rpx;
    transition: height 0.3s ease;
  }
  
  &:hover::before {
    height: 40rpx;
  }
}

/* 分类网格 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(30rpx);
  animation: fadeInUp 0.5s ease forwards;
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

.category-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f5e9, #d0ebd2);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
  box-shadow: 0 5rpx 15rpx rgba(76, 175, 80, 0.2);
  
  &:active {
    transform: scale(0.9);
    box-shadow: 0 3rpx 8rpx rgba(76, 175, 80, 0.3);
  }
}

.icon-img {
  width: 50rpx;
  height: 50rpx;
  transition: transform 0.3s ease;
}

.category-name {
  font-size: 26rpx;
  color: #555;
  transition: color 0.3s ease;
}

.category-item:active .category-name {
  color: #2E7D32;
  font-weight: bold;
}

/* 服务列表 */
.service-list {
  margin-top: 20rpx;
}

.service-card {
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  background-color: #fff;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(-5rpx);
    box-shadow: 0 12rpx 30rpx rgba(76, 175, 80, 0.2);
  }
}

.service-image {
  width: 100%;
  height: 300rpx;
  transition: transform 0.5s ease;
}

.service-card:active .service-image {
  transform: scale(1.03);
}

.service-content {
  padding: 30rpx;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.service-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #2E7D32;
}

.service-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 30rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.appointment-count {
  font-size: 24rpx;
  color: #999;
  flex: 1;
}

.appointment-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 40rpx;
  padding: 12rpx 35rpx;
  font-size: 26rpx;
  border: none;
  box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.2);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active::after {
    opacity: 1;
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.4);
  }
}

.arrow-icon {
  margin-left: 10rpx;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.appointment-btn:active .arrow-icon {
  transform: translateX(10rpx);
}

/* 健康资讯 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.news-card {
  background: #f8fcf9;
  border-radius: 16rpx;
  padding: 25rpx;
  border: 1rpx solid #e8f5e9;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(-3rpx);
    box-shadow: 0 5rpx 15rpx rgba(76, 175, 80, 0.1);
  }
}

.news-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.news-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 15rpx;
}

.news-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #2E7D32;
}

.news-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-date {
  font-size: 24rpx;
  color: #999;
}

.news-read {
  font-size: 24rpx;
  color: #4CAF50;
  font-weight: bold;
}

/* 健康小贴士 */
.tips-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.tip-card {
  background: #f8fcf9;
  border-radius: 16rpx;
  padding: 25rpx;
  border: 1rpx solid #e8f5e9;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(-3rpx);
    box-shadow: 0 5rpx 15rpx rgba(76, 175, 80, 0.1);
  }
}

.tip-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.tip-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
}

.tip-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2E7D32;
}

.tip-content {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

/* 常见问题 */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.faq-item {
  background: #f8fcf9;
  border-radius: 16rpx;
  padding: 25rpx;
  border: 1rpx solid #e8f5e9;
  transition: all 0.3s ease;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.faq-answer {
  margin-top: 15rpx;
  padding-top: 15rpx;
  border-top: 1rpx dashed #e0e7e0;
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 资讯详情弹窗 */
.news-modal {
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

.modal-content {
  background: white;
  border-radius: 24rpx;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #f8fcf9;
  border-bottom: 1rpx solid #e8f5e9;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #2E7D32;
  flex: 1;
  padding-right: 20rpx;
}

.modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.news-detail-image {
  width: 100%;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.news-detail-date {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.news-detail-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
}

.news-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-top: 30rpx;
}

.tag {
  background: #e8f5e9;
  color: #2E7D32;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.modal-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e8f5e9;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: #2E7D32;
  color: white;
  border-radius: 40rpx;
  padding: 12rpx 40rpx;
  font-size: 28rpx;
  border: none;
}

/* 浮动按钮 */
.floating-button {
   position: fixed;
   bottom: 180rpx;
   right: 40rpx;
   width: 90rpx; 
   height: 90rpx;
   background: linear-gradient(135deg, #4CAF50, #2E7D32);
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   box-shadow: 0 6rpx 20rpx rgba(46, 125, 50, 0.5);
   z-index: 100;
   transition: all 0.3s ease;
   border: 2rpx solid #fff;
   
   &:active {
     transform: scale(0.9);
     box-shadow: 0 3rpx 10rpx rgba(46, 125, 50, 0.5);
   }
 }
 
 .floating-icon {
   width: 46rpx;
   height: 46rpx;
   filter: drop-shadow(0 0 2rpx rgba(0,0,0,0.1));
 }
 
/* 响应式调整 */
@media (max-width: 750px) {
  .tips-container {
    grid-template-columns: 1fr;
  }
  .scroll-top-btn {
    width: 80rpx;
    height: 80rpx;
    bottom: 160rpx;
    right: 30rpx;
  }
  
  .scroll-top-icon {
    width: 40rpx;
    height: 40rpx;
  }
}
</style>