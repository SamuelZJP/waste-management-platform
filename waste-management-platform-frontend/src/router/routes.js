import MainLayout from '@/layouts/MainLayout.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';

export default [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/HomePage.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'waste/search',
        name: 'WasteSearch',
        component: () => import('@/views/waste/SearchPage.vue'),
        meta: { title: '垃圾分类查询' }
      },
      {
        path: 'waste/recognize',
        name: 'WasteRecognize',
        component: () => import('@/views/waste/RecognizePage.vue'),
        meta: { title: '垃圾识别' }
      },
    //   {
    //     path: 'waste/detail/:id',
    //     name: 'WasteDetail',
    //     component: () => import('@/views/waste/DetailPage.vue'),
    //     meta: { title: '垃圾详情' }
    //   },
      {
        path: 'recycle/map',
        name: 'RecycleMap',
        component: () => import('@/views/recycle/MapPage.vue'),
        meta: { title: '回收站地图' }
      },
      {
        path: 'recycle/detail/:id',
        name: 'RecycleDetail',
        component: () => import('@/views/recycle/DetailPage.vue'),
        meta: { title: '回收站详情' }
      },
      {
        path: 'user/profile',
        name: 'UserProfile',
        component: () => import('@/views/user/ProfilePage.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'notification/list',
        name: 'NotificationList',
        component: () => import('@/views/notification/NotificationListPage.vue'),
        meta: { title: '通知列表' }
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/feedback/FeedbackPage.vue'),
        meta: { title: '问题反馈' }
      }
    ]
  },
  {
    path: '/user',
    component: BlankLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/user/LoginPage.vue'),
        meta: { title: '登录' }
      },
    //   {
    //     path: 'register',
    //     name: 'Register',
    //     component: () => import('@/views/user/RegisterPage.vue'),
    //     meta: { title: '注册' }
    //   }
    ]
  },
  // 管理员未登录路由
  {
    path: '/admin',
    component: BlankLayout,
    children: [
      {
        path: 'login',
        name: 'AdminLogin',
        component: () => import('@/views/admin/LoginPage.vue'),
        meta: { title: '管理员登录' }
      },
      {
        path: 'register',
        name: 'AdminRegister',
        component: () => import('@/views/admin/RegisterPage.vue'),
        meta: { title: '管理员注册' }
      }
    ]
  },
  // 管理员已登录路由
  {
    path: '/admin',
    component: AdminLayout,
    // meta: { requiresAdminAuth: true }, // 未来添加权限验证
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardPage.vue'),
        meta: { title: '控制台' }
      },
      // 回收站管理
      // {
      //   path: 'stations/list',
      //   name: 'StationsList',
      //   component: () => import('@/views/admin/stations/ListPage.vue'),
      //   meta: { title: '回收站列表' }
      // },
      // {
      //   path: 'stations/devices',
      //   name: 'DevicesList',
      //   component: () => import('@/views/admin/stations/DevicesPage.vue'),
      //   meta: { title: '设备管理' }
      // },
      // 用户管理
      // {
      //   path: 'users/list',
      //   name: 'UsersList',
      //   component: () => import('@/views/admin/users/ListPage.vue'),
      //   meta: { title: '用户列表' }
      // },
      // {
      //   path: 'admins/list',
      //   name: 'AdminsList',
      //   component: () => import('@/views/admin/users/AdminsPage.vue'),
      //   meta: { title: '管理员列表' }
      // },
      // 反馈管理
      // {
      //   path: 'feedbacks',
      //   name: 'AdminFeedbacks',
      //   component: () => import('@/views/admin/feedbacks/ListPage.vue'),
      //   meta: { title: '反馈处理' }
      // },
      // 数据统计
      // {
      //   path: 'data',
      //   name: 'DataAnalysis',
      //   component: () => import('@/views/admin/data/AnalysisPage.vue'),
      //   meta: { title: '数据统计' }
      // },
      // 系统设置
      // {
      //   path: 'settings',
      //   name: 'SystemSettings',
      //   component: () => import('@/views/admin/settings/SettingsPage.vue'),
      //   meta: { title: '系统设置' }
      // },
      // 个人资料
      // {
      //   path: 'profile',
      //   name: 'AdminProfile',
      //   component: () => import('@/views/admin/settings/ProfilePage.vue'),
      //   meta: { title: '个人资料' }
      // },
      // 通知管理
      // {
      //   path: 'notifications',
      //   name: 'AdminNotifications',
      //   component: () => import('@/views/admin/notifications/ListPage.vue'),
      //   meta: { title: '通知消息' }
      // },
      // {
      //   path: 'notifications/:id',
      //   name: 'AdminNotificationDetail',
      //   component: () => import('@/views/admin/notifications/DetailPage.vue'),
      //   meta: { title: '通知详情' }
      // }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: '页面不存在' }
  }
]; 