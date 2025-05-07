# 智能垃圾管理平台 - 前端

智能垃圾管理平台是一个面向小区、公园等局部区域的垃圾分类和管理系统，旨在提高垃圾分类效率，优化垃圾回收流程，实现智能化管理。

## 项目目录结构

```
waste-management-platform-frontend/
├── public/                     # 静态资源目录
├── src/
│   ├── assets/                 # 资源文件(图片、字体等)
│   │   ├── icons/              # 图标文件
│   │   ├── images/             # 图片资源
│   │   └── styles/             # 全局样式
│   ├── components/             # 通用组件
│   │   ├── common/             # 基础公共组件
│   │   ├── layout/             # 布局组件
│   │   └── waste/              # 垃圾分类相关组件
│   ├── layouts/                # 布局模板
│   │   ├── MainLayout.vue      # 主布局(有导航栏和底部栏)
│   │   └── BlankLayout.vue     # 空白布局(登录注册等)
│   ├── mock/                   # 模拟数据
│   │   ├── user.js             # 用户相关模拟数据
│   │   ├── waste.js            # 垃圾分类相关模拟数据
│   │   ├── recycle.js          # 回收点相关模拟数据
│   │   └── notification.js     # 通知相关模拟数据
│   ├── router/                 # 路由配置
│   │   ├── index.js            # 路由主文件
│   │   └── routes.js           # 路由定义
│   ├── services/               # API服务
│   │   ├── api.js              # API基础配置
│   │   ├── userService.js      # 用户相关API
│   │   ├── wasteService.js     # 垃圾分类相关API
│   │   ├── recycleService.js   # 回收点相关API
│   │   └── notificationService.js # 通知相关API
│   ├── stores/                 # Pinia状态管理
│   │   ├── index.js            # Store入口
│   │   ├── userStore.js        # 用户状态
│   │   ├── wasteStore.js       # 垃圾分类状态
│   │   └── notificationStore.js # 通知状态
│   ├── utils/                  # 工具函数
│   │   ├── request.js          # 请求工具
│   │   ├── storage.js          # 本地存储工具
│   │   └── validator.js        # 表单验证工具
│   ├── views/                  # 页面组件
│   │   ├── home/               # 首页相关
│   │   ├── user/               # 用户相关(登录、注册、个人信息)
│   │   ├── waste/              # 垃圾分类相关(查询、识别)
│   │   ├── recycle/            # 回收点相关(地图、详情)
│   │   └── notification/       # 通知相关
│   ├── App.vue                 # 应用入口组件
│   └── main.js                 # 应用入口JS
├── index.html                  # HTML入口
├── vite.config.js              # Vite配置
├── package.json                # 项目依赖管理
└── README.md                   # 项目说明文档
```

## 安装和使用

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 技术栈

- Vue 3 - 渐进式JavaScript框架
- Vue Router - 路由管理
- Pinia - 状态管理
- Element Plus - UI组件库
- Axios - HTTP请求库

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
