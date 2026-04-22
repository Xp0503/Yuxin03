
# [愈心移动护理平台(患者端/医生端)]

## 📖 项目简介
本项目是一个基于 **Uni-app** 和 **Vue 3** 开发的跨平台应用（支持微信小程序、H5、App 等）。系统采用**双角色驱动**（普通用户端 + 医生/服务端），旨在提供便捷的在线医疗/服务预约、在线问诊沟通、评价投诉以及基于 **AI 大模型** 的智能客服体验。

## 🚀 技术栈
- **前端框架**: Uni-app (Vue 3)
- **UI 组件库**: Uni-UI (`@dcloudio/uni-ui`)
- **网络请求**: Axios (二次封装，支持请求拦截与 Token 无感传递)
- **状态/权限管理**: `stores/token.js` (集中式 Token 管理)
- **时间处理**: Day.js
- **AI 能力集成**: 集成字节跳动**豆包大模型 API** (`utils/doubaoApi.js`)

## ✨ 核心功能模块

### 👤 用户端 (User)
- **注册与登录**: 支持账号密码登录、短信验证码登录 (`sms-login`) 及忘记密码重置。
- **服务与预约**:
  - 浏览服务分类 (`/pages/category`) 及服务详情 (`/pages/service/detail`)。
  - 在线预约、选择服务时间及支付结算 (`/pages/payments/checkout`)。
- **消息中心**:
  - 与医生进行一对一消息沟通。
  - 内置 AI 智能问答助手，提供初步的医疗/服务咨询。
- **个人中心**: 管理服务地址、查看预约记录、提交投诉反馈及服务评价。

### 👨‍⚕️ 医生/服务端 (Doctor/Admin)
- **独立工作台**: 拥有专属的登录入口与底部导航栏 (`admin-tabbar.vue`)。
- **业务处理**: 
  - 实时接收并处理用户的预约订单 (`appointment.vue`)。
  - 查看和回复用户的投诉 (`complaint.vue`) 与评价 (`comment.vue`)。
- **医患沟通**: 独立的医生端消息列表，便捷跟进患者病情或服务需求。

## 📂 目录结构说明

```text
├── api/                  # 后端 API 接口统一管理 (医生、预约、评价、消息等)
├── pages/                # 业务页面
│   ├── auth/             # 用户端：登录、注册、找回密码
│   ├── category/         # 分类页面
│   ├── doctor/           # 医生端：专属页面 (包含医生端认证、首页工作台、消息、个人中心)
│   ├── index/            # 用户端首页
│   ├── msg/              # 消息通讯模块 (列表、详情)
│   ├── payments/         # 支付结算模块
│   ├── service/          # 服务/项目详情
│   └── user/             # 用户中心 (地址、预约记录、投诉明细等)
├── static/               # 静态资源 (图标、占位图、测试图等)
├── stores/               # 全局状态管理 (Token 存储等)
├── tabbar/               # 自定义底部导航栏 (拆分 user-tabbar 和 admin-tabbar)
├── utils/                # 工具函数
│   ├── request.js        # Axios 二次封装 (处理 baseUrl、请求拦截、错误统一提示)
│   ├── storage.js        # 本地缓存持久化封装
│   └── doubaoApi.js      # 豆包 AI 接口对接逻辑
├── App.vue               # 应用入口文件
├── main.js               # Vue 实例挂载及全局配置
├── manifest.json         # 应用配置 (AppID、权限、打包配置)
├── pages.json            # 路由与全局外观配置
└── uni.scss              # 全局样式变量及主题配置
```

## 🛠️ 快速上手

1. **环境准备**
   推荐使用 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 作为主力开发工具，或使用 VS Code 配合相关插件。同时需安装 Node.js 环境。

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **运行项目**
   - **HBuilderX**: 将项目拖入 HBuilderX，点击菜单栏 `运行 -> 运行到内置浏览器` 或 `运行到微信开发者工具`。
   - **CLI 方式** (需全局安装 Vue CLI)：
     ```bash
     npm run dev:h5      # 运行 H5 端
     npm run dev:mp-weixin # 运行微信小程序端
     ```

4. **配置说明**
   - **API 域名配置**: 请在 `utils/request.js` 中修改实际的后端 API 基础路径 (`baseURL`)。
   - **AI 模型配置**: 若需使用 AI 功能，请在 `utils/doubaoApi.js` 中填入你申请的真实 API Key。

## 📝 规范与注意事项
- 项目中使用了 `uni-ui`，如果新增组件请优先使用官方生态组件以保持 UI 风格一致。
- 底部 TabBar 采用了动态角色渲染方案（根据用户或医生身份挂载不同的组件），二次开发时需注意路由跳转逻辑。

